/**
 * Pílulas de progresso de um fluxo em passos (modo cozinhar, cadastro): laranja até o passo atual,
 * contador "N/total" em rounded cinza e o anúncio "Passo N de total" para leitor de tela.
 * `current` começa em 0.
 */
export function StepPills({ total, current }: { total: number; current: number }) {
  return (
    <>
      <div className="flex flex-1 items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, k) => (
            <i key={k} data-testid="pill" data-on={k <= current}
              className={"h-1.5 flex-1 rounded-full transition-colors duration-300 " + (k <= current ? "bg-acc" : "bg-track")} />
          ))}
        </div>
        <span aria-hidden="true" className="num flex-none text-[13px] font-semibold text-grey">{current + 1}/{total}</span>
      </div>
      <p className="sr-only" aria-live="polite">Passo {current + 1} de {total}</p>
    </>
  );
}
