# PASSOS DE IMPLEMENTAÇÃO — LOOPX

> **Regra do Projeto:** Só inicie o próximo passo quando o usuário solicitar explicitamente.

---

### [x] Passo 1: Setup do Ambiente Docker, Prisma Schema, Design System & Arquitetura Base
- [x] Configuração do `package.json` com Next.js 14, Tailwind CSS, Lucide Icons, Framer Motion e Prisma.
- [x] Configuração do TypeScript (`tsconfig.json`), PostCSS (`postcss.config.mjs`) e Tailwind (`tailwind.config.ts`) com o tema Dark Cinematográfico (`#161b24`, `#1d232e`, `#6366f1`, `#8B5CF6`).
- [x] Criação do ambiente Docker 100% conteinerizado (`Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.gitignore`, `.env.example`, `.env`) com serviços de App Next.js, PostgreSQL 16 e Redis 7.
- [x] Modelagem do banco de dados no Prisma (`prisma/schema.prisma`):
  - Modelos: `User`, `Subscription`, `Project`, `Scene`, `RenderJob`, `CreditTransaction`.
  - Enums: Planos, Ciclos de Faturamento, Formatos de Vídeo, Idiomas, Efeitos de Câmera (Ken Burns e Parallax 2.5D), Status do Pipeline de 8 etapas.
- [x] Implementação de utilitários e constantes centrais (`src/lib/types.ts`, `src/lib/constants.ts`, `src/lib/utils.ts`, `src/lib/prisma.ts`).
- [x] Criação do `DOCUMENTACAO.md`, `PASSOS.md` e `CONTEXTO.md`.

---

### [x] Passo 2: Construção Completa da Landing Page (`/`) e Interface do Estúdio (`/studio`)
- [x] Implementação da Landing Page completa de alta conversão:
  - [x] Top banner fixo de escassez com indicador pulsante (`TopBanner.tsx`).
  - [x] Navbar cinematográfica com navegação, tema Dark Mode e ações (`Navbar.tsx`).
  - [x] Hero Section de alto impacto com mockup animado, waveform sonoro interativo e contador de criadores (`Hero.tsx`).
  - [x] Marquee infinita de recursos com ícones de diamante (`Marquee.tsx`).
  - [x] Seção "Como Funciona" com 3 passos ilustrados (`HowItWorks.tsx`).
  - [x] Seção "Em Tempo Real" demonstrando as 8 etapas com prévia viva de cenas (`RealtimePipeline.tsx`).
  - [x] Bento Grid de diferenciais técnicos assimétricos (Ken Burns, Parallax 2.5D, Vozes neurais, Roteiro, SFX Ducking, YouTube) (`BentoGrid.tsx`).
  - [x] Mostruário (Showcase) com grade 3x2 de thumbnails 16:9, efeito Ken Burns no hover e modal de play (`Showcase.tsx`).
  - [x] Comparativo de Valor: Editor tradicional vs LoopX (`ValueComparison.tsx`).
  - [x] Tabela de Preços com os 4 planos (Starter, Creator em destaque, Studio, Scale) + toggle Mensal/Anual (10% off) + compra de minutos avulsos (`Pricing.tsx`).
  - [x] FAQ interativo em acordeão e CTA final com Footer completo (`FAQ.tsx`, `Footer.tsx`).
  - [x] Conexão e integração de todos os componentes na página raiz `src/app/page.tsx`.
- [x] Implementação do Estúdio de Criação (`/studio`):
  - [x] Header do Estúdio com saldo de minutos restantes (184.5 min), contador de renderizações simultâneas (1/1 ativo) e botão de Novo Projeto (`StudioHeader.tsx`).
  - [x] Painel de configuração: input de ideia/roteiro com sugestões, seletor de formato (Documentário / Top 10), idioma (PT-BR, EN, ES) com preview de voz realista, duração alvo (8-15 min) (`ProjectConfig.tsx`).
  - [x] Pipeline visual de 8 etapas em tempo real com barra de porcentagem (0-100%), logs de GPU e prévia em grade das cenas (`PipelineStatus.tsx`).
  - [x] Editor de Storyboard pós-geração com visualização em grade, troca de mídia com 1 clique, edição de narração e efeitos de movimento (`StoryboardEditor.tsx`).
  - [x] Player de visualização em 1080p, download de MP4 e modal de publicação em 1 clique no YouTube com título, descrição de SEO e capítulos por timestamp (`VideoPreviewModal.tsx`).
  - [x] Orquestração do ciclo completo no master page `src/app/studio/page.tsx`.

---

### [x] Passo 3: Motor de IA para Pesquisa de Fatos e Roteirização Estruturada
- [x] Integração com motor de pesquisa automática para apuração de fatos históricos/curiosidades (Etapa 1) (`src/lib/ai/researcher.ts`).
- [x] Geração de roteiro estruturado com arco dramático cinematográfico (gancho, desenvolvimento, clímax e desfecho) e divisão em cenas numeradas (Etapa 2) (`src/lib/ai/scriptwriter.ts`).
- [x] Geração automática de palavras-chave visuais e descrições para curadoria de mídias por cena.
- [x] Rota de API `/api/script/generate` conectada ao estúdio e persistência no PostgreSQL via Prisma.
- [x] Renomeação completa da marca e de todos os componentes da aplicação para **LoopX**.

---

### [x] Passo 4: Pipeline de Narração Hiper-realista (TTS), Legendas Sincronizadas e Curadoria de Mídia
- [x] Curadoria automática de mídias via APIs de bancos de imagens/vídeos (Pixabay API e LoopX Vault) com busca por palavras-chave (Etapa 3) (`src/lib/pipeline/media-curator.ts`).
- [x] Rota de API `/api/pipeline/curate` conectada ao modal de troca de mídia do Storyboard.
- [x] Geração de narração neural com pausas dramáticas e cadência de suspense para ElevenLabs, OpenAI TTS e fallback de alta fidelidade (Etapa 4) (`src/lib/pipeline/tts-engine.ts`).
- [x] Rota de API `/api/pipeline/tts` com player de prévia sonora de voz neural por cena.
- [x] Sincronização de legendas palavra por palavra com cálculo dinâmico de timestamps e exportação padrão `.srt` (Etapa 5) (`src/lib/pipeline/subtitles-sync.ts`).
- [x] Rota de API `/api/pipeline/subtitles` e botão de download direto de arquivos `.srt` no Storyboard e no modal de prévia de vídeo.

---

### [x] Passo 5: Motor de Renderização de Vídeo (Remotion/FFmpeg) e Filas de Processamento (BullMQ/Redis)
- [x] Configuração de filas assíncronas no Redis com controle de concorrência e fila prioritária (`src/lib/render/queue.ts`).
- [x] Aplicação de movimentação cinematográfica nas cenas com filtros FFmpeg para Ken Burns (Zoom In, Zoom Out, Pan) e Parallax 2.5D (Etapa 6) (`src/lib/render/motion-effects.ts`).
- [x] Mixagem de áudio estéreo com compressão sidechain (auto-ducking -14dB dinâmico sob a voz) e efeitos sonoros SFX (Etapa 7) (`src/lib/render/audio-mixer.ts`).
- [x] Orquestrador de renderização final em MP4 Full HD 1080p 16:9 60fps (Etapa 8) (`src/lib/render/video-renderer.ts`).
- [x] Rota de API `/api/render/queue` com disparo, enfileiramento e monitoramento de progresso com logs por etapa.

---

### [x] Passo 6: Autenticação Clerk, Gestão de Créditos de Minutos e Publicação no YouTube
- [x] Autenticação com Clerk personalizada para tema Dark Mode (`src/lib/auth/clerk-config.ts` e `/api/auth/me`).
- [x] Controle estrito de saldo de minutos e limite de renderizações simultâneas por plano (`src/lib/billing/credits-manager.ts` e `/api/billing/credits`).
- [x] Conexão OAuth 2.0 com a YouTube Data API para upload direto do vídeo em 1 clique com capítulos e metadados (`src/lib/youtube/publisher.ts` e `/api/youtube/publish`).
- [x] Modal de recarga rápida de minutos avulsos integrado no cabeçalho do estúdio (`StudioHeader.tsx`).
- [x] Modal de prévia com player 1080p, download `.srt` e publicação com link direto gerado (`VideoPreviewModal.tsx`).
- [x] Verificação e testes finais de ponta a ponta no Docker.

---

### [x] Passo 7: Checkout (Stripe & Pix Asaas), Healthcheck e Suite de Testes E2E no Docker
- [x] Motor de Checkout e Pagamentos (`src/lib/billing/checkout.ts`):
  - [x] Geração de sessões de checkout para planos (Starter, Creator, Studio, Scale) com cálculo do ciclo anual (-10%).
  - [x] Geração de Pix Instantâneo (Payload Copia e Cola compatível com BACEN e QR Code).
  - [x] Webhook de pagamento (`/api/billing/webhook`) atualizando `Subscription` e gravando em `CreditTransaction`.
- [x] Rota de Healthcheck do Sistema (`/api/health`):
  - [x] Monitoramento ativo de PostgreSQL 16, Redis 7 e versão do FFmpeg 8.0.1 no container.
- [x] Modal de Checkout e Pagamento Interativo na Landing Page (`Pricing.tsx`).
- [x] Suite Completa de Testes E2E Automatizados (`scripts/test-e2e.mjs` via `npm run test:e2e` no Docker):
  - [x] 10/10 testes aprovados com sucesso cobrindo todo o ciclo do SaaS.

---

### [x] Passo 8: Dashboard Analítico de Desempenho e Métricas do Canal Dark (YouTube Analytics)
- [x] Motor de Métricas do Canal Dark (`src/lib/youtube/analytics.ts`):
  - [x] Cálculo e mapeamento da Curva de Retenção de Audiência por ato narrativo (Gancho 0-30s, Mistério, Fatos Inéditos, Clímax, Conclusão).
  - [x] Agregação de visualizações (30d), tempo de exibição em horas, receita estimada (RPM R$ 15/mil) e novos inscritos.
  - [x] Geração de dicas estratégicas da IA LoopX para canais Dark (ganchos iniciais, palavras-chave de CTR e retenção).
- [x] Rota de API dedicada (`/api/youtube/analytics`).
- [x] Componente do Dashboard no Estúdio (`src/components/studio/AnalyticsDashboard.tsx`):
  - [x] Seletor de abas ("Estúdio" vs "Métricas do Canal") integrado no `StudioHeader.tsx`.
  - [x] Gráficos de retenção com anotações e biblioteca de vídeos publicados com link direto para o YouTube.
- [x] Atualização da suíte de testes E2E com validação do módulo de Analytics (`11/11 testes aprovados no Docker`).

---

### [x] Passo 9: Gerenciador de Múltiplos Canais Dark & Chaves de Produção (BYOK)
- [x] Motor de Múltiplos Canais Dark (`src/lib/youtube/channel-manager.ts`):
  - [x] Gerenciamento da rede de canais dark do criador com nichos dedicados, estatísticas e parâmetros padrão.
  - [x] Alternância dinâmica de canal ativo com sincronização de metadados.
  - [x] Suporte a credenciais de produção e Bring Your Own Key (BYOK) para OpenAI GPT-4o, ElevenLabs, Pexels, Unsplash e YouTube.
- [x] Rota de API dedicada (`/api/youtube/channels` com listagem, troca de canal ativo e salvamento de chaves customizadas).
- [x] Componentes no Estúdio de Criação:
  - [x] Dropdown interativo de canais (`ChannelSelector.tsx`) no cabeçalho com modal de conexão de novos canais por nicho.
  - [x] Modal de chaves de API e integrações de produção (`ApiSettingsModal.tsx`) acessível no cabeçalho.
- [x] Atualização da suíte de testes E2E com validação do módulo de canais e chaves (`12/12 testes aprovados no Docker`).

---

### [x] Passo 10: Auditoria Geral de Código, Correção de Permissões e Resolução de Erros
- [x] Ajuste no `Dockerfile` para transferência do código-fonte completo (`src/`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `next-env.d.ts`, `.eslintrc.json`) para a imagem de produção `runner`.
- [x] Correção de permissões de sistema de arquivos do usuário não-root `nextjs` (`chown -R nextjs:nodejs /app`).
- [x] Normalização de parâmetros de curadoria de mídias (`/api/pipeline/curate`) suportando `query`, `keywords`, `mediaType` e `preferredType`.
- [x] Extensão do enum `MediaType` para aceitar `"ALL"`.
- [x] Validação estática de tipos do TypeScript com zero erros (`tsc --project tsconfig.json --noEmit` código 0).
- [x] Verificação de saúde da infraestrutura (`HEALTHY`: PostgreSQL 1ms, FFmpeg 8.0.1, Redis 7 ativo, 25.8MB RAM).
- [x] Execução da suíte E2E automatizada no Docker com 100% de sucesso (12/12 testes).

---

### [x] Passo 11: Sistema de Agendamento Automático de Vídeos e Grade Semanal
- [x] Motor de Agendamento (`src/lib/youtube/scheduler.ts`):
  - [x] Mapeamento dos slots de pico de retenção semanais (Segunda a Domingo) para canais Dark (Terça 18h com 98% e Domingo 19h com 99%).
  - [x] Gerenciador de publicações agendadas (`schedulePost`, `cancelScheduledPost`, `getWeeklyCalendarSlots`).
- [x] Rota de API dedicada (`/api/youtube/schedule` com GET para slots/posts e POST para agendar e cancelar).
- [x] Componentes no Estúdio de Criação:
  - [x] Modal de Grade Semanal & Calendário (`ScheduleCalendarModal.tsx`) com seleção de data/hora, canal e visibilidade (Público/Não-Listado/Privado).
  - [x] Integração no modal de prévia de vídeo (`VideoPreviewModal.tsx`) permitindo agendar lançamentos em 1 clique.
  - [x] Botão de atalho para a grade semanal integrado no cabeçalho (`StudioHeader.tsx`).
- [x] Atualização da suíte de testes E2E com validação do módulo de agendamento (`13/13 testes aprovados no Docker`).

---

### [x] Passo 12: Redesign da Landing Page com Estilo Liquid Glass, Instrument Serif, Textos em Português e Login/Senha
- [x] Estilização visual em `src/app/globals.css` com fonte Google `Instrument Serif` e classes utilitárias `.liquid-glass` / `.liquid-glass::before` com efeito de luminosidade, blur e borda gradiente.
- [x] Configuração de `fontFamily.serif` em `tailwind.config.ts`.
- [x] Hero Section cinematográfico traduzido e alinhado ao LoopX (`LiquidHero.tsx`):
  - [x] Fundo com vídeo em tela cheia e controle de fade loop via vanilla JS refs (`requestAnimationFrame` no canplay, timeupdate <= 0.55s e ended).
  - [x] Barra superior com branding LoopX e páginas do projeto em português (**Sobre**, **Recursos**, **Visão**, **Planos**, **Estúdio**).
  - [x] Botões de autenticação no topo: **Cadastrar** e **Entrar**.
  - [x] Título monumental em Instrument Serif: *"Crie vídeos dark que viralizam."*.
  - [x] Subtítulo focado na proposta de valor do pipeline de 8 etapas para canais dark do YouTube.
  - [x] Input de newsletter em português com botão de envio circular e feedback visual.
  - [x] Botões de ação direta: "Conhecer o Pipeline" e "Acessar Estúdio" (com modal de autenticação).
  - [x] Rodapé da Hero com ícones sociais (Instagram, Twitter, Comunidade Global).
- [x] Sistema de Autenticação com Login e Senha:
  - [x] Componente modal em Liquid Glass (`AuthModal.tsx`) com alternância entre "Entrar" e "Cadastrar", validação de campos e preenchimento de acesso demo em 1-clique (`criador@loopx.com` / `loopx123`).
  - [x] Página dedicada de autenticação (`/login`).
  - [x] Rotas de API `/api/auth/login`, `/api/auth/logout` e `/api/auth/me` com persistência de cookies de sessão.
- [x] Tradução e alinhamento de todas as seções conceituais:
  - [x] `AboutSection.tsx`: *"Roteiros hipnóticos para canais que criam, escalam e dominam a audiência."*.
  - [x] `FeaturedVideoSection.tsx`: "Nossa Abordagem" e botão "Explorar Recursos".
  - [x] `PhilosophySection.tsx`: "Inovação x Visão" com "Escolha seu nicho" e "Molde a sua audiência".
  - [x] `ServicesSection.tsx`: "O que fazemos" com tags "Estratégia" e "Produção".
- [x] Integração harmônica com os planos de precificação (`Pricing.tsx` em fundo `bg-black`), checkout Pix/Stripe e rodapé (`Footer.tsx`).
- [x] Otimização do `Dockerfile` com `--chown=nextjs:nodejs` em todas as cópias da camada runner.
- [x] Atualização da suíte E2E com validação completa da Landing Page em português e do fluxo de autenticação (`15/15 testes aprovados no Docker`).

---

### [ ] Próximos Passos Opcionais (Pós-Lançamento)
> *Aguardando solicitação explícita do usuário para início de qualquer item adicional.*
- [x] Inserção de chaves reais de produção de terceiros no `.env` e `docker-compose.yml`:
  - [x] `CLERK_SECRET_KEY` e `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Autenticação).
  - [x] `OPENAI_API_KEY` (Roteirização & Pesquisa de Fatos Históricos).
  - [x] `GOOGLE_AI_STUDIO_API_KEY` e `GEMINI_API_KEY` (Narração Neural Hiper-realista Google AI Studio / Gemini Voice).
  - [x] `YOUTUBE_CLIENT_ID` e `YOUTUBE_CLIENT_SECRET` (Publicação Automática com Capítulos).
  - [x] `UNSPLASH_ACCESS_KEY` e `PIXABAY_API_KEY` (Curadoria 4K de Imagens Cinematográficas e Vídeos).
  - [x] Propagação nas variáveis de ambiente do contêiner `loopx-app` e arquivo de exemplo `.env.example`.
  - [x] Atualização da suíte de testes E2E com validação do status de integrações (`16/16 testes aprovados no Docker`).
- [x] Integração da Unsplash API como provedor primário de fotos 4K cinematográficas e substituição da ElevenLabs pelo Google AI Studio para síntese de voz neural.
- [x] Sistema de testes A/B automatizados para miniaturas (thumbnails) e títulos de canais Dark:
  - [x] Motor de Testes A/B (`src/lib/youtube/ab-testing.ts`) com rotação de variantes (A/B/C), cálculo de CTR em tempo real e significância estatística.
  - [x] Gerador de variantes de alto CTR por IA baseado em fórmulas de canais Dark (Lacuna de Curiosidade, Choque, Documentos Censurados).
  - [x] Rota de API dedicada (`/api/youtube/ab-tests`) com suporte a criação, inicialização, pausa, eleição de vencedor e sugestões de IA.
  - [x] Modal interativo no Estúdio (`src/components/studio/ABTestingModal.tsx`) integrado no cabeçalho (`StudioHeader.tsx`) e no modal de prévia de publicação (`VideoPreviewModal.tsx`).
  - [x] Atualização da suíte de testes E2E no Docker com validação completa do ciclo de Testes A/B (17/17 testes aprovados).
- [x] Correção de Usabilidade na Vinculação de Canais Dark & Responsividade do Modal (`ChannelSelector.tsx` e `/api/youtube/channels`):
  - [x] Extração automática do nome do canal a partir do handle do YouTube caso o campo de nome seja omitido (`@Oobservador-rw2gq` -> `Oobservador-rw2gq`).
  - [x] Eliminação do bloqueio silencioso de submissão e inclusão de feedback visual de erros/alertas no modal.
  - [x] Correção do posicionamento em tela com `overflow-y-auto` e `my-auto`, impedindo o corte superior do modal em qualquer resolução ou zoom de tela.
  - [x] Validação em tempo real e testes end-to-end aprovados no Docker (17/17 testes).
- [x] Resolução de Bloqueio de Push (GH013 / Push Protection) & Higienização de Segredos:
  - [x] Atualização da URL remota para `https://github.com/lopesmidia002-jpg/LoopX.git`.
  - [x] Desvinculação do `.env` do controle de versão (`git rm --cached .env`), preservando as chaves ativas apenas no ambiente local Docker.
  - [x] Higienização de `docker-compose.yml` eliminando chaves padrão fixas e utilizando interpolação direta das variáveis de ambiente.
  - [x] Validação estática e execução completa de 17/17 testes E2E aprovados no Docker.
- [x] Criação do Arquivo README.md Completo do Projeto:
  - [x] Apresentação do produto LoopX com badges, proposta de valor e arquitetura de 8 etapas.
  - [x] Documentação das tecnologias utilizadas e diferenciais do design Liquid Glass.
  - [x] Guia de início rápido passo a passo 100% conteinerizado com Docker.
  - [x] Detalhamento da suíte de 17 testes automatizados E2E e checagem de tipos estáticos TypeScript.
  - [x] Tabela de variáveis de ambiente, mapa da árvore de diretórios e links para documentações complementares.
- [x] Correção de Exibição das Janelas Secundárias com React Portals (`createPortal`):
  - [x] Eliminação do aprisionamento de containing block causado pelo `backdrop-filter: blur` do cabeçalho fixo.
  - [x] Migração de todas as modais (`ChannelSelector`, `ApiSettingsModal`, `ScheduleCalendarModal`, `ABTestingModal`, `VideoPreviewModal`, `AuthModal` e recarga) para montagem direta no `document.body` com `z-[9999]`.
  - [x] Suporte a SSR seguro com verificação de estado `mounted` via `useEffect`.
  - [x] Validação completa no Docker com zero erros TypeScript e 17/17 testes E2E aprovados.
- [x] Inicialização do Impeccable Design System (`/impeccable init`):
  - [x] Execução do setup de contexto via `impeccable.cmd context` para plataforma `web`.
  - [x] Entrevista estruturada de alinhamento de público-alvo, posicionamento e formatos estratégicos.
  - [x] Criação de `PRODUCT.md` com a verdade durável do produto (usuários, propósito, posicionamento, contexto operacional, capacidades, compromissos de marca e princípios estratégicos).
