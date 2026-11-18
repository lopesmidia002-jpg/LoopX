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
│       │   ├── media-curator.ts # Integração com Pexels/Unsplash e Acervo Vault
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
- 10 etapas de validação contínua (10/10 com 100% de sucesso):
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
- Status em tempo real das 5 APIs externas essenciais:
  1. OpenAI GPT-4o (Roteirização & Pesquisa Factual)
  2. ElevenLabs (Síntese de Voz Neural Realista)
  3. Pexels API (Acervo 4K de Imagens e Vídeos)
  4. Unsplash API (Mídias Cinematográficas)
  5. YouTube Data API v3 (Publicação Automática)
- Suporte ao modelo **BYOK (Bring Your Own Key)** com armazenamento seguro no contêiner e máscara de visualização.

---

## 9. Auditoria de Código, Permissões e Resolução de Erros (Passo 10)

### 9.1. Permissões de Execução no Contêiner
- Ajuste no `Dockerfile` com `RUN chown -R nextjs:nodejs /app`, garantindo que o processo Node sob usuário restrito consiga operar sem erros de `EACCES: permission denied`.
- Transferência explícita do contexto de fontes (`src/`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `next-env.d.ts`, `.eslintrc.json`) para a imagem de produção `runner`.

### 9.2. Normalização e Resiliência de APIs
- Rota `/api/pipeline/curate`: suporte universal a payloads com `query` ou `keywords`, e `mediaType` ou `preferredType`.
- Extensão do tipo `MediaType` em `types.ts` para abranger `"IMAGE" | "VIDEO" | "ALL"`.

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
   - Navbar com pílula flutuante em Liquid Glass, branding Asme/Globe e links de navegação.
   - Tipografia de destaque: `Know it then all.` em Instrument Serif (`text-7xl md:text-9xl`).
   - Formulário de newsletter em Liquid Glass com botão circular branco e seta direcional.
   - Botão de Manifesto e rodapé com 3 ícones sociais (Instagram, Twitter, Globe) em Liquid Glass.
2. **About Section (`AboutSection.tsx`)**:
   - Detecção de visibilidade no viewport via `useInView` do Framer Motion.
   - Gradiente radial sutil e tipografia em Instrument Serif itálico com `text-white/60`.
3. **Featured Video Section (`FeaturedVideoSection.tsx`)**:
   - Container `rounded-3xl` em proporção `aspect-video` com vídeo de alta resolução em streaming CloudFront.
   - Card flutuante Liquid Glass de "Our Approach" com botão interativo "Explore more" com microinterações no hover/tap.
4. **Philosophy / Innovation x Vision (`PhilosophySection.tsx`)**:
   - Título de impacto `Innovation x Vision` com divisor e grade assimétrica em duas colunas.
   - Coluna esquerda com vídeo `aspect-[4/3]` e coluna direita com blocos narrativos "Choose your space" e "Shape the future".
5. **Services / What We Do (`ServicesSection.tsx`)**:
   - Grade com dois cards Liquid Glass com vídeos interativos em hover-zoom (`group-hover:scale-105`), tags contextuais ("Strategy", "Craft"), ícones `ArrowUpRight` e descrição conceitual.
6. **Planos & Checkout Integrado (`Pricing.tsx` & `Footer.tsx`)**:
   - Seção de precificação com integração nativa ao ecossistema de checkout Pix instantâneo e Stripe, harmonizada com o tema escuro.

---

## 12. Como Executar via Docker

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
