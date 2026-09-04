# OEE Experience Hub — Canonical Brief v1

## Control del documento

| Campo                    | Valor                                      |
| ------------------------ | ------------------------------------------ |
| Documento                | `OEE-HUB-CANONICAL-BRIEF-v1`               |
| Versión                  | `1.2.1`                                    |
| Estado                   | Aprobado para implementación               |
| Fecha                    | 2026-09-04                                 |
| Repositorio              | `zellship/zellship-maintenance-os-demo`    |
| Baseline                 | `785329abbd96673110a152be9cbc2e854ba103e8` |
| Rama                     | `feat/oee-hub-v1`                          |
| Documento complementario | `docs/oee-hub-storyboard-v1.md`            |

## 1. Autoridad del documento

Este brief gobierna el objetivo, la arquitectura de información, el posicionamiento, los límites de
verdad, el alcance y los criterios de terminado del OEE Experience Hub. El storyboard complementario
gobierna el orden, contenido, interacción y aceptación de cada superficie.

El hub tomará como referencia la estructura base y el nivel de acabado ejecutivo del hub de Harris &
Frank, sin copiar su contenido, industrias, casos, cifras, nombres, imágenes, métricas, propuestas o
condiciones.

## 2. Objetivo y decisión buscada

### Objetivo neutral del hub

Ayudar a una organización a entender qué es el **Operation Execution Engine (OEE)**, observar un
caso neutral y decidir si una oportunidad merece pasar a valoración.

### Objetivo de la primera sesión con el partner

Validar el encaje del planteamiento, identificar una primera oportunidad y acordar el siguiente
ejercicio de entendimiento y alineación. Esta intención es interna: el hub no incluirá términos de
alianza ni contenido exclusivo de un partner comercial.

### Decisión de salida

La audiencia debe poder decidir si existe suficiente relevancia para realizar un **Taller de
entendimiento y alineación**, cuyo resultado sea el alcance de un **Anteproyecto Operativo**.

## 3. Problema que debe resolver la narrativa

Las organizaciones suelen contar con tareas, procedimientos y sistemas, pero pierden continuidad
entre lo que se espera, el contexto en que debe ocurrir, la evidencia generada y la decisión final.
El hub debe mostrar que gobernar ejecución significa conservar esas relaciones durante todo el ciclo,
incluidas las excepciones y correcciones.

La demo actual contiene piezas útiles, pero distribuidas entre escenarios industriales, ATM, Wire y
Retail. El nuevo hub necesita una historia general que no dependa de ninguno de ellos.

## 4. Posicionamiento canónico

### Definición

> Operation Execution Engine convierte una intención operativa en una ejecución guiada y
> contextual, hasta un resultado operativo definido y verificable conforme a criterios de
> aceptación acordados.

### Lema y firma

- **Designed to Evolve.**
- **Enabled by Zellship Business OS.**

### Decisiones terminológicas congeladas

1. OEE significa exclusivamente **Operation Execution Engine**.
2. No se introducirá un “Execution Engine” adicional.
3. La métrica industrial se escribirá **Overall Equipment Effectiveness** en forma completa cuando
   sea necesario mencionarla.
4. OEE forma parte de Zellship Business OS.
5. La relación con Entity Engine, compromisos, contexto, inteligencia y automatización es
   arquitectónica; no se afirmará que ya opera como integración productiva.
6. “Habilitada” significa que la ubicación cumplió el protocolo simulado de la demo; no equivale a
   certificación legal, regulatoria o de seguridad.

### Decisiones de implementación congeladas

1. La experiencia utiliza Manrope cuando esté disponible localmente y, en su ausencia, recurre a la
   tipografía del sistema; no carga fuentes externas.
2. Presentación y Propuesta usan fondo crema editorial y tarjetas blancas.
3. La demo inicia directamente como Coordinador operativo, sin PIN ni selector de perfiles.
4. Los cambios de actor son transiciones controladas del recorrido.
5. El CTA comercial es **Preparar valoración** y sólo navega a contenido local de prerrequisitos y
   siguiente paso; no envía información ni simula una integración.
6. Las evidencias inicial y corregida son recursos locales, neutrales y ficticios, siempre rotulados
   **Evidencia simulada**.
7. **Compromisos** se conserva como el término funcional canónico.
8. El resumen final incluye resultado, caso, ubicación, protocolo, actores, Revisión 1, razón de
   devolución, corrección, Revisión 2 y cierre, sin convertirse en un log técnico exhaustivo.

### Principios de producto y entrega

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

Estos principios no significan que Zellship garantice por sí solo resultados de negocio. El
resultado, sus criterios de aceptación y el alcance de adaptación deben acordarse para cada
iniciativa.

## 5. Arquitectura de rutas

Las rutas son lógicas y relativas al hosting. Este brief no compromete una URL pública absoluta.

| Ruta                 | Función        | Contenido principal                                                                   | Tipo de experiencia        |
| -------------------- | -------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| `/oee/`              | Experience Hub | Portada general y accesos a las tres experiencias.                                    | Editorial y navegacional   |
| `/oee/presentacion/` | Presentación   | Problema, diagnóstico, Business OS, OEE, capacidades, aplicabilidad y futuro posible. | Narrativa ejecutiva        |
| `/oee/demo/`         | Demo           | Caso neutral de seis momentos.                                                        | Interactiva y determinista |
| `/oee/propuesta/`    | Propuesta      | Metodología, rutas de adopción, prerrequisitos y siguiente paso.                      | Editorial y consultiva     |

### Portada del Experience Hub

Debe ofrecer tres accesos principales:

- **Presentación** — Entender la visión y el modelo.
- **Demo** — Ver la operación en acción.
- **Propuesta** — Conocer cómo comenzar.

La portada utiliza identidad Zellship/OS neutral. No contiene identidad de ningún cliente o partner.

## 6. Business OS Foundation

La presentación mostrará una representación concisa de estas capas:

1. **Strategic** — intención, prioridades y resultados de negocio.
2. **Context** — condiciones que determinan qué aplica y qué importa.
3. **Entity** — personas, ubicaciones, activos, recursos y relaciones.
4. **Engine** — capacidades que gobiernan comportamiento; OEE se destaca aquí.
5. **Intelligence** — señales y recomendaciones que pueden apoyar decisiones.
6. **Automation** — reglas y eventos que pueden activar acciones.
7. **Experience** — forma en que cada actor interactúa con la capacidad.
8. **Workspace** — superficie contextual donde se realiza el trabajo.

Las capas explican una arquitectura objetivo. La demo utiliza datos preconfigurados y estado local;
no prueba que las capas estén integradas productivamente.

## 7. Alcance incluido

### Experience Hub

- Portada general.
- Tres accesos principales.
- Retorno permanente al hub desde las demás rutas.

### Presentación

1. Realidad operativa.
2. Fragmentación entre intención y resultado.
3. Diagnóstico: gestionar tareas no equivale a gobernar ejecución.
4. Arquitectura Business OS.
5. Operation Execution Engine.
6. Capacidades y beneficios esperados.
7. Aplicabilidad transversal.
8. Futuro posible y acceso a demo o propuesta.

### Demo

Un caso preconfigurado de seis momentos, tres perfiles, una desviación, una corrección y un cierre.

### Propuesta

- Alinear la operación — Anteproyecto Operativo.
- Diseñar la solución — Proyecto Ejecutivo de Solución.
- Construir y validar — capacidades funcionando y validadas progresivamente.
- Activar y acompañar — solución implementada, usuarios preparados, piloto y acompañamiento.
- Evolución continua como relación posterior a la activación.
- Ruta estándar.
- Ruta diseñada.
- Prerrequisitos para valorar.
- Taller de entendimiento como siguiente paso.

## 8. Alcance excluido de v1

- Filtros interactivos de arquetipos.
- Checklists persistentes del hub o la propuesta.
- Revelados complejos por scroll.
- Interacciones que dependan de hover.
- Selectores editoriales sin una decisión funcional.
- Impresión.
- Preparación bilingüe.
- Animaciones complejas.
- Rediseño o ampliación de ATM, Wire, Retail o Industrial.
- Identidad, datos, activos o afirmaciones exclusivas de clientes.
- Backend, autenticación, IA, GPS, cámara, mensajería o integraciones reales.
- Precios, calendarios comprometidos, condiciones de alianza o comisiones.
- Presentar un SaaS productivo listo para contratar.

Hub, presentación y propuesta serán principalmente editoriales. La interacción funcional se
concentra en la demo.

## 9. Contrato de la demo general

### Caso

**Inspección y habilitación de una ubicación operativa.**

### Contexto

- Caso: `OP-READY-001`.
- Ubicación: **Ubicación Operativa 01**.
- Protocolo: **Inspección y habilitación operativa v1.0**.
- Perfiles: Coordinador operativo, Responsable de ejecución y Supervisor o validador.
- Desviación: material temporal ocupa parcialmente la zona designada de recepción.
- Corrección: se despeja el área y se registra una segunda evidencia simulada.
- Resultado: ubicación habilitada conforme al protocolo demostrativo.

### Seis momentos

1. Activación.
2. Contexto y preparación.
3. Ejecución guiada.
4. Hallazgo y evidencia.
5. Validación y corrección.
6. Resultado y cierre.

### Estados

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

- **Activación** es un evento, no un estado.
- **Revisión 1** y **Revisión 2** son metadatos de versión, no estados diferentes.
- La escena 5 puede contener varios subpasos, pero la interfaz presenta una sola acción primaria a la
  vez.

### Restricciones

- Un caso, una ubicación y un protocolo.
- Datos completamente simulados.
- Recorrido determinista de cinco a ocho minutos.
- Reinicio exclusivo del escenario general.
- Sin dependencias, estado o activos de otras variantes.
- Sin llamadas externas.

## 10. Metodología y rutas de adopción

La metodología aparece en `/oee/propuesta/`, después de la demo en el recorrido recomendado.

| Etapa                | Objetivo                                                                                                                | Entregable                                                          | Decisión que habilita                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Alinear la operación | Comprender problema, actores, estados, evidencia, excepciones y prioridades; acordar resultado y alcance.               | Anteproyecto Operativo                                              | Autorizar el diseño del caso y su alcance.                     |
| Diseñar la solución  | Definir protocolos, flujos, estados, excepciones, evidencias, formatos, reportes, roles, restricciones e integraciones. | Proyecto Ejecutivo de Solución                                      | Autorizar solución, criterios y plan de construcción.          |
| Construir y validar  | Configurar, desarrollar, integrar y comprobar progresivamente las capacidades del alcance aprobado.                     | Capacidades funcionando y validadas progresivamente                 | Confirmar que las capacidades cumplen los criterios acordados. |
| Activar y acompañar  | Preparar usuarios, activar el piloto y acompañar la adopción de la solución validada.                                   | Solución implementada, usuarios preparados, piloto y acompañamiento | Llevar la solución a la operación dentro del alcance aprobado. |

**Evolución continua** es una relación posterior a la activación. Permite medir, aprender y
priorizar nuevas capacidades sobre evidencia real; no sustituye la etapa de activar y acompañar.

La analogía con arquitectura explica la secuencia; no define literalmente la identidad de Zellship.

### Ruta estándar

Para procesos conocidos, pocas excepciones, configuración predominante e integraciones acotadas.

### Ruta diseñada

Para operaciones ambiguas o variables, múltiples excepciones, integraciones materiales o adaptación
relevante.

La ruta se decide después del entendimiento inicial; el hub no diagnostica ni cotiza automáticamente.

## 11. Prerrequisitos para valorar un proyecto

1. Problema y resultado operativo buscado.
2. Ubicaciones, volumen y frecuencia.
3. Actores, responsabilidades y autoridades.
4. Proceso actual y grado de estandarización.
5. Estados, excepciones y criterios de cierre.
6. Protocolos, formularios y evidencia disponibles.
7. Sistemas que originan trabajo o reciben resultados.
8. Integraciones, datos y propietarios.
9. Conectividad, dispositivos y operación offline.
10. Seguridad, privacidad y cumplimiento.
11. Baseline e indicadores medibles.
12. Alcance y criterios de éxito de un piloto.

Esta información permite analizar madurez, control operativo y complejidad. La ausencia de evidencia
no se sustituye con supuestos comerciales.

## 12. Truth Mode

### Clasificaciones internas

| Clasificación         | Uso                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Demostrada en la demo | El comportamiento completo puede observarse en la interfaz y el estado local.               |
| Simulada              | La interfaz representa un comportamiento sin utilizar el dispositivo, canal o sistema real. |
| Conceptual            | Explica una responsabilidad o relación arquitectónica no conectada productivamente.         |
| Requiere integración  | Depende de sistemas, datos, permisos o contratos externos.                                  |
| Posibilidad futura    | Dirección potencial fuera del alcance aprobado.                                             |

### Matriz de afirmaciones

| Afirmación                                             | Clasificación                       | Redacción permitida                                                          | Límite                                                   |
| ------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| OEE estructura el ciclo de una operación.              | Conceptual, ilustrada por la demo   | “OEE organiza la ejecución desde la activación hasta un resultado validado.” | No afirmar que el engine ya procesa operaciones reales.  |
| El protocolo guía y solicita evidencia.                | Demostrada en la demo               | “La demo aplica un protocolo preconfigurado.”                                | No afirmar que contiene procesos reales del cliente.     |
| Contexto, actor y estado acompañan al caso.            | Demostrada con datos simulados      | “La demo conserva estas relaciones sobre el mismo registro.”                 | No afirmar sincronización productiva.                    |
| El supervisor solicita corrección y aprueba.           | Demostrada en la demo               | “El recorrido conserva la decisión y las revisiones.”                        | No llamar a esto auditoría empresarial inmutable.        |
| Se registra evidencia, hora y usuario.                 | Simulada                            | “La demo muestra evidencia y marcas temporales simuladas.”                   | No atribuir captura, custodia o certificación real.      |
| OEE se relaciona con las capas Business OS.            | Conceptual                          | “La arquitectura sitúa OEE en la capa Engine.”                               | No afirmar que las capas ya están integradas.            |
| Inteligencia puede apoyar decisiones.                  | Posibilidad futura                  | “Puede incorporarse bajo diseño e integración.”                              | No atribuir el hallazgo mostrado a IA.                   |
| Sistemas externos pueden activar o recibir resultados. | Requiere integración                | “La solución puede diseñar los adaptadores acordados.”                       | No prometer integración inmediata o universal.           |
| El patrón puede aplicarse a otras operaciones.         | Conceptual                          | “Puede adaptarse a distintos contextos.”                                     | No afirmar configuración lista para cualquier industria. |
| La ubicación queda habilitada.                         | Demostrada sólo en el caso simulado | “Cumple el protocolo demostrativo.”                                          | No presentarlo como certificación.                       |

### Disclosures públicos permitidos

La experiencia pública utilizará únicamente:

1. Disclosure general persistente de demo.
2. Etiqueta junto a cada evidencia simulada.
3. Disclosure arquitectónico en Business OS Foundation.
4. Nota final de que el resultado no constituye certificación.

Los controles completos de Truth Mode permanecen en documentación interna; no deben saturar la
interfaz.

## 13. Sistema visual

- `/oee/`: azul-violeta profundo.
- `/oee/presentacion/` y `/oee/propuesta/`: fondo crema editorial y tarjetas blancas.
- `/oee/demo/`: entrada directa a la interfaz operativa clara como Coordinador.
- Usar el logo oficial de Business OS únicamente cuando exista un activo autorizado. Durante el
  desarrollo puede utilizarse la marca Zellship ya disponible o un placeholder explícito.
- Manrope con activos locales o fallback del sistema; nunca cargar tipografías externas.
- Morado Zellship como acento, no como relleno dominante en superficies operativas.
- Sin fotografías genéricas, dashboards decorativos o diagramas técnicos densos.
- Retorno permanente al hub.

## 14. Criterio de terminado de v1

El hub estará terminado cuando:

- existan las cuatro rutas lógicas y sus retornos;
- la portada ofrezca Presentación, Demo y Propuesta;
- la presentación siga el arco aprobado de ocho bloques;
- las ocho capas Business OS aparezcan de forma concisa y OEE destaque dentro de Engine;
- el disclosure arquitectónico sea visible;
- la demo neutral complete seis momentos en cinco a ocho minutos;
- activación sea un evento y las revisiones sean metadatos;
- la escena 5 muestre una sola acción primaria a la vez;
- la propuesta contenga metodología, rutas, prerrequisitos y taller;
- no existan precios, calendario comprometido, alianza o afirmaciones de SaaS productivo;
- no se incluyan datos o activos de clientes ni de otras variantes;
- los disclosures públicos se limiten a los cuatro definidos;
- las rutas sean utilizables por teclado y en 1920 × 1080, 1366 × 768 y 390 × 844;
- no haya llamadas externas ni errores de consola;
- el recorrido pueda reiniciarse sin afectar otras demos.

## 15. Riesgos y contradicciones actuales

| Hallazgo                                                                                  | Riesgo                           | Decisión para v1                                              |
| ----------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------- |
| El código usa “Operational Excellence Engine” y OEE para Overall Equipment Effectiveness. | Confusión de producto.           | Búsqueda y corrección terminológica antes de publicar.        |
| El perfil `full` puede activar superficies ajenas.                                        | Mezcla de experiencias.          | Perfil exclusivo para el escenario general.                   |
| Registro y activos públicos reúnen varias variantes.                                      | Contaminación del artefacto.     | Separación física y verificación del build.                   |
| La navegación actual depende de estado de componentes.                                    | Rutas no compartibles.           | Introducir las cuatro rutas lógicas aprobadas.                |
| El runtime sólo persiste en navegador.                                                    | Sobreafirmar capacidades.        | Mantener disclosures y no presentarlo como engine productivo. |
| El logo oficial de Business OS requiere un activo expresamente autorizado.                | Entrega visual final incompleta. | Usar durante desarrollo la marca Zellship local disponible.   |

## 16. Decisiones pendientes después de implementar

1. Confirmar el activo oficial de Business OS antes de considerar terminada la entrega visual; el
   desarrollo utiliza la marca Zellship local ya disponible.
2. Confirmar la clasificación de distribución antes de una publicación futura.

## 17. Gobierno de cambios

- Las decisiones congeladas requieren una nueva versión de este brief.
- Una adición de alcance debe retirar otra o modificar el criterio de terminado.
- Toda afirmación nueva requiere clasificación Truth Mode.
- El storyboard no puede ampliar funciones fuera de este brief.
- Ninguna identidad de cliente puede entrar al Experience Hub neutral.
