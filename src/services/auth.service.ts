import type { AuthSession } from "@/types/auth";
import { sleep } from "@/mocks/utils";
import { mockUsers } from "@/mocks/users";
import { ensureSeeded, localDb } from "@/services/localDb";

const SESSION_KEY = "tdefa.session";

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    await sleep(550);
    const user = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
    );
    if (!user) throw new Error("Usuario o contraseña inválidos");

    const session: AuthSession = {
      token: `mock_${user.id}_${Date.now()}`,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    };
    localDb.set(SESSION_KEY, session);
    return session;
  },

  async logout(): Promise<void> {
    await sleep(200);
    localDb.remove(SESSION_KEY);
  },

  getSession(): AuthSession | null {
    return localDb.get<AuthSession>(SESSION_KEY);
  },

  seed(): void {
    ensureSeeded("tdefa.seed", { ok: true });
  },
};

