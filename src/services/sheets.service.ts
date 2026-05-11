import type { MatchSheet, PlayerSheetRow } from "@/types/sheet";
import { mockSheetsByMatchId } from "@/mocks/sheets";
import { nowIso, sleep } from "@/mocks/utils";
import { uid } from "@/services/ids";
import { ensureSeeded, localDb } from "@/services/localDb";

const KEY = "tdefa.sheets";

const seed = () => ensureSeeded<Record<string, MatchSheet>>(KEY, mockSheetsByMatchId);
const setDb = (items: Record<string, MatchSheet>) => localDb.set(KEY, items);

export const sheetsService = {
  async get(matchId: string): Promise<MatchSheet> {
    await sleep(450);
    const db = seed();
    const existing = db[matchId];
    if (existing) return existing;

    const created: MatchSheet = {
      matchId,
      homePlayers: [],
      awayPlayers: [],
      observations: "",
      incidents: [],
      updatedAtIso: nowIso(),
    };
    setDb({ ...db, [matchId]: created });
    return created;
  },

  async save(matchId: string, patch: Partial<MatchSheet>): Promise<MatchSheet> {
    await sleep(500);
    const db = seed();
    const current = db[matchId] ?? (await this.get(matchId));
    const updated: MatchSheet = { ...current, ...patch, updatedAtIso: nowIso() };
    setDb({ ...db, [matchId]: updated });
    return updated;
  },

  async updatePlayer(
    matchId: string,
    team: "homePlayers" | "awayPlayers",
    playerId: string,
    patch: Partial<PlayerSheetRow>
  ) {
    const current = await this.get(matchId);
    const updatedTeam = current[team].map((p) => (p.id === playerId ? { ...p, ...patch } : p));
    return this.save(matchId, { [team]: updatedTeam } as Partial<MatchSheet>);
  },

  async addIncident(
    matchId: string,
    incident: Omit<MatchSheet["incidents"][number], "id">
  ) {
    const current = await this.get(matchId);
    return this.save(matchId, { incidents: [{ id: uid(), ...incident }, ...current.incidents] });
  },
};

