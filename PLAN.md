# Plan de trabajo

Cada fase termina con un checkpoint: mostrame el resultado y esperá mi OK.

## Fase 1 — Relevamiento
1. Leé todo `consigna/`, `pg0/`, `pi1/`, `pi2/` y `referencias/`.
2. Generá `salida/01_relevamiento.md` con:
   - Objetivo general y objetivos por submódulo.
   - Conceptos y relaciones de cada red semántica (tabla por integrante).
   - Frames, slots, facetas y reglas de cada PI2.
   - Casos de uso y ejemplos de entrada/salida disponibles.
   - **Solapamientos** entre submódulos (conceptos repetidos con distinto nombre).
   - **Huecos**: qué pide la consigna y no está en el material.

**Checkpoint 1.**

## Fase 2 — Modelo integrado
1. Unificá los tres modelos en `salida/02_modelo_integrado.md`:
   - Red semántica integrada (lista de nodos + relaciones, y un diagrama Mermaid).
   - Jerarquía de frames (herencia ES_UN / ES_PARTE_DE) con slots y facetas.
   - Reglas trazables (ID, condición, conclusión, origen: experto o propuesta).
   - Dónde aparece incertidumbre → candidatos a variables difusas.
2. Elegí **2 casos de uso** que crucen al menos dos submódulos.

**Checkpoint 2.**

## Fase 3 — Neo4j
1. Seguí `neo4j/README.md` para levantar Neo4j 5.21.0 en Docker.
2. Escribí `neo4j/01_esquema.cypher` (constraints), `neo4j/02_modelo.cypher` (red + frames)
   y `neo4j/03_instancias.cypher` (datos de los casos de prueba).
3. Escribí `neo4j/04_consultas.cypher` con al menos una consulta por caso de uso.
4. Ejecutá todo y guardá las salidas reales en `salida/03_resultados_consultas.md`.

**Checkpoint 3.**

## Fase 4 — Presentación
1. Generá `salida/presentacion.pptx` siguiendo `consigna/guion_presentacion.md`.
2. Notas del orador en cada slide, con quién habla.
3. Slide final con las preguntas de `consigna/preguntas_integrador.md` respondidas.

**Checkpoint 4.**

## Fase 5 — Demo
1. Generá `salida/guion_demo.md`: pasos exactos, consultas a ejecutar y qué se espera ver.
2. Incluí un plan B (video) por si falla la conexión.
