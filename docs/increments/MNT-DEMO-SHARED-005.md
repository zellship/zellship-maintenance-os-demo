# MNT-DEMO-SHARED-005 — Perfiles operativos y documentos

## Resultado

Los perfiles de activos y colaboradores organizan la información en cinco destinos consumibles:
Resumen, Estado y plan o Capacidad y carga, Actividad, Incidencias y Documentos. La lectura
operativa aparece inmediatamente después de la identidad y antes de metadata o documentos.

Para activos se separa disponibilidad —disponible, asignado o no disponible— de condición
operativa —operando, mantenimiento, revisión, cuarentena o fuera de servicio—. También se muestran
cumplimiento del plan, siguiente intervención, disponibilidad e incidencias. Para colaboradores se
compara carga asignada contra una capacidad demostrativa de ocho horas, además del plan del turno,
actividad, incidencias y documentación asociada. Los detalles de orden se consultan en modal y
conservan el contexto del perfil.

## Documentos demostrados

- activos: manuales, planes y garantías;
- colaboradores: seguridad y competencias;
- carga de un documento nuevo como metadatos de sesión;
- consulta de versión, vigencia, estado y resumen.

## Límites y migración

No se conserva el contenido binario del archivo. No hay antivirus, OCR, firma, versionado real,
permisos ni repositorio remoto. Como el estado persistido incorpora `documents`, cada escenario usa
una nueva `persistence.stateKey`; abrir la RC inicia desde semilla y evita mezclar estado anterior.
