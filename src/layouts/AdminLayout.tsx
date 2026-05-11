import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Grid2X2,
  Headphones,
  History,
  LogOut,
  MapPinned,
  Plus,
  Search,
  Settings,
  ShieldUser,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

function TopNavLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="appearance-none border-0 bg-transparent p-[0] text-[20px] font-medium leading-none text-[#4f4a49] transition hover:text-[#570000]"
    >
      {label}
    </button>
  );
}

function SidebarItem({
  to,
  icon,
  label,
  active = false,
}: {
  to?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const className = cn(
    "mx-[10px] my-[4px] flex h-[60px] w-[calc(100%-20px)] items-center gap-[16px] rounded-[8px] px-[16px] text-[15px] font-medium [text-decoration:none] transition",
    active
      ? "translate-x-[4px] bg-[#570000] text-[#e46857]"
      : "text-[#57423e] hover:bg-[#e9eaeb]"
  );

  const content = (
    <>
      <span className="grid h-[28px] w-[28px] shrink-0 place-items-center">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (!to) {
    return (
      <button type="button" className={cn(className, "appearance-none border-0 text-left")}>
        {content}
      </button>
    );
  }

  return (
    <NavLink to={to} className={className}>
      {content}
    </NavLink>
  );
}

function CreateShellItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[72px] items-center gap-[20px] px-[22px] text-[22px] font-semibold",
        active
          ? "border-l-[4px] border-[#a53a2d] bg-[#e9eaeb] text-[#800000]"
          : "text-[#5e5e5e] opacity-70"
      )}
    >
      <span className="grid h-[28px] w-[28px] place-items-center">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [desktopShell, setDesktopShell] = useState(true);
  const createShell = location.pathname === "/admin/planilleros/nuevo";

  useEffect(() => {
    document.title = "Administración de Planilleros - TDEFA Digital";
  }, []);

  useEffect(() => {
    const sync = () => setDesktopShell(window.innerWidth >= 1024);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  if (createShell) {
    return (
      <div className="min-h-[100vh] bg-[#f1f2f4] font-sans text-[#241917]">
        <aside className="fixed left-[0] top-[0] z-50 flex h-[100vh] w-[320px] flex-col bg-[#f8f9fa] px-[20px] py-[40px]">
          <div className="mb-[64px] px-[10px]">
            <h1 className="m-[0] font-heading text-[56px] font-extrabold leading-none tracking-[0] text-[#300000]">
              TDEFA
            </h1>
            <p className="mt-[12px] text-[22px] font-semibold leading-none text-[#5e5e5e]">
              Tournament Control
            </p>
          </div>

          <nav className="flex-1 [&>*+*]:mt-[10px]">
            <CreateShellItem icon={<Grid2X2 className="h-[24px] w-[24px]" />} label="Dashboard" />
            <CreateShellItem icon={<Users className="h-[24px] w-[24px]" />} label="Planilleros" active />
            <CreateShellItem icon={<CalendarDays className="h-[24px] w-[24px]" />} label="Mi Jornada" />
            <CreateShellItem icon={<History className="h-[24px] w-[24px]" />} label="Historial" />
            <CreateShellItem icon={<Headphones className="h-[24px] w-[24px]" />} label="Soporte" />
          </nav>

          <div className="border-t border-[#dec0bb]/25 px-[10px] pt-[30px]">
            <div className="flex items-center gap-[16px]">
              <div className="h-[48px] w-[48px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_18%,#ffd9bd_0_16%,transparent_17%),linear-gradient(135deg,#742a28_0%,#111827_100%)]">
                <div className="mt-[20px] h-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.65),rgba(255,255,255,0.05))]" />
              </div>
              <div>
                <p className="text-[15px] font-bold leading-tight text-[#241917]">The Digital Strategist</p>
                <p className="mt-[3px] text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-[#464747]">
                  Admin
                </p>
              </div>
            </div>
          </div>
        </aside>

        <header className="fixed left-[320px] right-[0] top-[0] z-40 flex h-[80px] items-center justify-between bg-[#f8f9fa] px-[40px] shadow-[0_1px_8px_rgba(36,25,23,0.08)]">
          <div className="flex items-center gap-[30px]">
            <div className="relative h-[50px] w-[320px]">
              <Search className="pointer-events-none absolute left-[20px] top-1/2 h-[24px] w-[24px] -translate-y-1/2 text-[#57423e]" />
              <input
                className="h-[50px] w-[320px] rounded-[6px] border-0 bg-[#e9eaeb] pl-[50px] pr-[16px] text-[18px] text-[#57423e] outline-none placeholder:text-[#636262]"
                placeholder="Buscar operaciones..."
                type="text"
              />
            </div>
            <span className="font-heading text-[36px] font-extrabold leading-none tracking-[0] text-[#300000]">
              Tactical Operations
            </span>
          </div>

          <div className="flex items-center gap-[28px] text-[#57423e]">
            <Bell className="h-[24px] w-[24px]" />
            <Settings className="h-[28px] w-[28px]" />
          </div>
        </header>

        <main className="ml-[320px] min-h-[100vh] bg-[#f1f2f4] pt-[80px]">
          <div className="mx-auto max-w-[1200px] px-[0] py-[46px]">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fa] font-sans text-[#1a1c1e]">
      <header className="fixed left-[0] top-[0] z-50 flex h-[100px] w-[100%] items-center justify-between bg-[#f8f9fa] px-[40px] shadow-[0_1px_8px_rgba(36,25,23,0.08)]">
        <div className="flex items-center gap-[50px]">
          <span className="font-heading text-[40px] font-extrabold leading-none tracking-[0] text-[#570000]">
            TDEFA Digital
          </span>

          {desktopShell ? (
            <nav className="flex items-center gap-[30px]">
              <TopNavLink label="Planilla" />
              <TopNavLink label="Partidos" />
              <TopNavLink label="Torneos" />
              <TopNavLink label="Equipos" />
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-[20px]">
          <button
            type="button"
            aria-label="Notificaciones"
            className="grid h-[40px] w-[40px] appearance-none place-items-center border-0 bg-transparent p-[0] text-[#5e5e5e] transition hover:text-[#300000]"
          >
            <Bell className="h-[24px] w-[24px]" />
          </button>
          <button
            type="button"
            aria-label="Configuración"
            className="grid h-[40px] w-[40px] appearance-none place-items-center border-0 bg-transparent p-[0] text-[#5e5e5e] transition hover:text-[#300000]"
          >
            <Settings className="h-[24px] w-[24px]" />
          </button>
          <div className="h-[48px] w-[48px] overflow-hidden rounded-full border border-[#dec0bb] bg-[radial-gradient(circle_at_50%_16%,#44515a_0_18%,transparent_19%),linear-gradient(135deg,#081014_0%,#1d5360_48%,#110907_100%)]">
            <div className="mt-[20px] h-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.02))]" />
          </div>
        </div>
      </header>

      {desktopShell ? (
        <aside className="fixed left-[0] top-[0] z-40 flex h-[100vh] w-[320px] flex-col overflow-y-auto bg-[#ffffff] pb-[16px] pt-[120px]">
          <div className="mb-[24px] px-[20px]">
            <div className="flex items-center gap-[16px] px-[10px]">
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] bg-[#570000] text-[#ffffff]">
                <MapPinned className="h-[28px] w-[28px]" />
              </div>
              <div>
                <h2 className="font-heading text-[18px] font-extrabold leading-tight text-[#300000]">
                  Sede Pilar
                </h2>
                <p className="text-[14px] font-medium leading-tight text-[#5e5e5e]">
                  Planillero Oficial
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 [&>*+*]:mt-[4px]">
            <SidebarItem icon={<Grid2X2 className="h-[24px] w-[24px]" />} label="Dashboard" />
            <SidebarItem
              to="/admin/planilleros"
              icon={<Users className="h-[24px] w-[24px]" />}
              label="Planilleros"
              active={location.pathname.startsWith("/admin/planilleros")}
            />
            <SidebarItem
              to="/partidos"
              icon={<CalendarDays className="h-[24px] w-[24px]" />}
              label="Mi Jornada"
              active={location.pathname === "/partidos"}
            />
            <SidebarItem icon={<History className="h-[24px] w-[24px]" />} label="Historial" />
          </nav>

          <div className="mb-[32px] mt-auto px-[16px]">
            <button
              type="button"
              className="mb-[16px] flex h-[54px] w-full appearance-none items-center justify-center gap-[12px] rounded-[8px] border-0 bg-[linear-gradient(135deg,#570000_0%,#300000_100%)] px-[16px] text-[15px] font-semibold text-[#ffffff] shadow-[0_18px_32px_rgba(87,0,0,0.14)]"
            >
              <Plus className="h-[20px] w-[20px]" />
              Nueva Incidencia
            </button>
            <div className="border-t border-[#dec0bb]/25 pt-[16px]">
              <button
                type="button"
                onClick={() => void logout()}
                className="mx-[10px] flex h-[50px] w-[calc(100%-20px)] appearance-none items-center gap-[16px] rounded-[8px] border-0 bg-transparent px-[16px] text-[15px] font-medium text-[#57423e] transition hover:bg-[#e9eaeb]"
              >
                <LogOut className="h-[24px] w-[24px]" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <main className={cn("min-h-[100vh] pt-[100px]", desktopShell ? "pl-[320px]" : "pb-[80px]")}>
        <div className="mx-auto max-w-[1280px] p-[40px]">
          <Outlet />
        </div>
      </main>

      {!desktopShell ? (
        <nav className="fixed bottom-[0] left-[0] right-[0] z-50 flex h-[64px] items-center justify-around border-t border-[#dec0bb]/20 bg-[#ffffff] px-[16px]">
          <button type="button" className="grid place-items-center gap-[4px] text-[#570000]">
            <Grid2X2 className="h-[20px] w-[20px]" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </button>
          <button type="button" className="grid place-items-center gap-[4px] text-[#5e5e5e]">
            <Users className="h-[20px] w-[20px]" />
            <span className="text-[10px]">Planilleros</span>
          </button>
          <button type="button" className="grid place-items-center gap-[4px] text-[#5e5e5e]">
            <CalendarDays className="h-[20px] w-[20px]" />
            <span className="text-[10px]">Jornada</span>
          </button>
          <button type="button" className="grid place-items-center gap-[4px] text-[#5e5e5e]">
            <ShieldUser className="h-[20px] w-[20px]" />
            <span className="text-[10px]">Avisos</span>
          </button>
        </nav>
      ) : null}
    </div>
  );
}
