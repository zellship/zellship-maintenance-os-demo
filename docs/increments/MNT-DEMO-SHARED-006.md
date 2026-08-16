# MNT-DEMO-SHARED-006 — Jerarquía operativa de perfiles y acceso rápido

## Decisión

La lectura principal de un perfil de mantenimiento debe responder antes que nada si la entidad está
disponible, qué trabajo tiene comprometido, cómo avanza contra su plan y qué incidencias requieren
atención. Identidad extendida, metadata, insights y documentos permanecen disponibles, pero dejan
de competir con esa lectura.

## Perfil de activo

- disponibilidad separada de condición operativa;
- orden actual o siguiente compromiso;
- cumplimiento del plan y vencimientos;
- disponibilidad de los últimos 30 días;
- incidencias abiertas e historial relacionado;
- acceso al detalle de la orden sin abandonar el perfil.

La separación evita que `Asignado` y `En mantenimiento` se traten como estados excluyentes. Un
activo puede estar asignado a una orden y, al mismo tiempo, encontrarse en mantenimiento o revisión.

## Perfil de colaborador

- disponibilidad del turno;
- capacidad demostrativa de ocho horas;
- carga asignada y capacidad restante;
- orden actual y siguientes actividades;
- incidencias vinculadas al colaborador o a sus órdenes.

## Acceso rápido

`Nueva orden` se retira de los encabezados para no traslaparse con acciones locales. Se muestra en
el menú lateral de escritorio, como icono cuando el menú se colapsa y como botón flotante en móvil.

## Límites

Cumplimiento, disponibilidad y capacidad se calculan con datos simulados del escenario. No
representan integración con producción, turnos, telemetría, nómina, sensores ni capacidad en tiempo
real.
