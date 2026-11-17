import { SYSTEM_DOCUMENTARY_WRITER_PROMPT, SYSTEM_TOP10_WRITER_PROMPT } from "./prompts";
import { ResearchResult } from "./researcher";
import { SceneItem, VideoFormat, Language, MotionEffect } from "../types";

export interface ScriptGenerationResult {
  title: string;
  youtubeDescription: string;
  scenes: SceneItem[];
  totalWords: number;
  totalDurationSeconds: number;
  format: VideoFormat;
  language: Language;
}

const SAMPLE_CURATED_MEDIA = [
  "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop", // Ocean storm mystery
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop", // Dark radar signal
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop", // Deep underwater glow
  "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1200&auto=format&fit=crop", // Ice Antarctica ruins
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop", // Outer space earth
  "https://images.unsplash.com/photo-1579965342575-16428a7c8881?q=80&w=1200&auto=format&fit=crop", // Military war vintage
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop", // Quantum technology abstract
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop", // Classified files retro
];

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
}): Promise<ScriptGenerationResult> {
  const { topic, format, language, targetDurationMinutes, researchData, customScript } = params;

  // Se o usuário já forneceu um roteiro bruto, faz a segmentação estruturada
  if (customScript && customScript.trim().length > 50) {
    return processCustomScriptToScenes(topic, customScript, format, language);
  }

  // Se houver OpenAI configurada, gera roteiro cinematográfico via LLM
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
              content: `Escreva um roteiro Dark YouTube completo em idioma ${language} sobre: "${topic}". Duração alvo: ${targetDurationMinutes} minutos. Use a pesquisa: ${JSON.stringify(
                researchData
              )}. Retorne um JSON com: title (título ultra-retentivo para o YouTube), youtubeDescription (com hashtags de SEO e capítulos), e scenes (array de objetos com narrationText, keywords, estimatedSeconds).`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.75,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);

        const scenes: SceneItem[] = (parsed.scenes || []).map((sc: any, idx: number) => {
          const narration = sc.narrationText || "";
          const words = narration.split(/\s+/).filter(Boolean).length;
          const duration = Math.max(5.5, Number(sc.estimatedSeconds) || words * 0.45);

          return {
            id: `sc-ai-${idx + 1}`,
            sceneOrder: idx + 1,
            narrationText: narration,
            mediaUrl: SAMPLE_CURATED_MEDIA[idx % SAMPLE_CURATED_MEDIA.length],
            mediaType: "IMAGE",
            motionEffect: MOTION_EFFECTS_SEQUENCE[idx % MOTION_EFFECTS_SEQUENCE.length],
            durationSeconds: parseFloat(duration.toFixed(1)),
            keywords: sc.keywords || ["dark mystery", "cinematic footage"],
            subtitles: generateWordTimestamps(narration, duration),
          };
        });

        if (scenes.length > 0) {
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

  // Motor Narrativo de Alta Retenção Interno
  return generateDeterministicScript(topic, format, language, targetDurationMinutes, researchData);
}

function processCustomScriptToScenes(
  topic: string,
  rawScript: string,
  format: VideoFormat,
  language: Language
): ScriptGenerationResult {
  // Quebra por parágrafos ou pontos finais
  const paragraphs = rawScript
    .split(/\n\n+|\.\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const scenes: SceneItem[] = paragraphs.map((text, idx) => {
    const words = text.split(/\s+/).length;
    const duration = Math.max(5.0, words * 0.42);

    return {
      id: `sc-custom-${idx + 1}`,
      sceneOrder: idx + 1,
      narrationText: text.endsWith(".") ? text : text + ".",
      mediaUrl: SAMPLE_CURATED_MEDIA[idx % SAMPLE_CURATED_MEDIA.length],
      mediaType: "IMAGE",
      motionEffect: MOTION_EFFECTS_SEQUENCE[idx % MOTION_EFFECTS_SEQUENCE.length],
      durationSeconds: parseFloat(duration.toFixed(1)),
      keywords: ["documentary archive", "historical footage", "cinematic mystery"],
      subtitles: generateWordTimestamps(text, duration),
    };
  });

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

function generateDeterministicScript(
  topic: string,
  format: VideoFormat,
  language: Language,
  targetDurationMinutes: number,
  research: ResearchResult
): ScriptGenerationResult {
  const isDoc = format === "DOCUMENTARY";

  const rawScenesData: { narration: string; keywords: string[]; effect: MotionEffect }[] = isDoc
    ? [
        {
          narration: `Nas primeiras horas de uma madrugada silenciosa, algo inexplicável rompeu os protocolos de segurança militar em ${topic}.`,
          keywords: ["radar militar", "noite sombria", "alerta silencioso"],
          effect: "KEN_BURNS_ZOOM_IN",
        },
        {
          narration: `Nenhum sinal de emergência foi enviado. Em questão de segundos, múltiplos canais de telemetria foram deliberadamente desligados.`,
          keywords: ["painel de controle", "transponder", "falha de sinal"],
          effect: "PARALLAX_25D",
        },
        {
          narration: `Quando as equipes de resgate chegaram às últimas coordenadas registradas, encontraram apenas um vazio oceânico impenetrável.`,
          keywords: ["oceano tempestade", "busca militar", "horizonte escuro"],
          effect: "KEN_BURNS_PAN_RIGHT",
        },
        {
          narration: `Documentos desclassificados anos mais tarde revelaram que gravações de hidrofones captaram um ruído de frequência ultra-baixa se propagando por milhares de quilômetros.`,
          keywords: ["hidrofone submarino", "documentos secretos", "onda acústica"],
          effect: "KEN_BURNS_ZOOM_OUT",
        },
        {
          narration: `Especialistas acústicos independentes afirmam que a intensidade do sinal não coincide com nada conhecido pela biologia marinha ou engenharia naval.`,
          keywords: ["análise de espectrograma", "frequência sonar", "mistério abissal"],
          effect: "KEN_BURNS_PAN_LEFT",
        },
        {
          narration: `Testemunhas que tentaram trazer à tona relatórios paralelos foram silenciadas por acordos de confidencialidade de grau máximo.`,
          keywords: ["arquivo confidencial", "carimbo secreto", "testemunha ocular"],
          effect: "PARALLAX_25D",
        },
        {
          narration: `O que as autoridades internacionais descobriram durante os 47 minutos de silêncio de rádio que até hoje permanecem sob sigilo de Estado?`,
          keywords: ["satélite espião", "sala de crise militar", "conspiração"],
          effect: "KEN_BURNS_ZOOM_IN",
        },
        {
          narration: `À medida que novas tecnologias de escaneamento por satélite revisitam as profundezas, a resposta parece estar cada vez mais perto de emergir.`,
          keywords: ["escaneamento sonar 3d", "abismo mariana", "fundo do mar"],
          effect: "KEN_BURNS_PAN_RIGHT",
        },
      ]
    : [
        {
          narration: `Prepare-se para conhecer os casos mais aterrorizantes e inexplicáveis já registrados na história moderna sobre ${topic}.`,
          keywords: ["ranking mistério", "abertura tensa", "curiosidades sombrias"],
          effect: "KEN_BURNS_ZOOM_IN",
        },
        {
          narration: `Número 10: O Primeiro Registro Oculto. Um arquivo militar datado que detalha o contato inicial com a anomalia.`,
          keywords: ["top 10", "arquivo militar vintage", "radar"],
          effect: "PARALLAX_25D",
        },
        {
          narration: `Número 09: A Interrupção de Rádio. Mais de 40 estações civis perderam sinal simultaneamente na mesma faixa de frequência.`,
          keywords: ["estação de rádio torre", "ruído branco", "noite estática"],
          effect: "KEN_BURNS_PAN_RIGHT",
        },
        {
          narration: `Número 08: Os Testemunhos dos Mergulhadores de Profundidade. Relatos juramentados de estruturas submersas sem precedentes.`,
          keywords: ["mergulho profundo", "ruínas submersas", "lanterna submarina"],
          effect: "KEN_BURNS_ZOOM_OUT",
        },
        {
          narration: `Mas se os números iniciais desafiam a lógica, o que foi registrado no número 1 mudou para sempre a compreensão da ciência.`,
          keywords: ["clímax ranking", "segredo de estado", "revelação chocante"],
          effect: "KEN_BURNS_ZOOM_IN",
        },
        {
          narration: `Número 01: O Evento Central. A evidência definitiva que os governos tentaram enterrar durante mais de meio século.`,
          keywords: ["número 1 topo", "conspiração global", "verdade oculta"],
          effect: "PARALLAX_25D",
        },
      ];

  const scenes: SceneItem[] = rawScenesData.map((item, idx) => {
    const words = item.narration.split(/\s+/).length;
    const duration = Math.max(6.0, words * 0.44);

    return {
      id: `sc-engine-${idx + 1}`,
      sceneOrder: idx + 1,
      narrationText: item.narration,
      mediaUrl: SAMPLE_CURATED_MEDIA[idx % SAMPLE_CURATED_MEDIA.length],
      mediaType: "IMAGE",
      motionEffect: item.effect,
      durationSeconds: parseFloat(duration.toFixed(1)),
      keywords: item.keywords,
      subtitles: generateWordTimestamps(item.narration, duration),
    };
  });

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalWords = scenes.reduce((acc, s) => acc + s.narrationText.split(/\s+/).length, 0);

  const title = isDoc
    ? `${topic}: O Documentário Que Revela o Que Jamais Foi Dito`
    : `Os Segredos Mais Perturbadores de ${topic} (TOP RANKING)`;

  const youtubeDescription = `Investigação completa sobre ${topic}.\n\n` +
    `CAPÍTULOS DO VÍDEO:\n` +
    scenes
      .map((s, i) => {
        const mins = Math.floor((i * 40) / 60);
        const secs = (i * 40) % 60;
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
