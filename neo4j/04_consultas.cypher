// 04_consultas.cypher — Reglas como consultas Cypher + consultas que demuestran los casos de uso
//
// Parte A ejecuta las reglas de los tres submódulos sobre las instancias de 03 (todo con MERGE/SET:
// se puede correr varias veces sin duplicar). Parte B son consultas de lectura para la presentación.
// Los nodos creados por reglas llevan la etiqueta :Inferido; las relaciones, la propiedad `regla`.
// Cada regla que dispara se registra en el rastro (:Evaluacion)-[:ACTIVO {orden}]->(:Regla).
//
// Formato de los marcadores (los usan demo.sh y salida/build/generar_resultados.py):
//   // @paso NN | <corta|extra|silencio> | <caso> | <título>
//   corta    = se muestra en la demo corta y en la completa
//   extra    = se muestra solo en la demo completa (demo.sh --completa)
//   silencio = se ejecuta sin mostrarse (necesario para los pasos siguientes)

// =====================================================================================
// PARTE A — CU1 «Café Andino»: Interpretación ↔ Materiales
// =====================================================================================

// @paso 01 | corta | CU1 | ¿Por qué el pedido P-01 todavía no puede evaluarse?
// Caso de uso: CU1 (Interpretación). Esperado: P-01 pendiente_de_aclaracion, D4 faltante sin clasificar,
// A4 pendiente y Q1 (consulta a Materiales) sin responder.
MATCH (p:Pedido {id:'P-01'})
RETURN p.id AS pedido, p.estado AS estado, p.iteracion AS iteracion,
       COLLECT { MATCH (d:DatoFaltante {caso:p.caso}) RETURN d.id + ' ' + d.atributo + ' (criticidad=' + d.criticidad + ')' } AS faltantes,
       COLLECT { MATCH (d:DatoAmbiguo {caso:p.caso}) RETURN d.id } AS ambiguos,
       COLLECT { MATCH (a:Aclaracion {caso:p.caso, estado:'pendiente'}) RETURN a.id + ': ' + a.pregunta } AS aclaraciones_pendientes,
       [(q:ConsultaSubmodulo {caso:p.caso})-[:SE_DIRIGE_A]->(s) | q.id + ' -> ' + s.id + ' (' + q.estado + ')'] AS consultas;

// @paso 02 | corta | CU1 | Materiales responde la consulta Q1 con su regla R-MI-01
// Caso de uso: CU1 (Interpretación ↔ Materiales). Esperado: Q1 = bloqueante, porque R-MI-01 (Lautaro) dice
// que sin soporte no se evalúa la instalación. Es el criterio de criticidad que el PI2 de Matías dejó pendiente.
MATCH (q:ConsultaSubmodulo {estado:'pendiente'})-[:SE_DIRIGE_A]->(:Submodulo {id:'SM-MAT'}),
      (q)-[:CONSULTA_SOBRE]->(d:DatoFaltante)
WHERE d.categoria IN ['entorno','dimensiones'] OR d.atributo STARTS WITH 'soporte'
SET q.estado = 'respondida', q.respuesta = 'bloqueante', q.regla = 'R-MI-01', d.criticidad = 'bloqueante'
WITH q, d
MERGE (ev:Evaluacion {id:'EV-' + q.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = q.caso, ev.frame = 'Evaluacion'
WITH q, d, ev
WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act
MATCH (r:Regla {id:'R-MI-01'})
MERGE (ev)-[a:ACTIVO {paso:'Q'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = q.id
RETURN q.id AS consulta, d.id AS dato, d.atributo AS atributo, q.respuesta AS respuesta,
       'R-MI-01: si falta entorno, soporte o dimensiones, no evaluar y pedir el dato' AS justificacion;

// @paso 03 | silencio | CU1 | INT-R11 evalúa la suficiencia de P-01 (no se cumple)
// Caso de uso: CU1. Esperado: R11 no se cumple (D4 bloqueante); P-01 sigue pendiente.
MATCH (p:Pedido) WHERE p.estado <> 'listo_para_evaluacion'
WITH p,
     [c IN p.datos_requeridos WHERE NOT (
          EXISTS { MATCH (d:DatoConfirmado {caso:p.caso, categoria:c}) }
       OR EXISTS { MATCH (nf:NecesidadFuncional {caso:p.caso})-[:CUBRE]->(:CategoriaDato {nombre:c}) }
       OR EXISTS { MATCH (d:DatoFaltante {caso:p.caso, categoria:c, criticidad:'postergable'}) })] AS sin_cubrir,
     COLLECT { MATCH (d:DatoFaltante {caso:p.caso}) WHERE d.criticidad <> 'postergable' RETURN d.id + ' (' + d.criticidad + ')' } AS faltantes_que_bloquean,
     COLLECT { MATCH (d:DatoAmbiguo {caso:p.caso}) RETURN d.id } AS ambiguos,
     COLLECT { MATCH (k:Contradiccion {caso:p.caso, estado:'abierta'}) RETURN k.id } AS contradicciones_abiertas
WITH p, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas,
     size(sin_cubrir) = 0 AND size(faltantes_que_bloquean) = 0 AND size(ambiguos) = 0 AND size(contradicciones_abiertas) = 0 AS cumple
SET p.estado = CASE WHEN cumple THEN 'listo_para_evaluacion' ELSE p.estado END
RETURN p.id AS pedido, cumple AS R11_se_cumple, p.estado AS estado, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas;

// @paso 04 | extra | CU1 | Llega la respuesta del cliente a A4 (dato de prueba simulado) → INT-R13 e INT-R09
// Caso de uso: CU1. La respuesta a A4 NO está en el PI2 de Matías: se agrega como dato de prueba para que el
// caso llegue a los otros submódulos. Esperado: E13 nueva, D4 pasa de DatoFaltante a DatoConfirmado
// (cambio de etiqueta, M15), iteración 3. INT-R09 solo deja asignar valores con origen del cliente.
MATCH (p:Pedido {id:'P-01'}), (d:DatoFaltante {id:'D4'})-[:PROVOCA]->(a:Aclaracion {id:'A4', estado:'pendiente'})
MERGE (e:ExpresionCliente {id:'E13'})
SET e:Instancia:Inferido, e.caso = 'CU1', e.frame = 'ExpresionCliente', e.fuente = 'respuesta_a_aclaracion',
    e.texto_literal = 'Es la pared de ladrillo revocado de atrás del mostrador; el cartel va pegado a la pared.',
    e.dato_de_prueba = 'SIMULADO: la respuesta a A4 no figura en el PI2 de Matías'
MERGE (p)-[:CONTIENE]->(e)
SET a.estado = 'respondida'
MERGE (a)-[:ACTUALIZA {regla:'INT-R13'}]->(p)
MERGE (e)-[:APORTA {regla:'INT-R13'}]->(d)
WITH p, d, 'respuesta_a_aclaracion' AS origen_nuevo
WHERE origen_nuevo IN ['cliente', 'respuesta_a_aclaracion']          // INT-R09: no se aceptan valores supuestos
SET d.valor = 'pared de mampostería, adosado', d.soporte = 'mamposteria', d.montaje = 'adosado',
    d.origen = origen_nuevo, d.estado = 'confirmado', d.frame = 'DatoConfirmado', d.criticidad = null
REMOVE d:DatoFaltante
SET d:DatoConfirmado,
    p.iteracion = p.iteracion + 1, p.estado = 'en_interpretacion',
    p.historial = p.historial + ['it3: respuesta a A4 (INT-R13, dato de prueba simulado): D4 confirmado, soporte = mampostería']
WITH p, d
MERGE (ev:Evaluacion {id:'EV-CU1'})
WITH p, d, ev, COUNT { (ev)-[:ACTIVO]->() } AS n_act
UNWIND range(0, 1) AS i
MATCH (r:Regla {id: ['INT-R09', 'INT-R13'][i]})
MERGE (ev)-[a:ACTIVO {paso:'it3'}]->(r) ON CREATE SET a.orden = n_act + i + 1, a.submodulo = 'INT', a.sobre = d.id
WITH DISTINCT p, d
RETURN p.id AS pedido, p.iteracion AS iteracion, d.id AS dato, labels(d) AS etiquetas, d.valor AS valor, d.origen AS origen;

// @paso 05 | corta | CU1 | INT-R11 de nuevo: P-01 queda listo y se genera la ficha FR-01
// Caso de uso: CU1. Esperado: R11 se cumple → P-01 listo_para_evaluacion; se crea FR-01 con D2, D3, D4, D5 y NF1;
// INT-R12 no genera advertencias (no quedan faltantes postergables).
MATCH (p:Pedido) WHERE p.estado <> 'listo_para_evaluacion'
WITH p,
     [c IN p.datos_requeridos WHERE NOT (
          EXISTS { MATCH (d:DatoConfirmado {caso:p.caso, categoria:c}) }
       OR EXISTS { MATCH (nf:NecesidadFuncional {caso:p.caso})-[:CUBRE]->(:CategoriaDato {nombre:c}) }
       OR EXISTS { MATCH (d:DatoFaltante {caso:p.caso, categoria:c, criticidad:'postergable'}) })] AS sin_cubrir,
     COLLECT { MATCH (d:DatoFaltante {caso:p.caso}) WHERE d.criticidad <> 'postergable' RETURN d.id + ' (' + d.criticidad + ')' } AS faltantes_que_bloquean,
     COLLECT { MATCH (d:DatoAmbiguo {caso:p.caso}) RETURN d.id } AS ambiguos,
     COLLECT { MATCH (k:Contradiccion {caso:p.caso, estado:'abierta'}) RETURN k.id } AS contradicciones_abiertas
WITH p, sin_cubrir, faltantes_que_bloquean, ambiguos, contradicciones_abiertas,
     size(sin_cubrir) = 0 AND size(faltantes_que_bloquean) = 0 AND size(ambiguos) = 0 AND size(contradicciones_abiertas) = 0 AS cumple
SET p.estado = CASE WHEN cumple THEN 'listo_para_evaluacion' ELSE p.estado END
WITH p, cumple, sin_cubrir, faltantes_que_bloquean
MERGE (ev:Evaluacion {id:'EV-' + p.caso})
WITH p, cumple, sin_cubrir, faltantes_que_bloquean, ev
WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act
MATCH (r:Regla {id:'INT-R11'})
MERGE (ev)-[a:ACTIVO {paso:'it' + toString(p.iteracion)}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'INT', a.sobre = p.id, a.resultado = cumple
RETURN p.id AS pedido, cumple AS R11_se_cumple, p.estado AS estado, sin_cubrir, faltantes_que_bloquean;

// INT-R11 (acción): crear la ficha de los pedidos listos que todavía no la tienen
MATCH (p:Pedido {estado:'listo_para_evaluacion'}) WHERE NOT EXISTS { (:FichaRequerimientos)-[:CORRESPONDE_A]->(p) }
MATCH (smi:Submodulo {id:'SM-INT'})
MERGE (f:FichaRequerimientos {id: replace(p.id, 'P-', 'FR-')})
SET f:Instancia:Inferido, f.caso = p.caso, f.frame = 'FichaRequerimientos'
MERGE (f)-[:CORRESPONDE_A]->(p)
MERGE (smi)-[:PRODUCE {regla:'INT-R11'}]->(f)
WITH f, p
CALL { WITH f, p MATCH (d:DatoConfirmado {caso:p.caso}) MERGE (f)-[:REGISTRA]->(d) }
CALL { WITH f, p MATCH (r:RestriccionCliente {caso:p.caso}) MERGE (f)-[:PRESERVA {regla:'INT-R04'}]->(r) }
CALL { WITH f, p MATCH (r:Preferencia {caso:p.caso}) MERGE (f)-[:INCLUYE]->(r) }
CALL { WITH f, p MATCH (r:NecesidadFuncional {caso:p.caso}) MERGE (f)-[:INCLUYE]->(r) }
CALL { WITH f MATCH (s:Submodulo) WHERE s.id IN ['SM-MAT', 'SM-MAN'] MERGE (f)-[:ALIMENTA]->(s) }
RETURN f.id AS ficha_creada, p.id AS pedido,
       [(f)-[:REGISTRA]->(d) | d.id + ' ' + d.atributo + ' = ' + toString(d.valor)] AS datos_confirmados,
       [(f)-[:INCLUYE]->(n:NecesidadFuncional) | n.id + ': ' + n.efecto_buscado] AS necesidades_funcionales;

// INT-R12: advertencias por faltantes postergables al crear la ficha
MATCH (f:FichaRequerimientos:Inferido)-[:CORRESPONDE_A]->(p:Pedido)
OPTIONAL MATCH (d:DatoFaltante {caso:p.caso, criticidad:'postergable'})
FOREACH (x IN CASE WHEN d IS NULL THEN [] ELSE [d] END |
  MERGE (av:Advertencia {id:'AV-' + x.id})
  SET av:Instancia:Inferido, av.caso = p.caso, av.frame = 'Advertencia', av.motivo = 'dato_postergable_pendiente',
      av.texto = 'El dato ' + x.id + ' (' + x.atributo + ') sigue pendiente'
  MERGE (f)-[:INCLUYE {regla:'INT-R12'}]->(av))
RETURN f.id AS ficha, count(d) AS advertencias_creadas_por_R12;

// =====================================================================================
// PARTE A — Integración Ficha → Cartel (CU1 y CU2)
// =====================================================================================

// @paso 06 | silencio | CU1+CU2 | INTEG-01: cada ficha describe un Cartel (sin completar huecos)
// Esperado: CAR-P-01 (1000 mm, interior, mampostería, sin tecnología definida) y CAR-P-02 (corpóreo, con luz,
// 3000 mm, exterior, sobre marquesina a 4 m). La tecnología queda [PENDIENTE] (demonio del frame Cartel).
MATCH (f:FichaRequerimientos)-[:CORRESPONDE_A]->(p:Pedido)
OPTIONAL MATCH (f)-[:REGISTRA]->(d:DatoConfirmado)
WITH f, p, collect(d) AS ds
WITH f, p,
     head([d IN ds WHERE d.atributo = 'tecnologia' | d.valor]) AS tipo,
     head([d IN ds WHERE d.atributo = 'iluminacion' | d.valor]) AS luz,
     head([d IN ds WHERE d.categoria = 'dimensiones' | d.valor_normalizado]) AS dim,
     head([d IN ds WHERE d.categoria = 'entorno' | d.valor]) AS ent,
     head([d IN ds WHERE d.categoria = 'instalacion' | d]) AS inst,
     EXISTS { (f)-[:INCLUYE]->(:NecesidadFuncional) } AS tiene_nf
MERGE (c:Cartel {id:'CAR-' + p.id})
SET c:Instancia:Inferido, c.caso = p.caso, c.frame = 'Cartel', c.desde_ficha = true, c.tipo_cartel = tipo,
    c.lleva_luz = CASE luz WHEN 'si' THEN true WHEN 'no' THEN false ELSE null END,
    c.dimension_maxima_mm = dim, c.montaje = inst.montaje, c.altura_m = inst.altura_m,
    c.pendiente = CASE WHEN luz = 'si' OR tiene_nf
                       THEN '[PENDIENTE: criterio del experto para proponer la tecnología de iluminación]' END
MERGE (f)-[:DESCRIBE {regla:'INTEG-01'}]->(c)
MERGE (g:Geometria {id:'GEO-' + p.id})
SET g:Instancia:Inferido, g.caso = p.caso, g.frame = 'Geometria', g.dimension_maxima_mm = dim,
    g.pendiente = '[PENDIENTE: ancho de canal y peso requieren el vector del diseño]'
MERGE (c)-[:TIENE]->(g)
MERGE (en:Entorno {id:'ENT-' + p.id})
SET en:Instancia:Inferido, en.caso = p.caso, en.frame = 'Entorno', en.tipo = ent,
    en.proteccion = coalesce(en.proteccion, 'no_informada'), en.condicion_especial = coalesce(en.condicion_especial, 'no_informada')
MERGE (c)-[:SE_INSTALA_EN]->(en)
FOREACH (x IN CASE WHEN inst.soporte IS NULL THEN [] ELSE [inst] END |
  MERGE (so:Soporte {id:'SOP-' + p.id}) SET so:Instancia:Inferido, so.caso = p.caso, so.frame = 'Soporte', so.tipo = x.soporte
  MERGE (fj:SistemaFijacion {id:'FIJ-' + p.id})
  SET fj:Instancia:Inferido, fj.caso = p.caso, fj.frame = 'SistemaFijacion', fj.pendiente = '[PENDIENTE: sistema de fijación a definir]'
  MERGE (c)-[:SE_FIJA_CON]->(fj) MERGE (fj)-[:SOBRE]->(so))
FOREACH (x IN CASE WHEN luz = 'si' THEN [1] ELSE [] END |
  MERGE (ce:ComponenteElectrico {id:'CE-' + p.id})
  SET ce:Instancia:Inferido, ce.caso = p.caso, ce.frame = 'ComponenteElectrico', ce.tipo = 'fuente y tiras LED', ce.grado_ip = null
  MERGE (c)-[:UTILIZA]->(ce))
WITH f, p, c
OPTIONAL MATCH (f)-[:PRESERVA]->(r:RestriccionCliente)
FOREACH (x IN CASE WHEN r IS NULL THEN [] ELSE [r] END | MERGE (x)-[:CONDICIONA]->(c))
WITH DISTINCT f, p, c
MERGE (ev:Evaluacion {id:'EV-' + p.caso})
WITH f, p, c, ev
WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act
MATCH (r:Regla {id:'INTEG-01'})
MERGE (ev)-[a:ACTIVO {paso:'INTEG'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'COM', a.sobre = c.id
RETURN f.id AS ficha, c.id AS cartel, c.tipo_cartel AS tipo, c.lleva_luz AS lleva_luz, c.dimension_maxima_mm AS dim_mm,
       c.montaje AS montaje, c.altura_m AS altura_m, [(c)-[:SE_INSTALA_EN]->(e) | e.tipo][0] AS entorno
ORDER BY ficha;

// =====================================================================================
// PARTE A — Materiales e instalación (Lautaro) — [PENDIENTE: PI2 Lautaro]
// =====================================================================================

// @paso 07 | silencio | CU1+CU2 | R-MI-01 datos mínimos + interpretación de la exposición (R-MI-GEN / R-MI-02)
// Esperado: CU1 interior → exposición baja (regla general §6); CU2 exterior sin alero/nicho informado → alta (R-MI-02).
// Las excepciones que no se pueden verificar quedan como advertencias del dictamen.
MATCH (c:Cartel {desde_ficha:true})-[:SE_INSTALA_EN]->(en:Entorno)
OPTIONAL MATCH (c)-[:SE_FIJA_CON]->(:SistemaFijacion)-[:SOBRE]->(so:Soporte)
WITH c, en, [x IN [CASE WHEN en.tipo IS NULL THEN 'entorno' END,
                   CASE WHEN so IS NULL THEN 'soporte' END,
                   CASE WHEN c.dimension_maxima_mm IS NULL THEN 'dimensiones' END] WHERE x IS NOT NULL] AS faltan
SET c.datos_minimos_ok = (size(faltan) = 0), c.faltan_minimos = faltan
WITH c, en, faltan,
     CASE WHEN size(faltan) > 0 THEN [null, null]
          WHEN en.tipo = 'interior' AND en.condicion_especial IN ['ninguna', 'no_informada'] THEN ['baja', 'R-MI-GEN']
          WHEN en.tipo = 'interior' THEN ['media o alta', 'R-MI-09']
          WHEN en.proteccion IN ['alero', 'nicho'] THEN ['a reducir (magnitud a validar)', 'R-MI-08']
          ELSE ['alta', 'R-MI-02'] END AS expo
SET en.nivel_exposicion = expo[0], en.regla_exposicion = expo[1]
MERGE (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
SET dic:Instancia:Inferido, dic.caso = c.caso, dic.frame = 'DictamenAdecuacion'
MERGE (dic)-[:EVALUA]->(c)
FOREACH (_ IN CASE WHEN en.tipo = 'interior' AND en.condicion_especial = 'no_informada' THEN [1] ELSE [] END |
  MERGE (av:Advertencia {id:'AV-EX02-' + c.caso})
  SET av:Instancia:Inferido, av.caso = c.caso, av.frame = 'Advertencia', av.motivo = 'excepcion_no_verificable',
      av.texto = 'EX-02: no se informó humedad alta ni sol directo; se aplica la regla general (interior = exposición baja)'
  MERGE (dic)-[:INCLUYE {regla:'R-MI-GEN'}]->(av))
FOREACH (_ IN CASE WHEN en.tipo = 'exterior' AND en.proteccion = 'no_informada' THEN [1] ELSE [] END |
  MERGE (av:Advertencia {id:'AV-EX01-' + c.caso})
  SET av:Instancia:Inferido, av.caso = c.caso, av.frame = 'Advertencia', av.motivo = 'excepcion_no_verificable',
      av.texto = 'EX-01: no se informó alero ni nicho; se evalúa como exterior expuesto (R-MI-08 no aplica)'
  MERGE (dic)-[:INCLUYE {regla:'R-MI-02'}]->(av))
WITH c, en, faltan, expo
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, en, faltan, ev, [x IN ['R-MI-01', expo[1]] WHERE x IS NOT NULL] AS reglas, COUNT { (ev)-[:ACTIVO]->() } AS n_act
UNWIND range(0, size(reglas) - 1) AS i
MATCH (r:Regla {id: reglas[i]})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + i + 1, a.submodulo = 'MAT', a.sobre = c.id
WITH DISTINCT c, en, faltan
RETURN c.caso AS caso, c.id AS cartel, faltan AS faltan_datos_minimos, en.tipo AS entorno,
       en.nivel_exposicion AS exposicion, en.regla_exposicion AS regla
ORDER BY caso;

// @paso 08 | extra | CU1+CU2 | Materiales emite el dictamen (R-MI-03, R-MI-04, R-MI-06, R-MI-10 / R-MI-11)
// Esperado: CU1 apto (R-MI-10). CU2 apto con condiciones (R-MI-11): protección IP de lo eléctrico,
// material apto exterior y advertencia de verificación estructural (umbral R-MI-06 [PENDIENTE]).
// R-MI-03: exposición alta y componente eléctrico sin protección informada
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno {nivel_exposicion:'alta'}),
      (c)-[:UTILIZA]->(ce:ComponenteElectrico), (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
WHERE ce.grado_ip IS NULL
MERGE (k:Conflicto {id:'CONF-IP-' + c.caso})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'ComponenteEntorno', k.origen = 'instalacion',
    k.estado = coalesce(k.estado, 'Abierto'), k.resoluble_con_condicion = true,
    k.condicion = 'Componentes eléctricos con protección contra agua [PENDIENTE: grado IP exigido, IEC 60529]'
MERGE (k)-[:CAUSADO_POR {regla:'R-MI-03'}]->(en)
MERGE (dic)-[:REGISTRA {regla:'R-MI-03'}]->(k)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-03'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;

// R-MI-04: exposición alta y material no indicado (o todavía no definido) para exterior/UV
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno {nivel_exposicion:'alta'}),
      (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
OPTIONAL MATCH (c)-[:UTILIZA]->(m:Material)
WITH c, en, dic, m WHERE m IS NULL OR m.apto_exterior = false
MERGE (k:Conflicto {id:'CONF-MAT-' + c.caso})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'MaterialEntorno', k.origen = 'instalacion',
    k.estado = coalesce(k.estado, 'Abierto'), k.resoluble_con_condicion = true,
    k.condicion = 'Material indicado para exterior y radiación UV (la ficha no define material)'
MERGE (k)-[:CAUSADO_POR {regla:'R-MI-04'}]->(en)
MERGE (dic)-[:REGISTRA {regla:'R-MI-04'}]->(k)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-04'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;

// R-MI-06: bandera o exterior en altura → verificación estructural (el umbral no está relevado: queda como advertencia)
MATCH (c:Cartel {desde_ficha:true, datos_minimos_ok:true})-[:SE_INSTALA_EN]->(en:Entorno), (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
WHERE c.montaje = 'bandera' OR (en.tipo = 'exterior' AND c.altura_m IS NOT NULL)
MERGE (vp:VerificacionProfesional {id:'VP-' + c.caso})
SET vp:Instancia:Inferido, vp.caso = c.caso, vp.frame = 'VerificacionProfesional', vp.tipo = 'estructural', vp.estado = 'a_confirmar'
MERGE (dic)-[:SENALA {regla:'R-MI-06'}]->(vp)
MERGE (av:Advertencia {id:'AV-RMI06-' + c.caso})
SET av:Instancia:Inferido, av.caso = c.caso, av.frame = 'Advertencia', av.motivo = 'umbral_pendiente',
    av.texto = 'R-MI-06: cartel exterior a ' + toString(c.altura_m) + ' m de altura; evaluar verificación estructural profesional [PENDIENTE: umbral de tamaño/altura/viento, CIRSOC 102]'
MERGE (dic)-[:INCLUYE {regla:'R-MI-06'}]->(av)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'R-MI-06'})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id;

// R-MI-10 / R-MI-11: dictamen
MATCH (c:Cartel {desde_ficha:true}), (dic:DictamenAdecuacion {id:'DIC-' + c.caso}), (smm:Submodulo {id:'SM-MAN'})
OPTIONAL MATCH (dic)-[:REGISTRA]->(k:Conflicto)
WITH c, dic, smm, collect(k) AS ks
WITH c, dic, smm, ks,
     CASE WHEN NOT c.datos_minimos_ok THEN ['no_evaluable', 'R-MI-01']
          WHEN size(ks) = 0 THEN ['apto', 'R-MI-10']
          WHEN all(k IN ks WHERE k.resoluble_con_condicion) THEN ['apto_con_condiciones', 'R-MI-11']
          ELSE ['no_apto', 'R-MI-03'] END AS res
SET dic.resultado = res[0], dic.regla = res[1], dic.condiciones = [k IN ks | k.condicion]
MERGE (dic)-[:ALIMENTA]->(smm)
WITH c, dic, res
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, dic, res, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:res[1]})
MERGE (ev)-[a:ACTIVO {paso:'MAT'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAT', a.sobre = c.id
RETURN c.caso AS caso, dic.resultado AS dictamen, dic.regla AS regla, dic.condiciones AS condiciones,
       [(dic)-[:INCLUYE]->(av:Advertencia) | av.texto] AS advertencias
ORDER BY caso;

// =====================================================================================
// PARTE A — Manufacturabilidad y rediseño (Luciano)
// =====================================================================================

// @paso 09 | silencio | Todos | Detección: MAN-R7 (material), MAN-R3 (volumen), MAN-R2 (trazo), MAN-R4 (peso)
// Esperado: CU2 → PETG (resuelve el conflicto MaterialEntorno de Lautaro). CU1 (1000 mm), CU2 (3000 mm) y L-C2 (500 mm)
// → ExcedeCama. L-C1 → TrazoFino. L-C3 → RiesgoCaida.
// MAN-R7: exterior → PETG, descartar PLA
MATCH (c:Cartel)-[:SE_INSTALA_EN]->(en:Entorno {tipo:'exterior'}), (petg:Material {id:'MAT-PETG'}), (pla:Material {id:'MAT-PLA'})
SET c.material = 'PETG'
MERGE (c)-[:UTILIZA {regla:'MAN-R7'}]->(petg)
MERGE (c)-[:DESCARTA {regla:'MAN-R7', motivo:'deformación térmica / UV en exterior'}]->(pla)
WITH c
OPTIONAL MATCH (:DictamenAdecuacion {id:'DIC-' + c.caso})-[:REGISTRA]->(k:Conflicto {tipo:'MaterialEntorno'})
FOREACH (x IN CASE WHEN k IS NULL THEN [] ELSE [k] END | SET x.estado = 'Resuelto', x.resuelto_por = 'MAN-R7: PETG apto exterior')
WITH DISTINCT c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R7'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;

// MAN-R3: dimensión máxima > volumen útil de la impresora
MATCH (c:Cartel)-[:TIENE]->(g:Geometria), (h:Herramienta {id:'IMP3D'})-[:DEFINE]->(rc:RestriccionConstructiva {tipo:'Volumen'})
WHERE g.dimension_maxima_mm > h.volumen_util_maximo
MERGE (g)-[:VIOLA {regla:'MAN-R3'}]->(rc)
MERGE (k:Conflicto {id:'CONF-VOL-' + c.id})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'ExcedeCama', k.origen = 'manufactura',
    k.estado = coalesce(k.estado, 'Abierto'),
    k.detalle = toString(g.dimension_maxima_mm) + ' mm > ' + toString(h.volumen_util_maximo) + ' mm de cama'
MERGE (rc)-[:GENERA {regla:'MAN-R3'}]->(k)
MERGE (seg:AlternativaRediseno {id:'ALT-SEG-' + c.id})
SET seg:SegmentacionModular:Instancia:Inferido, seg.caso = c.caso, seg.frame = 'SegmentacionModular', seg.tipo_cambio = 'Segmentacion',
    seg.nombre = 'SegmentacionModular',
    seg.justificacion = CASE WHEN c.tipo_cartel = 'corporeo'
                             THEN 'Piezas de hasta 400 mm: en letras corpóreas equivale a fabricar letra por letra'
                             ELSE 'Dividir en piezas que entren en la cama de 400 mm' END
MERGE (ref:AlternativaRediseno {id:'ALT-REF-' + c.id})
SET ref:CambioFijacion:Instancia:Inferido, ref.caso = c.caso, ref.frame = 'CambioFijacion', ref.tipo_cambio = 'Fijacion',
    ref.nombre = 'CambioFijacion_Refuerzo', ref.justificacion = 'Reforzar la unión de los módulos para mantener la integridad'
MERGE (k)-[:EXIGE {regla:'MAN-R3'}]->(seg)
MERGE (seg)-[:EXIGE {regla:'MAN-R3'}]->(ref)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R3'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;

// MAN-R2: canal menor a 6 mm con NeónFrontal
MATCH (c:Cartel {tecnologia_iluminacion:'NeonFrontal'})-[:TIENE]->(g:Geometria),
      (:TecnologiaIluminacion {nombre:'NeonFrontal'})-[:DEFINE]->(rc:RestriccionConstructiva {tipo:'Trazo'})
WHERE g.ancho_canal_mm < rc.valor_limite
MERGE (g)-[:VIOLA {regla:'MAN-R2'}]->(rc)
MERGE (k:Conflicto {id:'CONF-TRZ-' + c.id})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'TrazoFino', k.origen = 'manufactura',
    k.estado = coalesce(k.estado, 'Abierto'), k.detalle = toString(g.ancho_canal_mm) + ' mm < ' + toString(rc.valor_limite) + ' mm de la tira'
MERGE (rc)-[:GENERA {regla:'MAN-R2'}]->(k)
MERGE (a1:AlternativaRediseno {id:'ALT-ENG-' + c.id})
SET a1:CambioGeometria:Instancia:Inferido, a1.caso = c.caso, a1.frame = 'CambioGeometria', a1.tipo_cambio = 'Geometria',
    a1.nombre = 'EngrosarTrazo', a1.impacto_estetico = 'Alto', a1.justificacion = 'Aumentar el grosor de los trazos (afecta la apariencia)'
MERGE (a2:AlternativaRediseno {id:'ALT-RETRO-' + c.id})
SET a2:CambioTecnologia:Instancia:Inferido, a2.caso = c.caso, a2.frame = 'CambioTecnologia', a2.tipo_cambio = 'Tecnologia',
    a2.nombre = 'PasarRetroiluminado', a2.impacto_estetico = 'Bajo', a2.justificacion = 'Cambiar la tecnología de iluminación (mantiene la apariencia)'
MERGE (k)-[:EXIGE {regla:'MAN-R2'}]->(a1)
MERGE (k)-[:EXIGE {regla:'MAN-R2'}]->(a2)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R2'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;

// MAN-R4: el peso supera la carga admisible de la fijación (valor límite [PENDIENTE]; se usa el hecho del caso)
MATCH (c:Cartel)-[:TIENE]->(g:Geometria {supera_carga_admisible:true}),
      (c)-[:SE_FIJA_CON]->(:SistemaFijacion)-[:DEFINE]->(rc:RestriccionConstructiva {tipo:'Peso'})
MERGE (g)-[:VIOLA {regla:'MAN-R4'}]->(rc)
MERGE (k:Conflicto {id:'CONF-PESO-' + c.id})
SET k:Instancia:Inferido, k.caso = c.caso, k.frame = 'Conflicto', k.tipo = 'RiesgoCaida', k.origen = 'manufactura',
    k.estado = coalesce(k.estado, 'Abierto'), k.detalle = 'peso estimado elevado > carga de la cinta bifaz [valor PENDIENTE]'
MERGE (rc)-[:GENERA {regla:'MAN-R4'}]->(k)
MERGE (a1:AlternativaRediseno {id:'ALT-INF-' + c.id})
SET a1:CambioGeometria:Instancia:Inferido, a1.caso = c.caso, a1.frame = 'CambioGeometria', a1.tipo_cambio = 'Geometria',
    a1.nombre = 'ReducirInfill', a1.impacto_estetico = 'Bajo', a1.requiere_perforar = false,
    a1.justificacion = 'Reducir masa interna sin alterar la apariencia exterior'
MERGE (a2:AlternativaRediseno {id:'ALT-FIJ-' + c.id})
SET a2:CambioFijacion:Instancia:Inferido, a2.caso = c.caso, a2.frame = 'CambioFijacion', a2.tipo_cambio = 'Fijacion',
    a2.nombre = 'FijacionMayorCapacidad', a2.requiere_perforar = true,
    a2.justificacion = 'Reemplazar la fijación por una de mayor capacidad (requiere perforar)'
MERGE (k)-[:EXIGE {regla:'MAN-R4'}]->(a1)
MERGE (k)-[:EXIGE {regla:'MAN-R4'}]->(a2)
WITH c
MERGE (ev:Evaluacion {id:'EV-' + c.caso}) ON CREATE SET ev:Instancia:Inferido, ev.caso = c.caso, ev.frame = 'Evaluacion'
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R4'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;

// MAN-R1: ¿se puede confirmar la manufacturabilidad directa? (muestra qué falta cuando no se puede)
MATCH (c:Cartel)-[:TIENE]->(g:Geometria)
RETURN c.caso AS caso, c.id AS cartel,
       [(g)-[v:VIOLA]->(rc) | rc.tipo + ' (' + v.regla + ')'] AS limites_violados,
       CASE WHEN EXISTS { (g)-[:VIOLA]->() } THEN 'no: hay conflictos'
            WHEN g.ancho_canal_mm IS NULL OR g.peso_estimado_gr IS NULL THEN 'no evaluable: falta ancho de canal o peso [PENDIENTE]'
            ELSE 'no evaluable: carga admisible de la fijación [PENDIENTE]' END AS MAN_R1
ORDER BY caso;

// @paso 10 | silencio | Todos | Filtro por restricciones del cliente: MAN-R6, MAN-R5, MAN-R9, MAN-FILTRO y MAN-R8
// Esperado: L-C1 Engrosar rechazada / Retroiluminado admitida (R6). L-C3 Fijación rechazada / Infill admitida (R9).
// L-C2 segmentación admitida por tamaño final fijo. CU1 y CU2: segmentación + refuerzo viables (en CU2 con advertencia de plazo).
// MAN-R6: fidelidad al logo alta
MATCH (r:RestriccionCliente {criterio:'fidelidad_logo', nivel:'Alta'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {tipo:'TrazoFino', caso:c.caso})-[:EXIGE]->(alt:AlternativaRediseno)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Geometria' THEN [1] ELSE [] END |
  MERGE (r)-[:RECHAZA {regla:'MAN-R6'}]->(alt) SET alt.viable = false)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Tecnologia' THEN [1] ELSE [] END |
  MERGE (r)-[:ADMITE {regla:'MAN-R6'}]->(alt) SET alt.viable = true)
WITH DISTINCT c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R6'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;

// MAN-R5: flexibilidad estética alta (ningún caso cargado la dispara)
MATCH (r:RestriccionCliente {criterio:'flexibilidad_estetica', nivel:'Alta'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {tipo:'TrazoFino', caso:c.caso})-[:EXIGE]->(alt:AlternativaRediseno)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Geometria' THEN [1] ELSE [] END |
  MERGE (r)-[:ADMITE {regla:'MAN-R5'}]->(alt) SET alt.viable = true)
FOREACH (_ IN CASE WHEN alt.tipo_cambio = 'Tecnologia' THEN [1] ELSE [] END |
  MERGE (r)-[:RECHAZA {regla:'MAN-R5'}]->(alt) SET alt.viable = false);

// MAN-R9: instalación no invasiva
MATCH (r:RestriccionCliente {criterio:'instalacion_no_invasiva'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {tipo:'RiesgoCaida', caso:c.caso})-[:EXIGE]->(alt:AlternativaRediseno)
FOREACH (_ IN CASE WHEN alt.requiere_perforar = true THEN [1] ELSE [] END |
  MERGE (r)-[:RECHAZA {regla:'MAN-R9'}]->(alt) SET alt.viable = false)
FOREACH (_ IN CASE WHEN alt.nombre = 'ReducirInfill' THEN [1] ELSE [] END |
  MERGE (r)-[:ADMITE {regla:'MAN-R9'}]->(alt) SET alt.viable = true)
WITH DISTINCT c
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
WITH c, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-R9'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN', a.sobre = c.id;

// MAN-FILTRO (PI2 Luciano, caso 2): el tamaño final fijo admite segmentar y reforzar (no cambian el tamaño)
MATCH (r:RestriccionCliente {criterio:'tamano_final_fijo'})-[:CONDICIONA]->(c:Cartel),
      (k:Conflicto {caso:c.caso, origen:'manufactura'})-[:EXIGE*1..2]->(alt:AlternativaRediseno)
WHERE alt.tipo_cambio IN ['Segmentacion', 'Fijacion']
MERGE (r)-[:ADMITE {regla:'MAN-FILTRO'}]->(alt)
SET alt.viable = true;

// MAN-FILTRO (PI1 Luciano, etapa 5): si ninguna restricción obligatoria la rechaza, la alternativa es viable.
// Una restricción obligatoria cuyo impacto no se puede evaluar (plazo) viaja como advertencia [PENDIENTE].
MATCH (k:Conflicto {origen:'manufactura'})-[:EXIGE*1..2]->(alt:AlternativaRediseno)
WHERE alt.viable IS NULL
SET alt.viable = true, alt.regla_viabilidad = 'MAN-FILTRO'
WITH DISTINCT alt
OPTIONAL MATCH (r:RestriccionCliente {criterio:'plazo'})-[:CONDICIONA]->(:Cartel {caso:alt.caso})
SET alt.advertencia = CASE WHEN r IS NULL THEN null
                           ELSE 'Impacto sobre ' + r.id + ' (' + r.descripcion + ', obligatoria) no evaluable [PENDIENTE: criterio del experto]' END
WITH DISTINCT alt.caso AS caso
MERGE (ev:Evaluacion {id:'EV-' + caso})
WITH ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'MAN-FILTRO'})
MERGE (ev)-[a:ACTIVO {paso:'MAN'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'MAN';

// MAN-R8: si todas las alternativas de un conflicto quedaron no viables → Inviable y vuelve a Interpretación
MATCH (k:Conflicto {origen:'manufactura'})
WITH k, [(k)-[:EXIGE*1..2]->(a:AlternativaRediseno) | a.viable] AS viabilidades
SET k.estado = CASE WHEN size(viabilidades) > 0 AND none(v IN viabilidades WHERE v = true) THEN 'Inviable' ELSE 'Resuelto' END
WITH k WHERE k.estado = 'Inviable'
MERGE (a:Aclaracion {id:'A-R8-' + k.id})
SET a:Instancia:Inferido, a.caso = k.caso, a.frame = 'Aclaracion', a.motivo = 'rigidez', a.estado = 'pendiente',
    a.pregunta = 'Ninguna alternativa respeta las restricciones obligatorias: ¿se puede flexibilizar alguna?'
MERGE (k)-[:PROVOCA {regla:'MAN-R8'}]->(a);

// Resumen del filtro
MATCH (k:Conflicto {origen:'manufactura'})-[:EXIGE*1..2]->(a:AlternativaRediseno)
OPTIONAL MATCH (r:RestriccionCliente)-[d:ADMITE|RECHAZA]->(a)
RETURN k.caso AS caso, k.tipo AS conflicto, a.nombre AS alternativa, a.viable AS viable,
       coalesce(type(d) + ' por ' + r.id + ' (' + d.regla + ')', a.regla_viabilidad) AS decision
ORDER BY caso, conflicto, alternativa;

// @paso 11 | silencio | Todos | INTEG-02: Recomendación + cierre del rastro de decisión
// Esperado: una Recomendacion por caso con las alternativas viables, el material y las condiciones de Materiales.
MATCH (c:Cartel)
MATCH (k:Conflicto {caso:c.caso, origen:'manufactura'})
OPTIONAL MATCH (k)-[:EXIGE*1..2]->(alt:AlternativaRediseno {viable:true})
WITH c, collect(DISTINCT k) AS ks, collect(DISTINCT alt) AS alts
OPTIONAL MATCH (dic:DictamenAdecuacion {id:'DIC-' + c.caso})
MERGE (rec:Recomendacion {id:'REC-' + c.caso})
SET rec:Instancia:Inferido, rec.caso = c.caso, rec.frame = 'Recomendacion', rec.decide = 'fabricante',
    rec.tipo = CASE WHEN size(alts) > 0 THEN 'rediseno' ELSE 'inviable' END,
    rec.conflictos = [k IN ks | k.tipo + ': ' + coalesce(k.detalle, '')],
    rec.alternativas = [a IN alts | a.nombre],
    rec.material = c.material,
    rec.dictamen_materiales = dic.resultado,
    rec.condiciones_instalacion = coalesce([x IN dic.condiciones WHERE NOT x STARTS WITH 'Material'], []),
    rec.advertencias = [a IN alts WHERE a.advertencia IS NOT NULL | a.advertencia],
    rec.tecnologia = coalesce(c.tecnologia_iluminacion, c.pendiente)
FOREACH (a IN alts | MERGE (a)-[:CONFORMA {regla:'INTEG-02'}]->(rec))
WITH c, rec
MERGE (ev:Evaluacion {id:'EV-' + c.caso})
MERGE (ev)-[:CONCLUYE]->(rec)
WITH c, rec, ev WITH *, COUNT { (ev)-[:ACTIVO]->() } AS n_act MATCH (r:Regla {id:'INTEG-02'})
MERGE (ev)-[a:ACTIVO {paso:'INTEG'}]->(r) ON CREATE SET a.orden = n_act + 1, a.submodulo = 'COM', a.sobre = rec.id
RETURN rec.caso AS caso, rec.tipo AS tipo, rec.alternativas AS alternativas, rec.material AS material,
       rec.dictamen_materiales AS dictamen, rec.condiciones_instalacion AS condiciones
ORDER BY caso;

// Sincronizar INSTANCIA_DE con el frame actual de cada instancia (las reglas crean y reclasifican nodos)
MATCH (n:Instancia)-[r:INSTANCIA_DE]->(f:Frame) WHERE f.nombre <> n.frame DELETE r;
MATCH (n:Instancia) WHERE NOT (n)-[:INSTANCIA_DE]->() MATCH (f:Frame {nombre:n.frame}) MERGE (n)-[:INSTANCIA_DE]->(f);

// =====================================================================================
// PARTE B — Consultas de lectura para la presentación
// =====================================================================================

// @paso 12 | corta | CU1 | Recorrido completo de CU1: del mensaje del cliente a la recomendación
// Esperado: Interpretación (P-01 listo en iteración 3) → FR-01 → Materiales: apto (R-MI-10) →
// Manufacturabilidad: 1000 mm > 400 mm → SegmentacionModular + refuerzo. Decide el fabricante.
CALL {
  MATCH (p:Pedido {id:'P-01'})
  RETURN 1 AS n, 'Interpretación (Matías)' AS submodulo, p.id + ' ' + p.estado + ', iteración ' + toString(p.iteracion) AS resultado
  UNION ALL
  MATCH (f:FichaRequerimientos)-[:CORRESPONDE_A]->(:Pedido {id:'P-01'})
  RETURN 2 AS n, 'Ficha' AS submodulo, f.id + ': ' + reduce(s = '', d IN [(f)-[:REGISTRA]->(x) | x.atributo + '=' + toString(x.valor)] | s + d + '; ')
         + reduce(s = '', n IN [(f)-[:INCLUYE]->(x:NecesidadFuncional) | x.id + ' cubre la tecnología'] | s + n) AS resultado
  UNION ALL
  MATCH (dic:DictamenAdecuacion {caso:'CU1'})-[:EVALUA]->(c)-[:SE_INSTALA_EN]->(en)
  RETURN 3 AS n, 'Materiales (Lautaro)' AS submodulo, 'exposición ' + en.nivel_exposicion + ' → ' + dic.resultado + ' (' + dic.regla + ')' AS resultado
  UNION ALL
  MATCH (k:Conflicto {caso:'CU1', origen:'manufactura'})
  RETURN 4 AS n, 'Manufacturabilidad (Luciano)' AS submodulo, k.tipo + ': ' + k.detalle AS resultado
  UNION ALL
  MATCH (rec:Recomendacion {caso:'CU1'})
  RETURN 5 AS n, 'Recomendación' AS submodulo, reduce(s = '', a IN rec.alternativas | s + a + ' + ') + 'decide: ' + rec.decide AS resultado
}
RETURN n AS paso, submodulo, resultado ORDER BY paso;

// @paso 13 | corta | CU2 | Recorrido completo de CU2: FR-02 cruza los tres submódulos
// Esperado: FR-02 con RC1 (plazo, obligatoria) y AV2 → Materiales: exposición alta, apto con condiciones →
// Manufacturabilidad: PETG (MAN-R7) + segmentación letra por letra + refuerzo; advertencias de plazo y de R-MI-06.
CALL {
  MATCH (f:FichaRequerimientos {id:'FR-02'})
  RETURN 1 AS n, 'Ficha (Matías)' AS submodulo,
         'restricciones: ' + reduce(s = '', r IN [(f)-[:PRESERVA]->(x) | x.id + ' ' + x.descripcion] | s + r) +
         ' | advertencias: ' + reduce(s = '', a IN [(f)-[:INCLUYE]->(x:Advertencia) | x.id] | s + a) AS resultado
  UNION ALL
  MATCH (dic:DictamenAdecuacion {caso:'CU2'})-[:EVALUA]->(c)-[:SE_INSTALA_EN]->(en)
  RETURN 2 AS n, 'Materiales (Lautaro)' AS submodulo, 'exposición ' + en.nivel_exposicion + ' (' + en.regla_exposicion + ') → ' + dic.resultado + ' (' + dic.regla + ')' AS resultado
  UNION ALL
  MATCH (dic:DictamenAdecuacion {caso:'CU2'})-[:REGISTRA]->(k:Conflicto)
  RETURN 3 AS n, 'Materiales: condición' AS submodulo, k.condicion + ' [' + k.estado + coalesce(' por ' + k.resuelto_por, '') + ']' AS resultado
  UNION ALL
  MATCH (c:Cartel {caso:'CU2'})-[u:UTILIZA]->(m:Material)
  RETURN 4 AS n, 'Manufacturabilidad (Luciano)' AS submodulo, 'material ' + m.nombre + ' (' + u.regla + ')' AS resultado
  UNION ALL
  MATCH (k:Conflicto {caso:'CU2', origen:'manufactura'})
  RETURN 5 AS n, 'Manufacturabilidad (Luciano)' AS submodulo, k.tipo + ': ' + k.detalle AS resultado
  UNION ALL
  MATCH (rec:Recomendacion {caso:'CU2'})
  RETURN 6 AS n, 'Recomendación' AS submodulo, reduce(s = '', a IN rec.alternativas | s + a + ' + ') + 'PETG; decide: ' + rec.decide AS resultado
  UNION ALL
  MATCH (rec:Recomendacion {caso:'CU2'}) UNWIND rec.advertencias + [(:DictamenAdecuacion {caso:'CU2'})-[:INCLUYE]->(av) | av.texto] AS adv
  WITH DISTINCT adv
  RETURN 7 AS n, 'Advertencia' AS submodulo, adv AS resultado
}
RETURN n AS paso, submodulo, resultado ORDER BY paso;

// @paso 14 | corta | L-C1+L-C3 | Las restricciones del cliente filtran las alternativas (admite / rechaza)
// Caso de uso: casos del PI2 de Luciano. Esperado: L-C1 EngrosarTrazo RECHAZA (R6) / PasarRetroiluminado ADMITE;
// L-C3 FijacionMayorCapacidad RECHAZA (R9) / ReducirInfill ADMITE; L-C2 segmentación ADMITE (tamaño final).
MATCH (r:RestriccionCliente)-[d:ADMITE|RECHAZA]->(a:AlternativaRediseno)
RETURN a.caso AS caso, r.descripcion AS restriccion_del_cliente, type(d) AS decision, a.nombre AS alternativa, d.regla AS regla
ORDER BY caso, decision DESC;

// @paso 15 | corta | CU2 | Trazabilidad: qué reglas se activaron, en qué orden y de dónde sale cada una
// Esperado: reglas de Interpretación (precargadas) → Materiales → Manufacturabilidad → Integración, con su origen.
MATCH (ev:Evaluacion {caso:'CU2'})-[a:ACTIVO]->(r:Regla)
RETURN a.orden AS orden, r.submodulo AS submodulo, r.id AS regla, r.nombre AS nombre, r.origen AS origen
ORDER BY orden;

// @paso 16 | extra | CU2 | Insumo para el LLM explicador: recomendación + reglas + slots + fuentes (el LLM no decide)
// Esperado: un registro con todo lo necesario para que el LLM redacte la explicación sin agregar conocimiento.
MATCH (ev:Evaluacion {caso:'CU2'})-[:CONCLUYE]->(rec:Recomendacion)
MATCH (ev)-[:ACTIVO]->(r:Regla) WHERE r.submodulo IN ['MAT', 'MAN', 'COM']
OPTIONAL MATCH (r)-[:USA]->(s:Slot)
WITH rec, r, collect(s.id) AS slots
RETURN rec.id AS recomendacion, r.id AS regla, r.conclusion AS conclusion, r.fuente AS fuente, slots AS slots_evaluados
ORDER BY regla;

// @paso 17 | extra | Modelo | Frame de ejemplo con slots y facetas: DatoFaltante hereda de Dato (ES_UN)
// Esperado: slots propios (criticidad) y heredados (atributo, categoria, valor, origen, estado) con sus facetas y demonios.
MATCH (f:Frame {nombre:'DatoFaltante'})-[:ES_UN*0..]->(anc:Frame)-[:TIENE_SLOT]->(s:Slot)
RETURN anc.nombre AS definido_en, s.nombre AS slot, s.tipo_dato AS tipo, s.valores_permitidos AS valores,
       s.valor_defecto AS defecto, s.cardinalidad AS card,
       coalesce(nullif(s.si_agregado, ''), nullif(s.si_modificado, ''), nullif(s.si_necesario, ''), '—') AS demonio
ORDER BY definido_en DESC, slot;

// @paso 18 | extra | Modelo | Origen del conocimiento: reglas por submódulo y origen (experto / propuesta / documental)
MATCH (r:Regla)
RETURN r.submodulo AS submodulo, r.origen AS origen, count(*) AS reglas, collect(r.id) AS ids
ORDER BY submodulo, origen;

// @paso 19 | extra | Modelo | Qué queda [PENDIENTE] en el modelo (para validar con el experto)
CALL {
  MATCH (s:Slot) WHERE s.nota CONTAINS 'PENDIENTE' RETURN 'Slot' AS tipo, s.id AS elemento, s.nota AS detalle
  UNION ALL
  MATCH (f:Frame) WHERE f.pendiente <> '' RETURN 'Frame' AS tipo, f.nombre AS elemento, f.pendiente AS detalle
  UNION ALL
  MATCH (n:Instancia) WHERE n.pendiente IS NOT NULL RETURN 'Instancia' AS tipo, n.id AS elemento, n.pendiente AS detalle
}
RETURN tipo, elemento, detalle ORDER BY tipo, elemento;

// @paso 20 | extra | Control | INT-R09 como restricción de integridad: ningún dato con valor «supuesto»
// Esperado: 0 datos con origen distinto de cliente / respuesta_a_aclaracion.
MATCH (d:Dato) WHERE d.valor IS NOT NULL AND NOT d.origen IN ['cliente', 'respuesta_a_aclaracion']
RETURN count(d) AS datos_con_origen_invalido;

// -------------------------------------------------------------------------------------
// Consultas visuales para el Browser (http://localhost:7474) — copiar y pegar, no las ejecuta demo.sh:
//
//   // Red semántica integrada (esquema)
//   MATCH (a:Frame)-[r]->(b:Frame) WHERE r.nivel = 'esquema' RETURN a, r, b
//
//   // Jerarquía de frames
//   MATCH p=(:Frame)-[:ES_UN|ES_PARTE_DE]->(:Frame) RETURN p
//
//   // Grafo instanciado de CU2 (sin frames ni categorías)
//   MATCH (n:Instancia {caso:'CU2'})-[r]-(m:Instancia) WHERE NOT m:CategoriaDato RETURN n, r, m
//
//   // Rastro de decisión de CU2
//   MATCH p=(:Evaluacion {caso:'CU2'})-[:ACTIVO]->(:Regla) RETURN p
// -------------------------------------------------------------------------------------
