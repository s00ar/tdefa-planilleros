import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/common/PageTitle";
import { PlanilleroFormCard } from "@/features/planilleros/PlanilleroFormCard";
import type { PlanilleroFormValues } from "@/features/planilleros/planilleroForm";
import { planillerosService } from "@/services/planilleros.service";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function AdminPlanilleroCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Crear Planillero"
        subtitle="Alta de nuevo usuario planillero según maqueta."
        right={
          <Button variant="secondary" className="rounded-xl" onClick={() => navigate("/admin/planilleros")}>
            Volver al listado
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <PlanilleroFormCard
          mode="create"
          submitting={submitting}
          onSubmit={async (values: PlanilleroFormValues) => {
            setSubmitting(true);
            try {
              const created = await planillerosService.create({
                name: values.name,
                username: values.username,
                email: values.email || undefined,
                phone: values.phone || undefined,
                dni: values.dni || undefined,
                status: values.status,
                assignedMatchesCount: 0,
                completedMatchesCount: 0,
              });
              toast.success("Planillero creado", { description: created.name });
              navigate(`/admin/planilleros/${created.id}/editar`, { replace: true });
            } finally {
              setSubmitting(false);
            }
          }}
        />

        <div className="space-y-4">
          <Card className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="text-sm font-semibold">Sincronización Externa</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Sección mock (sin backend). Preparada para futura integración.
            </div>

            <div className="mt-4 rounded-2xl border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">ID externo</div>
              <div className="mt-2 rounded-xl border bg-background px-3 py-3 font-mono text-sm text-muted-foreground">
                ID-000-000
              </div>
              <Button variant="secondary" className="mt-3 w-full rounded-xl" disabled>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sincronizar
              </Button>
            </div>
          </Card>

          <Card className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="text-sm font-semibold">Notas</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Este módulo simula el flujo administrativo. Los datos se guardan localmente (localStorage).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

