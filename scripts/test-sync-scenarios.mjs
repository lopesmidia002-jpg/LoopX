/**
 * Teste Exaustivo de Sincronização de Áudio, Legendas e FFmpeg
 * Validação de 10 Cenários Críticos via HTTP API no Docker
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runSyncScenarios() {
  console.log("=================================================================");
  console.log("   TESTE DE SINCRONIZAÇÃO DE ÁUDIO & LEGENDAS — 10 CENÁRIOS     ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FALHA: ${message}`);
      failed++;
      throw new Error(message);
    }
  }

  // Cenário 1: Vídeo de 15 segundos (3 cenas de 5s)
  try {
    process.stdout.write("Cenário 1: Vídeo curto de 15 segundos (3 cenas)... ");
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [
          { sceneOrder: 1, durationSeconds: 5, audioDurationSeconds: 4.2, narrationText: "O abismo escuro esconde segredos proibidos." },
          { sceneOrder: 2, durationSeconds: 5, audioDurationSeconds: 4.4, narrationText: "Nenhum sinal de rádio jamais retornou." },
          { sceneOrder: 3, durationSeconds: 5, audioDurationSeconds: 4.1, narrationText: "A verdade foi sepultada no fundo do mar." },
        ],
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success, "Sucesso false");
    assert(data.validationReport?.isValid, "Validação falhou");
    assert(data.validationReport.stats.totalWords === 20, `Total palavras: ${data.validationReport.stats.totalWords}`);
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 2: Vídeo de 30 segundos (2 cenas de 15s)
  try {
    process.stdout.write("Cenário 2: Vídeo de 30 segundos (2 cenas)... ");
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [
          { sceneOrder: 1, durationSeconds: 15, audioDurationSeconds: 13.8, narrationText: "Às 23 horas e 41 minutos, o voo sumiu dos radares sem alerta de emergência militar." },
          { sceneOrder: 2, durationSeconds: 15, audioDurationSeconds: 14.1, narrationText: "Os satélites registraram uma mudança brusca antes do transponder ser desligado." },
        ],
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport?.isValid, "Validação falhou");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 3: Vídeo de 60 segundos (4 cenas de 15s)
  try {
    process.stdout.write("Cenário 3: Vídeo de 60 segundos (4 cenas)... ");
    const scenes3 = Array.from({ length: 4 }).map((_, i) => ({
      sceneOrder: i + 1,
      durationSeconds: 15,
      audioDurationSeconds: 13.5,
      narrationText: `Esta é a sequência documental número ${i + 1} comprovando o alinhamento de timestamps e legendas.`,
    }));
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: scenes3 }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport?.isValid, "Validação falhou");
    assert(data.srt.includes("00:00:5"), "Timeline do SRT não alcança o final de 60s");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 4: Vídeo longo de 2 minutos (8 cenas de 15s)
  try {
    process.stdout.write("Cenário 4: Vídeo de 2 minutos (8 cenas sequenciais)... ");
    const scenes4 = Array.from({ length: 8 }).map((_, i) => ({
      sceneOrder: i + 1,
      durationSeconds: 15,
      audioDurationSeconds: 14.0,
      narrationText: `No capítulo investigativo ${i + 1}, arquivos históricos mostram relatos e gravações confidenciais do mar profundo.`,
    }));
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: scenes4 }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport?.isValid, "Validação falhou");
    assert(data.validationReport.stats.totalVideoDuration === 120, "Duração total diferente de 120s");
    assert(data.srt.includes("00:01:"), "Faltam marcações no segundo minuto");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 5: Narração rápida (alta cadência)
  try {
    process.stdout.write("Cenário 5: Narração rápida (alta cadência)... ");
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [{ sceneOrder: 1, durationSeconds: 5, audioDurationSeconds: 3.8, narrationText: "O alarme disparou rapidamente alertando toda a tripulação na cabine escura." }],
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.syncedScenes[0].subtitles.length > 0, "Falha na sincronia");
    const firstWord = data.syncedScenes[0].subtitles[0];
    const lastWord = data.syncedScenes[0].subtitles[data.syncedScenes[0].subtitles.length - 1];
    assert(firstWord.start >= 0.15, "Início adiantado");
    assert(lastWord.end <= 3.9, "Fim ultrapassou fala rápida");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 6: Narração lenta e dramática
  try {
    process.stdout.write("Cenário 6: Narração lenta e dramática... ");
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [{ sceneOrder: 1, durationSeconds: 8, audioDurationSeconds: 6.5, narrationText: "E então... silêncio absoluto. Nada mais foi visto." }],
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport.isValid, "Falha na fala lenta");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 7: Textos longos por cena (85 palavras)
  try {
    process.stdout.write("Cenário 7: Texto longo documental (85 palavras)... ");
    const longText = "Documentos confidenciais recentemente liberados pelos arquivos militares revelam que expedições secretas foram enviadas para investigar anomalias acústicas no fundo da fossa abissal. Sensores de sonar de altíssima frequência registraram ecos que não correspondiam a nenhuma formação geológica conhecida ou submarino militar registrado nos anais das forças armadas da época. Até hoje os dados originais permanecem sob sigilo governamental rigoroso, desafiando qualquer explicação convencional dos cientistas da época e levantando mistérios insondáveis para a humanidade.";
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [{ sceneOrder: 1, durationSeconds: 40, audioDurationSeconds: 35, narrationText: longText }],
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport.isValid, "Falha no texto longo");
    assert(data.validationReport.stats.totalPhrases >= 12, "Frases insuficientes");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 8: Pontuação complexa e pausas dramáticas
  try {
    process.stdout.write("Cenário 8: Pontuação complexa com travessões e pausas... ");
    const complexText = "Atenção: o radar — após horas mudo — emitiu um pulso! Você ouviu? Não... foi tarde demais.";
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenes: [{ sceneOrder: 1, durationSeconds: 10, audioDurationSeconds: 8, narrationText: complexText }],
      }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport.isValid, "Falha na pontuação complexa");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 9: Segmentação multi-cenas acumulada (10 cenas)
  try {
    process.stdout.write("Cenário 9: Segmentação multi-cenas acumulada (10 cenas)... ");
    const scenes10 = Array.from({ length: 10 }).map((_, i) => ({
      sceneOrder: i + 1,
      durationSeconds: 10,
      audioDurationSeconds: 9.2,
      narrationText: `Esta é a cena documental ${i + 1} relatando fatos misteriosos em ordem estrita.`,
    }));
    const res = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: scenes10 }),
    });
    assert(res.ok, `Status ${res.status}`);
    const data = await res.json();
    assert(data.success && data.validationReport.isValid, "Falha na validação de 10 cenas");
    assert(data.validationReport.stats.totalScenes === 10, "Contagem de cenas incorreta");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  // Cenário 10: Exportação combinada .SRT, .ASS e Renderização FFmpeg
  try {
    process.stdout.write("Cenário 10: Renderização multi-pistas FFmpeg e exportação ASS/SRT... ");
    const testScenes = [
      { id: "s1", sceneOrder: 1, durationSeconds: 6, audioDurationSeconds: 5.2, narrationText: "O abismo oceânico não tem fundo.", mediaUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5" },
      { id: "s2", sceneOrder: 2, durationSeconds: 6, audioDurationSeconds: 5.4, narrationText: "O que habita lá embaixo nos observa.", mediaUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b" },
    ];
    const resSub = await fetch(`${BASE_URL}/api/pipeline/subtitles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: testScenes }),
    });
    const dataSub = await resSub.json();
    assert(dataSub.srt.includes("-->"), "SRT inválido");
    assert(dataSub.assContent.includes("Style: DarkYellow"), "ASS sem estilo DarkYellow");

    const resRender = await fetch(`${BASE_URL}/api/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "Teste Sincronia", scenes: testScenes }),
    });
    assert(resRender.ok, "POST /api/render falhou");
    const dataRender = await resRender.json();
    assert(dataRender.success && dataRender.renderJobId, "Job de render não retornado");
    console.log("✅ OK");
    passed++;
  } catch (e) {
    console.error(e.message);
  }

  console.log("\n=================================================================");
  console.log(`   RESULTADO SINCRONIA: ${passed} PASSARAM | ${failed} FALHARAM`);
  console.log("=================================================================\n");

  if (failed > 0) process.exit(1);
}

runSyncScenarios().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
