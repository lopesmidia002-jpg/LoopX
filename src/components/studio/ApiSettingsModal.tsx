"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Key,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Lock,
  Save,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { ApiServiceStatus } from "@/lib/youtube/channel-manager";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiSettingsModal({ isOpen, onClose }: ApiSettingsModalProps) {
  const [integrations, setIntegrations] = useState<ApiServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInput, setActiveInput] = useState<{ [key: string]: string }>({});
  const [savingService, setSavingService] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    async function loadStatus() {
      try {
        setLoading(true);
        const res = await fetch("/api/youtube/channels");
        const data = await res.json();
        if (data.success && data.integrations) {
          setIntegrations(data.integrations);
        }
      } catch (e) {
        console.error("Erro ao carregar APIs:", e);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, [isOpen]);

  const handleSaveKey = async (service: string) => {
    const key = activeInput[service];
    if (!key) return;

    try {
      setSavingService(service);
      const res = await fetch("/api/youtube/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_KEY", service, key }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(service);
        setTimeout(() => setSavedSuccess(null), 2500);
        // Recarregar status
        const refresh = await fetch("/api/youtube/channels");
        const refreshData = await refresh.json();
        if (refreshData.success && refreshData.integrations) {
          setIntegrations(refreshData.integrations);
        }
        setActiveInput((prev) => ({ ...prev, [service]: "" }));
      }
    } catch (e) {
      console.error("Erro ao salvar chave:", e);
    } finally {
      setSavingService(null);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex min-h-screen items-center justify-center">
      <div className="relative w-full max-w-2xl bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Key className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">Chaves de API & Produção</h3>
            <p className="text-xs text-slate-400">
              Gerencie integrações nativas do LoopX ou utilize suas próprias credenciais (BYOK)
            </p>
          </div>
        </div>

        {/* Informative Note */}
        <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200 flex items-start gap-2.5 mb-6">
          <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <span>
            Por padrão, todos os serviços utilizam o <strong>LoopX Vault 4K</strong> integrado e as variáveis de ambiente ativas no contêiner Docker. Você pode inserir suas chaves privadas para faturar diretamente em suas contas de fornecedores.
          </span>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            <p className="text-xs">Consultando status das credenciais...</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {integrations.map((item) => (
              <div
                key={item.service}
                className="p-4 rounded-xl bg-[#141923] border border-surface-border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        item.source === "CUSTOM_BYOK"
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : item.source === "ENVIRONMENT"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {item.source}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    {item.maskedKey}
                  </span>
                </div>

                {/* Input for Custom Key */}
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder={`Inserir chave personalizada para ${item.service}...`}
                    value={activeInput[item.service] || ""}
                    onChange={(e) =>
                      setActiveInput({
                        ...activeInput,
                        [item.service]: e.target.value,
                      })
                    }
                    className="w-full text-xs font-mono bg-surface border border-surface-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleSaveKey(item.service)}
                    disabled={!activeInput[item.service] || savingService === item.service}
                    className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-40 disabled:hover:bg-brand-600"
                  >
                    {savingService === item.service ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : savedSuccess === item.service ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savedSuccess === item.service ? "Salvo!" : "Aplicar"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Ambiente Seguro: Docker Container • Criptografia AES-256
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-xs font-semibold text-slate-200 border border-surface-border transition-all"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
