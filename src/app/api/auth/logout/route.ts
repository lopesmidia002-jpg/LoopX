import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sessão encerrada com sucesso.",
  });

  response.cookies.delete("loopx_session");
  response.cookies.delete("loopx_user_email");

  return response;
}
