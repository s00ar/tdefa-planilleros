import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Clock3, FileText, Search, ShieldAlert, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { matchesService } from "@/services/matches.service";
import { sheetsService } from "@/services/sheets.service";
import { useAuthUser } from "@/store/auth.store";
import { formatCompactDateTime } from "@/lib/format";
import type { MatchRef, MatchStatus } from "@/types/match";
import type { MatchSheet } from "@/types/sheet";

type HistoryItem = {
  match: MatchRef;
  sheet: MatchSheet | null;
};

const statusLabel: Record<MatchStatus, string> = {
  pendiente: "Pendiente",
  en_carga: "En carga",
  terminado: "Terminado",
  reabierto: "Reabierto",
};

export function HistoryPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MatchStatus | "all">("all");

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    console.info("[history] load started", { userId: user.id, role: user.role });

    void (user.role === "admin" ? matchesService.list() : matchesService.listAssigned(user.id))
      .then(async (matches) => {
        const sheets = await Promise.allSettled(matches.map((match) => sheetsService.get(match.id)));
        if (!mounted) return;
        const historyItems = matches
          .map((match, index) => ({
            match,
            sheet: sheets[index].status === "fulfilled" ? sheets[index].value : null,
          }))
          .sort((left, right) =>
            `${right.match.dateIso} ${right.match.time}`.localeCompare(
              `${left.match.dateIso} ${left.match.time}`
            )
          );
        setItems(historyItems);
        console.info("[history] load completed", { count: historyItems.length });
      })
      .catch((loadError) => {
        if (!mounted) return;
        console.error("[history] load failed", loadError);
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el historial");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(({ match, sheet }) => {
      const statusMatches = status === "all" || match.status === status;
      const textMatches =
        !normalized ||
        [
          match.tournament,
          match.homeTeam.name,
          match.awayTeam.name,
          match.venue,
          match.pitch,
          statusLabel[match.status],
          sheet?.observations,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return statusMatches && textMatches;
    });
  }, [items, query, status]);

  const totals = useMemo(
    () => ({
      matches: items.length,
      finished: items.filter(({ match }) => match.status === "terminado").length,
      incidents: items.reduce((total, item) => total + (item.sheet?.incidents.length ?? 0), 0),
    }),
    [items]
  );

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-[linear-gradient(135deg,#fff0ee_0%,#ffffff_58%,#f3f4f5_100%)] p-6 shadow-[0_18px_38px_rgba(36,25,23,0.08)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e46857]">Registro operativo</p>
        <h1 className="mt-2 font-heading text-4xl font-black tracking-[-0.03em] text-[#300000] sm:text-5xl">
          Historial
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[#5e5e5e]">
          Consultá partidos, resultados, incidencias y la última actualización de cada planilla.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <SummaryCard icon={<CalendarDays />} label="Partidos registrados" value={totals.matches} />
          <SummaryCard icon={<Trophy />} label="Finalizados" value={totals.finished} />
          <SummaryCard icon={<ShieldAlert />} label="Incidencias" value={totals.incidents} />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#eadfdd] bg-white shadow-[0_12px_34px_rgba(36,25,23,0.06)]">
        <div className="flex flex-col gap-4 border-b border-[#eee4e2] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b716d]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-lg border border-[#ead5d2] bg-[#fff8f7] pl-12 pr-4 text-base outline-none focus:border-[#852318]"
              placeholder="Buscar por equipo, torneo, sede o cancha..."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "pendiente", "en_carga", "terminado", "reabierto"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={
                  status === value
                    ? "h-10 rounded-full bg-[#570000] px-4 text-sm font-semibold text-white"
                    : "h-10 rounded-full bg-[#f0f1f2] px-4 text-sm font-semibold text-[#57423e] hover:bg-[#fff0ee]"
                }
              >
                {value === "all" ? "Todos" : statusLabel[value]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center text-[#5e5e5e]">Cargando historial...</div>
        ) : error ? (
          <div className="m-5 rounded-lg border border-[#fac7c3] bg-[#fff0ee] p-5 text-[#852318]">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-6 text-center text-[#5e5e5e]">
            No hay registros para los filtros seleccionados.
          </div>
        ) : (
          <div className="divide-y divide-[#eee4e2]">
            {filtered.map(({ match, sheet }) => (
              <article key={match.id} className="grid gap-5 p-5 transition-colors hover:bg-[#fffafa] lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#fff0ee] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#852318]">
                      {statusLabel[match.status]}
                    </span>
                    <span className="text-sm font-semibold text-[#8b716d]">{match.tournament}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-[#300000]">
                    {match.homeTeam.name} <span className="text-[#8b716d]">vs</span> {match.awayTeam.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5e5e5e]">
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {formatCompactDateTime(match.dateIso, match.time)}
                    </span>
                    <span>{match.venue} · {match.pitch}</span>
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {sheet?.incidents.length ?? 0} incidencias
                    </span>
                    {sheet ? <span>Actualizada: {new Date(sheet.updatedAtIso).toLocaleString("es-AR")}</span> : null}
                  </div>
                  {match.reopenReason ? (
                    <p className="mt-3 rounded-lg bg-[#fff0ee] px-3 py-2 text-sm text-[#9f1d16]">
                      Motivo de reapertura: {match.reopenReason}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-5 lg:justify-end">
                  <div className="min-w-24 rounded-xl bg-[#300000] px-5 py-3 text-center text-3xl font-black text-white">
                    {match.score.home} - {match.score.away}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/partidos/${match.id}/planilla`)}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#570000] px-4 font-semibold text-white hover:bg-[#300000]"
                  >
                    Ver planilla
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-[0_8px_20px_rgba(36,25,23,0.05)]">
      <div className="text-[#852318] [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#8b716d]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#241917]">{value}</p>
    </div>
  );
}
