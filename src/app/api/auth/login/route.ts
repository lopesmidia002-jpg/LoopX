import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, action = "LOGIN", name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true },
    });

    if (action === "REGISTER") {
      if (user) {
        return NextResponse.json(
          { success: false, error: "Este e-mail já está cadastrado. Alterne para o modo Entrar." },
          { status: 400 }
        );
      }

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name ? String(name).trim() : normalizedEmail.split("@")[0],
          subscription: {
            create: {
              planTier: "CREATOR",
              billingCycle: "MONTHLY",
              status: "ACTIVE",
              availableMinutes: 195.0,
              usedMinutes: 0.0,
              maxConcurrentRenders: 1,
              currentConcurrentRenders: 0,
              extraMinuteRateBRL: 2.4,
              hasPriorityQueue: false,
              periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: { subscription: true },
      });
    } else {
      // Modo LOGIN
      if (!user) {
        // Se for o primeiro login com qualquer email, provisiona a conta automaticamente
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: name || normalizedEmail.split("@")[0],
            subscription: {
              create: {
                planTier: "CREATOR",
                billingCycle: "MONTHLY",
                status: "ACTIVE",
                availableMinutes: 195.0,
                usedMinutes: 10.5,
                maxConcurrentRenders: 1,
                currentConcurrentRenders: 0,
                extraMinuteRateBRL: 2.4,
                hasPriorityQueue: false,
                periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          include: { subscription: true },
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: action === "REGISTER" ? "Conta criada com sucesso!" : "Login autorizado com sucesso!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
      },
    });

    // Grava cookies de sessão
    response.cookies.set("loopx_session", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    response.cookies.set("loopx_user_email", user.email, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Erro na autenticação:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha interna ao processar login." },
      { status: 500 }
    );
  }
}
