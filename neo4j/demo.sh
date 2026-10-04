#!/usr/bin/env bash
# demo.sh — Demo en vivo: ejecuta las consultas de 04_consultas.cypher de a una, con título y pausa.
#
# Uso:
#   bash neo4j/demo.sh               # demo corta (pasos marcados «corta»; ~3 min)
#   bash neo4j/demo.sh --completa    # muestra también los pasos «extra»
#   bash neo4j/demo.sh --sin-pausa   # sin esperar Enter (para probar o grabar)
#   bash neo4j/demo.sh --no-reset    # no recarga la base antes de empezar
#
# Antes de mostrar nada recarga la base al estado previo a las reglas (01→03), así las reglas se ven
# disparar en vivo. Los pasos «silencio» se ejecutan igual (son necesarios), mostrando solo una línea.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTENEDOR="neo4j-carteleria"
export MSYS_NO_PATHCONV=1

MODO="corta"; PAUSA=1; RESET=1
for a in "$@"; do
  case "$a" in
    --completa)  MODO="completa" ;;
    --sin-pausa) PAUSA=0 ;;
    --no-reset)  RESET=0 ;;
    *) echo "Opción desconocida: $a"; exit 1 ;;
  esac
done

B=$'\e[1m'; D=$'\e[2m'; C=$'\e[36m'; M=$'\e[35m'; G=$'\e[32m'; R=$'\e[0m'

pausa() { [ "$PAUSA" -eq 1 ] && read -r -p "${D}  [Enter] $1${R}" _ || true; }
cypher() { docker exec -i -e LANG=C.UTF-8 "$CONTENEDOR" cypher-shell -u neo4j -p password --format "$1"; }

clear 2>/dev/null || true
echo "${B}${M}Asistente para Evaluación Técnica y Rediseño de Cartelería — Grupo 11${R}"
echo "${D}Neo4j 5.21 · red semántica + frames + reglas · modo: $MODO${R}"
echo

if [ "$RESET" -eq 1 ]; then
  echo "${C}→ Recargando la base al estado inicial de los casos (01 esquema, 02 modelo, 03 instancias)…${R}"
  bash "$DIR/cargar.sh" --reset --base | grep -E "Cargando|frames|^[0-9]" | sed 's/^/   /'
  echo
fi

# Separar 04_consultas.cypher en bloques por marcador «// @paso NN | modo | caso | título»
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
awk -v dir="$TMP" '
  /^\/\/ @paso / { n++; f = sprintf("%s/%02d.cypher", dir, n); print $0 > f; next }
  n > 0 { print $0 >> f }
' "$DIR/04_consultas.cypher"

for f in "$TMP"/*.cypher; do
  cab="$(head -n1 "$f")"
  num="$(echo "$cab" | awk -F'|' '{gsub(/.*@paso /,"",$1); gsub(/ /,"",$1); print $1}')"
  modo="$(echo "$cab" | awk -F'|' '{gsub(/ /,"",$2); print $2}')"
  caso="$(echo "$cab" | awk -F'|' '{gsub(/^ +| +$/,"",$3); print $3}')"
  titulo="$(echo "$cab" | awk -F'|' '{gsub(/^ +| +$/,"",$4); print $4}')"

  mostrar=0
  [ "$modo" = "corta" ] && mostrar=1
  [ "$modo" = "extra" ] && [ "$MODO" = "completa" ] && mostrar=1

  if [ "$mostrar" -eq 0 ]; then
    tail -n +2 "$f" | cypher plain >/dev/null
    echo "${D}  · paso $num aplicado: $titulo${R}"
    continue
  fi

  echo
  echo "${B}${C}━━━ Paso $num · $caso ━━━${R}"
  echo "${B}$titulo${R}"
  # comentario «Esperado:» del bloque, si lo tiene
  grep -E '^// (Caso de uso|Esperado)' "$f" | sed 's#^// #  #' | sed "s/^/${D}/;s/\$/${R}/" || true
  echo "${D}  ── consulta ──${R}"
  tail -n +2 "$f" | grep -vE '^\s*//' | grep -vE '^\s*$' | head -n 14 | sed "s/^/${D}  │ /;s/\$/${R}/"
  [ "$(tail -n +2 "$f" | grep -vE '^\s*//' | grep -vcE '^\s*$')" -gt 14 ] && echo "${D}  │ …${R}"
  pausa "ejecutar"
  echo "${G}  ── resultado ──${R}"
  tail -n +2 "$f" | cypher verbose | grep -v "ready to start consuming" | sed "s/^/  /"
  pausa "siguiente"
done

echo
echo "${B}${G}✓ Fin de la demo.${R} Para explorar el grafo: http://localhost:7474 (neo4j / password)"
echo "${D}  Consultas visuales sugeridas: ver el final de neo4j/04_consultas.cypher y salida/guion_demo.md${R}"
