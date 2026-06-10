import { apiRequest } from "@/services/api";
import type { Planillero } from "@/types/planillero";

export const planillerosService = {
  list(): Promise<Planillero[]> {
    return apiRequest<Planillero[]>("/planilleros");
  },

  getById(id: string): Promise<Planillero> {
    return apiRequest<Planillero>(`/planilleros/${id}`);
  },

  create(input: Omit<Planillero, "id" | "createdAtIso">): Promise<Planillero> {
    return apiRequest<Planillero>("/planilleros", {
      method: "POST",
      body: input,
    });
  },

  update(id: string, patch: Partial<Planillero>): Promise<Planillero> {
    return apiRequest<Planillero>(`/planilleros/${id}`, {
      method: "PATCH",
      body: patch,
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/planilleros/${id}`, {
      method: "DELETE",
    });
  },
};
