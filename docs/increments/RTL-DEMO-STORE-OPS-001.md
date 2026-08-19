# RTL-DEMO-STORE-OPS-001 — Contrato operativo de Tiendas y Soporte

## Estado

- Versión del contrato: `0.1.0`
- Estado: Implementado y autorizado para publicación neutral
- Preparado: `2026-08-19`
- Baseline de origen: `ca74d6b369ef58be0140cdbb92d61ed6f2d7e6cf`
- Escenario objetivo: `retail-store-operations`
- Perfil de capacidades candidato: `retail-store-support`
- Distribución vigente: `public-demo`
- Identidad pública recomendada: red ficticia de tiendas premium

## Resultado buscado

Definir una demostración de Zellship aplicada a la operación y soporte de una red de tiendas de
retail. El escenario debe demostrar dos direcciones de trabajo sobre una sola trazabilidad:

1. la gerencia de sucursales asigna protocolos operativos a una o varias tiendas;
2. el encargado de una tienda reporta una necesidad al centro de soporte desde la ejecución del
   protocolo que reveló el problema.

El escenario reutiliza el runtime compartido y no crea otra aplicación. La autorización posterior
del usuario permite publicar únicamente la variante neutral y ficticia bajo la ruta `/retail/`; no
autoriza el uso de información real del prospecto.

## Control del alcance

- **Problema:** la operación diaria, los activos y las solicitudes de soporte pueden quedar
  fragmentados entre mensajes, llamadas, listas y proveedores, perdiendo contexto y evidencia.
- **Usuarios principales:** gerencia de sucursales, encargado de tienda, centro interno de soporte,
  supervisor operativo y proveedor externo.
- **Decisión que habilita:** confirmar que Zellship puede coordinar rutinas de tienda y soporte
  interno/externo sin separar la ejecución, la incidencia y el cierre en sistemas inconexos.
- **Historia principal:** protocolo de apertura y presentación detecta una desviación de
  climatización; la tienda reporta el caso, ejecuta diagnóstico guiado, escala y confirma el cierre.
- **Historia secundaria:** protocolos de limpieza, presentación, toma de medidas, venta e intención
  de compra permanecen visibles como programa operativo, sin producir recorridos completos.
- **Duración objetivo del recorrido:** 8–10 minutos.

## Diagnóstico del caso

### Complejidad

La complejidad del escenario es **media-alta** porque combina:

- asignaciones descendentes de gerencia a tiendas;
- solicitudes ascendentes de tienda a soporte;
- protocolos rutinarios y de diagnóstico;
- activos, áreas y responsables;
- prioridades y SLA configurables;
- resolución interna y externa;
- criterios de cierre dependientes del protocolo y del tipo de soporte.

No se califica la madurez operativa real del prospecto. Faltan evidencia de procesos vigentes,
volumen, canales, tiempos y sistemas actuales; la clasificación corresponde únicamente al escenario
demostrativo.

### Decisión de producto

La demo no debe presentarse sólo como mantenimiento. Su nombre funcional es **Store Operations &
Support**, montado sobre las mismas capacidades de entidades, compromisos y ejecución utilizadas por
los escenarios de mantenimiento.

```text
Foundation Engines
├── Entity Engine
│   └── Tiendas, áreas, activos, colaboradores y proveedores
├── Commitment Engine
│   └── Programas, asignaciones, solicitudes, prioridad y SLA
└── Execution Engine
    └── Protocolos, formularios, evidencia, decisiones y cierre

Especialización
└── Retail Store Operations & Support
```

Las funciones de venta, intención y toma de medidas se representan como ejecución de protocolos y
captura operacional. Esta versión no sustituye POS, CRM, ERP, mesa de ayuda o gestión de proveedores.

## Objetivos

1. Mostrar un programa operativo distribuido por tienda, fecha, prioridad y responsable.
2. Probar que una incidencia puede originarse dentro de un protocolo sin perder el contexto de la
   ejecución que la detectó.
3. Guiar una resolución remota antes de crear una intervención especializada.
4. Enrutar atención interna o externa conservando SLA, evidencia, responsables y decisiones.
5. Cerrar con confirmación y validación configurables según protocolo, prioridad y tipo de soporte.

## No objetivos

- No implementar integraciones reales con POS, CRM, ERP, correo, WhatsApp o proveedores.
- No administrar contratos, costos, cotizaciones, facturas o pagos de proveedores.
- No realizar monitoreo IoT, diagnóstico automático o control real de climatización.
- No convertir toda incidencia en una orden de trabajo desde su creación.
- No reproducir procesos, nombres, tiendas, contactos, fotografías o datos confidenciales reales.
- No demostrar analítica histórica como si proviniera de operación productiva.

## Postura de distribución

La versión que utilice nombre, logotipo, ubicaciones o colaboradores identificables del prospecto
debe conservar la clasificación `restricted-client-demo` y no puede ensamblarse en GitHub Pages.

Una eventual versión pública debe:

- utilizar una marca y una red de tiendas completamente ficticias;
- evitar nombres, direcciones, contactos, activos e indicadores reales;
- declarar `containsClientIdentifiableData: false`;
- publicarse en una ruta neutral, por ejemplo `/retail/`, sólo con autorización explícita.

La autorización explícita fue recibida el `2026-08-19`; la variante neutral cumple estas
condiciones y se clasifica como `public-demo`.

## Actores y autoridad

| Actor                     | Responsabilidad en la demo                                                                | Decisiones permitidas                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Gerencia de sucursales    | Diseñar y distribuir el programa operativo; revisar cumplimiento y resultados.            | Publicar, reasignar, devolver o validar protocolos según su configuración.              |
| Encargado de tienda       | Ejecutar protocolos, registrar resultados, reportar incidencias y confirmar resoluciones. | Iniciar, pausar, enviar, reportar problema, confirmar solución o solicitar reapertura.  |
| Centro interno de soporte | Clasificar solicitudes, priorizar, asignar diagnóstico, resolver o escalar.               | Aceptar, enrutar, solicitar información, resolver, escalar y cerrar cuando corresponda. |
| Supervisor operativo      | Revisar ejecuciones sensibles, SLA, evidencia y calidad de cierre.                        | Validar, devolver, reabrir y aprobar cierres de mayor control.                          |
| Proveedor externo         | Ejecutar la intervención solicitada y aportar evidencia.                                  | No tiene login en v1; sus avances son registrados por soporte.                          |

### Mapeo inicial a roles existentes

- `admin` → Gerencia de sucursales o Centro interno de soporte, según el perfil de acceso.
- `operator` → Encargado de tienda.
- `supervisor` → Supervisor operativo.

El proveedor externo es una entidad y un responsable de intervención, no un cuarto rol autenticado
en la primera versión.

## Modelo operativo dual

### Flujo A — Gerencia hacia tiendas

```text
Borrador
→ Publicado
→ Asignado a tienda
→ Reconocido por encargado
→ En ejecución
→ Enviado
  → Validado → Completado
  → Devuelto → En ejecución → Reenviado
```

Una publicación puede generar asignaciones independientes para varias tiendas. La validación o
devolución de una tienda no modifica el estado de las demás.

### Flujo B — Tienda hacia soporte

```text
Reportado desde protocolo
→ Por clasificar
→ Priorizado
→ Protocolo de diagnóstico asignado
→ En diagnóstico
  → Resuelto → Pendiente de confirmación → Cerrado
  → No resuelto
    → Escalado interno o externo
    → Atención programada
    → En atención
    → Pendiente de confirmación
    → Cerrado
```

Un caso cerrado puede reabrirse cuando la tienda indica que el síntoma persiste. La reapertura
conserva el diagnóstico, evidencia, intervención y decisión anteriores.

## Distinción de entidades

| Entidad                  | Función                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| `Store`                  | Sucursal donde existe el contexto operativo.                                      |
| `StoreArea`              | Zona como piso de venta, caja, probadores, almacén o escaparate.                  |
| `Asset`                  | Equipo o instalación mantenible, por ejemplo POS, impresora, red o climatización. |
| `ProtocolTemplate`       | Definición versionada de pasos, formularios, evidencia y reglas.                  |
| `OperationalAssignment`  | Instancia asignada de un protocolo para una tienda, fecha y responsable.          |
| `ProtocolExecution`      | Registro de la ejecución y sus respuestas.                                        |
| `SupportCase`            | Solicitud rastreable creada desde una ejecución o directamente por la tienda.     |
| `SupportIntervention`    | Atención interna o externa creada sólo cuando el diagnóstico no resuelve el caso. |
| `ResolutionConfirmation` | Confirmación y validación final según la política aplicable.                      |

`SupportCase` no es sinónimo de `WorkOrder`. La intervención especializada es una consecuencia
posible del caso, no una condición obligatoria para registrar una solicitud.

## Catálogo inicial de protocolos

### Preparación y operación de tienda

- Apertura diaria.
- Cierre diario.
- Limpieza y orden.
- Presentación e imagen de tienda.
- Escaparates y exhibiciones.
- Climatización y confort.
- Seguridad y condiciones de acceso.

### Ejecución comercial

- Toma de medidas.
- Registro de venta asistida.
- Registro y seguimiento de intención de compra.
- Entrega, ajuste o servicio posterior.

### Activos y soporte

- Revisión básica de POS e impresora.
- Validación visual de red y conectividad.
- Diagnóstico guiado de climatización.
- Reporte de equipo, mobiliario o instalación dañada.
- Reporte general de incidencia en tienda.

Los pasos que impliquen riesgo eléctrico, altura, apertura de equipos o manipulación especializada
deben bloquearse para el personal de tienda y escalarse.

## Contrato de reporte dentro del protocolo

Un paso configurado como `issue-report` permite al encargado:

1. seleccionar área o activo afectado;
2. describir síntoma e impacto;
3. adjuntar fotografías o respuestas del protocolo;
4. indicar si la operación puede continuar;
5. enviar el caso al centro de soporte.

El caso resultante conserva:

- asignación y ejecución de origen;
- protocolo y versión;
- tienda, área y activo;
- respuestas y evidencia relevantes;
- actor, fecha y hora de reporte;
- prioridad sugerida y prioridad confirmada;
- trazabilidad de diagnóstico, intervención y cierre.

El usuario no vuelve a capturar información ya disponible en la ejecución.

## Prioridad y SLA demostrativos

Los tiempos siguientes son fixtures configurables para la narrativa y no representan políticas
confirmadas del prospecto:

| Prioridad | Impacto demostrativo                                     | Acuse demo | Objetivo demo  |
| --------- | -------------------------------------------------------- | ---------- | -------------- |
| P1        | Tienda sin capacidad de vender u operar de forma segura. | 15 min     | 2 h            |
| P2        | Operación severamente degradada con continuidad parcial. | 30 min     | 4 h            |
| P3        | Afectación controlada con alternativa temporal.          | 4 h        | 24 h           |
| P4        | Ajuste menor o atención programable.                     | 1 día      | Programado     |
| Rutina    | Protocolo planificado sin incidencia activa.             | No aplica  | Fecha asignada |

La interfaz debe distinguir `acknowledgementDueAt` de `resolutionTargetAt`. No debe describir el
acuse como garantía de resolución.

## Política de cierre configurable

| Tipo de ejecución o soporte       | Confirmación requerida                        | Autoridad de cierre       |
| --------------------------------- | --------------------------------------------- | ------------------------- |
| Apertura, limpieza o presentación | Encargado de tienda                           | Automático o encargado    |
| Medidas, ventas o intención       | Evidencia y respuestas completas              | Gerencia de sucursales    |
| Diagnóstico remoto resuelto       | Encargado confirma que el síntoma desapareció | Centro interno de soporte |
| Intervención interna              | Encargado confirma operación                  | Soporte o supervisor      |
| Intervención externa              | Encargado confirma y soporte revisa evidencia | Centro interno de soporte |
| Incidencia crítica o de seguridad | Confirmación dual                             | Supervisor operativo      |

La política se resuelve desde el protocolo, la prioridad y el tipo de intervención. No debe
codificarse mediante nombres específicos del escenario.

## Reglas congelables

| ID      | Regla                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------- |
| RTL-R01 | Gerencia puede publicar un protocolo para una o varias tiendas sin compartir su estado de ejecución.    |
| RTL-R02 | Cada asignación conserva versión del protocolo, responsable, fecha y criterio de cierre.                |
| RTL-R03 | Una incidencia puede reportarse desde la ejecución sin abandonar ni perder sus respuestas.              |
| RTL-R04 | El caso de soporte referencia la ejecución de origen, pero mantiene ciclo de vida propio.               |
| RTL-R05 | Soporte clasifica la prioridad final; la prioridad sugerida por la tienda permanece en auditoría.       |
| RTL-R06 | El diagnóstico remoto debe ocurrir antes de una intervención, excepto cuando seguridad o P1 lo impidan. |
| RTL-R07 | El personal de tienda sólo recibe pasos autorizados para su rol y condición de seguridad.               |
| RTL-R08 | Una intervención puede asignarse a un responsable interno o proveedor externo.                          |
| RTL-R09 | La evidencia de proveedor es registrada por soporte en v1; no existe portal externo.                    |
| RTL-R10 | El cierre se habilita sólo cuando se cumplen confirmación, validación y evidencia configuradas.         |
| RTL-R11 | Reabrir conserva las revisiones anteriores y exige motivo.                                              |
| RTL-R12 | Mensajería, SLA, diagnósticos, archivos, GPS y sincronización son simulados salvo indicación explícita. |

## Historias de usuario prioritarias

### Gerencia de sucursales

- Como gerente, quiero asignar un protocolo a varias tiendas para controlar una operación común.
- Como gerente, quiero ver cumplimiento y excepciones por tienda para intervenir donde haga falta.
- Como gerente, quiero devolver una ejecución incompleta sin perder su primera entrega.

### Encargado de tienda

- Como encargado, quiero ver el programa de mi tienda para saber qué debo realizar y cuándo.
- Como encargado, quiero seguir pasos guiados y aportar evidencia para ejecutar de forma consistente.
- Como encargado, quiero reportar un problema desde el mismo protocolo para no repetir contexto.
- Como encargado, quiero confirmar si una solución funcionó para evitar cierres incorrectos.

### Centro de soporte

- Como agente, quiero recibir solicitudes contextualizadas para diagnosticar sin pedir nuevamente la
  información que ya capturó la tienda.
- Como agente, quiero asignar un protocolo remoto antes de escalar para resolver casos simples.
- Como agente, quiero enrutar internamente o a proveedor conservando SLA, responsables y evidencia.

### Supervisor

- Como supervisor, quiero revisar casos críticos, reaperturas y vencimientos para gobernar el cierre.

## Indicadores de éxito de la demo

### Indicadores inmediatos

- El presentador completa el recorrido principal en máximo 10 minutos.
- Las ocho escenas tienen una acción real y un cambio de estado visible.
- La incidencia conserva tienda, activo, protocolo, respuestas y evidencia sin recaptura.
- El recorrido muestra resolución remota y deja visible al menos un caso externo secundario.
- No existe botón muerto, estado sin salida o navegación dependiente de edición manual.

### Hipótesis operativas que comunicar

No son métricas productivas del prospecto. La demo busca mostrar que el modelo permitiría medir:

- cumplimiento de protocolos por tienda;
- tiempo de clasificación y resolución;
- resolución remota frente a escalamiento;
- reincidencia por activo, área o protocolo;
- cumplimiento de proveedores;
- reaperturas y calidad de cierre.

## Datos pendientes antes de construir

### Bloqueantes para una versión identificada con el cliente

- autorización de uso de nombre, logotipo y lenguaje específico;
- decisión sobre distribución restringida o pública;
- catálogo aprobado de activos y acciones seguras para tienda.

### No bloqueantes para el escenario neutral

- número definitivo de tiendas ficticias;
- SLA reales o valores comerciales a utilizar;
- canales actuales de solicitud;
- lista final de proveedores y especialidades simuladas;
- criterios exactos de cierre por cada protocolo comercial.

## Condición de aprobación

El contrato puede pasar a storyboard e implementación cuando producto confirme:

- el modelo dual gerencia→tienda y tienda→soporte;
- la diferencia entre caso e intervención;
- el catálogo inicial de protocolos;
- la política configurable de cierre;
- la historia de climatización como recorrido principal;
- la postura de distribución y datos.
