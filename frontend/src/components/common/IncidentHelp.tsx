import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function IncidentHelp({ className }: { className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="¿Qué es una incidencia?"
          className={cn(
            "inline-grid size-7 shrink-0 place-items-center rounded-full border border-[#852318]/30 bg-[#fff0ee] text-sm font-black text-[#852318] transition-colors hover:border-[#852318] hover:bg-[#f3deda] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#852318]/30",
            className
          )}
        >
          ?
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] px-4 py-3 text-sm leading-relaxed" sideOffset={8}>
        Una incidencia es un evento ocurrido durante el partido, como un gol, una tarjeta, una expulsión,
        un cambio o una observación relevante.
      </TooltipContent>
    </Tooltip>
  );
}
