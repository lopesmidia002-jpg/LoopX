import { SYSTEM_DOCUMENTARY_WRITER_PROMPT, SYSTEM_TOP10_WRITER_PROMPT } from "./prompts";
import { ResearchResult } from "./researcher";
import { SceneItem, VideoFormat, Language, MotionEffect, VisualStyle } from "../types";
import { getCuratedMediaForScene } from "../pipeline/media-curator";

export interface ScriptGenerationResult {
  title: string;
  youtubeDescription: string;
  scenes: SceneItem[];
  totalWords: number;
  totalDurationSeconds: number;
  format: VideoFormat;
  language: Language;
}

const MOTION_EFFECTS_SEQUENCE: MotionEffect[] = [
  "KEN_BURNS_ZOOM_IN",
  "PARALLAX_25D",
  "KEN_BURNS_PAN_RIGHT",
  "KEN_BURNS_ZOOM_OUT",
  "KEN_BURNS_PAN_LEFT",
  "PARALLAX_25D",
];

export async function generateCinematicScript(params: {
  topic: string;
  format: VideoFormat;
  language: Language;
  targetDurationMinutes: number;
  researchData: ResearchResult;
  customScript?: string;
  visualStyle?: VisualStyle;
}): Promise<ScriptGenerationResult> {
  const { topic, format, language, targetDurationMinutes, researchData, customScript, visualStyle = "STOCK_4K" } = params;

  // Se o usuário já forneceu um roteiro bruto, faz a segmentação estruturada
  if (customScript && customScript.trim().length > 50) {
    return await processCustomScriptToScenes(topic, customScript, format, language, visualStyle);
  }

  const targetMins = Math.max(3, Number(targetDurationMinutes) || 10);
  const targetTotalSeconds = targetMins * 60;
  // Ritmo dark documental: cada cena tem em média 35 a 45 segundos de narração imersiva
  const targetSceneCount = Math.max(8, Math.round(targetTotalSeconds / 42));

  // 1. Tenta Google Gemini (Google AI Studio) - Modelo ativo e de alta velocidade
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (geminiKey) {
    try {
      const systemPrompt =
        format === "DOCUMENTARY"
          ? SYSTEM_DOCUMENTARY_WRITER_PROMPT
          : SYSTEM_TOP10_WRITER_PROMPT;

      const promptText = `${systemPrompt}

Você DEVE escrever um roteiro cinematográfico Dark YouTube completo em idioma ${language} sobre o tema: "${topic}".
DURAÇÃO ALVO OBRIGATÓRIA: EXATAMENTE ${targetMins} minutos (${targetTotalSeconds} segundos no total).
QUANTIDADE DE CENAS OBRIGATÓRIA: Para preencher com fidelidade os ${targetMins} minutos de vídeo, você DEVE gerar entre ${targetSceneCount - 1} e ${targetSceneCount + 2} cenas sequenciais detalhadas no array "scenes" (mínimo de ${targetSceneCount} cenas).
Cada cena deve conter um parágrafo narrativo longo e detalhado de suspense (entre 45 e 75 palavras) e estimatedSeconds entre 35 e 48 segundos.

Pesquisa factual de apoio:
${JSON.stringify(researchData)}

Retorne estritamente um JSON no formato:
{
  "title": "Título ultra-retentivo para o YouTube",
  "youtubeDescription": "Descrição com hashtags e capítulos",
  "scenes": [
    {
      "sceneOrder": 1,
      "narrationText": "Texto completo da narração desta cena com alta tensão...",
      "keywords": ["termo em ingles 1", "termo em ingles 2"],
      "estimatedSeconds": 40
    }
  ]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.72,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          const rawScenes = parsed.scenes || [];
          if (rawScenes.length > 0) {
            // Normaliza a duração das cenas para atingir fielmente o targetTotalSeconds
            const rawDurationSum = rawScenes.reduce(
              (acc: number, sc: any) => acc + (Number(sc.estimatedSeconds) || 38),
              0
            );
            const scaleFactor = targetTotalSeconds / Math.max(1, rawDurationSum);

            const scenes: SceneItem[] = await Promise.all(
              rawScenes.map(async (sc: any, idx: number) => {
                const narration = sc.narrationText || "";
                const rawSec = Number(sc.estimatedSeconds) || 38;
                const duration = Math.max(8.0, parseFloat((rawSec * scaleFactor).toFixed(1)));
                const mediaUrl = await getCuratedMediaForScene({
                  topic,
                  keywords: sc.keywords || [topic],
                  sceneIndex: idx,
                  totalScenes: rawScenes.length,
                  visualStyle,
                  narrationText: narration,
                });

                return {
                  id: `sc-ai-${idx + 1}`,
                  sceneOrder: idx + 1,
                  narrationText: narration,
                  mediaUrl,
                  mediaType: "IMAGE",
                  motionEffect: MOTION_EFFECTS_SEQUENCE[idx % MOTION_EFFECTS_SEQUENCE.length],
                  durationSeconds: duration,
                  keywords: sc.keywords || ["dark mystery", "cinematic footage"],
                  subtitles: generateWordTimestamps(narration, duration),
                };
              })
            );

            const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
            const totalWords = scenes.reduce((acc, s) => acc + s.narrationText.split(/\s+/).length, 0);

            return {
              title: parsed.title || topic,
              youtubeDescription: parsed.youtubeDescription || `Documentário completo sobre ${topic}.`,
              scenes,
              totalWords,
              totalDurationSeconds: Math.round(totalDuration),
              format,
              language,
            };
          }
        }
      }
    } catch (e) {
      console.warn("Falha na chamada Gemini para roteiro, tentando OpenAI:", e);
    }
  }

  // 2. Se houver OpenAI configurada, gera roteiro cinematográfico via LLM
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith("sk-")) {
    try {
      const systemPrompt =
        format === "DOCUMENTARY"
          ? SYSTEM_DOCUMENTARY_WRITER_PROMPT
          : SYSTEM_TOP10_WRITER_PROMPT;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Escreva um roteiro Dark YouTube completo em idioma ${language} sobre: "${topic}". Duração alvo: ${targetMins} minutos (${targetTotalSeconds}s). Gere exatamente ${targetSceneCount} cenas sequenciais detalhadas no array "scenes" com narrationText longo de suspense e estimatedSeconds de ~40s. Use a pesquisa: ${JSON.stringify(
                researchData
              )}. Retorne um JSON com: title, youtubeDescription e scenes (array com sceneOrder, narrationText, keywords, estimatedSeconds).`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.75,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        const rawScenes = parsed.scenes || [];
        if (rawScenes.length > 0) {
          const rawDurationSum = rawScenes.reduce(
            (acc: number, sc: any) => acc + (Number(sc.estimatedSeconds) || 38),
            0
          );
          const scaleFactor = targetTotalSeconds / Math.max(1, rawDurationSum);

          const scenes: SceneItem[] = await Promise.all(
            rawScenes.map(async (sc: any, idx: number) => {
              const narration = sc.narrationText || "";
              const rawSec = Number(sc.estimatedSeconds) || 38;
              const duration = Math.max(8.0, parseFloat((rawSec * scaleFactor).toFixed(1)));
              const mediaUrl = await getCuratedMediaForScene({
                topic,
                keywords: sc.keywords || [topic],
                sceneIndex: idx,
                totalScenes: rawScenes.length,
                visualStyle,
                narrationText: narration,
              });

              return {
                id: `sc-ai-${idx + 1}`,
                sceneOrder: idx + 1,
                narrationText: narration,
                mediaUrl,
                mediaType: "IMAGE",
                motionEffect: MOTION_EFFECTS_SEQUENCE[idx % MOTION_EFFECTS_SEQUENCE.length],
                durationSeconds: duration,
                keywords: sc.keywords || ["dark mystery", "cinematic footage"],
                subtitles: generateWordTimestamps(narration, duration),
              };
            })
          );

          const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
          const totalWords = scenes.reduce((acc, s) => acc + s.narrationText.split(/\s+/).length, 0);

          return {
            title: parsed.title || topic,
            youtubeDescription: parsed.youtubeDescription || `Documentário completo sobre ${topic}.`,
            scenes,
            totalWords,
            totalDurationSeconds: Math.round(totalDuration),
            format,
            language,
          };
        }
      }
    } catch (e) {
      console.warn("Falha na chamada da OpenAI para roteiro, utilizando motor narrativo interno:", e);
    }
  }

  // 3. Motor Narrativo Autônomo com Escala Dinâmica para a Minutagem Escolhida
  return await generateDeterministicScript(topic, format, language, targetMins, researchData, visualStyle);
}

async function processCustomScriptToScenes(
  topic: string,
  rawScript: string,
  format: VideoFormat,
  language: Language,
  visualStyle: VisualStyle = "STOCK_4K"
): Promise<ScriptGenerationResult> {
  const paragraphs = rawScript
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const finalParagraphs = paragraphs.length > 0 ? paragraphs : [rawScript.trim()];

  const scenes: SceneItem[] = await Promise.all(
    finalParagraphs.map(async (para, idx) => {
      const words = para.split(/\s+/).filter(Boolean).length;
      const duration = Math.max(6.0, parseFloat((words * 0.45).toFixed(1)));
      const extractedKeywords = [topic, `cena ${idx + 1}`];

      const mediaUrl = await getCuratedMediaForScene({
        topic,
        keywords: extractedKeywords,
        sceneIndex: idx,
        totalScenes: finalParagraphs.length,
        visualStyle,
        narrationText: para,
      });

      return {
        id: `sc-custom-${idx + 1}`,
        sceneOrder: idx + 1,
        narrationText: para,
        mediaUrl,
        mediaType: "IMAGE",
        motionEffect: MOTION_EFFECTS_SEQUENCE[idx % MOTION_EFFECTS_SEQUENCE.length],
        durationSeconds: duration,
        keywords: extractedKeywords,
        subtitles: generateWordTimestamps(para, duration),
      };
    })
  );

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalWords = scenes.reduce((acc, s) => acc + s.narrationText.split(/\s+/).length, 0);

  return {
    title: topic,
    youtubeDescription: `Documentário completo baseado no roteiro: "${topic}". Capítulos e trilha sonora original.`,
    scenes,
    totalWords,
    totalDurationSeconds: Math.round(totalDuration),
    format,
    language,
  };
}

async function generateDeterministicScript(
  topic: string,
  format: VideoFormat,
  language: Language,
  targetDurationMinutes: number,
  research: ResearchResult,
  visualStyle: VisualStyle = "STOCK_4K"
): Promise<ScriptGenerationResult> {
  const isDoc = format === "DOCUMENTARY";
  const targetMins = Math.max(3, Number(targetDurationMinutes) || 10);
  const targetTotalSeconds = targetMins * 60;
  const targetSceneCount = Math.max(8, Math.round(targetTotalSeconds / 42));

  // Banco de Atos Narrativos de Alta Retenção (YouTube Dark)
  const documentaryNarrativePool = [
    {
      narration: `Nas primeiras horas de uma madrugada silenciosa, algo inexplicável rompeu os protocolos de segurança militar em ${topic}.`,
      keywords: ["radar militar", "noite sombria", "alerta silencioso"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Nenhum sinal de emergência foi enviado. Em questão de segundos, múltiplos canais de telemetria foram deliberadamente desligados.`,
      keywords: ["painel de controle", "transponder", "falha de sinal"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Quando as equipes de resgate chegaram às últimas coordenadas registradas, encontraram apenas um vazio oceânico impenetrável.`,
      keywords: ["oceano tempestade", "busca militar", "horizonte escuro"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Documentos desclassificados anos mais tarde revelaram que gravações de hidrofones captaram um ruído de frequência ultra-baixa se propagando por milhares de quilômetros.`,
      keywords: ["hidrofone submarino", "documentos secretos", "onda acústica"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Especialistas acústicos independentes afirmam que a intensidade do sinal não coincide com nada conhecido pela biologia marinha ou engenharia naval.`,
      keywords: ["análise de espectrograma", "frequência sonar", "mistério abissal"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Testemunhas que tentaram trazer à tona relatórios paralelos foram silenciadas por acordos de confidencialidade de grau máximo.`,
      keywords: ["arquivo confidencial", "carimbo secreto", "testemunha ocular"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Registros de satélites comerciais de radar orbital apontaram uma oscilação geomagnética minutos antes de qualquer contato cessar.`,
      keywords: ["satélite espacial", "anomalia magnética", "órbita terra"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Em salas de comando a milhares de quilômetros dali, oficiais de alto escalão convocaram reuniões de emergência sob protocolo de censura total.`,
      keywords: ["sala de crise militar", "reunião secreta", "segurança de estado"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Durante quarenta e sete minutos cruciais de silêncio de rádio, relatórios de tráfego aéreo continham dados conflitantes que jamais foram anexados aos inquéritos civis.`,
      keywords: ["fita cassete analógica", "documento censurado", "arquivos militares"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Navios de sondagem oceanográfica que operavam na região foram subitamente ordenados a mudar de curso e recolher todos os equipamentos de escuta.`,
      keywords: ["navio de pesquisa", "mar tempestuoso", "sonar de profundidade"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `As transcrições oficiais divulgadas aos parentes apresentavam cortes deliberados de três minutos na gravação de voz da cabine.`,
      keywords: ["fone de ouvido piloto", "fita de áudio", "gravador de cabine"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Hipóteses científicas independentes apontam para anomalias térmicas submarinas que coincidem com os últimos feixes de comunicação por satélite.`,
      keywords: ["fossa das marianas", "fundo do oceano", "submarino de pesquisa"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Engenheiros aeroespaciais aposentados romperam o silêncio afirmando que o sistema de navegação jamais permitiria manobras tão extremas sem intervenção humana direta.`,
      keywords: ["painel de instrumentos", "computador de bordo", "rota de voo"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Mesmo após a maior operação de busca combinada da história moderna, nenhum destroço estrutural de grande porte foi localizado onde a física previa.`,
      keywords: ["busca internacional", "pesquisa marítima", "abismo silencioso"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `O que as autoridades internacionais descobriram durante o evento que até hoje permanece sob o selo de mais estrito segredo de Estado?`,
      keywords: ["satélite espião", "sala de crise militar", "conspiração global"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `À medida que novas tecnologias de escaneamento por satélite revisitam as profundezas, a resposta definitiva parece estar cada vez mais perto de emergir.`,
      keywords: ["escaneamento sonar 3d", "abismo mariana", "fundo do mar"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Os arquivos que ligam esse caso a operações de inteligência permanecem guardados em cofres subterrâneos, com desclassificação prevista apenas para o próximo século.`,
      keywords: ["cofre subterrâneo", "arquivos selados", "segredo de inteligência"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Para o público, restaram hipóteses convenientes. Mas para quem analisou os dados brutos de radar, as peças simplesmente não fecham.`,
      keywords: ["gráfico de dados", "análise de radar", "mistério não resolvido"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Até que uma prova irrefutável venha à luz, este episódio continuará como o mais perturbador enigma documental do nosso tempo.`,
      keywords: ["horizonte escuro", "pôr do sol misterioso", "enigma final"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
  ];

  // Gera o total de cenas proporcional ao targetSceneCount
  const selectedScenesData = [];
  for (let i = 0; i < targetSceneCount; i++) {
    const template = documentaryNarrativePool[i % documentaryNarrativePool.length];
    selectedScenesData.push({
      ...template,
      sceneOrder: i + 1,
    });
  }

  const durationPerScene = parseFloat((targetTotalSeconds / targetSceneCount).toFixed(1));

  const scenes: SceneItem[] = await Promise.all(
    selectedScenesData.map(async (item, idx) => {
      const mediaUrl = await getCuratedMediaForScene({
        topic,
        keywords: item.keywords,
        sceneIndex: idx,
        totalScenes: selectedScenesData.length,
        visualStyle,
        narrationText: item.narration,
      });

      return {
        id: `sc-engine-${idx + 1}`,
        sceneOrder: idx + 1,
        narrationText: item.narration,
        mediaUrl,
        mediaType: "IMAGE",
        motionEffect: item.effect,
        durationSeconds: durationPerScene,
        keywords: item.keywords,
        subtitles: generateWordTimestamps(item.narration, durationPerScene),
      };
    })
  );

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalWords = scenes.reduce((acc, s) => acc + s.narrationText.split(/\s+/).length, 0);

  const title = isDoc
    ? `${topic}: O Documentário Que Revela o Que Jamais Foi Dito`
    : `Os Segredos Mais Perturbadores de ${topic} (DOCUMENTÁRIO COMPLETO)`;

  const youtubeDescription =
    `Investigação completa sobre ${topic}.\n\n` +
    `DURAÇÃO TOTAL: ${Math.floor(totalDuration / 60)} minutos (${scenes.length} capítulos)\n\n` +
    `CAPÍTULOS DO VÍDEO:\n` +
    scenes
      .map((s, i) => {
        const mins = Math.floor((i * durationPerScene) / 60);
        const secs = Math.floor((i * durationPerScene) % 60);
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} - Parte ${i + 1}`;
      })
      .join("\n") +
    `\n\n#darkchannels #documentario #${topic.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  return {
    title,
    youtubeDescription,
    scenes,
    totalWords,
    totalDurationSeconds: Math.round(totalDuration),
    format,
    language,
  };
}

function generateWordTimestamps(text: string, durationSeconds: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const timePerWord = durationSeconds / words.length;
  return words.map((word, i) => ({
    word,
    start: parseFloat((i * timePerWord).toFixed(2)),
    end: parseFloat(((i + 1) * timePerWord).toFixed(2)),
  }));
}
