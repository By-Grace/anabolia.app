import {
  BookOpenText, BowlFood, CaretLeft, CaretRight, Check, Fire, Heart, House, ListChecks,
  MagnifyingGlass, Minus, Pause, Play, Plus, SlidersHorizontal, User, X,
} from "@phosphor-icons/react/ssr";
import type { IconWeight } from "@phosphor-icons/react";

/**
 * Ícones Phosphor (MIT). Regra: "regular" no repouso, "fill" no estado ativo/selecionado, como o iOS.
 * Um único conjunto, um único traço — nada de glifos de texto no lugar de ícone.
 */
type P = { size?: number; weight?: IconWeight; className?: string };
const a = { "aria-hidden": true } as const;

export const HomeIcon = ({ size = 24, weight = "regular", className }: P) => <House size={size} weight={weight} className={className} {...a} />;
export const BookIcon = ({ size = 24, weight = "regular", className }: P) => <BookOpenText size={size} weight={weight} className={className} {...a} />;
export const ListIcon = ({ size = 24, weight = "regular", className }: P) => <ListChecks size={size} weight={weight} className={className} {...a} />;
export const PersonIcon = ({ size = 24, weight = "regular", className }: P) => <User size={size} weight={weight} className={className} {...a} />;
export const ChevronLeft = ({ size = 20, className }: P) => <CaretLeft size={size} weight="bold" className={className} {...a} />;
export const ChevronRight = ({ size = 20, className }: P) => <CaretRight size={size} weight="bold" className={className} {...a} />;
export const SearchIcon = ({ size = 18, className }: P) => <MagnifyingGlass size={size} weight="bold" className={className} {...a} />;
export const HeartIcon = ({ size = 22, filled, className }: P & { filled?: boolean }) => (
  <Heart size={size} weight={filled ? "fill" : "regular"} className={className} {...a} />
);
export const FlameIcon = ({ size = 16, className }: P) => <Fire size={size} weight="fill" className={className} {...a} />;
export const PlateIcon = ({ size = 48, className }: P) => <BowlFood size={size} weight="light" className={className} {...a} />;
export const FiltersIcon = ({ size = 20, className }: P) => <SlidersHorizontal size={size} weight="bold" className={className} {...a} />;
export const CloseIcon = ({ size = 14, className }: P) => <X size={size} weight="bold" className={className} {...a} />;
export const MinusIcon = ({ size = 16, className }: P) => <Minus size={size} weight="bold" className={className} {...a} />;
export const PlusIcon = ({ size = 16, className }: P) => <Plus size={size} weight="bold" className={className} {...a} />;
export const PlayIcon = ({ size = 18 }: { size?: number }) => <Play size={size} weight="fill" {...a} />;
export const PauseIcon = ({ size = 18 }: { size?: number }) => <Pause size={size} weight="fill" {...a} />;
export const CheckIcon = ({ size = 14 }: { size?: number }) => <Check size={size} weight="bold" {...a} />;
