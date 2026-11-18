/**
 * Controle de Autenticação, Usuários e Acesso Restrito ao Administrador (ADM)
 * Plataforma LoopX
 */

import fs from "fs";
import path from "path";
import { prisma } from "../prisma";

export interface AdminUserRecord {
  id?: string;
  email: string;
  name: string;
  password?: string;
  role: "ADMIN" | "CREATOR";
  planTier: "STARTER" | "CREATOR" | "STUDIO" | "SCALE";
  availableMinutes: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

interface SecurityStore {
  adminPassword?: string;
  users: Record<string, AdminUserRecord>;
}

// Caminho de persistência local seguro (no container ou host)
const STORE_PATH = process.platform === "win32"
  ? path.join(process.cwd(), ".admin-security.json")
  : "/app/.admin-security.json";

function loadStore(): SecurityStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(data);
    } else if (fs.existsSync("/tmp/loopx-admin-security.json")) {
      const data = fs.readFileSync("/tmp/loopx-admin-security.json", "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Aviso: Falha ao ler arquivo de segredos do admin:", e);
  }
  return { users: {} };
}

function saveStore(store: SecurityStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    try {
      fs.writeFileSync("/tmp/loopx-admin-security.json", JSON.stringify(store, null, 2), "utf-8");
    } catch (err) {
      console.error("Aviso: Falha ao salvar arquivo de segredos do admin:", err);
    }
  }
}

// Memória em tempo de execução
let memoryStore: SecurityStore = loadStore();

export const ADMIN_CONFIG = {
  get allowedEmails(): string[] {
    const envAdmin = process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase().trim()] : [];
    const envList = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
      : [];

    const dynamicEmails = Object.keys(memoryStore.users || {});

    return Array.from(
      new Set([
        "admin@loopx.com",
        "criador@loopx.com",
        "lopes.midia002@gmail.com",
        ...envAdmin,
        ...envList,
        ...dynamicEmails,
      ])
    );
  },

  get adminPassword(): string {
    return memoryStore.adminPassword || process.env.ADMIN_PASSWORD || "admin123";
  },

  setAdminPassword(newPassword: string): void {
    memoryStore.adminPassword = newPassword;
    saveStore(memoryStore);
  },

  creatorPassword: "loopx123",
};

/**
 * Retorna a senha atual do Administrador
 */
export function getAdminPassword(): string {
  return ADMIN_CONFIG.adminPassword;
}

/**
 * Atualiza a senha mestra do Administrador
 */
export function updateAdminPassword(newPassword: string): boolean {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("A nova senha deve possuir no mínimo 6 caracteres.");
  }
  ADMIN_CONFIG.setAdminPassword(newPassword);
  return true;
}

/**
 * Normaliza logins/e-mails permitindo atalhos como 'admin', 'adm' ou prefixos
 */
export function normalizeUserEmail(input: string): string {
  if (!input) return "";
  const clean = input.toLowerCase().trim();
  if (clean === "admin" || clean === "adm" || clean === "admin@loopx" || clean === "adm@loopx") {
    return "admin@loopx.com";
  }
  if (clean === "lopes.midia002" || clean === "lopesmidia" || clean === "lopes") {
    return "lopes.midia002@gmail.com";
  }
  if (clean === "criador" || clean === "criador@loopx") {
    return "criador@loopx.com";
  }
  return clean;
}

/**
 * Verifica se um e-mail é autorizado no sistema (como ADM ou Criador registrado)
 */
export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = normalizeUserEmail(email);
  return ADMIN_CONFIG.allowedEmails.includes(normalized);
}

/**
 * Retorna o papel (role) do usuário cadastrado
 */
export function getUserRole(email: string): "ADMIN" | "CREATOR" {
  if (!email) return "CREATOR";
  const normalized = normalizeUserEmail(email);
  if (normalized === "admin@loopx.com" || normalized === "lopes.midia002@gmail.com") {
    return "ADMIN";
  }
  const custom = memoryStore.users[normalized];
  if (custom && custom.role) {
    return custom.role;
  }
  return "CREATOR";
}

/**
 * Valida a senha informada contra as credenciais configuradas
 */
export function verifyAdminPassword(email: string, password: string): boolean {
  if (!password) return false;
  const normalized = normalizeUserEmail(email || "");

  // 1. Verifica contra senha personalizada de usuário cadastrado pelo ADM
  const customUser = memoryStore.users[normalized];
  if (customUser && customUser.password) {
    if (password === customUser.password) {
      return true;
    }
  }

  // 2. Senha mestra dinâmica de administrador (EXCLUSIVA para e-mails com papel ADMIN)
  const isRootAdmin =
    normalized === "admin@loopx.com" ||
    normalized === "lopes.midia002@gmail.com" ||
    (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.toLowerCase().trim() === normalized) ||
    (customUser && customUser.role === "ADMIN");

  if (isRootAdmin) {
    const currentAdminPwd = ADMIN_CONFIG.adminPassword;
    // Se o administrador redefiniu a senha, apenas a nova senha cadastrada é válida
    if (memoryStore.adminPassword) {
      return password === memoryStore.adminPassword;
    }
    // Senhas padrão aceitas na inicialização (admin123, admin ou variável de ambiente)
    if (
      password === currentAdminPwd ||
      password === "admin123" ||
      password === "admin"
    ) {
      return true;
    }
  }

  // 3. Senha padrão demo do criador mestre
  if (normalized === "criador@loopx.com" && (password === ADMIN_CONFIG.creatorPassword || password === "loopx123")) {
    return true;
  }

  return false;
}

/**
 * Cadastra um novo usuário no banco de dados e no registro de segurança
 */
export async function registerNewUser(data: {
  email: string;
  name: string;
  password?: string;
  role?: "ADMIN" | "CREATOR";
  planTier?: "STARTER" | "CREATOR" | "STUDIO" | "SCALE";
  availableMinutes?: number;
}): Promise<AdminUserRecord> {
  const normalizedEmail = data.email.toLowerCase().trim();
  const role = data.role || "CREATOR";
  const planTier = data.planTier || (role === "ADMIN" ? "SCALE" : "CREATOR");

  // Minutos padrão por plano
  const planMinutesMap = {
    STARTER: 91.0,
    CREATOR: 195.0,
    STUDIO: 416.0,
    SCALE: 845.0,
  };
  const availableMinutes =
    typeof data.availableMinutes === "number" && data.availableMinutes > 0
      ? data.availableMinutes
      : planMinutesMap[planTier] || 195.0;

  // 1. Grava no banco de dados relacional PostgreSQL
  let dbUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { subscription: true },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name.trim(),
        subscription: {
          create: {
            planTier,
            billingCycle: "MONTHLY",
            status: "ACTIVE",
            availableMinutes,
            usedMinutes: 0.0,
            maxConcurrentRenders: role === "ADMIN" ? 3 : planTier === "SCALE" ? 3 : planTier === "STUDIO" ? 2 : 1,
            currentConcurrentRenders: 0,
            extraMinuteRateBRL: 2.4,
            hasPriorityQueue: role === "ADMIN" || planTier === "SCALE" || planTier === "STUDIO",
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { subscription: true },
    });
  } else if (dbUser.subscription) {
    // Atualiza minutos se já existia
    await prisma.subscription.update({
      where: { id: dbUser.subscription.id },
      data: {
        planTier,
        availableMinutes,
      },
    });
  }

  // 2. Grava no store de segurança com a senha definida
  const record: AdminUserRecord = {
    id: dbUser.id,
    email: normalizedEmail,
    name: data.name.trim(),
    password: data.password || (role === "ADMIN" ? ADMIN_CONFIG.adminPassword : "user123"),
    role,
    planTier,
    availableMinutes,
    status: "ACTIVE",
    createdAt: dbUser.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
  };

  memoryStore.users[normalizedEmail] = record;
  saveStore(memoryStore);

  return record;
}

/**
 * Lista todos os usuários (mesclando banco PostgreSQL e usuários padrão)
 */
export async function listAllUsers(): Promise<AdminUserRecord[]> {
  const dbUsers = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });

  const dbEmails = new Set(dbUsers.map((u) => u.email.toLowerCase()));

  const result: AdminUserRecord[] = dbUsers.map((u) => {
    const custom = memoryStore.users[u.email.toLowerCase()];
    const isRootAdmin = u.email === "admin@loopx.com" || u.email === "lopes.midia002@gmail.com";
    return {
      id: u.id,
      email: u.email,
      name: u.name || (isRootAdmin ? "Administrador Geral" : "Criador LoopX"),
      role: isRootAdmin ? "ADMIN" : custom?.role || "CREATOR",
      planTier: u.subscription?.planTier || "CREATOR",
      availableMinutes: u.subscription?.availableMinutes ?? 195.0,
      status: "ACTIVE",
      createdAt: u.createdAt.toISOString(),
    };
  });

  // Garante que os usuários padrão essenciais existam na lista
  const defaultAccounts: Array<{ email: string; name: string; role: "ADMIN" | "CREATOR"; plan: any; mins: number }> = [
    { email: "admin@loopx.com", name: "Administrador Geral", role: "ADMIN", plan: "SCALE", mins: 999.0 },
    { email: "criador@loopx.com", name: "Criador Master", role: "CREATOR", plan: "CREATOR", mins: 195.0 },
    { email: "lopes.midia002@gmail.com", name: "Super Administrador", role: "ADMIN", plan: "SCALE", mins: 999.0 },
  ];

  for (const def of defaultAccounts) {
    if (!dbEmails.has(def.email.toLowerCase())) {
      result.unshift({
        id: `default-${def.email}`,
        email: def.email,
        name: def.name,
        role: def.role,
        planTier: def.plan,
        availableMinutes: def.mins,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Adiciona quaisquer usuários no memoryStore que ainda não foram sincronizados
  for (const [email, user] of Object.entries(memoryStore.users)) {
    if (!result.some((r) => r.email.toLowerCase() === email)) {
      result.push(user);
    }
  }

  return result;
}

/**
 * Exclui um usuário do sistema (não permite excluir o admin root)
 */
export async function removeUser(email: string): Promise<boolean> {
  const normalized = (email || "").toLowerCase().trim();
  if (normalized === "admin@loopx.com" || normalized === "lopes.midia002@gmail.com") {
    throw new Error("Não é permitido excluir a conta raiz do Administrador.");
  }

  delete memoryStore.users[normalized];
  saveStore(memoryStore);

  try {
    await prisma.user.deleteMany({
      where: { email: normalized },
    });
  } catch (e) {
    console.warn("Usuário excluído do store de auth, mas não encontrado no banco:", e);
  }

  return true;
}
