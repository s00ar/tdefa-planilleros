import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Clock3, MapPin, Minus, Plus, ShieldCheck, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreboardHeader } from "@/features/matchSheet/ScoreboardHeader";
import { PlayersCard } from "@/features/matchSheet/PlayersCard";
import { IncidentsCard } from "@/features/matchSheet/IncidentsCard";
import { useMatchSheetStore } from "@/features/matchSheet/matchSheet.store";
import { formatCompactDateTime } from "@/lib/format";

export function MatchSheetPage() {
  const { matchId } = useParams();
  const load = useMatchSheetStore((state) => state.load);
  const loading = useMatchSheetStore((state) => state.loading);
  const error = useMatchSheetStore((state) => state.error);
  const match = useMatchSheetStore((state) => state.match);
  const draft = useMatchSheetStore((state) => state.draft);
  const setScore = useMatchSheetStore((state) => state.setScore);
  const updatePlayer = useMatchSheetStore((state) => state.updatePlayer);
  const addIncident = useMatchSheetStore((state) => state.addIncident);
  const setObservations = useMatchSheetStore((state) => state.setObservations);

  useEffect(() => {
    if (!matchId) return;
    void load(matchId);
  }, [load, matchId]);

  if (loading) {
    return (
      <div className="grid min-h-[500px] place-items-center px-4 text-[18px] text-[#5e5e5e]">
        Cargando planilla...
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 rounded-[10px] border border-[#fac7c3] bg-[#fff0ee] px-[22px] py-[18px] text-[16px] text-[#852318]">
        {error}
      </div>
    );
  }

  if (!match || !draft) return null;

  const locked = match.status === "terminado";

  const updateScore = async (side: "home" | "away", delta: number) => {
    const next = {
      home: match.score.home,
      away: match.score.away,
    };
    next[side] = Math.max(0, next[side] + delta);
    await setScore(next);
  };

  return (
    <div className="mx-auto w-full max-w-[1720px] space-y-5 p-4 sm:p-6 lg:space-y-6 lg:p-8">
      <ScoreboardHeader />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.6fr)_390px]">
        <Card className="rounded-[24px] border-0 bg-[linear-gradient(135deg,#fff0ee_0%,#ffffff_58%,#f4f5f7_100%)] p-5 shadow-[0_18px_38px_rgba(36,25,23,0.08)] sm:p-6 lg:p-8">
          <div className="flex flex-col items-stretch justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-[620px]">
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#e46857]">
                {match.tournament}
              </p>
              <h1 className="mt-3 text-[30px] font-black leading-[1.06] tracking-[-0.03em] text-[#300000] sm:text-[38px] lg:text-[44px]">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[15px] text-[#5e5e5e]">
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {formatCompactDateTime(match.dateIso, match.time)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {match.venue} - {match.pitch}
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Última actualización: {new Date(draft.updatedAtIso).toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            <div className="w-full rounded-[22px] bg-[#1a1d1e] p-4 text-white shadow-[0_18px_28px_rgba(0,0,0,0.18)] lg:max-w-[390px]">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
                <TeamScore
                  align="left"
                  name={match.homeTeam.shortName}
                  score={match.score.home}
                  onDecrease={() => void updateScore("home", -1)}
                  onIncrease={() => void updateScore("home", 1)}
                  disabled={locked}
                />
                <div className="text-[18px] font-bold text-[#ffdad4]">VS</div>
                <TeamScore
                  align="right"
                  name={match.awayTeam.shortName}
                  score={match.score.away}
                  onDecrease={() => void updateScore("away", -1)}
                  onIncrease={() => void updateScore("away", 1)}
                  disabled={locked}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[24px] border-0 bg-[#300000] p-6 text-white shadow-[0_18px_38px_rgba(48,0,0,0.16)]">
          <Trophy className="h-8 w-8 text-[#ffdad4]" />
          <h2 className="mt-4 text-[28px] font-black leading-[1.1]">Vista de planilla</h2>
          <p className="mt-3 text-[16px] leading-[1.55] text-[#ffdad4]">
            Cargá jugadores, incidencias y observaciones. Los cambios quedan guardados en el sistema.
          </p>
          <div className="mt-6 grid gap-3 text-[14px]">
            <InfoRow label="Estado" value={match.status} />
            <InfoRow label="Local" value={match.homeTeam.name} />
            <InfoRow label="Visitante" value={match.awayTeam.name} />
            <InfoRow label="Resultado" value={`${match.score.home} - ${match.score.away}`} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:gap-6">
        <PlayersCard
          title={`Local: ${match.homeTeam.name}`}
          subtitle="Control operativo del plantel local"
          players={draft.homePlayers}
          tone="home"
          disabled={locked}
          onUpdatePlayer={(id, patch) => updatePlayer("homePlayers", id, patch)}
        />
        <PlayersCard
          title={`Visitante: ${match.awayTeam.name}`}
          subtitle="Control operativo del plantel visitante"
          tone="away"
          players={draft.awayPlayers}
          disabled={locked}
          onUpdatePlayer={(id, patch) => updatePlayer("awayPlayers", id, patch)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <Card className="rounded-[24px] border bg-white p-5 shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-6">
          <div className="mb-4">
            <h2 className="text-[24px] font-bold text-[#241917]">Observaciones de planilla</h2>
            <p className="mt-2 text-[15px] text-[#5e5e5e]">
              Dejá trazabilidad de firmas, correcciones, notas del árbitro o cualquier validación manual.
            </p>
          </div>
          <Textarea
            className="min-h-[220px] rounded-[18px] border-[#ead5d2] bg-[#fff8f7] px-4 py-3 text-[16px] leading-[1.6] text-[#241917]"
            disabled={locked}
            onChange={(event) => setObservations(event.target.value)}
            placeholder="Registrar observaciones operativas..."
            value={draft.observations}
          />
        </Card>

        <IncidentsCard incidents={draft.incidents} onAdd={addIncident} />
      </div>
    </div>
  );
}

function TeamScore({
  align,
  name,
  score,
  onDecrease,
  onIncrease,
  disabled,
}: {
  align: "left" | "right";
  name: string;
  score: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled: boolean;
}) {
  return (
    <div className={align === "right" ? "min-w-0 text-right" : "min-w-0 text-left"}>
      <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#c7c6c6]">{name}</p>
      <div className={`mt-4 flex items-center gap-1 sm:gap-2 ${align === "right" ? "justify-end" : "justify-start"}`}>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-9 w-9 rounded-full bg-[#2a2d2e] text-[#ffffff] hover:bg-[#333637]"
          disabled={disabled}
          onClick={onDecrease}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="min-w-[42px] text-center text-[34px] font-black leading-none text-[#ffdad4] sm:min-w-[58px] sm:text-[42px]">
          {score}
        </div>
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 rounded-full bg-[#570000] text-[#ffffff] hover:bg-[#6a0a0a]"
          disabled={disabled}
          onClick={onIncrease}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] bg-[#4a0909] px-4 py-3">
      <span className="text-[#ffdad4]">{label}</span>
      <span className="font-semibold text-[#ffffff]">{value}</span>
    </div>
  );
}
