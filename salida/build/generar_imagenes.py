"""Genera las imágenes de salida/img/ a partir de los datos REALES de Neo4j (bolt://localhost:7687).

  red_semantica_integrada.png   núcleo de la red integrada (para la slide)
  red_semantica_completa.png    todos los frames no hoja y sus relaciones (anexo)
  jerarquia_frames.png          herencia ES_UN y composición ES_PARTE_DE
  cu1_instanciado.png           grafo instanciado del caso CU1 (Café Andino)
  cu2_instanciado.png           grafo instanciado del caso CU2 (letras corpóreas exterior)
  filtro_luciano.png            L-C1 y L-C3: la restricción del cliente admite / rechaza alternativas

Requiere que la base esté cargada completa (bash neo4j/cargar.sh).
"""
from collections import defaultdict
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Patch
from matplotlib.lines import Line2D
from neo4j import GraphDatabase

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "salida" / "img"
OUT.mkdir(parents=True, exist_ok=True)

COL = {"INT": "#2B6CB0", "MAT": "#2A9D8F", "MAN": "#D9480F", "COM": "#6B46C1", "TRZ": "#718096"}
FILL = {"INT": "#E3EEF9", "MAT": "#E0F4F1", "MAN": "#FDEBDD", "COM": "#EEE8FA", "TRZ": "#EDF0F4"}
NOMBRE_SUB = {"INT": "Interpretación (Matías)", "MAT": "Materiales e instalación (Lautaro)",
              "MAN": "Manufacturabilidad (Luciano)", "COM": "Compartido / integración", "TRZ": "Trazabilidad"}
plt.rcParams["font.family"] = "DejaVu Sans"

drv = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))


def q(cypher, **kw):
    with drv.session() as s:
        return s.run(cypher, **kw).data()


# ----------------------------------------------------------------------------- dibujo genérico
def dibujar(nodos, aristas, pos, archivo, titulo, figsize, fs=8.5, efs=6.8, leyenda=True, subs_leyenda=None,
            notas=None, curva=0.06, t_lab=None):
    t_lab = t_lab or {}
    """nodos: {id: (texto, sub, estilo)} estilo in {'normal','abstracto','externo','inferido','pendiente'}
    aristas: [(a, b, etiqueta, estilo)] estilo in {'normal','es_un','parte_de','regla','rechaza','admite','hist'}"""
    fig, ax = plt.subplots(figsize=figsize, dpi=200)
    ax.set_axis_off()
    xs = [p[0] for p in pos.values()]; ys = [p[1] for p in pos.values()]
    ax.set_xlim(min(xs) - 1.3, max(xs) + 1.3); ax.set_ylim(min(ys) - 0.9, max(ys) + 0.9)
    textos = {}
    for n, (txt, sub, estilo) in nodos.items():
        if n not in pos:
            continue
        ls = "--" if estilo in ("abstracto", "externo", "pendiente") else "-"
        fc = "white" if estilo in ("externo",) else FILL[sub]
        lw = 2.2 if estilo == "destacado" else 1.3
        textos[n] = ax.text(*pos[n], txt, ha="center", va="center", fontsize=fs, color="#1A202C", zorder=3,
                            fontweight="bold" if estilo == "destacado" else "normal",
                            bbox=dict(boxstyle="round,pad=0.35,rounding_size=0.6", fc=fc, ec=COL[sub], lw=lw, ls=ls))
    fig.canvas.draw()
    agrupadas = defaultdict(list)
    for a, b, lab, est in aristas:
        if a in textos and b in textos:
            agrupadas[(a, b, est)].append(lab)
    for (a, b, est), labs in agrupadas.items():
        lab = " / ".join(dict.fromkeys(l for l in labs if l))
        color = {"es_un": "#718096", "parte_de": "#718096", "rechaza": "#C53030", "admite": "#2F855A",
                 "hist": "#A0AEC0"}.get(est, "#4A5568")
        ls = {"es_un": (0, (4, 3)), "parte_de": (0, (1, 2)), "hist": (0, (2, 2))}.get(est, "-")
        style = "-|>" if est != "es_un" else "-|>"
        arr = FancyArrowPatch(pos[a], pos[b], patchA=textos[a].get_bbox_patch(), patchB=textos[b].get_bbox_patch(),
                              arrowstyle=style, mutation_scale=9, lw=1.6 if est in ("rechaza", "admite") else 0.9,
                              color=color, linestyle=ls, connectionstyle=f"arc3,rad={curva}", zorder=1,
                              shrinkA=1, shrinkB=1)
        if est == "es_un":
            arr.set_arrowstyle("-|>", head_length=0.5, head_width=0.35)
            arr.set_facecolor("white")
        ax.add_patch(arr)
        if lab:
            (x1, y1), (x2, y2) = pos[a], pos[b]
            t = t_lab.get((a, b), 0.5)
            mx, my = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            # desplazar levemente según la curvatura
            dx, dy = x2 - x1, y2 - y1
            mx += -dy * curva * 0.5; my += dx * curva * 0.5
            ax.text(mx, my, lab, fontsize=efs, ha="center", va="center", color=color if est in ("rechaza", "admite") else "#2D3748",
                    style="italic", zorder=2, bbox=dict(boxstyle="round,pad=0.12", fc="white", ec="none", alpha=0.85))
    ax.set_title(titulo, fontsize=fs + 5, fontweight="bold", color="#1A202C", loc="left", pad=10)
    if leyenda:
        subs = subs_leyenda or ["INT", "MAT", "MAN", "COM"]
        hs = [Patch(fc=FILL[s], ec=COL[s], label=NOMBRE_SUB[s]) for s in subs]
        hs += [Line2D([0], [0], color="#718096", ls=(0, (4, 3)), label="ES_UN (herencia)")] if any(e[3] == "es_un" for e in aristas) else []
        hs += [Patch(fc="white", ec="#4A5568", ls="--", label="borde discontinuo: abstracto / externo / [PENDIENTE]")]
        ax.legend(handles=hs, loc="lower left", fontsize=fs - 0.5, frameon=True, ncol=min(len(hs), 3),
                  bbox_to_anchor=(0, -0.06))
    if notas:
        ax.text(1.0, -0.035, notas, transform=ax.transAxes, ha="right", va="top", fontsize=fs - 1, color="#4A5568")
    fig.tight_layout()
    fig.savefig(OUT / archivo, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("✓", archivo)


# ----------------------------------------------------------------------------- red semántica (esquema)
frames = {r["n"]: r for r in q("MATCH (f:Frame) RETURN f.nombre AS n, f.submodulo AS sub, f.abstracto AS abs, f.pendiente AS pend")}
rels = q("MATCH (a:Frame)-[r]->(b:Frame) WHERE r.nivel = 'esquema' RETURN a.nombre AS a, type(r) AS t, b.nombre AS b")
esun = q("MATCH (a:Frame)-[r:ES_UN|ES_PARTE_DE]->(b:Frame) RETURN a.nombre AS a, type(r) AS t, b.nombre AS b")


def estilo_frame(n):
    f = frames[n]
    if f["pend"]:
        return "pendiente"
    if f["abs"]:
        return "abstracto"
    return "normal"


POS_COMPLETA = {
    "SM_Interpretacion": (0.5, 13.2), "Cliente": (5, 13.2), "Pedido": (5, 10.6), "ExpresionCliente": (8.6, 11.8),
    "ReferenciaVisual": (1.6, 11.0), "Requerimiento": (8.4, 9.2), "Preferencia": (6.6, 7.6), "NecesidadFuncional": (8.6, 7.6),
    "RestriccionCliente": (11.0, 7.9), "CategoriaDato": (0.4, 8.2), "Dato": (4.0, 7.4), "DatoConfirmado": (6.6, 5.6),
    "DatoFaltante": (4.2, 4.6), "DatoAmbiguo": (1.6, 5.6), "DatoEnConflicto": (2.4, 3.4), "Contradiccion": (0.4, 2.2),
    "Aclaracion": (3.4, 0.9), "ConsultaSubmodulo": (6.6, 2.8), "FichaRequerimientos": (10.0, 4.9), "Advertencia": (11.0, 2.4),
    "SM_Materiales": (8.6, 0.4), "SM_Manufacturabilidad": (13.6, 0.4),
    "Cartel": (14.8, 8.8), "Entorno": (13.0, 11.8), "AgenteAmbiental": (15.6, 13.4), "Material": (18.0, 12.2),
    "ComponenteElectrico": (12.6, 10.0), "SistemaFijacion": (17.6, 10.0), "Soporte": (20.2, 11.0),
    "DictamenAdecuacion": (14.2, 5.6), "VerificacionProfesional": (13.4, 3.4), "Conflicto": (17.4, 5.8),
    "Excepcion": (16.0, 1.4), "Regla": (18.6, 1.4),
    "Geometria": (20.4, 8.4), "TecnologiaIluminacion": (21.4, 13.2), "Herramienta": (23.8, 11.4),
    "RestriccionConstructiva": (23.2, 7.8), "AlternativaRediseno": (21.0, 4.6), "Recomendacion": (23.6, 2.8),
    "Evaluacion": (21.2, 1.0),
}
nodos = {n: (n, frames[n]["sub"], estilo_frame(n)) for n in POS_COMPLETA}
for n in ("SM_Materiales", "SM_Manufacturabilidad", "SM_Interpretacion"):
    nodos[n] = (n.replace("SM_", "Submódulo\n"), frames[n]["sub"], "externo")
aristas = [(r["a"], r["b"], r["t"], "normal") for r in rels]
aristas += [(r["a"], r["b"], "", "es_un") for r in esun if r["t"] == "ES_UN"]
dibujar(nodos, aristas, POS_COMPLETA, "red_semantica_completa.png",
        "Red semántica integrada — vista completa (frames no hoja, datos reales de Neo4j)", (26, 15.5), fs=9, efs=7)

POS_NUCLEO = {
    "Cliente": (0, 9), "Pedido": (0, 6.6), "ExpresionCliente": (-0.2, 4.2), "Dato": (2.6, 4.2), "Aclaracion": (2.6, 8.2),
    "RestriccionCliente": (5.6, 9.6), "FichaRequerimientos": (5.2, 4.2), "Advertencia": (5.2, 1.8),
    "Cartel": (9.0, 6.6), "Entorno": (7.2, 10.4), "Material": (13.4, 9.8), "ComponenteElectrico": (10.4, 10.9),
    "SistemaFijacion": (11.8, 7.8), "Soporte": (14.6, 7.8),
    "DictamenAdecuacion": (8.2, 3.0), "Conflicto": (11.2, 3.0),
    "Geometria": (12.0, 5.6), "Herramienta": (15.8, 10.6), "RestriccionConstructiva": (15.4, 5.6),
    "AlternativaRediseno": (14.4, 3.0), "Recomendacion": (14.4, 0.6), "Regla": (8.6, 0.6), "Evaluacion": (11.8, 0.6),
}
nodos = {n: (n, frames[n]["sub"], estilo_frame(n)) for n in POS_NUCLEO}
nucleo_rels = [(r["a"], r["b"], r["t"], "normal") for r in rels if r["a"] in POS_NUCLEO and r["b"] in POS_NUCLEO]
# especializaciones relevantes para el núcleo (DatoConfirmado/RestriccionCliente pasan por su padre)
nucleo_rels += [("FichaRequerimientos", "Dato", "REGISTRA (confirmados)", "normal"),
                ("Dato", "Aclaracion", "PROVOCA (faltante/ambiguo)", "normal")]
nucleo_rels = [e for e in nucleo_rels if not (e[0] == "Dato" and e[1] == "Aclaracion" and e[2] == "PROVOCA")
               and (e[0], e[1]) not in (("Evaluacion", "Pedido"), ("Conflicto", "Aclaracion"))]
dibujar(nodos, nucleo_rels, POS_NUCLEO, "red_semantica_integrada.png",
        "Red semántica integrada — núcleo (un solo grafo para los tres submódulos)", (17, 9.6), fs=10.5, efs=8,
        t_lab={("RestriccionCliente", "AlternativaRediseno"): 0.78, ("Conflicto", "Entorno"): 0.25, ("Dato", "Aclaracion"): 0.72,
               ("FichaRequerimientos", "Pedido"): 0.35, ("RestriccionCliente", "Cartel"): 0.3, ("Cartel", "Geometria"): 0.6},
        notas="Generado desde Neo4j: (:Frame)-[r {nivel:'esquema'}]->(:Frame). Vista completa: red_semantica_completa.png")

# ----------------------------------------------------------------------------- jerarquía
hijos = defaultdict(list)
for r in esun:
    if r["t"] == "ES_UN":
        hijos[r["b"]].append(r["a"])
raices = ["Dato", "Requerimiento", "Submodulo", "Material", "TecnologiaIluminacion", "RestriccionConstructiva", "AlternativaRediseno"]
pos, nodos, aristas = {}, {}, []
# árbol vertical: el padre arriba y sus especializaciones apiladas debajo (una columna por raíz)
COLW, ROWH = 4.2, 0.62
for gi, raiz in enumerate(raices):
    gx = gi * COLW
    hs = sorted(hijos[raiz])
    pos[raiz] = (gx, 0.0)
    nodos[raiz] = (raiz, frames[raiz]["sub"], "abstracto" if frames[raiz]["abs"] else "normal")
    for i, h in enumerate(hs):
        pos[h] = (gx + 0.35, -(i + 1) * ROWH - 0.25)
        nodos[h] = (h, frames[h]["sub"], "normal")
        aristas.append((h, raiz, "", "es_un"))
# composición: una fila inferior
partes = [r for r in esun if r["t"] == "ES_PARTE_DE"]
todos = sorted({r["b"] for r in partes})
ybase = -6 * ROWH - 0.9
xp = 0.0
for t in todos:
    ps = [r["a"] for r in partes if r["b"] == t]
    pos[t + "#"] = (xp, ybase)
    nodos[t + "#"] = (t, frames[t]["sub"], "normal")
    for i, p_ in enumerate(ps):
        pos[p_ + "#p"] = (xp + 0.35 + i * 3.0, ybase - 1.1)
        nodos[p_ + "#p"] = (p_, frames[p_]["sub"], "pendiente" if frames[p_]["pend"] else "normal")
        aristas.append((p_ + "#p", t + "#", "ES_PARTE_DE", "parte_de"))
    xp += max(len(ps), 1) * 3.0 + 1.5
dibujar(nodos, aristas, pos, "jerarquia_frames.png", "Jerarquía de frames — herencia (ES_UN) y composición (ES_PARTE_DE)",
        (20, 8.0), fs=12.5, efs=10, curva=0.0)


# ----------------------------------------------------------------------------- grafos instanciados
def etiqueta(n):
    f, i = n["frame"], n["id"]
    p = n["props"]
    def corto(s, k=30):
        s = str(s)
        return s if len(s) <= k else s[: k - 1] + "…"
    detalle = {
        "Cliente": lambda: "terminología: " + str(p.get("conoce_terminologia")),
        "Pedido": lambda: f"{p.get('estado')}\niteración {p.get('iteracion')}",
        "ExpresionCliente": lambda: "«" + corto(p.get("texto_literal"), 28) + "»",
        "ReferenciaVisual": lambda: corto(p.get("descripcion"), 30),
        "DatoConfirmado": lambda: f"{p.get('atributo')} = {corto(p.get('valor'), 22)}",
        "DatoFaltante": lambda: f"{p.get('atributo')}\ncriticidad = {p.get('criticidad')}",
        "DatoAmbiguo": lambda: f"{p.get('atributo')}",
        "Dato": lambda: f"{p.get('atributo')} = {p.get('valor')} ({p.get('estado')})",
        "Contradiccion": lambda: f"{p.get('tipo')} ({p.get('estado')})",
        "RestriccionCliente": lambda: corto(p.get("descripcion"), 30) + "\nrigidez = obligatoria",
        "Preferencia": lambda: corto(p.get("descripcion"), 28) + "\nrigidez = preferencia",
        "NecesidadFuncional": lambda: corto(p.get("efecto_buscado"), 30),
        "Aclaracion": lambda: f"{p.get('motivo')} ({p.get('estado')})",
        "ConsultaSubmodulo": lambda: f"{p.get('estado')}" + (f" → {p.get('respuesta')}" if p.get("respuesta") else ""),
        "FichaRequerimientos": lambda: "Ficha de requerimientos",
        "Advertencia": lambda: corto(p.get("texto"), 32),
        "Submodulo": lambda: p.get("responsable"),
        "Cartel": lambda: f"{p.get('tipo_cartel') or 'tipo s/d'} · {p.get('dimension_maxima_mm')} mm",
        "Geometria": lambda: f"dim. máx = {p.get('dimension_maxima_mm')} mm" + (f"\ncanal = {p.get('ancho_canal_mm')} mm" if p.get("ancho_canal_mm") else "") + ("\nsupera carga" if p.get("supera_carga_admisible") else ""),
        "Entorno": lambda: f"{p.get('tipo')} · exposición {p.get('nivel_exposicion')}",
        "Soporte": lambda: str(p.get("tipo")),
        "SistemaFijacion": lambda: str(p.get("tipo") or "[PENDIENTE]"),
        "ComponenteElectrico": lambda: "IP [PENDIENTE]",
        "Material": lambda: f"{p.get('nombre')} (apto ext. = {p.get('apto_exterior')})",
        "DictamenAdecuacion": lambda: f"{p.get('resultado')}\n({p.get('regla')})",
        "VerificacionProfesional": lambda: f"{p.get('tipo')} · {p.get('estado')}",
        "Conflicto": lambda: f"{p.get('tipo')} ({p.get('estado')})",
        "Herramienta": lambda: f"{p.get('tipo')}\n{p.get('volumen_util_maximo')} mm",
        "RestriccionConstructiva": lambda: f"{p.get('tipo')} ≤ {p.get('valor_limite')} {p.get('unidad') or ''}",
        "TecnologiaIluminacion": lambda: p.get("nombre"),
        "AlternativaRediseno": lambda: f"viable = {p.get('viable')}",
        "Recomendacion": lambda: f"{p.get('tipo')} · decide {p.get('decide')}",
        "Evaluacion": lambda: "rastro de decisión",
    }
    base = {"DatoConfirmado": "Dato", "DatoFaltante": "Dato", "DatoAmbiguo": "Dato", "PLA": "Material", "PETG": "Material",
            "SM_Materiales": "Submodulo", "SM_Manufacturabilidad": "Submodulo", "SM_Interpretacion": "Submodulo",
            "SegmentacionModular": "AlternativaRediseno", "CambioFijacion": "AlternativaRediseno",
            "CambioGeometria": "AlternativaRediseno", "CambioTecnologia": "AlternativaRediseno",
            "RestriccionVolumen": "RestriccionConstructiva", "RestriccionTrazo": "RestriccionConstructiva",
            "RestriccionPeso": "RestriccionConstructiva", "NeonFrontal": "TecnologiaIluminacion"}
    clave = f if f in detalle else base.get(f, f)
    try:
        d = detalle[clave]() if clave in detalle else ""
    except Exception:
        d = ""
    return f"{i} : {f}\n{d}".strip()


# (banda, columna) por frame; banda 0 = Interpretación, 1 = Materiales, 2 = Manufacturabilidad
UBIC = {
    "Cliente": (0, 0), "Pedido": (0, 1), "ExpresionCliente": (0, 2), "ReferenciaVisual": (0, 2),
    "Dato": (0, 3), "DatoConfirmado": (0, 3), "DatoFaltante": (0, 3), "DatoAmbiguo": (0, 3),
    "Contradiccion": (0, 4), "RestriccionCliente": (0, 4), "Preferencia": (0, 4), "NecesidadFuncional": (0, 4),
    "Aclaracion": (0, 5), "ConsultaSubmodulo": (0, 5), "FichaRequerimientos": (0, 6), "Advertencia": (0, 6),
    "SM_Interpretacion": (0, 6),
    "Cartel": (1, 1), "Entorno": (1, 2), "Soporte": (1, 3), "SistemaFijacion": (1, 2), "ComponenteElectrico": (1, 2),
    "DictamenAdecuacion": (1, 4), "VerificacionProfesional": (1, 5), "SM_Materiales": (1, 6),
    "Geometria": (2, 1), "Herramienta": (2, 2), "RestriccionVolumen": (2, 2), "RestriccionTrazo": (2, 2), "RestriccionPeso": (2, 2),
    "NeonFrontal": (2, 1), "PLA": (2, 3), "PETG": (2, 3), "SegmentacionModular": (2, 4), "CambioFijacion": (2, 5),
    "CambioGeometria": (2, 4), "CambioTecnologia": (2, 4), "Recomendacion": (2, 6), "Evaluacion": (2, 7),
    "SM_Manufacturabilidad": (2, 7),
}
SUB_FRAME = {"Cliente": "COM", "FichaRequerimientos": "COM", "Advertencia": "COM", "Cartel": "COM", "RestriccionCliente": "COM",
             "SistemaFijacion": "COM", "Conflicto": "COM", "Material": "COM", "PLA": "MAN", "PETG": "MAN", "Evaluacion": "TRZ"}


def grafo_caso(casos, archivo, titulo, extra_base=(), figsize=(22, 12.5), excluir_frames=("CategoriaDato",),
               colw=3.2, rowh=0.95, fs=7.6):
    datos = q("""
      MATCH (n:Instancia) WHERE n.caso IN $casos OR n.id IN $extra
      RETURN n.id AS id, n.frame AS frame, properties(n) AS props
    """, casos=list(casos), extra=list(extra_base))
    datos = [d for d in datos if d["frame"] not in excluir_frames]
    ids = {d["id"] for d in datos}
    rs = q("""
      MATCH (a:Instancia)-[r]->(b:Instancia) WHERE a.id IN $ids AND b.id IN $ids AND type(r) <> 'INSTANCIA_DE'
      RETURN a.id AS a, b.id AS b, type(r) AS t, r.regla AS regla
    """, ids=list(ids))
    celdas = defaultdict(list)
    info = {}
    for d in datos:
        f = d["frame"]
        if f == "Conflicto":
            ub = (1, 5) if d["props"].get("origen") == "instalacion" else (2, 3)
        elif f == "Advertencia" and not d["id"].startswith("AV2") and d["id"] != "AV1":
            ub = (1, 5)
        else:
            ub = UBIC.get(f, (0, 7))
        celdas[ub].append(d["id"])
        info[d["id"]] = d
    # alturas de banda según la columna más poblada
    alto = {b: max([len(v) for (bb, c), v in celdas.items() if bb == b] + [1]) for b in (0, 1, 2)}
    y0 = {2: 0.0}
    y0[1] = y0[2] + alto[2] * rowh + 1.0
    y0[0] = y0[1] + alto[1] * rowh + 1.0
    pos = {}
    for (b, c), lista in celdas.items():
        lista.sort()
        h = alto[b] * rowh
        for k, nid in enumerate(lista):
            y = y0[b] + h - (k + 0.5) * (h / len(lista))
            pos[nid] = (c * colw + (0.35 if (k % 2 and len(lista) > 3) else 0), y)
    nodos = {}
    for nid, d in info.items():
        f = d["frame"]
        sub = SUB_FRAME.get(f) or (q("MATCH (fr:Frame {nombre:$f}) RETURN fr.submodulo AS s", f=f) or [{"s": "COM"}])[0]["s"]
        p = d["props"]
        estilo = "normal"
        if f in ("Submodulo", "SM_Materiales", "SM_Manufacturabilidad", "SM_Interpretacion"):
            estilo = "externo"
        if p.get("pendiente") or f == "DatoFaltante" or p.get("dato_de_prueba"):
            estilo = "pendiente"
        if f in ("Recomendacion", "DictamenAdecuacion", "FichaRequerimientos"):
            estilo = "destacado"
        txt = etiqueta(d)
        if p.get("dato_de_prueba"):
            txt += "\n[dato de prueba simulado]"
        nodos[nid] = (txt, sub, estilo)
    aristas = []
    for r in rs:
        lab = r["t"] + (f" [{r['regla']}]" if r["regla"] else "")
        est = "rechaza" if r["t"] == "RECHAZA" else "admite" if r["t"] == "ADMITE" else "normal"
        aristas.append((r["a"], r["b"], lab, est))
    # bandas de fondo
    fig_notas = "Generado desde Neo4j (MATCH (n:Instancia {caso}) …). Borde discontinuo: faltante, [PENDIENTE] o dato simulado. [Rxx] = regla que creó la relación."
    dibujar(nodos, aristas, pos, archivo, titulo, figsize, fs=fs, efs=fs - 1.6, curva=0.04,
            subs_leyenda=["INT", "MAT", "MAN", "COM", "TRZ"], notas=fig_notas)
    return pos, y0, alto


grafo_caso(["CU1"], "cu1_instanciado_completo.png", "CU1 «Café Andino» — grafo instanciado en Neo4j (Interpretación → Materiales → Manufacturabilidad)",
           extra_base=["SM-MAT", "SM-MAN", "IMP3D", "RC-VOL"], figsize=(24, 13.5))
grafo_caso(["CU2"], "cu2_instanciado_completo.png", "CU2 «Letras corpóreas exterior» — grafo instanciado en Neo4j (FR-02 cruza los tres submódulos)",
           extra_base=["SM-MAT", "SM-MAN", "IMP3D", "RC-VOL", "MAT-PETG", "MAT-PLA"], figsize=(24, 13.5))


# ----------------------------------------------------------------------------- vistas curadas para las slides
def grafo_curado(posiciones, archivo, titulo, figsize=(16.5, 9.0), fs=10.4, t_lab=None):
    ids = list(posiciones)
    datos = q("MATCH (n:Instancia) WHERE n.id IN $ids RETURN n.id AS id, n.frame AS frame, properties(n) AS props", ids=ids)
    rs = q("""MATCH (a:Instancia)-[r]->(b:Instancia) WHERE a.id IN $ids AND b.id IN $ids AND type(r) <> 'INSTANCIA_DE'
              RETURN a.id AS a, b.id AS b, type(r) AS t, r.regla AS regla""", ids=ids)
    nodos = {}
    for d in datos:
        f, p = d["frame"], d["props"]
        sub = SUB_FRAME.get(f) or (q("MATCH (fr:Frame {nombre:$f}) RETURN fr.submodulo AS s", f=f) or [{"s": "COM"}])[0]["s"]
        estilo = "normal"
        if f.startswith("SM_"):
            estilo = "externo"
        if p.get("pendiente") or f == "DatoFaltante" or p.get("dato_de_prueba"):
            estilo = "pendiente"
        if f in ("Recomendacion", "DictamenAdecuacion", "FichaRequerimientos"):
            estilo = "destacado"
        txt = etiqueta(d)
        if f == "FichaRequerimientos":
            regs = q("MATCH (:FichaRequerimientos {id:$i})-[:REGISTRA]->(x) RETURN x.atributo + ' = ' + toString(x.valor) AS t ORDER BY x.id", i=d["id"])
            txt = d["id"] + " : FichaRequerimientos\n" + "\n".join(r["t"][:34] for r in regs)
        if p.get("dato_de_prueba"):
            txt += "\n[dato de prueba simulado]"
        nodos[d["id"]] = (txt, sub, estilo)
    aristas = []
    for r in rs:
        lab = r["t"] + (f" [{r['regla']}]" if r["regla"] else "")
        aristas.append((r["a"], r["b"], lab, "rechaza" if r["t"] == "RECHAZA" else "admite" if r["t"] == "ADMITE" else "normal"))
    dibujar(nodos, aristas, posiciones, archivo, titulo, figsize, fs=fs, efs=fs - 1.8, curva=0.03, t_lab=t_lab,
            subs_leyenda=["INT", "MAT", "MAN", "COM"],
            notas="Datos reales de Neo4j (vista con los nodos clave; grafo completo en *_completo.png). [Rxx] = regla que creó la relación.")


grafo_curado({
    "C-01": (0, 7.2), "P-01": (3.3, 7.2), "E13": (3.3, 9.0), "A4": (7.0, 9.0), "D4": (7.0, 7.2), "Q1": (7.0, 5.5),
    "SM-MAT": (3.3, 4.0), "D5": (10.8, 9.0), "FR-01": (10.8, 6.6), "NF1": (14.6, 7.6),
    "CAR-P-01": (10.8, 3.6), "FIJ-P-01": (7.0, 3.6), "SOP-P-01": (7.0, 2.2), "DIC-CU1": (14.6, 3.6), "ENT-P-01": (14.6, 2.0),
    "AV-EX02-CU1": (18.2, 3.6),
    "GEO-P-01": (10.8, 0.8), "RC-VOL": (7.0, 0.8), "IMP3D": (3.3, 0.8), "CONF-VOL-CAR-P-01": (7.0, -0.9),
    "ALT-SEG-CAR-P-01": (11.4, -0.9), "ALT-REF-CAR-P-01": (15.6, -0.9), "REC-CU1": (19.6, -0.9),
}, "cu1_instanciado.png", "CU1 «Café Andino» — de pedido incompleto a recomendación (instancias en Neo4j)",
   t_lab={("Q1", "SM-MAT"): 0.4, ("FR-01", "CAR-P-01"): 0.45})

grafo_curado({
    "C-02": (0, 7.2), "P-02": (3.3, 7.2), "RV2": (3.3, 9.0), "K1": (7.0, 9.0), "RC1": (7.0, 7.2), "PR1": (7.0, 5.6),
    "AV2": (10.8, 9.0), "FR-02": (10.8, 6.6),
    "CE-P-02": (7.0, 3.9), "CAR-P-02": (10.8, 3.6), "FIJ-P-02": (7.0, 2.5), "SOP-P-02": (3.3, 2.5),
    "DIC-CU2": (14.6, 4.6), "ENT-P-02": (14.6, 2.6), "CONF-IP-CU2": (18.4, 5.6), "CONF-MAT-CU2": (18.4, 4.1), "VP-CU2": (18.4, 2.6),
    "GEO-P-02": (10.8, 0.8), "RC-VOL": (7.0, 0.8), "IMP3D": (3.3, 0.8), "MAT-PETG": (14.6, 0.8),
    "CONF-VOL-CAR-P-02": (7.0, -0.9), "ALT-SEG-CAR-P-02": (11.4, -0.9), "ALT-REF-CAR-P-02": (15.6, -0.9), "REC-CU2": (19.6, -0.9),
}, "cu2_instanciado.png", "CU2 «Letras corpóreas exterior» — FR-02 cruza los tres submódulos (instancias en Neo4j)",
   t_lab={("RC1", "CAR-P-02"): 0.35, ("CONF-MAT-CU2", "ENT-P-02"): 0.3, ("CONF-IP-CU2", "ENT-P-02"): 0.3})

# ----------------------------------------------------------------------------- filtro (L-C1 y L-C3)
d = q("""
MATCH (r:RestriccionCliente)-[x:ADMITE|RECHAZA]->(a:AlternativaRediseno)<-[:EXIGE]-(k:Conflicto)
WHERE a.caso IN ['L-C1','L-C3']
MATCH (c:Cartel {caso:a.caso})-[:TIENE]->(g:Geometria)-[v:VIOLA]->(rc:RestriccionConstructiva)
RETURN a.caso AS caso, r.id AS rid, r.descripcion AS rdesc, type(x) AS t, x.regla AS regla,
       a.id AS aid, a.nombre AS anom, a.viable AS viable, k.id AS kid, k.tipo AS ktipo, k.detalle AS kdet,
       c.id AS cid, c.nombre AS cnom, g.id AS gid, rc.id AS rcid, rc.tipo AS rctipo, rc.valor_limite AS lim, v.regla AS vregla
""")
nodos, aristas, pos = {}, [], {}
fila = {"L-C1": 3.2, "L-C3": 0.0}
for r in d:
    y = fila[r["caso"]]
    nodos[r["cid"]] = (f"{r['cid']} : Cartel\n{r['cnom']}", "COM", "normal"); pos[r["cid"]] = (0, y)
    nodos[r["gid"]] = (f"{r['gid']} : Geometria", "MAN", "normal"); pos[r["gid"]] = (3.0, y)
    nodos[r["rcid"]] = (f"{r['rcid']} : Restricción\n{r['rctipo']} {'≤ ' + str(r['lim']) + ' mm' if r['lim'] else '[límite PENDIENTE]'}", "MAN", "normal"); pos[r["rcid"]] = (6.0, y)
    nodos[r["kid"]] = (f"{r['kid']} : Conflicto\n{r['ktipo']}", "COM", "normal"); pos[r["kid"]] = (9.0, y)
    alt_y = y + (0.75 if r["t"] == "RECHAZA" else -0.75)
    nodos[r["aid"]] = (f"{r['anom']}\nviable = {r['viable']}", "MAN", "destacado" if r["viable"] else "normal"); pos[r["aid"]] = (12.4, alt_y)
    nodos[r["rid"]] = (f"{r['rid']} : RestriccionCliente\n{r['rdesc']}", "COM", "normal"); pos[r["rid"]] = (16.4, y)
    aristas += [(r["cid"], r["gid"], "TIENE", "normal"), (r["gid"], r["rcid"], f"VIOLA [{r['vregla']}]", "normal"),
                (r["rcid"], r["kid"], "GENERA", "normal"), (r["kid"], r["aid"], "EXIGE", "normal"),
                (r["rid"], r["aid"], f"{r['t']} [{r['regla']}]", "rechaza" if r["t"] == "RECHAZA" else "admite")]
dibujar(nodos, aristas, pos, "filtro_luciano.png", "La restricción del cliente filtra las alternativas (casos L-C1 y L-C3 del PI2 de Luciano)",
        (19, 6.4), fs=10, efs=8.5, subs_leyenda=["MAN", "COM"], curva=0.0)
drv.close()
