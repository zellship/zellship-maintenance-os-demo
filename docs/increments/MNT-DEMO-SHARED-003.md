# MNT-DEMO-SHARED-003 — Integridad temporal compartida

## Decisión

Las tres variantes usan un mismo contrato de tiempo: los datos semilla se anclan al día de la
sesión pública y las acciones avanzan un reloj lógico monotónico. `VITE_DEMO_DATE` conserva el modo
determinista para QA, capturas y recorridos repetibles.

## Reglas verificadas

- inicio de ejecución menor o igual a fin;
- evidencia dentro de la ventana de ejecución;
- validación posterior al cierre técnico;
- órdenes terminadas conectadas a una ejecución terminada;
- reservas alineadas con la orden;
- servicios aceptados dentro de su ventana;
- compromisos pendientes no nacen vencidos al abrir la demo.

## Alcance

El reloj es una simulación de navegador. No sustituye reloj de servidor, zona horaria corporativa,
auditoría inmutable ni conciliación multiusuario.

## Evidencia de cierre

`src/demo-config/temporal-integrity.test.ts` ejecuta el contrato sobre Industrial, ATM y Planta de
Alambres. Los scripts públicos ya no congelan la fecha; los scripts `:fixed` conservan el punto de
control auditado. Si el estado local pertenece a otro día, la demo restaura automáticamente la
semilla del día actual para no mostrar como vigente una sesión anterior.
