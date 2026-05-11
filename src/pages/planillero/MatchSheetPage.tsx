import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, MapPin, Landmark, Minus, Plus, Timer } from "lucide-react";
import { ScoreboardHeader } from "@/features/matchSheet/ScoreboardHeader";
import { useMatchSheetStore } from "@/features/matchSheet/matchSheet.store";
import { PlayersCard } from "@/features/matchSheet/PlayersCard";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { IncidentsCard } from "@/features/matchSheet/IncidentsCard";
import { Button } from "@/components/ui/button";
import { formatDateEs } from "@/lib/format";

export function MatchSheetPage() {
  const { matchId } = useParams();

  const load = useMatchSheetStore((s) => s.load);
  const loading = useMatchSheetStore((s) => s.loading);
  const error = useMatchSheetStore((s) => s.error);
  const match = useMatchSheetStore((s) => s.match);
  const draft = useMatchSheetStore((s) => s.draft);
  const updatePlayer = useMatchSheetStore((s) => s.updatePlayer);
  const setObservations = useMatchSheetStore((s) => s.setObservations);
  const addIncident = useMatchSheetStore((s) => s.addIncident);
  const setScore = useMatchSheetStore((s) => s.setScore);

  useEffect(() => {
    if (!matchId) return;
    void load(matchId);
  }, [matchId, load]);

  const locked = match?.status === "terminado";

  return (
    <div className="min-h-dvh">
      <ScoreboardHeader />

      <div className="space-y-6 px-4 py-6 md:px-6">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-[420px] rounded-2xl lg:col-span-2" />
          </div>
        ) : null}

        {!loading && error ? (
          <Card className="rounded-2xl border bg-card p-6 text-sm text-destructive shadow-soft">
            {error}
          </Card>
        ) : null}

        {!loading && match && draft ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <Card className="rounded-2xl border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">Datos del partido</div>
                    <div className="mt-1 text-xs text-muted-foreground">Información operativa (mock)</div>
                  </div>

                  <div className="hidden items-center gap-2 rounded-2xl border bg-muted/20 p-2 sm:flex">
                    <div className="flex items-center gap-2 rounded-xl bg-background px-3 py-2">
                      <div className="text-xs text-muted-foreground">{match.homeTeam.shortName}</div>
                      <div className="text-lg font-semibold tabular-nums">{match.score.home}</div>
                      <div className="text-muted-foreground">-</div>
                      <div className="text-lg font-semibold tabular-nums">{match.score.away}</div>
                      <div className="text-xs text-muted-foreground">{match.awayTeam.shortName}</div>
                    </div>
                    {!locked ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl"
                          onClick={() =>
                            void setScore({
                              home: Math.max(0, match.score.home - 1),
                              away: match.score.away,
                            })
                          }
                          aria-label="Restar gol local"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl"
                          onClick={() =>
                            void setScore({
                              home: match.score.home + 1,
                              away: match.score.away,
                            })
                          }
                          aria-label="Sumar gol local"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <div className="w-px self-stretch bg-border" />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl"
                          onClick={() =>
                            void setScore({
                              home: match.score.home,
                              away: Math.max(0, match.score.away - 1),
                            })
                          }
                          aria-label="Restar gol visitante"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl"
                          onClick={() =>
                            void setScore({
                              home: match.score.home,
                              away: match.score.away + 1,
                            })
                          }
                          aria-label="Sumar gol visitante"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2 rounded-xl border bg-muted/20 px-3 py-3">
                    <Landmark className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Cancha</div>
                      <div className="text-sm font-medium">{match.pitch}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border bg-muted/20 px-3 py-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Sede</div>
                      <div className="text-sm font-medium">{match.venue}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border bg-muted/20 px-3 py-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Fecha</div>
                      <div className="text-sm font-medium">{formatDateEs(match.dateIso)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border bg-muted/20 px-3 py-3">
                    <Timer className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Horario</div>
                      <div className="text-sm font-medium">{match.time}hs</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border bg-background px-3 py-3 text-xs text-muted-foreground">
                  Última actualización planilla:{" "}
                  <span className="font-medium text-foreground">{draft.updatedAtIso}</span>
                </div>
              </Card>

              <IncidentsCard incidents={draft.incidents} onAdd={addIncident} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <PlayersCard
                title={match.homeTeam.name}
                subtitle="Plantel local"
                tone="home"
                players={draft.homePlayers}
                disabled={locked}
                onUpdatePlayer={(id, patch) => updatePlayer("homePlayers", id, patch)}
              />
              <PlayersCard
                title={match.awayTeam.name}
                subtitle="Plantel visitante"
                tone="away"
                players={draft.awayPlayers}
                disabled={locked}
                onUpdatePlayer={(id, patch) => updatePlayer("awayPlayers", id, patch)}
              />
            </div>

            <Card className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="text-sm font-semibold">Incidencias y observaciones</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Detalles adicionales del partido (operativo).
              </div>
              <Textarea
                className="mt-4 min-h-[140px] resize-none"
                placeholder="Escribí observaciones del encuentro, incidencias especiales, etc."
                value={draft.observations}
                onChange={(e) => setObservations(e.target.value)}
                disabled={locked}
              />
              {locked ? (
                <div className="mt-2 text-xs text-muted-foreground">El partido está finalizado (solo lectura).</div>
              ) : null}
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
