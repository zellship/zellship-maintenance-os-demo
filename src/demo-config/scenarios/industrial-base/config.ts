import { capabilityProfiles } from "../../capabilities";
import { demoScenarioDescriptorSchema } from "../../schema";
import type { DemoScenario, DemoScenarioData } from "../../types";
import { demoNow } from "../../clock";
import { buildScenarioDocuments } from "../../scenarioDocuments";
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
  serviceRequests: [],
  documents: buildScenarioDocuments(seedAssets, seedPeople, demoNow()),
  taxonomy: {
    plants,
    branches,
    operators,
    supervisors,
    categories,
  },
};

const descriptor = demoScenarioDescriptorSchema.parse({
  id: "industrial-base",
  version: "1.2.0",
  sourceBaseline: "f12b7c85ee7ba20ca9df4168c66f4a9765abcccb",
  label: "Industrial maintenance base",
  description:
    "Escenario público de mantenimiento industrial que conserva el baseline auditado MNT-DEMO-BASE-001.",
  capabilityProfile: "full",
  capabilities: capabilityProfiles.full,
  branding: {
    brandName: "Zellship",
    productName: "Zellship Maintenance OS",
    tagline: "Foundational Engines · Industrial Operations",
    metaDescription:
      "Sistema demostrativo de mantenimiento industrial: protocolos, órdenes, operación móvil, evidencias, validación y OEE.",
    socialDescription: "Del protocolo al desempeño del activo en un solo sistema.",
    primaryColor: "#7B35C1",
    primaryColorEnd: "#B57BFF",
    logoPath: "zellship-logo-white.svg",
  },
  context: {
    defaultPlant: "Planta Monterrey",
    plantOptions: ["Planta Monterrey", "Planta Saltillo", "Todas las plantas"],
    terminals: [
      "Planta Monterrey · Terminal 02",
      "Planta Saltillo · Terminal 01",
      "Planta Querétaro · Terminal 03",
    ],
    primaryOperator: "Ana Torres",
    defaultRole: "admin",
    enabledRoles: ["admin", "operator", "supervisor"],
    roleLabels: {
      admin: "Administración",
      operator: "Operación móvil",
      supervisor: "Supervisión",
    },
    loginProfiles: [
      {
        id: "USR-018",
        name: "Ana Torres",
        initials: "AT",
        title: "Técnica de mantenimiento",
        context: "Operación móvil · Planta Monterrey",
        role: "operator",
        color: "#3457F1",
        colorEnd: "#4268F5",
      },
      {
        id: "USR-024",
        name: "Laura Díaz",
        initials: "LD",
        title: "Técnica especialista",
        context: "Diagnóstico y ejecución · Línea 3",
        role: "operator",
        color: "#7046D7",
        colorEnd: "#8458E6",
      },
      {
        id: "USR-006",
        name: "Roberto Salas",
        initials: "RS",
        title: "Supervisor de mantenimiento",
        context: "Validación y liberación de activos",
        role: "supervisor",
        color: "#328653",
        colorEnd: "#419D66",
      },
      {
        id: "USR-001",
        name: "Mónica Reyes",
        initials: "MR",
        title: "Coordinadora de mantenimiento",
        context: "Planeación, recursos y control",
        role: "admin",
        color: "#B85F20",
        colorEnd: "#D17631",
      },
    ],
    reportContacts: [
      {
        id: "maintenance-coordination",
        name: "Coordinación de mantenimiento",
        role: "admin",
        roleLabel: "Administración",
        email: "mantenimiento@demo-industrial.mx",
        whatsapp: "+52 81 5550 0100",
      },
      {
        id: "roberto-salas",
        name: "Roberto Salas",
        role: "supervisor",
        roleLabel: "Supervisor",
        email: "roberto.salas@demo-industrial.mx",
      },
      {
        id: "monica-reyes",
        name: "Mónica Reyes",
        role: "supervisor",
        roleLabel: "Supervisora",
        whatsapp: "+52 81 5550 0162",
      },
      {
        id: "ana-torres",
        name: "Ana Torres",
        role: "operator",
        roleLabel: "Técnica de mantenimiento",
        email: "ana.torres@demo-industrial.mx",
        whatsapp: "+52 81 5550 0184",
      },
    ],
    evidenceAssets: {
      referencePath: "maintenance/compressor-reference.jpg",
      capturedPath: "maintenance/compressor-captured.jpg?v=2",
      subjectLabel: "AC-01",
      guidance: "Busca alineación, tensión uniforme, limpieza y marcas de inspección.",
      aiFindings: [
        "Guardas y componentes visibles",
        "Desgaste leve en borde de banda",
        "Alineación requiere seguimiento",
      ],
      defaultOperatorComment: "Condición operable; programar ajuste en próxima ventana.",
    },
    demoPin: "1234",
  },
  persistence: {
    stateKey: "zellship-maintenance-os-v5",
  },
  distribution: {
    classification: "public-demo",
    containsClientIdentifiableData: false,
  },
});

export const industrialBaseScenario: DemoScenario = {
  ...descriptor,
  data,
};
