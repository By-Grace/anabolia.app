import { z } from "zod";

export const MEAL_SLOTS = ["cafe", "almoco", "lanche", "jantar"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  cafe: "Café",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
};

export const UNITS = ["g", "ml", "un", "dente", "colher", "a gosto"] as const;

export const IngredientSchema = z.object({
  name: z.string().min(1),
  qty: z.number().min(0),
  unit: z.enum(UNITS),
});

export const StepSchema = z.object({
  text: z.string().min(1),
  seconds: z.number().int().positive().optional(),
  ingredientHint: z.string().min(1).optional(),
});

export const RecipeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  slot: z.array(z.enum(MEAL_SLOTS)).min(1),
  minutes: z.number().int().positive(),
  difficulty: z.enum(["fácil", "médio"]),
  basePortions: z.number().int().min(1).max(8),
  perPortion: z.object({
    kcal: z.number().nonnegative(),
    protein_g: z.number().nonnegative(),
    carbs_g: z.number().nonnegative(),
    fat_g: z.number().nonnegative(),
  }),
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(StepSchema).min(1),
  photo: z.string().min(1).optional(),
  tip: z.string().min(1).optional(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
