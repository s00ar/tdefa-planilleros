export type PlanilleroStatus = "activo" | "inactivo";

export type Planillero = {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  dni?: string;
  status: PlanilleroStatus;
  assignedMatchesCount: number;
  completedMatchesCount: number;
  createdAtIso: string;
};

