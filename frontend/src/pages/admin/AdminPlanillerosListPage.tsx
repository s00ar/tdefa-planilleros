import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { formatDateEs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { planillerosService } from "@/services/planilleros.service";
import type { Planillero, PlanilleroStatus } from "@/types/planillero";

const PAGE_SIZE = 8;

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#ead5d2] bg-[#ffffff] p-[24px] shadow-[0_8px_24px_rgba(36,25,23,0.05)]">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">{label}</p>
      <p className="mt-[10px] text-[36px] font-black leading-none text-[#300000]">{value}</p>
      <p className="mt-[12px] text-[15px] text-[#5e5e5e]">{detail}</p>
    </div>
  );
}

function StatusPill({ status }: { status: PlanilleroStatus }) {
  const active = status === "activo";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-[12px] py-[7px] text-[13px] font-semibold",
        active ? "bg-[#570000]/10 text-[#570000]" : "bg-[#e9eaeb] text-[#5e5e5e]"
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

function ActionButton({
  label,
  onClick,
  tone = "default",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid h-[38px] w-[38px] place-items-center rounded-[8px] transition",
        tone === "danger" ? "text-[#ba1a1a] hover:bg-[#fff0ee]" : "text-[#5e5e5e] hover:bg-[#e9eaeb]"
      )}
    >
      {children}
    </button>
  );
}

export function AdminPlanillerosListPage() {
  const navigate = useNavigate();
  const outlet = useOutletContext<{ adminQuery?: string; setAdminQuery?: (value: string) => void } | undefined>();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Planillero[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanilleroStatus | "all">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await planillerosService.list();
        if (!mounted) return;
        setItems(data);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los planilleros.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activeQuery = query || outlet?.adminQuery || "";

  const filteredItems = useMemo(() => {
    const normalized = activeQuery.trim().toLowerCase();
    return items.filter((item) => {
      const queryOk = normalized
        ? `${item.name} ${item.username} ${item.email ?? ""} ${item.dni ?? ""}`.toLowerCase().includes(normalized)
        : true;
      const statusOk = statusFilter === "all" ? true : item.status === statusFilter;
      return queryOk && statusOk;
    });
  }, [activeQuery, items, statusFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((item) => item.status === "activo").length;
    const inactive = total - active;
    const assigned = items.reduce((sum, item) => sum + item.assignedMatchesCount, 0);
    const completed = items.reduce((sum, item) => sum + item.completedMatchesCount, 0);

    return { total, active, inactive, assigned, completed };
  }, [items]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const pageItems = filteredItems.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const footerStart = filteredItems.length === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  const footerEnd = Math.min(activePage * PAGE_SIZE, filteredItems.length);

  const exportRows = () => {
    const header = ["id", "nombre", "usuario", "email", "telefono", "dni", "estado"];
    const body = filteredItems.map((item) => [
      item.id,
      item.name,
      item.username,
      item.email ?? "",
      item.phone ?? "",
      item.dni ?? "",
      item.status,
    ]);
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "planilleros.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("ExportaciÃ³n generada", {
      description: `Se descargaron ${filteredItems.length} registros.`,
    });
  };

  const updateStatus = async (item: Planillero, status: PlanilleroStatus) => {
    const updated = await planillerosService.update(item.id, { status });
    setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    toast.success(status === "activo" ? "Planillero reactivado" : "Planillero desactivado", {
      description: updated.name,
    });
  };

  const removeItem = async (item: Planillero) => {
    await planillerosService.remove(item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    toast.success("Planillero eliminado", { description: item.name });
  };

  return (
    <div className="space-y-[32px]">
      <div className="flex flex-wrap items-end justify-between gap-[24px]">
        <div className="max-w-[780px]">
          <nav className="mb-[16px] flex items-center gap-[12px] text-[14px] font-medium text-[#5e5e5e]">
            <span>AdministraciÃ³n</span>
            <ChevronRight className="h-[16px] w-[16px]" />
            <span className="font-bold text-[#570000]">Planilleros</span>
          </nav>
          <h1 className="m-0 font-heading text-[36px] font-extrabold leading-[1.05] text-[#300000] sm:text-[44px] lg:text-[52px]">
            GestiÃ³n de planilleros
          </h1>
          <p className="mt-[12px] text-[17px] leading-[1.45] text-[#5e5e5e] sm:text-[20px]">
            Altas, bajas y ediciÃ³n de planilleros conectados a la base de datos del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/planilleros/nuevo")}
          className="flex h-[54px] w-full items-center justify-center gap-[12px] rounded-[8px] bg-[linear-gradient(135deg,#570000_0%,#300000_100%)] px-[26px] text-[16px] font-semibold text-[#ffffff] shadow-[0_18px_30px_rgba(87,0,0,0.18)] transition hover:opacity-90 sm:w-auto sm:text-[18px]"
        >
          <UserPlus className="h-[22px] w-[22px]" />
          Crear planillero
        </button>
      </div>

      <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Planilleros totales" value={String(stats.total)} detail="Registros disponibles en la base actual." />
        <StatCard label="Activos" value={String(stats.active)} detail="Con acceso habilitado a la plataforma." />
        <StatCard label="Inactivos" value={String(stats.inactive)} detail="Usuarios dados de baja o pausados." />
        <StatCard
          label="Planillas cerradas"
          value={String(stats.completed)}
          detail={`${stats.assigned} partidos asignados en total.`}
        />
      </div>

      <section className="overflow-hidden rounded-[12px] border border-[#ead5d2] bg-[#ffffff] shadow-[0_10px_30px_rgba(36,25,23,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-[16px] border-b border-[#f0e1de] bg-[#fff8f7] p-[24px]">
          <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
            <Search className="pointer-events-none absolute left-[16px] top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#5e5e5e]" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                outlet?.setAdminQuery?.(event.target.value);
              }}
              placeholder="Buscar por nombre, usuario, email o DNI..."
              type="text"
              className="h-[48px] w-full rounded-[8px] border border-[#ead5d2] bg-[#ffffff] py-0 pl-[48px] pr-[16px] text-[16px] text-[#57423e] outline-none placeholder:text-[#8b716d] focus:ring-2 focus:ring-[#570000]/15"
            />
          </div>

          <div className="relative flex w-full flex-col gap-[12px] sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setFilterOpen((current) => !current)}
              className="flex h-[46px] w-full items-center justify-center gap-[10px] rounded-[8px] border border-[#ead5d2] bg-[#ffffff] px-[18px] text-[14px] font-medium text-[#5e5e5e] sm:w-auto"
            >
              <Filter className="h-[18px] w-[18px]" />
              {statusFilter === "all" ? "Todos los estados" : statusFilter === "activo" ? "Activos" : "Inactivos"}
            </button>
            {filterOpen ? (
              <div className="absolute left-0 top-[54px] z-30 w-full rounded-[8px] border border-[#ead5d2] bg-[#ffffff] p-[8px] shadow-[0_18px_34px_rgba(36,25,23,0.14)] sm:left-auto sm:right-[124px] sm:w-[220px]">
                {(["all", "activo", "inactivo"] as const).map((value) => {
                  const label = value === "all" ? "Todos" : value === "activo" ? "Activos" : "Inactivos";
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value);
                        setPage(1);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "flex h-[40px] w-full items-center rounded-[6px] px-[12px] text-left text-[14px] font-semibold",
                        statusFilter === value ? "bg-[#570000] text-[#ffffff]" : "text-[#241917] hover:bg-[#fff0ee]"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <button
              type="button"
              onClick={exportRows}
              className="flex h-[46px] w-full items-center justify-center gap-[10px] rounded-[8px] border border-[#ead5d2] bg-[#ffffff] px-[18px] text-[14px] font-medium text-[#5e5e5e] sm:w-auto"
            >
              <Download className="h-[18px] w-[18px]" />
              Exportar
            </button>
          </div>
        </div>

        {error ? (
          <div className="border-b border-[#f0e1de] bg-[#fff0ee] px-[24px] py-[18px] text-[15px] text-[#852318]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 p-4 lg:hidden">
          {loading
            ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div key={index} className="h-[180px] animate-pulse rounded-[12px] bg-[#f4e3e0]" />
              ))
            : pageItems.length === 0
              ? (
                <div className="rounded-[12px] border border-dashed border-[#ead5d2] px-[20px] py-[36px] text-center text-[15px] text-[#5e5e5e]">
                  No hay planilleros para los filtros actuales.
                </div>
              )
              : pageItems.map((item) => (
                  <PlanilleroMobileCard
                    key={item.id}
                    item={item}
                    onEdit={() => navigate(`/admin/planilleros/${item.id}/editar`)}
                    onRemove={() => void removeItem(item)}
                    onActivate={() => void updateStatus(item, "activo")}
                    onDeactivate={() => void updateStatus(item, "inactivo")}
                  />
                ))}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1040px] border-collapse">
            <thead>
              <tr className="border-b border-[#f0e1de] text-left">
                <th className="px-[24px] py-[18px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Planillero
                </th>
                <th className="px-[18px] py-[18px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Usuario
                </th>
                <th className="px-[18px] py-[18px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Contacto
                </th>
                <th className="px-[18px] py-[18px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Estado
                </th>
                <th className="px-[18px] py-[18px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Partidos
                </th>
                <th className="px-[18px] py-[18px] text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Alta
                </th>
                <th className="px-[18px] py-[18px] text-right text-[13px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <tr key={index} className="border-b border-[#f6e9e7]">
                    <td className="px-[24px] py-[20px]" colSpan={7}>
                      <div className="h-[52px] animate-pulse rounded-[8px] bg-[#f4e3e0]" />
                    </td>
                  </tr>
                ))
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-[24px] py-[48px] text-center text-[15px] text-[#5e5e5e]">
                    No hay planilleros para los filtros actuales.
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#f6e9e7] transition hover:bg-[#fff8f7]">
                    <td className="px-[24px] py-[20px]">
                      <div className="flex items-center gap-[14px]">
                        <div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-[#570000]/10 text-[#570000]">
                          <Users className="h-[20px] w-[20px]" />
                        </div>
                        <div>
                          <p className="text-[18px] font-semibold text-[#300000]">{item.name}</p>
                          <p className="mt-[4px] text-[14px] text-[#5e5e5e]">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-[18px] py-[20px] text-[15px] text-[#241917]">@{item.username}</td>
                    <td className="px-[18px] py-[20px]">
                      <div className="text-[15px] text-[#241917]">{item.email ?? "-"}</div>
                      <div className="mt-[4px] text-[14px] text-[#8b716d]">{item.phone ?? item.dni ?? "Sin dato adicional"}</div>
                    </td>
                    <td className="px-[18px] py-[20px]">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-[18px] py-[20px] text-[15px] text-[#241917]">
                      {item.completedMatchesCount} cerrados / {item.assignedMatchesCount} asignados
                    </td>
                    <td className="px-[18px] py-[20px] text-[15px] text-[#241917]">{formatDateEs(item.createdAtIso)}</td>
                    <td className="px-[18px] py-[20px]">
                      <div className="flex items-center justify-end gap-[10px]">
                        <ActionButton label="Editar planillero" onClick={() => navigate(`/admin/planilleros/${item.id}/editar`)}>
                          <Edit3 className="h-[18px] w-[18px]" />
                        </ActionButton>
                        {item.status === "activo" ? (
                          <ActionButton label="Desactivar planillero" onClick={() => void updateStatus(item, "inactivo")}>
                            <UserX className="h-[18px] w-[18px]" />
                          </ActionButton>
                        ) : (
                          <ActionButton label="Reactivar planillero" onClick={() => void updateStatus(item, "activo")}>
                            <UserCheck className="h-[18px] w-[18px]" />
                          </ActionButton>
                        )}
                        <ActionButton label="Eliminar planillero" tone="danger" onClick={() => void removeItem(item)}>
                          <Trash2 className="h-[18px] w-[18px]" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[16px] border-t border-[#f0e1de] bg-[#fff8f7] p-[24px]">
          <span className="text-[14px] text-[#5e5e5e]">
            Mostrando {footerStart}-{footerEnd} de {filteredItems.length} planilleros
          </span>
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="grid h-[42px] w-[42px] place-items-center rounded-[8px] border border-[#ead5d2] text-[#5e5e5e] transition hover:bg-[#ffffff]"
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <span className="text-[14px] font-semibold text-[#241917]">
              PÃ¡gina {activePage} de {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="grid h-[42px] w-[42px] place-items-center rounded-[8px] border border-[#ead5d2] text-[#5e5e5e] transition hover:bg-[#ffffff]"
            >
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlanilleroMobileCard({
  item,
  onEdit,
  onRemove,
  onActivate,
  onDeactivate,
}: {
  item: Planillero;
  onEdit: () => void;
  onRemove: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <article className="rounded-[12px] border border-[#f0e1de] bg-[#ffffff] p-[18px] shadow-[0_8px_24px_rgba(36,25,23,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[18px] font-semibold text-[#300000]">{item.name}</p>
          <p className="mt-1 text-[13px] text-[#5e5e5e]">@{item.username}</p>
          <p className="mt-1 text-[12px] text-[#8b716d]">{item.id}</p>
        </div>
        <StatusPill status={item.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-[14px] text-[#241917] sm:grid-cols-2">
        <MetaRow label="Contacto" value={item.email ?? item.phone ?? item.dni ?? "-"} />
        <MetaRow
          label="Partidos"
          value={`${item.completedMatchesCount} cerrados / ${item.assignedMatchesCount} asignados`}
        />
        <MetaRow label="Alta" value={formatDateEs(item.createdAtIso)} />
        <MetaRow label="Extra" value={item.phone ?? item.dni ?? "Sin dato adicional"} />
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#f6e9e7] pt-4">
        <ActionButton label="Editar planillero" onClick={onEdit}>
          <Edit3 className="h-[18px] w-[18px]" />
        </ActionButton>
        {item.status === "activo" ? (
          <ActionButton label="Desactivar planillero" onClick={onDeactivate}>
            <UserX className="h-[18px] w-[18px]" />
          </ActionButton>
        ) : (
          <ActionButton label="Reactivar planillero" onClick={onActivate}>
            <UserCheck className="h-[18px] w-[18px]" />
          </ActionButton>
        )}
        <ActionButton label="Eliminar planillero" tone="danger" onClick={onRemove}>
          <Trash2 className="h-[18px] w-[18px]" />
        </ActionButton>
      </div>
    </article>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b716d]">{label}</dt>
      <dd className="mt-1 text-[14px] text-[#241917]">{value}</dd>
    </div>
  );
}
