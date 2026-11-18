import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sessão de administrador encerrada com sucesso.",
  });

  response.cookies.delete("loopx_session");
  response.cookies.delete("loopx_user_email");
  response.cookies.delete("loopx_is_admin");
  response.cookies.delete("loopx_role");

  return response;
}
