// Graba la demo del CU1 en el Neo4j Browser real (localhost:7474) con Playwright.
//
// Recarga la base al estado inicial de los casos (01→03, sin reglas), tipea cada consulta en el editor del
// Browser sacando una captura por tramo tipeado, la ejecuta y captura el resultado. Entre pasos ejecuta en
// silencio los bloques de escritura de neo4j/04_consultas.cypher (igual que neo4j/demo.sh), así cada resultado
// sale del estado real de la base en ese momento.
//
// Salida: public/rec/*.jpg + public/rec/manifiesto.json (lo lee src/DemoCU1.tsx).
// Uso: npm run grabar   (requiere Docker con el contenedor neo4j-carteleria)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const SALIDA = join(AQUI, '..', 'public', 'rec');
const VIEWPORT = { width: 1280, height: 660 };
const DPR = 2;

// ── Neo4j por cypher-shell (pasos silenciosos) ──────────────────────────────────────────
const cypher = (texto) =>
  execFileSync(
    'docker',
    ['exec', '-i', '-e', 'LANG=C.UTF-8', 'neo4j-carteleria', 'cypher-shell', '-u', 'neo4j', '-p', 'password', '--format', 'plain'],
    { input: texto, encoding: 'utf8' },
  );

const BLOQUES = {};
{
  let actual = null;
  for (const linea of readFileSync(join(RAIZ, 'neo4j', '04_consultas.cypher'), 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\/\/ @paso (\d+) /);
    if (m) { actual = Number(m[1]); BLOQUES[actual] = []; continue; }
    if (actual !== null) BLOQUES[actual].push(linea);
  }
}
const aplicarPasos = (...nums) => {
  for (const n of nums) {
    cypher(BLOQUES[n].join('\n'));
    console.log(`  · paso ${String(n).padStart(2, '0')} aplicado (cypher-shell)`);
  }
};

// ── Estilo del grafo: color por submódulo, tomado de la propiedad «submodulo» de cada :Frame ─────
const COLOR = { INT: '#38BDF8', MAT: '#F59E0B', MAN: '#C084FC', COM: '#64748B', TRZ: '#64748B' };
const estiloGrass = () => {
  const filas = cypher("MATCH (f:Frame) WHERE f.submodulo IS NOT NULL RETURN f.nombre + '|' + f.submodulo;")
    .split(/\r?\n/).slice(1).filter(Boolean).map((l) => l.replace(/"/g, '').split('|'));
  const nodo = (sel, color) =>
    `node${sel} { diameter: 62px; color: ${color}; border-color: #0F172A; border-width: 2px; text-color-internal: #0B1020; font-size: 13px; caption: '{id}'; }`;
  return ':style ' + [
    nodo('', '#64748B'),
    `node.Instancia { caption: '{id}'; }`,
    `node.Inferido { caption: '{id}'; }`,
    ...filas.filter(([, sm]) => COLOR[sm]).map(([nombre, sm]) => nodo('.' + nombre, COLOR[sm])),
    // el dato faltante se distingue con borde rojo
    `node.DatoFaltante { diameter: 62px; color: ${COLOR.INT}; border-color: #EF4444; border-width: 6px; text-color-internal: #0B1020; font-size: 13px; caption: '{id}'; }`,
    `relationship { color: #94A3B8; shaft-width: 1.5px; font-size: 10px; padding: 3px; text-color-external: #E2E8F0; text-color-internal: #FFFFFF; caption: '<type>'; }`,
  ].join('\n');
};

// ── Consultas que se tipean en el Browser (solo lectura) ────────────────────────────────
const Q_GRAFO = `MATCH (n:Instancia {caso:'CU1'})-[r]-(m:Instancia {caso:'CU1'})
RETURN n, r, m`;

const Q_FALTA = `MATCH (p:Pedido {id:'P-01'})-[:OMITE]->(d:DatoFaltante)-[:PROVOCA]->(a:Aclaracion)
MATCH (q:ConsultaSubmodulo)-[:CONSULTA_SOBRE]->(d)
RETURN p.estado AS pedido, d.id AS falta, d.atributo AS atributo,
       d.criticidad AS criticidad, q.regla AS segun,
       a.id AS aclaracion, a.pregunta AS pregunta`;

const Q_DICTAMEN = `MATCH (dic:DictamenAdecuacion {caso:'CU1'})-[:EVALUA]->(c:Cartel)-[:SE_INSTALA_EN]->(en:Entorno)
RETURN c.id AS cartel, en.tipo AS entorno,
       en.nivel_exposicion AS exposicion, en.regla_exposicion AS por,
       dic.resultado AS dictamen, dic.regla AS regla`;

const Q_ALTERNATIVAS = `MATCH (k:Conflicto {caso:'CU1', origen:'manufactura'})-[:EXIGE*1..2]->(alt:AlternativaRediseno)
RETURN k.detalle AS conflicto, alt.nombre AS alternativa,
       alt.viable AS viable, alt.regla_viabilidad AS regla,
       COUNT { (:RestriccionCliente {caso:'CU1'}) } AS restricciones_del_cliente`;

const Q_TRAZA = `MATCH (ev:Evaluacion {caso:'CU1'})-[a:ACTIVO]->(r:Regla)
RETURN a.orden AS orden, r.submodulo AS submodulo, r.id AS regla,
       r.nombre AS nombre, r.origen AS origen
ORDER BY orden`;

// ── Grabación ────────────────────────────────────────────────────────────────────────────
rmSync(SALIDA, { recursive: true, force: true });
mkdirSync(SALIDA, { recursive: true });

console.log('→ Recargando la base al estado inicial (01→03)…');
execFileSync('bash', [join(RAIZ, 'neo4j', 'cargar.sh'), '--reset', '--base'], { stdio: 'inherit', env: { ...process.env, MSYS_NO_PATHCONV: '1' } });

const b = await chromium.launch();
const p = await b.newPage({ viewport: VIEWPORT, deviceScaleFactor: DPR, colorScheme: 'dark' });
await p.goto('http://localhost:7474/browser/');
await p.getByTestId('boltaddress').waitFor();
await p.getByTestId('username').fill('neo4j');
await p.getByTestId('password').fill('password');
await p.getByTestId('connect').click();
await p.waitForTimeout(3000);
// cerrar el aviso de telemetría si aparece
// (la × está en el extremo derecho de la misma franja que el texto)
{
  const aviso = p.getByText('To help make Neo4j Browser better', { exact: false }).last();
  const caja = await aviso.boundingBox().catch(() => null);
  if (caja) { await p.mouse.click(VIEWPORT.width - 40, caja.y + caja.height / 2); await p.waitForTimeout(500); }
  console.log('  aviso de telemetría visible:', await aviso.isVisible().catch(() => false));
}

const editor = p.locator('#monaco-main-editor');
const ejecutarSinGrabar = async (texto, espera = 1000) => {
  await editor.click();
  await p.keyboard.insertText(texto);
  await p.keyboard.press('Control+Enter');
  await p.waitForTimeout(espera);
};
await ejecutarSinGrabar(estiloGrass());

const manifiesto = { fps: 30, ancho: VIEWPORT.width * DPR, alto: VIEWPORT.height * DPR, pasos: [] };
let n = 0;
const captura = async (paso, frames) => {
  const archivo = `${String(++n).padStart(4, '0')}.jpg`;
  await p.screenshot({ path: join(SALIDA, archivo), type: 'jpeg', quality: 88 });
  paso.capturas.push({ archivo, frames });
  return paso.capturas.length - 1;
};
const frame = () => p.locator('[data-testid="frame"]').first();

/** Tipea la consulta en el editor capturando cada tramo y la ejecuta. */
const salirPantallaCompleta = async () => {
  const b = p.locator('[data-testid="frame"] button[title="Close fullscreen"]');
  if (await b.count()) { await b.first().click(); await p.waitForTimeout(600); }
};

const tipearYEjecutar = async (paso, consultaConSangria, segundosTipeo = 3.5) => {
  // el editor del Browser autoindenta cada línea nueva: se tipea sin sangría para que no se acumule
  const consulta = consultaConSangria.split('\n').map((l) => l.trimStart()).join('\n');
  await salirPantallaCompleta();
  await ejecutarSinGrabar(':clear', 800);
  await editor.click();
  await p.waitForTimeout(200);
  await captura(paso, 12); // editor vacío
  const porFrame = Math.max(1, Math.ceil(consulta.length / (segundosTipeo * 30)));
  for (let i = 0; i < consulta.length; i += porFrame) {
    await p.keyboard.insertText(consulta.slice(i, i + porFrame));
    await captura(paso, 1);
  }
  await captura(paso, 24); // consulta completa, quieta
  await p.keyboard.press('Control+Enter');
  await frame().waitFor();
};

const pantallaCompleta = async () => {
  await frame().locator('button[title="Fullscreen"]').click();
  await p.waitForTimeout(800);
};

/** Captura la animación real del layout del grafo y devuelve las cajas de los nodos pedidos. */
const resultadoGrafo = async (paso, idsFoco) => {
  await p.waitForTimeout(400);
  await pantallaCompleta();
  await frame().locator('button[title="Collapse the node properties display"]').click().catch(() => {});
  await frame().locator('button[aria-label="zoom-to-fit"]').click().catch(() => {});
  for (let i = 0; i < 12; i++) { await captura(paso, 2); await p.waitForTimeout(120); }
  await frame().locator('button[aria-label="zoom-to-fit"]').click().catch(() => {});
  await p.waitForTimeout(1800);
  const idx = await captura(paso, 0); // frames los decide el video (zoom)
  const cajas = await p.$$eval('svg g.node', (gs) =>
    gs.map((g) => {
      const r = g.getBoundingClientRect();
      return { id: g.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );
  const coincide = (c) => { const v = c.id.replace(/…$/, ''); return v && idsFoco.some((id) => id.startsWith(v) || v.startsWith(id)); };
  const sel = cajas.filter(coincide);
  if (sel.length) {
    const x0 = Math.min(...sel.map((c) => c.x)), y0 = Math.min(...sel.map((c) => c.y));
    const x1 = Math.max(...sel.map((c) => c.x + c.w)), y1 = Math.max(...sel.map((c) => c.y + c.h));
    paso.foco = { indice: idx, x: x0 / VIEWPORT.width, y: y0 / VIEWPORT.height, w: (x1 - x0) / VIEWPORT.width, h: (y1 - y0) / VIEWPORT.height };
  }
  console.log('  nodos en el grafo:', cajas.map((c) => c.id).join(' '), '| foco:', JSON.stringify(paso.foco));
};

const resultadoTabla = async (paso, frames) => {
  await p.waitForTimeout(1500);
  await captura(paso, frames);
};

const nuevoPaso = (id, sm, rotulo) => {
  const paso = { id, sm, rotulo, capturas: [] };
  manifiesto.pasos.push(paso);
  console.log(`→ ${id}: ${rotulo}`);
  return paso;
};

// 1. Grafo del CU1 cargado (estado inicial: lo que dejó Interpretación al cierre de la iteración 2)
{
  const paso = nuevoPaso('grafo', 'INT', 'El caso CU1 cargado en Neo4j: el pedido P-01 tal como lo dejó Interpretación');
  await tipearYEjecutar(paso, Q_GRAFO, 2.5);
  await resultadoGrafo(paso, ['D4', 'A4', 'Q1', 'P-01']);
}

// 2. Qué falta y qué aclaración se pide (Q1 la responde Materiales con R-MI-01: paso 02)
aplicarPasos(2);
{
  const paso = nuevoPaso('falta', 'INT', 'Interpretación detecta que falta el soporte (D4) y pide la aclaración A4');
  await tipearYEjecutar(paso, Q_FALTA, 4);
  await resultadoTabla(paso, 210);
}

// 3. Dictamen de Materiales (pasos 03 a 08: respuesta simulada a A4, ficha, cartel, exposición, dictamen)
aplicarPasos(3, 4, 5, 6, 7, 8);
{
  const paso = nuevoPaso('dictamen', 'MAT', 'Materiales: interior, exposición baja → dictamen apto (R-MI-10)');
  await tipearYEjecutar(paso, Q_DICTAMEN, 3.5);
  await resultadoTabla(paso, 180);
}

// 4. Alternativas de Manufacturabilidad (pasos 09 a 11: conflicto, filtro por restricciones, recomendación)
aplicarPasos(9, 10, 11);
{
  const paso = nuevoPaso('alternativas', 'MAN', 'Manufacturabilidad: 1000 mm no entran en la cama → 2 alternativas, ninguna descartada');
  await tipearYEjecutar(paso, Q_ALTERNATIVAS, 4);
  await resultadoTabla(paso, 210);
}

// 5. Trazabilidad: tabla en pantalla completa y desplazamiento real hasta la última regla
{
  const paso = nuevoPaso('traza', 'COM', 'Trazabilidad: las 17 reglas que se activaron, en orden y con su origen');
  await tipearYEjecutar(paso, Q_TRAZA, 3);
  await p.waitForTimeout(1200);
  await pantallaCompleta();
  await captura(paso, 60);
  const caja = await frame().boundingBox();
  await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
  let anterior = -1;
  for (let i = 0; i < 80; i++) {
    await p.mouse.wheel(0, 14);
    await p.waitForTimeout(60);
    const pos = await frame().evaluate((el) => Math.max(...[...el.querySelectorAll('*')].map((e) => e.scrollTop)));
    if (pos === anterior) break;
    anterior = pos;
    await captura(paso, 2);
  }
  await captura(paso, 75);
}

// 6. El mismo grafo después de aplicar las reglas de los tres submódulos
{
  const paso = nuevoPaso('grafo_final', 'COM', 'El mismo caso después de las reglas: Interpretación, Materiales y Manufacturabilidad');
  await tipearYEjecutar(paso, Q_GRAFO, 2);
  await resultadoGrafo(paso, ['DIC-CU1', 'CONF-VOL-CAR-P-01', 'ALT-SEG-CAR-P-01', 'ALT-REF-CAR-P-01', 'REC-CU1']);
}

writeFileSync(join(SALIDA, 'manifiesto.json'), JSON.stringify(manifiesto, null, 2));
console.log(`✓ ${n} capturas en public/rec`);
await b.close();
