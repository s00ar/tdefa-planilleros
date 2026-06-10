export type CatalogStatus = "activo" | "inactivo";

export type Tournament = {
  id: string;
  name: string;
  season: string | null;
  status: CatalogStatus;
  startDate: string | null;
  endDate: string | null;
  createdAtIso: string;
  matchesCount: number;
};

export type Team = {
  id: string;
  name: string;
  shortName: string;
  city: string | null;
  status: CatalogStatus;
  createdAtIso: string;
  matchesCount: number;
};
