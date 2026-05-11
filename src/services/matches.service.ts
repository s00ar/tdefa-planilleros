import type { MatchRef, MatchStatus } from "@/types/match";
import { mockMatches } from "@/mocks/matches";
import { sleep } from "@/mocks/utils";
import { ensureSeeded, localDb } from "@/services/localDb";

const KEY = "tdefa.matches";

const getDb = () => ensureSeeded<MatchRef[]>(KEY, mockMatches);
const setDb = (items: MatchRef[]) => localDb.set(KEY, items);

export const matchesService = {
  async listAssigned(planilleroId: string): Promise<MatchRef[]> {
    await sleep(450);
    return getDb().filter((m) => m.assignedPlanilleroId === planilleroId);
  },

  async getById(matchId: string): Promise<MatchRef> {
    await sleep(250);
    const match = getDb().find((m) => m.id === matchId);
    if (!match) throw new Error("Partido no encontrado");
    return match;
  },

  async setStatus(matchId: string, status: MatchStatus): Promise<MatchRef> {
    await sleep(300);
    const items = getDb();
    const next = items.map((m) => (m.id === matchId ? { ...m, status } : m));
    setDb(next);
    const updated = next.find((m) => m.id === matchId);
    if (!updated) throw new Error("Partido no encontrado");
    return updated;
  },

  async setScore(matchId: string, score: { home: number; away: number }) {
    await sleep(250);
    const items = getDb();
    const next = items.map((m) => (m.id === matchId ? { ...m, score } : m));
    setDb(next);
    const updated = next.find((m) => m.id === matchId);
    if (!updated) throw new Error("Partido no encontrado");
    return updated;
  },
};

