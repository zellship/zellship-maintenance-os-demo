import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck2,
  Layers3,
  MapPin,
  Play,
  RotateCcw,
  Route,
  ShieldCheck,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import evidenceCorrected from "./assets/evidence-condition-corrected.jpg";
import evidenceInitial from "./assets/evidence-condition-initial.jpg";
import zellshipLogo from "./assets/zellship-logo-white.svg";
import {
  OEE_STORAGE_KEY,
  advanceDemoStage,
  getDemoStage,
  initialDemoStage,
  isDemoStageId,
  type DemoStage,
  type DemoStageId,
} from "./model";

type RouteName = "hub" | "presentation" | "demo" | "proposal";

const routeLabels: Record<RouteName, string> = {
  hub: "Experience Hub",
  presentation: "Presentación",
  demo: "Demo guiada",
  proposal: "Propuesta",
};

const presentationSlides = [
  {
    eyebrow: "01 · REALIDAD OPERATIVA",
    title: "La operación real nunca ocurre exactamente como fue planeada.",
    body: "Cambios de prioridad, condiciones locales, recursos disponibles y excepciones modifican cómo debe actuarse.",
    cta: "Ver dónde se fragmenta",
    visual: ["Intención", "Contexto", "Excepción", "Decisión"],
  },
  {
    eyebrow: "02 · FRAGMENTACIÓN",
    title: "El riesgo aparece en los espacios entre la intención y el resultado.",
    body: "La tarea se asigna sin contexto, la evidencia llega aislada y el cierre pierde el razonamiento que lo hizo aceptable.",
    cta: "Entender el diagnóstico",
    visual: ["Intención", "Contexto", "Ejecución", "Evidencia", "Decisión"],
  },
  {
    eyebrow: "03 · DIAGNÓSTICO",
    title: "Gestionar tareas no equivale a gobernar ejecución.",
    body: "Debe ser simple para quien opera y robusto en contexto, estados, protocolos, evidencia, autoridad y trazabilidad.",
    cta: "Conocer la arquitectura base",
    visual: [
      "Tarea → acción",
      "Protocolo → criterio",
      "Adjunto → evidencia ligada",
      "Terminado → resultado validado",
    ],
  },
  {
    eyebrow: "04 · BUSINESS OS",
    title: "Una arquitectura base para conectar intención, contexto y operación.",
    body: "OEE se ubica dentro de una arquitectura objetivo que relaciona estrategia, entidades, comportamiento y experiencia.",
    cta: "Entrar a Operation Execution Engine",
    visual: [
      "Strategic",
      "Context",
      "Entity",
      "Engine · OEE",
      "Intelligence",
      "Automation",
      "Experience",
      "Workspace",
    ],
    disclosure: "Arquitectura objetivo; la demo no representa integraciones productivas.",
  },
  {
    eyebrow: "05 · OPERATION EXECUTION ENGINE",
    title: "De la activación al cierre, sin perder el contexto.",
    body: "Se orienta a alcanzar un resultado operativo definido y verificable conforme a criterios de aceptación acordados, no sólo a habilitar funciones.",
    cta: "Ver sus capacidades",
    visual: ["Activar", "Preparar", "Ejecutar", "Evidenciar", "Validar", "Corregir", "Cerrar"],
  },
  {
    eyebrow: "06 · CAPACIDADES",
    title: "Una ejecución más consistente. Una operación mejor preparada para evolucionar.",
    body: "OEE está diseñado para operar donde sucede el trabajo, no sólo desde un escritorio. Parte de infraestructura cotidiana, como un celular con conexión, sin requerir equipamiento especializado para el escenario base.",
    cta: "Explorar dónde puede aplicar",
    visual: [
      "Contexto conservado",
      "Compromisos visibles",
      "Evidencia vinculada",
      "Autoridad de cierre",
      "Revisiones comparables",
    ],
    disclosure: "Beneficios esperados sujetos a baseline y medición.",
  },
  {
    eyebrow: "07 · APLICABILIDAD",
    title: "Un patrón operativo que puede adaptarse a distintos contextos.",
    body: "La solución se adapta a la operación dentro de un alcance diseñado y aprobado; esto no significa personalización ilimitada.",
    cta: "Ver el caso general",
    visual: [
      "Ubicaciones distribuidas",
      "Servicio en campo",
      "Inspección y calidad",
      "Mantenimiento",
      "Recepción y entrega",
      "Apertura y relevo",
    ],
  },
  {
    eyebrow: "08 · FUTURO POSIBLE",
    title: "Una base para aprender, automatizar y evolucionar con control.",
    body: "Con datos, reglas e integraciones adecuadas, la arquitectura puede incorporar señales, recomendaciones, medición y activaciones por eventos.",
    cta: "Ver la operación en acción",
    visual: ["Señales", "Reglas", "Recomendaciones", "Integraciones", "Medición"],
    disclosure:
      "No se presenta como SaaS autoadministrable de activación inmediata ni como desarrollo indefinido.",
  },
] as const;

const methodology = [
  {
    number: "01",
    title: "Alinear la operación",
    output: "Anteproyecto Operativo",
    body: "Comprender problema, actores, estados, evidencia, excepciones y prioridades.",
    decision: "Acordar el resultado operativo y el alcance que merece diseñarse.",
  },
  {
    number: "02",
    title: "Diseñar la solución",
    output: "Proyecto Ejecutivo de Solución",
    body: "Definir protocolos, flujos, estados, excepciones, evidencias, formatos, reportes, roles, restricciones e integraciones.",
    decision: "Autorizar solución, alcance y plan de implementación.",
  },
  {
    number: "03",
    title: "Construir y validar",
    output: "Capacidades funcionando y validadas progresivamente",
    body: "Configurar, desarrollar, integrar y comprobar progresivamente el alcance aprobado.",
    decision: "Confirmar que las capacidades cumplen los criterios acordados.",
  },
  {
    number: "04",
    title: "Activar y acompañar",
    output: "Solución implementada, usuarios preparados, piloto y acompañamiento",
    body: "Preparar usuarios, activar el piloto y acompañar la adopción dentro del alcance aprobado.",
    decision: "Llevar la solución validada a la operación.",
  },
] as const;

const prerequisites = [
  ["Resultado y alcance", "Problema, resultado, población y ubicaciones."],
  ["Operación actual", "Proceso, volumen, frecuencia, actores y estandarización."],
  ["Control", "Estados, excepciones, evidencia, autoridades y cierre."],
  ["Ecosistema", "Sistemas, datos, integraciones y propietarios."],
  ["Restricciones", "Conectividad, dispositivos, seguridad, privacidad y cumplimiento."],
  ["Éxito", "Baseline, indicadores, piloto y criterios de aceptación."],
] as const;

export function OeeHubApp() {
  const route = getRouteName(window.location.pathname);

  useEffect(() => {
    document.title = `${routeLabels[route]} · OEE · Zellship`;
  }, [route]);

  if (route === "presentation") return <PresentationPage />;
  if (route === "demo") return <DemoPage />;
  if (route === "proposal") return <ProposalPage />;
  return <HubPage />;
}

function HubPage() {
  return (
    <div className="oee-page oee-hub-page">
      <OeeHeader route="hub" inverse />
      <main className="oee-hub-main">
        <section className="oee-hub-copy" aria-labelledby="hub-title">
          <p className="oee-eyebrow oee-eyebrow-light">ZELLSHIP · OEE EXPERIENCE HUB</p>
          <h1 id="hub-title">Diseñamos la operación para llevarla a un resultado.</h1>
          <p className="oee-hero-definition">
            Operation Execution Engine convierte una intención operativa en una ejecución guiada y
            contextual, hasta un resultado operativo definido y verificable conforme a criterios de
            aceptación acordados.
          </p>
          <div className="oee-signature">
            <span>Designed to Evolve.</span>
            <span>Enabled by Zellship Business OS.</span>
          </div>
        </section>

        <nav className="oee-route-grid" aria-label="Experiencias del hub">
          <RouteCard
            number="01"
            title="Presentación"
            description="Entender la visión, el problema operativo y el modelo."
            href={oeeHref("/presentacion/")}
            icon={<BookOpen aria-hidden="true" />}
          />
          <RouteCard
            number="02"
            title="Demo"
            description="Ver el mismo caso atravesar ejecución, corrección y cierre."
            href={oeeHref("/demo/")}
            icon={<Play aria-hidden="true" />}
          />
          <RouteCard
            number="03"
            title="Propuesta"
            description="Conocer cómo preparar una valoración y comenzar."
            href={oeeHref("/propuesta/")}
            icon={<Route aria-hidden="true" />}
          />
        </nav>
      </main>
      <OeeFooter inverse disclosure="Experiencia conceptual con una demo de datos simulados." />
    </div>
  );
}

function RouteCard(props: {
  number: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <a className="oee-route-card" href={props.href}>
      <span className="oee-route-number">{props.number}</span>
      <span className="oee-route-icon">{props.icon}</span>
      <span className="oee-route-title">{props.title}</span>
      <span className="oee-route-description">{props.description}</span>
      <span className="oee-route-link">
        Abrir experiencia <ArrowRight aria-hidden="true" />
      </span>
    </a>
  );
}

function PresentationPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = presentationSlides[slideIndex];
  const isLast = slideIndex === presentationSlides.length - 1;

  return (
    <div className="oee-page oee-editorial-page">
      <OeeHeader route="presentation" />
      <main className="oee-presentation-main">
        <div className="oee-editorial-progress" aria-label={`Sección ${slideIndex + 1} de 8`}>
          <span>
            {String(slideIndex + 1).padStart(2, "0")} <small>/ 08</small>
          </span>
          <div className="oee-progress-track">
            <i style={{ width: `${((slideIndex + 1) / presentationSlides.length) * 100}%` }} />
          </div>
        </div>

        <section className="oee-slide" aria-live="polite">
          <div className="oee-slide-copy">
            <p className="oee-eyebrow">{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p className="oee-slide-body">{slide.body}</p>
            {"disclosure" in slide && slide.disclosure ? (
              <p className="oee-disclosure-inline">{slide.disclosure}</p>
            ) : null}
          </div>
          <SlideVisual slideIndex={slideIndex} items={slide.visual} />
        </section>

        <div className="oee-editorial-nav">
          {slideIndex > 0 ? (
            <button
              className="oee-button oee-button-secondary"
              onClick={() => setSlideIndex((value) => value - 1)}
            >
              <ArrowLeft aria-hidden="true" /> Anterior
            </button>
          ) : (
            <span />
          )}
          {isLast ? (
            <a className="oee-button oee-button-primary" href={oeeHref("/demo/")}>
              {slide.cta} <ArrowRight aria-hidden="true" />
            </a>
          ) : (
            <button
              className="oee-button oee-button-primary"
              onClick={() => setSlideIndex((value) => value + 1)}
            >
              {slide.cta} <ArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
      </main>
      <OeeFooter />
    </div>
  );
}

function SlideVisual({ slideIndex, items }: { slideIndex: number; items: readonly string[] }) {
  return (
    <div
      className={`oee-slide-visual oee-slide-visual-${slideIndex + 1}`}
      aria-label="Síntesis visual"
    >
      {items.map((item, index) => (
        <div className={item.includes("OEE") ? "is-emphasized" : ""} key={item}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item}</strong>
        </div>
      ))}
    </div>
  );
}

function DemoPage() {
  const [stageId, setStageId] = useState<DemoStageId>(() => {
    try {
      const stored = window.localStorage.getItem(OEE_STORAGE_KEY);
      return isDemoStageId(stored) ? stored : initialDemoStage;
    } catch {
      return initialDemoStage;
    }
  });
  const stage = useMemo(() => getDemoStage(stageId), [stageId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(OEE_STORAGE_KEY, stageId);
    } catch {
      // The demo remains usable without persistence when storage is unavailable.
    }
  }, [stageId]);

  const reset = () => {
    try {
      window.localStorage.removeItem(OEE_STORAGE_KEY);
    } catch {
      // State still resets in memory.
    }
    setStageId(initialDemoStage);
  };

  const primaryAction = stage.primaryAction ? (
    <button
      className="oee-button oee-button-primary"
      onClick={() => setStageId(advanceDemoStage(stage.id))}
    >
      {stage.primaryAction} <ArrowRight aria-hidden="true" />
    </button>
  ) : (
    <a className="oee-button oee-button-primary" href={oeeHref("/")}>
      Volver al hub <ArrowRight aria-hidden="true" />
    </a>
  );

  return (
    <div className="oee-page oee-demo-page">
      <OeeHeader route="demo" />
      <main className="oee-demo-main">
        <section className="oee-demo-heading">
          <div>
            <p className="oee-eyebrow">DEMO GENERAL · 5–8 MINUTOS</p>
            <h1>Inspección y habilitación de una ubicación operativa</h1>
          </div>
          <button className="oee-reset-button" onClick={reset} type="button">
            <RotateCcw aria-hidden="true" /> Reiniciar OEE
          </button>
        </section>

        <div className="oee-demo-statusbar">
          <div>
            <span>Paso {stage.moment} de 6</span>
            <strong>{stage.title}</strong>
          </div>
          <div className="oee-moment-track" aria-label={`Momento ${stage.moment} de 6`}>
            {[1, 2, 3, 4, 5, 6].map((moment) => (
              <i className={moment <= stage.moment ? "is-complete" : ""} key={moment} />
            ))}
          </div>
          <span className="oee-simulated-pill">Datos y tiempos simulados</span>
        </div>

        <div className="oee-demo-layout">
          <CaseContext stage={stage} />
          <section className="oee-work-card" aria-live="polite">
            <div className="oee-work-card-header">
              <div>
                <p className="oee-eyebrow">
                  MOMENTO {stage.moment} · {stage.actor.toUpperCase()}
                </p>
                <h2>{stage.title}</h2>
                <p>{stage.description}</p>
              </div>
              <span className={`oee-state-badge state-${stateSlug(stage.state)}`}>
                {stage.state}
              </span>
            </div>

            {stage.id === "activation" ? (
              <div className="oee-primary-action-row is-before-secondary">{primaryAction}</div>
            ) : null}

            <DemoStageContent stage={stage} />

            {stage.id !== "activation" ? (
              <div className="oee-primary-action-row">{primaryAction}</div>
            ) : null}
          </section>
          <CaseContinuity stage={stage} />
        </div>
      </main>
      <OeeFooter disclosure="Personas, evidencia y tiempos son ficticios. No existen integraciones externas." />
    </div>
  );
}

function CaseContext({ stage }: { stage: DemoStage }) {
  return (
    <aside className="oee-side-card oee-context-card" aria-label="Contexto del caso">
      <p className="oee-side-label">CASO CONTINUO</p>
      <strong className="oee-case-id">OP-READY-001</strong>
      <dl className="oee-context-list">
        <div>
          <dt>
            <MapPin aria-hidden="true" /> Ubicación
          </dt>
          <dd>Ubicación Operativa 01</dd>
        </div>
        <div>
          <dt>
            <ClipboardCheck aria-hidden="true" /> Protocolo
          </dt>
          <dd>Inspección y habilitación operativa v1.0</dd>
        </div>
        <div>
          <dt>
            <Clock3 aria-hidden="true" /> Ventana
          </dt>
          <dd>09:00–10:00 · tiempo simulado</dd>
        </div>
        <div>
          <dt>
            <Target aria-hidden="true" /> Compromisos
          </dt>
          <dd>Resolver la desviación antes del cierre.</dd>
        </div>
      </dl>
      <div className="oee-actor-block">
        <span>Actor actual</span>
        <strong>{stage.actorName}</strong>
        <small>{stage.actor}</small>
      </div>
    </aside>
  );
}

function CaseContinuity({ stage }: { stage: DemoStage }) {
  const continuity = [
    ["Intención", "Habilitar la ubicación"],
    ["Contexto", "Ubicación + protocolo"],
    ["Ejecución", stage.moment >= 3 ? "Inspección registrada" : "Por iniciar"],
    ["Evidencia", stage.moment >= 4 ? "Ligada al hallazgo" : "Pendiente"],
    ["Decisión", stage.state === "Cerrada" ? "Cierre aprobado" : "En curso"],
  ];

  return (
    <aside className="oee-side-card oee-continuity-card" aria-label="Continuidad del caso">
      <p className="oee-side-label">CONTINUIDAD</p>
      <h3>Continuidad del caso</h3>
      <div className="oee-continuity-list">
        {continuity.map(([label, value], index) => (
          <div className={index + 1 <= stage.moment ? "is-active" : ""} key={label}>
            <i>
              {index + 1 < stage.moment || stage.state === "Cerrada" ? (
                <Check aria-hidden="true" />
              ) : (
                index + 1
              )}
            </i>
            <span>
              <strong>{label}</strong>
              <small>{value}</small>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DemoStageContent({ stage }: { stage: DemoStage }) {
  if (stage.id === "activation") {
    return (
      <div className="oee-stage-grid three">
        <Fact
          icon={<MapPin />}
          label="Ubicación"
          value="Identificada"
          note="Ubicación Operativa 01"
        />
        <Fact
          icon={<ClipboardCheck />}
          label="Protocolo"
          value="Vigente"
          note="Versión demostrativa 1.0"
        />
        <Fact icon={<Users />} label="Responsable" value="Asignable" note="Daniela Cruz" />
      </div>
    );
  }

  if (stage.id === "activation-handoff") {
    return (
      <Confirmation
        icon={<CheckCircle2 />}
        title="Activación registrada · 09:02"
        body="Alex Romero asignó el caso a Daniela Cruz. El evento no representa un trigger externo."
      />
    );
  }

  if (stage.id === "preparation") {
    return (
      <div className="oee-requirements">
        {[
          "Ubicación e identidad confirmadas",
          "Acceso y recurso demostrativo disponibles",
          "Criterio de cierre comprendido",
        ].map((item) => (
          <div key={item}>
            <CheckCircle2 aria-hidden="true" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (stage.id === "inspection-start") {
    return (
      <Confirmation
        icon={<ShieldCheck />}
        title="Preparación confirmada · 09:04"
        body="El protocolo puede iniciar sin consultar recursos, skills o servicios externos."
      />
    );
  }

  if (stage.id === "execution") {
    return (
      <div className="oee-protocol-steps">
        <ProtocolRow number="01" title="Acceso disponible" status="Cumple" />
        <ProtocolRow number="02" title="Zona de recepción despejada" status="No cumple" alert />
        <ProtocolRow number="03" title="Señalización y comunicación visibles" status="Cumple" />
      </div>
    );
  }

  if (stage.id === "finding" || stage.id === "finding-handoff" || stage.id === "review-one") {
    return (
      <div className="oee-evidence-layout" data-oee-review="1">
        <EvidenceCard image={evidenceInitial} revision="Revisión 1" time="09:13" />
        <div className="oee-finding-details">
          <span className="oee-alert-label">
            <CircleAlert aria-hidden="true" /> Desviación operativa
          </span>
          <h3>Zona designada parcialmente obstruida</h3>
          <p>
            Material temporal ocupa el perímetro y evita demostrar el criterio de área despejada.
          </p>
          <dl>
            <div>
              <dt>Registró</dt>
              <dd>Daniela Cruz</dd>
            </div>
            <div>
              <dt>Paso</dt>
              <dd>02 · Zona de recepción</dd>
            </div>
            <div>
              <dt>Caso</dt>
              <dd>OP-READY-001</dd>
            </div>
          </dl>
          {stage.id === "review-one" ? (
            <label className="oee-reason-field">
              Razón de devolución
              <textarea
                readOnly
                value="Despejar completamente el perímetro y registrar nueva evidencia desde el mismo punto."
              />
            </label>
          ) : null}
        </div>
      </div>
    );
  }

  if (stage.id === "correction-start") {
    return (
      <div className="oee-correction-request">
        <CircleAlert aria-hidden="true" />
        <div>
          <span>Razón de devolución · Samuel Vega · 09:18</span>
          <h3>El perímetro debe quedar completamente despejado.</h3>
          <p>Retira el material temporal y registra nueva evidencia desde el mismo punto.</p>
        </div>
      </div>
    );
  }

  if (stage.id === "correction") {
    return (
      <div className="oee-evidence-layout" data-oee-review="2">
        <EvidenceCard image={evidenceCorrected} revision="Revisión 2" time="09:28" />
        <div className="oee-finding-details">
          <span className="oee-success-label">
            <Wrench aria-hidden="true" /> Corrección registrada
          </span>
          <h3>Material retirado y perímetro despejado</h3>
          <p>La nueva evidencia responde a la instrucción sin sustituir la condición inicial.</p>
          <dl>
            <div>
              <dt>Corrigió</dt>
              <dd>Daniela Cruz</dd>
            </div>
            <div>
              <dt>Vinculada a</dt>
              <dd>Revisión 1</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  if (stage.id === "comparison" || stage.id === "closure") {
    return (
      <div className="oee-comparison" data-oee-review="2">
        <EvidenceCard image={evidenceInitial} revision="Revisión 1" time="09:13" compact />
        <div className="oee-comparison-arrow">
          <ArrowRight aria-hidden="true" />
          <span>Corrección</span>
        </div>
        <EvidenceCard image={evidenceCorrected} revision="Revisión 2" time="09:28" compact />
      </div>
    );
  }

  return <FinalSummary />;
}

function Fact({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="oee-fact">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}

function Confirmation({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="oee-confirmation">
      <span>{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

function ProtocolRow({
  number,
  title,
  status,
  alert = false,
}: {
  number: string;
  title: string;
  status: string;
  alert?: boolean;
}) {
  return (
    <div className={alert ? "is-alert" : ""}>
      <span>{number}</span>
      <strong>{title}</strong>
      <em>{status}</em>
    </div>
  );
}

function EvidenceCard({
  image,
  revision,
  time,
  compact = false,
}: {
  image: string;
  revision: string;
  time: string;
  compact?: boolean;
}) {
  return (
    <figure className={`oee-evidence-card ${compact ? "is-compact" : ""}`}>
      <div className="oee-evidence-image">
        <img src={image} alt={`${revision}: condición operativa ficticia`} />
      </div>
      <figcaption>
        <span>
          <strong>{revision}</strong>
          <small>{time} · tiempo simulado</small>
        </span>
        <mark>Evidencia simulada</mark>
      </figcaption>
    </figure>
  );
}

function FinalSummary() {
  const rows = [
    ["Resultado", "Ubicación habilitada conforme al protocolo demostrativo"],
    ["Caso", "OP-READY-001"],
    ["Ubicación", "Ubicación Operativa 01"],
    ["Protocolo", "Inspección y habilitación operativa v1.0"],
    ["Actores", "Alex Romero · Daniela Cruz · Samuel Vega"],
    ["Revisión 1", "Condición inicial documentada · 09:13"],
    ["Razón de devolución", "Despejar completamente el perímetro"],
    ["Corrección", "Material retirado y zona despejada"],
    ["Revisión 2", "Condición corregida documentada · 09:28"],
    ["Cierre", "Aprobado por Samuel Vega · 09:34"],
  ];

  return (
    <div className="oee-final-summary">
      <div className="oee-final-result">
        <CheckCircle2 aria-hidden="true" />
        <div>
          <span>RESULTADO VALIDADO</span>
          <h3>Ubicación habilitada</h3>
          <p>Conforme al protocolo demostrativo.</p>
        </div>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="oee-certification-note">
        El resultado no constituye certificación legal, regulatoria o de seguridad.
      </p>
    </div>
  );
}

function ProposalPage() {
  return (
    <div className="oee-page oee-editorial-page oee-proposal-page">
      <OeeHeader route="proposal" />
      <main>
        <section className="oee-proposal-hero">
          <div>
            <p className="oee-eyebrow">CÓMO COMENZAR</p>
            <h1>
              Primero entendemos la operación. Después definimos la solución adecuada para llevarla
              a operación.
            </h1>
          </div>
          <div className="oee-proposal-intro">
            <p>
              Se orienta a alcanzar un resultado operativo definido y verificable conforme a
              criterios de aceptación acordados, no sólo a habilitar funciones.
            </p>
            <a className="oee-button oee-button-primary" href="#prerrequisitos">
              Preparar valoración <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="oee-method-section" aria-labelledby="method-title">
          <div className="oee-section-heading">
            <p className="oee-eyebrow">METODOLOGÍA</p>
            <h2 id="method-title">Cuatro decisiones, cada una con valor propio.</h2>
            <p>
              OEE está diseñado para operar donde sucede el trabajo, no sólo desde un escritorio.
              Parte de infraestructura cotidiana, como un celular con conexión, sin requerir
              equipamiento especializado para el escenario base.
            </p>
          </div>
          <div className="oee-method-grid">
            {methodology.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <strong>{item.output}</strong>
                <small>{item.decision}</small>
              </article>
            ))}
          </div>
          <p className="oee-evolution-note">
            <strong>Evolución continua</strong> es la relación posterior a la activación: permite
            medir, aprender y priorizar nuevas capacidades sobre evidencia real.
          </p>
        </section>

        <section className="oee-routes-section" aria-labelledby="routes-title">
          <div className="oee-section-heading">
            <p className="oee-eyebrow">RUTAS DE ADOPCIÓN</p>
            <h2 id="routes-title">La complejidad define la ruta.</h2>
          </div>
          <div className="oee-adoption-grid">
            <article>
              <span>RUTA ESTÁNDAR</span>
              <h3>Configuración predominante</h3>
              <p>Procesos conocidos, pocas excepciones e integraciones acotadas.</p>
              <small>Se confirma después del entendimiento inicial.</small>
            </article>
            <article>
              <span>RUTA DISEÑADA</span>
              <h3>Diseño y adaptación relevante</h3>
              <p>Operación variable, excepciones múltiples o integraciones materiales.</p>
              <small>
                La solución se adapta a la operación dentro de un alcance diseñado y aprobado; esto
                no significa personalización ilimitada.
              </small>
            </article>
          </div>
          <p className="oee-scope-note">
            Debe ser simple para quien opera y robusto en contexto, estados, protocolos, evidencia,
            autoridad y trazabilidad. No se presenta como SaaS autoadministrable de activación
            inmediata ni como desarrollo indefinido.
          </p>
        </section>

        <section
          className="oee-prerequisites-section"
          id="prerrequisitos"
          aria-labelledby="prerequisites-title"
        >
          <div className="oee-section-heading">
            <p className="oee-eyebrow">PREPARAR VALORACIÓN</p>
            <h2 id="prerequisites-title">La información mínima para valorar complejidad y ruta.</h2>
            <p>
              Este contenido es local e informativo. No envía datos ni genera una cotización
              automática.
            </p>
          </div>
          <div className="oee-prerequisite-grid">
            {prerequisites.map(([title, body], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="oee-next-step">
            <div>
              <p className="oee-eyebrow oee-eyebrow-light">SIGUIENTE PASO</p>
              <h2>Alineemos el primer caso antes de definir la solución.</h2>
              <p>
                Un Taller de entendimiento y alineación prepara el alcance de un Anteproyecto
                Operativo.
              </p>
            </div>
            <ul>
              <li>Problema y resultado prioritario</li>
              <li>Actores, estados y excepciones</li>
              <li>Evidencia y contexto requeridos</li>
              <li>Integraciones y restricciones iniciales</li>
            </ul>
          </div>
        </section>
      </main>
      <OeeFooter />
    </div>
  );
}

function OeeHeader({ route, inverse = false }: { route: RouteName; inverse?: boolean }) {
  return (
    <header className={`oee-header ${inverse ? "is-inverse" : ""}`}>
      <a className="oee-brand" href={oeeHref("/")} aria-label="Ir al OEE Experience Hub">
        <span className="oee-logo-wrap">
          <img src={zellshipLogo} alt="Zellship" />
        </span>
        <span>
          <strong>Operation Execution Engine</strong>
          <small>{routeLabels[route]}</small>
        </span>
      </a>
      {route !== "hub" ? (
        <a className="oee-back-link" href={oeeHref("/")}>
          <ArrowLeft aria-hidden="true" /> Volver al hub
        </a>
      ) : null}
    </header>
  );
}

function OeeFooter({ inverse = false, disclosure }: { inverse?: boolean; disclosure?: string }) {
  return (
    <footer className={`oee-footer ${inverse ? "is-inverse" : ""}`}>
      <span>Designed to Evolve.</span>
      {disclosure ? <small>{disclosure}</small> : <small>Enabled by Zellship Business OS.</small>}
    </footer>
  );
}

function getRouteName(pathname: string): RouteName {
  if (pathname.includes("/oee/presentacion")) return "presentation";
  if (pathname.includes("/oee/demo")) return "demo";
  if (pathname.includes("/oee/propuesta")) return "proposal";
  return "hub";
}

function oeeHref(suffix: "/" | "/presentacion/" | "/demo/" | "/propuesta/") {
  const pathname = window.location.pathname;
  const markerIndex = pathname.indexOf("/oee");
  const hostingPrefix = markerIndex >= 0 ? pathname.slice(0, markerIndex) : "";
  return `${hostingPrefix}/oee${suffix}`.replace(/\/+/g, "/");
}

function stateSlug(state: string) {
  return state
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}
