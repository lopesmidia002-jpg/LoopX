# DOCUMENTAÇÃO TÉCNICA — LOOPX

## 1. Introdução
O **LoopX** é um sistema web SaaS voltado para a criação automatizada e em escala de vídeos cinematográficos para canais dark do YouTube (documentários históricos, mistérios, teorias da conspiração, ciência e listas "Top 10").

A arquitetura do sistema foi projetada para orquestrar um pipeline sequencial de 8 etapas assíncronas através de contêineres Docker independentes para a aplicação Next.js, banco relacional PostgreSQL e mensageria/filas com Redis.

---

## 2. Arquitetura do Sistema e Topologia Docker

```
                   +---------------------------------------------+
                   |                CLIENTE / WEB                |
                   |       (Landing Page & Estúdio /studio)      |
                   +---------------------------------------------+
                                          |
                                          | HTTP / API Routes
                                          v
+---------------------------------------------------------------------------------+
|                               DOCKER COMPOSE                                    |
|                                                                                 |
|  +---------------------------+   Prisma ORM    +-----------------------------+  |
|  |         loopx-app         | --------------->|        loopx-postgres       |  |
|  |   (Next.js 14 App Router) |                 |       (PostgreSQL 16)       |  |
|  |         Porta: 3000       |                 |         Porta: 5432         |  |
|  +---------------------------+                 +-----------------------------+  |
|               |                                                                 |
|               | Filas / Jobs (BullMQ)                                           |
|               v                                                                 |
|  +---------------------------+                                                  |
|  |        loopx-redis        |                                                  |
|  |          (Redis 7)        |                                                  |
|  |         Porta: 6379       |                                                  |
|  +---------------------------+                                                  |
|               |                                                                 |
|               v                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |                    PIPELINE DE PROCESSAMENTO DE VÍDEO                     |  |
|  |  1. Pesquisa -> 2. Roteiro -> 3. Curadoria -> 4. Narração TTS             |  |
|  |  5. Legendas -> 6. Movimento -> 7. Mixagem SFX -> 8. Renderização MP4    |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
```

---

## 3. Estrutura de Pastas do Projeto

```
loopx/
├── README.md                    # Documentação principal e guia rápido do projeto
├── .gitignore                   # Regras de exclusão do Git (node_modules, .env, builds)
├── Dockerfile                   # Build e containerização da aplicação Next.js com FFmpeg
├── docker-compose.yml           # Orquestração do app, postgres e redis
├── .dockerignore                # Arquivos ignorados no contexto Docker
├── .env.example                 # Exemplo documentado das variáveis de ambiente
├── .env                         # Variáveis ativas de ambiente
├── package.json                 # Dependências e scripts do projeto (name: loopx)
├── tsconfig.json                # Configurações do TypeScript com alias @/*
├── tailwind.config.ts           # Design tokens e tema Dark Cinematográfico
├── postcss.config.mjs           # Processador de estilos
├── next.config.mjs              # Configurações do Next.js
├── prisma/
│   └── schema.prisma            # Modelagem do banco de dados relacional
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Layout raiz com barra de progresso e grid radial
│   │   ├── globals.css          # Estilos globais, aurora glow e animações
│   │   ├── page.tsx             # Landing Page de alta conversão
│   │   ├── studio/
│   │   │   └── page.tsx         # Interface do Estúdio de Criação de Vídeos
│   │   └── api/
│   │       ├── auth/
│   │       │   └── me/route.ts       # Perfil do usuário logado e subscrição
│   │       ├── billing/
│   │       │   └── credits/route.ts  # Consulta e recarga de minutos avulsos
│   │       ├── pipeline/
│   │       │   ├── curate/route.ts   # Curadoria de mídias Pexels/Unsplash/Vault
│   │       │   ├── tts/route.ts      # Síntese de voz neural realista
│   │       │   └── subtitles/route.ts# Sincronização palavra por palavra e .SRT
│   │       ├── projects/route.ts     # Endpoints para criação e consulta de projetos
│   │       ├── render/
│   │       │   ├── route.ts          # Disparo e verificação de jobs
│   │       │   └── queue/route.ts    # Fila de concorrência e prioridade no Redis
│   │       ├── script/generate/route.ts # Geração de pesquisa e roteiro estruturado
│   │       └── youtube/
│   │           └── publish/route.ts  # Publicação direta no YouTube com metadados
│   ├── components/
│   │   ├── landing/             # Componentes modulares da Landing Page
│   │   │   ├── TopBanner.tsx    # Banner fixo de escassez
│   │   │   ├── Navbar.tsx       # Barra de navegação e branding LoopX
│   │   │   ├── Hero.tsx         # Seção principal com mockup animado
│   │   │   ├── Marquee.tsx      # Faixa contínua com diamantes
│   │   │   ├── HowItWorks.tsx   # Os 3 passos explicativos
│   │   │   ├── RealtimePipeline.tsx # Pipeline de 8 etapas animado
│   │   │   ├── BentoGrid.tsx    # Recursos técnicos assimétricos
│   │   │   ├── Showcase.tsx     # Grade de vídeos 16:9 com Ken Burns
│   │   │   ├── ValueComparison.tsx # LoopX vs Editor Tradicional
│   │   │   ├── Pricing.tsx      # Tabela de planos e minutos
│   │   │   ├── FAQ.tsx          # Acordeão de perguntas frequentes
│   │   │   └── Footer.tsx       # Rodapé institucional LoopX
│   │   └── studio/              # Componentes do Estúdio de Criação
│   │       ├── StudioHeader.tsx # Indicadores de minutos e status de fila
│   │       ├── ProjectConfig.tsx# Configurações de tema, voz e duração
│   │       ├── PipelineStatus.tsx# Visualizador em tempo real das 8 etapas
│   │       ├── StoryboardEditor.tsx # Grade de edição e troca de cenas com busca
│   │       └── VideoPreviewModal.tsx# Player final, exportação de .SRT e YouTube
│   └── lib/
│       ├── ai/
│       │   ├── prompts.ts       # Engenharia de prompts para canais Dark
│       │   ├── researcher.ts    # Motor de pesquisa factual e apuração
│       │   └── scriptwriter.ts  # Gerador de roteiro cinematográfico (4 atos e cenas)
│       ├── auth/
│       │   └── clerk-config.ts  # Tema Dark Mode cinematográfico para Clerk e auth helper
│       ├── billing/
│       │   └── credits-manager.ts # Gestão de minutos, concorrência e compra avulsa
│       ├── pipeline/
│       │   ├── media-curator.ts # Integração com Pixabay API e Acervo Vault
│       │   ├── tts-engine.ts    # Síntese neural (ElevenLabs / OpenAI / Fallback)
│       │   └── subtitles-sync.ts# Algoritmo de sincronização e formatador .SRT
│       ├── render/
│       │   ├── motion-effects.ts# Filtros FFmpeg para Ken Burns e Parallax 2.5D
│       │   ├── audio-mixer.ts   # Mixagem estéreo com sidechain compress (ducking)
│       │   ├── queue.ts         # Fila assíncrona, concorrência e prioridade
│       │   └── video-renderer.ts# Construtor do comando final de exportação MP4
│       ├── youtube/
│       │   └── publisher.ts     # Upload na YouTube Data API com capítulos e SEO
│       ├── types.ts             # Definições de tipos TypeScript
│       ├── constants.ts         # Planos, vozes, etapas e templates
│       ├── utils.ts             # Funções utilitárias (cn, formatações)
│       └── prisma.ts            # Singleton do cliente Prisma
├── CONTEXTO.md                  # Contexto estratégico e regras de negócio
├── PASSOS.md                    # Roadmap de passos e controle de avanço
└── DOCUMENTACAO.md              # Esta documentação técnica
```

---

## 4. Módulos de Renderização e Vídeo (Passo 5)

### 4.1. Movimento Cinematográfico (`motion-effects.ts`)
- Filtros nativos do FFmpeg (`zoompan`, `scale`, `pad`, `setsar`) para geração de movimento contínuo:
  - **Ken Burns Zoom In:** aproximação suave de 1.0x para 1.18x focada no centro dramático.
  - **Ken Burns Zoom Out:** recuo suave de 1.18x para 1.0x revelando contexto.
  - **Panorâmica Lateral:** deslocamento sutil de câmera (esquerda e direita).
  - **Parallax 2.5D:** combinação de zoom progressivo e micro-shake senoidal (`sin(on/8)*4`) simulando profundidade e câmera na mão.

### 4.2. Mixagem com Auto-Ducking (`audio-mixer.ts`)
- Grafo de filtros FFmpeg com compressão sidechain (`sidechaincompress=threshold=0.08:ratio=5:attack=150:release=450`):
  - Atenuação automática da música de fundo em -14dB enquanto a narração está ativa.
  - Retorno suave do volume musical nos intervalos de silêncio e nas transições de cena.
  - Presets de trilha sonora orquestral e efeitos sonoros sincronizados (whoosh, batida cardíaca, sub-bass).

### 4.3. Gerenciador de Filas e Concorrência (`queue.ts` & `/api/render/queue`)
- Controle de limites simultâneos por plano de assinatura:
  - Starter & Creator: 1 renderização concorrente.
  - Studio: 2 renderizações concorrentes.
  - Scale: 3 renderizações concorrentes + fila de prioridade máxima.
- Acompanhamento do progresso de 0 a 100% com logs dinâmicos e persistência no PostgreSQL através da tabela `RenderJob`.

---

## 5. Módulos de Autenticação, Faturamento e YouTube (Passo 6)

### 5.1. Autenticação e Tema Dark Mode (`clerk-config.ts` & `/api/auth/me`)
- Configuração de aparência Dark Cinematográfica do Clerk adaptada ao design system:
  - Cores escuras de superfície (`#161b24`, `#1d232e`), bordas sutis (`#2a3342`) e botões com gradientes indigo/violeta (`#6366f1`).
  - Helper `getCurrentUser()` com fallback automático para ambiente de desenvolvimento conteinerizado (criação automática ou recuperação de usuário de demonstração no PostgreSQL).
  - Rota de API `GET /api/auth/me` para fornecimento do perfil completo e dados da subscrição.

### 5.2. Gestão de Créditos de Minutos e Faturamento (`credits-manager.ts` & `/api/billing/credits`)
- **Saldo e Débito de Minutos:**
  - Checagem prévia de saldo antes de iniciar jobs de renderização longa (8 a 15+ min).
  - Dedução dinâmica de minutos consumidos e registro de histórico na tabela `CreditTransaction`.
- **Limites de Concorrência por Plano:**
  - Validação de renderizações simultâneas ativas antes de liberar um novo job na fila.
- **Compra de Minutos Avulsos:**
  - Aplicação dos preços diferenciados por plano (Starter: R$ 2,80/min, Creator: R$ 2,40/min, Studio: R$ 2,00/min, Scale: R$ 1,90/min).
  - Rota de API `POST /api/billing/credits` com suporte a recarga instantânea de pacotes (+30 min, +60 min, +120 min) integrada ao modal do estúdio.

### 5.3. Publicador Automático no YouTube (`publisher.ts` & `/api/youtube/publish`)
- **Geração Inteligente de Metadados:**
  - Montagem de descrição otimizada para SEO de canais Dark do YouTube.
  - Cálculo automático de timestamps por cena para criação dos Capítulos de Vídeo (ex: `00:00 - Introdução`, `01:15 - O Mistério`, etc.).
  - Inserção de tags estratégicas para algoritmo de recomendação do YouTube.
- **Integração OAuth 2.0 / YouTube Data API v3:**
  - Suporte ao upload com token OAuth ou geração de link e metadados diretos em modo Sandbox.
  - Retorno imediato do ID do vídeo, link curto (`https://youtu.be/...`) e embed para visualização no modal de prévia.

---

## 6. Módulos de Checkout, Webhook e Testes E2E (Passo 7)

### 6.1. Checkout e Pix Instantâneo (`checkout.ts` & `/api/billing/checkout`)
- Suporte a geração de sessões de checkout para planos mensais e anuais (com 10% de desconto à vista).
- Geração automática de Payload Pix Copia e Cola compatível com o padrão EMV do Banco Central e QR Code visual em SVG/PNG.
- Modal interativo na Landing Page (`Pricing.tsx`) permitindo testar fluxos de pagamento diretamente pelo navegador.

### 6.2. Webhook de Confirmação (`/api/billing/webhook`)
- Processamento assíncrono de notificações de pagamento aprovado.
- Atualização em tempo real da tabela `Subscription` (alteração de tier, limites de concorrência e período de vigência).
- Inserção de registro auditável na tabela `CreditTransaction` (`PLAN_RENEWAL` ou `EXTRA_MINUTES_PURCHASE`).

### 6.3. Monitoramento de Saúde da Infraestrutura (`/api/health`)
- Verificação da conectividade com o banco PostgreSQL 16 via queries ativas no Prisma.
- Checagem do binário e versão do FFmpeg 8.0.1 instalado no contêiner da aplicação.
- Monitoramento de status do Redis 7, uptime e consumo de memória RAM do processo Node.

### 6.4. Suite de Testes E2E Automatizados (`scripts/test-e2e.mjs`)
- Executado 100% dentro do Docker com o comando:
  ```bash
  docker compose exec -T app npm run test:e2e
  ```
- 17 etapas de validação contínua (17/17 com 100% de sucesso):
  1. Health Check (PostgreSQL, Redis, FFmpeg)
  2. Autenticação & Subscrição (`/api/auth/me`)
  3. IA de Pesquisa e Roteiro (`/api/script/generate`)
  4. Curadoria de Mídias 4K (`/api/pipeline/curate`)
  5. Síntese de Narração Neural (`/api/pipeline/tts`)
  6. Sincronização de Legendas & Exportação `.SRT` (`/api/pipeline/subtitles`)
  7. Fila de Renderização FFmpeg (`/api/render/queue`)
  8. Geração de Checkout & QR Code Pix (`/api/billing/checkout`)
  9. Webhook de Confirmação & Saldo (`/api/billing/webhook`)
  10. Publicação Direta no YouTube (`/api/youtube/publish`)
  11. Métricas do Canal Dark & Analytics (`/api/youtube/analytics`)
  12. Múltiplos Canais Dark & Chaves BYOK (`/api/youtube/channels`)
  13. Agendamento Automático de Vídeos & Grade Semanal (`/api/youtube/schedule`)
  14. Landing Page Cinematográfica Liquid Glass em Português (`GET /`)
  15. Autenticação com E-mail e Senha (`/api/auth/login` e `/api/auth/logout`)
  16. Chaves de Produção & Status de Integrações (`/api/youtube/channels`)
  17. Sistema de Testes A/B de Miniaturas e Títulos (`/api/youtube/ab-tests`)

---

## 7. Módulo de Analytics e Métricas do Canal Dark (Passo 8)

### 7.1. Motor de Inteligência Analítica (`analytics.ts` & `/api/youtube/analytics`)
- **Curva de Retenção de Audiência:**
  - Análise dos momentos-chave do vídeo (Gancho Inicial 0-30s com 78.4% de retenção, Ato 1 Mistério, Ato 2 Fatos Inéditos, Ato 3 Clímax e Conclusão com CTA).
  - Identificação de impactos visuais do efeito Ken Burns e auto-ducking da trilha sobre a retenção.
- **Métricas Globais do Canal:**
  - Visualizações totais acumuladas (ex: 1.96M nos últimos 30 dias).
  - Tempo de exibição em horas (Watch Time), taxa média de cliques (CTR 12.35%) e receita estimada baseada em RPM de canais Dark (R$ 15,00/mil).
  - Recomendações personalizadas geradas pela IA LoopX para aprimoramento contínuo dos próximos vídeos.

### 7.2. Interface do Dashboard (`AnalyticsDashboard.tsx`)
- Integrado diretamente ao Estúdio de Criação (`/studio`) através de um seletor no cabeçalho.
- Cards estatísticos com indicadores de tendência (+28.4% views, +35.4% receita).
- Grade interativa da biblioteca de vídeos com thumbnails 16:9, formatos e links diretos para o YouTube.

---

## 8. Gerenciador de Múltiplos Canais Dark & Chaves de Produção (Passo 9)

### 8.1. Motor de Rede de Canais (`channel-manager.ts` & `/api/youtube/channels`)
- Suporte a múltiplos canais dark no mesmo painel (ex: Mistérios, Natureza Abissal, Cosmos).
- Alternância rápida com sincronização imediata de nicho, estilo de narração e metadados de publicação.
- Modal de criação de novos canais por nicho temático (`ChannelSelector.tsx`).

### 8.2. Integrações de Produção & BYOK (`ApiSettingsModal.tsx`)
- Status em tempo real das 4 APIs externas essenciais:
  1. OpenAI GPT-4o (Roteirização & Pesquisa Factual)
  2. Google AI Studio (Narração Neural Hiper-realista Gemini 2.0 Audio)
  3. Unsplash API (Acervo 4K de Imagens Cinematográficas com Pixabay Fallback)
  4. YouTube Data API v3 (Publicação Automática)
- Suporte ao modelo **BYOK (Bring Your Own Key)** com armazenamento seguro no contêiner e máscara de visualização.
- Inserção e propagação de chaves reais de produção de terceiros no `.env` e `docker-compose.yml`:
  - `CLERK_SECRET_KEY` & `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Provedor de autenticação e identidade.
  - `OPENAI_API_KEY`: Motor GPT-4o para pesquisa e roteiro dramático.
  - `GOOGLE_AI_STUDIO_API_KEY` & `GEMINI_API_KEY`: Narração neural hiper-realista e modelos multimodais de voz Gemini.
  - `YOUTUBE_CLIENT_ID` & `YOUTUBE_CLIENT_SECRET`: Publicação direta via OAuth 2.0.
  - `UNSPLASH_ACCESS_KEY` & `PIXABAY_API_KEY`: Curadoria de acervos 4K de imagens cinematográficas e vídeos.
  - Template documentado mantido em `.env.example`.

---

## 9. Auditoria de Código, Permissões e Resolução de Erros (Passo 10)

### 9.1. Permissões de Execução no Contêiner
- Ajuste no `Dockerfile` com `RUN chown -R nextjs:nodejs /app`, garantindo que o processo Node sob usuário restrito consiga operar sem erros de `EACCES: permission denied`.
- Transferência explícita do contexto de fontes (`src/`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `next-env.d.ts`, `.eslintrc.json`) para a imagem de produção `runner`.

### 9.2. Normalização e Resiliência de APIs
- Rota `/api/pipeline/curate`: suporte universal a payloads com `query` ou `keywords`, e `mediaType` ou `preferredType`.
- Extensão do tipo `MediaType` em `types.ts` para abranger `"IMAGE" | "VIDEO" | "ALL"`.
- Correção no mapeamento de URLs de autores da Pixabay em `media-curator.ts` (`p.user_id` no escopo de fotos e `v.user_id` no escopo de vídeos).
- Ajuste na síntese de voz neural (`tts-engine.ts`) com utilização do parâmetro de idioma dinâmico (`targetLang`) no prompt do Google AI Studio (Gemini 2.0 Flash Audio).

### 9.3. Verificação Estática de Tipagem
- Checagem completa de tipos executada no contêiner com zero erros:
  ```bash
  docker compose exec -T app ./node_modules/.bin/tsc --project tsconfig.json --noEmit
  ```

---

## 10. Sistema de Agendamento Automático de Vídeos & Grade Semanal (Passo 11)

### 10.1. Motor de Agendamento (`scheduler.ts` & `/api/youtube/schedule`)
- Mapeamento analítico de slots da semana com score de retenção algorítmica para canais Dark (Terça 18:00 com 98% e Domingo 19:00 com 99%).
- Operações completas de agendamento de projetos, cancelamento e consulta de fila de postagens.

### 10.2. Modal Interativo de Calendário (`ScheduleCalendarModal.tsx`)
- Visualização dos 7 dias da semana com destaque nos dias de pico.
- Formulário de agendamento integrado com definição de visibilidade (Público, Não-Listado, Privado).
- Botões de acesso rápido integrados no [StudioHeader.tsx](file:///c:/Users/Nilto/OneDrive/Documentos/app%20de%20videos/Prompt/src/components/studio/StudioHeader.tsx) e no [VideoPreviewModal.tsx](file:///c:/Users/Nilto/OneDrive/Documentos/app%20de%20videos/Prompt/src/components/studio/VideoPreviewModal.tsx).

---

## 11. Landing Page Cinematográfica Liquid Glass & Vídeos em Loop (Passo 12)

### 11.1. Arquitetura Visual e Design System Liquid Glass
- **Fundo Puro Black (`bg-black`)**: Aplicação uniforme do fundo escuro em toda a extensão da Landing Page.
- **Tipografia Instrument Serif**: Importação via Google Fonts (`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');`) e mapeamento no Tailwind (`font-serif`).
- **Classe `.liquid-glass`**: Estilização com `backdrop-filter: blur(4px)`, `background-blend-mode: luminosity`, sombra interna e pseudo-elemento `::before` com borda em gradiente e `mask-composite: exclude`.

### 11.2. Componentes Estruturais da Nova Landing Page
1. **Hero Section (`LiquidHero.tsx`)**:
   - Container `min-h-screen relative overflow-hidden flex flex-col`.
   - Vídeo de fundo em tela cheia com transição suave via vanilla JavaScript (`requestAnimationFrame`) entre eventos `canplay`, `timeupdate <= 0.55s` e `ended` com crossfade limpo para preto.
   - Navbar com pílula flutuante em Liquid Glass, branding LoopX e links de navegação em português: **Sobre**, **Recursos**, **Visão**, **Planos** e atalho para o **Estúdio**.
   - Botões de autenticação no cabeçalho: **Cadastrar** e **Entrar** (com abertura de modal interativo).
   - Tipografia de destaque: `Crie vídeos dark que viralizam.` em Instrument Serif (`text-6xl a text-9xl`).
   - Formulário de newsletter em Liquid Glass com botão circular branco e seta direcional.
   - Botão de acesso ao pipeline e botão primário "Acessar Estúdio" com modal de login.
   - Rodapé da Hero com 3 ícones sociais (Instagram, Twitter, Comunidade Global) em Liquid Glass.
2. **About Section (`AboutSection.tsx`)**:
   - Detecção de visibilidade no viewport via `useInView` do Framer Motion.
   - Gradiente radial sutil e tipografia em Instrument Serif itálico com `text-white/60`: *"Roteiros hipnóticos para canais que criam, escalam e dominam a audiência."*
3. **Featured Video Section (`FeaturedVideoSection.tsx`)**:
   - Container `rounded-3xl` em proporção `aspect-video` com vídeo de alta resolução em streaming CloudFront.
   - Card flutuante Liquid Glass de "Nossa Abordagem" com botão interativo "Explorar Recursos".
4. **Philosophy / Innovation x Vision (`PhilosophySection.tsx`)**:
   - Título de impacto `Inovação x Visão` com divisor e grade assimétrica em duas colunas.
   - Coluna esquerda com vídeo `aspect-[4/3]` e coluna direita com blocos narrativos "Escolha seu nicho" e "Molde a sua audiência".
5. **Services / What We Do (`ServicesSection.tsx`)**:
   - Grade com dois cards Liquid Glass com vídeos interativos em hover-zoom (`group-hover:scale-105`), tags contextuais ("Estratégia" e "Produção"), ícones `ArrowUpRight` e descrição conceitual de pesquisa e renderização cinematográfica.
6. **Sistema de Autenticação com Login e Senha (`/api/auth/login` e `AuthModal.tsx`)**:
   - Modal em Liquid Glass com abas de "Entrar" e "Cadastrar", suporte a e-mail e senha, botão de preenchimento rápido de acesso demo (1-clique) e redirecionamento direto para `/studio`.
   - Página dedicada `/login` para acesso direto via URL.
   - Endpoints `/api/auth/login`, `/api/auth/logout` e persistência de sessão via cookies.
7. **Planos & Checkout Integrado (`Pricing.tsx` & `Footer.tsx`)**:
   - Seção de precificação com integração nativa ao ecossistema de checkout Pix instantâneo e Stripe, harmonizada com o tema escuro.

---

## 13. Integração Unsplash API & Google AI Studio (Gemini Voice)

### 13.1. Narração Neural com Google AI Studio (`tts-engine.ts`)
- Substituição do provedor ElevenLabs pela integração com **Google AI Studio** (modelos multimodais de voz Gemini 2.0 Flash Audio).
- Mapeamento das vozes personalizadas com os timbres prebuilt do Gemini:
  - `pt-br-marcos-deep` -> `Fenrir` (Barítono grave documental)
  - `pt-br-helena-epic` -> `Aoede` (Narradora feminina expressiva e cinematográfica)
  - `pt-br-gabriel-suspense` -> `Charon` (Tom misterioso de conspiração)
  - `en-us-james-documentary` -> `Fenrir`
  - `es-la-carlos-historia` -> `Puck`
- Variáveis `GOOGLE_AI_STUDIO_API_KEY` e `GEMINI_API_KEY` injetadas em `.env`, `.env.example` e `docker-compose.yml`.

### 13.2. Curadoria de Mídias com Unsplash API (`media-curator.ts`)
- Suporte principal à **Unsplash API** para busca e curadoria de fotografias cinematográficas 4K/Full HD.
- Variável `UNSPLASH_ACCESS_KEY` configurada no ambiente com fallback automático para Pixabay e LoopX Unsplash Vault (`images.unsplash.com`).
- Configuração de domínios remotos mantida em `next.config.mjs` (`images.unsplash.com`, `pixabay.com`, `cdn.pixabay.com`).

---

## 14. Sistema de Testes A/B Automatizados de Miniaturas & Títulos (`ab-testing.ts`)

### 14.1. Otimização de CTR para Canais Dark do YouTube
- **Variantes Competitivas (A / B / C):**
  - Criação de experimentos com múltiplos pares de miniatura 16:9 e títulos com ganchos narrativos direcionados (*Lacuna de Curiosidade*, *Revelação Chocante*, *Documento Militar Desclassificado*).
  - Cálculo em tempo real de métricas: Impressões, Cliques, Taxa de Cliques (CTR %) e Tempo Médio de Visualização.
- **Gerador de Variantes em 1-Clique com IA:**
  - Aplicação de fórmulas comprovadas de canais Dark para geração instantânea de 3 títulos de alto CTR e sugestões de sobreposições de miniatura (*CENSURADO*, *NÃO OLHE*, *CONFIDENCIAL*).
- **Eleição Automática de Vencedor:**
  - Cálculo de significância estatística (Confidence Score).
  - Aplicação em 1 clique da variante vencedora como miniatura e título definitivos no YouTube.

### 14.2. Rotas e Interface do Usuário
- Rota de API dedicada: `GET` e `POST` em `/api/youtube/ab-tests`.
- Modal interativo integrado: `ABTestingModal.tsx` acessível no cabeçalho do estúdio (`StudioHeader.tsx`) através do ícone `Split` e no modal de prévia de publicação (`VideoPreviewModal.tsx`).

---

## 15. Vinculação Ágil de Canais Dark & Responsividade do Modal (`ChannelSelector.tsx`)

### 15.1. Diagnóstico e Resolução de Usabilidade
- **Causa Raiz Anterior:**
  - O modal de vinculação de novo canal exigia obrigatoriamente tanto o `Nome do Canal` quanto o `Handle do YouTube`.
  - Em janelas de navegador com menor altura vertical ou nível de zoom elevado, o alinhamento da modal cortava a parte superior da caixa de diálogo para fora do campo de visão da tela, ocultando o campo "Nome do Canal".
  - Ao preencher somente o campo visível "Handle do YouTube" (`@Oobservador-rw2gq`) e clicar em "Vincular Canal", a validação silenciosa do formulário impedia a submissão sem exibir nenhum alerta ou retorno visual para o criador.
- **Melhorias Aplicadas:**
  - **Derivação Automática de Nome:** O campo "Nome do Canal" tornou-se opcional. Caso o usuário informe apenas o handle (ex: `@Oobservador-rw2gq`), o sistema extrai o nome automaticamente (`Oobservador-rw2gq`) no frontend e na rota de API `/api/youtube/channels`.
  - **Responsividade e Scroll Suave:** O container da modal foi reconfigurado com `fixed inset-0 overflow-y-auto p-4 flex min-h-full items-center justify-center` e `my-auto`, eliminando qualquer corte no cabeçalho ou botões em telas pequenas, notebooks e celulares.
  - **Feedback Visual de Status:** Adicionado componente de mensagem de erro/alerta visual dentro do formulário e validação reativa com indicador de carregamento (`Loader2`).

---

## 16. Segurança Git, Higienização de Segredos & Push Protection

### 16.1. Resolução do Bloqueio de Push (GH013)
- **Causa do Bloqueio pelo GitHub:**
  - O GitHub possui ativada a proteção de integridade **GitHub Push Protection / Secret Scanning**, que analisa commits e bloqueia pushes contendo chaves ativas ou identificadores de produção (OpenAI, Google Cloud, Clerk e YouTube OAuth).
  - O arquivo `.env` havia sido inadvertidamente indexado no histórico local antes de ser excluído via `.gitignore`.
  - O repositório remoto foi renomeado no GitHub de `Prompt.git` para `LoopX.git`.
- **Procedimento de Correção:**
  - O remote do Git foi atualizado para `https://github.com/lopesmidia002-jpg/LoopX.git`.
  - O arquivo `.env` foi totalmente desvinculado do rastreamento do Git (`git rm --cached .env`), garantindo que ele permaneça intacto no disco local para os contêineres Docker sem jamais ser enviado ao repositório público.
  - O arquivo `docker-compose.yml` foi higienizado, repassando as variáveis diretamente a partir do `.env` local (`${VAR}`) sem valores hardcoded de credenciais.

---

## 17. Arquitetura de Modais com React Portals (`createPortal`)

### 17.1. Diagnóstico do Aprisionamento por `backdrop-filter`
- **Causa Raiz:**
  - O cabeçalho do estúdio (`StudioHeader.tsx`) utiliza classes modernas de desfoque e fixação (`sticky top-0 z-40 bg-[#141923]/95 backdrop-blur-xl`).
  - Segundo a especificação W3C do CSS, qualquer elemento ancestral com a propriedade `backdrop-filter` ou `transform` torna-se automaticamente o **containing block** para todos os seus nós descendentes com `position: fixed`.
  - Desse modo, as modais filhas do cabeçalho (`ChannelSelector`, `ApiSettingsModal`, `ScheduleCalendarModal`, `ABTestingModal`, modal de recarga) não utilizavam o `window` (viewport real) como referência, ficando presas à altura de ~60px da barra de topo. O conteúdo principal da página (`<main>`) era renderizado por cima, ocultando o corpo e os botões da janela secundária.
- **Solução com React Portals:**
  - Todas as janelas modais da aplicação foram migradas para utilizar `createPortal(modalElement, document.body)`.
  - A renderização ocorre diretamente no nó raiz do `document.body` com `z-[9999]`, desacoplada de qualquer ancestral com estilos de desfoque ou z-index restrito.
  - Implementado estado reativo `mounted` via `useEffect` para prevenir incompatibilidades com SSR (Server-Side Rendering).
  - Centralização vertical perfeita com `my-auto`, espaçamento responsivo e rolagem independente (`overflow-y-auto min-h-screen`).

---

## 18. Como Executar via Docker

### Subir todos os serviços (App, PostgreSQL e Redis)
```bash
docker compose up -d
```

### Executar a Suite de Testes E2E no Docker
```bash
docker compose exec -T app npm run test:e2e
```

### Executar a Verificação Estática de Tipos TypeScript
```bash
docker compose exec -T app ./node_modules/.bin/tsc --project tsconfig.json --noEmit
```

### Verificar status dos contêineres
```bash
docker compose ps
```

### Visualizar logs da aplicação
```bash
docker compose logs -f app
```

Acesse a aplicação no navegador em: `http://localhost:3000`
Acesse o Estúdio de Criação em: `http://localhost:3000/studio`
Acesse o endpoint de saúde em: `http://localhost:3000/api/health`
Acesse as métricas do canal em: `http://localhost:3000/api/youtube/analytics`
Acesse os canais conectados em: `http://localhost:3000/api/youtube/channels`
Acesse as publicações agendadas em: `http://localhost:3000/api/youtube/schedule`
