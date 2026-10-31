type Op = {
  table: string;
  kind: "select" | "insert" | "delete" | "upsert" | "update";
  filters: Record<string, unknown>;
  payload?: unknown;
  options?: unknown;
};
type Result = { data: unknown; error: null | { message: string } };
export type Handler = (op: Op) => Result;

/**
 * Cliente Supabase falso: encadeável, registra as operações e devolve o que o handler mandar.
 * Filtros de igualdade ficam com o nome da coluna; gte/lte ficam como "coluna>=" e "coluna<=".
 */
export function fakeSupabase(handler: Handler) {
  const calls: Op[] = [];
  const from = (table: string) => {
    const op: Op = { table, kind: "select", filters: {} };
    const run = () => { calls.push({ ...op, filters: { ...op.filters } }); return handler(op); };
    const b: Record<string, unknown> = {
      select: () => b,
      insert: (payload: unknown) => { op.kind = "insert"; op.payload = payload; return b; },
      upsert: (payload: unknown, options?: unknown) => { op.kind = "upsert"; op.payload = payload; op.options = options; return b; },
      update: (payload: unknown) => { op.kind = "update"; op.payload = payload; return b; },
      delete: () => { op.kind = "delete"; return b; },
      eq: (col: string, val: unknown) => { op.filters[col] = val; return b; },
      gte: (col: string, val: unknown) => { op.filters[`${col}>=`] = val; return b; },
      lte: (col: string, val: unknown) => { op.filters[`${col}<=`] = val; return b; },
      order: () => b,
      single: () => Promise.resolve(run()),
      maybeSingle: () => Promise.resolve(run()),
      then: (res: (r: Result) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(run()).then(res, rej),
    };
    return b;
  };
  return { client: { from } as never, calls };
}
