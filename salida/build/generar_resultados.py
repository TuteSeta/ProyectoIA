"""Ejecuta neo4j/04_consultas.cypher bloque por bloque contra Neo4j y guarda las salidas reales en
salida/03_resultados_consultas.md.

Antes de correr: borra la base y carga 01→03 con `bash neo4j/cargar.sh --reset --base`.
Uso:  python salida/build/generar_resultados.py
"""
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONSULTAS = ROOT / "neo4j" / "04_consultas.cypher"
SALIDA = ROOT / "salida" / "03_resultados_consultas.md"
MARCADOR = re.compile(r"^// @paso (\d+) \| (\w+) \| ([^|]+) \| (.+)$")


def bloques():
    actual, out = None, []
    for linea in CONSULTAS.read_text(encoding="utf-8").splitlines():
        m = MARCADOR.match(linea)
        if m:
            if actual:
                out.append(actual)
            actual = dict(n=m.group(1), modo=m.group(2), caso=m.group(3).strip(), titulo=m.group(4).strip(), lineas=[])
        elif actual is not None:
            actual["lineas"].append(linea)
    if actual:
        out.append(actual)
    return out


def ejecutar(cypher):
    env = dict(os.environ, MSYS_NO_PATHCONV="1")
    p = subprocess.run(["docker", "exec", "-i", "-e", "LANG=C.UTF-8", "neo4j-carteleria", "cypher-shell",
                        "-u", "neo4j", "-p", "password", "--format", "plain"],
                       input=cypher.encode("utf-8"), capture_output=True, env=env)
    return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")


def solo_codigo(lineas):
    """Quita los comentarios de cabecera del bloque para mostrar solo la consulta."""
    cuerpo = [l for l in lineas if l.strip() and not l.lstrip().startswith("// -----")]
    return "\n".join(cuerpo).strip()


def main():
    bs = bloques()
    md = ["# 03 — Resultados reales de las consultas en Neo4j", "",
          f"Ejecutado el {datetime.now():%d/%m/%Y %H:%M} contra `neo4j:5.21.0` (contenedor `neo4j-carteleria`).",
          "Procedimiento: `bash neo4j/cargar.sh --reset --base` (borra la base y carga 01→03) y luego cada bloque",
          "`// @paso` de `neo4j/04_consultas.cypher`, en orden, con `cypher-shell --format plain`.",
          "Las salidas de abajo se copiaron tal cual las devolvió Neo4j (las sentencias de escritura sin `RETURN`",
          "no imprimen nada).", ""]
    errores = 0
    for b in bs:
        codigo = "\n".join(b["lineas"]).strip()
        rc, out, err = ejecutar(codigo + "\n")
        estado = "OK" if rc == 0 else "ERROR"
        errores += rc != 0
        print(f"paso {b['n']} [{b['modo']}] {estado}", file=sys.stderr)
        md += [f"## Paso {b['n']} — {b['titulo']}", "",
               f"*Caso:* {b['caso']} · *Modo en demo.sh:* `{b['modo']}` · *Ejecución:* {estado}", "",
               "<details><summary>Consulta</summary>", "", "```cypher", solo_codigo(b["lineas"]), "```", "", "</details>", "",
               "```text", (out.strip() or "(sin filas: sentencias de escritura)"), "```", ""]
        if err.strip():
            md += ["```text", err.strip(), "```", ""]
    SALIDA.write_text("\n".join(md), encoding="utf-8")
    print(f"{len(bs)} bloques, {errores} con error → {SALIDA}", file=sys.stderr)
    sys.exit(1 if errores else 0)


if __name__ == "__main__":
    main()
