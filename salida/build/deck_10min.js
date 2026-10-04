// Genera salida/presentacion_10min.pptx — versión corta (10 min) de la presentación de modelado, Grupo 11.
// Uso: node salida/build/deck_10min.js   (no toca salida/presentacion.pptx)
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply_theme.js");

const ROOT = path.resolve(__dirname, "..", "..");
const IMG = (p) => path.join(ROOT, p);
const ST = JSON.parse(fs.readFileSync(path.join(__dirname, "stats.json"), "utf8"));
const OUT = path.join(ROOT, "salida", "presentacion_10min.pptx");

// ---------------------------------------------------------------- paleta (misma que la presentación larga)
const K = {
  dark: "141824", ink: "1A202C", muted: "5A6578", line: "CBD5E0", soft: "F4F6FA", gray: "8A94A6",
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
// cada integrante habla con el color de su submódulo
const QUIEN = { "Matías": K.INT, "Lautaro": K.MAT, "Luciano": K.MAN };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Asistente para evaluar pedidos de cartelería — Grupo 11 (versión 10 min)";
pres.author = "Grupo 11 — Zarandon, Quiros, Marquesini";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };

const FOOT = "Grupo 11 · UTN FRM 5K9 · Actividad de modelado · 5/10/2026";
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.55, y: 0.35, w: 10.1, h: 0.8, fontSize: 32, bold: true,
      color: K.ink, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: 0.55, y: 7.03, w: 9, h: 0.3, fontSize: 10, color: K.gray, margin: 0 } } },
  ],
  slideNumber: { x: 12.25, y: 7.03, w: 0.5, h: 0.3, fontSize: 10, color: K.gray, align: "right" },
});
pres.defineSlideMaster({ title: "OSCURO", background: { color: K.dark }, objects: [] });

// ---------------------------------------------------------------- helpers
function T(slide, text, o) { slide.addText(text, Object.assign({ isTextBox: true, fontSize: 16, color: K.ink, margin: 0 }, o)); }
function caja(slide, x, y, w, h, fill, line, o = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { color: line, width: 1.25 }, rectRadius: 0.08 }, o));
}
function circulo(slide, x, y, d, txt, color, fs = 16) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color } });
  T(slide, txt, { x, y, w: d, h: d, fontSize: fs, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
}
function flecha(slide, x1, y1, x2, y2, color = K.gray, w = 1.5, o = {}) {
  slide.addShape(pres.shapes.LINE, Object.assign({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: x2 < x1, flipV: y2 < y1, line: { color, width: w, endArrowType: "triangle" } }, o));
}
function pngRatio(p) { const b = fs.readFileSync(IMG(p)); return b.readUInt32BE(16) / b.readUInt32BE(20); }
function fit(slide, p, x, y, maxW, maxH) {
  const r = pngRatio(p);
  let w = maxW, h = w / r;
  if (h > maxH) { h = maxH; w = h * r; }
  slide.addImage({ path: IMG(p), x: x + (maxW - w) / 2, y: y + (maxH - h) / 2, w, h });
}
// chip arriba a la derecha: quién habla y cuánto tiempo
function chipHabla(slide, quien, tiempo, oscuro = false) {
  const c = QUIEN[quien] || K.gray;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.85, y: 0.48, w: 1.95, h: 0.5, fill: { color: c }, line: { color: c }, rectRadius: 0.25 });
  T(slide, [{ text: quien, options: { bold: true } }, { text: "  ·  " + tiempo }],
    { x: 10.85, y: 0.48, w: 1.95, h: 0.5, fontSize: 14, color: "FFFFFF", align: "center", valign: "middle" });
}
function nueva(titulo, seccion, quien, tiempo) {
  const s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: seccion });
  s.addText(titulo, { placeholder: "title" });
  if (quien) chipHabla(s, quien, tiempo);
  return s;
}
function notas(s, quien, tiempo, acum, guion, preguntas) {
  const p = preguntas.map(([q, a]) => `- ${q}\n  → ${a}`).join("\n");
  s.addNotes(`HABLA: ${quien} · ${tiempo} (al terminar, el reloj marca ${acum})\n\n${guion}\n\nSi preguntan:\n${p}`);
}
// nodo de un diagrama: caja redondeada con texto centrado; devuelve el rectángulo para conectar flechas
function nodo(slide, cx, cy, w, h, txt, sub, o = {}) {
  const col = { INT: [K.INT, K.INTf], MAT: [K.MAT, K.MATf], MAN: [K.MAN, K.MANf], COM: [K.COM, K.COMf], GRAY: [K.muted, K.soft] }[sub];
  const x = cx - w / 2, y = cy - h / 2;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: col[1] }, line: { color: col[0], width: 1.75 }, rectRadius: 0.1 });
  T(slide, txt, Object.assign({ x, y, w, h, fontSize: 14, bold: true, color: K.ink, align: "center", valign: "middle" }, o));
  return { cx, cy, w, h };
}
// punto del borde del rectángulo a en dirección a (dx, dy)
function borde(a, dx, dy) {
  const sx = dx === 0 ? Infinity : (a.w / 2) / Math.abs(dx);
  const sy = dy === 0 ? Infinity : (a.h / 2) / Math.abs(dy);
  const s = Math.min(sx, sy);
  return [a.cx + dx * s, a.cy + dy * s];
}
// flecha entre dos nodos con etiqueta (pos: 'centro' sobre la línea con fondo blanco, 'der' al costado de una vertical)
function conectar(slide, a, b, etiqueta, pos = "centro", o = {}) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  const [x1, y1] = borde(a, dx, dy);
  const [x2, y2] = borde(b, -dx, -dy);
  flecha(slide, x1, y1, x2, y2, "4A5568", 1.5);
  if (!etiqueta) return;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const w = o.w || Math.max(0.55, etiqueta.length * 0.072 + 0.12);
  if (pos === "der") T(slide, etiqueta, { x: mx + 0.08, y: my - 0.15, w, h: 0.3, fontSize: 12, italic: true, color: K.muted, valign: "middle" });
  else T(slide, etiqueta, { x: mx - w / 2, y: my - 0.15, w, h: 0.3, fontSize: 11, italic: true, color: K.muted, align: "center", valign: "middle",
    fill: { color: "FFFFFF" } });
}
function codigo(slide, txt, x, y, w, h, fs = 14) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: K.dark }, line: { color: K.dark }, rectRadius: 0.08 });
  T(slide, txt, { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: h - 0.3, fontFace: "Consolas", fontSize: fs, color: "E2E8F0", valign: "top" });
}
function tabla(slide, filas, o, colorHead = K.dark) {
  const rows = filas.map((f, i) => f.map((c) => (typeof c === "object" ? c : { text: c, options: i === 0
    ? { bold: true, color: "FFFFFF", fill: { color: colorHead } } : { color: K.ink, fill: { color: i % 2 ? "FFFFFF" : K.soft } } })));
  slide.addTable(rows, Object.assign({ fontSize: 14, border: { type: "solid", pt: 0.5, color: K.line }, valign: "middle", margin: 0.08 }, o));
}

// ================================================================= 1. Portada — Luciano 0:15
pres.addSection({ title: "Problema y casos" });
{
  const s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "Problema y casos" });
  chipHabla(s, "Luciano", "0:15", true);
  T(s, "ACTIVIDAD DE MODELADO · GRUPO 11", { x: 0.8, y: 1.3, w: 9, h: 0.4, fontSize: 14, bold: true, color: K.cyan, charSpacing: 2 });
  T(s, "Un asistente para evaluar pedidos de carteles luminosos",
    { x: 0.8, y: 1.85, w: 10.5, h: 1.7, fontSize: 42, bold: true, color: "FFFFFF", valign: "top" });
  T(s, "Cómo modelamos el conocimiento del fabricante: del experto a Neo4j", { x: 0.8, y: 3.6, w: 10.5, h: 0.5, fontSize: 20, italic: true, color: "C9D1E0" });
  [["Matías Zarandon", "Interpretación del pedido", K.INT], ["Lautaro Quiros", "Materiales e instalación", K.MAT],
   ["Luciano Marquesini", "Fabricación y rediseño · experto", K.MAN]].forEach(([n, r, c], i) => {
    const x = 0.8 + i * 3.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.85, w: 3.6, h: 0.09, fill: { color: c }, line: { color: c }, rectRadius: 0.045,
      shadow: { type: "outer", color: c, blur: 8, offset: 0, angle: 90, opacity: 0.9 } });
    T(s, n, { x, y: 5.05, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: "FFFFFF" });
    T(s, r, { x, y: 5.45, w: 3.6, h: 0.35, fontSize: 14, color: "AEB8CC" });
  });
  T(s, "UTN FRM · 5K9 · Inteligencia Artificial · Prof. Matilde Césari y María Eugenia Stefanoni · 5/10/2026",
    { x: 0.8, y: 6.6, w: 11.8, h: 0.35, fontSize: 12, color: K.gray });
  notas(s, "Luciano", "0:15", "0:15",
`Hola, somos el Grupo 11: Matías, Lautaro y yo, Luciano. Armamos un asistente que ayuda a un fabricante de carteles luminosos a evaluar los pedidos que le llegan. Hoy les contamos cómo modelamos ese conocimiento, paso a paso, hasta llevarlo a Neo4j.`,
  [["¿Por qué eligieron cartelería?", "Porque yo fabrico carteles, así que teníamos un experto real a mano para sacar el conocimiento."]]);
}

// ================================================================= 2. Problema y objetivo — Luciano 0:45
{
  const s = nueva("Hoy cada pedido se evalúa «a ojo»", "Problema y casos", "Luciano", "0:45");
  caja(s, 0.55, 1.5, 5.6, 4.2, K.dark, K.dark);
  T(s, "HOY", { x: 0.9, y: 1.75, w: 4, h: 0.4, fontSize: 14, bold: true, color: K.cyan, charSpacing: 2 });
  T(s, "«Quiero un neón para la pared, de un metro más o menos»", { x: 0.9, y: 2.3, w: 4.9, h: 1.3, fontSize: 24, italic: true, color: "FFFFFF", valign: "top" });
  T(s, "El fabricante decide si alcanza la info, si va a durar y si lo puede fabricar… con experiencia que no está escrita.",
    { x: 0.9, y: 3.85, w: 4.9, h: 1.4, fontSize: 18, color: "C9D1E0", valign: "top" });
  flecha(s, 6.3, 3.6, 6.85, 3.6, K.ink, 2.5);
  T(s, "CON EL ASISTENTE", { x: 7.05, y: 1.75, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: K.neon, charSpacing: 2 });
  const items = [["?", "Pregunta lo que falta, no lo supone"], ["!", "Avisa lo que no se puede instalar o fabricar"], ["→", "Propone alternativas y explica por qué"]];
  items.forEach(([ic, t], i) => {
    const y = 2.35 + i * 1.1;
    circulo(s, 7.05, y, 0.65, ic, K.neon, 20);
    T(s, t, { x: 7.95, y, w: 4.8, h: 0.65, fontSize: 18, valign: "middle" });
  });
  caja(s, 0.55, 6.0, 12.2, 0.7, K.soft, K.soft);
  T(s, [{ text: "Decide el fabricante. ", options: { bold: true, color: K.neon } },
        { text: "El LLM (un modelo de lenguaje, tipo ChatGPT) solo entiende el texto del cliente y redacta la explicación." }],
    { x: 0.8, y: 6.0, w: 11.8, h: 0.7, fontSize: 16, valign: "middle" });
  notas(s, "Luciano", "0:45", "1:00",
`En un taller como el mío llega un mensaje así: «quiero un neón para la pared, de un metro más o menos». Con eso hay que decidir si alcanza la información, si va a aguantar en ese lugar y si lo podemos fabricar. Hoy eso se decide a ojo, con experiencia que no está escrita.

El asistente ayuda en tres cosas: pregunta lo que falta, avisa lo que no se puede instalar o fabricar, y propone alternativas explicando por qué.

Y lo importante: decide el fabricante. El modelo de lenguaje, tipo ChatGPT, solo entiende el texto del cliente y redacta la explicación.`,
  [["¿Por qué no usar directamente ChatGPT?", "Porque puede inventar datos; acá cada conclusión sale de una regla del experto y se puede rastrear."],
   ["¿Quién decide al final?", "El fabricante: el sistema recomienda y justifica, no decide."]]);
}

// ================================================================= 3. Submódulos — Lautaro 0:40
{
  const s = nueva("Tres submódulos que se pasan la información", "Problema y casos", "Lautaro", "0:40");
  // entrada
  caja(s, 0.55, 2.35, 1.75, 1.5, K.soft, K.line);
  T(s, [{ text: "Pedido", options: { bold: true, breakLine: true } }, { text: "texto + foto", options: { fontSize: 14, color: K.muted } }],
    { x: 0.55, y: 2.35, w: 1.75, h: 1.5, fontSize: 18, align: "center", valign: "middle" });
  const sm = [
    ["1 · Interpretación", "Matías", "¿Qué pide realmente el cliente?", K.INT, K.INTf],
    ["2 · Materiales e instalación", "Lautaro", "¿Funciona y dura en ese lugar?", K.MAT, K.MATf],
    ["3 · Fabricación y rediseño", "Luciano", "¿Se puede fabricar? Si no, ¿qué cambiamos?", K.MAN, K.MANf],
  ];
  const X = [2.75, 6.0, 9.25], W = 2.55;
  sm.forEach(([t, q, p, c, f], i) => {
    caja(s, X[i], 1.75, W, 2.7, f, c, { line: { color: c, width: 2 } });
    T(s, t, { x: X[i] + 0.2, y: 1.9, w: W - 0.4, h: 0.75, fontSize: 18, bold: true, color: c, valign: "top" });
    T(s, q, { x: X[i] + 0.2, y: 2.65, w: W - 0.4, h: 0.35, fontSize: 14, color: K.muted });
    T(s, p, { x: X[i] + 0.2, y: 3.1, w: W - 0.4, h: 1.2, fontSize: 18, italic: true, valign: "top" });
  });
  flecha(s, 2.35, 3.1, 2.7, 3.1, K.ink, 2.5);
  // lo que se pasan
  [["ficha", 0], ["dictamen", 1]].forEach(([t, i]) => {
    const x1 = X[i] + W, x2 = X[i + 1];
    flecha(s, x1 + 0.04, 3.1, x2 - 0.04, 3.1, K.ink, 2.5);
    T(s, t, { x: x1, y: 2.72, w: x2 - x1, h: 0.3, fontSize: 12, bold: true, color: K.ink, align: "center" });
  });
  // salida
  flecha(s, X[2] + W / 2, 4.5, X[2] + W / 2, 5.05, K.ink, 2.5);
  caja(s, 9.25, 5.1, 3.55, 0.9, K.dark, K.dark);
  T(s, [{ text: "Recomendación", options: { bold: true, breakLine: true } }, { text: "→ decide el fabricante", options: { color: K.cyan } }],
    { x: 9.45, y: 5.1, w: 3.2, h: 0.9, fontSize: 15, color: "FFFFFF", valign: "middle" });
  // retorno
  s.addShape(pres.shapes.LINE, { x: 4.2, y: 4.5, w: 0, h: 0.95, line: { color: K.neon, width: 2, dashType: "dash", beginArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 4.2, y: 5.45, w: 3.2, h: 0, line: { color: K.neon, width: 2, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: 7.4, y: 4.5, w: 0, h: 0.95, line: { color: K.neon, width: 2, dashType: "dash" } });
  T(s, "¿falta un dato? se le pregunta al cliente, nunca se inventa", { x: 1.0, y: 5.6, w: 7.2, h: 0.4, fontSize: 15, italic: true, color: K.neon, align: "center" });
  T(s, "Ficha = el pedido ordenado y sin dudas · Dictamen = si el cartel sirve para ese lugar", { x: 0.55, y: 6.45, w: 12.2, h: 0.35, fontSize: 13, color: K.muted });
  notas(s, "Lautaro", "0:40", "1:40",
`El sistema tiene tres partes, una por integrante, y cada una responde una pregunta.

Interpretación, de Matías: ¿qué pide realmente el cliente? Su salida es la ficha de requerimientos, o sea el pedido ordenado y sin dudas.

Materiales e instalación, la mía: con esa ficha, ¿el cartel funciona y dura en ese lugar? Sale un dictamen: apto, apto con condiciones o no apto.

Fabricación y rediseño, de Luciano: ¿se puede fabricar con lo que tiene el taller? Si no, propone cambios, y eso termina en una recomendación para el fabricante.

Y la flecha rosa: si a mí me falta un dato, no lo invento; vuelve a Interpretación, que le pregunta al cliente.`,
  [["¿Por qué tres submódulos y no uno solo?", "Porque son tres decisiones distintas del experto, cada una con su conocimiento; se conectan por la ficha y el dictamen."],
   ["¿Qué pasa si Fabricación no encuentra ninguna alternativa?", "El caso vuelve a Interpretación para renegociar con el cliente (regla MAN-R8)."]]);
}

// ================================================================= 4. Casos de uso — Matías 0:40
{
  const s = nueva("Dos casos de uso guiaron el modelo", "Problema y casos", "Matías", "0:40");
  const cu = [
    ["CU1 · Café Andino", "«Quiero un cartel de neón con el nombre del café, para poner en la pared. Más o menos de un metro.»",
     "Pregunta dónde va y cómo se fija → apto, pero hay que dividirlo en partes", K.INT],
    ["CU2 · Letras para el frente", "«Letras corpóreas con luz para el frente que da a la calle. 3 metros. Sí o sí antes de la inauguración.»",
     "Apto con condiciones → material para exterior (PETG) y fabricar letra por letra", K.MAN],
  ];
  cu.forEach(([t, e, o, c], i) => {
    const x = 0.55 + i * 6.25;
    T(s, t, { x, y: 1.45, w: 5.9, h: 0.5, fontSize: 22, bold: true, color: c });
    T(s, "ENTRA", { x, y: 2.05, w: 2, h: 0.3, fontSize: 12, bold: true, color: K.gray, charSpacing: 2 });
    caja(s, x, 2.4, 5.9, 1.55, K.soft, K.soft);
    T(s, e, { x: x + 0.25, y: 2.45, w: 5.4, h: 1.45, fontSize: 17, italic: true, valign: "middle" });
    flecha(s, x + 2.95, 4.05, x + 2.95, 4.5, c, 2.5);
    T(s, "SALE", { x, y: 4.2, w: 2, h: 0.3, fontSize: 12, bold: true, color: c, charSpacing: 2 });
    caja(s, x, 4.6, 5.9, 1.3, "FFFFFF", c, { line: { color: c, width: 2 } });
    T(s, o, { x: x + 0.25, y: 4.65, w: 5.4, h: 1.2, fontSize: 17, bold: true, valign: "middle" });
  });
  T(s, "Corpóreas = letras con volumen · PETG = plástico de impresión 3D que aguanta sol y calor", { x: 0.55, y: 6.35, w: 12.2, h: 0.35, fontSize: 13, color: K.muted });
  notas(s, "Matías", "0:40", "2:20",
`Para modelar no partimos de la teoría sino de dos casos concretos.

El primero, el Café Andino: un cliente que no sabe nada técnico pide un neón para la pared, de un metro. El sistema tiene que preguntar dónde va y cómo se fija, y al final recomienda dividir el cartel en partes porque no entra en la impresora.

El segundo: letras corpóreas, o sea letras con volumen, de 3 metros, para un frente que da a la calle. Ahí sale «apto con condiciones»: usar PETG, un plástico que aguanta el sol, y fabricar letra por letra.

El primero se los cuento completo.`,
  [["¿De dónde salen los casos?", "Son los pedidos de ejemplo de mi PI2, armados con situaciones reales que nos contó Luciano."],
   ["¿Por qué esos dos?", "Porque entre los dos pasan por los tres submódulos y muestran un caso típico y uno con más restricciones."]]);
}

// ================================================================= 5. CU1 de punta a punta — Matías 1:00
{
  const s = nueva("CU1 de punta a punta: Café Andino", "Problema y casos", "Matías", "1:00");
  const pasos = [
    ["Entra el pedido", "«neón con el nombre del café, para la pared, de un metro»", "", K.muted],
    ["Interpretación", "¿Adentro o afuera? ¿Cómo se fija? → le pregunta al cliente", "INT-R01 · INT-R02", K.INT],
    ["Materiales", "Sin soporte no se evalúa. Con la respuesta*: interior → apto", "R-MI-01 · R-MI-10", K.MAT],
    ["Fabricación", "1 m no entra en la impresora 3D (máx. 40 cm)", "MAN-R3", K.MAN],
    ["Recomendación", "Dividir en módulos y reforzar la fijación → decide el fabricante", "", K.COM],
  ];
  const W = 2.2, G = 0.3;
  pasos.forEach(([t, d, r, c], i) => {
    const x = 0.55 + i * (W + G);
    circulo(s, x + W / 2 - 0.35, 1.5, 0.7, String(i + 1), c, 20);
    caja(s, x, 2.45, W, 2.75, i === 0 ? K.soft : "FFFFFF", c, { line: { color: c, width: 2 } });
    T(s, t, { x: x + 0.15, y: 2.6, w: W - 0.3, h: 0.45, fontSize: 18, bold: true, color: c, align: "center" });
    T(s, d, { x: x + 0.15, y: 3.15, w: W - 0.3, h: 1.5, fontSize: 17, italic: i === 0, align: "center", valign: "top" });
    if (r) T(s, r, { x: x + 0.15, y: 4.7, w: W - 0.3, h: 0.35, fontSize: 12, color: K.gray, align: "center" });
    if (i < 4) flecha(s, x + W + 0.03, 3.8, x + W + G - 0.03, 3.8, K.ink, 2);
  });
  T(s, "* La respuesta del cliente sobre el soporte es un dato de prueba simulado (está marcado así en el grafo).",
    { x: 0.55, y: 5.6, w: 12.2, h: 0.35, fontSize: 14, italic: true, color: K.muted });
  notas(s, "Matías", "1:00", "3:20",
`Paso uno: llega el mensaje del cliente.

Paso dos, Interpretación. «La pared» no dice si es adentro o afuera; «un metro» puede ser el cartel o el espacio. Y falta un dato: cómo se fija. El sistema no supone: arma preguntas para el cliente.

¿Ese dato que falta frena todo? Eso no lo decido yo: le pregunto al submódulo de Lautaro, y su regla dice que sin el soporte no se evalúa. Así que el pedido espera.

Paso tres: el cliente responde que es adentro, de un metro de largo, sobre una pared de mampostería. Materiales dice: apto.

Paso cuatro, fabricación: un metro no entra en la impresora 3D, que imprime hasta 40 centímetros.

Paso cinco: se recomienda dividirlo en módulos y reforzar la fijación. Y decide el fabricante.`,
  [["¿La respuesta del cliente es real?", "La parte del soporte es un dato de prueba simulado y está marcada así en el grafo; el resto sale de mi PI2."],
   ["¿Por qué 40 cm?", "Es el tamaño máximo de la cama de la impresora 3D del taller; sale de su ficha técnica."]]);
}

// ================================================================= 6. Metodología — Lautaro 0:30
pres.addSection({ title: "Modelado" });
{
  const s = nueva("Metodología: del experto al grafo", "Modelado", "Lautaro", "0:30");
  const pasos = [
    ["Experto", "Entrevistas con Luciano: cómo decide", "PI1"],
    ["Red semántica", "Conceptos unidos por verbos", "PI2"],
    ["Frames", "Una ficha con casilleros por concepto", "PI2"],
    ["Reglas", "SI… ENTONCES…", "PI2"],
    ["Neo4j", "Todo en una base de grafos", "hoy"],
  ];
  const W = 2.2, G = 0.3;
  pasos.forEach(([t, d, e], i) => {
    const x = 0.55 + i * (W + G);
    const c = i === 4 ? K.neon : K.ink;
    caja(s, x, 1.6, W, 3.1, i === 4 ? "FFF0F6" : K.soft, i === 4 ? K.neon : K.line, { line: { color: i === 4 ? K.neon : K.line, width: 1.5 } });
    circulo(s, x + 0.2, 1.8, 0.6, String(i + 1), c, 18);
    T(s, e, { x: x + 1.0, y: 1.8, w: 1.0, h: 0.6, fontSize: 14, bold: true, color: K.muted, align: "right", valign: "middle" });
    T(s, t, { x: x + 0.2, y: 2.65, w: W - 0.4, h: 0.5, fontSize: 20, bold: true, color: c });
    T(s, d, { x: x + 0.2, y: 3.2, w: W - 0.4, h: 1.3, fontSize: 16, color: K.ink, valign: "top" });
    if (i < 4) flecha(s, x + W + 0.03, 3.15, x + W + G - 0.03, 3.15, K.ink, 2);
  });
  caja(s, 0.55, 5.1, 12.2, 0.75, "FFFFFF", K.gray, { line: { color: K.gray, width: 1.25, dashType: "dash" } });
  T(s, [{ text: "6 · Lógica difusa: ", options: { bold: true } }, { text: "próximo paso (PI3)" }],
    { x: 0.8, y: 5.1, w: 6, h: 0.75, fontSize: 16, color: K.muted, valign: "middle" });
  T(s, [{ text: "Lo que el experto todavía no definió queda marcado " }, { text: "[PENDIENTE]", options: { bold: true, color: K.neon } }, { text: ": no inventamos números." }],
    { x: 0.55, y: 6.2, w: 12.2, h: 0.4, fontSize: 16 });
  notas(s, "Lautaro", "0:30", "3:50",
`Ahora, cómo lo construimos. Seguimos cinco pasos.

Primero, entrevistas con el experto, que es Luciano: cómo decide, casos típicos y excepciones. Eso fue el PI1. Con eso armamos una red semántica: los conceptos y cómo se relacionan. Después pasamos cada concepto a un frame, que es como una ficha con casilleros. Le sumamos reglas SI–ENTONCES. Y todo eso lo cargamos en Neo4j. La lógica difusa queda como próximo paso.`,
  [["¿Qué hicieron cuando faltaba información del experto?", "La marcamos como PENDIENTE en el modelo; no inventamos umbrales ni criterios."],
   ["¿Está tu PI2?", "Todavía no; mi parte se modeló desde mi PI1 y está marcada como pendiente."]]);
}

// ================================================================= 7. Red semántica simplificada — Lautaro 0:50
{
  const s = nueva("Red semántica: conceptos unidos por verbos", "Modelado", "Lautaro", "0:50");
  const C = [1.4, 3.95, 6.5, 9.05, 11.6], R = [1.75, 2.85, 3.95, 5.05];
  const NW = 1.6, NH = 0.6;
  const n = {
    cliente: nodo(s, C[0], R[0], NW, NH, "Cliente", "INT"),
    pedido: nodo(s, C[0], R[1], NW, NH, "Pedido", "INT"),
    aclar: nodo(s, C[1], R[0], NW, NH, "Aclaración", "INT"),
    dato: nodo(s, C[2], R[0], NW, NH, "Dato", "INT"),
    ficha: nodo(s, C[1], R[1], NW, NH, "Ficha", "COM"),
    cartel: nodo(s, C[2], R[1], NW, NH, "Cartel", "COM"),
    entorno: nodo(s, C[3], R[0], NW, NH, "Entorno", "MAT"),
    dict: nodo(s, C[3], R[1], NW, NH, "Dictamen", "MAT"),
    geo: nodo(s, C[2], R[2], NW, NH, "Geometría", "MAN"),
    restr: nodo(s, C[2], R[3], NW, NH, "Límite técnico", "MAN"),
    conf: nodo(s, C[3], R[2], NW, NH, "Conflicto", "COM"),
    alt: nodo(s, C[4], R[2], NW, NH, "Alternativa", "MAN"),
    rec: nodo(s, C[4], R[3], NW, NH, "Recomendación", "MAN"),
  };
  conectar(s, n.cliente, n.pedido, "formula", "der");
  conectar(s, n.aclar, n.cliente, "se dirige a");
  conectar(s, n.dato, n.aclar, "provoca");
  conectar(s, n.ficha, n.pedido, "corresponde a");
  conectar(s, n.ficha, n.dato, "registra");
  conectar(s, n.ficha, n.cartel, "describe");
  conectar(s, n.cartel, n.entorno, "se instala en");
  conectar(s, n.dict, n.cartel, "evalúa");
  conectar(s, n.cartel, n.geo, "tiene", "der");
  conectar(s, n.geo, n.restr, "viola", "der");
  conectar(s, n.restr, n.conf, "genera");
  conectar(s, n.dict, n.conf, "registra", "der");
  conectar(s, n.conf, n.alt, "exige");
  conectar(s, n.alt, n.rec, "conforma", "der");
  // leyenda (arriba a la derecha)
  [["Interpretación", K.INT, K.INTf], ["Materiales", K.MAT, K.MATf], ["Fabricación", K.MAN, K.MANf], ["Compartido", K.COM, K.COMf]].forEach(([t, c, f], i) => {
    const y = 1.5 + i * 0.36;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 10.85, y: y + 0.05, w: 0.35, h: 0.22, fill: { color: f }, line: { color: c, width: 1.5 }, rectRadius: 0.05 });
    T(s, t, { x: 11.3, y, w: 1.5, h: 0.32, fontSize: 13, color: K.ink, valign: "middle" });
  });
  // cómo se armó (abajo a la izquierda, espacio libre de la red)
  caja(s, 0.55, 3.65, 4.6, 1.4, K.soft, K.soft);
  T(s, [{ text: "Cómo la armamos", options: { bold: true, breakLine: true } },
        { text: "Una red por integrante (PI2) → las unimos en una sola. Vista simplificada: la completa está en el anexo." }],
    { x: 0.8, y: 3.65, w: 4.15, h: 1.4, fontSize: 15, valign: "middle", paraSpaceAfter: 4 });
  // reglas de diseño
  T(s, "Reglas de diseño", { x: 0.55, y: 5.7, w: 3, h: 0.35, fontSize: 14, bold: true, color: K.neon });
  ["Cada relación con verbo y dirección", "Un concepto = un solo nombre", "Lo compartido une los submódulos"].forEach((t, i) => {
    const x = 0.55 + i * 4.12;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 6.1, w: 3.92, h: 0.55, fill: { color: "FFF0F6" }, line: { color: K.neon, width: 1.25 }, rectRadius: 0.27 });
    T(s, t, { x, y: 6.1, w: 3.92, h: 0.55, fontSize: 15, bold: true, align: "center", valign: "middle" });
  });
  notas(s, "Lautaro", "0:50", "4:40",
`Esta es la red semántica, simplificada; la completa está en el anexo. Cada caja es un concepto y cada flecha una relación con un verbo. Se lee como una oración: la ficha describe un cartel; el cartel se instala en un entorno; su geometría viola un límite técnico, eso genera un conflicto, y el conflicto exige una alternativa.

Cada uno hizo su red en el PI2 y después las unimos. Tres reglas de diseño: toda relación tiene verbo y dirección; un concepto, un solo nombre (Luciano decía «diseño» y yo «cartel»: quedó Cartel); y los conceptos compartidos, como la ficha, el cartel y el conflicto, unen los tres submódulos.`,
  [["¿Qué es una red semántica?", "Un grafo de conceptos unidos por relaciones con nombre, que muestra cómo piensa el experto el problema."],
   ["¿Qué pasó cuando dos usaban nombres distintos para lo mismo?", "Elegimos un único nombre por concepto y dejamos el otro como sinónimo."]]);
}

// ================================================================= 8. De la red al frame — Lautaro 0:50
{
  const s = nueva("De la red a los frames", "Modelado", "Lautaro", "0:50");
  T(s, "Cómo se transforma", { x: 0.55, y: 1.4, w: 4.3, h: 0.4, fontSize: 16, bold: true, color: K.muted });
  [["Concepto", "Frame", "una ficha del concepto"], ["Atributo", "Slot", "un casillero de la ficha"], ["«es un»", "Herencia", "el hijo recibe los casilleros del padre"]].forEach(([a, b, d], i) => {
    const y = 1.95 + i * 1.3;
    caja(s, 0.55, y, 1.55, 0.6, K.soft, K.line);
    T(s, a, { x: 0.55, y, w: 1.55, h: 0.6, fontSize: 16, bold: true, align: "center", valign: "middle" });
    flecha(s, 2.15, y + 0.3, 2.6, y + 0.3, K.ink, 2);
    caja(s, 2.65, y, 1.55, 0.6, K.INTf, K.INT);
    T(s, b, { x: 2.65, y, w: 1.55, h: 0.6, fontSize: 16, bold: true, color: K.INT, align: "center", valign: "middle" });
    T(s, d, { x: 0.55, y: y + 0.65, w: 4.3, h: 0.35, fontSize: 14, italic: true, color: K.muted });
  });
  // frame de ejemplo
  const x0 = 5.15, w0 = 7.6;
  caja(s, x0, 1.4, w0, 0.6, K.INT, K.INT);
  T(s, [{ text: "Frame: DatoFaltante", options: { bold: true } }, { text: "   es un → Dato", options: { color: "D6E4F5" } }],
    { x: x0 + 0.25, y: 1.4, w: w0 - 0.5, h: 0.6, fontSize: 18, color: "FFFFFF", valign: "middle" });
  const filas = [
    ["Slot", "Facetas: qué acepta · por defecto"],
    [{ text: "criticidad", options: { bold: true, fill: { color: K.INTf } } },
     { text: "bloqueante / postergable / sin_clasificar · defecto: sin_clasificar", options: { fill: { color: K.INTf } } }],
    [{ text: "atributo  (de Dato)", options: { bold: true } }, "texto, p. ej. «soporte_y_montaje»"],
    [{ text: "origen  (de Dato)", options: { bold: true } }, "solo «cliente» o «respuesta a aclaración»; nunca «supuesto»"],
  ];
  tabla(s, filas, { x: x0, y: 2.0, w: w0, colW: [2.2, 5.4], rowH: 0.55, fontSize: 15 }, K.dark);
  caja(s, x0, 4.4, w0, 0.75, "FFF0F6", K.neon);
  T(s, [{ text: "Demonio de criticidad: ", options: { bold: true, color: K.neon } }, { text: "al crearse un dato faltante, genera automáticamente la pregunta para el cliente." }],
    { x: x0 + 0.25, y: 4.4, w: w0 - 0.5, h: 0.75, fontSize: 15, valign: "middle" });
  // glosario en una frase cada uno
  caja(s, 0.55, 5.6, 12.2, 1.1, K.soft, K.soft);
  T(s, [
    { text: "Slot", options: { bold: true } }, { text: " = un casillero del frame.   " },
    { text: "Faceta", options: { bold: true } }, { text: " = qué valores acepta ese casillero y cuál va por defecto.   " },
    { text: "Demonio", options: { bold: true } }, { text: " = una acción que se dispara sola cuando el casillero se llena o cambia." },
  ], { x: 0.8, y: 5.6, w: 11.8, h: 1.1, fontSize: 15, valign: "middle" });
  notas(s, "Lautaro", "0:50", "5:30",
`De la red a los frames: cada concepto pasa a ser un frame, que es como una ficha; cada atributo, un slot, o sea un casillero; y la relación «es un» pasa a herencia: el hijo recibe los casilleros del padre.

El ejemplo es DatoFaltante, que es un Dato. Su slot criticidad acepta bloqueante, postergable o sin clasificar, y por defecto es sin clasificar: eso es una faceta. Y tiene un demonio, una acción automática: cuando aparece un dato faltante, genera la pregunta para el cliente.

Fíjense el slot origen, heredado de Dato: nunca acepta «supuesto». Así el modelo no puede inventar datos.`,
  [["¿Qué diferencia hay entre slot y faceta?", "El slot es el casillero (criticidad); la faceta dice qué valores acepta y cuál es el valor por defecto."],
   ["¿Por qué criticidad arranca «sin clasificar»?", "Porque el criterio no estaba relevado; en el caso del café la decide una regla de Materiales (R-MI-01): bloqueante."]]);
}

// ================================================================= 9. Reglas — Luciano 0:45
{
  const s = nueva("Reglas SI… ENTONCES…: de dónde sale cada una", "Modelado", "Luciano", "0:45");
  const reglas = [
    ["R-MI-01", "Materiales", "SI falta el entorno, el soporte o las medidas", "ENTONCES no se evalúa la instalación y se pide el dato", "EXPERTO", K.MAT, K.MATf],
    ["MAN-R6", "Fabricación", "SI el trazo del logo es muy fino para el neón Y el cliente exige respetar el logo", "ENTONCES no se engrosa: se propone retroiluminarlo", "EXPERTO", K.MAN, K.MANf],
    ["INT-R11", "Interpretación", "SI todos los datos necesarios están confirmados", "ENTONCES el pedido pasa a evaluación", "PROPUESTA", K.INT, K.INTf],
  ];
  reglas.forEach(([id, sub, si, ent, org, c, f], i) => {
    const y = 1.45 + i * 1.6;
    caja(s, 0.55, y, 8.4, 1.4, f, c);
    T(s, id, { x: 0.8, y: y + 0.12, w: 1.6, h: 0.4, fontSize: 18, bold: true, color: c });
    T(s, sub, { x: 0.8, y: y + 0.52, w: 1.6, h: 0.3, fontSize: 13, color: K.muted });
    T(s, [{ text: si, options: { breakLine: true } }, { text: ent, options: { bold: true } }],
      { x: 2.45, y: y + 0.1, w: 4.75, h: 1.2, fontSize: 15, valign: "middle" });
    const pc = org === "EXPERTO" ? "2F855A" : K.neon;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.35, y: y + 0.48, w: 1.4, h: 0.44, fill: { color: pc }, line: { color: pc }, rectRadius: 0.22 });
    T(s, org, { x: 7.35, y: y + 0.48, w: 1.4, h: 0.44, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  });
  // conteo por origen
  const exp = ST.origen.filter((o) => o.o === "experto").reduce((a, o) => a + o.c, 0);
  const prop = ST.origen.filter((o) => o.o === "propuesta").reduce((a, o) => a + o.c, 0);
  const doc = ST.reglas - exp - prop;
  caja(s, 9.35, 1.45, 3.4, 4.6, K.soft, K.soft);
  T(s, `${ST.reglas} reglas en el modelo`, { x: 9.6, y: 1.6, w: 3, h: 0.4, fontSize: 16, bold: true });
  [[exp, "del experto", "2F855A"], [prop, "propuestas por el grupo (a validar)", K.neon], [doc, "de fichas técnicas o normas", K.muted]].forEach(([nn, t, c], i) => {
    const y = 2.2 + i * 1.25;
    T(s, String(nn), { x: 9.6, y, w: 1.1, h: 0.8, fontSize: 40, bold: true, color: c, valign: "middle" });
    T(s, t, { x: 10.7, y, w: 1.9, h: 0.8, fontSize: 14, color: K.ink, valign: "middle" });
  });
  T(s, "Retroiluminado = la luz sale por detrás de la letra, no por un tubo en el frente", { x: 0.55, y: 6.4, w: 12.2, h: 0.35, fontSize: 13, color: K.muted });
  notas(s, "Luciano", "0:45", "6:15",
`Las reglas tienen la forma «SI pasa esto, ENTONCES concluyo esto», y cada una dice de dónde sale.

Las dos primeras son del experto, o sea mías. Si falta el entorno, el soporte o las medidas, no se evalúa y se pide el dato. Y si el trazo del logo es muy fino para el neón pero el cliente exige respetar su logo, no lo engrosamos: lo hacemos retroiluminado.

La tercera es una propuesta del grupo, todavía no validada conmigo: el pedido pasa a evaluación solo cuando todos los datos necesarios están confirmados.

En total son ${ST.reglas}: ${exp} del experto, ${prop} propuestas y ${doc} que salen de fichas técnicas o normas.`,
  [["¿Cómo van a validar las propuestas?", "Con sesiones donde el experto resuelve casos en voz alta y comparamos con lo que dice la regla."],
   ["¿Qué es una regla «documental»?", "Una que sale de una ficha técnica o una norma, como el tamaño máximo de la impresora."]]);
}

// ================================================================= 10. Lógica difusa — Luciano 0:40
{
  const s = nueva("Lógica difusa: un ejemplo", "Modelado", "Luciano", "0:40");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 1.35, w: 5.4, h: 0.5, fill: { color: "FFF0F6" }, line: { color: K.neon, width: 1.5 }, rectRadius: 0.25 });
  T(s, "ILUSTRATIVO · a validar con el experto", { x: 0.55, y: 1.35, w: 5.4, h: 0.5, fontSize: 15, bold: true, color: K.neon, align: "center", valign: "middle" });
  // variable lingüística: exposición al clima
  T(s, "Variable lingüística: exposición al clima", { x: 0.55, y: 2.15, w: 6.2, h: 0.4, fontSize: 18, bold: true, color: K.MAT });
  const base = 4.85;
  [["baja", 0.7, K.INT], ["media", 2.35, K.MAT], ["alta", 4.0, K.MAN]].forEach(([nm, x, c]) => {
    s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x, y: 3.05, w: 2.6, h: base - 3.05, fill: { color: c, transparency: 72 }, line: { color: c, width: 2 } });
    T(s, nm, { x: x + 0.75, y: 2.7, w: 1.1, h: 0.32, fontSize: 15, bold: true, color: c, align: "center" });
  });
  s.addShape(pres.shapes.LINE, { x: 0.6, y: base, w: 6.2, h: 0, line: { color: K.ink, width: 1.25, endArrowType: "triangle" } });
  T(s, "más sol y lluvia →   (rangos a definir con el experto)", { x: 0.6, y: base + 0.1, w: 6.2, h: 0.35, fontSize: 13, italic: true, color: K.muted });
  T(s, "Un valor puede ser «media» y «alta» a la vez, con distinto grado (de 0 a 1).", { x: 0.55, y: 5.55, w: 6.3, h: 0.7, fontSize: 15, color: K.ink });
  // regla
  caja(s, 7.25, 2.15, 5.5, 2.75, K.dark, K.dark);
  T(s, "Regla difusa de ejemplo", { x: 7.55, y: 2.3, w: 4.9, h: 0.4, fontSize: 14, bold: true, color: K.cyan });
  T(s, [
    { text: "SI ", options: { bold: true, color: K.cyan } }, { text: "la exposición es ", options: {} }, { text: "ALTA", options: { bold: true, color: K.neon, breakLine: true } },
    { text: "Y ", options: { bold: true, color: K.cyan } }, { text: "el peso está ", options: {} }, { text: "EN EL LÍMITE", options: { bold: true, color: K.neon, breakLine: true } },
    { text: "ENTONCES ", options: { bold: true, color: K.cyan } }, { text: "el riesgo de la instalación es ", options: {} }, { text: "ALTO", options: { bold: true, color: K.neon } },
  ], { x: 7.55, y: 2.8, w: 4.95, h: 1.95, fontSize: 20, color: "FFFFFF", valign: "top", paraSpaceAfter: 10 });
  T(s, "Entradas tomadas de los PI: exposición (Lautaro) y exceso de peso (Luciano). La salida «riesgo» la propusimos nosotros.",
    { x: 7.25, y: 5.1, w: 5.5, h: 0.7, fontSize: 13, color: K.muted });
  notas(s, "Luciano", "0:40", "6:55",
`La lógica difusa la mostramos como ejemplo ilustrativo, sin validar. Sirve para lo que no es «sí o no». Un frente al sol sin alero está más expuesto que uno bajo una marquesina. Entonces la exposición se describe con palabras: baja, media o alta, y cada caso pertenece a cada una con un grado de 0 a 1. Eso es una variable lingüística.

Regla de ejemplo: si la exposición es alta y el peso está en el límite, el riesgo es alto. La salida «riesgo» la propusimos nosotros; los rangos los vamos a definir conmigo en el PI3.`,
  [["¿Por qué no la implementaron todavía?", "Porque no inventamos rangos: las funciones de pertenencia se van a relevar con el experto."],
   ["¿Reemplaza a las reglas normales?", "No: lo imposible sigue en reglas nítidas (un metro no entra en 40 cm); lo difuso sirve para ordenar alternativas."]]);
}

// ================================================================= 11. Neo4j — Luciano 0:55
pres.addSection({ title: "Neo4j y demo" });
{
  const s = nueva("Neo4j: el modelo convertido en grafo", "Neo4j y demo", "Luciano", "0:55");
  // trozo real del grafo de CU1
  const xs = [1.45, 3.95, 6.45, 8.95, 11.45], y = 1.95, NW = 1.85, NH = 0.85;
  const nn = [
    nodo(s, xs[0], y, NW, NH, [{ text: "Cartel", options: { breakLine: true } }, { text: "CU1", options: { fontSize: 13, bold: false, color: K.muted } }], "COM"),
    nodo(s, xs[1], y, NW, NH, [{ text: "Geometría", options: { breakLine: true } }, { text: "1000 mm", options: { fontSize: 13, bold: false, color: K.muted } }], "MAN"),
    nodo(s, xs[2], y, NW, NH, [{ text: "Límite", options: { breakLine: true } }, { text: "cama 400 mm", options: { fontSize: 13, bold: false, color: K.muted } }], "MAN"),
    nodo(s, xs[3], y, NW, NH, [{ text: "Conflicto", options: { breakLine: true } }, { text: "ExcedeCama", options: { fontSize: 13, bold: false, color: K.muted } }], "COM"),
    nodo(s, xs[4], y, NW, NH, [{ text: "Alternativa", options: { breakLine: true } }, { text: "Segmentación", options: { fontSize: 13, bold: false, color: K.muted } }], "MAN"),
  ];
  ["TIENE", "VIOLA", "GENERA", "EXIGE"].forEach((t, i) => {
    flecha(s, xs[i] + NW / 2 + 0.03, y, xs[i + 1] - NW / 2 - 0.03, y, "4A5568", 1.75);
    T(s, t, { x: xs[i] + NW / 2, y: y - 0.62, w: 2.5 - NW, h: 0.3, fontSize: 12, bold: true, color: i ? K.neon : K.muted, align: "center" });
  });
  T(s, [{ text: "Las relaciones en rosa no se cargaron a mano: ", options: { bold: true } }, { text: "las creó la regla MAN-R3." }],
    { x: 0.55, y: 2.6, w: 12.2, h: 0.35, fontSize: 14, color: K.ink, align: "center" });
  // consulta
  T(s, "Consulta en Cypher (el lenguaje de Neo4j)", { x: 0.55, y: 3.3, w: 6, h: 0.35, fontSize: 15, bold: true, color: K.muted });
  codigo(s, "MATCH (k:Conflicto {caso:'CU1'})\n      -[e:EXIGE]->(alt)\nRETURN k.tipo, k.detalle,\n       alt.nombre, e.regla", 0.55, 3.75, 5.6, 1.5, 15);
  T(s, "«Buscá el conflicto del caso CU1, qué exige y qué regla lo creó»", { x: 0.55, y: 5.35, w: 5.6, h: 0.35, fontSize: 14, italic: true, color: K.muted });
  T(s, "Resultado real", { x: 6.55, y: 3.3, w: 6, h: 0.35, fontSize: 15, bold: true, color: K.muted });
  tabla(s, [["conflicto", "detalle", "alternativa", "regla"],
            ["ExcedeCama", "1000 mm > 400 mm de cama", "SegmentacionModular", { text: "MAN-R3", options: { bold: true, color: K.neon } }]],
    { x: 6.55, y: 3.75, w: 6.2, colW: [1.35, 2.15, 1.85, 0.85], rowH: 0.55, fontSize: 13 });
  T(s, `En total: ${ST.frames} frames · ${ST.reglas} reglas · ${ST.instancias} instancias · Neo4j 5.21 en Docker`,
    { x: 6.55, y: 5.0, w: 6.2, h: 0.6, fontSize: 15, color: K.ink });
  T(s, "Neo4j = base de datos que guarda nodos y relaciones, igual que nuestra red.", { x: 0.55, y: 6.2, w: 12.2, h: 0.35, fontSize: 14, color: K.muted });
  notas(s, "Luciano", "0:55", "7:50",
`Todo esto lo cargamos en Neo4j, que es una base de datos de grafos: guarda nodos y relaciones, igual que nuestra red. Los frames, las reglas y los casos quedan en el mismo grafo: ${ST.frames} frames, ${ST.reglas} reglas y ${ST.instancias} instancias.

Arriba ven un pedazo del caso del café: el cartel tiene una geometría de 1000 milímetros, que viola el límite de la cama de 400; eso genera el conflicto ExcedeCama, que exige segmentar. Esas tres relaciones en rosa no las cargamos a mano: las creó la regla MAN-R3.

La consulta está en Cypher, el lenguaje de Neo4j. Se lee casi en castellano: buscá el conflicto del caso CU1 y lo que exige, y devolvé qué regla lo creó. Así cada conclusión queda rastreable.`,
  [["¿Las reglas están dentro de Neo4j?", "Sí: cada regla es una consulta Cypher y además un nodo; cada relación que crea guarda el nombre de la regla."],
   ["¿Por qué Neo4j y no una base relacional?", "Porque el modelo ya es un grafo de conceptos y relaciones, y se consulta recorriendo caminos."]]);
}

// ================================================================= 12. Demo 1 — Matías 0:50
{
  const s = nueva("Demo 1 · El pedido espera hasta tener el dato", "Neo4j y demo", "Matías", "0:50");
  [["¿Por qué no se puede evaluar?", "falta el soporte; hay una pregunta abierta al cliente"],
   ["Materiales responde con su regla R-MI-01", "sin soporte no se evalúa → el faltante es bloqueante"]].forEach(([t, d], i) => {
    const y = 1.6 + i * 1.5;
    circulo(s, 0.55, y, 0.65, String(i + 1), K.INT, 20);
    T(s, t, { x: 1.4, y: y - 0.02, w: 4.7, h: 0.4, fontSize: 18, bold: true, valign: "top" });
    T(s, d, { x: 1.4, y: y + 0.42, w: 4.7, h: 0.5, fontSize: 15, color: K.muted, valign: "top" });
  });
  codigo(s, "bash neo4j/demo.sh", 0.55, 4.45, 5.4, 0.6, 15);
  T(s, "En vivo en la terminal. Si falla la conexión: esta salida real o el video.", { x: 0.55, y: 5.2, w: 5.4, h: 0.7, fontSize: 14, italic: true, color: K.muted });
  T(s, "Salida real (cypher-shell)", { x: 6.4, y: 1.45, w: 6, h: 0.35, fontSize: 15, bold: true, color: K.muted });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.4, y: 1.85, w: 6.35, h: 3.95, fill: { color: K.dark }, line: { color: K.dark }, rectRadius: 0.08 });
  T(s, [
    { text: "Paso 1 · ¿por qué P-01 no avanza?", options: { color: K.cyan, bold: true, breakLine: true } },
    { text: "estado     pendiente_de_aclaracion", options: { breakLine: true } },
    { text: "faltantes  D4 soporte_y_montaje", options: { breakLine: true } },
    { text: "           (criticidad=sin_clasificar)", options: { breakLine: true } },
    { text: "pregunta   A4: ¿Sobre qué pared va", options: { breakLine: true } },
    { text: "           y cómo es esa superficie?", options: { breakLine: true } },
    { text: "consulta   Q1 -> Materiales (pendiente)", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "Paso 2 · Materiales responde Q1", options: { color: K.cyan, bold: true, breakLine: true } },
    { text: "D4 soporte_y_montaje -> ", options: {} }, { text: "bloqueante", options: { color: K.neon, bold: true, breakLine: true } },
    { text: "regla R-MI-01", options: {} },
  ], { x: 6.65, y: 2.0, w: 5.9, h: 3.7, fontFace: "Consolas", fontSize: 14, color: "E2E8F0", valign: "top" });
  notas(s, "Matías", "0:50", "8:40",
`[Compartir la terminal y correr: bash neo4j/demo.sh. Mostrar solo los pasos 01, 02, 05 y 12; después del 12, cortar con Ctrl+C y volver a las slides.]

Ahora la demo en vivo. Arrancamos con los casos cargados y ninguna regla aplicada.

Primer paso: le pregunto a la base por qué el pedido del café no se puede evaluar. Responde: falta el soporte, hay una pregunta pendiente para el cliente y una consulta abierta a Materiales.

Segundo paso: Materiales responde con su regla R-MI-01: bloqueante. O sea, el sistema frena y no inventa el dato. Lo que ven en la slide es la salida real, por si se cae la conexión.`,
  [["¿Qué pasa si se cae Neo4j durante la demo?", "Tenemos la salida real en estas slides y un video de respaldo."],
   ["¿Por qué decide Materiales y no Interpretación si el faltante bloquea?", "Porque ese conocimiento es de Materiales: cada submódulo decide sobre lo suyo."]]);
}

// ================================================================= 13. Demo 2 — Matías 0:50
{
  const s = nueva("Demo 2 · De la respuesta a la recomendación", "Neo4j y demo", "Matías", "0:50");
  [["Llega la respuesta (simulada) → se crea la ficha FR-01", "interior · «Café Andino» · ≈ 1 m · pared de mampostería"],
   ["Recorrido completo del caso", "cada submódulo aporta su parte"]].forEach(([t, d], i) => {
    const y = 1.55 + i * 1.25;
    circulo(s, 0.55, y, 0.65, String(i + 3), K.INT, 20);
    T(s, t, { x: 1.4, y: y - 0.05, w: 11.3, h: 0.4, fontSize: 18, bold: true });
    T(s, d, { x: 1.4, y: y + 0.38, w: 11.3, h: 0.4, fontSize: 15, color: K.muted });
  });
  const col = (t, c) => ({ text: t, options: { bold: true, color: c } });
  tabla(s, [
    ["", "submódulo", "resultado (paso 12, salida real)"],
    ["1", col("Interpretación", K.INT), "P-01 listo_para_evaluacion"],
    ["2", col("Ficha", K.COM), "FR-01: entorno = interior; largo ≈ 1 m; soporte = pared de mampostería"],
    ["3", col("Materiales", K.MAT), "exposición baja → apto (R-MI-10)"],
    ["4", col("Fabricación", K.MAN), "ExcedeCama: 1000 mm > 400 mm de cama"],
    ["5", col("Recomendación", K.COM), [{ text: "Segmentación modular + refuerzo de fijación · " }, { text: "decide: fabricante", options: { bold: true, color: K.neon } }]],
  ].map((f) => f.map((c) => (Array.isArray(c) ? { text: c } : c))), { x: 0.55, y: 4.05, w: 12.2, colW: [0.5, 2.2, 9.5], rowH: 0.45, fontSize: 15 });
  notas(s, "Matías", "0:50", "9:30",
`Ahora simulamos que el cliente responde. Con el soporte confirmado se cumple la regla de suficiencia y se crea la ficha FR-01: es interior, dice «Café Andino», mide un metro y va sobre una pared de mampostería.

Y el último paso muestra el recorrido completo: Interpretación deja el pedido listo; Materiales dice apto porque la exposición es baja; Fabricación detecta que 1000 milímetros no entran en 400; y la recomendación es segmentar y reforzar la fijación. La última fila lo dice: decide el fabricante.

[Ctrl+C en la terminal y volver a las slides.]`,
  [["¿Dónde está el LLM en la demo?", "Todavía no está conectado: en el diseño solo traduce el mensaje a datos y redacta la explicación a partir de esta traza; no decide."],
   ["¿Y el caso 2?", "Corre igual en el paso 13 de la demo: apto con condiciones, PETG y letra por letra."]]);
}

// ================================================================= 14. Pendientes y cierre — Lautaro 0:30
pres.addSection({ title: "Cierre" });
{
  const s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "Cierre" });
  chipHabla(s, "Lautaro", "0:30", true);
  T(s, "Qué nos falta", { x: 0.8, y: 0.45, w: 9.5, h: 0.8, fontSize: 36, bold: true, color: "FFFFFF", valign: "middle" });
  [["Mi PI2", "hoy Materiales se modeló desde mi PI1"],
   ["Números que no inventamos", "protección al agua, peso por soporte, cuándo pedir verificación estructural"],
   ["Validar con el experto", "las reglas propuestas y la lógica difusa (PI3)"]].forEach(([t, d], i) => {
    const y = 1.85 + i * 1.2;
    circulo(s, 0.8, y, 0.6, String(i + 1), K.neon, 18);
    T(s, t, { x: 1.65, y: y - 0.05, w: 10.5, h: 0.45, fontSize: 22, bold: true, color: "FFFFFF" });
    T(s, d, { x: 1.65, y: y + 0.4, w: 10.5, h: 0.4, fontSize: 16, color: "C9D1E0" });
  });
  T(s, "¡Gracias! ¿Preguntas?", { x: 0.8, y: 5.75, w: 8, h: 0.8, fontSize: 34, bold: true, color: K.cyan });
  T(s, "Anexo: red completa, diagramas de PI1 y PI2, jerarquía de frames y grafos de los casos", { x: 0.8, y: 6.6, w: 11.5, h: 0.35, fontSize: 13, color: K.gray });
  notas(s, "Lautaro", "0:30", "10:00",
`Para cerrar, lo que nos falta. Uno: mi PI2; hoy mi parte sale del PI1. Dos: los números que no quisimos inventar, como qué protección contra el agua hace falta, cuánto peso aguanta cada soporte o desde qué tamaño pedir una verificación estructural. Y tres: validar con Luciano las reglas propuestas y definir la lógica difusa.

Gracias, quedamos para preguntas.`,
  [["¿Cómo saben todo lo que falta?", "Está marcado como PENDIENTE en el grafo y sale con una consulta (paso 19 de la demo completa)."],
   ["¿Cuándo va a estar validado?", "En el PI3 y la PG1, con sesiones con el experto sobre casos reales."]]);
}

// ================================================================= Anexos (solo si preguntan)
pres.addSection({ title: "Anexo" });
function anexo(titulo, nota) {
  const s = nueva(titulo, "Anexo");
  T(s, "ANEXO", { x: 10.85, y: 0.48, w: 1.95, h: 0.5, fontSize: 14, bold: true, color: K.gray, align: "center", valign: "middle" });
  s.addNotes("ANEXO — no se presenta; solo para responder preguntas.\n\n" + nota);
  return s;
}
{
  const s = anexo("Red semántica integrada completa", "Todos los frames no hoja y sus relaciones, tal como están en Neo4j. Colores = submódulo; borde punteado = abstracto, externo o [PENDIENTE].");
  fit(s, "salida/img/red_semantica_completa.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("Red semántica integrada: núcleo", "Núcleo de la red integrada con los verbos reales del grafo (versión de la presentación larga).");
  fit(s, "salida/img/red_semantica_integrada.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("PI1: proceso experto de cada submódulo", "Diagramas de procesos del PI1 de cada integrante: el punto de partida del modelado (qué mira el experto, en qué orden, qué decide).");
  [["pi1/img/PI1_Matias_diagrama_procesos.png", "Interpretación (Matías)", K.INT],
   ["pi1/img/PI1_Lautaro_diagrama_procesos.png", "Materiales e instalación (Lautaro)", K.MAT],
   ["pi1/img/PI1_Luciano_diagrama_procesos.png", "Fabricación y rediseño (Luciano)", K.MAN]].forEach(([p, t, c], i) => {
    const x = 0.55 + i * 4.12;
    T(s, t, { x, y: 1.2, w: 3.95, h: 0.35, fontSize: 14, bold: true, color: c, align: "center" });
    fit(s, p, x, 1.6, 3.95, 5.3);
  });
}
{
  const s = anexo("PI2: redes semánticas individuales", "Redes conceptuales de los PI2 de Matías y de Luciano antes de integrar. Lautaro todavía no tiene PI2.");
  T(s, "Interpretación (Matías)", { x: 0.55, y: 1.2, w: 8.3, h: 0.35, fontSize: 14, bold: true, color: K.INT });
  fit(s, "pi2/img/PI2_Matias_fig1_red_semantica_conceptual.png", 0.55, 1.6, 8.3, 5.3);
  T(s, "Fabricación y rediseño (Luciano)", { x: 9.1, y: 1.2, w: 3.7, h: 0.35, fontSize: 14, bold: true, color: K.MAN });
  fit(s, "pi2/img/PI2_Luciano_red_semantica_conceptual.png", 9.1, 1.6, 3.7, 5.3);
}
{
  const s = anexo("PI2 de Matías: casos instanciados", "Redes instanciadas del PI2 de Matías: P-01 (Café Andino, base de CU1) y P-02 (letras corpóreas, base de CU2).");
  T(s, "P-01 · Café Andino", { x: 0.55, y: 1.2, w: 6, h: 0.35, fontSize: 14, bold: true, color: K.INT });
  fit(s, "pi2/img/PI2_Matias_fig2_red_instanciada_P01.png", 0.45, 1.55, 12.4, 2.55);
  T(s, "P-02 · Letras corpóreas", { x: 0.55, y: 4.15, w: 6, h: 0.35, fontSize: 14, bold: true, color: K.INT });
  fit(s, "pi2/img/PI2_Matias_fig3_red_instanciada_P02.png", 0.45, 4.5, 12.4, 2.45);
}
{
  const s = anexo("PI2 de Luciano: casos instanciados", "Redes instanciadas del PI2 de Luciano: caso 1 (trazo fino con alta fidelidad al logo) y caso 2.");
  T(s, "Caso 1", { x: 0.55, y: 1.2, w: 6, h: 0.35, fontSize: 14, bold: true, color: K.MAN, align: "center" });
  fit(s, "pi2/img/PI2_Luciano_red_instanciada_caso1.png", 0.55, 1.6, 6, 5.3);
  T(s, "Caso 2", { x: 6.75, y: 1.2, w: 6, h: 0.35, fontSize: 14, bold: true, color: K.MAN, align: "center" });
  fit(s, "pi2/img/PI2_Luciano_red_instanciada_caso2.png", 6.75, 1.6, 6, 5.3);
}
{
  const s = anexo("Jerarquía de frames (generada desde Neo4j)", "Herencia ES_UN y composición ES_PARTE_DE tal como están en la base: MATCH p=(:Frame)-[:ES_UN|ES_PARTE_DE]->(:Frame) RETURN p.");
  fit(s, "salida/img/jerarquia_frames.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("CU1 instanciado en Neo4j", "Grafo del caso CU1 al final: pedido incompleto → consulta a Materiales → respuesta (dato de prueba simulado) → ficha → dictamen apto → ExcedeCama → segmentación + refuerzo.");
  fit(s, "salida/img/cu1_instanciado.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("CU2 instanciado en Neo4j", "CU2: contradicción texto–foto resuelta, plazo obligatorio, exterior expuesto → apto con condiciones, PETG (MAN-R7), 3000 mm → segmentación letra por letra + refuerzo.");
  fit(s, "salida/img/cu2_instanciado.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("Filtro por restricción del cliente", "Casos L-C1 y L-C3 del PI2 de Luciano: la restricción obligatoria del cliente rechaza una alternativa y admite la otra (MAN-R6, MAN-R9).");
  fit(s, "salida/img/filtro_luciano.png", 0.45, 1.4, 12.4, 5.3);
}

pres.writeFile({ fileName: OUT }).then(async () => {
  await applyTheme(OUT, THEME);
  console.log("✓", OUT);
});
