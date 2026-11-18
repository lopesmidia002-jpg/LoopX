import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/clerk-config";
import { isAuthorizedAdminEmail } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const userEmailCookie = req.cookies.get("loopx_user_email")?.value;
    const emailToUse = userEmailCookie || "criador@loopx.com";
    const isAdmin = isAuthorizedAdminEmail(emailToUse);

    const user = await getAuthenticatedUser(emailToUse);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        role: isAdmin ? "ADMIN" : "USER",
        isAdmin,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao consultar usuário" },
      { status: 500 }
    );
  }
}
