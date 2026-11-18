/**
 * Controle de Autenticação e Acesso Restrito ao Administrador (ADM)
 * Plataforma LoopX
 */

export const ADMIN_CONFIG = {
  get allowedEmails(): string[] {
    const envAdmin = process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase().trim()] : [];
    const envList = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
      : [];

    return Array.from(
      new Set([
        "admin@loopx.com",
        "criador@loopx.com",
        "lopes.midia002@gmail.com",
        ...envAdmin,
        ...envList,
      ])
    );
  },
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  creatorPassword: "loopx123",
};

/**
 * Verifica se um determinado e-mail pertence à lista de administradores autorizados
 */
export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_CONFIG.allowedEmails.includes(normalized);
}

/**
 * Valida a senha informada contra as credenciais configuradas de administrador
 */
export function verifyAdminPassword(email: string, password: string): boolean {
  if (!password) return false;
  const normalized = (email || "").toLowerCase().trim();

  // Senha mestra de administrador
  if (password === ADMIN_CONFIG.adminPassword) {
    return true;
  }

  // Senha padrão demo do criador mestre
  if (normalized === "criador@loopx.com" && password === ADMIN_CONFIG.creatorPassword) {
    return true;
  }

  // Senha padrão de admin
  if (normalized === "admin@loopx.com" && (password === "admin123" || password === ADMIN_CONFIG.adminPassword)) {
    return true;
  }

  return false;
}
