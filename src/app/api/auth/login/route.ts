import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedAdminEmail, verifyAdminPassword, getUserRole } from "@/lib/auth/admin-auth";

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

    // 1. Verificação estrita de autorização (ADM ou Usuário previamente cadastrado pelo ADM)
    if (!isAuthorizedAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso não autorizado: Esta conta ainda não foi cadastrada. O cadastro de novos usuários é realizado exclusivamente pelo Administrador.",
          code: "UNAUTHORIZED",
        },
        { status: 403 }
      );
    }

    // 2. Validação de Portal ADM vs Acesso a Usuários
    const userRole = getUserRole(normalizedEmail);
    const isAdmin = userRole === "ADMIN";

    if (body.portalType === "ADMIN" && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Acesso negado ao Portal do ADM: Este acesso é restrito exclusivamente ao login e senha do Administrador. Para usuários cadastrados, utilize o Acesso a Usuários.",
          code: "ADMIN_ONLY",
        },
        { status: 403 }
      );
    }

    // 3. Bloqueio de cadastro aberto a terceiros
    if (action === "REGISTER") {
      return NextResponse.json(
        {
          success: false,
          error: "Cadastro público desabilitado. O acesso é exclusivo e gerenciado diretamente pela administração.",
          code: "REGISTRATION_DISABLED",
        },
        { status: 403 }
      );
    }

    // 4. Validação de senha
    const isPasswordValid = verifyAdminPassword(normalizedEmail, String(password));
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: isAdmin
            ? "Senha de administrador incorreta. Verifique a chave mestra."
            : "Senha incorreta. Verifique os dados fornecidos pelo administrador.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    // 4. Localização ou provisionamento do perfil de Administrador no banco
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { subscription: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name ? String(name).trim() : "Administrador LoopX",
          subscription: {
            create: {
              planTier: "SCALE",
              billingCycle: "ANNUAL",
              status: "ACTIVE",
              availableMinutes: 999.0,
              usedMinutes: 0.0,
              maxConcurrentRenders: 3,
              currentConcurrentRenders: 0,
              extraMinuteRateBRL: 1.9,
              hasPriorityQueue: true,
              periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: { subscription: true },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: isAdmin
        ? "Acesso de administrador autorizado com sucesso!"
        : "Acesso de criador autorizado com sucesso!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole,
        isAdmin,
        subscription: user.subscription,
      },
    });

    // 5. Gravação de cookies seguros de sessão
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
    response.cookies.set("loopx_is_admin", isAdmin ? "true" : "false", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    response.cookies.set("loopx_role", userRole, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Erro na autenticação de administrador:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha interna ao processar login." },
      { status: 500 }
    );
  }
}
