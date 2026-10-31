import { notFound } from "next/navigation";
import { getRecipe, getRecipes } from "@/lib/recipes/load";
import { RecipeView } from "./RecipeView";
import { addToListAction } from "@/app/lista/actions";

export function generateStaticParams() {
  return getRecipes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRecipe(slug);
  return { title: r ? `${r.name} · Anaból[IA]` : "Receita · Anaból[IA]" };
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipe(slug);
  if (!recipe) notFound();
  return <RecipeView recipe={recipe} onAddToList={addToListAction} />;
}
