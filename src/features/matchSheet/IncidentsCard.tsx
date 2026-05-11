import { useMemo, useState } from "react";
import { Flag, ShieldAlert, XCircle, Repeat2, StickyNote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MatchSheet } from "@/types/sheet";
import { cn } from "@/lib/utils";

const iconFor = (t: MatchSheet["incidents"][number]["type"]) => {
  switch (t) {
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
  onAdd: (incident: Omit<MatchSheet["incidents"][number], "id">) => void;
}) {
  const [minute, setMinute] = useState<string>("45");
  const [type, setType] = useState<MatchSheet["incidents"][number]["type"]>("nota");
  const [team, setTeam] = useState<MatchSheet["incidents"][number]["team"]>("home");
  const [label, setLabel] = useState("");

  const sorted = useMemo(
    () => [...incidents].sort((a, b) => b.minute - a.minute),
    [incidents]
  );

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="border-b bg-muted/20 px-4 py-4">
        <div className="text-sm font-semibold">Incidencias</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Registro rápido de eventos (mock). No afecta lógica real.
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-2 lg:grid-cols-4">
          <Input
            className="h-10"
            inputMode="numeric"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="Minuto"
          />
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gol">Gol</SelectItem>
              <SelectItem value="amarilla">Amarilla</SelectItem>
              <SelectItem value="expulsion">Expulsión</SelectItem>
              <SelectItem value="cambio">Cambio</SelectItem>
              <SelectItem value="nota">Nota</SelectItem>
            </SelectContent>
          </Select>
          <Select value={team} onValueChange={(v) => setTeam(v as typeof team)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Local</SelectItem>
              <SelectItem value="away">Visitante</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              className="h-10"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Detalle (jugador / nota)"
            />
            <Button
              className="h-10 rounded-xl"
              onClick={() => {
                const m = Math.max(0, Math.min(130, Number(minute || 0)));
                onAdd({ minute: m, type, team, label: label.trim() || "—" });
                setLabel("");
              }}
            >
              Agregar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-5 text-center text-sm text-muted-foreground">
              Sin incidencias registradas
            </div>
          ) : null}

          {sorted.slice(0, 12).map((i) => (
            <div
              key={i.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2",
                i.team === "home" ? "border-primary/15" : "border-slate-900/10"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                {iconFor(i.type)}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{i.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Min {i.minute} · {i.team === "home" ? "Local" : "Visitante"}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {i.type}
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

