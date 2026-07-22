export type Role = "admin" | "operator" | "supervisor";

export type ProtocolStatus = "Draft" | "Active" | "Inactive" | "Archived";
export type ScheduleStatus = "Pending" | "InProgress" | "Completed" | "Expired" | "Cancelled";
export type ExecutionStatus = "InProgress" | "Completed" | "PendingValidation" | "Validated" | "Rejected";
export type EvidenceType = "Photo" | "Video" | "Signature" | "GPS" | "QR" | "Timestamp" | "File";
export type EvidenceStatus = "Pending" | "Valid" | "Invalid";
export type IncidentType = "NotExecuted" | "LateExecution" | "InvalidEvidence" | "Rejected" | "Escalated";
export type IncidentStatus = "Open" | "Review" | "Resolved" | "Closed";
export type ResourceStatus = "Available" | "Reserved" | "InUse" | "Calibration" | "Unavailable";
export type ConsumptionMode = "Exact" | "Range" | "Variable";

export interface FormField {
  id: string;
  type: "text" | "textarea" | "number" | "yesno" | "select" | "multiselect" | "rating" | "comment" | "date" | "separator";
  label: string;
  required?: boolean;
  options?: string[];
}

export interface EvidenceConfig {
  type: EvidenceType;
  required: boolean;
  minCount?: number;
  radius?: number;
  qrCode?: string;
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: ProtocolStatus;
  branches: string[];
  recurrence: "Once" | "Daily" | "Weekly" | "Monthly" | "Custom";
  schedule: { hour: string; tolerance: number }[];
  evidenceConfig: EvidenceConfig[];
  formConfig: FormField[];
  supervisors: string[];
  operators: string[];
  channels: ("System" | "WhatsApp" | "SMS")[];
  preAlertMinutes: number;
  requiresValidation: boolean;
  lastExecution?: string;
  assetIds?: string[];
  materials?: string[];
  safetyInstructions?: string[];
  estimatedMinutes?: number;
  allowRescheduling?: boolean;
  requiredSkillIds?: string[];
  requiredToolIds?: string[];
  materialRequirements?: MaterialRequirement[];
}

export interface Skill {
  id: string;
  name: string;
  category: "Technical" | "Safety" | "Certification";
}

export interface Person {
  id: string;
  name: string;
  role: "Technician" | "Supervisor";
  plant: string;
  shift: "Morning" | "Afternoon" | "Night";
  skillIds: string[];
  certificationValidUntil?: string;
  status: "Available" | "Assigned" | "OffShift";
}

export interface MaintenanceTool {
  id: string;
  name: string;
  serial: string;
  plant: string;
  location: string;
  status: ResourceStatus;
  calibrationValidUntil?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  plant: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  quarantine: number;
  reorderPoint: number;
}

export interface MaterialRequirement {
  inventoryItemId: string;
  mode: ConsumptionMode;
  quantity?: number;
  min?: number;
  max?: number;
}

export interface MaterialAllocation extends MaterialRequirement {
  reservedQuantity: number;
  actualQuantity?: number;
}

export interface ResourceReservation {
  id: string;
  scheduleId: string;
  resourceType: "Asset" | "Person" | "Tool" | "Material";
  resourceId: string;
  startAt: string;
  endAt: string;
  quantity?: number;
  status: "Reserved" | "InUse" | "Released" | "Cancelled";
}

export interface Schedule {
  id: string;
  protocolId: string;
  date: string;
  hour: string;
  tolerance: number;
  operator: string;
  status: ScheduleStatus;
  assetId?: string;
  plant?: string;
  workOrder?: string;
  toolIds?: string[];
  materialAllocations?: MaterialAllocation[];
  eligibilityValidated?: boolean;
}

export interface EvidenceRecord {
  id: string;
  executionId: string;
  type: EvidenceType;
  data: string;
  gps?: { lat: number; lng: number };
  timestamp: string;
  status: EvidenceStatus;
}

export interface Execution {
  id: string;
  scheduleId: string;
  protocolId: string;
  startAt: string;
  endAt?: string;
  operator: string;
  status: ExecutionStatus;
  evidences: EvidenceRecord[];
  formAnswers: Record<string, unknown>;
  approval?: { supervisor: string; decision: "Approved" | "Rejected"; comments: string; at: string };
  score?: number;
  toolIds?: string[];
  materialConsumptions?: MaterialAllocation[];
  resourceCheckInAt?: string;
}

export interface Asset {
  id: string;
  name: string;
  family: string;
  plant: string;
  area: string;
  criticality: "Low" | "Medium" | "High" | "Critical";
  status: "Available" | "Maintenance" | "Risk";
  availability: number;
  health: number;
  runtimeHours: number;
  lastService: string;
}

export interface Incident {
  id: string;
  executionId?: string;
  scheduleId?: string;
  protocolId: string;
  type: IncidentType;
  status: IncidentStatus;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "PreviousAlert" | "Expiration" | "Incident" | "ValidationRequired" | "Escalation";
  channel: "System" | "WhatsApp" | "SMS";
  actor: string;
  message: string;
  status: "Sent" | "Read";
  createdAt: string;
}
