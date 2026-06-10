import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, User, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { planilleroSchema, type PlanilleroFormValues } from "@/features/planilleros/planilleroForm";
import type { Planillero } from "@/types/planillero";
import { cn } from "@/lib/utils";

export function PlanilleroFormCard({
  mode,
  initial,
  submitting,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Partial<Planillero>;
  submitting?: boolean;
  onSubmit: (values: PlanilleroFormValues) => Promise<void> | void;
}) {
  const form = useForm<PlanilleroFormValues>({
    resolver: zodResolver(planilleroSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      dni: "",
      status: "activo",
    },
  });

  const statusValue = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (!initial) return;
    form.reset({
      name: initial.name ?? "",
      username: initial.username ?? "",
      email: initial.email ?? "",
      phone: initial.phone ?? "",
      dni: initial.dni ?? "",
      status: (initial.status as PlanilleroFormValues["status"]) ?? "activo",
    });
  }, [initial, form]);

  const errors = form.formState.errors;

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">
            {mode === "create" ? "Nuevo Planillero" : "Editar Planillero"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Formulario operativo (mock)</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-xs">
          <BadgeCheck className="h-4 w-4 text-primary" />
          Validación básica
        </div>
      </div>

      <form
        className="mt-5 grid gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium">Nombre y apellido</label>
          <Input className="h-11" placeholder="Ej: Juan Pérez" {...form.register("name")} />
          {errors.name ? <div className="text-xs text-destructive">{errors.name.message}</div> : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Usuario</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-10" placeholder="usuario" {...form.register("username")} />
          </div>
          {errors.username ? (
            <div className="text-xs text-destructive">{errors.username.message}</div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 pl-10" placeholder="mail@dominio.com" {...form.register("email")} />
            </div>
            {errors.email ? <div className="text-xs text-destructive">{errors.email.message}</div> : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Teléfono</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 pl-10" placeholder="+54 11..." {...form.register("phone")} />
            </div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium">DNI</label>
            <Input className="h-11" placeholder="30.000.000" {...form.register("dni")} />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Estado</label>
            <div className="flex h-11 items-center justify-between rounded-xl border bg-background px-4">
              <div className="text-sm text-muted-foreground">Activo</div>
              <Switch
                checked={statusValue === "activo"}
                onCheckedChange={(v) => form.setValue("status", v ? "activo" : "inactivo")}
              />
            </div>
            <div
              className={cn(
                "text-xs",
                statusValue === "activo" ? "text-emerald-700" : "text-muted-foreground"
              )}
            >
              {statusValue === "activo"
                ? "El planillero podrá ingresar y cargar planillas."
                : "El planillero no podrá ingresar."}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" className="h-11 rounded-xl" onClick={() => form.reset()}>
            Restablecer
          </Button>
          <Button type="submit" className="h-11 rounded-xl" disabled={Boolean(submitting)}>
            {submitting ? "Guardando..." : mode === "create" ? "Crear planillero" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
