import { Badge } from "@/components/ui/badge";
import type { MatchStatus } from "@/types/match";

const map: Record<MatchStatus, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-secondary text-primary border-primary/10" },
  en_carga: { label: "En carga", className: "bg-primary text-primary-foreground border-primary" },
  terminado: { label: "Terminado", className: "bg-muted text-foreground border-border" },
  reabierto: { label: "Reabierto", className: "bg-accent text-primary border-primary/15" },
};

export function StatusBadge({ status }: { status: MatchStatus }) {
  const item = map[status];
  return (
    <Badge className={"rounded-full px-2.5 py-1 text-[11px] font-medium " + item.className}>
      {item.label}
    </Badge>
  );
}

