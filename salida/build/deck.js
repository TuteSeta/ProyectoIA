// Genera salida/presentacion.pptx — presentación de modelado, Grupo 11 (5/10/2026).
// Versión simple: una idea por slide, poco texto y, en las notas, un guion para leer tal cual
// (en una frase · qué decir · palabras que hay que saber · si preguntan).
// Uso: node salida/build/deck.js
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("./apply_theme.js");

const ROOT = path.resolve(__dirname, "..", "..");
const IMG = (p) => path.join(ROOT, p);
const ST = JSON.parse(fs.readFileSync(path.join(__dirname, "stats.json"), "utf8"));
const OUT = path.join(ROOT, "salida", "presentacion.pptx");

// ---------------------------------------------------------------- paleta: carbón + neón, un color por submódulo
const K = {
  dark: "141824", ink: "1A202C", muted: "5A6578", line: "CBD5E0", soft: "F4F6FA", gray: "8A94A6",
  neon: "FF2E88", cyan: "22D3EE", ok: "2F855A", okf: "E6F4EA", warn: "B7791F", warnf: "FDF3DC", bad: "C53030", badf: "FDE8E8",
  INT: "2B6CB0", MAT: "2A9D8F", MAN: "D9480F", COM: "6B46C1",
  INTf: "E3EEF9", MATf: "E0F4F1", MANf: "FDEBDD", COMf: "EEE8FA",
};
const THEME = {
  name: "Neon Carbon",
  headFontFace: "Calibri", bodyFontFace: "Calibri",
  colors: { dk1: K.ink, lt1: "FFFFFF", dk2: K.dark, lt2: K.soft, accent1: K.neon, accent2: K.cyan, accent3: K.INT,
            accent4: K.MAT, accent5: K.MAN, accent6: K.COM, hlink: K.INT, folHlink: K.COM },
};
const QUIEN = { "Matías": K.INT, "Lautaro": K.MAT, "Luciano": K.MAN };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Asistente para evaluar pedidos de cartelería — Grupo 11";
pres.author = "Grupo 11 — Zarandon, Quiros, Marquesini";
pres.theme = { headFontFace: "Calibri", bodyFontFace: "Calibri" };

const FOOT = "Grupo 11 · UTN FRM 5K9 · Actividad de modelado · 5/10/2026";
pres.defineSlideMaster({
  title: "CONTENIDO",
  background: { color: "FFFFFF" },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.55, y: 0.35, w: 10.1, h: 0.8, fontSize: 34, bold: true,
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
function chipHabla(slide, quien, tiempo) {
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
// Notas del orador pensadas para quien estudió poco: primero la idea en una frase, después el texto para decir.
function notas(s, n) {
  const pal = (n.palabras || []).map(([a, b]) => `- ${a}: ${b}`).join("\n");
  const pre = (n.preguntas || []).map(([q, a]) => `- ${q}\n  → ${a}`).join("\n");
  s.addNotes(
    `HABLA: ${n.quien} · ${n.tiempo} (al terminar, el reloj marca ${n.reloj})\n\n` +
    `EN UNA FRASE: ${n.frase}\n\n` +
    `QUÉ DECIR (se puede leer tal cual):\n${n.guion}` +
    (pal ? `\n\nPALABRAS QUE TENÉS QUE SABER:\n${pal}` : "") +
    (pre ? `\n\nSI PREGUNTAN:\n${pre}` : ""));
}
function nodo(slide, cx, cy, w, h, txt, sub, o = {}) {
  const col = { INT: [K.INT, K.INTf], MAT: [K.MAT, K.MATf], MAN: [K.MAN, K.MANf], COM: [K.COM, K.COMf], GRAY: [K.muted, K.soft] }[sub];
  const x = cx - w / 2, y = cy - h / 2;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: col[1] }, line: { color: col[0], width: 1.75 }, rectRadius: 0.1 });
  T(slide, txt, Object.assign({ x, y, w, h, fontSize: 15, bold: true, color: K.ink, align: "center", valign: "middle" }, o));
  return { cx, cy, w, h };
}
function borde(a, dx, dy) {
  const sx = dx === 0 ? Infinity : (a.w / 2) / Math.abs(dx);
  const sy = dy === 0 ? Infinity : (a.h / 2) / Math.abs(dy);
  const s = Math.min(sx, sy);
  return [a.cx + dx * s, a.cy + dy * s];
}
function conectar(slide, a, b, etiqueta, pos = "centro", o = {}) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  const [x1, y1] = borde(a, dx, dy);
  const [x2, y2] = borde(b, -dx, -dy);
  flecha(slide, x1, y1, x2, y2, "4A5568", 1.5);
  if (!etiqueta) return;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const w = o.w || Math.max(0.6, etiqueta.length * 0.078 + 0.14);
  if (pos === "der") T(slide, etiqueta, { x: mx + 0.08, y: my - 0.16, w, h: 0.32, fontSize: 13, italic: true, color: K.muted, valign: "middle" });
  else T(slide, etiqueta, { x: mx - w / 2, y: my - 0.16, w, h: 0.32, fontSize: 12, italic: true, color: K.muted, align: "center", valign: "middle",
    fill: { color: "FFFFFF" } });
}
function codigo(slide, txt, x, y, w, h, fs = 15) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: K.dark }, line: { color: K.dark }, rectRadius: 0.08 });
  T(slide, txt, { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: h - 0.3, fontFace: "Courier New", fontSize: fs, color: "E2E8F0", valign: "top" });
}
function tabla(slide, filas, o, colorHead = K.dark) {
  const rows = filas.map((f, i) => f.map((c) => (typeof c === "object" && !Array.isArray(c) ? c : { text: c, options: i === 0
    ? { bold: true, color: "FFFFFF", fill: { color: colorHead } } : { color: K.ink, fill: { color: i % 2 ? "FFFFFF" : K.soft } } })));
  slide.addTable(rows, Object.assign({ fontSize: 15, border: { type: "solid", pt: 0.5, color: K.line }, valign: "middle", margin: 0.08 }, o));
}
function pildora(slide, x, y, w, txt, color, fs = 13) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.42, fill: { color }, line: { color }, rectRadius: 0.21 });
  T(slide, txt, { x, y, w, h: 0.42, fontSize: fs, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
}
// glosario al pie: una línea en gris
function pie(slide, txt) { T(slide, txt, { x: 0.55, y: 6.45, w: 12.2, h: 0.4, fontSize: 14, color: K.muted }); }

// ================================================================= 1. Portada — Luciano 0:20
pres.addSection({ title: "Problema y casos" });
{
  const s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "Problema y casos" });
  T(s, "ACTIVIDAD DE MODELADO · GRUPO 11", { x: 0.8, y: 1.3, w: 9, h: 0.4, fontSize: 14, bold: true, color: K.cyan, charSpacing: 2 });
  T(s, "Un asistente para evaluar pedidos de carteles luminosos",
    { x: 0.8, y: 1.85, w: 10.8, h: 1.7, fontSize: 44, bold: true, color: "FFFFFF", valign: "top" });
  T(s, "Cómo pasamos lo que sabe el fabricante a un grafo en Neo4j", { x: 0.8, y: 3.65, w: 10.5, h: 0.5, fontSize: 22, italic: true, color: "C9D1E0" });
  [["Matías Zarandon", "Interpretación del pedido", K.INT], ["Lautaro Quiros", "Materiales e instalación", K.MAT],
   ["Luciano Marquesini", "Fabricación y rediseño · experto", K.MAN]].forEach(([n, r, c], i) => {
    const x = 0.8 + i * 3.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.85, w: 3.6, h: 0.09, fill: { color: c }, line: { color: c }, rectRadius: 0.045,
      shadow: { type: "outer", color: c, blur: 8, offset: 0, angle: 90, opacity: 0.9 } });
    T(s, n, { x, y: 5.05, w: 3.6, h: 0.4, fontSize: 19, bold: true, color: "FFFFFF" });
    T(s, r, { x, y: 5.45, w: 3.6, h: 0.35, fontSize: 15, color: "AEB8CC" });
  });
  T(s, "UTN FRM · 5K9 · Inteligencia Artificial · Prof. Matilde Césari y María Eugenia Stefanoni · 5/10/2026",
    { x: 0.8, y: 6.6, w: 11.8, h: 0.35, fontSize: 12, color: K.gray });
  notas(s, { quien: "Luciano", tiempo: "0:20", reloj: "0:20",
    frase: "Somos el Grupo 11 y armamos un asistente que ayuda a un fabricante de carteles a evaluar pedidos.",
    guion: `Hola, somos el Grupo 11: Matías, Lautaro y yo, Luciano. Armamos un asistente que ayuda a un fabricante de carteles luminosos a evaluar los pedidos que le llegan. Hoy les mostramos cómo modelamos ese conocimiento, paso a paso, hasta llevarlo a Neo4j.`,
    preguntas: [["¿Por qué cartelería?", "Porque Luciano fabrica carteles: tenemos un experto real para sacar el conocimiento."]] });
}

// ================================================================= 2. Problema — Luciano 1:00
{
  const s = nueva("Hoy cada pedido se evalúa «a ojo»", "Problema y casos", "Luciano", "1:00");
  caja(s, 0.55, 1.5, 5.6, 4.3, K.dark, K.dark);
  T(s, "HOY", { x: 0.9, y: 1.75, w: 4, h: 0.4, fontSize: 15, bold: true, color: K.cyan, charSpacing: 2 });
  T(s, "«Quiero un neón para la pared, de un metro más o menos»", { x: 0.9, y: 2.3, w: 4.9, h: 1.3, fontSize: 26, italic: true, color: "FFFFFF", valign: "top" });
  T(s, "El fabricante decide con experiencia que no está escrita en ningún lado.",
    { x: 0.9, y: 4.0, w: 4.9, h: 1.3, fontSize: 19, color: "C9D1E0", valign: "top" });
  flecha(s, 6.3, 3.65, 6.85, 3.65, K.ink, 2.5);
  T(s, "CON EL ASISTENTE", { x: 7.05, y: 1.75, w: 5.5, h: 0.4, fontSize: 15, bold: true, color: K.neon, charSpacing: 2 });
  [["?", "Pregunta lo que falta, no lo supone"], ["!", "Avisa lo que no se puede instalar o fabricar"], ["→", "Propone alternativas y explica por qué"]].forEach(([ic, t], i) => {
    const y = 2.35 + i * 1.15;
    circulo(s, 7.05, y, 0.7, ic, K.neon, 22);
    T(s, t, { x: 8.0, y, w: 4.8, h: 0.7, fontSize: 20, valign: "middle" });
  });
  caja(s, 0.55, 6.05, 12.2, 0.7, K.soft, K.soft);
  T(s, [{ text: "Decide el fabricante. ", options: { bold: true, color: K.neon } },
        { text: "El LLM (tipo ChatGPT) solo entiende el mensaje del cliente y redacta la explicación." }],
    { x: 0.8, y: 6.05, w: 11.8, h: 0.7, fontSize: 17, valign: "middle" });
  notas(s, { quien: "Luciano", tiempo: "1:00", reloj: "1:20",
    frase: "Hoy el fabricante decide a ojo; el asistente pregunta, avisa y propone, pero decide el fabricante.",
    guion: `En un taller como el mío llega un mensaje así: «quiero un neón para la pared, de un metro más o menos». Con eso hay que decidir tres cosas: si alcanza la información, si el cartel va a aguantar en ese lugar y si lo podemos fabricar. Hoy eso se decide a ojo, con experiencia que no está escrita.

El asistente ayuda en tres cosas: pregunta lo que falta en vez de suponerlo, avisa lo que no se puede instalar o fabricar, y propone alternativas explicando por qué.

Y algo importante que pidió la cátedra: el que decide es el fabricante. El modelo de lenguaje, tipo ChatGPT, solo entiende el mensaje del cliente y redacta la explicación.`,
    palabras: [["LLM", "modelo de lenguaje, como ChatGPT. En nuestro sistema no decide nada."]],
    preguntas: [["¿Por qué no usar directamente ChatGPT?", "Porque puede inventar datos; acá cada conclusión sale de una regla y se puede rastrear."],
                ["¿Quién decide al final?", "El fabricante: el sistema recomienda y justifica."]] });
}

// ================================================================= 3. Submódulos — Lautaro 1:00
{
  const s = nueva("Tres partes, tres preguntas", "Problema y casos", "Lautaro", "1:00");
  caja(s, 0.55, 2.35, 1.75, 1.5, K.soft, K.line);
  T(s, [{ text: "Pedido", options: { bold: true, breakLine: true } }, { text: "texto + foto", options: { fontSize: 14, color: K.muted } }],
    { x: 0.55, y: 2.35, w: 1.75, h: 1.5, fontSize: 19, align: "center", valign: "middle" });
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
    T(s, p, { x: X[i] + 0.2, y: 3.1, w: W - 0.4, h: 1.2, fontSize: 19, italic: true, valign: "top" });
  });
  flecha(s, 2.35, 3.1, 2.7, 3.1, K.ink, 2.5);
  [["ficha", 0], ["dictamen", 1]].forEach(([t, i]) => {
    const x1 = X[i] + W, x2 = X[i + 1];
    flecha(s, x1 + 0.04, 3.1, x2 - 0.04, 3.1, K.ink, 2.5);
    T(s, t, { x: x1 - 0.1, y: 2.7, w: x2 - x1 + 0.2, h: 0.3, fontSize: 12, bold: true, color: K.ink, align: "center" });
  });
  flecha(s, X[2] + W / 2, 4.5, X[2] + W / 2, 5.05, K.ink, 2.5);
  caja(s, 9.25, 5.1, 3.55, 0.9, K.dark, K.dark);
  T(s, [{ text: "Recomendación", options: { bold: true, breakLine: true } }, { text: "→ decide el fabricante", options: { color: K.cyan } }],
    { x: 9.45, y: 5.1, w: 3.2, h: 0.9, fontSize: 16, color: "FFFFFF", valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 4.2, y: 4.5, w: 0, h: 0.95, line: { color: K.neon, width: 2, dashType: "dash", beginArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 4.2, y: 5.45, w: 3.2, h: 0, line: { color: K.neon, width: 2, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: 7.4, y: 4.5, w: 0, h: 0.95, line: { color: K.neon, width: 2, dashType: "dash" } });
  T(s, "¿falta un dato? se le pregunta al cliente, nunca se inventa", { x: 1.0, y: 5.6, w: 7.2, h: 0.4, fontSize: 16, italic: true, color: K.neon, align: "center" });
  pie(s, "Ficha = el pedido ordenado y sin dudas · Dictamen = si el cartel sirve para ese lugar (apto / con condiciones / no apto)");
  notas(s, { quien: "Lautaro", tiempo: "1:00", reloj: "2:20",
    frase: "El sistema tiene tres partes, una por integrante, que se pasan la ficha y el dictamen.",
    guion: `El sistema tiene tres partes, una por integrante, y cada una responde una pregunta.

Interpretación, de Matías: ¿qué pide realmente el cliente? Su salida es la ficha: el pedido ordenado y sin dudas.

Materiales e instalación, la mía: con esa ficha, ¿el cartel funciona y dura en ese lugar? Sale un dictamen, que puede ser apto, apto con condiciones o no apto.

Fabricación y rediseño, de Luciano: ¿se puede fabricar con lo que tiene el taller? Si no, propone cambios, y eso termina en una recomendación para el fabricante.

La flecha rosa: si a mí me falta un dato importante, no lo invento; vuelve a Interpretación, que se lo pregunta al cliente.`,
    palabras: [["Submódulo", "cada una de las tres partes; cada una tiene su propio conocimiento y sus reglas."],
               ["Ficha", "el pedido ya interpretado: datos confirmados, restricciones del cliente y advertencias."],
               ["Dictamen", "la respuesta de Materiales: apto, apto con condiciones o no apto, con sus motivos."]],
    preguntas: [["¿Por qué tres submódulos y no uno?", "Porque son tres decisiones distintas del experto; se conectan por la ficha y el dictamen."],
                ["¿Qué pasa si Fabricación no encuentra alternativa?", "El caso vuelve a Interpretación para hablar con el cliente (regla MAN-R8)."]] });
}

// ================================================================= 4. Casos de uso — Matías 1:00
{
  const s = nueva("Dos casos de uso guiaron el modelo", "Problema y casos", "Matías", "1:00");
  const cu = [
    ["CU1 · Café Andino", "«Quiero un cartel de neón con el nombre del café, para poner en la pared. Más o menos de un metro.»",
     "Primero pregunta cómo se fija. Después: apto, pero hay que dividirlo en partes", K.INT],
    ["CU2 · Letras para el frente", "«Letras corpóreas con luz para el frente que da a la calle. 3 metros. Sí o sí antes de la inauguración.»",
     "Apto con condiciones: material para exterior (PETG), revisar la marquesina y fabricar letra por letra", K.MAN],
  ];
  cu.forEach(([t, e, o, c], i) => {
    const x = 0.55 + i * 6.25;
    T(s, t, { x, y: 1.45, w: 5.9, h: 0.5, fontSize: 23, bold: true, color: c });
    T(s, "ENTRA", { x, y: 2.05, w: 2, h: 0.3, fontSize: 12, bold: true, color: K.gray, charSpacing: 2 });
    caja(s, x, 2.4, 5.9, 1.55, K.soft, K.soft);
    T(s, e, { x: x + 0.25, y: 2.45, w: 5.4, h: 1.45, fontSize: 18, italic: true, valign: "middle" });
    flecha(s, x + 2.95, 4.05, x + 2.95, 4.5, c, 2.5);
    T(s, "SALE", { x, y: 4.2, w: 2, h: 0.3, fontSize: 12, bold: true, color: c, charSpacing: 2 });
    caja(s, x, 4.6, 5.9, 1.45, "FFFFFF", c, { line: { color: c, width: 2 } });
    T(s, o, { x: x + 0.25, y: 4.65, w: 5.4, h: 1.35, fontSize: 18, bold: true, valign: "middle" });
  });
  pie(s, "Corpóreas = letras con volumen · PETG = plástico de impresión 3D que aguanta sol y calor · Los dos casos pasan por los tres submódulos");
  notas(s, { quien: "Matías", tiempo: "1:00", reloj: "3:20",
    frase: "Modelamos a partir de dos pedidos concretos que pasan por los tres submódulos.",
    guion: `No arrancamos de la teoría sino de dos pedidos concretos.

El primero, el Café Andino: un cliente que no sabe nada técnico pide un neón para la pared, de un metro. El sistema primero tiene que preguntar cómo se fija, y al final dice que es apto pero que hay que dividirlo en partes, porque no entra en la impresora.

El segundo: letras corpóreas, o sea letras con volumen, de 3 metros, para el frente que da a la calle. Sale «apto con condiciones»: un plástico que aguante el sol, revisar la marquesina antes de colgarlas y fabricar letra por letra.

Un dato que nos gusta: el caso 2 lo usamos los tres en nuestros PI2, así que la integración no la inventamos para hoy.`,
    palabras: [["Caso de uso", "una situación concreta, con entrada y salida esperada, que usamos para construir y probar el modelo."]],
    preguntas: [["¿De dónde salen los casos?", "Del PI2 de Matías, armados con situaciones reales que contó Luciano; el caso 2 también está en los PI2 de Lautaro y de Luciano."]] });
}

// ================================================================= 5. CU1 paso a paso — Matías 1:00
{
  const s = nueva("CU1 paso a paso: Café Andino", "Problema y casos", "Matías", "1:00");
  const pasos = [
    ["Entra el pedido", "«neón con el nombre del café, para la pared, de un metro»", "", K.muted],
    ["Interpretación", "¿Adentro o afuera? ¿Cómo se fija? → le pregunta al cliente", "INT-R01 · INT-R02", K.INT],
    ["Materiales", "Sin saber cómo se fija no se evalúa. Con la respuesta*: interior → apto", "R-MI-01 · R-MI-10", K.MAT],
    ["Fabricación", "1 m no entra en la impresora 3D (máx. 40 cm)", "MAN-R3", K.MAN],
    ["Recomendación", "Dividir en módulos y reforzar la unión → decide el fabricante", "", K.COM],
  ];
  const W = 2.2, G = 0.3;
  pasos.forEach(([t, d, r, c], i) => {
    const x = 0.55 + i * (W + G);
    circulo(s, x + W / 2 - 0.35, 1.5, 0.7, String(i + 1), c, 20);
    caja(s, x, 2.45, W, 2.85, i === 0 ? K.soft : "FFFFFF", c, { line: { color: c, width: 2 } });
    T(s, t, { x: x + 0.12, y: 2.6, w: W - 0.24, h: 0.45, fontSize: 18, bold: true, color: c, align: "center" });
    T(s, d, { x: x + 0.15, y: 3.15, w: W - 0.3, h: 1.6, fontSize: 17, italic: i === 0, align: "center", valign: "top" });
    if (r) T(s, r, { x: x + 0.12, y: 4.82, w: W - 0.24, h: 0.35, fontSize: 13, color: K.gray, align: "center" });
    if (i < 4) flecha(s, x + W + 0.03, 3.85, x + W + G - 0.03, 3.85, K.ink, 2);
  });
  T(s, "* La respuesta del cliente sobre la pared es un dato de prueba simulado (está marcado así en el grafo).",
    { x: 0.55, y: 5.65, w: 12.2, h: 0.35, fontSize: 15, italic: true, color: K.muted });
  notas(s, { quien: "Matías", tiempo: "1:00", reloj: "4:20",
    frase: "El pedido no avanza hasta tener el dato que falta; después cada submódulo aporta su parte.",
    guion: `Paso uno: llega el mensaje del cliente.

Paso dos, Interpretación. «La pared» no dice si es adentro o afuera, y falta un dato: cómo se fija. El sistema no supone nada: arma preguntas para el cliente.

¿Ese dato que falta frena todo? Eso no lo decido yo: le pregunto a Materiales, y la regla R-MI-01 de Lautaro dice que sin saber cómo se fija no se evalúa. Entonces el pedido espera.

Paso tres: el cliente responde que es adentro, sobre una pared de ladrillo. Materiales dice: apto.

Paso cuatro, Fabricación: un metro no entra en la impresora 3D, que imprime hasta 40 centímetros.

Paso cinco: se recomienda dividirlo en módulos y reforzar la unión. Y decide el fabricante.`,
    palabras: [["R-MI-01, INT-R01…", "son nombres de reglas: INT = Interpretación, R-MI = Materiales, MAN = Fabricación."]],
    preguntas: [["¿La respuesta del cliente es real?", "La parte de la pared es un dato de prueba simulado y está marcada así en el grafo; el resto sale del PI2 de Matías."],
                ["¿Por qué 40 cm?", "Es el tamaño máximo de la impresora 3D del taller; sale de su ficha técnica."]] });
}

// ================================================================= 6. Metodología — Lautaro 0:45
pres.addSection({ title: "Modelado" });
{
  const s = nueva("Cómo lo construimos: 5 pasos", "Modelado", "Lautaro", "0:45");
  const pasos = [
    ["Experto", "Entrevistas con Luciano: cómo decide", "PI1"],
    ["Red semántica", "Conceptos unidos por verbos", "PI2"],
    ["Frames", "Una ficha con casilleros por concepto", "PI2"],
    ["Reglas", "SI pasa esto… ENTONCES…", "PI2"],
    ["Neo4j", "Todo junto en una base de grafos", "hoy"],
  ];
  const W = 2.2, G = 0.3;
  pasos.forEach(([t, d, e], i) => {
    const x = 0.55 + i * (W + G);
    const c = i === 4 ? K.neon : K.ink;
    caja(s, x, 1.6, W, 3.1, i === 4 ? "FFF0F6" : K.soft, i === 4 ? K.neon : K.line, { line: { color: i === 4 ? K.neon : K.line, width: 1.5 } });
    circulo(s, x + 0.2, 1.8, 0.6, String(i + 1), c, 18);
    T(s, e, { x: x + 1.0, y: 1.8, w: 1.0, h: 0.6, fontSize: 14, bold: true, color: K.muted, align: "right", valign: "middle" });
    T(s, t, { x: x + 0.2, y: 2.65, w: W - 0.3, h: 0.5, fontSize: 21, bold: true, color: c });
    T(s, d, { x: x + 0.2, y: 3.2, w: W - 0.4, h: 1.3, fontSize: 17, color: K.ink, valign: "top" });
    if (i < 4) flecha(s, x + W + 0.03, 3.15, x + W + G - 0.03, 3.15, K.ink, 2);
  });
  caja(s, 0.55, 5.1, 12.2, 0.75, "FFFFFF", K.gray, { line: { color: K.gray, width: 1.25, dashType: "dash" } });
  T(s, [{ text: "6 · Lógica difusa: ", options: { bold: true } }, { text: "la mostramos con un ejemplo; se completa en el PI3" }],
    { x: 0.8, y: 5.1, w: 11.5, h: 0.75, fontSize: 17, color: K.muted, valign: "middle" });
  T(s, [{ text: "Lo que el experto todavía no definió queda marcado " }, { text: "«a validar»", options: { bold: true, color: K.neon } }, { text: ": no inventamos números." }],
    { x: 0.55, y: 6.2, w: 12.2, h: 0.4, fontSize: 17 });
  notas(s, { quien: "Lautaro", tiempo: "0:45", reloj: "5:05",
    frase: "Del experto a la red, de la red a los frames, después las reglas y al final Neo4j.",
    guion: `Ahora, cómo lo construimos. Cinco pasos.

Uno: entrevistas con el experto, que es Luciano. Cómo decide, casos típicos y excepciones. Eso fue el PI1.
Dos: con eso armamos una red semántica: los conceptos y cómo se relacionan.
Tres: cada concepto pasa a ser un frame, que es como una ficha con casilleros.
Cuatro: le sumamos reglas del tipo «si pasa esto, entonces concluyo esto».
Cinco: todo eso lo cargamos en Neo4j.

La lógica difusa la mostramos con un ejemplo, pero se completa en el PI3. Y una regla que seguimos siempre: si el experto todavía no nos dio un número, no lo inventamos; queda marcado «a validar».`,
    palabras: [["PI1 / PI2", "las entregas individuales: PI1 = conocimiento del experto; PI2 = red, frames y reglas."]],
    preguntas: [["¿Qué hicieron cuando faltaba información del experto?", "La dejamos marcada como «a validar» o PENDIENTE en el grafo, y se puede listar con una consulta."]] });
}

// ================================================================= 7. Red semántica — Lautaro 1:15
{
  const s = nueva("Red semántica: se lee como oraciones", "Modelado", "Lautaro", "1:15");
  const C = [1.45, 3.9, 6.35, 8.8, 11.25], R = [1.75, 2.95, 4.15, 5.35];
  const NW = 1.8, NH = 0.62;
  const n = {
    cliente: nodo(s, C[0], R[0], NW, NH, "Cliente", "INT"),
    pedido: nodo(s, C[0], R[1], NW, NH, "Pedido", "INT"),
    aclar: nodo(s, C[1], R[0], NW, NH, "Aclaración", "INT"),
    ficha: nodo(s, C[1], R[1], NW, NH, "Ficha", "COM"),
    cartel: nodo(s, C[2], R[1], NW, NH, "Cartel", "COM"),
    entorno: nodo(s, C[2], R[0], NW, NH, "Entorno", "MAT"),
    dict: nodo(s, C[3], R[1], NW, NH, "Dictamen", "MAT"),
    cond: nodo(s, C[3], R[0], NW, NH, "Condición", "MAT"),
    geo: nodo(s, C[2], R[2], NW, NH, "Geometría", "MAN"),
    restr: nodo(s, C[2], R[3], NW, NH, "Límite técnico", "MAN"),
    conf: nodo(s, C[3], R[2], NW, NH, "Conflicto", "COM"),
    alt: nodo(s, C[4], R[2], NW, NH, "Alternativa", "MAN"),
    rec: nodo(s, C[4], R[3], NW, NH, "Recomendación", "MAN"),
  };
  conectar(s, n.cliente, n.pedido, "formula", "der");
  conectar(s, n.aclar, n.cliente, "se dirige a");
  conectar(s, n.ficha, n.pedido, "corresponde a");
  conectar(s, n.ficha, n.cartel, "describe");
  conectar(s, n.cartel, n.entorno, "se instala en", "der");
  conectar(s, n.dict, n.cartel, "evalúa");
  conectar(s, n.dict, n.cond, "impone", "der");
  conectar(s, n.cartel, n.geo, "tiene", "der");
  conectar(s, n.geo, n.restr, "viola", "der");
  conectar(s, n.restr, n.conf, "genera");
  conectar(s, n.dict, n.conf, "reúne", "der");
  conectar(s, n.conf, n.alt, "exige");
  conectar(s, n.alt, n.rec, "conforma", "der");
  // leyenda + cómo se armó (abajo a la izquierda, espacio libre)
  [["Interpretación", K.INT, K.INTf], ["Materiales", K.MAT, K.MATf], ["Fabricación", K.MAN, K.MANf], ["Compartido", K.COM, K.COMf]].forEach(([t, c, f], i) => {
    const x = 0.55 + (i % 2) * 2.15, y = 3.75 + Math.floor(i / 2) * 0.4;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.05, w: 0.35, h: 0.24, fill: { color: f }, line: { color: c, width: 1.5 }, rectRadius: 0.05 });
    T(s, t, { x: x + 0.45, y, w: 1.65, h: 0.34, fontSize: 14, color: K.ink, valign: "middle" });
  });
  caja(s, 0.55, 4.7, 4.25, 1.05, K.soft, K.soft);
  T(s, "Cada uno hizo su red (PI2) y las unimos en una sola. Esta es la vista corta; la completa está en el anexo.",
    { x: 0.75, y: 4.7, w: 3.9, h: 1.05, fontSize: 14, valign: "middle" });
  T(s, "Reglas de diseño", { x: 0.55, y: 5.95, w: 3, h: 0.35, fontSize: 15, bold: true, color: K.neon });
  ["Cada relación con verbo y dirección", "Un concepto = un solo nombre", "Lo compartido une los submódulos"].forEach((t, i) => {
    const x = 0.55 + i * 4.12;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 6.32, w: 3.92, h: 0.5, fill: { color: "FFF0F6" }, line: { color: K.neon, width: 1.25 }, rectRadius: 0.25 });
    T(s, t, { x, y: 6.32, w: 3.92, h: 0.5, fontSize: 15, bold: true, align: "center", valign: "middle" });
  });
  notas(s, { quien: "Lautaro", tiempo: "1:15", reloj: "6:20",
    frase: "Cada caja es un concepto y cada flecha un verbo: la red se lee como oraciones.",
    guion: `Esta es la red semántica, en versión corta. Cada caja es un concepto y cada flecha es una relación con un verbo. Se lee como oraciones. Por ejemplo, arriba a la izquierda: el cliente formula un pedido. Siguiendo: la ficha describe un cartel; el cartel se instala en un entorno.

Mi parte, en verde: el dictamen evalúa el cartel, impone condiciones y reúne los conflictos que encuentra. Y la de Luciano, en naranja: la geometría del cartel viola un límite técnico, eso genera un conflicto, y el conflicto exige una alternativa.

Cada uno hizo su red en el PI2 y después las unimos. Para eso seguimos tres reglas: toda relación tiene verbo y dirección; un concepto tiene un solo nombre —Luciano decía «diseño» y yo «cartel», y quedó Cartel—; y los conceptos compartidos, en violeta, como la ficha, el cartel y el conflicto, son los que unen las tres partes.`,
    palabras: [["Red semántica", "un dibujo de conceptos unidos por flechas con nombre; muestra cómo piensa el experto el problema."],
               ["Conflicto", "un problema encontrado (algo que no cumple un límite). Lautaro lo llama «restricción»: es lo mismo."]],
    preguntas: [["¿Qué hicieron cuando dos usaban nombres distintos?", "Elegimos uno y el otro quedó como sinónimo dentro del frame."],
                ["¿Dónde está la red completa?", "En el anexo y en Neo4j: son 58 frames y 73 relaciones de esquema."]] });
}

// ================================================================= 8. De la red al frame — Lautaro 1:15
{
  const s = nueva("De la red a los frames: una ficha con casilleros", "Modelado", "Lautaro", "1:15");
  T(s, "Cómo se transforma", { x: 0.55, y: 1.4, w: 4.3, h: 0.4, fontSize: 17, bold: true, color: K.muted });
  [["Concepto", "Frame", "una ficha del concepto"], ["Atributo", "Slot", "un casillero de la ficha"], ["«es un»", "Herencia", "PETG es un Material: recibe sus casilleros"]].forEach(([a, b, d], i) => {
    const y = 1.95 + i * 1.3;
    caja(s, 0.55, y, 1.55, 0.6, K.soft, K.line);
    T(s, a, { x: 0.55, y, w: 1.55, h: 0.6, fontSize: 17, bold: true, align: "center", valign: "middle" });
    flecha(s, 2.15, y + 0.3, 2.6, y + 0.3, K.ink, 2);
    caja(s, 2.65, y, 1.55, 0.6, K.MATf, K.MAT);
    T(s, b, { x: 2.65, y, w: 1.55, h: 0.6, fontSize: 17, bold: true, color: K.MAT, align: "center", valign: "middle" });
    T(s, d, { x: 0.55, y: y + 0.65, w: 4.3, h: 0.35, fontSize: 14, italic: true, color: K.muted });
  });
  const x0 = 5.15, w0 = 7.6;
  caja(s, x0, 1.4, w0, 0.6, K.MAT, K.MAT);
  T(s, [{ text: "Frame: Soporte", options: { bold: true } }, { text: "   (la pared o estructura donde se cuelga el cartel)", options: { color: "D7F0EC" } }],
    { x: x0 + 0.25, y: 1.4, w: w0 - 0.5, h: 0.6, fontSize: 18, color: "FFFFFF", valign: "middle" });
  tabla(s, [
    ["Slot (casillero)", "Qué acepta", "Por defecto"],
    [{ text: "tipo", options: { bold: true } }, "pared de ladrillo, yeso, vidrio, estructura, marquesina", "—"],
    [{ text: "capacidad", options: { bold: true } }, "baja / no baja  (a validar)", "—"],
    [{ text: "estado", options: { bold: true, fill: { color: K.MATf } } }, { text: "verificado / no verificado / en mal estado", options: { fill: { color: K.MATf } } },
     { text: "no verificado", options: { bold: true, fill: { color: K.MATf } } }],
  ], { x: x0, y: 2.0, w: w0, colW: [1.9, 4.0, 1.7], rowH: 0.55, fontSize: 15 }, K.dark);
  caja(s, x0, 4.4, w0, 0.95, "FFF0F6", K.neon);
  T(s, [{ text: "Demonio: ", options: { bold: true, color: K.neon } },
        { text: "si el estado queda «no verificado» y no se sabe cuánto aguanta, agrega solo la condición «revisar el soporte antes de instalar» (R-MI-14)." }],
    { x: x0 + 0.25, y: 4.4, w: w0 - 0.5, h: 0.95, fontSize: 16, valign: "middle" });
  caja(s, 0.55, 5.65, 12.2, 1.05, K.soft, K.soft);
  T(s, [
    { text: "Slot", options: { bold: true } }, { text: " = un casillero.   " },
    { text: "Faceta", options: { bold: true } }, { text: " = qué valores acepta y cuál va por defecto.   " },
    { text: "Demonio", options: { bold: true } }, { text: " = una acción automática cuando el casillero se llena o queda vacío." },
  ], { x: 0.8, y: 5.65, w: 11.8, h: 1.05, fontSize: 16, valign: "middle" });
  notas(s, { quien: "Lautaro", tiempo: "1:15", reloj: "7:35",
    frase: "Cada concepto de la red se vuelve un frame: una ficha con casilleros que saben qué aceptan y qué hacer.",
    guion: `De la red pasamos a los frames. Un frame es como una ficha de un concepto. Cada atributo es un casillero, que se llama slot. Y la relación «es un» pasa a herencia: el PETG es un Material, así que recibe los casilleros de Material.

El ejemplo es de mi PI2: el frame Soporte, o sea la pared o estructura donde se cuelga el cartel. Tiene un casillero tipo, uno capacidad y uno estado. Lo que acepta cada casillero, y su valor por defecto, son las facetas. Por ejemplo, estado, si nadie fue a mirar, por defecto es «no verificado».

Y acá aparece el demonio, que es una acción automática: si el soporte queda «no verificado» y no sabemos cuánto aguanta, el sistema agrega solo una condición: «revisar el soporte antes de instalar». Es justo lo que pasa en el caso 2 con la marquesina.`,
    palabras: [["Frame", "ficha de un concepto."], ["Slot", "casillero de la ficha."],
               ["Faceta", "la regla del casillero: qué valores acepta, cuál es el valor por defecto."],
               ["Demonio", "acción que se dispara sola cuando un casillero se llena, cambia o falta."]],
    preguntas: [["¿Por qué capacidad dice «a validar»?", "Porque cuánto aguanta cada pared lo tiene que definir el experto; no inventamos números."],
                ["¿Qué diferencia hay entre slot y faceta?", "El slot es el casillero (estado); la faceta dice qué acepta y su valor por defecto (no verificado)."]] });
}

// ================================================================= 9. Reglas — Luciano 1:00
{
  const s = nueva("Reglas SI… ENTONCES…: de dónde sale cada una", "Modelado", "Luciano", "1:00");
  const reglas = [
    ["R-MI-01", "Materiales", "SI no se sabe dónde va, sobre qué ni el tamaño", "ENTONCES no se evalúa y se le pide el dato al cliente", "EXPERTO", K.MAT, K.MATf],
    ["MAN-R6", "Fabricación", "SI el trazo del logo es muy fino para el neón Y el cliente exige respetar su logo", "ENTONCES no se engrosa: se propone retroiluminado", "EXPERTO", K.MAN, K.MANf],
    ["R-MI-12", "Materiales", "SI hay al menos un problema que no tiene arreglo", "ENTONCES el dictamen es NO APTO, con cada causa", "PROPUESTA", K.MAT, K.MATf],
  ];
  reglas.forEach(([id, sub, si, ent, org, c, f], i) => {
    const y = 1.45 + i * 1.6;
    caja(s, 0.55, y, 8.4, 1.4, f, c);
    T(s, id, { x: 0.8, y: y + 0.12, w: 1.6, h: 0.4, fontSize: 19, bold: true, color: c });
    T(s, sub, { x: 0.8, y: y + 0.55, w: 1.6, h: 0.3, fontSize: 14, color: K.muted });
    T(s, [{ text: si, options: { breakLine: true } }, { text: ent, options: { bold: true } }],
      { x: 2.45, y: y + 0.1, w: 4.75, h: 1.2, fontSize: 16, valign: "middle" });
    pildora(s, 7.3, y + 0.49, 1.5, org, org === "EXPERTO" ? K.ok : K.neon);
  });
  const exp = ST.origen.filter((o) => o.o === "experto").reduce((a, o) => a + o.c, 0);
  const prop = ST.origen.filter((o) => o.o === "propuesta").reduce((a, o) => a + o.c, 0);
  const doc = ST.reglas - exp - prop;
  caja(s, 9.35, 1.45, 3.4, 4.6, K.soft, K.soft);
  T(s, `${ST.reglas} reglas en total`, { x: 9.6, y: 1.6, w: 3, h: 0.4, fontSize: 17, bold: true });
  [[exp, "del experto", K.ok], [prop, "propuestas por el grupo (a validar)", K.neon], [doc, "de fichas técnicas o normas", K.muted]].forEach(([nn, t, c], i) => {
    const y = 2.2 + i * 1.25;
    T(s, String(nn), { x: 9.6, y, w: 1.1, h: 0.8, fontSize: 42, bold: true, color: c, valign: "middle" });
    T(s, t, { x: 10.7, y, w: 1.95, h: 0.8, fontSize: 15, color: K.ink, valign: "middle" });
  });
  pie(s, "Retroiluminado = la luz sale por detrás de la letra · «Propuesta» = la escribimos nosotros y falta que el experto la confirme");
  notas(s, { quien: "Luciano", tiempo: "1:00", reloj: "8:35",
    frase: "Las reglas son «si pasa esto, entonces concluyo esto», y cada una dice si viene del experto, de nosotros o de un documento.",
    guion: `Las reglas tienen la forma «SI pasa esto, ENTONCES concluyo esto». Y cada una dice de dónde sale, porque la cátedra pidió separar lo que sabe el experto de lo que proponemos nosotros.

Las dos primeras son del experto. Si no sabemos dónde va el cartel, sobre qué ni de qué tamaño, no se evalúa y se pide el dato. Y si el trazo del logo es muy fino para el neón pero el cliente exige respetar su logo, no lo engrosamos: lo hacemos retroiluminado.

La tercera es una propuesta: Lautaro la agregó al armar su PI2 porque faltaba la regla del «no apto». Si hay al menos un problema sin arreglo, el dictamen es no apto, y se muestran todas las causas. Falta que yo la confirme como experto.

En total son ${ST.reglas}: ${exp} del experto, ${prop} propuestas por el grupo y ${doc} que salen de fichas técnicas o normas.`,
    palabras: [["Regla experta", "la dijo Luciano en las entrevistas."], ["Regla propuesta", "la armamos nosotros; está pendiente de validar."],
               ["Regla documental", "sale de una ficha técnica o norma (ej.: la impresora imprime hasta 40 cm)."]],
    preguntas: [["¿Cómo van a validar las propuestas?", "Con sesiones donde el experto resuelve casos en voz alta y comparamos con lo que dice la regla."]] });
}

// ================================================================= 10. Los tres dictámenes — Lautaro 1:15
{
  const s = nueva("Materiales: tres casos, tres dictámenes", "Modelado", "Lautaro", "1:15");
  const cols = [
    ["CU1 · Café Andino", "Neón adentro, sobre pared de ladrillo", "APTO", K.ok, K.okf,
     ["Interior → poca exposición", "La pared aguanta", "Nada que objetar"], "R-MI-10"],
    ["CU2 · Letras al frente", "3 m sobre una marquesina, a 4 m de altura", "APTO CON CONDICIONES", K.warn, K.warnf,
     ["Material para sol y lluvia (todavía no elegido)", "Revisar la marquesina antes de colgar", "Verificación de un profesional (altura y viento)"], "R-MI-13 · 14 · 06 · 11"],
    ["FR-07 · Neón en bandera", "Sobre la vereda; quiere reusar el neón de adentro", "NO APTO", K.bad, K.badf,
     ["El alero no lo tapa → recibe lluvia", "Neón y fuente de interior: sin arreglo", "Fuente encerrada: corregible"], "R-MI-08 · 03 · 07 · 12"],
  ];
  const W = 3.95, G = 0.18;
  cols.forEach(([t, d, res, c, f, items, reg], i) => {
    const x = 0.55 + i * (W + G);
    T(s, t, { x, y: 1.4, w: W, h: 0.42, fontSize: 19, bold: true, color: K.ink });
    T(s, d, { x, y: 1.82, w: W, h: 0.6, fontSize: 14, color: K.muted, valign: "top" });
    caja(s, x, 2.5, W, 0.75, c, c);
    T(s, res, { x, y: 2.5, w: W, h: 0.75, fontSize: res.length > 10 ? 19 : 24, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    caja(s, x, 3.35, W, 2.3, f, f);
    T(s, items.map((it, k) => ({ text: it, options: { bullet: true, breakLine: k < items.length - 1 } })),
      { x: x + 0.2, y: 3.45, w: W - 0.35, h: 1.75, fontSize: 16, valign: "top", paraSpaceAfter: 6 });
    T(s, reg, { x: x + 0.2, y: 5.22, w: W - 0.4, h: 0.35, fontSize: 13, color: K.muted });
  });
  caja(s, 0.55, 5.85, 12.2, 0.85, K.dark, K.dark);
  T(s, [{ text: "Cómo decide: ", options: { bold: true, color: K.cyan } },
        { text: "primero busca algo sin arreglo (→ no apto); si no hay, busca condiciones (→ con condiciones); si no hay nada → apto." }],
    { x: 0.8, y: 5.85, w: 11.8, h: 0.85, fontSize: 16, color: "FFFFFF", valign: "middle" });
  notas(s, { quien: "Lautaro", tiempo: "1:15", reloj: "9:50",
    frase: "Con mi PI2 el modelo da los tres resultados posibles: apto, apto con condiciones y no apto.",
    guion: `Esta es mi parte, Materiales e instalación, con los tres resultados posibles.

Caso del café: neón adentro, sobre una pared de ladrillo. Adentro casi no hay sol ni lluvia y la pared aguanta: apto.

Caso de las letras: van afuera, sobre una marquesina, a 4 metros. Acá todavía no está elegido el material, y eso no frena la evaluación: dejo un requisito, «tiene que aguantar sol y lluvia», que después Luciano resuelve eligiendo PETG. Como nadie revisó la marquesina, se agrega la condición de revisarla antes. Y por la altura y el viento, se pide que un profesional verifique la estructura. Resultado: apto con condiciones.

El tercero es el caso 2 de mi PI2: un neón en bandera, o sea perpendicular a la pared, sobre la vereda. Tiene un alero, pero el cartel sobresale más que el alero, así que recibe lluvia igual. Y el cliente quiere reusar un neón y una fuente de interior. Eso no tiene arreglo: no apto, y el sistema muestra cada causa.

Cómo decide: primero busca algo sin arreglo; si no hay, busca condiciones; y si no hay nada, es apto.`,
    palabras: [["Bandera", "cartel colgado perpendicular a la pared, que sobresale sobre la vereda."],
               ["Fuente", "el transformador que alimenta las luces; es lo que más se rompe."],
               ["Requisito vs condición", "requisito = lo que debe cumplir un material que todavía no se eligió; condición = algo a hacer para poder instalar."]],
    preguntas: [["¿Por qué el alero no cuenta?", "La excepción del alero se evalúa (regla R-MI-08), pero el alero mide 0,4 m y el cartel sobresale 1 m: no lo cubre. Queda registrado en el grafo."],
                ["¿Qué pasa con el no apto después?", "Pasa a Fabricación con todas las causas; cambiar los componentes ya es rediseño, y esa regla de Luciano está pendiente."],
                ["¿Qué grado de protección contra el agua piden?", "Todavía «a validar» con el experto; por eso no ponemos un número."]] });
}

// ================================================================= 11. Lógica difusa — Luciano 0:45
{
  const s = nueva("Lógica difusa: cuando no es «sí o no»", "Modelado", "Luciano", "0:45");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 1.35, w: 5.4, h: 0.5, fill: { color: "FFF0F6" }, line: { color: K.neon, width: 1.5 }, rectRadius: 0.25 });
  T(s, "EJEMPLO · rangos a definir con el experto (PI3)", { x: 0.55, y: 1.35, w: 5.4, h: 0.5, fontSize: 15, bold: true, color: K.neon, align: "center", valign: "middle" });
  T(s, "Variable lingüística: exposición al clima", { x: 0.55, y: 2.15, w: 6.4, h: 0.4, fontSize: 19, bold: true, color: K.MAT });
  const base = 4.85;
  [["baja", 0.7, K.INT], ["media", 2.35, K.MAT], ["alta", 4.0, K.MAN]].forEach(([nm, x, c]) => {
    s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x, y: 3.05, w: 2.6, h: base - 3.05, fill: { color: c, transparency: 72 }, line: { color: c, width: 2 } });
    T(s, nm, { x: x + 0.75, y: 2.7, w: 1.1, h: 0.32, fontSize: 16, bold: true, color: c, align: "center" });
  });
  s.addShape(pres.shapes.LINE, { x: 0.6, y: base, w: 6.2, h: 0, line: { color: K.ink, width: 1.25, endArrowType: "triangle" } });
  T(s, "más sol, lluvia y viento →", { x: 0.6, y: base + 0.1, w: 6.2, h: 0.35, fontSize: 14, italic: true, color: K.muted });
  T(s, "Un lugar puede ser «media» y «alta» a la vez, con distinto grado (de 0 a 1).", { x: 0.55, y: 5.55, w: 6.3, h: 0.7, fontSize: 16, color: K.ink });
  caja(s, 7.25, 2.15, 5.5, 2.75, K.dark, K.dark);
  T(s, "Regla difusa de ejemplo", { x: 7.55, y: 2.3, w: 4.9, h: 0.4, fontSize: 15, bold: true, color: K.cyan });
  T(s, [
    { text: "SI ", options: { bold: true, color: K.cyan } }, { text: "la exposición es " }, { text: "ALTA", options: { bold: true, color: K.neon, breakLine: true } },
    { text: "Y ", options: { bold: true, color: K.cyan } }, { text: "el peso está " }, { text: "EN EL LÍMITE", options: { bold: true, color: K.neon, breakLine: true } },
    { text: "ENTONCES ", options: { bold: true, color: K.cyan } }, { text: "el riesgo es " }, { text: "ALTO", options: { bold: true, color: K.neon } },
  ], { x: 7.55, y: 2.8, w: 4.95, h: 1.95, fontSize: 21, color: "FFFFFF", valign: "top", paraSpaceAfter: 10 });
  T(s, "Hoy la exposición es nítida (baja/media/alta por reglas). Variables candidatas: exposición, tamaño del cartel, confiabilidad del soporte, peso.",
    { x: 7.25, y: 5.1, w: 5.5, h: 0.95, fontSize: 14, color: K.muted });
  notas(s, { quien: "Luciano", tiempo: "0:45", reloj: "10:35",
    frase: "La lógica difusa sirve para lo que es «un poco» o «bastante»; la mostramos con un ejemplo y se completa en el PI3.",
    guion: `La lógica difusa es para lo que no es «sí o no». Un frente al sol sin alero está más expuesto que uno con un alero chico, que a su vez está más expuesto que uno adentro. Entonces la exposición se describe con palabras —baja, media o alta— y un lugar puede ser un poco «media» y un poco «alta» a la vez, con un grado de 0 a 1. Eso es una variable lingüística.

La regla de ejemplo: si la exposición es alta y el peso está en el límite, el riesgo es alto.

Hoy, en el modelo, la exposición se calcula con reglas comunes, nítidas. Lautaro dejó identificadas las variables candidatas: exposición, tamaño del cartel, qué tan confiable es el soporte y el peso. Los rangos los vamos a definir conmigo en el PI3.`,
    palabras: [["Variable lingüística", "una variable que toma palabras (baja, media, alta) en vez de números exactos."],
               ["Grado de pertenencia", "número de 0 a 1 que dice cuánto pertenece un caso a «alta», por ejemplo."]],
    preguntas: [["¿Por qué no la implementaron todavía?", "Porque no inventamos rangos: las funciones de pertenencia se relevan con el experto."],
                ["¿Reemplaza a las reglas normales?", "No: lo imposible sigue en reglas nítidas (un metro no entra en 40 cm); lo difuso sirve para graduar y ordenar."]] });
}

// ================================================================= 12. Neo4j — Luciano 1:00
pres.addSection({ title: "Neo4j y demo" });
{
  const s = nueva("Neo4j: el modelo convertido en grafo", "Neo4j y demo", "Luciano", "1:00");
  const xs = [1.45, 3.95, 6.45, 8.95, 11.45], y = 1.95, NW = 1.85, NH = 0.85;
  const sub = (t) => ({ text: t, options: { fontSize: 13, bold: false, color: K.muted } });
  nodo(s, xs[0], y, NW, NH, [{ text: "Cartel", options: { breakLine: true } }, sub("CU1")], "COM");
  nodo(s, xs[1], y, NW, NH, [{ text: "Geometría", options: { breakLine: true } }, sub("1000 mm")], "MAN");
  nodo(s, xs[2], y, NW, NH, [{ text: "Límite", options: { breakLine: true } }, sub("cama 400 mm")], "MAN");
  nodo(s, xs[3], y, NW, NH, [{ text: "Conflicto", options: { breakLine: true } }, sub("ExcedeCama")], "COM");
  nodo(s, xs[4], y, NW, NH, [{ text: "Alternativa", options: { breakLine: true } }, sub("Segmentación")], "MAN");
  ["TIENE", "VIOLA", "GENERA", "EXIGE"].forEach((t, i) => {
    flecha(s, xs[i] + NW / 2 + 0.03, y, xs[i + 1] - NW / 2 - 0.03, y, "4A5568", 1.75);
    T(s, t, { x: xs[i] + NW / 2, y: y - 0.62, w: 2.5 - NW, h: 0.3, fontSize: 13, bold: true, color: i ? K.neon : K.muted, align: "center" });
  });
  T(s, [{ text: "Las relaciones en rosa no se cargaron a mano: ", options: { bold: true } }, { text: "las creó la regla MAN-R3." }],
    { x: 0.55, y: 2.6, w: 12.2, h: 0.35, fontSize: 15, color: K.ink, align: "center" });
  T(s, "Consulta en Cypher (el lenguaje de Neo4j)", { x: 0.55, y: 3.3, w: 6, h: 0.35, fontSize: 16, bold: true, color: K.muted });
  codigo(s, "MATCH (k:Conflicto {caso:'CU1'})\n      -[e:EXIGE]->(alt)\nRETURN k.tipo, k.detalle,\n       alt.nombre, e.regla", 0.55, 3.75, 5.6, 1.5, 15);
  T(s, "«Buscá el conflicto del caso CU1, qué exige y qué regla lo creó»", { x: 0.55, y: 5.35, w: 5.6, h: 0.35, fontSize: 14, italic: true, color: K.muted });
  T(s, "Resultado real", { x: 6.55, y: 3.3, w: 6, h: 0.35, fontSize: 16, bold: true, color: K.muted });
  tabla(s, [["conflicto", "detalle", "alternativa", "regla"],
            ["ExcedeCama", "1000 mm > 400 mm de cama", "SegmentacionModular", { text: "MAN-R3", options: { bold: true, color: K.neon } }]],
    { x: 6.55, y: 3.75, w: 6.2, colW: [1.35, 2.15, 1.85, 0.85], rowH: 0.55, fontSize: 13 });
  T(s, `En total: ${ST.frames} frames · ${ST.reglas} reglas · ${ST.instancias} instancias · Neo4j 5.21 en Docker`,
    { x: 6.55, y: 5.0, w: 6.2, h: 0.6, fontSize: 16, color: K.ink });
  pie(s, "Neo4j = base de datos que guarda nodos y flechas, igual que nuestra red · Instancia = un caso concreto (este cartel, esta pared)");
  notas(s, { quien: "Luciano", tiempo: "1:00", reloj: "11:35",
    frase: "Todo quedó en Neo4j: la red, los frames, las reglas y los casos; cada conclusión dice qué regla la creó.",
    guion: `Todo esto lo cargamos en Neo4j, que es una base de datos de grafos: guarda nodos y flechas, igual que nuestra red. Los frames, las reglas y los casos de prueba quedan en el mismo grafo: ${ST.frames} frames, ${ST.reglas} reglas y ${ST.instancias} instancias, que son los casos concretos.

Arriba ven un pedazo del caso del café: el cartel tiene una geometría de 1000 milímetros, que viola el límite de la impresora de 400; eso genera el conflicto «excede la cama», que exige segmentar. Esas tres flechas en rosa no las cargamos a mano: las creó la regla MAN-R3.

La consulta está en Cypher, el lenguaje de Neo4j, y se lee casi en castellano: buscá el conflicto del caso CU1, lo que exige, y qué regla lo creó. Así cada conclusión se puede rastrear.`,
    palabras: [["Cypher", "el lenguaje para consultar Neo4j. MATCH = buscá; RETURN = devolvé."], ["Instancia", "un caso concreto cargado en el grafo, por ejemplo el cartel del Café Andino."]],
    preguntas: [["¿Las reglas están dentro de Neo4j?", "Sí: cada regla es una consulta Cypher y además un nodo; cada flecha que crea guarda el nombre de la regla."],
                ["¿Por qué Neo4j y no una base relacional?", "Porque el modelo ya es un grafo de conceptos y relaciones, y se consulta recorriendo caminos."]] });
}

// ================================================================= 13. Demo — Matías 2:00
{
  const s = nueva("Demo en Neo4j", "Neo4j y demo", "Matías", "2:00");
  const pasos = [
    ["01–02", "El pedido del café no avanza: falta cómo se fija → Materiales dice «bloqueante» (R-MI-01)", K.INT],
    ["12", "Café Andino de punta a punta: apto → segmentar → decide el fabricante", K.INT],
    ["13", "Letras al frente: apto con condiciones; el PETG de Luciano cumple el requisito de Lautaro", K.MAT],
    ["14", "Neón en bandera: no apto, con cada causa", K.MAT],
  ];
  pasos.forEach(([n, t, c], i) => {
    const y = 1.5 + i * 0.95;
    pildora(s, 0.55, y + 0.08, 1.15, "paso " + n, c, 13);
    T(s, t, { x: 1.9, y, w: 4.6, h: 0.85, fontSize: 16, valign: "middle" });
  });
  codigo(s, "bash neo4j/demo.sh", 0.55, 5.45, 5.95, 0.6, 15);
  T(s, "Si falla la conexión: video de respaldo (salida/video_demo.mp4).", { x: 0.55, y: 6.15, w: 5.95, h: 0.4, fontSize: 14, italic: true, color: K.muted });
  T(s, "Salida real del paso 14 (FR-07)", { x: 6.85, y: 1.45, w: 5.9, h: 0.35, fontSize: 16, bold: true, color: K.muted });
  const fila = (a, b, color) => [{ text: a, options: { bold: true } }, color ? { text: b, options: { bold: true, color } } : b];
  tabla(s, [
    ["paso de Materiales", "resultado"],
    fila("Excepción R-MI-08", "alero → no aplica (no cubre)"),
    fila("Exposición R-MI-02", "alta"),
    fila("Restricción R-MI-03", "eléctrica, excluyente", K.bad),
    fila("Restricción R-MI-07", "mantenimiento, corregible"),
    fila("Verificación R-MI-06", "estructural: bandera + viento"),
    fila("Dictamen R-MI-12", "NO APTO", K.bad),
  ], { x: 6.85, y: 1.85, w: 5.9, colW: [2.4, 3.5], rowH: 0.5, fontSize: 14 });
  T(s, "Arranca con los casos cargados y ninguna regla aplicada: las conclusiones aparecen en vivo.",
    { x: 6.85, y: 5.55, w: 5.9, h: 0.7, fontSize: 14, italic: true, color: K.muted });
  notas(s, { quien: "Matías", tiempo: "2:00", reloj: "13:35",
    frase: "En vivo se ve cómo las reglas, una por una, llevan cada pedido hasta su resultado.",
    guion: `[Compartir la terminal y correr: bash neo4j/demo.sh. Enter ejecuta, Enter pasa al siguiente. Se ven los pasos 01, 02, 12, 13 y 14. Después del 14, Ctrl+C y volver a las slides.]

Ahora la demo. El script carga los casos sin ninguna regla aplicada, así que todo lo que aparece lo van creando las reglas.

Paso 1: le pregunto a la base por qué el pedido del café no se puede evaluar. Falta cómo se fija, hay una pregunta pendiente al cliente y una consulta a Materiales.
Paso 2: Materiales responde con su regla R-MI-01: bloqueante. El sistema frena y no inventa el dato.

[Los pasos que siguen se aplican solos.]

Paso 12: el café de punta a punta. Interpretación deja el pedido listo, Materiales dice apto, Fabricación detecta que no entra en la impresora y recomienda segmentar. Decide el fabricante.

Paso 13: las letras al frente. Apto con condiciones; fíjense que el requisito de material que dejó Lautaro lo cumple el PETG que elige la regla de Luciano.

Paso 14: el neón en bandera. El alero se evaluó pero no alcanza; los componentes de interior hacen que sea no apto, y aparece cada causa. Es la tabla que ven a la derecha, por si se corta la conexión.`,
    palabras: [["demo.sh", "script que ejecuta las consultas de a una, con pausa."]],
    preguntas: [["¿Qué pasa si se cae Neo4j?", "Tenemos la salida real en las slides y el video de respaldo."],
                ["¿Dónde está el LLM?", "Todavía no está conectado: en el diseño solo traduce el mensaje a datos y redacta la explicación desde la traza; no decide."]] });
}

// ================================================================= 14. Cierre — Lautaro 0:30
pres.addSection({ title: "Cierre" });
{
  const s = pres.addSlide({ masterName: "OSCURO", sectionTitle: "Cierre" });
  T(s, "Qué nos falta", { x: 0.8, y: 0.45, w: 9.5, h: 0.8, fontSize: 38, bold: true, color: "FFFFFF", valign: "middle" });
  [["Números que no inventamos", "protección contra el agua exigida, peso que aguanta cada soporte, desde qué tamaño pedir un profesional"],
   ["Validar con el experto", `las ${ST.origen.filter((o) => o.o === "propuesta").reduce((a, o) => a + o.c, 0)} reglas propuestas por el grupo`],
   ["Lógica difusa (PI3)", "rangos de exposición, tamaño, soporte y peso"]].forEach(([t, d], i) => {
    const y = 1.85 + i * 1.2;
    circulo(s, 0.8, y, 0.6, String(i + 1), K.neon, 18);
    T(s, t, { x: 1.65, y: y - 0.05, w: 10.5, h: 0.45, fontSize: 23, bold: true, color: "FFFFFF" });
    T(s, d, { x: 1.65, y: y + 0.4, w: 10.8, h: 0.4, fontSize: 17, color: "C9D1E0" });
  });
  T(s, "¡Gracias! ¿Preguntas?", { x: 0.8, y: 5.75, w: 8, h: 0.8, fontSize: 36, bold: true, color: K.cyan });
  T(s, "Anexo: preguntas del integrador, red completa, PI1 y PI2, jerarquía de frames y grafos de los casos", { x: 0.8, y: 6.6, w: 11.5, h: 0.35, fontSize: 13, color: K.gray });
  notas(s, { quien: "Lautaro", tiempo: "0:30", reloj: "14:05",
    frase: "Nos faltan los números del experto, validar las reglas propuestas y la lógica difusa.",
    guion: `Para cerrar, lo que nos falta. Uno: los números que no quisimos inventar, como qué protección contra el agua hace falta, cuánto peso aguanta cada pared o desde qué tamaño pedir un profesional. Dos: validar con Luciano las reglas que propusimos nosotros. Y tres: definir la lógica difusa en el PI3.

Gracias, quedamos para preguntas.`,
    preguntas: [["¿Cómo saben todo lo que falta?", "Está marcado en el grafo y sale con una consulta (paso 20 de la demo completa)."],
                ["Preguntas del integrador (LLM, APIs, trazabilidad…)", "Están respondidas en la primera slide del anexo."]] });
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
  const s = anexo("Hacia el integrador: respuestas cortas",
    "Respuestas a las preguntas «integrador» de la cátedra, adaptadas a cartelería. Lo marcado como dirección de trabajo todavía no está hecho.");
  const hecho = (t) => ({ text: t, options: { color: K.ink } });
  const dir = (t) => ({ text: t, options: { color: K.muted, italic: true } });
  tabla(s, [
    ["Eje", "Respuesta"],
    [{ text: "Grafo", options: { bold: true } }, hecho("Pedido, Dato, Ficha, Cartel, Entorno, Soporte, Dictamen, Conflicto, Alternativa, Recomendación, Regla. La restricción del cliente CONDICIONA el cartel y ADMITE / RECHAZA alternativas; cada flecha creada por una regla guarda su nombre.")],
    [{ text: "Difusa", options: { bold: true } }, dir("Dirección de trabajo: exposición, tamaño, soporte, peso e impacto estético → índice de adecuación. Lo imposible lo siguen decidiendo reglas nítidas; lo difuso ordena.")],
    [{ text: "Planificador", options: { bold: true } }, hecho("Pedido → Interpretación (aclaraciones hasta que alcanza) → ficha → Materiales → dictamen → Fabricación → recomendación → fabricante. Vuelve al experto si ninguna alternativa sirve (MAN-R8) o si una regla no está validada.")],
    [{ text: "LLM", options: { bold: true } }, dir("Pasa el mensaje del cliente a datos (con origen «cliente») y redacta la explicación desde la traza (paso 17). No decide. RAG sobre fichas técnicas y normas: dirección de trabajo.")],
    [{ text: "APIs", options: { bold: true } }, dir("Dirección de trabajo: evaluar pedido (texto + foto → estado y aclaraciones) · recomendación del caso · explicación (reglas + datos + fuentes).")],
    [{ text: "Trazabilidad", options: { bold: true } }, hecho("Hecho en Neo4j: (:Evaluacion)-[:ACTIVO {orden}]->(:Regla) por caso, y la propiedad «regla» en cada relación inferida. El grado de pertenencia se suma con la lógica difusa.")],
  ], { x: 0.55, y: 1.35, w: 12.2, colW: [1.9, 10.3], fontSize: 13, rowH: [0.42, 0.78, 0.7, 0.78, 0.7, 0.62, 0.7] });
}
{
  const s = anexo("Red semántica integrada completa", "Todos los frames no hoja y sus relaciones, tal como están en Neo4j. Colores = submódulo; borde punteado = abstracto o externo.");
  fit(s, "salida/img/red_semantica_completa.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("Red semántica integrada: núcleo", "Núcleo de la red integrada con los verbos reales del grafo.");
  fit(s, "salida/img/red_semantica_integrada.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("PI1: proceso experto de cada submódulo", "Diagramas de procesos del PI1 de cada integrante: el punto de partida del modelado.");
  [["pi1/img/PI1_Matias_diagrama_procesos.png", "Interpretación (Matías)", K.INT],
   ["pi1/img/PI1_Lautaro_diagrama_procesos.png", "Materiales e instalación (Lautaro)", K.MAT],
   ["pi1/img/PI1_Luciano_diagrama_procesos.png", "Fabricación y rediseño (Luciano)", K.MAN]].forEach(([p, t, c], i) => {
    const x = 0.55 + i * 4.12;
    T(s, t, { x, y: 1.2, w: 3.95, h: 0.35, fontSize: 14, bold: true, color: c, align: "center" });
    fit(s, p, x, 1.6, 3.95, 5.3);
  });
}
{
  const s = anexo("PI2: redes semánticas individuales", "Redes conceptuales de los PI2 de Matías y de Luciano antes de integrar. La de Lautaro (19 conceptos, 22 relaciones) está transcripta en su PI2 y su versión integrada se ve en la red completa.");
  T(s, "Interpretación (Matías)", { x: 0.55, y: 1.2, w: 8.3, h: 0.35, fontSize: 14, bold: true, color: K.INT });
  fit(s, "pi2/img/PI2_Matias_fig1_red_semantica_conceptual.png", 0.55, 1.6, 8.3, 5.3);
  T(s, "Fabricación y rediseño (Luciano)", { x: 9.1, y: 1.2, w: 3.7, h: 0.35, fontSize: 14, bold: true, color: K.MAN });
  fit(s, "pi2/img/PI2_Luciano_red_semantica_conceptual.png", 9.1, 1.6, 3.7, 5.3);
}
{
  const s = anexo("Jerarquía de frames (generada desde Neo4j)", "Herencia ES_UN y composición ES_PARTE_DE tal como están en la base.");
  fit(s, "salida/img/jerarquia_frames.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("CU1 instanciado en Neo4j", "Pedido incompleto → consulta a Materiales → respuesta (dato de prueba simulado) → ficha → dictamen apto → ExcedeCama → segmentación + refuerzo.");
  fit(s, "salida/img/cu1_instanciado.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("CU2 instanciado en Neo4j", "FR-02: exposición alta, sin material definido → requisitos (R-MI-13), condiciones (R-MI-13, R-MI-14), verificación (R-MI-06) → apto con condiciones; PETG (MAN-R7) cumple el requisito; segmentación letra por letra.");
  fit(s, "salida/img/cu2_instanciado.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("FR-07 instanciado en Neo4j (caso 2 del PI2 de Lautaro)", "Neón LED en bandera: la excepción del alero se evalúa y no aplica; restricción eléctrica excluyente y de mantenimiento corregible, cada una con su causa; verificación estructural; no apto (R-MI-12).");
  fit(s, "salida/img/fr07_instanciado.png", 0.45, 1.2, 12.4, 5.7);
}
{
  const s = anexo("Filtro por restricción del cliente", "Casos L-C1 y L-C3 del PI2 de Luciano: la restricción obligatoria del cliente rechaza una alternativa y admite la otra (MAN-R6, MAN-R9).");
  fit(s, "salida/img/filtro_luciano.png", 0.45, 1.4, 12.4, 5.3);
}

pres.writeFile({ fileName: OUT }).then(async () => {
  await applyTheme(OUT, THEME);
  console.log("✓", OUT);
});
