import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Lock, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const schema = z.object({
  username: z.string().min(2, "Ingresa el usuario"),
  password: z.string().min(3, "Ingresa la contraseña"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const session = useAuthStore((s) => s.session);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (!session) return;
    navigate(session.user.role === "admin" ? "/admin/planilleros" : "/partidos", { replace: true });
  }, [navigate, session]);

  const usernameError = form.formState.errors.username?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <div className="box-border w-full rounded-[7px] bg-[#ffffff] px-[23px] pb-[28px] pt-[26px] shadow-none">
      <div className="flex flex-col items-center text-center">
        <img
          src="/logo_1.png"
          alt="TDEFA Futbol"
          className="h-auto w-[112px] drop-shadow-[0_8px_16px_rgba(48,0,0,0.06)]"
        />
        <h1 className="mt-[20px] font-heading text-[22px] font-extrabold leading-[27px] tracking-normal text-[#793636]">
          Acceso Planilleros
        </h1>
        <p className="mt-[3px] text-[11px] leading-[16px] text-[#5d5855]">
          Gestión táctica de torneos amateurs
        </p>
      </div>

      <form
        className="mt-[28px] flex flex-col"
        onSubmit={form.handleSubmit(async (values) => {
          setAuthError(null);
          try {
            const nextSession = await login(values.username, values.password);
            toast.success("Sesión iniciada", {
              description: `Bienvenido/a, ${nextSession.user.name}.`,
            });
            navigate(nextSession.user.role === "admin" ? "/admin/planilleros" : "/partidos", {
              replace: true,
            });
          } catch {
            setAuthError("Credenciales incorrectas. Verifique sus datos.");
          }
        })}
      >
        <div>
          <label className="block text-left text-[10px] font-semibold leading-[12px] text-[#4b4b4b]">
            Usuario o Email
          </label>
          <div className="relative mt-[6px]">
            <User className="pointer-events-none absolute left-[15px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#a49793]" />
            <Input
              {...form.register("username", {
                onChange: () => {
                  if (authError) setAuthError(null);
                },
              })}
              aria-invalid={Boolean(usernameError)}
              className="box-border h-[46px] rounded-[2px] border-transparent bg-[#e5e6e8] pl-[38px] pr-[12px] text-[12px] text-[#4b4b4b] shadow-none placeholder:text-[#b9afab] focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-[inset_0_-2px_0_0_rgba(105,0,0,0.95)] md:text-[12px]"
              placeholder="ej. pilar_admin"
            />
          </div>
          {usernameError ? <div className="mt-1 text-left text-[10px] text-destructive">{usernameError}</div> : null}
        </div>

        <div className="mt-[17px]">
          <label className="block text-left text-[10px] font-semibold leading-[12px] text-[#4b4b4b]">
            Contraseña
          </label>
          <div className="relative mt-[6px]">
            <Lock className="pointer-events-none absolute left-[15px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#a49793]" />
            <Input
              {...form.register("password", {
                onChange: () => {
                  if (authError) setAuthError(null);
                },
              })}
              type="password"
              aria-invalid={Boolean(passwordError)}
              className="box-border h-[46px] rounded-[2px] border-transparent bg-[#e5e6e8] pl-[38px] pr-[12px] text-[12px] text-[#4b4b4b] shadow-none placeholder:text-[#b9afab] focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-[inset_0_-2px_0_0_rgba(105,0,0,0.95)] md:text-[12px]"
              placeholder="........"
            />
          </div>
          {passwordError ? <div className="mt-1 text-left text-[10px] text-destructive">{passwordError}</div> : null}
        </div>

        {authError ? (
          <div className="mt-[18px] flex min-h-[30px] items-center gap-[7px] rounded-[2px] border border-[#ffd8d3] bg-[#fff5f3] px-[8px] py-[7px] text-[10px] font-semibold leading-[12px] text-[#dc3428]">
            <CircleAlert className="h-[12px] w-[12px] shrink-0" />
            <div>{authError}</div>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "box-border h-[52px] w-full gap-[10px] rounded-[2px] border-0 bg-[#5f0000] text-[13px] font-bold tracking-normal text-[#ffffff] shadow-none transition hover:bg-[#6d0000] active:translate-y-px [&_svg]:text-[#ffffff]",
            authError ? "mt-[18px]" : "mt-[24px]"
          )}
        >
          <span>{loading ? "Ingresando..." : "Ingresar"}</span>
          <LogIn className="h-[15px] w-[15px]" />
        </Button>

        <div className="mt-[22px] flex items-center justify-between gap-4 text-[10px] leading-[12px]">
          <button
            type="button"
            className="appearance-none border-0 bg-transparent p-0 font-medium text-[#d25b4f] transition hover:text-[#6d0000]"
          >
            ¿Olvidó su contraseña?
          </button>
          <div className="flex items-center gap-[6px] uppercase tracking-[0.12em] text-[#555555]">
            <span className="block h-[4px] w-[4px] shrink-0 rounded-full bg-[#6f1111]" />
            <span className="text-[9px]">Sistema en línea</span>
          </div>
        </div>
      </form>
    </div>
  );
}
