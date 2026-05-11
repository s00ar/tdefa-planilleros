import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/common/PageTitle";
import { MatchCard } from "@/features/matches/MatchCard";
import { matchesService } from "@/services/matches.service";
import { useAuthUser } from "@/store/auth.store";
import type { MatchRef, MatchStatus } from "@/types/match";
import { Skeleton } from "@/components/ui/skeleton";

const statuses: Array<{ value: MatchStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_carga", label: "En carga" },
  { value: "terminado", label: "Terminado" },
  { value: "reabierto", label: "Reabierto" },
];

export function AssignedMatchesPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MatchRef[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]["value"]>("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      setLoading(true);
      const data = await matchesService.listAssigned(user.id);
      if (!mounted) return;
      setItems(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      const statusOk = status === "all" ? true : m.status === status;
      const text = `${m.pitch} ${m.venue} ${m.homeTeam.name} ${m.awayTeam.name}`.toLowerCase();
      const queryOk = q ? text.includes(q) : true;
      return statusOk && queryOk;
    });
  }, [items, query, status]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Mis partidos asignados"
        subtitle="Seleccioná un partido para cargar incidencias y planilla operativa."
        right={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 w-64 pl-10"
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              className="h-10 rounded-xl"
              onClick={() => {
                const nextIndex = (statuses.findIndex((s) => s.value === status) + 1) % statuses.length;
                setStatus(statuses[nextIndex]!.value);
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              {statuses.find((s) => s.value === status)?.label ?? "Filtro"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <Skeleton className="mt-5 h-28 w-full rounded-2xl" />
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-3 w-44" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
              </div>
            ))
          : null}

        {!loading && filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground md:col-span-2">
            No hay partidos para mostrar con los filtros actuales.
          </div>
        ) : null}

        {!loading
          ? filtered.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onOpen={async (id) => {
                  const match = items.find((x) => x.id === id);
                  if (match?.status === "pendiente") {
                    const updated = await matchesService.setStatus(id, "en_carga");
                    setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
                  }
                  navigate(`/partidos/${id}/planilla`);
                }}
              />
            ))
          : null}
      </div>
    </div>
  );
}

