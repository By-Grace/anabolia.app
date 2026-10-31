# Junta os CSVs do mapeamento (docs/conteudo/catalogo-pesquisa/*.csv), remove duplicatas entre frentes
# e gera docs/conteudo/catalogo-receitas.csv e .md.
#   python3 web/scripts/catalogo-merge.py
import csv, os, re, sys, unicodedata
from collections import Counter, defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "docs", "conteudo", "catalogo-pesquisa")
OUT_CSV = os.path.join(ROOT, "docs", "conteudo", "catalogo-receitas.csv")
OUT_MD = os.path.join(ROOT, "docs", "conteudo", "catalogo-receitas.md")

COLS = ["nome", "categoria", "refeicoes", "proteina_principal", "ingredientes_porcao", "proteina_g_est", "kcal_est",
        "tempo_min", "metodo", "origem", "fonte_nome", "fonte_url", "popularidade", "evidencia", "ajuste_meta",
        "ja_no_app", "observacoes"]
STOP = {"de", "da", "do", "das", "dos", "com", "e", "ao", "a", "o", "na", "no", "em", "fit", "proteico", "proteica",
        "caseiro", "caseira", "light", "saudavel", "rapido", "rapida", "facil", "reforcado", "reforcada", "simples",
        "versao", "estilo", "tipo", "receita", "sem", "para"}
RANK = {"A": 0, "B": 1, "C": 2}
# Duplicatas entre frentes que a comparação por palavras não pega (revisão manual em 31/10).
# Fica a versão com evidência maior ou mais completa; sai esta.
DROP = {
    ("internacional", "Frango à parmegiana de forno"),            # = frango: Filé de frango à parmegiana sem fritura
    ("lanches", "Kafta no pão sírio com molho de iogurte"),       # = internacional: Kafta de patinho com pão sírio e coalhada
    ("internacional", "Almôndegas ao sugo com espaguete"),        # = carnes: Almôndegas ao molho de tomate
    ("carnes", "Porco agridoce"),                                 # = internacional: Lombo suíno agridoce
    ("frango", "Peito de frango caprese"),                        # = internacional: Frango caprese de forno com batata
    ("internacional", "Frango ao gengibre com brócolis"),         # = frango: Frango com gengibre e shoyu
    ("internacional", "Frango com mostarda e mel e batatas"),     # = frango: Filé de frango com mostarda e mel
    ("lanches", "Quesadilla de frango com feijão"),               # = internacional: Quesadilla reforçada de frango
    ("lanches", "Tacos de carne moída"),                          # = internacional: Tacos de carne moída na frigideira com Rap10
    ("lanches", "Nuggets caseiros de frango na airfryer"),        # = frango: Nuggets caseiros de frango com purê
    ("peixes", "Cuscuz de sardinha"),                             # = regional: Cuscuz paulista com sardinha e frango
}


def fold(s):
    return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()


def tokens(name):
    return {t for t in re.findall(r"[a-z0-9]+", fold(name)) if t not in STOP and len(t) > 1}


def num(v):
    m = re.search(r"\d+(?:[.,]\d+)?", v or "")
    return float(m.group(0).replace(",", ".")) if m else None


def load():
    rows = []
    for f in sorted(os.listdir(SRC)):
        if not f.endswith(".csv"):
            continue
        with open(os.path.join(SRC, f), newline="", encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                r = {k.strip(): (v or "").strip() for k, v in r.items() if k}
                if not r.get("nome"):
                    continue
                r["_frente"] = f[:-4]
                if (r["_frente"], r["nome"]) in DROP:
                    continue
                r["evidencia"] = (r.get("evidencia") or "C").upper()[:1]
                rows.append(r)
    return rows


def dedupe(rows):
    rows.sort(key=lambda r: (RANK.get(r["evidencia"], 3), -(num(r.get("proteina_g_est")) or 0)))
    kept, dups = [], 0
    for r in rows:
        t = tokens(r["nome"])
        twin = None
        for k in kept:
            kt = k["_tokens"]
            if t and kt and len(t & kt) / len(t | kt) >= 0.75:
                twin = k
                break
        if twin:
            dups += 1
            extra = f'{r["fonte_nome"]}: {r["popularidade"]}'.strip(": ")
            if extra and extra not in twin["popularidade"]:
                twin["popularidade"] = f'{twin["popularidade"]} · {extra}'.strip(" ·")
            continue
        r["_tokens"] = t
        kept.append(r)
    return kept, dups


def main():
    rows = load()
    if not rows:
        sys.exit(f"nenhum CSV em {SRC}")
    kept, dups = dedupe(rows)
    kept.sort(key=lambda r: (r["_frente"], RANK.get(r["evidencia"], 3), fold(r["nome"])))

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["frente"] + COLS)
        w.writeheader()
        for r in kept:
            w.writerow({"frente": r["_frente"], **{c: r.get(c, "") for c in COLS}})

    novos = [r for r in kept if fold(r.get("ja_no_app")) == "nao"]
    parecidas = sum(1 for r in kept if fold(r.get("ja_no_app")) == "parecida")
    by_front = Counter(r["_frente"] for r in novos)
    by_ev = Counter(r["evidencia"] for r in novos)
    by_slot = Counter(s for r in novos for s in r.get("refeicoes", "").split("|") if s)
    by_prot = Counter(r.get("proteina_principal", "?") for r in novos)

    L = ["# Catálogo de receitas mapeadas", "",
         f"Gerado por `web/scripts/catalogo-merge.py` a partir de `docs/conteudo/catalogo-pesquisa/`. "
         f"{len(rows)} linhas brutas, {dups} duplicatas entre frentes removidas (mais {len(DROP)} na revisão manual), **{len(kept)} pratos distintos**. "
         f"Desses, **{len(novos)} são novos**, {parecidas} são parecidos com algo do app e o resto já está nele.", "",
         "Proteína e calorias são estimativas da pesquisa (TACO, porção ajustada à meta). Toda receita passa pela calculadora "
         "do app antes de entrar. Evidência: A forte, B moderada, C fraca.", "",
         "## Resumo dos novos (fora os parecidos com o app)", "",
         "| Frente | Pratos |", "|---|---|", *[f"| {k} | {v} |" for k, v in sorted(by_front.items())], "",
         "| Evidência | Pratos |", "|---|---|", *[f"| {k} | {v} |" for k, v in sorted(by_ev.items())], "",
         "| Refeição | Pratos (contando cada refeição possível) |", "|---|---|", *[f"| {k} | {v} |" for k, v in by_slot.most_common()], "",
         "| Proteína principal | Pratos |", "|---|---|", *[f"| {k} | {v} |" for k, v in by_prot.most_common()], ""]
    groups = defaultdict(list)
    for r in kept:
        groups[r["_frente"]].append(r)
    for front, rs in sorted(groups.items()):
        L += [f"## {front} ({len(rs)})", "", "| Prato | Refeições | Proteína | kcal | Min | Evid. | No app | Fonte |", "|---|---|---|---|---|---|---|---|"]
        for r in rs:
            fonte = f'[{r["fonte_nome"] or "link"}]({r["fonte_url"]})' if r.get("fonte_url", "").startswith("http") else r.get("fonte_nome", "")
            L.append(f'| {r["nome"]} | {r.get("refeicoes","").replace("|", ", ")} | {r.get("proteina_g_est","")} g | {r.get("kcal_est","")} | '
                     f'{r.get("tempo_min","")} | {r["evidencia"]} | {r.get("ja_no_app","")} | {fonte} |')
        L.append("")
    with open(OUT_MD, "w", encoding="utf-8") as fh:
        fh.write("\n".join(L))
    print(f"{len(rows)} brutas · {dups} duplicatas automáticas + {len(DROP)} manuais · {len(kept)} distintas · {len(novos)} novas · {parecidas} parecidas")
    print("frentes:", dict(by_front))
    print("evidência:", dict(by_ev))
    print("refeições:", dict(by_slot))


if __name__ == "__main__":
    main()
