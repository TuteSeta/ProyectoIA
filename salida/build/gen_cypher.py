"""Genera neo4j/01_esquema.cypher y neo4j/02_modelo.cypher desde modelo_spec.py."""
from pathlib import Path
import modelo_spec as m

ROOT = Path(__file__).resolve().parents[2]
NEO = ROOT / "neo4j"


def q(v):
    """Literal Cypher para strings/listas/bool/números."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, (list, tuple)):
        return "[" + ", ".join(q(x) for x in v) + "]"
    return "'" + str(v).replace("\\", "\\\\").replace("'", "\\'") + "'"


INSTANCE_LABELS = ["Cliente", "Pedido", "ExpresionCliente", "ReferenciaVisual", "Requerimiento", "Dato",
                   "CategoriaDato", "Contradiccion", "Aclaracion", "ConsultaSubmodulo", "FichaRequerimientos",
                   "Advertencia", "Submodulo", "Cartel", "Entorno", "Material", "ComponenteElectrico", "Soporte",
                   "SistemaFijacion", "DictamenAdecuacion", "VerificacionProfesional", "Geometria", "Herramienta",
                   "TecnologiaIluminacion", "RestriccionConstructiva", "Conflicto", "AlternativaRediseno",
                   "Recomendacion", "Evaluacion", "CondicionInstalacion", "RequisitoMaterial", "AgenteAmbiental"]


def esquema():
    out = ["// 01_esquema.cypher — Constraints de unicidad e índices (idempotente: IF NOT EXISTS)",
           "// Generado por salida/build/gen_cypher.py desde salida/build/modelo_spec.py", ""]
    out.append("CREATE CONSTRAINT frame_nombre IF NOT EXISTS FOR (n:Frame) REQUIRE n.nombre IS UNIQUE;")
    out.append("CREATE CONSTRAINT slot_id IF NOT EXISTS FOR (n:Slot) REQUIRE n.id IS UNIQUE;")
    out.append("CREATE CONSTRAINT regla_id IF NOT EXISTS FOR (n:Regla) REQUIRE n.id IS UNIQUE;")
    out.append("CREATE CONSTRAINT excepcion_id IF NOT EXISTS FOR (n:Excepcion) REQUIRE n.id IS UNIQUE;")
    for lab in INSTANCE_LABELS:
        out.append(f"CREATE CONSTRAINT {lab.lower()}_id IF NOT EXISTS FOR (n:{lab}) REQUIRE n.id IS UNIQUE;")
    out.append("CREATE INDEX frame_submodulo IF NOT EXISTS FOR (n:Frame) ON (n.submodulo);")
    out.append("CREATE INDEX instancia_caso IF NOT EXISTS FOR (n:Instancia) ON (n.caso);")
    out.append("CREATE INDEX regla_origen IF NOT EXISTS FOR (n:Regla) ON (n.origen);")
    return "\n".join(out) + "\n"


def modelo():
    o = ["// 02_modelo.cypher — Red semántica integrada + jerarquía de frames (slots y facetas) + reglas + excepciones",
         "// Generado por salida/build/gen_cypher.py desde salida/build/modelo_spec.py (no editar a mano).",
         "// Patrón: (:Frame {tipo:'clase'}) -[:ES_UN]-> padre ; -[:ES_PARTE_DE]-> todo ; -[:TIENE_SLOT]-> (:Slot)",
         "//         facetas como propiedades del Slot; relaciones de la red semántica entre frames con el mismo",
         "//         verbo que usan las instancias; (:Regla)-[:USA]->(:Slot) ; (:Excepcion)-[:MODIFICA]->(:Regla)", ""]
    o.append("// ---------- 1. Frames (conceptos de la red) ----------")
    for f in m.FRAMES:
        props = dict(tipo="clase", submodulo=f["sub"], descripcion=f.get("desc", ""), origen=f.get("origen", ""),
                     sinonimos=f.get("sin", ""), abstracto=bool(f.get("abstracto")),
                     pendiente=(m.P_LAU if f.get("pendiente") else ""))
        sets = ", ".join(f"n.{k} = {q(v)}" for k, v in props.items())
        o.append(f"MERGE (n:Frame {{nombre: {q(f['nombre'])}}}) SET {sets};")
    o.append("")
    o.append("// ---------- 2. Herencia (ES_UN) y composición (ES_PARTE_DE) ----------")
    for f in m.FRAMES:
        if f.get("padre"):
            o.append(f"MATCH (h:Frame {{nombre: {q(f['nombre'])}}}), (p:Frame {{nombre: {q(f['padre'])}}}) MERGE (h)-[:ES_UN]->(p);")
        if f.get("parte_de"):
            o.append(f"MATCH (h:Frame {{nombre: {q(f['nombre'])}}}), (p:Frame {{nombre: {q(f['parte_de'])}}}) MERGE (h)-[:ES_PARTE_DE]->(p);")
    o.append("")
    o.append("// ---------- 3. Slots con facetas y demonios ----------")
    for f in m.FRAMES:
        for s in f["slots"]:
            sid = f"{f['nombre']}.{s['nombre']}"
            d = s["demonio"]
            props = dict(nombre=s["nombre"], frame=f["nombre"], tipo_dato=s["tipo"], valores_permitidos=s["valores"],
                         valor_defecto=s["defecto"], cardinalidad=s["card"], si_necesario=d.get("si_necesario", ""),
                         si_agregado=d.get("si_agregado", ""), si_modificado=d.get("si_modificado", ""), nota=s["nota"])
            sets = ", ".join(f"s.{k} = {q(v)}" for k, v in props.items())
            o.append(f"MERGE (s:Slot {{id: {q(sid)}}}) SET {sets};")
            o.append(f"MATCH (f:Frame {{nombre: {q(f['nombre'])}}}), (s:Slot {{id: {q(sid)}}}) MERGE (f)-[:TIENE_SLOT]->(s);")
    o.append("")
    o.append("// ---------- 4. Relaciones de la red semántica integrada ----------")
    for a, rel, b, fuente in m.RELACIONES:
        o.append(f"MATCH (a:Frame {{nombre: {q(a)}}}), (b:Frame {{nombre: {q(b)}}}) MERGE (a)-[r:{rel}]->(b) SET r.fuente = {q(fuente)}, r.nivel = 'esquema';")
    o.append("")
    o.append("// ---------- 5. Reglas trazables ----------")
    for r in m.REGLAS:
        props = dict(nombre=r["nombre"], submodulo=r["sub"], condicion=r["si"], conclusion=r["entonces"], origen=r["origen"],
                     tipo=r["tipo"], fuente=r["fuente"], estado_validacion=r["estado"], implementacion=r["impl"])
        sets = ", ".join(f"n.{k} = {q(v)}" for k, v in props.items())
        o.append(f"MERGE (n:Regla {{id: {q(r['id'])}}}) SET {sets};")
        for u in r["usa"]:
            o.append(f"MATCH (n:Regla {{id: {q(r['id'])}}}), (s:Slot {{id: {q(u)}}}) MERGE (n)-[:USA]->(s);")
    o.append("")
    o.append("// ---------- 6. Excepciones ----------")
    for eid, cond, efecto, regla, fuente in m.EXCEPCIONES:
        o.append(f"MERGE (e:Excepcion {{id: {q(eid)}}}) SET e.condicion = {q(cond)}, e.efecto = {q(efecto)}, e.fuente = {q(fuente)};")
        o.append(f"MATCH (e:Excepcion {{id: {q(eid)}}}), (r:Regla {{id: {q(regla)}}}) MERGE (e)-[:MODIFICA]->(r);")
    return "\n".join(o) + "\n"


if __name__ == "__main__":
    (NEO / "01_esquema.cypher").write_text(esquema(), encoding="utf-8", newline="\n")
    (NEO / "02_modelo.cypher").write_text(modelo(), encoding="utf-8", newline="\n")
    print("ok")
