import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "@/store/auth.store";
import type { UserRole } from "@/types/auth";

export function RequireRole({ allowed }: { allowed: UserRole[] }) {
  const role = useRole();
  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

