# 02 — Modelo integrado (Grupo 11)

Un solo modelo para los tres submódulos. Todo lo de este documento está cargado en Neo4j
(`neo4j/02_modelo.cypher` se genera desde la misma especificación: `salida/build/modelo_spec.py`).
El submódulo de Lautaro no tiene PI2: sus frames se derivan de su PI1 y se marcan **[PENDIENTE: PI2 Lautaro]**.

## 1. Nombres unificados

| Concepto unificado | Matías (PI2) | Lautaro (PI1) | Luciano (PI2) | Por qué |
|---|---|---|---|---|
| **Cartel** | — (trabaja con Pedido/Dato) | Cartel, Configuración propuesta | Diseño | Es el objeto que se evalúa y rediseña; «Diseño» queda como sinónimo |
| **FichaRequerimientos** | Ficha de requerimientos interpretados | ficha de requerimientos | FichaRequerimientos | Ya estaba alineado: es la interfaz entre submódulos |
| **Requerimiento → RestriccionCliente / Preferencia / NecesidadFuncional** | ídem, con `rigidez` | «restricciones del cliente» | RestricciónCliente (rigidez + fidelidad_logo, tamaño_final_fijo, no_invasiva) | Los slots booleanos de Luciano pasan a `criterio` + `nivel`; la rigidez es la de Matías |
| **Entorno** | Dato `entorno` | Entorno → Exposición ambiental | slot `Diseño.entorno` | Nodo propio: tiene tipo, protección y nivel de exposición (variable difusa candidata) |
| **Conflicto** | — | «restricción detectada con su causa» | Conflicto | Mismo concepto: hallazgo que viola un límite. `origen` = instalación o manufactura |
| **RestriccionConstructiva** | — | — | RestricciónConstructiva | Límite físico (6 mm, 400 mm). Se separa del hallazgo (Conflicto) |
| **DictamenAdecuacion** | — | Dictamen de adecuación | EvaluaciónMateriales | Salida de Lautaro y entrada de Luciano |
| **SistemaFijacion** / **Soporte** | — | Sistema de fijación / Soporte | SistemaFijación (sin. «Soporte») | Se elimina el sinónimo ambiguo: Soporte = superficie; SistemaFijacion = elementos de unión |
| **Material** | — | acrílico, PVC, ACM, chapa, silicona | PLA, PETG | Un frame; solo PLA/PETG tienen propiedades documentadas |
| **TecnologiaIluminacion** vs `tipo_cartel` | Dato tecnología (corpóreo) + iluminación | tiene_tecnología (Neón LED / Corpóreo / Retroiluminado) | NeónFrontal / Retroiluminado | El tipo de cartel (PG0) y la tecnología de iluminación son ejes distintos |
| **Recomendacion** | — | — | Recomendación (sin. «Dictamen») | «Dictamen» queda para Lautaro |
| **Aclaracion** | Aclaración / Consulta a submódulo | «solicitud de datos faltantes» | «devolver al submódulo de interpretación» (R8) | Todo pedido al cliente pasa por Interpretación |
| **UTILIZA / SE_FIJA_CON** | — | usa / se_fija_con | utiliza | Un verbo por relación |

## 2. Red semántica integrada

Imagen generada desde Neo4j: `salida/img/red_semantica_integrada.png` (núcleo) y
`salida/img/red_semantica_completa.png` (todos los frames no hoja). Diagrama Mermaid del núcleo:

```mermaid
flowchart LR
  subgraph INT["Interpretación — Matías"]
    Pedido[Pedido]
    ExpresionCliente[ExpresionCliente]
    Dato[Dato]
    Aclaracion[Aclaracion]
    ConsultaSubmodulo[ConsultaSubmodulo]
    Preferencia[Preferencia]
    NecesidadFuncional[NecesidadFuncional]
  end
  subgraph COM["Compartido / integración"]
    Cliente[Cliente]
    RestriccionCliente[RestriccionCliente]
    FichaRequerimientos[FichaRequerimientos]
    Advertencia[Advertencia]
    Cartel[Cartel]
    Material[Material]
    SistemaFijacion[SistemaFijacion]
    Conflicto[Conflicto]
    Regla[Regla]
    Excepcion[Excepcion]
    Requerimiento[Requerimiento]
  end
  subgraph MAT["Materiales e instalación — Lautaro"]
    Entorno[Entorno]
    ComponenteElectrico[ComponenteElectrico]
    Soporte[Soporte]
    DictamenAdecuacion[DictamenAdecuacion]
    VerificacionProfesional[VerificacionProfesional]
    SM_Materiales[SM_Materiales]
  end
  subgraph MAN["Manufacturabilidad y rediseño — Luciano"]
    Geometria[Geometria]
    Herramienta[Herramienta]
    TecnologiaIluminacion[TecnologiaIluminacion]
    RestriccionConstructiva[RestriccionConstructiva]
    AlternativaRediseno[AlternativaRediseno]
    Recomendacion[Recomendacion]
  end
  subgraph TRZ["Trazabilidad"]
    Evaluacion[Evaluacion]
  end
  Cliente -->|FORMULA| Pedido
  Pedido -->|CONTIENE| ExpresionCliente
  ExpresionCliente -->|SE_INTERPRETA_COMO| Requerimiento
  ExpresionCliente -->|APORTA| Dato
  Requerimiento -->|SE_DESCRIBE_MEDIANTE| Dato
  Aclaracion -->|SE_DIRIGE_A| Cliente
  Aclaracion -->|ACTUALIZA| Pedido
  FichaRequerimientos -->|PRESERVA| RestriccionCliente
  FichaRequerimientos -->|INCLUYE| Advertencia
  FichaRequerimientos -->|ALIMENTA| SM_Materiales
  FichaRequerimientos -->|DESCRIBE| Cartel
  ConsultaSubmodulo -->|SE_DIRIGE_A| SM_Materiales
  Cliente -->|IMPONE| RestriccionCliente
  FichaRequerimientos -->|CORRESPONDE_A| Pedido
  FichaRequerimientos -->|INCLUYE| Preferencia
  FichaRequerimientos -->|INCLUYE| NecesidadFuncional
  RestriccionCliente -->|CONDICIONA| Cartel
  Cartel -->|SE_INSTALA_EN| Entorno
  Cartel -->|UTILIZA| Material
  Cartel -->|UTILIZA| ComponenteElectrico
  Cartel -->|SE_FIJA_CON| SistemaFijacion
  SistemaFijacion -->|SOBRE| Soporte
  DictamenAdecuacion -->|EVALUA| Cartel
  DictamenAdecuacion -->|REGISTRA| Conflicto
  DictamenAdecuacion -->|SENALA| VerificacionProfesional
  DictamenAdecuacion -->|INCLUYE| Advertencia
  Conflicto -->|CAUSADO_POR| Entorno
  Excepcion -->|MODIFICA| Regla
  Cartel -->|TIENE| Geometria
  Cartel -->|REQUIERE| TecnologiaIluminacion
  Herramienta -->|DEFINE| RestriccionConstructiva
  TecnologiaIluminacion -->|DEFINE| RestriccionConstructiva
  SistemaFijacion -->|DEFINE| RestriccionConstructiva
  Material -->|DEFINE| RestriccionConstructiva
  Geometria -->|VIOLA| RestriccionConstructiva
  RestriccionConstructiva -->|GENERA| Conflicto
  Conflicto -->|EXIGE| AlternativaRediseno
  AlternativaRediseno -->|EXIGE| AlternativaRediseno
  Conflicto -->|PROVOCA| Aclaracion
  Cartel -->|DESCARTA| Material
  RestriccionCliente -->|ADMITE| AlternativaRediseno
  RestriccionCliente -->|RECHAZA| AlternativaRediseno
  AlternativaRediseno -->|CONFORMA| Recomendacion
  Evaluacion -->|SOBRE| Pedido
  Evaluacion -->|ACTIVO| Regla
  Evaluacion -->|CONCLUYE| Recomendacion
  RestriccionCliente -.->|ES_UN| Requerimiento
  Preferencia -.->|ES_UN| Requerimiento
  NecesidadFuncional -.->|ES_UN| Requerimiento
  classDef int fill:#E3EEF9,stroke:#2B6CB0
  classDef mat fill:#E0F4F1,stroke:#2A9D8F
  classDef man fill:#FDEBDD,stroke:#D9480F
  classDef com fill:#EEE8FA,stroke:#6B46C1
  classDef trz fill:#EDF0F4,stroke:#718096
  class Pedido,ExpresionCliente,Dato,Aclaracion,ConsultaSubmodulo,Preferencia,NecesidadFuncional int
  class Cliente,RestriccionCliente,FichaRequerimientos,Advertencia,Cartel,Material,SistemaFijacion,Conflicto,Regla,Excepcion,Requerimiento com
  class Entorno,ComponenteElectrico,Soporte,DictamenAdecuacion,VerificacionProfesional,SM_Materiales mat
  class Geometria,Herramienta,TecnologiaIluminacion,RestriccionConstructiva,AlternativaRediseno,Recomendacion man
  class Evaluacion trz
```

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

Totales en Neo4j: 55 frames, 105 slots, 66 relaciones de esquema,
38 reglas, 6 excepciones.

## 3. Jerarquía de frames (slots, facetas y demonios)

Imagen: `salida/img/jerarquia_frames.png`. Cómo se pasó de la red a los marcos:

| Elemento de la red | Elemento del marco | Elemento en Neo4j |
|---|---|---|
| Concepto | Frame | `(:Frame {nombre, tipo:'clase', submodulo})` |
| Atributo del concepto | Slot | `(:Frame)-[:TIENE_SLOT]->(:Slot)` |
| Restricción del atributo (tipo, rango, defecto, cardinalidad) | Faceta | propiedades del `:Slot` |
| Procedimiento asociado | Demonio (si_necesario / si_agregado / si_modificado) | propiedades del `:Slot`; la acción se implementa como consulta Cypher en 04 |
| es_un | Herencia | `(:Frame)-[:ES_UN]->(:Frame)`; en las instancias, etiquetas múltiples (`:Dato:DatoFaltante`) |
| Parte de | Composición | `(:Frame)-[:ES_PARTE_DE]->(:Frame)` |
| Instancia | Frame instancia | nodo con la etiqueta del frame + `:Instancia` + `[:INSTANCIA_DE]->(:Frame)` |
| Cambio de estado (M15) | Reclasificación | `REMOVE d:DatoFaltante SET d:DatoConfirmado` |

### Cliente

Quien formula el pedido, impone restricciones y responde aclaraciones.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N01 / PI2 Luciano C2

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| identificacion | Texto | — | — | 1 | — | — |
| conoce_terminologia | Enum | si \| no \| desconocido | desconocido | 1 | si_necesario: estimar por el vocabulario de sus expresiones | — |

### Pedido

Unidad de trabajo que se interpreta.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N02

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| id | Texto | único | — | 1 | — | — |
| estado | Enum | en_interpretacion \| pendiente_de_aclaracion \| listo_para_evaluacion | en_interpretacion | 1 | si_necesario: listo solo si se cumple INT-R11; si no, pendiente si hay aclaraciones/consultas abiertas | Solo INT-R11 asigna listo_para_evaluacion (M17) |
| iteracion | Entero | >= 1 | 1 | 1 | — | Solo la incrementa INT-R13 |
| datos_requeridos | Lista(Categoría) | producto_tecnologia, dimensiones, entorno, instalacion, apariencia | — | 1..n | si_necesario: obtener el conjunto validado por tipo de cartel | Valor provisional de PG0/PI1 [PENDIENTE: conjunto por tipo de cartel] |

### ExpresionCliente

Fragmento literal del pedido.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Es parte de:* Pedido · *Origen:* PI2 Matías N03 (M1)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| texto_literal | Texto | inmutable | — | 1 | — | No se reescribe ni se completa |
| fuente | Enum | mensaje \| conversacion \| boceto \| respuesta_a_aclaracion | — | 1 | — | — |
| interpretaciones_posibles | Lista(Texto) | — | — | 1..n | si_agregado: si hay más de una → INT-R01 (prioridad sobre INT-R07) | — |

### ReferenciaVisual

Imagen o boceto aportado por el cliente.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N04 (M2)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| descripcion | Texto | — | — | 1 | — | — |
| aporta_sobre | Lista(Categoría) | — | — | 1..n | si_modificado: si se restringe, registrar alcance limitado (INT-R12) | — |
| consistente_con_texto | Enum | si \| no \| sin_verificar | sin_verificar | 1 | si_modificado: si = no → crear Contradiccion (INT-R03) | — |

### Requerimiento

Necesidad o condición del cliente.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *abstracto* · *Origen:* PI2 Matías N05 · *Especializaciones:* RestriccionCliente, Preferencia, NecesidadFuncional

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| descripcion | Texto | — | — | 1 | — | — |
| rigidez | Enum | obligatoria \| preferencia \| a_confirmar | a_confirmar | 1 | si_modificado: mover a la sección de la ficha | a_confirmar se trata como obligatoria en el filtro de rediseño (PI2 Luciano) |
| ambito | Enum | plazo \| recursos \| dimensiones \| apariencia \| uso \| instalacion \| otro | — | 1 | — | — |

### RestriccionCliente

Condición declarada como obligatoria.

*Submódulo:* Compartido · *Hereda de:* Requerimiento · *Origen:* PI2 Matías N06 + PI2 Luciano C13

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| rigidez | Enum | obligatoria (fijo) | obligatoria | 1 | — | — |
| criterio | Enum | fidelidad_logo \| flexibilidad_estetica \| tamano_final_fijo \| instalacion_no_invasiva \| plazo | — | 0..1 | — | Slots de Luciano unificados en un criterio + nivel |
| nivel | Enum | Alta \| Media \| Baja | — | 0..1 | — | fidelidad_logo = Alta excluye flexibilidad = Alta |
| evidencia | Texto | declaración explícita de obligatoriedad | — | 1..n | si_agregado: incluir en ficha.restricciones (INT-R04) | — |

### Preferencia

Característica deseada y negociable.

*Submódulo:* Interpretación (Matías) · *Hereda de:* Requerimiento · *Origen:* PI2 Matías N07

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| rigidez | Enum | preferencia (fijo) | preferencia | 1 | — | Solo ordena alternativas; no rechaza (Luciano) |

### NecesidadFuncional

Efecto o uso buscado sin solución técnica.

*Submódulo:* Interpretación (Matías) · *Hereda de:* Requerimiento · *Origen:* PI2 Matías N08

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| efecto_buscado | Texto | — | — | 1 | — | — |
| tecnologia_asociada | Texto | no_definida \| <tecnología> | no_definida | 1 | — | Interpretación no puede asignarla; la propone Manufacturabilidad [PENDIENTE: criterio] |
| cubre | Lista(Categoría) | — | — | 0..n | si_agregado: registrar cobertura de producto_tecnologia (INT-R07) | — |

### Dato

Valor de un atributo del pedido con estado y origen.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *abstracto* · *Origen:* PI2 Matías N09 (M3) · *Especializaciones:* DatoConfirmado, DatoFaltante, DatoAmbiguo, DatoEnConflicto

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| atributo | Texto | — | — | 1 | — | — |
| categoria | Enum | producto_tecnologia \| dimensiones \| contexto_de_uso \| entorno \| instalacion \| apariencia \| restricciones | — | 1 | — | — |
| valor | Cualquiera | — | — | 0..1 | si_agregado: verificar faceta origen (INT-R09) | — |
| valor_normalizado | Número | — | — | 0..1 | — | mm; INT-R03 normaliza unidades |
| origen | Enum | cliente \| respuesta_a_aclaracion | — | 1 | — | NO admite 'supuesto' ni 'completado_por_sistema' (INT-R09) |
| estado | Enum | confirmado \| faltante \| ambiguo \| en_conflicto \| descartado | — | 1 | si_modificado: reclasificar etiqueta y recalcular estado del Pedido | — |

### DatoConfirmado

Dato aportado, claro y consistente.

*Submódulo:* Interpretación (Matías) · *Hereda de:* Dato · *Origen:* PI2 Matías N10

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| estado | Enum | confirmado (fijo) | confirmado | 1 | — | — |

### DatoFaltante

Dato requerido que no fue aportado.

*Submódulo:* Interpretación (Matías) · *Hereda de:* Dato · *Origen:* PI2 Matías N11

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| criticidad | Enum | bloqueante \| postergable \| sin_clasificar | sin_clasificar | 1 | si_agregado: crear Aclaracion (INT-R02) y ConsultaSubmodulo si depende de otro submódulo (INT-R10) | Criterio pendiente de adquisición; en CU1 lo resuelve R-MI-01 |

### DatoAmbiguo

Dato con más de una lectura.

*Submódulo:* Interpretación (Matías) · *Hereda de:* Dato · *Origen:* PI2 Matías N12

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| interpretaciones | Lista(Texto) | — | — | 2..n | si_agregado: crear Aclaracion (INT-R01) | — |

### DatoEnConflicto

Dato incompatible con otro del mismo atributo.

*Submódulo:* Interpretación (Matías) · *Hereda de:* Dato · *Origen:* PI2 Matías N13

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| contradiccion | Ref(Contradiccion) | — | — | 1..n | — | — |

### CategoriaDato

Agrupación de atributos del pedido.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N14 (M5)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| nombre | Texto | — | — | 1 | — | — |

### Contradiccion

Incompatibilidad entre dos o más datos.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N15 (M4)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | texto-texto \| texto-medida \| texto-referencia \| medida-referencia | — | 1 | — | — |
| estado | Enum | abierta \| resuelta | abierta | 1 | si_modificado: al resolverse: elegido → confirmado, resto → descartado | — |
| resolucion | Ref(Dato) | — | — | 0..1 | — | Solo la respuesta del cliente; nunca el sistema |

### Aclaracion

Pregunta al cliente para resolver un problema interpretativo.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N16

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| motivo | Enum | ambiguedad \| faltante \| contradiccion \| rigidez | — | 1 | — | — |
| pregunta | Texto | — | — | 1 | — | No debe inducir una solución técnica |
| formulacion | Enum | tecnica \| en_terminos_de_uso | — | 1 | si_necesario: aplicar INT-R08 | — |
| estado | Enum | pendiente \| respondida | pendiente | 1 | si_modificado: respondida → INT-R13 | — |

### ConsultaSubmodulo

Consulta a otro submódulo sobre la necesidad/criticidad de un dato.

*Submódulo:* Interpretación (Matías) · *Hereda de:* — (raíz) · *Origen:* PI2 Matías (M10)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| pregunta | Enum | es_necesario \| bloqueante_o_postergable | — | 1 | — | — |
| estado | Enum | pendiente \| respondida \| innecesaria | pendiente | 1 | — | — |
| respuesta | Enum | bloqueante \| postergable \| no_necesario | — | 0..1 | si_agregado: actualizar dato.criticidad | — |

### FichaRequerimientos

Salida de Interpretación; entrada de Materiales y Manufacturabilidad.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PI2 Matías N17 = PI2 Luciano C3 = PI1 Lautaro (entrada)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| id | Texto | — | — | 1 | — | — |
| pedido | Ref(Pedido) | — | — | 1 | si_agregado: verificar precondición pedido.estado = listo_para_evaluacion | — |
| destinatarios | Lista(Submodulo) | — | — | 1..2 | — | — |

### Advertencia

Incertidumbre que viaja sin tratarse como hecho.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Es parte de:* FichaRequerimientos · *Origen:* PI2 Matías N18 (M9)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| motivo | Enum | dato_postergable_pendiente \| rigidez_a_confirmar \| alcance_limitado_de_referencia \| umbral_pendiente | — | 1 | — | — |
| texto | Texto | — | — | 1 | — | — |

### Submodulo

Agente experto del sistema.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PG0 / PI2 Matías N20–N23 · *Especializaciones:* SM_Interpretacion, SM_Materiales, SM_Manufacturabilidad

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| responsable | Texto | — | — | 1 | — | — |
| tarea_experta | Texto | — | — | 1 | — | — |

### Cartel

Configuración propuesta que se evalúa y, si hace falta, se rediseña.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PG0 (Cartel) = PI1 Lautaro (Cartel/Configuración) = PI2 Luciano C1 (Diseño)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo_cartel | Enum | NeonLED \| Corporeo \| Retroiluminado | — | 0..1 | — | PG0 |
| lleva_luz | Booleano | — | — | 0..1 | — | — |
| tecnologia_iluminacion | Enum | NeonFrontal \| Retroiluminado | — | 0..1 | si_necesario: si vacío y lleva_luz → la propone Manufacturabilidad [PENDIENTE: criterio]; si no consta si lleva luz → devolver a Interpretación | — |
| material | Enum | PLA \| PETG | — | 0..1 | si_necesario: entorno Exterior → MAN-R7 | — |
| dimension_maxima_mm | Número | > 0 | — | 0..1 | — | mm (se completa desde la ficha) |
| montaje | Enum | adosado \| bandera \| colgado \| sobre_estructura \| sobre_marquesina | — | 0..1 | — | PI1 Lautaro |
| altura_m | Número | > 0 | — | 0..1 | — | — |

### Entorno

Lugar donde queda el cartel y su exposición.

*Submódulo:* Materiales (Lautaro) · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro §2/§10 + PI2 Luciano (slot entorno) + PI2 Matías (Dato entorno) · **[PENDIENTE: PI2 Lautaro]**

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | interior \| exterior | — | 1 | — | — |
| proteccion | Enum | ninguna \| alero \| nicho \| no_informada | no_informada | 1 | — | — |
| condicion_especial | Enum | humedad_alta \| sol_directo \| ninguna \| no_informada | no_informada | 1 | — | — |
| nivel_exposicion | Enum | baja \| media \| alta | — | 0..1 | si_necesario: interpretar con R-MI-02 / R-MI-08 / R-MI-09 / R-MI-GEN | Variable difusa candidata [PENDIENTE: funciones de pertenencia] |

### Material

Insumo base del cartel.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro + PI2 Luciano C6 · *Especializaciones:* PLA, PETG

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| nombre | Texto | — | — | 1 | — | — |
| apto_exterior | Booleano | — | — | 0..1 | — | Documentado solo para PLA/PETG (propiedades térmicas FDM) |
| resistencia_uv | Texto | — | — | 0..1 | — | [PENDIENTE: fichas técnicas] para acrílico, PVC, ACM, chapa, silicona |

### ComponenteElectrico

Tiras LED, Neón LED, fuente, cableado.

*Submódulo:* Materiales (Lautaro) · *Hereda de:* — (raíz) · *Es parte de:* Cartel · *Origen:* PI1 Lautaro §2 · **[PENDIENTE: PI2 Lautaro]**

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | tira_LED \| neon_LED \| fuente \| cableado | — | 1 | — | — |
| grado_ip | Texto | — | — | 0..1 | — | IEC 60529 [PENDIENTE: grado exigido según exposición] |
| accesible | Booleano | — | — | 0..1 | — | R-MI-07 |

### Soporte

Superficie o estructura donde se fija el cartel.

*Submódulo:* Materiales (Lautaro) · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro §2 · **[PENDIENTE: PI2 Lautaro]**

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | mamposteria \| placa_de_yeso \| vidrio \| estructura_metalica \| marquesina | — | 1 | — | — |
| capacidad | Enum | baja \| normal | — | 0..1 | — | [PENDIENTE: peso seguro por soporte] |

### SistemaFijacion

Elementos que unen el cartel al soporte.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro §2 + PI2 Luciano C8

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | tarugos \| anclaje_quimico \| separadores \| perfiles \| cables \| adhesivo \| cinta_bifaz | — | 1 | — | — |
| requiere_perforar | Booleano | — | — | 1 | — | Necesario para MAN-R9 |
| carga_admisible | Número | — | — | 0..1 | — | [PENDIENTE: valor] (RestriccionPeso) |

### AgenteAmbiental

UV, agua, temperatura, viento.

*Submódulo:* Materiales (Lautaro) · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro §10 · **[PENDIENTE: PI2 Lautaro]**

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| nombre | Texto | — | — | 1 | — | — |

### DictamenAdecuacion

Salida de Materiales: apto / apto con condiciones / no apto.

*Submódulo:* Materiales (Lautaro) · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro §2 = PI2 Luciano C4 (EvaluaciónMateriales) · **[PENDIENTE: PI2 Lautaro]**

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| resultado | Enum | apto \| apto_con_condiciones \| no_apto \| no_evaluable | — | 1 | — | — |
| condiciones | Lista(Texto) | — | — | 0..n | — | — |
| reglas_aplicadas | Lista(Regla) | — | — | 1..n | — | — |

### VerificacionProfesional

Revisión estructural/eléctrica que el sistema señala y no resuelve.

*Submódulo:* Materiales (Lautaro) · *Hereda de:* — (raíz) · *Origen:* PI1 Lautaro §2 · **[PENDIENTE: PI2 Lautaro]**

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | estructural \| electrica | — | 1 | — | — |

### Excepcion

Condición particular que relaja o endurece una regla general.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PG0 + PI1 Lautaro §6 + PI1 Luciano §6

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| condicion | Texto | — | — | 1 | — | — |
| efecto | Texto | — | — | 1 | — | — |

### Regla

Regla de producción trazable.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PI1/PI2

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| id | Texto | — | — | 1 | — | — |
| origen | Enum | experto \| propuesta \| documental | — | 1 | — | — |
| estado_validacion | Texto | — | — | 1 | — | — |

### Geometria

Propiedades espaciales y de trazo.

*Submódulo:* Manufacturabilidad (Luciano) · *Hereda de:* — (raíz) · *Es parte de:* Cartel · *Origen:* PI2 Luciano C5

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| ancho_canal_mm | Número | > 0 | — | 0..1 | si_modificado: recalcular Conflicto | — |
| dimension_maxima_mm | Número | > 0 | — | 1 | — | — |
| peso_estimado_gr | Número | > 0 | — | 0..1 | — | — |
| supera_carga_admisible | Booleano | — | — | 0..1 | — | Hecho del caso L-C3 mientras falte el valor límite |

### Herramienta

Impresora 3D FDM.

*Submódulo:* Manufacturabilidad (Luciano) · *Hereda de:* — (raíz) · *Origen:* PI2 Luciano C7

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Texto | — | — | 1 | — | — |
| volumen_util_maximo | Número | > 0 | — | 1 | si_necesario: dimension_maxima_mm > volumen → Conflicto ExcedeCama (MAN-R3) | 400 mm (documental) |

### TecnologiaIluminacion

Método de iluminación.

*Submódulo:* Manufacturabilidad (Luciano) · *Hereda de:* — (raíz) · *Origen:* PI2 Luciano C9 · *Especializaciones:* NeonFrontal, Retroiluminado

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| nombre | Texto | — | — | 1 | — | — |

### RestriccionConstructiva

Límite físico innegociable de la manufactura.

*Submódulo:* Manufacturabilidad (Luciano) · *Hereda de:* — (raíz) · *Origen:* PI2 Luciano C10 · *Especializaciones:* RestriccionTrazo, RestriccionVolumen, RestriccionPeso, RestriccionTemperatura

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | Trazo \| Volumen \| Peso \| Temperatura | — | 1 | — | — |
| valor_limite | Número | — | — | 0..1 | — | Trazo 6 mm, Volumen 400 mm (documental); Peso [PENDIENTE] |
| unidad | Texto | — | — | 1 | — | — |

### Conflicto

Hallazgo: una característica viola un límite o criterio.

*Submódulo:* Compartido · *Hereda de:* — (raíz) · *Origen:* PI2 Luciano C11 = PI1 Lautaro «restricción detectada»

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | TrazoFino \| ExcedeCama \| RiesgoCaida \| MaterialEntorno \| ComponenteEntorno \| Instalacion \| Mantenimiento | — | 1 | — | — |
| origen | Enum | manufactura \| instalacion | — | 1 | — | — |
| estado | Enum | Abierto \| Resuelto \| Inviable | Abierto | 1 | si_agregado: generar alternativas (MAN-R2/R3/R4); si_modificado: todas no viables → Inviable (MAN-R8) | — |

### AlternativaRediseno

Modificación propuesta para sortear un conflicto.

*Submódulo:* Manufacturabilidad (Luciano) · *Hereda de:* — (raíz) · *Origen:* PI2 Luciano C12 · *Especializaciones:* CambioMaterial, CambioGeometria, CambioFijacion, CambioTecnologia, SegmentacionModular

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo_cambio | Enum | Material \| Geometria \| Fijacion \| Tecnologia \| Segmentacion | — | 1 | — | — |
| impacto_estetico | Enum | Alto \| Medio \| Bajo | — | 0..1 | si_agregado: impacto Alto y fidelidad_logo Alta → viable = False | — |
| viable | Booleano | — | — | 0..1 | — | — |
| justificacion | Texto | — | — | 1 | — | — |

### Recomendacion

Salida final: confirmación o alternativas admitidas con justificación.

*Submódulo:* Manufacturabilidad (Luciano) · *Hereda de:* — (raíz) · *Origen:* PI2 Luciano C14

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| tipo | Enum | confirmacion \| rediseno \| inviable | — | 1 | — | — |
| justificacion | Texto | — | — | 1 | — | — |
| decide | Texto | fabricante (fijo) | fabricante | 1 | — | El sistema recomienda; decide el fabricante |

### Evaluacion

Rastro de decisión de un caso: reglas activadas en orden.

*Submódulo:* Trazabilidad · *Hereda de:* — (raíz) · *Origen:* Propuesta (pregunta integrador «Trazabilidad»)

| Slot | Tipo | Valores / rango | Defecto | Card. | Demonio | Nota |
|---|---|---|---|---|---|---|
| caso | Texto | — | — | 1 | — | — |
| fecha | Fecha | — | — | 1 | — | — |


## 4. Reglas trazables

Origen: **experto** = conocimiento relevado de Luciano (en Lautaro, declarado «experto» en su PI1 pero todavía
candidato); **propuesta** = regla formulada por nosotros (Matías o integración) pendiente de validar con el experto;
**documental** = sale de una ficha técnica o norma. En Neo4j cada regla es un nodo `:Regla` con `[:USA]->(:Slot)`.

| ID | Submódulo | SI (condición) | ENTONCES (conclusión) | Origen | Tipo | Fuente | Estado | Implementada |
|---|---|---|---|---|---|---|---|---|
| **INT-R01** | INT | Expresión con más de una interpretación razonable y sin confirmar | crear DatoAmbiguo (valor nulo) + Aclaración (motivo ambigüedad) | **propuesta** | Heurística / subjetiva | PI1 Matías regla 1 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R02** | INT | atributo de datos_requeridos sin Dato aportado ni NF que lo cubra | crear DatoFaltante (sin_clasificar), Pedido OMITE, Aclaración | **propuesta** | Determinística | PI1 Matías reglas 2 y 7 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R03** | INT | dos Datos del mismo atributo con valores incompatibles | crear Contradicción abierta, datos en_conflicto, Aclaración | **propuesta** | Determinística | PI1 Matías regla 3 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R04** | INT | el cliente declara explícitamente que una condición debe cumplirse | crear RestriccionCliente (obligatoria) en la ficha | **propuesta** | Heurística / empírica | PI1 Matías regla 4 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R05** | INT | condición expresada como deseo, sin marca de obligatoriedad | crear Preferencia; no promover a restricción sin confirmación | **propuesta** | Heurística / empírica | PI1 Matías regla 5 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R06** | INT | no puede determinarse si es obligatoria o deseo | rigidez = a_confirmar + Aclaración (motivo rigidez) | **propuesta** | Subjetiva | PI1 Matías caso límite 5 | Candidata (pendiente de validación con el experto) | no (sin caso) |
| **INT-R07** | INT | el cliente describe un efecto y no define la tecnología (sin ambigüedad pendiente) | crear NecesidadFuncional (tecnología no_definida) que CUBRE producto_tecnologia | **propuesta** | Inferencial | PI1 Matías regla 6 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R08** | INT | se crea una Aclaración | formulación técnica si conoce_terminologia = si; si no, en términos de uso | **propuesta** | Contextual | PI1 Matías excepción 2 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R09** | INT | se intenta asignar un valor con origen distinto de cliente / respuesta_a_aclaracion | rechazar la asignación; el dato sigue faltante | **propuesta** | Determinística (integridad) | PI1 Matías regla 9 + criterio de validez | Validada como criterio de diseño | 04 (control de integridad) |
| **INT-R10** | INT | la necesidad o criticidad de un dato depende de materiales/instalación/manufactura | crear ConsultaSubmodulo dirigida al submódulo dueño | **propuesta** | Contextual | PI1 Matías regla 10 | Candidata (pendiente de validación con el experto) | 03 (precargada) |
| **INT-R11** | INT | todo dato requerido confirmado, cubierto por NF o faltante postergable; sin ambiguos; sin contradicciones abiertas | Pedido.estado = listo_para_evaluacion + crear FichaRequerimientos | **propuesta** | Determinística / inferencial | PI1 Matías regla 8 | Candidata (pendiente de validación con el experto) | 04 |
| **INT-R12** | INT | al crear la ficha hay faltantes postergables, rigidez a_confirmar o referencias restringidas | crear una Advertencia por cada uno | **propuesta** | Inferencial | PI1 Matías pregunta experta 8 | Candidata (pendiente de validación con el experto) | 04 |
| **INT-R13** | INT | una Aclaración pasa a respondida | nueva Expresión (respuesta_a_aclaracion), reevaluar R01–R03/R07, iteración + 1 | **propuesta** | Determinística | PI1 Matías flecha «Nueva info» | Candidata (pendiente de validación con el experto) | 04 |
| **R-MI-01** | MAT | falta entorno, tipo de soporte o dimensiones | no evaluar; solicitar el dato a Interpretación (⇒ el faltante es bloqueante) | **experto** | Determinística | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **R-MI-02** | MAT | exterior, sin alero ni nicho, expuesto a sol y lluvia | nivel_exposicion = alta | **experto** | Difusa (hoy crisp) | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **R-MI-GEN** | MAT | entorno interior sin humedad alta ni sol directo | nivel_exposicion = baja | **experto** | Contextual | PI1 Lautaro §6 (regla general) | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **R-MI-03** | MAT | exposición alta y componente eléctrico sin protección adecuada contra agua | registrar conflicto componente–entorno (condición: protección IP [PENDIENTE: grado]) | **documental+experto** | Determinística | PI1 Lautaro §7 (IEC 60529) | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **R-MI-04** | MAT | exposición alta y material no indicado para exterior/UV | registrar conflicto material–entorno (condición: material apto exterior) | **documental+experto** | Heurística | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **R-MI-05** | MAT | soporte de baja capacidad y peso mayor al seguro | conflicto de instalación; revisar fijación a estructura | **experto** | Heurística | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | no (sin caso; umbral [PENDIENTE]) |
| **R-MI-06** | MAT | gran porte, bandera o en altura con exposición al viento | marcar verificación estructural profesional | **experto+documental** | Contextual | PI1 Lautaro §7 (CIRSOC 102) | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 (como advertencia: umbral [PENDIENTE]) |
| **R-MI-07** | MAT | fuente de alimentación sin acceso | conflicto de mantenimiento | **experto** | Heurística | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | no (dato no relevado en los casos) |
| **R-MI-08** | MAT | exterior dentro de nicho o bajo alero efectivo | reducir nivel de exposición (magnitud a validar) | **experto** | Contextual | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | no (sin caso) |
| **R-MI-09** | MAT | interior con humedad alta o sol directo | evaluar con exposición media o alta | **experto** | Contextual | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | no (sin caso) |
| **R-MI-10** | MAT | sin conflictos y datos completos | dictamen apto; derivar a Manufacturabilidad | **experto** | Determinística | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **R-MI-11** | MAT | conflictos resolubles con condiciones (fijación, protección, acceso) | dictamen apto con condiciones, listando cada condición | **experto** | Heurística | PI1 Lautaro §7 | Candidata PI1, sin valores numéricos [PENDIENTE: PI2 Lautaro] | 04 |
| **MAN-R1** | MAN | canal ≥ 6 mm, dimensión ≤ 400 mm, peso ≤ límite y sin advertencias | confirmar manufacturabilidad (listo para laminar) | **documental** | Determinística | PI2 Luciano R1 | Formalizada PI2 | 04 |
| **MAN-R2** | MAN | ancho_canal_mm < 6 y tecnología NeónFrontal | Conflicto TrazoFino + alternativas CambioGeometría y CambioTecnología | **documental** | Determinística | PI2 Luciano R2 (ficha técnica neón) | Formalizada PI2 | 04 |
| **MAN-R3** | MAN | dimension_maxima_mm > volumen_util_maximo (400) | Conflicto ExcedeCama + SegmentaciónModular que EXIGE CambioFijación (refuerzo) | **documental** | Determinística | PI2 Luciano R3 (ficha impresora) | Formalizada PI2 | 04 |
| **MAN-R4** | MAN | peso estimado > carga admisible de la fijación | Conflicto RiesgoCaída + ReducirInfill y CambioFijación | **experto** | Heurística | PI2 Luciano R4 | Formalizada PI2; carga admisible [PENDIENTE] | 04 |
| **MAN-R5** | MAN | TrazoFino y flexibilidad_estetica Alta | seleccionar CambioGeometría, descartar CambioTecnología | **experto** | Heurística | PI2 Luciano R5 (experiencia L. Marquesini) | Formalizada PI2 | 04 (sin caso que la dispare) |
| **MAN-R6** | MAN | TrazoFino y fidelidad_logo Alta | RECHAZA CambioGeometría, ADMITE CambioTecnología (retroiluminado) | **experto** | Contextual | PI2 Luciano R6 / PI1 Luciano caso 5 | Formalizada PI2 | 04 |
| **MAN-R7** | MAN | entorno Exterior | descartar PLA, seleccionar PETG | **documental** | Contextual | PI2 Luciano R7 (propiedades térmicas FDM) | Formalizada PI2 | 04 |
| **MAN-R8** | MAN | existe Conflicto y todas sus alternativas son no viables | Conflicto Inviable → Aclaración (motivo rigidez) vía Interpretación | **propuesta** | Inferencial | PI2 Luciano R8 | Formalizada PI2 | 04 (sin caso que la dispare) |
| **MAN-R9** | MAN | RiesgoCaída e instalacion_no_invasiva | RECHAZA CambioFijación, ADMITE ReducirInfill | **experto** | Contextual | PI2 Luciano R9 / PI1 Luciano caso 2 | Formalizada PI2 | 04 |
| **MAN-FILTRO** | MAN | ninguna RestriccionCliente obligatoria rechaza la alternativa | alternativa viable (ADMITE si la restricción la respeta explícitamente) | **experto** | Determinística | PI1 Luciano etapa 5 / PI2 RL8 | Formalizada PI2 | 04 |
| **MAN-G1** | MAN | cartel exterior | usar placa base de mayor grosor [PENDIENTE: espesor] | **experto** | Contextual | PI1 Luciano §6 (regla general) | Relevada en PI1; sin valor | no (sin espesor relevado) |
| **INTEG-01** | COM | existe FichaRequerimientos sin Cartel asociado | instanciar Cartel/Entorno con los DatosConfirmados de la ficha (sin completar huecos) | **propuesta** | Determinística | Interacción PI1 (los tres) + RL12 Luciano | Propuesta de integración | 04 |
| **INTEG-02** | COM | Conflictos de manufactura resueltos con alternativas viables | Recomendación que CONFORMAN las alternativas + registrar Evaluacion (reglas activadas) | **propuesta** | Inferencial | PI1 Luciano etapa 6 + pregunta integrador «Trazabilidad» | Propuesta de integración | 04 |

**Estrategia de resolución de conflictos.** Se conserva la de Matías (INT-R09 → INT-R13 → detección → clasificación →
aclaraciones → INT-R11 → INT-R12) y se extiende al flujo integrado: Interpretación → INTEG-01 → Materiales
(R-MI-01 → exposición → R-MI-03/04/06 → dictamen) → Manufacturabilidad (MAN-R7 → detección R2/R3/R4 → filtros
R6/R5/R9/FILTRO → R8) → INTEG-02. Es el orden de los bloques de `neo4j/04_consultas.cypher`.

### Excepciones

| ID | Condición | Efecto | Modifica | Fuente |
|---|---|---|---|---|
| EX-01 | Cartel exterior dentro de un nicho o bajo un alero efectivo | Se reduce la exposición / el grado IP exigido (magnitud a validar) | R-MI-02 | PI1 Lautaro §6 |
| EX-02 | Interior húmedo (cocina, natatorio, junto al mar) o con sol directo | Se evalúa con criterios de exterior | R-MI-GEN | PI1 Lautaro §6 |
| EX-03 | Existe estructura portante accesible detrás del revestimiento | Pasa de no apto a apto con condiciones | R-MI-05 | PI1 Lautaro §6 |
| EX-04 | Gran porte, bandera o altura con viento | El sistema no resuelve la fijación: deriva a un profesional | R-MI-06 | PI1 Lautaro §6 |
| EX-05 | Cartel exterior dentro de un nicho | Se puede relajar el grosor de la placa base | MAN-G1 | PI1 Luciano §6 |
| EX-06 | Información ausente que puede completarse más adelante | El faltante es postergable y no bloquea (viaja como advertencia) | INT-R11 | PI1 Matías §6 |

## 5. Incertidumbre → candidatos a variables difusas

Ninguna tiene funciones de pertenencia ni rangos relevados: todo es **próximo paso (PI3)**. Hoy se modelan como
marcadores crisp.

| Variable lingüística | Términos tentativos | Dónde vive en el modelo | Fuente |
|---|---|---|---|
| Exposición ambiental | baja / media / alta | `Entorno.nivel_exposicion` (R-MI-02, R-MI-GEN) | PI1 Lautaro §8 |
| Dificultad de instalación | — | altura, acceso, soporte, tamaño | PI1 Lautaro §8 |
| Confiabilidad del soporte | — | `Soporte.capacidad` | PI1 Lautaro §8 |
| Límite «mediano / gran porte» | — | R-MI-06 (hoy: advertencia) | PI1 Lautaro §8 |
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
| 8 | **Materiales** | Cartel + Entorno | R-MI-01, R-MI-GEN, R-MI-10 | exposición baja → **apto** (advertencia EX-02 no verificable) |
| 9 | **Manufacturabilidad** | Geometría 1000 mm vs impresora 400 mm | MAN-R3, MAN-FILTRO | ExcedeCama → **Segmentación modular + refuerzo**, viables |
| 10 | Integración | — | INTEG-02 | Recomendación; **decide el fabricante** |

### CU2 — «Letras corpóreas exterior»: FR-02 cruza los tres submódulos

Base: P-02 / FR-02 del PI2 de Matías + casos típicos de Lautaro («corpóreo exterior en fachada → apto con
condiciones») + «Continuidad» del PI2 de Luciano (R3 y R7 sobre FR-02).

| Paso | Submódulo | Entrada | Regla | Salida |
|---|---|---|---|---|
| 1 | Interpretación | «letras corpóreas con luz… da a la calle… 3 m… sí o sí antes de la inauguración… si se puede colores del logo» + foto sin luz | INT-R03, R04, R05, R02, R10 | K1 contradicción, RC1 obligatoria, PR1 preferencia, D11 faltante |
| 2 | Interpretación | «llevan luz; la foto era por la tipografía; sobre la marquesina a 4 m» | INT-R13, R11, R12 | **FR-02** + AV2 (la referencia solo vale para tipografía) |
| 3 | Integración | FR-02 | INTEG-01 | Cartel corpóreo, con luz, 3000 mm, exterior, marquesina, 4 m |
| 4 | **Materiales** | Cartel + Entorno | R-MI-02 | exposición **alta** (advertencia EX-01: alero/nicho no informado) |
| 5 | **Materiales** | componentes / material / altura | R-MI-03, R-MI-04, R-MI-06, R-MI-11 | **apto con condiciones**: IP de lo eléctrico `[PENDIENTE grado]`, material apto exterior; verificación estructural a confirmar `[PENDIENTE umbral]` |
| 6 | **Manufacturabilidad** | entorno exterior | MAN-R7 | **PETG** (descarta PLA) → resuelve la condición de material de Lautaro |
| 7 | **Manufacturabilidad** | 3000 mm vs 400 mm | MAN-R3, MAN-FILTRO | Segmentación (= letra por letra) + refuerzo; advertencia: impacto en RC1 (plazo) `[PENDIENTE]` |
| 8 | Integración | — | INTEG-02 | Recomendación con material, alternativas y condiciones de instalación; decide el fabricante |

### Casos de prueba complementarios (submódulo de Luciano)

L-C1 (trazo 4 mm < 6 mm, fidelidad alta → MAN-R6 rechaza engrosar, admite retroiluminado), L-C2 (Ø 500 mm, tamaño
fijo → segmentación admitida) y L-C3 (peso > cinta bifaz, no invasiva → MAN-R9 rechaza fijación, admite reducir
infill). Se usan para mostrar el **filtro por restricciones del cliente** (`salida/img/filtro_luciano.png`).

## 7. Observaciones del modelado (para la defensa)

- La integración resolvió un hueco real: la criticidad «bloqueante/postergable» que Matías no podía decidir la
  responde la regla R-MI-01 de Lautaro (consulta Q1). Es el tipo de dependencia que el modelo separado no mostraba.
- La condición de material de Lautaro (R-MI-04) la resuelve una regla documental de Luciano (MAN-R7): dos submódulos,
  un mismo nodo `Conflicto`.
- Inconsistencia detectada en el material: el conjunto provisional `datos_requeridos` incluye «apariencia», pero
  FR-02 no registra ningún dato de apariencia y aun así el PI2 de Matías lo da por suficiente. Se mantiene el
  resultado documentado (P-02 listo) y se marca para revisar `[PENDIENTE]`.
- Tras una reclasificación (M15) quedan relaciones históricas (p. ej. `P-01 OMITE D4` con D4 ya confirmado): es
  intencional, conserva la traza.
