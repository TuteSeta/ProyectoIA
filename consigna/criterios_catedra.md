# Criterios de la cátedra (extraídos del aula virtual, Unidad 1)

## Sobre el sistema
- No se busca reemplazar al experto, sino **capturar parte de su conocimiento y razonamiento
  para asistirlo**: información estructurada, inferencias, alertas, recomendaciones y explicaciones.
- Rol de cada técnica:
  - **Grafo** → representa el conocimiento.
  - **Reglas** → realizan inferencias.
  - **Lógica difusa** → trata la incertidumbre.
  - **LLM** → interpreta entradas o explica resultados; **no decide sin control**.
- El sistema debe reproducir decisiones de una persona con experiencia: qué mira, qué decide,
  qué reglas usa, qué excepciones encuentra y qué hace cuando la información no alcanza.
- Ciencia de datos / ML / redes neuronales solo como componentes complementarios.

## Sobre PI1 (semáforo)
- Verde: razonamiento experto suficientemente explicitado para formalizar.
- Amarillo/rojo típicos: falta explicar cómo decide el experto, validar criterios, casos límite,
  o **separar reglas propuestas de conocimiento realmente adquirido**.

## Versiones sugeridas para PI2
**03 Modelo conceptual (red semántica)**
- v0.1: estructura conceptual inicial.
- v0.2: integración completa del dominio.
- v0.3: instanciación + datos reales/simulados + cobertura de preguntas + arquitectura de
  acceso a datos + casos de prueba.

**04 Modelo formal (frames y reglas)**
- v0.1: frames + reglas.
- v0.2: instancias + demonios + entrada/base de datos relacional.
- v0.3: contratos de demonios + ciclo de vida de instancias + trazabilidad completa +
  casos de prueba verificables + configuración pendiente + interfaz hacia lógica difusa.

## Próximas entregas
- PI2 (individual): cierre dom 4/10/2026.
- PG1 (grupal, integración conceptual): cierre dom 11/10/2026.

> La presentación del lunes es un buen borrador de PG1: lo integrado acá se reutiliza.
