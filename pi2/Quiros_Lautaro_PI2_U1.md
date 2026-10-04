# Actividad PI2 — Inteligencia Artificial

- **Carrera:** Ingeniería en Sistemas de Información — UTN FRM
- **Cátedra:** Inteligencia Artificial — Comisión 5k9 — 2026
- **Integrante:** Lautaro Quiros
- **Profesores:** Ing. Matilde Inés Césari — Ing. María Eugenia Stefanoni
- **Submódulo:** Evaluación de materiales y condiciones de instalación (Grupo 11 — Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial)

> Nota de conversión: las figuras del PDF (redes semánticas) se transcribieron como tablas de aristas `origen --relación--> destino`. Los IDs de reglas se normalizaron a `R-MI-XX`.

---

## b) Revisión del Cuaderno de Conocimiento. Conceptos y relaciones identificados

La devolución del PI1 fue **riesgo verde con observación**. El proceso de evaluación (datos mínimos → exposición → compatibilidad material–entorno → soporte y fijación → eléctrico y mantenimiento → excepciones → dictamen) quedó bien modelado, pero la mayoría de los criterios todavía está pendiente de adquisición con Luciano. Por eso, en este PI2 las reglas de exposición, soporte, peso, grado IP y verificación estructural se formalizan **sin fijar valores**: los umbrales aparecen como parámetros de los frames con la faceta «a validar».

Al pasar el cuaderno a red semántica, frames y reglas, y al recorrer los casos de uso, aparecieron conceptos que estaban implícitos, una regla que faltaba para el dictamen «no apto» y diferencias de vocabulario con los PI2 de Matías y Luciano. Las modificaciones se incorporaron al Cuaderno de Conocimiento y se resumen a continuación.

### Modificaciones al Cuaderno de Conocimiento

| N° | Tipo | Modificación | Motivo | Sección |
|---|---|---|---|---|
| M1 | Integración | La entrada pasa a llamarse *Ficha de requerimientos interpretados* (como en el PI2 de M. Zarandon) y la salida *Dictamen de adecuación*, que en el PI2 de L. Marquesini llega como «EvaluaciónMateriales». | Las tres redes se integran en PG1 y tienen que usar los mismos nombres en los puntos de contacto. | Interacción; §10 |
| M2 | Alcance | Los materiales se acotan a los del taller según el PI2 de Luciano: cuerpo impreso por FDM (PLA o PETG), frente o difusor de acrílico, tira de Neón LED, tira LED, fuente y conexiones. | Luciano acotó la fabricación a impresión 3D FDM; si este submódulo evalúa otros materiales, su dictamen no le sirve. | §2; §7 R-MI-04 |
| M3 | Concepto faltante | *Requisito de material*: exigencia que debe cumplir el material o componente que se elija después, según la exposición. | En el caso FR-02 la ficha llega sin material (lo elige el submódulo de rediseño) y con R-MI-01 el caso quedaba trabado sin motivo. | §2; §7 (R-MI-13) |
| M4 | Concepto faltante | *Condición de instalación* pasa a ser un concepto propio, separado de la restricción. | El dictamen «apto con condiciones» lista condiciones que no estaban representadas. | §2; R-MI-11 |
| M5 | Generalización | *Restricción* se especializa en material–entorno, eléctrica, de instalación y de mantenimiento, con el atributo severidad (excluyente / corregible). | El tipo de dictamen depende de si la restricción se resuelve con una condición o exige cambiar la configuración. | §2; §10 |
| M6 | Regla faltante | Se agrega R-MI-12 (dictamen no apto) y se define el orden de disparo de las reglas de dictamen. | En PI1 había reglas para apto y apto con condiciones, pero ninguna para no apto. | §7 |
| M7 | Regla faltante | Se agrega R-MI-14: un soporte con estado no verificado genera una condición de relevamiento. | El caso límite de la pared con revoque en mal estado no tenía regla asociada. | §5; §7 |
| M8 | Criterio | Se precisa qué datos son bloqueantes: entorno, soporte o método de instalación y dimensiones. Altura, material y ubicación de la fuente son postergables y pasan como condición o requisito. | Responde las consultas Q1 y Q2 del PI2 de Matías, que preguntan si el montaje frena la evaluación. | §7 R-MI-01; §9 |
| M9 | Inconsistencia | «Soporte admite / no_admite Carga» se reemplaza por slots (peso estimado del cartel, capacidad del soporte) y «resiste / no_resiste» por una única relación *resiste*. | La carga es un atributo y no un concepto; una relación y su negación no deben ser dos aristas distintas. | §10 |

> **Estado de validación.** Ninguna modificación agrega valores numéricos. Espesores, pesos admisibles, grados IP exigidos y umbrales de porte siguen como parámetros «a validar» con Luciano, como indicó la devolución.

### Conceptos identificados

Cada elemento se tipifica según las categorías de la consigna y se indica su origen en el Cuaderno del PI1.

| ID | Concepto | Tipo | Descripción | Origen |
|---|---|---|---|---|
| C1 | Configuración del cartel | Concepto principal | Combinación de cartel, materiales, componentes, entorno, soporte y montaje que se evalúa. | §2; etapa 1 |
| C2 | Cartel | Entidad | Producto a instalar: Neón LED, corpóreo o retroiluminado. | §10; entradas |
| C3 | Material | Entidad | Material del cuerpo, frente o placa (PLA, PETG, acrílico). | §2; etapa 4; M2 |
| C4 | Componente eléctrico | Entidad | Tira de Neón LED, tira LED, fuente y conexiones. | §2; etapa 6 |
| C5 | Grado de protección IP | Evidencia | Protección declarada del componente contra sólidos y agua (IEC 60529). | §2; R-MI-03 |
| C6 | Entorno de instalación | Entidad | Interior, exterior protegido o exterior expuesto. | §2; etapa 3 |
| C7 | Agente ambiental | Entidad | UV, agua, temperatura y viento. | §2; etapas 3–4 |
| C8 | Exposición ambiental | Estado | Nivel interpretado: baja, media o alta. | Etapa 3; R-MI-02 |
| C9 | Soporte | Entidad | Mampostería, placa de yeso, estructura metálica, marquesina, vidrio. | §2; etapa 5 |
| C10 | Método de instalación | Entidad | Adosado, bandera, colgado o sobre estructura. | §2; etapa 5 |
| C11 | Sistema de fijación | Entidad | Tarugos, anclajes químicos, separadores, perfiles, cables, adhesivos. | §2; etapa 5 |
| C12 | Ficha de requerimientos | Evidencia (entrada) | Datos confirmados, restricciones y advertencias del submódulo de interpretación. | Interacción; M1 |
| C13 | Solicitud de datos faltantes | Evento | Pedido de un dato bloqueante al submódulo de interpretación. | Etapa 2; R-MI-01 |
| C14 | Excepción | Restricción (contextual) | Situación particular que ajusta una regla general: alero, nicho, interior húmedo. | §6; etapa 7 |
| C15 | Restricción | Restricción | Condición detectada que impide o condiciona la configuración, con causa y severidad. | §2; etapas 4–6; M5 |
| C16 | Condición de instalación | Acción | Lo que debe cumplirse para resolver una restricción corregible. | R-MI-11; M4 |
| C17 | Requisito de material | Acción | Exigencia para un material o componente todavía no definido. | M3 |
| C18 | Verificación profesional | Acción | Derivación a un profesional (estructural o eléctrica). | §2; R-MI-06 |
| C19 | Dictamen de adecuación | Estado (salida) | Apto, apto con condiciones o no apto, con su justificación. | §2; etapa 8 |

### Relaciones identificadas

| ID | Origen | Relación | Destino | Card. | Origen en PI1 |
|---|---|---|---|---|---|
| RL1 | Ficha de requerimientos | alimenta | Configuración | 1:1 | Etapa 1 |
| RL2 | Configuración | genera | Solicitud de datos faltantes | 0:N | Etapa 2 |
| RL3 | Configuración | describe | Cartel | 1:1 | Etapa 1 |
| RL4 | Cartel | usa | Material | 1:N | §10 |
| RL5 | Cartel | incorpora | Componente eléctrico | 0:N | §10 |
| RL6 | Componente eléctrico | posee | Grado de protección IP | N:1 | §10 |
| RL7 | Cartel | se_instala_en | Entorno | N:1 | §10 |
| RL8 | Entorno | somete_a | Agente ambiental | 1:N | Etapa 3 |
| RL9 | Entorno | se_interpreta_como | Exposición ambiental | N:1 | §10 |
| RL10 | Material | resiste | Agente ambiental | N:M | §10; M9 |
| RL11 | Cartel | se_monta_mediante | Método de instalación | N:1 | Etapa 5 |
| RL12 | Método de instalación | se_apoya_en | Soporte | N:1 | Etapa 5 |
| RL13 | Cartel | se_fija_con | Sistema de fijación | N:1 | §10 |
| RL14 | Sistema de fijación | se_ancla_en | Soporte | N:1 | §10 |
| RL15 | Excepción | ajusta | Exposición / Restricción | N:M | §6; etapa 7 |
| RL16 | Configuración | presenta | Restricción | 0:N | §10 |
| RL17 | Restricción | causada_por | Material / Componente / Soporte / Exposición | N:1 | §10 |
| RL18 | Restricción | se_resuelve_con | Condición de instalación | 0:1 | R-MI-11; M4 |
| RL19 | Configuración | requiere | Verificación profesional | 0:N | R-MI-06 |
| RL20 | Configuración | recibe | Dictamen de adecuación | 1:1 | Etapa 8 |
| RL21 | Dictamen | reúne / impone / establece / señala | Restricción / Condición / Requisito / Verificación | 0:N | Etapa 8; M3–M4 |
| RL22 | Dictamen | alimenta | Submódulo de manufacturabilidad | 1:1 | §10; M1 |

**Jerarquías (es_un):**
- Cartel → Neón LED, Corpóreo, Retroiluminado
- Entorno → Interior, Exterior protegido, Exterior expuesto
- Restricción → material–entorno, eléctrica, de instalación, de mantenimiento
- Material → PLA, PETG, Acrílico
- Componente eléctrico → Tira de Neón LED, Tira LED, Fuente

---

## c) Red Semántica Conceptual

La red representa el conocimiento del submódulo como un grafo dirigido: los nodos son los conceptos C1–C19 y las aristas son las relaciones RL1–RL22, nombradas con verbos. Se lee de arriba hacia abajo y sigue el mismo orden en que razona el fabricante en el PI1:

- **Entrada.** La ficha del submódulo de interpretación alimenta la Configuración del cartel. Si falta un dato bloqueante, la configuración genera una Solicitud de datos faltantes que vuelve a ese submódulo.
- **Qué se evalúa.** La configuración describe un Cartel, que usa materiales, incorpora componentes eléctricos, se instala en un entorno, se monta mediante un método y se fija con un sistema de fijación anclado a un soporte.
- **Interpretación del entorno.** El entorno somete al cartel a agentes ambientales y se interpreta como un nivel de exposición. La Excepción es el nodo que puede ajustar ese nivel (alero, nicho, interior húmedo).
- **Diagnóstico.** La configuración presenta restricciones y cada una queda unida a su causa (material, componente, soporte o exposición). Esto es lo que necesita el submódulo de rediseño para saber sobre qué actuar.
- **Salida.** El dictamen reúne las restricciones, impone condiciones, establece requisitos de material, señala verificaciones profesionales y alimenta al submódulo de manufacturabilidad.

Las especializaciones de Material y Componente eléctrico no se dibujan para no sobrecargar la figura; se detallan en los frames de la sección f).

### Figura 1 — Red semántica conceptual (transcripción)

Tipos de arista: `continua` = relación dirigida · `es_un` = herencia (discontinua, punta hueca) · `causa` = causada_por (discontinua) · `punteada` = interacción con otro submódulo.
Nodos externos (borde discontinuo): Submódulo de interpretación (M. Zarandon), Submódulo de manufacturabilidad y rediseño (L. Marquesini).

| Origen | Relación | Destino | Tipo |
|---|---|---|---|
| Submódulo de interpretación (M. Zarandon) | produce | Ficha de requerimientos interpretados | punteada |
| Ficha de requerimientos interpretados | alimenta | Configuración del cartel | continua |
| Configuración del cartel | genera | Solicitud de datos faltantes | continua |
| Solicitud de datos faltantes | se_dirige_a | Submódulo de interpretación (M. Zarandon) | punteada |
| Configuración del cartel | describe | Cartel | continua |
| Configuración del cartel | presenta | Restricción | continua |
| Configuración del cartel | requiere | Verificación profesional | continua |
| Configuración del cartel | recibe | Dictamen de adecuación | continua |
| Neón LED / Corpóreo / Retroiluminado | es_un | Cartel | es_un |
| Interior / Exterior protegido / Exterior expuesto | es_un | Entorno de instalación | es_un |
| Cartel | se_monta_mediante | Método de instalación | continua |
| Cartel | se_fija_con | Sistema de fijación | continua |
| Cartel | incorpora | Componente eléctrico | continua |
| Cartel | usa | Material | continua |
| Cartel | se_instala_en | Entorno de instalación | continua |
| Método de instalación | se_apoya_en | Soporte | continua |
| Sistema de fijación | se_ancla_en | Soporte | continua |
| Componente eléctrico | posee | Grado de protección IP | continua |
| Entorno de instalación | somete_a | Agente ambiental (UV, agua, temperatura, viento) | continua |
| Material | resiste | Agente ambiental | continua |
| Entorno de instalación | se_interpreta_como | Exposición ambiental | continua |
| Exposición ambiental | toma_valor | { baja \| media \| alta } | valores |
| Excepción | ajusta | Restricción | continua |
| Excepción | ajusta | Exposición ambiental | continua |
| Restricción | causada_por | Soporte / Componente eléctrico / Material / Exposición ambiental | causa |
| R. de instalación / R. de mantenimiento / R. material–entorno / R. eléctrica | es_un | Restricción | es_un |
| Restricción | se_resuelve_con | Condición de instalación | continua |
| Dictamen de adecuación | reúne | Restricción | continua |
| Dictamen de adecuación | señala | Verificación profesional | continua |
| Dictamen de adecuación | impone | Condición de instalación | continua |
| Dictamen de adecuación | establece | Requisito de material | continua |
| Dictamen de adecuación | alimenta | Submódulo de manufacturabilidad y rediseño (L. Marquesini) | punteada |
| Dictamen de adecuación | toma_valor | { apto \| apto con condiciones \| no apto } | valores |

**Convenciones de color (original):** gris con negrita: concepto principal · blanco: especialización o concepto secundario · rojo: restricción · amarillo: salidas que condicionan la configuración (Verificación profesional, Condición de instalación, Requisito de material) · azul: dictamen · recuadro bordó: conjunto de valores del estado.

---

## d) Casos de uso e instanciación

Se eligieron dos casos que recorren caminos distintos de la red: uno llega sin material definido y termina en **apto con condiciones**; el otro termina en **no apto** y prueba una excepción que no se cumple. El primero continúa la ficha FR-02 del PI2 de Matías para mostrar cómo encadenan los submódulos; el segundo es un pedido armado para este informe a partir de los casos típicos y límite del cuaderno (cartel en bandera y fuente sin acceso).

### Caso 1 — Letras corpóreas sobre marquesina (FR-02)

La ficha FR-02 llega del submódulo de interpretación con: letras corpóreas con luz, frente del local que da a la calle, 3 m de largo total y montaje sobre la marquesina a 4 m de altura. Trae la restricción del cliente RC1 (plazo antes de la inauguración) y la advertencia AV2 (la foto de referencia solo vale para la tipografía). **No indica** material, tecnología de iluminación, ubicación de la fuente ni estado de la marquesina.

| Instancia | Frame | Valores relevantes | Regla |
|---|---|---|---|
| CFG-01 | Configuración | ficha = FR-02; estado = evaluada | — |
| CA-01 | Cartel (Corpóreo) | largo_total = 3 m; iluminación = sí; materiales = no_definido | — |
| EN-01 | Entorno (Exterior expuesto) | ubicación = exterior, frente a la calle; protección_superior = ninguna; altura = 4 m | — |
| EX-01 | Exposición ambiental | nivel = alta | R-MI-02 |
| MI-01 / SO-01 | Método / Soporte | sobre estructura / marquesina, estado = no_verificado | — |
| RQ-01, RQ-02 | Requisito de material | cuerpo y frente aptos para exterior y UV; componentes con protección contra agua | R-MI-13 |
| CI-01 | Condición de instalación | relevar la marquesina y fijar a su estructura portante | R-MI-14 |
| CI-02 | Condición de instalación | fuente accesible sin desmontar las letras y protegida | R-MI-13 |
| VP-01 | Verificación profesional | tipo = estructural; motivo = altura y viento | R-MI-06 |
| DI-01 | Dictamen | resultado = apto_con_condiciones | R-MI-11 |

**Recorrido conceptual**

1. **Datos mínimos.** Están el entorno, el método y soporte, y las dimensiones, así que R-MI-01 no se dispara y el caso se habilita. Que falte el material no frena la evaluación (M3).
2. **Exposición.** Exterior, frente a la calle y arriba de la marquesina, sin nada que cubra las letras: R-MI-02 interpreta exposición alta. Se revisa R-MI-08, pero no hay alero ni nicho.
3. **Materiales y componentes.** Como no están definidos, R-MI-13 convierte R-MI-04 y R-MI-03 en requisitos: RQ-01 (cuerpo y frente aptos para exterior y UV; según las fichas técnicas del filamento y el criterio de Luciano, el PLA no está indicado) y RQ-02 (protección contra agua de tiras, fuente y conexiones, con grado IP a validar).
4. **Soporte.** Se sabe que es una marquesina pero no su estado ni su estructura. No hay datos para decir que no aguanta (R-MI-05 no se puede evaluar), pero tampoco para darlo por bueno: R-MI-14 agrega la condición CI-01.
5. **Viento y altura.** Son 3 m de letras a 4 m sobre la vereda y expuestas al viento. Está cerca del «tamaño intermedio» del cuaderno; con el criterio conservador de R-MI-06 se marca VP-01.
6. **Mantenimiento.** La ubicación de la fuente no está definida y el cartel queda en altura, así que R-MI-13 agrega CI-02.
7. **Dictamen.** No hay restricciones excluyentes y todo lo detectado se resuelve con requisitos, condiciones o la verificación: R-MI-11 emite **apto con condiciones**.

DI-01 llega al submódulo de Luciano con RQ-01 y RQ-02. Ahí su regla R7 elige PETG por entorno exterior y R3 segmenta letra por letra porque el largo supera la cama de la impresora. Este submódulo no elige el material, pero deja la evidencia que esa regla necesita.

### Caso 2 — Cartel de Neón LED en bandera (FR-07)

Un bar pide un cartel de Neón LED doble faz sobre placa de acrílico, de 1,2 × 0,8 m, en bandera (perpendicular a la fachada) sobre la vereda, a 3 m de altura. La fachada es de mampostería y tiene un alero de 0,4 m. El cliente quiere reutilizar el Neón LED y la fuente de un cartel que tenía dentro del local (preferencia), y la fuente iría dentro de la caja, cerrada.

| Instancia | Frame | Valores relevantes | Regla |
|---|---|---|---|
| CFG-02 | Configuración | ficha = FR-07; estado = evaluada | — |
| CA-02 | Cartel (Neón LED) | 1,2 × 0,8 m; doble_faz = sí; placa de acrílico | — |
| EN-02 | Entorno (Exterior expuesto) | protección_superior = alero 0,4 m; el cartel sobresale 1,0 m; altura = 3 m | — |
| EXC-01 | Excepción | tipo = alero; aplica = no (alcance_protección = no_cubre) | R-MI-08 |
| EX-02 | Exposición ambiental | nivel = alta | R-MI-02 |
| CE-01 | Componente (Tira de Neón LED) | uso_declarado = interior; sin protección contra agua | — |
| CE-02 | Componente (Fuente) | uso_declarado = interior; ubicación = interna_cerrada; accesible = no | — |
| MI-02 / SO-02 | Método / Soporte | bandera / mampostería | — |
| R-01 | Restricción eléctrica | causa = CE-01, CE-02, EX-02; severidad = excluyente | R-MI-03 |
| R-02 | Restricción de mantenimiento | causa = CE-02; severidad = corregible | R-MI-07 |
| VP-02 | Verificación profesional | tipo = estructural; motivo = bandera sobre vereda y viento | R-MI-06 |
| DI-02 | Dictamen | resultado = no_apto | R-MI-12 |

**Recorrido conceptual**

1. **Datos mínimos.** Están entorno, método, soporte y dimensiones: el caso se habilita.
2. **Exposición y excepción.** El alero podría bajar la exposición (R-MI-08), pero cubre 0,4 m y el cartel sobresale 1,0 m. La excepción se evalúa y no se cumple; es justamente un caso límite del cuaderno. R-MI-02 interpreta exposición alta.
3. **Componentes.** El Neón LED y la fuente son de interior, sin protección contra agua, con exposición alta: R-MI-03 registra R-01 como excluyente. La preferencia de reutilizarlos no cambia la restricción; queda para que Luciano la considere al buscar alternativas.
4. **Soporte y método.** La mampostería en principio es un buen soporte, pero un cartel en bandera sobre la vereda trabaja como palanca y recibe viento: R-MI-06 marca VP-02 y el submódulo no resuelve la fijación por su cuenta.
5. **Mantenimiento.** La fuente queda cerrada dentro de la caja a 3 m: R-MI-07 registra R-02, corregible (fuente accesible y protegida), pero no alcanza para cambiar el dictamen.
6. **Dictamen.** Hay una restricción excluyente, así que R-MI-12 tiene prioridad sobre R-MI-11 y emite **no apto**.

DI-02 pasa al submódulo de Luciano con R-01, R-02 y sus causas. Proponer otros componentes o reubicar la fuente ya es rediseño; lo que este submódulo deja claro es por qué el cartel, tal como se pidió, no puede instalarse.

---

## e) Red Semántica Instanciada

Las Figuras 2 y 3 muestran los dos casos al cierre de la evaluación. Cada nodo es una instancia (identificador : frame) con sus valores relevantes, y las aristas usan solo los verbos de la red conceptual. Junto a cada relación generada por inferencia se indica entre corchetes la regla que la produce, para poder seguir el razonamiento desde la ficha hasta el dictamen.

- **Caso 1 (Figura 2).** La ficha alimenta la configuración; el cartel se instala en un entorno interpretado como exposición alta y se monta sobre una marquesina de estado desconocido (borde discontinuo). Como no hay restricciones, la parte de abajo de la red son todas salidas en amarillo: dos requisitos para el material que todavía no se eligió, dos condiciones y la verificación estructural. La línea punteada entre la exposición y RQ-01 muestra que el requisito depende del nivel interpretado.
- **Caso 2 (Figura 3).** Aparecen dos restricciones (rojo) unidas por causada_por a los componentes y a la exposición. La excepción del alero figura con borde discontinuo porque se evaluó y no se cumplió: queda registrado por qué no bajó el nivel de exposición. El dictamen reúne las restricciones y señala la verificación profesional.

**Convenciones (Figuras 2 y 3):** verde: dato confirmado en la ficha · gris: valor interpretado por el submódulo · rojo: restricción · amarillo: requisito, condición o verificación · azul: dictamen · borde discontinuo: dato desconocido, excepción no aplicada, clase de la que es instancia o elemento de otro submódulo · flecha punteada: interacción con otro submódulo · `[R-MI-xx]`: regla que genera la relación.

### Figura 2 — Caso 1 (ficha FR-02): dictamen apto con condiciones

**Nodos**

| Nodo | Valores | Color |
|---|---|---|
| FR-02 : Ficha | corpóreo con luz · exterior · 3 m · sobre marquesina a 4 m | externo (discontinuo) |
| CFG-01 : Configuración | — | gris |
| CA-01 : Cartel | largo_total = 3 m · iluminación = sí · material = *no definido* | verde |
| EN-01 : Entorno | frente a la calle · sin alero · altura = 4 m | verde |
| MI-01 : Método | sobre estructura (marquesina) | verde |
| EX-01 : Exposición | nivel = alta | gris (interpretado) |
| SO-01 : Soporte | marquesina · estado = *desconocido* | discontinuo |
| DI-01 : Dictamen | APTO CON CONDICIONES | azul |
| RQ-01 : Requisito | cuerpo y frente aptos para exterior y UV (PLA no indicado) | amarillo |
| RQ-02 : Requisito | componentes eléctricos con protección contra agua (IP a validar) | amarillo |
| CI-01 : Condición | relevar marquesina y fijar a su estructura portante | amarillo |
| CI-02 : Condición | fuente accesible y protegida | amarillo |
| VP-01 : Verificación | estructural (altura + viento) | amarillo |
| Corpóreo, Exterior expuesto | clases | discontinuo |
| Submódulo de manufacturabilidad (L. Marquesini) | — | externo |

**Aristas**

| Origen | Relación | Destino |
|---|---|---|
| FR-02 | alimenta | CFG-01 |
| CFG-01 | describe | CA-01 |
| CFG-01 | recibe [R-MI-11] | DI-01 |
| CFG-01 | requiere [R-MI-06] | VP-01 |
| CA-01 | es_un | Corpóreo |
| CA-01 | se_instala_en | EN-01 |
| CA-01 | se_monta_mediante | MI-01 |
| EN-01 | es_un | Exterior expuesto |
| EN-01 | se_interpreta_como [R-MI-02] | EX-01 |
| MI-01 | se_apoya_en | SO-01 |
| EX-01 | condiciona (punteada) | RQ-01 |
| DI-01 | establece [R-MI-13 + 04] | RQ-01 |
| DI-01 | establece [R-MI-13 + 03] | RQ-02 |
| DI-01 | impone [R-MI-14] | CI-01 |
| DI-01 | impone [R-MI-13] | CI-02 |
| DI-01 | alimenta (punteada) | Submódulo de manufacturabilidad (L. Marquesini) |
| DI-01 | señala | VP-01 |

### Figura 3 — Caso 2 (ficha FR-07): dictamen no apto

**Nodos**

| Nodo | Valores | Color |
|---|---|---|
| FR-07 : Ficha | Neón LED doble faz en bandera sobre la vereda · 3 m de altura | externo (discontinuo) |
| CFG-02 : Configuración | — | gris |
| CA-02 : Cartel | 1,2 × 0,8 m · doble faz · placa de acrílico | verde |
| EN-02 : Entorno | exterior · alero de 0,4 m · cartel sobresale 1,0 m | verde |
| EXC-01 : Excepción | alero efectivo → *no aplica* | discontinuo |
| MI-02 : Método | bandera (perpendicular) | verde |
| EX-02 : Exposición | nivel = alta | gris (interpretado) |
| SO-02 : Soporte | mampostería | verde |
| CE-01 : Componente | Neón LED de interior · protección contra agua = no | verde |
| CE-02 : Componente | fuente de interior dentro de caja cerrada | verde |
| R-01 : R. eléctrica | severidad = excluyente | rojo |
| R-02 : R. mantenimiento | severidad = corregible | rojo |
| DI-02 : Dictamen | NO APTO | azul |
| VP-02 : Verificación | estructural (bandera + viento) | amarillo |
| Neón LED, Exterior expuesto | clases | discontinuo |
| Submódulo de manufacturabilidad (L. Marquesini) | — | externo |

**Aristas**

| Origen | Relación | Destino |
|---|---|---|
| FR-07 | alimenta | CFG-02 |
| CFG-02 | describe | CA-02 |
| CFG-02 | presenta [R-MI-03] | R-01 |
| CFG-02 | presenta [R-MI-07] | R-02 |
| CFG-02 | recibe [R-MI-12] | DI-02 |
| CFG-02 | requiere [R-MI-06] | VP-02 |
| CA-02 | se_instala_en | EN-02 |
| CA-02 | se_monta_mediante | MI-02 |
| CA-02 | es_un | Neón LED |
| CA-02 | incorpora | CE-01 |
| CA-02 | incorpora | CE-02 |
| EN-02 | es_un | Exterior expuesto |
| EN-02 | se_interpreta_como [R-MI-02] | EX-02 |
| EXC-01 | ajusta [R-MI-08] (no se cumple) | EX-02 |
| MI-02 | se_apoya_en | SO-02 |
| R-01 | causada_por | EX-02 |
| R-01 | causada_por | CE-01 |
| R-01 | causada_por | CE-02 |
| R-02 | causada_por | CE-02 |
| DI-02 | reúne | R-01 |
| DI-02 | reúne | R-02 |
| DI-02 | alimenta (punteada) | Submódulo de manufacturabilidad (L. Marquesini) |
| DI-02 | señala | VP-02 |

---

## f) Diccionario de Frames

Cada concepto principal de la red se representa como un frame. Los slots son sus atributos; las facetas indican valores permitidos, cardinalidad, valor por defecto o restricciones; y los demonios son procedimientos que se ejecutan cuando un slot se completa (*si_añadido*), cuando se necesita su valor y no lo tiene (*si_necesario*) o cuando cambia (*si_modificado*). Siguiendo la devolución, la configuración del cartel es el frame central, y los slots que dependen de criterios no relevados (capacidad del soporte, grado IP exigido, umbral de porte) llevan la faceta «a validar».

### FRAME: CONFIGURACIÓN_CARTEL

- **Descripción:** Combinación que se evalúa. Es el frame central del submódulo.
- **Origen en PI1:** §2; etapa 1 · **Herencia:** frame raíz

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| ficha | FICHA_REQUERIMIENTOS | Cardinalidad 1 | si_añadido: completar cartel, entorno y soporte con los datos confirmados |
| cartel | CARTEL | Cardinalidad 1 | — |
| entorno | ENTORNO | Cardinalidad 1; bloqueante | si_necesario: crear Solicitud de datos faltantes (R-MI-01) |
| soporte | SOPORTE | Cardinalidad 1; bloqueante | si_necesario: ídem |
| método | {adosado, bandera, colgado, sobre_estructura} | Cardinalidad 1; bloqueante | si_necesario: ídem |
| estado | {pendiente_de_datos, habilitada, evaluada} | Defecto: pendiente_de_datos | si_modificado: al pasar a habilitada, disparar R-MI-02 a R-MI-09, R-MI-13 y R-MI-14 |
| restricciones | Lista de RESTRICCIÓN | Cardinalidad 0..n | si_añadido: recalcular el dictamen |
| verificaciones | Lista de VERIFICACIÓN_PROFESIONAL | Cardinalidad 0..n | — |
| dictamen | DICTAMEN_ADECUACIÓN | Cardinalidad 0..1; solo si estado = evaluada | — |

### FRAME: CARTEL

- **Descripción:** Producto que se va a instalar.
- **Origen en PI1:** §10; entradas · **Herencia:** raíz de NEÓN_LED, CORPÓREO y RETROILUMINADO

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| tipo | {neón_led, corpóreo, retroiluminado} | Cardinalidad 1; lo fija la especialización | — |
| dimensiones | ancho × alto (m) o largo_total (m) | > 0; bloqueante | — |
| peso_estimado | kg | Opcional; estimación del experto (criterio a validar) | si_necesario: estimar a partir de dimensiones y materiales |
| materiales | Lista de MATERIAL | Cardinalidad 0..n; vacía = no_definido | si_necesario: aplicar R-MI-13 |
| componentes | Lista de COMPONENTE_ELÉCTRICO | Cardinalidad 0..n | — |
| iluminación | {sí, no} | Cardinalidad 1 | — |
| doble_faz | {sí, no} | Defecto: no | — |

**Especializaciones:** CORPÓREO (letras independientes; usa largo_total) · NEÓN_LED (componentes incluye una tira de Neón LED; placa base de acrílico) · RETROILUMINADO (caja con frente difusor; fuente generalmente interna).

### FRAME: ENTORNO

- **Descripción:** Lugar donde queda el cartel y condiciones a las que lo somete.
- **Origen en PI1:** §2; etapa 3 · **Herencia:** raíz de INTERIOR, EXTERIOR_PROTEGIDO y EXTERIOR_EXPUESTO

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| ubicación | {interior, exterior} | Cardinalidad 1; bloqueante | — |
| protección_superior | {ninguna, alero, nicho, marquesina} | Defecto: ninguna | si_añadido: evaluar la excepción R-MI-08 |
| alcance_protección | {cubre, no_cubre} | Solo si protección ≠ ninguna; qué es un alero «efectivo»: a validar | — |
| humedad | {normal, alta} | Defecto: normal | si_añadido: si alta e interior → R-MI-09 |
| sol_directo | {sí, no} | Defecto: no | si_añadido: si sí e interior → R-MI-09 |
| altura | m | > 0; postergable | — |
| exposición | {baja, media, alta} | Cardinalidad 1; valor calculado | si_necesario: calcular con R-MI-02, R-MI-08 y R-MI-09 |

### FRAME: MATERIAL

- **Descripción:** Material del cuerpo, frente, difusor o placa base.
- **Origen en PI1:** §2; etapa 4; M2 · **Herencia:** raíz de PLA, PETG y ACRÍLICO

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| tipo | {PLA, PETG, acrílico} | Cardinalidad 1 | — |
| función | {cuerpo, frente, difusor, placa_base} | Cardinalidad 1..n | — |
| apto_exterior | {sí, no, a_validar} | Fuente: fichas técnicas + experto | — |
| resistencia_UV | {baja, media, alta} | A validar con fichas técnicas | — |
| resistencia_térmica | {baja, media, alta} | A validar con fichas técnicas | — |

**Ejemplo:** PLA(función = cuerpo, apto_exterior = no) — dato documental de las fichas del filamento, coincidente con la regla R7 del PI2 de Luciano.

### FRAME: COMPONENTE_ELÉCTRICO

- **Descripción:** Elemento eléctrico del cartel.
- **Origen en PI1:** §2; etapa 6 · **Herencia:** raíz de TIRA_NEÓN_LED, TIRA_LED y FUENTE

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| tipo | {tira_neón_led, tira_led, fuente, conexión} | Cardinalidad 1 | — |
| uso_declarado | {interior, exterior} | Cardinalidad 1 | — |
| grado_IP | Código IEC 60529 | Opcional; el grado exigido por exposición es a validar | si_necesario: si falta y la exposición es alta, tratar como sin protección |
| ubicación | {interna_cerrada, interna_accesible, externa} | Solo para FUENTE | si_añadido: si interna_cerrada → evaluar R-MI-07 |
| accesible | {sí, no} | Solo para FUENTE | — |

### FRAME: SOPORTE

- **Descripción:** Superficie o estructura sobre la que se fija el cartel.
- **Origen en PI1:** §2; etapa 5 · **Herencia:** raíz de MAMPOSTERÍA, PLACA_DE_YESO, ESTRUCTURA_METÁLICA, MARQUESINA y VIDRIO

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| tipo | Una de las especializaciones | Cardinalidad 1; bloqueante | — |
| capacidad_relativa | {baja, media, alta} | A validar con Luciano; placa de yeso = baja (§6) | — |
| estado | {verificado, no_verificado, deficiente} | Defecto: no_verificado | si_añadido: si no_verificado → R-MI-14 |
| estructura_portante | {sí, no, desconocido} | Defecto: desconocido | si_añadido: si sí → habilita la excepción de R-MI-05 |
| fijación | SISTEMA_DE_FIJACIÓN | Cardinalidad 0..1 | — |

### FRAME: RESTRICCIÓN (abstracto)

- **Descripción:** Condición que impide o condiciona la configuración. No se instancia directamente.
- **Origen en PI1:** §2; etapas 4–6; M5 · **Herencia:** raíz de R_MATERIAL_ENTORNO, R_ELÉCTRICA, R_INSTALACIÓN y R_MANTENIMIENTO

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| tipo | {material_entorno, eléctrica, instalación, mantenimiento} | Lo fija la especialización | — |
| causa | MATERIAL \| COMPONENTE \| SOPORTE \| EXPOSICIÓN | Cardinalidad 1..n | — |
| severidad | {excluyente, corregible} | Material–entorno y eléctrica: excluyente por defecto | si_añadido: si corregible → crear la CONDICIÓN asociada |
| condición | CONDICIÓN_INSTALACIÓN | Obligatoria si severidad = corregible | — |
| regla_origen | ID de regla | Cardinalidad 1 | — |

### FRAME: DICTAMEN_ADECUACIÓN

- **Descripción:** Salida del submódulo hacia el rediseño y el fabricante.
- **Origen en PI1:** §2; etapa 8 · **Herencia:** frame raíz

| Slot | Tipo / valores permitidos | Facetas | Demonio |
|---|---|---|---|
| resultado | {apto, apto_con_condiciones, no_apto} | Cardinalidad 1 | si_necesario: aplicar R-MI-12, luego R-MI-11, luego R-MI-10 |
| restricciones | Lista de RESTRICCIÓN | Cardinalidad 0..n | — |
| condiciones | Lista de CONDICIÓN_INSTALACIÓN | Cardinalidad 0..n | — |
| requisitos | Lista de REQUISITO_MATERIAL | Cardinalidad 0..n | — |
| verificaciones | Lista de VERIFICACIÓN_PROFESIONAL | Cardinalidad 0..n; si hay alguna, resultado ≠ apto | — |
| reglas_aplicadas | Lista de IDs de regla | Cardinalidad 1..n | — |
| destinatarios | {manufacturabilidad, fabricante} | Cardinalidad 2 | si_añadido: enviar al submódulo de L. Marquesini |

### Frames secundarios

| Frame | Slots principales | Facetas / demonio |
|---|---|---|
| EXCEPCIÓN | tipo {alero, nicho, interior_húmedo, interior_con_sol, estructura_portante}; regla_afectada; efecto; aplica {sí, no} | Magnitud del efecto: a validar. Se conserva aunque aplica = no, para dejar registro. |
| CONDICIÓN_INSTALACIÓN | descripción; restricción_resuelta; regla_origen | restricción_resuelta 0..1 (puede venir de R-MI-13 o R-MI-14 sin restricción). |
| REQUISITO_MATERIAL | aplica_a {cuerpo, frente, componente}; exigencia; exposición_de_origen | si_añadido: se envía al submódulo de rediseño junto con el dictamen. |
| VERIFICACIÓN_PROFESIONAL | tipo {estructural, eléctrica}; motivo | Cardinalidad del motivo 1..n. |
| SOLICITUD_DATOS | dato_faltante; destino = submódulo de interpretación; estado {pendiente, respondida} | si_modificado: si respondida → reevaluar R-MI-01. |

---

## g) Reglas de conocimiento

Las reglas se escriben en lenguaje natural estructurado (SI … ENTONCES …) y referencian los slots de los frames para que después puedan pasarse a consultas Cypher. Todas son **crisp**: ante la misma situación producen siempre el mismo resultado. Cuando una regla depende de un criterio todavía no relevado (grado IP exigido, capacidad del soporte, umbral de porte), ese criterio figura como parámetro «a validar» y no como valor fijo. R-MI-01 a R-MI-11 vienen del PI1; R-MI-12 a R-MI-14 son nuevas.

**Orden de disparo.**
1. R-MI-01: si se dispara, la evaluación se detiene hasta tener el dato.
2. Interpretación del entorno: R-MI-02, R-MI-08 y R-MI-09.
3. Detección: R-MI-03 a R-MI-07, R-MI-13 y R-MI-14; se acumulan, no se cortan entre sí.
4. Dictamen: R-MI-12 tiene prioridad sobre R-MI-11, y R-MI-11 sobre R-MI-10.

### R-MI-01 · Datos mínimos incompletos

| Campo | Contenido |
|---|---|
| SI | falta Configuración.entorno, Configuración.soporte / método, o Cartel.dimensiones |
| ENTONCES | Configuración.estado ← pendiente_de_datos Y crear Solicitud de datos faltantes al submódulo de interpretación (no se completa por suposición) |
| Descripción y propósito | El experto no opina sin saber dónde va el cartel, sobre qué y de qué tamaño. Evita dictámenes basados en supuestos y responde las consultas de criticidad de Matías. |
| Evidencia utilizada | Slots entorno, soporte, método y dimensiones de la ficha. |
| Origen · Tipo | PI1 R-MI-01; etapa 2; M8 · Experto · Determinística |

### R-MI-02 · Exposición alta

| Campo | Contenido |
|---|---|
| SI | Entorno.ubicación = exterior Y (protección_superior = ninguna O alcance_protección = no_cubre) |
| ENTONCES | Entorno.exposición ← alta |
| Descripción y propósito | Un cartel exterior sin nada que lo cubra recibe sol, lluvia y viento de lleno. Fija el nivel que usan las reglas de materiales y componentes. |
| Evidencia utilizada | Ubicación, protección superior y alcance de la protección. |
| Origen · Tipo | PI1 R-MI-02; etapa 3 · Experto · Determinística en PI2 (candidata a difusa, ver i) |

### R-MI-03 · Componente eléctrico sin protección

| Campo | Contenido |
|---|---|
| SI | Entorno.exposición = alta Y un Componente eléctrico no tiene la protección contra agua que exige el experto (grado IP: a validar) |
| ENTONCES | crear R_ELÉCTRICA (severidad = excluyente; causa = componente y exposición) |
| Descripción y propósito | Lo eléctrico sin protección en exterior es el criterio excluyente más claro del submódulo. Evita fallas y riesgos para las personas. |
| Evidencia utilizada | uso_declarado y grado_IP del componente; nivel de exposición. |
| Origen · Tipo | PI1 R-MI-03 · IEC 60529 + experto · Determinística |

### R-MI-04 · Material no apto para exterior

| Campo | Contenido |
|---|---|
| SI | Entorno.exposición = alta Y Material.apto_exterior = no |
| ENTONCES | crear R_MATERIAL_ENTORNO (severidad = excluyente; causa = material) |
| Descripción y propósito | Materiales que se deforman o degradan con sol y temperatura, como el PLA. Evita deformación y decoloración en obra. |
| Evidencia utilizada | Tipo y apto_exterior del material; nivel de exposición. |
| Origen · Tipo | PI1 R-MI-04 · Fichas técnicas + experto (coincide con R7 de L. Marquesini) · Heurística |

### R-MI-05 · Soporte de baja capacidad

| Campo | Contenido |
|---|---|
| SI | Soporte.capacidad_relativa = baja Y Cartel.peso_estimado supera lo que el experto considera seguro para ese soporte (umbral: a validar) |
| ENTONCES | crear R_INSTALACIÓN (severidad = excluyente), SALVO que Soporte.estructura_portante = sí: en ese caso severidad = corregible y condición = fijar a la estructura portante |
| Descripción y propósito | Por ejemplo, una caja retroiluminada sobre placa de yeso. La excepción viene del cuaderno (§6). Evita desprendimientos. |
| Evidencia utilizada | Tipo y capacidad del soporte, peso estimado, existencia de estructura portante. |
| Origen · Tipo | PI1 R-MI-05; §6 · Experto · Heurística |

### R-MI-06 · Derivación a verificación profesional

| Campo | Contenido |
|---|---|
| SI | el cartel es de gran porte (umbral: a validar) O Configuración.método = bandera O está en altura con exposición al viento |
| ENTONCES | crear Verificación profesional (tipo = estructural) Y el dictamen no puede ser apto |
| Descripción y propósito | El sistema no resuelve con reglas empíricas lo que requiere un cálculo. Respeta el límite profesional que marcó la devolución. |
| Evidencia utilizada | Dimensiones, método, altura y exposición. |
| Origen · Tipo | PI1 R-MI-06 · Experto + CIRSOC 102 · Contextual |

### R-MI-07 · Fuente sin acceso

| Campo | Contenido |
|---|---|
| SI | Fuente.ubicación = interna_cerrada Y Fuente.accesible = no |
| ENTONCES | crear R_MANTENIMIENTO (severidad = corregible) con condición = fuente accesible y protegida |
| Descripción y propósito | La fuente es lo que más falla; si no se puede cambiar, una falla chica obliga a bajar todo el cartel. |
| Evidencia utilizada | Ubicación y accesibilidad de la fuente; altura. |
| Origen · Tipo | PI1 R-MI-07 · Experto · Heurística |

### R-MI-08 · Excepción por alero o nicho

| Campo | Contenido |
|---|---|
| SI | Entorno.ubicación = exterior Y protección_superior ∈ {alero, nicho} Y alcance_protección = cubre |
| ENTONCES | Entorno.exposición ← media (en lugar de alta; magnitud a validar) |
| Descripción y propósito | Un alero o nicho efectivo protege de la lluvia directa. Evita exigir de más en casos protegidos. |
| Evidencia utilizada | Tipo y alcance de la protección. |
| Origen · Tipo | PI1 R-MI-08; §6 · Experto · Contextual |

### R-MI-09 · Interior con condiciones de exterior

| Campo | Contenido |
|---|---|
| SI | Entorno.ubicación = interior Y (humedad = alta O sol_directo = sí) |
| ENTONCES | Entorno.exposición ← media (alta si se dan las dos) |
| Descripción y propósito | Cocinas, natatorios o vidrieras al sol. Evita que todo lo «interior» se trate como exposición baja. |
| Evidencia utilizada | Humedad y sol directo del entorno. |
| Origen · Tipo | PI1 R-MI-09; §5–§6 · Experto · Contextual |

### R-MI-10 · Dictamen apto

| Campo | Contenido |
|---|---|
| SI | Configuración.estado = habilitada Y no hay restricciones, condiciones, requisitos ni verificaciones |
| ENTONCES | Dictamen.resultado ← apto Y derivar al submódulo de manufacturabilidad |
| Descripción y propósito | Confirma la configuración sin agregar condiciones innecesarias. |
| Evidencia utilizada | Listas del dictamen vacías. |
| Origen · Tipo | PI1 R-MI-10 · Experto · Determinística |

### R-MI-11 · Dictamen apto con condiciones

| Campo | Contenido |
|---|---|
| SI | no hay restricciones excluyentes Y existe al menos una restricción corregible, condición, requisito o verificación |
| ENTONCES | Dictamen.resultado ← apto_con_condiciones Y listar cada condición, requisito y verificación |
| Descripción y propósito | La configuración sirve si se cumplen las condiciones. En PI1 era heurística; ahora es determinística porque la severidad la deciden las reglas anteriores. |
| Evidencia utilizada | Severidad de las restricciones; listas del dictamen. |
| Origen · Tipo | PI1 R-MI-11 · Experto · Determinística |

### R-MI-12 · Dictamen no apto (nueva)

| Campo | Contenido |
|---|---|
| SI | existe al menos una Restricción con severidad = excluyente |
| ENTONCES | Dictamen.resultado ← no_apto Y listar todas las restricciones con su causa Y derivar al submódulo de manufacturabilidad |
| Descripción y propósito | Tiene prioridad sobre R-MI-11. Muestra todas las causas juntas, como valoró la devolución, para que el rediseño sepa sobre qué actuar. |
| Evidencia utilizada | Severidad y causa de cada restricción. |
| Origen · Tipo | M6; etapa 8 · Experto · Determinística |

### R-MI-13 · Material o componente no definido (nueva)

| Campo | Contenido |
|---|---|
| SI | la ficha no define un material, un componente o la ubicación de la fuente |
| ENTONCES | no bloquear la evaluación Y crear Requisito de material equivalente a R-MI-03 / R-MI-04 según la exposición Y, si el cartel va en altura, condición = fuente accesible |
| Descripción y propósito | El material lo elige el submódulo de rediseño; este submódulo le deja lo que tiene que cumplir. |
| Evidencia utilizada | Slots vacíos de la ficha; nivel de exposición; altura. |
| Origen · Tipo | M3; caso FR-02 · Experto · Inferencial |

### R-MI-14 · Soporte no verificado (nueva)

| Campo | Contenido |
|---|---|
| SI | Soporte.estado = no_verificado Y R-MI-05 no puede evaluarse por falta de datos del soporte |
| ENTONCES | crear Condición de instalación: relevar el soporte y fijar a su estructura portante antes de instalar |
| Descripción y propósito | No hay datos para rechazar el soporte, pero tampoco para darlo por bueno. |
| Evidencia utilizada | Estado del soporte y datos de capacidad. |
| Origen · Tipo | M7; §5 caso límite · Experto · Heurística |

---

## h) Clasificación del conocimiento

La tabla clasifica las reglas y conceptos modelados. Un mismo elemento puede tener más de una clasificación: por ejemplo, una regla puede ejecutarse de forma determinística aunque el criterio que usa sea heurístico.

| Elemento | Clasificación | Justificación |
|---|---|---|
| R-MI-01, R-MI-10, R-MI-11, R-MI-12 | Determinístico | Ante los mismos datos dan siempre el mismo resultado; controlan el proceso y no dependen del juicio del experto. |
| R-MI-03; grado de protección IP | Documental + determinístico | El significado del código IP sale de la IEC 60529. Lo que falta relevar es qué grado exige el experto en cada caso. |
| R-MI-04; apto_exterior del material | Documental + empírico | Las fichas del filamento dan la temperatura de trabajo; la experiencia del taller confirma qué pasa al sol. |
| R-MI-05, R-MI-07, R-MI-14 | Heurístico | Reglas prácticas del fabricante (no colgar una caja pesada de placa de yeso sin ir al perfil). Funcionan en la mayoría de los casos, pero no son leyes. |
| R-MI-06, R-MI-08, R-MI-09 | Contextual | La misma configuración se evalúa distinto según el lugar: bandera, alero, cocina o vidriera. |
| Excepciones del cuaderno (§6) | Empírico | Salen de trabajos que fallaron en obra (incidentes críticos), no de un documento. |
| R-MI-13; inferencias («fachada norte sin alero → sol alto») | Inferencial | Deducen información que no está explícita en la ficha. |
| Capacidad y estado del soporte; alero «efectivo» | Subjetivo | Dependen de cómo el experto mira el lugar; dos instaladores pueden evaluar distinto la misma pared. |
| Exposición ambiental | Contextual + subjetivo | Combina varios factores del lugar y su valoración es gradual. Es el principal candidato a lógica difusa. |

---

## i) Elementos candidatos para lógica difusa

En PI2 estos elementos se representan con valores discretos para que las reglas sean crisp. Se identifican porque el experto no los evalúa como sí/no sino por grados; se retoman en PI3, donde se definirán las funciones de pertenencia con Luciano.

| Elemento | Cómo está en PI2 | Por qué no es binario | Términos lingüísticos |
|---|---|---|---|
| Exposición ambiental | R-MI-02, 08 y 09: baja / media / alta | Combina sol, lluvia, viento, altura y protección; un lugar puede estar «bastante» expuesto. | baja, media, alta |
| Porte del cartel y carga de viento | R-MI-06: gran porte sí / no | El cuaderno ya marcaba el «tamaño intermedio» como caso límite; el caso FR-02 quedó en esa frontera. | chico, intermedio, grande |
| Confiabilidad del soporte | capacidad_relativa y estado | Depende del estado real, del revoque y de la antigüedad. | poco confiable, aceptable, confiable |
| Efectividad de la protección | alcance_protección: cubre / no_cubre | Un alero protege en parte, según su ancho y la lluvia con viento. | nula, parcial, efectiva |
| Peso respecto del soporte | R-MI-05: umbral a validar | El peso es una estimación y la capacidad del soporte, una apreciación. | holgado, en el límite, excedido |
| Dificultad de instalación | No modelada como slot; aparece en VP y condiciones | Combina altura, acceso, soporte y tamaño sin un límite claro. | baja, media, alta |

---

## j) Referencias y fuentes consultadas

1. Cátedra de Inteligencia Artificial, UTN FRM (2026). Actividad PI2 – Unidad 1 (Individual): Documentación, Modelado mediante Redes Semánticas, Frames y Reglas.
2. Cátedra de Inteligencia Artificial, UTN FRM (2026). Apuntes U1b – Representación del conocimiento (redes semánticas, frames y reglas de producción).
3. Cátedra de Inteligencia Artificial, UTN FRM (2026). Apuntes U1a – Sistemas Expertos y Anexo: Guía de Adquisición de Conocimiento y Modelado.
4. Quiros, L. (2026). PI1: Evaluación de materiales y condiciones de instalación, y devolución de la cátedra.
5. Grupo 11 – 5K9 (2026). PG0: Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial.
6. Zarandon, M. (2026). PI2: Interpretación técnica de requerimientos y restricciones del cliente (ficha FR-02 y consultas Q1, Q2).
7. Marquesini, L. (2026). PI2: Evaluación de manufacturabilidad y alternativas de rediseño (alcance FDM, reglas R3 y R7).
8. International Electrotechnical Commission. IEC 60529: Degrees of protection provided by enclosures (IP Code).
9. INTI-CIRSOC (2005). Reglamento CIRSOC 102: Reglamento Argentino de Acción del Viento sobre las Construcciones.
10. Asociación Electrotécnica Argentina. AEA 90364: Reglamentación para la ejecución de instalaciones eléctricas en inmuebles.
11. Fuente experta: Luciano Marquesini, integrante del grupo con experiencia en fabricación e instalación de cartelería (Lux 3D).

> **Resultado del PI2.** El submódulo queda representado con una red semántica de 19 conceptos y 22 relaciones, dos casos instanciados que recorren los tres tipos de salida (requisitos, condiciones y restricciones), ocho frames principales y 14 reglas crisp con su origen en el PI1. Los criterios que la devolución pidió mantener como preliminares quedaron como parámetros «a validar» y los candidatos a lógica difusa quedaron identificados para el PI3.
