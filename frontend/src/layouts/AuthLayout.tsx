import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="tdefa-page flex min-h-dvh items-center justify-center overflow-hidden bg-[#f5f6f8] px-4 py-8">
      <div className="w-full max-w-[400px]">
        <Outlet />

        <div className="mx-auto mt-[24px] h-px w-[76px] bg-[#7b0000]/35" />
      </div>
    </div>
  );
}
