"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Shield,
  Loader2,
  Tv,
} from "lucide-react";
import { ScheduledPost, CalendarSlot } from "@/lib/youtube/scheduler";

interface ScheduleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultProjectId?: string;
}

export default function ScheduleCalendarModal({
  isOpen,
  onClose,
  defaultTitle = "Documentário Sem Título",
  defaultProjectId = "proj-current",
}: ScheduleCalendarModalProps) {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [privacyStatus, setPrivacyStatus] = useState<"public" | "unlisted" | "private">("public");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/youtube/schedule");
      const data = await res.json();
      if (data.success) {
        setScheduledPosts(data.scheduledPosts || []);
        setCalendarSlots(data.calendarSlots || []);
      }
    } catch (e) {
      console.error("Erro ao buscar agendamentos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchedule();
    }
  }, [isOpen]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/youtube/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: defaultProjectId,
          title: defaultTitle,
          scheduledFor: scheduledDate,
          privacyStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Vídeo agendado com sucesso!");
        fetchSchedule();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (e) {
      console.error("Erro ao agendar:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch("/api/youtube/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL", id }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Erro ao cancelar:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Calendar className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">Grade Semanal & Agendamento YouTube</h3>
            <p className="text-xs text-slate-400">
              Horários de pico de retenção para canais Dark e postagens programadas
            </p>
          </div>
        </div>

        {/* Weekly Best Time Slots */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Melhores Horários de Retenção (Seg - Dom)
            </span>
            <span className="text-[11px] text-brand-300 font-mono">Algoritmo YouTube 2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {calendarSlots.map((slot, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  slot.scheduledPost
                    ? "bg-brand-600/20 border-brand-500/50 text-white"
                    : slot.retentionScore >= 95
                    ? "bg-emerald-500/10 border-emerald-500/30 text-slate-200"
                    : "bg-[#141923] border-surface-border text-slate-400"
                }`}
              >
                <p className="text-[10px] font-bold uppercase truncate">{slot.dayOfWeek.slice(0, 3)}</p>
                <p className="text-xs font-mono font-bold mt-1 text-white">{slot.recommendedTime}</p>
                <div className="mt-1 flex items-center justify-center gap-0.5 text-[10px] font-mono text-emerald-400">
                  <span>{slot.retentionScore}%</span>
                </div>
                {slot.scheduledPost && (
                  <span className="inline-block mt-1 w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form to Schedule Current Video */}
        <div className="p-4 rounded-xl bg-[#141923] border border-surface-border mb-6">
          <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Agendar Este Vídeo: {defaultTitle}</span>
          </h4>

          {successMessage && (
            <div className="p-3 mb-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Data e Hora:</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs font-mono bg-surface border border-surface-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Visibilidade:</label>
              <select
                value={privacyStatus}
                onChange={(e) => setPrivacyStatus(e.target.value as any)}
                className="w-full text-xs bg-surface border border-surface-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
              >
                <option value="public">Público (Publicação Imediata)</option>
                <option value="unlisted">Não Listado</option>
                <option value="private">Privado</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-gradient-to-r from-brand-600 to-brand-accent hover:opacity-90 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Confirmar Agendamento</span>
              </button>
            </div>
          </form>
        </div>

        {/* Active Scheduled Posts Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Fila de Publicações Programadas ({scheduledPosts.length})
            </span>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
              <span>Carregando postagens...</span>
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#141923] border border-surface-border text-xs text-slate-400">
              Nenhum vídeo agendado no momento. Use o formulário acima para programar o próximo lançamento.
            </div>
          ) : (
            <div className="divide-y divide-surface-border/60 rounded-xl bg-[#141923] border border-surface-border overflow-hidden">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="w-14 h-9 rounded object-cover border border-surface-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{post.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="text-brand-300 font-semibold">{post.channelName}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-400">
                          {new Date(post.scheduledFor).toLocaleString("pt-BR")}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancel(post.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="Cancelar agendamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-xs font-semibold text-slate-200 border border-surface-border transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
