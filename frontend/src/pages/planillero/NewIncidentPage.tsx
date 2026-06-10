import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CalendarClock, CheckCircle2, FileText, Save } from "lucide-react";
import { matchesService } from "@/services/matches.service";
import { sheetsService } from "@/services/sheets.service";
import { useAuthUser } from "@/store/auth.store";
import { useToast } from "@/hooks/useToast";
import { IncidentHelp } from "@/components/common/IncidentHelp";
import type { MatchRef } from "@/types/match";
import type { MatchSheet } from "@/types/sheet";

type IncidentType = MatchSheet["incidents"][number]["type"];
type IncidentTeam = MatchSheet["incidents"][number]["team"];

const incidentTypes: Array<{ value: IncidentType; label: string }> = [
  { value: "nota", label: "Observación" },
  { value: "gol", label: "Gol" },
  { value: "amarilla", label: "Tarjeta amarilla" },
  { value: "expulsion", label: "Expulsión" },
  { value: "cambio", label: "Cambio" },
];

export function NewIncidentPage() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const toast = useToast();
  const submittingRef = useRef(false);
  const [matches, setMatches] = useState<MatchRef[]>([]);
  const [matchId, setMatchId] = useState("");
  const [minute, setMinute] = useState("45");
  const [type, setType] = useState<IncidentType>("nota");
  const [team, setTeam] = useState<IncidentTeam>("home");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data =
          user?.role === "admin"
            ? await matchesService.list()
            : user
              ? await matchesService.listAssigned(user.id)
              : [];
        if (!mounted) return;
        setMatches(data);
        setMatchId(data.find((match) => match.status !== "terminado")?.id ?? data[0]?.id ?? "");
      } catch (error) {
        if (!mounted) return;
        console.error("[incidents] matches load failed", error);
        toast.error("No se pudieron cargar los partidos", {
          description: error instanceof Error ? error.message : "Intentá nuevamente.",
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast, user]);

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === matchId) ?? matches[0],
    [matchId, matches]
  );

  const submit = async () => {
    if (!selectedMatch) return;
    if (submittingRef.current) {
      console.warn("[incidents] create ignored: request already in progress");
      return;
    }

    const cleanLabel = label.trim();
    if (!cleanLabel) {
      toast.error("Completá el detalle de la incidencia");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    console.info("[incidents] create started", { matchId: selectedMatch.id, minute, type, team });
    try {
      await sheetsService.addIncident(selectedMatch.id, {
        minute: Math.max(0, Math.min(130, Number(minute || 0))),
        type,
        team,
        label: cleanLabel,
      });
      console.info("[incidents] create completed", { matchId: selectedMatch.id });
      toast.success("Incidencia registrada", {
        description: `${selectedMatch.pitch} • ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`,
      });
      navigate(`/partidos/${selectedMatch.id}/planilla`);
    } catch (createError) {
      console.error("[incidents] create failed", { matchId: selectedMatch.id, error: createError });
      toast.error("No se pudo registrar la incidencia", {
        description: createError instanceof Error ? createError.message : "Intentá nuevamente.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-[34px]">
      <section className="flex items-end justify-between">
        <div>
          <p className="mb-[12px] text-[16px] font-medium uppercase tracking-[0.18em] text-[#e46857]">
            Registro Operativo
          </p>
          <div className="flex items-center gap-3">
            <h1 className="font-['Manrope'] text-[52px] font-black leading-[1.05] tracking-[-0.02em] text-[#300000]">
              Registrar incidencia
            </h1>
            <IncidentHelp className="size-8 text-base" />
          </div>
          <p className="mt-[12px] text-[21px] leading-[1.35] text-[#5e5e5e]">
            Cargá un evento puntual y sincronizalo con la planilla del partido.
          </p>
        </div>
        <button
          className="flex h-[58px] appearance-none items-center gap-[12px] rounded-[4px] border-0 bg-[#e9eaeb] px-[24px] text-[18px] font-semibold text-[#241917]"
          onClick={() => navigate("/partidos")}
          type="button"
        >
          <ArrowLeft className="h-[20px] w-[20px]" />
          Volver
        </button>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-[30px]">
        <section className="rounded-[8px] bg-[#ffffff] p-[50px] shadow-[0_10px_30px_-10px_rgba(36,25,23,0.08)]">
          <div className="grid grid-cols-2 gap-[30px]">
            <Field label="Partido asignado" className="[grid-column:span_2/span_2]">
              <select
                className="h-[70px] w-full appearance-none rounded-[4px] border-0 bg-[#f3deda] px-[22px] text-[20px] text-[#241917] outline-none"
                disabled={matches.length === 0}
                onChange={(event) => setMatchId(event.target.value)}
                value={matchId}
              >
                {matches.length === 0 ? <option value="">No hay partidos disponibles</option> : null}
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.pitch} • {match.homeTeam.name} vs {match.awayTeam.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Minuto">
              <input
                className="h-[70px] w-full rounded-[4px] border-0 bg-[#f3deda] px-[22px] text-[20px] text-[#241917] outline-none"
                inputMode="numeric"
                onChange={(event) => setMinute(event.target.value)}
                type="number"
                value={minute}
              />
            </Field>

            <Field label="Tipo">
              <select
                className="h-[70px] w-full appearance-none rounded-[4px] border-0 bg-[#f3deda] px-[22px] text-[20px] text-[#241917] outline-none"
                onChange={(event) => setType(event.target.value as IncidentType)}
                value={type}
              >
                {incidentTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Equipo">
              <select
                className="h-[70px] w-full appearance-none rounded-[4px] border-0 bg-[#f3deda] px-[22px] text-[20px] text-[#241917] outline-none"
                onChange={(event) => setTeam(event.target.value as IncidentTeam)}
                value={team}
              >
                <option value="home">{selectedMatch?.homeTeam.name ?? "Local"}</option>
                <option value="away">{selectedMatch?.awayTeam.name ?? "Visitante"}</option>
              </select>
            </Field>

            <Field label="Prioridad">
              <div className="flex h-[70px] items-center gap-[14px] rounded-[4px] bg-[#fff0ee] px-[22px] text-[18px] font-semibold text-[#852318]">
                <AlertTriangle className="h-[24px] w-[24px]" />
                Seguimiento técnico
              </div>
            </Field>

            <Field label="Detalle de la incidencia" className="[grid-column:span_2/span_2]">
              <textarea
                className="min-h-[170px] w-full resize-none rounded-[4px] border-0 bg-[#f3deda] px-[22px] py-[18px] text-[20px] leading-[1.45] text-[#241917] outline-none placeholder:text-[#636262]"
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Ej. Firma de capitán faltante, corrección de gol, observación del árbitro..."
                value={label}
              />
            </Field>
          </div>

          <div className="mt-[34px] flex items-center justify-end gap-[20px] border-t border-[#000000]/10 pt-[30px]">
            <button
              className="h-[58px] appearance-none rounded-[4px] border-0 bg-[#e9eaeb] px-[36px] text-[20px] font-semibold text-[#241917]"
              onClick={() => navigate("/partidos")}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex h-[58px] appearance-none items-center gap-[12px] rounded-[4px] border-0 bg-[linear-gradient(135deg,#a53a2d_0%,#300000_100%)] px-[36px] text-[20px] font-semibold text-[#ffffff] shadow-[0_16px_30px_rgba(48,0,0,0.18)] disabled:opacity-60"
              disabled={submitting}
              onClick={() => void submit()}
              type="button"
            >
              <Save className="h-[22px] w-[22px]" />
              {submitting ? "Guardando..." : "Registrar incidencia"}
            </button>
          </div>
        </section>

        <aside className="space-y-[30px]">
          <section className="rounded-[8px] bg-[#ffffff] p-[30px] shadow-[0_10px_30px_-10px_rgba(36,25,23,0.08)]">
            <div className="flex h-[70px] items-center gap-[18px] rounded-[6px] bg-[#fff0ee] px-[22px] text-[#852318]">
              <CalendarClock className="h-[30px] w-[30px]" />
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.14em]">Partido</p>
                <p className="mt-[4px] text-[18px] font-semibold">{selectedMatch?.pitch ?? "Sin asignar"}</p>
              </div>
            </div>
            <div className="mt-[26px] text-[18px] leading-[1.55] text-[#5e5e5e]">
              {selectedMatch
                ? `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name} • ${selectedMatch.venue}`
                : "No hay partidos disponibles para registrar una incidencia."}
            </div>
          </section>

          <section className="rounded-[8px] border border-[#000000]/15 bg-[#e9eaeb]/50 p-[30px]">
            <h2 className="m-[0] text-[14px] font-bold uppercase tracking-[0.22em] text-[#300000]">
              Checklist
            </h2>
            <ul className="m-[0] mt-[24px] list-none space-y-[16px] p-[0] text-[18px] text-[#241917]">
              <li className="flex items-center gap-[12px]">
                <CheckCircle2 className="h-[20px] w-[20px]" />
                Partido seleccionado
              </li>
              <li className="flex items-center gap-[12px]">
                <CheckCircle2 className="h-[20px] w-[20px]" />
                Minuto validado
              </li>
              <li className="flex items-center gap-[12px]">
                <CheckCircle2 className="h-[20px] w-[20px]" />
                Detalle auditable
              </li>
            </ul>
          </section>

          <section className="rounded-[8px] bg-[#300000] p-[30px] text-[#ffffff]">
            <FileText className="mb-[20px] h-[34px] w-[34px]" />
            <p className="text-[22px] font-bold leading-tight">La incidencia queda registrada en la planilla.</p>
            <p className="mt-[14px] text-[16px] leading-[1.5] text-[#ffdad4]">
              Al guardar, vas directo al partido para revisar el historial completo.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-[14px] block text-[14px] font-medium uppercase leading-none text-[#464747]">
        {label}
      </span>
      {children}
    </label>
  );
}
