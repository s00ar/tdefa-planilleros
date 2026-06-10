import type { MatchSheet, PlayerSheetRow } from "@/types/sheet";
import { nowIso } from "@/mocks/utils";

const player = (n: number, name: string): PlayerSheetRow => ({
  id: `p_${n}`,
  name,
  documentId: `ID-${String(100000 + n).slice(-6)}`,
  apto: true,
  dni: String(30000000 + n),
  signed: false,
  change: "sin_cambio",
  notes: "",
  goals: 0,
  yellowCards: 0,
  redCard: false,
  redReason: "",
});

export const mockSheetsByMatchId: Record<string, MatchSheet> = {
  m_1002: {
    matchId: "m_1002",
    homePlayers: [
      player(1, "A. Suárez"),
      player(2, "B. Romero"),
      player(3, "C. Díaz"),
      player(4, "D. Sosa"),
      player(5, "E. Rivas"),
      player(6, "F. Gómez"),
      player(7, "G. Herrera"),
      player(8, "H. Acosta"),
      player(9, "I. Medina"),
      player(10, "J. Núñez"),
      player(11, "K. Vega"),
    ],
    awayPlayers: [
      player(21, "L. Torres"),
      player(22, "M. Castro"),
      player(23, "N. Molina"),
      player(24, "O. Pérez"),
      player(25, "P. Silva"),
      player(26, "Q. Arias"),
      player(27, "R. Cabrera"),
      player(28, "S. Prieto"),
      player(29, "T. Ibarra"),
      player(30, "U. Duarte"),
      player(31, "V. Paredes"),
    ],
    observations: "",
    incidents: [
      { id: "i_1", minute: 12, type: "amarilla", team: "home", label: "A. Suárez" },
      { id: "i_2", minute: 28, type: "gol", team: "away", label: "L. Torres" },
    ],
    updatedAtIso: nowIso(),
  },
};

