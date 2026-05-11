export type MatchStatus = "pendiente" | "en_carga" | "terminado" | "reabierto";

export type TeamRef = {
  id: string;
  name: string;
  shortName: string;
};

export type MatchRef = {
  id: string;
  status: MatchStatus;
  dateIso: string; // YYYY-MM-DD
  time: string; // HH:mm
  venue: string;
  pitch: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: { home: number; away: number };
  assignedPlanilleroId: string;
};

