import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  Input,
  InputNumber,
  List,
  Progress,
  Rate,
  Segmented,
  Space,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  BellOutlined,
  CameraOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  InboxOutlined,
  ShopOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { advanceDemoClock } from "../../demo-config/clock";
import { completeStoreAssignment } from "../retail-domain";
import { useStore } from "../store";
import type { StoreAssignment } from "../types";
import { formatShortDate } from "./retail-format";
import { AssignmentStatusTag, PriorityTag, SupportStatusTag } from "./retail-ui";
import { StoreSupportRequestModal } from "./StoreSupportRequestModal";

const STORE = "Boutique Norte";
const OPERATOR = "Valeria Santos";
const RECEIPT_PHOTO = `${import.meta.env.BASE_URL}retail-merchandise-receipt-v1.png`;
const CLEANING_PHOTO = `${import.meta.env.BASE_URL}retail-cleaning-evidence-v1.png`;

type MobileRoute = "home" | "assignment";
type MobileTab = "program" | "support";

export function RetailMobileStoreApp() {
  const {
    storeAssignments,
    setStoreAssignments,
    supportCases,
    protocols,
    notifications,
    setNotifications,
    inventory,
    setInventory,
  } = useStore();
  const [route, setRoute] = useState<MobileRoute>("home");
  const [tab, setTab] = useState<MobileTab>("program");
  const [selectedId, setSelectedId] = useState("RTL-ASG-1028");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportContext, setSupportContext] = useState<{
    assignmentId?: string;
    category?: string;
    symptom?: string;
  }>({});

  const assignments = useMemo(
    () =>
      storeAssignments
        .filter((item) => item.storeLabel === STORE)
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    [storeAssignments],
  );
  const cases = useMemo(
    () => supportCases.filter((item) => item.storeLabel === STORE && item.status !== "Draft"),
    [supportCases],
  );
  const operatorNotifications = useMemo(
    () =>
      notifications.filter(
        (item) =>
          (item.recipientRole === "operator" || item.recipientRole === "all") &&
          (!item.recipient || item.recipient === OPERATOR),
      ),
    [notifications],
  );
  const selected = assignments.find((item) => item.id === selectedId) ?? assignments[0];
  const selectedProtocol = protocols.find((item) => item.id === selected?.protocolId);
  const unread = operatorNotifications.filter((item) => item.status === "Sent").length;

  const openAssignment = (assignment: StoreAssignment) => {
    setSelectedId(assignment.id);
    setStoreAssignments(
      storeAssignments.map((item) =>
        item.id === assignment.id && item.status === "Assigned"
          ? { ...item, status: "Acknowledged" }
          : item,
      ),
    );
    setRoute("assignment");
  };

  const openSupport = (context?: typeof supportContext) => {
    setSupportContext(context ?? {});
    setSupportOpen(true);
  };

  const markNotificationsRead = () => {
    setNotifications(
      notifications.map((item) =>
        operatorNotifications.some((candidate) => candidate.id === item.id)
          ? { ...item, status: "Read" }
          : item,
      ),
    );
  };

  return (
    <div className="retail-mobile-demo-stage">
      <aside className="retail-mobile-demo-context">
        <Typography.Text className="retail-eyebrow retail-eyebrow-light">
          OPERACIÓN EN PISO
        </Typography.Text>
        <Typography.Title level={2}>La ejecución cabe en una mano.</Typography.Title>
        <Typography.Paragraph>
          La tienda recibe asignaciones, ejecuta protocolos, documenta evidencia y pide soporte sin
          cambiar de contexto.
        </Typography.Paragraph>
        <div className="retail-context-chip">
          <ShopOutlined />
          <span>
            <b>{STORE}</b>
            <small>Terminal de operación · En línea</small>
          </span>
        </div>
        <div className="retail-context-chip">
          <InboxOutlined />
          <span>
            <b>Recepción OC-DEMO-2481</b>
            <small>48 paquetes esperados</small>
          </span>
        </div>
      </aside>

      <div className="retail-phone-frame" aria-label="Vista móvil de operación de tienda">
        <div className="retail-phone-hardware" />
        <div className="retail-phone-screen">
          <header className="retail-phone-header">
            <div>
              <Typography.Text>{STORE}</Typography.Text>
              <span>{OPERATOR}</span>
            </div>
            <Badge count={unread} size="small">
              <Button
                aria-label="Abrir notificaciones"
                shape="circle"
                icon={<BellOutlined />}
                onClick={() => setNotificationsOpen(true)}
              />
            </Badge>
          </header>

          {route === "home" ? (
            <MobileHome
              tab={tab}
              setTab={setTab}
              assignments={assignments}
              cases={cases}
              protocols={protocols}
              onOpenAssignment={openAssignment}
              onSupport={() => openSupport()}
            />
          ) : selected && selectedProtocol ? (
            <div className="retail-phone-task">
              <div className="retail-phone-task-nav">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setRoute("home")}>
                  Programa
                </Button>
                <Button
                  type="text"
                  icon={<CustomerServiceOutlined />}
                  onClick={() => openSupport({ assignmentId: selected.id })}
                >
                  Ayuda
                </Button>
              </div>
              {selected.protocolId === "retail-merchandise-receipt" ? (
                <ReceivingProtocol
                  assignment={selected}
                  onComplete={(completed) => {
                    setStoreAssignments(
                      storeAssignments.map((item) => (item.id === completed.id ? completed : item)),
                    );
                    setNotifications([
                      {
                        id: `not-receipt-completed-${completed.id}`,
                        type: "Completed",
                        channel: "System",
                        actor: OPERATOR,
                        recipientRole: "admin",
                        source: "Automatic",
                        event: "Recepción enviada",
                        message: `${STORE} envió la recepción ${completed.id} para validación.`,
                        actionLabel: "Revisar recepción",
                        status: "Sent",
                        createdAt: completed.completedAt!,
                      },
                      ...notifications,
                    ]);
                    message.success("Recepción enviada con evidencia y firma");
                    setRoute("home");
                  }}
                  onReport={() =>
                    openSupport({
                      assignmentId: selected.id,
                      category: "Recepción de mercancía",
                      symptom:
                        "La recepción presenta una diferencia en cantidad o condición que requiere seguimiento.",
                    })
                  }
                />
              ) : selected.protocolId === "retail-opening" ? (
                <OpeningProtocol
                  assignment={selected}
                  onChange={(next) =>
                    setStoreAssignments(
                      storeAssignments.map((item) => (item.id === next.id ? next : item)),
                    )
                  }
                  onReport={() =>
                    openSupport({
                      assignmentId: selected.id,
                      category: "Climatización",
                      symptom:
                        "La sala registra 27.8 °C y el flujo de aire es bajo durante la apertura.",
                    })
                  }
                  onDone={() => setRoute("home")}
                />
              ) : selected.protocolId === "retail-cleaning" ? (
                <CleaningProtocol
                  assignment={selected}
                  onComplete={(completed) => {
                    setStoreAssignments(
                      storeAssignments.map((item) => (item.id === completed.id ? completed : item)),
                    );
                    const cleaner = Number(
                      completed.submission?.formAnswers.cleanerConsumedMl ?? 0,
                    );
                    const cloths = Number(completed.submission?.formAnswers.clothsConsumed ?? 0);
                    setInventory(
                      inventory.map((item) =>
                        item.id === "retail-cleaner"
                          ? { ...item, onHand: Math.max(0, item.onHand - cleaner) }
                          : item.id === "retail-cloths"
                            ? { ...item, onHand: Math.max(0, item.onHand - cloths) }
                            : item,
                      ),
                    );
                    message.success("Limpieza registrada con evidencia y consumo");
                    setRoute("home");
                  }}
                />
              ) : (
                <SimpleMobileProtocol
                  assignment={selected}
                  title={selectedProtocol.name}
                  onComplete={() => {
                    setStoreAssignments(
                      storeAssignments.map((item) =>
                        item.id === selected.id
                          ? {
                              ...item,
                              status: item.requiresValidation ? "Submitted" : "Completed",
                              progress: 100,
                              completedAt: advanceDemoClock(6).toISOString(),
                            }
                          : item,
                      ),
                    );
                    setRoute("home");
                  }}
                />
              )}
            </div>
          ) : null}

          <Drawer
            title="Notificaciones"
            placement="right"
            width="100%"
            rootClassName="retail-phone-drawer"
            getContainer={false}
            open={notificationsOpen}
            onClose={() => {
              markNotificationsRead();
              setNotificationsOpen(false);
            }}
          >
            <List
              dataSource={operatorNotifications}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Badge status={item.status === "Sent" ? "processing" : "default"} />}
                    title={item.event ?? item.type}
                    description={
                      <Space direction="vertical" size={4}>
                        <span>{item.message}</span>
                        {["Atender recepción", "Atender limpieza"].includes(
                          item.actionLabel ?? "",
                        ) && (
                          <Button
                            type="link"
                            style={{ padding: 0 }}
                            onClick={() => {
                              const target = assignments.find(
                                (assignment) =>
                                  assignment.protocolId ===
                                  (item.actionLabel === "Atender recepción"
                                    ? "retail-merchandise-receipt"
                                    : "retail-cleaning"),
                              );
                              if (target) openAssignment(target);
                              setNotificationsOpen(false);
                            }}
                          >
                            {item.actionLabel}
                          </Button>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Drawer>
        </div>
      </div>

      <aside className="retail-mobile-demo-notes">
        <Typography.Text className="retail-eyebrow">RECORRIDO SUGERIDO</Typography.Text>
        <Typography.Title level={3}>Recepción trazable</Typography.Title>
        <ol>
          <li>Abre la notificación de mercancía.</li>
          <li>Confirma paquetes y condición.</li>
          <li>Captura foto, hora, usuario y firma.</li>
          <li>Reporta diferencias sin abandonar el protocolo.</li>
        </ol>
        <Alert type="info" showIcon message="Todo el comportamiento es simulado en esta demo." />
      </aside>

      <StoreSupportRequestModal
        open={supportOpen}
        onCancel={() => setSupportOpen(false)}
        defaultAssignmentId={supportContext.assignmentId}
        defaultCategory={supportContext.category}
        defaultSymptom={supportContext.symptom}
        onCreated={() => {
          setSupportOpen(false);
          setTab("support");
          setRoute("home");
        }}
      />
    </div>
  );
}

function MobileHome({
  tab,
  setTab,
  assignments,
  cases,
  protocols,
  onOpenAssignment,
  onSupport,
}: {
  tab: MobileTab;
  setTab: (tab: MobileTab) => void;
  assignments: StoreAssignment[];
  cases: ReturnType<typeof useStore>["supportCases"];
  protocols: ReturnType<typeof useStore>["protocols"];
  onOpenAssignment: (assignment: StoreAssignment) => void;
  onSupport: () => void;
}) {
  const pending = assignments.filter(
    (item) => !["Completed", "Validated", "Submitted"].includes(item.status),
  );
  return (
    <div className="retail-phone-home">
      <section className="retail-phone-greeting">
        <Typography.Text>MI JORNADA</Typography.Text>
        <Typography.Title level={3}>Hola, Valeria</Typography.Title>
        <Typography.Paragraph>
          Hay {pending.length} actividades por atender hoy.
        </Typography.Paragraph>
      </section>
      <Button
        block
        size="large"
        type="primary"
        icon={<CustomerServiceOutlined />}
        onClick={onSupport}
      >
        Solicitar asistencia
      </Button>
      <Segmented
        block
        value={tab}
        onChange={(value) => setTab(value as MobileTab)}
        options={[
          { value: "program", label: "Programa", icon: <UnorderedListOutlined /> },
          { value: "support", label: "Soporte", icon: <CustomerServiceOutlined /> },
        ]}
      />
      {tab === "program" ? (
        <List
          className="retail-phone-list"
          dataSource={assignments}
          renderItem={(item) => {
            const protocol = protocols.find((candidate) => candidate.id === item.protocolId);
            const done = ["Completed", "Validated", "Submitted"].includes(item.status);
            return (
              <List.Item>
                <Card size="small" className="retail-phone-assignment-card">
                  <Space direction="vertical" size={7} style={{ width: "100%" }}>
                    <Space wrap size={6}>
                      {item.protocolId === "retail-merchandise-receipt" && (
                        <Tag color="blue" icon={<InboxOutlined />}>
                          Nueva
                        </Tag>
                      )}
                      <AssignmentStatusTag status={item.status} />
                      <Typography.Text type="secondary">
                        {formatShortDate(item.dueAt)}
                      </Typography.Text>
                    </Space>
                    <Typography.Title level={5}>{protocol?.name}</Typography.Title>
                    <Typography.Text type="secondary">{item.comments ?? item.id}</Typography.Text>
                    <Progress percent={item.progress} size="small" showInfo={item.progress > 0} />
                    <Button
                      block
                      type={done ? "default" : "primary"}
                      disabled={done}
                      onClick={() => onOpenAssignment(item)}
                    >
                      {done ? "Enviada" : item.status === "InProgress" ? "Continuar" : "Atender"}
                    </Button>
                  </Space>
                </Card>
              </List.Item>
            );
          }}
        />
      ) : (
        <List
          className="retail-phone-list"
          locale={{ emptyText: "No hay solicitudes activas" }}
          dataSource={cases}
          renderItem={(item) => (
            <List.Item>
              <Card size="small" className="retail-phone-assignment-card">
                <Space direction="vertical" size={7}>
                  <Space wrap size={6}>
                    <PriorityTag priority={item.confirmedPriority ?? item.suggestedPriority} />
                    <SupportStatusTag status={item.status} />
                  </Space>
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Typography.Text type="secondary">{item.currentOwner}</Typography.Text>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

function ReceivingProtocol({
  assignment,
  onComplete,
  onReport,
}: {
  assignment: StoreAssignment;
  onComplete: (assignment: StoreAssignment) => void;
  onReport: () => void;
}) {
  const [step, setStep] = useState(0);
  const [received, setReceived] = useState(48);
  const [damaged, setDamaged] = useState(0);
  const [photo, setPhoto] = useState(false);
  const [signed, setSigned] = useState(false);
  const [notes, setNotes] = useState("");
  const [capturedAt, setCapturedAt] = useState(() => advanceDemoClock(1));
  const discrepancy = received !== 48 || damaged > 0;

  const submit = () => {
    if (!photo || !signed) {
      message.warning("Captura la foto y la firma antes de enviar");
      return;
    }
    onComplete(
      completeStoreAssignment(assignment, {
        submittedAt: capturedAt.toISOString(),
        submittedBy: OPERATOR,
        evidenceLabels: ["Foto de recepción", "Fecha y hora"],
        formAnswers: {
          deliveryReference: "OC-DEMO-2481",
          expectedQuantity: 48,
          receivedQuantity: received,
          damagedQuantity: damaged,
          condition: discrepancy ? "Con observaciones" : "Conforme",
        },
        signatureCaptured: signed,
        notes,
      }),
    );
  };

  return (
    <div className="retail-mobile-protocol">
      <Tag color="blue" icon={<InboxOutlined />}>
        RECEPCIÓN
      </Tag>
      <Typography.Title level={4}>Recepción de mercancía</Typography.Title>
      <Typography.Paragraph type="secondary">OC-DEMO-2481 · 48 paquetes</Typography.Paragraph>
      <Steps
        current={step}
        size="small"
        responsive={false}
        items={[{ title: "Entrega" }, { title: "Evidencia" }, { title: "Firma" }]}
      />

      {step === 0 && (
        <Card size="small" title="Confirma la entrega">
          <div className="retail-receipt-metrics">
            <label>
              <span>Esperados</span>
              <InputNumber value={48} disabled />
            </label>
            <label>
              <span>Recibidos</span>
              <InputNumber min={0} value={received} onChange={(value) => setReceived(value ?? 0)} />
            </label>
            <label>
              <span>Con daño</span>
              <InputNumber min={0} value={damaged} onChange={(value) => setDamaged(value ?? 0)} />
            </label>
          </div>
          {discrepancy && (
            <Alert
              type="warning"
              showIcon
              message="Hay una diferencia por documentar"
              action={
                <Button size="small" onClick={onReport}>
                  Reportar
                </Button>
              }
            />
          )}
          <Input.TextArea
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Comentarios de recepción (opcional)"
          />
          <Button block type="primary" onClick={() => setStep(1)}>
            Continuar
          </Button>
        </Card>
      )}

      {step === 1 && (
        <Card size="small" title="Evidencia de recepción">
          <MobilePhotoCapture
            imageUrl={RECEIPT_PHOTO}
            alt="Mercancía recibida en el área de tienda"
            subject="Mercancía y condición de paquetes"
            captured={photo}
            onCaptured={() => {
              setCapturedAt(advanceDemoClock(1));
              setPhoto(true);
            }}
            onRetake={() => setPhoto(false)}
          />
          <div className="retail-capture-audit">
            <span>Fecha y hora</span>
            <b>{capturedAt.format("DD MMM YYYY · HH:mm")}</b>
            <span>Usuario</span>
            <b>{OPERATOR}</b>
            <span>Ubicación</span>
            <b>{STORE}</b>
          </div>
          <Space.Compact block>
            <Button onClick={() => setStep(0)}>Atrás</Button>
            <Button type="primary" style={{ flex: 1 }} disabled={!photo} onClick={() => setStep(2)}>
              Continuar
            </Button>
          </Space.Compact>
        </Card>
      )}

      {step === 2 && (
        <Card size="small" title="Conformidad y firma">
          <Alert
            type={discrepancy ? "warning" : "success"}
            showIcon
            message={discrepancy ? "Recepción con observaciones" : "Cantidades conformes"}
            description={`${received} recibidos · ${damaged} con daño`}
          />
          <MobileSignaturePad signed={signed} onSigned={setSigned} />
          <Button block onClick={onReport}>
            Reportar un problema
          </Button>
          <Button block type="primary" size="large" disabled={!signed} onClick={submit}>
            Enviar recepción
          </Button>
        </Card>
      )}
    </div>
  );
}

function MobilePhotoCapture({
  imageUrl,
  alt,
  subject,
  captured,
  onCaptured,
  onRetake,
}: {
  imageUrl: string;
  alt: string;
  subject: string;
  captured: boolean;
  onCaptured: () => void;
  onRetake: () => void;
}) {
  const [flash, setFlash] = useState(false);
  const takePhoto = () => {
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      onCaptured();
    }, 380);
  };

  return (
    <div className="retail-mobile-camera-capture">
      <div
        className={`retail-mobile-camera-stage ${flash ? "is-flashing" : ""}`}
        aria-live="polite"
      >
        {captured ? (
          <img src={imageUrl} alt={alt} />
        ) : (
          <div className="retail-mobile-camera-ready">
            <CameraOutlined />
            <b>{subject}</b>
            <span>Alinea el área dentro del marco</span>
          </div>
        )}
        {flash && <div className="camera-flash" />}
        {!captured && (
          <div className="camera-reticle">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
        {captured && (
          <div className="retail-mobile-photo-stamp">
            <b>Boutique Norte · evidencia simulada</b>
            <span>25.6866° N, 100.3161° W</span>
          </div>
        )}
      </div>
      {!captured ? (
        <Button block size="large" type="primary" icon={<CameraOutlined />} onClick={takePhoto}>
          Tomar fotografía
        </Button>
      ) : (
        <Space.Compact block>
          <Button onClick={onRetake}>Retomar</Button>
          <Button type="primary" style={{ flex: 1 }} disabled>
            Evidencia confirmada
          </Button>
        </Space.Compact>
      )}
    </div>
  );
}

function MobileSignaturePad({
  signed,
  onSigned,
}: {
  signed: boolean;
  onSigned: (signed: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };
  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const current = point(event);
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(current.x, current.y);
    ctx.strokeStyle = "#7041da";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };
  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const current = point(event);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    setStrokeCount((count) => count + 1);
    onSigned(false);
  };
  const stop = () => {
    drawingRef.current = false;
  };
  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
    onSigned(false);
  };

  return (
    <div className="retail-mobile-signature">
      <div className="retail-mobile-signature-heading">
        <div>
          <b>Firma de quien recibe</b>
          <span>Dibuja dentro del recuadro</span>
        </div>
        {signed && <Tag color="green">Confirmada</Tag>}
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        aria-label="Área para dibujar la firma"
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerCancel={stop}
      />
      <Space.Compact block>
        <Button icon={<DeleteOutlined />} onClick={clear}>
          Limpiar
        </Button>
        <Button
          type="primary"
          style={{ flex: 1 }}
          disabled={strokeCount < 5}
          onClick={() => onSigned(true)}
        >
          Confirmar firma
        </Button>
      </Space.Compact>
    </div>
  );
}

function CleaningProtocol({
  assignment,
  onComplete,
}: {
  assignment: StoreAssignment;
  onComplete: (assignment: StoreAssignment) => void;
}) {
  const [photo, setPhoto] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [cleaner, setCleaner] = useState(120);
  const [cloths, setCloths] = useState(1);
  const [capturedAt, setCapturedAt] = useState(() => advanceDemoClock(1));

  const submit = () => {
    const completedAt = advanceDemoClock(2).toISOString();
    onComplete({
      ...assignment,
      status: "Completed",
      progress: 100,
      completedAt,
      submission: {
        submittedAt: completedAt,
        submittedBy: OPERATOR,
        evidenceLabels: ["Foto final de limpieza", "Fecha y hora"],
        formAnswers: {
          selfRating: rating,
          cleanerConsumedMl: cleaner,
          clothsConsumed: cloths,
        },
        signatureCaptured: false,
        notes: comments,
      },
    });
  };

  return (
    <div className="retail-mobile-protocol retail-cleaning-protocol">
      <Tag color="cyan">LIMPIEZA</Tag>
      <Typography.Title level={4}>Limpieza y presentación</Typography.Title>
      <Typography.Paragraph type="secondary">
        Un cierre simple: evidencia, criterio propio e insumos utilizados.
      </Typography.Paragraph>
      <Card size="small" title="1. Foto del resultado">
        <MobilePhotoCapture
          imageUrl={CLEANING_PHOTO}
          alt="Sala de ventas limpia, ordenada y lista"
          subject="Sala de ventas terminada"
          captured={photo}
          onCaptured={() => {
            setCapturedAt(advanceDemoClock(1));
            setPhoto(true);
          }}
          onRetake={() => setPhoto(false)}
        />
        {photo && (
          <div className="retail-capture-audit">
            <span>Fecha y hora</span>
            <b>{capturedAt.format("DD MMM YYYY · HH:mm")}</b>
            <span>Usuario</span>
            <b>{OPERATOR}</b>
          </div>
        )}
      </Card>
      <Card size="small" title="2. Tu evaluación">
        <div className="retail-cleaning-rating">
          <Typography.Text type="secondary">¿Cómo quedó el área?</Typography.Text>
          <Rate value={rating} onChange={setRating} />
          <Typography.Text strong>
            {rating === 0
              ? "Sin evaluar"
              : rating >= 4
                ? "Lista para operar"
                : "Requiere una revisión adicional"}
          </Typography.Text>
        </div>
        <Input.TextArea
          rows={3}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Comentarios u observaciones (opcional)"
        />
      </Card>
      <Card size="small" title="3. Consumo de productos">
        <div className="retail-cleaning-consumption">
          <label>
            <span>Limpiador neutro</span>
            <InputNumber
              min={0}
              max={500}
              value={cleaner}
              addonAfter="ml"
              onChange={(value) => setCleaner(value ?? 0)}
            />
          </label>
          <label>
            <span>Paños de microfibra</span>
            <InputNumber
              min={0}
              max={5}
              value={cloths}
              addonAfter="pza"
              onChange={(value) => setCloths(value ?? 0)}
            />
          </label>
        </div>
        <Typography.Text type="secondary">
          El consumo descuenta existencias sólo dentro de esta simulación.
        </Typography.Text>
      </Card>
      <Button block size="large" type="primary" disabled={!photo || rating === 0} onClick={submit}>
        Completar limpieza
      </Button>
    </div>
  );
}

function OpeningProtocol({
  assignment,
  onChange,
  onReport,
  onDone,
}: {
  assignment: StoreAssignment;
  onChange: (assignment: StoreAssignment) => void;
  onReport: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState([false, false, false]);
  const toggle = (index: number) =>
    setChecks(checks.map((value, position) => (position === index ? !value : value)));
  return (
    <div className="retail-mobile-protocol">
      <Tag color="purple">APERTURA</Tag>
      <Typography.Title level={4}>Apertura, imagen y condición</Typography.Title>
      <Typography.Paragraph type="secondary">
        Ubicación y hora registradas automáticamente.
      </Typography.Paragraph>
      <Progress percent={step === 0 ? 20 : step === 1 ? 65 : 100} />
      {step === 0 && (
        <Card size="small" title="Verificaciones de apertura">
          <div className="retail-checklist">
            {["Acceso y cortinas listos", "Sala limpia y presentada", "Caja preparada"].map(
              (label, index) => (
                <Checkbox key={label} checked={checks[index]} onChange={() => toggle(index)}>
                  {label}
                </Checkbox>
              ),
            )}
          </div>
          <Button
            block
            type="primary"
            disabled={!checks.every(Boolean)}
            onClick={() => {
              onChange({ ...assignment, status: "InProgress", progress: 65 });
              setStep(1);
            }}
          >
            Continuar
          </Button>
        </Card>
      )}
      {step === 1 && (
        <Card size="small" title="Climatización">
          <Alert
            type="warning"
            showIcon
            message="27.8 °C · Fuera de rango"
            description="El rango esperado es 22–24 °C."
          />
          <Button block danger onClick={onReport}>
            Solicitar asistencia
          </Button>
          <Button block type="primary" onClick={() => setStep(2)}>
            Continuar apertura segura
          </Button>
        </Card>
      )}
      {step === 2 && (
        <Card size="small" title="Apertura registrada">
          <Alert
            type="success"
            showIcon
            message="Checklist completo"
            description={`${OPERATOR} · ${advanceDemoClock(1).format("DD MMM · HH:mm")}`}
          />
          <Button
            block
            type="primary"
            onClick={() => {
              onChange({
                ...assignment,
                status: "Submitted",
                progress: 100,
                completedAt: advanceDemoClock(1).toISOString(),
              });
              onDone();
            }}
          >
            Enviar apertura
          </Button>
        </Card>
      )}
    </div>
  );
}

function SimpleMobileProtocol({
  assignment,
  title,
  onComplete,
}: {
  assignment: StoreAssignment;
  title: string;
  onComplete: () => void;
}) {
  return (
    <div className="retail-mobile-protocol">
      <Tag>{assignment.id}</Tag>
      <Typography.Title level={4}>{title}</Typography.Title>
      <Card size="small" title="Ejecución guiada">
        <div className="retail-checklist">
          <Checkbox defaultChecked>Confirmar área</Checkbox>
          <Checkbox defaultChecked>Completar verificaciones</Checkbox>
          <Checkbox defaultChecked>Registrar resultado</Checkbox>
        </div>
        <Button block type="primary" onClick={onComplete}>
          Completar y enviar
        </Button>
      </Card>
    </div>
  );
}
