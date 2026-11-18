"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Play,
  Sparkles,
  Clock,
  Layers,
  PlusCircle,
  ChevronRight,
  CreditCard,
  X,
  Check,
  Zap,
  BarChart3,
  Key,
  Calendar,
  Split,
  ShieldCheck,
  LogOut,
  Menu,
  MoreVertical,
  Tv,
} from "lucide-react";
import ChannelSelector from "./ChannelSelector";
import ApiSettingsModal from "./ApiSettingsModal";
import ScheduleCalendarModal from "./ScheduleCalendarModal";
import ABTestingModal from "./ABTestingModal";
import AdminManagementModal from "./AdminManagementModal";
import { DarkChannel } from "@/lib/youtube/channel-manager";

interface StudioHeaderProps {
  availableMinutes: number;
  maxMinutes: number;
  concurrentRenders: number;
  maxConcurrentRenders: number;
  activeTab?: "STUDIO" | "ANALYTICS";
  onTabChange?: (tab: "STUDIO" | "ANALYTICS") => void;
  activeChannel?: DarkChannel | null;
  onChannelChanged?: (channel: DarkChannel) => void;
  onNewProject: () => void;
  onMinutesRecharged?: (newMinutes: number) => void;
}

export default function StudioHeader({
  availableMinutes = 184.5,
  maxMinutes = 195.0,
  concurrentRenders = 0,
  maxConcurrentRenders = 1,
  activeTab = "STUDIO",
  onTabChange,
  activeChannel,
  onChannelChanged,
  onNewProject,
  onMinutesRecharged,
}: StudioHeaderProps) {
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isABModalOpen, setIsABModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      setIsAdmin(document.cookie.includes("loopx_is_admin=true"));
    }
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setIsAdmin(Boolean(data.user.isAdmin));
          setCurrentUserEmail(data.user.email || "");
        }
      })
      .catch(() => {});
  }, []);

  const percentage = Math.round((availableMinutes / maxMinutes) * 100);

  const handleRecharge = async (minutes: number, amount: number) => {
    try {
      setRechargeLoading(true);
      const res = await fetch("/api/billing/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, amountBRL: amount }),
      });
      const data = await res.json();
      if (data.success && data.availableMinutes) {
        setRechargeSuccess(true);
        if (onMinutesRecharged) onMinutesRecharged(data.availableMinutes);
        setTimeout(() => {
          setRechargeSuccess(false);
          setIsRechargeModalOpen(false);
        }, 1500);
      }
    } catch (e) {
      console.error("Erro ao recarregar:", e);
    } finally {
      setRechargeLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/login";
  };

  return (
    <>
      {/* Top Header (Responsive: Compact on Mobile, Expanded on Desktop) */}
      <header className="sticky top-0 z-40 bg-[#141923]/95 backdrop-blur-xl border-b border-surface-border px-3 sm:px-6 py-2.5 sm:py-3 pt-safe">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">

          {/* Left: Brand & Mobile Tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 group min-h-[44px] min-w-[44px]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 flex items-center justify-center transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-background rounded-md flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-brand-300 fill-brand-300 ml-0.5" />
                </div>
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Loop<span className="text-brand-400">X</span>
              </span>
            </Link>

            {/* Desktop Breadcrumb & Tabs */}
            <div className="hidden sm:flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-surface-border">
                <button
                  onClick={() => onTabChange && onTabChange("STUDIO")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] whitespace-nowrap shrink-0 ${
                    activeTab === "STUDIO"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Abrir Estúdio de Criação de Vídeos"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Estúdio</span>
                </button>
                <button
                  onClick={() => onTabChange && onTabChange("ANALYTICS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] whitespace-nowrap shrink-0 ${
                    activeTab === "ANALYTICS"
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Abrir Dashboard de Métricas do Canal Dark"
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span>Métricas do Canal</span>
                </button>
              </div>
            </div>

            {/* Desktop Channel Selector & ADM Button */}
            <div className="hidden sm:flex items-center gap-2">
              <ChannelSelector selectedChannel={activeChannel} onChannelChanged={onChannelChanged} />
              {isAdmin && (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 shadow-sm transition-all cursor-pointer group min-h-[36px]"
                  title="Abrir Menu de Administração (Gestão de Usuários & Senha ADM)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>ADM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Menu de Administração (Cadastrar Usuários & Trocar Senha)"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </button>
              )}

              <button
                onClick={() => setIsApiModalOpen(true)}
                className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Configurações de APIs e Chaves de Produção (BYOK)"
              >
                <Key className="w-4 h-4 text-brand-300" />
              </button>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Grade Semanal & Agendamento de Postagens"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => setIsABModalOpen(true)}
                className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Testes A/B de Miniaturas & Títulos (CTR Optimizer)"
              >
                <Split className="w-4 h-4 text-purple-400" />
              </button>
            </div>

            {/* Minutes Balance Indicator (Touch-optimized) */}
            <div
              onClick={() => setIsRechargeModalOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface border border-surface-border cursor-pointer hover:border-brand-500/40 transition-colors min-h-[44px] select-none active:scale-95"
              title="Clique para recarregar minutos"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 shrink-0" />
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white font-mono">
                    {availableMinutes.toFixed(1)}m
                  </span>
                  <span className="text-[10px] text-brand-300 hidden sm:inline underline">+ Recarregar</span>
                </div>
                <div className="w-14 sm:w-24 h-1 rounded-full bg-slate-800 overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Concurrent Renders */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs min-h-[44px]">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-white font-semibold text-[11px]">
                  {concurrentRenders}/{maxConcurrentRenders} Render
                </span>
                <span className="text-[10px] text-slate-400">Fila Normal</span>
              </div>
            </div>

            {/* Desktop Novo Projeto CTA */}
            <button
              onClick={onNewProject}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:opacity-90 shadow-md shadow-brand-500/20 transition-all hover:scale-105 min-h-[44px] whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Projeto</span>
            </button>

            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex p-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-400 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] items-center justify-center"
              title="Encerrar Sessão de Administrador"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Actions Drawer Button (Thumb-reachable top right) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex md:hidden p-2 rounded-xl bg-surface border border-surface-border text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] items-center justify-center active:scale-95"
              aria-label="Menu de ferramentas mobile"
            >
              <Menu className="w-5 h-5 text-brand-300" />
            </button>

          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb Zone • Fitts's Law) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#141923]/95 backdrop-blur-2xl border-t border-surface-border pb-safe sm:hidden shadow-2xl">
        <div className="flex items-center justify-around px-2 py-1">

          {/* Tab 1: Estúdio */}
          <button
            onClick={() => onTabChange && onTabChange("STUDIO")}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[44px] transition-colors ${
              activeTab === "STUDIO" ? "text-brand-300 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Estúdio</span>
          </button>

          {/* Tab 2: Métricas */}
          <button
            onClick={() => onTabChange && onTabChange("ANALYTICS")}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[44px] transition-colors ${
              activeTab === "ANALYTICS" ? "text-brand-300 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Métricas</span>
          </button>

          {/* Center Button: Novo Vídeo (Hero Thumb Action) */}
          <button
            onClick={onNewProject}
            className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-brand-600 to-brand-accent p-3 rounded-full text-white shadow-lg shadow-brand-500/40 min-h-[50px] min-w-[50px] active:scale-90 transition-transform"
            aria-label="Criar novo vídeo"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          {/* Tab 4: Testes A/B */}
          <button
            onClick={() => setIsABModalOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[44px] text-slate-400 hover:text-purple-300 transition-colors"
          >
            <Split className="w-5 h-5 mb-0.5 text-purple-400" />
            <span className="text-[10px]">Testes A/B</span>
          </button>

          {/* Tab 5: Painel ADM (apenas para o Administrador) ou Logout para Usuário */}
          {isAdmin ? (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[44px] text-slate-400 hover:text-amber-300 transition-colors relative"
              title="Abrir Menu de Administração"
            >
              <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-400" />
              <span className="text-[10px]">ADM</span>
              <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[44px] text-slate-400 hover:text-rose-300 transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-5 h-5 mb-0.5 text-slate-400 hover:text-rose-400" />
              <span className="text-[10px]">Sair</span>
            </button>
          )}

        </div>
      </nav>

      {/* MOBILE ACTION SHEET (Bottom Sheet Drawer) */}
      {isMobileMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col justify-end animate-fadeIn sm:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="bg-[#171d29] border-t border-surface-border rounded-t-3xl p-5 pb-safe z-10 space-y-4 max-h-[85vh] overflow-y-auto animate-slideUp">
            
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Ferramentas & Canais LoopX</h3>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions List (Touch Targets >= 48px) */}
            <div className="space-y-2">
              {/* Channel Selector Mobile Row */}
              <div className="p-3 rounded-xl bg-surface border border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tv className="w-5 h-5 text-brand-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">Canal YouTube Ativo</span>
                    <span className="text-[10px] text-slate-400">Trocar ou conectar canal dark</span>
                  </div>
                </div>
                <div>
                  <ChannelSelector
                    selectedChannel={activeChannel}
                    onChannelChanged={(ch) => {
                      onChannelChanged?.(ch);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>
              </div>

              {/* Admin Console (Apenas para o Administrador) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAdminModalOpen(true);
                  }}
                  className="w-full p-3 rounded-xl bg-surface border border-surface-border hover:border-amber-500/50 flex items-center justify-between transition-colors min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Menu de Administração (ADM)</span>
                      <span className="text-[10px] text-slate-400">Cadastrar novos usuários e trocar senha</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* Schedule Calendar */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsScheduleModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-surface border border-surface-border hover:border-emerald-500/50 flex items-center justify-between transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">Grade Semanal & Agendamento</span>
                    <span className="text-[10px] text-slate-400">Picos de retenção (Ter 18h e Dom 19h)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* API Keys BYOK */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsApiModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-surface border border-surface-border hover:border-brand-500/50 flex items-center justify-between transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-brand-300 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">Chaves de API & Produção (BYOK)</span>
                    <span className="text-[10px] text-slate-400">OpenAI GPT-4o, Google AI, Unsplash</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Recharge */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRechargeModalOpen(true);
                }}
                className="w-full p-3 rounded-xl bg-surface border border-surface-border hover:border-brand-500/50 flex items-center justify-between transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">Recarga de Minutos de Vídeo</span>
                    <span className="text-[10px] text-slate-400">Saldo atual: {availableMinutes.toFixed(1)} minutos</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 flex items-center justify-between transition-colors min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-xs font-bold">Encerrar Sessão de Administrador</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-surface border border-surface-border text-xs font-bold text-slate-300 hover:text-white mt-2 min-h-[44px]"
            >
              Fechar Menu
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Recharge Minutes Modal */}
      {isRechargeModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-4 flex min-h-screen items-end sm:items-center justify-center">
          <div className="bg-[#1a202c] border border-surface-border rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative animate-fadeIn my-auto pb-safe">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Recarga de Minutos de Vídeo</span>
              </h4>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Adicione minutos extras à sua conta instantaneamente. Os minutos avulsos não expiram.
            </p>

            {rechargeSuccess ? (
              <div className="p-6 text-center rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Minutos Recarregados com Sucesso!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => handleRecharge(30, 72)}
                  className="p-4 rounded-xl bg-surface border border-surface-border hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between min-h-[56px] active:scale-98"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">+30 Minutos de Vídeo</span>
                    <span className="text-[10px] text-slate-400">R$ 2,40 por minuto extra</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-brand-300">R$ 72,00</span>
                </div>

                <div
                  onClick={() => handleRecharge(60, 144)}
                  className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/40 hover:border-brand-500 cursor-pointer transition-all flex items-center justify-between min-h-[56px] active:scale-98"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">+60 Minutos de Vídeo (Mais Popular)</span>
                    <span className="text-[10px] text-emerald-400">Equivalente a ~6 vídeos completos</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-white">R$ 144,00</span>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Api Keys & BYOK Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />

      {/* Weekly Schedule & Calendar Modal */}
      <ScheduleCalendarModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />

      {/* A/B Testing Modal */}
      <ABTestingModal
        isOpen={isABModalOpen}
        onClose={() => setIsABModalOpen(false)}
      />

      {/* Admin Management Modal (Users & Password) */}
      <AdminManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
}
