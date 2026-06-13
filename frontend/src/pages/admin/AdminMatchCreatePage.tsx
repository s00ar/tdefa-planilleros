import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, ChevronRight } from "lucide-react";
import { matchesService } from "@/services/matches.service";
import { planillerosService } from "@/services/planilleros.service";
import { teamsService, tournamentsService } from "@/services/catalog.service";
import { useToast } from "@/hooks/useToast";
import type { Planillero } from "@/types/planillero";
import type { Team, Tournament } from "@/types/catalog";

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={wide ? "md:[grid-column:span_2/span_2]" : ""}>
      <span className="mb-[10px] block text-[13px] font-bold uppercase tracking-[0.08em] text-[#57423e]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-[56px] w-full rounded-[8px] border border-[#ead5d2] bg-[#fff8f7] px-[16px] text-[16px] text-[#241917] outline-none focus:ring-2 focus:ring-[#570000]/15";

export function AdminMatchCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const submittingRef = useRef(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [planilleros, setPlanilleros] = useState<Planillero[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [tournamentId, setTournamentId] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [pitch, setPitch] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [assignedPlanilleroId, setAssignedPlanilleroId] = useState("");

  useEffect(() => {
    let mounted = true;
    console.info("[matches] loading creation options");
    void Promise.all([planillerosService.list(), tournamentsService.list(), teamsService.list()])
      .then(([planilleroItems, tournamentItems, teamItems]) => {
        if (!mounted) return;
        const activePlanilleros = planilleroItems.filter((item) => item.status === "activo");
        const activeTournaments = tournamentItems.filter((item) => item.status === "activo");
        const activeTeams = teamItems.filter((item) => item.status === "activo");
        setPlanilleros(activePlanilleros);
        setTournaments(activeTournaments);
        setTeams(activeTeams);
        setAssignedPlanilleroId(activePlanilleros[0]?.id ?? "");
        setTournamentId(activeTournaments[0]?.id ?? "");
        setHomeTeamId(activeTeams[0]?.id ?? "");
        setAwayTeamId(activeTeams[1]?.id ?? "");
        console.info("[matches] creation options loaded", {
          planilleros: activePlanilleros.length,
          tournaments: activeTournaments.length,
          teams: activeTeams.length,
        });
      })
      .catch((error) => {
        if (!mounted) return;
        console.error("[matches] creation options load failed", error);
        toast.error("No se pudieron cargar las opciones del partido", {
          description: error instanceof Error ? error.message : "IntentÃ¡ nuevamente.",
        });
      })
      .finally(() => {
        if (mounted) setLoadingOptions(false);
      });

    return () => {
      mounted = false;
    };
  }, [toast]);

  const selectedPlanillero = useMemo(
    () => planilleros.find((item) => item.id === assignedPlanilleroId),
    [assignedPlanilleroId, planilleros]
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (
      !tournamentId ||
      !dateIso ||
      !time ||
      !venue.trim() ||
      !pitch.trim() ||
      !homeTeamId ||
      !awayTeamId ||
      !assignedPlanilleroId
    ) {
      toast.error("Datos incompletos", {
        description: "CompletÃ¡ todos los campos obligatorios del partido.",
      });
      return;
    }
    if (homeTeamId === awayTeamId) {
      toast.error("Equipos invÃ¡lidos", {
        description: "El equipo local y visitante deben ser diferentes.",
      });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    console.info("[matches] create started", { tournamentId, dateIso, time, assignedPlanilleroId });
    try {
      const created = await matchesService.create({
        tournamentId,
        dateIso,
        time,
        venue: venue.trim(),
        pitch: pitch.trim(),
        homeTeamId,
        awayTeamId,
        assignedPlanilleroId,
      });
      console.info("[matches] create completed", { id: created.id });
      toast.success("Partido creado", {
        description: `${created.homeTeam.name} vs ${created.awayTeam.name}`,
      });
      navigate("/partidos", { replace: true });
    } catch (error) {
      console.error("[matches] create failed", error);
      toast.error("No se pudo crear el partido", {
        description: error instanceof Error ? error.message : "IntentÃ¡ nuevamente.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-[30px]">
      <div className="flex items-center gap-[10px] text-[16px] font-medium text-[#5e5e5e]">
        <span>Partidos</span>
        <ChevronRight className="h-[16px] w-[16px]" />
        <span className="font-bold text-[#241917]">Alta</span>
      </div>

      <div>
        <h1 className="m-0 font-heading text-[34px] font-extrabold leading-[1.08] text-[#300000] sm:text-[40px]">
          Registrar partido
        </h1>
        <p className="mt-[12px] text-[17px] leading-[1.45] text-[#5e5e5e] sm:text-[19px]">
          SeleccionÃ¡ un torneo, dos equipos registrados y un planillero activo.
        </p>
      </div>

      <div className="grid gap-[24px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[10px] bg-white p-[20px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-[32px]">
          <div className="grid gap-[24px] md:grid-cols-2">
            <Field label="Torneo" wide>
              <select className={inputClass} value={tournamentId} onChange={(event) => setTournamentId(event.target.value)}>
                {tournaments.length === 0 ? <option value="">No hay torneos activos</option> : null}
                {tournaments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.season ? ` Â· ${item.season}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha">
              <input className={inputClass} type="date" value={dateIso} onChange={(event) => setDateIso(event.target.value)} />
            </Field>
            <Field label="Hora">
              <input className={inputClass} type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </Field>
            <Field label="Sede">
              <input className={inputClass} value={venue} onChange={(event) => setVenue(event.target.value)} />
            </Field>
            <Field label="Cancha">
              <input className={inputClass} value={pitch} onChange={(event) => setPitch(event.target.value)} />
            </Field>
            <Field label="Equipo local">
              <select className={inputClass} value={homeTeamId} onChange={(event) => setHomeTeamId(event.target.value)}>
                {teams.length === 0 ? <option value="">No hay equipos activos</option> : null}
                {teams.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.shortName})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Equipo visitante">
              <select className={inputClass} value={awayTeamId} onChange={(event) => setAwayTeamId(event.target.value)}>
                {teams.length === 0 ? <option value="">No hay equipos activos</option> : null}
                {teams.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.shortName})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <aside className="space-y-[24px]">
          <section className="rounded-[10px] bg-white p-[20px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-[28px]">
            <Field label="Planillero asignado">
              <select
                className={inputClass}
                disabled={loadingOptions || planilleros.length === 0}
                value={assignedPlanilleroId}
                onChange={(event) => setAssignedPlanilleroId(event.target.value)}
              >
                {planilleros.length === 0 ? (
                  <option value="">{loadingOptions ? "Cargando..." : "No hay planilleros activos"}</option>
                ) : null}
                {planilleros.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (@{item.username})
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-[16px] text-[15px] leading-[1.5] text-[#5e5e5e]">
              {selectedPlanillero
                ? `El partido aparecerÃ¡ en la jornada de ${selectedPlanillero.name}.`
                : "Para crear un partido debe existir al menos un planillero activo."}
            </p>
          </section>

          <section className="rounded-[10px] border border-[#ead5d2] bg-[#fff8f7] p-[20px] sm:p-[28px]">
            <h2 className="m-0 text-[18px] font-semibold text-[#241917]">CatÃ¡logos requeridos</h2>
            <p className="mt-[12px] text-[15px] leading-[1.5] text-[#5e5e5e]">
              Debe existir al menos un torneo activo y dos equipos activos antes de registrar el partido.
            </p>
          </section>
        </aside>
      </div>

      <div className="flex flex-col gap-[12px] border-t border-[#e5d6d3] pt-[24px] sm:flex-row sm:items-center sm:justify-end sm:gap-[16px]">
        <button
          type="button"
          onClick={() => navigate("/partidos")}
          className="h-[52px] rounded-[8px] px-[24px] text-[16px] font-semibold text-[#5e5e5e] hover:bg-[#f3deda]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || loadingOptions || planilleros.length === 0 || tournaments.length === 0 || teams.length < 2}
          className="flex h-[52px] items-center justify-center gap-[12px] rounded-[8px] bg-[linear-gradient(135deg,#852318_0%,#300000_100%)] px-[24px] text-[16px] font-semibold text-white shadow-[0_18px_32px_rgba(48,0,0,0.2)] disabled:opacity-50"
        >
          <CalendarPlus className="h-[19px] w-[19px]" />
          {submitting ? "Guardando..." : "Registrar partido"}
        </button>
      </div>
    </form>
  );
}
