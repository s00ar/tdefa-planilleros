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
  { value: "nota", label: "ObservaciÃ³n" },
  { value: "gol", label: "Gol" },
  { value: "amarilla", label: "Tarjeta amarilla" },
  { value: "expulsion", label: "ExpulsiÃ³n" },
  { value: "cambio", label: "Cambio" },
];

const inputClass =
  "h-[56px] w-full rounded-[8px] border border-[#ead5d2] bg-[#f3deda] px-[18px] text-[16px] text-[#241917] outline-none sm:h-[64px] sm:px-[22px] sm:text-[18px]";

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
          description: error instanceof Error ? error.message : "IntentÃ¡ nuevamente.",
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
      toast.error("CompletÃ¡ el detalle de la incidencia");
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
        description: `${selectedMatch.pitch} â€¢ ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}`,
      });
      navigate(`/partidos/${selectedMatch.id}/planilla`);
    } catch (createError) {
      console.error("[incidents] create failed", { matchId: selectedMatch.id, error: createError });
      toast.error("No se pudo registrar la incidencia", {
        description: createError instanceof Error ? createError.message : "IntentÃ¡ nuevamente.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.18em] text-[#e46857] sm:text-[16px]">
            Registro Operativo
          </p>
          <div className="flex items-start gap-3">
            <h1 className="font-['Manrope'] text-[34px] font-black leading-[1.05] tracking-[-0.02em] text-[#300000] sm:text-[42px] lg:text-[52px]">
              Registrar incidencia
            </h1>
            <IncidentHelp className="size-8 text-base" />
          </div>
          <p className="mt-3 max-w-3xl text-[17px] leading-[1.4] text-[#5e5e5e] sm:text-[20px] lg:text-[21px]">
            CargÃ¡ un evento puntual y sincronizalo con la planilla del partido.
          </p>
        </div>
        <button
          className="flex h-[52px] w-full appearance-none items-center justify-center gap-[12px] rounded-[8px] border-0 bg-[#e9eaeb] px-[20px] text-[16px] font-semibold text-[#241917] sm:w-auto sm:px-[24px] sm:text-[18px]"
          onClick={() => navigate("/partidos")}
          type="button"
        >
          <ArrowLeft className="h-[20px] w-[20px]" />
          Volver
        </button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[12px] bg-[#ffffff] p-5 shadow-[0_10px_30px_-10px_rgba(36,25,23,0.08)] sm:p-8 lg:p-[40px]">
          <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:gap-[30px]">
            <Field label="Partido asignado" className="md:col-span-2">
              <select
                className={inputClass}
                disabled={matches.length === 0}
                onChange={(event) => setMatchId(event.target.value)}
                value={matchId}
              >
                {matches.length === 0 ? <option value="">No hay partidos disponibles</option> : null}
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.pitch} â€¢ {match.homeTeam.name} vs {match.awayTeam.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Minuto">
              <input
                className={inputClass}
                inputMode="numeric"
                onChange={(event) => setMinute(event.target.value)}
                type="number"
                value={minute}
              />
            </Field>

            <Field label="Tipo">
              <select
                className={inputClass}
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
                className={inputClass}
                onChange={(event) => setTeam(event.target.value as IncidentTeam)}
                value={team}
              >
                <option value="home">{selectedMatch?.homeTeam.name ?? "Local"}</option>
                <option value="away">{selectedMatch?.awayTeam.name ?? "Visitante"}</option>
              </select>
            </Field>

            <Field label="Prioridad">
              <div className="flex min-h-[56px] items-center gap-[14px] rounded-[8px] bg-[#fff0ee] px-[18px] text-[16px] font-semibold text-[#852318] sm:min-h-[64px] sm:px-[22px] sm:text-[18px]">
                <AlertTriangle className="h-[22px] w-[22px] shrink-0 sm:h-[24px] sm:w-[24px]" />
                Seguimiento tÃ©cnico
              </div>
            </Field>

            <Field label="Detalle de la incidencia" className="md:col-span-2">
              <textarea
                className="min-h-[170px] w-full resize-none rounded-[8px] border border-[#ead5d2] bg-[#f3deda] px-[18px] py-[16px] text-[16px] leading-[1.45] text-[#241917] outline-none placeholder:text-[#636262] sm:px-[22px] sm:py-[18px] sm:text-[18px]"
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Ej. Firma de capitÃ¡n faltante, correcciÃ³n de gol, observaciÃ³n del Ã¡rbitro..."
                value={label}
              />
            </Field>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[#000000]/10 pt-6 sm:flex-row sm:justify-end">
            <button
              className="h-[52px] appearance-none rounded-[8px] border-0 bg-[#e9eaeb] px-[24px] text-[16px] font-semibold text-[#241917] sm:px-[30px] sm:text-[18px]"
              onClick={() => navigate("/partidos")}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex h-[52px] appearance-none items-center justify-center gap-[12px] rounded-[8px] border-0 bg-[linear-gradient(135deg,#a53a2d_0%,#300000_100%)] px-[24px] text-[16px] font-semibold text-[#ffffff] shadow-[0_16px_30px_rgba(48,0,0,0.18)] disabled:opacity-60 sm:px-[30px] sm:text-[18px]"
              disabled={submitting}
              onClick={() => void submit()}
              type="button"
            >
              <Save className="h-[20px] w-[20px]" />
              {submitting ? "Guardando..." : "Registrar incidencia"}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[12px] bg-[#ffffff] p-5 shadow-[0_10px_30px_-10px_rgba(36,25,23,0.08)] sm:p-6">
            <div className="flex min-h-[70px] items-center gap-[18px] rounded-[8px] bg-[#fff0ee] px-[18px] text-[#852318]">
              <CalendarClock className="h-[28px] w-[28px]" />
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em]">Partido</p>
                <p className="mt-[4px] text-[18px] font-semibold">{selectedMatch?.pitch ?? "Sin asignar"}</p>
              </div>
            </div>
            <div className="mt-5 text-[16px] leading-[1.55] text-[#5e5e5e] sm:text-[18px]">
              {selectedMatch
                ? `${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name} â€¢ ${selectedMatch.venue}`
                : "No hay partidos disponibles para registrar una incidencia."}
            </div>
          </section>

          <section className="rounded-[12px] border border-[#000000]/15 bg-[#e9eaeb]/50 p-5 sm:p-6">
            <h2 className="m-[0] text-[13px] font-bold uppercase tracking-[0.22em] text-[#300000]">
              Checklist
            </h2>
            <ul className="m-[0] mt-5 list-none space-y-[14px] p-[0] text-[16px] text-[#241917] sm:text-[18px]">
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

          <section className="rounded-[12px] bg-[#300000] p-5 text-[#ffffff] sm:p-6">
            <FileText className="mb-[20px] h-[34px] w-[34px]" />
            <p className="text-[20px] font-bold leading-tight sm:text-[22px]">
              La incidencia queda registrada en la planilla.
            </p>
            <p className="mt-[14px] text-[15px] leading-[1.5] text-[#ffdad4] sm:text-[16px]">
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
      <span className="mb-[10px] block text-[12px] font-medium uppercase leading-none tracking-[0.08em] text-[#464747] sm:mb-[14px] sm:text-[14px]">
        {label}
      </span>
      {children}
    </label>
  );
}
