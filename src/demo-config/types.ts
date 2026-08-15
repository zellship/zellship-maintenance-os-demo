import type {
  Asset,
  Execution,
  Incident,
  InventoryItem,
  MaintenanceTool,
  Notification,
  OperationalFlow,
  Person,
  Protocol,
  ResourceReservation,
  Role,
  Schedule,
  ServiceRequest,
  Skill,
} from "../ove/types";
import type { CapabilityProfileId, DemoCapabilityId } from "./capabilities";

export type LoginProfile = {
  id: string;
  name: string;
  initials: string;
  title: string;
  context: string;
  role: Role;
  color: string;
  colorEnd: string;
};

export type DemoScenarioData = {
  assets: Asset[];
  skills: Skill[];
  people: Person[];
  tools: MaintenanceTool[];
  inventory: InventoryItem[];
  protocols: Protocol[];
  schedules: Schedule[];
  reservations: ResourceReservation[];
  executions: Execution[];
  incidents: Incident[];
  notifications: Notification[];
  operationalFlows: OperationalFlow[];
  serviceRequests: ServiceRequest[];
  taxonomy: {
    plants: string[];
    branches: string[];
    operators: string[];
    supervisors: string[];
    categories: string[];
  };
};

export type DemoScenario = {
  id: string;
  version: string;
  sourceBaseline: string;
  label: string;
  description: string;
  capabilityProfile: CapabilityProfileId;
  capabilities: DemoCapabilityId[];
  branding: {
    brandName: string;
    productName: string;
    tagline: string;
    metaDescription: string;
    socialDescription: string;
    primaryColor: string;
    primaryColorEnd: string;
    logoPath: string;
  };
  context: {
    defaultPlant: string;
    plantOptions: string[];
    terminals: string[];
    primaryOperator: string;
    defaultRole: Role;
    enabledRoles: Role[];
    roleLabels: Record<Role, string>;
    loginProfiles: LoginProfile[];
    reportContacts: Array<{
      id: string;
      name: string;
      role: Role;
      roleLabel: string;
      email?: string;
      whatsapp?: string;
    }>;
    evidenceAssets: {
      referencePath: string;
      capturedPath: string;
      subjectLabel: string;
      guidance: string;
      aiFindings: string[];
      defaultOperatorComment: string;
    };
    demoPin: string;
  };
  persistence: {
    stateKey: string;
  };
  distribution: {
    classification: "public-demo" | "restricted-client-demo";
    containsClientIdentifiableData: boolean;
  };
  data: DemoScenarioData;
};
