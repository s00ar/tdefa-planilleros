import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Edit3,
  Filter,
  LockKeyhole,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { mockMatches } from "@/mocks/matches";
import { planillerosService } from "@/services/planilleros.service";
import type { Planillero } from "@/types/planillero";

const PAGE_SIZE = 3;

type RowStatus = "terminado" | "activo" | "inactivo";

type AdminRow = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  status: RowStatus;
  result?: string;
  planilleroId?: string;
  faded?: boolean;
  avatar: "ball" | "woman" | "man";
};

const statusMeta: Record<RowStatus, { label: string; className: string; dotClassName: string }> = {
  terminado: {
    label: "Terminado",
    className: "bg-[#e1dfdf] text-[#5e5e5e]",
    dotClassName: "bg-[#5e5e5e]",
  },
  activo: {
    label: "Activo",
    className: "bg-[#570000]/10 text-[#570000]",
    dotClassName: "bg-[#570000]",
  },
  inactivo: {
    label: "Inactivo",
    className: "bg-[#e1dfdf] text-[#5e5e5e]",
    dotClassName: "bg-[#5e5e5e]",
  },
};

const overrides: Record<string, { title: string; subtitle: string; code: string; status?: RowStatus }> = {
  u_plan_1: {
    title: "Mariela Ortiz",
    subtitle: "m.ortiz@tdefa.com",
    code: "#PLA-00912",
  },
  u_plan_2: {
    title: "Carlos Ruiz",
    subtitle: "c.ruiz@tdefa.com",
    code: "#PLA-00741",
    status: "inactivo",
  },
};

const extraRows = [
  ["Lucía Ferrero", "l.ferrero@tdefa.com", "activo"],
  ["Nicolás Suárez", "n.suarez@tdefa.com", "activo"],
  ["Daniela Ponce", "d.ponce@tdefa.com", "activo"],
  ["Bruno Acosta", "b.acosta@tdefa.com", "inactivo"],
  ["Tamara Vega", "t.vega@tdefa.com", "activo"],
  ["Julián Soria", "j.soria@tdefa.com", "activo"],
  ["Rocío Lamas", "r.lamas@tdefa.com", "activo"],
  ["Facundo Arias", "f.arias@tdefa.com", "inactivo"],
  ["Camila Núñez", "c.nunez@tdefa.com", "activo"],
  ["Matías Colman", "m.colman@tdefa.com", "activo"],
  ["Noelia Paz", "n.paz@tdefa.com", "activo"],
  ["Hernán Cejas", "h.cejas@tdefa.com", "inactivo"],
  ["Micaela Ruiz", "m.ruiz@tdefa.com", "activo"],
  ["Iván Coronel", "i.coronel@tdefa.com", "activo"],
  ["Sofía Lagos", "s.lagos@tdefa.com", "activo"],
  ["Tomás Vera", "t.vera@tdefa.com", "activo"],
  ["Belén Ibáñez", "b.ibanez@tdefa.com", "activo"],
  ["Kevin Peralta", "k.peralta@tdefa.com", "inactivo"],
  ["Milagros Salas", "m.salas@tdefa.com", "activo"],
  ["Thiago Duarte", "t.duarte@tdefa.com", "activo"],
  ["Valentina Jara", "v.jara@tdefa.com", "activo"],
] as const;

function StatCard({
  label,
  value,
  detail,
  wide = false,
}: {
  label: string;
  value?: string;
  detail?: string;
  wide?: boolean;
}) {
  return (
    <div
      data-admin-stat
      className={cn(
        "relative min-h-[150px] overflow-hidden rounded-[8px] border border-[#dec0bb]/15 bg-[#ffffff] p-[30px]",
        wide && "[grid-column:span_2/span_2]"
      )}
    >
      <p className="mb-[12px] text-[12px] font-medium uppercase leading-tight tracking-[0] text-[#5e5e5e]">
        {label}
      </p>
      {value ? (
        <div className="flex items-baseline gap-[12px]">
          <span className="font-heading text-[56px] font-extrabold leading-none tracking-[0] text-[#300000]">
            {value}
          </span>
          {detail ? <span className="text-[14px] font-bold text-[#e46857]">{detail}</span> : null}
        </div>
      ) : (
        <>
          <p className="max-w-[590px] pr-[84px] text-[16px] leading-[24px] text-[#57423e]">{detail}</p>
          <ShieldCheck className="absolute bottom-[-8px] right-[-4px] h-[96px] w-[96px] text-[#e9eaeb]/70" />
        </>
      )}
    </div>
  );
}

function Avatar({ type, faded }: { type: AdminRow["avatar"]; faded?: boolean }) {
  if (type === "ball") {
    return (
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[8px] bg-[#570000]/10 text-[#570000]">
        <img src={logo} alt="" className="h-[36px] w-[36px] object-contain" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[8px] border border-[#dec0bb]/35",
        type === "woman"
          ? "bg-[radial-gradient(circle_at_50%_18%,#ffe8d7_0_16%,transparent_17%),linear-gradient(135deg,#78342f_0%,#231716_100%)]"
          : "bg-[radial-gradient(circle_at_50%_18%,#d9d9d9_0_16%,transparent_17%),linear-gradient(135deg,#777_0%,#242424_100%)]",
        faded && "grayscale opacity-70"
      )}
    >
      <div className="mt-[22px] h-[38px] bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.08))]" />
    </div>
  );
}

function StatusPill({ status }: { status: RowStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-[8px] rounded-full px-[14px] py-[7px] text-[14px] font-medium leading-none",
        meta.className
      )}
    >
      <span className={cn("h-[8px] w-[8px] rounded-full", meta.dotClassName)} />
      {meta.label}
    </span>
  );
}

function IconButton({
  label,
  tone = "default",
  onClick,
  children,
}: {
  label: string;
  tone?: "default" | "primary" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid h-[40px] w-[40px] appearance-none place-items-center rounded-[4px] border-0 bg-transparent p-[0] transition active:scale-90",
        tone === "default" && "text-[#5e5e5e] hover:bg-[#e9eaeb]",
        tone === "primary" && "text-[#570000] hover:bg-[#e9eaeb]",
        tone === "danger" && "text-[#ba1a1a] hover:bg-[#ffdad6]/30"
      )}
    >
      {children}
    </button>
  );
}

export function AdminPlanillerosListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Planillero[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RowStatus | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await planillerosService.list();
      if (!mounted) return;
      setItems(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo<AdminRow[]>(() => {
    const match = mockMatches.find((item) => item.status === "terminado") ?? mockMatches[0];
    const matchRow: AdminRow = {
      id: "match-row",
      title: "Pilar Senior A vs Tigre FC",
      subtitle: "Torneo Clausura - Fecha 12",
      code: "#PAR-00824",
      status: "terminado",
      result: `${match.score.home} - ${match.score.away}`,
      avatar: "ball",
    };

    const planilleroRows = items.map((item, index) => {
      const override = overrides[item.id];
      const status = override?.status ?? item.status;
      return {
        id: item.id,
        title: override?.title ?? item.name,
        subtitle: override?.subtitle ?? item.email ?? `@${item.username}`,
        code: override?.code ?? `#PLA-${String(912 + index).padStart(5, "0")}`,
        status,
        planilleroId: item.id,
        faded: status === "inactivo",
        avatar: status === "inactivo" ? "man" : "woman",
      } satisfies AdminRow;
    });

    const extraCount = Math.max(0, 23 - planilleroRows.length);
    const visualRows = extraRows.slice(0, extraCount).map(([name, email, status], index) => ({
      id: `extra-${index}`,
      title: name,
      subtitle: email,
      code: `#PLA-${String(1020 + index).padStart(5, "0")}`,
      status: status as RowStatus,
      faded: status === "inactivo",
      avatar: status === "inactivo" ? "man" : "woman",
    })) satisfies AdminRow[];

    return [matchRow, ...planilleroRows, ...visualRows];
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const queryOk = normalized
        ? `${row.title} ${row.subtitle} ${row.code}`.toLowerCase().includes(normalized)
        : true;
      const statusOk = statusFilter === "all" ? true : row.status === statusFilter;
      return queryOk && statusOk;
    });
  }, [query, rows, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const pageRows = filteredRows.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const footerStart = filteredRows.length === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  const footerEnd = Math.min(activePage * PAGE_SIZE, filteredRows.length);
  const pageButtons = Array.from({ length: Math.min(3, pageCount) }, (_, index) => index + 1);

  return (
    <div>
      <div className="mb-[48px] flex items-end justify-between gap-[32px]">
        <div>
          <nav className="mb-[16px] flex items-center gap-[12px] text-[14px] font-medium text-[#5e5e5e]">
            <span>Configuración</span>
            <ChevronRight className="h-[16px] w-[16px]" />
            <span className="font-bold text-[#570000]">Personal Administrativo</span>
          </nav>
          <h1 className="m-[0] font-heading text-[56px] font-extrabold leading-[1.08] tracking-[0] text-[#300000]">
            Gestión de Planilleros
          </h1>
          <p className="mt-[10px] max-w-[800px] text-[20px] leading-[30px] text-[#5e5e5e]">
            Administre los accesos y credenciales del equipo técnico responsable del registro de
            partidos en tiempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/planilleros/nuevo")}
          className="flex h-[61px] shrink-0 appearance-none items-center gap-[14px] rounded-[6px] border-0 bg-[linear-gradient(135deg,#570000_0%,#300000_100%)] px-[32px] text-[22px] font-semibold text-[#ffffff] shadow-[0_24px_38px_rgba(87,0,0,0.2)] transition hover:opacity-90"
        >
          <UserPlus className="h-[26px] w-[26px]" />
          Crear planillero
        </button>
      </div>

      <div className="mb-[48px] grid grid-cols-[1fr_1fr_1fr_1fr] gap-[20px]">
        <StatCard label="Total activos" value="24" detail="+2 esta semana" />
        <StatCard label="Partidos registrados" value="1,482" />
        <StatCard
          label="Sistema de seguridad"
          detail="Última auditoría realizada hace 4 horas. Todos los tokens de acceso están validados y encriptados."
          wide
        />
      </div>

      <section className="overflow-hidden rounded-[8px] bg-[#fff0ee] shadow-[0_1px_6px_rgba(36,25,23,0.08)]">
        <div className="flex items-center justify-between gap-[24px] bg-[#e9eaeb] p-[30px]">
          <div className="relative w-[480px]">
            <Search className="absolute left-[16px] top-1/2 h-[26px] w-[26px] -translate-y-1/2 text-[#5e5e5e]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, email o ID..."
              type="text"
              className="h-[52px] w-full border-0 bg-[#e2e3e4] py-[0] pl-[54px] pr-[16px] text-[16px] text-[#57423e] outline-none ring-0 placeholder:text-[#636262] focus:ring-2 focus:ring-[#570000]/20"
            />
          </div>

          <div className="flex items-center gap-[16px]">
            <button
              type="button"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "all"
                    ? "activo"
                    : current === "activo"
                      ? "inactivo"
                      : current === "inactivo"
                        ? "terminado"
                        : "all"
                )
              }
              className="flex h-[46px] appearance-none items-center gap-[10px] border border-[#dec0bb]/15 bg-[#ffffff] px-[24px] text-[14px] font-medium text-[#5e5e5e]"
            >
              <Filter className="h-[18px] w-[18px]" />
              Filtrar
            </button>
            <button
              type="button"
              onClick={() =>
                toast.success("Exportación simulada", {
                  description: `Se prepararon ${filteredRows.length} registros.`,
                })
              }
              className="flex h-[46px] appearance-none items-center gap-[10px] border border-[#dec0bb]/15 bg-[#ffffff] px-[24px] text-[14px] font-medium text-[#5e5e5e]"
            >
              <Download className="h-[18px] w-[18px]" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse">
            <thead>
              <tr className="border-b border-[#dec0bb]/10 bg-[#fff0ee] text-left">
                <th className="px-[40px] py-[28px] text-[14px] font-medium uppercase tracking-[0] text-[#5e5e5e]">
                  Partido
                </th>
                <th className="px-[32px] py-[28px] text-[14px] font-medium uppercase tracking-[0] text-[#5e5e5e]">
                  ID Partido
                </th>
                <th className="px-[32px] py-[28px] text-[14px] font-medium uppercase tracking-[0] text-[#5e5e5e]">
                  Estado / Resultado
                </th>
                <th className="px-[32px] py-[28px] text-right text-[14px] font-medium uppercase tracking-[0] text-[#5e5e5e]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#ffffff]">
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <tr key={index} className="h-[120px] border-b border-[#f3deda]/35">
                    <td className="px-[40px] py-[24px]">
                      <div className="flex items-center gap-[20px]">
                        <div className="h-[60px] w-[60px] rounded-[8px] bg-[#f3deda]" />
                        <div>
                          <div className="h-[20px] w-[220px] rounded-[4px] bg-[#e9eaeb]" />
                          <div className="mt-[8px] h-[16px] w-[160px] rounded-[4px] bg-[#e9eaeb]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-[32px] py-[24px]">
                      <div className="h-[28px] w-[112px] rounded-[4px] bg-[#fff0ee]" />
                    </td>
                    <td className="px-[32px] py-[24px]">
                      <div className="h-[28px] w-[112px] rounded-full bg-[#e1dfdf]" />
                    </td>
                    <td className="px-[32px] py-[24px]" />
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-[40px] py-[48px] text-center text-[14px] text-[#5e5e5e]">
                    Sin resultados para la búsqueda actual.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group h-[120px] border-b border-[#f3deda]/35 transition-colors hover:bg-[#fff0ee]"
                  >
                    <td className={cn("px-[40px] py-[24px]", row.faded && "opacity-70")}>
                      <div className="flex items-center gap-[20px]">
                        <Avatar type={row.avatar} faded={row.faded} />
                        <div>
                          <p className="text-[22px] font-semibold leading-tight text-[#300000]">
                            {row.title}
                          </p>
                          <p className="mt-[6px] text-[16px] leading-tight text-[#5e5e5e]">
                            {row.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={cn("px-[32px] py-[24px]", row.faded && "opacity-70")}>
                      <code className="bg-[#ffe9e6] px-[10px] py-[5px] font-mono text-[14px] text-[#570000]">
                        {row.code}
                      </code>
                    </td>
                    <td className="px-[32px] py-[24px]">
                      <div className="flex flex-col gap-[10px]">
                        <StatusPill status={row.status} />
                        {row.result ? (
                          <p className="ml-[6px] text-[22px] font-bold leading-none text-[#300000]">
                            {row.result}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-[32px] py-[24px] text-right">
                      <div className="flex items-center justify-end gap-[12px] opacity-60 transition-opacity group-hover:opacity-100">
                        {row.status === "terminado" ? (
                          <>
                            <IconButton
                              label="Sincronizar"
                              onClick={() =>
                                toast.success("Sincronización simulada", {
                                  description: row.title,
                                })
                              }
                            >
                              <RotateCcw className="h-[24px] w-[24px]" />
                            </IconButton>
                            <IconButton
                              label="Auditar"
                              onClick={() =>
                                toast.success("Auditoría simulada", {
                                  description: row.code,
                                })
                              }
                            >
                              <ClipboardCheck className="h-[24px] w-[24px]" />
                            </IconButton>
                          </>
                        ) : row.status === "activo" ? (
                          <>
                            <IconButton
                              label="Editar perfil"
                              onClick={() =>
                                row.planilleroId
                                  ? navigate(`/admin/planilleros/${row.planilleroId}/editar`)
                                  : toast.success("Edición simulada")
                              }
                            >
                              <Edit3 className="h-[24px] w-[24px]" />
                            </IconButton>
                            <IconButton
                              label="Reiniciar contraseña"
                              onClick={() =>
                                toast.success("Reinicio simulado", {
                                  description: row.title,
                                })
                              }
                            >
                              <LockKeyhole className="h-[24px] w-[24px]" />
                            </IconButton>
                            <IconButton
                              label="Desactivar usuario"
                              tone="danger"
                              onClick={async () => {
                                if (!row.planilleroId) return;
                                const updated = await planillerosService.update(row.planilleroId, {
                                  status: "inactivo",
                                });
                                setItems((current) =>
                                  current.map((item) => (item.id === updated.id ? updated : item))
                                );
                                toast.success("Usuario desactivado", { description: row.title });
                              }}
                            >
                              <UserX className="h-[24px] w-[24px]" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              label="Reactivar usuario"
                              tone="primary"
                              onClick={async () => {
                                if (!row.planilleroId) return;
                                const updated = await planillerosService.update(row.planilleroId, {
                                  status: "activo",
                                });
                                setItems((current) =>
                                  current.map((item) => (item.id === updated.id ? updated : item))
                                );
                                toast.success("Usuario reactivado", { description: row.title });
                              }}
                            >
                              <UserCheck className="h-[24px] w-[24px]" />
                            </IconButton>
                            <IconButton
                              label="Eliminar permanente"
                              tone="danger"
                              onClick={() =>
                                toast.success("Eliminación simulada", {
                                  description: row.title,
                                })
                              }
                            >
                              <Trash2 className="h-[24px] w-[24px]" />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#dec0bb]/10 bg-[#fff0ee] p-[32px]">
          <span className="text-[14px] font-medium text-[#5e5e5e]">
            Mostrando {footerStart}-{footerEnd} de {filteredRows.length} planilleros
          </span>
          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="flex h-[50px] w-[50px] appearance-none items-center justify-center rounded-[4px] border border-[#dec0bb]/20 bg-transparent text-[#5e5e5e] hover:bg-[#e9eaeb]"
            >
              <ChevronLeft className="h-[20px] w-[20px]" />
            </button>
            {pageButtons.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={cn(
                  "flex h-[50px] w-[50px] appearance-none items-center justify-center rounded-[4px] text-[18px] font-bold",
                  pageNumber === activePage
                    ? "bg-[#570000] text-[#ffffff] shadow-[0_10px_18px_rgba(87,0,0,0.18)]"
                    : "bg-transparent text-[#5e5e5e] hover:bg-[#e9eaeb]"
                )}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="flex h-[50px] w-[50px] appearance-none items-center justify-center rounded-[4px] border border-[#dec0bb]/20 bg-transparent text-[#5e5e5e] hover:bg-[#e9eaeb]"
            >
              <ChevronRight className="h-[20px] w-[20px]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
