import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Power } from "lucide-react";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Planillero, PlanilleroStatus } from "@/types/planillero";
import { planillerosService } from "@/services/planilleros.service";
import { useToast } from "@/hooks/useToast";

const statusMeta: Record<PlanilleroStatus, { label: string; className: string }> = {
  activo: { label: "Activo", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactivo: { label: "Inactivo", className: "bg-muted text-foreground border-border" },
};

export function AdminPlanillerosListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Planillero[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PlanilleroStatus | "all">("all");

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

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((p) => p.status === "activo").length;
    const assigned = items.reduce((acc, p) => acc + p.assignedMatchesCount, 0);
    return { total, active, assigned };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const statusOk = status === "all" ? true : p.status === status;
      const queryOk = q
        ? `${p.name} ${p.username} ${p.email ?? ""}`.toLowerCase().includes(q)
        : true;
      return statusOk && queryOk;
    });
  }, [items, query, status]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Gestión de Planilleros"
        subtitle="Administración de usuarios planilleros (datos mockeados)."
        right={
          <Button className="rounded-xl" onClick={() => navigate("/admin/planilleros/nuevo")}>
            <Plus className="mr-2 h-4 w-4" />
            Crear planillero
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="text-xs text-muted-foreground">Planilleros</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{loading ? "—" : stats.total}</div>
          <div className="mt-1 text-xs text-muted-foreground">{stats.active} activos</div>
        </Card>
        <Card className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="text-xs text-muted-foreground">Asignaciones (total)</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{loading ? "—" : stats.assigned}</div>
          <div className="mt-1 text-xs text-muted-foreground">Partidos asignados acumulados</div>
        </Card>
        <Card className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="text-xs text-muted-foreground">Estado</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{loading ? "—" : stats.active}</div>
          <div className="mt-1 text-xs text-muted-foreground">Usuarios habilitados</div>
        </Card>
      </div>

      <Card className="rounded-2xl border bg-card p-4 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-10"
              placeholder="Buscar por nombre, usuario o email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="h-10 rounded-xl"
              onClick={() => setStatus((s) => (s === "all" ? "activo" : s === "activo" ? "inactivo" : "all"))}
            >
              {status === "all" ? "Todos" : status === "activo" ? "Activos" : "Inactivos"}
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Planillero</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Asignados</TableHead>
                <TableHead className="text-right">Finalizados</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Sin resultados
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.username}</TableCell>
                    <TableCell>
                      <Badge className={"rounded-full " + statusMeta[p.status].className}>
                        {statusMeta[p.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{p.assignedMatchesCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.completedMatchesCount}</TableCell>
                    <TableCell className="text-muted-foreground">{p.createdAtIso}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => navigate(`/admin/planilleros/${p.id}/editar`)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 rounded-xl"
                          onClick={async () => {
                            const nextStatus: PlanilleroStatus = p.status === "activo" ? "inactivo" : "activo";
                            const updated = await planillerosService.update(p.id, { status: nextStatus });
                            setItems((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
                            toast.success("Estado actualizado", {
                              description: `${updated.name} ahora está ${updated.status}.`,
                            });
                          }}
                          aria-label="Activar/Desactivar"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

