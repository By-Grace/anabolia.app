import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipes/load";
import { CookMode } from "./CookMode";

export default async function CookPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const [{ slug }, { p }] = await Promise.all([params, searchParams]);
  const recipe = getRecipe(slug);
  if (!recipe) notFound();
  const portions = Number.parseInt(p ?? "", 10);
  return <CookMode recipe={recipe} portions={Number.isFinite(portions) ? portions : recipe.basePortions} />;
}
