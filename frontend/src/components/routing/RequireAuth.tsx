import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthed } from "@/store/auth.store";
import { AppLoaderScreen } from "@/components/system/AppLoaderScreen";

export function RequireAuth() {
  const authed = useIsAuthed();
  const location = useLocation();

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequireAuthedHydrated({ hydrated }: { hydrated: boolean }) {
  if (!hydrated) return <AppLoaderScreen label="Cargando sesión..." />;
  return <Outlet />;
}

