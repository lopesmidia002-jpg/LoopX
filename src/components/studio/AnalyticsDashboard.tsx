"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Eye,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  Video,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ShieldCheck,
  Play,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { ChannelAnalyticsOverview } from "@/lib/youtube/analytics";
import { DarkChannel } from "@/lib/youtube/channel-manager";
import { formatCurrencyBRL } from "@/lib/utils";

interface AnalyticsDashboardProps {
  onNewProject: () => void;
  activeChannel?: DarkChannel | null;
}

function formatNumber(val: number): string {
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 10000) {
    return `${(val / 1000).toFixed(1)}k`;
  }
  return val.toLocaleString("pt-BR");
}

function formatWatchTime(hours: number): string {
  if (hours >= 1000) {
    return `${(hours / 1000).toFixed(1)}k hrs`;
  }
  return `${hours.toLocaleString("pt-BR")} hrs`;
}

function formatSubscribersGained(subs: number): string {
  if (subs >= 1000) {
    return `+${(subs / 1000).toFixed(1)}k`;
  }
  return `+${subs.toLocaleString("pt-BR")}`;
}

export default function AnalyticsDashboard({ onNewProject, activeChannel }: AnalyticsDashboardProps) {
  const [data, setData] = useState<ChannelAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const url = activeChannel?.id
          ? `/api/youtube/analytics?channelId=${encodeURIComponent(activeChannel.id)}`
          : "/api/youtube/analytics";

        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.analytics) {
          setData(json.analytics);
        } else {
          setError(json.error || "Não foi possível carregar as métricas do canal.");
        }
      } catch (err: any) {
        console.error("Falha ao buscar analytics:", err);
        setError(err?.message || "Erro de conexão ao carregar métricas.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeChannel?.id]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Carregando métricas consolidadas do canal...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-white">Falha ao consultar métricas do canal</p>
        <p className="text-xs text-slate-400 max-w-sm">{error}</p>
        <button
          onClick={() => fetchAnalytics(true)}
          className="mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!data) return null;

  const displayAvatar = activeChannel?.avatarUrl || data.avatarUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Channel Bar */}
      <div className="glass-surface p-6 rounded-2xl border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-lg shadow-brand-500/20 overflow-hidden shrink-0">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={data.channelName}
                className="w-full h-full object-cover rounded-[14px]"
              />
            ) : (
              <div className="w-full h-full bg-[#131822] rounded-[14px] flex items-center justify-center text-brand-300 font-extrabold text-xl">
                LX
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{data.channelName}</h2>
              {data.handle && (
                <span className="bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {data.handle}
                </span>
              )}
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Monetizado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.subscriberCount.toLocaleString("pt-BR")} inscritos totais • Média de CTR: {data.averageCTR}%
              {data.niche ? ` • Nicho: ${data.niche}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="px-3.5 py-2.5 bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 min-h-[44px]"
            title="Atualizar métricas em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Atualizando..." : "Sincronizar"}</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Produzir Novo Vídeo com IA</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Views */}
        <div className="glass-surface p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Visualizações (30d)</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {formatNumber(data.totalViews30d)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +28.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Crescimento acelerado no nicho Dark</p>
        </div>

        {/* Card 2: Watch Time */}
        <div className="glass-surface p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Tempo de Exibição</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {formatWatchTime(data.watchTimeHours30d)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +32.1%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Retenção média sustentada em 57%</p>
        </div>

        {/* Card 3: Estimated Revenue */}
        <div className="glass-surface p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Receita Estimada (30d)</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCurrencyBRL(data.estimatedRevenueBRL30d)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +35.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">RPM médio do canal: R$ 15,00/mil</p>
        </div>

        {/* Card 4: Subscribers Gained */}
        <div className="glass-surface p-5 rounded-xl border border-surface-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Novos Inscritos (30d)</span>
            <span className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {formatSubscribersGained(data.subscribersGained30d)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +19.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Conversão de audiência em fãs</p>
        </div>
      </div>

      {/* Middle Row: Audience Retention Curve & AI Optimization Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Retention Curve Card (2 cols) */}
        <div className="lg:col-span-2 glass-surface p-6 rounded-2xl border border-surface-border space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                <span>Curva de Retenção de Audiência por Ato Narrativo</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Como os efeitos visuais e o ritmo sonoro mantêm a atenção ao longo dos 12 minutos
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
              Média: {data.averageRetention}%
            </span>
          </div>

          {/* Retention Steps Visual Progression */}
          <div className="space-y-4 pt-2">
            {data.retentionCurve.map((point, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{point.stage}</span>
                    <span className="font-mono text-[11px] text-slate-400">({point.timestamp})</span>
                  </div>
                  <span className="font-mono font-extrabold text-brand-300">
                    {point.retentionPercent}%
                  </span>
                </div>

                {/* Progress Bar with Gradient */}
                <div className="w-full h-2.5 bg-[#141923] rounded-full overflow-hidden border border-surface-border/60">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent rounded-full transition-all duration-700"
                    style={{ width: `${point.retentionPercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  ↳ {point.insight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations (1 col) */}
        <div className="glass-surface p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-b from-brand-950/30 via-surface to-surface flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Dicas da IA LoopX</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Otimizações Recomendadas para os Próximos Vídeos
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Baseadas no comportamento de {formatNumber(data.totalViews30d)} espectadores no nicho {data.niche || "Dark"}.
            </p>

            <ul className="mt-4 space-y-3">
              {data.aiOptimizationTips.map((tip, tIdx) => (
                <li key={tIdx} className="text-xs text-slate-300 p-3 rounded-xl bg-[#141923] border border-surface-border flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onNewProject}
            className="w-full py-2.5 bg-surface hover:bg-surface-hover text-brand-300 hover:text-white border border-brand-500/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>Aplicar no Próximo Roteiro</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Bottom Table: Published Videos Library */}
      <div className="glass-surface rounded-2xl border border-surface-border overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-brand-400" />
              <span>Vídeos Recentes Publicados pelo LoopX</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Acompanhamento de retenção, taxa de cliques (CTR) e receita estimada
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Vídeo</th>
                <th className="pb-3 font-semibold">Formato</th>
                <th className="pb-3 font-semibold">Visualizações</th>
                <th className="pb-3 font-semibold">CTR</th>
                <th className="pb-3 font-semibold">Retenção</th>
                <th className="pb-3 font-semibold">Receita</th>
                <th className="pb-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {data.videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-surface-border">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white line-clamp-1">{vid.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {vid.publishedAt} • {vid.avgDurationMinutes} min
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 pr-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-surface-border text-brand-300">
                      {vid.format === "DOCUMENTARY" ? "Documentário" : "Top 10"}
                    </span>
                  </td>

                  <td className="py-3.5 pr-4 font-mono font-bold text-white">
                    {vid.views.toLocaleString("pt-BR")}
                  </td>

                  <td className="py-3.5 pr-4 font-mono font-semibold text-emerald-400">
                    {vid.ctrPercent}%
                  </td>

                  <td className="py-3.5 pr-4 font-mono font-semibold text-brand-300">
                    {vid.avgRetentionPercent}%
                  </td>

                  <td className="py-3.5 pr-4 font-mono font-bold text-emerald-400">
                    {formatCurrencyBRL(vid.estimatedRevenueBRL)}
                  </td>

                  <td className="py-3.5 text-right">
                    <a
                      href={vid.watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-all"
                    >
                      <span>Assistir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
