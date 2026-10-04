# ACTIVIDAD

### INTELIGENCIA ARTIFICIAL

Integrantes: Lautaro Quiros, Marquesini Luciano y Zarandon Matias Profesores: Ing. Matilde Inés Césari — Ing. María Eugenia Stefanoni

## **b) Revisión PI0 y Justificación de la Elección**

Se evaluaron tres propuestas individuales desarrolladas en la instancia PI0:

1. Sistema Experto para la Gestión de Carga de Entrenamiento y Prevención de Riesgo de Lesión en Deportistas Amateur (Matías): Propuesta de gran interés e impacto en el ámbito deportivo, centrada en variables como la relación aguda:crónica y el autorreporte de bienestar. Sin embargo, se descartó porque el modelado del conocimiento requería un seguimiento longitudinal y el manejo de variables muy subjetivas (dolor, fatiga) cuya validación técnica constante dependía de un profesional de la salud o kinesiólogo.

2. FitoVid - Sistema Experto para el Diagnóstico de Enfermedades de la Vid y Recomendación de Tratamientos (Lautaro): Proyecto altamente viable y muy bien contextualizado en la región de Mendoza, con reglas claras basadas en clima, fenología y síntomas para detectar patologías como peronóspora u oídio. Se descartó únicamente porque requería la validación continua de un Ingeniero Agrónomo experto, un acceso más limitado para el equipo.

3. Sistema Experto para la Evaluación de Factibilidad Técnica y Asignación Eficiente de Recursos en la Fabricación de Cartelería Comercial (Luciano): Enfocada en la manufactura a medida de carteles de Neón LED, corpóreos y retroiluminados.

**Justificación de la Elección:** Se seleccionó la propuesta de cartelería (3) porque aborda una necesidad real del sector manufacturero, donde conciliar las restricciones espaciales y de recursos de un cliente con la factibilidad estructural requiere un fuerte conocimiento experto. Destaca por su alta viabilidad y disponibilidad de conocimiento, ya que se cuenta con casos reales de fabricación y experiencia directa del grupo en la fabricación real de cartelería LED y neón.

**Alcance previsto del sistema:** El sistema asistirá al fabricante en la evaluación técnica de propuestas de cartelería Neón LED, corpórea y retroiluminada. Permitirá identificar restricciones relacionadas con materiales, dimensiones, condiciones del entorno, instalación y manufacturabilidad, así como recomendar alternativas de rediseño fundamentadas en conocimiento experto. Los costos y la disponibilidad de recursos serán considerados como restricciones adicionales dentro del análisis, pero no constituirán el objetivo principal del sistema. La decisión final permanecerá en manos del fabricante. No se incluye la generación automatizada del diseño vectorial, la renderización 3D del producto final ni el procesamiento de transacciones o pagos comerciales.

## **c) Formulación del Proyecto**

- **Nombre del proyecto:** Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial

- **Problema** : En la fabricación de cartelería a medida, determinar si una propuesta es técnicamente viable requiere considerar simultáneamente el tipo de cartel, sus dimensiones, materiales, ubicación, condiciones del entorno, método de instalación, características visuales y restricciones planteadas por el cliente. Estas decisiones no dependen únicamente de cálculos de materiales o recursos, sino también de criterios prácticos adquiridos mediante la experiencia de fabricación. El problema consiste en asistir al fabricante en la evaluación de una propuesta, detectar condiciones técnicamente problemáticas, identificar información faltante y recomendar alternativas justificadas cuando la configuración inicial no resulte conveniente.

- **Tipo de tarea experta:**

   - **Principal:** Evaluación técnica de la factibilidad de una propuesta de cartelería y detección de restricciones.

   - **Secundaria:**

      - Interpretación de requerimientos inicialmente ambiguos e identificación de información faltante

      - Recomendación de alternativas de fabricación o rediseño ante restricciones detectadas. .

- **Usuario principal:** Técnico, proyectista o fabricante de cartelería que necesita analizar la viabilidad de una propuesta y recibir alternativas fundamentadas. El sistema actúa como asistente y la decisión final permanece bajo responsabilidad del usuario experto.

- **Preguntas expertas:**

   1. **(Interpretación)** ¿Qué información técnica debe extraerse o solicitarse para poder evaluar correctamente el pedido del cliente?

   2. **(Evaluación)** ¿Qué características de la propuesta condicionan su factibilidad según los materiales, dimensiones, entorno y condiciones de instalación?

   3. **(Diagnóstico)** ¿Qué restricciones o incompatibilidades presenta la configuración propuesta?

   4. **(Recomendación)** Cuando una configuración presenta una restricción, ¿qué alternativas consideraría un fabricante experimentado?

   5. **(Comparación)** ¿Qué compromisos entre factibilidad técnica, manufacturabilidad, estética, recursos y requerimientos del cliente son aceptables?

   6. **(Explicación)** ¿Por qué una alternativa resulta más apropiada que otra y qué conocimiento experto fundamenta esa recomendación?

   7. **(Excepciones)** ¿En qué situaciones una regla general deja de ser aplicable debido a condiciones particulares del trabajo?

- **Entradas:** Requerimientos iniciales del cliente, dimensiones aproximadas, tecnología deseada, características visuales, entorno interior o exterior, condiciones de instalación o montaje, disponibilidad de materiales y demás restricciones relevantes.

- **Salidas:** Evaluación de factibilidad técnica, restricciones detectadas, información faltante, alternativas técnicamente aceptables y explicación de las reglas o criterios que fundamentan cada recomendación. La estimación de recursos podrá incluirse como información complementaria.

## **d) Conocimiento a adquirir**

El dominio del conocimiento abarca la intersección entre diseño estructural, manufactura e instalación de cartelería. Este conocimiento se organizará mediante conceptos principales modelados con atributos específicos (slots). Por ejemplo, la entidad Cartel podrá incluir atributos como tecnología (Neón LED, Corpóreo, Retroiluminado), dimensiones_totales y entorno (Interior, Exterior). Por su parte, la entidad Material podrá incluir atributos como tipo, espesor_mm y características técnicas relevantes. Además de estos atributos, se representarán relaciones de compatibilidad, restricciones de fabricación, condiciones de instalación, alternativas de rediseño y excepciones utilizadas por el experto durante la evaluación de una propuesta.

#### **Plan de adquisición del conocimiento experto**

La fuente principal de conocimiento será Luciano Marquesini, integrante del grupo con experiencia directa en fabricación de cartelería comercial. La adquisición no estará orientada solamente a obtener datos sobre materiales o recursos, sino principalmente a comprender cómo razona un fabricante al evaluar una propuesta: qué factores observa, qué información considera necesaria, qué restricciones detecta, qué alternativas analiza, qué excepciones reconoce y cómo justifica sus decisiones.

El conocimiento se relevará mediante entrevistas semiestructuradas, análisis de casos reales anteriores y técnica de pensamiento en voz alta. Durante las entrevistas se buscará identificar los criterios utilizados para aceptar, rechazar o modificar una propuesta. En el análisis de casos se reconstruirán las razones por las que se eligieron determinadas soluciones. Mediante pensamiento en voz alta se presentarán casos al experto para registrar qué observa primero, qué información solicita, qué hipótesis considera, qué alternativas descarta y cómo llega a una recomendación.

Este conocimiento será complementado mediante fichas técnicas, catálogos de proveedores y documentación de materiales para respaldar aquellas restricciones que puedan verificarse documentalmente.

También se registrarán explícitamente las **excepciones** , es decir, situaciones en las que una regla general no puede aplicarse debido a características particulares como dimensiones, entorno, tipo de instalación, material, geometría o método constructivo.

Para cada regla de conocimiento se documentará:

#### **Condiciones → conclusión o recomendación → justificación → fuente → excepciones conocidas.**

La validación será iterativa. Las reglas formalizadas serán presentadas nuevamente al experto y evaluadas mediante nuevos casos de prueba. Si la conclusión generada por el sistema no coincide con el razonamiento que aplicaría el experto, la regla será revisada hasta representar adecuadamente el conocimiento del dominio.

El conocimiento se organizará mediante conceptos y relaciones que representen no solamente los atributos de cada cartel o material, sino también compatibilidades, restricciones, alternativas de rediseño y criterios utilizados por el fabricante para decidir cuándo una solución resulta técnicamente apropiada.

Las relaciones entre estos conceptos establecerán dependencias técnicas gobernadas por reglas de decisión y restricciones adquiridas del experto. Por ejemplo, podrán existir reglas que relacionen el entorno de instalación con determinadas características de protección de materiales y componentes, o que determinen cuándo una combinación de dimensiones, material y método de instalación requiere una evaluación adicional. Una regla general de rediseño establecerá que SI una configuración resulta técnicamente inviable o presenta una restricción relevante, ENTONCES se activa la evaluación de alternativas técnicamente compatibles. Estas alternativas podrán involucrar cambios de material, tecnología, dimensiones, refuerzos, método constructivo o condiciones de instalación, pero únicamente se incorporarán como recomendaciones cuando hayan sido previamente relevadas y validadas con la fuente experta.

Para manejar la incertidumbre, el sistema integrará variables difusas asociadas a conceptos que el experto evalúa de manera gradual y no estrictamente binaria. Entre las variables inicialmente consideradas se encuentran la complejidad de fabricación, la dificultad de instalación, la exposición ambiental y el grado de adecuación de una alternativa. Los conjuntos difusos, rangos y reglas asociadas serán definidos posteriormente a partir del conocimiento relevado y validado con el experto.

**Caso de uso concreto:** Un cliente solicita un cartel corpóreo para instalación exterior, indicando dimensiones aproximadas, determinadas características visuales y ciertas restricciones respecto de los recursos disponibles.

**Razonamiento del sistema (Ejemplo Integrador):** Al recibir la solicitud, el asistente estructura los requerimientos e identifica qué información técnica se encuentra disponible y qué datos adicionales son necesarios para realizar una evaluación. A continuación, recupera de la base de conocimiento los conceptos, relaciones y reglas asociados con el tipo de cartel, los materiales, las dimensiones, el entorno y las condiciones de instalación.

Si alguna combinación de características entra en conflicto con las prácticas de fabricación relevadas, el sistema identifica la restricción y su causa. Luego consulta las alternativas que un fabricante experimentado considera ante situaciones equivalentes y descarta aquellas que no resultan técnicamente compatibles.

Las alternativas restantes son contrastadas con las restricciones particulares del cliente y del proceso de fabricación. El sistema presenta una o más opciones posibles e indica qué reglas, relaciones y criterios expertos fundamentan cada recomendación. La decisión sobre cuál alternativa utilizar permanece en manos del fabricante.

Los valores concretos de espesores, dimensiones máximas, materiales compatibles y demás umbrales técnicos serán incorporados únicamente después de ser relevados y validados con la fuente experta correspondiente.

## **e) Hipótesis Tecnológica**

Se propone una implementación basada en Python que combine representación estructurada del conocimiento, reglas de inferencia, lógica difusa y modelos de lenguaje.

- **Grafo de conocimiento y reglas:** Permitirá representar conceptos y relaciones del dominio, como tecnologías, materiales, tipos de instalación, restricciones y alternativas. Las reglas formalizarán el conocimiento adquirido y validado con la fuente experta, permitiendo realizar inferencias justificables.

- **Lógica difusa:** Permitirá representar criterios que no poseen límites estrictamente binarios, como complejidad de fabricación, dificultad de montaje, exposición ambiental o grado de adecuación de una alternativa. Los rangos y funciones de pertenencia serán definidos posteriormente a partir del conocimiento relevado.

- **Modelo de lenguaje (LLM):** Se utilizará como interfaz lingüística para interpretar requerimientos expresados en lenguaje natural, extraer información relevante,

detectar posibles datos faltantes y generar explicaciones comprensibles de las inferencias realizadas por el sistema.

El LLM no decidirá por sí mismo la solución técnica ni generará reglas o recomendaciones sin respaldo. Las decisiones y recomendaciones surgirán del conocimiento estructurado, las reglas y los criterios previamente relevados y validados. La decisión final permanecerá bajo responsabilidad del usuario experto.

## **f) Distribución preliminar en submódulos**

|**Integrante responsable**|**Nombre del Submódulo**|**Función principal**|
|---|---|---|
|**Lautaro Quiros**|**Evaluación de materiales y**<br>**condiciones de instalación**|**Analizar y modelar cómo un**<br>**fabricante determina si una**<br>**combinación de tipo de cartel,**<br>**materiales, dimensiones,**<br>**entorno y condiciones de**<br>**instalación resulta**<br>**técnicamente apropiada. El**<br>**subproblema incluirá las**<br>**restricciones consideradas por**<br>**el experto, las relaciones entre**<br>**los elementos involucrados y**<br>**las excepciones que pueden**<br>**modificar una regla general.**|
|**Luciano Marquesini**|**Evaluación de**<br>**manufacturabilidad y**<br>**alternativas de rediseño**|**Analizar y modelar cómo un**<br>**fabricante razona cuando una**<br>**propuesta presenta una**<br>**restricción técnica o de**<br>**fabricación. El subproblema**<br>**abarcará qué alternativas**<br>**considera, qué opciones**<br>**descarta, qué compromisos**<br>**resultan aceptables y qué**<br>**criterios utiliza para**<br>**recomendar cambios de**<br>**material, tecnología,**|

|**Integrante responsable**|**Nombre del Submódulo**|**Función principal**|
|---|---|---|
|||**dimensiones, refuerzos o**<br>**método constructivo.**|
|**Matias Zarandon**|**Interpretación técnica de**<br>**requerimientos y restricciones**<br>**del cliente**|**Analizar y modelar cómo un**<br>**fabricante interpreta un pedido**<br>**inicialmente ambiguo, qué**<br>**información considera**<br>**necesaria antes de evaluar una**<br>**propuesta, qué datos faltantes**<br>**debe solicitar y cómo las**<br>**restricciones expresadas por**<br>**el cliente condicionan las**<br>**alternativas técnicamente**<br>**posibles. El subproblema**<br>**incluirá criterios para**<br>**determinar cuándo un**<br>**requerimiento posee**<br>**información suficiente y**<br>**cuándo debe solicitarse una**<br>**aclaración adicional.**|

Los tres submódulos representan problemas de conocimiento experto independientes pero relacionados. Cada integrante deberá analizar cómo razona el experto dentro de su subproblema, identificar conceptos y relaciones, representarlos mediante redes semánticas o frames, formalizar reglas y, cuando corresponda, incorporar incertidumbre mediante lógica difusa. El grafo de conocimiento, las reglas, la lógica difusa y el LLM son tecnologías compartidas para implementar estos subproblemas y no constituyen por sí mismas la división del trabajo.

## **g) Referencias Bibliográficas citadas en texto**

- **[1] Conocimiento experto, manuales de proveedores y métricas obtenidas empíricamente de la evaluación de proyectos de cartelería comercial.**

- **[2] Apuntes de la Cátedra: Unidad 0 - Sistemas Inteligentes. Guía Orientadora para la Formulación de Proyectos: Sistemas Expertos y Asistentes Inteligentes, UTN.**
