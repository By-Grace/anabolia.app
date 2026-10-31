import type { Recipe, MealSlot } from "@/lib/recipes/schema";

export function fakeRecipe(slug: string, protein_g: number, slot: MealSlot[] = ["almoco", "jantar"], extra: Partial<Recipe> = {}): Recipe {
  return {
    slug,
    name: slug,
    slot,
    minutes: 20,
    difficulty: "fácil",
    basePortions: 1,
    perPortion: { kcal: protein_g * 14, protein_g, carbs_g: 40, fat_g: 15 },
    ingredients: [{ name: "x", qty: 100, unit: "g" }],
    steps: [{ text: "passo" }],
    ...extra,
  };
}

/**
 * Cardápio de teste congelado (as 3 receitas de demonstração com os números originais).
 * Testes de lógica usam isto, não o conteúdo real, para não quebrar quando o cardápio crescer.
 */
export const demoMenu: Recipe[] = [
  {
    "slug": "bowl-carne-batata-doce",
    "name": "Bowl de carne com batata-doce",
    "slot": [
      "almoco",
      "jantar"
    ],
    "minutes": 25,
    "difficulty": "fácil",
    "basePortions": 2,
    "ingredients": [
      {
        "name": "patinho moído",
        "qty": 400,
        "unit": "g"
      },
      {
        "name": "batata-doce",
        "qty": 400,
        "unit": "g"
      },
      {
        "name": "feijão cozido",
        "qty": 200,
        "unit": "g"
      },
      {
        "name": "cebola",
        "qty": 1,
        "unit": "un"
      },
      {
        "name": "alho",
        "qty": 2,
        "unit": "dente"
      },
      {
        "name": "azeite",
        "qty": 15,
        "unit": "ml"
      },
      {
        "name": "sal e cominho",
        "qty": 0,
        "unit": "a gosto"
      }
    ],
    "steps": [
      {
        "text": "Descasque a batata-doce, corte em cubos e cozinhe em água com sal até ficar macia.",
        "seconds": 600,
        "ingredientHint": "batata-doce · 400 g"
      },
      {
        "text": "Enquanto isso, pique a cebola e o alho."
      },
      {
        "text": "Doure a cebola e o alho no azeite."
      },
      {
        "text": "Junte a carne e deixe dourar bem antes de mexer.",
        "seconds": 300,
        "ingredientHint": "patinho moído · 400 g · fogo alto"
      },
      {
        "text": "Tempere com sal e cominho e junte o feijão para aquecer."
      },
      {
        "text": "Monte o bowl: batata-doce, carne com feijão por cima."
      }
    ],
    "photo": "/recipes/bowl-carne-batata-doce.webp",
    "tip": "Carne só vira crosta se você deixar ela quieta.",
    "photoSource": "gerada",
    "photoCredit": "Brand Kit v1 (01/09/2026). Placeholder: trocar por foto real antes do lançamento.",
    "perPortion": {
      "kcal": 680,
      "protein_g": 45,
      "carbs_g": 62,
      "fat_g": 24
    }
  },
  {
    "slug": "frango-crocante-arroz-tostado",
    "name": "Frango crocante com arroz tostado",
    "slot": [
      "almoco",
      "jantar"
    ],
    "minutes": 22,
    "difficulty": "fácil",
    "basePortions": 2,
    "ingredients": [
      {
        "name": "peito de frango",
        "qty": 400,
        "unit": "g"
      },
      {
        "name": "arroz cozido",
        "qty": 300,
        "unit": "g"
      },
      {
        "name": "farinha de rosca",
        "qty": 40,
        "unit": "g"
      },
      {
        "name": "ovo",
        "qty": 1,
        "unit": "un"
      },
      {
        "name": "alho",
        "qty": 2,
        "unit": "dente"
      },
      {
        "name": "azeite",
        "qty": 15,
        "unit": "ml"
      },
      {
        "name": "sal e pimenta",
        "qty": 0,
        "unit": "a gosto"
      }
    ],
    "steps": [
      {
        "text": "Corte o frango em filés finos e tempere com sal, pimenta e o alho amassado."
      },
      {
        "text": "Bata o ovo num prato fundo. Passe cada filé no ovo e depois na farinha de rosca, apertando bem."
      },
      {
        "text": "Sele o frango 3 minutos de cada lado. Não mexa até formar a crosta.",
        "seconds": 180,
        "ingredientHint": "peito de frango · 400 g · fogo alto"
      },
      {
        "text": "Tire o frango e deixe descansar numa tábua enquanto prepara o arroz."
      },
      {
        "text": "Na mesma frigideira, coloque o arroz cozido e espalhe numa camada fina.",
        "ingredientHint": "arroz cozido · 300 g"
      },
      {
        "text": "Deixe tostar sem mexer até o fundo ficar dourado.",
        "seconds": 240,
        "ingredientHint": "fogo médio"
      },
      {
        "text": "Fatie o frango e sirva por cima do arroz tostado."
      }
    ],
    "photo": "/recipes/frango-crocante-arroz-tostado.webp",
    "tip": "Comece pela crosta. O resto vai sozinho.",
    "photoSource": "gerada",
    "photoCredit": "Brand Kit v1 (01/09/2026). Placeholder: trocar por foto real antes do lançamento.",
    "perPortion": {
      "kcal": 610,
      "protein_g": 42,
      "carbs_g": 58,
      "fat_g": 21
    }
  },
  {
    "slug": "tapioca-frango-omelete",
    "name": "Tapioca de frango com omelete",
    "slot": [
      "cafe",
      "lanche"
    ],
    "minutes": 12,
    "difficulty": "fácil",
    "basePortions": 1,
    "ingredients": [
      {
        "name": "goma de tapioca",
        "qty": 60,
        "unit": "g"
      },
      {
        "name": "frango desfiado",
        "qty": 80,
        "unit": "g"
      },
      {
        "name": "ovo",
        "qty": 2,
        "unit": "un"
      },
      {
        "name": "queijo minas",
        "qty": 30,
        "unit": "g"
      },
      {
        "name": "mamão",
        "qty": 150,
        "unit": "g"
      },
      {
        "name": "sal",
        "qty": 0,
        "unit": "a gosto"
      }
    ],
    "steps": [
      {
        "text": "Espalhe a goma numa frigideira antiaderente fria e leve ao fogo médio até firmar.",
        "seconds": 90,
        "ingredientHint": "goma de tapioca · 60 g"
      },
      {
        "text": "Vire, recheie com o frango e o queijo e dobre ao meio."
      },
      {
        "text": "Bata os ovos com sal e faça o omelete na mesma frigideira.",
        "seconds": 120,
        "ingredientHint": "ovo · 2 un"
      },
      {
        "text": "Sirva com o mamão cortado."
      }
    ],
    "photo": "/recipes/tapioca-frango-omelete.webp",
    "photoSource": "gerada",
    "photoCredit": "Brand Kit v1 (01/09/2026). Placeholder: trocar por foto real antes do lançamento.",
    "perPortion": {
      "kcal": 520,
      "protein_g": 38,
      "carbs_g": 48,
      "fat_g": 18
    }
  }
] as Recipe[];

export const demo = (slug: string) => demoMenu.find((r) => r.slug === slug)!;
