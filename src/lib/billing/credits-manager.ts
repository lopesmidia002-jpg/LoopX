/**
 * Gerenciador de Saldo de Minutos, Créditos e Concorrência de Renderização
 * Regras de Monetização do LoopX
 */

import { prisma } from "../prisma";
import { PRICING_PLANS } from "../constants";
import { PlanTier } from "@prisma/client";

export interface CreditCheckResult {
  allowed: boolean;
  availableMinutes: number;
  requestedMinutes: number;
  maxConcurrentRenders: number;
  currentConcurrentRenders: number;
  extraMinuteRate: number;
  planName: string;
  reason?: string;
}

export class CreditsManager {
  /**
   * Obtém ou cria a assinatura padrão do usuário (Plano Creator por padrão)
   */
  static async getUserSubscription(userId: string) {
    let sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      const creatorPlan = PRICING_PLANS.find((p) => p.id === "CREATOR")!;
      sub = await prisma.subscription.create({
        data: {
          userId,
          planTier: "CREATOR",
          billingCycle: "MONTHLY",
          status: "ACTIVE",
          availableMinutes: creatorPlan.minutesPerMonth,
          usedMinutes: 0.0,
          maxConcurrentRenders: creatorPlan.concurrentRenders,
          currentConcurrentRenders: 0,
          extraMinuteRateBRL: creatorPlan.extraMinuteRate,
          hasPriorityQueue: creatorPlan.priorityQueue || false,
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return sub;
  }

  /**
   * Verifica se o usuário possui minutos suficientes e slot de renderização disponível
   */
  static async verifyCredits(
    userId: string,
    requestedMinutes: number
  ): Promise<CreditCheckResult> {
    const sub = await this.getUserSubscription(userId);

    // 1. Verifica concorrência na fila
    if (sub.currentConcurrentRenders >= sub.maxConcurrentRenders) {
      return {
        allowed: false,
        availableMinutes: sub.availableMinutes,
        requestedMinutes,
        maxConcurrentRenders: sub.maxConcurrentRenders,
        currentConcurrentRenders: sub.currentConcurrentRenders,
        extraMinuteRate: sub.extraMinuteRateBRL,
        planName: sub.planTier,
        reason: `Você atingiu o limite de ${sub.maxConcurrentRenders} renderização simultânea do seu plano. Aguarde a conclusão ou faça upgrade de plano.`,
      };
    }

    // 2. Verifica minutos de vídeo
    if (sub.availableMinutes < requestedMinutes) {
      const needed = (requestedMinutes - sub.availableMinutes).toFixed(1);
      const cost = (Number(needed) * sub.extraMinuteRateBRL).toFixed(2);
      return {
        allowed: false,
        availableMinutes: sub.availableMinutes,
        requestedMinutes,
        maxConcurrentRenders: sub.maxConcurrentRenders,
        currentConcurrentRenders: sub.currentConcurrentRenders,
        extraMinuteRate: sub.extraMinuteRateBRL,
        planName: sub.planTier,
        reason: `Saldo insuficiente. Você tem ${sub.availableMinutes.toFixed(1)} min e precisa de ${requestedMinutes} min. Adquira ${needed} min extras por R$ ${cost}.`,
      };
    }

    return {
      allowed: true,
      availableMinutes: sub.availableMinutes,
      requestedMinutes,
      maxConcurrentRenders: sub.maxConcurrentRenders,
      currentConcurrentRenders: sub.currentConcurrentRenders,
      extraMinuteRate: sub.extraMinuteRateBRL,
      planName: sub.planTier,
    };
  }

  /**
   * Deduz minutos consumidos por uma renderização e registra a transação
   */
  static async deductMinutes(params: {
    userId: string;
    minutes: number;
    description: string;
  }) {
    const { userId, minutes, description } = params;

    const sub = await this.getUserSubscription(userId);
    const newAvailable = Math.max(0, sub.availableMinutes - minutes);
    const newUsed = sub.usedMinutes + minutes;

    await prisma.subscription.update({
      where: { userId },
      data: {
        availableMinutes: newAvailable,
        usedMinutes: newUsed,
        currentConcurrentRenders: Math.max(0, sub.currentConcurrentRenders - 1),
      },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "RENDER_DEDUCTION",
        minutes,
        description,
      },
    });

    return { availableMinutes: newAvailable, usedMinutes: newUsed };
  }

  /**
   * Recarrega minutos avulsos na conta do usuário
   */
  static async addExtraMinutes(params: {
    userId: string;
    minutes: number;
    amountBRL: number;
  }) {
    const { userId, minutes, amountBRL } = params;
    const sub = await this.getUserSubscription(userId);

    const newAvailable = sub.availableMinutes + minutes;

    await prisma.subscription.update({
      where: { userId },
      data: { availableMinutes: newAvailable },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: "EXTRA_MINUTES_PURCHASE",
        minutes,
        amountBRL,
        description: `Compra de pacote de ${minutes} minutos extras`,
      },
    });

    return { availableMinutes: newAvailable };
  }
}
