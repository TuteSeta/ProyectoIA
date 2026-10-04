# ACTIVIDAD PI2

INTELIGENCIA ARTIFICIAL

Integrante: Matias Zarandon

Profesores: Ing. Matilde Inés Césari — Ing. María Eugenia Stefanoni

## **b) Revisión del Cuaderno de Conocimiento**

La devolución de PI1 no exigió correcciones de fondo (riesgo verde), pero marcó el punto central de esta etapa: transformar los conceptos y decisiones identificados en relaciones, frames y reglas **sin convertir en definitivos criterios que todavía están pendientes de validación** , en particular la distinción entre información bloqueante y postergable y los criterios concretos de suficiencia.

Al intentar representar formalmente el Cuaderno aparecieron conceptos que estaban implícitos en el flujo, inconsistencias en las relaciones preliminares y reglas que necesitaban condiciones más precisas. Al recorrer los casos de uso regla por regla se detectaron además dos situaciones que el modelo no podía cerrar (una tecnología que quedaba siempre faltante y una advertencia sin regla que la generara) y la necesidad de fijar el orden de disparo de las reglas. Las modificaciones se incorporaron al Cuaderno de Conocimiento y se documentan a continuación.

### **Modificaciones realizadas**

|**N°**|**Tipo**|**Modificación**|**Motivo**|**Sección afectada**|
|---|---|---|---|---|
|**M1**|Concepto<br>faltante|Se incorpora**Expresión del cliente**:<br>fragmento literal del pedido (mensaje,<br>conversación o descripción) que se<br>conserva sin reescribir y del que se<br>derivan los datos.|El flujo trabaja sobre expresiones<br>(etapas 1 y 3) pero el glosario no<br>las definía. Permite trazar cada<br>dato hasta lo que el cliente dijo.|§2 Glosario; Flujo<br>etapas 1 y 3|
|**M2**|Concepto<br>faltante|**Referencia visual**pasa a ser un<br>concepto propio, con un atributo de<br>consistencia respecto del texto.|Figuraba como entrada y en el<br>primer caso límite, pero no en las<br>relaciones de §10.|Entradas; §5; §10|
|**M3**|Generalizació<br>n|Dato confirmado, faltante y ambiguo<br>se modelan como especializaciones<br>de un concepto general**Dato**. Se<br>agrega**Dato en conflicto**.|Comparten atributo, categoría,<br>valor y origen; la jerarquía evita<br>repetir slots y habilita herencia en<br>los frames.|§2 Glosario; §10|
|**M4**|Inconsistencia|**Contradicción**deja de ser un estado<br>del requerimiento y pasa a ser un<br>concepto relacional que involucra al<br>menos dos datos.|§10 decía «Requerimiento puede<br>presentar Contradicción», pero<br>una contradicción no es propiedad<br>de un dato aislado sino de la<br>relación entre dos o más.|§2 Glosario; §10|
|**M5**|Concepto<br>faltante|**Categoría de dato**:<br>producto/tecnología, dimensiones,<br>contexto de uso, entorno, instalación,<br>apariencia y restricciones.|La etapa 2 del flujo separa la<br>información por categorías que no<br>estaban representadas.|Flujo etapa 2|
|**M6**|Estado<br>faltante|**Estado del pedido**: en_interpretación,<br>pendiente_de_aclaración o<br>listo_para_evaluación.|Los puntos de decisión del<br>diagrama implican estos estados<br>sin nombrarlos.|Diagrama de<br>procesos; §1|
|**M7**|Atributo nuevo<br>(pendiente)|Atributo**criticidad**del dato faltante:<br>bloqueante, postergable o<br>sin_clasificar, con valor por defecto<br>_sin_clasificar_. No se asigna ningún<br>dato concreto a cada clase.|La devolución y la excepción 1<br>indican que la distinción existe,<br>pero el criterio sigue pendiente de<br>adquisición.|§6 Excepciones;<br>§9 pregunta 2|
|**M8**|Atributo nuevo|Atributo**rigidez**del requerimiento:<br>obligatoria, preferencia o a_confirmar.|Representa la duda del caso<br>límite 5 sin forzar una clasificación<br>binaria.|§5; §7 regla 5|
|**M9**|Concepto<br>faltante|**Advertencia**: elemento que viaja en la<br>ficha como incertidumbre y no como<br>hecho confirmado.|La pregunta experta 8 de PI1 no<br>tenía un concepto asociado.|Sección c),<br>pregunta 8|

|**N°**|**Tipo**|**Modificación**|**Motivo**|**Sección afectada**|
|---|---|---|---|---|
|**M10**|Relación y<br>concepto<br>faltantes|Relación**requiere_consulta_a**entre<br>un dato y un submódulo de<br>evaluación, materializada como<br>**Consulta a submódulo**.|La excepción 3 y la regla<br>candidata 10 no tenían relación<br>en §10.|§6; §7 regla 10;<br>§10|
|**M11**|Reglas<br>incompletas|La regla 7 (entorno/instalación) se<br>integra como caso particular de la<br>regla 2. La regla 8 (suficiencia) se<br>reescribe con condiciones explícitas<br>sobre los estados del modelo. La regla<br>9 (no inventar) pasa a ser también una<br>faceta del slot_origen_.|Las reglas 7 a 9 dependían de<br>condiciones no representadas.|§7 Reglas<br>candidatas|
|**M12**|Reglas<br>faltantes|Se agregan una regla de ciclo (la<br>respuesta a una aclaración reingresa<br>como nueva expresión) y una regla de<br>herencia de incertidumbre hacia la<br>ficha.|La flecha «Nueva info» del<br>diagrama y la pregunta experta 8<br>no tenían regla asociada.|Diagrama de<br>procesos; §7|
|**M13**|Relación<br>faltante|Relación**omite**(Pedido → Dato<br>faltante): el faltante surge de comparar<br>los datos requeridos con lo aportado,<br>no de una expresión del cliente.|La etapa 4 del flujo detecta<br>ausencias, pero la red no tenía<br>una relación que las representara.|Flujo etapa 4; §7<br>regla 2|
|**M14**|Relación y<br>criterio<br>faltantes|Relación**cubre**(Necesidad funcional<br>→ Categoría de dato). Un atributo<br>requerido de la categoría<br>producto/tecnología queda cubierto si<br>existe una necesidad funcional que<br>describe el efecto buscado.|Con el conjunto provisional de<br>datos requeridos, la tecnología<br>quedaba siempre faltante cuando<br>el cliente describe un efecto: la<br>regla 2 la reclamaba y la regla 6<br>prohíbe elegirla en este<br>submódulo.|§7 reglas 2, 6 y 8|
|**M15**|Estado<br>faltante|Estado**descartado**del dato y<br>reclasificación de instancias: cuando<br>un dato cambia de estado pasa a la<br>especialización correspondiente.|Al resolver una contradicción o<br>una ambigüedad, los datos no<br>validados no tenían estado y los<br>validados cambiaban de clase sin<br>que el modelo lo describiera.|§2 Glosario; Flujo<br>etapas 5 y 6|
|**M16**|Regla<br>incompleta|La regla de herencia de incertidumbre<br>se amplía a las referencias visuales<br>cuyo alcance quedó restringido tras<br>una aclaración.|La advertencia sobre el alcance<br>de una referencia visual (caso 2)<br>no tenía regla que la generara.|§5 caso límite 1;<br>pregunta experta<br>8|
|**M17**|Control del<br>razonamiento|Se define una**estrategia de**<br>**resolución de conflictos**(orden de<br>disparo de las reglas) y se establece<br>que sólo la regla de suficiencia asigna<br>el estado listo_para_evaluación.|Una misma expresión podía<br>activar dos reglas (ambigüedad y<br>necesidad funcional), y el<br>demonio de aclaraciones<br>contradecía la regla de<br>suficiencia.|Diagrama de<br>procesos; §7|

**Estado de validación.** PI2 formaliza el conocimiento candidato relevado en PI1. Las reglas mantienen el estado _pendiente de validación con la fuente experta_ hasta completar las sesiones de pensamiento en voz alta previstas. No se fija como definitivo ningún umbral, ningún conjunto de datos obligatorios por tipo de cartel ni ningún criterio de suficiencia; donde el modelo los necesita, se representan como parámetros con valor provisional o «sin clasificar».

### **Conceptos y elementos identificados**

La siguiente tabla clasifica los elementos del modelo según las categorías que pide la consigna (concepto principal, entidad, estado, evento, evidencia, acción y restricción) e indica su origen en el Cuaderno de Conocimiento de PI1. En la red (sección c) los mismos

elementos se tipifican como entidad, concepto o atributo, siguiendo la plantilla de la cátedra.

|**Elemento**|**Tipo**|**Descripción**|**Origen en el Cuaderno**|
|---|---|---|---|
|**Pedido**|Concepto<br>principal|Unidad de trabajo que se interpreta;<br>agrupa expresiones, referencias, datos<br>y aclaraciones.|§2 Glosario; Flujo etapa 1|
|**Requerimiento**|Concepto<br>principal|Necesidad o condición que debe<br>quedar representada para evaluar el<br>trabajo.|§2 Glosario; §10|
|**Dato**|Concepto<br>principal|Valor de un atributo del pedido (p. ej.,<br>entorno, dimensión), con estado y<br>origen.|§2 Glosario (generalizado,<br>M3)|
|**Aclaración**|Concepto<br>principal|Pregunta dirigida al cliente para<br>resolver un faltante, una ambigüedad,<br>una contradicción o una rigidez<br>dudosa.|Flujo etapa 6; §10|
|**Ficha de requerimientos**<br>**interpretados**|Concepto<br>principal|Salida estructurada que se deriva a los<br>submódulos de evaluación.|§2 Glosario; Flujo etapa 8|
|**Cliente**|Entidad|Quien formula el pedido y responde las<br>aclaraciones.|§10|
|**Expresión del cliente**|Entidad|Fragmento literal del pedido.|Flujo etapas 1 y 3 (M1)|
|**Referencia visual**|Entidad /<br>evidencia|Imagen o boceto aportado por el<br>cliente.|Entradas; §5 (M2)|
|**Categoría de dato**|Entidad|Agrupación de atributos del pedido.|Flujo etapa 2 (M5)|
|**Contradicción**|Entidad relacional|Incompatibilidad entre dos o más<br>datos del mismo atributo.|§2 Glosario; Flujo etapa 5<br>(M4)|
|**Restricción del cliente /**<br>**Preferencia / Necesidad**<br>**funcional**|Conceptos (espe<br>cializaciones de<br>Requerimiento)|Tipos de requerimiento según su<br>rigidez y su forma de expresión.|§2 Glosario; §4; §10|
|**Submódulos de evaluación**|Entidades<br>externas|Materiales e instalación (L. Quiros);<br>manufacturabilidad y rediseño (L.<br>Marquesini).|Interacción con<br>submódulos; §10|
|**Advertencia / Consulta a**<br>**submódulo**|Entidades|Incertidumbre que viaja en la ficha;<br>consulta sobre la necesidad o<br>criticidad de un dato.|Pregunta 8; §6 (M9, M10)|
|**Estado del dato**|Estado|confirmado, faltante, ambiguo,<br>en_conflicto, descartado.|§2 Glosario (M15)|
|**Estado del pedido**|Estado|en_interpretación,<br>pendiente_de_aclaración,<br>listo_para_evaluación.|Diagrama de procesos<br>(M6)|
|**Rigidez**|Estado|obligatoria, preferencia, a_confirmar.|§5; §7 (M8)|
|**Criticidad del faltante**|Estado<br>(pendiente)|bloqueante, postergable, sin_clasificar.|§6; devolución PI1 (M7)|
|**Recepción del pedido**|Evento|Ingreso del pedido y del material<br>adjunto.|Flujo etapa 1|
|**Detección de ambigüedad /**<br>**faltante / contradicción**|Eventos|Momento en que el experto reconoce<br>un problema interpretativo.|Flujo etapas 3 a 5|
|**Respuesta a una aclaración**|Evento|Nueva información que reinicia el ciclo<br>de interpretación.|Diagrama («Nueva info»)|
|**Derivación del caso**|Evento|Envío de la ficha a los submódulos de<br>evaluación.|Flujo etapa 8|
|**Expresión literal, valor**<br>**informado, referencia visual**|Evidencias|Lo que el cliente efectivamente aportó.|Flujo etapa 1; §2|

|**Elemento**|**Tipo**|**Descripción**|**Origen en el Cuaderno**|
|---|---|---|---|
|**Declaración explícita de**<br>**obligatoriedad o de deseo**|Evidencia|Forma en que el cliente presenta una<br>condición.|§4; §7 reglas 4 y 5|
|**Ausencia de valor para un**<br>**dato requerido**|Evidencia|Falta de información necesaria para<br>otro submódulo.|Flujo etapa 4; §7 regla 2<br>(M13)|
|**Extraer, interpretar, solicitar**<br>**aclaración, registrar,**<br>**mantener conflicto,**<br>**descartar, consultar,**<br>**derivar**|Acciones|Operaciones del razonamiento<br>experto.|Flujo etapas 1 a 8|
|**No inventar valores; no**<br>**elegir una interpretación en**<br>**silencio; no resolver**<br>**cuestiones de otros**<br>**submódulos; no promover**<br>**preferencias a restricciones**|Restricciones del<br>conocimiento|Límites que el razonamiento no puede<br>violar.|§1 Alcance; §7 reglas 1, 5,<br>9 y 10; Criterio de validez|

### **Relaciones identificadas**

Las relaciones tienen dirección y se nombran con verbos. Para cada una se indica si es **determinística** (se establece siempre que existan los nodos) o **heurística** (depende del juicio del experto), su cardinalidad y la parte del Cuaderno de la que surge. Se usa el prefijo RL para no confundirlas con las reglas (R01 a R13).

|**ID**|**Nodo origen**|**Relación**|**Nodo destino**|**Tipo**|**Card.**|**Origen en PI1**|
|---|---|---|---|---|---|---|
|**RL01**|Cliente|formula|Pedido|Det.|1:N|§10|
|**RL02**|Pedido|contiene|Expresión del cliente|Det.|1:N|Flujo etapa 1; §10|
|**RL03**|Pedido|incluye|Referencia visual|Det.|1:N|Entradas (M2)|
|**RL04**|Pedido|tiene_estado|Estado del pedido|Det.|N:1|Diagrama (M6)|
|**RL05**|Expresión del cliente|se_interpreta_co<br>mo|Requerimiento|Heur.|N:N|Flujo etapa 3; §10|
|**RL06**|Expresión del cliente|aporta|Dato|Heur.|1:N|Flujo etapas 1 y 2|
|**RL07**|Referencia visual|aporta|Dato|Heur.|1:N|Entradas; §5|
|**RL08**|Requerimiento|se_describe_med<br>iante|Dato|Det.|1:N|§10 (reformulada)|
|**RL09**|Dato|pertenece_a|Categoría de dato|Det.|N:1|Flujo etapa 2 (M5)|
|**RL10**|Contradicción|involucra|Dato en conflicto|Det.|N:M (≥ 2 por<br>contradicción<br>)|Flujo etapa 5 (M4)|
|**RL11**|Dato faltante / Dato<br>ambiguo /<br>Contradicción|provoca|Aclaración|Det.|1:1|Diagrama; §7 reglas 1<br>a 3|
|**RL12**|Submódulo de<br>interpretación|solicita|Aclaración|Det.|1:N|§10|
|**RL13**|Aclaración|se_dirige_a|Cliente|Det.|N:1|Flujo etapa 6|
|**RL14**|Aclaración<br>(respondida)|actualiza|Pedido|Det.|N:1|Diagrama («Nueva<br>info»)|
|**RL15**|Submódulo de<br>interpretación|evalúa_suficienci<br>a_de|Pedido|Det.|1:N|Tarea secundaria de<br>evaluación|
|**RL16**|Dato faltante|requiere_consulta<br>_a|Submódulo de<br>evaluación|Heur.|N:1|§6 excepción 3; §7<br>regla 10 (M10)|

|**ID**|**Nodo origen**|**Relación**|**Nodo destino**|**Tipo**|**Card.**|**Origen en PI1**|
|---|---|---|---|---|---|---|
|**RL17**|Submódulo de<br>interpretación|produce|Ficha de<br>requerimientos<br>interpretados|Det.|1:N|§10|
|**RL18**|Ficha|registra|Dato confirmado|Det.|1:N|§2 Glosario|
|**RL19**|Ficha|preserva|Restricción del<br>cliente|Det.|1:N|§7 regla 4|
|**RL20**|Ficha|incluye|Advertencia|Det.|1:N|Pregunta experta 8<br>(M9)|
|**RL21**|Ficha|alimenta|Submódulo de<br>evaluación|Det.|N:N|§10|
|**RL22**|Especializaciones<br>(ver tabla de<br>jerarquías)|es_un|Dato /<br>Requerimiento /<br>Submódulo de<br>evaluación|Det.|N:1|§2; §10; PG0|
|**RL23**|Pedido|omite|Dato faltante|Det.|1:N|Flujo etapa 4; §7 regla<br>2 (M13)|
|**RL24**|Necesidad funcional|cubre|Categoría de dato|Heur.|N:1|§7 regla 6 (M14)|

## **c) Red Semántica Conceptual**

La red representa el conocimiento del submódulo como un grafo dirigido. Los nodos son conceptos del dominio y las aristas son relaciones nombradas con verbos. Se organiza en tres zonas que siguen el razonamiento del experto descripto en PI1:

- **Entrada:** Cliente, Pedido, Expresión del cliente y Referencia visual. Representan lo que el cliente aportó, conservado de forma literal.

- **Núcleo interpretativo:** Requerimiento, Dato, Categoría de dato y Contradicción, con sus especializaciones. Aquí se registra qué se entendió, qué falta, qué es ambiguo y qué está en conflicto.

- **Salida:** Aclaración (que vuelve al Cliente y reabre el ciclo) y Ficha de requerimientos interpretados (que alimenta a los submódulos de evaluación, junto con las advertencias).

#### **Nodos de la red**

El tipo de cada nodo sigue la plantilla de la cátedra (entidad, concepto o atributo). Los sinónimos registran cómo puede aparecer cada concepto en el lenguaje del fabricante o del cliente; servirán para eliminar redundancias al integrar la red grupal en PG1.

|**ID**|**Nodo / Concepto**|**Tipo**|**Descripción**|**Sinónimos**|
|---|---|---|---|---|
|N01|Cliente|Entidad|Quien formula el pedido y<br>responde aclaraciones|Solicitante, comitente|
|N02|Pedido|Entidad|Unidad de trabajo que se<br>interpreta|Solicitud, encargo,<br>consulta|
|N03|Expresión del cliente|Entidad|Fragmento literal del pedido|Frase, mención|
|N04|Referencia visual|Entidad|Imagen o boceto aportado por el<br>cliente|Foto de referencia,<br>boceto, ejemplo|
|N05|Requerimiento|Concepto|Necesidad o condición a<br>representar|Requisito, necesidad|
|N06|Restricción del cliente|Concepto<br>(especialización)|Condición declarada como<br>obligatoria|Condición obligatoria,<br>exigencia|
|N07|Preferencia|Concepto<br>(especialización)|Característica deseada y<br>negociable|Deseo, condición<br>negociable|
|N08|Necesidad funcional|Concepto<br>(especialización)|Efecto o uso buscado sin<br>solución técnica|Efecto buscado, intención<br>de uso|
|N09|Dato|Concepto|Valor de un atributo del pedido<br>con estado y origen|Información del pedido|
|N10|Dato confirmado|Concepto<br>(especialización)|Dato aportado, claro y<br>consistente|Dato validado|
|N11|Dato faltante|Concepto<br>(especialización)|Dato requerido que no fue<br>aportado|Pendiente, dato a<br>solicitar|
|N12|Dato ambiguo|Concepto<br>(especialización)|Dato con más de una lectura o<br>precisión insuficiente|Dato impreciso|
|N13|Dato en conflicto|Concepto<br>(especialización)|Dato incompatible con otro del<br>mismo atributo|Dato inconsistente|
|N14|Categoría de dato|Concepto|Agrupación de atributos del<br>pedido|Aspecto del pedido|
|N15|Contradicción|Concepto|Incompatibilidad entre dos o más<br>datos|Inconsistencia, conflicto|
|N16|Aclaración|Concepto|Pregunta al cliente para resolver<br>un problema interpretativo|Repregunta, consulta al<br>cliente|

|**ID**|**Nodo / Concepto**|**Tipo**|**Descripción**|**Sinónimos**|
|---|---|---|---|---|
|N17|Ficha de requerimientos<br>interpretados|Entidad|Salida estructurada del<br>submódulo|Ficha técnica<br>interpretada|
|N18|Advertencia|Concepto|Incertidumbre que viaja en la<br>ficha|Reserva, observación|
|N19|Estado del pedido|Atributo (estado)|Situación del pedido en el ciclo<br>de interpretación|Situación del pedido|
|N20|Submódulo de interpretación|Entidad|Agente que razona (rol del<br>experto)|Intérprete, proyectista|
|N21|Submódulo de evaluación|Entidad (externa)|Interfaz con los submódulos<br>siguientes|Módulo de evaluación|
|N22|Materiales y condiciones de<br>instalación|Entidad (externa)|Submódulo de L. Quiros|SM materiales|
|N23|Manufacturabilidad y<br>rediseño|Entidad (externa)|Submódulo de L. Marquesini|SM rediseño|

La «Consulta a submódulo» no se dibuja como nodo en la red conceptual: se representa mediante la relación requiere_consulta_a (RL16) y se materializa como frame y como instancia en los casos de uso.

#### **Jerarquías y especializaciones**

|**Concepto general**|**Conceptos especializados**|**Criterio de especialización**|**Origen**|
|---|---|---|---|
|**Dato**|Dato confirmado, Dato faltante,<br>Dato ambiguo, Dato en conflicto|Estado de la información: aportada y<br>consistente, ausente, con varias lecturas o<br>incompatible con otra. Una instancia<br>cambia de especialización cuando cambia<br>su estado (M15).|§2 Glosario (M3)|
|**Requerimiento**|Restricción del cliente,<br>Preferencia, Necesidad funcional|Rigidez y forma de expresión: obligatoria,<br>deseada o descripta como efecto|§2 Glosario; §10|
|**Submódulo de**<br>**evaluación**|Materiales y condiciones de<br>instalación; Manufacturabilidad y<br>rediseño|Dominio experto que evalúa la ficha|PG0|

#### **Asociaciones relevantes**

- **provoca** conecta los problemas interpretativos con la acción experta: un dato faltante, uno ambiguo o una contradicción generan una aclaración. Es la traducción directa de los puntos de decisión del diagrama de PI1.

- **involucra** vincula una contradicción con dos o más datos en conflicto, en lugar de tratarla como estado de un dato (M4).

- **omite** representa que un faltante no nace de lo que el cliente dijo sino de lo que no dijo: surge de comparar los datos requeridos con los aportados (M13).

- **cubre** permite que una necesidad funcional satisfaga el requisito de tecnología sin que este submódulo elija una solución técnica (M14).

- **requiere_consulta_a** representa la excepción en la que no corresponde decidir dentro de la interpretación si un dato es necesario, sino consultarlo con el submódulo dueño de ese conocimiento.

- **actualiza** cierra el ciclo: una aclaración respondida reingresa al pedido como nueva información.

![](img/PI2_Matias_fig1_red_semantica_conceptual.png)

> *Texto del diagrama (OCR):*
‘Submédulo de interpretacién<br>(razonamiento del experto)<br>Nemes ><br>Pedido SS<br>‘ene estado _fncluye contiene produce<br>Estado del pedido , ;<br>en_interpretacion | pendiente_de_actaracién | Expresi6n del cliente<br>isto_para_evaluacion<br>Cs) somepeceone . -<br>botota avora crite +, ~<br>--=” R anina "+, (Float requerimientos<br>177 ~ “eanean 7 ealche (se.(se_descrbe_medianedesre meat eses.n aresena - cq cos aulaQatualza ay  \incluye\inst<br>Necesidad eG.aK MI ->Restricciénettente eee - wn) eefo (=)<br>! s . tee!<br>; Dato Dato Dato J D> >> {dato en<br>provoca /provoca Ope. cegitere_consuta_a<br>~ ng yer"<br>\(\  Materialesde instalaciony condiciones,(L. Quiros) | redisefioManufacturabilidad(L. Marquesini) y ~\1<br>

_Figura 1. Red semántica conceptual del submódulo de interpretación técnica de requerimientos y restricciones del cliente._

**Convenciones:** caja gris con texto en negrita: concepto principal o entidad · caja blanca: especialización · borde discontinuo: concepto externo de otro submódulo · borde bordó: conjunto de valores de estado · flecha continua con verbo: asociación dirigida · flecha discontinua con punta hueca: es_un · flecha punteada: interacción (pregunta al cliente, consulta a otro submódulo o reingreso de la respuesta).

## **d) Casos de uso e instanciación**

Se seleccionaron dos casos representativos que cubren los casos típicos y límite del Cuaderno: un pedido en lenguaje no técnico con varias ambigüedades y un pedido con una restricción explícita, una preferencia y una contradicción entre el texto y la referencia visual. El segundo retoma el caso de uso concreto planteado en PG0 (cartel corpóreo para exterior).

**Alcance de los casos.** Los textos de los pedidos son ilustrativos: se construyeron a partir de las situaciones descriptas en §4 y §5 del Cuaderno y no son transcripciones de pedidos reales. Deberán contrastarse con los pedidos históricos que aporte la fuente experta. Como conjunto de datos requeridos se usa provisoriamente el de las entradas definidas en PG0 y PI1 (tecnología, dimensiones, entorno, instalación, apariencia/contenido y restricciones); su versión por tipo de cartel sigue pendiente de relevamiento.

### **Caso 1 — Pedido en lenguaje no técnico con ambigüedades (P-01)**

_«Hola! Quiero un cartel de neón con el nombre del café,_ **_Café Andino_** _, para poner en la pared. Más o menos de un metro. Que se vea lindo de noche. Te paso una foto de uno que vi en Instagram.»_

#### **Instancias involucradas**

|**Instancia**|**Frame**|**Valores relevantes**|**Regla**|
|---|---|---|---|
|**C-01**|Cliente|conoce_terminología = no (describe efectos, no soluciones)|—|
|**P-01**|Pedido|estado = pendiente_de_aclaración; iteración = 1|R11 (no se<br>cumple)|
|**E1–E5**|Expresión del<br>cliente|«cartel de neón», «Café Andino», «para poner en la pared», «más o<br>menos de un metro», «que se vea lindo de noche»|—|
|**RV1**|Referencia visual|foto de un cartel visto en redes; consistente_con_texto =<br>sin_verificar|—|
|**D1**|Dato ambiguo|tecnología: {neón de vidrio | aspecto neón}|R01|
|**D2**|Dato confirmado|contenido_texto = «Café Andino»; origen = cliente|—|
|**D3**|Dato ambiguo|entorno: {interior | exterior}. «La pared» no indica si da a la calle|R01|
|**D4**|Dato faltante|superficie / montaje; criticidad = sin_clasificar; el pedido lo omite<br>(RL23)|R02, R10|
|**D5**|Dato ambiguo|dimensión: {medida del cartel | espacio libre} (caso límite 2)|R01|
|**NF1**|Necesidad funcional|visibilidad y efecto nocturno; tecnología_asociada = no_definida|R07|
|**A1–A4**|Aclaración|dirigidas a C-01; A1 a A3 por ambigüedad, A4 por faltante;<br>formulación = en_términos_de_uso|R01, R02,<br>R08|
|**Q1**|Consulta a<br>submódulo|¿D4 es bloqueante o postergable? → Materiales e instalación|R10|

#### **Recorrido conceptual**

1. **Recepción y estructuración.** P-01 se registra con cinco expresiones y una referencia visual. Cada expresión se conserva literal (faceta inmutable de _texto_literal_ ) y se asocia a una categoría de dato.

2. **Interpretación de intención.** E5 no nombra una tecnología sino un efecto: se interpreta como la necesidad funcional NF1 y la selección técnica queda para los módulos de evaluación (R07). No se infiere «neón LED» a partir de «que se vea lindo». E1 («cartel de neón») activa tanto R01 como R07; por la estrategia de resolución de conflictos se dispara primero R01, porque «neón» todavía admite dos lecturas.

3. **Detección de ambigüedades.** E1, E3 y E4 admiten más de una lectura razonable, por lo que generan D1, D3 y D5 en estado ambiguo y sin valor asignado (R01). En particular, no se elige en silencio si el metro es el tamaño del cartel o el espacio disponible.

4. **Identificación de faltantes.** Al comparar _datos_requeridos_ con lo aportado, ninguna expresión informa sobre la superficie o el montaje: el pedido los omite (RL23) y se crea D4 como faltante con criticidad _sin_clasificar_ (R02). Como saber si este dato bloquea la evaluación depende del conocimiento de materiales e instalación, se genera la consulta Q1 a ese submódulo (R10).

5. **Formulación de aclaraciones.** Como C-01 no maneja terminología técnica, A1 a A4 se formulan en términos de uso y condiciones observables (R08): por ejemplo, «¿la pared está dentro del local o da a la calle?» en lugar de «¿el cartel es para interior o exterior?».

6. **Evaluación de suficiencia.** Hay datos ambiguos sobre atributos requeridos y un faltante sin clasificar, por lo que R11 no se cumple y P-01 queda en _pendiente_de_aclaración_ .

#### **Segunda iteración**

El cliente responde: «Es adentro, en la pared detrás del mostrador. El metro es lo que tiene que medir el cartel de largo. Quiero que se vea como el de la foto, no me importa si es de vidrio». La respuesta reingresa como nueva expresión con fuente _respuesta_a_aclaración_ (R13). D3 se reclasifica como Dato confirmado (entorno = interior) y D5 como Dato confirmado (largo del cartel ≈ 1 m). Para D1 el cliente elige el aspecto y no la tecnología: D1 pasa a _descartado_ y, por R07, NF1 amplía su efecto buscado («aspecto similar a RV1») y **cubre** la categoría producto/tecnología (RL24). Por eso R02 no reclama la tecnología como faltante: su selección corresponde a los submódulos de evaluación (M14). RV1 pasa a consistente_con_texto = sí. El avance depende de Q1:

- si el submódulo de materiales e instalación indica que la superficie puede relevarse más adelante, D4 pasa a _postergable_ , R11 se cumple y P-01 queda _listo_para_evaluación_ ; al crear la ficha, R12 registra la advertencia AV1. A4 sigue pendiente, pero no bloquea: sólo R11 asigna el estado del pedido (M17);

- si lo considera bloqueante, P-01 permanece en _pendiente_de_aclaración_ hasta que el cliente responda A4.

De esta forma el modelo representa ambos caminos sin decidir dentro del submódulo un criterio que todavía no fue validado.

### **Caso 2 — Pedido con restricción explícita y contradicción (P-02)**

_«Necesito letras corpóreas con luz para el frente del local, que da a la calle. 3 metros de largo. Tienen que estar_ **_sí o sí_** _antes de la inauguración._ **_Si se puede_** _, en los colores del logo. Adjunto foto de referencia.»_ (La foto muestra letras corpóreas sin iluminación.)

#### **Instancias involucradas**

|**Instancia**|**Frame**|**Valores relevantes**|**Regla**|
|---|---|---|---|
|**C-02**|Cliente|conoce_terminología = sí (usa «letras corpóreas»)|—|
|**P-02**|Pedido|estado = pendiente_de_aclaración; iteración = 1|R11 (no se<br>cumple)|
|**E6–E10**|Expresión del<br>cliente|«letras corpóreas con luz», «frente del local, que da a la calle», «3<br>metros de largo», «sí o sí antes de la inauguración», «si se puede,<br>colores del logo»|—|
|**RV2**|Referencia visual|letras corpóreas sin iluminación; consistente_con_texto = no|R03|
|**D6, D8, D9**|Dato confirmado|tecnología = corpóreo; entorno = exterior; largo_total = 3 m|—|
|**D7, D10**|Dato en conflicto|iluminación = sí (texto) / iluminación = no (referencia)|R03|
|**K1**|Contradicción|tipo = texto–referencia; estado = abierta; involucra D7 y D10|R03|
|**D11**|Dato faltante|condición de montaje en fachada; criticidad = sin_clasificar; el<br>pedido lo omite (RL23)|R02, R10|
|**RC1**|Restricción del<br>cliente|plazo = antes de la inauguración; rigidez = obligatoria|R04|
|**PR1**|Preferencia|colores del logo; rigidez = preferencia|R05|
|**A5, A6**|Aclaración|A5 resuelve K1; A6 pide el dato de montaje; formulación = técnica|R03, R02,<br>R08|
|**Q2**|Consulta a<br>submódulo|¿D11 es bloqueante o postergable? → Materiales e instalación|R10|

#### **Recorrido conceptual**

1. **Datos explícitos.** E6, E7 y E8 aportan datos claros y consistentes, que se registran como confirmados con origen «cliente». El experto no agrega valores que el cliente no dio (R09): por ejemplo, no se asume una altura de letras a partir del largo total.

2. **Control de consistencia.** El texto indica letras «con luz» y la referencia muestra letras sin iluminación. Son valores incompatibles del mismo atributo, por lo que el submódulo no elige una de las dos versiones: crea la contradicción K1, que involucra a D7 y D10 como datos en conflicto, y genera A5 (R03). La pregunta no propone una solución técnica: pide confirmar la iluminación y qué rescata el cliente de la foto.

3. **Clasificación de condiciones.** «Sí o sí» es una declaración explícita de obligatoriedad, por lo que el plazo se registra como restricción del cliente RC1 (R04). «Si se puede» expresa un deseo, por lo que los colores se registran como preferencia PR1 y no se transforman en una restricción rígida (R05).

4. **Faltantes y consultas.** El pedido omite la información sobre el montaje en la fachada (RL23): D11 queda faltante y sin clasificar; se solicita a C-02 (A6) y se consulta su criticidad al submódulo de materiales e instalación (Q2). Como C-02 maneja la terminología, A5 y A6 se formulan en términos técnicos (R08).

5. **Evaluación de suficiencia.** Con K1 abierta, R11 no se cumple y P-02 queda _pendiente_de_aclaración_ . RC1 ya está registrada y condicionará la evaluación de manufacturabilidad cuando la ficha se derive.

#### **Segunda iteración y ficha resultante**

El cliente responde: «Sí, llevan luz; la foto era por la tipografía. Van sobre la marquesina, a 4 metros de altura». La respuesta reingresa como nueva expresión (R13). K1 pasa a _resuelta_ con resolución = D7: D7 se reclasifica como Dato confirmado y D10 pasa a _descartado_ (M15). RV2.aporta_sobre se restringe a la categoría apariencia (tipografía). D11 recibe valor con origen «respuesta_a_aclaración» y se reclasifica como confirmado, por lo que Q2 pasa a _innecesaria_ . Se cumplen las condiciones de R11 y se genera la ficha; al crearla, R12 detecta el alcance restringido de RV2 y genera la advertencia AV2:

|**Sección de la ficha FR-02**|**Contenido**|
|---|---|
|**Datos confirmados**|tecnología = corpóreo; iluminación = sí; entorno = exterior; largo_total = 3 m; montaje<br>= sobre marquesina a 4 m de altura|
|**Restricciones del cliente**|RC1: plazo antes de la inauguración (obligatoria)|
|**Preferencias**|PR1: colores del logo (negociable)|
|**Necesidades funcionales**|—|
|**Advertencias**|AV2: la referencia visual RV2 sólo es válida para la tipografía, no para la iluminación<br>(R12)|
|**Destinatarios**|Materiales y condiciones de instalación; Manufacturabilidad y rediseño|

## **e) Red Semántica Instanciada**

Las redes instanciadas muestran los casos 1 y 2 al cierre de la primera iteración, que es el momento de mayor carga interpretativa. Cada nodo es una instancia (identificador : frame) con sus valores relevantes, y las aristas usan exclusivamente los verbos definidos en la red conceptual (RL01 a RL24). Junto a cada relación generada por inferencia se indica entre corchetes la regla que la produce, lo que permite seguir el razonamiento desde la expresión del cliente hasta la acción experta.

#### **Lectura de la Figura 2 (caso P-01)**

Se lee de izquierda a derecha: el cliente formula el pedido; el pedido contiene cinco expresiones e incluye una referencia; cada expresión aporta un dato o se interpreta como necesidad funcional, y cada dato problemático provoca una aclaración. Tres de las cinco expresiones terminan en datos ambiguos. D4 no proviene de ninguna expresión: surge de que el pedido omite un dato requerido (RL23, R02). D2 es el único dato confirmado y NF1 conserva la necesidad sin convertirla en una tecnología. La relación requiere_consulta_a, materializada como la consulta Q1, muestra el punto en el que el submódulo deriva una decisión que no le corresponde.

#### **Lectura de la Figura 3 (caso P-02)**

La mayoría de los datos son confirmados (en verde), lo que refleja un cliente con vocabulario técnico. El nodo central del caso es K1: involucra dos datos del mismo atributo, provenientes de fuentes distintas (texto y referencia), y provoca una única aclaración. En la parte inferior se ve la distinción entre RC1 (obligatoria) y PR1 (preferencia). RC1 no se conecta todavía con el submódulo de manufacturabilidad: lo condicionará a través de la ficha (RL19 y RL21) cuando P-02 esté listo para evaluación, sin que el submódulo de interpretación evalúe si el plazo es factible.

Las dos figuras se presentan a continuación en orientación horizontal.

![](img/PI2_Matias_fig2_red_instanciada_P01.png)

> *Texto del diagrama (OCR):*
RVI; Referencia visual<br>inctuye EL; Expresion sortapor {ne6nDi,aruo de vidrioDato secre| aspectoambiguo nedn} prove R01, ROS especificamentedbuscsAi Aelaracion daspecb tubos de(~ dela€-07) vidrio?ou<br>E2«Cale: ExpresionAndino»; score, Dz,atributo‘valorDato== «Café Andino» contenido_texto confimado<br>; P01; Pedido ; DB, Dato ambiguo — Fa: Relaracion (6-09<br>conoce_terminologiaG01; cliente= no| formula 6 esado=pendioneiteracion de= 1 acaracn «para3:ponerExpresionen la pared» agora aoa{interior| exterior}ere Rot, Rog aimedodaalacalle? esa derdo dtiocy<br>. . nace: Expresion apora Srbuos aman provoca (ROL, RO atinersesloquedebe rectel<br>‘ >» resid Sl ant Toop ie) ITeM sea nese<br>. 5, . : ca nternetawerreta_ comecomo [R07 cereTFL;VisbliiodyNecesidad seco nocurefuncional<br>S SS se mite (R02) — prove (02, R08) Ba‘BaiRelaacionquepre(—fy ino©-03)<br>(( {BA Baoaltante<br>ae wrrecce a wtMetbedadeeeSneSastiar” (ox ebioquante ops) = = = =~ = =~ ~~,<br>*”) 1”+ einstalacionSubmédulo materiales")(L-Quios) |<br>

_Figura 2. Red semántica instanciada del caso 1 (pedido P-01) al cierre de la primera iteración._

**Verde:** dato confirmado · **Bordó:** dato problemático, contradicción o aclaración · **Discontinuo:** dato omitido por el pedido o elemento de otro submódulo · **Punteado:** consulta a otro submódulo · **[Rxx]:** regla que genera la relación.

![](img/PI2_Matias_fig3_red_instanciada_P02.png)

> *Texto del diagrama (OCR):*
_————___ ——<br>‘porta_——_ - invotucea (Rog_—-\_" estado= aber iteresa de la fot de telsrencia?<br>incuye a — fuera (R95) —<br>-02 : Cliente tormola—.(caugy P03; Pedido _—_ EB: Expresion apona D8: Dato confirmado<br>a<br>.— ‘RC1 : Restricci6n del client<br>somite (R02)<br>‘Ss xpresion _se_interpreta_como [RO ‘PRI : Preferencia<br>ee eee (Q2: cbloquéanteo pastergabie?)<br>+ enc ees |<br>

_Figura 3. Red semántica instanciada del caso 2 (pedido P-02) al cierre de la primera iteración._

**Verde:** dato confirmado · **Bordó:** dato problemático, contradicción o aclaración · **Discontinuo:** dato omitido por el pedido o elemento de otro submódulo · **Punteado:** consulta a otro submódulo · **[Rxx]:** regla que genera la relación.

## **f) Diccionario de Frames**

Cada concepto principal de la red se representa como un frame. Los **slots** son los atributos del concepto y las **facetas** expresan su tipo, los valores permitidos, la cardinalidad, el valor por defecto y las restricciones. Los **demonios** son procedimientos asociados a un slot que se ejecutan cuando su valor se necesita ( _si_necesario_ ), se agrega ( _si_añadido_ ) o se modifica ( _si_modificado_ ). Los frames especializados heredan todos los slots de su frame padre y sólo agregan o restringen lo que cambia.

Cada frame indica además su **origen** en el Cuaderno, su **trazabilidad** (reglas y relaciones que lo usan) y **ejemplos de instanciación** tomados de los casos de uso.

#### **Estructura de herencia**

|**Frame**|**Hereda de**|**Especializaciones**|
|---|---|---|
|**Pedido**|— (raíz)|—|
|**Cliente**|— (raíz)|—|
|**Expresión del cliente**|— (raíz)|—|
|**Referencia visual**|— (raíz)|—|
|**Dato (abstracto)**|— (raíz)|Dato confirmado, Dato faltante, Dato ambiguo, Dato en<br>conflicto|
|**Contradicción**|— (raíz)|—|
|**Requerimiento (abstracto)**|— (raíz)|Restricción del cliente, Preferencia, Necesidad funcional|
|**Aclaración**|— (raíz)|—|
|**Consulta a submódulo**|— (raíz)|—|
|**Ficha de requerimientos interpretados**|— (raíz)|—|
|**Advertencia**|— (raíz)|—|
|**Submódulo de evaluación (externo)**|— (raíz)|Materiales e instalación; Manufacturabilidad y rediseño|

|**FRAME: PEDIDO**<br>**Descripción**|Unidad de trabajo que e<br>y el resultado de la inter|l submódulo interpreta. Agrupa<br>pretación.|todo lo aportado por el cliente|
|---|---|---|---|
|**Origen**|SM Interpretación (M. Z<br>procesos.|arandon). PI1: glosario §2, flujo|etapas 1 y 8, diagrama de|
|**Trazabilidad**|Reglas que lo usan: R0|2, R11, R13. Relaciones: RL01|–RL04, RL14, RL15, RL23.|
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**id_pedido**|Texto|Cardinalidad 1; obligatorio;<br>único|—|
|**cliente**|Instancia de CLIENTE|Cardinalidad 1; obligatorio|—|
|**expresiones**|Lista de EXPRESIÓN|Cardinalidad 1..n|si_añadido: clasificar por<br>categoría y evaluar R01,<br>R02 y R07 según el orden<br>de disparo|
|**referencias_visuales**|Lista de<br>REFERENCIA<br>VISUAL|Cardinalidad 0..n|si_añadido: verificar<br>consistencia con los datos<br>del texto (R03)|
|**datos**|Lista de DATO|Cardinalidad 0..n|si_modificado: reevaluar<br>contradicciones y suficiencia<br>(R03, R11)|
|**requerimientos**|Lista de<br>REQUERIMIENTO|Cardinalidad 0..n|—|
|**contradicciones**|Lista de<br>CONTRADICCIÓN|Cardinalidad 0..n|—|
|**aclaraciones**|Lista de<br>ACLARACIÓN|Cardinalidad 0..n|si_añadido: recalcular<br>estado (no lo asigna<br>directamente)|
|**datos_requeridos**|Lista de (categoría,<br>atributo)|Cardinalidad 1..n; valor<br>provisional tomado de las<br>entradas de PG0/PI1;<br>pendiente de validación por<br>tipo de pedido. Un elemento<br>está cubierto si existe un<br>Dato confirmado para el<br>atributo o, en<br>producto_tecnología, una<br>Necesidad funcional que<br>cubre la categoría (M14)|si_necesario: obtener el<br>conjunto validado para el<br>tipo de pedido|
|**estado**|{en_interpretación, pe<br>ndiente_de_aclaració<br>n, listo_para_evaluaci<br>ón}|Cardinalidad 1; defecto<br>en_interpretación; sólo R11<br>asigna<br>listo_para_evaluación (M17)|si_necesario:<br>listo_para_evaluación si se<br>cumple R11; si no,<br>pendiente_de_aclaración si<br>hay aclaraciones o consultas<br>pendientes; si no,<br>en_interpretación|
|**iteración**|Entero ≥ 1|Cardinalidad 1; defecto 1;<br>sólo la incrementa R13|—|
|**Ejemplos de**<br>**instanciación**|P-01(estado = pendient<br>listo_para_evaluación, i|e_de_aclaración, iteración = 1)<br>teración = 2)|· P-02(estado =|

##### **FRAME: CLIENTE**

|**Descripción**|Persona u organización|que formula el pedido y respo|nde las aclaraciones.|
|---|---|---|---|
|**Origen**|PI1 §10 (Cliente formul|a Pedido); excepción 2 de §6.||
|**Trazabilidad**|Reglas: R08. Relacione|s: RL01, RL13.||
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**identificación**|Texto|Cardinalidad 1|—|
|**conoce_terminología**|{sí, no, desconocido}|Cardinalidad 1; defecto<br>desconocido|si_necesario: estimar a partir<br>del vocabulario de sus<br>expresiones; si no es<br>posible, desconocido|
|**pedidos**|Lista de PEDIDO|Cardinalidad 1..n|—|
|**Ejemplos de**<br>**instanciación**|C-01(conoce_terminolo|gía = no) · C-02(conoce_termin|ología = sí)|

##### **FRAME: EXPRESIÓN DEL CLIENTE**

|**Descripción**|Fragmento literal del pe|dido. Es la evidencia primaria d|e la interpretación.|
|---|---|---|---|
|**Origen**|PI1 flujo etapas 1 y 3 (m|odificación M1).||
|**Trazabilidad**|Reglas: R01, R04, R05,|R07, R13. Relaciones: RL02, R|L05, RL06.|
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**texto_literal**|Texto|Cardinalidad 1; obligatorio;<br>inmutable (no se reescribe ni<br>se completa)|—|
|**fuente**|{mensaje,<br>conversación, boceto,<br>respuesta_a_aclaraci<br>ón}|Cardinalidad 1|—|
|**categorías**|Lista de CATEGORÍA<br>DE DATO|Cardinalidad 0..n|—|
|**interpretaciones_posible**<br>**s**|Lista de texto|Cardinalidad 1..n|si_añadido: si hay más de<br>una, disparar R01 (con<br>prioridad sobre R07)|
|**interpretación_elegida**|Texto o nulo|Cardinalidad 0..1; defecto<br>nulo; sólo se asigna si existe<br>una única interpretación o la<br>confirma el cliente|—|
|**Ejemplos de**<br>**instanciación**|E4(texto_literal = «más<br>del cartel, espacio libre])|o menos de un metro», interpret<br>· E9(texto_literal = «sí o sí ant|aciones_posibles = [medida<br>es de la inauguración»)|

|**FRAME: REFERENC**|**IA VISUAL**|||
|---|---|---|---|
|**Descripción**|Imagen, foto o boceto a|portado por el cliente.||
|**Origen**|PI1 entradas; caso límit|e 1 de §5 (M2).||
|**Trazabilidad**|Reglas: R03, R12. Rela|ciones: RL03, RL07.||
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**descripción**|Texto|Cardinalidad 1|—|
|**aporta_sobre**|Lista de CATEGORÍA<br>DE DATO|Cardinalidad 1..n; puede<br>restringirse tras una<br>aclaración|si_modificado: si se<br>restringe, registrar alcance<br>limitado para R12|
|**consistente_con_texto**|{sí, no, sin_verificar}|Cardinalidad 1; defecto<br>sin_verificar|si_modificado: si toma el<br>valor «no», crear<br>CONTRADICCIÓN (R03)|
|**Ejemplos de**<br>**instanciación**|RV1(foto de redes, con<br>iluminación, consistente|sistente_con_texto = sin_verifi<br>_con_texto = no; aporta_sobr|car → sí) · RV2(letras sin<br>e = [apariencia] tras A5)|

|**FRAME: DATO (**|**abstracto)**|||
|---|---|---|---|
|**Descripción**|Valor de un atributo del<br>directamente.|pedido junto con su estado y su|procedencia. No se instancia|
|**Origen**|PI1 glosario §2 (genera|lización M3).||
|**Trazabilidad**|Reglas: R01, R02, R03|, R09, R11. Relaciones: RL06–R|L11, RL16, RL18, RL23.|
|**Herencia**|Frame raíz. Especializa<br>en conflicto. Una instan<br>(M15).|ciones: Dato confirmado, Dato f<br>cia cambia de especialización c|altante, Dato ambiguo, Dato<br>uando cambia su estado|
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**atributo**|Texto (p. ej.,<br>tecnología, entorno,<br>largo_total)|Cardinalidad 1; obligatorio|—|
|**categoría**|{producto_tecnología,<br>dimensiones,<br>contexto_de_uso,<br>entorno, instalación,<br>apariencia,<br>restricciones}|Cardinalidad 1. En la<br>categoría restricciones el<br>dato guarda el valor de la<br>condición (p. ej., la fecha<br>límite); su rigidez se registra<br>en el Requerimiento<br>asociado (RL08)|—|
|**valor**|Cualquier tipo o nulo|Cardinalidad 0..1|si_añadido: verificar la<br>faceta de origen (R09)|
|**unidad**|Texto|Cardinalidad 0..1; obligatoria<br>si categoría = dimensiones|—|
|**origen**|{cliente, respuesta_a_<br>aclaración}|Cardinalidad 1;**no admite**<br>«supuesto» ni<br>«completado_por_sistema»|—|
|**fuente**|EXPRESIÓN o<br>REFERENCIA<br>VISUAL|Cardinalidad 0..n (0 sólo en<br>datos faltantes)|—|
|**estado**|{confirmado, faltante,<br>ambiguo, en_conflicto,<br>descartado}|Cardinalidad 1; coincide con<br>la especialización.<br>_descartado_: la instancia se<br>conserva para trazabilidad,<br>pero no cuenta en R11 ni<br>pasa a la ficha (M15)|si_modificado: reclasificar la<br>instancia en la<br>especialización<br>correspondiente (en Neo4j,<br>cambio de etiqueta) y<br>notificar al PEDIDO para<br>recalcular su estado|
|**Ejemplos de**<br>**instanciación**|D2 : DatoConfirmado(c<br>DatoFaltante(superficie<br>DatoAmbiguo(entorno,<br>D10 : estado = descarta|ontenido_texto = «Café Andino»<br>/montaje, criticidad = sin_clasific<br>[interior, exterior]) · D7 : DatoEn<br>do (iteración 2 del caso 2)|) · D4 :<br>ar) · D3 :<br>Conflicto(iluminación = sí) ·|

#### **Especializaciones de DATO**

|**Especialización**|**Slots propios o facetas que restringen lo heredado**|**Demonio**|
|---|---|---|
|**DATO CONFIRMADO**|estado = confirmado (fijo); valor ≠ nulo; fuente con al<br>menos un elemento.|—|
|**DATO FALTANTE**|estado = faltante; valor = nulo;**criticidad**en {bloqueante,<br>postergable, sin_clasificar}, defecto sin_clasificar (criterio<br>pendiente de adquisición);**consulta**: CONSULTA A<br>SUBMÓDULO, 0..1. Se vincula al pedido mediante_omite_<br>(RL23).|si_añadido: crear<br>ACLARACIÓN (R02); si la<br>necesidad del dato depende<br>de otro submódulo, crear<br>CONSULTA (R10)|
|**DATO AMBIGUO**|estado = ambiguo; valor = nulo hasta la aclaración;<br>**interpretaciones**: lista de texto, 2..n.|si_añadido: crear<br>ACLARACIÓN de<br>desambiguación (R01)|
|**DATO EN**<br>**CONFLICTO**|estado = en_conflicto; valor = el propuesto por su fuente,<br>sin considerarse válido;**contradicción**:<br>CONTRADICCIÓN, 1..n.|—|

##### **FRAME: CONTRADICCIÓN**

|**Descripción**|Incompatibilidad entre|dos o más datos que refieren al|mismo atributo.|
|---|---|---|---|
|**Origen**|PI1 glosario §2; flujo e|tapa 5 (M4).||
|**Trazabilidad**|Reglas: R03, R11, R1|3. Relaciones: RL10, RL11.||
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**datos_involucrados**|Lista de DATO EN<br>CONFLICTO|Cardinalidad 2..n; todos del<br>mismo pedido y con el<br>mismo atributo|si_añadido: crear<br>ACLARACIÓN de<br>confirmación (R03)|
|**tipo**|{texto–texto,<br>texto–medida,<br>texto–referencia,<br>medida–referencia}|Cardinalidad 1|—|
|**estado**|{abierta, resuelta}|Cardinalidad 1; defecto<br>abierta|si_modificado: al resolverse,<br>el dato elegido pasa a<br>confirmado y los restantes a<br>descartado (M15)|
|**resolución**|DATO|Cardinalidad 0..1; sólo<br>puede asignarse a partir de<br>la respuesta del cliente,<br>nunca por elección del<br>sistema|—|
|**Ejemplos de**<br>**instanciación**|K1(tipo = texto–referen<br>resuelta, resolución =|cia, datos_involucrados = [D7,<br>D7)|D10], estado = abierta →|

##### **FRAME: REQUERIMIENTO (abstracto)**

|**Descripción**|Necesidad o condición<br>trabajo.|del cliente que debe quedar r|epresentada para evaluar el|
|---|---|---|---|
|**Origen**|PI1 glosario §2; §10; ca|sos típicos de §4.||
|**Trazabilidad**|Reglas: R04, R05, R06|, R07, R12. Relaciones: RL05|, RL08, RL19, RL24.|
|**Herencia**|Frame raíz. Especializa<br>funcional.|ciones: Restricción del cliente|, Preferencia, Necesidad|
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**descripción**|Texto|Cardinalidad 1|—|
|**fuente**|Lista de EXPRESIÓN|Cardinalidad 1..n|—|
|**rigidez**|{obligatoria,<br>preferencia,<br>a_confirmar}|Cardinalidad 1; defecto<br>a_confirmar|si_modificado: mover el<br>requerimiento a la sección<br>correspondiente de la ficha|
|**datos_asociados**|Lista de DATO|Cardinalidad 0..n|—|
|**Ejemplos de**<br>**instanciación**|RC1 : RestricciónDelCli<br>del logo) · NF1 : Neces<br>no_definida)|ente(plazo, rigidez = obligato<br>idadFuncional(visibilidad noct|ria) · PR1 : Preferencia(colores<br>urna, tecnología_asociada =|

#### **Especializaciones de REQUERIMIENTO**

|**Especialización**|**Slots propios o facetas que restringen lo heredado**|**Demonio**|
|---|---|---|
|**RESTRICCIÓN DEL**<br>**CLIENTE**|rigidez = obligatoria (fijo);**evidencia**: declaración explícita<br>de obligatoriedad, 1..n;**ámbito**en {plazo, recursos,<br>dimensiones, apariencia, uso, otro}.|si_añadido: incluir en<br>ficha.restricciones (R04)|
|**PREFERENCIA**|rigidez = preferencia (fijo); sólo puede pasar a restricción<br>si el cliente lo confirma (R05).|—|
|**NECESIDAD**<br>**FUNCIONAL**|**efecto_buscado**: texto;**tecnología_asociada**: texto o<br>no_definida, defecto no_definida. Este submódulo no<br>puede asignarla.**cubre**: lista de CATEGORÍA DE DATO,<br>0..n (M14).|si_añadido: marcar la<br>selección técnica como<br>tarea de los submódulos de<br>evaluación y registrar la<br>cobertura de<br>producto_tecnología (R07)|

##### **FRAME: ACLARACIÓN**

|**Descripción**|Pregunta dirigida al clie|nte para resolver un problema i|nterpretativo.|
|---|---|---|---|
|**Origen**|PI1 flujo etapa 6; §7 reg|las 1 a 3; excepción 2.||
|**Trazabilidad**|Reglas: R01, R02, R03,|R06, R08, R13. Relaciones: R|L11–RL14.|
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**motivo**|{ambigüedad, faltante,<br>contradicción, rigidez}|Cardinalidad 1|—|
|**objeto**|DATO,<br>CONTRADICCIÓN o<br>REQUERIMIENTO|Cardinalidad 1|—|
|**destinatario**|CLIENTE|Cardinalidad 1|—|
|**pregunta**|Texto|Cardinalidad 1; no debe<br>inducir una solución técnica<br>específica|—|
|**formulación**|{técnica,<br>en_términos_de_uso}|Cardinalidad 1; sin defecto:<br>la asigna R08 al crearse la<br>aclaración|si_necesario: aplicar R08<br>según<br>cliente.conoce_terminología|
|**estado**|{pendiente,<br>respondida}|Cardinalidad 1; defecto<br>pendiente|si_modificado: al pasar a<br>respondida, aplicar R13|
|**respuesta**|EXPRESIÓN|Cardinalidad 0..1|—|
|**Ejemplos de**<br>**instanciación**|A2(motivo = ambigüeda<br>= «¿La pared está dentr<br>objeto = K1, formulación|d, objeto = D3, formulación = e<br>o del local o da a la calle?») ·<br>= técnica)|n_términos_de_uso, pregunta<br>A5(motivo = contradicción,|

|**FRAME: CONSU**|**LTA A SUBMÓDULO**|||
|---|---|---|---|
|**Descripción**|Pregunta dirigida a otro<br>depende de un conoci|submódulo cuando la necesida<br>miento que no pertenece a la int|d o la criticidad de un dato<br>erpretación.|
|**Origen**|PI1 excepción 3 de §6;|regla candidata 10 (M10).||
|**Trazabilidad**|Reglas: R10, R11. Rel|aciones: RL16 (la materializa).||
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**dato**|DATO FALTANTE|Cardinalidad 1|—|
|**destino**|SUBMÓDULO DE<br>EVALUACIÓN|Cardinalidad 1|—|
|**pregunta**|{¿es necesario?, ¿es<br>bloqueante o<br>postergable?}|Cardinalidad 1|—|
|**estado**|{pendiente,<br>respondida,<br>innecesaria}|Cardinalidad 1; defecto<br>pendiente|si_necesario: pasa a<br>innecesaria si el dato recibe<br>valor del cliente|
|**respuesta**|{bloqueante,<br>postergable,<br>no_necesario}|Cardinalidad 0..1|si_añadido: actualizar<br>dato.criticidad|
|**Ejemplos de**<br>**instanciación**|Q1(dato = D4, destino<br>D11, estado = inneces|= Materiales e instalación, estad<br>aria)|o = pendiente) · Q2(dato =|

##### **FRAME: FICHA DE REQUERIMIENTOS INTERPRETADOS**

|**Descripción**|Salida del submódulo.|Debe poder usarse sin reinterpre|tar la conversación original.|
|---|---|---|---|
|**Origen**|PI1 glosario §2; flujo et|apa 8; §10.||
|**Trazabilidad**|Reglas: R11, R12. Rela|ciones: RL17–RL21.||
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**pedido**|PEDIDO|Cardinalidad 1;<br>precondición: pedido.estado<br>= listo_para_evaluación|si_añadido: verificar la<br>precondición; si no se<br>cumple, rechazar la creación|
|**datos_confirmados**|Lista de DATO<br>CONFIRMADO|Cardinalidad 1..n; no admite<br>datos ambiguos, en conflicto<br>ni descartados|—|
|**restricciones**|Lista de<br>RESTRICCIÓN DEL<br>CLIENTE|Cardinalidad 0..n|—|
|**preferencias**|Lista de<br>PREFERENCIA|Cardinalidad 0..n|—|
|**necesidades_funcionale**<br>**s**|Lista de NECESIDAD<br>FUNCIONAL|Cardinalidad 0..n|—|
|**advertencias**|Lista de<br>ADVERTENCIA|Cardinalidad 0..n|si_necesario: generar según<br>R12|
|**destinatarios**|Lista de<br>SUBMÓDULO DE<br>EVALUACIÓN|Cardinalidad 1..2|—|
|**Ejemplos de**<br>**instanciación**|FR-02(datos_confirmad<br>preferencias = [PR1], a|os = [D6, D7, D8, D9, D11], res<br>dvertencias = [AV2])|tricciones = [RC1],|

##### **FRAME: ADVERTENCIA**

|**Descripción**|Incertidumbre que la fic<br>traten como hecho conf|ha transmite a los submódulos<br>irmado.|siguientes para que no la|
|---|---|---|---|
|**Origen**|PI1 pregunta experta 8;|excepción 1; caso límite 1 (M9|, M16).|
|**Trazabilidad**|Reglas: R12. Relacione|s: RL20.||
|**Herencia**|Frame raíz.|||
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**elemento**|DATO,<br>REQUERIMIENTO o<br>REFERENCIA<br>VISUAL|Cardinalidad 1|—|
|**motivo**|{dato_postergable_pe<br>ndiente,<br>rigidez_a_confirmar, a<br>lcance_limitado_de_r<br>eferencia}|Cardinalidad 1; cada valor<br>corresponde a una<br>condición de R12|—|
|**texto**|Texto|Cardinalidad 1|—|
|**destinatario**|SUBMÓDULO DE<br>EVALUACIÓN|Cardinalidad 1..2|—|
|**Ejemplos de**<br>**instanciación**|AV1(elemento = D4, mo<br>caso 1 · AV2(elemento|tivo = dato_postergable_pend<br>= RV2, motivo = alcance_limita|iente), rama postergable del<br>do_de_referencia), caso 2|

##### **FRAME: SUBMÓDULO DE EVALUACIÓN (externo)**

|**Descripción**|Interfaz con los submód<br>necesarios para derivar|ulos que reciben la ficha. Sólo<br>y consultar.|se modelan los slots|
|---|---|---|---|
|**Origen**|PG0, distribución prelim<br>submódulos.|inar en submódulos; PI1, intera|cción con los demás|
|**Trazabilidad**|Reglas: R10, R11. Rela|ciones: RL16, RL21.||
|**Herencia**|Frame raíz. Especializa<br>Manufacturabilidad y al|ciones: Materiales y condicione<br>ternativas de rediseño (L. Marq|s de instalación (L. Quiros);<br>uesini).|
|**Slot**|**Tipo / valores**<br>**permitidos**|**Facetas (cardinalidad,**<br>**defecto, restricciones)**|**Demonio**|
|**responsable**|Texto|Cardinalidad 1|—|
|**dominio**|Lista de CATEGORÍA<br>DE DATO|Cardinalidad 1..n; pendiente<br>de relevar con cada<br>integrante (pregunta abierta<br>8 de PI1)|—|
|**consultas_recibidas**|Lista de CONSULTA<br>A SUBMÓDULO|Cardinalidad 0..n|—|
|**Ejemplos de**<br>**instanciación**|SM-Materiales(respons<br>Marquesini)|able = L. Quiros) · SM-Manufac|turabilidad(responsable = L.|

#### **Correspondencia con la implementación en Neo4j**

Según la tabla de productos de la consigna, los frames se traducirán a nodos y propiedades en Neo4j y las reglas crisp a consultas Cypher. La correspondencia prevista es:

|**Elemento de la red**|**Elemento en Neo4j**|**Ejemplo**|
|---|---|---|
|**Nodo**|Etiqueta + propiedades|(:Pedido {id: 'P-02', estado:<br>'pendiente_de_aclaracion'})|
|**Especialización**<br>**(es_un)**|Relación ES_UN en el esquema;<br>etiquetas múltiples en las instancias|(:DatoAmbiguo)-[:ES_UN]->(:Dato) ·<br>(:Dato:DatoAmbiguo {atributo: 'entorno'})|
|**Relación**|Relación dirigida|(k:Contradiccion)-[:INVOLUCRA]->(d:Dato)|
|**Relación generada por**<br>**regla**|Relación con propiedad que registra la<br>regla|(d:Dato)-[:PROVOCA {regla: 'R01'}]->(a:Aclaracion)|
|**Cambio de estado de**<br>**un dato**|Reemplazo de la etiqueta de<br>especialización|REMOVE d:DatoEnConflicto SET d.estado =<br>'descartado'|
|**Regla crisp**|Consulta Cypher (MATCH … WHERE<br>… CREATE/SET)|R03: dos datos del mismo pedido y atributo con<br>valores incompatibles → crear Contradicción|

## **g) Reglas de conocimiento**

Cada regla documenta, además de lo que pide la consigna, su tipo, su trazabilidad (frames que utiliza y reglas relacionadas) y un ejemplo tomado de los casos de uso. Las reglas se expresan en lenguaje natural estructurado con la forma SI condición ENTONCES conclusión o acción, y referencian los slots de los frames para que puedan implementarse posteriormente como consultas o inferencias. Todas son reglas crisp: dada una misma situación del modelo producen siempre el mismo resultado. Cuando una regla depende de un criterio todavía no relevado (el conjunto de datos requeridos o la criticidad), ese criterio se trata como parámetro y no como conocimiento fijado.

**Estrategia de resolución de conflictos (M17).** Cuando varias reglas pueden dispararse sobre la misma situación se aplica este orden: (1) R09, restricción de integridad que se verifica antes de cualquier asignación; (2) R13, que incorpora la nueva información; (3) detección: R03, R01 y R02; (4) clasificación: R04 a R07; (5) R08 y R10, que completan las aclaraciones y consultas creadas; (6) R11 y, si se cumple, R12. Si una expresión activa R01 y R07 (por ejemplo, E1 «cartel de neón»), se dispara R01 y R07 se evalúa recién con la respuesta del cliente: no se convierte en necesidad funcional una expresión cuya lectura todavía es dudosa. R11 es la única regla que asigna el estado _listo_para_evaluación_ . El orden es una decisión de diseño y se validará con la fuente experta.

##### **R01 · Ambigüedad interpretativa**

|**SI**|Expresión.interpretaciones_posibles contiene más de una interpretación razonable<br>Y el cliente no confirmó ninguna de ellas|
|---|---|
|**ENTONCES**|crear Dato ambiguo para el atributo correspondiente con valor = nulo<br>Y mantener Expresión.interpretación_elegida = nulo<br>Y crear Aclaración (motivo = ambigüedad)|
|**Tipo**|Heurística / subjetiva en el reconocimiento; ejecución determinística.|
|**Descripción**|Cuando lo dicho por el cliente admite varias lecturas, el experto no elige una en silencio sino<br>que pregunta.|
|**Propósito**|Evitar que una suposición del intérprete se transmita como requerimiento del cliente.|
|**Evidencia**<br>**utilizada**|Texto literal de la expresión e interpretaciones alternativas reconocidas por el experto.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 1; flujo etapa 3; casos límite 1 y 2.|
|**Trazabilidad**|Frames: Expresión, Dato ambiguo, Aclaración. Reglas relacionadas: R07 (tiene prioridad<br>sobre ella), R08, R11, R13.|
|**Ejemplo**|Entrada: E3 «para poner en la pared» (P-01). Salida: D3 ambiguo {interior | exterior}, valor<br>nulo; se crea A2.|
|**Estado / notas**|Pendiente de validación. La detección de cuándo una lectura es «razonable» requiere el<br>glosario de expresiones frecuentes (pregunta abierta 3).|

|**R02 · Dato req**|**uerido faltante**|
|---|---|
|**SI**|un atributo pertenece a Pedido.datos_requeridos<br>Y no existe Dato con valor aportado para ese atributo<br>Y el atributo no está cubierto por una Necesidad funcional (RL24)|
|**ENTONCES**|crear Dato faltante (criticidad = sin_clasificar) y registrar que el Pedido lo omite<br>(RL23)<br>Y crear Aclaración (motivo = faltante) específica para ese atributo|
|**Tipo**|Determinística.|
|**Descripción**|Si falta información necesaria para la evaluación posterior, se registra como pendiente y se<br>pide de forma concreta.|
|**Propósito**|Que ningún submódulo reciba un caso al que le falta información que necesita.|
|**Evidencia**<br>**utilizada**|Ausencia de valor para un atributo requerido.|
|**Origen del**<br>**conocimiento**|PI1: reglas candidatas 2 y 7; flujo etapa 4; caso típico «pedido con información faltante»<br>(M13, M14).|
|**Trazabilidad**|Frames: Pedido (datos_requeridos), Dato faltante, Necesidad funcional, Aclaración. Reglas<br>relacionadas: R07, R10, R11, R12.|
|**Ejemplo**|Entrada: P-01 no informa superficie ni montaje. Salida: D4 faltante (criticidad = sin_clasificar)<br>y A4. La tecnología no se reclama porque NF1 la cubre tras la iteración 2.|
|**Estado / notas**|Pendiente de validación. El conjunto datos_requeridos por tipo de cartel se relevará con la<br>fuente experta.|

##### **R03 · Contradicción entre datos**

|**SI**|existen dos o más Datos del mismo Pedido con el mismo atributo<br>Y sus valores son incompatibles entre sí (no alcanza con que difieran en la forma:<br>«3 m» y «300 cm» son compatibles)|
|---|---|
|**ENTONCES**|crear Contradicción que involucra esos datos<br>Y estado de cada dato ← en_conflicto<br>Y no asignar valor válido al atributo<br>Y crear Aclaración (motivo = contradicción)|
|**Tipo**|Determinística.|
|**Descripción**|Ante datos contradictorios, el experto conserva el conflicto explícito y pide confirmación.|
|**Propósito**|Impedir que el sistema resuelva arbitrariamente un conflicto que sólo el cliente puede<br>resolver.|
|**Evidencia**<br>**utilizada**|Valores del texto, medidas y referencias visuales sobre un mismo atributo.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 3; flujo etapa 5; casos límite 1 y 2; punto de decisión sobre datos<br>contradictorios.|
|**Trazabilidad**|Frames: Dato en conflicto, Contradicción, Referencia visual, Aclaración. Reglas<br>relacionadas: R11, R13.|
|**Ejemplo**|Entrada: E6 «con luz» y RV2 sin iluminación (P-02). Salida: K1 abierta; D7 y D10 en<br>conflicto; A5.|
|**Estado / notas**|Pendiente de validación de las contradicciones más frecuentes (pregunta abierta 5). Las<br>diferencias de unidad se resuelven normalizando; la incompatibilidad semántica depende del<br>experto.|

|**R04 · Restricc**|**ión explícita**|
|---|---|
|**SI**|el cliente declara de forma explícita que una condición debe cumplirse|
|**ENTONCES**|crear Restricción del cliente (rigidez = obligatoria)<br>Y registrarla en Ficha.restricciones|
|**Tipo**|Heurística / empírica.|
|**Descripción**|Una condición declarada como obligatoria se preserva como restricción para los submódulos<br>siguientes.|
|**Propósito**|Garantizar que la evaluación y el rediseño respeten lo que el cliente no quiere modificar.|
|**Evidencia**<br>**utilizada**|Declaración explícita de obligatoriedad en la expresión del cliente.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 4; caso típico «pedido con restricción explícita».|
|**Trazabilidad**|Frames: Expresión, Restricción del cliente, Ficha. Reglas relacionadas: R05, R06.|
|**Ejemplo**|Entrada: E9 «sí o sí antes de la inauguración». Salida: RC1 con rigidez = obligatoria en<br>Ficha.restricciones.|
|**Estado / notas**|Pendiente de validación de las marcas de obligatoriedad (pregunta abierta 4).|

##### **R05 · Preferencia no promovible**

|**SI**|una condición fue expresada como deseo<br>Y no existe declaración explícita de obligatoriedad|
|---|---|
|**ENTONCES**|crear Preferencia (rigidez = preferencia)<br>Y no transformarla en Restricción del cliente sin confirmación del cliente|
|**Tipo**|Heurística / empírica.|
|**Descripción**|Lo que el cliente expresa como deseo no se convierte automáticamente en una exigencia.|
|**Propósito**|Conservar margen para que los submódulos siguientes propongan alternativas.|
|**Evidencia**<br>**utilizada**|Forma en que el cliente presenta la condición (deseo frente a exigencia).|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 5; glosario «Preferencia».|
|**Trazabilidad**|Frames: Expresión, Preferencia. Reglas relacionadas: R04, R06.|
|**Ejemplo**|Entrada: E10 «si se puede, en los colores del logo». Salida: PR1 con rigidez = preferencia.|
|**Estado / notas**|Pendiente de validación.|

|**R06 · Rigidez**|**a confirmar**|
|---|---|
|**SI**|no puede determinarse si una condición es obligatoria o un deseo|
|**ENTONCES**|Requerimiento.rigidez ← a_confirmar<br>Y crear Aclaración (motivo = rigidez)|
|**Tipo**|Subjetiva.|
|**Descripción**|Si una expresión puede ser preferencia o restricción, el experto confirma su rigidez antes de<br>registrarla.|
|**Propósito**|Evitar tanto endurecer como relajar indebidamente una condición.|
|**Evidencia**<br>**utilizada**|Expresión sin marca clara de obligatoriedad ni de deseo.|
|**Origen del**<br>**conocimiento**|PI1: caso límite 5; incertidumbre «rigidez o negociabilidad».|
|**Trazabilidad**|Frames: Requerimiento, Aclaración, Advertencia. Reglas relacionadas: R04, R05, R12.|
|**Ejemplo**|Entrada (ilustrativa, fuera de los casos): «estaría bueno que no pase de 2 metros». Salida:<br>rigidez = a_confirmar y aclaración de rigidez.|
|**Estado / notas**|Pendiente de validación. Candidata a tratamiento difuso en PI3.|

##### **R07 · Necesidad funcional sin tecnología**

|**SI**|el cliente describe un efecto, uso o apariencia buscada<br>Y no define la tecnología o la define de forma coloquial<br>Y la expresión no tiene interpretaciones pendientes de aclarar (R01 tiene prioridad)|
|---|---|
|**ENTONCES**|crear Necesidad funcional (tecnología_asociada = no_definida)<br>Y registrar que cubre la categoría producto_tecnología (RL24)<br>Y derivar la selección técnica a los submódulos de evaluación|
|**Tipo**|Inferencial.|
|**Descripción**|El experto conserva la necesidad del cliente y no la convierte prematuramente en una<br>solución técnica.|
|**Propósito**|Mantener el límite del submódulo: interpretar sin elegir materiales ni tecnología.|
|**Evidencia**<br>**utilizada**|Expresiones que describen efectos («que se vea lindo de noche») o referencias visuales.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 6; caso típico «pedido en lenguaje no técnico»; excepción 2 (M14).|
|**Trazabilidad**|Frames: Expresión, Necesidad funcional. Reglas relacionadas: R01, R02, R10.|
|**Ejemplo**|Entrada: E5 «que se vea lindo de noche». Salida: NF1 con tecnología_asociada =<br>no_definida. En la iteración 2, la respuesta a A1 amplía NF1 y cubre la tecnología.|
|**Estado / notas**|Pendiente de validación.|

##### **R08 · Formulación adaptada al cliente**

|**SI**|se crea una Aclaración|
|---|---|
|**ENTONCES**|Aclaración.formulación ← en_términos_de_uso si Cliente.conoce_terminología �<br>{no, desconocido}<br>(la pregunta se expresa en términos de uso, necesidad o condiciones observables)<br>Aclaración.formulación ← técnica si Cliente.conoce_terminología = sí<br>Aclaraci6n.formulacién — en_términos_de_uso si Cliente.conoce_terminologia 0|
|**Tipo**|Contextual.|
|**Descripción**|Si el cliente no puede responder una pregunta técnica, se reformula en términos que pueda<br>contestar.|
|**Propósito**|Obtener una respuesta útil sin exigir conocimiento que el cliente no tiene.|
|**Evidencia**<br>**utilizada**|Vocabulario del cliente en sus expresiones.|
|**Origen del**<br>**conocimiento**|PI1: excepción 2 (§6); pregunta experta 6.|
|**Trazabilidad**|Frames: Cliente, Aclaración. Reglas relacionadas: R01, R02, R03.|
|**Ejemplo**|Entrada: C-01 con conoce_terminología = no y aclaración sobre D3. Salida: A2 formulada en<br>términos de uso. Con C-02 (conoce_terminología = sí), A5 y A6 se formulan en términos<br>técnicos.|
|**Estado / notas**|Pendiente de validación de la forma más útil de formular aclaraciones.|

##### **R09 · Prohibición de inventar valores**

|**SI**|se intenta asignar un valor a un Dato<br>Y el origen no es «cliente» ni «respuesta_a_aclaración»|
|---|---|
|**ENTONCES**|rechazar la asignación<br>Y mantener o crear el Dato como faltante|
|**Tipo**|Determinística.|
|**Descripción**|El submódulo no completa el pedido con valores que nadie aportó ni validó.|
|**Propósito**|Asegurar la trazabilidad de cada dato hasta su fuente.|
|**Evidencia**<br>**utilizada**|Procedencia (origen) del valor.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 9; criterio de validez.|
|**Trazabilidad**|Frames: Dato (faceta origen). Reglas relacionadas: R02.|
|**Ejemplo**|Entrada: intento de deducir la altura de las letras de P-02 a partir del largo total. Salida:<br>asignación rechazada; el dato no se completa.|
|**Estado / notas**|Validada como criterio de diseño en PI1; se implementa además como faceta del slot origen.|

|**R10 · Consulta**|**a otro submódulo**|
|---|---|
|**SI**|la necesidad o la criticidad de un Dato depende de conocimiento de materiales,<br>instalación o manufacturabilidad|
|**ENTONCES**|crear Consulta a submódulo dirigida al submódulo correspondiente (relación<br>requiere_consulta_a)<br>Y no resolver la cuestión dentro de la interpretación|
|**Tipo**|Contextual / documental.|
|**Descripción**|Las dudas que pertenecen a otro dominio se derivan al submódulo experto correspondiente.|
|**Propósito**|Respetar los límites entre submódulos y evitar decisiones técnicas fuera de alcance.|
|**Evidencia**<br>**utilizada**|Categoría del dato y dominio del submódulo de evaluación.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 10; excepción 3; límite del submódulo.|
|**Trazabilidad**|Frames: Dato faltante, Consulta a submódulo, Submódulo de evaluación. Reglas<br>relacionadas: R02, R11.|
|**Ejemplo**|Entrada: D4 superficie/montaje (P-01). Salida: Q1 dirigida a Materiales e instalación.|
|**Estado / notas**|Pendiente de validación del dominio de cada submódulo (pregunta abierta 8).|

|**R11 · Habilitaci**|**ón del pedido (suficiencia)**|
|---|---|
|**SI**|todo atributo de Pedido.datos_requeridos tiene Dato confirmado, está cubierto por<br>una Necesidad funcional o tiene Dato faltante con criticidad = postergable<br>Y no existe Dato ambiguo sobre un dato requerido<br>Y no existe Contradicción con estado = abierta|
|**ENTONCES**|Pedido.estado ← listo_para_evaluación<br>Y crear Ficha de requerimientos interpretados<br>Y derivarla a los submódulos de evaluación|
|**Tipo**|Determinística / inferencial.|
|**Descripción**|El pedido avanza sólo cuando la información necesaria está confirmada y es consistente. Es<br>la única regla que asigna este estado: una aclaración pendiente sobre un dato postergable o<br>una rigidez a_confirmar no bloquea el avance, sino que viaja como advertencia (R12).|
|**Propósito**|Definir de forma verificable el punto de salida del ciclo de interpretación.|
|**Evidencia**<br>**utilizada**|Estados de los datos, cobertura de los datos requeridos, criticidad de los faltantes y estado<br>de las contradicciones.|
|**Origen del**<br>**conocimiento**|PI1: regla candidata 8; puntos de decisión del diagrama; caso típico «pedido suficientemente<br>definido» (M14, M17).|
|**Trazabilidad**|Frames: Pedido, Dato, Necesidad funcional, Contradicción, Ficha. Reglas relacionadas: R01,<br>R02, R03, R10, R12.|
|**Ejemplo**|Entrada: P-02 en la iteración 2, sin faltantes ni ambiguos y con K1 resuelta. Salida: estado =<br>listo_para_evaluación; se crea FR-02.|
|**Estado / notas**|Pendiente de validación. Tratar «sin_clasificar» como bloqueante es un criterio de resguardo<br>tomado del flujo de PI1 (el faltante se consulta antes de avanzar), no un umbral relevado.|

|**R12 · Herencia**|**de incertidumbre**|
|---|---|
|**SI**|se crea la Ficha<br>Y existe Dato faltante con criticidad = postergable, Requerimiento con rigidez =<br>a_confirmar o Referencia visual cuyo aporta_sobre se restringió tras una aclaración|
|**ENTONCES**|crear una Advertencia por cada uno (motivo = dato_postergable_pendiente,<br>rigidez_a_confirmar o alcance_limitado_de_referencia) e incluirla en<br>Ficha.advertencias<br>Y no registrarlos como datos confirmados|
|**Tipo**|Inferencial.|
|**Descripción**|Lo que sigue incierto viaja a los submódulos siguientes marcado como tal.|
|**Propósito**|Que los submódulos de evaluación no traten dudas como hechos.|
|**Evidencia**<br>**utilizada**|Criticidad, rigidez y alcance de las referencias registrados.|
|**Origen del**<br>**conocimiento**|PI1: pregunta experta 8; excepción 1; caso límite 1 (M16).|
|**Trazabilidad**|Frames: Ficha, Advertencia, Dato faltante, Requerimiento, Referencia visual. Reglas<br>relacionadas: R06, R11.|
|**Ejemplo**|Entrada: P-01 en la iteración 2 con D4 postergable → AV1. P-02 en la iteración 2 con RV2<br>restringida a la tipografía → AV2.|
|**Estado / notas**|Pendiente de validación.|

|**R13 · Reingres**|**o de la respuesta**|
|---|---|
|**SI**|Aclaración.estado cambia a respondida|
|**ENTONCES**|registrar la respuesta como nueva Expresión (fuente = respuesta_a_aclaración)<br>Y reevaluar R01, R02, R03 y R07 sobre los datos afectados<br>Y Pedido.iteración ← Pedido.iteración + 1|
|**Tipo**|Determinística.|
|**Descripción**|La nueva información vuelve al ciclo de interpretación.|
|**Propósito**|Representar el carácter iterativo del proceso experto.|
|**Evidencia**<br>**utilizada**|Respuesta del cliente.|
|**Origen del**<br>**conocimiento**|PI1: flujo etapa 6; flecha «Nueva info» del diagrama de procesos.|
|**Trazabilidad**|Frames: Aclaración, Expresión, Pedido. Reglas relacionadas: R01, R02, R03, R07.|
|**Ejemplo**|Entrada: respuesta de C-01 («Es adentro… el metro es lo que tiene que medir el cartel»).<br>Salida: nueva expresión; D3 y D5 se reclasifican como confirmados; iteración = 2.|
|**Estado / notas**|Pendiente de validación.|

## **h) Clasificación del conocimiento**

La tabla clasifica las reglas y los conceptos modelados según el tipo de conocimiento que representan, con la misma denominación usada en el campo _Tipo_ de cada regla. Un mismo elemento puede tener más de una clasificación: por ejemplo, una regla puede ejecutarse de forma determinística aunque la condición que evalúa se haya obtenido de la experiencia.

|**Elemento**|**Clasificación**|**Justificación**|
|---|---|---|
|**R02, R03, R09, R13**|Determinístico|Las condiciones son verificables sobre el estado del modelo<br>(hay o no hay valor, son compatibles o no los valores, cambia<br>o no el estado de una aclaración) y siempre producen la<br>misma acción.|
|**R11**|Determinístico /<br>inferencial|Su ejecución es crisp, pero infiere el estado del pedido a<br>partir de los estados de sus datos; no se asigna de forma<br>directa.|
|**R01**|Heurístico / subjetivo|La regla es crisp una vez registradas las interpretaciones,<br>pero reconocer que una expresión admite varias lecturas<br>depende de la experiencia del fabricante.|
|**R04, R05**|Heurístico / empírico|Se basan en marcas del lenguaje (declaraciones de<br>obligatoriedad o de deseo) que el experto aprendió con la<br>práctica y que se relevarán con casos reales.|
|**R06**|Subjetivo|La rigidez de una condición mal expresada es una<br>apreciación del intérprete; por eso se modela un valor<br>intermedio (a_confirmar).|
|**R07**|Inferencial|Se infiere una necesidad funcional a partir de un efecto<br>descripto, sin llegar a una solución técnica.|
|**R08**|Contextual|La formulación depende del cliente concreto y de su<br>familiaridad con la terminología.|
|**R10**|Contextual / documental|Depende del dominio de otro submódulo; en parte puede<br>justificarse con fichas técnicas y documentación de<br>materiales.|
|**R12**|Inferencial|Deriva advertencias a partir de la criticidad, la rigidez y el<br>alcance registrados.|
|**Estrategia de resolución de**<br>**conflictos**|Determinístico (control)|Fija el orden de disparo de las reglas; es una decisión de<br>diseño que se validará con el experto.|
|**Conjunto de datos**<br>**requeridos**|Contextual / empírico /<br>documental|Varía según el tipo de cartel y el contexto; se obtiene de<br>casos reales y, en parte, de documentación técnica.|
|**Criticidad del faltante**|Empírico|La distinción entre bloqueante y postergable surge de la<br>experiencia del fabricante; hoy permanece sin clasificar.|
|**Glosario cliente →**<br>**concepto técnico**|Empírico|Se construye a partir del análisis de pedidos y<br>conversaciones históricas.|
|**Categorías de dato**|Documental|Surgen de la estructura de entradas definida en PG0 y PI1.|
|**Faceta de origen (no**<br>**inventar)**|Determinístico|Es una restricción de integridad derivada del criterio de<br>validez de PI1.|
|**Claridad de la intención del**<br>**cliente**|Subjetivo|Corresponde al primer punto de decisión del diagrama y<br>depende del juicio del experto.|

En síntesis, el **control** del submódulo es determinístico (cuándo pedir, cuándo registrar, en qué orden razonar y cuándo avanzar), mientras que el **reconocimiento** de las situaciones que activan esas reglas es mayormente heurístico, empírico y subjetivo. Esta diferencia explica por qué la adquisición de conocimiento pendiente se concentra en glosarios, marcas del lenguaje y criterios de criticidad, y no en la lógica de las reglas.

## **i) Elementos candidatos para lógica difusa**

En PI2 estos elementos se representan con valores discretos que funcionan como marcadores crisp (ambiguo, a_confirmar, sin_clasificar). Se identifican aquí porque el experto los evalúa de forma gradual. Los términos lingüísticos son tentativos: los conjuntos difusos, rangos y funciones de pertenencia se definirán en PI3 a partir del conocimiento validado.

|**Variable candidata**|**Dónde aparece en el**<br>**modelo**|**Por qué no es estrictamente binaria**|**Términos**<br>**tentativos**|
|---|---|---|---|
|**Grado de ambigüedad**<br>**de una expresión**|Expresión.interpretaciones_<br>posibles; R01|Algunas expresiones tienen una lectura<br>claramente dominante y otras son<br>totalmente abiertas.|baja, media, alta|
|**Precisión de una**<br>**dimensión informada**|Dato.valor (dimensiones);<br>caso 1 «más o menos de<br>un metro»|Un valor aproximado puede alcanzar<br>para una etapa y no para otra.|exacta,<br>aproximada, vaga|
|**Grado de suficiencia**<br>**del pedido**|Pedido.estado; R11|Un pedido puede estar casi completo;<br>hoy R11 lo trata como binario.|insuficiente, parcial,<br>suficiente|
|**Rigidez de una**<br>**condición**|Requerimiento.rigidez; R04<br>a R06|El cliente expresa condiciones con<br>distintos grados de firmeza.|negociable, flexible,<br>no negociable|
|**Confianza de**<br>**traducción a concepto**<br>**técnico**|Necesidad funcional; R07|Algunas descripciones apuntan<br>claramente a una solución y otras<br>admiten varias.|baja, media, alta|
|**Criticidad de un dato**<br>**faltante**|Dato faltante.criticidad;<br>R02, R11, R12|Un faltante puede ser más o menos<br>determinante según el caso.|postergable,<br>relevante,<br>bloqueante|
|**Claridad de la**<br>**intención del cliente**|Primer punto de decisión<br>del diagrama de PI1|La intención rara vez es totalmente clara<br>o totalmente confusa.|confusa, parcial,<br>clara|
|**Familiaridad con la**<br>**terminología**|Cliente.conoce_terminologí<br>a; R08|El cliente puede manejar algunos<br>términos técnicos y desconocer otros.|baja, media, alta|

La criticidad de un dato faltante merece una observación: la devolución de PI1 la plantea como una distinción pendiente de adquisición. Es posible que, una vez relevada, resulte suficiente como clasificación crisp por tipo de cartel; su tratamiento difuso se decidirá con el experto en PI3.

## **j) Referencias y fuentes consultadas**

1. Actividad PI2 – Unidad 1 (Individual): Documentación del modelado mediante redes semánticas, frames y reglas. Cátedra de Inteligencia Artificial, UTN FRM, 2026.

2. Zarandon, M. Actividad PI1: Análisis de la tarea experta, procesos y Cuaderno de Conocimiento. Submódulo de interpretación técnica de requerimientos y restricciones del cliente. UTN FRM, 2026.

3. Devolución de la cátedra sobre la Actividad PI1 (revisión conceptual y proyección a PI2), 2026.

4. Grupo 11 – PG0: Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial. Distribución preliminar en submódulos. UTN FRM, 2026.

5. Apuntes de la cátedra: Unidad 1 – Representación del conocimiento y razonamiento (redes semánticas, frames, reglas de producción, cuaderno de conocimiento). UTN FRM, 2026.

6. Minsky, M. (1974). _A Framework for Representing Knowledge_ . MIT AI Laboratory, Memo 306.

7. Quillian, M. R. (1968). Semantic memory. En M. Minsky (Ed.), _Semantic Information Processing_ (pp. 227–270). MIT Press.

8. Giarratano, J. y Riley, G. (2001). _Sistemas expertos: principios y programación_ (3.ª ed.). International Thomson Editores.

9. Russell, S. y Norvig, P. (2020). _Artificial Intelligence: A Modern Approach_ (4.ª ed.). Pearson.

10. Fuente experta prevista para la validación: Luciano Marquesini, integrante del grupo con experiencia directa en fabricación de cartelería comercial.

**Resultado del PI2.** El submódulo cuenta con una red semántica conceptual, dos casos instanciados con los mismos verbos de la red, un diccionario de frames con herencia, facetas y demonios, y trece reglas crisp trazables a PI1 con una estrategia explícita de resolución de conflictos. Los frames se traducirán a etiquetas y propiedades de nodos en Neo4j (las relaciones es_un como etiquetas múltiples) y las reglas a consultas Cypher. Los criterios pendientes (datos requeridos por tipo de cartel y criticidad de los faltantes) quedan representados como parámetros, listos para completarse con la adquisición de conocimiento y retomarse en PI3.
