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
  /** Peso em gramas da quantidade-base (preenchido pela tabela para un, dente, colher, ml). */
  grams: z.number().positive().optional(),
  /** Id em content/ingredients.json; obrigatório para tudo que não é "a gosto". */
  ref: z.string().min(1).optional(),
});

export const StepSchema = z.object({
  text: z.string().min(1),
  seconds: z.number().int().positive().optional(),
  ingredientHint: z.string().min(1).optional(),
});

const PerPortionSchema = z.object({
  kcal: z.number().nonnegative(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fat_g: z.number().nonnegative(),
});

export const RecipeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  slot: z.array(z.enum(MEAL_SLOTS)).min(1),
  minutes: z.number().int().positive(),
  difficulty: z.enum(["fácil", "médio"]),
  basePortions: z.number().int().min(1).max(8),
  perPortion: PerPortionSchema,
  ingredients: z.array(IngredientSchema).min(1),
  steps: z.array(StepSchema).min(1),
  photo: z.string().min(1).optional(),
  /** Origem da foto: "gerada" é placeholder a trocar por foto real antes do lançamento. */
  photoSource: z.enum(["gerada", "real"]).optional(),
  photoCredit: z.string().min(1).optional(),
  tip: z.string().min(1).optional(),
});

/** Como a receita vem do arquivo: macros são calculados pela tabela, então podem faltar. */
export const RecipeInputSchema = RecipeSchema.extend({ perPortion: PerPortionSchema.optional() });

export type Ingredient = z.infer<typeof IngredientSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
