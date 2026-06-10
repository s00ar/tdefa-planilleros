import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, Settings, Shield, User } from "lucide-react";
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

const navItems = [
  { label: "Partidos", to: "/partidos", section: "partidos" },
  { label: "Torneos", to: "/torneos", section: "torneos" },
  { label: "Equipos", to: "/equipos", section: "equipos" },
  { label: "Historial", to: "/historial", section: "historial" },
] as const;

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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1c1e]">
      <header className="sticky top-0 z-40 h-[100px] border-b border-[#e5e5e5] bg-[#f8f9fa] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex h-full w-full items-center justify-between px-[40px]">
          <div className="flex items-center gap-[30px]">
            <NavLink
              to="/"
              aria-label="Ir al inicio"
              className="font-['Manrope'] text-[40px] font-black leading-none tracking-[-0.02em] text-[#570000] [text-decoration:none]"
            >
              TDEFA Digital
            </NavLink>
            <nav className="flex items-center gap-[26px]">
              {navItems.map((item) => {
                const active = isHeaderItemActive(location.pathname, item.section);
                return (
                  <NavLink
                    key={`${item.label}-${item.to}`}
                    to={item.to}
                    className={[
                      "relative inline-flex h-[60px] items-center text-[22px] font-medium leading-none text-[#4f4f4f] transition-colors hover:text-[#300000]",
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

          <div className="flex items-center gap-[26px]">
            <div className="relative flex h-[66px] w-[320px] items-center rounded-[10px] bg-[#fff0ee]">
              <Search className="pointer-events-none absolute left-[22px] h-[24px] w-[24px] text-[#8b716d]" />
              <input
                value={matchQuery}
                onChange={(event) => {
                  setMatchQuery(event.target.value);
                  if (location.pathname !== "/partidos") navigate("/partidos");
                }}
                className="h-full w-full rounded-[10px] border-0 bg-transparent pl-[74px] pr-[22px] text-[18px] text-[#57423e] outline-none placeholder:text-[#677083] focus:ring-0"
                placeholder="Buscar partido..."
                type="search"
              />
            </div>
            <NavLink className="flex h-[44px] w-[34px] items-center justify-center text-[#57423e] transition hover:text-[#300000]" to="/notificaciones">
              <Bell className="h-[25px] w-[25px]" />
            </NavLink>
            <NavLink className="flex h-[44px] w-[34px] items-center justify-center text-[#57423e] transition hover:text-[#300000]" to="/configuracion">
              <Settings className="h-[27px] w-[27px]" />
            </NavLink>

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
                <DropdownMenuLabel>Sesión</DropdownMenuLabel>
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
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-100px)] max-w-[1600px] px-[40px] py-[48px]">
        <Outlet context={{ matchQuery, setMatchQuery }} />
      </main>
    </div>
  );
}
