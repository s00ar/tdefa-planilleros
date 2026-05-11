import { Loader2 } from "lucide-react";

export function AppLoaderScreen({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="tdefa-page flex items-center justify-center px-6">
      <div className="flex items-center gap-3 rounded-2xl bg-card px-5 py-4 shadow-soft">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

