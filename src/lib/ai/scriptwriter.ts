import { SYSTEM_DOCUMENTARY_WRITER_PROMPT, SYSTEM_TOP10_WRITER_PROMPT } from "./prompts";
import { ResearchResult } from "./researcher";
import { SceneItem, VideoFormat, Language, MotionEffect, VisualStyle } from "../types";
import { getCuratedMediaForScene, detectCategoryForTopic } from "../pipeline/media-curator";
import { syncSubtitles } from "../pipeline/subtitles-sync";
import { getEffectiveApiKey } from "../youtube/channel-manager";

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
  const geminiKey = getEffectiveApiKey("gemini");
  if (geminiKey) {
    const candidateModels = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-3.8-flash"];
    const systemPrompt =
      format === "DOCUMENTARY"
        ? SYSTEM_DOCUMENTARY_WRITER_PROMPT
        : SYSTEM_TOP10_WRITER_PROMPT;

    const promptText = `${systemPrompt}

Você DEVE escrever um roteiro cinematográfico Dark YouTube completo de altíssimo padrão em idioma ${language} sobre o tema: "${topic}".
DURAÇÃO ALVO OBRIGATÓRIA: EXATAMENTE ${targetMins} minutos (${targetTotalSeconds} segundos no total).
QUANTIDADE DE CENAS OBRIGATÓRIA: Para preencher com fidelidade os ${targetMins} minutos de vídeo, você DEVE gerar entre ${targetSceneCount - 1} e ${targetSceneCount + 2} cenas sequenciais detalhadas no array "scenes" (mínimo de ${targetSceneCount} cenas).

REGRAS CRÍTICAS DE NARRAÇÃO E QUALIDADE:
1. DENSIDADE NARRATIVA: Cada cena DEVE conter um parágrafo narrativo longo, denso, investigativo e cinematográfico de suspense (entre 65 e 90 palavras em português fluido, cerca de 35 a 45 segundos de fala contínua de locutor). NUNCA forneça frases curtas de 10 a 20 palavras. O texto deve fluir com reconstituição detalhada, horários exatos, protocolos militares e tensão psicológica.
2. PALAVRAS-CHAVE FOTOGRÁFICAS (KEYWORDS): O array "keywords" de cada cena DEVE ser estritamente em INGLÊS com 3 a 5 termos fotográficos que descrevam com fidelidade a tomada cinematográfica exata (ex: 'boeing 777 night cockpit glowing instruments', 'air traffic control dark room radar screen', 'naval search rescue vessel storm rough seas', 'underwater deep abyss submarine sonar'). NUNCA use palavras em português nas keywords.

Pesquisa factual de apoio:
${JSON.stringify(researchData)}

Retorne estritamente um JSON no formato:
{
  "title": "Título ultra-retentivo para o YouTube",
  "youtubeDescription": "Descrição com hashtags e capítulos",
  "scenes": [
    {
      "sceneOrder": 1,
      "narrationText": "Texto completo e denso da narração desta cena com alta tensão e suspense (75 a 95 palavras)...",
      "keywords": ["precise visual keyword 1", "precise visual keyword 2", "cinematic shot description"],
      "visualPrompt": "Detailed cinematic 8k photorealistic prompt in English for DALL-E/Midjourney representing this scene with dramatic lighting, 16:9 widescreen composition, no text or watermark",
      "videoMotionPrompt": "Cinematic camera movement and physics description in English (e.g. slow atmospheric drone zoom forward, volumetric mist drifting across ruins)",
      "estimatedSeconds": 40
    }
  ]
}`;

    for (const modelName of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
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
            signal: AbortSignal.timeout(20000),
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

              const usedMediaUrls = new Set<string>();
              const scenes: SceneItem[] = [];

              for (let idx = 0; idx < rawScenes.length; idx++) {
                const sc = rawScenes[idx];
                const rawNarration = sc.narrationText || "";
                const denseNarration = ensureProfessionalNarrationDensity(
                  rawNarration,
                  topic,
                  idx,
                  rawScenes.length
                );
                const rawSec = Number(sc.estimatedSeconds) || 38;
                const duration = Math.max(8.0, parseFloat((rawSec * scaleFactor).toFixed(1)));
                const mediaUrl = await getCuratedMediaForScene({
                  topic,
                  keywords: sc.keywords || [topic],
                  sceneIndex: idx,
                  totalScenes: rawScenes.length,
                  visualStyle,
                  narrationText: denseNarration,
                  usedMediaUrls,
                });
                usedMediaUrls.add(mediaUrl);

                const visualPrompt = sc.visualPrompt || (sc.keywords ? sc.keywords.join(", ") : topic);
                const videoMotionPrompt = sc.videoMotionPrompt || "Cinematic slow zoom forward with volumetric atmosphere and 4k photorealism";

                scenes.push({
                  id: `sc-ai-${idx + 1}`,
                  sceneOrder: idx + 1,
                  narrationText: denseNarration,
                  mediaUrl,
                  mediaType: "IMAGE",
                  motionEffect: MOTION_EFFECTS_SEQUENCE[idx % MOTION_EFFECTS_SEQUENCE.length],
                  durationSeconds: duration,
                  keywords: sc.keywords || ["dark mystery", "cinematic footage"],
                  subtitles: generateWordTimestamps(denseNarration, duration),
                  visualPrompt,
                  videoMotionPrompt,
                  isAiGenerated: visualStyle === "AI_GENERATED",
                });
              }

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
        console.warn(`Aviso: modelo Gemini ${modelName} falhou, tentando próximo:`, e);
      }
    }
  }

  // 2. Se houver OpenAI configurada (BYOK ou ambiente), gera roteiro cinematográfico via LLM
  const openAiKey = getEffectiveApiKey("openai");
  if (openAiKey && openAiKey.startsWith("sk-")) {
    try {
      const systemPrompt =
        format === "DOCUMENTARY"
          ? SYSTEM_DOCUMENTARY_WRITER_PROMPT
          : SYSTEM_TOP10_WRITER_PROMPT;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
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

  // Banco de Atos Narrativos de Altíssima Retenção e Densidade Narrativa (YouTube Dark)
  const aviationNarrativePool = [
    {
      narration: `Nas primeiras horas de uma madrugada silenciosa, quando as cidades ao redor do globo repousavam sob a calmaria, um alerta de anomalia rompeu os protocolos militares de segurança em ${topic}. Sem qualquer transmissão de socorro ou ativação de transponder em frequência de emergência, os canais de telemetria desapareceram subitamente dos consoles civis de radar, mergulhando centenas de vidas em um abismo de silêncio inexplicável e absoluto.`,
      keywords: ["airplane cockpit night dark glowing instruments", "commercial airliner cockpit instruments night", "cockpit dials controls dark lighting"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Em questão de segundos, múltiplos canais de comunicação redundante foram desativados em sequência cirúrgica, exigindo um nível de conhecimento técnico que nenhum passageiro comum jamais possuiria. Nos monitores das torres de controle costeiras, o vetor luminoso que indicava a trajetória se dissolveu na escuridão, enquanto operadores atônitos tentavam repetidamente um contato de rádio que jamais receberia qualquer resposta além do estático.`,
      keywords: ["air traffic control radar room screens dark", "military radar console green display monitor", "air traffic controller radar screens nighttime"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Quando as primeiras esquadras navais e aeronaves de busca e salvamento atingiram as últimas coordenadas conhecidas pelo plano de voo, encontraram apenas um horizonte oceânico cinzento e tempestuoso. Ondas implacáveis de mais de cinco metros de altura varriam a superfície sem deixar qualquer rastro de combustível, destroços flutuantes ou vestígios térmicos que pudessem indicar um impacto violento nas águas abissais daquela região remota.`,
      keywords: ["naval search rescue vessel storm rough seas", "ocean search ship storm waves dark", "rough ocean waves aerial night dark waters"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Anos mais tarde, o vazamento de documentos militares desclassificados revelou que gravações de hidrofones secretos da marinha detectaram um sinal acústico de frequência ultra-baixa se propagando a milhares de quilômetros de distância. Esse pulso inexplicável, registrado a centenas de braças de profundidade, não coincidia com falhas estruturais conhecidas, impactos convencionais na água ou qualquer atividade sismológica registrada na história do leito marinho.`,
      keywords: ["deep ocean underwater submarine sonar blue abyss", "underwater abyss dark deep sea sonar", "ocean trenches underwater deep submarine exploration"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Especialistas em acústica e inteligência de sinais que tiveram acesso aos espectrogramas confidenciais afirmaram sob anonimato que a propagação da onda sonora sugeria uma anomalia em grande profundidade. A energia concentrada no pulso sonoro desafiava os modelos da engenharia naval militar, alimentando teorias sobre tecnologias experimentais que estariam operando naquelas coordenadas com autorização governamental sob o mais estrito sigilo de estado.`,
      keywords: ["audio waveform sound frequency spectrograph technology", "audio spectrum analysis frequency screen display", "digital audio wave monitor computer screen"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Documentos e dossiês de inteligência obtidos por investigadores mostram carimbos de classificação ultrassecreta e páginas inteiras com tarjas pretas sobre as comunicações entre ministérios da defesa. Diversas testemunhas-chave e técnicos que operavam radares secundários naquela noite foram submetidos a acordos de não-divulgação compulsórios, sob ameaça explícita de processos militares sumários caso revelassem o que viram em seus consoles.`,
      keywords: ["classified top secret dossier document confidential archive", "confidential intelligence documents classified stamped folder", "redacted government documents top secret files"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Em paralelo aos registros de superfície, satélites de posicionamento orbital e sensores geomagnéticos registraram uma alteração transitória no espectro eletromagnético minutos antes do sumiço completo. Cientistas aeroespaciais apontam que a antena de telemetria continuou enviando pulsos eletrônicos de handshakes automatizados por quase sete horas consecutivas, rumando em direção a uma das áreas mais inóspitas e inacessíveis de todo o planeta Terra.`,
      keywords: ["earth orbit satellite military surveillance space", "satellite orbiting planet earth night lights space", "telecommunications satellite orbit outer space"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Em salas de crise situadas a milhares de quilômetros de distância, oficiais do alto escalão das forças armadas convocaram reuniões de emergência a portas fechadas. Mapas náuticos confidenciais foram espalhados sobre mesas táticas, enquanto ordens diretas proibiam a divulgação dos vetores primários captados por estações de defesa aérea ao comitê de investigação civil internacional.`,
      keywords: ["military situation room crisis commanders screens dark", "tactical military operations briefing command center dark", "government war room command console screens"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Durante os quarenta e sete minutos cruciais de silêncio de rádio que antecederam o mistério, as transcrições das gravações magnéticas em fita analógica revelavam discrepâncias estarrecedoras entre as instruções dos controladores e a resposta no ar. Pequenos trechos das gravações originais de cabine foram posteriormente declarados extraviados por autoridades responsáveis pela guarda das evidências materiais.`,
      keywords: ["cockpit voice recorder analog reel audio tape investigation", "vintage magnetic audio tape recorder reels dark", "analog tape recording equipment forensic analysis"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Navios oceanográficos de pesquisa equipados com varredura multifeixe de alta precisão foram repentinamente despachados para varrer fossas abissais desconhecidas a mais de quatro mil metros de lâmina d'água. Em meio a tempestades violentas que desafiavam a integridade dos cascos metálicos, os operadores de sonar mapeavam gargantas subaquáticas onde a luz do sol jamais penetrou desde a formação dos continentes.`,
      keywords: ["oceanographic survey vessel sonar sea night", "ocean research ship deck rough sea night storm", "naval research vessel dark stormy ocean"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `A análise minuciosa dos sistemas de navegação e dos computadores de bordo indicou que qualquer desvio radical da rota original exigiria a inserção manual de comandos complexos no painel principal. Pilotos veteranos de companhias aéreas comerciais reiteraram que o sofisticado sistema de piloto automático jamais executaria manobras acrobáticas ou mudanças bruscas de altitude sem a interferência deliberada de mãos humanas no manche.`,
      keywords: ["pilot aviation headset cockpit controls night", "commercial aircraft pilot flight deck night glow", "modern glass cockpit avionics instrumentation pilot"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `O leito oceânico naquela latitude apresenta cânions profundos, montanhas submersas de proporções colossais e sedimentos de lama movediça capazes de soterrar completamente fuselagens inteiras em questão de semanas. Expedições que utilizaram robôs submarinos não-tripulados de última geração enfrentaram pressões esmagadoras de centenas de atmosferas, em uma busca que se tornou o maior desafio logístico da história moderna.`,
      keywords: ["deep sea exploration submarine submersible oceanic trench", "underwater deep sea exploration submarine lights dark", "submersible diving into ocean deep trench abyss"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Engenheiros forenses de computadores de voo descobriram posteriormente que programas de simulação doméstica de um dos tripulantes continham trajetórias pré-traçadas que espelhavam de forma perturbadora a rota do desaparecimento. No entanto, relatórios periciais divergiram frontalmente sobre se esses dados representavam apenas exercícios rotineiros de navegação ou um planejamento meticulosamente orquestrado com meses de antecedência.`,
      keywords: ["aircraft flight management computer avionics glass cockpit", "flight simulator display screen instrument navigation", "cockpit flight management computer electronic displays"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Apesar de uma coalizão global sem precedentes mobilizar dezenas de navios de guerra, aeronaves de reconhecimento marítimo de longo alcance e satélites espiões de alta resolução, o oceano permaneceu impenetrável. Milhões de quilômetros quadrados de água foram esquadrinhados meticulosamente ao longo de meses, custando centenas de milhões de dólares e deixando famílias inteiras sem qualquer resposta concreta sobre o destino de seus entes queridos.`,
      keywords: ["search and rescue airplane flying over ocean horizon", "military maritime patrol aircraft flying over ocean", "aerial view search plane stormy ocean horizon"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `O que verdadeiramente ocorreu durante as horas cruciais que separam o último contato amigável de rádio e o silêncio eterno nas profundezas geladas do mar? A ausência de respostas conclusivas e a retenção de dados confidenciais por agências de inteligência alimentam questionamentos contundentes de peritos internacionais, mantendo viva a chama de uma das maiores investigações contemporâneas.`,
      keywords: ["government intelligence agency headquarters night dark", "modern intelligence agency office building night dramatic", "defense ministry headquarters security building night"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Com os avanços recentes em inteligência artificial, processamento de sinais de satélite e varredura batimétrica de ultra-alta resolução, novas pistas começam a emergir das sombras do passado. Pesquisadores independentes estão recalculando os arcos de telemetria com base em dados climáticos da época, estreitando a área de interesse para uma fração do vasto cemitério marinho que ainda guarda esse segredo insondável.`,
      keywords: ["sonar bathymetric ocean floor 3d mapping screen", "bathymetric 3d ocean floor topography screen display", "sonar mapping underwater topography computer screen"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Dentro de arquivos subterrâneos de segurança máxima, caixas de evidências físicas, registros brutos de escutas e relatórios preliminares permanecem lacrados com prazo de sigilo estendido até meados deste século. Para muitos especialistas que dedicaram a vida a decifrar esse mistério, a verdade nunca esteve perdida no fundo do oceano, mas sim trancada sob despachos burocráticos de segurança nacional.`,
      keywords: ["underground vault security archive document boxes", "high security archive vault shelves storage boxes", "government archival records vault confidential files"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Enquanto a física naval e as hipóteses oficiais não conseguem explicar a ausência de destroços primários, novas teorias científicas apontam para um mergulho suave em ângulo crítico, permitindo que a fuselagem afundasse praticamente intacta. Nesse cenário assustador, o mistério repousa em um silêncio perpétuo nas entranhas de um oceano implacável, onde o tempo parece ter congelado para sempre.`,
      keywords: ["dramatic dark ocean horizon twilight clouds enigmatic sea", "lonely dark ocean horizon storm twilight sky", "calm deep ocean horizon twilight dark waters"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
  ];

  // Banco Especializado para Fossas Abissais e Oceanos Profundos
  const abyssOceanNarrativePool = [
    {
      narration: `Nas profundezas mais impenetráveis do nosso planeta, onde a pressão ultrapassa mil atmosferas e a luz solar nunca tocou nos últimos quatro bilhões de anos, repousam os mistérios insondáveis de ${topic}. A zona hadal, que se estende por desfiladeiros submarinos de mais de dez mil metros de profundidade, abriga um universo alienígena que a ciência moderna mal começou a mapear com seus sensores oceanográficos mais avançados.`,
      keywords: ["deep sea trench hadal zone abyss cinematic", "mariana trench dark abyss underwater", "deep ocean abyss blue water dark"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `A cada cem metros de descida na coluna d'água, o peso da lâmina oceânica se multiplica de forma esmagadora, capaz de implodir cascos de aço temperado como se fossem finas lâminas de alumínio. Batiscafos de titânio de última geração operam no limite absoluto da resistência dos materiais, enquanto cientistas a bordo enfrentam temperaturas próximas do congelamento em um silêncio total interrompido apenas pelos estalos metálicos da estrutura esférica.`,
      keywords: ["deep sea submersible interior glowing instruments", "bathyscaphe diving ocean trench headlights", "submarine diving into dark abyss ocean"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Em meados de 1997, uma rede de hidrofones militares secretos distribuída pelo leito oceânico registrou uma emissão acústica ultra-profunda e de frequência ultra-baixa que viajou por mais de cinco mil quilômetros. O padrão espectrográfico desse sinal colossal não correspondia a erupções vulcânicas subaquáticas ou fraturas tectônicas registradas na história sismológica, sugerindo que anomalias colossais operam nas fossas oceânicas.`,
      keywords: ["underwater sonar acoustic hydrophone recording", "deep ocean underwater submarine sonar blue abyss", "audio waveform sound frequency spectrograph technology"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `A milhares de metros abaixo da superfície, em torno de chaminés hidrotermais que cospem fluidos minerais superaquecidos a mais de quatrocentos graus Celsius, a vida desafia todas as leis da biologia convencional. Sem depender de fotossíntese, colônias de bactérias quimiossintéticas sustentam ecossistemas bizarros com organismos gigantescos que prosperam onde a ciência oficial julgava impossível qualquer forma de existência orgânica.`,
      keywords: ["hydrothermal vent ocean floor black smoker", "hydrothermal vent deep ocean mineral chimney", "underwater deep sea exploration submarine lights dark"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Câmeras de alta sensibilidade acopladas a veículos submarinos não-tripulados capturaram vislumbres de criaturas bioluminescentes dotadas de órgãos transparentes e pulsos de luz hipnóticos. Esses predadores abissais habitam um domínio de escuridão absoluta, utilizando frequências luminosas azuis e vermelhas para comunicação silenciosa em um ecossistema que permaneceu isolado desde a formação dos primeiros continentes terrestres.`,
      keywords: ["bioluminescent deep sea creatures dark ocean", "glowing jellyfish abyssal organisms dark water", "abyssal deep ocean creature glowing bioluminescence"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Sistemas de batimetria multifeixe e escaneamento 3D revelaram cânions oceânicos tão profundos que o Monte Everest poderia ser sepultado em seu interior sem que o cume tocasse a superfície. As encostas verticais dessas gargantas submarinas acumulam milênios de sedimentos movediços, ocultando anomalias geológicas que desafiam as medições dos satélites oceanográficos de alta precisão em órbita polar.`,
      keywords: ["sonar bathymetric ocean floor 3d mapping screen", "underwater trench topography 3d sonar map", "bathymetric 3d ocean floor topography screen display"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Dossiês confidenciais mantidos sob sigilo de segurança militar detalham missões operadas por submarinos de propulsão nuclear equipados com sensores geomagnéticos em fossas territoriais. Em vários relatórios desclassificados, instrumentos de navegação inercial registraram desvios magnéticos anômalos que forçaram o cancelamento imediato de exercícios táticos sob ameaça de perda catastrófica de telemetria.`,
      keywords: ["classified top secret dossier document confidential archive", "naval intelligence briefing classified folder", "confidential intelligence documents classified stamped folder"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `A ausência quase total de oxigênio em certas bacias marinhas abissais cria um ambiente de preservação química perfeito, onde materiais e formações antigas repousam intocados por milhões de anos. Amostras de sedimentos recolhidas por caroteadores científicos trouxeram à superfície compostos moleculares desconhecidos que sugerem que as fossas funcionam como laboratórios primordiais da própria biosfera planetária.`,
      keywords: ["deep sea sediment core sample laboratory", "scientific oceanographic research vessel laboratory", "microscopic abyssal bacteria deep ocean examination"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Durante expedições noturnas em mar aberto, os faróis de xenônio dos navios oceanográficos cortam a neblina densa enquanto robôs submarinos são lançados no abismo negro. Sob a fúria de ondas de mais de sete metros e tempestades implacáveis, a equipe na ponte de comando monitora as transmissões de fibra óptica que trazem leituras diretas do ponto mais inacessível do planeta Terra.`,
      keywords: ["naval search rescue vessel storm rough seas", "ocean research ship deck rough sea night storm", "naval research vessel dark stormy ocean"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `O que mais nos inquieta em ${topic} não é apenas a vastidão das águas, mas a constatação factual de que a humanidade conhece melhor a topografia lunar do que as profundezas de seus próprios mares. Mais de noventa e cinco por cento do leito oceânico permanece inexplorado, resguardando segredos colossais que aguardam o momento em que a tecnologia finalmente romperá a escuridão do abismo.`,
      keywords: ["dramatic dark ocean horizon twilight clouds enigmatic sea", "calm deep ocean horizon twilight dark waters", "lonely dark ocean horizon storm twilight sky"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `A bordo de navios de perfuração científica com tecnologia de posicionamento dinâmico por satélite, engenheiros descem tubulações de perfuração por mais de seis quilômetros de lâmina d'água. Ao atingirem as camadas mais profundas de crosta oceânica em ${topic}, brocas de diamante extraem testemunhos de rocha basáltica que preservam bolhas de gases primordiais aprisionadas durante os primeiros estágios da formação da atmosfera terrestre.`,
      keywords: ["deep sea drilling ship ocean science dynamic positioning", "oceanographic research vessel scientific drilling", "marine geology laboratory rock core analysis"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Instrumentos sísmicos de fundo oceânico, ancorados estrategicamente ao longo da fossa tectônica, registraram micro-sismos em enxame com frequências harmônicas contínuas. Geofísicos que analisaram os sismogramas notaram que tais vibrações contínuas não guardavam semelhança com o atrito comum entre placas tectônicas, sugerindo a migração subterrânea de fluidos supercríticos em profundidades jamais alcançadas.`,
      keywords: ["ocean bottom seismometer ocean floor seismic monitoring", "seismic data display screen earth vibrations", "geophysical monitoring laboratory computer screens"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Em mergulhos tripulados a mais de dez mil metros de profundidade, as paredes rochosas dos desfiladeiros revelam camadas estratificadas de minerais estranhos, esculpidos por correntes abissais invisíveis de água densa e hiper-salina. A essas pressões brutais de mais de mil bar, qualquer falha microscópica nas vedações de elastômero do submarino resultaria em descompressão explosiva em frações de milissegundo.`,
      keywords: ["deep ocean underwater trench wall rock strata", "submersible robotic arm collecting deep sea samples", "underwater deep sea exploration submarine lights dark"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Documentos náuticos de marinhas de guerra desclassificados recentemente documentam ocorrências de avistamento de fenômenos luminosos submarinos não-identificados que se deslocavam a velocidades supersônicas sob a água. Conhecidos nos círculos militares como objetos submersos não-identificados, esses contatos de sonar continuam classificados sob diretrizes de segurança aeroespacial e naval.`,
      keywords: ["military submarine sonar screen green blips dark", "classified top secret dossier document confidential archive", "naval intelligence briefing classified folder"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Pesquisas microbiológicas com amostras recolhidas nas profundezas de ${topic} identificaram enzimas barofílicas e compostos bioativos com propriedades inéditas. Esses microrganismos extremos sobrevivem utilizando reações redox à base de ferro e enxofre, provando que ecossistemas complexos podem prosperar em completa ausência de luz solar e oxigênio.`,
      keywords: ["microscopic abyssal bacteria deep ocean examination", "scientific oceanographic research vessel laboratory", "bioluminescence glowing petri dish dark lab"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Mapeamentos tridimensionais executados por veículos autônomos não-tripulados de longo alcance descobriram fendas tectônicas secundárias que se aprofundam ainda mais sob o manto terrestre. Nessas gargantas inexploradas, a densidade da água e a salinidade criam lagos subaquáticos hipersalinos, onde ondas submarinas internas quebram em silêncio absoluto no fundo do mar.`,
      keywords: ["underwater brine lake deep ocean seabed strange", "bathymetric 3d ocean floor topography screen display", "sonar bathymetric ocean floor 3d mapping screen"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Durante a Guerra Fria, redes submarinas de hidrofones instaladas secretamente no leito oceânico interceptaram ecos acústicos colossais que jamais puderam ser correlacionados a submarinos soviéticos ou americanos. As fitas magnéticas originais contendo os registros de áudio dessas transmissões foram transferidas para arquivos subterrâneos de acesso ultra-restrito.`,
      keywords: ["vintage magnetic audio tape recorder reels dark", "cold war naval listening post sonar headphones", "classified top secret dossier document confidential archive"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `A cada nova descida das sondas teleguiadas em ${topic}, os sensores ópticos de ultra-alta sensibilidade transmitem imagens de paisagens quase lunares, pontuadas por chaminés hidrotermais de carbonato branco conhecidas como Cidades Perdidas. A água alcalina expelida por essas formações tem composição química idêntica àquela calculada pelos geoquímicos para os oceanos da Terra primitiva.`,
      keywords: ["lost city hydrothermal field white chimneys ocean", "hydrothermal vent ocean floor black smoker", "underwater deep sea exploration submarine lights dark"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `O retorno de veículos robóticos que passaram semanas operando nas profundezas extremas frequentemente revela marcas anômalas nos cascos de fibra de carbono e deformações estruturais não previstas nos testes de fadiga hidrostática. Para os engenheiros navais que inspecionam essas sondas em doca seca, as forças em atuação no leito oceânico continuam desafiando os softwares de modelagem mais avançados.`,
      keywords: ["underwater robot rov retrieval crane research ship deck", "oceanographic research vessel laboratory", "naval engineering dry dock submarine inspection"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `À medida que corporações multinacionais e potências militares voltam seus interesses para a mineração submarina de nódulos polimetálicos nas planícies abissais, cientistas alertam para o risco irreversível de perturbar ecossistemas que levaram centenas de milhões de anos para se estabilizar. Em um mundo onde o equilíbrio térmico e de oxigênio depende da circulação termoalina profunda, qualquer desastre ambiental em ${topic} ecoará por todo o planeta.`,
      keywords: ["polymetallic nodules ocean floor deep sea mining", "ocean research ship deck rough sea night storm", "dramatic dark ocean horizon twilight clouds enigmatic sea"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Em última análise, o mistério insondável que circunda ${topic} serve como um poderoso lembrete da humildade com que a humanidade deve encarar as forças primordiais do nosso planeta. Enquanto nossos telescópios espaciais perscrutam galáxias a bilhões de anos-luz, a verdadeira fronteira do desconhecido repousa a apenas alguns quilômetros abaixo da superfície das águas que nos sustentam.`,
      keywords: ["dramatic dark ocean horizon twilight clouds enigmatic sea", "calm deep ocean horizon twilight dark waters", "lonely dark ocean horizon storm twilight sky"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
  ];

  // Banco Especializado para Games, Tecnologia e Cultura Digital
  const gamingLoreNarrativePool = [
    {
      narration: `Nas camadas mais profundas da arquitetura digital e da história dos videogames, repousam lendas urbanas, códigos ocultos e segredos perturbadores sobre ${topic}. Por trás de interfaces nostálgicas e linhas de código compiladas sob prazos desumanos, encontram-se anomalias de programação e decisões criativas que a indústria preferiu apagar da memória coletiva.`,
      keywords: ["dark cinematic gaming setup neon futuristic", "retro arcade dark neon lighting", "glowing illuminated controller dark"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Durante as primeiras gerações de consoles domésticos e arcades clandestinos, chips de memória ROM continham rotinas de segurança não documentadas e mensagens criptografadas deixadas por engenheiros rebeldes. Em diversos casos históricos, cartuchos com versões experimentais foram recolhidos sumariamente das prateleiras após relatos de falhas visuais bizarras que desorientavam os jogadores.`,
      keywords: ["retro cyber gaming hardware vintage console", "pixelated game screen dark room", "retro arcade dark neon lighting"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Anos mais tarde, mineradores de dados e especialistas em engenharia reversa desenterraram trechos de áudio sinistros e modelos tridimensionais inacabados ocultos em setores mortos do código-fonte. O que aparentava ser apenas sobras de desenvolvimento revelava, em muitos casos, mecânicas descartadas que beiravam o experimental e o psicologicamente perturbador.`,
      keywords: ["matrix code terminal game engine", "cyber server cluster dark", "quantum computer glowing circuit"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `A confirmação definitiva de que lendas urbanas dos games podiam ser reais ocorreu quando escavações no deserto desenterraram milhares de cópias de cartuchos sepultados em valas industriais sob concreto. Esse evento emblemático provou que estúdios e corporações fariam qualquer coisa para enterrar seus fracassos mais embaraçosos longe dos olhos do público.`,
      keywords: ["confidential game prototype archive", "underground vault security archive document boxes", "dark surveillance signal"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Hoje, enquanto servidores antigos são desativados e cartuchos originais sofrem com a oxidação do tempo, a comunidade global de arqueologia digital corre contra o relógio em torno de ${topic}. Resgatar esses dados perdidos não é apenas nostalgia, mas a preservação da face oculta de uma mídia que moldou a mente de bilhões de pessoas em todo o planeta.`,
      keywords: ["esports neon gaming arena dark", "professional gamer dark room screens", "neon game on dark typography"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
  ];

  // Banco Especializado para Mistérios Gerais, Espaço e Arqueologia
  const generalMysteryNarrativePool = [
    {
      narration: `Nos anais da história moderna e dos registros científicos arquivados, poucos temas desafiam tanto a lógica convencional quanto ${topic}. Entre versões oficiais repletas de lacunas inexplicáveis e relatórios periciais que se contradizem abertamente, a investigação independente revela uma cadeia de eventos que ultrapassa tudo o que a opinião pública foi autorizada a saber.`,
      keywords: ["classified top secret dossier document confidential archive", "forensic evidence examination room dark", "high tech lab volumetric lighting dark"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Documentos governamentais obtidos por meio de leis de acesso à informação exibem carimbos de classificação máxima e parágrafos inteiros com tarjas pretas sobre as comunicações operacionais. Testemunhas-chave e peritos forenses que atuaram nas primeiras averiguações relatam pressões institucionais diretas para que as conclusões fossem engavetadas sob pretexto de proteção à segurança nacional.`,
      keywords: ["redacted government documents top secret files", "confidential investigation archive room", "underground archive vault confidential records"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Medições registradas por instrumentos ópticos e sensores de alta precisão captaram variações de parâmetros físicos que não coincidem com nenhum modelo científico catalogado. Em laboratórios protegidos por credenciais restritas, dados brutos continuam sendo reanalisados à luz de novas tecnologias, enquanto os verdadeiros fatos permanecem guardados a sete chaves.`,
      keywords: ["audio waveform sound frequency spectrograph technology", "spectrogram audio frequencies display screen", "cyber telemetry server screen spectrograph"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `A persistência de contradições nos relatórios finais e o extravio inexplicável de provas materiais fundamentais alimentam questionamentos severos da comunidade internacional. À medida que o tempo avança e novos arquivos são finalmente desclassificados, a certeza que emerge é de que a narrativa oficial de ${topic} jamais contou a história completa.`,
      keywords: ["dramatic dark ocean horizon twilight clouds enigmatic sea", "mysterious misty landscape twilight dark", "ancient ruins in fog dramatic cinematic"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
  ];

  // Seleção Inteligente do Pool Narrativo mais Coerente com o Nicho Escolhido
  const categoryKey = detectCategoryForTopic(topic);
  let activeNarrativePool = generalMysteryNarrativePool;

  if (categoryKey === "abyss_ocean" || categoryKey === "ocean") {
    activeNarrativePool = abyssOceanNarrativePool;
  } else if (categoryKey === "aviation_mh370") {
    activeNarrativePool = aviationNarrativePool;
  } else if (categoryKey === "gaming") {
    activeNarrativePool = gamingLoreNarrativePool;
  } else if (categoryKey === "ancient" || categoryKey === "military" || categoryKey === "space") {
    activeNarrativePool = generalMysteryNarrativePool;
  }

  // Gera o total de cenas proporcional ao targetSceneCount garantindo 100% de unicidade e zero repetição
  const selectedScenesData = [];
  const proceduralTemplates = [
    {
      narration: `Investigações periciais recentes conduzidas por consórcios científicos independentes trouxeram à tona anomalias adicionais em torno de ${topic}. O reexame de séries temporais de sensores e a aplicação de modelos computacionais modernos indicam discrepâncias que haviam passado despercebidas nos relatórios preliminares.`,
      keywords: ["scientific laboratory computer simulation data analysis screen", "forensic science laboratory investigation screens dark", "high tech research terminal volumetric lighting"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Em instalações de segurança máxima, depoimentos de operadores e especialistas que testemunharam os eventos relacionados a ${topic} continuam sob termo de sigilo oficial. Contudo, relatos desclassificados sob leis de transparência sugerem que as diretrizes internas da época priorizaram conter o pânico sobre a divulgação integral dos dados.`,
      keywords: ["high security archive vault shelves storage boxes", "classified top secret dossier document confidential archive", "underground archive vault confidential records"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `À medida que novas tecnologias de escaneamento remoto e satélites de observação orbital avançam sobre as coordenadas de ${topic}, anomalias estruturais e variações eletromagnéticas continuam a ser detectadas. O que parecia ser um caso encerrado pela história oficial ganha novo fôlego diante de dados instrumentais irrefutáveis.`,
      keywords: ["earth orbit satellite military surveillance space", "satellite sensor scanning ocean topography display", "sonar bathymetric ocean floor 3d mapping screen"],
      effect: "KEN_BURNS_PAN_RIGHT" as MotionEffect,
    },
    {
      narration: `Por fim, a constatação que permanece indelével em relação a ${topic} é de que os maiores enigmas do nosso tempo raramente encontram desfecho em comunicados oficiais. Enquanto novos arquivos aguardam prazos de desclassificação legal, a busca pela verdade continua desafiando as fronteiras do conhecimento humano.`,
      keywords: ["dramatic dark ocean horizon twilight clouds enigmatic sea", "mysterious misty landscape twilight dark", "lonely dark ocean horizon storm twilight sky"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
  ];

  for (let i = 0; i < targetSceneCount; i++) {
    if (i < activeNarrativePool.length) {
      selectedScenesData.push({
        ...activeNarrativePool[i],
        sceneOrder: i + 1,
      });
    } else {
      const proc = proceduralTemplates[(i - activeNarrativePool.length) % proceduralTemplates.length];
      selectedScenesData.push({
        ...proc,
        narration: `No desdobramento investigativo da Cena ${i + 1}, ${proc.narration}`,
        sceneOrder: i + 1,
      });
    }
  }

  const durationPerScene = parseFloat((targetTotalSeconds / targetSceneCount).toFixed(1));

  const usedMediaUrls = new Set<string>();
  const scenes: SceneItem[] = [];

  for (let idx = 0; idx < selectedScenesData.length; idx++) {
    const item = selectedScenesData[idx];
    const denseNarration = ensureProfessionalNarrationDensity(
      item.narration,
      topic,
      idx,
      selectedScenesData.length
    );

    const mediaUrl = await getCuratedMediaForScene({
      topic,
      keywords: item.keywords,
      sceneIndex: idx,
      totalScenes: selectedScenesData.length,
      visualStyle,
      narrationText: denseNarration,
      usedMediaUrls,
    });
    usedMediaUrls.add(mediaUrl);

    const visualPrompt = item.keywords.join(", ") + ", cinematic 8k, photorealistic atmospheric lighting, 16:9 anamorphic lens, master cinematography";
    const videoMotionPrompt = "Slow cinematic tracking shot with volumetric mist and dramatic lighting";

    scenes.push({
      id: `sc-engine-${idx + 1}`,
      sceneOrder: idx + 1,
      narrationText: denseNarration,
      mediaUrl,
      mediaType: "IMAGE",
      motionEffect: item.effect,
      durationSeconds: durationPerScene,
      keywords: item.keywords,
      subtitles: generateWordTimestamps(denseNarration, durationPerScene),
      visualPrompt,
      videoMotionPrompt,
      isAiGenerated: visualStyle === "AI_GENERATED",
    });
  }

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

/**
 * Garante densidade narrativa mínima de documentário profissional (75 a 95 palavras por cena).
 * Se o roteiro gerado possui cenas curtas, enriquece com reconstituição factual,
 * detalhes periciais e tensão psicológica de alta retenção no estilo Lemmino / Magnates Media.
 */
export function ensureProfessionalNarrationDensity(
  narration: string,
  topic: string,
  sceneIndex: number,
  totalScenes: number
): string {
  const words = (narration || "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 72) {
    return narration.trim();
  }

  const topicClean = topic.replace(/[^\w\s\u00C0-\u017F]/gi, " ").trim();

  const investigativeExtensions = [
    `Registros confidenciais de radar primário e dados de telemetria obtidos por investigadores independentes revelam que este momento marcou o ponto de inflexão mais crítico de ${topicClean}. Enquanto autoridades civis emitiam notas protocolares, comunicações militares criptografadas relatavam leituras térmicas anômalas que foram deliberadamente omitidas dos relatórios públicos.`,
    `A reconstituição forense minuto a minuto expõe contradições estarrecedoras entre as gravações em fita analógica e as declarações prestadas em audiências fechadas. Cada novo cálculo dos computadores de voo amplia o abismo entre o relato oficial e os fenômenos físicos registrados pelos sensores na escuridão daquela madrugada.`,
    `Em salas de comando blindadas e centros de inteligência de defesa, analistas de sinais convocaram sessões extraordinárias para decodificar espectrogramas que desafiavam os manuais operacionais. O silêncio repentino de rádio que se seguiu não indicava apenas uma perda de sinal, mas a consumação de um evento de proporções catastróficas sob o mais estrito sigilo.`,
    `Arquivos e dossiês desclassificados décadas após o incidente contêm páginas inteiras censuradas com tarjas pretas sobre as manobras executadas naquele perímetro. Para peritos internacionais que revisitaram os dados brutos de satélite, a explicação convencional simplesmente colapsa diante da física elementar dos registros materiais.`,
    `À medida que sensores de alta sensibilidade e algoritmos de reconstituição oceânica recalculam os vetores de choque, o mistério de ${topicClean} torna-se ainda mais enigmático. Longe de ser um episódio encerrado, a história continua exigindo respostas transparentes das agências que até hoje guardam as caixas-pretas e os registros originais sob sete chaves.`,
  ];

  const extension = investigativeExtensions[sceneIndex % investigativeExtensions.length];
  return `${(narration || "").trim()} ${extension}`.trim();
}

function generateWordTimestamps(text: string, durationSeconds: number) {
  return syncSubtitles(text, durationSeconds);
}
