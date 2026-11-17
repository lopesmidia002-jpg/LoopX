import { NextRequest, NextResponse } from "next/server";
import { CheckoutManager } from "@/lib/billing/checkout";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      sessionId = `sim_${Date.now()}`,
      userId,
      planId,
      packageMinutes,
      billingCycle = "MONTHLY",
      amountPaidBRL = 0,
    } = body;

    const result = await CheckoutManager.handlePaymentWebhook({
      sessionId,
      userId: userId || "default-user",
      planId,
      packageMinutes: packageMinutes ? Number(packageMinutes) : undefined,
      billingCycle,
      amountPaidBRL: Number(amountPaidBRL),
    });

    return NextResponse.json({
      success: true,
      message: "Webhook de pagamento processado com sucesso",
      result,
    });
  } catch (error: any) {
    console.error("[Billing Webhook Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro no processamento do webhook",
      },
      { status: 500 }
    );
  }
}
