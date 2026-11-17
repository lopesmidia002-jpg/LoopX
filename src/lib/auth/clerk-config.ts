/**
 * Configuração e Tema Dark Mode Personalizado para o Clerk
 * Design System Cinematográfico do LoopX
 */

import { prisma } from "../prisma";

export const CLERK_DARK_THEME = {
  variables: {
    colorPrimary: "#8B5CF6",
    colorText: "#f1f5f9",
    colorBackground: "#161b24",
    colorInputBackground: "#141923",
    colorInputText: "#ffffff",
    colorTextSecondary: "#94a3b8",
    colorDanger: "#ef4444",
    borderRadius: "0.75rem",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  },
  elements: {
    card: "bg-[#1d232e] border border-[#2a3342] shadow-2xl backdrop-blur-xl",
    headerTitle: "text-white font-extrabold text-xl",
    headerSubtitle: "text-slate-400 text-sm",
    socialButtonsBlockButton: "bg-[#141923] border border-[#2a3342] text-white hover:bg-[#252d3b]",
    formButtonPrimary: "bg-gradient-to-r from-[#6366f1] via-[#8B5CF6] to-[#8aa0ff] text-white font-bold hover:opacity-95 shadow-lg shadow-purple-500/20",
    formFieldInput: "bg-[#141923] border border-[#2a3342] text-white focus:border-[#8B5CF6]",
    footerActionLink: "text-[#8aa0ff] hover:text-white font-semibold",
  },
};

export async function getAuthenticatedUser(defaultEmail: string = "criador@loopx.com") {
  // Retorna usuário existente ou cria usuário padrão para o estúdio
  let user = await prisma.user.findUnique({
    where: { email: defaultEmail },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: defaultEmail,
        name: "Criador Dark Studio",
        subscription: {
          create: {
            planTier: "CREATOR",
            billingCycle: "MONTHLY",
            status: "ACTIVE",
            availableMinutes: 195.0,
            usedMinutes: 10.5,
            maxConcurrentRenders: 1,
            currentConcurrentRenders: 0,
            extraMinuteRateBRL: 2.40,
            hasPriorityQueue: false,
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        subscription: true,
      },
    });
  }

  return user;
}

export const getCurrentUser = getAuthenticatedUser;

