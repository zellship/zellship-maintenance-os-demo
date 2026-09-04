# OEE Experience Hub — Storyboard v1

## Control del documento

| Campo       | Valor                                      |
| ----------- | ------------------------------------------ |
| Documento   | `OEE-HUB-STORYBOARD-v1`                    |
| Versión     | `1.2.1`                                    |
| Estado      | Aprobado para implementación               |
| Fecha       | 2026-09-04                                 |
| Brief padre | `OEE-HUB-CANONICAL-BRIEF-v1`               |
| Baseline    | `785329abbd96673110a152be9cbc2e854ba103e8` |

## 1. Autoridad y recorrido recomendado

Este documento gobierna el orden, contenido, interacción y criterios de aceptación. Los límites,
definiciones y controles Truth Mode pertenecen al brief canónico y no se duplican aquí.

```text
/oee/
├── /oee/presentacion/
├── /oee/demo/
└── /oee/propuesta/
```

Recorrido recomendado:

```text
Experience Hub
→ Presentación
→ Demo
→ Propuesta
→ Taller de entendimiento
```

El usuario también puede entrar directamente a cualquiera de las tres experiencias. Todas mantienen
un retorno visible a `/oee/`.

## 2. Patrones globales

### Encabezado

- Logo OS oficial o placeholder explícito.
- Nombre de la experiencia actual.
- Acción **Volver al hub** fuera de la portada.
- Sin navegación administrativa heredada de las demos actuales.

### Pie

- `Designed to Evolve.`
- `Enabled by Zellship Business OS.`
- Disclosure general de demo cuando corresponda.

### Interacción

- Hub, Presentación y Propuesta son editoriales.
- Los CTAs navegan; no abren selectores innecesarios.
- Ningún contenido depende de hover.
- La interacción funcional se concentra en Demo.
- Foco visible, teclado completo y objetivos táctiles mínimos de 44 × 44 px.

### Tratamiento visual

| Superficie       | Tratamiento                                                        |
| ---------------- | ------------------------------------------------------------------ |
| Experience Hub   | Azul-violeta profundo, alto contraste y composición ejecutiva.     |
| Presentación     | Fondo crema editorial, tarjetas blancas y amplio espacio negativo. |
| Entrada de Demo  | Interfaz operativa clara; inicia directamente como Coordinador.    |
| Interfaz de Demo | Clara, operativa y compatible con Ant Design.                      |
| Propuesta        | Fondo crema editorial, tarjetas blancas, consultiva y sobria.      |

### Principios de producto y entrega

La Presentación y la Propuesta incorporan literalmente estos principios:

1. OEE está diseñado para operar donde sucede el trabajo, no sólo desde un escritorio.
2. Parte de infraestructura cotidiana, como un celular con conexión, sin requerir equipamiento
   especializado para el escenario base.
3. Debe ser simple para quien opera y robusto en contexto, estados, protocolos, evidencia,
   autoridad y trazabilidad.
4. Se orienta a alcanzar un resultado operativo definido y verificable conforme a criterios de
   aceptación acordados, no sólo a habilitar funciones.
5. La solución se adapta a la operación dentro de un alcance diseñado y aprobado; esto no significa
   personalización ilimitada.
6. No se presenta como SaaS autoadministrable de activación inmediata ni como desarrollo
   indefinido.

La narrativa no afirma que Zellship garantice por sí solo resultados de negocio.

## 3. `/oee/` — Experience Hub

### Propósito

Presentar el universo OEE y permitir elegir entre visión, evidencia y forma de comenzar.

### Idea central

Un punto de entrada neutral a Operation Execution Engine.

### Encabezado propuesto

> Diseñamos la operación para llevarla a un resultado.

### Contenido

- Eyebrow: `ZELLSHIP · OEE EXPERIENCE HUB`.
- Definición: `Operation Execution Engine convierte una intención operativa en una ejecución guiada y contextual, hasta un resultado operativo definido y verificable conforme a criterios de aceptación acordados.`
- Lema: `Designed to Evolve.`
- Firma: `Enabled by Zellship Business OS.`
- Tres accesos principales:

| Acceso       | Descripción                     | Destino              |
| ------------ | ------------------------------- | -------------------- |
| Presentación | Entender la visión y el modelo. | `/oee/presentacion/` |
| Demo         | Ver la operación en acción.     | `/oee/demo/`         |
| Propuesta    | Conocer cómo comenzar.          | `/oee/propuesta/`    |

### Recurso visual

Composición tipográfica sobre azul-violeta profundo. Los tres accesos son las únicas piezas de gran
peso. No usar fotografías, dashboard ni mosaico de productos.

### Interacción

Cada acceso funciona como enlace completo y muestra destino, descripción y estado de foco. No hay
carruseles, filtros ni contenido oculto.

### CTA

Las tres rutas tienen la misma jerarquía; el orden visual recomendado es Presentación, Demo,
Propuesta.

### Afirmaciones permitidas

- OEE es Operation Execution Engine.
- Forma parte de Zellship Business OS.
- La demo utiliza datos simulados.

### Relación con la demo

Es el punto de entrada y retorno. No comparte estado con la demo.

### Criterio de aceptación

- Los tres accesos aparecen en el primer viewport de escritorio.
- El objetivo de cada ruta se entiende sin explicación oral.
- No hay identidad ni contenido de clientes.
- La portada no compromete una URL pública absoluta.

## 4. `/oee/presentacion/` — Narrativa ejecutiva

### Propósito de la ruta

Llevar a la audiencia desde la realidad operativa hasta una comprensión clara de OEE, su lugar en
Business OS, su valor esperado y su aplicabilidad.

### Navegación

- Progreso editorial `1 de 8` a `8 de 8`.
- Acciones simples **Anterior** y **Siguiente**.
- Enlaces persistentes **Volver al hub**, **Ver demo** y **Ver propuesta**.
- El contenido permanece legible como página continua si JavaScript o animación no están disponibles.

### P1 — Realidad operativa

| Elemento          | Definición                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Propósito         | Reconocer que la operación real cambia, enfrenta excepciones y depende de decisiones.                       |
| Idea central      | Los procedimientos existen, pero la realidad obliga a interpretarlos en contexto.                           |
| Encabezado        | **La operación real nunca ocurre exactamente como fue planeada.**                                           |
| Contenido         | Cambios de prioridad, condiciones locales, recursos disponibles y excepciones modifican cómo debe actuarse. |
| Recurso visual    | Una línea operativa estable que cambia de forma al aparecer contexto y excepción.                           |
| Interacción       | Sólo navegación anterior/siguiente; sin revelados complejos.                                                |
| CTA               | **Ver dónde se fragmenta.**                                                                                 |
| Afirmaciones      | Patrón operativo general; no diagnóstico de un cliente.                                                     |
| Relación con demo | Anticipa la desviación controlada.                                                                          |
| Aceptación        | Se comprende en menos de 30 segundos y no usa cifras.                                                       |

### P2 — Fragmentación entre intención y resultado

| Elemento          | Definición                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Propósito         | Mostrar qué se pierde entre sistemas, personas y momentos.                                                                     |
| Idea central      | Intención, contexto, ejecución, evidencia y decisión suelen quedar separados.                                                  |
| Encabezado        | **El riesgo aparece en los espacios entre la intención y el resultado.**                                                       |
| Contenido         | La tarea se asigna sin contexto; la evidencia llega aislada; la excepción queda en mensajes; el cierre pierde su razonamiento. |
| Recurso visual    | Cinco conceptos conectados por una línea con tres interrupciones visibles.                                                     |
| Interacción       | Navegación editorial.                                                                                                          |
| CTA               | **Entender el diagnóstico.**                                                                                                   |
| Afirmaciones      | No cuantificar impacto ni atribuirlo a una organización específica.                                                            |
| Relación con demo | El mismo registro conservará esas cinco relaciones.                                                                            |
| Aceptación        | Cada pérdida se expresa en una frase breve.                                                                                    |

### P3 — Diagnóstico

| Elemento          | Definición                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Propósito         | Diferenciar tareas de ejecución gobernada.                                                                        |
| Idea central      | La experiencia debe ser simple para quien opera sin perder robustez operativa.                                    |
| Encabezado        | **Gestionar tareas no equivale a gobernar ejecución.**                                                            |
| Contenido         | Debe ser simple para quien opera y robusto en contexto, estados, protocolos, evidencia, autoridad y trazabilidad. |
| Recurso visual    | Comparación editorial de dos columnas.                                                                            |
| Interacción       | En móvil, pares apilados; no depende de hover.                                                                    |
| CTA               | **Conocer la arquitectura base.**                                                                                 |
| Afirmaciones      | Comparación conceptual, sin atacar productos o categorías.                                                        |
| Relación con demo | Define protocolo, contexto, estado, evidencia y decisión.                                                         |
| Aceptación        | La diferencia puede explicarse en una frase después de leerla.                                                    |

### P4 — Arquitectura Business OS

| Elemento          | Definición                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| Propósito         | Situar OEE dentro de una arquitectura mayor sin presentar integración productiva.                                   |
| Idea central      | La ejecución cobra sentido al relacionarse con estrategia, contexto, entidades y experiencia.                       |
| Encabezado        | **Una foundation para conectar intención, contexto y operación.**                                                   |
| Contenido         | Strategic, Context, Entity, Engine, Intelligence, Automation, Experience y Workspace. OEE destaca dentro de Engine. |
| Recurso visual    | Ocho capas concisas en una composición vertical; OEE resaltado, no un diagrama técnico de infraestructura.          |
| Interacción       | La capa enfocada muestra una frase; toda la información sigue visible en texto.                                     |
| CTA               | **Entrar a Operation Execution Engine.**                                                                            |
| Afirmaciones      | La relación es arquitectónica.                                                                                      |
| Relación con demo | La demo representa Experience y Workspace sobre datos preconfigurados.                                              |
| Aceptación        | Disclosure visible: `Arquitectura objetivo; la demo no representa integraciones productivas.`                       |

### P5 — Operation Execution Engine

| Elemento          | Definición                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Propósito         | Explicar la responsabilidad propia de OEE.                                                                                                       |
| Idea central      | OEE conduce una intención operativa hacia un resultado definido y verificable.                                                                   |
| Encabezado        | **De la activación al cierre, sin perder el contexto.**                                                                                          |
| Contenido         | Se orienta a alcanzar un resultado operativo definido y verificable conforme a criterios de aceptación acordados, no sólo a habilitar funciones. |
| Recurso visual    | Secuencia tipográfica de verbos y un registro que avanza con ella.                                                                               |
| Interacción       | Navegación editorial; sin simulación funcional en esta ruta.                                                                                     |
| CTA               | **Ver sus capacidades.**                                                                                                                         |
| Afirmaciones      | Responsabilidad conceptual ilustrada por la demo.                                                                                                |
| Relación con demo | Los verbos anticipan los seis momentos.                                                                                                          |
| Aceptación        | OEE sólo significa Operation Execution Engine.                                                                                                   |

### P6 — Capacidades y beneficios esperados

| Elemento          | Definición                                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Propósito         | Traducir el ciclo a valor operativo sin métricas inventadas.                                                                                                                                                          |
| Idea central      | Conservar contexto, evidencia y autoridad crea una base más consistente para operar y evolucionar.                                                                                                                    |
| Encabezado        | **Una ejecución más consistente. Una operación mejor preparada para evolucionar.**                                                                                                                                    |
| Contenido         | OEE está diseñado para operar donde sucede el trabajo, no sólo desde un escritorio. Parte de infraestructura cotidiana, como un celular con conexión, sin requerir equipamiento especializado para el escenario base. |
| Recurso visual    | Cinco bloques editoriales, sin KPIs ni dashboard.                                                                                                                                                                     |
| Interacción       | Lectura continua; enlaces a Demo y Propuesta.                                                                                                                                                                         |
| CTA               | **Explorar dónde puede aplicar.**                                                                                                                                                                                     |
| Afirmaciones      | Beneficios cualitativos sujetos a baseline y medición; Zellship no garantiza por sí solo resultados de negocio.                                                                                                       |
| Relación con demo | La demo hace observable una parte de estas capacidades.                                                                                                                                                               |
| Aceptación        | No hay porcentajes, ROI o tiempos ahorrados.                                                                                                                                                                          |

### P7 — Aplicabilidad transversal

| Elemento          | Definición                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Propósito         | Mostrar amplitud sin prometer una solución lista para cualquier industria.                                                  |
| Idea central      | La solución se adapta a la operación dentro de un alcance diseñado y aprobado; esto no significa personalización ilimitada. |
| Encabezado        | **Un patrón operativo que puede adaptarse a distintos contextos.**                                                          |
| Contenido         | Ubicaciones distribuidas, servicio en campo, inspección y calidad, mantenimiento, recepción y entrega, apertura y relevo.   |
| Recurso visual    | Lista editorial de arquetipos con resultado, evidencia típica y autoridad de cierre.                                        |
| Interacción       | Sin filtros; todos los arquetipos son visibles.                                                                             |
| CTA               | **Ver el caso general.**                                                                                                    |
| Afirmaciones      | `Puede adaptarse dentro del alcance aprobado`; nunca `personalización ilimitada`.                                           |
| Relación con demo | La ubicación operativa es un caso deliberadamente neutral.                                                                  |
| Aceptación        | No carga ni referencia ATM, Wire, Retail o Industrial.                                                                      |

### P8 — Futuro posible

| Elemento          | Definición                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Propósito         | Abrir la visión sin mezclarla con capacidades actuales.                                                                        |
| Idea central      | Con datos, reglas e integraciones adecuadas, la arquitectura puede incorporar inteligencia y automatización.                   |
| Encabezado        | **Una base para aprender, automatizar y evolucionar con control.**                                                             |
| Contenido         | Activaciones por eventos, contexto enriquecido, recomendaciones, integraciones y medición como posibilidades sujetas a diseño. |
| Recurso visual    | Horizonte simple más allá del ciclo actual; cada posibilidad etiquetada internamente según Truth Mode.                         |
| Interacción       | Dos accesos visibles: Demo y Propuesta.                                                                                        |
| CTA               | **Ver la operación en acción** / **Conocer cómo comenzar**.                                                                    |
| Afirmaciones      | Conceptual. No se presenta como SaaS autoadministrable de activación inmediata ni como desarrollo indefinido.                  |
| Relación con demo | Separa con claridad lo observable de lo futuro.                                                                                |
| Aceptación        | Ninguna posibilidad se expresa en presente productivo.                                                                         |

## 5. `/oee/demo/` — Demo general

### Propósito de la ruta

Convertir la narrativa en evidencia observable mediante un caso neutral, breve y controlado.

### Idea central

El mismo registro atraviesa tres responsabilidades, una desviación, una corrección y un cierre sin
perder contexto ni revisiones.

### Entrada directa

| Elemento       | Definición                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------- |
| Propósito      | Iniciar el recorrido sin autenticación ni pasos previos innecesarios.                         |
| Encabezado     | **Inspección y habilitación de una ubicación operativa.**                                     |
| Contenido      | Caso, duración de 5–8 minutos, seis momentos y disclosure general de datos simulados.         |
| Recurso visual | Interfaz operativa clara con contexto, espacio de trabajo y continuidad del mismo registro.   |
| Interacción    | Inicia directamente como Coordinador; mantiene **Volver al hub** y reinicio exclusivo de OEE. |
| CTA            | La primera acción es **Activar y asignar**.                                                   |
| Aceptación     | Sin PIN, selector de perfiles, fotografías decorativas ni dashboard.                          |

### Registro continuo

| Campo       | Valor simulado                                            |
| ----------- | --------------------------------------------------------- |
| Caso        | `OP-READY-001`                                            |
| Ubicación   | Ubicación Operativa 01                                    |
| Protocolo   | Inspección y habilitación operativa v1.0                  |
| Coordinador | Alex Romero                                               |
| Responsable | Daniela Cruz                                              |
| Supervisor  | Samuel Vega                                               |
| Desviación  | Material temporal ocupa parcialmente la zona de recepción |
| Resultado   | Habilitada conforme al protocolo demostrativo             |

### Progreso y controles

- `Paso n de 6`.
- Estado actual.
- Caso y ubicación.
- Disclosure persistente `Datos y tiempos simulados`.
- **Volver al hub**.
- **Reiniciar recorrido**.

### Máquina de estados

```text
Programada
→ Asignada
→ Preparada
→ En ejecución
→ Pendiente de validación
→ Corrección requerida
→ En corrección
→ Pendiente de validación
→ Cerrada
```

La activación se registra como evento. Las revisiones 1 y 2 se muestran como versiones asociadas a
la evidencia y decisión, no como estados.

### Escena 1 — Activación

| Elemento   | Definición                                                                              |
| ---------- | --------------------------------------------------------------------------------------- |
| Actor      | Coordinador operativo, Alex Romero.                                                     |
| Contexto   | El caso está programado para la ventana 09:00–10:00.                                    |
| Acción     | Revisar ubicación, protocolo, ventana y responsable; seleccionar **Activar y asignar**. |
| Evidencia  | Evento de activación con actor y hora simulada; protocolo y responsable vinculados.     |
| Cambio     | `Programada → Asignada`; activación queda como evento.                                  |
| Decisión   | ¿Hay contexto suficiente para asignar la ejecución?                                     |
| Transición | **Continuar como responsable de ejecución**.                                            |
| Aceptación | La acción no se repite; trazabilidad conserva el evento y no simula un trigger externo. |

### Escena 2 — Contexto y preparación

| Elemento   | Definición                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Actor      | Responsable de ejecución, Daniela Cruz.                                                                                   |
| Contexto   | Recibe objetivo, ubicación, ventana, instrucciones y criterio de cierre.                                                  |
| Acción     | Confirmar identidad de ubicación, condiciones, recurso demostrativo y comprensión; seleccionar **Confirmar preparación**. |
| Evidencia  | Acuse, requisitos completos y marca temporal simulada.                                                                    |
| Cambio     | `Asignada → Preparada`.                                                                                                   |
| Decisión   | ¿Existen condiciones para iniciar?                                                                                        |
| Transición | **Iniciar inspección**.                                                                                                   |
| Aceptación | No inicia con requisitos incompletos; no se presenta consulta real de recursos o skills.                                  |

### Escena 3 — Ejecución guiada

| Elemento   | Definición                                                                    |
| ---------- | ----------------------------------------------------------------------------- |
| Actor      | Responsable de ejecución, Daniela Cruz.                                       |
| Contexto   | El protocolo verifica acceso, zona de recepción, señalización y comunicación. |
| Acción     | Iniciar, responder los pasos y registrar `No cumple` en la zona de recepción. |
| Evidencia  | Progreso, respuestas, criterio esperado y tiempo de inicio simulado.          |
| Cambio     | `Preparada → En ejecución`.                                                   |
| Decisión   | ¿La condición cumple o debe registrarse como hallazgo?                        |
| Transición | Abrir **Registrar hallazgo** dentro del protocolo.                            |
| Aceptación | El progreso se conserva; sólo existe una desviación; no se atribuye a IA.     |

### Escena 4 — Hallazgo y evidencia

| Elemento   | Definición                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Actor      | Responsable de ejecución, Daniela Cruz.                                                                |
| Contexto   | Material temporal ocupa parcialmente la zona designada.                                                |
| Acción     | Clasificar, comentar, asociar evidencia simulada y seleccionar **Enviar a validación**.                |
| Evidencia  | Imagen etiquetada `Evidencia simulada`, comentario, actor, tiempo, caso, paso y metadato `Revisión 1`. |
| Cambio     | `En ejecución → Pendiente de validación`.                                                              |
| Decisión   | ¿El paquete documenta la condición con claridad suficiente para decidir?                               |
| Transición | **Continuar como supervisor**.                                                                         |
| Aceptación | No usa cámara real; la evidencia permanece ligada al mismo caso y paso.                                |

### Escena 5 — Validación y corrección

La escena contiene cuatro subpasos, pero muestra una sola acción primaria en cada momento.

| Subpaso            | Actor        | Acción primaria                | Evidencia                                       | Cambio                                           |
| ------------------ | ------------ | ------------------------------ | ----------------------------------------------- | ------------------------------------------------ |
| Revisar            | Samuel Vega  | **Solicitar corrección**       | Razón e instrucción obligatorias                | `Pendiente de validación → Corrección requerida` |
| Recibir devolución | Daniela Cruz | **Iniciar corrección**         | Acuse y revisión anterior visible               | `Corrección requerida → En corrección`           |
| Corregir           | Daniela Cruz | **Reenviar corrección**        | Segunda imagen simulada y metadato `Revisión 2` | `En corrección → Pendiente de validación`        |
| Comparar           | Samuel Vega  | **Continuar a decisión final** | Revisiones 1 y 2 lado a lado                    | Sin cambio de estado                             |

#### Decisiones

1. ¿La evidencia inicial cumple el criterio? — No.
2. ¿La corrección responde a la instrucción? — Sí, puede pasar a decisión final.

#### Criterio de aceptación

- Solicitar corrección exige razón.
- Revisión 1 permanece intacta.
- Revisión 2 pertenece al mismo caso.
- Sólo una acción primaria está activa por subpaso.
- Las dos imágenes están etiquetadas como simuladas.

### Escena 6 — Resultado y cierre

| Elemento   | Definición                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Actor      | Supervisor o validador, Samuel Vega.                                                                                   |
| Contexto   | El caso está `Pendiente de validación` con Revisión 2 disponible.                                                      |
| Acción     | Comparar revisiones y seleccionar **Aprobar y cerrar**.                                                                |
| Evidencia  | Resultado, protocolo, ubicación, actores, evidencia inicial/corregida, devolución, versión aprobada y tiempo simulado. |
| Cambio     | `Pendiente de validación → Cerrada`.                                                                                   |
| Decisión   | ¿La corrección demuestra el criterio del protocolo simulado?                                                           |
| Transición | **Volver al hub**; Reiniciar queda como acción secundaria.                                                             |
| Aceptación | Nota visible: `El resultado no constituye certificación legal, regulatoria o de seguridad.`                            |

### Recuperación

| Condición                      | Respuesta                                       |
| ------------------------------ | ----------------------------------------------- |
| Sin estado                     | Cargar el seed inicial.                         |
| Estado incompatible            | Ofrecer reinicio del escenario general.         |
| Recarga                        | Restaurar escena y estado actuales.             |
| Acción repetida                | Deshabilitarla y conservar el evento original.  |
| Acceso directo a escena futura | Regresar al último estado válido.               |
| Volver al hub                  | Conservar estado hasta que el usuario reinicie. |

### Afirmaciones permitidas

- La interfaz demuestra el comportamiento del recorrido sobre estado local.
- Evidencia, personas, tiempos y transiciones son simulados.
- No se presenta cámara, mensajería, autenticación o integración como capacidad real.

### Relación con el hub

Hace observable el ciclo explicado en Presentación y aporta un punto de referencia para entender por
qué una operación real requiere la metodología de Propuesta.

### Criterio de aceptación de la ruta

- El recorrido completo dura entre cinco y ocho minutos.
- Cada escena tiene una sola decisión principal visible.
- Estado, actor, evidencia y transición permanecen ligados a `OP-READY-001`.
- Reiniciar no afecta otros escenarios.

## 6. `/oee/propuesta/` — Cómo comenzar

### Propósito de la ruta

Explicar que Zellship comienza por entender y alinear la operación, define la solución adecuada y
sólo después compromete una implementación.

### Idea central

La solución adecuada se define a partir del entendimiento de la operación, no a partir de un paquete
o precio predeterminado.

### Encabezado propuesto

> Primero entendemos la operación. Después definimos la solución adecuada para llevarla a operación.

### Estructura editorial

#### PR1 — Alinear la operación

| Elemento   | Contenido                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| Objetivo   | Comprender problema, actores, estados, evidencia, excepciones y prioridades; acordar resultado y alcance. |
| Entregable | **Anteproyecto Operativo**.                                                                               |
| Valor      | Alinea operación, negocio y tecnología antes de invertir en implementación.                               |
| Decisión   | Qué caso merece diseñarse, con qué alcance y bajo qué criterios.                                          |

#### PR2 — Diseñar la solución

| Elemento   | Contenido                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Objetivo   | Definir protocolos, flujos, estados, excepciones, evidencias, formatos, reportes, roles, restricciones e integraciones. |
| Entregable | **Proyecto Ejecutivo de Solución**.                                                                                     |
| Valor      | Reduce ambigüedad y riesgo de construcción.                                                                             |
| Decisión   | Autorizar solución, alcance y plan de implementación.                                                                   |

#### PR3 — Construir y validar

| Elemento   | Contenido                                                                          |
| ---------- | ---------------------------------------------------------------------------------- |
| Objetivo   | Configurar, desarrollar, integrar y comprobar progresivamente el alcance aprobado. |
| Entregable | **Capacidades funcionando y validadas progresivamente**.                           |
| Valor      | Reduce riesgo mediante validaciones incrementales contra criterios acordados.      |
| Decisión   | Confirmar que las capacidades están listas para activación.                        |

#### PR4 — Activar y acompañar

| Elemento   | Contenido                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- |
| Objetivo   | Preparar usuarios, activar el piloto y acompañar la adopción dentro del alcance aprobado. |
| Entregable | **Solución implementada, usuarios preparados, piloto y acompañamiento**.                  |
| Valor      | Lleva la solución validada a la operación con preparación y seguimiento.                  |
| Decisión   | Confirmar activación y condiciones de acompañamiento.                                     |

### Relación posterior — Evolución continua

Evolución continua ocurre después de activar y acompañar: permite medir, aprender y priorizar nuevas
capacidades sobre evidencia real. No sustituye la etapa de activación.

### Rutas de adopción

| Ruta     | Cuándo aplica                                                                               | Naturaleza del trabajo                              | Límite de la afirmación                                                        |
| -------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Estándar | Procesos conocidos, pocas excepciones e integraciones acotadas.                             | Predomina configuración con validación del alcance. | No equivale a un SaaS autoadministrable de activación inmediata.               |
| Diseñada | Operación variable, excepciones múltiples, integraciones materiales o adaptación relevante. | Requiere diseño y posible desarrollo.               | Se adapta dentro de un alcance aprobado; no implica personalización ilimitada. |

### Prerrequisitos para valorar

La ruta presenta seis bloques editoriales, no un checklist persistente:

1. **Resultado y alcance** — problema, resultado, población y ubicaciones.
2. **Operación actual** — proceso, volumen, frecuencia, actores y estandarización.
3. **Control** — estados, excepciones, evidencia, autoridades y cierre.
4. **Ecosistema** — sistemas, datos, integraciones y propietarios.
5. **Restricciones** — conectividad, dispositivos, seguridad, privacidad y cumplimiento.
6. **Éxito** — baseline, indicadores, piloto y criterios de aceptación.

Nota visible: `Esta información permite valorar complejidad y ruta; no genera una cotización automática.`

### Siguiente paso recomendado

#### Encabezado

> Alineemos el primer caso antes de definir la solución.

#### Acción

**Taller de entendimiento y alineación**.

#### Resultado esperado

- Problema y resultado prioritario.
- Actores, responsabilidades y decisiones.
- Flujo, estados y excepciones.
- Evidencia y contexto requeridos.
- Integraciones y restricciones iniciales.
- Alcance propuesto del Anteproyecto Operativo.

#### CTA

**Preparar valoración**.

El CTA navega al contenido local de prerrequisitos y siguiente paso. No envía información ni simula
una integración. No se muestran precio, calendario, condiciones de alianza o compromiso de
implementación.

### Afirmaciones permitidas

- Cada etapa produce un entregable y una decisión propios.
- La ruta estándar o diseñada se determina después del entendimiento inicial.
- El taller prepara la valoración; no compromete una implementación.

### Recurso visual

Tratamiento claro o crema, secuencia editorial de cuatro etapas, comparación sobria de dos rutas y
un cierre de una sola acción. La analogía arquitectónica explica progresión; no utiliza edificios o
planos como identidad literal.

### Interacción

Navegación por anclas y CTAs. No hay checklist persistente, diagnóstico automático, filtros,
calculadora, precios ni selectores editoriales.

### Relación con la demo

La propuesta explica cómo pasar de un caso simulado a la comprensión de un caso real sin asumir que
ambos requieren la misma ruta.

### Criterio de aceptación

- Las cuatro etapas muestran objetivo, entregable, valor y decisión.
- La secuencia termina en Activar y acompañar; Evolución continua se presenta después como relación
  posterior.
- Las dos rutas se comparan por complejidad, no por precio.
- Los seis bloques de prerrequisitos son visibles.
- Existe una sola acción comercial principal.
- El texto usa “definimos la solución adecuada para llevarla a operación”.

## 7. Disclosures públicos

La experiencia usa sólo estos cuatro controles:

1. **General de demo:** persistente en `/oee/demo/`.
2. **Evidencia simulada:** junto a cada imagen.
3. **Arquitectónico:** dentro de P4 Business OS Foundation.
4. **No certificación:** junto al resultado final.

No se repiten advertencias técnicas en cada pantalla. El resto del control vive en el brief y en la
revisión interna.

## 8. Aceptación integral

### Arquitectura

- Las cuatro rutas lógicas existen y son relativas al hosting.
- El hub ofrece Presentación, Demo y Propuesta.
- Todas las rutas mantienen retorno al hub.
- No se compromete una URL pública absoluta.

### Presentación

- Contiene ocho bloques en el orden aprobado.
- Muestra las ocho capas y destaca OEE dentro de Engine.
- No presenta las capas como integración productiva.
- Futuro posible está separado de capacidades observables.

### Demo

- Conserva seis momentos y tres perfiles.
- Activación es evento; revisiones son metadatos.
- La máquina de estados coincide con el brief.
- La escena 5 muestra una sola acción primaria por subpaso.
- Completa una desviación, corrección y cierre en cinco a ocho minutos.
- Reiniciar no afecta otras variantes.

### Propuesta

- Las etapas Alinear la operación, Diseñar la solución, Construir y validar, y Activar y acompañar,
  con sus entregables, están completas.
- Evolución continua aparece como relación posterior a la activación.
- Dos rutas, prerrequisitos y siguiente paso están completos.
- No contiene precios, calendario, condiciones de alianza o SaaS productivo.

### Visual y experiencia

- Hub azul-violeta profundo; Presentación y Propuesta crema con tarjetas blancas; Demo operativa clara.
- Marca Zellship local disponible durante desarrollo; el logo oficial de Business OS requiere un activo autorizado.
- Manrope local o fallback del sistema; sin fuentes externas.
- Sin fotografías genéricas, dashboards decorativos o diagramas densos.
- Sin filtros, checklist persistente, hover obligatorio, impresión, bilingüe o animación compleja.
- Funciona por teclado y en 1920 × 1080, 1366 × 768 y 390 × 844.

## 9. Decisiones pendientes después de implementar

1. Activo oficial de Business OS para sustituir o ratificar la marca Zellship local antes de la
   entrega visual final.
2. Clasificación de distribución antes de publicar.
