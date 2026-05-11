import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/common/PageTitle";
import { PlanilleroFormCard } from "@/features/planilleros/PlanilleroFormCard";
import type { PlanilleroFormValues } from "@/features/planilleros/planilleroForm";
import type { Planillero } from "@/types/planillero";
import { planillerosService } from "@/services/planilleros.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { UserCircle2 } from "lucide-react";

export function AdminPlanilleroEditPage() {
  const { planilleroId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<Planillero | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!planilleroId) return;
      setLoading(true);
      try {
        const data = await planillerosService.getById(planilleroId);
        if (!mounted) return;
        setItem(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [planilleroId]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Editar Planillero"
        subtitle="Edición completa según maqueta."
        right={
          <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/admin/planilleros")}>
            Volver al listado
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {loading ? (
          <Card className="rounded-2xl border bg-card p-5 shadow-soft">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
            <Skeleton className="mt-3 h-10 w-full" />
          </Card>
        ) : (
          <PlanilleroFormCard
            mode="edit"
            initial={item ?? undefined}
            submitting={submitting}
            onSubmit={async (values: PlanilleroFormValues) => {
              if (!item) return;
              setSubmitting(true);
              try {
                const updated = await planillerosService.update(item.id, {
                  name: values.name,
                  username: values.username,
                  email: values.email || undefined,
                  phone: values.phone || undefined,
                  dni: values.dni || undefined,
                  status: values.status,
                });
                setItem(updated);
                toast.success("Cambios guardados", { description: updated.name });
              } finally {
                setSubmitting(false);
              }
            }}
          />
        )}

        <div className="space-y-4">
          <Card className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted/30">
                <UserCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{item?.name ?? "—"}</div>
                <div className="truncate text-xs text-muted-foreground">@{item?.username ?? ""}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 px-3 py-3">
                <div className="text-xs text-muted-foreground">Asignados</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{item?.assignedMatchesCount ?? "—"}</div>
              </div>
              <div className="rounded-xl border bg-muted/20 px-3 py-3">
                <div className="text-xs text-muted-foreground">Finalizados</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{item?.completedMatchesCount ?? "—"}</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-background px-3 py-3 text-xs text-muted-foreground">
              Alta: <span className="font-medium text-foreground">{item?.createdAtIso ?? "—"}</span>
            </div>
          </Card>

          <Card className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="text-sm font-semibold">Acciones rápidas</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Desde aquí podés volver al listado o crear un planillero nuevo.
            </div>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/admin/planilleros")}>
                Ir al listado
              </Button>
              <Button className="rounded-xl" onClick={() => navigate("/admin/planilleros/nuevo")}>
                Crear otro planillero
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

