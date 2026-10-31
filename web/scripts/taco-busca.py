# Busca na TACO local: python3 scripts/taco-busca.py "frango peito" "arroz cozido"
import csv, sys, unicodedata
def fold(s): return unicodedata.normalize("NFD", s).encode("ascii","ignore").decode().lower()
import json, os
rows=[{"numero_alimento":k,"descricao":v["descricao"],"energia_kcal":v["kcal"] if v["kcal"] is not None else "","proteina_g":v["protein_g"] if v["protein_g"] is not None else "","carboidrato_g":v["carbs_g"] if v["carbs_g"] is not None else "","lipideos_g":v["fat_g"] if v["fat_g"] is not None else ""} for k,v in json.load(open(os.path.join(os.path.dirname(__file__),"..","content","taco","taco.json")))["alimentos"].items()]
for q in sys.argv[1:]:
    terms=fold(q).split()
    hits=[r for r in rows if all(t in fold(r["descricao"]) for t in terms)]
    print(f"## {q}")
    for r in hits[:8]:
        f=lambda k: (f"{float(r[k]):.1f}" if r[k] not in ("","NA") else "-")
        print(f"  #{r['numero_alimento']:>3} {r['descricao'][:60]:60} kcal {f('energia_kcal'):>6} P {f('proteina_g'):>5} C {f('carboidrato_g'):>5} G {f('lipideos_g'):>5}")
