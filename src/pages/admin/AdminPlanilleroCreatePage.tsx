import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AtSign,
  Camera,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";
import { planillerosService } from "@/services/planilleros.service";
import { useToast } from "@/hooks/useToast";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[14px] font-medium uppercase leading-none tracking-[0] text-[#464747]">
      {children}
    </label>
  );
}

function SecurityItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-[14px] text-[18px] leading-[26px] text-[#241917]">
      <CheckCircle2 className="h-[20px] w-[20px] shrink-0 text-[#241917]" />
      <span>{children}</span>
    </li>
  );
}

export function AdminPlanilleroCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("TDEFA-4829");
  const [externalId, setExternalId] = useState("");
  const [active, setActive] = useState(true);

  const username = useMemo(() => {
    const candidate = email.trim().split("@")[0];
    return candidate || `${firstName.trim().toLowerCase()}.${lastName.trim().toLowerCase()}`.replace(/\.+/g, ".");
  }, [email, firstName, lastName]);

  const generatePassword = () => {
    const value = Math.floor(1000 + Math.random() * 9000);
    setTemporaryPassword(`TDEFA-${value}`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (name.length < 3 || username.length < 3) {
      toast.error("Datos incompletos", {
        description: "Ingresá nombre, apellido y usuario o email.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await planillerosService.create({
        name,
        username,
        email: email.trim() || undefined,
        dni: externalId.trim() || undefined,
        status: active ? "activo" : "inactivo",
        assignedMatchesCount: 0,
        completedMatchesCount: 0,
      });
      toast.success("Planillero creado", { description: created.name });
      navigate(`/admin/planilleros/${created.id}/editar`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[36px] flex items-center gap-[10px] text-[20px] font-medium uppercase leading-none tracking-[0.12em] text-[#5e5e5e]">
        <span>Planilleros</span>
        <ChevronRight className="h-[16px] w-[16px]" />
        <span className="font-bold text-[#241917]">Nuevo Registro</span>
      </div>

      <div className="mb-[32px]">
        <h2 className="m-[0] font-heading text-[40px] font-extrabold leading-[1.15] tracking-[0] text-[#300000]">
          Nuevo Planillero
        </h2>
        <p className="mt-[14px] text-[20px] leading-[30px] text-[#5e5e5e]">
          Complete los datos técnicos para habilitar un nuevo operador en el sistema.
        </p>
      </div>

      <div className="grid grid-cols-[790px_380px] gap-[30px]">
        <div className="[&>*+*]:mt-[30px]">
          <section className="rounded-[8px] bg-[#ffffff] p-[50px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="grid grid-cols-2 gap-x-[30px] gap-y-[38px]">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-[16px] h-[70px] w-full rounded-[6px] border-0 bg-[#f3deda] px-[22px] text-[20px] text-[#57423e] outline-none placeholder:text-[#636262] focus:ring-1 focus:ring-[#8b716d]"
                  placeholder="Ej. Carlos"
                  type="text"
                />
              </div>

              <div>
                <FieldLabel>Apellido</FieldLabel>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-[16px] h-[70px] w-full rounded-[6px] border-0 bg-[#f3deda] px-[22px] text-[20px] text-[#57423e] outline-none placeholder:text-[#636262] focus:ring-1 focus:ring-[#8b716d]"
                  placeholder="Ej. Rodriguez"
                  type="text"
                />
              </div>

              <div className="[grid-column:span_2/span_2]">
                <FieldLabel>Usuario o Email</FieldLabel>
                <div className="relative mt-[16px]">
                  <AtSign className="pointer-events-none absolute left-[22px] top-1/2 h-[28px] w-[28px] -translate-y-1/2 text-[#8b716d]/60" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-[70px] w-full rounded-[6px] border-0 bg-[#f3deda] pl-[56px] pr-[22px] text-[20px] text-[#57423e] outline-none placeholder:text-[#636262] focus:ring-1 focus:ring-[#8b716d]"
                    placeholder="usuario@tdefa.digital"
                    type="email"
                  />
                </div>
              </div>

              <div className="[grid-column:span_2/span_2]">
                <FieldLabel>Contraseña Temporal</FieldLabel>
                <div className="relative mt-[16px]">
                  <LockKeyhole className="pointer-events-none absolute left-[22px] top-1/2 h-[28px] w-[28px] -translate-y-1/2 text-[#8b716d]/60" />
                  <input
                    value={temporaryPassword}
                    onChange={(event) => setTemporaryPassword(event.target.value)}
                    className="h-[70px] w-full rounded-[6px] border-0 bg-[#f3deda] pl-[56px] pr-[120px] text-[20px] text-[#241917] outline-none focus:ring-1 focus:ring-[#8b716d]"
                    type="password"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="absolute right-[22px] top-1/2 -translate-y-1/2 appearance-none border-0 bg-transparent p-[0] text-[16px] font-bold text-[#300000]"
                  >
                    Generar
                  </button>
                </div>
                <p className="mt-[12px] px-[10px] text-[12px] italic leading-none text-[#464747]">
                  El usuario deberá cambiar esta contraseña al primer inicio de sesión.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[8px] border border-dashed border-[#000000]/30 bg-[#f3deda]/30 p-[50px]">
            <div className="flex items-start gap-[30px]">
              <div className="flex h-[88px] w-[82px] shrink-0 items-center justify-center rounded-[6px] bg-[#ffffff] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <RefreshCw className="h-[34px] w-[34px] text-[#300000]" />
              </div>
              <div className="flex-1">
                <h3 className="m-[0] font-heading text-[30px] font-extrabold leading-tight tracking-[0] text-[#241917]">
                  Sincronización Externa
                </h3>
                <p className="mt-[8px] text-[18px] leading-[26px] text-[#5e5e5e]">
                  Vincule este perfil con bases de datos de federaciones externas.
                </p>
                <div className="mt-[30px]">
                  <FieldLabel>ID Interno</FieldLabel>
                  <input
                    value={externalId}
                    onChange={(event) => setExternalId(event.target.value)}
                    className="mt-[16px] h-[104px] w-full rounded-[3px] border-2 border-[#300000]/10 bg-[#ffffff] px-[24px] font-heading text-[52px] font-extrabold leading-none tracking-[0] text-[#300000] outline-none placeholder:text-[#d5d6d8] focus:border-[#300000]/40"
                    placeholder="ID-000-000"
                    type="text"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="[&>*+*]:mt-[30px]">
          <section className="rounded-[8px] bg-[#ffffff] p-[30px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <h3 className="m-[0] text-[22px] font-semibold leading-none text-[#241917]">Estado Inicial</h3>
              <button
                type="button"
                onClick={() => setActive((current) => !current)}
                className="relative h-[30px] w-[58px] appearance-none rounded-full border-0 bg-[#800000] p-[0]"
                aria-pressed={active}
              >
                <span
                  className={`absolute top-[3px] h-[24px] w-[24px] rounded-full bg-[#ffffff] transition ${
                    active ? "left-[31px]" : "left-[3px]"
                  }`}
                />
              </button>
            </div>

            <div className="mt-[38px] flex h-[70px] items-center gap-[18px] rounded-[6px] bg-[#fff0ee] px-[24px]">
              <ShieldCheck className="h-[28px] w-[28px] text-[#852318]" />
              <span className="text-[14px] font-bold uppercase leading-none tracking-[0.12em] text-[#852318]">
                {active ? "Perfil Activo" : "Perfil Inactivo"}
              </span>
            </div>
            <p className="mt-[34px] px-[10px] text-[18px] leading-[28px] text-[#5e5e5e]">
              Al estar activo, el planillero podrá acceder a la plataforma y gestionar eventos asignados de inmediato.
            </p>
          </section>

          <section className="rounded-[8px] border border-[#000000]/15 bg-[#e9eaeb]/50 p-[30px]">
            <h4 className="m-[0] mb-[26px] text-[14px] font-bold uppercase leading-none tracking-[0.24em] text-[#300000]">
              Requisitos de Seguridad
            </h4>
            <ul className="m-[0] list-none p-[0] [&>*+*]:mt-[18px]">
              <SecurityItem>Email corporativo válido</SecurityItem>
              <SecurityItem>ID de federación único</SecurityItem>
              <SecurityItem>Asignación de rol "Planillero"</SecurityItem>
            </ul>
          </section>

          <section className="relative h-[214px] overflow-hidden rounded-[8px] bg-[linear-gradient(135deg,#5d4d4d_0%,#302525_100%)]">
            <div className="absolute inset-[0] bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.18),transparent_45%)] opacity-60 grayscale" />
            <div className="absolute inset-[0] flex flex-col items-center justify-center bg-[#300000]/20 backdrop-blur-[2px]">
              <Camera className="mb-[12px] h-[34px] w-[34px] text-[#ffffff]" />
              <span className="text-[22px] font-bold uppercase leading-none tracking-[0.18em] text-[#ffffff]">
                Foto de Perfil
              </span>
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-[30px] flex items-center justify-end gap-[24px] border-t border-[#000000]/10 py-[30px]">
        <button
          type="button"
          onClick={() => navigate("/admin/planilleros")}
          className="h-[56px] appearance-none rounded-[6px] border-0 bg-transparent px-[38px] text-[20px] font-semibold text-[#5e5e5e] transition hover:bg-[#f3deda]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex h-[56px] appearance-none items-center gap-[14px] rounded-[6px] border-0 bg-[linear-gradient(135deg,#852318_0%,#300000_100%)] px-[38px] text-[20px] font-semibold text-[#ffffff] shadow-[0_18px_32px_rgba(48,0,0,0.2)] transition hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-[22px] w-[22px]" />
          {submitting ? "Guardando..." : "Guardar Planillero"}
        </button>
      </div>
    </form>
  );
}
