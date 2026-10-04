// 03_instancias.cypher — Instancias de los casos de prueba (idempotente: todo con MERGE)
//
// Convención: cada instancia lleva la etiqueta del frame (y la de su padre, p. ej. :Dato:DatoAmbiguo),
// la etiqueta :Instancia, las propiedades id, caso y frame, y una relación INSTANCIA_DE hacia su :Frame.
// Las relaciones generadas por una regla llevan la propiedad `regla` (patrón del PI2 de Matías).
//
// Casos cargados:
//   BASE  conocimiento estable del taller (submódulos, categorías, impresora, límites, materiales, fijación)
//   CU1   «Café Andino» = P-01 del PI2 de Matías, al cierre de la ITERACIÓN 2 (la Q1 todavía sin responder)
//   CU2   «Letras corpóreas exterior» = P-02 / FR-02 del PI2 de Matías, al cierre de la iteración 2 (listo)
//   L-C1 / L-C2 / L-C3  casos del PI2 de Luciano (entrada directa al submódulo de rediseño)
// Las reglas de Materiales y Manufacturabilidad NO se precargan: se ejecutan en 04_consultas.cypher.

// =====================================================================================
// BASE — conocimiento estable
// =====================================================================================
UNWIND [
  {id:'SM-INT', frame:'SM_Interpretacion',     responsable:'Matías Zarandon',    tarea_experta:'Interpretación'},
  {id:'SM-MAT', frame:'SM_Materiales',         responsable:'Lautaro Quiros',     tarea_experta:'Evaluación'},
  {id:'SM-MAN', frame:'SM_Manufacturabilidad', responsable:'Luciano Marquesini', tarea_experta:'Recomendación'}
] AS x
MERGE (n:Submodulo:Instancia {id:x.id})
SET n.caso='BASE', n.frame=x.frame, n.responsable=x.responsable, n.tarea_experta=x.tarea_experta;

UNWIND ['producto_tecnologia','dimensiones','contexto_de_uso','entorno','instalacion','apariencia','restricciones'] AS c
MERGE (n:CategoriaDato:Instancia {id:'CAT-' + c}) SET n.nombre=c, n.caso='BASE', n.frame='CategoriaDato';

// Impresora 3D FDM (PI2 Luciano: 400 x 400 mm, documental)
MERGE (h:Herramienta:Instancia {id:'IMP3D'})
SET h.caso='BASE', h.frame='Herramienta', h.tipo='Impresora 3D FDM', h.volumen_util_maximo=400, h.fuente='Ficha técnica de la impresora (PI2 Luciano)';

// Tecnologías de iluminación
MERGE (t:TecnologiaIluminacion:Instancia {id:'TEC-NEON'}) SET t.caso='BASE', t.frame='NeonFrontal', t.nombre='NeonFrontal';
MERGE (t:TecnologiaIluminacion:Instancia {id:'TEC-RETRO'}) SET t.caso='BASE', t.frame='Retroiluminado', t.nombre='Retroiluminado';

// Materiales FDM (PI2 Luciano R7: PLA no apto intemperie, PETG apto)
MERGE (m:Material:Instancia {id:'MAT-PLA'}) SET m.caso='BASE', m.frame='PLA', m.nombre='PLA', m.apto_exterior=false, m.fuente='Propiedades térmicas FDM (PI2 Luciano R7)';
MERGE (m:Material:Instancia {id:'MAT-PETG'}) SET m.caso='BASE', m.frame='PETG', m.nombre='PETG', m.apto_exterior=true, m.fuente='Propiedades térmicas FDM (PI2 Luciano R7)';

// Sistema de fijación de los casos de Luciano
MERGE (f:SistemaFijacion:Instancia {id:'FIJ-CINTA'})
SET f.caso='BASE', f.frame='SistemaFijacion', f.tipo='cinta_bifaz', f.requiere_perforar=false,
    f.carga_admisible=null, f.pendiente='[PENDIENTE: carga admisible de la cinta bifaz]';

// Restricciones constructivas (límites) y quién las define (RL11 de Luciano)
MERGE (r:RestriccionConstructiva:Instancia {id:'RC-TRAZO'}) SET r.caso='BASE', r.frame='RestriccionTrazo', r.tipo='Trazo', r.valor_limite=6, r.unidad='mm', r.fuente='Ficha técnica del neón (documental)';
MERGE (r:RestriccionConstructiva:Instancia {id:'RC-VOL'}) SET r.caso='BASE', r.frame='RestriccionVolumen', r.tipo='Volumen', r.valor_limite=400, r.unidad='mm', r.fuente='Ficha técnica de la impresora (documental)';
MERGE (r:RestriccionConstructiva:Instancia {id:'RC-PESO'}) SET r.caso='BASE', r.frame='RestriccionPeso', r.tipo='Peso', r.valor_limite=null, r.unidad='gr', r.pendiente='[PENDIENTE: carga admisible]';
MERGE (r:RestriccionConstructiva:Instancia {id:'RC-TEMP'}) SET r.caso='BASE', r.frame='RestriccionTemperatura', r.tipo='Temperatura', r.valor_limite=null, r.pendiente='[PENDIENTE: temperatura de deformación]';
MATCH (t:TecnologiaIluminacion {id:'TEC-NEON'}), (r:RestriccionConstructiva {id:'RC-TRAZO'}) MERGE (t)-[:DEFINE]->(r);
MATCH (h:Herramienta {id:'IMP3D'}), (r:RestriccionConstructiva {id:'RC-VOL'}) MERGE (h)-[:DEFINE]->(r);
MATCH (f:SistemaFijacion {id:'FIJ-CINTA'}), (r:RestriccionConstructiva {id:'RC-PESO'}) MERGE (f)-[:DEFINE]->(r);
MATCH (m:Material {id:'MAT-PLA'}), (r:RestriccionConstructiva {id:'RC-TEMP'}) MERGE (m)-[:DEFINE]->(r);

// =====================================================================================
// CU1 — P-01 «Café Andino» (PI2 Matías, caso 1) al cierre de la iteración 2
// =====================================================================================
MERGE (c:Cliente:Instancia {id:'C-01'}) SET c.caso='CU1', c.frame='Cliente', c.conoce_terminologia='no';
MERGE (p:Pedido:Instancia {id:'P-01'})
SET p.caso='CU1', p.frame='Pedido', p.estado='pendiente_de_aclaracion', p.iteracion=2,
    p.datos_requeridos=['producto_tecnologia','dimensiones','entorno','instalacion','apariencia'],
    p.historial=['it1: pendiente_de_aclaracion (INT-R01 x3, INT-R02, INT-R07, INT-R10)',
                 'it2: respuesta del cliente (INT-R13): D3 y D5 confirmados, D1 descartado, NF1 cubre la tecnología; D4 sigue faltante y Q1 sin responder'];
MATCH (c:Cliente {id:'C-01'}), (p:Pedido {id:'P-01'}) MERGE (c)-[:FORMULA]->(p);

UNWIND [
  {id:'E1',  t:'cartel de neón',              f:'mensaje', ip:['neón de vidrio','aspecto neón']},
  {id:'E2',  t:'Café Andino',                 f:'mensaje', ip:['contenido_texto = Café Andino']},
  {id:'E3',  t:'para poner en la pared',      f:'mensaje', ip:['interior','exterior']},
  {id:'E4',  t:'más o menos de un metro',     f:'mensaje', ip:['medida del cartel','espacio libre']},
  {id:'E5',  t:'que se vea lindo de noche',   f:'mensaje', ip:['visibilidad y efecto nocturno']},
  {id:'E11', t:'Es adentro, en la pared detrás del mostrador. El metro es lo que tiene que medir el cartel de largo. Quiero que se vea como el de la foto, no me importa si es de vidrio', f:'respuesta_a_aclaracion', ip:['entorno = interior; largo del cartel ≈ 1 m; aspecto similar a RV1']}
] AS x
MERGE (e:ExpresionCliente:Instancia {id:x.id})
SET e.caso='CU1', e.frame='ExpresionCliente', e.texto_literal=x.t, e.fuente=x.f, e.interpretaciones_posibles=x.ip
WITH e MATCH (p:Pedido {id:'P-01'}) MERGE (p)-[:CONTIENE]->(e);

MERGE (rv:ReferenciaVisual:Instancia {id:'RV1'})
SET rv.caso='CU1', rv.frame='ReferenciaVisual', rv.descripcion='foto de un cartel visto en redes (con iluminación)',
    rv.consistente_con_texto='si', rv.aporta_sobre=['apariencia'];
MATCH (p:Pedido {id:'P-01'}), (rv:ReferenciaVisual {id:'RV1'}) MERGE (p)-[:INCLUYE]->(rv);

// Datos (estado al cierre de la iteración 2)
MERGE (d:Dato:Instancia {id:'D1'})
SET d.caso='CU1', d.frame='Dato', d.atributo='tecnologia', d.categoria='producto_tecnologia', d.valor=null,
    d.origen='cliente', d.estado='descartado', d.interpretaciones=['neón de vidrio','aspecto neón'],
    d.nota='El cliente eligió el aspecto, no la tecnología (it. 2)';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D2'})
SET d.caso='CU1', d.frame='DatoConfirmado', d.atributo='contenido_texto', d.categoria='apariencia', d.valor='Café Andino', d.origen='cliente', d.estado='confirmado';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D3'})
SET d.caso='CU1', d.frame='DatoConfirmado', d.atributo='entorno', d.categoria='entorno', d.valor='interior', d.origen='respuesta_a_aclaracion', d.estado='confirmado';
// D4 se reclasifica en 04 (DatoFaltante → DatoConfirmado): se hace MERGE sobre :Dato y se fija la etiqueta,
// así este script puede volver a correrse sobre una base ya inferida (vuelve D4 al estado de la iteración 2)
MERGE (d:Dato {id:'D4'})
REMOVE d:DatoConfirmado
SET d:DatoFaltante:Instancia, d.caso='CU1', d.frame='DatoFaltante', d.soporte=null, d.montaje=null, d.atributo='soporte_y_montaje', d.categoria='instalacion', d.valor=null,
    d.origen='cliente', d.estado='faltante', d.criticidad='sin_clasificar';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D5'})
SET d.caso='CU1', d.frame='DatoConfirmado', d.atributo='largo', d.categoria='dimensiones', d.valor='≈ 1 m',
    d.valor_normalizado=1000, d.unidad='mm', d.precision='aproximada', d.origen='respuesta_a_aclaracion', d.estado='confirmado';

MATCH (e:ExpresionCliente {id:'E1'}), (d:Dato {id:'D1'}) MERGE (e)-[:APORTA]->(d);
MATCH (rv:ReferenciaVisual {id:'RV1'}), (d:Dato {id:'D1'}) MERGE (rv)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E2'}), (d:Dato {id:'D2'}) MERGE (e)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E3'}), (d:Dato {id:'D3'}) MERGE (e)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E11'}), (d:Dato {id:'D3'}) MERGE (e)-[:APORTA {regla:'INT-R13'}]->(d);
MATCH (e:ExpresionCliente {id:'E4'}), (d:Dato {id:'D5'}) MERGE (e)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E11'}), (d:Dato {id:'D5'}) MERGE (e)-[:APORTA {regla:'INT-R13'}]->(d);
MATCH (p:Pedido {id:'P-01'}), (d:Dato {id:'D4'}) MERGE (p)-[:OMITE {regla:'INT-R02'}]->(d);

MERGE (nf:Requerimiento:NecesidadFuncional:Instancia {id:'NF1'})
SET nf.caso='CU1', nf.frame='NecesidadFuncional', nf.efecto_buscado='visibilidad y efecto nocturno; aspecto similar a RV1',
    nf.tecnologia_asociada='no_definida', nf.rigidez='a_confirmar', nf.cubre=['producto_tecnologia'];
MATCH (e:ExpresionCliente {id:'E5'}), (nf:NecesidadFuncional {id:'NF1'}) MERGE (e)-[:SE_INTERPRETA_COMO {regla:'INT-R07'}]->(nf);
MATCH (e:ExpresionCliente {id:'E11'}), (nf:NecesidadFuncional {id:'NF1'}) MERGE (e)-[:SE_INTERPRETA_COMO {regla:'INT-R07'}]->(nf);
MATCH (nf:NecesidadFuncional {id:'NF1'}), (k:CategoriaDato {id:'CAT-producto_tecnologia'}) MERGE (nf)-[:CUBRE {regla:'INT-R07'}]->(k);

UNWIND [
  {id:'A1', d:'D1', m:'ambiguedad', r:'INT-R01', e:'respondida', q:'¿Buscás el aspecto de la foto o específicamente tubos de vidrio?'},
  {id:'A2', d:'D3', m:'ambiguedad', r:'INT-R01', e:'respondida', q:'¿La pared está dentro del local o da a la calle?'},
  {id:'A3', d:'D5', m:'ambiguedad', r:'INT-R01', e:'respondida', q:'¿El metro es lo que debe medir el cartel o el espacio libre que tenés?'},
  {id:'A4', d:'D4', m:'faltante',   r:'INT-R02', e:'pendiente',  q:'¿Sobre qué pared va y cómo es esa superficie?'}
] AS x
MERGE (a:Aclaracion:Instancia {id:x.id})
SET a.caso='CU1', a.frame='Aclaracion', a.motivo=x.m, a.pregunta=x.q, a.formulacion='en_terminos_de_uso', a.estado=x.e
WITH a, x
MATCH (d:Dato {id:x.d}), (c:Cliente {id:'C-01'})
MERGE (d)-[:PROVOCA {regla: x.r + ', INT-R08'}]->(a)
MERGE (a)-[:SE_DIRIGE_A]->(c);
MATCH (a:Aclaracion {caso:'CU1', estado:'respondida'}), (p:Pedido {id:'P-01'}) MERGE (a)-[:ACTUALIZA {regla:'INT-R13'}]->(p);

MERGE (q:ConsultaSubmodulo:Instancia {id:'Q1'})
SET q.caso='CU1', q.frame='ConsultaSubmodulo', q.pregunta='bloqueante_o_postergable', q.estado='pendiente', q.respuesta=null;
MATCH (q:ConsultaSubmodulo {id:'Q1'}), (d:Dato {id:'D4'}), (s:Submodulo {id:'SM-MAT'})
MERGE (q)-[:CONSULTA_SOBRE]->(d)
MERGE (q)-[:SE_DIRIGE_A]->(s)
MERGE (d)-[:REQUIERE_CONSULTA_A {regla:'INT-R10', via:'Q1'}]->(s);

// =====================================================================================
// CU2 — P-02 / FR-02 «Letras corpóreas exterior» (PI2 Matías, caso 2) al cierre de la iteración 2
// =====================================================================================
MERGE (c:Cliente:Instancia {id:'C-02'}) SET c.caso='CU2', c.frame='Cliente', c.conoce_terminologia='si';
MERGE (p:Pedido:Instancia {id:'P-02'})
SET p.caso='CU2', p.frame='Pedido', p.estado='listo_para_evaluacion', p.iteracion=2,
    p.datos_requeridos=['producto_tecnologia','dimensiones','entorno','instalacion','apariencia'],
    p.historial=['it1: pendiente_de_aclaracion (INT-R03 contradicción K1, INT-R04 RC1, INT-R05 PR1, INT-R02 D11, INT-R10 Q2)',
                 'it2: respuesta (INT-R13): K1 resuelta, D11 confirmado, Q2 innecesaria → INT-R11 listo, FR-02 con AV2 (INT-R12)'];
MATCH (c:Cliente {id:'C-02'}), (p:Pedido {id:'P-02'}) MERGE (c)-[:FORMULA]->(p);

UNWIND [
  {id:'E6',  t:'letras corpóreas con luz',               f:'mensaje'},
  {id:'E7',  t:'frente del local, que da a la calle',   f:'mensaje'},
  {id:'E8',  t:'3 metros de largo',                      f:'mensaje'},
  {id:'E9',  t:'sí o sí antes de la inauguración',       f:'mensaje'},
  {id:'E10', t:'si se puede, colores del logo',          f:'mensaje'},
  {id:'E12', t:'Sí, llevan luz; la foto era por la tipografía. Van sobre la marquesina, a 4 metros de altura', f:'respuesta_a_aclaracion'}
] AS x
MERGE (e:ExpresionCliente:Instancia {id:x.id})
SET e.caso='CU2', e.frame='ExpresionCliente', e.texto_literal=x.t, e.fuente=x.f
WITH e MATCH (p:Pedido {id:'P-02'}) MERGE (p)-[:CONTIENE]->(e);

MERGE (rv:ReferenciaVisual:Instancia {id:'RV2'})
SET rv.caso='CU2', rv.frame='ReferenciaVisual', rv.descripcion='foto de letras corpóreas sin iluminación',
    rv.consistente_con_texto='no', rv.aporta_sobre=['apariencia'], rv.alcance_restringido=true;
MATCH (p:Pedido {id:'P-02'}), (rv:ReferenciaVisual {id:'RV2'}) MERGE (p)-[:INCLUYE]->(rv);

MERGE (d:Dato:DatoConfirmado:Instancia {id:'D6'})
SET d.caso='CU2', d.frame='DatoConfirmado', d.atributo='tecnologia', d.categoria='producto_tecnologia', d.valor='corporeo', d.origen='cliente', d.estado='confirmado';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D7'})
SET d.caso='CU2', d.frame='DatoConfirmado', d.atributo='iluminacion', d.categoria='producto_tecnologia', d.valor='si', d.origen='cliente', d.estado='confirmado',
    d.nota='Era DatoEnConflicto (K1); confirmado por la respuesta del cliente';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D8'})
SET d.caso='CU2', d.frame='DatoConfirmado', d.atributo='entorno', d.categoria='entorno', d.valor='exterior', d.origen='cliente', d.estado='confirmado';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D9'})
SET d.caso='CU2', d.frame='DatoConfirmado', d.atributo='largo_total', d.categoria='dimensiones', d.valor='3 m', d.valor_normalizado=3000, d.unidad='mm', d.origen='cliente', d.estado='confirmado';
MERGE (d:Dato:Instancia {id:'D10'})
SET d.caso='CU2', d.frame='Dato', d.atributo='iluminacion', d.categoria='producto_tecnologia', d.valor='no', d.origen='cliente', d.estado='descartado',
    d.nota='Aportado por la referencia RV2; descartado al resolverse K1 (M15)';
MERGE (d:Dato:DatoConfirmado:Instancia {id:'D11'})
SET d.caso='CU2', d.frame='DatoConfirmado', d.atributo='soporte_y_montaje', d.categoria='instalacion', d.valor='sobre marquesina a 4 m de altura',
    d.soporte='marquesina', d.montaje='sobre_marquesina', d.altura_m=4, d.origen='respuesta_a_aclaracion', d.estado='confirmado';

MATCH (e:ExpresionCliente {id:'E6'}), (d:Dato {id:'D6'}) MERGE (e)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E6'}), (d:Dato {id:'D7'}) MERGE (e)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E7'}), (d:Dato {id:'D8'}) MERGE (e)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E8'}), (d:Dato {id:'D9'}) MERGE (e)-[:APORTA]->(d);
MATCH (rv:ReferenciaVisual {id:'RV2'}), (d:Dato {id:'D10'}) MERGE (rv)-[:APORTA]->(d);
MATCH (e:ExpresionCliente {id:'E12'}), (d:Dato {id:'D11'}) MERGE (e)-[:APORTA {regla:'INT-R13'}]->(d);
MATCH (p:Pedido {id:'P-02'}), (d:Dato {id:'D11'}) MERGE (p)-[:OMITE {regla:'INT-R02'}]->(d);

MERGE (k:Contradiccion:Instancia {id:'K1'})
SET k.caso='CU2', k.frame='Contradiccion', k.tipo='texto-referencia', k.estado='resuelta', k.resolucion='D7';
MATCH (k:Contradiccion {id:'K1'}), (d:Dato) WHERE d.id IN ['D7','D10'] MERGE (k)-[:INVOLUCRA {regla:'INT-R03'}]->(d);

MERGE (r:Requerimiento:RestriccionCliente:Instancia {id:'RC1'})
SET r.caso='CU2', r.frame='RestriccionCliente', r.descripcion='plazo: antes de la inauguración', r.rigidez='obligatoria',
    r.ambito='plazo', r.criterio='plazo', r.evidencia='«sí o sí»';
MERGE (r:Requerimiento:Preferencia:Instancia {id:'PR1'})
SET r.caso='CU2', r.frame='Preferencia', r.descripcion='colores del logo', r.rigidez='preferencia', r.ambito='apariencia', r.evidencia='«si se puede»';
MATCH (e:ExpresionCliente {id:'E9'}), (r:RestriccionCliente {id:'RC1'}) MERGE (e)-[:SE_INTERPRETA_COMO {regla:'INT-R04'}]->(r);
MATCH (e:ExpresionCliente {id:'E10'}), (r:Preferencia {id:'PR1'}) MERGE (e)-[:SE_INTERPRETA_COMO {regla:'INT-R05'}]->(r);
MATCH (c:Cliente {id:'C-02'}), (r:RestriccionCliente {id:'RC1'}) MERGE (c)-[:IMPONE]->(r);

UNWIND [
  {id:'A5', o:'K1',  m:'contradiccion', r:'INT-R03', q:'¿Las letras llevan luz? ¿Qué te interesa de la foto de referencia?'},
  {id:'A6', o:'D11', m:'faltante',      r:'INT-R02', q:'¿A qué altura va y sobre qué superficie de la fachada?'}
] AS x
MERGE (a:Aclaracion:Instancia {id:x.id})
SET a.caso='CU2', a.frame='Aclaracion', a.motivo=x.m, a.pregunta=x.q, a.formulacion='tecnica', a.estado='respondida'
WITH a, x
MATCH (o {id:x.o}), (c:Cliente {id:'C-02'}), (p:Pedido {id:'P-02'})
MERGE (o)-[:PROVOCA {regla: x.r + ', INT-R08'}]->(a)
MERGE (a)-[:SE_DIRIGE_A]->(c)
MERGE (a)-[:ACTUALIZA {regla:'INT-R13'}]->(p);

MERGE (q:ConsultaSubmodulo:Instancia {id:'Q2'})
SET q.caso='CU2', q.frame='ConsultaSubmodulo', q.pregunta='bloqueante_o_postergable', q.estado='innecesaria', q.nota='D11 recibió valor del cliente';
MATCH (q:ConsultaSubmodulo {id:'Q2'}), (d:Dato {id:'D11'}), (s:Submodulo {id:'SM-MAT'})
MERGE (q)-[:CONSULTA_SOBRE]->(d) MERGE (q)-[:SE_DIRIGE_A]->(s);

// Ficha FR-02 (PI2 Matías, tabla «Sección de la ficha FR-02»)
MERGE (f:FichaRequerimientos:Instancia {id:'FR-02'}) SET f.caso='CU2', f.frame='FichaRequerimientos';
MERGE (av:Advertencia:Instancia {id:'AV2'})
SET av.caso='CU2', av.frame='Advertencia', av.motivo='alcance_limitado_de_referencia',
    av.texto='La referencia visual RV2 sólo es válida para la tipografía, no para la iluminación', av.regla='INT-R12';
MATCH (f:FichaRequerimientos {id:'FR-02'}), (p:Pedido {id:'P-02'}), (s:Submodulo {id:'SM-INT'})
MERGE (f)-[:CORRESPONDE_A]->(p) MERGE (s)-[:PRODUCE {regla:'INT-R11'}]->(f);
MATCH (f:FichaRequerimientos {id:'FR-02'}), (d:DatoConfirmado) WHERE d.id IN ['D6','D7','D8','D9','D11'] MERGE (f)-[:REGISTRA]->(d);
MATCH (f:FichaRequerimientos {id:'FR-02'}), (r:RestriccionCliente {id:'RC1'}) MERGE (f)-[:PRESERVA {regla:'INT-R04'}]->(r);
MATCH (f:FichaRequerimientos {id:'FR-02'}), (r:Preferencia {id:'PR1'}) MERGE (f)-[:INCLUYE]->(r);
MATCH (f:FichaRequerimientos {id:'FR-02'}), (av:Advertencia {id:'AV2'}), (rv:ReferenciaVisual {id:'RV2'})
MERGE (f)-[:INCLUYE {regla:'INT-R12'}]->(av) MERGE (av)-[:SOBRE]->(rv);
MATCH (f:FichaRequerimientos {id:'FR-02'}), (s:Submodulo) WHERE s.id IN ['SM-MAT','SM-MAN'] MERGE (f)-[:ALIMENTA]->(s);

// =====================================================================================
// L-C1 / L-C2 / L-C3 — casos del PI2 de Luciano (entrada directa al submódulo de rediseño)
// =====================================================================================
// L-C1: logo cursiva, canal 4 mm, NeónFrontal, fidelidad al logo alta (valores del frame de ejemplo del PI2)
MERGE (c:Cartel:Instancia {id:'CAR-L1'})
SET c.caso='L-C1', c.frame='Cartel', c.nombre='Logo_Cursiva', c.tecnologia_iluminacion='NeonFrontal', c.material='PLA',
    c.lleva_luz=true, c.dimension_maxima_mm=350, c.desde_ficha=false;
MERGE (g:Geometria:Instancia {id:'GEO-L1'})
SET g.caso='L-C1', g.frame='Geometria', g.ancho_canal_mm=4, g.dimension_maxima_mm=350, g.peso_estimado_gr=800;
MERGE (en:Entorno:Instancia {id:'ENT-L1'}) SET en.caso='L-C1', en.frame='Entorno', en.tipo='interior';
MERGE (cl:Cliente:Instancia {id:'CLI-L1'}) SET cl.caso='L-C1', cl.frame='Cliente', cl.identificacion='Cliente_Local';
MERGE (r:Requerimiento:RestriccionCliente:Instancia {id:'RCL-L1'})
SET r.caso='L-C1', r.frame='RestriccionCliente', r.descripcion='mantener la identidad visual del logo', r.rigidez='obligatoria',
    r.ambito='apariencia', r.criterio='fidelidad_logo', r.nivel='Alta';
MATCH (c:Cartel {id:'CAR-L1'}), (g:Geometria {id:'GEO-L1'}), (en:Entorno {id:'ENT-L1'}), (t:TecnologiaIluminacion {id:'TEC-NEON'}), (m:Material {id:'MAT-PLA'})
MERGE (c)-[:TIENE]->(g) MERGE (c)-[:SE_INSTALA_EN]->(en) MERGE (c)-[:REQUIERE]->(t) MERGE (c)-[:UTILIZA]->(m);
MATCH (cl:Cliente {id:'CLI-L1'}), (r:RestriccionCliente {id:'RCL-L1'}), (c:Cartel {id:'CAR-L1'})
MERGE (cl)-[:IMPONE]->(r) MERGE (r)-[:CONDICIONA]->(c);

// L-C2: cartel circular de 500 mm, tamaño final fijo
MERGE (c:Cartel:Instancia {id:'CAR-L2'})
SET c.caso='L-C2', c.frame='Cartel', c.nombre='Cartel_Circular', c.dimension_maxima_mm=500, c.desde_ficha=false;
MERGE (g:Geometria:Instancia {id:'GEO-L2'}) SET g.caso='L-C2', g.frame='Geometria', g.dimension_maxima_mm=500;
MERGE (cl:Cliente:Instancia {id:'CLI-L2'}) SET cl.caso='L-C2', cl.frame='Cliente';
MERGE (r:Requerimiento:RestriccionCliente:Instancia {id:'RCL-L2'})
SET r.caso='L-C2', r.frame='RestriccionCliente', r.descripcion='mantener el tamaño final (500 mm)', r.rigidez='obligatoria',
    r.ambito='dimensiones', r.criterio='tamano_final_fijo';
MATCH (c:Cartel {id:'CAR-L2'}), (g:Geometria {id:'GEO-L2'}) MERGE (c)-[:TIENE]->(g);
MATCH (cl:Cliente {id:'CLI-L2'}), (r:RestriccionCliente {id:'RCL-L2'}), (c:Cartel {id:'CAR-L2'})
MERGE (cl)-[:IMPONE]->(r) MERGE (r)-[:CONDICIONA]->(c);

// L-C3: cartel grande cuyo peso supera la carga admisible de la cinta bifaz; instalación no invasiva
MERGE (c:Cartel:Instancia {id:'CAR-L3'})
SET c.caso='L-C3', c.frame='Cartel', c.nombre='Cartel_Grande', c.desde_ficha=false;
MERGE (g:Geometria:Instancia {id:'GEO-L3'})
SET g.caso='L-C3', g.frame='Geometria', g.peso_estimado_cualitativo='elevado', g.supera_carga_admisible=true,
    g.nota='Hecho del caso: el peso supera la carga de la cinta bifaz. Valor numérico [PENDIENTE]';
MERGE (cl:Cliente:Instancia {id:'CLI-L3'}) SET cl.caso='L-C3', cl.frame='Cliente';
MERGE (r:Requerimiento:RestriccionCliente:Instancia {id:'RCL-L3'})
SET r.caso='L-C3', r.frame='RestriccionCliente', r.descripcion='instalación no invasiva (sin perforar)', r.rigidez='obligatoria',
    r.ambito='instalacion', r.criterio='instalacion_no_invasiva';
MATCH (c:Cartel {id:'CAR-L3'}), (g:Geometria {id:'GEO-L3'}), (f:SistemaFijacion {id:'FIJ-CINTA'})
MERGE (c)-[:TIENE]->(g) MERGE (c)-[:SE_FIJA_CON]->(f);
MATCH (cl:Cliente {id:'CLI-L3'}), (r:RestriccionCliente {id:'RCL-L3'}), (c:Cartel {id:'CAR-L3'})
MERGE (cl)-[:IMPONE]->(r) MERGE (r)-[:CONDICIONA]->(c);

// =====================================================================================
// Pertenencia a categorías, INSTANCIA_DE y traza de las reglas de Interpretación ya aplicadas
// =====================================================================================
MATCH (d:Dato:Instancia), (k:CategoriaDato {nombre: d.categoria}) MERGE (d)-[:PERTENECE_A]->(k);
MATCH (n:Instancia), (f:Frame {nombre: n.frame}) MERGE (n)-[:INSTANCIA_DE]->(f);

UNWIND [
  {caso:'CU1', p:'P-01', reglas:['INT-R01','INT-R02','INT-R07','INT-R08','INT-R10','INT-R13']},
  {caso:'CU2', p:'P-02', reglas:['INT-R03','INT-R04','INT-R05','INT-R02','INT-R08','INT-R10','INT-R13','INT-R11','INT-R12']}
] AS x
MERGE (ev:Evaluacion:Instancia {id:'EV-' + x.caso}) SET ev.caso=x.caso, ev.frame='Evaluacion'
WITH ev, x
MATCH (p:Pedido {id:x.p}) MERGE (ev)-[:SOBRE]->(p)
WITH ev, x
UNWIND range(0, size(x.reglas) - 1) AS i
MATCH (r:Regla {id: x.reglas[i]})
MERGE (ev)-[a:ACTIVO]->(r) ON CREATE SET a.orden = i + 1, a.submodulo = 'INT', a.precargada = true;
MATCH (ev:Evaluacion), (f:Frame {nombre:'Evaluacion'}) MERGE (ev)-[:INSTANCIA_DE]->(f);
