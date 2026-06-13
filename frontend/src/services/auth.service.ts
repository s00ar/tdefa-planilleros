import type { AuthSession } from "@/types/auth";
import { apiRequest } from "@/services/api";
import { localDb } from "@/services/localDb";

const SESSION_KEY = "tdefa.session";

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: {
        username: username.trim(),
        password,
      },
    });
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
