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
  id: "atm-field-service",
  version: "0.4.1",
  sourceBaseline: "ae475d5cac324f59ee654c2b2db1825bbdc9de60",
  label: "ATM field service",
  description:
    "Escenario público con datos ficticios para recepción, programación, ejecución y cierre de mantenimiento de ATM.",
  capabilityProfile: "execution-only",
  capabilities: capabilityProfiles["execution-only"],
  branding: {
    brandName: "Zellship",
    productName: "Zellship Maintenance OS",
    tagline: "Field Service · ATM Operations",
    metaDescription:
      "Demostración configurada para mantenimiento preventivo y correctivo de cajeros automáticos.",
    socialDescription: "De la recepción del servicio al reporte operativo en un solo sistema.",
    primaryColor: "#7041DA",
    primaryColorEnd: "#3457E8",
    logoPath: "zellship-logo-white.svg",
  },
  context: {
    defaultPlant: "Región Norte",
    plantOptions: ["Región Norte", "Región Poniente", "Región Oriente"],
    terminals: [
      "Región Norte · Coordinación 01",
      "Región Poniente · Coordinación 02",
      "Región Oriente · Coordinación 03",
    ],
    primaryOperator: "Luis Campos",
    defaultRole: "admin",
    enabledRoles: ["admin", "operator", "supervisor"],
    roleLabels: {
      admin: "Coordinación",
      operator: "Operación móvil",
      supervisor: "Supervisión",
    },
    loginProfiles: [
      {
        id: "USR-ATM-041",
        name: "Luis Campos",
        initials: "LC",
        title: "Técnico de campo",
        context: "Operación móvil · Región Norte",
        role: "operator",
        color: "#3457E8",
        colorEnd: "#5272ED",
      },
      {
        id: "USR-ATM-012",
        name: "Sofía Vega",
        initials: "SV",
        title: "Supervisora de servicio",
        context: "Validación y control de calidad",
        role: "supervisor",
        color: "#278A52",
        colorEnd: "#42A36A",
      },
      {
        id: "USR-ATM-001",
        name: "Marina Ortega",
        initials: "MO",
        title: "Coordinadora de servicios",
        context: "Recepción, programación y cierre",
        role: "admin",
        color: "#7041DA",
        colorEnd: "#8B5BEF",
      },
    ],
    reportContacts: [
      {
        id: "bank-operations",
        name: "Operación bancaria de demostración",
        role: "admin",
        roleLabel: "Cliente externo simulado",
        email: "operacion@banco-demo.example",
        whatsapp: "+52 81 5550 0104",
      },
      {
        id: "marina-ortega",
        name: "Marina Ortega",
        role: "admin",
        roleLabel: "Coordinación",
        email: "marina.ortega@atlas-demo.example",
      },
      {
        id: "sofia-vega",
        name: "Sofía Vega",
        role: "supervisor",
        roleLabel: "Supervisión",
        email: "sofia.vega@atlas-demo.example",
      },
    ],
    evidenceAssets: {
      referencePath: "maintenance/atm-reference.svg",
      capturedPath: "maintenance/atm-field-after.jpg",
      subjectLabel: "ATM-014",
      guidance:
        "Incluye identificador, frente completo, condición del acabado y referencia visible del sitio.",
      aiFindings: [
        "ATM e identificador visibles",
        "Encuadre compatible con la referencia",
        "Acabado exterior requiere seguimiento",
      ],
      defaultOperatorComment:
        "Se completó el ajuste y la evidencia final corresponde al sitio asignado.",
    },
    demoPin: "1234",
  },
  persistence: { stateKey: "zellship-maintenance-os-atm-v2" },
  distribution: {
    classification: "public-demo",
    containsClientIdentifiableData: false,
  },
});

export const atmFieldServiceScenario: DemoScenario = { ...descriptor, data };
