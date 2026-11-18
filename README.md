# 🎬 LoopX — SaaS de Criação Automatizada de Vídeos para Canais Dark do YouTube

> **Plataforma completa e 100% conteinerizada em Docker para produção em escala de vídeos documentais cinematográficos (8 a 15+ minutos), com pipeline automatizado de 8 etapas, inteligência artificial para roteirização e pesquisa, curadoria de mídias 4K, narração neural realista, testes A/B e publicação direta no YouTube.**

---

## 🚀 Visão Geral do Produto

O **LoopX** é um software como serviço (SaaS) concebido especificamente para criadores de conteúdo e operadores de redes de **canais dark do YouTube** (documentários históricos, mistérios, teorias da conspiração, ciência, astronomia, geopolítica e listas "Top 10").

A plataforma resolve integralmente os maiores gargalos de escala da produção audiovisual:
- 🔍 **Pesquisa Histórica e Científica:** Apuração factual automatizada via IA.
- ✍️ **Roteirização Estruturada:** Construção de arcos dramáticos hipnóticos (gancho inicial 0-30s, desenvolvimento, clímax e conclusão).
- 🖼️ **Curadoria de Mídias 4K:** Busca e seleção inteligente de vídeos e fotografias cinematográficas em alta resolução.
- 🎙️ **Vozes Neurais Hiper-realistas:** Síntese de narração documental com timbres expressivos e pausas dramáticas.
- 💬 **Legendas Sincronizadas:** Temporização palavra por palavra com exportação direta em arquivos `.srt`.
- 🎥 **Movimento Cinematográfico:** Efeitos de câmera Ken Burns (Zoom In/Out, Pan) e Parallax 2.5D.
- 🔊 **Mixagem de Áudio Profissional:** Auto-ducking sonoro dinâmico (-14dB sob a voz) com trilha e efeitos SFX.
- 📈 **Otimização de CTR e Publicação:** Testes A/B para miniaturas (16:9) e títulos, agendamento de postagens e envio direto com capítulos por timestamp na YouTube Data API v3.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas |
|---|---|
| **Frontend & UI** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Design System** | Dark Mode Cinematográfico, Efeitos Liquid Glass (`.liquid-glass`), Google Font Instrument Serif |
| **Backend & APIs** | Next.js API Routes, Prisma ORM, Node.js 20 |
| **Banco de Dados & Cache** | PostgreSQL 16 (Relacional), Redis 7 (Mensageria e Filas BullMQ) |
| **Processamento Audiovisual** | FFmpeg 8.0.1 (Filtros de movimento, mixagem sidechain, legendas e renderização MP4 1080p) |
| **Inteligência Artificial** | OpenAI GPT-4o (Roteiros e Pesquisa), Google AI Studio / Gemini 2.0 Flash Audio (Vozes neurais) |
| **Curadoria de Mídia 4K** | Unsplash API, Pixabay API e LoopX Curated Vault |
| **Autenticação & Pagamentos** | Sistema de Login/Senha com Sessões em Cookies, Clerk Auth, Pix Instantâneo (BACEN/QR Code), Stripe |
| **Infraestrutura** | 100% Conteinerizado com Docker & Docker Compose |

---

## ⚡ Pipeline Sequencial de 8 Etapas

```mermaid
flowchart LR
    A["1. Pesquisa Factual"] --> B["2. Roteiro & Gancho"]
    B --> C["3. Curadoria Mídias 4K"]
    C --> D["4. Narração Neural"]
    D --> E["5. Legendas .SRT"]
    E --> F["6. Efeito Ken Burns"]
    F --> G["7. Mixagem & Ducking"]
    G --> H["8. Exportação 1080p & YouTube"]
```

1. **Pesquisa & Checagem:** Extração de fatos históricos, cronologia e curiosidades inéditas.
2. **Roteiro Estruturado:** Geração de narrativa com divisão por cenas, descrições de tela e palavras-chave.
3. **Curadoria 4K:** Associação automática de mídias de alta definição da Unsplash e Pixabay com modal de troca em 1-clique.
4. **Narração Neural Realista:** Síntese de áudio realista com timbres documentais (Fenrir, Aoede, Charon e Puck).
5. **Sincronização de Legendas:** Mapeamento temporal palavra por palavra e geração de arquivos `.srt` para download.
6. **Movimentação Cinematográfica:** Aplicação de zoom e deslocamento contínuo (Ken Burns e Parallax 2.5D) via FFmpeg.
7. **Mixagem de Áudio com Auto-Ducking:** Redução de -14dB da trilha musical automaticamente quando a voz da narração entra em cena.
8. **Renderização & Publicação:** Encodificação final em MP4 Full HD (1080p 60fps) e envio direto para o canal conectado no YouTube.

---

## 🌟 Principais Recursos

### 1. Landing Page Cinematográfica em Estilo Liquid Glass
- Design de alto padrão visual com efeito de vidro líquido (`.liquid-glass`), tipografia **Instrument Serif** e fundo escuro total (`bg-black`).
- Vídeo de fundo com controle de transição suave em loop via `requestAnimationFrame`.
- Navbar em português (**Sobre**, **Recursos**, **Visão**, **Planos**, **Estúdio**) com modais de login e cadastro.

### 2. Estúdio de Criação Interativo (`/studio`)
- Configuração de projetos: formato (Documentário / Top 10), idioma (PT-BR, EN-US, ES-LA) e duração alvo (8 a 15+ min).
- Pipeline visual com monitoramento percentual em tempo real (0 a 100%) e logs de processamento.
- **Storyboard pós-geração:** edição de roteiro cena a cena, visualização de mídias e substituição com 1 clique.
- Player de prévia de vídeo em 1080p, download de `.srt` e publicação no YouTube.

### 3. Sistema de Testes A/B de Miniaturas & Títulos
- Criação e monitoramento de experimentos de alto CTR para canais Dark (Variantes A, B e C).
- Gerador de variantes por inteligência artificial baseado em fórmulas de retenção comprovadas (*Lacuna de Curiosidade*, *Documento Censurado*, *Choque*).
- Cálculo em tempo real de impressões, cliques, CTR (%) e índice de confiança estatística com eleição de vencedor em 1 clique.

### 4. Gerenciador de Rede de Múltiplos Canais Dark
- Gerenciamento de múltiplos canais do criador no mesmo painel por nicho temático.
- Vinculação ágil de canal com derivação automática de nome a partir do `@handle`.
- Painel Bring Your Own Key (BYOK) para salvar credenciais customizadas de APIs externas.

### 5. Grade Semanal & Agendamento Automático
- Calendário interativo mapeando os horários com maiores picos de audiência e retenção no YouTube (ex: Terça-feira às 18h e Domingo às 19h).
- Agendamento de lançamentos diretamente da tela de prévia do vídeo.

### 6. Dashboard Analítico de Desempenho
- Análise gráfica da curva de retenção de audiência dividida por atos narrativos (Gancho 0-30s, Mistério, Clímax, Conclusão).
- Estimativas de receita com base no RPM de canais documentais e sugestões estratégicas de otimização de conteúdo.

---

## 📦 Início Rápido com Docker

A aplicação é executada de forma **100% conteinerizada**, sem necessidade de instalar Node.js, PostgreSQL, Redis ou FFmpeg na máquina hospedeira.

### Pré-requisitos
- [Docker](https://www.docker.com/) (versão 24 ou superior)
- [Docker Compose](https://docs.docker.com/compose/) (versão v2 ou superior)

### 1. Clonar o Repositório
```bash
git clone https://github.com/lopesmidia002-jpg/LoopX.git
cd LoopX
```

### 2. Configurar o Arquivo de Ambiente
Copie o modelo de exemplo para criar o `.env` local:
```bash
cp .env.example .env
```
*(As chaves presentes em `.env.example` já incluem fallbacks e mocks prontos para teste local).*

### 3. Construir e Iniciar os Contêineres
```bash
docker compose up -d --build
```

Os seguintes serviços serão inicializados:
- **`loopx-app`**: Aplicação Next.js 14 na porta `3000`
- **`loopx-postgres`**: Banco relacional PostgreSQL 16 na porta `5432`
- **`loopx-redis`**: Servidor Redis 7 na porta `6379`

### 4. Acessar a Aplicação
- **Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Estúdio de Criação:** [http://localhost:3000/studio](http://localhost:3000/studio)
- **Tela de Autenticação:** [http://localhost:3000/login](http://localhost:3000/login) *(Acesso demo rápido disponível: `criador@loopx.com` / `loopx123`)*
- **Verificação de Saúde (Healthcheck):** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🧪 Suíte de Testes End-to-End no Docker

O projeto conta com uma suíte de testes de integração automatizada que valida ponta a ponta todos os módulos do sistema.

Para rodar os testes dentro do container:
```bash
docker compose exec -T app npm run test:e2e
```

### Cobertura da Suíte (17 Testes Automatizados):
1. **Health Check:** Verificação de conexão ativa com PostgreSQL 16, Redis 7 e FFmpeg 8.0.1.
2. **Autenticação & Subscrição:** Validação da rota `/api/auth/me` e créditos de minutos.
3. **IA de Pesquisa e Roteiro:** Teste da rota `/api/script/generate` com geração de arco dramático.
4. **Curadoria de Mídias 4K:** Busca de fotos e vídeos via Unsplash e Pixabay (`/api/pipeline/curate`).
5. **Síntese de Narração Neural:** Teste de geração de áudio realista (`/api/pipeline/tts`).
6. **Sincronização de Legendas:** Verificação de timestamps e exportação `.srt` (`/api/pipeline/subtitles`).
7. **Fila de Renderização:** Enfileiramento e concorrência no Redis (`/api/render/queue`).
8. **Checkout & Pix Instantâneo:** Geração de payload BACEN e QR Code Pix (`/api/billing/checkout`).
9. **Webhook de Pagamentos:** Atualização de planos e saldo de créditos (`/api/billing/webhook`).
10. **Publicação no YouTube:** Simulação de upload com capítulos e metadados (`/api/youtube/publish`).
11. **Métricas do Canal Dark:** Validação de gráficos de retenção e RPM (`/api/youtube/analytics`).
12. **Múltiplos Canais Dark & BYOK:** Gerenciamento de rede de canais (`/api/youtube/channels`).
13. **Agendamento Automático:** Grade semanal de publicações e slots de pico (`/api/youtube/schedule`).
14. **Landing Page Liquid Glass:** Validação de renderização em português da página inicial (`GET /`).
15. **Autenticação com Login e Senha:** Teste de login, logout e persistência de sessão.
16. **Status de Integrações & APIs:** Verificação do status de chaves conectadas.
17. **Sistema de Testes A/B:** Criação de variantes, cálculo de CTR e eleição de vencedores.

### Checagem Estática de Tipos TypeScript:
```bash
docker compose exec -T app ./node_modules/.bin/tsc --project tsconfig.json --noEmit
```

---

## 🔑 Variáveis de Ambiente (`.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgresql://loopx:password@postgres:5432/loopx_db` |
| `REDIS_URL` | URL de conexão com a instância do Redis | `redis://redis:6379` |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação web | `http://localhost:3000` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Chave pública do Clerk Auth | `pk_test_...` |
| `CLERK_SECRET_KEY` | Chave secreta do Clerk Auth | `sk_test_...` |
| `OPENAI_API_KEY` | Chave para pesquisa e redação de roteiros | `sk-proj-...` |
| `GOOGLE_AI_STUDIO_API_KEY` | Chave para síntese de vozes neurais Gemini | `AIzaSy-...` |
| `GEMINI_API_KEY` | Chave alternativa para a Gemini API | `AIzaSy-...` |
| `YOUTUBE_CLIENT_ID` | Client ID da YouTube Data API v3 | `...apps.googleusercontent.com` |
| `YOUTUBE_CLIENT_SECRET` | Client Secret do aplicativo OAuth | `GOCSPX-...` |
| `UNSPLASH_ACCESS_KEY` | Chave de acesso para banco de fotos 4K | `...` |
| `PIXABAY_API_KEY` | Chave para acervo de vídeos e imagens 4K | `...` |

---

## 📂 Estrutura de Diretórios

```
LoopX/
├── docker-compose.yml           # Orquestração do app, PostgreSQL e Redis
├── Dockerfile                   # Configuração e build com FFmpeg integrado
├── .gitignore                   # Regras de exclusão do Git (node_modules, .env, builds)
├── .env.example                 # Modelo documentado das variáveis de ambiente
├── package.json                 # Scripts e dependências do projeto
├── tsconfig.json                # Configuração do compilador TypeScript
├── tailwind.config.ts           # Configurações de tema Dark, Liquid Glass e fontes
├── prisma/
│   └── schema.prisma            # Modelagem do banco de dados relacional
├── scripts/
│   └── test-e2e.mjs             # Suíte de 17 testes automatizados de ponta a ponta
├── src/
│   ├── app/                     # Rotas e páginas do Next.js 14 App Router
│   │   ├── page.tsx             # Landing Page cinematográfica
│   │   ├── login/               # Página de login com e-mail e senha
│   │   ├── studio/              # Estúdio de criação de vídeos e storyboard
│   │   └── api/                 # Endpoints REST de pipeline, billing e YouTube
│   ├── components/              # Componentes React modulares
│   │   ├── landing/             # Seções da Landing Page (LiquidHero, BentoGrid, Pricing)
│   │   └── studio/              # Telas do estúdio (ABTesting, Analytics, ChannelSelector)
│   └── lib/                     # Motores lógicos, bibliotecas e integrações
│       ├── ai/                  # Pesquisa factual e roteirização
│       ├── pipeline/            # Curadoria 4K, narração neural e legendas .SRT
│       ├── render/              # Efeitos Ken Burns, auto-ducking e FFmpeg
│       └── youtube/             # Publicação, agendamento, canais e testes A/B
├── DOCUMENTACAO.md              # Documentação técnica detalhada de arquitetura
├── PASSOS.md                    # Histórico e checklist de todas as etapas implementadas
└── CONTEXTO.md                  # Resumo executivo do modelo de negócios e status
```

---

## 📚 Documentação Complementar

- [DOCUMENTACAO.md](DOCUMENTACAO.md): Especificações técnicas aprofundadas da arquitetura, banco de dados e rotas.
- [PASSOS.md](PASSOS.md): Checklist completo de todos os passos concluídos e planejados.
- [CONTEXTO.md](CONTEXTO.md): Contexto do modelo de negócios SaaS, métricas e diferenciais competitivos.

---

## 📄 Licença

Este projeto está sob licença proprietária desenvolvida para a plataforma **LoopX**. Todos os direitos reservados.
