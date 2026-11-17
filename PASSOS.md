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
- [x] Curadoria automática de mídias via APIs de bancos de imagens/vídeos (Pexels / Unsplash / LoopX Vault) com busca por palavras-chave (Etapa 3) (`src/lib/pipeline/media-curator.ts`).
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

### [ ] Próximos Passos Opcionais (Pós-Lançamento)
> *Aguardando solicitação explícita do usuário para início de qualquer item adicional.*
- [ ] Inserção de chaves reais de produção de terceiros no `.env` (`CLERK_SECRET_KEY`, `YOUTUBE_CLIENT_ID`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`).
- [ ] Adicionar suporte a múltiplos canais dark no mesmo painel de usuário.
