import { useMemo, useState } from "react";
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
  CheckCircleFilled,
  CustomerServiceOutlined,
  EditOutlined,
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
                        {item.actionLabel === "Atender recepción" && (
                          <Button
                            type="link"
                            style={{ padding: 0 }}
                            onClick={() => {
                              const receipt = assignments.find(
                                (assignment) =>
                                  assignment.protocolId === "retail-merchandise-receipt",
                              );
                              if (receipt) openAssignment(receipt);
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
  const [capturedAt] = useState(() => advanceDemoClock(1));
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
          <button
            type="button"
            className={`retail-receipt-photo ${photo ? "is-captured" : ""}`}
            onClick={() => setPhoto(true)}
          >
            {photo ? <CheckCircleFilled /> : <CameraOutlined />}
            <b>{photo ? "Foto capturada" : "Tomar foto"}</b>
            <span>
              {photo ? "48 paquetes · Muelle de tienda" : "Incluye paquetes y condición visible"}
            </span>
          </button>
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
          <button
            type="button"
            className={`retail-signature-pad ${signed ? "is-signed" : ""}`}
            onClick={() => setSigned(true)}
          >
            {signed ? <span>Valeria Santos</span> : <EditOutlined />}
            <b>{signed ? "Firma registrada" : "Toca para firmar"}</b>
          </button>
          <Checkbox checked={signed} onChange={(event) => setSigned(event.target.checked)}>
            Confirmo los datos registrados
          </Checkbox>
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
