# DOCUMENTAÇÃO TÉCNICA — VELOVIDE

## 1. Introdução
O **VeloVide** é um sistema web SaaS voltado para a criação automatizada e em escala de vídeos cinematográficos para canais dark do YouTube (documentários históricos, mistérios, teorias da conspiração, ciência e listas "Top 10").

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
|  |       velovide-app        | --------------->|      velovide-postgres      |  |
|  |   (Next.js 14 App Router) |                 |       (PostgreSQL 16)       |  |
|  |         Porta: 3000       |                 |         Porta: 5432         |  |
|  +---------------------------+                 +-----------------------------+  |
|               |                                                                 |
|               | Filas / Jobs (BullMQ)                                           |
|               v                                                                 |
|  +---------------------------+                                                  |
|  |       velovide-redis      |                                                  |
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
velovide/
├── Dockerfile                   # Build e containerização da aplicação Next.js
├── docker-compose.yml           # Orquestração do app, postgres e redis
├── .dockerignore                # Arquivos ignorados no contexto Docker
├── .env.example                 # Exemplo documentado das variáveis de ambiente
├── .env                         # Variáveis ativas de ambiente
├── package.json                 # Dependências e scripts do projeto
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
│   │       └── render/route.ts  # Endpoints de disparo e progresso de renderização
│   ├── components/
│   │   ├── landing/             # Componentes modulares da Landing Page
│   │   │   ├── TopBanner.tsx    # Banner fixo de escassez
│   │   │   ├── Navbar.tsx       # Barra de navegação e ações
│   │   │   ├── Hero.tsx         # Seção principal com mockup animado
│   │   │   ├── Marquee.tsx      # Faixa contínua com diamantes
│   │   │   ├── HowItWorks.tsx   # Os 3 passos explicativos
│   │   │   ├── RealtimePipeline.tsx # Pipeline de 8 etapas animado
│   │   │   ├── BentoGrid.tsx    # Recursos técnicos assimétricos
│   │   │   ├── Showcase.tsx     # Grade de vídeos 16:9 com Ken Burns
│   │   │   ├── ValueComparison.tsx # VeloVide vs Editor Tradicional
│   │   │   ├── Pricing.tsx      # Tabela de planos e minutos
│   │   │   ├── FAQ.tsx          # Acordeão de perguntas frequentes
│   │   │   └── Footer.tsx       # Rodapé institucional
│   │   └── studio/              # Componentes do Estúdio de Criação
│   │       ├── StudioHeader.tsx # Indicadores de minutos e status de fila
│   │       ├── ProjectConfig.tsx# Configurações de tema, voz e duração
│   │       ├── PipelineStatus.tsx# Visualizador em tempo real das 8 etapas
│   │       ├── StoryboardEditor.tsx # Grade de edição e troca de cenas
│   │       └── VideoPreviewModal.tsx# Player final e publicação no YouTube
│   └── lib/
│       ├── types.ts             # Definições de tipos TypeScript
│       ├── constants.ts         # Planos, vozes, etapas e templates
│       ├── utils.ts             # Funções utilitárias (cn, formatações)
│       └── prisma.ts            # Singleton do cliente Prisma
├── CONTEXTO.md                  # Contexto estratégico e regras de negócio
├── PASSOS.md                    # Roadmap de passos e controle de avanço
└── DOCUMENTACAO.md              # Esta documentação técnica
```

---

## 4. Telas e Componentes Implementados (Passo 2)

### 4.1. Landing Page de Alta Conversão (`/`)
- **TopBanner:** Barra de aviso superior fixa com indicador pulsante de escassez de vagas.
- **Navbar:** Navegação cinematográfica com âncoras para as seções e acesso rápido ao estúdio.
- **Hero Section:** Título de forte impacto, subtítulo para canais dark, botões de CTA, link do WhatsApp VIP, contador de criadores e mockup interativo com simulação de waveform e badges dinâmicos.
- **Marquee:** Faixa contínua com divisores em formato de diamante (✦) destacando diferenciais.
- **Como Funciona:** 3 cards numerados (`01` Descreva a ideia, `02` A IA cria tudo, `03` Publique).
- **Em Tempo Real:** Painel com as 8 etapas do pipeline animadas ao lado de uma grade viva de cenas.
- **Bento Grid:** Cards assimétricos evidenciando o movimento Ken Burns/Parallax 2.5D, vozes neurais realistas, roteiro com arco dramático, mixagem com ducking e publicação direta no YouTube.
- **Showcase:** Grade 3x2 de thumbnails 16:9 com categorias (História, Natureza, Ciência, Geopolítica, Tecnologia), zoom Ken Burns no hover e modal de visualização.
- **ValueComparison:** Comparativo direto do custo/tempo de um editor tradicional contra o VeloVide.
- **Pricing:** 4 planos estruturados (Starter R$ 197, Creator R$ 397 em destaque, Studio R$ 797, Scale R$ 1.497) com toggle mensal/anual (-10% à vista) e bloco de minutos avulsos.
- **FAQ:** Acordeão interativo com as principais dúvidas técnicas e de monetização.
- **Footer:** Chamada final, links de produtos, categorias e status de infraestrutura.

### 4.2. Estúdio de Criação (`/studio`)
- **StudioHeader:** Barra fixa exibindo saldo em tempo real de minutos de vídeo (ex: 184.5 / 195 min), slots de renderizações ativas (1/1) e atalho de novo projeto.
- **ProjectConfig:** Input de ideia/tópico ou roteiro completo com chips de sugestões virais, seletor de formato (Documentário vs Top 10), seletor de idioma (PT-BR, EN, ES) com preview de áudio das vozes neurais e seletor de duração alvo (8 a 15 min).
- **PipelineStatus:** Painel interativo demonstrando as 8 etapas com barra de porcentagem (0-100%), logs do terminal GPU e exibição viva das cenas geradas.
- **StoryboardEditor:** Editor pós-geração em grade com visualização das cenas, edição de narração por cena, troca instantânea de mídias 4K com acervo integrado e escolha de efeito de movimento cinematográfico.
- **VideoPreviewModal:** Player 1080p Full HD com controles, download direto do arquivo MP4 e aba de publicação em 1 clique no YouTube com título, descrição e capítulos automáticos por timestamp.

---

## 5. Modelagem do Banco de Dados (Prisma Schema)

### Entidades Principais
1. **User:** Identificação de usuários integrados ao Clerk.
2. **Subscription:** Assinatura ativa, plano (`STARTER`, `CREATOR`, `STUDIO`, `SCALE`), ciclo (`MONTHLY` ou `ANNUAL`), saldo de minutos restantes, renderizações simultâneas em uso e permissões de fila prioritária.
3. **Project:** Vídeo em criação com título, tópico/roteiro, formato (`DOCUMENTARY` ou `TOP_10`), idioma (`PT_BR`, `EN`, `ES`), voz selecionada e duração alvo.
4. **Scene:** Cenas individuais do projeto com narração, mídias associadas (imagem/vídeo), tipo de movimento cinematográfico (`KEN_BURNS_ZOOM_IN`, `PARALLAX_25D`, etc.), áudio gerado e legendas com timestamps.
5. **RenderJob:** Fila e execução do trabalho de renderização final com progresso de 0 a 100%, etapa ativa (1 a 8), resolução (1080p), logs e URL final do MP4.
6. **CreditTransaction:** Histórico de consumo e recarga de minutos ou aquisições de minutos extras avulsos.

---

## 6. Como Executar via Docker

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

### Sincronizar o Schema Prisma no Banco
```bash
docker compose exec -T app npx prisma db push
```

Acesse a aplicação no navegador em: `http://localhost:3000`
Acesse o Estúdio de Criação em: `http://localhost:3000/studio`
