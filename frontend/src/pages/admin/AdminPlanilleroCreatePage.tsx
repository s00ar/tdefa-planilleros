import { useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Save } from "lucide-react";
import { planillerosService } from "@/services/planilleros.service";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[13px] font-medium uppercase leading-none tracking-[0.04em] text-[#464747] sm:text-[14px]">
      {children}
    </label>
  );
}

const inputClass =
  "mt-[12px] h-[56px] w-full rounded-[8px] border border-[#ead5d2] bg-[#fff8f7] px-[16px] text-[16px] text-[#241917] outline-none focus:ring-2 focus:ring-[#570000]/15";

export function AdminPlanilleroCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [active, setActive] = useState(true);

  const suggestedUsername = useMemo(() => {
    const candidate = `${firstName.trim()}.${lastName.trim()}`
      .toLowerCase()
      .replace(/\s+/g, ".")
      .replace(/\.+/g, ".");
    return candidate.replace(/^\./, "").replace(/\.$/, "");
  }, [firstName, lastName]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) {
      console.warn("[planilleros] create ignored: request already in progress");
      return;
    }

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const finalUsername = username.trim() || suggestedUsername;

    if (name.length < 3 || finalUsername.length < 3) {
      toast.error("Datos incompletos", {
        description: "IngresÃ¡ nombre, apellido y usuario.",
      });
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    console.info("[planilleros] create started", { name, username: finalUsername });
    try {
      const created = await planillerosService.create({
        name,
        username: finalUsername,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        dni: dni.trim() || undefined,
        status: active ? "activo" : "inactivo",
        assignedMatchesCount: 0,
        completedMatchesCount: 0,
      });

      console.info("[planilleros] create completed", { id: created.id, username: created.username });
      toast.success("Planillero creado", { description: created.name });
      navigate("/admin/planilleros", { replace: true });
    } catch (createError) {
      console.error("[planilleros] create failed", createError);
      toast.error("No se pudo crear el planillero", {
        description: createError instanceof Error ? createError.message : "RevisÃ¡ los datos e intentÃ¡ de nuevo.",
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[30px]">
      <div className="flex items-center gap-[10px] text-[16px] font-medium text-[#5e5e5e]">
        <span>Planilleros</span>
        <ChevronRight className="h-[16px] w-[16px]" />
        <span className="font-bold text-[#241917]">Alta</span>
      </div>

      <div>
        <h1 className="m-0 font-heading text-[34px] font-extrabold leading-[1.08] text-[#300000] sm:text-[40px]">
          Crear planillero
        </h1>
        <p className="mt-[12px] text-[17px] leading-[1.45] text-[#5e5e5e] sm:text-[19px]">
          CargÃ¡ Ãºnicamente los datos que hoy maneja la base del sistema.
        </p>
      </div>

      <div className="grid gap-[24px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[10px] bg-[#ffffff] p-[20px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-[32px]">
          <div className="grid gap-[24px] md:grid-cols-2">
            <div>
              <FieldLabel>Nombre</FieldLabel>
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className={inputClass} placeholder="Ej. Carlos" type="text" />
            </div>

            <div>
              <FieldLabel>Apellido</FieldLabel>
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className={inputClass} placeholder="Ej. RodrÃ­guez" type="text" />
            </div>

            <div>
              <FieldLabel>Usuario</FieldLabel>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} placeholder={suggestedUsername || "Ej. carlos.rodriguez"} type="text" />
            </div>

            <div>
              <FieldLabel>Email</FieldLabel>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="usuario@tdefa.digital" type="email" />
            </div>

            <div>
              <FieldLabel>TelÃ©fono</FieldLabel>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="Ej. +54 9 11 5555 5555" type="text" />
            </div>

            <div>
              <FieldLabel>DNI</FieldLabel>
              <input value={dni} onChange={(event) => setDni(event.target.value)} className={inputClass} placeholder="Ej. 30111222" type="text" />
            </div>
          </div>
        </section>

        <aside className="space-y-[24px]">
          <section className="rounded-[10px] bg-[#ffffff] p-[20px] shadow-[0_10px_30px_rgba(36,25,23,0.05)] sm:p-[28px]">
            <div className="flex items-center justify-between gap-[12px]">
              <div>
                <h2 className="m-0 text-[20px] font-semibold text-[#241917] sm:text-[22px]">Estado inicial</h2>
                <p className="mt-[8px] text-[15px] leading-[1.5] text-[#5e5e5e]">
                  DefinÃ­ si el acceso queda habilitado al momento del alta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive((current) => !current)}
                className={cn(
                  "relative h-[32px] w-[58px] rounded-full transition",
                  active ? "bg-[#570000]" : "bg-[#d7d7d7]"
                )}
                aria-pressed={active}
              >
                <span
                  className={cn(
                    "absolute top-[4px] h-[24px] w-[24px] rounded-full bg-[#ffffff] transition",
                    active ? "left-[30px]" : "left-[4px]"
                  )}
                />
              </button>
            </div>

            <div className="mt-[20px] rounded-[8px] bg-[#fff0ee] px-[16px] py-[14px] text-[14px] font-semibold text-[#852318]">
              {active ? "El planillero se crea como activo." : "El planillero se crea como inactivo."}
            </div>
          </section>

          <section className="rounded-[10px] border border-[#ead5d2] bg-[#fff8f7] p-[20px] sm:p-[28px]">
            <h2 className="m-0 text-[18px] font-semibold text-[#241917]">Resumen del alta</h2>
            <dl className="mt-[18px] space-y-[12px] text-[15px] text-[#5e5e5e]">
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Nombre</dt>
                <dd className="font-medium text-[#241917]">{`${firstName} ${lastName}`.trim() || "-"}</dd>
              </div>
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Usuario</dt>
                <dd className="font-medium text-[#241917]">{username.trim() || suggestedUsername || "-"}</dd>
              </div>
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Email</dt>
                <dd className="font-medium text-[#241917]">{email.trim() || "-"}</dd>
              </div>
              <div className="flex flex-col gap-[4px] sm:flex-row sm:items-center sm:justify-between sm:gap-[16px]">
                <dt>Estado</dt>
                <dd className="font-medium text-[#241917]">{active ? "Activo" : "Inactivo"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <div className="flex flex-col gap-[12px] border-t border-[#e5d6d3] pt-[24px] sm:flex-row sm:items-center sm:justify-end sm:gap-[16px]">
        <button
          type="button"
          onClick={() => navigate("/admin/planilleros")}
          className="h-[52px] rounded-[8px] px-[24px] text-[16px] font-semibold text-[#5e5e5e] transition hover:bg-[#f3deda]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex h-[52px] items-center justify-center gap-[12px] rounded-[8px] bg-[linear-gradient(135deg,#852318_0%,#300000_100%)] px-[24px] text-[16px] font-semibold text-[#ffffff] shadow-[0_18px_32px_rgba(48,0,0,0.2)] transition hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-[18px] w-[18px]" />
          {submitting ? "Guardando..." : "Crear planillero"}
        </button>
      </div>
    </form>
  );
}
