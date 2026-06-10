import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CalendarRange, Edit3, Plus, Search, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { teamsService, tournamentsService } from "@/services/catalog.service";
import { useAuthUser } from "@/store/auth.store";
import { useToast } from "@/hooks/useToast";
import type { CatalogStatus, Team, Tournament } from "@/types/catalog";

type Kind = "tournaments" | "teams";
type CatalogItem = Tournament | Team;

const inputClass =
  "h-12 w-full rounded-lg border border-[#ead5d2] bg-[#fff8f7] px-4 text-base text-[#241917] outline-none focus:border-[#852318] focus:ring-2 focus:ring-[#852318]/10";

export function CatalogManagementPage({ kind }: { kind: Kind }) {
  const user = useAuthUser();
  const toast = useToast();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);

  const title = kind === "tournaments" ? "Torneos" : "Equipos";
  const singular = kind === "tournaments" ? "torneo" : "equipo";
  const service = kind === "tournaments" ? tournamentsService : teamsService;

  useEffect(() => {
    let mounted = true;
    console.info(`[${kind}] list started`);
    void (kind === "tournaments" ? tournamentsService.list() : teamsService.list())
      .then((data) => {
        if (!mounted) return;
        setItems(data);
        console.info(`[${kind}] list completed`, { count: data.length });
      })
      .catch((error) => {
        if (!mounted) return;
        console.error(`[${kind}] list failed`, error);
        toast.error(`No se pudieron cargar los ${title.toLowerCase()}`, {
          description: error instanceof Error ? error.message : "Intentá nuevamente.",
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [kind, title, toast]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => {
      const extra = kind === "tournaments"
        ? (item as Tournament).season
        : `${(item as Team).shortName} ${(item as Team).city ?? ""}`;
      return `${item.name} ${extra ?? ""}`.toLowerCase().includes(normalized);
    });
  }, [items, kind, query]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    console.info(`[${kind}] delete started`, { id: deleteTarget.id });
    try {
      await service.remove(deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      toast.success(`${kind === "tournaments" ? "Torneo" : "Equipo"} eliminado`);
      console.info(`[${kind}] delete completed`, { id: deleteTarget.id });
      setDeleteTarget(null);
    } catch (error) {
      console.error(`[${kind}] delete failed`, error);
      toast.error(`No se pudo eliminar el ${singular}`, {
        description: error instanceof Error ? error.message : "Intentá nuevamente.",
      });
    }
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e46857]">Gestión deportiva</p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-[-0.03em] text-[#300000] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#5e5e5e]">
            {isAdmin
              ? `Creá, modificá y administrá los ${title.toLowerCase()} utilizados al registrar partidos.`
              : `Consultá los ${title.toLowerCase()} disponibles en el sistema.`}
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#852318_0%,#300000_100%)] px-5 font-semibold text-white shadow-[0_14px_28px_rgba(48,0,0,0.18)]"
          >
            <Plus className="h-5 w-5" />
            Crear {singular}
          </button>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#eadfdd] bg-white shadow-[0_12px_34px_rgba(36,25,23,0.06)]">
        <div className="flex flex-col gap-4 border-b border-[#eee4e2] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b716d]" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 w-full rounded-lg border border-[#ead5d2] bg-[#fff8f7] pl-12 pr-4 text-base outline-none focus:border-[#852318]"
              placeholder={`Buscar ${title.toLowerCase()}...`}
            />
          </div>
          <span className="text-sm font-semibold text-[#57423e]">{filtered.length} registrados</span>
        </div>

        {loading ? (
          <div className="grid min-h-60 place-items-center text-[#5e5e5e]">Cargando {title.toLowerCase()}...</div>
        ) : filtered.length === 0 ? (
          <div className="grid min-h-60 place-items-center px-6 text-center text-[#5e5e5e]">
            No hay {title.toLowerCase()} para mostrar.
          </div>
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {filtered.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
                kind={kind}
                editable={Boolean(isAdmin)}
                onEdit={() => openEdit(item)}
                onDelete={() => setDeleteTarget(item)}
              />
            ))}
          </div>
        )}
      </section>

      <CatalogForm
        key={`${kind}-${editing?.id ?? "new"}-${formOpen}`}
        kind={kind}
        item={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={(saved) => {
          setItems((current) => {
            const exists = current.some((item) => item.id === saved.id);
            return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
          });
        }}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar {singular}</DialogTitle>
            <DialogDescription>
              Esta acción elimina “{deleteTarget?.name}”. Si tiene partidos asociados, el sistema impedirá la eliminación.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" className="h-10 rounded-lg bg-[#e9eaeb] px-4 font-semibold" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </button>
            <button type="button" className="h-10 rounded-lg bg-[#9f1d16] px-4 font-semibold text-white" onClick={() => void remove()}>
              Eliminar {singular}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CatalogCard({
  item,
  kind,
  editable,
  onEdit,
  onDelete,
}: {
  item: CatalogItem;
  kind: Kind;
  editable: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tournament = kind === "tournaments" ? (item as Tournament) : null;
  const team = kind === "teams" ? (item as Team) : null;

  return (
    <article className="rounded-xl border border-[#eadfdd] bg-[#fffdfc] p-5 transition-shadow hover:shadow-[0_12px_26px_rgba(36,25,23,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#fff0ee] text-[#852318]">
            {kind === "tournaments" ? <CalendarRange className="h-6 w-6" /> : <UsersRound className="h-6 w-6" />}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-[#300000]">{item.name}</h2>
            <p className="mt-1 text-sm text-[#5e5e5e]">
              {tournament ? tournament.season || "Temporada no informada" : `${team?.shortName}${team?.city ? ` · ${team.city}` : ""}`}
            </p>
          </div>
        </div>
        <span className={item.status === "activo" ? "rounded-full bg-[#e7f5ec] px-3 py-1 text-xs font-bold text-[#176b3a]" : "rounded-full bg-[#eeeeee] px-3 py-1 text-xs font-bold text-[#5e5e5e]"}>
          {item.status}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-[#eee4e2] pt-4">
        <span className="flex items-center gap-2 text-sm text-[#57423e]">
          <ShieldCheck className="h-4 w-4" />
          {item.matchesCount} partidos asociados
        </span>
        {editable ? (
          <div className="flex gap-2">
            <button type="button" aria-label={`Editar ${item.name}`} onClick={onEdit} className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9eaeb] text-[#57423e] hover:bg-[#dddfe1]">
              <Edit3 className="h-4 w-4" />
            </button>
            <button type="button" aria-label={`Eliminar ${item.name}`} onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff0ee] text-[#9f1d16] hover:bg-[#f7d9d5]">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CatalogForm({
  kind,
  item,
  open,
  onOpenChange,
  onSaved,
}: {
  kind: Kind;
  item: CatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (item: CatalogItem) => void;
}) {
  const toast = useToast();
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(item?.name ?? "");
  const [status, setStatus] = useState<CatalogStatus>(item?.status ?? "activo");
  const [season, setSeason] = useState(kind === "tournaments" ? (item as Tournament | null)?.season ?? "" : "");
  const [startDate, setStartDate] = useState(kind === "tournaments" ? (item as Tournament | null)?.startDate ?? "" : "");
  const [endDate, setEndDate] = useState(kind === "tournaments" ? (item as Tournament | null)?.endDate ?? "" : "");
  const [shortName, setShortName] = useState(kind === "teams" ? (item as Team | null)?.shortName ?? "" : "");
  const [city, setCity] = useState(kind === "teams" ? (item as Team | null)?.city ?? "" : "");
  const singular = kind === "tournaments" ? "torneo" : "equipo";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!name.trim() || (kind === "teams" && !shortName.trim())) {
      toast.error("Datos incompletos", { description: "Completá los campos obligatorios." });
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    console.info(`[${kind}] ${item ? "update" : "create"} started`, { id: item?.id });
    try {
      const saved = kind === "tournaments"
        ? await (item
            ? tournamentsService.update(item.id, { name: name.trim(), season: season.trim() || null, status, startDate: startDate || null, endDate: endDate || null })
            : tournamentsService.create({ name: name.trim(), season: season.trim() || null, status, startDate: startDate || null, endDate: endDate || null }))
        : await (item
            ? teamsService.update(item.id, { name: name.trim(), shortName: shortName.trim().toUpperCase(), city: city.trim() || null, status })
            : teamsService.create({ name: name.trim(), shortName: shortName.trim().toUpperCase(), city: city.trim() || null, status }));
      onSaved(saved);
      onOpenChange(false);
      toast.success(`${kind === "tournaments" ? "Torneo" : "Equipo"} ${item ? "actualizado" : "creado"}`);
      console.info(`[${kind}] ${item ? "update" : "create"} completed`, { id: saved.id });
    } catch (error) {
      console.error(`[${kind}] ${item ? "update" : "create"} failed`, error);
      toast.error(`No se pudo guardar el ${singular}`, {
        description: error instanceof Error ? error.message : "Intentá nuevamente.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" showCloseButton={false}>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-[#57423e] transition hover:bg-[#e9eaeb]"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>{item ? "Modificar" : "Crear"} {singular}</DialogTitle>
          <DialogDescription>Los datos se guardan directamente en la base de datos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-[#57423e]">Nombre *</span>
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          {kind === "tournaments" ? (
            <>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-[#57423e]">Temporada</span>
                <input className={inputClass} value={season} onChange={(event) => setSeason(event.target.value)} placeholder="Ej. 2026" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-[#57423e]">Fecha de inicio</span>
                <input type="date" className={inputClass} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-[#57423e]">Fecha de fin</span>
                <input type="date" className={inputClass} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
            </>
          ) : (
            <>
              <label>
                <span className="mb-2 block text-sm font-bold text-[#57423e]">Sigla *</span>
                <input maxLength={16} className={inputClass} value={shortName} onChange={(event) => setShortName(event.target.value.toUpperCase())} placeholder="Ej. RIV" />
              </label>
              <label>
                <span className="mb-2 block text-sm font-bold text-[#57423e]">Ciudad</span>
                <input className={inputClass} value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
            </>
          )}
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-[#57423e]">Estado</span>
            <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as CatalogStatus)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 border-t border-[#eee4e2] pt-4 sm:col-span-2">
            <button type="button" className="h-11 rounded-lg bg-[#e9eaeb] px-5 font-semibold" onClick={() => onOpenChange(false)}>Cancelar</button>
            <button type="submit" disabled={submitting} className="h-11 rounded-lg bg-[#570000] px-5 font-semibold text-white disabled:opacity-50">
              {submitting ? "Guardando..." : `${item ? "Guardar cambios" : "Crear"} ${singular}`}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
