import { CalendarDays, MapPin, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import type { MatchRef } from "@/types/match";
import { formatCompactDateTime } from "@/lib/format";

export function MatchCard({
  match,
  onOpen,
}: {
  match: MatchRef;
  onOpen: (id: string) => void;
}) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md",
        match.status === "en_carga" && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Landmark className="h-4 w-4 text-primary" />
            <span className="truncate">{match.pitch}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatCompactDateTime(match.dateIso, match.time)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {match.venue}
            </span>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="mt-5 rounded-2xl border bg-muted/30 p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="min-w-0 text-right">
            <div className="truncate text-sm font-semibold">{match.homeTeam.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Local</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs font-medium text-muted-foreground">VS</div>
            <div className="mt-1 rounded-xl bg-background px-3 py-1 text-sm font-semibold tabular-nums shadow-sm">
              {match.score.home} <span className="text-muted-foreground">-</span> {match.score.away}
            </div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{match.awayTeam.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Visitante</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {match.status === "terminado" ? "Partido finalizado" : "Planilla operativa disponible"}
        </div>
        <Button
          className="rounded-xl"
          variant={match.status === "terminado" ? "secondary" : "default"}
          onClick={() => onOpen(match.id)}
        >
          {match.status === "terminado" ? "Ver planilla" : "Abrir planilla"}
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition group-hover:opacity-100" />
    </Card>
  );
}
