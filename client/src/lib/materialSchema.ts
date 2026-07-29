import { z } from "zod";

export const MATERIAL_TYPES = ["video", "document", "drill", "tactic"] as const;
export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export const materialSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  type: z.enum(MATERIAL_TYPES),
  contentUrl: z.string().min(1, "URL requerida"),
  description: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES),
});
export type MaterialInput = z.infer<typeof materialSchema>;

export const quizQuestionSchema = z
  .object({
    questionText: z.string().min(1, "Pregunta requerida"),
    options: z.array(z.string().min(1, "Opción vacía")).min(2, "Mínimo 2 opciones").max(4, "Máximo 4 opciones"),
    correctIndex: z.number().int().min(0),
  })
  .refine((d) => d.correctIndex < d.options.length, {
    message: "La respuesta correcta debe ser una de las opciones",
    path: ["correctIndex"],
  });
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
