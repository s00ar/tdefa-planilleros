import { NavLink, Outlet } from "react-router-dom";
import { Users, LogOut, LayoutGrid } from "lucide-react";
import { TdefaLogo } from "@/components/brand/TdefaLogo";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthUser } from "@/store/auth.store";

function AdminNavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
          isActive && "bg-sidebar-accent text-sidebar-foreground"
        )
      }
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/5">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

export function AdminLayout() {
  const user = useAuthUser();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="tdefa-page flex min-h-dvh">
      <aside className="hidden w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-3 px-5">
          <TdefaLogo size={34} />
          <div>
            <div className="text-sm font-semibold leading-none">TDEFA Digital</div>
            <div className="mt-0.5 text-[11px] text-sidebar-foreground/70">Administración</div>
          </div>
        </div>
        <div className="px-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/60">
            Gestión
          </div>
          <div className="space-y-1">
            <AdminNavItem to="/admin/planilleros" icon={<Users className="h-4 w-4" />} label="Planilleros" />
            <AdminNavItem to="/partidos" icon={<LayoutGrid className="h-4 w-4" />} label="Vista planillero" />
          </div>
        </div>

        <div className="mt-auto border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name ?? "—"}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/70">{user?.username ?? ""}</div>
            </div>
            <button
              onClick={() => void logout()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sidebar-foreground/80 transition hover:bg-white/10 hover:text-sidebar-foreground"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card/90 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <TdefaLogo size={30} />
            <div className="text-sm font-semibold">TDEFA Digital</div>
          </div>
          <div className="hidden text-sm text-muted-foreground lg:block">
            Panel administrativo (mock)
          </div>
          <div className="text-xs text-muted-foreground">Rol: Administrador</div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

