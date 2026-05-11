import { create } from "zustand";
import type { AuthSession, AuthUser, UserRole } from "@/types/auth";
import { authService } from "@/services/auth.service";

type AuthState = {
  hydrated: boolean;
  loading: boolean;
  session: AuthSession | null;
  error: string | null;
  hydrate: () => void;
  login: (username: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  loading: false,
  session: null,
  error: null,

  hydrate: () => {
    const session = authService.getSession();
    set({ session, hydrated: true });
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const session = await authService.login(username, password);
      set({ session, loading: false });
      return session;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error al iniciar sesión";
      set({ loading: false, error: message });
      throw e;
    }
  },

  logout: async () => {
    set({ loading: true });
    await authService.logout();
    set({ session: null, loading: false });
  },
}));

export const useAuthUser = (): AuthUser | null => useAuthStore((s) => s.session?.user ?? null);
export const useIsAuthed = (): boolean => useAuthStore((s) => Boolean(s.session?.token));
export const useRole = (): UserRole | null => useAuthStore((s) => s.session?.user.role ?? null);
