import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="tdefa-page grid place-items-center px-6 py-12">
      <Card className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-soft">
        <div className="text-2xl font-semibold tracking-tight">404</div>
        <div className="mt-2 text-sm text-muted-foreground">La página no existe o fue movida.</div>
        <div className="mt-6">
          <Button asChild className="rounded-xl">
            <Link to="/">Ir al inicio</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

