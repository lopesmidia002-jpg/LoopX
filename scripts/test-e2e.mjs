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
