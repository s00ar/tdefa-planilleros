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
    <>
      <div className="rounded-xl border bg-background p-4 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{row.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{row.documentId}</div>
          </div>
          {row.redCard ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              ExpulsiÃ³n
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="DNI">
            <Input
              value={row.dni}
              onChange={(e) => onChange({ dni: e.target.value })}
              className="h-10"
              placeholder="DNI"
              disabled={disabled}
            />
          </Field>

          <Field label="Cambio">
            <Select
              value={row.change}
              onValueChange={(v) => onChange({ change: v as PlayerSheetRow["change"] })}
              disabled={disabled}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Cambio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin_cambio">Sin</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="entra">Entra</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Apto">
            <div className="flex h-10 items-center justify-between rounded-lg border bg-muted/20 px-3">
              <span className="text-sm text-muted-foreground">Habilitado</span>
              <Switch checked={row.apto} onCheckedChange={(v) => onChange({ apto: v })} disabled={disabled} />
            </div>
          </Field>

          <Field label="Firma">
            <div className="flex h-10 items-center justify-between rounded-lg border bg-muted/20 px-3">
              <span className="text-sm text-muted-foreground">Registrada</span>
              <Checkbox
                checked={row.signed}
                onCheckedChange={(v) => onChange({ signed: Boolean(v) })}
                disabled={disabled}
              />
            </div>
          </Field>

          <Field label="Goles">
            <CounterField
              value={row.goals}
              disabled={disabled}
              onDecrease={() => onChange({ goals: Math.max(0, row.goals - 1) })}
              onIncrease={() => onChange({ goals: row.goals + 1 })}
              onValueChange={(value) => onChange({ goals: Math.max(0, Number(value || 0)) })}
            />
          </Field>

          <Field label="Amarillas">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => onChange({ yellowCards: Math.max(0, row.yellowCards - 1) })}
                disabled={disabled}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="inline-flex h-9 min-w-[84px] items-center justify-center rounded-lg border bg-amber-50 px-3 text-sm font-medium tabular-nums text-amber-700">
                <ShieldAlert className="mr-1 h-4 w-4" />
                {row.yellowCards}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => onChange({ yellowCards: row.yellowCards + 1 })}
                disabled={disabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Field>

          <Field label="ExpulsiÃ³n">
            <div className="flex h-10 items-center justify-between rounded-lg border bg-muted/20 px-3">
              <span className="text-sm text-muted-foreground">Tarjeta roja</span>
              <Switch
                checked={row.redCard}
                onCheckedChange={(v) => onChange({ redCard: v, redReason: v ? row.redReason : "" })}
                disabled={disabled}
              />
            </div>
          </Field>

          <Field label="Motivo">
            <Input
              value={row.redReason}
              onChange={(e) => onChange({ redReason: e.target.value })}
              className="h-10"
              placeholder="Motivo expulsiÃ³n"
              disabled={disabled || !row.redCard}
            />
          </Field>

          <Field className="sm:col-span-2" label="Observaciones">
            <Input
              value={row.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="h-10"
              placeholder="Observaciones"
              disabled={disabled}
            />
          </Field>
        </div>
      </div>

      <div className="hidden min-w-[1120px] grid-cols-[minmax(220px,1.4fr)_minmax(120px,0.7fr)_auto_minmax(120px,0.8fr)_auto_minmax(150px,0.8fr)_minmax(160px,1fr)_auto_auto_auto_minmax(200px,1fr)] items-center gap-3 rounded-xl border bg-background px-3 py-2 md:grid">
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

        <CounterField
          value={row.goals}
          disabled={disabled}
          onDecrease={() => onChange({ goals: Math.max(0, row.goals - 1) })}
          onIncrease={() => onChange({ goals: row.goals + 1 })}
          onValueChange={(value) => onChange({ goals: Math.max(0, Number(value || 0)) })}
        />

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
          placeholder="Motivo expulsiÃ³n"
          disabled={disabled || !row.redCard}
        />

        {row.redCard ? (
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              ExpulsiÃ³n
            </span>
          </div>
        ) : (
          <div />
        )}
      </div>
    </>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function CounterField({
  value,
  disabled,
  onDecrease,
  onIncrease,
  onValueChange,
}: {
  value: number;
  disabled: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-8 w-8 rounded-lg"
        onClick={onDecrease}
        disabled={disabled}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        value={String(value)}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-9 w-14 text-center tabular-nums"
        inputMode="numeric"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-8 w-8 rounded-lg"
        onClick={onIncrease}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
