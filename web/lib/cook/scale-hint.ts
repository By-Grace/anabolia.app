/** Escala quantidades dentro de uma dica de passo ("peito de frango · 400 g · fogo alto"). */
export function scaleHint(hint: string, factor: number): string {
  if (factor === 1) return hint;
  return hint.replace(/(\d+(?:[.,]\d+)?)\s*(g|ml|un)\b/g, (_, n: string, unit: string) => {
    const v = Number(n.replace(",", ".")) * factor;
    return `${Math.max(1, Math.round(v))} ${unit}`;
  });
}
