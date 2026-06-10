import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Grid2X2,
  History,
  LogOut,
  MapPinned,
  Search,
  Settings,
  ShieldUser,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthUser } from "@/store/auth.store";

function TopNavLink({ label, to, active }: { label: string; to: string; active: boolean }) {
  return (
    <NavLink
      to={to}
      className={cn(
        "relative py-[8px] text-[20px] font-medium leading-none text-[#4f4a49] transition [text-decoration:none] hover:text-[#570000]",
        active && "font-bold text-[#241917]"
      )}
    >
      {label}
      {active ? <span className="absolute bottom-[-4px] left-0 h-[2px] w-full bg-[#241917]" /> : null}
    </NavLink>
  );
}

function isTopNavActive(pathname: string, section: string) {
  if (section === "partidos") return pathname === "/partidos" || pathname === "/incidencias/nueva";
  if (section === "torneos") return pathname.startsWith("/torneos");
  if (section === "equipos") return pathname.startsWith("/equipos");
  if (section === "historial") return pathname.startsWith("/historial");
  return false;
}

function SidebarItem({
  to,
  icon,
  label,
  active = false,
}: {
  to?: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  const className = cn(
    "mx-[10px] my-[4px] flex h-[60px] w-[calc(100%-20px)] items-center gap-[16px] rounded-[8px] px-[16px] text-[15px] font-medium [text-decoration:none] transition",
    active ? "translate-x-[4px] bg-[#570000] text-[#ffffff]" : "text-[#57423e] hover:bg-[#e9eaeb]"
  );

  const content = (
    <>
      <span className="grid h-[28px] w-[28px] shrink-0 place-items-center">{icon}</span>
      <span>{label}</span>
    </>
  );

  if (!to) {
    return <div className={className}>{content}</div>;
  }

  return (
    <NavLink to={to} className={className}>
      {content}
    </NavLink>
  );
}

function CreateShellItem({
  to,
  icon,
  label,
  active = false,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex h-[72px] items-center gap-[20px] px-[22px] text-[22px] font-semibold [text-decoration:none]",
        active ? "border-l-[4px] border-[#a53a2d] bg-[#e9eaeb] text-[#800000]" : "text-[#5e5e5e] opacity-70"
      )}
    >
      <span className="grid h-[28px] w-[28px] place-items-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function UserMenu() {
  const user = useAuthUser();
  const logout = useAuthStore((state) => state.logout);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú de usuario"
          className="h-[48px] w-[48px] overflow-hidden rounded-full border border-[#dec0bb] shadow-sm transition hover:border-[#570000]/40"
        >
          <Avatar className="h-full w-full">
            <AvatarFallback className="bg-[#300000] text-[18px] font-bold text-[#ffffff]">
              {(user?.name ?? "A").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-[240px]">
        <DropdownMenuLabel>Sesión</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>{user?.name ?? "Administrador"}</DropdownMenuItem>
        <DropdownMenuItem disabled>{user?.username ?? "-"}</DropdownMenuItem>
        <DropdownMenuItem disabled>Administrador</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            console.info("[auth] logout selected", { userId: user?.id });
            void logout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [desktopShell, setDesktopShell] = useState(true);
  const [adminQuery, setAdminQuery] = useState("");
  const createShell = location.pathname === "/admin/planilleros/nuevo";
  const editShell = /^\/admin\/planilleros\/[^/]+\/editar$/.test(location.pathname);
  const matchCreateShell = location.pathname === "/admin/partidos/nuevo";
  const formShell = createShell || editShell || matchCreateShell;

  useEffect(() => {
    document.title = "Administración de Planilleros - TDEFA Digital";
  }, []);

  useEffect(() => {
    const sync = () => setDesktopShell(window.innerWidth >= 1024);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  if (formShell) {
    return (
      <div className="min-h-[100vh] bg-[#f1f2f4] font-sans text-[#241917]">
        <aside className="fixed left-0 top-0 z-50 flex h-[100vh] w-[320px] flex-col bg-[#f8f9fa] px-[20px] py-[40px]">
          <div className="mb-[64px] px-[10px]">
            <NavLink
              to="/"
              aria-label="Ir al inicio"
              className="m-0 font-heading text-[42px] font-extrabold leading-none text-[#300000] [text-decoration:none]"
            >
              TDEFA
            </NavLink>
            <p className="mt-[12px] text-[20px] font-semibold leading-none text-[#5e5e5e]">
              Gestión administrativa
            </p>
          </div>

          <nav className="flex-1 [&>*+*]:mt-[10px]">
            <CreateShellItem
              to="/admin/planilleros"
              icon={<Users className="h-[24px] w-[24px]" />}
              label="Planilleros"
              active={!matchCreateShell}
            />
            <CreateShellItem
              to="/partidos"
              icon={<CalendarDays className="h-[24px] w-[24px]" />}
              label="Partidos"
              active={matchCreateShell}
            />
            <CreateShellItem to="/historial" icon={<History className="h-[24px] w-[24px]" />} label="Historial" />
          </nav>

          <div className="border-t border-[#000000]/15 px-0 pt-[30px]">
            <div className="flex items-center justify-between gap-[16px]">
              <div className="flex items-center gap-[16px]">
                <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[#300000] text-[#ffffff]">
                  <ShieldUser className="h-[24px] w-[24px]" />
                </div>
                <div>
                  <p className="text-[18px] font-medium leading-tight text-[#241917]">Panel admin</p>
                  <p className="mt-[6px] text-[14px] leading-tight text-[#464747]">TDEFA Digital</p>
                </div>
              </div>
              <UserMenu />
            </div>
          </div>
        </aside>

        <header className="fixed left-[320px] right-[0] top-[0] z-40 flex h-[80px] w-[calc(100vw-320px)] items-center justify-between bg-[#f8f9fa] px-[40px] shadow-[0_1px_8px_rgba(36,25,23,0.08)]">
          <div className="flex min-w-0 items-center gap-[30px]">
            <div className="relative h-[50px] w-[320px]">
              <Search className="pointer-events-none absolute left-[20px] top-1/2 h-[24px] w-[24px] -translate-y-1/2 text-[#57423e]" />
              <input
                value={adminQuery}
                onChange={(event) => {
                  setAdminQuery(event.target.value);
                  if (event.target.value.trim()) navigate("/admin/planilleros");
                }}
                className="h-[50px] w-[320px] rounded-[6px] border-0 bg-[#e9eaeb] pl-[50px] pr-[16px] text-[18px] text-[#57423e] outline-none placeholder:text-[#636262]"
                placeholder={matchCreateShell ? "Buscar partidos..." : "Buscar planilleros..."}
                type="text"
              />
            </div>
            <span className="truncate font-heading text-[32px] font-extrabold leading-none text-[#300000]">
              Gestión de planilleros
            </span>
          </div>

          <div className="ml-[24px] flex shrink-0 items-center gap-[20px] text-[#57423e]">
            <NavLink to="/notificaciones" className="text-[#57423e] [text-decoration:none]">
              <Bell className="h-[24px] w-[24px]" />
            </NavLink>
            <NavLink to="/configuracion" className="text-[#57423e] [text-decoration:none]">
              <Settings className="h-[24px] w-[24px]" />
            </NavLink>
            <UserMenu />
          </div>
        </header>

        <main className="ml-[320px] min-h-[100vh] bg-[#f1f2f4] pt-[80px]">
          <div className="mx-auto max-w-[1200px] py-[46px]">
            <Outlet context={{ adminQuery, setAdminQuery }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fa] font-sans text-[#1a1c1e]">
      <header className="fixed left-0 top-0 z-50 flex h-[100px] w-full items-center justify-between bg-[#f8f9fa] px-[40px] shadow-[0_1px_8px_rgba(36,25,23,0.08)]">
        <div className="flex items-center gap-[50px]">
          <NavLink
            to="/"
            aria-label="Ir al inicio"
            className="font-heading text-[40px] font-extrabold leading-none text-[#570000] [text-decoration:none]"
          >
            TDEFA Digital
          </NavLink>

          {desktopShell ? (
            <nav className="flex items-center gap-[30px]">
              <TopNavLink label="Partidos" to="/partidos" active={isTopNavActive(location.pathname, "partidos")} />
              <TopNavLink label="Torneos" to="/torneos" active={isTopNavActive(location.pathname, "torneos")} />
              <TopNavLink label="Equipos" to="/equipos" active={isTopNavActive(location.pathname, "equipos")} />
              <TopNavLink label="Historial" to="/historial" active={isTopNavActive(location.pathname, "historial")} />
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-[20px]">
          <NavLink
            to="/notificaciones"
            aria-label="Notificaciones"
            className="grid h-[40px] w-[40px] place-items-center text-[#5e5e5e] transition [text-decoration:none] hover:text-[#300000]"
          >
            <Bell className="h-[24px] w-[24px]" />
          </NavLink>
          <NavLink
            to="/configuracion"
            aria-label="Configuración"
            className="grid h-[40px] w-[40px] place-items-center text-[#5e5e5e] transition [text-decoration:none] hover:text-[#300000]"
          >
            <Settings className="h-[24px] w-[24px]" />
          </NavLink>
          <UserMenu />
        </div>
      </header>

      {desktopShell ? (
        <aside className="fixed left-0 top-0 z-40 flex h-[100vh] w-[320px] flex-col overflow-y-auto bg-[#ffffff] pb-[16px] pt-[120px]">
          <div className="mb-[24px] px-[20px]">
            <div className="flex items-center gap-[16px] px-[10px]">
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] bg-[#570000] text-[#ffffff]">
                <MapPinned className="h-[28px] w-[28px]" />
              </div>
              <div>
                <h2 className="font-heading text-[18px] font-extrabold leading-tight text-[#300000]">Sede Pilar</h2>
                <p className="text-[14px] font-medium leading-tight text-[#5e5e5e]">Administrador</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 [&>*+*]:mt-[4px]">
            <SidebarItem
              to="/admin/planilleros"
              icon={<Users className="h-[24px] w-[24px]" />}
              label="Planilleros"
              active={location.pathname.startsWith("/admin/planilleros")}
            />
            <SidebarItem
              to="/partidos"
              icon={<CalendarDays className="h-[24px] w-[24px]" />}
              label="Partidos"
              active={location.pathname === "/partidos"}
            />
            <SidebarItem
              to="/historial"
              icon={<History className="h-[24px] w-[24px]" />}
              label="Historial"
              active={location.pathname.startsWith("/historial")}
            />
          </nav>

          <div className="mb-[32px] mt-auto px-[16px]">
            <button
              type="button"
              onClick={() => navigate("/admin/partidos/nuevo")}
              className="mb-[16px] flex h-[54px] w-full appearance-none items-center justify-center gap-[12px] rounded-[8px] border-0 bg-[linear-gradient(135deg,#570000_0%,#300000_100%)] px-[16px] text-[15px] font-semibold text-[#ffffff] shadow-[0_18px_32px_rgba(87,0,0,0.14)]"
            >
              Registrar partido
            </button>
            <div className="border-t border-[#dec0bb]/25 pt-[16px]">
              <button
                type="button"
                onClick={() => void useAuthStore.getState().logout()}
                className="mx-[10px] flex h-[50px] w-[calc(100%-20px)] appearance-none items-center gap-[16px] rounded-[8px] border-0 bg-transparent px-[16px] text-[15px] font-medium text-[#57423e] transition hover:bg-[#e9eaeb]"
              >
                <LogOut className="h-[24px] w-[24px]" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      <main className={cn("min-h-[100vh] pt-[100px]", desktopShell ? "pl-[320px]" : "pb-[80px]")}>
        <div className="mx-auto max-w-[1280px] p-[40px]">
          <Outlet context={{ adminQuery, setAdminQuery }} />
        </div>
      </main>

      {!desktopShell ? (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[64px] items-center justify-around border-t border-[#dec0bb]/20 bg-[#ffffff] px-[16px]">
          <NavLink to="/partidos" className="grid place-items-center gap-[4px] text-[#570000] [text-decoration:none]">
            <Grid2X2 className="h-[20px] w-[20px]" />
            <span className="text-[10px] font-bold">Partidos</span>
          </NavLink>
          <NavLink to="/admin/planilleros" className="grid place-items-center gap-[4px] text-[#5e5e5e] [text-decoration:none]">
            <Users className="h-[20px] w-[20px]" />
            <span className="text-[10px]">Planilleros</span>
          </NavLink>
          <NavLink to="/historial" className="grid place-items-center gap-[4px] text-[#5e5e5e] [text-decoration:none]">
            <CalendarDays className="h-[20px] w-[20px]" />
            <span className="text-[10px]">Historial</span>
          </NavLink>
          <NavLink to="/notificaciones" className="grid place-items-center gap-[4px] text-[#5e5e5e] [text-decoration:none]">
            <ShieldUser className="h-[20px] w-[20px]" />
            <span className="text-[10px]">Avisos</span>
          </NavLink>
        </nav>
      ) : null}
    </div>
  );
}
