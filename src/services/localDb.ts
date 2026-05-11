type JsonValue = unknown;

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const localDb = {
  get<T extends JsonValue>(key: string): T | null {
    return safeParse<T>(localStorage.getItem(key));
  },
  set<T extends JsonValue>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

export const ensureSeeded = <T extends JsonValue>(key: string, seed: T): T => {
  const current = localDb.get<T>(key);
  if (current) return current;
  localDb.set(key, seed);
  return seed;
};

