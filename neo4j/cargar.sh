#!/usr/bin/env bash
# cargar.sh — Levanta Neo4j 5.21.0 en Docker (si hace falta), espera a que responda y carga los scripts.
#
# Uso:
#   bash neo4j/cargar.sh            # crea/arranca el contenedor y carga 01→04 (base completa, ya inferida)
#   bash neo4j/cargar.sh --reset    # además borra toda la base antes de cargar
#   bash neo4j/cargar.sh --base     # carga solo 01→03 (estado previo a las reglas; lo usa demo.sh)
#
# Funciona en Linux, macOS y Git Bash (Windows).
set -euo pipefail

CONTENEDOR="neo4j-carteleria"
IMAGEN="neo4j:5.21.0"
USUARIO="neo4j"
CLAVE="password"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export MSYS_NO_PATHCONV=1   # evita que Git Bash reescriba rutas en los argumentos de docker

RESET=0; SOLO_BASE=0
for a in "$@"; do
  case "$a" in
    --reset) RESET=1 ;;
    --base)  SOLO_BASE=1 ;;
    *) echo "Opción desconocida: $a"; exit 1 ;;
  esac
done

cypher() {  # ejecuta un archivo o stdin con cypher-shell dentro del contenedor
  docker exec -i -e LANG=C.UTF-8 "$CONTENEDOR" cypher-shell -u "$USUARIO" -p "$CLAVE" --format plain "$@"
}

# 1. Contenedor
if ! docker info >/dev/null 2>&1; then
  echo "✗ Docker no responde. Abrí Docker Desktop y volvé a intentar."; exit 1
fi
if [ -z "$(docker ps -a -q -f name="^${CONTENEDOR}$")" ]; then
  echo "→ Creando contenedor $CONTENEDOR ($IMAGEN)…"
  docker run -d --name "$CONTENEDOR" \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH="$USUARIO/$CLAVE" -e LANG=C.UTF-8 \
    "$IMAGEN" >/dev/null
elif [ -z "$(docker ps -q -f name="^${CONTENEDOR}$")" ]; then
  echo "→ Arrancando contenedor existente $CONTENEDOR…"
  docker start "$CONTENEDOR" >/dev/null
else
  echo "→ Contenedor $CONTENEDOR ya está corriendo."
fi

# 2. Esperar a que Neo4j acepte conexiones (máx. ~120 s)
echo -n "→ Esperando a Neo4j"
for i in $(seq 1 60); do
  if echo "RETURN 1;" | cypher >/dev/null 2>&1; then echo " listo."; break; fi
  echo -n "."; sleep 2
  if [ "$i" -eq 60 ]; then echo; echo "✗ Neo4j no respondió a tiempo. Revisá: docker logs $CONTENEDOR"; exit 1; fi
done

# 3. Reset opcional
if [ "$RESET" -eq 1 ]; then
  echo "→ Borrando la base (MATCH (n) DETACH DELETE n)…"
  echo "MATCH (n) DETACH DELETE n;" | cypher >/dev/null
fi

# 4. Carga en orden
SCRIPTS=(01_esquema.cypher 02_modelo.cypher 03_instancias.cypher)
[ "$SOLO_BASE" -eq 0 ] && SCRIPTS+=(04_consultas.cypher)
for s in "${SCRIPTS[@]}"; do
  echo -n "→ Cargando $s… "
  if cypher < "$DIR/$s" >/dev/null 2>"$DIR/.ultimo_error.log"; then
    echo "ok"
  else
    echo "ERROR"; cat "$DIR/.ultimo_error.log"; exit 1
  fi
done
rm -f "$DIR/.ultimo_error.log"

# 5. Resumen
echo "→ Resumen de la base:"
cypher <<'EOF'
MATCH (f:Frame) WITH count(f) AS frames
MATCH (s:Slot) WITH frames, count(s) AS slots
MATCH (r:Regla) WITH frames, slots, count(r) AS reglas
MATCH (i:Instancia) WITH frames, slots, reglas, count(i) AS instancias
MATCH ()-[x]->() RETURN frames, slots, reglas, instancias, count(x) AS relaciones;
EOF
echo "✓ Listo. Browser: http://localhost:7474  (usuario $USUARIO / contraseña $CLAVE)"
