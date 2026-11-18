# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Criadores de conteúdo e operadores de canais Dark do YouTube (focados em documentários históricos, mistérios não resolvidos, conspirações, ciência, astronomia, geopolítica e listas "Top 10") que necessitam produzir vídeos longos de forma consistente sem aparecer, sem gravar a própria voz e sem demandar dezenas de horas em softwares complexos de edição manual ou custos elevados com editores freelancers.

## Product Purpose

O LoopX existe para automatizar e escalar a produção audiovisual de vídeos documentais de alta retenção para o YouTube. O objetivo central é transformar uma simples ideia ou tema em um vídeo completo Full HD 1080p de 8 a 15+ minutos, com arco dramático cinematográfico, curadoria de mídias 4K, narração neural realista, legendas sincronizadas, efeitos de movimento, mixagem com auto-ducking e publicação com capítulos no YouTube. O sucesso do produto significa possibilitar que um criador solo gerencie e escale uma rede lucrativa de canais dark com qualidade profissional em poucos cliques.

## Positioning

Diferente de editores de vídeo genéricos ou geradores automáticos de vídeos curtos para redes sociais, o LoopX é a única plataforma SaaS que oferece um **pipeline especializado de 8 etapas desenhado exclusivamente sob as regras do algoritmo e retenção do YouTube Dark**. O sistema combina apuração factual, roteirização com gancho hipnótico nos primeiros 30 segundos, curadoria de fotos e vídeos 4K, testes A/B integrados para miniaturas/títulos com cálculo de CTR em tempo real e agendamento inteligente em horários de pico.

## Operating Context

- **Interface Principal:** Aplicação web responsiva no Estúdio de Criação (`/studio`) com editor visual de storyboard cena a cena, seletor de rede de canais dark e painel de métricas de retenção por ato narrativo.
- **Ambiente de Execução:** Arquitetura 100% conteinerizada em Docker Compose (`loopx-app`, `loopx-postgres`, `loopx-redis` e motor de vídeo FFmpeg).
- **Modelo de Negócio:** Assinatura SaaS baseada em consumo de minutos de vídeo (Planos Starter, Creator, Studio e Scale) com compra de recargas avulsas e suporte a pagamentos via Pix Instantâneo (BACEN/QR Code) e Stripe.
- **Distribuição:** Conexão direta com a YouTube Data API v3 para publicação em 1 clique com geração automática de títulos de alta conversão, descrição de SEO e capítulos por timestamp.

## Capabilities and Constraints

- **Formato Estrito:** Foco exclusivo e otimizado em vídeos horizontais 16:9 Full HD (1080p 60fps) com duração documental recomendada de 8 a 15+ minutos.
- **Pipeline Sequencial de 8 Etapas:**
  1. Pesquisa factual e verificação histórica via IA.
  2. Roteiro estruturado com divisão em cenas, descrições visuais e palavras-chave.
  3. Curadoria automatizada de mídias 4K (Unsplash API, Pixabay e acervo curado LoopX Vault) com substituição em 1 clique.
  4. Síntese de narração neural hiper-realista documental (Google AI Studio / Gemini 2.0 Flash Audio nos timbres Fenrir, Aoede, Charon e Puck).
  5. Sincronização palavra por palavra de legendas e exportação padrão `.srt`.
  6. Aplicação de movimentação cinematográfica de câmera (Ken Burns e Parallax 2.5D) via filtros FFmpeg.
  7. Mixagem sonora estéreo com compressão sidechain / auto-ducking dinâmico (-14dB sob a narração) e efeitos sonoros SFX.
  8. Renderização final em MP4 e envio direto para o canal conectado no YouTube.
- **Otimização de CTR (Testes A/B):** Criação e acompanhamento de experimentos para miniaturas (16:9) e títulos com rotação automática, cálculo de significância estatística e eleição de vencedor em 1 clique.
- **Rede de Canais & BYOK:** Gerenciamento centralizado de múltiplos canais por nicho temático com derivação inteligente de nome pelo `@handle` e cofre para chaves privadas de fornecedores externos.
- **Infraestrutura:** Não requer instalação de ferramentas externas na máquina do usuário; todos os fluxos de banco, mensageria, renderização e APIs operam isolados em Docker.

## Brand Commitments

- **Nome da Marca:** LoopX
- **Identidade Visual:** Dark Mode Cinematográfico (`#161b24`, `#1d232e`), estética de vidro líquido Liquid Glass (`.liquid-glass`, luminosidade e borda gradiente) e tipografia Google Font `Instrument Serif`.
- **Voz da Marca:** Misteriosa, documental, autoritária, moderna e focada em resultados e escala de monetização.
- **Diretriz de Design:** Todas as janelas secundárias e modais de configuração utilizam React Portals (`createPortal`) montados na raiz do DOM com `z-[9999]` para impedir bloqueios visuais causados por desfoques de fundo.

## Evidence on Hand

- Código-fonte completo em produção conteinerizado (`Next.js 14`, `PostgreSQL 16`, `Redis 7`, `FFmpeg 8.0.1`).
- Suíte automatizada de 17 testes end-to-end (`scripts/test-e2e.mjs`) validando 100% dos módulos do sistema no Docker.
- Landing Page cinematográfica com seções completas de conversão e sistema de login/senha em cookies de sessão.
- Estúdio completo com storyboard interativo, prévia de vídeo em 1080p e painel analítico de retenção.

## Product Principles

1. **A Retenção de Audiência é a Métrica Soberana:** Cada linha do roteiro, cada corte de cena e cada segundo da trilha sonora são orquestrados para prender a atenção do espectador e evitar desistências nos primeiros 30 segundos.
2. **Escala Sem Perder a Estética Cinematográfica:** O criador deve ser capaz de produzir em escala industrial sem que seus vídeos pareçam automações genéricas ou amadoras.
3. **Autonomia com Intervenção em 1 Clique:** O pipeline opera de forma autônoma de ponta a ponta, mas oferece controle cirúrgico rápido para o criador ajustar falas, trocar mídias ou selecionar variantes a qualquer momento.
4. **Resiliência e Execução 100% Isolada:** A infraestrutura é autossuficiente e determinística dentro do ecossistema Docker, garantindo que o sistema opere de forma idêntica em qualquer máquina.
