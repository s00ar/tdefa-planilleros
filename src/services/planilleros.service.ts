import type { Planillero } from "@/types/planillero";
import { mockPlanilleros } from "@/mocks/planilleros";
import { sleep } from "@/mocks/utils";
import { uid } from "@/services/ids";
import { ensureSeeded, localDb } from "@/services/localDb";

const KEY = "tdefa.planilleros";

const getDb = () => ensureSeeded<Planillero[]>(KEY, mockPlanilleros);
const setDb = (items: Planillero[]) => localDb.set(KEY, items);

export const planillerosService = {
  async list(): Promise<Planillero[]> {
    await sleep(450);
    return getDb();
  },

  async getById(id: string): Promise<Planillero> {
    await sleep(250);
    const found = getDb().find((p) => p.id === id);
    if (!found) throw new Error("Planillero no encontrado");
    return found;
  },

  async create(input: Omit<Planillero, "id" | "createdAtIso">): Promise<Planillero> {
    await sleep(550);
    const created: Planillero = {
      ...input,
      id: uid(),
      createdAtIso: new Date().toISOString().slice(0, 10),
    };
    setDb([created, ...getDb()]);
    return created;
  },

  async update(id: string, patch: Partial<Planillero>): Promise<Planillero> {
    await sleep(550);
    const items = getDb();
    const next = items.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setDb(next);
    const updated = next.find((p) => p.id === id);
    if (!updated) throw new Error("Planillero no encontrado");
    return updated;
  },
};

