import {
  technicianProfiles as baselineTechnicianProfiles,
  type TechnicianProfileDefinition,
} from "../../demo-config/scenarios/industrial-base/resourceProfiles";
import { activeDemo } from "../../demo-config/active";
import { seedPeople } from "../seed";

export type { TechnicianProfileDefinition } from "../../demo-config/scenarios/industrial-base/resourceProfiles";

function genericProfile(personId: string): TechnicianProfileDefinition {
  const person = seedPeople.find((candidate) => candidate.id === personId) ?? seedPeople[0];
  const supervisor =
    activeDemo.context.loginProfiles.find((profile) => profile.role === "supervisor")?.name ??
    "Supervisión";
  return {
    personId: person.id,
    employeeNumber: `EMP-${person.id.toUpperCase()}`,
    externalKey: `${activeDemo.id.toUpperCase()}-${person.id}`,
    email: `${person.name.toLowerCase().replaceAll(" ", ".")}@demo.example`,
    phone: "+52 81 5550 0100",
    hiredAt: "2022-02-14",
    specialty: "Operación de mantenimiento en campo",
    supervisor,
    team: `${person.plant} · ${person.shift}`,
    competencyScore: 92,
    reliability: 94,
    onTime: 93,
    firstTimeFix: 90,
    completedOrders: 84,
    avgScore: 93,
    profileCompleteness: 90,
    dataConfidence: 91,
    tags: ["Operación móvil", "Perfil simulado", ...person.skillIds.slice(0, 2)],
    keyFacts: [
      {
        label: "Elegibilidad actual",
        value: `${person.skillIds.length} skills`,
        detail: "Las capacidades se validan contra el protocolo antes de asignar.",
        tone: "success",
      },
      {
        label: "Disponibilidad",
        value: person.status,
        detail: `${person.plant} · turno ${person.shift}`,
        tone: person.status === "OffShift" ? "warning" : "info",
      },
      {
        label: "Calidad de ejecución",
        value: "93%",
        detail: "Indicador ficticio para esta demostración.",
        tone: "success",
      },
      {
        label: "Certificación",
        value: person.certificationValidUntil ?? "Sin vencimiento",
        detail: "Vigencia usada por la validación de asignación.",
        tone: "info",
      },
    ],
    insights: [
      {
        tone: "info",
        title: "Perfil operativo configurable",
        detail: "Skills, vigencias y contexto se adaptarían durante la implementación.",
        confidence: 91,
        source: "Datos simulados",
      },
    ],
  };
}

export const technicianProfiles: Record<string, TechnicianProfileDefinition> = new Proxy(
  baselineTechnicianProfiles,
  {
    get(target, property: string) {
      return target[property] ?? genericProfile(property);
    },
  },
);
