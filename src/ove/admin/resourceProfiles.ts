export interface TechnicianProfileDefinition {
  personId: string;
  employeeNumber: string;
  externalKey: string;
  email: string;
  phone: string;
  hiredAt: string;
  specialty: string;
  supervisor: string;
  team: string;
  competencyScore: number;
  reliability: number;
  onTime: number;
  firstTimeFix: number;
  completedOrders: number;
  avgScore: number;
  profileCompleteness: number;
  dataConfidence: number;
  tags: string[];
  keyFacts: Array<{
    label: string;
    value: string;
    detail: string;
    tone: "success" | "warning" | "critical" | "info";
  }>;
  insights: Array<{
    tone: "success" | "warning" | "critical" | "info";
    title: string;
    detail: string;
    confidence: number;
    source: string;
  }>;
}

export const technicianProfiles: Record<string, TechnicianProfileDefinition> = {
  "per-ana": {
    personId: "per-ana",
    employeeNumber: "EMP-MTY-0184",
    externalKey: "HCM-100184",
    email: "ana.torres@demo-industrial.mx",
    phone: "+52 81 5550 0184",
    hiredAt: "2021-04-12",
    specialty: "Compresores y bombas de proceso",
    supervisor: "Roberto Salas",
    team: "Mantenimiento mecánico · Turno A",
    competencyScore: 94,
    reliability: 96,
    onTime: 92,
    firstTimeFix: 89,
    completedOrders: 148,
    avgScore: 93,
    profileCompleteness: 97,
    dataConfidence: 95,
    tags: ["Técnico senior", "LOTO", "Compresores", "Bombas", "Operación móvil"],
    keyFacts: [
      {
        label: "Elegibilidad actual",
        value: "3 protocolos",
        detail: "Puede ejecutar mantenimiento de compresores, bombas y aislamiento LOTO.",
        tone: "success",
      },
      {
        label: "Desempeño 90 días",
        value: "93% promedio",
        detail: "Calificación consolidada de evidencia, tiempo, cumplimiento y validación.",
        tone: "success",
      },
      {
        label: "Carga del turno",
        value: "2 asignaciones",
        detail: "Una orden en ejecución y una actividad preventiva programada.",
        tone: "info",
      },
      {
        label: "Próximo vencimiento",
        value: "LOTO · 10 meses",
        detail: "No existen certificaciones bloqueantes para las órdenes asignadas.",
        tone: "success",
      },
    ],
    insights: [
      {
        tone: "success",
        title: "Alta confiabilidad operativa",
        detail: "Cumple tiempos y evidencia con consistencia superior al promedio del equipo.",
        confidence: 96,
        source: "Operational Excellence Engine",
      },
      {
        tone: "info",
        title: "Ruta de desarrollo sugerida",
        detail: "Agregar Análisis de vibración Nivel I habilitaría diagnósticos predictivos.",
        confidence: 88,
        source: "Entity Profile Engine",
      },
      {
        tone: "warning",
        title: "Carga concentrada en AC-01",
        detail: "Conviene formar un respaldo para reducir dependencia en activos críticos.",
        confidence: 84,
        source: "Business Commitment Engine",
      },
    ],
  },
  "per-jorge": {
    personId: "per-jorge",
    employeeNumber: "EMP-MTY-0207",
    externalKey: "HCM-100207",
    email: "jorge.ruiz@demo-industrial.mx",
    phone: "+52 81 5550 0207",
    hiredAt: "2022-02-07",
    specialty: "Bombas y análisis de vibración",
    supervisor: "Roberto Salas",
    team: "Mantenimiento predictivo · Turno A",
    competencyScore: 91,
    reliability: 93,
    onTime: 95,
    firstTimeFix: 91,
    completedOrders: 119,
    avgScore: 94,
    profileCompleteness: 93,
    dataConfidence: 92,
    tags: ["Predictivo", "Vibración Nivel I", "Bombas", "LOTO"],
    keyFacts: [
      {
        label: "Elegibilidad actual",
        value: "3 protocolos",
        detail: "Habilitado para bombas, vibración y LOTO.",
        tone: "success",
      },
      {
        label: "Desempeño 90 días",
        value: "94% promedio",
        detail: "Mejor resultado del equipo en inspecciones predictivas.",
        tone: "success",
      },
      {
        label: "Disponibilidad",
        value: "Disponible",
        detail: "Sin reservas de horario activas en la siguiente ventana.",
        tone: "info",
      },
      {
        label: "Certificación",
        value: "7 meses",
        detail: "Vigencia restante de Análisis de vibración Nivel I.",
        tone: "warning",
      },
    ],
    insights: [
      {
        tone: "success",
        title: "Especialista recomendado",
        detail: "Primera opción para diagnósticos de bombas y condición mecánica.",
        confidence: 95,
        source: "Entity Profile Engine",
      },
      {
        tone: "warning",
        title: "Renovación preventiva",
        detail: "Programar la recertificación de vibración antes del siguiente trimestre.",
        confidence: 91,
        source: "Commitment Engine",
      },
    ],
  },
  "per-laura": {
    personId: "per-laura",
    employeeNumber: "EMP-MTY-0221",
    externalKey: "HCM-100221",
    email: "laura.diaz@demo-industrial.mx",
    phone: "+52 81 5550 0221",
    hiredAt: "2022-09-19",
    specialty: "Diagnóstico eléctrico y termografía",
    supervisor: "Mónica Reyes",
    team: "Mantenimiento eléctrico · Turno A",
    competencyScore: 92,
    reliability: 94,
    onTime: 90,
    firstTimeFix: 93,
    completedOrders: 106,
    avgScore: 95,
    profileCompleteness: 95,
    dataConfidence: 94,
    tags: ["Eléctrico", "Termografía", "Vibración", "LOTO"],
    keyFacts: [
      {
        label: "Elegibilidad actual",
        value: "3 protocolos",
        detail: "Diagnóstico eléctrico, vibración y seguridad LOTO.",
        tone: "success",
      },
      {
        label: "Desempeño 90 días",
        value: "95% promedio",
        detail: "Alta calidad de evidencia y primera reparación.",
        tone: "success",
      },
      {
        label: "Carga del turno",
        value: "1 asignación",
        detail: "Diagnóstico MTR-07 listo para iniciar.",
        tone: "info",
      },
      {
        label: "Certificación",
        value: "4 meses",
        detail: "Requiere programar renovación dentro del trimestre.",
        tone: "warning",
      },
    ],
    insights: [
      {
        tone: "success",
        title: "Perfil óptimo para MTR-07",
        detail: "Skills, experiencia y equipo requerido coinciden con la orden.",
        confidence: 97,
        source: "Entity Profile Engine",
      },
      {
        tone: "warning",
        title: "Certificación próxima",
        detail: "Generar compromiso de renovación para evitar bloqueo futuro.",
        confidence: 94,
        source: "Commitment Engine",
      },
    ],
  },
  "per-diego": {
    personId: "per-diego",
    employeeNumber: "EMP-SLT-0112",
    externalKey: "HCM-200112",
    email: "diego.luna@demo-industrial.mx",
    phone: "+52 844 555 0112",
    hiredAt: "2023-01-16",
    specialty: "Lubricación y transportadores",
    supervisor: "Coordinación Saltillo",
    team: "Mantenimiento mecánico · Turno A",
    competencyScore: 86,
    reliability: 91,
    onTime: 94,
    firstTimeFix: 87,
    completedOrders: 82,
    avgScore: 90,
    profileCompleteness: 88,
    dataConfidence: 86,
    tags: ["Transportadores", "Lubricación", "Alturas", "LOTO"],
    keyFacts: [
      {
        label: "Elegibilidad actual",
        value: "2 protocolos",
        detail: "Habilitado para lubricación, LOTO y trabajo en alturas.",
        tone: "success",
      },
      {
        label: "Desempeño 90 días",
        value: "90% promedio",
        detail: "Cumple tiempos y rangos de consumo configurados.",
        tone: "success",
      },
      {
        label: "Disponibilidad",
        value: "Disponible",
        detail: "Sin órdenes concurrentes en Planta Saltillo.",
        tone: "info",
      },
      {
        label: "Desarrollo",
        value: "1 skill sugerido",
        detail: "Formación en alineación ampliaría su cobertura técnica.",
        tone: "info",
      },
    ],
    insights: [
      {
        tone: "success",
        title: "Cobertura estable en Saltillo",
        detail: "Es el recurso principal para transportadores de Línea 4.",
        confidence: 92,
        source: "Operational Excellence Engine",
      },
      {
        tone: "info",
        title: "Ampliar polivalencia",
        detail: "Agregar alineación mecánica reduciría tiempos de escalamiento.",
        confidence: 81,
        source: "Entity Profile Engine",
      },
    ],
  },
};
