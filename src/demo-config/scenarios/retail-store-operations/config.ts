import { capabilityProfiles } from "../../capabilities";
import { demoNow } from "../../clock";
import { buildScenarioDocuments } from "../../scenarioDocuments";
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
  seedStoreAssignments,
  seedSupportCases,
  seedSupportInterventions,
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
  storeAssignments: seedStoreAssignments,
  supportCases: seedSupportCases,
  supportInterventions: seedSupportInterventions,
  documents: buildScenarioDocuments(seedAssets, seedPeople, demoNow()),
  taxonomy: { plants, branches, operators, supervisors, categories },
};

const descriptor = demoScenarioDescriptorSchema.parse({
  id: "retail-store-operations",
  version: "0.1.0",
  sourceBaseline: "ca74d6b7fac34af82972c6eae74cc5534a4440c8",
  label: "Retail store operations",
  description:
    "Escenario público con datos ficticios para operación de tiendas, protocolos y soporte contextual.",
  capabilityProfile: "retail-store-support",
  capabilities: capabilityProfiles["retail-store-support"],
  branding: {
    brandName: "Zellship",
    productName: "Zellship Store Operations",
    tagline: "Retail Operations · Store Support",
    metaDescription:
      "Demostración de operación distribuida de tiendas, soporte interno y atención especializada.",
    socialDescription: "De la apertura de tienda al cierre confirmado de una solicitud de soporte.",
    primaryColor: "#7041DA",
    primaryColorEnd: "#3457E8",
    logoPath: "zellship-logo-white.svg",
  },
  context: {
    defaultPlant: "Boutique Norte",
    locationLabel: "Tienda activa",
    plantOptions: plants,
    terminals: [
      "Boutique Norte · Terminal 02",
      "Boutique Centro · Terminal 01",
      "Centro de soporte · Mesa 03",
    ],
    primaryOperator: "Valeria Santos",
    defaultRole: "admin",
    enabledRoles: ["admin", "operator", "supervisor"],
    roleLabels: {
      admin: "Centro de soporte",
      operator: "Mi tienda",
      supervisor: "Supervisión",
    },
    loginProfiles: [
      {
        id: "USR-RTL-021",
        name: "Valeria Santos",
        initials: "VS",
        title: "Responsable de tienda",
        context: "Operación diaria · Boutique Norte",
        role: "operator",
        color: "#3457E8",
        colorEnd: "#5272ED",
      },
      {
        id: "USR-RTL-005",
        name: "Laura Mendoza",
        initials: "LM",
        title: "Supervisora de operaciones",
        context: "Cumplimiento y experiencia de tiendas",
        role: "supervisor",
        color: "#278A52",
        colorEnd: "#42A36A",
      },
      {
        id: "USR-RTL-001",
        name: "Elena Ríos",
        initials: "ER",
        title: "Coordinadora de soporte a tiendas",
        context: "Triage, diagnóstico y proveedores",
        role: "admin",
        color: "#7041DA",
        colorEnd: "#8B5BEF",
      },
    ],
    reportContacts: [
      {
        id: "support-center",
        name: "Centro de soporte",
        role: "admin",
        roleLabel: "Soporte interno",
        email: "soporte@retail-demo.example",
        whatsapp: "+52 81 5550 0240",
      },
      {
        id: "operations-supervision",
        name: "Laura Mendoza",
        role: "supervisor",
        roleLabel: "Supervisión de tiendas",
        email: "supervision@retail-demo.example",
      },
    ],
    evidenceAssets: {
      referencePath: "og.png",
      capturedPath: "og.png",
      subjectLabel: "Boutique Norte",
      guidance: "Captura el área sin incluir clientes, pagos o información personal.",
      aiFindings: [
        "Área de tienda vinculada a la asignación",
        "Evidencia temporal disponible",
        "Validación humana requerida antes del cierre",
      ],
      defaultOperatorComment: "Evidencia registrada desde el protocolo operativo de la tienda.",
    },
    demoPin: "1234",
  },
  persistence: { stateKey: "zellship-store-operations-retail-v1" },
  distribution: {
    classification: "public-demo",
    containsClientIdentifiableData: false,
  },
});

export const retailStoreOperationsScenario: DemoScenario = { ...descriptor, data };
