"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Play,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Users,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get("tab") === "user" ? "USER" : "ADMIN";

  const [tab, setTab] = useState<"ADMIN" | "USER">(initialTabParam);
  const [email, setEmail] = useState(initialTabParam === "ADMIN" ? "admin@loopx.com" : "");
  const [password, setPassword] = useState(initialTabParam === "ADMIN" ? "admin123" : "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

      const redirectTarget = searchParams?.get("redirect") || "/studio";
      setSuccessMessage(
        data.message ||
        (tab === "ADMIN"
          ? "Acesso de administrador autorizado!"
          : "Acesso de usuário autorizado com sucesso!")
      );
      setTimeout(() => {
        router.push(redirectTarget);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao conectar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.06)_0%,_transparent_70%)] pointer-events-none" />

      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 z-10 group">
        <div className="w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
          <Play className="w-4 h-4 text-amber-400 fill-amber-400 ml-0.5" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white font-sans">
          Loop<span className="text-amber-400">X</span>
        </span>
      </Link>

      {/* Form Card */}
      <div className="liquid-glass rounded-3xl w-full max-w-md p-6 sm:p-8 relative border border-white/20 shadow-2xl backdrop-blur-2xl z-10">
        {/* Tab Switcher: Portal do ADM vs Acesso a Usuários */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl liquid-glass border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => handleSelectTab("ADMIN")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${tab === "ADMIN"
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
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer ${tab === "USER"
              ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm"
              : "text-white/60 hover:text-white"
              }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Acesso a Usuários</span>
          </button>
        </div>

        <div className="text-center mb-6">
          {tab === "ADMIN" ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-amber-300 border border-amber-500/30 mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal do ADM • Login & Senha Exclusivos</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Portal do Administrador
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5">
                Acesso restrito exclusivamente ao login e senha do Administrador do LoopX.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-purple-300 border border-purple-500/30 mb-2.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Acesso a Usuários • Contas Cadastradas</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Acesso de Usuários
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5">
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
              Contas de novos usuários são criadas e gerenciadas exclusivamente pelo Administrador.
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
              {tab === "ADMIN" ? "Login ou E-mail do Administrador" : "E-mail do Usuário Cadastrado"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={tab === "ADMIN" ? "admin ou admin@loopx.com" : "seu-email@criador.com"}
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border outline-none transition-colors ${tab === "ADMIN"
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
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border outline-none transition-colors ${tab === "ADMIN"
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

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Voltar para a Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
