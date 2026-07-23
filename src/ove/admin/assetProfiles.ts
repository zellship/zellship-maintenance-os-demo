export interface AssetRelationship {
  type: "Person" | "Protocol" | "Tool" | "Material" | "Location" | "Flow" | "System";
  name: string;
  relation: string;
  status?: string;
}

export interface AssetInsight {
  tone: "success" | "warning" | "critical" | "info";
  title: string;
  detail: string;
  confidence: number;
  source: string;
}

export interface AssetProfileDefinition {
  assetId: string;
  externalKey: string;
  assetTag: string;
  manufacturer: string;
  model: string;
  serial: string;
  installedAt: string;
  owner: string;
  costCenter: string;
  profileCompleteness: number;
  dataConfidence: number;
  energySource: string;
  controlSystem: string;
  dataSources: string[];
  tags: string[];
  keyFacts: string[];
  relationships: AssetRelationship[];
  insights: AssetInsight[];
}

export const assetProfiles: Record<string, AssetProfileDefinition> = {
  "AC-01": {
    assetId: "AC-01",
    externalKey: "SAP-EAM-100245",
    assetTag: "RFID-AC01-MTY",
    manufacturer: "Atlas Copco",
    model: "GA90 VSD+",
    serial: "AC-GA90-88421",
    installedAt: "2021-03-18",
    owner: "Carlos Mendoza · Jefe de Utilidades",
    costCenter: "CC-4102 · Servicios industriales",
    profileCompleteness: 96,
    dataConfidence: 93,
    energySource: "Eléctrica · 460 V · 125 HP",
    controlSystem: "SCADA Utilidades · PLC Siemens S7",
    dataSources: ["Maintenance OS", "SAP EAM", "SCADA", "IoT Gateway"],
    tags: ["Activo crítico", "Aire comprimido", "VSD", "Monitoreado IoT"],
    keyFacts: [
      "Responsable del 68% del aire comprimido de Línea 2; una indisponibilidad impacta tres celdas productivas.",
      "El último mantenimiento obtuvo 91% y dejó seguimiento de tensión de bandas para la próxima ventana.",
      "Consumo energético 4.7% por encima de la línea base durante los últimos siete días.",
      "Torquímetro, kit LOTO y filtro AF-20 están ligados al protocolo preventivo vigente.",
    ],
    relationships: [
      { type: "Person", name: "Ana Torres", relation: "Técnico habilitado", status: "Asignada" },
      {
        type: "Person",
        name: "Roberto Salas",
        relation: "Supervisor responsable",
        status: "Disponible",
      },
      {
        type: "Protocol",
        name: "Mantenimiento preventivo",
        relation: "Protocolo mensual",
        status: "Vigente",
      },
      {
        type: "Tool",
        name: "Torquímetro TQ-88421",
        relation: "Equipo requerido",
        status: "Reservado",
      },
      { type: "Material", name: "Filtro AF-20", relation: "Consumible crítico", status: "8 pzas" },
      {
        type: "Location",
        name: "Utilidades · Línea 2",
        relation: "Ubicación operacional",
        status: "Planta MTY",
      },
      {
        type: "Flow",
        name: "Recuperación y retorno",
        relation: "Flujo operativo",
        status: "En ejecución",
      },
      {
        type: "System",
        name: "SCADA Utilidades",
        relation: "Fuente de condición",
        status: "En línea",
      },
    ],
    insights: [
      {
        tone: "warning",
        title: "Revisar tensión de bandas",
        detail: "La evidencia visual alcanzó 86% de coincidencia y detectó desgaste leve.",
        confidence: 86,
        source: "AI Vision",
      },
      {
        tone: "info",
        title: "Consumo energético creciente",
        detail: "La potencia específica aumentó 4.7% contra la línea base de 30 días.",
        confidence: 91,
        source: "SCADA + histórico",
      },
      {
        tone: "success",
        title: "Riesgo de paro controlado",
        detail: "El seguimiento fue programado antes de la siguiente ventana productiva.",
        confidence: 94,
        source: "Commitment Engine",
      },
    ],
  },
  "HP-02": {
    assetId: "HP-02",
    externalKey: "SAP-EAM-100312",
    assetTag: "RFID-HP02-MTY",
    manufacturer: "Grundfos",
    model: "CR 64-4",
    serial: "GF-CR64-20918",
    installedAt: "2022-06-09",
    owner: "Laura Castañeda · Ingeniería de proceso",
    costCenter: "CC-3210 · Proceso Línea 1",
    profileCompleteness: 91,
    dataConfidence: 89,
    energySource: "Eléctrica · 460 V · 40 HP",
    controlSystem: "PLC Línea 1 · Historiador PI",
    dataSources: ["Maintenance OS", "SAP EAM", "Historiador PI"],
    tags: ["Bomba de proceso", "Alta criticidad", "Vibración"],
    keyFacts: [
      "Opera en régimen continuo y abastece el circuito primario de Línea 1.",
      "Última vibración global: 2.8 mm/s, dentro del estándar configurado.",
      "Sello mecánico sin fuga y acoplamiento validado en la última inspección.",
      "El técnico principal y el analizador de vibración están disponibles.",
    ],
    relationships: [
      { type: "Person", name: "Jorge Ruiz", relation: "Técnico principal", status: "Disponible" },
      { type: "Person", name: "Roberto Salas", relation: "Supervisor", status: "Disponible" },
      {
        type: "Protocol",
        name: "Inspección trimestral de bomba",
        relation: "Protocolo directo",
        status: "Vigente",
      },
      {
        type: "Tool",
        name: "Analizador AV-3108",
        relation: "Equipo predictivo",
        status: "Disponible",
      },
      { type: "Location", name: "Proceso · Línea 1", relation: "Ubicación", status: "Planta MTY" },
      {
        type: "System",
        name: "Historiador PI",
        relation: "Fuente de tendencia",
        status: "En línea",
      },
    ],
    insights: [
      {
        tone: "success",
        title: "Condición estable",
        detail: "La tendencia de vibración permanece debajo del umbral de alerta.",
        confidence: 96,
        source: "Historiador PI",
      },
      {
        tone: "info",
        title: "Optimizar frecuencia",
        detail: "El histórico permite migrar de calendario fijo a mantenimiento por condición.",
        confidence: 78,
        source: "Operational Excellence",
      },
    ],
  },
  "MTR-07": {
    assetId: "MTR-07",
    externalKey: "SAP-EAM-100477",
    assetTag: "RFID-MTR07-MTY",
    manufacturer: "WEG",
    model: "W22 Premium",
    serial: "WEG-W22-77108",
    installedAt: "2019-11-22",
    owner: "Mónica Reyes · Supervisión eléctrica",
    costCenter: "CC-5301 · Empaque Línea 3",
    profileCompleteness: 98,
    dataConfidence: 97,
    energySource: "Eléctrica · 460 V · 75 HP",
    controlSystem: "Sensor inalámbrico de vibración · SCADA",
    dataSources: ["Maintenance OS", "SAP EAM", "Sensor IIoT", "SCADA"],
    tags: ["Crítico", "Alerta activa", "Predictivo", "IIoT"],
    keyFacts: [
      "Vibración de 5.9 mm/s supera el límite configurado de 4.5 mm/s.",
      "Existe una ejecución pendiente de validación y una incidencia escalada.",
      "La cámara termográfica y el analizador de vibración están requeridos.",
      "Un paro no planeado afecta directamente la capacidad de Empaque Línea 3.",
    ],
    relationships: [
      {
        type: "Person",
        name: "Laura Díaz",
        relation: "Especialista eléctrica",
        status: "Asignada",
      },
      { type: "Person", name: "Mónica Reyes", relation: "Supervisor", status: "Notificada" },
      {
        type: "Protocol",
        name: "Diagnóstico de motor eléctrico",
        relation: "Trigger por condición",
        status: "En revisión",
      },
      { type: "Tool", name: "Cámara CT-9021", relation: "Termografía", status: "Disponible" },
      { type: "Tool", name: "Analizador AV-3108", relation: "Vibración", status: "Disponible" },
      {
        type: "Flow",
        name: "Respuesta a condición crítica",
        relation: "Flujo automático",
        status: "Detonado",
      },
      {
        type: "System",
        name: "Sensor IIoT MTR-07",
        relation: "Origen de alerta",
        status: "5.9 mm/s",
      },
    ],
    insights: [
      {
        tone: "critical",
        title: "Riesgo mecánico elevado",
        detail: "La vibración excede el umbral y requiere decisión antes de liberar el activo.",
        confidence: 97,
        source: "Sensor IIoT",
      },
      {
        tone: "warning",
        title: "Posible desalineación",
        detail: "La combinación de vibración y temperatura es consistente con desalineación.",
        confidence: 83,
        source: "AI Condition",
      },
      {
        tone: "info",
        title: "Ventana recomendada",
        detail: "Intervenir hoy entre 14:00 y 15:30 minimiza impacto productivo.",
        confidence: 88,
        source: "Commitment Engine",
      },
    ],
  },
  "CV-03": {
    assetId: "CV-03",
    externalKey: "SAP-EAM-100518",
    assetTag: "RFID-CV03-SLT",
    manufacturer: "Dorner",
    model: "3200 Series",
    serial: "DR-3200-4380",
    installedAt: "2023-01-14",
    owner: "Diego Luna · Mantenimiento Saltillo",
    costCenter: "CC-6204 · Ensamble Línea 4",
    profileCompleteness: 87,
    dataConfidence: 84,
    energySource: "Eléctrica · 230 V · 5 HP",
    controlSystem: "PLC Ensamble 4",
    dataSources: ["Maintenance OS", "SAP EAM", "PLC Ensamble"],
    tags: ["Transportador", "Lubricación", "Saltillo"],
    keyFacts: [
      "Transportador de ensamble con condición general estable.",
      "Última lubricación completada en 19 minutos y dentro del rango de consumo.",
      "La pistola de engrase calibrada está disponible en el pañol MRO-02.",
      "No presenta incidencias abiertas ni restricciones de operación.",
    ],
    relationships: [
      { type: "Person", name: "Diego Luna", relation: "Técnico responsable", status: "Disponible" },
      {
        type: "Protocol",
        name: "Lubricación de transportador",
        relation: "Protocolo semanal",
        status: "Vigente",
      },
      { type: "Tool", name: "Pistola PG-207", relation: "Equipo requerido", status: "Disponible" },
      { type: "Material", name: "Grasa EP-2", relation: "Consumible", status: "6,200 g" },
      {
        type: "Location",
        name: "Ensamble · Línea 4",
        relation: "Ubicación",
        status: "Planta Saltillo",
      },
    ],
    insights: [
      {
        tone: "success",
        title: "Condición saludable",
        detail: "Las últimas ejecuciones cumplen tiempos, consumo y evidencia.",
        confidence: 92,
        source: "Maintenance OS",
      },
      {
        tone: "info",
        title: "Ajustar inventario mínimo",
        detail: "El patrón de consumo permite reducir reserva sin elevar el riesgo.",
        confidence: 74,
        source: "Inventory Engine",
      },
    ],
  },
};
