"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Tv,
  ChevronDown,
  Check,
  Plus,
  Radio,
  ExternalLink,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { DarkChannel } from "@/lib/youtube/channel-manager";

interface ChannelSelectorProps {
  onChannelChanged?: (channel: DarkChannel) => void;
}

export default function ChannelSelector({ onChannelChanged }: ChannelSelectorProps) {
  const [channels, setChannels] = useState<DarkChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<DarkChannel | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New channel form state
  const [newName, setNewName] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [newNiche, setNewNiche] = useState("Histórias de Crimes Reais & Mistérios");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/youtube/channels");
      const data = await res.json();
      if (data.success && data.channels) {
        setChannels(data.channels);
        setActiveChannel(data.activeChannel || data.channels[0]);
      }
    } catch (e) {
      console.error("Erro ao carregar canais:", e);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectChannel = async (channel: DarkChannel) => {
    try {
      setActiveChannel(channel);
      setIsOpen(false);
      await fetch("/api/youtube/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SWITCH", channelId: channel.id }),
      });
      if (onChannelChanged) onChannelChanged(channel);
    } catch (e) {
      console.error("Erro ao trocar canal:", e);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedHandle = newHandle.trim();
    if (!trimmedHandle) {
      setErrorMessage("Por favor, informe o @handle do seu canal no YouTube.");
      return;
    }

    const formattedHandle = trimmedHandle.startsWith("@") ? trimmedHandle : `@${trimmedHandle}`;
    const channelName = newName.trim() || formattedHandle.replace(/^@/, "");

    setLoading(true);

    try {
      const res = await fetch("/api/youtube/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: channelName,
          handle: formattedHandle,
          niche: newNiche,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Não foi possível vincular o canal.");
        return;
      }

      if (data.channel) {
        setChannels((prev) => [...prev, data.channel]);
        setActiveChannel(data.channel);
        setIsModalOpen(false);
        setNewName("");
        setNewHandle("");
        setErrorMessage(null);
        if (onChannelChanged) onChannelChanged(data.channel);
      }
    } catch (e: any) {
      console.error("Erro ao criar canal:", e);
      setErrorMessage(e?.message || "Erro de conexão ao vincular o canal.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeChannel) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Current Channel Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface border border-surface-border hover:border-brand-500/40 transition-all text-xs font-semibold text-white group"
        title="Alternar canal dark ativo"
      >
        <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-brand-500/40 shadow-sm">
          <img
            src={activeChannel.avatarUrl}
            alt={activeChannel.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="font-bold text-white max-w-[130px] truncate">
              {activeChannel.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform duration-200" />
          </div>
          <span className="text-[10px] text-brand-300 font-mono">
            {activeChannel.subscribers.toLocaleString("pt-BR")} inscritos
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#141923] border border-surface-border shadow-2xl p-2 z-50 animate-fadeIn divide-y divide-surface-border/60">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sua Rede de Canais Dark
          </div>

          <div className="py-1 space-y-1">
            {channels.map((ch) => {
              const isSelected = ch.id === activeChannel.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-brand-600/20 border border-brand-500/30 text-white"
                      : "hover:bg-white/[0.04] text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={ch.avatarUrl}
                      alt={ch.name}
                      className="w-8 h-8 rounded-lg object-cover shrink-0 border border-surface-border"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{ch.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{ch.niche}</p>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setErrorMessage(null);
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/25 text-brand-300 hover:text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Novo Canal Dark</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Vincular Novo Canal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 flex min-h-full items-center justify-center">
          <div className="relative w-full max-w-md bg-surface border border-surface-border rounded-2xl p-6 shadow-2xl animate-fadeIn my-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Tv className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Vincular Canal Dark do YouTube</h3>
                <p className="text-xs text-slate-400">Defina o nicho e metadados automáticos</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome do Canal <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>:
                </label>
                <input
                  type="text"
                  placeholder="Ex: O Observador (ou preenchido pelo handle)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#141923] border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Handle do YouTube <span className="text-brand-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="@Oobservador-rw2gq"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="w-full bg-[#141923] border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nicho Principal de Conteúdo:
                </label>
                <select
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  className="w-full bg-[#141923] border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Histórias de Crimes Reais & Mistérios">
                    Histórias de Crimes Reais & Mistérios
                  </option>
                  <option value="Mistérios Históricos & Conspirações">
                    Mistérios Históricos & Conspirações
                  </option>
                  <option value="Criaturas Abissais & Natureza Selvagem">
                    Criaturas Abissais & Natureza Selvagem
                  </option>
                  <option value="Astronomia, Espaço & Ficção Científica">
                    Astronomia, Espaço & Ficção Científica
                  </option>
                  <option value="Geopolítica, Guerras & Estratégia Militar">
                    Geopolítica, Guerras & Estratégia Militar
                  </option>
                  <option value="Top 10 Fatos Curiosos & Recordes Mundiais">
                    Top 10 Fatos Curiosos & Recordes Mundiais
                  </option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-xs font-medium text-slate-300 border border-surface-border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-accent hover:opacity-90 text-xs font-bold text-white shadow-lg shadow-brand-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Vincular Canal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
