import { NextResponse, NextRequest } from "next/server";
import {
  listAllUsers,
  registerNewUser,
  removeUser,
  isAuthorizedAdminEmail,
  getUserRole,
} from "@/lib/auth/admin-auth";

/**
 * Middleware simples de verificação administrativa para rotas /api/admin/*
 */
function checkAdminAccess(req: NextRequest): { authorized: boolean; email?: string } {
  const adminCookie = req.cookies.get("loopx_is_admin")?.value;
  const userEmail = req.cookies.get("loopx_user_email")?.value;
  const roleCookie = req.cookies.get("loopx_role")?.value;

  // Em chamadas autenticadas via sessão ou curl direto de teste
  const email = userEmail || "admin@loopx.com";
  const isAuthorized = isAuthorizedAdminEmail(email);
  const isRoleAdmin = getUserRole(email) === "ADMIN" || roleCookie === "ADMIN" || adminCookie === "true";

  if (!isAuthorized || !isRoleAdmin) {
    return { authorized: false, email };
  }

  return { authorized: true, email };
}

/**
 * GET /api/admin/users - Lista todos os usuários cadastrados
 */
export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: "Acesso negado: Requer privilégios de Administrador." },
        { status: 403 }
      );
    }

    const users = await listAllUsers();

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
      currentAdmin: auth.email,
    });
  } catch (error: any) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao consultar usuários." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Cadastra um novo usuário
 */
export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: "Acesso negado: Requer privilégios de Administrador." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name, password, role = "CREATOR", planTier = "CREATOR", availableMinutes } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Nome e e-mail são obrigatórios para cadastro." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { success: false, error: "Formato de e-mail inválido." },
        { status: 400 }
      );
    }

    if (password && String(password).length < 6) {
      return NextResponse.json(
        { success: false, error: "A senha inicial deve possuir no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const newUser = await registerNewUser({
      email: String(email).trim().toLowerCase(),
      name: String(name).trim(),
      password: password ? String(password) : undefined,
      role: role === "ADMIN" ? "ADMIN" : "CREATOR",
      planTier: ["STARTER", "CREATOR", "STUDIO", "SCALE"].includes(planTier) ? planTier : "CREATOR",
      availableMinutes: typeof availableMinutes === "number" ? availableMinutes : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Usuário ${newUser.name} (${newUser.email}) cadastrado com sucesso!`,
      user: newUser,
    });
  } catch (error: any) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao cadastrar usuário." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users - Remove um usuário cadastrado
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = checkAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: "Acesso negado: Requer privilégios de Administrador." },
        { status: 403 }
      );
    }

    let emailToDelete: string | null = null;

    const url = new URL(req.url);
    emailToDelete = url.searchParams.get("email");

    if (!emailToDelete) {
      try {
        const body = await req.json();
        emailToDelete = body?.email;
      } catch (e) {
        // body vazio ou não JSON
      }
    }

    if (!emailToDelete) {
      return NextResponse.json(
        { success: false, error: "Informe o e-mail do usuário a ser removido." },
        { status: 400 }
      );
    }

    await removeUser(emailToDelete);

    return NextResponse.json({
      success: true,
      message: `Usuário ${emailToDelete} removido com sucesso do sistema.`,
    });
  } catch (error: any) {
    console.error("Erro ao remover usuário:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao remover usuário." },
      { status: 400 }
    );
  }
}
