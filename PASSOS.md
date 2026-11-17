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

### [ ] Passo 4: Pipeline de Narração Hiper-realista (TTS), Legendas Sincronizadas e Curadoria de Mídia
- [ ] Curadoria automática de mídias via APIs de bancos de imagens/vídeos (Pexels / Unsplash) baseadas no roteiro (Etapa 3).
- [ ] Geração de narração neural com pausas dramáticas e cadência de suspense (Etapa 4).
- [ ] Sincronização de legendas palavra por palavra com timestamps e geração de arquivos `.srt` e JSON estruturado (Etapa 5).

---

### [ ] Passo 5: Motor de Renderização de Vídeo (Remotion/FFmpeg) e Filas de Processamento (BullMQ)
- [ ] Configuração de filas assíncronas com Redis e BullMQ para controle de concorrência e fila prioritária.
- [ ] Aplicação de movimentação cinematográfica nas cenas (Ken Burns Zoom/Pan e Parallax 2.5D) (Etapa 6).
- [ ] Mixagem de áudio com auto-ducking (diminuição da trilha de fundo quando há voz) e efeitos sonoros (SFX) (Etapa 7).
- [ ] Renderização final em MP4 1080p 16:9 e geração do arquivo para download (Etapa 8).

---

### [ ] Passo 6: Autenticação Clerk, Gestão de Créditos de Minutos e Publicação no YouTube
- [ ] Autenticação com Clerk personalizada para tema Dark Mode.
- [ ] Controle estrito de saldo de minutos e limite de renderizações simultâneas por plano.
- [ ] Conexão OAuth 2.0 com a YouTube Data API para upload direto do vídeo em 1 clique com capítulos e metadados.
- [ ] Verificação e testes finais de ponta a ponta no Docker.
