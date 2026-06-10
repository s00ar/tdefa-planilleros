import { apiRequest } from "@/services/api";
import type { MatchRef, MatchStatus } from "@/types/match";

export type MatchCreateInput = {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  dateIso: string;
  time: string;
  venue: string;
  pitch: string;
  assignedPlanilleroId: string;
};

export const matchesService = {
  list(): Promise<MatchRef[]> {
    return apiRequest<MatchRef[]>("/matches");
  },

  listAssigned(planilleroId: string): Promise<MatchRef[]> {
    return apiRequest<MatchRef[]>(
      `/matches?assignedPlanilleroId=${encodeURIComponent(planilleroId)}`
    );
  },

  getById(matchId: string): Promise<MatchRef> {
    return apiRequest<MatchRef>(`/matches/${matchId}`);
  },

  create(input: MatchCreateInput): Promise<MatchRef> {
    return apiRequest<MatchRef>("/matches", {
      method: "POST",
      body: input,
    });
  },

  setStatus(matchId: string, status: MatchStatus, reopenReason?: string): Promise<MatchRef> {
    return apiRequest<MatchRef>(`/matches/${matchId}/status`, {
      method: "PATCH",
      body: { status, reopenReason },
    });
  },

  setScore(matchId: string, score: { home: number; away: number }): Promise<MatchRef> {
    return apiRequest<MatchRef>(`/matches/${matchId}/score`, {
      method: "PATCH",
      body: { score },
    });
  },
};
