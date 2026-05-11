import { Minus, Plus, ShieldAlert, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PlayerSheetRow } from "@/types/sheet";

export function PlayerRow({
  row,
  onChange,
  disabled = false,
}: {
  row: PlayerSheetRow;
  onChange: (patch: Partial<PlayerSheetRow>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid min-w-[1120px] grid-cols-[minmax(220px,1.4fr)_minmax(120px,0.7fr)_auto_minmax(120px,0.8fr)_auto_minmax(150px,0.8fr)_minmax(160px,1fr)_auto_auto_auto_minmax(200px,1fr)] items-center gap-3 rounded-xl border bg-background px-3 py-2">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{row.name}</div>
        <div className="truncate text-[11px] text-muted-foreground">{row.documentId}</div>
      </div>

      <Input
        value={row.dni}
        onChange={(e) => onChange({ dni: e.target.value })}
        className="h-9"
        placeholder="DNI"
        disabled={disabled}
      />

      <div className="flex items-center justify-center">
        <Switch checked={row.apto} onCheckedChange={(v) => onChange({ apto: v })} disabled={disabled} />
      </div>

      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.signed}
          onCheckedChange={(v) => onChange({ signed: Boolean(v) })}
          disabled={disabled}
        />
      </div>

      <Select
        value={row.change}
        onValueChange={(v) => onChange({ change: v as PlayerSheetRow["change"] })}
        disabled={disabled}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Cambio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sin_cambio">Sin</SelectItem>
          <SelectItem value="sale">Sale</SelectItem>
          <SelectItem value="entra">Entra</SelectItem>
        </SelectContent>
      </Select>

      <Input
        value={row.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        className="h-9"
        placeholder="Observaciones"
        disabled={disabled}
      />

      <div className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => onChange({ goals: Math.max(0, row.goals - 1) })}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          value={String(row.goals)}
          onChange={(e) => onChange({ goals: Math.max(0, Number(e.target.value || 0)) })}
          className="h-9 w-14 text-center tabular-nums"
          inputMode="numeric"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => onChange({ goals: row.goals + 1 })}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => onChange({ yellowCards: Math.max(0, row.yellowCards - 1) })}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="inline-flex h-9 w-14 items-center justify-center rounded-lg border bg-amber-50 text-sm font-medium tabular-nums text-amber-700">
          <ShieldAlert className="mr-1 h-4 w-4" />
          {row.yellowCards}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => onChange({ yellowCards: row.yellowCards + 1 })}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center">
        <Switch
          checked={row.redCard}
          onCheckedChange={(v) => onChange({ redCard: v, redReason: v ? row.redReason : "" })}
          disabled={disabled}
        />
      </div>

      <Input
        value={row.redReason}
        onChange={(e) => onChange({ redReason: e.target.value })}
        className="h-9"
        placeholder="Motivo expulsión"
        disabled={disabled || !row.redCard}
      />

      {row.redCard ? (
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
            <XCircle className="h-3.5 w-3.5" />
            Expulsión
          </span>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
