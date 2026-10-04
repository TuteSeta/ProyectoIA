# Preguntas "integrador"

La cátedra dijo: *"Respondiendo estas, dejan el proyecto listo para ser integrador"*.

**Ojo:** están redactadas sobre un ejemplo de detección de noticias falsas.
No se responden literalmente: hay que **adaptarlas a cartelería**. La columna derecha es
solo una guía de traducción; las respuestas tienen que salir del material del grupo.

| Eje | Pregunta original | Traducción a nuestro dominio |
|---|---|---|
| **Grafo** | ¿Qué entidades mínimas y relaciones representarán? ¿Cómo conectarán una noticia con sus fuentes y evidencias? | ¿Qué entidades mínimas modelamos? ¿Cómo se conecta un requerimiento del cliente con las restricciones, tecnologías y criterios que justifican la recomendación? |
| **Difusa** | ¿Qué variables lingüísticas y reglas usarán para un índice de verosimilitud? ¿Cómo combinarán el score del clasificador con reglas borrosas? | ¿Qué variables lingüísticas usamos para un índice de factibilidad o adecuación? ¿Cómo se combinan con las reglas nítidas de los frames? |
| **Planificador** | ¿Cuál es el flujo desde el ingreso del texto hasta la explicación y la retroalimentación? ¿Qué dispara re-etiquetado o reentrenamiento? | ¿Cuál es el flujo desde que entra el pedido del cliente hasta la recomendación explicada? ¿Qué dispara una revisión del experto o la actualización de reglas? |
| **LLM** | ¿El LLM generará explicaciones basadas en el grafo y en los puntajes difusos? ¿Habrá RAG? | ¿Qué hace el LLM: interpretar el pedido en lenguaje natural, explicar el resultado, o ambos? ¿Hay RAG sobre fichas técnicas o normativa? |
| **APIs** | ¿Qué endpoints, con qué contratos? ¿Endpoint de explicación (grafo + reglas + métricas)? | ¿Qué endpoints mínimos (evaluar pedido, obtener explicación)? ¿Qué entra y qué sale en cada uno? |
| **Trazabilidad** | ¿Cómo se guarda el rastro de decisión (nodos, reglas, confianza) para auditoría? | ¿Cómo registramos qué nodos se consultaron, qué reglas se activaron y con qué grado de pertenencia? (Se puede modelar como nodos `:Evaluacion` en el mismo grafo.) |

Si el material no alcanza para responder alguna, marcarla `[PENDIENTE]` y proponer
una respuesta como "dirección de trabajo", no como algo ya hecho.
