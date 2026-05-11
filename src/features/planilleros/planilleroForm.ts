import { z } from "zod";

export const planilleroSchema = z.object({
  name: z.string().min(3, "Ingresá el nombre completo"),
  username: z.string().min(3, "Ingresá el usuario"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  dni: z.string().optional().or(z.literal("")),
  status: z.enum(["activo", "inactivo"]),
});

export type PlanilleroFormValues = z.infer<typeof planilleroSchema>;

