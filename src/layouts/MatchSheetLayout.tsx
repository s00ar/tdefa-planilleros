import { NavLink, Outlet } from "react-router-dom";
import { ClipboardList, Home, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { TdefaLogo } from "@/components/brand/TdefaLogo";

const Item = ({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => (
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

export function MatchSheetLayout() {
  return (
    <div className="tdefa-page flex min-h-dvh">
      <aside className="w-[84px] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:w-72">
        <div className="flex h-16 items-center justify-center gap-3 px-3 md:justify-start md:px-5">
          <TdefaLogo size={34} />
          <div className="hidden md:block">
            <div className="text-sm font-semibold leading-none">Planilla</div>
            <div className="mt-0.5 text-[11px] text-sidebar-foreground/70">Operativa</div>
          </div>
        </div>

        <div className="hidden px-4 md:block">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-sidebar-foreground/60">
            Accesos
          </div>
          <div className="space-y-1">
            <Item to="/partidos" icon={<Home className="h-4 w-4" />} label="Mis partidos" />
            <Item to="." icon={<ClipboardList className="h-4 w-4" />} label="Planilla" />
            <Item to="." icon={<Save className="h-4 w-4" />} label="Guardar" />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

