import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/clerk-config";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
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
