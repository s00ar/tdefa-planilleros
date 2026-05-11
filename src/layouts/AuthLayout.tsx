import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="tdefa-page flex min-h-dvh items-center justify-center overflow-hidden bg-[#f5f6f8] px-4 py-8">
      <div className="w-full max-w-[400px]">
        <Outlet />

        <div className="mt-[21px] text-center text-[11px] leading-none text-[#636363]">
          ¿Necesita ayuda técnica?{" "}
          <button
            type="button"
            className="appearance-none border-0 bg-transparent p-0 font-semibold text-[#333333] transition hover:text-[#6d0000]"
          >
            Contactar Soporte
          </button>
        </div>

        <div className="mx-auto mt-[24px] h-px w-[76px] bg-[#7b0000]/35" />
      </div>
    </div>
  );
}
