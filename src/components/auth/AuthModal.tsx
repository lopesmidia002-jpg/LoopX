"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, Mail, User, Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "LOGIN" | "REGISTER";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "LOGIN",
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setEmail("criador@loopx.com");
    setPassword("loopx123");
    setName("Criador Dark Studio");
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
          action: mode,
          email,
          password,
          name: mode === "REGISTER" ? name : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Falha na autenticação.");
      }

      setSuccessMessage(data.message || "Acesso autorizado!");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div className="liquid-glass rounded-3xl w-full max-w-md p-6 sm:p-8 relative border border-white/20 shadow-2xl backdrop-blur-2xl">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs font-semibold text-white/80 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Acesso ao Estúdio LoopX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === "LOGIN" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            {mode === "LOGIN"
              ? "Entre com seu e-mail e senha para gerenciar seus vídeos."
              : "Comece a criar vídeos documentários de alta retenção."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-full p-1 liquid-glass mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
              mode === "LOGIN"
                ? "bg-white text-black shadow-lg"
                : "text-white/70 hover:text-white"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("REGISTER");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
              mode === "REGISTER"
                ? "bg-white text-black shadow-lg"
                : "text-white/70 hover:text-white"
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Quick Demo Credentials Filler */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full text-xs text-purple-300 hover:text-purple-200 py-1.5 px-3 rounded-lg liquid-glass border border-purple-500/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preencher Acesso Demo (1-Clique)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "REGISTER" && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Nome do Criador ou Canal
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Canal Mistérios do Mundo"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border border-white/10 focus:border-white/40 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border border-white/10 focus:border-white/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Senha (mínimo 6 caracteres)
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass text-white text-sm placeholder:text-white/30 border border-white/10 focus:border-white/40 outline-none"
              />
            </div>
          </div>

          {/* Feedback messages */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>{mode === "LOGIN" ? "Acessar Estúdio" : "Criar Conta & Acessar"}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
