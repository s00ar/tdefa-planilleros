import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PlanilleroLayout } from "@/layouts/PlanilleroLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { MatchSheetLayout } from "@/layouts/MatchSheetLayout";
import { RequireAuth } from "@/components/routing/RequireAuth";
import { RequireRole } from "@/components/routing/RequireRole";
import { AppLoaderScreen } from "@/components/system/AppLoaderScreen";
import { useAuthStore, useRole } from "@/store/auth.store";
import { LoginPage } from "@/pages/LoginPage";
import { AssignedMatchesPage } from "@/pages/planillero/AssignedMatchesPage";
import { MatchSheetPage } from "@/pages/planillero/MatchSheetPage";
import { AdminPlanillerosListPage } from "@/pages/admin/AdminPlanillerosListPage";
import { AdminPlanilleroCreatePage } from "@/pages/admin/AdminPlanilleroCreatePage";
import { AdminPlanilleroEditPage } from "@/pages/admin/AdminPlanilleroEditPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function RootRedirect() {
  const role = useRole();
  if (role === "admin") return <Navigate to="/admin/planilleros" replace />;
  return <Navigate to="/partidos" replace />;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return <AppLoaderScreen label="Preparando TDEFA Digital..." />;

  return (
    <TooltipProvider>
      <Toaster richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<RequireRole allowed={["planillero", "admin"]} />}>
              <Route element={<PlanilleroLayout />}>
                <Route path="/partidos" element={<AssignedMatchesPage />} />
              </Route>
            </Route>

            <Route element={<RequireRole allowed={["planillero"]} />}>
              <Route element={<MatchSheetLayout />}>
                <Route path="/partidos/:matchId/planilla" element={<MatchSheetPage />} />
              </Route>
            </Route>

            <Route element={<RequireRole allowed={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/planilleros" element={<AdminPlanillerosListPage />} />
                <Route path="/admin/planilleros/nuevo" element={<AdminPlanilleroCreatePage />} />
                <Route
                  path="/admin/planilleros/:planilleroId/editar"
                  element={<AdminPlanilleroEditPage />}
                />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

