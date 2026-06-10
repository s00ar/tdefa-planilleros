import { useMemo, useState } from "react";
import { Flag, Repeat2, ShieldAlert, StickyNote, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IncidentHelp } from "@/components/common/IncidentHelp";
import { cn } from "@/lib/utils";
import type { MatchSheet } from "@/types/sheet";

const iconFor = (type: MatchSheet["incidents"][number]["type"]) => {
  switch (type) {
    case "gol":
      return <Flag className="h-4 w-4 text-emerald-600" />;
    case "amarilla":
      return <ShieldAlert className="h-4 w-4 text-amber-600" />;
    case "expulsion":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "cambio":
      return <Repeat2 className="h-4 w-4 text-sky-700" />;
    default:
      return <StickyNote className="h-4 w-4 text-muted-foreground" />;
  }
};

export function IncidentsCard({
  incidents,
  onAdd,
}: {
  incidents: MatchSheet["incidents"];
  onAdd: (incident: Omit<MatchSheet["incidents"][number], "id">) => Promise<void>;
}) {
  const [minute, setMinute] = useState("45");
  const [type, setType] = useState<MatchSheet["incidents"][number]["type"]>("nota");
  const [team, setTeam] = useState<MatchSheet["incidents"][number]["team"]>("home");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sorted = useMemo(() => [...incidents].sort((a, b) => b.minute - a.minute), [incidents]);

  return (
    <Card className="overflow-hidden rounded-[24px] border bg-card shadow-[0_10px_30px_rgba(36,25,23,0.06)]">
      <div className="border-b bg-muted/20 px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold text-[#241917]">Incidencias</div>
          <IncidentHelp />
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          Registro rápido de eventos sincronizado con la planilla.
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[90px_160px_160px_minmax(260px,1fr)]">
          <Input
            className="h-10"
            inputMode="numeric"
            onChange={(event) => setMinute(event.target.value)}
            placeholder="Minuto"
            value={minute}
          />
          <Select onValueChange={(value) => setType(value as typeof type)} value={type}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gol">Gol</SelectItem>
              <SelectItem value="amarilla">Amarilla</SelectItem>
              <SelectItem value="expulsion">Expulsion</SelectItem>
              <SelectItem value="cambio">Cambio</SelectItem>
              <SelectItem value="nota">Nota</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setTeam(value as typeof team)} value={team}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Local</SelectItem>
              <SelectItem value="away">Visitante</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex min-w-0 gap-2 sm:col-span-2 xl:col-span-1">
            <Input
              className="h-10"
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Detalle"
              value={label}
            />
            <Button
              className="h-10 rounded-xl"
              disabled={submitting}
              onClick={async () => {
                if (submitting) return;
                const parsedMinute = Math.max(0, Math.min(130, Number(minute || 0)));
                setSubmitting(true);
                try {
                  await onAdd({ minute: parsedMinute, type, team, label: label.trim() || "-" });
                  setLabel("");
                } catch (error) {
                  console.error("[match-sheet] add incident button failed", error);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Guardando..." : "Agregar incidencia"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-5 text-center text-sm text-muted-foreground">
              Sin incidencias registradas
            </div>
          ) : null}

          {sorted.slice(0, 12).map((incident) => (
            <div
              key={incident.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2",
                incident.team === "home" ? "border-primary/15" : "border-slate-900/10"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                {iconFor(incident.type)}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{incident.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Min {incident.minute} - {incident.team === "home" ? "Local" : "Visitante"}
                  </div>
                </div>
              </div>
              <Badge className="rounded-full" variant="secondary">
                {incident.type}
              </Badge>
            </div>
          ))}

          {sorted.length > 12 ? (
            <div className="text-center text-xs text-muted-foreground">
              Mostrando 12 de {sorted.length} incidencias.
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
