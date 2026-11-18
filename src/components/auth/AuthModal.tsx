"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Users,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "ADMIN" | "USER";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "ADMIN",
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"ADMIN" | "USER">(initialTab);
  const [email, setEmail] = useState("admin@loopx.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
      if (initialTab === "ADMIN") {
        setEmail("admin@loopx.com");
        setPassword("admin123");
      } else {
        setEmail("");
        setPassword("");
      }
      setErrorMessage("");
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSelectTab = (selectedTab: "ADMIN" | "USER") => {
    setTab(selectedTab);
    setErrorMessage("");
    setSuccessMessage("");
    if (selectedTab === "ADMIN") {
      setEmail("admin@loopx.com");
      setPassword("admin123");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleFillAdmin = () => {
    setEmail("admin@loopx.com");
    setPassword("admin123");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOGIN",
          portalType: tab,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Acesso negado. Credenciais inválidas.");
      }

      setSuccessMessage(
        data.message ||
          (tab === "ADMIN"
            ? "Acesso de administrador autorizado!"
            : "Acesso de usuário autorizado com sucesso!")
      );
      setTimeout(() => {
        onClose();
        router.push("/studio");
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao conectar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto min-h-screen animate-fade-in">
      {/* Modal Container */}
      <div className="liquid-glass rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-8 relative border border-white/20 shadow-2xl backdrop-blur-2xl my-0 sm:my-auto pb-safe">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Fechar"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher: Portal do ADM vs Acesso a Usuários */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl liquid-glass border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => handleSelectTab("ADMIN")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
              tab === "ADMIN"
                ? "bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Portal do ADM</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab("USER")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${
              tab === "USER"
                ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Acesso a Usuários</span>
          </button>
        </div>

        {/* Header Branding based on Tab */}
        <div className="text-center mb-5 sm:mb-6">
          {tab === "ADMIN" ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-amber-300 border border-amber-500/30 mb-2 sm:mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal do ADM • Login & Senha Exclusivos</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Portal do Administrador
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Acesso restrito exclusivamente ao login e senha do Administrador do LoopX.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-purple-300 border border-purple-500/30 mb-2 sm:mb-2.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Acesso a Usuários • Contas Cadastradas</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Acesso de Usuários
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Entre com o e-mail e senha cadastrados pelo administrador do LoopX.
              </p>
            </>
          )}
        </div>

        {/* Info Box */}
        {tab === "ADMIN" ? (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Para acessar o portal do ADM utilize somente o seu login e senha mestra.
            </span>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2 text-xs text-purple-200">
            <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              Contas de novos usuários são criadas e homologadas exclusivamente pelo Administrador no menu ADM.
            </span>
          </div>
        )}

        {/* Admin Quick Fill (Only visible on Admin tab) */}
        {tab === "ADMIN" && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="w-full text-xs text-amber-300 hover:text-white py-2.5 px-3 rounded-xl liquid-glass border border-amber-500/30 flex items-center justify-center gap-2 transition-colors min-h-[44px] active:scale-95 shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Preencher Meu Acesso ADM (admin@loopx.com)</span>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {tab === "ADMIN" ? "E-mail do Administrador" : "E-mail do Usuário Cadastrado"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tab === "ADMIN" ? "admin@loopx.com" : "seu-email@criador.com"}
                required
                className={`w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl liquid-glass text-white text-base sm:text-sm placeholder:text-white/30 border outline-none min-h-[44px] transition-colors ${
                  tab === "ADMIN"
                    ? "border-white/10 focus:border-amber-400/60"
                    : "border-white/10 focus:border-purple-400/60"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {tab === "ADMIN" ? "Senha do Administrador" : "Senha de Acesso"}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className={`w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl liquid-glass text-white text-base sm:text-sm placeholder:text-white/30 border outline-none min-h-[44px] transition-colors ${
                  tab === "ADMIN"
                    ? "border-white/10 focus:border-amber-400/60"
                    : "border-white/10 focus:border-purple-400/60"
                }`}
              />
            </div>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMessage} Redirecionando...</span>
            </div>
          )}

          {/* Submit */}
          {tab === "ADMIN" ? (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-black font-extrabold text-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Validando Acesso do ADM...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>Entrar no Portal ADM</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent text-white font-extrabold text-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-brand-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Autenticando Usuário...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 text-white" />
                  <span>Entrar no Estúdio</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          )}
        </form>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-white/40">
            {tab === "ADMIN"
              ? "Sessão mestra do administrador. Tentativas não autorizadas são bloqueadas."
              : "Não possui acesso? O cadastro é liberado exclusivamente pelo administrador."}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
