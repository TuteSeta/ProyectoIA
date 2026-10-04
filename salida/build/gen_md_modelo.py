"""Genera salida/02_modelo_integrado.md desde modelo_spec.py (+ texto fijo)."""
from pathlib import Path
import modelo_spec as m

ROOT = Path(__file__).resolve().parents[2]
SUB = {"INT": "Interpretación (Matías)", "MAT": "Materiales (Lautaro)", "MAN": "Manufacturabilidad (Luciano)",
       "COM": "Compartido", "TRZ": "Trazabilidad"}


def esc(s):
    return str(s).replace("|", "\\|").replace("\n", " ")


def mermaid():
    nucleo = ["Cliente", "Pedido", "ExpresionCliente", "Dato", "Aclaracion", "ConsultaSubmodulo", "RestriccionCliente",
              "Preferencia", "NecesidadFuncional", "FichaRequerimientos", "Advertencia", "Cartel", "Entorno", "Material",
              "ComponenteElectrico", "SistemaFijacion", "Soporte", "DictamenAdecuacion", "VerificacionProfesional",
              "Conflicto", "Geometria", "Herramienta", "TecnologiaIluminacion", "RestriccionConstructiva",
              "AlternativaRediseno", "Recomendacion", "Evaluacion", "Regla", "Excepcion", "SM_Materiales", "Requerimiento"]
    sub = {f["nombre"]: f["sub"] for f in m.FRAMES}
    L = ["```mermaid", "flowchart LR"]
    grupos = {"INT": "Interpretación — Matías", "COM": "Compartido / integración", "MAT": "Materiales e instalación — Lautaro",
              "MAN": "Manufacturabilidad y rediseño — Luciano", "TRZ": "Trazabilidad"}
    for g, titulo in grupos.items():
        L.append(f'  subgraph {g}["{titulo}"]')
        for n in nucleo:
            if sub[n] == g:
                L.append(f"    {n}[{n}]")
        L.append("  end")
    vistos = set()
    for a, rel, b, _ in m.RELACIONES:
        if a in nucleo and b in nucleo and (a, b, rel) not in vistos:
            vistos.add((a, b, rel))
            L.append(f"  {a} -->|{rel}| {b}")
    for f in m.FRAMES:
        if f.get("padre") in nucleo and f["nombre"] in nucleo:
            L.append(f"  {f['nombre']} -.->|ES_UN| {f['padre']}")
    L += ["  classDef int fill:#E3EEF9,stroke:#2B6CB0", "  classDef mat fill:#E0F4F1,stroke:#2A9D8F",
          "  classDef man fill:#FDEBDD,stroke:#D9480F", "  classDef com fill:#EEE8FA,stroke:#6B46C1",
          "  classDef trz fill:#EDF0F4,stroke:#718096"]
    for g in grupos:
        ns = [n for n in nucleo if sub[n] == g]
        if ns:
            L.append(f"  class {','.join(ns)} {g.lower()}")
    L.append("```")
    return "\n".join(L)


def tabla_frames():
    out = []
    for f in m.FRAMES:
        if not f["slots"] and f.get("padre"):
            continue
        cab = f"### {f['nombre']}"
        meta = [f"*Submódulo:* {SUB[f['sub']]}", f"*Hereda de:* {f.get('padre') or '— (raíz)'}"]
        if f.get("parte_de"):
            meta.append(f"*Es parte de:* {f['parte_de']}")
        if f.get("abstracto"):
            meta.append("*abstracto*")
        meta.append(f"*Origen:* {f['origen']}")
        if f.get("pendiente"):
            meta.append(f"**{m.P_LAU}**")
        hijos = [h["nombre"] for h in m.FRAMES if h.get("padre") == f["nombre"]]
        if hijos:
            meta.append("*Especializaciones:* " + ", ".join(hijos))
        out += [cab, "", f.get("desc", ""), "", " · ".join(meta), ""]
        if f["slots"]:
            out += ["| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |", "|---|---|---|---|---|---|---|"]
            for s in f["slots"]:
                dem = "; ".join(f"{k}: {v}" for k, v in s["demonio"].items()) or "—"
                out.append(f"| {s['nombre']} | {esc(s['tipo'])} | {esc(s['valores']) or '—'} | {esc(s['defecto']) or '—'} | "
                           f"{s['card']} | {esc(dem)} | {esc(s['nota']) or '—'} |")
            out.append("")
    return "\n".join(out)


def tabla_reglas():
    out = ["| ID | Submódulo | SI (condición) | ENTONCES (conclusión) | Origen | Tipo | Fuente | Estado | Implementada |",
           "|---|---|---|---|---|---|---|---|---|"]
    for r in m.REGLAS:
        out.append(f"| **{r['id']}** | {r['sub']} | {esc(r['si'])} | {esc(r['entonces'])} | **{r['origen']}** | {esc(r['tipo'])} | "
                   f"{esc(r['fuente'])} | {esc(r['estado'])} | {esc(r['impl'])} |")
    return "\n".join(out)


def tabla_excepciones():
    out = ["| ID | Condición | Efecto | Modifica | Fuente |", "|---|---|---|---|---|"]
    for e in m.EXCEPCIONES:
        out.append("| " + " | ".join(esc(x) for x in e) + " |")
    return "\n".join(out)


DOC = f"""# 02 — Modelo integrado (Grupo 11)

Un solo modelo para los tres submódulos. Todo lo de este documento está cargado en Neo4j
(`neo4j/02_modelo.cypher` se genera desde la misma especificación: `salida/build/modelo_spec.py`).
Los tres submódulos están modelados desde su PI2 (el de Lautaro se incorporó el 04/10/2026: `pi2/Quiros_Lautaro_PI2_U1.md`).

## 1. Nombres unificados

| Concepto unificado | Matías (PI2) | Lautaro (PI2) | Luciano (PI2) | Por qué |
|---|---|---|---|---|
| **Cartel** | — (trabaja con Pedido/Dato) | Configuración del cartel (C1) + Cartel (C2) | Diseño | Es el objeto que se evalúa y rediseña. La Configuración de Lautaro es el Cartel con sus relaciones; su `estado` vive en `DictamenAdecuacion.resultado` (no_evaluable = pendiente_de_datos) |
| **FichaRequerimientos** | Ficha de requerimientos interpretados | ficha de requerimientos | FichaRequerimientos | Ya estaba alineado: es la interfaz entre submódulos |
| **Requerimiento → RestriccionCliente / Preferencia / NecesidadFuncional** | ídem, con `rigidez` | «restricciones del cliente» | RestricciónCliente (rigidez + fidelidad_logo, tamaño_final_fijo, no_invasiva) | Los slots booleanos de Luciano pasan a `criterio` + `nivel`; la rigidez es la de Matías |
| **Entorno** | Dato `entorno` | Entorno (C6) → Exposición ambiental (C8) | slot `Diseño.entorno` | Nodo propio con los slots del frame ENTORNO de Lautaro; la exposición (un estado) pasa a slot `nivel_exposicion` (variable difusa candidata) |
| **Conflicto** | — | Restricción (C15) con severidad excluyente / corregible | Conflicto | Mismo concepto: hallazgo que viola un límite o criterio. `origen` = instalación o manufactura; `severidad` decide el dictamen |
| **RestriccionConstructiva** | — | — | RestricciónConstructiva | Límite físico (6 mm, 400 mm). Se separa del hallazgo (Conflicto) |
| **DictamenAdecuacion** | — | Dictamen de adecuación (C19), que reúne restricciones, impone condiciones, establece requisitos y señala verificaciones | EvaluaciónMateriales | Salida de Lautaro y entrada de Luciano |
| **SistemaFijacion** / **Soporte** | — | Sistema de fijación (C11) se_ancla_en Soporte (C9) | SistemaFijación (sin. «Soporte») | Se elimina el sinónimo ambiguo: Soporte = superficie; SistemaFijacion = elementos de unión |
| **Material** | — | PLA, PETG, acrílico (alcance acotado al taller, M2) | PLA, PETG | Un frame con especializaciones PLA, PETG y Acrilico |
| **TecnologiaIluminacion** vs `tipo_cartel` | Dato tecnología (corpóreo) + iluminación | tiene_tecnología (Neón LED / Corpóreo / Retroiluminado) | NeónFrontal / Retroiluminado | El tipo de cartel (PG0) y la tecnología de iluminación son ejes distintos |
| **Recomendacion** | — | — | Recomendación (sin. «Dictamen») | «Dictamen» queda para Lautaro |
| **Aclaracion** | Aclaración / Consulta a submódulo | Solicitud de datos faltantes (C13) | «devolver al submódulo de interpretación» (R8) | Todo pedido al cliente pasa por Interpretación |
| **RequisitoMaterial / CondicionInstalacion** | — | Requisito de material (C17) / Condición de instalación (C16) | — (el requisito llega con el dictamen) | Frames nuevos del PI2 de Lautaro: lo que el material todavía no elegido debe cumplir y lo que hay que hacer para resolver una restricción corregible |
| **UTILIZA / SE_FIJA_CON** | — | usa, incorpora / se_fija_con | utiliza | Un verbo por relación |

## 2. Red semántica integrada

Imagen generada desde Neo4j: `salida/img/red_semantica_integrada.png` (núcleo) y
`salida/img/red_semantica_completa.png` (todos los frames no hoja). Diagrama Mermaid del núcleo:

{mermaid()}

**Reglas de diseño aplicadas.**
1. Relaciones nombradas con verbos en mayúsculas y dirigidas; el mismo verbo en el esquema y en las instancias
   (patrón del PI2 de Matías).
2. Un concepto, un nombre: los sinónimos se registran en la propiedad `sinonimos` del frame (tabla de la sección 1).
3. Herencia con `ES_UN` solo cuando la especialización comparte slots (Dato, Requerimiento, AlternativaRediseno,
   RestriccionConstructiva, Material, TecnologiaIluminacion, Submodulo); composición con `ES_PARTE_DE`.
4. Se separa **límite** (RestriccionConstructiva, criterio de entorno) de **hallazgo** (Conflicto): así Lautaro y
   Luciano comparten el mismo patrón «límite → se viola → conflicto → alternativa/condición».
5. Lo que viene de otro submódulo se modela como nodo compartido (Ficha, Cartel, Dictamen), no se duplica.
6. Las relaciones generadas por reglas llevan la propiedad `regla` → trazabilidad.
7. Lo que no está relevado no se inventa: queda como slot vacío con nota `[PENDIENTE: …]`.

Totales en Neo4j: {len(m.FRAMES)} frames, {sum(len(f['slots']) for f in m.FRAMES)} slots, {len(m.RELACIONES)} relaciones de esquema,
{len(m.REGLAS)} reglas, {len(m.EXCEPCIONES)} excepciones.

## 3. Jerarquía de frames (slots, facetas y demonios)

Imagen: `salida/img/jerarquia_frames.png`. Cómo se pasó de la red a los marcos:

| Elemento de la red | Elemento del marco | Elemento en Neo4j |
|---|---|---|
| Concepto | Frame | `(:Frame {{nombre, tipo:'clase', submodulo}})` |
| Atributo del concepto | Slot | `(:Frame)-[:TIENE_SLOT]->(:Slot)` |
| Restricción del atributo (tipo, rango, defecto, cardinalidad) | Faceta | propiedades del `:Slot` |
| Procedimiento asociado | Demonio (si_necesario / si_agregado / si_modificado) | propiedades del `:Slot`; la acción se implementa como consulta Cypher en 04 |
| es_un | Herencia | `(:Frame)-[:ES_UN]->(:Frame)`; en las instancias, etiquetas múltiples (`:Dato:DatoFaltante`) |
| Parte de | Composición | `(:Frame)-[:ES_PARTE_DE]->(:Frame)` |
| Instancia | Frame instancia | nodo con la etiqueta del frame + `:Instancia` + `[:INSTANCIA_DE]->(:Frame)` |
| Cambio de estado (M15) | Reclasificación | `REMOVE d:DatoFaltante SET d:DatoConfirmado` |

{tabla_frames()}

## 4. Reglas trazables

Origen: **experto** = conocimiento relevado de Luciano (en Lautaro, R-MI-01 a R-MI-11: criterios del experto
formalizados en su PI2, con los umbrales como parámetros «a validar»); **propuesta** = regla formulada por nosotros
(Matías, integración, y R-MI-12/13/14, que Lautaro agregó al modelar) pendiente de validar con el experto;
**documental** = sale de una ficha técnica o norma. En Neo4j cada regla es un nodo `:Regla` con `[:USA]->(:Slot)`.

{tabla_reglas()}

**Estrategia de resolución de conflictos.** Se conserva la de Matías (INT-R09 → INT-R13 → detección → clasificación →
aclaraciones → INT-R11 → INT-R12) y se extiende al flujo integrado: Interpretación → INTEG-01 → Materiales
(orden de disparo del PI2 de Lautaro: R-MI-01 → exposición R-MI-08/02/09 → detección R-MI-03…07, 13, 14, que se
acumulan → dictamen R-MI-12 > R-MI-11 > R-MI-10) → Manufacturabilidad (MAN-R7 → detección R2/R3/R4 → filtros
R6/R5/R9/FILTRO → R8) → INTEG-02. Es el orden de los bloques de `neo4j/04_consultas.cypher`.

### Excepciones

{tabla_excepciones()}

## 5. Incertidumbre → candidatos a variables difusas

Ninguna tiene funciones de pertenencia ni rangos relevados: todo es **próximo paso (PI3)**. Hoy se modelan como
marcadores crisp.

| Variable lingüística | Términos tentativos | Dónde vive en el modelo | Fuente |
|---|---|---|---|
| Exposición ambiental | baja / media / alta | `Entorno.nivel_exposicion` (R-MI-02, R-MI-08, R-MI-09) | PI2 Lautaro §i (principal candidata) |
| Porte del cartel y carga de viento | chico / intermedio / grande | R-MI-06 (FR-02 quedó en la frontera) | PI2 Lautaro §i |
| Confiabilidad del soporte | poco confiable / aceptable / confiable | `Soporte.capacidad_relativa`, `Soporte.estado` | PI2 Lautaro §i |
| Efectividad de la protección | nula / parcial / efectiva | `Entorno.alcance_proteccion` (R-MI-08) | PI2 Lautaro §i |
| Peso respecto del soporte | holgado / en el límite / excedido | R-MI-05 (umbral a validar) | PI2 Lautaro §i |
| Dificultad de instalación | baja / media / alta | (no modelada como slot) | PI2 Lautaro §i |
| Flexibilidad estética del cliente | Baja / Media / Alta | `RestriccionCliente.nivel` (MAN-R5) | PI2 Luciano §i |
| Complejidad de fabricación | Rutinaria / Moderada / Crítica | (no modelada aún) | PI2 Luciano §i |
| Fidelidad al logo / impacto estético | Imperceptible / Aceptable / Deformativo | `AlternativaRediseno.impacto_estetico` (MAN-R6) | PI2 Luciano §i |
| Exceso de peso | Seguro / En el límite / Peligroso | `Geometria.supera_carga_admisible` (MAN-R4) | PI2 Luciano §i |
| Grado de ambigüedad, suficiencia, rigidez, criticidad, precisión de la dimensión | baja/media/alta; insuficiente/parcial/suficiente; … | `Pedido.estado`, `Requerimiento.rigidez`, `DatoFaltante.criticidad`, `Dato.precision` | PI2 Matías §i |

Forma prevista de combinación (propuesta, sin validar): las reglas crisp siguen decidiendo lo excluyente
(p. ej. INT-R09, MAN-R2/R3); las variables difusas se usarían para **ordenar** alternativas viables y graduar el
dictamen (p. ej. un índice de adecuación). `[PENDIENTE: conjuntos, rangos y reglas difusas con el experto]`.

## 6. Casos de uso integrados (cruzan los tres submódulos)

### CU1 — «Café Andino»: el sistema sabe cuándo NO avanzar

Base: P-01 del PI2 de Matías (iteraciones 1 y 2, tal cual) + regla R-MI-01 de Lautaro + MAN-R3 de Luciano.

| Paso | Submódulo | Entrada | Regla | Salida |
|---|---|---|---|---|
| 1 | Interpretación | «cartel de neón… Café Andino… pared… más o menos un metro… lindo de noche» + foto | INT-R01 ×3, INT-R02, INT-R07, INT-R10 | 3 ambiguos, D4 faltante, NF1, A1–A4, Q1 a Materiales |
| 2 | Interpretación | respuesta: «adentro… el metro es el largo… como la foto» | INT-R13 | D3 interior, D5 ≈ 1 m, NF1 cubre la tecnología; D4 sigue faltante |
| 3 | **Materiales** | Q1: ¿D4 es bloqueante? | **R-MI-01** | **bloqueante** (sin soporte no se evalúa) — resuelve el criterio que el PI2 de Matías dejó pendiente |
| 4 | Interpretación | — | INT-R11 | **no se cumple**: P-01 queda pendiente (no inventa el soporte, INT-R09) |
| 5 | Interpretación | respuesta a A4 **[dato de prueba simulado]**: «pared de ladrillo revocado… pegado a la pared» | INT-R13, INT-R09 | D4 confirmado (mampostería, adosado), iteración 3 |
| 6 | Interpretación | — | INT-R11 | listo → **FR-01** |
| 7 | Integración | FR-01 | INTEG-01 | Cartel 1000 mm, interior, mampostería; tecnología `[PENDIENTE]` |
| 8 | **Materiales** | Cartel + Entorno + Soporte | R-MI-01, R-MI-GEN, R-MI-10 | exposición baja (humedad normal y sin sol directo: valores por defecto del frame); mampostería = buen soporte → **apto** |
| 9 | **Manufacturabilidad** | Geometría 1000 mm vs impresora 400 mm | MAN-R3, MAN-FILTRO | ExcedeCama → **Segmentación modular + refuerzo**, viables |
| 10 | Integración | — | INTEG-02 | Recomendación; **decide el fabricante** |

### CU2 — «Letras corpóreas exterior»: FR-02 cruza los tres submódulos

Base: P-02 / FR-02 del PI2 de Matías + **caso 1 del PI2 de Lautaro** (FR-02, apto con condiciones) + «Continuidad»
del PI2 de Luciano (R3 y R7 sobre FR-02). Los tres PI2 usan el mismo caso: la integración no es inventada.

| Paso | Submódulo | Entrada | Regla | Salida |
|---|---|---|---|---|
| 1 | Interpretación | «letras corpóreas con luz… da a la calle… 3 m… sí o sí antes de la inauguración… si se puede colores del logo» + foto sin luz | INT-R03, R04, R05, R02, R10 | K1 contradicción, RC1 obligatoria, PR1 preferencia, D11 faltante |
| 2 | Interpretación | «llevan luz; la foto era por la tipografía; sobre la marquesina a 4 m» | INT-R13, R11, R12 | **FR-02** + AV2 (la referencia solo vale para tipografía) |
| 3 | Integración | FR-02 | INTEG-01 | Cartel corpóreo, con luz, 3000 mm, exterior, sobre estructura (marquesina), 4 m; sin material ni componentes |
| 4 | **Materiales** | Cartel + Entorno | R-MI-01, R-MI-02 | datos mínimos OK (falta material: no bloquea); exposición **alta** (sin protección superior) |
| 5 | **Materiales** | material / componentes / soporte / altura | R-MI-13, R-MI-14, R-MI-06 | requisitos RQ-MAT (cuerpo y frente aptos exterior/UV) y RQ-COMP (protección contra agua, IP a validar); condiciones «relevar la marquesina» y «fuente accesible»; verificación estructural (altura y viento) |
| 6 | **Materiales** | — | R-MI-11 | sin restricciones excluyentes → **apto con condiciones** |
| 6b | **Manufacturabilidad** | entorno exterior + RQ-MAT | MAN-R7, INTEG-03 | **PETG** (descarta PLA) → cumple el requisito de material de Lautaro para el cuerpo |
| 7 | **Manufacturabilidad** | 3000 mm vs 400 mm | MAN-R3, MAN-FILTRO | Segmentación (= letra por letra) + refuerzo; advertencia: impacto en RC1 (plazo) `[PENDIENTE]` |
| 8 | Integración | — | INTEG-02 | Recomendación con material, alternativas y condiciones de instalación; decide el fabricante |

### Caso de prueba complementario de Materiales: FR-07 (caso 2 del PI2 de Lautaro)

Neón LED doble faz en bandera sobre la vereda, 3 m de altura, fachada de mampostería con alero de 0,4 m (el cartel
sobresale 1,0 m). El cliente quiere reutilizar el Neón LED y la fuente de interior; la fuente iría cerrada en la caja.

| Paso | Regla | Salida |
|---|---|---|
| 1 | R-MI-01 | datos mínimos completos |
| 2 | R-MI-08 → R-MI-02 | la excepción del alero **se evalúa y no aplica** (no cubre) → exposición alta; queda registrada (EXC-FR-07) |
| 3 | R-MI-03 | restricción **eléctrica excluyente**, causada por el Neón LED, la fuente y la exposición |
| 4 | R-MI-07 | restricción de mantenimiento **corregible** → condición «fuente accesible y protegida» |
| 5 | R-MI-06 | verificación estructural (bandera sobre la vereda + viento) |
| 6 | R-MI-12 | **no apto** (prioridad sobre R-MI-11); pasa a Manufacturabilidad con todas las causas |

Manufacturabilidad no genera recomendación: cambiar componentes o reubicar la fuente es rediseño, y el PI2 de
Luciano no tiene regla para eso `[PENDIENTE: regla de rediseño para restricciones eléctricas y de mantenimiento]`.
Imagen: `salida/img/fr07_instanciado.png`.

### Casos de prueba complementarios (submódulo de Luciano)

L-C1 (trazo 4 mm < 6 mm, fidelidad alta → MAN-R6 rechaza engrosar, admite retroiluminado), L-C2 (Ø 500 mm, tamaño
fijo → segmentación admitida) y L-C3 (peso > cinta bifaz, no invasiva → MAN-R9 rechaza fijación, admite reducir
infill). Se usan para mostrar el **filtro por restricciones del cliente** (`salida/img/filtro_luciano.png`).

## 7. Observaciones del modelado (para la defensa)

- La integración resolvió un hueco real: la criticidad «bloqueante/postergable» que Matías no podía decidir la
  responde la regla R-MI-01 de Lautaro (consulta Q1). Es el tipo de dependencia que el modelo separado no mostraba.
- El requisito de material que deja Lautaro cuando la ficha no trae material (R-MI-13) lo cumple una regla documental
  de Luciano (MAN-R7 → PETG): `RequisitoMaterial -[:SE_CUMPLE_CON]-> Material`. Lautaro no elige el material, pero deja
  la evidencia que la regla de Luciano necesita (así lo dice su PI2).
- Con el PI2 de Lautaro el dictamen cubre los tres resultados: apto (CU1), apto con condiciones (CU2) y no apto (FR-07).
- R-MI-12/13/14 son reglas nuevas que surgieron al modelar (no del relevamiento): se marcan como **propuesta**.
- Inconsistencia detectada en el material: el conjunto provisional `datos_requeridos` incluye «apariencia», pero
  FR-02 no registra ningún dato de apariencia y aun así el PI2 de Matías lo da por suficiente. Se mantiene el
  resultado documentado (P-02 listo) y se marca para revisar `[PENDIENTE]`.
- Tras una reclasificación (M15) quedan relaciones históricas (p. ej. `P-01 OMITE D4` con D4 ya confirmado): es
  intencional, conserva la traza.
"""

if __name__ == "__main__":
    (ROOT / "salida" / "02_modelo_integrado.md").write_text(DOC, encoding="utf-8")
    print("ok")
