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
├── Dockerfile                   # Build e containerização da aplicação Next.js
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
│   │       ├── projects/route.ts# Endpoints para criação e consulta de projetos
│   │       ├── render/route.ts  # Endpoints de disparo e progresso de renderização
│   │       └── script/generate/route.ts # Geração de pesquisa e roteiro estruturado
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
│   │       ├── StoryboardEditor.tsx # Grade de edição e troca de cenas
│   │       └── VideoPreviewModal.tsx# Player final e publicação no YouTube
│   └── lib/
│       ├── ai/
│       │   ├── prompts.ts       # Engenharia de prompts para canais Dark
│       │   ├── researcher.ts    # Motor de pesquisa factual e apuração
│       │   └── scriptwriter.ts  # Gerador de roteiro cinematográfico (4 atos e cenas)
│       ├── types.ts             # Definições de tipos TypeScript
│       ├── constants.ts         # Planos, vozes, etapas e templates
│       ├── utils.ts             # Funções utilitárias (cn, formatações)
│       └── prisma.ts            # Singleton do cliente Prisma
├── CONTEXTO.md                  # Contexto estratégico e regras de negócio
├── PASSOS.md                    # Roadmap de passos e controle de avanço
└── DOCUMENTACAO.md              # Esta documentação técnica
```

---

## 4. Telas e Componentes Implementados

### 4.1. Landing Page de Alta Conversão (`/`)
- **TopBanner:** Banner de escassez com indicador pulsante.
- **Navbar:** Marca **LoopX** em destaque, navegação fluida e CTA para abertura imediata do estúdio.
- **Hero Section:** Título de impacto, mockup animado do estúdio, waveform interativo e contador de +3.840 criadores.
- **Marquee:** Faixa contínua com diamantes (`✦`) evidenciando automação total sem mostrar o rosto.
- **Como Funciona:** 3 etapas visuais (`01` Ideia, `02` IA autônoma, `03` Publicação).
- **Em Tempo Real:** Visualização ao vivo das 8 etapas do pipeline.
- **Bento Grid:** Movimento de câmera cinematográfico (Ken Burns e Parallax 2.5D), vozes neurais e auto-ducking.
- **Showcase:** Grade 3x2 de thumbnails 16:9 com reprodução interativa.
- **ValueComparison:** Comparativo transparente: Editor Tradicional vs LoopX.
- **Pricing:** 4 planos (*Starter* R$ 197, *Creator* R$ 397 destaque, *Studio* R$ 797, *Scale* R$ 1.497) com toggle anual (10% off).
- **FAQ & Footer:** Respostas para dúvidas de monetização e rodapé institucional.

### 4.2. Estúdio de Criação (`/studio`)
- **StudioHeader:** Painel fixo com saldo de minutos de vídeo em tempo real e concorrência na fila GPU.
- **ProjectConfig:** Configuração de tópico/roteiro, formato (*Documentário* vs *Top 10*), idioma (PT-BR, EN, ES) com preview de voz e duração alvo (8 a 15 min).
- **PipelineStatus:** Painel interativo de progresso em 8 etapas com logs ao vivo e montagem de cenas.
- **StoryboardEditor:** Editor visual de cenas com troca de mídias 4K, edição de narração e controle de efeitos de câmera.
- **VideoPreviewModal:** Player 1080p, download MP4 e publicação em 1 clique no YouTube com timestamps e SEO prontos.

---

## 5. Como Executar via Docker

### Subir todos os serviços (App, PostgreSQL e Redis)
```bash
docker compose up -d
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
