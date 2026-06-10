import { create } from "zustand";
import type { MatchRef } from "@/types/match";
import type { MatchSheet, PlayerSheetRow } from "@/types/sheet";
import { matchesService } from "@/services/matches.service";
import { sheetsService } from "@/services/sheets.service";
import { uid } from "@/services/ids";

type State = {
  matchId: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  match: MatchRef | null;
  saved: MatchSheet | null;
  draft: MatchSheet | null;
  dirty: boolean;
  load: (matchId: string) => Promise<void>;
  setScore: (score: { home: number; away: number }) => Promise<void>;
  updatePlayer: (
    team: "homePlayers" | "awayPlayers",
    playerId: string,
    patch: Partial<PlayerSheetRow>
  ) => void;
  setObservations: (text: string) => void;
  addIncident: (incident: Omit<MatchSheet["incidents"][number], "id">) => Promise<void>;
  save: () => Promise<void>;
  finalize: () => Promise<void>;
  reopen: () => Promise<void>;
};

export const useMatchSheetStore = create<State>((set, get) => ({
  matchId: null,
  loading: false,
  saving: false,
  error: null,
  match: null,
  saved: null,
  draft: null,
  dirty: false,

  load: async (matchId) => {
    set({ loading: true, error: null, matchId });
    try {
      const [match, sheet] = await Promise.all([
        matchesService.getById(matchId),
        sheetsService.get(matchId),
      ]);
      set({ match, saved: sheet, draft: sheet, dirty: false, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Error al cargar la planilla",
      });
    }
  },

  setScore: async (score) => {
    const { match } = get();
    if (!match) return;
    const updated = await matchesService.setScore(match.id, score);
    set({ match: updated });
  },

  updatePlayer: (team, playerId, patch) => {
    const { draft } = get();
    if (!draft) return;
    const nextTeam = draft[team].map((p) => (p.id === playerId ? { ...p, ...patch } : p));
    set({ draft: { ...draft, [team]: nextTeam }, dirty: true });
  },

  setObservations: (text) => {
    const { draft } = get();
    if (!draft) return;
    set({ draft: { ...draft, observations: text }, dirty: true });
  },

  addIncident: async (incident) => {
    const { draft, matchId, saving } = get();
    if (!draft || !matchId || saving) return;
    const next = [{ id: uid(), ...incident }, ...draft.incidents];
    const nextDraft = { ...draft, incidents: next };
    set({ draft: nextDraft, dirty: true, saving: true, error: null });
    console.info("[match-sheet] incident save started", { matchId, type: incident.type });
    try {
      const saved = await sheetsService.save(matchId, nextDraft);
      set({ saved, draft: saved, dirty: false, saving: false });
      console.info("[match-sheet] incident save completed", { matchId });
    } catch (e) {
      console.error("[match-sheet] incident save failed", { matchId, error: e });
      set({
        saving: false,
        error: e instanceof Error ? e.message : "No se pudo guardar la incidencia",
      });
      throw e;
    }
  },

  save: async () => {
    const { matchId, draft } = get();
    if (!matchId || !draft) return;
    set({ saving: true, error: null });
    try {
      const saved = await sheetsService.save(matchId, draft);
      set({ saved, draft: saved, dirty: false, saving: false });
    } catch (e) {
      set({
        saving: false,
        error: e instanceof Error ? e.message : "No se pudo guardar",
      });
    }
  },

  finalize: async () => {
    const { match } = get();
    if (!match) return;
    await matchesService.setStatus(match.id, "terminado");
    const updated = await matchesService.getById(match.id);
    set({ match: updated });
  },

  reopen: async () => {
    const { match } = get();
    if (!match) return;
    await matchesService.setStatus(match.id, "reabierto");
    const updated = await matchesService.getById(match.id);
    set({ match: updated });
  },
}));
