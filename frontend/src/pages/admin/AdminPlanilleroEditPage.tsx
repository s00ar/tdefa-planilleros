import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Save, Trash2 } from "lucide-react";
import { planillerosService } from "@/services/planilleros.service";
import type { Planillero, PlanilleroStatus } from "@/types/planillero";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

function EditField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="mb-[10px] block text-[13px] font-medium uppercase tracking-[0.04em] text-[#464747] sm:text-[14px]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-[56px] w-full rounded-[8px] border border-[#ead5d2] bg-[#fff8f7] px-[16px] text-[16px] text-[#241917] outline-none focus:ring-2 focus:ring-[#570000]/15";

export function AdminPlanilleroEditPage() {
  const { planilleroId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Planillero | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [status, setStatus] = useState<PlanilleroStatus>("activo");

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!planilleroId) return;
      console.info("[planilleros] load started", { id: planilleroId });
      setLoading(true);
      try {
        const data = await planillerosService.getById(planilleroId);
        if (!mounted) return;
        console.info("[planilleros] load completed", { id: data.id, username: data.username });
        const parts = splitName(data.name);
        setItem(data);
        setFirstName(parts.firstName);
        setLastName(parts.lastName);
        setUsername(data.username);
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setDni(data.dni ?? "");
        setStatus(data.status);
      } catch (loadError) {
        if (!mounted) return;
        console.error("[planilleros] load failed", { id: planilleroId, error: loadError });
        toast.error("No se pudo cargar el planillero", {
          description: loadError instanceof Error ? loadError.message : "IntentÃ¡ nuevamente.",
        });
        navigate("/admin/planilleros", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate, planilleroId, toast]);

  const fullName = useMemo(() => `${firstName.trim()} ${lastName.trim()}`.trim(), [firstName, lastName]);

  const save = async () => {
    if (!item) return;
    if (fullName.length < 3 || username.trim().length < 3) {
      toast.error("Datos incompletos", {
        description: "IngresÃ¡ nombre, apellido y usuario.",
      });
      return;
    }

    setSaving(true);
    console.info("[planilleros] update started", { id: item.id, username: username.trim() });
    try {
      const updated = await planillerosService.update(item.id, {
        name: fullName,
        username: username.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        dni: dni.trim() || undefined,
        status,
      });
      setItem(updated);
      console.info("[planilleros] update completed", { id: updated.id, username: updated.username });
      toast.success("Cambios guardados", { description: updated.name });
    } catch (saveError) {
      console.error("[planilleros] update failed", { id: item.id, error: saveError });
      toast.error("No se pudieron guardar los cambios", {
        description: saveError instanceof Error ? saveError.message : "IntentÃ¡ nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!item) return;
    console.info("[planilleros] delete started", { id: item.id });
    try {
      await planillerosService.remove(item.id);
      console.info("[planilleros] delete completed", { id: item.id });
      toast.success("Planillero eliminado", { description: item.name });
      navigate("/admin/planilleros", { replace: true });
    } catch (removeError) {
      console.error("[planilleros] delete failed", { id: item.id, error: removeError });
      toast.error("No se pudo eliminar el planillero", {
        description: removeError instanceof Error ? removeError.message : "IntentÃ¡ nuevamente.",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[500px] place-items-center text-[18px] text-[#5e5e5e]">
        Cargando planillero...
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-[28px]">
      <div className="flex flex-wrap items-start justify-between gap-[20px]">
        <div>
          <nav className="mb-[14px] flex items-center gap-[10px] text-[14px] font-medium text-[#5e5e5e]">
            <span>Planilleros</span>
            <ChevronRight className="h-[16px] w-[16px]" />
            <span className="font-bold text-[#570000]">EdiciÃ³n</span>
          </nav>
          <h1 className="m-0 font-heading text-[34px] font-extrabold leading-[1.08] text-[#300000] sm:text-[38px]">
            Editar planillero
          </h1>
          <p className="mt-[12px] text-[17px] leading-[1.45] text-[#5e5e5e] sm:text-[18px]">
            ModificÃ¡ los datos persistidos en la base para este registro.
          </p>
        </div>

        <div className="w-full rounded-[10px] bg-[#ffffff] px-[20px] py-[16px] shadow-[0_8px_24px_rgba(36,25,23,0.05)] sm:w-auto">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8b716d]">ID de base</p>
          <p className="mt-[8px] break-all text-[16px] font-semibold text-[#300000]">{item.id}</p>
        </div>
      </div>

      <div className="grid gap-[24px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[10px] bg-[#ffffff] p-[20px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-[32px]">
          <div className="grid gap-[24px] md:grid-cols-2">
            <EditField label="Nombre">
              <input className={inputClass} onChange={(event) => setFirstName(event.target.value)} value={firstName} />
            </EditField>

            <EditField label="Apellido">
              <input className={inputClass} onChange={(event) => setLastName(event.target.value)} value={lastName} />
            </EditField>

            <EditField label="Usuario">
              <input className={inputClass} onChange={(event) => setUsername(event.target.value)} value={username} />
            </EditField>

            <EditField label="Email">
              <input className={inputClass} onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </EditField>

            <EditField label="TelÃ©fono">
              <input className={inputClass} onChange={(event) => setPhone(event.target.value)} value={phone} />
            </EditField>

            <EditField label="DNI">
              <input className={inputClass} onChange={(event) => setDni(event.target.value)} value={dni} />
            </EditField>
          </div>
        </section>

        <aside className="space-y-[24px]">
          <section className="rounded-[10px] bg-[#ffffff] p-[20px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-[28px]">
            <div className="flex items-center justify-between gap-[12px]">
              <div>
                <h2 className="m-0 text-[20px] font-semibold text-[#241917] sm:text-[22px]">Estado</h2>
                <p className="mt-[8px] text-[15px] leading-[1.5] text-[#5e5e5e]">
                  ActivÃ¡ o desactivÃ¡ el acceso del planillero.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatus((current) => (current === "activo" ? "inactivo" : "activo"))}
                className={cn(
                  "relative h-[32px] w-[58px] rounded-full transition",
                  status === "activo" ? "bg-[#570000]" : "bg-[#d7d7d7]"
                )}
                aria-pressed={status === "activo"}
              >
                <span
                  className={cn(
                    "absolute top-[4px] h-[24px] w-[24px] rounded-full bg-[#ffffff] transition",
                    status === "activo" ? "left-[30px]" : "left-[4px]"
                  )}
                />
              </button>
            </div>

            <div className="mt-[20px] rounded-[8px] bg-[#fff0ee] px-[16px] py-[14px] text-[14px] font-semibold text-[#852318]">
              {status === "activo" ? "El planillero tiene acceso habilitado." : "El planillero quedÃ³ deshabilitado."}
            </div>
          </section>

          <section className="rounded-[10px] border border-[#ead5d2] bg-[#fff8f7] p-[20px] sm:p-[28px]">
            <h2 className="m-0 text-[18px] font-semibold text-[#241917]">Resumen</h2>
            <dl className="mt-[18px] space-y-[12px] text-[15px] text-[#5e5e5e]">
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Nombre</dt>
                <dd className="font-medium text-[#241917]">{fullName || "-"}</dd>
              </div>
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Usuario</dt>
                <dd className="font-medium text-[#241917]">{username || "-"}</dd>
              </div>
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Asignados</dt>
                <dd className="font-medium text-[#241917]">{item.assignedMatchesCount}</dd>
              </div>
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Cerrados</dt>
                <dd className="font-medium text-[#241917]">{item.completedMatchesCount}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <div className="flex flex-col gap-[12px] border-t border-[#e5d6d3] pt-[24px] sm:gap-[16px]">
        <button
          className="flex h-[52px] items-center justify-center gap-[10px] rounded-[8px] px-[20px] text-[16px] font-semibold text-[#ba1a1a] transition hover:bg-[#fff0ee] sm:justify-start"
          onClick={() => void remove()}
          type="button"
        >
          <Trash2 className="h-[18px] w-[18px]" />
          Eliminar planillero
        </button>

        <div className="flex flex-col gap-[12px] sm:flex-row sm:justify-end sm:gap-[16px]">
          <button
            className="h-[52px] rounded-[8px] px-[24px] text-[16px] font-semibold text-[#5e5e5e] transition hover:bg-[#f3deda]"
            onClick={() => navigate("/admin/planilleros")}
            type="button"
          >
            Volver
          </button>
          <button
            className="flex h-[52px] items-center justify-center gap-[12px] rounded-[8px] bg-[linear-gradient(135deg,#a53a2d_0%,#570000_100%)] px-[24px] text-[16px] font-semibold text-[#ffffff] shadow-[0_18px_32px_rgba(48,0,0,0.16)] disabled:opacity-60"
            disabled={saving}
            onClick={() => void save()}
            type="button"
          >
            <Save className="h-[18px] w-[18px]" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
