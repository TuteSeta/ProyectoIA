# 01 — Relevamiento del material del Grupo 11

Fuentes leídas: `pg0/PG0_Grupo11.md`, `pi1/PI1_{Matias,Lautaro,Luciano}.md`, `pi2/PI2_{Matias,Luciano}.md`,
`consigna/*.md` y los 9 diagramas de `pi1/img` y `pi2/img` (abiertos y revisados).
**No existe PI2 de Lautaro**: su submódulo se releva desde su PI1 (§10 conceptos y reglas R-MI-01 a R-MI-11)
y se marca `[PENDIENTE: PI2 Lautaro]`. `referencias/` y `difusa/` están vacías.

---

## 1. Objetivos

**Objetivo general (PG0).** Asistir al fabricante en la evaluación técnica de una propuesta de cartelería
(Neón LED, corpórea, retroiluminada): detectar condiciones problemáticas, identificar información faltante
y recomendar alternativas justificadas. La decisión final queda en el fabricante. El LLM es interfaz
lingüística (interpreta y explica), no decide.

| Submódulo | Responsable | Tarea experta | Objetivo | Entrada → Salida |
|---|---|---|---|---|
| Interpretación técnica de requerimientos y restricciones del cliente | Matías Zarandon | Interpretación (sec.: evaluación de suficiencia, recomendación de aclaraciones) | Convertir un pedido ambiguo en una ficha técnica confiable, sin inventar datos | Pedido del cliente → Ficha de requerimientos interpretados / Aclaraciones |
| Evaluación de materiales y condiciones de instalación | Lautaro Quiros | Evaluación (sec.: interpretación del entorno, diagnóstico) | Decidir si material, componentes, soporte y fijación son apropiados para el entorno | Ficha → Dictamen apto / apto con condiciones / no apto + restricciones con causa |
| Evaluación de manufacturabilidad y alternativas de rediseño | Luciano Marquesini (experto) | Recomendación (sec.: evaluación de factibilidad de manufactura) | Determinar si se puede fabricar (FDM PLA/PETG) y, si no, proponer rediseños que respeten al cliente | Ficha + Dictamen → Recomendación (confirmación o alternativas justificadas) |

Flujo entre submódulos (coincide en los tres PI1): **Matías → Lautaro → Luciano**, con retornos:
Lautaro devuelve datos faltantes a Matías (R-MI-01); Luciano devuelve el caso a Matías cuando ninguna
alternativa es admisible (R8).

---

## 2. Redes semánticas por integrante

### 2.1 Matías (PI2 completo — 23 nodos, 24 relaciones)

| Concepto | Tipo | Notas |
|---|---|---|
| Cliente, Pedido, Expresión del cliente, Referencia visual | Entidades (entrada) | Expresión con `texto_literal` inmutable |
| Requerimiento → Restricción del cliente / Preferencia / Necesidad funcional | Concepto + es_un | Especialización por rigidez |
| Dato → Confirmado / Faltante / Ambiguo / En conflicto | Concepto + es_un | Estado `descartado` (M15); cambio de etiqueta |
| Categoría de dato, Contradicción, Aclaración, Consulta a submódulo | Conceptos | Contradicción es relacional (≥2 datos) |
| Ficha de requerimientos interpretados, Advertencia | Salida | Advertencia = incertidumbre que viaja |
| Estado del pedido | Atributo | en_interpretación / pendiente_de_aclaración / listo_para_evaluación |
| Submódulo de evaluación → Materiales (Lautaro) / Manufacturabilidad (Luciano) | Externos | |

Relaciones (RL01–RL24): formula, contiene, incluye, tiene_estado, se_interpreta_como, aporta (×2),
se_describe_mediante, pertenece_a, involucra, provoca, solicita, se_dirige_a, actualiza,
evalúa_suficiencia_de, requiere_consulta_a, produce, registra, preserva, incluye (advertencia), alimenta,
es_un, omite, cubre.

### 2.2 Lautaro (solo PI1 §10 — `[PENDIENTE: PI2 Lautaro]`)

| Relación preliminar (PI1 §10) |
|---|
| Cartel → tiene_tecnología → Neón LED / Corpóreo / Retroiluminado |
| Cartel → usa → Material / Componente eléctrico |
| Cartel → se_instala_en → Entorno |
| Entorno → se_interpreta_como → Exposición ambiental (baja / media / alta) |
| Material → resiste / no_resiste → Agente ambiental (UV, agua, temperatura) |
| Componente eléctrico → posee → Grado de protección IP |
| Cartel → se_fija_con → Sistema de fijación → sobre → Soporte |
| Soporte → admite / no_admite → Carga del cartel |
| Configuración → presenta → Restricción → causada_por → Material / Soporte / Fijación / Exposición |
| Excepción → modifica → Regla |
| Dictamen de adecuación → alimenta → Evaluación de manufacturabilidad y rediseño |

Glosario adicional: Configuración propuesta, Método de instalación (adosado / bandera / colgado / sobre
estructura), Verificación profesional.

### 2.3 Luciano (PI2 — 14 conceptos, 14 relaciones)

| ID | Concepto | Tipo |
|---|---|---|
| C1 | Diseño (sin.: Cartel, Modelo) | Entidad central |
| C2 | Cliente | Entidad |
| C3 | FichaRequerimientos (de Matías) | Evidencia |
| C4 | EvaluaciónMateriales (de Lautaro) | Evidencia |
| C5 | Geometría | Atributo |
| C6 | Material → PLA, PETG | Entidad + es_un |
| C7 | Herramienta (impresora 3D FDM, 400×400 mm) | Entidad |
| C8 | SistemaFijación (sin.: Anclaje, **Soporte**) | Entidad |
| C9 | TecnologíaIluminación → NeónFrontal, Retroiluminado | Entidad + es_un |
| C10 | RestricciónConstructiva → Volumen, Trazo, Peso, Temperatura | Restricción + es_un |
| C11 | Conflicto (TrazoFino, ExcedeCama, RiesgoCaída) | Estado |
| C12 | AlternativaRediseño → CambioMaterial, CambioGeometría, CambioFijación, CambioTecnología, SegmentaciónModular | Acción + es_un |
| C13 | RestricciónCliente (rigidez de Matías) | Restricción |
| C14 | Recomendación | Salida |

Relaciones RL1–RL14: tiene, utiliza, requiere, viola, genera, exige, impone, es_filtrada_por, admite,
rechaza, define, alimenta, es_un, conforma.

> Observación sobre el diagrama `PI2_Luciano_red_semantica_conceptual.png`: es un **diagrama de flujo**
> (Cliente → … → Rediseño recomendado) más que el grafo de las tablas; usa verbos que no están en RL1–RL14
> (posee, incluye, condicionan, detecta, origina). En el modelo integrado se usan los verbos de las tablas.

---

## 3. Frames, slots, facetas, demonios y reglas

### 3.1 Matías — 12 frames (+ especializaciones)

| Frame | Slots clave (facetas) | Demonios |
|---|---|---|
| Pedido | id_pedido (1, único), expresiones (1..n), datos, aclaraciones, datos_requeridos (provisional), estado (defecto en_interpretación; solo R11 asigna listo), iteración (≥1, solo R13) | si_añadido expresiones → R01/R02/R07; si_modificado datos → R03/R11 |
| Cliente | conoce_terminología {sí,no,desconocido} | si_necesario: estimar por vocabulario |
| Expresión | texto_literal (inmutable), fuente, interpretaciones_posibles, interpretación_elegida | si_añadido: >1 interpretación → R01 |
| Referencia visual | aporta_sobre, consistente_con_texto {sí,no,sin_verificar} | si_modificado = no → R03 |
| Dato (abstracto) | atributo, categoría, valor, unidad, **origen {cliente, respuesta_a_aclaración}** (no admite «supuesto»), estado | si_modificado estado → reclasificar etiqueta |
| ↳ Faltante | criticidad {bloqueante, postergable, **sin_clasificar** (defecto)} | si_añadido → Aclaración (R02), Consulta (R10) |
| ↳ Ambiguo | interpretaciones 2..n | si_añadido → Aclaración (R01) |
| Contradicción | datos_involucrados (2..n), tipo, estado, resolución (solo del cliente) | si_añadido → Aclaración (R03) |
| Requerimiento (abstracto) | rigidez {obligatoria, preferencia, a_confirmar} | si_modificado → mover sección ficha |
| Aclaración | motivo, objeto, pregunta (no induce solución), formulación (R08), estado | si_modificado respondida → R13 |
| Consulta a submódulo | dato, destino, pregunta, estado, respuesta | si_añadido → actualizar criticidad |
| Ficha | pedido (precondición listo), datos_confirmados, restricciones, preferencias, necesidades, advertencias, destinatarios | si_añadido: verificar precondición |
| Advertencia | elemento, motivo, texto, destinatario | — |

Reglas **R01–R13** (todas crisp, «pendiente de validación con la fuente experta»): R01 ambigüedad,
R02 faltante, R03 contradicción, R04 restricción explícita, R05 preferencia no promovible, R06 rigidez a
confirmar, R07 necesidad funcional, R08 formulación adaptada, R09 no inventar valores, R10 consulta a otro
submódulo, R11 suficiencia, R12 herencia de incertidumbre, R13 reingreso. Estrategia de resolución de
conflictos explícita: R09 → R13 → (R03, R01, R02) → (R04–R07) → (R08, R10) → R11 → R12.

### 3.2 Luciano — 8 frames

| Frame | Slots (facetas) | Demonio |
|---|---|---|
| Geometría | ancho_canal_mm, dimension_maxima_mm, peso_estimado_gr (>0) | ancho cambia → recalcular Conflicto |
| Diseño | nombre, tipo_iluminacion [NeónFrontal, Retroiluminado], material [PLA, PETG], entorno [Interior, Exterior] | tipo_iluminacion vacío y lleva luz → este submódulo la propone; entorno Exterior → R7 |
| AlternativaRediseño | tipo_cambio, impacto_estetico [Alto, Medio, Bajo], viable, justificacion | impacto Alto y fidelidad Alta → viable = False |
| RestricciónConstructiva | tipo [Trazo, Volumen, Peso, Temperatura], valor_limite, unidad | superado → instanciar Conflicto |
| Herramienta | tipo, volumen_util_maximo (400) | dim > volumen → Conflicto ExcedeCama |
| RestricciónCliente | rigidez, fidelidad_logo, flexibilidad_estetica, tamaño_final_fijo, instalacion_no_invasiva | obligatoria → rechazar; preferencia → bajar prioridad |
| Conflicto | tipo, restriccion_violada, alternativas (1..N), estado [Abierto, Resuelto, Inviable] | instanciar → generar alternativas; todas no viables → Inviable (R8) |

Reglas **R1–R9**: R1 manufacturabilidad directa, R2 trazo (< 6 mm con NeónFrontal), R3 volumen (> 400 mm),
R4 peso vs fijación, R5 prioridad por flexibilidad estética alta, R6 filtro por fidelidad al logo,
R7 exterior → PETG (descartar PLA), R8 escalado al cliente, R9 instalación no invasiva.

Valores documentales utilizables: **6 mm** (ancho mínimo tira neón), **400 × 400 mm** (cama de la impresora),
**PLA no apto exterior / PETG apto** (propiedades térmicas FDM). La carga admisible de la cinta bifaz **no
tiene valor** (`[PENDIENTE]`).

### 3.3 Lautaro — sin frames (`[PENDIENTE: PI2 Lautaro]`)

Reglas candidatas (PI1 §7), sin valores numéricos:

| ID | SI | ENTONCES | Fuente declarada |
|---|---|---|---|
| R-MI-01 | falta entorno, soporte o dimensiones | no evaluar; pedir el dato a interpretación | Experto |
| R-MI-02 | exterior, sin alero/nicho, expuesto a sol y lluvia | exposición alta | Experto |
| R-MI-03 | exposición alta y componente eléctrico sin protección contra agua | restricción componente–entorno | IEC 60529 + experto |
| R-MI-04 | exposición alta y material no apto exterior/UV | restricción material–entorno | Documento + experto |
| R-MI-05 | soporte de baja capacidad y peso mayor al seguro | restricción de instalación; revisar fijación a estructura | Experto |
| R-MI-06 | gran porte, bandera o altura con viento | verificación estructural profesional | Experto + CIRSOC 102 |
| R-MI-07 | fuente sin acceso | restricción de mantenimiento | Experto |
| R-MI-08 | exterior en nicho o bajo alero | reducir exposición (magnitud a validar) | Experto |
| R-MI-09 | interior con humedad alta o sol directo | exposición media o alta | Experto |
| R-MI-10 | sin restricciones y datos completos | apto; derivar a manufacturabilidad | Experto |
| R-MI-11 | restricciones resolubles con condiciones | apto con condiciones | Experto |

Además, regla general de §6: «un interior se evalúa con exposición baja».

---

## 4. Casos de uso y ejemplos de entrada/salida disponibles

| Caso | Fuente | Entrada | Salida documentada |
|---|---|---|---|
| **P-01** Café Andino | PI2 Matías | «cartel de neón… Café Andino… para poner en la pared… más o menos de un metro… que se vea lindo de noche» + foto | It. 1: 3 datos ambiguos (D1, D3, D5), 1 faltante (D4 superficie/montaje), NF1, A1–A4, Q1 a Materiales → pendiente. It. 2: interior, largo ≈ 1 m, aspecto neón; **avance depende de Q1** (dos ramas) |
| **P-02 / FR-02** Letras corpóreas exterior | PI2 Matías (+ caso PG0) | «letras corpóreas con luz… frente que da a la calle… 3 m… sí o sí antes de la inauguración… si se puede colores del logo» + foto sin luz | K1 contradicción texto–referencia, RC1 obligatoria, PR1 preferencia, D11 faltante. It. 2: marquesina a 4 m → **FR-02** listo con AV2 |
| FR-02 en rediseño | PI2 Luciano («Continuidad») | FR-02 | 3000 mm > 400 mm → R3 segmentación (letra por letra); exterior → R7 PETG; tecnología la propone Luciano |
| L-C1 Logo cursiva | PI2 Luciano | canal 4 mm, NeónFrontal, fidelidad logo alta | TrazoFino → Engrosar (rechazada) / Retroiluminado (admitida) |
| L-C2 Cartel circular | PI2 Luciano | Ø 500 mm, tamaño final fijo | ExcedeCama → Segmentación + refuerzo (admitida) |
| L-C3 Cartel pesado | PI2 Luciano | peso > carga cinta bifaz, instalación no invasiva | RiesgoCaída → CambioFijación (rechazada) / ReducirInfill (admitida) |
| Casos típicos Lautaro | PI1 Lautaro §4 | Neón interior; corpóreo exterior en fachada; retroiluminado sobre yeso; bandera; fuente sin acceso | Dictámenes «probables» (apto / apto con condiciones / restricción) |

---

## 5. Solapamientos (mismo concepto, distinto nombre)

| Concepto unificado | Matías | Lautaro | Luciano | Decisión |
|---|---|---|---|---|
| **Cartel** | (no lo modela; trabaja sobre Pedido/Dato) | Cartel / Configuración propuesta | Diseño (sin. Cartel) | `Cartel`, sinónimos Diseño y Configuración |
| **FichaRequerimientos** | Ficha de requerimientos interpretados | ficha de requerimientos interpretados | FichaRequerimientos | Ya alineado: `FichaRequerimientos` |
| **RestriccionCliente / Preferencia** | Especializaciones de Requerimiento, con rigidez | «restricciones del cliente» en la ficha | RestricciónCliente con rigidez + criterios (fidelidad_logo, tamaño_final_fijo, no_invasiva) | Requerimiento → RestriccionCliente (obligatoria) / Preferencia; los criterios de Luciano pasan a slot `criterio` |
| **Entorno** | Dato (atributo entorno, categoría entorno) | Concepto Entorno → Exposición ambiental | Slot `Diseño.entorno` | Nodo `Entorno` con `tipo` y `nivel_exposicion` |
| **Conflicto** | — | «Restricción detectada, registrada con su causa» | Conflicto (estado por violar una restricción) | `Conflicto` con `origen` (manufactura / instalación) |
| **Restricción (límite)** | Restricción del cliente | Restricción (= hallazgo) | RestricciónConstructiva (= límite físico) | Se separan: `RestriccionConstructiva` (límite) vs `Conflicto` (hallazgo) |
| **DictamenAdecuacion** | — | Dictamen de adecuación | EvaluaciónMateriales (C4) | `DictamenAdecuacion` |
| **SistemaFijacion** | — | Sistema de fijación (tarugos, anclajes, adhesivos) | SistemaFijación (cinta bifaz) — **sinónimo «Soporte»** | `SistemaFijacion`; `Soporte` queda solo para la superficie (Lautaro) |
| **Material** | — | acrílico, PVC, ACM, chapa, silicona | PLA, PETG | `Material` con subtipos; solo PLA/PETG tienen propiedades documentadas |
| **Tecnología** | Dato «tecnología» (corpóreo) + «iluminación» | tiene_tecnología: Neón LED / Corpóreo / Retroiluminado | TecnologíaIluminación: NeónFrontal / Retroiluminado | Se separan `tipo_cartel` (PG0) y `TecnologiaIluminacion` |
| **Recomendación** | — | — | Recomendación (sin. «Dictamen») | `Recomendacion`; «Dictamen» queda para Lautaro |
| **Pedido de datos al cliente** | Aclaración / Consulta a submódulo | «Solicitud de datos faltantes» (R-MI-01) | Devolver al cliente (R8) | Todo pasa por `Aclaracion` de Matías; Q1/Q2 las responde Lautaro |
| **Relación «utiliza»** | — | usa, se_fija_con | utiliza | `UTILIZA` (material, componente) y `SE_FIJA_CON` (fijación) |

---

## 6. Huecos (lo que pide la consigna y no está en el material)

| # | Hueco | Impacto | Tratamiento |
|---|---|---|---|
| H1 | **No hay PI2 de Lautaro**: sin frames, slots ni facetas de su submódulo | Punto 4 de la consigna (marcos) incompleto para ese submódulo | Frames de Lautaro derivados de su PI1 §2, §7 y §10, marcados `[PENDIENTE: PI2 Lautaro]` |
| H2 | Umbrales de Lautaro: grado IP exigido, peso seguro por soporte, tamaño/altura que exige verificación estructural, magnitud de reducción por alero | R-MI-03/05/06/08 no son evaluables numéricamente | Las reglas se disparan como **condición o advertencia**, nunca con un número inventado |
| H3 | Carga admisible de la cinta bifaz (`RestricciónConstructiva(Peso).valor_limite`) | R4 sin número | Se usa el hecho del caso («supera la carga») como dato de entrada |
| H4 | Criterio de criticidad bloqueante/postergable (Matías M7) | R11 no decidible en P-01 | Se resuelve con R-MI-01 de Lautaro (falta soporte ⇒ bloqueante): integración real entre submódulos |
| H5 | Criterio para que Luciano **proponga la tecnología** cuando la ficha solo dice «lleva luz» | En P-01 y FR-02 la tecnología queda sin asignar | `[PENDIENTE: criterio del experto para elegir tecnología a partir de una NF]` |
| H6 | Respuesta del cliente a A4 en P-01 (superficie/montaje) | Sin ella P-01 nunca llega a evaluación | Para el caso de prueba integrado se agrega una respuesta **simulada** marcada como dato de prueba (no es conocimiento experto) |
| H7 | Lógica difusa: no hay funciones de pertenencia ni rangos (todos los PI lo posponen a PI3) | Punto 5 opcional | Slide como «próximo paso» con variables candidatas |
| H8 | Neo4j: no hay nada implementado ni ejemplo UMAMI en `referencias/` | Patrón de frames de la cátedra desconocido | Se usa la propuesta de `neo4j/README.md` + la correspondencia del PI2 de Matías |
| H9 | Impacto de la segmentación en el plazo (RC1 de FR-02) | No se puede decidir si RC1 rechaza la segmentación | Alternativa admitida con advertencia `[PENDIENTE]` |
| H10 | Conjunto de `datos_requeridos` por tipo de cartel (Matías) | R02/R11 usan un conjunto provisional | Se usa el provisional de PG0/PI1 (producto/tecnología, dimensiones, entorno, instalación, apariencia) |
| H11 | Arquitectura LLM/APIs/planificador (preguntas integrador) | Slide final | Se responde con el material (rol del LLM en PG0) y se marca lo demás como dirección de trabajo |
| H12 | Validación con el experto: casi todas las reglas de Matías y Lautaro están «pendientes de validación» | Origen de las reglas | Columna `origen` + `estado_validacion` en cada regla |
