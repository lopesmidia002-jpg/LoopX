"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Users,
  Key,
  Layers,
  Lock,
  Loader2,
} from "lucide-react";
import AdminManagementModal from "@/components/studio/AdminManagementModal";

export default function AdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user?.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10141d] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#10141d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-md w-full text-center space-y-6 liquid-glass p-8 rounded-3xl border border-amber-500/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
              ACESSO RESTRITO
            </span>
            <h1 className="text-2xl font-bold mt-3">Portal do Administrador</h1>
            <p className="text-xs text-slate-400 mt-2">
              Para acessar o portal do ADM deixe somente o login e senha do Administrador. Usuários cadastrados devem utilizar o Acesso de Usuários para o Estúdio.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/login?tab=admin"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-black font-extrabold text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Entrar com Login e Senha do ADM</span>
            </Link>

            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Estúdio de Criação</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10141d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono font-bold border border-amber-500/30">
            PORTAL ADMINISTRATIVO
          </span>
          <h1 className="text-2xl font-bold mt-3">Console do Administrador LoopX</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie os criadores homologados, cadastre novas contas e atualize a chave mestra de segurança.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-4 rounded-xl bg-surface border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
          >
            <Users className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Usuários</div>
            <div className="text-[10px] text-slate-400">Cadastrar e listar</div>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-4 rounded-xl bg-surface border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
          >
            <Key className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Segurança</div>
            <div className="text-[10px] text-slate-400">Trocar senha ADM</div>
          </button>
        </div>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Estúdio</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Página Inicial
          </Link>
        </div>
      </div>

      <AdminManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
