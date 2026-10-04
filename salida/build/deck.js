// Genera salida/presentacion.pptx — Grupo 11, presentación de modelado (lunes 5/10/2026)
// Uso: node salida/build/deck.js   (desde la raíz del proyecto o desde salida/build)
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply_theme.js");

const ROOT = path.resolve(__dirname, "..", "..");
const IMG = (p) => path.join(ROOT, p);
const ST = JSON.parse(fs.readFileSync(path.join(__dirname, "stats.json"), "utf8"));
const OUT = path.join(ROOT, "salida", "presentacion.pptx");

// ---------------------------------------------------------------- paleta (neón sobre carbón)
const K = {
  dark: "141824", dark2: "1F2433", ink: "1A202C", muted: "5A6578", line: "CBD5E0", soft: "F4F6FA",
  neon: "FF2E88", cyan: "22D3EE",
  INT: "2B6CB0", MAT: "2A9D8F", MAN: "D9480F", COM: "6B46C1",
  INTf: "E3EEF9", MATf: "E0F4F1", MANf: "FDEBDD", COMf: "EEE8FA",
};
const THEME = {
  name: "Neon Carbon",
  headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: K.ink, lt1: "FFFFFF", dk2: K.dark, lt2: K.soft, accent1: K.neon, accent2: K.cyan, accent3: K.INT,
            accent4: K.MAT, accent5: K.MAN, accent6: K.COM, hlink: K.INT, folHlink: K.COM },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Asistente para Evaluación Técnica y Rediseño de Cartelería — Grupo 11";
pres.author = "Grupo 11 — Zarandon, Quiros, Marquesini";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };

const FOOT = "Grupo 11 · UTN FRM 5K9 · Actividad de modelado · 5/10/2026";
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.55, y: 0.32, w: 12.2, h: 0.8, fontSize: 30, bold: true,
      color: K.ink, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: 0.55, y: 7.03, w: 9, h: 0.3, fontSize: 10, color: "8A94A6", margin: 0 } } },
  ],
  slideNumber: { x: 12.25, y: 7.03, w: 0.5, h: 0.3, fontSize: 10, color: "8A94A6", align: "right" },
});
pres.defineSlideMaster({
  title: "OSCURO",
  background: { color: K.dark },
  objects: [],
});

// ---------------------------------------------------------------- helpers
function T(slide, text, o) { slide.addText(text, Object.assign({ isTextBox: true, fontSize: 14, color: K.ink, margin: 0 }, o)); }
function caja(slide, x, y, w, h, fill, line, o = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: line, width: 1.25 }, rectRadius: 0.08 }, o));
}
function chip(slide, x, y, w, txt, color, o = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.34, fill: { color }, line: { color }, rectRadius: 0.17 });
  T(slide, txt, Object.assign({ x, y, w, h: 0.34, fontSize: 11, bold: true, color: "FFFFFF", align: "center", valign: "middle" }, o));
}
function circulo(slide, x, y, d, txt, color) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color } });
  T(slide, txt, { x, y, w: d, h: d, fontSize: 16, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
}
function flecha(slide, x1, y1, x2, y2, color = "8A94A6", w = 1.5) {
  slide.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: x2 < x1, flipV: y2 < y1, line: { color, width: w, endArrowType: "triangle" } });
}
function img(slide, p, x, y, w, h) { slide.addImage({ path: IMG(p), x, y, w, h }); }
function pngRatio(p) { // ancho/alto leído del encabezado IHDR del PNG
  const b = fs.readFileSync(IMG(p));
  return b.readUInt32BE(16) / b.readUInt32BE(20);
}
function fit(p, _ratio, x, y, maxW, maxH, slide) { // centra una imagen conservando su proporción real
  const ratio = pngRatio(p);
  let w = maxW, h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }
  img(slide, p, x + (maxW - w) / 2, y + (maxH - h) / 2, w, h);
  return { w, h, x: x + (maxW - w) / 2, y: y + (maxH - h) / 2 };
}
function nueva(titulo, seccion) {
  const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: seccion });
  s.addText(titulo, { placeholder: "title" });
  return s;
}

// ================================================================= 1. Portada
pres.addSection({ title: "Apertura" });
{
  const s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "Apertura" });
  T(s, "ACTIVIDAD DE MODELADO · AVANCE DEL PROYECTO", { x: 0.8, y: 1.15, w: 11, h: 0.4, fontSize: 14, bold: true, color: K.cyan, charSpacing: 2 });
  T(s, "Asistente Inteligente para Evaluación Técnica y Rediseño de Cartelería Comercial",
    { x: 0.8, y: 1.7, w: 10.8, h: 1.9, fontSize: 40, bold: true, color: "FFFFFF", valign: "top" });
  T(s, "Neón LED · corpórea · retroiluminada — de la red semántica a Neo4j", { x: 0.8, y: 3.75, w: 10.5, h: 0.5, fontSize: 20, color: "C9D1E0", italic: true });
  // tres «tubos de neón» como motivo: un trazo por submódulo
  const tubos = [["Matías Zarandon", "Interpretación de requerimientos", K.INT], ["Lautaro Quiros", "Materiales e instalación", K.MAT],
                 ["Luciano Marquesini", "Manufacturabilidad y rediseño · experto", K.MAN]];
  tubos.forEach(([n, r, c], i) => {
    const x = 0.8 + i * 3.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.85, w: 3.6, h: 0.09, fill: { color: c }, line: { color: c }, rectRadius: 0.045,
      shadow: { type: "outer", color: c, blur: 8, offset: 0, angle: 90, opacity: 0.9 } });
    T(s, n, { x, y: 5.05, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: "FFFFFF" });
    T(s, r, { x, y: 5.45, w: 3.6, h: 0.35, fontSize: 13, color: "AEB8CC" });
  });
  T(s, "Grupo 11 · 5K9 · UTN FRM · Inteligencia Artificial · Prof. Matilde Césari y María Eugenia Stefanoni · lunes 5/10/2026",
    { x: 0.8, y: 6.6, w: 11.8, h: 0.35, fontSize: 12, color: "8A94A6" });
  s.addNotes(`HABLA: Matías (≈0:30)

Buenas, somos el Grupo 11: Lautaro, Luciano y yo, Matías. Nuestro proyecto es un asistente para evaluar técnicamente pedidos de cartelería comercial (neón LED, corpórea y retroiluminada) y proponer rediseños.

Hoy no vamos a contar tanto el dominio sino cómo lo modelamos paso a paso: adquisición con el experto, red semántica, marcos, reglas, la lógica difusa como próximo paso y la implementación en Neo4j, con una demo en vivo.

Luciano, además de integrante, es la fuente experta: fabrica cartelería (Lux 3D). Cada uno de nosotros modeló un submódulo y lo que vamos a mostrar es el modelo integrado en un solo grafo.`);
}

// ================================================================= 2. Problema y dominio
pres.addSection({ title: "Problema y objetivos" });
{
  const s = nueva("Hoy la factibilidad se decide «a ojo» con experiencia no escrita", "Problema y objetivos");
  T(s, [
    { text: "El fabricante recibe un pedido a medida y tiene que decidir:", options: { breakLine: true, bold: true } },
    { text: "¿alcanza la información para evaluarlo?", options: { bullet: true, breakLine: true } },
    { text: "¿va a funcionar y durar en ese lugar?", options: { bullet: true, breakLine: true } },
    { text: "¿se puede fabricar con lo que tiene el taller? Si no, ¿qué cambia?", options: { bullet: true, breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "El asistente estructura, infiere, alerta y explica.", options: { breakLine: true, bold: true, color: K.ink } },
    { text: "Decide el fabricante. El LLM interpreta y explica; no decide.", options: { color: K.neon, bold: true } },
  ], { x: 0.55, y: 1.45, w: 5.9, h: 4.6, fontSize: 18, valign: "top", paraSpaceAfter: 8 });
  const casos = [
    ["4 mm < 6 mm", "El trazo del logo no aloja la tira de neón", K.MAN],
    ["500 mm > 400 mm", "El cartel no entra en la cama de la impresora", K.MAN],
    ["Exterior + PLA", "Se deforma al sol: hay que pasar a PETG", K.MAT],
    ["«para la pared»", "¿Interior o exterior? Si no se sabe, se pregunta", K.INT],
  ];
  casos.forEach(([n, d, c], i) => {
    const y = 1.45 + i * 1.32;
    caja(s, 6.9, y, 5.85, 1.12, K.soft, K.line);
    T(s, n, { x: 7.15, y: y + 0.12, w: 2.6, h: 0.88, fontSize: 24, bold: true, color: c, valign: "middle" });
    T(s, d, { x: 9.85, y: y + 0.12, w: 2.75, h: 0.88, fontSize: 14, color: K.muted, valign: "middle" });
  });
  T(s, "Casos reales del experto (PI1/PI2 de Luciano y Lautaro, PI2 de Matías)", { x: 6.9, y: 6.72, w: 5.85, h: 0.25, fontSize: 10, color: "8A94A6", italic: true });
  s.addNotes(`HABLA: Luciano (≈1:30)

Lo que hacemos en el taller: llega un pedido de un cartel a medida y antes de fabricar hay que decidir tres cosas. Si la información alcanza, si lo que se pide va a funcionar y durar en ese lugar, y si se puede fabricar con lo que tenemos.

Ese criterio no está escrito; se aprende con trabajos anteriores y con errores en obra. Ejemplos reales de los que sacamos reglas:
- Un logo cursivo con canales de 4 mm: la tira de neón mide 6 mm, físicamente no entra.
- Un cartel circular de 50 cm: la impresora 3D tiene cama de 40 × 40, no sale en una pieza.
- Un cartel exterior en PLA: se deforma con el sol; para exterior se usa PETG.
- Y del lado del cliente: «para poner en la pared» no dice si es adentro o afuera; un fabricante no lo supone, pregunta.

Por eso el sistema no reemplaza al fabricante: lo asiste con información estructurada, inferencias, alertas y explicaciones. El LLM solo interpreta el pedido en lenguaje natural y redacta la explicación; la decisión sale de las reglas y la toma el fabricante.`);
}

// ================================================================= 3. Objetivos y submódulos
{
  const s = nueva("Un objetivo, tres submódulos, un solo modelo", "Problema y objetivos");
  T(s, "Objetivo: asistir al fabricante en la evaluación técnica de una propuesta, detectando restricciones e información faltante y recomendando alternativas justificadas.",
    { x: 0.55, y: 1.25, w: 12.2, h: 0.75, fontSize: 17, color: K.muted });
  const sm = [
    ["Interpretación", "Matías", "Interpretación", "Pedido ambiguo", "Ficha de requerimientos\no aclaraciones", K.INT, K.INTf],
    ["Materiales e instalación", "Lautaro", "Evaluación", "Ficha", "Dictamen: apto / con condiciones / no apto", K.MAT, K.MATf],
    ["Manufacturabilidad y rediseño", "Luciano (experto)", "Recomendación", "Ficha + dictamen", "Recomendación justificada", K.MAN, K.MANf],
  ];
  sm.forEach(([t, q, tarea, e, o, c, f], i) => {
    const x = 0.55 + i * 4.2;
    caja(s, x, 2.3, 3.75, 3.3, f, c);
    T(s, t, { x: x + 0.25, y: 2.45, w: 3.3, h: 0.75, fontSize: 19, bold: true, color: c, valign: "middle" });
    T(s, q, { x: x + 0.25, y: 3.18, w: 3.3, h: 0.35, fontSize: 14, color: K.muted });
    T(s, [
      { text: "Tarea experta: ", options: { bold: true } }, { text: tarea, options: { breakLine: true } },
      { text: "Entra: ", options: { bold: true } }, { text: e, options: { breakLine: true } },
      { text: "Sale: ", options: { bold: true } }, { text: o },
    ], { x: x + 0.25, y: 3.65, w: 3.3, h: 1.8, fontSize: 14, valign: "top", paraSpaceAfter: 6 });
    if (i < 2) flecha(s, x + 3.8, 3.9, x + 4.15, 3.9, K.ink, 2);
  });
  // retornos
  caja(s, 0.55, 5.9, 12.2, 0.8, K.soft, K.soft);
  T(s, [
    { text: "Retornos: ", options: { bold: true } },
    { text: "Materiales devuelve datos faltantes a Interpretación (R-MI-01) · Manufacturabilidad devuelve el caso si ninguna alternativa respeta al cliente (MAN-R8) · todo pedido al cliente pasa por una Aclaración." },
  ], { x: 0.8, y: 5.95, w: 11.8, h: 0.7, fontSize: 14, valign: "middle" });
  s.addNotes(`HABLA: Matías (≈1:30)

El objetivo general es uno solo: asistir en la evaluación técnica. Lo dividimos en tres problemas expertos distintos, no en tecnologías:

- Interpretación (yo): convierte un pedido ambiguo en una ficha técnica confiable. Tarea: interpretación. Su regla de oro es no inventar datos.
- Materiales e instalación (Lautaro): con la ficha decide si material, componentes, soporte y fijación sirven para ese entorno. Tarea: evaluación; sale un dictamen apto / apto con condiciones / no apto.
- Manufacturabilidad y rediseño (Luciano): decide si se puede fabricar con la impresora 3D y, si no, qué alternativa respeta al cliente. Tarea: recomendación.

El flujo va de izquierda a derecha, pero tiene retornos: Lautaro puede pedir un dato que falta y Luciano puede devolver el caso si ninguna alternativa respeta las restricciones del cliente. En los dos casos el que habla con el cliente es Interpretación, mediante una Aclaración. Eso ya está modelado en el grafo.`);
}

// ================================================================= 4. Casos de uso
{
  const s = nueva("Dos casos de uso guiaron el modelado (y cruzan los tres submódulos)", "Problema y objetivos");
  const cu = [
    ["CU1 · «Café Andino»", "«Quiero un cartel de neón con el nombre del café… para poner en la pared. Más o menos de un metro. Que se vea lindo de noche.» + foto",
     ["3 datos ambiguos y 1 faltante → aclaraciones", "Materiales: sin soporte no se evalúa (R-MI-01) → no avanza", "Con la respuesta: apto (interior)", "1000 mm > 400 mm → segmentar + reforzar"], K.INT, [K.INT, K.MAT, K.MAT, K.MAN]],
    ["CU2 · Letras corpóreas exterior", "«Letras corpóreas con luz para el frente que da a la calle. 3 metros. Sí o sí antes de la inauguración. Si se puede, colores del logo.» + foto sin luz",
     ["Contradicción texto–foto → se pregunta; plazo obligatorio", "Exterior expuesto → apto con condiciones", "Exterior → PETG", "3000 mm → letra por letra + refuerzo"], K.MAN, [K.INT, K.MAT, K.MAN, K.MAN]],
  ];
  cu.forEach(([t, e, sal, c, cols], i) => {
    const x = 0.55 + i * 6.2;
    T(s, t, { x, y: 1.25, w: 5.9, h: 0.5, fontSize: 21, bold: true, color: c });
    T(s, "ENTRADA", { x, y: 1.8, w: 2, h: 0.28, fontSize: 11, bold: true, color: "8A94A6" });
    caja(s, x, 2.1, 5.9, 1.3, K.soft, K.soft);
    T(s, e, { x: x + 0.2, y: 2.15, w: 5.5, h: 1.2, fontSize: 14, italic: true, color: K.ink, valign: "middle" });
    T(s, "SALIDA ESPERADA", { x, y: 3.6, w: 3, h: 0.28, fontSize: 11, bold: true, color: c });
    sal.forEach((l, k) => {
      circulo(s, x, 3.98 + k * 0.6, 0.42, String(k + 1), cols[k]);
      T(s, l, { x: x + 0.55, y: 3.96 + k * 0.6, w: 5.3, h: 0.46, fontSize: 14, valign: "middle" });
    });
  });
  T(s, "Color del círculo = submódulo que actúa (azul Interpretación · verde Materiales · naranja Manufacturabilidad). Pedidos ilustrativos del PI2 de Matías; casos L-C1/L-C2/L-C3 de Luciano como pruebas complementarias.",
    { x: 0.55, y: 6.5, w: 12.2, h: 0.4, fontSize: 10, color: "8A94A6", italic: true });
  s.addNotes(`HABLA: Matías (≈1:30)

Elegimos dos casos que recorren los tres submódulos; los pedidos salen de mi PI2 y se continúan con las reglas de Lautaro y Luciano.

CU1, Café Andino: el cliente no sabe de técnica. «Neón» puede ser vidrio o aspecto neón, «la pared» no dice si es adentro o afuera, «un metro» puede ser el cartel o el espacio. Son tres ambigüedades y además falta el soporte. Lo interesante: ¿el soporte faltante bloquea? Yo no lo puedo decidir: le pregunto al submódulo de Lautaro, y su regla R-MI-01 dice que sin soporte no se evalúa. Entonces el pedido NO avanza. Cuando el cliente responde (esa respuesta es un dato de prueba simulado, lo aclaramos), el cartel resulta apto por ser interior, y Luciano detecta que 1 metro no entra en la cama de 40 cm: recomienda segmentar y reforzar.

CU2, letras corpóreas: el texto dice «con luz» y la foto no tiene luz; no elijo, pregunto. «Sí o sí» es restricción obligatoria; «si se puede» es preferencia. Con la ficha FR-02, Lautaro da apto con condiciones por ser exterior expuesto; Luciano elige PETG por exterior y segmenta letra por letra.

Además usamos los tres casos de Luciano para probar el filtro por restricciones del cliente.`);
}

// ================================================================= 5. Metodología
pres.addSection({ title: "Modelado" });
{
  const s = nueva("Metodología: del experto al grafo, en capas", "Modelado");
  const pasos = [
    ["Adquisición", "PI1", "Procesos, casos típicos y límite, excepciones y reglas candidatas con el experto", "Anexo A", K.ink],
    ["Red semántica", "PI2", "Conceptos y relaciones con verbo; jerarquías es_un", "Anexo B", K.ink],
    ["Frames + reglas", "PI2", "Slots, facetas y demonios; reglas SI / ENTONCES trazables", "slide 8–9", K.ink],
    ["Integración", "PG1", "Nombres unificados: una red y una jerarquía (Lautaro desde su PI1)", "slide 6–7", K.ink],
    ["Neo4j", "hoy", "Esquema, modelo, instancias y reglas como consultas Cypher", "demo", K.neon],
    ["Difusa", "PI3", "Variables candidatas identificadas; sin funciones inventadas", "slide 10", "8A94A6"],
  ];
  pasos.forEach(([t, e, d, ev, c], i) => {
    const x = 0.55 + i * 2.06;
    caja(s, x, 1.35, 1.9, 4.1, i === 4 ? "FFF0F6" : K.soft, i === 4 ? K.neon : K.line);
    circulo(s, x + 0.2, 1.55, 0.55, String(i + 1), c);
    T(s, t, { x: x + 0.2, y: 2.25, w: 1.6, h: 0.65, fontSize: 16, bold: true, color: c, valign: "top" });
    T(s, e, { x: x + 0.2, y: 2.9, w: 1.6, h: 0.3, fontSize: 12, bold: true, color: K.muted });
    T(s, d, { x: x + 0.2, y: 3.3, w: 1.6, h: 1.6, fontSize: 13, color: K.ink, valign: "top" });
    T(s, "→ " + ev, { x: x + 0.2, y: 4.95, w: 1.6, h: 0.3, fontSize: 11, italic: true, color: K.muted });
    if (i < 5) flecha(s, x + 1.92, 3.4, x + 2.04, 3.4, K.ink, 1.5);
  });
  T(s, [
    { text: "Cada regla lleva su origen: ", options: { bold: true } },
    { text: "experto · propuesta · documental.  " },
    { text: "Lo que no se relevó queda ", options: {} }, { text: "[PENDIENTE]", options: { bold: true, color: K.neon } },
    { text: " (no se inventan umbrales).  Lautaro no tiene PI2: su parte sale de su PI1." },
  ], { x: 0.55, y: 5.8, w: 12.2, h: 0.7, fontSize: 14, color: K.ink, valign: "middle" });
  s.addNotes(`HABLA: Lautaro (≈1:00)

La metodología fue en capas, siguiendo las entregas:
1. Adquisición (PI1): cada uno hizo el análisis de la tarea experta con Luciano como fuente — diagrama de procesos, casos típicos y límite, excepciones y reglas candidatas. (Los diagramas de cada uno están en el anexo A.)
2 y 3. En PI2 cada uno pasó eso a una red semántica y a frames con reglas (redes individuales en el anexo B).
4. Para hoy integramos: unificamos nombres, armamos una sola red y una sola jerarquía de frames.
5. Lo llevamos a Neo4j: esquema, instancias y las reglas como consultas Cypher.
6. La lógica difusa queda para PI3: identificamos las variables pero no inventamos funciones de pertenencia.

Dos criterios que respetamos todo el tiempo: cada regla dice de dónde sale (experto, propuesta nuestra o documento) y lo que no está relevado queda marcado como PENDIENTE. Aclaro que mi PI2 no está; mi submódulo se modeló con mi PI1 (conceptos de la sección 10 y reglas R-MI-01 a R-MI-11) y está marcado así en el grafo.`);
}

// ================================================================= 6. Red semántica
{
  const s = nueva("Red semántica integrada: un concepto, un nombre, un grafo", "Modelado");
  const r = fit("salida/img/red_semantica_integrada.png", 1.769, 0.45, 1.2, 9.4, 5.65, s);
  const reglas = [
    ["Verbos dirigidos", "el mismo verbo en el esquema y en las instancias"],
    ["Sin sinónimos", "Diseño → Cartel · «restricción detectada» → Conflicto"],
    ["Límite ≠ hallazgo", "RestricciónConstructiva se viola → Conflicto"],
    ["Nodos compartidos", "Ficha, Cartel, Conflicto unen submódulos"],
    ["Trazable", "cada relación inferida guarda su regla"],
  ];
  T(s, "Reglas de diseño", { x: 10.05, y: 1.25, w: 2.8, h: 0.35, fontSize: 15, bold: true, color: K.neon });
  reglas.forEach(([t, d], i) => {
    const y = 1.7 + i * 1.0;
    T(s, t, { x: 10.05, y, w: 2.8, h: 0.32, fontSize: 14, bold: true });
    T(s, d, { x: 10.05, y: y + 0.32, w: 2.8, h: 0.6, fontSize: 12, color: K.muted, valign: "top" });
  });
  s.addNotes(`HABLA: Lautaro (≈1:30)

Esta es la red integrada, generada directamente desde Neo4j. Los colores son los submódulos: azul Interpretación, verde Materiales, naranja Manufacturabilidad, violeta lo compartido.

Cómo se construyó: juntamos las tres redes y buscamos solapamientos. Ejemplos:
- Luciano decía «Diseño», yo «Cartel» o «configuración propuesta»: quedó Cartel, con Diseño como sinónimo.
- Lo que yo llamaba «restricción detectada con su causa» es lo mismo que el Conflicto de Luciano: un solo nodo, con un atributo origen (instalación o manufactura).
- Luciano usaba «Soporte» como sinónimo de sistema de fijación, y para mí Soporte es la pared: separamos los dos.

Reglas de diseño: relaciones con verbo y dirección; separar el límite (por ejemplo 6 mm o 400 mm) del hallazgo (el conflicto); lo que comparten dos submódulos es un nodo compartido (la ficha, el cartel, el conflicto); y toda relación creada por una regla guarda qué regla la creó.

En Neo4j quedaron ${ST.frames} frames, ${ST.esquema} relaciones de esquema y ${ST.reglas} reglas.`);
}

// ================================================================= 7. De red a marcos
{
  const s = nueva("De la red a los marcos: cada concepto es un frame", "Modelado");
  const filas = [
    ["Red semántica", "Marco (frame)", "Neo4j"],
    ["Concepto", "Frame", "(:Frame {nombre, submodulo})"],
    ["Atributo", "Slot", "(:Frame)-[:TIENE_SLOT]->(:Slot)"],
    ["Restricción del atributo", "Faceta (tipo, rango, defecto, card.)", "propiedades del :Slot"],
    ["Procedimiento", "Demonio (si_necesario / si_agregado / si_modificado)", "propiedad + consulta Cypher"],
    ["es_un", "Herencia", "[:ES_UN] · instancias con etiquetas múltiples"],
    ["parte_de", "Composición", "[:ES_PARTE_DE]"],
    ["Instancia", "Frame instancia", "(:Dato:DatoFaltante)-[:INSTANCIA_DE]->(:Frame)"],
  ];
  const rows = filas.map((f, i) => f.map((c) => ({ text: c, options: i === 0
    ? { bold: true, color: "FFFFFF", fill: { color: K.dark } } : { color: K.ink, fill: { color: i % 2 ? "FFFFFF" : K.soft }, fontFace: undefined } })));
  rows.slice(1).forEach((r) => { r[2].options.fontFace = "Consolas"; r[2].options.fontSize = 12; });
  s.addTable(rows, { x: 0.55, y: 1.3, w: 12.2, colW: [2.6, 4.6, 5.0], fontSize: 14, rowH: 0.42, border: { type: "solid", pt: 0.5, color: K.line }, valign: "middle" });
  caja(s, 0.55, 5.15, 12.2, 1.45, K.soft, K.soft);
  T(s, [
    { text: "7 jerarquías ES_UN: ", options: { bold: true } },
    { text: "Dato · Requerimiento · AlternativaRediseño · RestricciónConstructiva · Material · TecnologíaIluminación · Submódulo", options: { breakLine: true } },
    { text: "Composición ES_PARTE_DE: ", options: { bold: true } },
    { text: "Geometría y ComponenteEléctrico de Cartel · Advertencia de Ficha · Expresión de Pedido   (árbol completo: anexo C)" },
  ], { x: 0.8, y: 5.2, w: 11.8, h: 1.35, fontSize: 14, valign: "middle", paraSpaceAfter: 6 });
  s.addNotes(`HABLA: Lautaro (≈1:00)

La transformación red → marcos fue sistemática: cada concepto de la red pasa a ser un frame; sus atributos, slots; las restricciones de cada atributo (tipo, valores permitidos, valor por defecto, cardinalidad) son facetas; y los procedimientos asociados, demonios.

Las relaciones es_un pasan a herencia: por ejemplo DatoFaltante, DatoAmbiguo y DatoConfirmado heredan de Dato, y las alternativas de rediseño (segmentación, cambio de fijación, de tecnología...) heredan de AlternativaRediseño. El árbol completo, generado desde Neo4j, está en el anexo C.

En Neo4j cada frame es un nodo :Frame, los slots son nodos :Slot con las facetas como propiedades, y las instancias llevan varias etiquetas (por ejemplo :Dato:DatoFaltante), así un cambio de estado es un cambio de etiqueta.`);
}

// ================================================================= 8. Frame de ejemplo
{
  const s = nueva("Frame de ejemplo: DatoFaltante (hereda de Dato)", "Modelado");
  const filas = [
    ["Slot", "Definido en", "Tipo / valores", "Defecto", "Demonio"],
    ["criticidad", "DatoFaltante", "bloqueante · postergable · sin_clasificar", "sin_clasificar", "si_agregado → crear Aclaración (INT-R02) y Consulta a submódulo (INT-R10)"],
    ["atributo", "Dato", "Texto (p. ej. soporte_y_montaje)", "—", "—"],
    ["categoria", "Dato", "producto · dimensiones · entorno · instalación · …", "—", "—"],
    ["valor", "Dato", "cualquiera, 0..1", "nulo", "si_agregado → verificar origen (INT-R09)"],
    ["origen", "Dato", "cliente · respuesta_a_aclaración", "—", "no admite «supuesto» (faceta)"],
    ["estado", "Dato", "confirmado · faltante · ambiguo · en_conflicto · descartado", "—", "si_modificado → reclasificar etiqueta"],
  ];
  const rows = filas.map((f, i) => f.map((c, j) => ({ text: c, options: i === 0 ? { bold: true, color: "FFFFFF", fill: { color: K.INT } }
    : { color: K.ink, bold: j === 0, fill: { color: i === 1 ? K.INTf : (i % 2 ? "FFFFFF" : K.soft) } } })));
  s.addTable(rows, { x: 0.55, y: 1.3, w: 12.2, colW: [1.5, 1.6, 3.9, 1.4, 3.8], fontSize: 13, rowH: 0.5, border: { type: "solid", pt: 0.5, color: K.line }, valign: "middle" });
  caja(s, 0.55, 5.35, 12.2, 1.35, K.soft, K.soft);
  T(s, [
    { text: "Instancia D4 (CU1): ", options: { bold: true } },
    { text: "atributo = soporte_y_montaje · criticidad = sin_clasificar → ", options: {} },
    { text: "bloqueante", options: { bold: true, color: K.MAT } },
    { text: " (lo decide R-MI-01 de Materiales) → cuando el cliente responde, la instancia cambia de etiqueta a DatoConfirmado.", options: { breakLine: true } },
    { text: "En Neo4j: ", options: { bold: true } },
    { text: "REMOVE d:DatoFaltante SET d:DatoConfirmado", options: { fontFace: "Consolas", color: K.neon } },
  ], { x: 0.8, y: 5.42, w: 11.8, h: 1.2, fontSize: 14, valign: "middle", paraSpaceAfter: 4 });
  s.addNotes(`HABLA: Lautaro (≈1:30)

Un frame completo con slots y facetas. Elegimos DatoFaltante porque muestra herencia y demonios a la vez.

El slot propio es criticidad: puede ser bloqueante, postergable o sin clasificar, y el valor por defecto es sin clasificar porque el criterio todavía no está relevado con el experto. Su demonio si_agregado crea automáticamente la Aclaración para el cliente y, si la importancia del dato depende de otro submódulo, una Consulta.

El resto de los slots los hereda de Dato: atributo, categoría, valor, origen y estado. Fíjense la faceta del slot origen: solo admite «cliente» o «respuesta a aclaración»; no admite «supuesto». Esa faceta implementa la regla de no inventar datos.

En el caso CU1, la instancia D4 es el soporte que falta. Su criticidad la decide la regla R-MI-01 de mi submódulo: bloqueante. Cuando el cliente responde, D4 cambia de etiqueta a DatoConfirmado: en Neo4j es literalmente un REMOVE y un SET de etiqueta. Esta tabla sale de una consulta (paso 17 del script).`);
}

// ================================================================= 9. Reglas
{
  const s = nueva("Reglas trazables: cada una dice de dónde sale", "Modelado");
  const reglas = [
    ["R-MI-01", "Materiales", "SI falta entorno, soporte o dimensiones", "ENTONCES no evaluar y pedir el dato", "experto (PI1 Lautaro)", K.MAT, K.MATf],
    ["MAN-R3", "Manufacturabilidad", "SI dimensión máxima > 400 mm (cama)", "ENTONCES Conflicto ExcedeCama → segmentar + reforzar", "documental (ficha de la impresora)", K.MAN, K.MANf],
    ["INT-R11", "Interpretación", "SI todo dato requerido está confirmado, sin ambiguos ni contradicciones", "ENTONCES listo para evaluación → ficha", "propuesta (pendiente de validar)", K.INT, K.INTf],
  ];
  reglas.forEach(([id, sub, si, ent, org, c, f], i) => {
    const y = 1.3 + i * 1.82;
    caja(s, 0.55, y, 7.6, 1.6, f, c);
    T(s, id, { x: 0.8, y: y + 0.12, w: 2, h: 0.4, fontSize: 20, bold: true, color: c });
    T(s, sub, { x: 2.6, y: y + 0.16, w: 3, h: 0.35, fontSize: 13, color: K.muted });
    T(s, [{ text: si, options: { breakLine: true } }, { text: ent, options: { bold: true } }], { x: 0.8, y: y + 0.55, w: 7.1, h: 0.75, fontSize: 14, valign: "top" });
    T(s, "Origen: " + org, { x: 0.8, y: y + 1.25, w: 7.1, h: 0.3, fontSize: 12, italic: true, color: c });
  });
  const datos = ST.origen.map((o) => o.c);
  const etiq = ST.origen.map((o) => o.o.replace("documental+experto", "doc.+experto").replace("experto+documental", "experto+doc."));
  s.addChart(pres.charts.BAR, [{ name: "Reglas", labels: etiq, values: datos }], {
    x: 8.5, y: 1.3, w: 4.3, h: 4.6, barDir: "bar", chartColors: [K.neon], showValue: true, dataLabelPosition: "outEnd",
    dataLabelColor: K.ink, dataLabelFontSize: 12, catAxisLabelColor: K.ink, catAxisLabelFontSize: 12, valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: `${ST.reglas} reglas por origen`, titleFontSize: 14, titleColor: K.ink,
    catAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt", titleFontFace: "+mn-lt", catAxisOrientation: "maxMin",
  });
  T(s, "Cada regla es un nodo (:Regla) que USA los slots que evalúa; cada relación que crea guarda la propiedad regla.",
    { x: 8.5, y: 6.0, w: 4.3, h: 0.7, fontSize: 12, color: K.muted });
  s.addNotes(`HABLA: Luciano (≈1:00)

Tres reglas, una por submódulo, para mostrar el formato: condición, conclusión y origen.

- R-MI-01, de Lautaro: si falta entorno, soporte o dimensiones, no se evalúa y se pide el dato. Es conocimiento mío como experto, relevado en su PI1.
- MAN-R3, mía: si la pieza mide más de 400 mm no entra en la cama de la impresora; se genera el conflicto ExcedeCama y las alternativas segmentar y reforzar. El 400 sale de la ficha técnica: es documental.
- INT-R11, de Matías: el pedido pasa a evaluación solo cuando todo lo requerido está confirmado. Es una regla propuesta por nosotros, todavía pendiente de validar conmigo en sesiones de pensamiento en voz alta.

El gráfico muestra las ${ST.reglas} reglas del modelo por origen. Diferenciamos lo que es conocimiento adquirido del experto de lo que propusimos nosotros, como pidió la cátedra.

Y la trazabilidad está en el grafo: cada regla es un nodo que apunta a los slots que usa, y cada relación que una regla crea lleva el nombre de esa regla.`);
}

// ================================================================= 10. Lógica difusa
{
  const s = nueva("Lógica difusa: próximo paso (PI3)", "Modelado");
  T(s, "Variable lingüística candidata: exposición ambiental", { x: 0.55, y: 1.3, w: 6.4, h: 0.4, fontSize: 18, bold: true, color: K.MAT });
  // triángulos ilustrativos (sin escala)
  const base = 4.3;
  [["baja", 0.7, K.INT], ["media", 2.35, K.MAT], ["alta", 4.0, K.MAN]].forEach(([n, x, c]) => {
    s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x, y: 2.1, w: 2.6, h: base - 2.1, fill: { color: c, transparency: 72 }, line: { color: c, width: 2 } });
    T(s, n, { x: x + 0.8, y: 1.8, w: 1.0, h: 0.3, fontSize: 14, bold: true, color: c, align: "center" });
  });
  s.addShape(pres.shapes.LINE, { x: 0.6, y: base, w: 6.2, h: 0, line: { color: K.ink, width: 1.25, endArrowType: "triangle" } });
  T(s, "grado de exposición → (forma ilustrativa: rangos y funciones [PENDIENTE])", { x: 0.6, y: base + 0.08, w: 6.3, h: 0.3, fontSize: 11, color: K.muted, italic: true });
  caja(s, 0.55, 5.0, 6.4, 1.6, K.soft, K.soft);
  T(s, [
    { text: "Forma de regla (propuesta, sin validar):", options: { bold: true, breakLine: true, fontSize: 13, color: K.muted } },
    { text: "SI exposición es ALTA y exceso de peso es EN EL LÍMITE ENTONCES adecuación es BAJA", options: { breakLine: true } },
    { text: "Lo excluyente lo siguen decidiendo las reglas crisp; lo difuso ordena alternativas.", options: { fontSize: 13, color: K.muted } },
  ], { x: 0.8, y: 5.05, w: 6.0, h: 1.5, fontSize: 15, valign: "middle", paraSpaceAfter: 4 });
  const vars = [
    [K.MAT, "Materiales", "exposición ambiental · dificultad de instalación · confiabilidad del soporte · límite de gran porte"],
    [K.MAN, "Manufacturabilidad", "flexibilidad estética · complejidad de fabricación · impacto estético · exceso de peso"],
    [K.INT, "Interpretación", "ambigüedad · suficiencia del pedido · rigidez · criticidad · precisión de la medida"],
  ];
  T(s, "Variables candidatas ya identificadas", { x: 7.4, y: 1.3, w: 5.4, h: 0.4, fontSize: 18, bold: true });
  vars.forEach(([c, t, d], i) => {
    const y = 1.9 + i * 1.5;
    caja(s, 7.4, y, 5.35, 1.3, "FFFFFF", c);
    T(s, t, { x: 7.6, y: y + 0.1, w: 5, h: 0.35, fontSize: 15, bold: true, color: c });
    T(s, d, { x: 7.6, y: y + 0.45, w: 5, h: 0.8, fontSize: 13, color: K.ink, valign: "top" });
  });
  T(s, "Hoy viven en el grafo como marcadores crisp (p. ej. Entorno.nivel_exposicion = alta).", { x: 7.4, y: 6.4, w: 5.4, h: 0.3, fontSize: 12, color: K.muted, italic: true });
  s.addNotes(`HABLA: Luciano (≈1:00)

La lógica difusa es opcional en esta actividad y la presentamos como próximo paso, sin inventar números.

Donde aparece incertidumbre ya está identificado. Por ejemplo, la exposición ambiental: yo no decido «exterior = expuesto» de forma binaria; un frente al norte sin alero está más expuesto que uno bajo una marquesina. Lautaro lo modeló como baja, media o alta. Los triángulos son solo la forma: los rangos y funciones de pertenencia se van a definir conmigo en PI3.

Del lado de rediseño: flexibilidad estética del cliente (tolera un 5 % de cambio, duda con un 10 %, rechaza un 20 %), complejidad de fabricación, impacto estético, exceso de peso. Del lado de interpretación: ambigüedad, suficiencia, rigidez de una condición.

Cómo se combinaría con lo crisp: las reglas nítidas siguen decidiendo lo excluyente (un canal de 4 mm no aloja una tira de 6 mm), y lo difuso sirve para ordenar alternativas viables y graduar el dictamen. La regla de ejemplo es solo la forma, propuesta y sin validar. Hoy esas variables están en el grafo como valores crisp.`);
}

// ================================================================= 11. Neo4j: modelo
pres.addSection({ title: "Neo4j y demo" });
{
  const s = nueva("Neo4j: el caso CU2 instanciado sobre el modelo", "Neo4j y demo");
  fit("salida/img/cu2_instanciado.png", 1.837, 0.45, 1.2, 9.95, 5.6, s);
  const nums = [[ST.frames, "frames"], [ST.slots, "slots con facetas"], [ST.reglas, "reglas"], [ST.instancias, "instancias"], [ST.relaciones, "relaciones"]];
  nums.forEach(([n, t], i) => {
    const y = 1.3 + i * 1.08;
    T(s, String(n), { x: 10.6, y, w: 2.2, h: 0.6, fontSize: 34, bold: true, color: i === 2 ? K.neon : K.ink });
    T(s, t, { x: 10.6, y: y + 0.58, w: 2.2, h: 0.3, fontSize: 13, color: K.muted });
  });
  s.addNotes(`HABLA: Luciano (≈1:00)

Así quedó en Neo4j, versión 5.21 en Docker, la que recomienda la cátedra. Son cuatro scripts idempotentes (todo con MERGE): esquema con constraints, modelo (red + frames + reglas), instancias de los casos, y consultas.

La imagen es el caso CU2 instanciado, generado desde la base. Arriba la parte de Matías: pedido, contradicción resuelta, restricción de plazo obligatoria, preferencia de colores y la ficha FR-02. En el medio, Lautaro: el cartel, su entorno exterior con exposición alta, y el dictamen apto con condiciones con sus dos conflictos de instalación y la verificación estructural a confirmar. Abajo, lo mío: los 3000 mm violan la restricción de 400 mm de la impresora, se genera ExcedeCama, y las alternativas segmentación y refuerzo conforman la recomendación. También se ve que el material pasa a PETG por ser exterior.

Cada relación creada por una regla tiene la regla entre corchetes. En números: ${ST.frames} frames, ${ST.slots} slots, ${ST.reglas} reglas, ${ST.instancias} instancias.`);
}

// ================================================================= 12. Neo4j: consulta
{
  const s = nueva("Una consulta Cypher: el cliente filtra las alternativas", "Neo4j y demo");
  const q = "MATCH (r:RestriccionCliente)-[d:ADMITE|RECHAZA]->\n      (a:AlternativaRediseno)\nRETURN a.caso, r.descripcion,\n       type(d) AS decision,\n       a.nombre, d.regla";
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 1.3, w: 5.4, h: 2.0, fill: { color: K.dark }, line: { color: K.dark }, rectRadius: 0.08 });
  T(s, q, { x: 0.8, y: 1.42, w: 5.0, h: 1.8, fontFace: "Consolas", fontSize: 14, color: "E2E8F0", valign: "top" });
  T(s, "La regla que creó esas relaciones (MAN-R6, extracto):", { x: 0.55, y: 3.55, w: 5.4, h: 0.3, fontSize: 13, bold: true, color: K.muted });
  const r6 = "MATCH (r:RestriccionCliente {criterio:'fidelidad_logo',\n        nivel:'Alta'})-[:CONDICIONA]->(c:Cartel),\n      (k:Conflicto {tipo:'TrazoFino'})\n        -[:EXIGE]->(alt)\n… MERGE (r)-[:RECHAZA {regla:'MAN-R6'}]->(alt)";
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 3.95, w: 5.4, h: 1.75, fill: { color: K.soft }, line: { color: K.line }, rectRadius: 0.08 });
  T(s, r6, { x: 0.8, y: 4.05, w: 5.0, h: 1.6, fontFace: "Consolas", fontSize: 12, color: K.ink, valign: "top" });
  const res = [["caso", "restricción del cliente", "decisión", "alternativa", "regla"],
    ["L-C1", "mantener la identidad del logo", "RECHAZA", "EngrosarTrazo", "MAN-R6"],
    ["L-C1", "mantener la identidad del logo", "ADMITE", "PasarRetroiluminado", "MAN-R6"],
    ["L-C2", "mantener el tamaño (500 mm)", "ADMITE", "SegmentacionModular", "MAN-FILTRO"],
    ["L-C2", "mantener el tamaño (500 mm)", "ADMITE", "CambioFijacion_Refuerzo", "MAN-FILTRO"],
    ["L-C3", "instalación no invasiva", "RECHAZA", "FijacionMayorCapacidad", "MAN-R9"],
    ["L-C3", "instalación no invasiva", "ADMITE", "ReducirInfill", "MAN-R9"]];
  const rows = res.map((f, i) => f.map((c, j) => ({ text: c, options: i === 0 ? { bold: true, color: "FFFFFF", fill: { color: K.dark } }
    : { color: j === 2 ? (c === "RECHAZA" ? "C53030" : "2F855A") : K.ink, bold: j === 2, fill: { color: i % 2 ? "FFFFFF" : K.soft } } })));
  T(s, "Resultado real (paso 14 de 04_consultas.cypher)", { x: 6.15, y: 1.3, w: 6.4, h: 0.3, fontSize: 13, bold: true, color: K.muted });
  s.addTable(rows, { x: 6.15, y: 1.7, w: 6.65, colW: [0.6, 1.95, 0.95, 2.05, 1.1], fontSize: 11, rowH: 0.48, border: { type: "solid", pt: 0.5, color: K.line }, valign: "middle" });
  T(s, "La restricción obligatoria descarta; la que no tiene objeción queda viable (MAN-FILTRO). Si todas quedan descartadas, MAN-R8 devuelve el caso al cliente.",
    { x: 6.15, y: 5.3, w: 6.65, h: 0.9, fontSize: 13, color: K.ink });
  s.addNotes(`HABLA: Luciano (≈1:00)

Una consulta que demuestra el funcionamiento: qué alternativas admite o rechaza cada restricción del cliente. Es corta: busca las relaciones ADMITE o RECHAZA entre una restricción y una alternativa, y devuelve qué regla las creó.

Esas relaciones no están cargadas a mano: las crean las reglas, que también son Cypher. Abajo, el extracto de MAN-R6: si el cliente exige fidelidad alta al logo y hay un conflicto de trazo fino, rechaza engrosar el trazo y admite pasar a retroiluminado. Es exactamente mi criterio del PI1: la identidad visual del cliente es prioritaria.

El resultado real: en L-C1 se rechaza engrosar y se admite retroiluminar; en L-C3, como el cliente no quiere perforar, se rechaza la fijación de mayor capacidad y se admite reducir el relleno interno, que baja el peso sin cambiar la apariencia; en L-C2 el tamaño fijo admite segmentar. Si todas quedaran rechazadas, MAN-R8 marca el conflicto como inviable y vuelve a Interpretación para renegociar con el cliente.`);
}

// ================================================================= 13. Demo
{
  const s = nueva("Demo en vivo: el caso que no avanza… hasta que avanza", "Neo4j y demo");
  const pasos = [
    ["¿Por qué P-01 no puede evaluarse?", "falta el soporte; la consulta Q1 está abierta"],
    ["Materiales responde con R-MI-01", "sin soporte no se evalúa → bloqueante"],
    ["Llega la respuesta → INT-R11", "P-01 listo, se genera la ficha FR-01"],
    ["Recorridos de CU1 y CU2", "ficha → dictamen → conflicto → recomendación"],
    ["Filtro y trazabilidad", "admite / rechaza y reglas activadas en orden"],
  ];
  pasos.forEach(([t, d], i) => {
    const y = 1.35 + i * 0.98;
    circulo(s, 0.55, y, 0.55, String(i + 1), i < 2 ? K.INT : i < 3 ? K.INT : i < 4 ? K.MAT : K.MAN);
    T(s, t, { x: 1.3, y: y - 0.02, w: 5.2, h: 0.36, fontSize: 16, bold: true });
    T(s, d, { x: 1.3, y: y + 0.33, w: 5.2, h: 0.32, fontSize: 13, color: K.muted });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 6.25, w: 5.9, h: 0.5, fill: { color: K.dark }, line: { color: K.dark }, rectRadius: 0.08 });
  T(s, "bash neo4j/demo.sh   ·   Browser: localhost:7474", { x: 0.75, y: 6.25, w: 5.6, h: 0.5, fontFace: "Consolas", fontSize: 13, color: K.cyan, valign: "middle" });
  T(s, "Salida real de los pasos 1 y 2 (cypher-shell)", { x: 6.75, y: 1.3, w: 6.05, h: 0.3, fontSize: 13, bold: true, color: K.muted });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.75, y: 1.7, w: 6.05, h: 3.6, fill: { color: K.dark }, line: { color: K.dark }, rectRadius: 0.08 });
  T(s, [
    { text: "Paso 1 · ¿por qué P-01 no avanza?", options: { color: K.cyan, bold: true, breakLine: true } },
    { text: "estado      pendiente_de_aclaracion", options: { breakLine: true } },
    { text: "faltantes   D4 soporte_y_montaje", options: { breakLine: true } },
    { text: "            (criticidad=sin_clasificar)", options: { breakLine: true } },
    { text: "pendientes  A4: ¿Sobre qué pared va…?", options: { breakLine: true } },
    { text: "consultas   Q1 -> SM-MAT (pendiente)", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "Paso 2 · Materiales responde Q1", options: { color: K.cyan, bold: true, breakLine: true } },
    { text: "Q1  D4  soporte_y_montaje  ", options: {} }, { text: "bloqueante", options: { color: K.neon, bold: true, breakLine: true } },
    { text: "R-MI-01: si falta entorno, soporte o", options: { breakLine: true } },
    { text: "dimensiones, no evaluar y pedir el dato" },
  ], { x: 7.0, y: 1.85, w: 5.6, h: 3.35, fontFace: "Consolas", fontSize: 13, color: "E2E8F0", valign: "top" });
  T(s, "Plan B sin conexión: video de 2–3 min con la misma secuencia.", { x: 6.75, y: 5.5, w: 6.05, h: 0.35, fontSize: 13, italic: true, color: K.muted });
  s.addNotes(`HABLA: Matías (≈2:00) — compartir pantalla con la terminal y el Browser.

Comando: bash neo4j/demo.sh. Recarga la base al estado inicial de los casos y ejecuta los pasos de a uno.
1. Pregunto por qué P-01 no puede evaluarse: falta D4 (soporte), la aclaración A4 está pendiente y la consulta Q1 a Materiales sin responder.
2. Materiales responde Q1 con su regla R-MI-01: bloqueante. Remarcar: la criticidad la decide el dueño del conocimiento, no el intérprete.
3. (Paso silencioso: llega la respuesta simulada del cliente.) Corre INT-R11: ahora sí, P-01 listo y se crea la ficha FR-01.
4. Se aplican las reglas de Materiales y Manufacturabilidad. Recorrido de CU1: apto, 1000 > 400, segmentar y reforzar. Recorrido de CU2: apto con condiciones, PETG, letra por letra, advertencias de plazo y de verificación estructural.
5. Filtro admite/rechaza y la traza de CU2: reglas en orden, con su origen.
Si sobra tiempo, en el Browser: MATCH (n:Instancia {caso:'CU2'})-[r]-(m:Instancia) RETURN n,r,m.
Si falla la conexión: video de respaldo (salida/guion_demo.md).`);
}

// ================================================================= 14. Integrador
pres.addSection({ title: "Cierre" });
{
  const s = nueva("Hacia el integrador: respuestas desde nuestro modelo", "Cierre");
  const ejes = [
    ["Grafo", "Pedido, Dato, RestricciónCliente, Ficha, Cartel, Entorno, Conflicto, Alternativa, Recomendación, Regla. Ficha PRESERVA restricción → CONDICIONA cartel → ADMITE/RECHAZA alternativa.", "hecho", K.COM],
    ["Difusa", "Exposición, flexibilidad estética, complejidad, exceso de peso → índice de adecuación que ordena alternativas; lo excluyente sigue crisp.", "dirección de trabajo", K.MAT],
    ["Planificador", "Pedido → LLM extrae → ciclo de aclaraciones → ficha → materiales → rediseño → explicación. Revisión del experto: MAN-R8 inviable, umbral [PENDIENTE], desacuerdo del fabricante.", "parcial", K.INT],
    ["LLM", "Interpreta (texto → expresiones e interpretaciones, sin asignar valores: INT-R09) y explica desde la traza. RAG sobre fichas y normas (IEC 60529, CIRSOC 102).", "dirección de trabajo", K.neon],
    ["APIs", "POST /evaluar (pedido → aclaraciones o recomendación) · POST /aclaraciones/{id} · GET /explicacion/{caso} (reglas, nodos, advertencias).", "propuesta", K.MAN],
    ["Trazabilidad", "(:Evaluacion)-[:ACTIVO {orden}]->(:Regla) y propiedad regla en cada relación inferida. Grado de pertenencia: cuando haya difusa.", "hecho", K.dark],
  ];
  ejes.forEach(([t, d, est, c], i) => {
    const col = i % 3, fila = Math.floor(i / 3);
    const x = 0.55 + col * 4.12, y = 1.3 + fila * 2.75;
    caja(s, x, y, 3.92, 2.55, "FFFFFF", c);
    T(s, t, { x: x + 0.2, y: y + 0.13, w: 2.0, h: 0.4, fontSize: 18, bold: true, color: c });
    chip(s, x + 2.05, y + 0.16, 1.7, est, est === "hecho" ? "2F855A" : est === "parcial" ? K.MAT : "8A94A6", { fontSize: 10 });
    T(s, d, { x: x + 0.2, y: y + 0.62, w: 3.55, h: 1.85, fontSize: 14, color: K.ink, valign: "top" });
  });
  s.addNotes(`HABLA: Luciano (≈1:00)

La cátedra dijo que respondiendo estas preguntas el proyecto queda listo para el integrador; las adaptamos a cartelería y marcamos qué está hecho y qué es dirección de trabajo.

- Grafo (hecho): las entidades mínimas son las de la red integrada. Un requerimiento del cliente se conecta con la recomendación así: la ficha preserva la restricción, la restricción condiciona el cartel, y admite o rechaza cada alternativa, que conforma la recomendación.
- Difusa (dirección de trabajo): un índice de adecuación con las variables candidatas, para ordenar alternativas; lo excluyente sigue en reglas nítidas.
- Planificador (parcial): el flujo ya está en el orden de las reglas. Lo que dispara revisión del experto: un conflicto inviable, un umbral pendiente como el de verificación estructural, o que el fabricante no acepte la recomendación.
- LLM (dirección de trabajo): hace las dos cosas, interpreta y explica, pero no asigna valores (lo impide INT-R09) ni decide. RAG sobre fichas técnicas y normas.
- APIs (propuesta): evaluar, responder aclaración y obtener explicación.
- Trazabilidad (hecho): el rastro está en el grafo como nodos Evaluación con las reglas activadas en orden.`);
}

// ================================================================= 15. Pendientes y cierre
{
  const s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "Cierre" });
  T(s, "Qué falta validar con el experto", { x: 0.8, y: 0.7, w: 11, h: 0.7, fontSize: 32, bold: true, color: "FFFFFF" });
  const pend = [
    ["PI2 de Lautaro", "frames de Materiales e instalación (hoy derivados del PI1)"],
    ["Umbrales", "grado IP exigido · peso seguro por soporte · tamaño/altura que exige verificación · carga de la cinta bifaz"],
    ["Criterios", "qué faltante es postergable · cómo propone la tecnología el rediseño · impacto de segmentar en el plazo"],
    ["Validación", "reglas «propuesta» de Interpretación con pensamiento en voz alta · pedidos reales"],
    ["Difusa", "conjuntos, rangos y reglas (PI3)"],
  ];
  pend.forEach(([t, d], i) => {
    const y = 1.75 + i * 0.85;
    s.addShape(pres.shapes.OVAL, { x: 0.8, y: y + 0.1, w: 0.22, h: 0.22, fill: { color: K.neon }, line: { color: K.neon } });
    T(s, t, { x: 1.25, y, w: 2.6, h: 0.45, fontSize: 18, bold: true, color: "FFFFFF" });
    T(s, d, { x: 3.9, y, w: 8.6, h: 0.6, fontSize: 15, color: "C9D1E0", valign: "top" });
  });
  T(s, "¡Gracias! ¿Preguntas?", { x: 0.8, y: 6.15, w: 8, h: 0.7, fontSize: 30, bold: true, color: K.cyan });
  T(s, "Todo el material: salida/ y neo4j/ (scripts reproducibles con bash neo4j/cargar.sh)", { x: 0.8, y: 6.85, w: 11.5, h: 0.3, fontSize: 12, color: "8A94A6" });
  s.addNotes(`HABLA: Lautaro (≈0:30) y cierra Matías.

Lautaro: Lo que queda pendiente está marcado en el grafo con [PENDIENTE] y lo podemos listar con una consulta. Lo principal: mi PI2, que va a reemplazar los frames derivados del PI1; los umbrales que no inventamos (grado IP, peso por soporte, cuándo pedir verificación estructural, la carga de la cinta bifaz); criterios como qué faltante es postergable o cómo elige la tecnología el rediseño; validar con Luciano las reglas que hoy son propuestas; y la lógica difusa en PI3.

Matías: Esto es la base de la PG1, la integración conceptual. Gracias, quedamos para preguntas.`);
}


// ================================================================= Anexos (no se presentan; apoyo para preguntas)
pres.addSection({ title: "Anexos" });
function anexo(titulo, nota) {
  const s = nueva(titulo, "Anexos");
  s.addNotes("ANEXO — no se presenta en los 20 minutos; queda para responder preguntas.\n\n" + nota);
  return s;
}
{
  const s = anexo("Anexo A · Procesos expertos de cada submódulo (PI1)", "Diagramas de procesos del PI1 de cada integrante: el punto de partida del modelado (qué mira el experto, en qué orden, qué decide).");
  [["pi1/img/PI1_Matias_diagrama_procesos.png", 0.732, "Interpretación (Matías)", K.INT],
   ["pi1/img/PI1_Lautaro_diagrama_procesos.png", 0.862, "Materiales e instalación (Lautaro)", K.MAT],
   ["pi1/img/PI1_Luciano_diagrama_procesos.png", 0.678, "Manufacturabilidad (Luciano)", K.MAN]].forEach(([p, r, t, c], i) => {
    const x = 0.55 + i * 4.12;
    T(s, t, { x, y: 1.2, w: 3.95, h: 0.35, fontSize: 14, bold: true, color: c, align: "center" });
    fit(p, r, x, 1.6, 3.95, 5.3, s);
  });
}
{
  const s = anexo("Anexo B · Redes semánticas individuales (PI2)", "Redes conceptuales de los PI2 de Matías y de Luciano antes de integrar. Lautaro no tiene PI2.");
  T(s, "Interpretación (Matías)", { x: 0.55, y: 1.2, w: 8.3, h: 0.35, fontSize: 14, bold: true, color: K.INT });
  fit("pi2/img/PI2_Matias_fig1_red_semantica_conceptual.png", 1.614, 0.55, 1.6, 8.3, 5.3, s);
  T(s, "Manufacturabilidad (Luciano)", { x: 9.1, y: 1.2, w: 3.7, h: 0.35, fontSize: 14, bold: true, color: K.MAN });
  fit("pi2/img/PI2_Luciano_red_semantica_conceptual.png", 0.667, 9.1, 1.6, 3.7, 5.3, s);
}
{
  const s = anexo("Anexo C · Jerarquía de frames (generada desde Neo4j)", "Herencia ES_UN y composición ES_PARTE_DE tal como están en la base: MATCH p=(:Frame)-[:ES_UN|ES_PARTE_DE]->(:Frame) RETURN p.");
  fit("salida/img/jerarquia_frames.png", 2.477, 0.45, 1.2, 12.4, 5.7, s);
}
{
  const s = anexo("Anexo D · CU1 instanciado en Neo4j", "Grafo del caso CU1 al final de la ejecución: pedido incompleto → consulta a Materiales → respuesta (dato de prueba simulado) → ficha → dictamen apto → ExcedeCama → segmentación + refuerzo.");
  fit("salida/img/cu1_instanciado.png", 1.837, 0.45, 1.2, 12.4, 5.7, s);
}
{
  const s = anexo("Anexo E · Filtro por restricción del cliente (L-C1 y L-C3)", "Casos del PI2 de Luciano: la restricción obligatoria del cliente rechaza una alternativa y admite la otra (MAN-R6, MAN-R9).");
  fit("salida/img/filtro_luciano.png", 2.943, 0.45, 1.4, 12.4, 5.3, s);
}

pres.writeFile({ fileName: OUT }).then(async () => {
  await applyTheme(OUT, THEME);
  console.log("✓", OUT);
});
