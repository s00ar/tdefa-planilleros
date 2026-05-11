import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Lock, Save, ShieldAlert, Unlock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useMatchSheetStore } from "@/features/matchSheet/matchSheet.store";
import { cn } from "@/lib/utils";

export function ScoreboardHeader() {
  const navigate = useNavigate();
  const toast = useToast();

  const match = useMatchSheetStore((s) => s.match);
  const dirty = useMatchSheetStore((s) => s.dirty);
  const saving = useMatchSheetStore((s) => s.saving);
  const save = useMatchSheetStore((s) => s.save);
  const finalize = useMatchSheetStore((s) => s.finalize);
  const reopen = useMatchSheetStore((s) => s.reopen);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const title = useMemo(() => {
    if (!match) return "Planilla del Partido";
    return `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`;
  }, [match]);

  if (!match) return null;

  const locked = match.status === "terminado";

  return (
    <div className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur">
      <div className="px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="h-10 rounded-xl"
              onClick={() => navigate("/partidos")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold tracking-tight">Planilla Operativa</div>
                <StatusBadge status={match.status} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{title}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden md:block">
              <Card className="flex items-center gap-4 rounded-2xl border bg-card px-4 py-2 shadow-soft">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Local</div>
                  <div className="max-w-[180px] truncate text-sm font-semibold">{match.homeTeam.shortName}</div>
                </div>
                <div className="flex items-baseline gap-2 rounded-xl bg-muted/40 px-3 py-1.5 font-semibold tabular-nums">
                  <span className="text-2xl">{match.score.home}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-2xl">{match.score.away}</span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Visitante</div>
                  <div className="max-w-[180px] truncate text-sm font-semibold">{match.awayTeam.shortName}</div>
                </div>
              </Card>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                className={cn("h-10 rounded-xl", dirty ? "" : "opacity-80")}
                variant="default"
                disabled={!dirty || saving || locked}
                onClick={async () => {
                  await save();
                  toast.success("Cambios guardados", { description: "La planilla quedó actualizada." });
                }}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </motion.div>

            {!locked ? (
              <Button
                className="h-10 rounded-xl bg-primary hover:bg-primary/90"
                onClick={() => setConfirmOpen(true)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Finalizar partido
              </Button>
            ) : (
              <Button
                className="h-10 rounded-xl"
                variant="secondary"
                onClick={async () => {
                  await reopen();
                  toast.info("Partido reabierto", { description: "Podés corregir la planilla." });
                }}
              >
                <Unlock className="mr-2 h-4 w-4" />
                Reabrir
              </Button>
            )}

            <div className="hidden lg:flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs text-muted-foreground shadow-soft">
              {locked ? (
                <>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Edición bloqueada
                </>
              ) : dirty ? (
                <>
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Cambios sin guardar
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Sin cambios
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Confirmar finalización operativa</DialogTitle>
            <DialogDescription>
              ¿Confirmás que el partido está terminado? Al finalizar, la planilla queda en estado cerrado.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <div className="font-medium text-foreground">Recomendación</div>
            <div className="mt-1 text-muted-foreground">
              Verificá goles, amonestaciones, expulsiones y observaciones antes de cerrar.
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={async () => {
                setConfirmOpen(false);
                await save();
                await finalize();
                toast.success("Partido finalizado", { description: "La planilla quedó cerrada." });
              }}
            >
              Finalizar partido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

