import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle2, Save, Settings } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const copy: Record<string, { title: string; subtitle: string }> = {
  torneos: {
    title: "Torneos",
    subtitle: "Vista de consulta para torneos disponibles. Esta secci?n queda lista para conectar datos reales.",
  },
  equipos: {
    title: "Equipos",
    subtitle: "Vista de consulta para equipos participantes. Esta secci?n queda lista para conectar datos reales.",
  },
  reglamento: {
    title: "Reglamento oficial",
    subtitle: "Acceso a reglas administrativas y criterios de carga de planillas.",
  },
  notificaciones: {
    title: "Notificaciones",
    subtitle: "Centro de avisos operativos del sistema.",
  },
  configuracion: {
    title: "Configuraci?n",
    subtitle: "Preferencias de cuenta y par?metros de la plataforma.",
  },
};

export function SupportSectionPage({ section }: { section: keyof typeof copy }) {
  const content = copy[section];
  const toast = useToast();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const notifications = [
    {
      id: "planillero",
      title: "Gesti?n de planilleros",
      detail: "Revisa altas, bajas y cambios de estado desde el panel administrativo.",
      to: "/admin/planilleros",
    },
    {
      id: "match",
      title: "Planilla reabierta",
      detail: "Cancha 5 requiere correcci?n por firma de capit?n faltante.",
      to: "/partidos",
    },
    {
      id: "incident",
      title: "Registro de incidencia",
      detail: "Pod?s cargar un evento puntual y asociarlo a la planilla del partido.",
      to: "/incidencias/nueva",
    },
  ];

  return (
    <div className="min-h-[520px]">
      <Link
        className="mb-[34px] inline-flex h-[52px] items-center gap-[12px] rounded-[4px] bg-[#e9eaeb] px-[22px] text-[18px] font-semibold text-[#241917] [text-decoration:none]"
        to="/partidos"
      >
        <ArrowLeft className="h-[20px] w-[20px]" />
        Volver a partidos
      </Link>
      <section className="rounded-[8px] bg-[#ffffff] p-[48px] shadow-[0_10px_30px_-10px_rgba(36,25,23,0.08)]">
        <p className="mb-[14px] text-[15px] font-medium uppercase tracking-[0.18em] text-[#e46857]">
          TDEFA Digital
        </p>
        <h1 className="m-[0] font-heading text-[48px] font-extrabold leading-tight text-[#300000]">
          {content.title}
        </h1>
        <p className="mt-[14px] max-w-[720px] text-[20px] leading-[30px] text-[#5e5e5e]">
          {content.subtitle}
        </p>

        {section === "notificaciones" ? (
          <div className="mt-[34px] space-y-[18px]">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold text-[#57423e]">
                {notifications.length - readIds.length} avisos pendientes
              </p>
              <button
                type="button"
                onClick={() => {
                  setReadIds(notifications.map((item) => item.id));
                  toast.success("Notificaciones marcadas como le?das");
                }}
                className="flex h-[44px] items-center gap-[10px] rounded-[4px] border-0 bg-[#e9eaeb] px-[18px] text-[15px] font-semibold text-[#241917]"
              >
                <CheckCircle2 className="h-[18px] w-[18px]" />
                Marcar todas
              </button>
            </div>
            {notifications.map((item) => {
              const read = readIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-[20px] rounded-[6px] border border-[#dec0bb]/25 bg-[#fff8f6] p-[20px]"
                >
                  <div className="flex items-start gap-[16px]">
                    <span className="grid h-[44px] w-[44px] place-items-center rounded-[6px] bg-[#ffe9e6] text-[#570000]">
                      <Bell className="h-[22px] w-[22px]" />
                    </span>
                    <div>
                      <p className="text-[20px] font-bold text-[#300000]">{item.title}</p>
                      <p className="mt-[4px] text-[16px] leading-[24px] text-[#5e5e5e]">{item.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    {!read ? (
                      <button
                        type="button"
                        onClick={() => setReadIds((current) => [...current, item.id])}
                        className="h-[42px] rounded-[4px] border-0 bg-[#570000] px-[16px] text-[14px] font-semibold text-[#ffffff]"
                      >
                        Marcar le?da
                      </button>
                    ) : (
                      <span className="text-[14px] font-semibold text-[#5e5e5e]">Leida</span>
                    )}
                    <Link className="text-[14px] font-bold text-[#570000] [text-decoration:none]" to={item.to}>
                      Ver
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {section === "configuracion" ? (
          <div className="mt-[34px] grid max-w-[760px] gap-[18px]">
            <SettingToggle
              checked={syncEnabled}
              icon={<Settings className="h-[22px] w-[22px]" />}
              label="Sincronizaci?n en tiempo real"
              onToggle={() => setSyncEnabled((current) => !current)}
            />
            <SettingToggle
              checked={soundEnabled}
              icon={<Bell className="h-[22px] w-[22px]" />}
              label="Alertas sonoras de planilla"
              onToggle={() => setSoundEnabled((current) => !current)}
            />
            <button
              type="button"
              onClick={() => toast.success("Preferencias guardadas")}
              className="mt-[10px] flex h-[54px] w-fit items-center gap-[12px] rounded-[4px] border-0 bg-[#570000] px-[24px] text-[17px] font-semibold text-[#ffffff]"
            >
              <Save className="h-[20px] w-[20px]" />
              Guardar preferencias
            </button>
          </div>
        ) : null}

      </section>
    </div>
  );
}

function SettingToggle({
  checked,
  icon,
  label,
  onToggle,
}: {
  checked: boolean;
  icon: ReactNode;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-[72px] w-full items-center justify-between rounded-[6px] border border-[#dec0bb]/25 bg-[#fff8f6] px-[22px] text-left"
    >
      <span className="flex items-center gap-[14px] text-[18px] font-semibold text-[#241917]">
        <span className="text-[#570000]">{icon}</span>
        {label}
      </span>
      <span className={checked ? "h-[28px] w-[54px] rounded-full bg-[#570000] p-[3px]" : "h-[28px] w-[54px] rounded-full bg-[#e1dfdf] p-[3px]"}>
        <span className={checked ? "block h-[22px] w-[22px] translate-x-[26px] rounded-full bg-[#ffffff]" : "block h-[22px] w-[22px] rounded-full bg-[#ffffff]"} />
      </span>
    </button>
  );
}
