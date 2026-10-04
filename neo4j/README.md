# Neo4j — entorno y convenciones

## Levantar Neo4j (Linux / Zorin OS)
Misma versión que recomienda la cátedra.

```bash
docker pull neo4j:5.21.0
docker run -d --name neo4j-carteleria \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5.21.0
```

- Browser: http://localhost:7474 (usuario `neo4j`, contraseña `password`).
- Si el contenedor ya existe: `docker start neo4j-carteleria`.

## Ejecutar scripts sin abrir el Browser
```bash
docker exec -i neo4j-carteleria cypher-shell -u neo4j -p password < neo4j/01_esquema.cypher
docker exec -i neo4j-carteleria cypher-shell -u neo4j -p password < neo4j/02_modelo.cypher
docker exec -i neo4j-carteleria cypher-shell -u neo4j -p password < neo4j/03_instancias.cypher
docker exec -i neo4j-carteleria cypher-shell -u neo4j -p password < neo4j/04_consultas.cypher
```

Resetear todo: `MATCH (n) DETACH DELETE n;`

## Archivos esperados
| Archivo | Contenido |
|---|---|
| `01_esquema.cypher` | Constraints de unicidad e índices |
| `02_modelo.cypher` | Red semántica + jerarquía de frames con slots y facetas |
| `03_instancias.cypher` | Instancias de los casos de prueba |
| `04_consultas.cypher` | Consultas que demuestran los casos de uso, comentadas |

Todos los scripts deben ser **idempotentes** (usar `MERGE`, no `CREATE`) para poder
correrlos varias veces durante la demo sin duplicar nodos.

## Convenciones
- Labels en PascalCase (`:Cartel`, `:Restriccion`), relaciones en MAYÚSCULAS_CON_GUION
  (`:ES_UN`, `:TIENE_RESTRICCION`), propiedades en snake_case.
- Revisar primero el ejemplo UMAMI en `referencias/` y **seguir el mismo patrón de modelado
  de frames que usa la cátedra**. Si no hay ejemplo, usar esta propuesta:
  - Frame clase: nodo `:Frame {nombre, tipo:'clase'}`, herencia con `:ES_UN`.
  - Instancia: nodo `:Frame {tipo:'instancia'}` con `:INSTANCIA_DE` hacia su clase.
  - Slot: nodo `:Slot {nombre}` unido con `:TIENE_SLOT`; facetas como propiedades
    (`tipo_dato`, `valor_defecto`, `rango`, `cardinalidad`, `si_necesito`, `si_agrego`).
  - Regla: nodo `:Regla {id, condicion, conclusion, origen}` con `:USA` hacia los slots
    que evalúa (sirve para trazabilidad).
- Comentar cada consulta con: caso de uso que demuestra + resultado esperado.

## Uso rápido (agregado al implementar — funciona en Git Bash de Windows, Linux y macOS)

| Comando | Qué hace |
|---|---|
| `bash neo4j/cargar.sh` | Crea/arranca `neo4j-carteleria`, espera a que responda y carga 01→04 (base completa, reglas ya aplicadas) |
| `bash neo4j/cargar.sh --reset` | Igual, pero antes borra toda la base |
| `bash neo4j/cargar.sh --reset --base` | Borra y carga solo 01→03 (estado previo a las reglas) |
| `bash neo4j/demo.sh` | Demo en vivo: recarga 01→03 y ejecuta los pasos de 04 de a uno, con título y pausa |
| `bash neo4j/demo.sh --completa` | Muestra también los pasos «extra» |
| `bash neo4j/demo.sh --sin-pausa` | Sin pausas (para probar o grabar) |

Notas:
- `cypher-shell` dentro del contenedor necesita `LANG=C.UTF-8` para no romper los acentos; los scripts ya lo pasan.
- `04_consultas.cypher` está dividido en bloques `// @paso NN | modo | caso | título`; `demo.sh` y
  `salida/build/generar_resultados.py` usan esos marcadores.
- `02_modelo.cypher` y `01_esquema.cypher` se generan con `python salida/build/gen_cypher.py`
  desde `salida/build/modelo_spec.py` (no editarlos a mano).
- Como no hay ejemplo UMAMI en `referencias/`, se usó la convención propuesta arriba más la del PI2 de Matías:
  instancias con etiquetas múltiples (`:Dato:DatoFaltante`), `:Instancia` + `INSTANCIA_DE`, y propiedad `regla`
  en las relaciones creadas por reglas.
