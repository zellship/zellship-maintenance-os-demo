import { activeDemo } from "../../demo-config/active";

export const maintenanceReferenceUrl = `${import.meta.env.BASE_URL}${activeDemo.context.evidenceAssets.referencePath}`;
export const maintenanceCapturedUrl = `${import.meta.env.BASE_URL}${activeDemo.context.evidenceAssets.capturedPath}`;
export const maintenanceSubjectLabel = activeDemo.context.evidenceAssets.subjectLabel;
export const maintenanceEvidenceGuidance = activeDemo.context.evidenceAssets.guidance;
export const maintenanceAiFindings = activeDemo.context.evidenceAssets.aiFindings;
export const maintenanceDefaultOperatorComment =
  activeDemo.context.evidenceAssets.defaultOperatorComment;

export function maintenanceAssetUrl(path?: string) {
  if (!path || path.includes("://")) return undefined;
  if (path.startsWith(import.meta.env.BASE_URL)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
