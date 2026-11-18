import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/clerk-config";

export async function GET(req: NextRequest) {
  try {
    const userEmailCookie = req.cookies.get("loopx_user_email")?.value;
    const user = await getAuthenticatedUser(userEmailCookie || "criador@loopx.com");

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao consultar usuário" },
      { status: 500 }
    );
  }
}
