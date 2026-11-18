"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Lock, Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck, ShieldAlert } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "LOGIN" | "REGISTER";
}

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleFillAdmin = () => {
    setEmail("admin@loopx.com");
    setPassword("admin123");
    setErrorMessage("");
  };

  const handleFillCreator = () => {
    setEmail("criador@loopx.com");
    setPassword("loopx123");
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
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Acesso negado. Credenciais inválidas.");
      }

      setSuccessMessage(data.message || "Acesso de administrador autorizado!");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto min-h-screen animate-fade-in">
      {/* Modal Container */}
      <div className="liquid-glass rounded-3xl w-full max-w-md p-6 sm:p-8 relative border border-white/20 shadow-2xl backdrop-blur-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-amber-300 border border-amber-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Área Restrita • Acesso ADM Exclusivo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Autenticação ADM
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1.5">
            Acesso restrito exclusivamente ao administrador e operadores autorizados do LoopX.
          </p>
        </div>

        {/* Notice Info Box */}
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Cadastros públicos suspensos. Somente credenciais de administrador autorizadas possuem permissão de acesso ao Estúdio.
          </span>
        </div>

        {/* Quick Admin Access Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={handleFillAdmin}
            className="text-[11px] text-amber-300 hover:text-white py-2 px-2.5 rounded-lg liquid-glass border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>ADM (admin123)</span>
          </button>
          <button
            type="button"
            onClick={handleFillCreator}
            className="text-[11px] text-purple-300 hover:text-white py-2 px-2.5 rounded-lg liquid-glass border border-purple-500/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Criador (loopx123)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              E-mail do Administrador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loopx.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border border-white/10 focus:border-amber-400/60 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Senha de Segurança
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border border-white/10 focus:border-amber-400/60 outline-none"
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-black font-extrabold text-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Validando Acesso ADM...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Entrar no Painel ADM</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-white/40">
            Sessão criptografada de alta segurança. Tentativas de acesso não autorizadas são registradas e bloqueadas.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
