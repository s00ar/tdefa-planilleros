import { uid } from "@/services/ids";
import { apiRequest } from "@/services/api";
import type { MatchSheet, PlayerSheetRow } from "@/types/sheet";

export const sheetsService = {
  get(matchId: string): Promise<MatchSheet> {
    return apiRequest<MatchSheet>(`/sheets/${matchId}`);
  },

  save(matchId: string, patch: Partial<MatchSheet>): Promise<MatchSheet> {
    return apiRequest<MatchSheet>(`/sheets/${matchId}`, {
      method: "PUT",
      body: {
        matchId,
        homePlayers: patch.homePlayers ?? [],
        awayPlayers: patch.awayPlayers ?? [],
        observations: patch.observations ?? "",
        incidents: patch.incidents ?? [],
      },
    });
  },

  async updatePlayer(
    matchId: string,
    team: "homePlayers" | "awayPlayers",
    playerId: string,
    patch: Partial<PlayerSheetRow>
  ) {
    const current = await this.get(matchId);
    const updatedTeam = current[team].map((player) =>
      player.id === playerId ? { ...player, ...patch } : player
    );
    return this.save(matchId, { ...current, [team]: updatedTeam });
  },

  async addIncident(matchId: string, incident: Omit<MatchSheet["incidents"][number], "id">) {
    const saved = await apiRequest<MatchSheet>(`/sheets/${matchId}/incidents`, {
      method: "POST",
      body: incident,
    });

    return {
      ...saved,
      incidents: saved.incidents.map((item) =>
        item.id ? item : { ...item, id: uid() }
      ),
    };
  },
};
