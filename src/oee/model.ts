export const OEE_STORAGE_KEY = "zellship-oee-hub-v1";

export const demoStates = [
  "Programada",
  "Asignada",
  "Preparada",
  "En ejecución",
  "Pendiente de validación",
  "Corrección requerida",
  "En corrección",
  "Pendiente de validación",
  "Cerrada",
] as const;

export type DemoState = (typeof demoStates)[number];

export type DemoStageId =
  | "activation"
  | "activation-handoff"
  | "preparation"
  | "inspection-start"
  | "execution"
  | "finding"
  | "finding-handoff"
  | "review-one"
  | "correction-start"
  | "correction"
  | "comparison"
  | "closure"
  | "summary";

export interface DemoStage {
  id: DemoStageId;
  moment: 1 | 2 | 3 | 4 | 5 | 6;
  state: DemoState;
  actor: "Coordinador operativo" | "Responsable de ejecución" | "Supervisor o validador";
  actorName: "Alex Romero" | "Daniela Cruz" | "Samuel Vega";
  title: string;
  description: string;
  primaryAction: string | null;
}

export const demoStages: readonly DemoStage[] = [
  {
    id: "activation",
    moment: 1,
    state: "Programada",
    actor: "Coordinador operativo",
    actorName: "Alex Romero",
    title: "Activación",
    description: "Confirma que el caso tiene contexto suficiente para iniciar su recorrido.",
    primaryAction: "Activar y asignar",
  },
  {
    id: "activation-handoff",
    moment: 1,
    state: "Asignada",
    actor: "Coordinador operativo",
    actorName: "Alex Romero",
    title: "Asignación registrada",
    description:
      "La activación quedó registrada como evento y la responsabilidad ya está definida.",
    primaryAction: "Continuar como responsable de ejecución",
  },
  {
    id: "preparation",
    moment: 2,
    state: "Asignada",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Contexto y preparación",
    description: "Revisa objetivo, ubicación, ventana, recursos y criterio antes de comenzar.",
    primaryAction: "Confirmar preparación",
  },
  {
    id: "inspection-start",
    moment: 2,
    state: "Preparada",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Preparación confirmada",
    description: "Las condiciones demostrativas están completas y el protocolo puede iniciar.",
    primaryAction: "Iniciar inspección",
  },
  {
    id: "execution",
    moment: 3,
    state: "En ejecución",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Ejecución guiada",
    description:
      "El protocolo conserva criterios y respuestas dentro del mismo contexto operativo.",
    primaryAction: "Registrar hallazgo",
  },
  {
    id: "finding",
    moment: 4,
    state: "En ejecución",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Hallazgo y evidencia",
    description: "Documenta la desviación y liga la condición inicial al paso que la originó.",
    primaryAction: "Enviar a validación",
  },
  {
    id: "finding-handoff",
    moment: 4,
    state: "Pendiente de validación",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Paquete enviado",
    description: "Revisión 1 conserva evidencia, comentario, actor, caso y momento simulado.",
    primaryAction: "Continuar como supervisor",
  },
  {
    id: "review-one",
    moment: 5,
    state: "Pendiente de validación",
    actor: "Supervisor o validador",
    actorName: "Samuel Vega",
    title: "Validación · Revisión 1",
    description: "La evidencia no demuestra el criterio de área despejada y requiere corrección.",
    primaryAction: "Solicitar corrección",
  },
  {
    id: "correction-start",
    moment: 5,
    state: "Corrección requerida",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Devolución recibida",
    description: "La razón y la instrucción permanecen vinculadas a la primera revisión.",
    primaryAction: "Iniciar corrección",
  },
  {
    id: "correction",
    moment: 5,
    state: "En corrección",
    actor: "Responsable de ejecución",
    actorName: "Daniela Cruz",
    title: "Corrección documentada",
    description: "El área fue despejada y se preparó una segunda evidencia del mismo caso.",
    primaryAction: "Reenviar corrección",
  },
  {
    id: "comparison",
    moment: 5,
    state: "Pendiente de validación",
    actor: "Supervisor o validador",
    actorName: "Samuel Vega",
    title: "Comparación de revisiones",
    description:
      "La condición corregida responde a la instrucción sin perder la evidencia inicial.",
    primaryAction: "Continuar a decisión final",
  },
  {
    id: "closure",
    moment: 6,
    state: "Pendiente de validación",
    actor: "Supervisor o validador",
    actorName: "Samuel Vega",
    title: "Resultado y cierre",
    description: "La corrección demuestra el criterio del protocolo simulado.",
    primaryAction: "Aprobar y cerrar",
  },
  {
    id: "summary",
    moment: 6,
    state: "Cerrada",
    actor: "Supervisor o validador",
    actorName: "Samuel Vega",
    title: "Ubicación habilitada",
    description: "El caso concluyó conforme al protocolo demostrativo y conserva ambas revisiones.",
    primaryAction: null,
  },
] as const;

export const initialDemoStage: DemoStageId = "activation";

export function isDemoStageId(value: unknown): value is DemoStageId {
  return typeof value === "string" && demoStages.some((stage) => stage.id === value);
}

export function getDemoStage(id: DemoStageId): DemoStage {
  return demoStages.find((stage) => stage.id === id) ?? demoStages[0];
}

export function advanceDemoStage(id: DemoStageId): DemoStageId {
  const currentIndex = demoStages.findIndex((stage) => stage.id === id);
  return demoStages[Math.min(currentIndex + 1, demoStages.length - 1)].id;
}

export function stateSequence(): DemoState[] {
  return demoStages.reduce<DemoState[]>((states, stage) => {
    if (states.at(-1) !== stage.state) states.push(stage.state);
    return states;
  }, []);
}
