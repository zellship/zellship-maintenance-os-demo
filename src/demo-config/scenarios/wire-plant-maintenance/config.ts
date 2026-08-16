import { capabilityProfiles } from "../../capabilities";
import { demoScenarioDescriptorSchema } from "../../schema";
import type { DemoScenario, DemoScenarioData } from "../../types";
import {
  branches,
  categories,
  operators,
  plants,
  seedAssets,
  seedExecutions,
  seedIncidents,
  seedInventory,
  seedNotifications,
  seedOperationalFlows,
  seedPeople,
  seedProtocols,
  seedReservations,
  seedSchedules,
  seedServiceRequests,
  seedSkills,
  seedTools,
  supervisors,
} from "./data";

const data: DemoScenarioData = {
  assets: seedAssets,
  skills: seedSkills,
  people: seedPeople,
  tools: seedTools,
  inventory: seedInventory,
  protocols: seedProtocols,
  schedules: seedSchedules,
  reservations: seedReservations,
  executions: seedExecutions,
  incidents: seedIncidents,
  notifications: seedNotifications,
  operationalFlows: seedOperationalFlows,
  serviceRequests: seedServiceRequests,
  taxonomy: { plants, branches, operators, supervisors, categories },
};

const descriptor = demoScenarioDescriptorSchema.parse({
  id: "wire-plant-maintenance",
  version: "0.1.0",
  sourceBaseline: "ae475d5cac324f59ee654c2b2db1825bbdc9de60",
  label: "Wire plant maintenance",
  description:
    "Escenario público neutral con datos demostrativos para mantenimiento de equipos en una planta de alambres.",
  capabilityProfile: "industrial-maintenance",
  capabilities: capabilityProfiles["industrial-maintenance"],
  branding: {
    brandName: "Zellship",
    productName: "Zellship Maintenance OS",
    tagline: "Mantenimiento industrial · Equipos y operaciones",
    metaDescription:
      "Demostración neutral para control, ejecución y validación del mantenimiento de equipos industriales.",
    socialDescription: "Del reporte de condición a la liberación supervisada del equipo.",
    primaryColor: "#7041DA",
    primaryColorEnd: "#3457E8",
    logoPath: "zellship-logo-white.svg",
  },
  context: {
    defaultPlant: "Planta de Alambres",
    plantOptions: ["Planta de Alambres"],
    terminals: ["Planta de Alambres · Coordinación de mantenimiento"],
    primaryOperator: "Eduardo Morales",
    defaultRole: "admin",
    enabledRoles: ["admin", "operator", "supervisor"],
    roleLabels: {
      admin: "Coordinación de mantenimiento",
      operator: "Operación técnica",
      supervisor: "Supervisión de mantenimiento",
    },
    loginProfiles: [
      {
        id: "USR-ALM-014",
        name: "Eduardo Morales",
        initials: "EM",
        title: "Técnico electromecánico",
        context: "Operación técnica · Planta de Alambres",
        role: "operator",
        color: "#3457E8",
        colorEnd: "#5272ED",
      },
      {
        id: "USR-ALM-003",
        name: "Miguel Salas",
        initials: "MS",
        title: "Técnico maestro",
        context: "Validación y liberación de equipos",
        role: "supervisor",
        color: "#278A52",
        colorEnd: "#42A36A",
      },
      {
        id: "USR-ALM-001",
        name: "Marina Ortega",
        initials: "MO",
        title: "Coordinadora de mantenimiento",
        context: "Planeación, recursos y control",
        role: "admin",
        color: "#7041DA",
        colorEnd: "#8B5BEF",
      },
    ],
    reportContacts: [
      {
        id: "plant-responsible",
        name: "Responsable de planta",
        role: "admin",
        roleLabel: "Responsable de planta · contacto demostrativo",
        email: "responsable@planta-demo.example",
      },
      {
        id: "maintenance-coordination",
        name: "Marina Ortega",
        role: "admin",
        roleLabel: "Coordinación de mantenimiento",
        email: "mantenimiento@planta-demo.example",
      },
      {
        id: "maintenance-supervision",
        name: "Miguel Salas",
        role: "supervisor",
        roleLabel: "Supervisión de mantenimiento",
        email: "supervision@planta-demo.example",
      },
    ],
    evidenceAssets: {
      referencePath: "maintenance/wire-drawing-before.jpg",
      capturedPath: "maintenance/wire-drawing-after.jpg",
      subjectLabel: "TRF-03",
      guidance:
        "Incluye el equipo, la condición de guardas y suficiente contexto para asociar la evidencia a la orden.",
      aiFindings: [
        "Activo visible en la evidencia demostrativa",
        "Secuencia antes, durante y después completa",
        "Condición final pendiente de validación humana",
      ],
      defaultOperatorComment:
        "Inspección y ajuste demostrativos concluidos; se solicita validación para liberar el equipo.",
    },
    demoPin: "1234",
  },
  persistence: { stateKey: "zellship-maintenance-os-wire-plant-v1" },
  distribution: {
    classification: "public-demo",
    containsClientIdentifiableData: false,
  },
});

export const wirePlantMaintenanceScenario: DemoScenario = { ...descriptor, data };
