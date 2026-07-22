export type Role = "admin" | "operator" | "supervisor";

export type ProtocolStatus = "Draft" | "Active" | "Inactive" | "Archived";
export type ScheduleStatus = "Pending" | "InProgress" | "Completed" | "Expired" | "Cancelled";
export type ExecutionStatus = "InProgress" | "Completed" | "PendingValidation" | "Validated" | "Rejected";
export type EvidenceType = "Photo" | "Video" | "Signature" | "GPS" | "QR" | "Timestamp" | "File";
export type EvidenceStatus = "Pending" | "Valid" | "Invalid";
export type IncidentType = "NotExecuted" | "LateExecution" | "InvalidEvidence" | "Rejected" | "Escalated";
export type IncidentStatus = "Open" | "Review" | "Resolved" | "Closed";

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
