import { PlanPricing, PipelineStageInfo, VoiceOption, SceneItem } from "./types";

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    stage: 1,
    name: "Pesquisa & Apuração",
    shortDesc: "Coleta e verificação de fatos históricos e curiosidades",
    detailedDesc: "Pesquisa automática profunda e apuração de fatos sobre o tema em fontes verificadas.",
    iconName: "Search",
    estimatedSeconds: 6,
  },
  {
    stage: 2,
    name: "Roteiro Narrativo",
    shortDesc: "Estruturação com arco dramático cinematográfico",
    detailedDesc: "Escrita do roteiro estruturado com gancho inicial magnético, desenvolvimento, clímax e conclusão.",
    iconName: "FileText",
    estimatedSeconds: 10,
  },
  {
    stage: 3,
    name: "Curadoria de Mídia",
    shortDesc: "Busca inteligente de clipes 4K e imagens de arquivo",
    detailedDesc: "Curadoria automática de imagens e clipes de vídeo em alta definição para cada cena do roteiro.",
    iconName: "Film",
    estimatedSeconds: 14,
  },
  {
    stage: 4,
    name: "Narração Hiper-realista",
    shortDesc: "Síntese de voz com cadência e respiração natural",
    detailedDesc: "Geração da narração com modelos neurais de última geração com entonação documental e suspense.",
    iconName: "Mic",
    estimatedSeconds: 12,
  },
  {
    stage: 5,
    name: "Legendas Sincronizadas",
    shortDesc: "Alinhamento palavra por palavra em tempo real",
    detailedDesc: "Sincronização de legendas palavra por palavra com animações de destaque dinâmico estilo Dark Channels.",
    iconName: "Type",
    estimatedSeconds: 8,
  },
  {
    stage: 6,
    name: "Movimento Cinematográfico",
    shortDesc: "Efeitos Ken Burns, Parallax 2.5D e zoom dramático",
    detailedDesc: "Aplicação de movimento cinematográfico com profundidade, Parallax 2.5D e transições rítmicas.",
    iconName: "Camera",
    estimatedSeconds: 15,
  },
  {
    stage: 7,
    name: "Mixagem & SFX com Ducking",
    shortDesc: "Trilha sonora imersiva e efeitos sonoros sincronizados",
    detailedDesc: "Mixagem automática de trilha sonora orquestral/tensa e efeitos sonoros (SFX) com ducking inteligente.",
    iconName: "Volume2",
    estimatedSeconds: 10,
  },
  {
    stage: 8,
    name: "Renderização Final 1080p",
    shortDesc: "Exportação em MP4 60fps 16:9 ultra-nítido",
    detailedDesc: "Renderização final acelerada por GPU em MP4 Full HD (1080p 16:9) pronto para publicação.",
    iconName: "Sparkles",
    estimatedSeconds: 18,
  },
];

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "pt-br-marcos-deep",
    name: "Marcos (Voz Documental Sombria)",
    gender: "male",
    language: "PT_BR",
    tag: "Mais Usada",
    previewUrl: "https://actions.google.com/sounds/v1/science_fiction/deep_hum.ogg",
    description: "Grave, misteriosa e envolvente. Perfeita para mistérios, história sombria e Top 10.",
  },
  {
    id: "pt-br-helena-epic",
    name: "Helena (Narradora Épica)",
    gender: "female",
    language: "PT_BR",
    tag: "Alta Clareza",
    previewUrl: "https://actions.google.com/sounds/v1/science_fiction/alien_hum.ogg",
    description: "Voz firme, cinematográfica e autoritária. Ideal para ciência, geopolítica e biografias.",
  },
  {
    id: "pt-br-gabriel-suspense",
    name: "Gabriel (Suspense & Crime)",
    gender: "male",
    language: "PT_BR",
    tag: "Dark YouTube",
    previewUrl: "https://actions.google.com/sounds/v1/science_fiction/sub_bass_loop.ogg",
    description: "Cadência cadenciada com pausas dramáticas. O padrão ouro de canais de conspirações.",
  },
  {
    id: "en-us-james-documentary",
    name: "James (American Classic Doc)",
    gender: "male",
    language: "EN",
    tag: "Top US Channels",
    previewUrl: "https://actions.google.com/sounds/v1/science_fiction/deep_hum.ogg",
    description: "Deep baritone narration reminiscent of history and survival channel documentaries.",
  },
  {
    id: "es-la-carlos-historia",
    name: "Carlos (Narración Cinematográfica)",
    gender: "male",
    language: "ES",
    tag: "Latam Dark",
    previewUrl: "https://actions.google.com/sounds/v1/science_fiction/deep_hum.ogg",
    description: "Tono serio, atrapante y documental para canales de misterios en español.",
  },
];

export const PRICING_PLANS: PlanPricing[] = [
  {
    id: "STARTER",
    name: "Starter",
    monthlyPrice: 197,
    annualMonthlyPrice: 177.30, // 10% off
    minutesPerMonth: 91,
    concurrentRenders: 1,
    extraMinuteRate: 2.80,
    popular: false,
    priorityQueue: false,
    features: [
      "91 minutos de vídeo por mês (~9 a 11 vídeos)",
      "1 renderização simultânea",
      "Minuto extra: R$ 2,80",
      "Resolução Full HD 1080p 16:9",
      "Vozes neurais ultra-realistas",
      "Publicação no YouTube em 1 clique",
      "Suporte padrão via e-mail",
    ],
  },
  {
    id: "CREATOR",
    name: "Creator",
    monthlyPrice: 397,
    annualMonthlyPrice: 357.30, // 10% off
    minutesPerMonth: 195,
    concurrentRenders: 1,
    extraMinuteRate: 2.40,
    popular: true,
    priorityQueue: false,
    features: [
      "195 minutos de vídeo por mês (~20 a 24 vídeos)",
      "1 renderização simultânea",
      "Minuto extra com desconto: R$ 2,40",
      "Acesso completo ao Pipeline de 8 etapas",
      "Efeito Ken Burns e Parallax 2.5D",
      "Exportação direta de legendas (.SRT)",
      "Capítulos automáticos do YouTube",
      "Suporte prioritário via WhatsApp",
    ],
  },
  {
    id: "STUDIO",
    name: "Studio",
    monthlyPrice: 797,
    annualMonthlyPrice: 717.30, // 10% off
    minutesPerMonth: 416,
    concurrentRenders: 2,
    extraMinuteRate: 2.00,
    popular: false,
    priorityQueue: true,
    features: [
      "416 minutos de vídeo por mês (~40 a 50 vídeos)",
      "2 renderizações simultâneas",
      "Minuto extra a apenas R$ 2,00",
      "Renderização em fila prioritária",
      "Múltiplos canais do YouTube integrados",
      "Upload de voz personalizada (Voice Clone)",
      "Remoção de marca d'água em 100% dos vídeos",
      "Gerente de conta dedicado",
    ],
  },
  {
    id: "SCALE",
    name: "Scale",
    monthlyPrice: 1497,
    annualMonthlyPrice: 1347.30, // 10% off
    minutesPerMonth: 845,
    concurrentRenders: 3,
    extraMinuteRate: 1.90,
    popular: false,
    priorityQueue: true,
    features: [
      "845 minutos de vídeo por mês (~85 a 100 vídeos)",
      "3 renderizações simultâneas",
      "Minuto extra mais barato: R$ 1,90",
      "Fila Ultra-Prioritária Dedicada",
      "Acesso à API para automação total",
      "Geração em lote (Bulk Generation)",
      "Acesso antecipado a novos modelos de IA",
      "Atendimento VIP 24/7 com SLA de 1 hora",
    ],
  },
];

export const SHOWCASE_VIDEOS = [
  {
    title: "O Mistério Inexplicável do Voo MH370",
    category: "Mistério & Conspiração",
    duration: "12:45",
    views: "1.4M views",
    thumbnail: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop",
    tags: ["Documentário", "Top 10 Fatos"],
  },
  {
    title: "A Civilização Perdida sob a Antártida",
    category: "História Oculta",
    duration: "14:18",
    views: "890k views",
    thumbnail: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=800&auto=format&fit=crop",
    tags: ["Parallax 2.5D", "Voz Sombria"],
  },
  {
    title: "As 10 Armas Secretas da Segunda Guerra",
    category: "Militar & Geopolítica",
    duration: "09:32",
    views: "2.1M views",
    thumbnail: "https://images.unsplash.com/photo-1579965342575-16428a7c8881?q=80&w=800&auto=format&fit=crop",
    tags: ["Top 10 Ranking", "Efeitos SFX"],
  },
  {
    title: "O Que Acontecerá Quando o Sol Morrer?",
    category: "Ciência & Astronomia",
    duration: "11:05",
    views: "640k views",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    tags: ["Ciência", "Ken Burns 4K"],
  },
  {
    title: "Criaturas Abissais Que Jamais Deveriam Existir",
    category: "Natureza & Oceano",
    duration: "10:15",
    views: "1.8M views",
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
    tags: ["Natureza", "Ducking de Áudio"],
  },
  {
    title: "A Ascensão Silenciosa da Computação Quântica",
    category: "Tecnologia & Futuro",
    duration: "08:50",
    views: "420k views",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    tags: ["Tecnologia", "YouTube 1-Click"],
  },
];

export const FAQ_ITEMS = [
  {
    question: "Como o LoopX cria vídeos documentais completos em poucos minutos?",
    answer: "O LoopX orquestra um pipeline sequencial de 8 etapas autônomas: ele pesquisa fatos históricos confiáveis, escreve um roteiro com retenção psicológica máxima (gancho, desenvolvimento, clímax), seleciona mídias HD/4K correspondentes, gera narração neural de alta profundidade com cadência cinematográfica, sincroniza legendas palavra por palavra, aplica efeitos de movimento (Ken Burns e Parallax 2.5D) e mixa a trilha sonora com ducking inteligente antes de renderizar em 1080p."
  },
  {
    question: "Os vídeos gerados são monetizáveis pelo YouTube?",
    answer: "Sim, 100%! Diferente de ferramentas genéricas de 'slideshow', os vídeos do LoopX são roteiros originais apurados, com narrativa envolvente, uso de mídias licenciadas (royalty-free) e mixagem de áudio profissional que cumprem integralmente as diretrizes de conteúdo do YouTube para monetização no Programa de Parcerias."
  },
  {
    question: "Posso trocar mídias ou editar o roteiro antes de renderizar?",
    answer: "Com certeza. No Estúdio de Criação, após a geração automática, você conta com um editor de Storyboard visual onde pode alterar qualquer imagem ou clipe com 1 clique, refinar trechos do roteiro ou mudar o efeito de câmera de cada cena individual sem precisar recomeçar o projeto."
  },
  {
    question: "Como funciona a publicação em 1 clique no YouTube?",
    answer: "Basta conectar seu canal através da autenticação segura da YouTube Data API. O LoopX gera automaticamente o título otimizado para CTR, a descrição com palavras-chave de SEO e os capítulos com timestamps sincronizados com as cenas do vídeo, enviando o MP4 final direto para o seu canal como rascunho ou público."
  },
  {
    question: "O que acontece se meus minutos mensais acabarem?",
    answer: "Você pode continuar renderizando adquirindo pacotes de minutos avulsos com desconto ou fazendo upgrade de plano com saldo proporcional instantâneo. Seus projetos e rascunhos nunca são perdidos."
  },
  {
    question: "Qual a diferença entre renderizações simultâneas?",
    answer: "Com 1 renderização simultânea (planos Starter e Creator), seus vídeos são produzidos um após o outro na fila. Nos planos Studio (2 simultâneas) e Scale (3 simultâneas + fila prioritária), múltiplos vídeos de canais dark diferentes são processados ao mesmo tempo com prioridade em cluster dedicado de GPUs."
  },
];

export const INITIAL_DEMO_SCENES: SceneItem[] = [
  {
    id: "sc-1",
    sceneOrder: 1,
    narrationText: "Nas profundezas esquecidas do Oceano Pacífico, existe um ponto onde a luz solar nunca chegou nos últimos 4 bilhões de anos.",
    mediaUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    mediaType: "IMAGE",
    motionEffect: "KEN_BURNS_ZOOM_IN",
    durationSeconds: 6.8,
    keywords: ["oceano profundo", "abismo", "mistério submarino"],
    subtitles: [
      { word: "Nas", start: 0.0, end: 0.3 },
      { word: "profundezas", start: 0.3, end: 0.9 },
      { word: "esquecidas", start: 0.9, end: 1.5 },
      { word: "do", start: 1.5, end: 1.7 },
      { word: "Oceano", start: 1.7, end: 2.2 },
      { word: "Pacífico,", start: 2.2, end: 2.8 },
      { word: "a", start: 2.8, end: 3.0 },
      { word: "escuridão", start: 3.0, end: 3.6 },
      { word: "é", start: 3.6, end: 3.8 },
      { word: "absoluta.", start: 3.8, end: 4.5 },
    ]
  },
  {
    id: "sc-2",
    sceneOrder: 2,
    narrationText: "Em 1997, hidrofones militares registraram um ruído colossal de frequência ultra-baixa que viajou por mais de 5.000 quilômetros.",
    mediaUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1200&auto=format&fit=crop",
    mediaType: "IMAGE",
    motionEffect: "PARALLAX_25D",
    durationSeconds: 7.2,
    keywords: ["bloop", "radar militar", "sinal misterioso"],
    subtitles: [
      { word: "Em", start: 0.0, end: 0.3 },
      { word: "1997,", start: 0.3, end: 0.8 },
      { word: "hidrofones", start: 0.8, end: 1.5 },
      { word: "militares", start: 1.5, end: 2.1 },
      { word: "detectaram", start: 2.1, end: 2.8 },
      { word: "um", start: 2.8, end: 3.0 },
      { word: "ruído", start: 3.0, end: 3.5 },
      { word: "colossal...", start: 3.5, end: 4.4 },
    ]
  },
  {
    id: "sc-3",
    sceneOrder: 3,
    narrationText: "Nem mesmo a maior baleia-azul conhecida poderia emitir tamanha potência acústica. Algo vivo estava nas profundezas.",
    mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
    mediaType: "IMAGE",
    motionEffect: "KEN_BURNS_PAN_RIGHT",
    durationSeconds: 8.0,
    keywords: ["criatura marinha", "monstro abissal", "biologia desconhecida"],
    subtitles: [
      { word: "Nem", start: 0.0, end: 0.3 },
      { word: "mesmo", start: 0.3, end: 0.6 },
      { word: "a", start: 0.6, end: 0.7 },
      { word: "maior", start: 0.7, end: 1.1 },
      { word: "baleia-azul", start: 1.1, end: 1.8 },
      { word: "poderia", start: 1.8, end: 2.3 },
      { word: "produzir", start: 2.3, end: 2.8 },
      { word: "tal", start: 2.8, end: 3.1 },
      { word: "som.", start: 3.1, end: 3.7 },
    ]
  },
  {
    id: "sc-4",
    sceneOrder: 4,
    narrationText: "Bem-vindo aos 5 segredos mais aterrorizantes que a ciência oficial ainda não conseguiu explicar.",
    mediaUrl: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1200&auto=format&fit=crop",
    mediaType: "IMAGE",
    motionEffect: "KEN_BURNS_ZOOM_OUT",
    durationSeconds: 6.5,
    keywords: ["segredos da ciência", "ranking", "abismo inexplorado"],
    subtitles: [
      { word: "Bem-vindo", start: 0.0, end: 0.5 },
      { word: "aos", start: 0.5, end: 0.7 },
      { word: "segredos", start: 0.7, end: 1.2 },
      { word: "mais", start: 1.2, end: 1.5 },
      { word: "aterrorizantes", start: 1.5, end: 2.4 },
      { word: "do", start: 2.4, end: 2.6 },
      { word: "nosso", start: 2.6, end: 2.9 },
      { word: "planeta.", start: 2.9, end: 3.6 },
    ]
  }
];
