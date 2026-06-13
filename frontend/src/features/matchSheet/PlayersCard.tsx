import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import type { PlayerSheetRow } from "@/types/sheet";
import { PlayerRow } from "@/features/matchSheet/PlayerRow";

export function PlayersCard({
  title,
  subtitle,
  players,
  tone = "home",
  onUpdatePlayer,
  disabled = false,
}: {
  title: string;
  subtitle?: string;
  tone?: "home" | "away";
  players: PlayerSheetRow[];
  onUpdatePlayer: (id: string, patch: Partial<PlayerSheetRow>) => void;
  disabled?: boolean;
}) {
  const headerTone =
    tone === "home" ? "from-primary/15 to-transparent" : "from-slate-900/10 to-transparent";

  return (
    <Card className="overflow-hidden rounded-[24px] border bg-card shadow-[0_10px_30px_rgba(36,25,23,0.06)]">
      <div className={"bg-gradient-to-r px-5 py-5 sm:px-6 " + headerTone}>
        <div className="text-lg font-bold text-[#241917]">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>

      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="mb-2 hidden min-w-[1120px] grid-cols-[minmax(220px,1.4fr)_minmax(120px,0.7fr)_auto_minmax(120px,0.8fr)_auto_minmax(150px,0.8fr)_minmax(160px,1fr)_auto_auto_auto_minmax(200px,1fr)] gap-3 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <div>Jugador</div>
          <div>DNI</div>
          <div className="text-center">Apto</div>
          <div className="text-center">Firma</div>
          <div>Cambio</div>
          <div>Obs</div>
          <div className="text-center">Goles</div>
          <div className="text-center">Amarillas</div>
          <div className="text-center">Expulsión</div>
          <div>Motivo</div>
          <div />
        </div>

        <ScrollArea className="-mx-1">
          <div className="grid gap-3 p-1">
            {players.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                Sin jugadores cargados
              </div>
            ) : null}
            {players.map((p) => (
              <PlayerRow
                key={p.id}
                row={p}
                disabled={disabled}
                onChange={(patch) => onUpdatePlayer(p.id, patch)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Card>
  );
}
