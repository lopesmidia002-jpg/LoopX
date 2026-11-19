/**
 * Suite de Testes E2E Automatizados do LoopX
 * Executado diretamente dentro do contêiner Docker loopx-app
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   🚀 INICIANDO TESTES END-TO-END DO LOOPX NO DOCKER   ");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`⏳ Testando: ${name}... `);
    const start = Date.now();
    try {
      await fn();
      const elapsed = Date.now() - start;
      console.log(`✅ OK (${elapsed}ms)`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - start;
      console.log(`❌ FALHOU (${elapsed}ms)`);
      console.error(`   Erro:`, err.message);
      failed++;
    }
  }

  // 1. Healthcheck Geral do Sistema
  await test("1. Health Check (PostgreSQL, Redis, FFmpeg)", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health status: ${res.status}`);
    const data = await res.json();
    if (data.status !== "HEALTHY" && data.status !== "DEGRADED") {
      throw new Error(`Status de saúde inválido: ${data.status}`);
    }
    if (!data.checks.database || data.checks.database.status !== "UP") {
      throw new Error(`Banco PostgreSQL inacessível: ${JSON.stringify(data.checks.database)}`);
    }
    if (!data.checks.ffmpeg || data.checks.ffmpeg.status !== "UP") {
      throw new Error(`Motor FFmpeg não detectado no Docker`);
    }
  });

  // 2. Auth & Perfil do Criador
  await test("2. Autenticação & Subscrição (/api/auth/me)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.user || !data.user.email) {
      throw new Error("Falha ao recuperar perfil do criador");
    }
  });

  // 3. IA de Pesquisa e Roteirização Estruturada
  let generatedProjectId = null;
  await test("3. IA de Pesquisa e Roteiro (/api/script/generate)", async () => {
    const res = await fetch(`${BASE_URL}/api/script/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Os Segredos das Fossas Abissais",
        format: "DOCUMENTARY",
        targetDurationMinutes: 10,
        voiceId: "pt-br-marcos-deep",
        language: "PT_BR",
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.scenes) || data.scenes.length === 0) {
      throw new Error("Estrutura do roteiro ou cenas inválidas");
    }
    generatedProjectId = data.projectId;
  });

  // 4. Curadoria Automática de Mídias
  await test("4. Curadoria de Mídias 4K (/api/pipeline/curate)", async () => {
    const res = await fetch(`${BASE_URL}/api/pipeline/curate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "deep sea abyss creature submarine darkness",
        mediaType: "ALL",
        perPage: 4,
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Curadoria não retornou mídias válidas");
    }
  });

  // 5. Síntese Neural de Voz (TTS)
  await test("5. Síntese de Narração Neural (/api/pipeline/tts)", async () => {
    const res = await fetch(`${BASE_URL}/api/pipeline/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Nas profundezas inexploradas do oceano, a luz solar nunca chega.",
        voiceId: "pt-br-marcos-deep",
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.audioUrl) {
      throw new Error("Falha na geração do áudio TTS neural");
    }
  });

  // 6. Sincronização de Legendas e .SRT
  await test("6. Sincronização de Legendas & Exportação .SRT (/api/pipeline/subtitles)", async () => {
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [
          { sceneOrder: 1, narrationText: "Nas profundezas do oceano, a pressão é esmagadora.", durationSeconds: 8 },
          { sceneOrder: 2, narrationText: "Poucos humanos ousaram descer até aqui.", durationSeconds: 7 },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    const srt = data.srt || data.srtContent;
    if (!data.success || !srt || !srt.includes("-->")) {
      throw new Error("Conteúdo do arquivo .SRT inválido");
    }
  });

  // 7. Fila de Renderização & Concorrência
  let activeJobId = null;
  await test("7. Fila de Renderização FFmpeg (/api/render/queue)", async () => {
    const postRes = await fetch(`${BASE_URL}/api/render/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: generatedProjectId || "test-project-1",
        isPriority: true,
      }),
    });
    if (!postRes.ok) throw new Error(`Status: ${postRes.status}`);
    const postData = await postRes.json();
    if (!postData.success || !postData.job) {
      throw new Error("Falha ao enfileirar job de renderização");
    }
    activeJobId = postData.job.id;

    // Verificar consulta de status da fila
    const getRes = await fetch(`${BASE_URL}/api/render/queue?jobId=${activeJobId}`);
    if (!getRes.ok) throw new Error(`Status da consulta: ${getRes.status}`);
    const getData = await getRes.json();
    if (!getData.success || !getData.job) {
      throw new Error("Job não localizado na consulta");
    }
  });

  // 8. Checkout de Assinatura & Pix
  let checkoutSession = null;
  await test("8. Geração de Checkout & QR Code Pix (/api/billing/checkout)", async () => {
    const res = await fetch(`${BASE_URL}/api/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: "creator",
        billingCycle: "MONTHLY",
        paymentMethod: "PIX",
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.session || !data.session.pixCopyPaste) {
      throw new Error("Sessão de checkout ou código Pix não gerados");
    }
    checkoutSession = data.session;
  });

  // 9. Webhook de Pagamento & Recarga de Minutos
  await test("9. Webhook de Confirmação & Saldo (/api/billing/webhook)", async () => {
    const res = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: checkoutSession?.sessionId || "sim_test",
        planId: "creator",
        amountPaidBRL: 397,
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.result) {
      throw new Error("Falha no processamento do webhook");
    }
  });

  // 10. Publicação Automática no YouTube com Capítulos
  await test("10. Publicação Direta no YouTube (/api/youtube/publish)", async () => {
    const res = await fetch(`${BASE_URL}/api/youtube/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: generatedProjectId || "test-project-1",
        title: "Os Segredos das Fossas Abissais - Documentário Completo",
        description: "Explore as criaturas mais aterrorizantes e fascinantes do fundo dos oceanos.",
        scenes: [
          { number: 1, narration: "Introdução à Zona Hadal", duration: 15 },
          { number: 2, narration: "O Monstro do Fundo da Trincheira", duration: 25 },
          { number: 3, narration: "O Limite da Sobrevivência Humana", duration: 30 },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.result || !data.result.watchUrl) {
      throw new Error("Falha ao gerar publicação no YouTube");
    }
  });

  // 11. Métricas do Canal Dark & Analytics (/api/youtube/analytics)
  await test("11. Métricas do Canal Dark & Analytics (/api/youtube/analytics)", async () => {
    const res = await fetch(`${BASE_URL}/api/youtube/analytics`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.analytics || !data.analytics.retentionCurve) {
      throw new Error("Dados de analytics do canal não retornados");
    }
    if (!Array.isArray(data.analytics.videos) || data.analytics.videos.length === 0) {
      throw new Error("Biblioteca de vídeos publicados vazia");
    }
  });

  // 12. Gestão de Múltiplos Canais Dark & Chaves BYOK (/api/youtube/channels)
  await test("12. Múltiplos Canais Dark & Chaves BYOK (/api/youtube/channels)", async () => {
    // 12.1 Listagem e canal ativo
    const res = await fetch(`${BASE_URL}/api/youtube/channels`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.channels) || data.channels.length === 0) {
      throw new Error("Rede de canais dark não retornada");
    }
    const originalActiveId = data.activeChannel?.id || data.channels[0].id;

    // 12.2 Alternância de canal ativo
    const switchRes = await fetch(`${BASE_URL}/api/youtube/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SWITCH", channelId: data.channels[1].id }),
    });
    if (!switchRes.ok) throw new Error(`Status do switch: ${switchRes.status}`);
    const switchData = await switchRes.json();
    if (!switchData.success) throw new Error("Falha ao alternar canal ativo");

    // 12.3 Salvar chave BYOK customizada
    const keyRes = await fetch(`${BASE_URL}/api/youtube/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SAVE_KEY", service: "openai", key: "sk-custom-test-key-123456" }),
    });
    if (!keyRes.ok) throw new Error(`Status salvar chave: ${keyRes.status}`);
    const keyData = await keyRes.json();
    if (!keyData.success) throw new Error("Falha ao salvar chave BYOK");

    // 12.4 Restauração do canal ativo original
    await fetch(`${BASE_URL}/api/youtube/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SWITCH", channelId: originalActiveId }),
    });
  });

  // 13. Agendamento Automático de Vídeos & Grade Semanal (/api/youtube/schedule)
  await test("13. Agendamento Automático de Vídeos & Grade Semanal (/api/youtube/schedule)", async () => {
    // 13.1 Consulta de agendamentos e slots
    const getRes = await fetch(`${BASE_URL}/api/youtube/schedule`);
    if (!getRes.ok) throw new Error(`Status: ${getRes.status}`);
    const getData = await getRes.json();
    if (!getData.success || !Array.isArray(getData.calendarSlots) || getData.calendarSlots.length === 0) {
      throw new Error("Slots do calendário semanal não retornados");
    }

    // 13.2 Criação de novo agendamento
    const postRes = await fetch(`${BASE_URL}/api/youtube/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: generatedProjectId || "test-project-1",
        title: "Mistérios da Antártida - Lançamento Programado",
        scheduledFor: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        privacyStatus: "public",
      }),
    });
    if (!postRes.ok) throw new Error(`Status do agendamento: ${postRes.status}`);
    const postData = await postRes.json();
    if (!postData.success || !postData.scheduledPost) {
      throw new Error("Falha ao criar publicação agendada");
    }

    // 13.3 Cancelamento do agendamento de teste
    const cancelRes = await fetch(`${BASE_URL}/api/youtube/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL", id: postData.scheduledPost.id }),
    });
    if (!cancelRes.ok) throw new Error(`Status cancelamento: ${cancelRes.status}`);
    const cancelData = await cancelRes.json();
    if (!cancelData.success) throw new Error("Falha ao cancelar publicação agendada");
  });

  // 14. Validação da Nova Landing Page Cinematográfica (Liquid Glass & Video Loop em Português)
  await test("14. Landing Page Cinematográfica Liquid Glass em Português (GET /)", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`Status da página inicial: ${res.status}`);
    const html = await res.text();
    if (!html.includes("viralizam") || !html.includes("LoopX") || !html.includes("Estúdio")) {
      throw new Error("Elementos visuais do design e navegação em português não encontrados no HTML");
    }
  });

  // 15. Autenticação Restrita ao Administrador (/api/auth/login e /api/auth/logout)
  await test("15. Autenticação Restrita ao Administrador (/api/auth/login e /api/auth/logout)", async () => {
    // 15.1 Tentativa com senha curta (< 6 caracteres)
    const failRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@loopx.com", password: "123" }),
    });
    if (failRes.status !== 400) {
      throw new Error(`Esperava status 400 para senha curta, recebeu: ${failRes.status}`);
    }

    // 15.2 Tentativa de login por e-mail não autorizado (não ADM) deve retornar 403
    const unauthorizedRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "intruso@externo.com", password: "senhaqualquer123" }),
    });
    if (unauthorizedRes.status !== 403) {
      throw new Error(`Esperava status 403 para usuário não-ADM, recebeu: ${unauthorizedRes.status}`);
    }

    // 15.3 Tentativa de cadastro público desabilitado deve retornar 403
    const registerBlockedRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@loopx.com", password: "admin123", action: "REGISTER" }),
    });
    if (registerBlockedRes.status !== 403) {
      throw new Error(`Esperava status 403 para cadastro público bloqueado, recebeu: ${registerBlockedRes.status}`);
    }

    // 15.4 Login com credenciais válidas de Administrador (admin@loopx.com)
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@loopx.com",
        password: "admin123",
        action: "LOGIN",
      }),
    });
    if (!adminLoginRes.ok) throw new Error(`Status de login ADM: ${adminLoginRes.status}`);
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success || !adminLoginData.user?.isAdmin || adminLoginData.user?.role !== "ADMIN") {
      throw new Error("Falha na resposta do login de Administrador (role/isAdmin incorretos)");
    }

    // 15.5 Login com credenciais do criador mestre autorizado (criador@loopx.com)
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "criador@loopx.com",
        password: "loopx123",
        action: "LOGIN",
      }),
    });
    if (!loginRes.ok) throw new Error(`Status de login criador: ${loginRes.status}`);
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.user || !loginData.user.id) {
      throw new Error("Falha na resposta do login de criador");
    }

    // 15.6 Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
    });
    if (!logoutRes.ok) throw new Error(`Status do logout: ${logoutRes.status}`);
  });

  // 16. Chaves Reais de Produção & Status de Integrações de IA (/api/youtube/channels)
  await test("16. Chaves de Produção & Status de Integrações (/api/youtube/channels)", async () => {
    const res = await fetch(`${BASE_URL}/api/youtube/channels`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.integrations)) {
      throw new Error("Integrações não retornadas");
    }

    const openAi = data.integrations.find((i) => i.service === "openai");
    const googleAi = data.integrations.find((i) => i.service === "google_ai_studio");
    const unsplash = data.integrations.find((i) => i.service === "unsplash");
    const youtube = data.integrations.find((i) => i.service === "youtube");

    if (!openAi || !openAi.configured) {
      throw new Error("OpenAI não configurada via variáveis de ambiente");
    }
      if (!googleAi || !googleAi.configured) {
        throw new Error("Google AI Studio não configurada via variáveis de ambiente");
      }
        if (!unsplash || !unsplash.configured) {
          throw new Error("Unsplash API não configurada via variáveis de ambiente");
        }
        if (!youtube || !youtube.configured) {
          throw new Error("YouTube Data API v3 não configurada via variáveis de ambiente");
        }
      });

  // 17. Sistema de Testes A/B de Miniaturas e Títulos (/api/youtube/ab-tests)
  await test("17. Sistema de Testes A/B de Miniaturas e Títulos (/api/youtube/ab-tests)", async () => {
    // 17.1 Listagem de experimentos
    const listRes = await fetch(`${BASE_URL}/api/youtube/ab-tests`);
    if (!listRes.ok) throw new Error(`Status: ${listRes.status}`);
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.experiments) || listData.experiments.length === 0) {
      throw new Error("Experimentos A/B não retornados");
    }

    // 17.2 Geração de sugestões com IA
    const aiRes = await fetch(`${BASE_URL}/api/youtube/ab-tests?generate=true&topic=Fossas%20Marianas&title=O%20Abismo`);
    if (!aiRes.ok) throw new Error(`Status da IA: ${aiRes.status}`);
    const aiData = await aiRes.json();
    if (!aiData.success || !aiData.aiSuggestions?.suggestions || aiData.aiSuggestions.suggestions.length < 2) {
      throw new Error("Sugestões de variantes por IA inválidas");
    }

    // 17.3 Criação de novo experimento A/B
    const createRes = await fetch(`${BASE_URL}/api/youtube/ab-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CREATE",
        videoTitle: "O Segredo Proibido das Fossas Abissais",
        variants: [
          {
            title: "O Que a Marinha Encontrou no Fundo da Fossa Mariana",
            thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1280&q=80",
            name: "Variante A",
            hookLabel: "Lacuna de Curiosidade",
          },
          {
            title: "Cientistas Desceram 11.000 Metros e o Radar Registrou Algo",
            thumbnailUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1280&q=80",
            name: "Variante B",
            hookLabel: "Sinal de Alerta & Tensão",
          },
        ],
      }),
    });
    if (!createRes.ok) throw new Error(`Status da criação: ${createRes.status}`);
    const createData = await createRes.json();
    if (!createData.success || !createData.experiment?.id) {
      throw new Error("Falha ao criar experimento A/B");
    }

    const expId = createData.experiment.id;

    // 17.4 Iniciar teste
    const startRes = await fetch(`${BASE_URL}/api/youtube/ab-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "START", experimentId: expId }),
    });
    if (!startRes.ok) throw new Error(`Status de início: ${startRes.status}`);
    const startData = await startRes.json();
    if (!startData.success || startData.experiment.status !== "RUNNING") {
      throw new Error("Falha ao iniciar teste A/B");
    }

    // 17.5 Concluir e aplicar vencedor
    const concludeRes = await fetch(`${BASE_URL}/api/youtube/ab-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CONCLUDE", experimentId: expId }),
    });
    if (!concludeRes.ok) throw new Error(`Status da conclusão: ${concludeRes.status}`);
    const concludeData = await concludeRes.json();
    if (!concludeData.success || concludeData.experiment.status !== "CONCLUDED" || !concludeData.experiment.winnerVariantId) {
      throw new Error("Falha ao eleger vencedor do teste A/B");
    }
  });

  // 18. Menu de Administração: Cadastro de Usuários & Troca de Senha do ADM (/api/admin/users e /api/admin/password)
  await test("18. Menu de Administração: Cadastro de Usuários & Troca de Senha (/api/admin/*)", async () => {
    // 18.1 Listagem de usuários
    const listRes = await fetch(`${BASE_URL}/api/admin/users`);
    if (!listRes.ok) throw new Error(`Status listar usuários: ${listRes.status}`);
    const listData = await listRes.json();
    if (!listData.success || !Array.isArray(listData.users) || listData.users.length === 0) {
      throw new Error("Falha ao obter lista de usuários cadastrados");
    }

    // 18.2 Cadastro de novo usuário pelo ADM
    const newUserEmail = `test.creator.${Date.now()}@loopx.com`;
    const newUserPwd = "senhaForte123";
    const createRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Criador Teste E2E",
        email: newUserEmail,
        password: newUserPwd,
        role: "CREATOR",
        planTier: "CREATOR",
      }),
    });
    if (!createRes.ok) throw new Error(`Status cadastro usuário: ${createRes.status}`);
    const createData = await createRes.json();
    if (!createData.success || !createData.user || createData.user.email !== newUserEmail) {
      throw new Error("Falha ao cadastrar novo usuário");
    }

    // 18.3 Autenticação com o novo usuário recém-cadastrado
    const loginUserRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newUserEmail,
        password: newUserPwd,
        action: "LOGIN",
      }),
    });
    if (!loginUserRes.ok) throw new Error(`Status login novo usuário: ${loginUserRes.status}`);
    const loginUserData = await loginUserRes.json();
    if (!loginUserData.success || loginUserData.user?.email !== newUserEmail) {
      throw new Error("Falha ao logar com o usuário recém-criado");
    }

    // 18.3.1 Validação de Segurança: Usuário comum bloqueado ao tentar login pelo Portal do ADM
    const blockedPortalRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: newUserEmail,
        password: newUserPwd,
        action: "LOGIN",
        portalType: "ADMIN",
      }),
    });
    if (blockedPortalRes.status !== 403) {
      throw new Error(`Esperava 403 ao tentar logar usuario comum pelo Portal do ADM, recebeu: ${blockedPortalRes.status}`);
    }

    // 18.4 Alteração de senha do Administrador
    const changePwdRes = await fetch(`${BASE_URL}/api/admin/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "admin123",
        newPassword: "adminNovaSenha123",
        confirmPassword: "adminNovaSenha123",
      }),
    });
    if (!changePwdRes.ok) throw new Error(`Status trocar senha: ${changePwdRes.status}`);
    const changePwdData = await changePwdRes.json();
    if (!changePwdData.success) throw new Error("Falha ao trocar senha do ADM");

    // 18.5 Validação: senha antiga é rejeitada com 401
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@loopx.com",
        password: "admin123",
        action: "LOGIN",
      }),
    });
    if (oldLoginRes.status !== 401) {
      throw new Error(`Esperava 401 com senha antiga, recebeu ${oldLoginRes.status}`);
    }

    // 18.6 Validação: nova senha é aceita com 200
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@loopx.com",
        password: "adminNovaSenha123",
        action: "LOGIN",
      }),
    });
    if (!newLoginRes.ok) throw new Error(`Status login nova senha: ${newLoginRes.status}`);

    // 18.7 Restauração da senha padrão para manter consistência nos testes
    await fetch(`${BASE_URL}/api/admin/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: "adminNovaSenha123",
        newPassword: "admin123",
        confirmPassword: "admin123",
      }),
    });

    // 18.8 Limpeza do usuário de teste
    const delRes = await fetch(`${BASE_URL}/api/admin/users?email=${encodeURIComponent(newUserEmail)}`, {
      method: "DELETE",
    });
    if (!delRes.ok) throw new Error(`Status deletar usuário de teste: ${delRes.status}`);
  });

  // 19. Motor de Áudio Cinematográfico, Ducking & Efeitos Sonoros (SFX)
  await test("19. Motor de Áudio, Ducking & SFX (/api/pipeline/audio-tracks)", async () => {
    // 19.1 Listagem de trilhas sonoras e SFX
    const res = await fetch(`${BASE_URL}/api/pipeline/audio-tracks`);
    if (!res.ok) throw new Error(`Status audio-tracks: ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.tracks) || data.tracks.length === 0) {
      throw new Error("Trilhas sonoras cinematográficas não retornadas");
    }
    if (!Array.isArray(data.sfxLibrary) || data.sfxLibrary.length === 0) {
      throw new Error("Biblioteca de efeitos sonoros SFX não retornada");
    }

    // 19.2 Sugestão inteligente de SFX e cálculo de Audio Ducking
    const postRes = await fetch(`${BASE_URL}/api/pipeline/audio-tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords: ["radar", "militar"],
        narrationText: "O transponder foi desligado e o radar militar perdeu o contato.",
        isSpeaking: true,
      }),
    });
    if (!postRes.ok) throw new Error(`Status POST audio-tracks: ${postRes.status}`);
    const postData = await postRes.json();
    if (!postData.success || !postData.suggestedSfx || !postData.ducking) {
      throw new Error("Falha na sugestão de SFX ou cálculo de Ducking");
    }
    if (postData.ducking.bgmVolume > 0.20) {
      throw new Error(`Audio Ducking incorreto durante fala: ${postData.ducking.bgmVolume}`);
    }
  });

  console.log("\n=======================================================");
  console.log(`   RESULTADO: ${passed} PASSARAM | ${failed} FALHARAM`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});
