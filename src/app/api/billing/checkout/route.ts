import { NextRequest, NextResponse } from "next/server";
import { CheckoutManager } from "@/lib/billing/checkout";
import { getCurrentUser } from "@/lib/auth/clerk-config";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const { planId, packageMinutes, billingCycle, paymentMethod } = body;

    const session = await CheckoutManager.createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      planId,
      packageMinutes: packageMinutes ? Number(packageMinutes) : undefined,
      billingCycle: billingCycle || "MONTHLY",
      paymentMethod: paymentMethod || "PIX",
    });

    return NextResponse.json({
      success: true,
      message: "Sessão de checkout gerada com sucesso",
      session,
    });
  } catch (error: any) {
    console.error("[Billing Checkout Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Falha ao gerar sessão de checkout",
      },
      { status: 500 }
    );
  }
}
