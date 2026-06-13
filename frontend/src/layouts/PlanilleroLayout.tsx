import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, Clock3, LogOut, Search, Settings, Shield, User, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useAuthUser } from "@/store/auth.store";

const adminNavItems = [
  { label: "Partidos", to: "/partidos", section: "partidos", icon: CalendarDays },
  { label: "Torneos", to: "/torneos", section: "torneos", icon: Shield },
  { label: "Equipos", to: "/equipos", section: "equipos", icon: Users },
  { label: "Historial", to: "/historial", section: "historial", icon: Clock3 },
] as const;

const planilleroNavItems = [adminNavItems[0]] as const;

function isHeaderItemActive(pathname: string, section: string) {
  if (section === "partidos") return pathname === "/partidos" || pathname === "/incidencias/nueva";
  if (section === "torneos") return pathname.startsWith("/torneos");
  if (section === "equipos") return pathname.startsWith("/equipos");
  if (section === "historial") return pathname.startsWith("/historial");
  return false;
}

export function PlanilleroLayout() {
  const user = useAuthUser();
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [matchQuery, setMatchQuery] = useState("");
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : planilleroNavItems;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1c1e]">
      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-[#f8f9fa]/95 shadow-[0_1px_4px_rgba(0,0,0,0.04)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10 lg:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6 xl:gap-[30px]">
              <NavLink
                to="/"
                aria-label="Ir al inicio"
                className="shrink-0 font-['Manrope'] text-[28px] font-black leading-none tracking-[-0.02em] text-[#570000] [text-decoration:none] sm:text-[34px] lg:text-[40px]"
              >
                TDEFA Digital
              </NavLink>

              <nav className="hidden items-center gap-[22px] lg:flex">
                {navItems.map((item) => {
                  const active = isHeaderItemActive(location.pathname, item.section);
                  return (
                    <NavLink
                      key={`${item.label}-${item.to}`}
                      to={item.to}
                      className={[
                        "relative inline-flex h-[56px] items-center text-[18px] font-medium leading-none text-[#4f4f4f] transition-colors hover:text-[#300000] xl:text-[22px]",
                        "[text-decoration:none]",
                        active ? "font-bold text-[#241917]" : "",
                      ].join(" ")}
                    >
                      {item.label}
                      <span
                        className={[
                          "absolute bottom-[10px] left-1/2 h-[2px] w-[42px] -translate-x-1/2 rounded-full bg-[#241917] transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                      />
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2 text-[#57423e] lg:hidden">
              {isAdmin ? (
                <>
                  <NavLink
                    className="flex h-[40px] w-[40px] items-center justify-center transition hover:text-[#300000]"
                    to="/notificaciones"
                  >
                    <Bell className="h-[22px] w-[22px]" />
                  </NavLink>
                  <NavLink
                    className="flex h-[40px] w-[40px] items-center justify-center transition hover:text-[#300000]"
                    to="/configuracion"
                  >
                    <Settings className="h-[22px] w-[22px]" />
                  </NavLink>
                </>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-[44px] w-[44px] overflow-hidden rounded-[12px] border border-[#dec0bb] bg-[#300000] shadow-sm">
                    <Avatar className="h-full w-full rounded-[12px]">
                      <AvatarFallback className="rounded-[12px] bg-[#300000] text-[16px] font-bold text-[#ffffff]">
                        {(user?.name ?? "P").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-[240px]">
                  <DropdownMenuLabel>SesiÃ³n</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    {user?.name ?? user?.username ?? "-"}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Shield className="mr-2 h-4 w-4" />
                    {user?.role === "admin" ? "Administrador" : "Planillero"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      console.info("[auth] logout selected", { userId: user?.id });
                      void logout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesiÃ³n
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex h-[54px] w-full items-center rounded-[10px] bg-[#fff0ee] lg:max-w-[360px] xl:max-w-[400px]">
              <Search className="pointer-events-none absolute left-[18px] h-[20px] w-[20px] text-[#8b716d] sm:left-[22px] sm:h-[24px] sm:w-[24px]" />
              <input
                value={matchQuery}
                onChange={(event) => {
                  setMatchQuery(event.target.value);
                  if (location.pathname !== "/partidos") navigate("/partidos");
                }}
                className="h-full w-full rounded-[10px] border-0 bg-transparent pl-[52px] pr-[18px] text-[15px] text-[#57423e] outline-none placeholder:text-[#677083] focus:ring-0 sm:pl-[74px] sm:pr-[22px] sm:text-[18px]"
                placeholder="Buscar partido..."
                type="search"
              />
            </div>

            <div className="hidden items-center gap-[22px] lg:flex">
              {isAdmin ? (
                <>
                  <NavLink
                    className="flex h-[44px] w-[34px] items-center justify-center text-[#57423e] transition hover:text-[#300000]"
                    to="/notificaciones"
                  >
                    <Bell className="h-[25px] w-[25px]" />
                  </NavLink>
                  <NavLink
                    className="flex h-[44px] w-[34px] items-center justify-center text-[#57423e] transition hover:text-[#300000]"
                    to="/configuracion"
                  >
                    <Settings className="h-[27px] w-[27px]" />
                  </NavLink>
                </>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-[48px] w-[48px] overflow-hidden rounded-[12px] border border-[#dec0bb] bg-[#300000] shadow-sm">
                    <Avatar className="h-full w-full rounded-[12px]">
                      <AvatarFallback className="rounded-[12px] bg-[#300000] text-[18px] font-bold text-[#ffffff]">
                        {(user?.name ?? "P").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-[240px]">
                  <DropdownMenuLabel>SesiÃ³n</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    {user?.name ?? user?.username ?? "-"}
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Shield className="mr-2 h-4 w-4" />
                    {user?.role === "admin" ? "Administrador" : "Planillero"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      console.info("[auth] logout selected", { userId: user?.id });
                      void logout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesiÃ³n
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-140px)] max-w-[1600px] px-4 py-6 pb-[92px] sm:px-6 sm:py-8 lg:px-10 lg:py-12 lg:pb-12">
        <Outlet context={{ matchQuery, setMatchQuery }} />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#dec0bb]/30 bg-[#ffffff]/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isHeaderItemActive(location.pathname, item.section);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={[
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[10px] px-2 text-center [text-decoration:none]",
                  active ? "bg-[#570000] text-white" : "text-[#57423e]",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-semibold leading-none">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
