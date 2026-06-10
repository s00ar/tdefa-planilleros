import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  ListChecks,
  Plus,
  SearchX,
  Target,
  Trophy,
  Wifi,
} from "lucide-react";
import { matchesService } from "@/services/matches.service";
import { formatCompactDateTime, formatDateEs } from "@/lib/format";
import { useAuthUser } from "@/store/auth.store";
import type { MatchRef, MatchStatus } from "@/types/match";

const statusOptions: Array<{ value: MatchStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_carga", label: "En carga" },
  { value: "terminado", label: "Terminado" },
  { value: "reabierto", label: "Reabierto" },
];

const statusMeta: Record<
  MatchStatus,
  { label: string; chipClassName: string; actionLabel: string; cardClassName: string }
> = {
  pendiente: {
    label: "Pendiente",
    chipClassName: "bg-[#e9eaeb] text-[#57423e]",
    actionLabel: "Abrir planilla",
    cardClassName: "border border-[#efe8e6] bg-[#ffffff]",
  },
  en_carga: {
    label: "En carga",
    chipClassName: "bg-[#570000] text-[#ffffff]",
    actionLabel: "Continuar carga",
    cardClassName: "border border-[#f2d4cf] bg-[#ffffff]",
  },
  terminado: {
    label: "Terminado",
    chipClassName: "bg-[#fff0ee] text-[#852318]",
    actionLabel: "Ver planilla",
    cardClassName: "border border-[#ffd8d3] bg-[#fff8f7]",
  },
  reabierto: {
    label: "Reabierto",
    chipClassName: "bg-[#ffdad6] text-[#ba1a1a]",
    actionLabel: "Corregir planilla",
    cardClassName: "border border-[#fac7c3] bg-[#ffffff]",
  },
};

const sortMatches = (items: MatchRef[]) =>
  [...items].sort((left, right) =>
    `${right.dateIso} ${right.time}`.localeCompare(`${left.dateIso} ${left.time}`)
  );

export function AssignedMatchesPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const outlet = useOutletContext<{ matchQuery?: string } | undefined>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MatchRef[]>([]);
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [error, setError] = useState<string | null>(null);
  const query = outlet?.matchQuery ?? "";

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data =
          user.role === "admin"
            ? await matchesService.list()
            : await matchesService.listAssigned(user.id);
        if (!mounted) return;
        setItems(sortMatches(data));
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los partidos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  const filteredMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((match) => {
      const statusOk = status === "all" ? true : match.status === status;
      const haystack = [
        match.tournament,
        match.pitch,
        match.venue,
        match.homeTeam.name,
        match.awayTeam.name,
        match.time,
        formatDateEs(match.dateIso),
        statusMeta[match.status].label,
      ]
        .join(" ")
        .toLowerCase();
      const queryOk = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      return statusOk && queryOk;
    });
  }, [items, query, status]);

  const counts = useMemo(
    () => ({
      total: items.length,
      abiertos: items.filter((item) => item.status === "pendiente" || item.status === "en_carga").length,
      finalizados: items.filter((item) => item.status === "terminado").length,
    }),
    [items]
  );

  const headlineMatch = filteredMatches[0] ?? items[0];

  const openMatch = async (match: MatchRef) => {
    let current = match;
    if (match.status === "pendiente") {
      current = await matchesService.setStatus(match.id, "en_carga");
      setItems((previous) =>
        sortMatches(previous.map((item) => (item.id === current.id ? current : item)))
      );
    }
    navigate(`/partidos/${current.id}/planilla`);
  };

  return (
    <div className="space-y-[36px]">
      <section className="rounded-[12px] bg-[linear-gradient(135deg,#fff0ee_0%,#ffffff_55%,#f6f7f8_100%)] px-[34px] py-[30px] shadow-[0_18px_38px_rgba(36,25,23,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-[24px]">
          <div className="max-w-[860px]">
            <p className="mb-[12px] text-[14px] font-bold uppercase tracking-[0.18em] text-[#e46857]">
              Operacion TDEFA
            </p>
            <h1 className="font-['Manrope'] text-[54px] font-black leading-[1.04] tracking-[-0.03em] text-[#300000]">
              Partidos y planillas
            </h1>
            <p className="mt-[14px] text-[20px] leading-[1.45] text-[#5e5e5e]">
              Carga resultados desde tus partidos asignados y entra directo a la planilla operativa.
            </p>
          </div>

          <button
            className="flex h-[62px] appearance-none items-center gap-[12px] rounded-[6px] border-0 bg-[#570000] px-[28px] text-[18px] font-semibold text-[#ffffff] shadow-[0_16px_30px_rgba(87,0,0,0.18)] transition hover:bg-[#300000]"
            onClick={() =>
              navigate(user?.role === "admin" ? "/admin/partidos/nuevo" : "/incidencias/nueva")
            }
            type="button"
          >
            <Plus className="h-[20px] w-[20px]" />
            {user?.role === "admin" ? "Registrar partido" : "Registrar incidencia"}
          </button>
        </div>

        <div className="mt-[28px] grid gap-[18px] md:grid-cols-[repeat(3,minmax(0,1fr))]">
          <StatCard icon={<CalendarDays className="h-[22px] w-[22px]" />} label="Asignados" value={String(counts.total)} />
          <StatCard icon={<Target className="h-[22px] w-[22px]" />} label="En carga" value={String(counts.abiertos)} />
          <StatCard icon={<Trophy className="h-[22px] w-[22px]" />} label="Terminados" value={String(counts.finalizados)} />
        </div>

        <div className="mt-[24px] flex flex-wrap items-center gap-[12px]">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={[
                "h-[44px] rounded-full px-[18px] text-[14px] font-semibold transition",
                status === option.value
                  ? "bg-[#570000] text-[#ffffff]"
                  : "bg-[#ffffff] text-[#57423e] shadow-[inset_0_0_0_1px_rgba(87,0,0,0.08)] hover:bg-[#fff0ee]",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>

        {headlineMatch ? (
          <div className="mt-[24px] flex flex-wrap items-center gap-[14px] text-[15px] text-[#5e5e5e]">
            <span className="rounded-full bg-[#ffffff] px-[14px] py-[8px] font-semibold text-[#300000]">
              Proximo bloque: {formatCompactDateTime(headlineMatch.dateIso, headlineMatch.time)}
            </span>
            <span>{headlineMatch.venue}</span>
            <span>•</span>
            <span>{headlineMatch.pitch}</span>
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="rounded-[8px] border border-[#fac7c3] bg-[#fff0ee] px-[22px] py-[18px] text-[16px] text-[#852318]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-[24px] xl:grid-cols-[repeat(2,minmax(0,1fr))]">
        {loading ? <LoadingCards /> : null}

        {!loading && filteredMatches.length === 0 ? (
          <div className="xl:[grid-column:span_2/span_2] flex min-h-[260px] items-center justify-center rounded-[10px] border border-dashed border-[#dec0bb] bg-[#ffffff] text-center">
            <div className="space-y-[12px] px-[24px] text-[#8b716d]">
              <SearchX className="mx-auto h-[40px] w-[40px]" />
              <p className="text-[20px]">No hay partidos para mostrar con los filtros actuales.</p>
            </div>
          </div>
        ) : null}

        {!loading
          ? filteredMatches.map((match) => (
              <article
                key={match.id}
                className={`rounded-[12px] p-[28px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] ${statusMeta[match.status].cardClassName}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-[18px]">
                  <div>
                    <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#57423e]">
                      {match.tournament}
                    </p>
                    <h2 className="mt-[10px] text-[30px] font-bold leading-[1.15] text-[#241917]">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </h2>
                    <p className="mt-[12px] text-[18px] text-[#5e5e5e]">
                      {match.pitch} • {match.venue}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-[14px] py-[8px] text-[14px] font-semibold ${statusMeta[match.status].chipClassName}`}
                  >
                    {statusMeta[match.status].label}
                  </span>
                </div>

                <div className="mt-[26px] flex items-center justify-between gap-[16px] rounded-[10px] bg-[#ffffff]/75 px-[22px] py-[18px]">
                  <div>
                    <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#8b716d]">Horario</p>
                    <p className="mt-[6px] text-[18px] font-semibold text-[#241917]">
                      {formatCompactDateTime(match.dateIso, match.time)}
                    </p>
                  </div>

                  {match.status === "terminado" ? (
                    <div className="rounded-[8px] bg-[#300000] px-[18px] py-[10px] text-[28px] font-black text-[#ffffff]">
                      {match.score.home} - {match.score.away}
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#8b716d]">Resultado</p>
                      <p className="mt-[6px] text-[24px] font-black text-[#300000]">
                        {match.score.home} - {match.score.away}
                      </p>
                    </div>
                  )}
                </div>

                {match.status === "reabierto" && match.reopenReason ? (
                  <div className="mt-[18px] rounded-[8px] bg-[#fff0ee] px-[16px] py-[12px] text-[15px] text-[#ba1a1a]">
                    Motivo: {match.reopenReason}
                  </div>
                ) : null}

                <div className="mt-[24px] flex flex-wrap items-center justify-between gap-[16px]">
                  <div className="flex items-center gap-[10px] text-[14px] text-[#5e5e5e]">
                    <Wifi className="h-[16px] w-[16px]" />
                    Sincronizado con base local
                  </div>

                  <button
                    className="flex h-[54px] appearance-none items-center gap-[10px] rounded-[6px] border-0 bg-[#570000] px-[22px] text-[16px] font-semibold text-[#ffffff] transition hover:bg-[#300000]"
                    onClick={() => void openMatch(match)}
                    type="button"
                  >
                    {statusMeta[match.status].actionLabel}
                    <ChevronRight className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </article>
            ))
          : null}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-[20px] border-t border-[#e9eaeb] pt-[28px] text-[16px] text-[#5e5e5e]">
        <div className="flex flex-wrap items-center gap-[18px]">
          <span className="flex items-center gap-[8px]">
            <Clock3 className="h-[18px] w-[18px]" />
            Ultimo corte: {headlineMatch ? formatCompactDateTime(headlineMatch.dateIso, headlineMatch.time) : "-"}
          </span>
          <span className="flex items-center gap-[8px]">
            <ListChecks className="h-[18px] w-[18px]" />
            Planillas listas para carga
          </span>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[10px] bg-[#ffffff] px-[22px] py-[20px] shadow-[0_8px_20px_rgba(36,25,23,0.04)]">
      <div className="flex items-center gap-[12px] text-[#570000]">{icon}</div>
      <p className="mt-[16px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">{label}</p>
      <p className="mt-[8px] text-[34px] font-black text-[#241917]">{value}</p>
    </div>
  );
}

function LoadingCards() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[320px] animate-pulse rounded-[12px] border border-[#eee2df] bg-[#ffffff]"
        />
      ))}
    </>
  );
}
