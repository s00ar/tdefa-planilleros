export type PlayerChange = "sin_cambio" | "sale" | "entra";

export type PlayerSheetRow = {
  id: string;
  name: string;
  documentId: string;
  apto: boolean;
  dni: string;
  signed: boolean;
  change: PlayerChange;
  notes: string;
  goals: number;
  yellowCards: number;
  redCard: boolean;
  redReason: string;
};

export type MatchSheet = {
  matchId: string;
  homePlayers: PlayerSheetRow[];
  awayPlayers: PlayerSheetRow[];
  observations: string;
  incidents: Array<{
    id: string;
    minute: number;
    type: "gol" | "amarilla" | "expulsion" | "cambio" | "nota";
    team: "home" | "away";
    label: string;
  }>;
  updatedAtIso: string;
};

