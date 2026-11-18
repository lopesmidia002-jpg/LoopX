import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/clerk-config";
import { isAuthorizedAdminEmail, getUserRole } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const userEmailCookie = req.cookies.get("loopx_user_email")?.value;
    const emailToUse = userEmailCookie || "criador@loopx.com";
    const isAuthorized = isAuthorizedAdminEmail(emailToUse);
    const role = getUserRole(emailToUse);
    const isAdmin = role === "ADMIN";

    const user = await getAuthenticatedUser(emailToUse);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        role: role,
        isAdmin: isAdmin,
        isAuthorized,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao consultar usuário" },
      { status: 500 }
    );
  }
}
