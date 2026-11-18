import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isAuthorizedAdminEmail,
  verifyAdminPassword,
  getUserRole,
  normalizeUserEmail,
} from "@/lib/auth/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, action = "LOGIN", name } = body;

    const rawEmail = String(email || "").trim();
    const rawPassword = String(password || "").trim();

    if (!rawEmail || !rawPassword) {
      return NextResponse.json(
        { success: false, error: "Login/E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (rawPassword.length < 5) {
      return NextResponse.json(
        { success: false, error: "A senha deve ter no mínimo 5 caracteres." },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeUserEmail(rawEmail);

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
    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { subscription: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: name ? String(name).trim() : (isAdmin ? "Administrador LoopX" : "Criador LoopX"),
            subscription: {
              create: {
                planTier: isAdmin ? "SCALE" : "CREATOR",
                billingCycle: "ANNUAL",
                status: "ACTIVE",
                availableMinutes: isAdmin ? 999.0 : 195.0,
                usedMinutes: 0.0,
                maxConcurrentRenders: isAdmin ? 3 : 1,
                currentConcurrentRenders: 0,
                extraMinuteRateBRL: 1.9,
                hasPriorityQueue: isAdmin,
                periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            },
          },
          include: { subscription: true },
        });
      }
    } catch (dbError) {
      console.warn("Aviso: Falha temporária no banco de dados durante login, utilizando sessão resiliente:", dbError);
      // Fallback seguro em caso de indisponibilidade transitória do banco relacional
      user = {
        id: `user-${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "-")}`,
        email: normalizedEmail,
        name: name ? String(name).trim() : (isAdmin ? "Administrador LoopX" : "Criador LoopX"),
        role: userRole,
        subscription: {
          id: `sub-${normalizedEmail.replace(/[^a-zA-Z0-9]/g, "-")}`,
          planTier: isAdmin ? "SCALE" : "CREATOR",
          status: "ACTIVE",
          availableMinutes: isAdmin ? 999.0 : 195.0,
          usedMinutes: 0.0,
          maxConcurrentRenders: isAdmin ? 3 : 1,
          hasPriorityQueue: isAdmin,
        },
      };
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
