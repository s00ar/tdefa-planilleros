import { apiRequest } from "@/services/api";
import type { Team, Tournament } from "@/types/catalog";

type TournamentInput = Pick<Tournament, "name" | "season" | "status" | "startDate" | "endDate">;
type TeamInput = Pick<Team, "name" | "shortName" | "city" | "status">;

export const tournamentsService = {
  list: () => apiRequest<Tournament[]>("/tournaments"),
  get: (id: string) => apiRequest<Tournament>(`/tournaments/${id}`),
  create: (input: TournamentInput) =>
    apiRequest<Tournament>("/tournaments", { method: "POST", body: input }),
  update: (id: string, input: Partial<TournamentInput>) =>
    apiRequest<Tournament>(`/tournaments/${id}`, { method: "PATCH", body: input }),
  remove: (id: string) => apiRequest<void>(`/tournaments/${id}`, { method: "DELETE" }),
};

export const teamsService = {
  list: () => apiRequest<Team[]>("/teams"),
  get: (id: string) => apiRequest<Team>(`/teams/${id}`),
  create: (input: TeamInput) => apiRequest<Team>("/teams", { method: "POST", body: input }),
  update: (id: string, input: Partial<TeamInput>) =>
    apiRequest<Team>(`/teams/${id}`, { method: "PATCH", body: input }),
  remove: (id: string) => apiRequest<void>(`/teams/${id}`, { method: "DELETE" }),
};
