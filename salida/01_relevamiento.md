# 01 — Relevamiento del material del Grupo 11

Fuentes leídas: `pg0/PG0_Grupo11.md`, `pi1/PI1_{Matias,Lautaro,Luciano}.md`, `pi2/PI2_{Matias,Luciano}.md`, `pi2/Quiros_Lautaro_PI2_U1.md`,
`consigna/*.md` y los 9 diagramas de `pi1/img` y `pi2/img` (abiertos y revisados).
**Actualización 04/10/2026:** se incorporó el PI2 de Lautaro (`pi2/Quiros_Lautaro_PI2_U1.md`); las secciones 2.2 y 3.3
ya no salen de su PI1 y los `[PENDIENTE: PI2 Lautaro]` quedaron resueltos. `referencias/` y `difusa/` están vacías.

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

### 2.2 Lautaro (PI2 — 19 conceptos, 22 relaciones)

| ID | Concepto | Tipo |
|---|---|---|
| C1 | Configuración del cartel | Concepto principal (frame central) |
| C2 | Cartel → Neón LED / Corpóreo / Retroiluminado | Entidad + es_un |
| C3 | Material → PLA / PETG / Acrílico (alcance del taller, M2) | Entidad + es_un |
| C4–C5 | Componente eléctrico (tira de Neón LED, tira LED, fuente) · Grado de protección IP | Entidad · Evidencia |
| C6–C8 | Entorno (interior / exterior protegido / exterior expuesto) · Agente ambiental · Exposición ambiental (baja/media/alta) | Entidad · Entidad · Estado |
| C9–C11 | Soporte · Método de instalación · Sistema de fijación | Entidades |
| C12–C13 | Ficha de requerimientos (entrada) · Solicitud de datos faltantes | Evidencia · Evento |
| C14 | Excepción (alero, nicho, interior húmedo) | Restricción contextual |
| C15 | Restricción → material–entorno / eléctrica / de instalación / de mantenimiento, con severidad excluyente/corregible | Restricción + es_un |
| C16–C18 | Condición de instalación · Requisito de material · Verificación profesional | Acciones |
| C19 | Dictamen de adecuación (apto / apto con condiciones / no apto) | Estado (salida) |

Relaciones RL1–RL22: alimenta, genera, describe, usa, incorpora, posee, se_instala_en, somete_a, se_interpreta_como,
resiste, se_monta_mediante, se_apoya_en, se_fija_con, se_ancla_en, ajusta, presenta, causada_por, se_resuelve_con,
requiere, recibe, reúne/impone/establece/señala, alimenta (manufacturabilidad).
Modificaciones M1–M9 al cuaderno: nombres alineados con Matías y Luciano (M1), alcance FDM (M2), conceptos nuevos
Requisito de material (M3) y Condición de instalación (M4), severidad de la restricción (M5), reglas nuevas
R-MI-12/13/14 (M6–M7), datos bloqueantes vs postergables (M8, responde Q1/Q2 de Matías), carga como slot (M9).

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

### 3.3 Lautaro — 8 frames principales + 5 secundarios (PI2)

| Frame | Slots clave (facetas) | Demonios |
|---|---|---|
| Configuración_Cartel (central) | ficha, cartel, entorno/soporte/método (**bloqueantes**), estado {pendiente_de_datos, habilitada, evaluada} | si_necesario → Solicitud de datos (R-MI-01); si_modificado habilitada → disparar R-MI-02…14 |
| Cartel | tipo, dimensiones (bloqueante), peso_estimado (a validar), materiales, componentes, iluminación, doble_faz | si_necesario materiales → R-MI-13 |
| Entorno | ubicación, protección_superior (defecto ninguna), alcance_protección, humedad (defecto normal), sol_directo (defecto no), altura, exposición | si_añadido protección → R-MI-08; si_necesario exposición → R-MI-02/08/09 |
| Material | tipo, función, apto_exterior {sí, no, a_validar}, resistencia_UV / térmica (a validar) | — |
| Componente eléctrico | tipo, uso_declarado, grado_IP (exigido: a validar), ubicación y accesible (fuente) | si_necesario IP con exposición alta → sin protección; interna_cerrada → R-MI-07 |
| Soporte | tipo, capacidad_relativa (a validar), estado (defecto no_verificado), estructura_portante | no_verificado → R-MI-14; estructura → excepción de R-MI-05 |
| Restricción (abstracto) | tipo, causa (1..n), severidad {excluyente, corregible}, condición, regla_origen | corregible → crear condición |
| Dictamen_Adecuación | resultado, restricciones, condiciones, requisitos, verificaciones, reglas_aplicadas | si_necesario: R-MI-12 → R-MI-11 → R-MI-10 |
| Secundarios | Excepción (aplica sí/no, se guarda aunque no aplique), Condición, Requisito, Verificación, Solicitud de datos | — |

Reglas **R-MI-01 a R-MI-14**, todas crisp; los umbrales (grado IP, peso seguro, gran porte, alero efectivo) son
parámetros «a validar», sin números. Orden de disparo: R-MI-01 → exposición (02, 08, 09) → detección (03–07, 13, 14,
se acumulan) → dictamen (12 > 11 > 10). R-MI-12 (no apto), R-MI-13 (material no definido → requisito) y R-MI-14
(soporte no verificado → condición) son nuevas del PI2.

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
| FR-02 en materiales | PI2 Lautaro, caso 1 | FR-02 sin material ni fuente definidos | exposición alta → RQ-01/02 (R-MI-13), CI-01 (R-MI-14), CI-02, VP-01 (R-MI-06) → **apto con condiciones** (R-MI-11) |
| FR-07 Neón LED en bandera | PI2 Lautaro, caso 2 | 1,2 × 0,8 m doble faz, bandera a 3 m, alero 0,4 m que no cubre, Neón LED y fuente de interior | R-MI-08 no aplica → alta; R-01 eléctrica excluyente (R-MI-03), R-02 mantenimiento corregible (R-MI-07), VP-02 → **no apto** (R-MI-12) |

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
| H1 | ~~No hay PI2 de Lautaro~~ **Resuelto 04/10/2026** | — | Frames, reglas y casos tomados de su PI2 |
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
