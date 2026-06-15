import { z } from "zod";

export const CATEGORIES = ["sub8", "sub12", "sub14", "sub16", "sub18", "mayores"] as const;
export const RELATIONSHIPS = ["self", "hijo", "hija", "otro"] as const;

export const titularSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().min(7, "Teléfono requerido"),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  address: z.string().optional(),
});
export type TitularInput = z.infer<typeof titularSchema>;

export const playerProfileSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  relationshipToTitular: z.enum(RELATIONSHIPS),
  category: z.enum(CATEGORIES),
  dateOfBirth: z.string().min(1, "Fecha de nacimiento requerida"),
  gender: z.string().optional(),
  position: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  secondaryContactName: z.string().optional(),
  secondaryContactPhone: z.string().optional(),
  secondaryContactRelation: z.string().optional(),
});
export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;
