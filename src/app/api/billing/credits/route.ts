import { NextResponse } from "next/server";
import { CreditsManager } from "@/lib/billing/credits-manager";
import { getAuthenticatedUser } from "@/lib/auth/clerk-config";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const sub = await CreditsManager.getUserSubscription(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      subscription: {
        planTier: sub.planTier,
        billingCycle: sub.billingCycle,
        availableMinutes: sub.availableMinutes,
        usedMinutes: sub.usedMinutes,
        maxConcurrentRenders: sub.maxConcurrentRenders,
        currentConcurrentRenders: sub.currentConcurrentRenders,
        extraMinuteRateBRL: sub.extraMinuteRateBRL,
        hasPriorityQueue: sub.hasPriorityQueue,
        periodEnd: sub.periodEnd,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao obter saldo de créditos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { minutes = 30, amountBRL } = body;

    const user = await getAuthenticatedUser();
    const sub = await CreditsManager.getUserSubscription(user.id);
    const calculatedAmount = amountBRL || minutes * sub.extraMinuteRateBRL;

    const result = await CreditsManager.addExtraMinutes({
      userId: user.id,
      minutes: Number(minutes),
      amountBRL: calculatedAmount,
    });

    return NextResponse.json({
      success: true,
      message: `Recarga de ${minutes} minutos efetuada com sucesso!`,
      availableMinutes: result.availableMinutes,
      amountBRL: calculatedAmount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao recarregar minutos" },
      { status: 500 }
    );
  }
}
