import {
  assetProfiles as baselineAssetProfiles,
  type AssetProfileDefinition,
} from "../../demo-config/scenarios/industrial-base/assetProfiles";
import { activeDemo } from "../../demo-config/active";
import { seedAssets } from "../seed";

export type {
  AssetInsight,
  AssetKeyFact,
  AssetProfileDefinition,
  AssetRelationship,
} from "../../demo-config/scenarios/industrial-base/assetProfiles";

function genericProfile(assetId: string): AssetProfileDefinition {
  const asset = seedAssets.find((candidate) => candidate.id === assetId) ?? seedAssets[0];
  return {
    assetId: asset.id,
    externalKey: `${activeDemo.id.toUpperCase()}-${asset.id}`,
    assetTag: `TAG-${asset.id}`,
    manufacturer: "Información de demostración",
    model: asset.family,
    serial: `SIM-${asset.id}`,
    installedAt: "2022-01-15",
    owner: "Operación de servicio",
    costCenter: "Contexto simulado",
    profileCompleteness: 88,
    dataConfidence: 90,
    energySource: "Configuración del activo",
    controlSystem: "Maintenance OS",
    dataSources: ["Maintenance OS", "Datos simulados"],
    tags: [asset.family, asset.criticality, asset.status],
    keyFacts: [
      {
        label: "Estado operativo",
        value: asset.status,
        detail: `Disponibilidad registrada: ${asset.availability}%.`,
        tone: asset.status === "Risk" ? "warning" : "success",
      },
      {
        label: "Ubicación",
        value: asset.plant,
        detail: asset.area,
        tone: "info",
      },
      {
        label: "Último servicio",
        value: new Date(asset.lastService).toLocaleDateString("es-MX"),
        detail: "Información generada para esta demostración.",
        tone: "info",
      },
      {
        label: "Preparación",
        value: "Contexto disponible",
        detail: "Protocolos y recursos vinculados en Maintenance OS.",
        tone: "success",
      },
    ],
    relationships: [
      {
        type: "Location",
        name: `${asset.plant} · ${asset.area}`,
        relation: "Ubicación operacional",
        status: "Activa",
      },
      {
        type: "System",
        name: "Maintenance OS",
        relation: "Fuente de contexto",
        status: "Demo",
      },
    ],
    insights: [
      {
        tone: "info",
        title: "Perfil configurable",
        detail: "La identidad, relaciones y metadata se adaptarían durante la implementación.",
        confidence: 90,
        source: "Datos simulados",
      },
    ],
  };
}

export const assetProfiles: Record<string, AssetProfileDefinition> = new Proxy(
  baselineAssetProfiles,
  {
    get(target, property: string) {
      return target[property] ?? genericProfile(property);
    },
  },
);
