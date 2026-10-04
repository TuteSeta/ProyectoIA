# Presentación avance proyecto IA — Grupo 11 (UTN FRM, 5k9)

## Contexto
Proyecto: **Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial**
(Neón LED, corpórea, retroiluminada).

- Integrantes: Matías Zarandón, Lautaro Quiros, Luciano Marquesini (experto fuente del dominio).
- Profesoras: Matilde Césari, María Eugenia Stefanoni.
- Submódulo de Matías: interpretación técnica de requerimientos y restricciones del cliente.
- Submódulos de Lautaro y Luciano: ver `pg0/` y sus PI1/PI2.
- Estado: PG0 aprobado en verde (22/09/2026). PI1 entregado. PI2 en curso (cierre 04/10/2026).

## Objetivo de esta carpeta
Preparar la presentación oral (virtual) del **lunes 5/10/2026**, máximo **20 minutos**,
siguiendo los 7 puntos de `consigna/consigna_modelado.md`.
Se evalúa el **proceso y la técnica de modelado**, no tanto el dominio.

## Mapa de la carpeta
| Carpeta | Contenido |
|---|---|
| `consigna/` | Consigna de la presentación, preguntas "integrador" y criterios de la cátedra |
| `pg0/` | PG0 final del grupo (objetivos, dominio, submódulos) |
| `pi1/` | PI1 de cada integrante (cuaderno de conocimiento + modelo de procesos) |
| `pi2/` | PI2 de cada integrante (red semántica + frames y reglas) |
| `neo4j/` | Scripts Cypher y guía para levantar Neo4j en Docker |
| `difusa/` | Avances de lógica difusa, si los hay (opcional) |
| `referencias/` | Ejemplos de la cátedra (Ejemplo_PI2, Ejemplo_PG1, UMAMI en Neo4j) |
| `salida/` | Todo lo que generes va acá |

## Cómo trabajar
Seguí `PLAN.md` fase por fase. **No avances de fase sin mostrarme el resultado y esperar mi OK.**

## Reglas
- Integrar los tres submódulos en **un solo modelo coherente**, no tres presentaciones pegadas.
- Usar solo conocimiento que esté en PG0/PI1/PI2. Si algo falta, marcarlo como
  `[PENDIENTE: ...]` en vez de inventarlo (reglas, umbrales, criterios del experto).
- Diferenciar conocimiento **adquirido del experto** de reglas **propuestas** por nosotros.
- El LLM interpreta entradas y explica resultados; **no toma la decisión experta**
  (criterio explícito de la cátedra).
- Si hay diagramas en imagen dentro de los .docx, extraelos y miralos: la red semántica
  suele estar ahí.
- Español rioplatense. Slides con poco texto: el detalle va en las notas del orador.
