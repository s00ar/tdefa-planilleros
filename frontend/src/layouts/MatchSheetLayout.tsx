import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, Gavel, Grid2X2, History, LogOut, PlusCircle, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const topNav = [
  { label: "Partidos", to: "/partidos", activePaths: [/^\/partidos$/, /^\/incidencias\/nueva$/] },
  { label: "Torneos", to: "/torneos", activePaths: [/^\/torneos/] },
  { label: "Equipos", to: "/equipos", activePaths: [/^\/equipos/] },
  { label: "Historial", to: "/historial", activePaths: [/^\/historial/] },
] as const;

const isActive = (pathname: string, paths: readonly RegExp[]) => paths.some((pattern) => pattern.test(pathname));

function NavItem({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex h-[60px] w-full appearance-none items-center gap-[18px] rounded-[8px] border-0 px-[18px] text-left text-[15px] font-medium",
        active ? "bg-[#570000] text-[#e46857]" : "bg-transparent text-[#57423e]"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function MatchSheetLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-[#f5f6f7] font-sans text-[#241917]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#ead5d2] bg-[#fff0ee]/95 px-4 shadow-[0_1px_10px_rgba(36,25,23,0.08)] backdrop-blur md:px-6 lg:h-[100px] lg:px-10">
        <div className="flex min-w-0 items-center gap-8 xl:gap-[50px]">
          <NavLink
            to="/"
            className="shrink-0 font-heading text-[25px] font-extrabold leading-none text-[#570000] [text-decoration:none] sm:text-[30px] lg:text-[40px]"
          >
            TDEFA Digital
          </NavLink>
          <nav className="hidden items-center gap-[30px] lg:flex">
            {topNav.map((item) => {
              const active = isActive(location.pathname, item.activePaths);
              return (
                <NavLink
                  key={item.label}
                  className={[
                    "relative inline-flex h-[60px] items-center text-[20px] leading-none [text-decoration:none]",
                    active ? "font-bold text-[#241917]" : "font-medium text-[#4f4f4f]",
                  ].join(" ")}
                  to={item.to}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute bottom-[10px] left-1/2 h-[2px] w-[36px] -translate-x-1/2 rounded-full bg-[#241917] transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-[26px]">
          <NavLink to="/notificaciones" className="hidden text-[#57423e] [text-decoration:none] sm:block">
            <Bell className="h-[25px] w-[25px]" />
          </NavLink>
          <NavLink to="/configuracion" className="hidden text-[#57423e] [text-decoration:none] sm:block">
            <Settings className="h-[27px] w-[27px]" />
          </NavLink>
          <div className="hidden h-[48px] w-[48px] overflow-hidden rounded-[12px] border border-[#dec0bb] bg-[radial-gradient(circle_at_50%_16%,#43515a_0_18%,transparent_19%),linear-gradient(135deg,#081014_0%,#1d5360_48%,#110907_100%)] md:block" />
          <button
            className="h-10 appearance-none rounded-lg border-0 bg-[#570000] px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#6f0909] sm:px-4 lg:h-12 lg:px-5 lg:text-[18px]"
            onClick={() => navigate("/partidos")}
            type="button"
          >
            <span className="hidden sm:inline">Cerrar planilla</span>
            <span className="sm:hidden">Cerrar</span>
          </button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[100px] z-30 hidden w-[200px] flex-col border-r border-[#eee4e2] bg-white px-[15px] py-5 xl:flex">
        <div className="mb-[38px] flex h-[123px] items-center gap-[14px] rounded-[8px] bg-[#fff0ee] px-[15px]">
          <div className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[4px] bg-[#570000] text-[#ffffff]">
            <CalendarDays className="h-[24px] w-[24px]" />
          </div>
          <div>
            <h2 className="m-[0] font-heading text-[26px] font-extrabold leading-[1.05] text-[#241917]">
              Sede
              <br />
              Pilar
            </h2>
            <p className="mt-[6px] text-[16px] leading-[1.05] text-[#57423e]">
              Planillero
              <br />
              Oficial
            </p>
          </div>
        </div>

        <nav className="space-y-[10px]">
          <NavItem icon={<Grid2X2 className="h-[24px] w-[24px]" />} label="Dashboard" onClick={() => navigate("/partidos")} />
          <NavItem icon={<CalendarDays className="h-[24px] w-[24px]" />} label="Mi Jornada" active onClick={() => navigate("/partidos")} />
          <NavItem icon={<History className="h-[24px] w-[24px]" />} label="Historial" onClick={() => navigate("/historial")} />
          <NavItem icon={<Gavel className="h-[24px] w-[24px]" />} label="Reglamento" onClick={() => navigate("/reglamento")} />
        </nav>

        <div className="mt-auto">
          <button
            className="mb-[22px] flex h-[90px] w-full appearance-none items-center justify-center gap-[12px] rounded-[8px] border-0 bg-[#570000] px-[12px] text-center text-[20px] font-bold leading-[1.25] text-[#ffffff] shadow-[0_18px_32px_rgba(87,0,0,0.18)]"
            onClick={() => navigate("/incidencias/nueva")}
            type="button"
          >
            <PlusCircle className="h-[27px] w-[27px] shrink-0" />
            <span>
              Registrar
              <br />
              incidencia
            </span>
          </button>
          <div className="border-t border-[#ead5d2] pt-[22px]">
            <button
              className="flex w-full appearance-none items-center gap-[18px] border-0 bg-transparent px-[22px] text-left text-[16px] font-medium leading-[1.1] text-[#ba1a1a]"
              onClick={() => void logout()}
              type="button"
            >
              <LogOut className="h-[24px] w-[24px]" />
              Cerrar
              <br />
              Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pt-[72px] lg:pt-[100px] xl:pl-[200px]">
        <Outlet />
      </main>
    </div>
  );
}
