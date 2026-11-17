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
│   │       ├── pipeline/
│   │       │   ├── curate/route.ts   # Curadoria de mídias Pexels/Unsplash/Vault
│   │       │   ├── tts/route.ts      # Síntese de voz neural realista
│   │       │   └── subtitles/route.ts# Sincronização palavra por palavra e .SRT
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
│   │       ├── StoryboardEditor.tsx # Grade de edição e troca de cenas com busca
│   │       └── VideoPreviewModal.tsx# Player final, exportação de .SRT e YouTube
│   └── lib/
│       ├── ai/
│       │   ├── prompts.ts       # Engenharia de prompts para canais Dark
│       │   ├── researcher.ts    # Motor de pesquisa factual e apuração
│       │   └── scriptwriter.ts  # Gerador de roteiro cinematográfico (4 atos e cenas)
│       ├── pipeline/
│       │   ├── media-curator.ts # Integração com Pexels/Unsplash e Acervo Vault
│       │   ├── tts-engine.ts    # Síntese neural (ElevenLabs / OpenAI / Fallback)
│       │   └── subtitles-sync.ts# Algoritmo de sincronização e formatador .SRT
│       ├── types.ts             # Definições de tipos TypeScript
│       ├── constants.ts         # Planos, vozes, etapas e templates
│       ├── utils.ts             # Funções utilitárias (cn, formatações)
│       └── prisma.ts            # Singleton do cliente Prisma
├── CONTEXTO.md                  # Contexto estratégico e regras de negócio
├── PASSOS.md                    # Roadmap de passos e controle de avanço
└── DOCUMENTACAO.md              # Esta documentação técnica
```

---

## 4. Módulos do Pipeline Entregues (Passo 4)

### 4.1. Curadoria de Mídias (`media-curator.ts`)
- Busca automática em bancos de alta definição (Pexels Video/Photo API e Unsplash API) baseada em palavras-chave por cena.
- Mecanismo de acervo local categorizado (`LOOPX_VAULT`) em 4K (oceano, mistério, militar, espaço, tecnologia, ruínas) garantindo disponibilidade mesmo sem chaves externas.

### 4.2. Síntese de Voz Neural Hiper-realista (`tts-engine.ts`)
- Suporte a ElevenLabs (`eleven_multilingual_v2`) com vozes documentais profundas e configurações de cadência de suspense (`stability: 0.75`, `similarity_boost: 0.85`).
- Suporte a OpenAI TTS (`tts-1-hd` com vozes `onyx`, `fable`, `echo`).
- Player de áudio em tempo real integrado a cada card de cena no Storyboard.

### 4.3. Sincronização de Legendas & Exportação (`subtitles-sync.ts`)
- Cálculo ponderado palavra por palavra com pausas pontuais (vírgulas, reticências, pontos finais).
- Exportador de arquivos no padrão SubRip (`.srt`) com formatação milimétrica de timecodes (`00:00:00,000 --> 00:00:05,000`).
- Botão de download direto do arquivo `.srt` disponível tanto no Storyboard quanto no modal de prévia de vídeo.

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
