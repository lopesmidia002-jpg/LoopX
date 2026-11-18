"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Users,
  Key,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Search,
  RefreshCw,
  Clock,
  Layers,
  Check,
} from "lucide-react";
import { AdminUserRecord } from "@/lib/auth/admin-auth";

interface AdminManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminManagementModal({
  isOpen,
  onClose,
}: AdminManagementModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"USERS" | "PASSWORD" | "METRICS">("USERS");

  // Estados de Usuários
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "ADMIN" | "CREATOR">("ALL");

  // Formulário de Cadastro de Novo Usuário
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formRole, setFormRole] = useState<"ADMIN" | "CREATOR">("CREATOR");
  const [formPlan, setFormPlan] = useState<"STARTER" | "CREATOR" | "STUDIO" | "SCALE">("CREATOR");
  const [submittingUser, setSubmittingUser] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState<string | null>(null);
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);

  // Formulário de Troca de Senha do ADM
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Carrega lista de usuários ao abrir
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessMessage(null);
    setUserErrorMessage(null);

    if (!formName.trim() || !formEmail.trim()) {
      setUserErrorMessage("Por favor, preencha o nome e o e-mail.");
      return;
    }

    if (formPassword && formPassword.length < 6) {
      setUserErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      setSubmittingUser(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword || undefined,
          role: formRole,
          planTier: formPlan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUserSuccessMessage(data.message || "Usuário cadastrado com sucesso!");
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setIsRegisterOpen(false);
        fetchUsers();
      } else {
        setUserErrorMessage(data.error || "Falha ao cadastrar usuário.");
      }
    } catch (err: any) {
      setUserErrorMessage(err?.message || "Erro de conexão ao cadastrar usuário.");
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUserSuccessMessage(`Usuário ${email} removido.`);
        fetchUsers();
      } else {
        setUserErrorMessage(data.error || "Falha ao remover usuário.");
      }
    } catch (err: any) {
      setUserErrorMessage(err?.message || "Erro ao excluir usuário.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMessage(null);
    setPasswordErrorMessage(null);

    if (!currentPassword || !newPassword) {
      setPasswordErrorMessage("Preencha a senha atual e a nova senha.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMessage("A nova senha deve possuir no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMessage("A confirmação da nova senha não confere.");
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccessMessage(data.message || "Senha atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordErrorMessage(data.error || "Falha ao atualizar senha.");
      }
    } catch (err: any) {
      setPasswordErrorMessage(err?.message || "Erro ao salvar nova senha.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pwd);
    setShowFormPassword(true);
  };

  // Filtragem dos usuários
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalMinutes = users.reduce((acc, u) => acc + (u.availableMinutes || 0), 0);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-0 sm:p-4 flex min-h-screen items-end sm:items-center justify-center">
      <div className="bg-[#141923] border border-surface-border rounded-t-3xl sm:rounded-2xl max-w-4xl w-full shadow-2xl relative animate-fadeIn my-0 sm:my-auto overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-border bg-gradient-to-r from-[#182030] to-[#141923] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">Menu de Administração (ADM)</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">
                  ÁREA RESTRITA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1 sm:line-clamp-none">
                Gerencie usuários autorizados, controle de permissões e credenciais mestras do LoopX
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Horizontal swipe on Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 pt-3 sm:pt-4 border-b border-surface-border bg-surface/40 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("USERS")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === "USERS"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gerenciar Usuários ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("PASSWORD")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === "PASSWORD"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Trocar Senha do ADM</span>
          </button>

          <button
            onClick={() => setActiveTab("METRICS")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === "METRICS"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visão Geral & Auditoria</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">

          {/* TAB 1: GERENCIAR USUÁRIOS */}
          {activeTab === "USERS" && (
            <div className="space-y-6">

              {/* Feedbacks */}
              {userSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {userSuccessMessage}
                  </span>
                  <button onClick={() => setUserSuccessMessage(null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {userErrorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    {userErrorMessage}
                  </span>
                  <button onClick={() => setUserErrorMessage(null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Action Bar: Botão Novo Cadastro & Busca */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e: any) => setFilterRole(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">Todos os Perfis</option>
                    <option value="ADMIN">Apenas Administradores</option>
                    <option value="CREATOR">Apenas Criadores</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchUsers}
                    disabled={loadingUsers}
                    className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white"
                    title="Recarregar lista"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingUsers ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(!isRegisterOpen)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-95 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isRegisterOpen ? "Fechar Formulário" : "Novo Usuário"}</span>
                  </button>
                </div>
              </div>

              {/* Formulário de Cadastro retrátil */}
              {isRegisterOpen && (
                <form
                  onSubmit={handleCreateUser}
                  className="p-5 rounded-2xl bg-surface/60 border border-amber-500/30 space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-surface-border pb-3">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      Cadastrar Novo Usuário Autorizado
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      O usuário poderá logar imediatamente com as credenciais abaixo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Carlos Criador de Conteúdo"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#10141d] border border-surface-border text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        E-mail de Acesso
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: carlos@loopx.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#10141d] border border-surface-border text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Senha Inicial
                        </label>
                        <button
                          type="button"
                          onClick={generateStrongPassword}
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 min-h-[30px]"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          Gerar Senha Forte
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showFormPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#10141d] border border-surface-border text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-10 font-mono min-h-[44px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFormPassword(!showFormPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                          {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Perfil / Função
                        </label>
                        <select
                          value={formRole}
                          onChange={(e: any) => setFormRole(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#10141d] border border-surface-border text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="CREATOR">Criador Dark</option>
                          <option value="ADMIN">Administrador (ADM)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Plano Alocado
                        </label>
                        <select
                          value={formPlan}
                          onChange={(e: any) => setFormPlan(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#10141d] border border-surface-border text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="CREATOR">Creator (195 min)</option>
                          <option value="STUDIO">Studio (416 min)</option>
                          <option value="SCALE">Scale (845 min)</option>
                          <option value="STARTER">Starter (91 min)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRegisterOpen(false)}
                      className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-slate-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submittingUser}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-90 text-black font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      {submittingUser ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Confirmar Cadastro</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tabela de Usuários Cadastrados */}
              <div className="rounded-2xl border border-surface-border overflow-hidden bg-surface/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Usuário</th>
                        <th className="py-3 px-4">E-mail</th>
                        <th className="py-3 px-4">Função</th>
                        <th className="py-3 px-4">Plano</th>
                        <th className="py-3 px-4">Minutos</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {loadingUsers ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const isRootAdmin =
                            user.email === "admin@loopx.com" ||
                            user.email === "lopes.midia002@gmail.com";

                          return (
                            <tr
                              key={user.email}
                              className="hover:bg-surface/50 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white font-bold text-[11px] shadow-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-white">
                                    {user.name}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 font-mono text-slate-300">
                                {user.email}
                              </td>

                              <td className="py-3 px-4">
                                {user.role === "ADMIN" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono">
                                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                                    ADM
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[10px] font-bold font-mono">
                                    <Sparkles className="w-3 h-3 text-brand-400" />
                                    CRIADOR
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded bg-surface border border-surface-border text-slate-300 font-mono text-[10px]">
                                  {user.planTier}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                {user.availableMinutes.toFixed(1)} min
                              </td>

                              <td className="py-3 px-4 text-right">
                                {isRootAdmin ? (
                                  <span className="text-[10px] text-slate-500 font-mono italic">
                                    Protegido
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleDeleteUser(user.email)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                                    title="Remover usuário"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TROCAR SENHA DO ADM */}
          {activeTab === "PASSWORD" && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <p className="font-bold text-white mb-0.5">Segurança da Senha Mestra</p>
                  A alteração tem efeito imediato em todos os acessos do Administrador. Certifique-se de memorizar ou armazenar sua nova senha em local seguro.
                </div>
              </div>

              {passwordSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{passwordSuccessMessage}</span>
                </div>
              )}

              {passwordErrorMessage && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{passwordErrorMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Senha Atual do Administrador
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      placeholder="Digite sua senha atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nova Senha do Administrador
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingPassword}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:opacity-90 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingPassword ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>Salvar Nova Senha do Administrador</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: VISÃO GERAL & AUDITORIA */}
          {activeTab === "METRICS" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-surface-border">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Total de Usuários</span>
                    <Users className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {users.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Registrados no ecossistema
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-surface-border">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Administradores</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400">
                    {totalAdmins}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Com privilégio total de gestão
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-surface-border">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Minutos Provisionados</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {totalMinutes.toFixed(0)} min
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Disponíveis para renderização
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-surface-border">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Status do Portal</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">
                    100%
                  </div>
                  <div className="text-[10px] text-blue-400 mt-1 font-semibold">
                    Proteção ADM Ativa
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-surface/40 border border-surface-border space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Políticas de Segurança do LoopX
                </h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>O auto-cadastro público permanece permanentemente desativado (403 Forbidden).</li>
                  <li>Somente usuários explicitamente cadastrados por esta tela de administração têm permissão para autenticar.</li>
                  <li>Todas as sessões emitem cookies com flags <code className="text-brand-300 font-mono">httpOnly</code> e <code className="text-brand-300 font-mono">SameSite=Lax</code>.</li>
                  <li>A exclusão da conta de Administrador Geral (<code className="text-amber-300 font-mono">admin@loopx.com</code>) é bloqueada por segurança de infraestrutura.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-border bg-surface/40 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Infraestrutura Docker Ativa • LoopX Admin Console</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
