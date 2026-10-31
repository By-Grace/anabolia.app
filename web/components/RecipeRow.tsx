import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/lib/recipes/schema";
import { fmtInt } from "@/lib/format";
import { HeartIcon, PlateIcon } from "@/components/ui/icons";

export function RecipeRow({ recipe, favorite, onToggleFavorite }: {
  recipe: Recipe; favorite: boolean; onToggleFavorite: (slug: string) => void;
}) {
  return (
    <li data-testid="recipe-row" data-slug={recipe.slug} className="flex items-center gap-3 border-t border-hair py-2.5 first:border-t-0">
      <Link href={`/receitas/${recipe.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="relative size-14 flex-none overflow-hidden rounded-[10px] bg-soft">
          {recipe.photo ? (
            <Image src={recipe.photo} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-ring"><PlateIcon size={22} /></span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold leading-tight tracking-[-0.01em]">{recipe.name}</span>
          <span className="mt-0.5 block text-[13px] font-medium text-grey">{recipe.minutes} min · {recipe.difficulty}</span>
        </span>
        <span className="text-right">
          <span className="num block text-base font-bold">{fmtInt(recipe.perPortion.protein_g)} g</span>
          <span className="num block text-xs text-grey">{fmtInt(recipe.perPortion.kcal)} kcal</span>
        </span>
      </Link>
      <button type="button" onClick={() => onToggleFavorite(recipe.slug)}
        aria-label={`${favorite ? "Remover dos favoritos" : "Favoritar"} ${recipe.name}`}
        aria-pressed={favorite}
        className={"grid size-10 flex-none place-items-center rounded-full " + (favorite ? "text-acc" : "text-ring")}>
        <HeartIcon size={22} filled={favorite} />
      </button>
    </li>
  );
}
