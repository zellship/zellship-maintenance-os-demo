import dayjs from "dayjs";
import type { Asset, Protocol, Schedule, Execution, Incident, Notification } from "./types";

const today = dayjs().format("YYYY-MM-DD");

export const seedAssets: Asset[] = [
  { id: "AC-01", name: "Compresor de aire AC-01", family: "Compresores", plant: "Planta Monterrey", area: "Utilidades · Línea 2", criticality: "High", status: "Maintenance", availability: 94.2, health: 88, runtimeHours: 8420, lastService: dayjs().subtract(30, "day").toISOString() },
  { id: "HP-02", name: "Bomba centrífuga HP-02", family: "Bombas", plant: "Planta Monterrey", area: "Proceso · Línea 1", criticality: "High", status: "Available", availability: 98.1, health: 96, runtimeHours: 6240, lastService: dayjs().subtract(18, "day").toISOString() },
  { id: "MTR-07", name: "Motor eléctrico MTR-07", family: "Motores", plant: "Planta Monterrey", area: "Empaque · Línea 3", criticality: "Critical", status: "Risk", availability: 81.4, health: 63, runtimeHours: 11390, lastService: dayjs().subtract(74, "day").toISOString() },
  { id: "CV-03", name: "Transportador CV-03", family: "Transportadores", plant: "Planta Saltillo", area: "Ensamble · Línea 4", criticality: "Medium", status: "Available", availability: 96.8, health: 91, runtimeHours: 4380, lastService: dayjs().subtract(12, "day").toISOString() },
];

export const seedProtocols: Protocol[] = [
  {
    id: "p1",
    name: "Mantenimiento preventivo de compresor",
    description: "Rutina estandarizada para asegurar presión, temperatura, lubricación y condición de bandas del compresor.",
    category: "Preventivo",
    priority: "High",
    status: "Active",
    branches: ["Planta Monterrey"],
    recurrence: "Monthly",
    schedule: [{ hour: "10:00", tolerance: 20 }],
    evidenceConfig: [
      { type: "GPS", required: true, radius: 80 },
      { type: "Photo", required: true, minCount: 1 },
      { type: "Signature", required: true },
    ],
    formConfig: [
      { id: "f1", type: "number", label: "Presión de descarga (PSI)", required: true },
      { id: "f2", type: "number", label: "Temperatura de descarga (°C)", required: true },
      { id: "f3", type: "select", label: "Condición de bandas", required: true, options: ["Aceptable", "Requiere ajuste", "Requiere cambio"] },
      { id: "f4", type: "yesno", label: "¿Se aplicó bloqueo LOTO?", required: true },
      { id: "f5", type: "comment", label: "Observaciones del técnico" },
    ],
    supervisors: ["Roberto Salas"],
    operators: ["Ana Torres"],
    channels: ["System", "WhatsApp"],
    preAlertMinutes: 30,
    requiresValidation: true,
    assetIds: ["AC-01"],
    materials: ["Filtro AF-20 · 1 pza", "Aceite ISO VG 46 · 2 L", "Kit de limpieza · 1 pza"],
    safetyInstructions: ["Aplicar bloqueo LOTO", "Liberar presión antes de intervenir", "Usar lentes, guantes y protección auditiva"],
    estimatedMinutes: 45,
    lastExecution: dayjs().subtract(30, "day").toISOString(),
  },
  {
    id: "p2",
    name: "Inspección trimestral de bomba",
    description: "Verificación de vibración, sellos, presión de succión y condición de acoplamiento.",
    category: "Inspección",
    priority: "Medium",
    status: "Active",
    branches: ["Planta Monterrey"],
    recurrence: "Monthly",
    schedule: [{ hour: "08:00", tolerance: 30 }],
    evidenceConfig: [{ type: "Photo", required: true, minCount: 2 }, { type: "Timestamp", required: true }],
    formConfig: [
      { id: "f1", type: "number", label: "Vibración global (mm/s)", required: true },
      { id: "f2", type: "select", label: "Condición del sello", required: true, options: ["Sin fuga", "Fuga menor", "Fuga crítica"] },
      { id: "f3", type: "comment", label: "Hallazgos" },
    ],
    supervisors: ["Roberto Salas"], operators: ["Jorge Ruiz"], channels: ["System"], preAlertMinutes: 30,
    requiresValidation: true, assetIds: ["HP-02"], materials: ["Paño industrial · 2 pzas"],
    safetyInstructions: ["Verificar guardas instaladas", "No intervenir con bomba energizada"], estimatedMinutes: 35,
    lastExecution: dayjs().subtract(1, "day").toISOString(),
  },
  {
    id: "p3",
    name: "Diagnóstico de motor eléctrico",
    description: "Inspección por condición con temperatura, vibración, ruido y evidencia visual.",
    category: "Predictivo",
    priority: "Critical",
    status: "Active",
    branches: ["Planta Monterrey"], recurrence: "Weekly", schedule: [{ hour: "11:30", tolerance: 15 }],
    evidenceConfig: [{ type: "GPS", required: true, radius: 80 }, { type: "Photo", required: true, minCount: 1 }],
    formConfig: [
      { id: "f1", type: "number", label: "Temperatura de carcasa (°C)", required: true },
      { id: "f2", type: "number", label: "Vibración (mm/s)", required: true },
      { id: "f3", type: "rating", label: "Condición general", required: true },
    ],
    supervisors: ["Mónica Reyes"], operators: ["Laura Díaz"], channels: ["System", "SMS"], preAlertMinutes: 20,
    requiresValidation: true, assetIds: ["MTR-07"], materials: ["Cámara termográfica", "Analizador de vibración"],
    safetyInstructions: ["Mantener distancia de partes móviles", "Usar equipo de medición calibrado"], estimatedMinutes: 30,
    lastExecution: dayjs().subtract(7, "day").toISOString(),
  },
  {
    id: "p4",
    name: "Lubricación de transportador",
    description: "Lubricación controlada de rodamientos y revisión de tensión de cadena.",
    category: "Lubricación", priority: "Low", status: "Active", branches: ["Planta Saltillo"], recurrence: "Weekly",
    schedule: [{ hour: "09:00", tolerance: 20 }], evidenceConfig: [{ type: "Photo", required: true, minCount: 1 }],
    formConfig: [{ id: "f1", type: "text", label: "Lote del lubricante", required: true }, { id: "f2", type: "yesno", label: "Puntos lubricados completos", required: true }],
    supervisors: ["Mónica Reyes"], operators: ["Diego Luna"], channels: ["System"], preAlertMinutes: 15, requiresValidation: false,
    assetIds: ["CV-03"], materials: ["Grasa EP-2 · 500 g"], safetyInstructions: ["Detener y bloquear transportador"], estimatedMinutes: 25,
  },
];

export const seedSchedules: Schedule[] = [
  { id: "s1", protocolId: "p1", date: today, hour: "10:00", tolerance: 20, operator: "Ana Torres", status: "Pending", assetId: "AC-01", plant: "Planta Monterrey", workOrder: "OT-2407-018" },
  { id: "s2", protocolId: "p2", date: today, hour: "08:00", tolerance: 30, operator: "Jorge Ruiz", status: "Completed", assetId: "HP-02", plant: "Planta Monterrey", workOrder: "OT-2407-014" },
  { id: "s3", protocolId: "p3", date: today, hour: "09:00", tolerance: 15, operator: "Laura Díaz", status: "Completed", assetId: "MTR-07", plant: "Planta Monterrey", workOrder: "OT-2407-015" },
  { id: "s4", protocolId: "p4", date: today, hour: "07:30", tolerance: 20, operator: "Diego Luna", status: "Completed", assetId: "CV-03", plant: "Planta Saltillo", workOrder: "OT-2407-016" },
  { id: "s5", protocolId: "p2", date: today, hour: "09:15", tolerance: 30, operator: "Jorge Ruiz", status: "Completed", assetId: "HP-02", plant: "Planta Monterrey", workOrder: "OT-2407-017" },
  { id: "s6", protocolId: "p1", date: today, hour: "06:45", tolerance: 20, operator: "Ana Torres", status: "Completed", assetId: "AC-01", plant: "Planta Monterrey", workOrder: "OT-2407-013" },
  { id: "s7", protocolId: "p3", date: dayjs().subtract(1, "day").format("YYYY-MM-DD"), hour: "11:30", tolerance: 15, operator: "Laura Díaz", status: "Expired", assetId: "MTR-07", plant: "Planta Monterrey", workOrder: "OT-2407-009" },
];

const validEvidence = (executionId: string) => [
  { id: `${executionId}-gps`, executionId, type: "GPS" as const, data: "25.6866,-100.3161", gps: { lat: 25.6866, lng: -100.3161 }, timestamp: dayjs().toISOString(), status: "Valid" as const },
  { id: `${executionId}-photo`, executionId, type: "Photo" as const, data: "photo://industrial-equipment", timestamp: dayjs().toISOString(), status: "Valid" as const },
];

export const seedExecutions: Execution[] = [
  { id: "e2", scheduleId: "s2", protocolId: "p2", startAt: dayjs().hour(8).minute(2).toISOString(), endAt: dayjs().hour(8).minute(31).toISOString(), operator: "Jorge Ruiz", status: "Validated", evidences: validEvidence("e2"), formAnswers: { f1: 2.8, f2: "Sin fuga", f3: "Operación estable" }, approval: { supervisor: "Roberto Salas", decision: "Approved", comments: "Dentro de estándar.", at: dayjs().toISOString() }, score: 96 },
  { id: "e3", scheduleId: "s3", protocolId: "p3", startAt: dayjs().hour(9).minute(1).toISOString(), endAt: dayjs().hour(9).minute(27).toISOString(), operator: "Laura Díaz", status: "PendingValidation", evidences: validEvidence("e3"), formAnswers: { f1: 78, f2: 5.9, f3: 3 }, score: 78 },
  { id: "e4", scheduleId: "s4", protocolId: "p4", startAt: dayjs().hour(7).minute(32).toISOString(), endAt: dayjs().hour(7).minute(51).toISOString(), operator: "Diego Luna", status: "Completed", evidences: [validEvidence("e4")[1]], formAnswers: { f1: "EP2-2407", f2: true }, score: 92 },
  { id: "e5", scheduleId: "s5", protocolId: "p2", startAt: dayjs().hour(9).minute(16).toISOString(), endAt: dayjs().hour(9).minute(43).toISOString(), operator: "Jorge Ruiz", status: "Validated", evidences: validEvidence("e5"), formAnswers: { f1: 2.6, f2: "Sin fuga" }, approval: { supervisor: "Roberto Salas", decision: "Approved", comments: "Sin desviaciones.", at: dayjs().toISOString() }, score: 98 },
  { id: "e6", scheduleId: "s6", protocolId: "p1", startAt: dayjs().hour(6).minute(47).toISOString(), endAt: dayjs().hour(7).minute(28).toISOString(), operator: "Ana Torres", status: "Validated", evidences: [...validEvidence("e6"), { id: "e6-sign", executionId: "e6", type: "Signature", data: "signature://captured", timestamp: dayjs().toISOString(), status: "Valid" }], formAnswers: { f1: 108, f2: 84, f3: "Aceptable", f4: true }, approval: { supervisor: "Roberto Salas", decision: "Approved", comments: "Ejecución correcta.", at: dayjs().toISOString() }, score: 94 },
];

export const seedIncidents: Incident[] = [
  { id: "i1", scheduleId: "s7", protocolId: "p3", type: "NotExecuted", status: "Open", description: "Diagnóstico de MTR-07 no ejecutado dentro de la ventana; vibración en condición de alerta.", createdAt: dayjs().subtract(1, "day").toISOString() },
  { id: "i2", executionId: "e3", scheduleId: "s3", protocolId: "p3", type: "Escalated", status: "Review", description: "Vibración de 5.9 mm/s supera el límite de 4.5 mm/s; requiere decisión del supervisor.", createdAt: dayjs().toISOString() },
];

export const seedNotifications: Notification[] = [
  { id: "n1", type: "ValidationRequired", channel: "System", actor: "Roberto Salas", message: "Diagnóstico de MTR-07 requiere validación.", status: "Sent", createdAt: dayjs().toISOString() },
  { id: "n2", type: "PreviousAlert", channel: "WhatsApp", actor: "Ana Torres", message: "OT-2407-018 inicia en 30 minutos.", status: "Sent", createdAt: dayjs().toISOString() },
  { id: "n3", type: "Incident", channel: "System", actor: "Mónica Reyes", message: "Vibración fuera de estándar en MTR-07.", status: "Sent", createdAt: dayjs().toISOString() },
];

export const plants = ["Planta Monterrey", "Planta Saltillo", "Planta Querétaro"];
export const branches = plants;
export const operators = ["Ana Torres", "Jorge Ruiz", "Laura Díaz", "Diego Luna"];
export const supervisors = ["Roberto Salas", "Mónica Reyes"];
export const categories = ["Preventivo", "Predictivo", "Correctivo", "Inspección", "Lubricación", "Seguridad"];
