import type { AuthUser } from "@/types/auth";

export type MockUser = AuthUser & { password: string };

export const mockUsers: MockUser[] = [
  {
    id: "u_admin_1",
    username: "admin",
    name: "Administrador",
    role: "admin",
    password: "admin",
  },
  {
    id: "u_plan_1",
    username: "planillero",
    name: "Planillero Demo",
    role: "planillero",
    password: "planillero",
  },
  {
    id: "u_plan_2",
    username: "carlos",
    name: "Carlos Ruiz",
    role: "planillero",
    password: "carlos",
  },
];

