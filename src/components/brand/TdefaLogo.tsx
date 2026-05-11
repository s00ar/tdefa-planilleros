import { cn } from "@/lib/utils";

export function TdefaLogo({
  className,
  size = 44,
  variant = "shield",
}: {
  className?: string;
  size?: number;
  variant?: "shield" | "wordmark";
}) {
  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <TdefaLogo size={28} />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-primary">
            TDEFA <span className="text-foreground">Digital</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Tactical Operations</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-2xl border bg-gradient-to-b from-primary/95 to-primary shadow-soft",
        className
      )}
      style={{ width: size, height: size }}
      aria-label="TDEFA"
    >
      <div className="absolute inset-1 rounded-xl border border-white/15" />
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 64 64"
        fill="none"
        className="relative"
        aria-hidden="true"
      >
        <path
          d="M32 3c10 7 21 6 29 7v22c0 18-12 28-29 29C15 60 3 50 3 32V10c8-1 19 0 29-7Z"
          fill="rgba(255,255,255,.10)"
          stroke="rgba(255,255,255,.25)"
          strokeWidth="2"
        />
        <path
          d="M18 22h28v7H18v-7Zm0 11h28v7H18v-7Z"
          fill="rgba(255,255,255,.85)"
        />
        <path
          d="M24 49c2-6 14-6 16 0-6 2-10 2-16 0Z"
          fill="rgba(255,255,255,.85)"
        />
      </svg>
    </div>
  );
}

