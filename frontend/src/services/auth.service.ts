import type { AuthSession } from "@/types/auth";
import { apiRequest } from "@/services/api";
import { localDb } from "@/services/localDb";
import type { Planillero } from "@/types/planillero";

const SESSION_KEY = "tdefa.session";
const LEGACY_LOGIN_MISSING_MESSAGE = "no tiene habilitado el login";

const buildLegacySession = (user: Planillero): AuthSession => {
  const normalizedUsername = user.username.trim().toLowerCase();
  const normalizedEmail = String(user.email ?? "").trim().toLowerCase();
  const role =
    user.id === "u_admin_1" || normalizedUsername === "admin" || normalizedEmail === "admin@tdefa.local"
      ? "admin"
      : "planillero";

  return {
    token: `legacy_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role,
    },
  };
};

const loginAgainstLegacyApi = async (identifier: string, password: string): Promise<AuthSession> => {
  const planilleros = await apiRequest<Planillero[]>("/planilleros");
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const user = planilleros.find((item) => {
    const username = item.username.trim().toLowerCase();
    const email = String(item.email ?? "").trim().toLowerCase();
    return username === normalizedIdentifier || email === normalizedIdentifier;
  });

  if (!user || user.status !== "activo") {
    throw new Error("Usuario o contraseña inválidos");
  }

  const expectedPassword = user.username;
  if (password !== expectedPassword) {
    throw new Error("Usuario o contraseña inválidos");
  }

  return buildLegacySession(user);
};

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    const identifier = username.trim();
    let session: AuthSession;
    try {
      session = await apiRequest<AuthSession>("/auth/login", {
        method: "POST",
        body: {
          username: identifier,
          password,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (!message.includes(LEGACY_LOGIN_MISSING_MESSAGE)) {
        throw error;
      }
      session = await loginAgainstLegacyApi(identifier, password);
    }
    localDb.set(SESSION_KEY, session);
    return session;
  },

  async logout(): Promise<void> {
    localDb.remove(SESSION_KEY);
  },

  getSession(): AuthSession | null {
    return localDb.get<AuthSession>(SESSION_KEY);
  },
};
