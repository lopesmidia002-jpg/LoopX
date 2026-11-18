import { NextResponse, NextRequest } from "next/server";
import {
  verifyAdminPassword,
  updateAdminPassword,
  getAdminPassword,
  isAuthorizedAdminEmail,
  getUserRole,
} from "@/lib/auth/admin-auth";

function checkAdminAccess(req: NextRequest): { authorized: boolean; email?: string } {
  const adminCookie = req.cookies.get("loopx_is_admin")?.value;
  const userEmail = req.cookies.get("loopx_user_email")?.value;
  const roleCookie = req.cookies.get("loopx_role")?.value;

  const email = userEmail || "admin@loopx.com";
  const isAuthorized = isAuthorizedAdminEmail(email);
  const isRoleAdmin = getUserRole(email) === "ADMIN" || roleCookie === "ADMIN" || adminCookie === "true";

  if (!isAuthorized || !isRoleAdmin) {
    return { authorized: false, email };
  }

  return { authorized: true, email };
}

/**
 * POST /api/admin/password - Altera a senha do administrador
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
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Senha atual e nova senha são obrigatórias." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "A nova senha deve possuir no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "A confirmação da nova senha não confere." },
        { status: 400 }
      );
    }

    // Valida senha atual
    const emailToCheck = auth.email || "admin@loopx.com";
    const isCurrentValid = verifyAdminPassword(emailToCheck, String(currentPassword));

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: "A senha atual informada está incorreta." },
        { status: 401 }
      );
    }

    // Atualiza para a nova senha
    updateAdminPassword(String(newPassword));

    return NextResponse.json({
      success: true,
      message: "Senha de Administrador atualizada com sucesso no sistema!",
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao alterar senha do admin:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao atualizar senha do administrador." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/password - Consulta status de segurança da senha
 */
export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: "Acesso negado." },
        { status: 403 }
      );
    }

    const currentPwd = getAdminPassword();

    return NextResponse.json({
      success: true,
      hasCustomPassword: currentPwd !== "admin123",
      adminEmail: auth.email || "admin@loopx.com",
      lastCheck: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
