# CONTEXTO DO PROJETO — LOOPX

## 1. Visão Geral do Produto
O **LoopX** (anteriormente VeloVide) é uma plataforma SaaS (Software as a Service) de criação automatizada de vídeos documentais e listas "Top 10" para canais dark do YouTube. 

O objetivo central é permitir que criadores de conteúdo produzam vídeos longos (8 a 15+ minutos), altamente retentivos e cinematográficos, sem precisarem aparecer, sem precisarem gravar voz e sem demandar dezenas de horas de edição manual ou custos elevados com editores freelancers.

A plataforma resolve o gargalo de escala dos maiores canais dark do YouTube:
- Pesquisa e checagem de fatos histórica e científica.
- Redação de roteiros com arcos dramáticos (gancho, desenvolvimento, clímax e conclusão).
- Curadoria e seleção de mídias em 4K (vídeos e imagens).
- Narração neural hiper-realista com inflexão documental sombria/épica.
- Sincronização precisa de legendas palavra por palavra com destaques visuais.
- Dinamismo visual cinematográfico (efeito Ken Burns, Parallax 2.5D e transições rítmicas).
- Mixagem sonora profissional com auto-ducking (trilha orquestral/tensa + efeitos sonoros).
- Exportação em 1080p 16:9 e envio direto para o YouTube com metadados e capítulos automáticos.

---

## 2. Stack Tecnológica & Infraestrutura
- **Framework Web:** Next.js 14 (App Router) com TypeScript e React 18.
- **Estilização & UI:** Tailwind CSS, Framer Motion e Lucide Icons.
- **Banco de Dados & ORM:** PostgreSQL 16 com Prisma ORM.
- **Fila & Cache:** Redis 7 com arquitetura preparada para BullMQ.
- **Processamento de Mídia & Vídeo:** Remotion & FFmpeg com aceleração para renderização e mixagem de áudio.
- **Autenticação:** Clerk (preparado com tema Dark Mode cinematográfico customizado).
- **Ambiente de Execução:** 100% conteinerizado em Docker via Docker Compose (`loopx-app`, `loopx-postgres`, `loopx-redis`).

---

## 3. Identidade Visual & Design System
- **Tema:** Dark Mode cinematográfico.
- **Background Principal:** `#161b24`.
- **Superfícies:** `#1d232e` com `backdrop-blur-xl` e bordas sutis (`#2a3342`).
- **Acentos & Gradientes:** Indigo e Violeta (`#6366f1`, `#8B5CF6`, `#8aa0ff`).
- **Texturas:** Grid sutil de fundo de `64px` com máscara radial no topo, brilho aurora suave e barra de progresso `#8B5CF6`.

---

## 4. Estrutura de Planos e Monetização
O faturamento do SaaS é centrado no consumo de **minutos de renderização** e no limite de **renderizações simultâneas**:
1. **Starter (R$ 197/mês | Anual com 10% off: R$ 177,30/mês):**
   - 91 minutos/mês (~9 a 11 vídeos documentais completos)
   - 1 renderização por vez
   - Minuto extra: R$ 2,80
2. **Creator (R$ 397/mês | Anual com 10% off: R$ 357,30/mês) — DESTAQUE:**
   - 195 minutos/mês (~20 a 24 vídeos)
   - 1 renderização por vez
   - Minuto extra: R$ 2,40
3. **Studio (R$ 797/mês | Anual com 10% off: R$ 717,30/mês):**
   - 416 minutos/mês (~40 a 50 vídeos)
   - 2 renderizações simultâneas
   - Minuto extra: R$ 2,00
   - Fila prioritária
4. **Scale (R$ 1.497/mês | Anual com 10% off: R$ 1.347,30/mês):**
   - 845 minutos/mês (~85 a 100 vídeos)
   - 3 renderizações simultâneas
   - Minuto extra: R$ 1,90
   - Fila ultra-prioritária + API

---

## 5. Estado Atual do Projeto
- **Passo 1 (Concluído):** Arquitetura base, Prisma schema, Docker compose (PostgreSQL, Redis, App) e design system cinematográfico.
- **Passo 2 (Concluído):** Landing Page de alta conversão completa (`/`) e Estúdio de Criação interativo (`/studio`) com seleção de voz/formato, pipeline de 8 etapas animado, Storyboard com troca de mídias e modal de publicação no YouTube.
- **Passo 3 (Concluído):** Motor de IA de pesquisa automática de fatos e geração de roteiro estruturado com arco dramático cinematográfico (gancho, desenvolvimento, clímax, conclusão e divisão em cenas com timestamps).
- **Renomeação do Projeto & Git:** Marca e ecossistema renomeados para **LoopX** e arquivo `.gitignore` configurado.
