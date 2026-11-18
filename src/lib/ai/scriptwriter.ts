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
    const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
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
      "narrationText": "Texto completo e denso da narração desta cena com alta tensão e suspense (65 a 90 palavras)...",
      "keywords": ["precise visual keyword 1", "precise visual keyword 2", "cinematic shot description"],
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

  // Banco de Atos Narrativos de Altíssima Retenção e Densidade Narrativa (YouTube Dark)
  const documentaryNarrativePool = [
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
    {
      narration: `Radares de defesa aérea primários instalados em bases costeiras registraram uma assinatura de voo ziguezagueante que subia a altitudes proibidas antes de despencar em parafuso controlado sobre o estreito marítimo. Operadores militares que testemunharam o traço desaparecer de repente de suas telas foram orientados a tratar as gravações como exercício não-oficial, apagando os registros dos livros de serviço.`,
      keywords: ["military tactical radar screen tracking blip green display", "air defense radar console night glowing screen", "military operations room tracking flight path dark"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Meses após o desaparecimento, fragmentos isolados de material composto surgiram a milhares de milhas dali, em praias desérticas banhadas por correntes remotas. A análise pericial das incrustações biológicas revelou que as peças flutuaram à deriva por semanas caóticas, mas o corpo principal contendo as caixas-pretas blindadas continuou sepultado em local absolutamente incerto.`,
      keywords: ["ocean debris wreckage shoreline aircraft metal", "driftwood and debris on stormy ocean coastline", "aircraft wing metal debris ocean shore rocks"],
      effect: "PARALLAX_25D" as MotionEffect,
    },
    {
      narration: `Entre as teses mais inquietantes debatidas por investigadores de acidentes aéreos está o evento de despressurização catastrófica deliberada, onde a altitude foi elevada para provocar a perda de consciência em questão de segundos. Sob a névoa letal da hipóxia em temperaturas congelantes, o objeto teria seguido seu curso em piloto fantasma até a última gota de combustível.`,
      keywords: ["airplane passenger cabin dark empty night lights", "empty airliner cabin seats night blue lights", "aircraft passenger window night clouds exterior"],
      effect: "KEN_BURNS_ZOOM_OUT" as MotionEffect,
    },
    {
      narration: `Constelações de satélites espiões operadas por superpotências mundiais possuem sensores infravermelhos com capacidade para detectar até mesmo a assinatura térmica de um motor a jato em pleno oceano. No entanto, quando questionados formalmente por jornalistas e tribunais internacionais, governos declararam que seus sensores estavam inativos ou que os dados configuravam segredo de defesa.`,
      keywords: ["satellite in deep space orbiting planet earth night", "military spy satellite orbiting planet earth space", "high tech space satellite earth observation glowing"],
      effect: "KEN_BURNS_PAN_LEFT" as MotionEffect,
    },
    {
      narration: `Laboratórios de investigação aeroespacial trabalharam incansavelmente na decodificação dos microsegundos de atraso de frequência conhecidos como Efeito Doppler nos sinais residuais de rádio. Cada cálculo matemático confirmava que o ponto final não foi um desastre aleatório em terra firme, mas sim um mergulho terminal no ponto mais isolado e impiedoso dos mares do sul.`,
      keywords: ["laboratory computer data screens dark forensic investigation", "aviation forensics computer data analysis screens", "dark research lab computers spectrograms displays"],
      effect: "KEN_BURNS_ZOOM_IN" as MotionEffect,
    },
    {
      narration: `Mais de uma década após aquela noite fatídica, a história de ${topic} permanece como o mais perturbador enigma não solucionado da aviação e da investigação contemporânea. Enquanto os segredos continuarem protegidos em gabinetes militares e no silêncio do abismo marinho, o mundo continuará esperando pelo dia em que a verdade finalmente romperá a escuridão.`,
      keywords: ["dramatic dark ocean horizon twilight clouds enigmatic sea", "calm deep ocean horizon twilight dark waters", "endless dark stormy ocean horizon mystery"],
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
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const timePerWord = durationSeconds / words.length;
  return words.map((word, i) => ({
    word,
    start: parseFloat((i * timePerWord).toFixed(2)),
    end: parseFloat(((i + 1) * timePerWord).toFixed(2)),
  }));
}
