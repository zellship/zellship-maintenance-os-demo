# MNT-DEMO-SHARED-007 — Simplificación del encabezado de perfiles

## Decisión

Se elimina la franja compacta de metadatos ubicada debajo de la acción `Volver` en los perfiles de
activos y colaboradores. Entidad, estado, ubicación y confianza ya se comunican en el encabezado
principal y en el resumen operativo, por lo que la franja agregaba duplicidad y comprimía la parte
superior de la pantalla.

## Alcance

- aplica a los perfiles de activos y colaboradores de todas las variantes;
- conserva la acción `Volver`, la navegación por secciones y el encabezado principal;
- conserva las métricas destacadas de estado, plan, disponibilidad, capacidad y carga;
- elimina los componentes y estilos que solo daban soporte a la franja retirada.

## Límites

El cambio modifica únicamente la jerarquía visual. No altera datos, navegación, persistencia ni
comportamiento operativo.
