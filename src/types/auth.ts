export type UserRole = "planillero" | "admin";

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

