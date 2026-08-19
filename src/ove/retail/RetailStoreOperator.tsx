import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  List,
  Progress,
  Row,
  Segmented,
  Space,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  MobileOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { advanceDemoClock } from "../../demo-config/clock";
import {
  confirmStoreResolution,
  reportSupportCase,
  requestEscalation,
  startDiagnostic,
} from "../retail-domain";
import { useStore } from "../store";
import type { StoreAssignment, SupportCase } from "../types";
import { formatShortDate } from "./retail-format";
import { AssignmentStatusTag, PriorityTag, SupportStatusTag } from "./retail-ui";
import { StoreSupportRequestModal } from "./StoreSupportRequestModal";
import { RetailMobileStoreApp } from "./RetailMobileStoreApp";

const CASE_ID = "RTL-SUP-2048";
const PRIMARY_ASSIGNMENT_ID = "RTL-ASG-1024";
const STORE = "Boutique Norte";

export function RetailStoreOperator() {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className={`retail-store-channel retail-store-channel-${viewMode}`}>
      <div className="retail-store-channel-switch">
        <div>
          <Typography.Text strong>Mi tienda</Typography.Text>
          <Typography.Text type="secondary">Mismo programa, dos contextos de uso</Typography.Text>
        </div>
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as "desktop" | "mobile")}
          options={[
            { label: "Escritorio", value: "desktop", icon: <DesktopOutlined /> },
            { label: "Móvil", value: "mobile", icon: <MobileOutlined /> },
          ]}
        />
      </div>
      {viewMode === "desktop" ? <RetailStoreDesktop /> : <RetailMobileStoreApp />}
    </div>
  );
}

function RetailStoreDesktop() {
  const { storeAssignments, setStoreAssignments, supportCases, setSupportCases, protocols } =
    useStore();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(PRIMARY_ASSIGNMENT_ID);
  const [mobileFocus, setMobileFocus] = useState<"home" | "task">("home");
  const [mobileTab, setMobileTab] = useState<"program" | "support">("program");
  const [requestOpen, setRequestOpen] = useState(false);

  const storeProgram = useMemo(
    () =>
      storeAssignments
        .filter((item) => item.storeLabel === STORE)
        .sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    [storeAssignments],
  );
  const storeCases = useMemo(
    () => supportCases.filter((item) => item.storeLabel === STORE && item.status !== "Draft"),
    [supportCases],
  );
  const assignment =
    storeAssignments.find((item) => item.id === selectedAssignmentId) ?? storeProgram[0];
  const supportCase = supportCases.find((item) => item.id === CASE_ID);
  const protocol = protocols.find((item) => item.id === assignment?.protocolId);
  const isPrimaryAssignment = assignment?.id === PRIMARY_ASSIGNMENT_ID;

  const replaceCase = (next: SupportCase) =>
    setSupportCases(supportCases.map((item) => (item.id === next.id ? next : item)));

  const updateAssignment = (
    target: StoreAssignment,
    status: StoreAssignment["status"],
    progress: number,
  ) =>
    setStoreAssignments(
      storeAssignments.map((item) =>
        item.id === target.id ? { ...item, status, progress } : item,
      ),
    );

  const openAssignment = (target: StoreAssignment) => {
    setSelectedAssignmentId(target.id);
    setMobileFocus("task");
    if (target.status === "Assigned") updateAssignment(target, "Acknowledged", target.progress);
  };

  const startOpening = () => {
    if (!assignment) return;
    updateAssignment(assignment, "InProgress", 42);
    message.success("Protocolo iniciado; ubicación y hora registradas");
  };

  const sendSupport = () => {
    if (!supportCase || !assignment) return;
    replaceCase(
      reportSupportCase(supportCase, advanceDemoClock(2).toISOString(), "Valeria Santos"),
    );
    updateAssignment(assignment, "InProgress", 68);
    message.success("Solicitud enviada sin abandonar el protocolo de apertura");
  };

  const beginDiagnosis = () => {
    if (!supportCase) return;
    replaceCase(startDiagnostic(supportCase, advanceDemoClock(2).toISOString(), "Valeria Santos"));
  };

  const escalate = () => {
    if (!supportCase) return;
    replaceCase(
      requestEscalation(supportCase, advanceDemoClock(7).toISOString(), "Valeria Santos"),
    );
    message.warning("Soporte recibió el resultado; no se realizarán maniobras técnicas en tienda");
  };

  const confirm = () => {
    if (!supportCase || !assignment) return;
    replaceCase(
      confirmStoreResolution(supportCase, advanceDemoClock(2).toISOString(), "Valeria Santos"),
    );
    updateAssignment(assignment, "Submitted", 100);
    message.success("Operación confirmada; soporte realizará la validación final");
  };

  if (!assignment || !supportCase || !protocol) return null;

  const phase = operatorPhase(assignment.status, supportCase.status);
  const pendingAssignments = storeProgram.filter(
    (item) => !["Completed", "Validated", "Submitted"].includes(item.status),
  ).length;
  const activeCases = storeCases.filter((item) => item.status !== "Closed").length;

  return (
    <div className={`retail-operator-view mobile-${mobileFocus}`}>
      <section className="retail-mobile-launchpad">
        <div className="retail-mobile-hero">
          <div>
            <Typography.Text>MI TIENDA</Typography.Text>
            <Typography.Title level={2}>{STORE}</Typography.Title>
            <Typography.Paragraph>
              Hola, Valeria. Esto requiere tu atención hoy.
            </Typography.Paragraph>
          </div>
          <Tag color="green">En línea</Tag>
        </div>
        <Button
          block
          size="large"
          type="primary"
          icon={<CustomerServiceOutlined />}
          onClick={() => setRequestOpen(true)}
          className="retail-mobile-support-cta"
        >
          Solicitar asistencia
        </Button>
        <div className="retail-mobile-summary-grid">
          <Card size="small">
            <UnorderedListOutlined />
            <b>{pendingAssignments}</b>
            <span>Asignaciones pendientes</span>
          </Card>
          <Card size="small">
            <CustomerServiceOutlined />
            <b>{activeCases}</b>
            <span>Solicitudes activas</span>
          </Card>
        </div>
        <Segmented
          block
          value={mobileTab}
          onChange={(value) => setMobileTab(value as "program" | "support")}
          options={[
            { label: "Programa", value: "program", icon: <UnorderedListOutlined /> },
            { label: "Soporte", value: "support", icon: <CustomerServiceOutlined /> },
          ]}
        />
        {mobileTab === "program" ? (
          <List
            className="retail-mobile-list"
            dataSource={storeProgram}
            locale={{ emptyText: "No tienes asignaciones" }}
            renderItem={(item) => {
              const itemProtocol = protocols.find((candidate) => candidate.id === item.protocolId);
              return (
                <List.Item>
                  <Card className="retail-mobile-record-card">
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <Space wrap>
                        <AssignmentStatusTag status={item.status} />
                        <Typography.Text type="secondary">
                          {formatShortDate(item.dueAt)}
                        </Typography.Text>
                      </Space>
                      <Typography.Title level={4}>
                        {itemProtocol?.name ?? item.protocolId}
                      </Typography.Title>
                      <Typography.Text type="secondary">{item.id}</Typography.Text>
                      <Progress percent={item.progress} size="small" />
                      <Button
                        block
                        type="primary"
                        disabled={["Completed", "Validated", "Submitted"].includes(item.status)}
                        onClick={() => openAssignment(item)}
                      >
                        {item.status === "InProgress"
                          ? "Continuar"
                          : item.status === "Completed"
                            ? "Completada"
                            : "Atender"}
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              );
            }}
          />
        ) : (
          <List
            className="retail-mobile-list"
            dataSource={storeCases}
            locale={{ emptyText: "No hay solicitudes de soporte" }}
            renderItem={(item) => (
              <List.Item>
                <Card className="retail-mobile-record-card">
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space wrap>
                      <PriorityTag priority={item.confirmedPriority ?? item.suggestedPriority} />
                      <SupportStatusTag status={item.status} />
                    </Space>
                    <Typography.Title level={4}>{item.title}</Typography.Title>
                    <Typography.Text type="secondary">
                      {item.id} · {item.currentOwner}
                    </Typography.Text>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </section>

      <div className="retail-operator-shell">
        <aside className="retail-store-context">
          <Typography.Text className="retail-eyebrow retail-eyebrow-light">
            MI TIENDA
          </Typography.Text>
          <Typography.Title level={2}>{STORE}</Typography.Title>
          <Typography.Paragraph>
            Tu operación diaria, evidencias y soporte en un mismo recorrido.
          </Typography.Paragraph>
          <div className="retail-context-chip">
            <ShopOutlined />
            <span>
              <b>{pendingAssignments} actividades pendientes</b>
              <small>Programa recibido y sincronizado</small>
            </span>
          </div>
          <div className="retail-context-chip">
            <EnvironmentOutlined />
            <span>
              <b>Ubicación verificada</b>
              <small>Dentro del radio permitido</small>
            </span>
          </div>
          <div className="retail-context-chip">
            <SafetyCertificateOutlined />
            <span>
              <b>Reglas de seguridad</b>
              <small>Sin intervención técnica en tienda</small>
            </span>
          </div>
          <Button
            ghost
            size="large"
            icon={<CustomerServiceOutlined />}
            onClick={() => setRequestOpen(true)}
            className="retail-context-support-button"
          >
            Solicitar asistencia
          </Button>
          <div className="retail-context-bottom">
            <Tag color="green">En línea</Tag>
            <span>Valeria Santos</span>
          </div>
        </aside>

        <main className="retail-store-workspace">
          <div className="retail-mobile-task-nav">
            <Button icon={<ArrowLeftOutlined />} onClick={() => setMobileFocus("home")}>
              Mi programa
            </Button>
            <Button
              type="text"
              icon={<CustomerServiceOutlined />}
              onClick={() => setRequestOpen(true)}
            >
              Soporte
            </Button>
          </div>
          <div className="retail-page-heading">
            <div>
              <Typography.Text className="retail-eyebrow">PROGRAMA DEL DÍA</Typography.Text>
              <Typography.Title level={2}>{protocol.name}</Typography.Title>
              <Typography.Paragraph type="secondary">
                Atiende la asignación y solicita apoyo cuando una condición lo requiera.
              </Typography.Paragraph>
            </div>
            <Space wrap>
              <AssignmentStatusTag status={assignment.status} />
              <Button icon={<CustomerServiceOutlined />} onClick={() => setRequestOpen(true)}>
                Solicitar asistencia
              </Button>
            </Space>
          </div>

          {isPrimaryAssignment ? (
            <PrimaryAssignment
              assignment={assignment}
              protocol={protocol}
              supportCase={supportCase}
              phase={phase}
              onStart={startOpening}
              onSendSupport={sendSupport}
              onBeginDiagnosis={beginDiagnosis}
              onEscalate={escalate}
              onConfirm={confirm}
            />
          ) : (
            <GenericAssignment
              assignment={assignment}
              protocolName={protocol.name}
              protocolDescription={protocol.description}
              estimatedMinutes={protocol.estimatedMinutes}
              comments={assignment.comments}
              onStart={() => updateAssignment(assignment, "InProgress", 35)}
              onComplete={() => {
                updateAssignment(assignment, "Completed", 100);
                message.success("Asignación completada y enviada");
                setMobileFocus("home");
              }}
            />
          )}
        </main>
      </div>

      <StoreSupportRequestModal
        open={requestOpen}
        onCancel={() => setRequestOpen(false)}
        defaultAssignmentId={assignment.id}
        onCreated={() => {
          setRequestOpen(false);
          setMobileTab("support");
          setMobileFocus("home");
        }}
      />
    </div>
  );
}

type PrimaryProps = {
  assignment: StoreAssignment;
  protocol: { name: string; description: string };
  supportCase: SupportCase;
  phase: number;
  onStart: () => void;
  onSendSupport: () => void;
  onBeginDiagnosis: () => void;
  onEscalate: () => void;
  onConfirm: () => void;
};

function PrimaryAssignment({
  assignment,
  protocol,
  supportCase,
  phase,
  onStart,
  onSendSupport,
  onBeginDiagnosis,
  onEscalate,
  onConfirm,
}: PrimaryProps) {
  return (
    <>
      <Card className="retail-primary-task-card">
        <Space wrap size={12}>
          <Tag color="purple">{assignment.id}</Tag>
          <Tag>v{assignment.protocolVersion}</Tag>
          <SupportStatusTag status={supportCase.status} />
        </Space>
        <Typography.Title level={3}>{protocol.name}</Typography.Title>
        <Typography.Paragraph type="secondary">{protocol.description}</Typography.Paragraph>
        <Progress
          percent={assignment.progress}
          strokeColor={{ "0%": "#7041da", "100%": "#3457e8" }}
        />
        <Steps
          current={phase}
          responsive
          items={[
            { title: "Recibida" },
            { title: "Revisión" },
            { title: "Soporte" },
            { title: "Confirmación" },
          ]}
        />
      </Card>

      {(["Assigned", "Acknowledged"] as string[]).includes(assignment.status) && (
        <Card className="retail-action-stage" title="Todo listo para comenzar">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Metric icon={<EnvironmentOutlined />} label="Ubicación" value="Verificada" />
            </Col>
            <Col xs={24} md={8}>
              <Metric icon={<CameraOutlined />} label="Evidencia" value="1 foto requerida" />
            </Col>
            <Col xs={24} md={8}>
              <Metric icon={<SafetyCertificateOutlined />} label="Duración" value="18 minutos" />
            </Col>
          </Row>
          <Divider />
          <Button size="large" type="primary" icon={<PlayCircleOutlined />} onClick={onStart}>
            Iniciar protocolo
          </Button>
        </Card>
      )}

      {assignment.status === "InProgress" && supportCase.status === "Draft" && (
        <Card className="retail-action-stage" title="Condición de climatización">
          <Alert
            showIcon
            type="warning"
            icon={<WarningOutlined />}
            message="Desviación detectada: 27.8 °C"
            description="El rango de apertura esperado es 22–24 °C y el flujo de aire se percibe bajo."
          />
          <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} style={{ marginTop: 18 }}>
            <Descriptions.Item label="Control">Encendido</Descriptions.Item>
            <Descriptions.Item label="Set point">22 °C</Descriptions.Item>
            <Descriptions.Item label="Flujo">Bajo</Descriptions.Item>
            <Descriptions.Item label="Evidencia">Foto y hora vinculadas</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Space wrap>
            <Button>Continuar sin reportar</Button>
            <Button
              size="large"
              type="primary"
              danger
              icon={<CustomerServiceOutlined />}
              onClick={onSendSupport}
            >
              Solicitar apoyo
            </Button>
          </Space>
        </Card>
      )}

      {supportCase.status === "Reported" && (
        <Card className="retail-action-stage">
          <Alert
            showIcon
            type="info"
            message="Solicitud recibida por el centro de soporte"
            description="Puedes continuar las actividades seguras de apertura. Soporte asignará el siguiente paso aquí mismo."
          />
          <Descriptions size="small" column={2} style={{ marginTop: 18 }}>
            <Descriptions.Item label="Caso">{supportCase.id}</Descriptions.Item>
            <Descriptions.Item label="Prioridad sugerida">
              {supportCase.suggestedPriority}
            </Descriptions.Item>
            <Descriptions.Item label="Protocolo origen">{protocol.name}</Descriptions.Item>
            <Descriptions.Item label="Estado de apertura">En progreso</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {(supportCase.status === "DiagnosticProtocolAssigned" ||
        supportCase.status === "Diagnosing") && (
        <Card className="retail-action-stage" title="Diagnóstico seguro guiado">
          <Alert
            showIcon
            type="info"
            message="Realiza sólo verificaciones visibles"
            description="No abras gabinetes, no retires protecciones y no intervengas conexiones eléctricas."
          />
          <div className="retail-checklist">
            <CheckLine done label="Confirmar que el control está encendido" />
            <CheckLine
              done={supportCase.status === "Diagnosing"}
              label="Confirmar temperatura configurada en 22 °C"
            />
            <CheckLine
              done={supportCase.status === "Diagnosing"}
              label="Registrar flujo de aire bajo"
            />
          </div>
          {supportCase.status === "DiagnosticProtocolAssigned" ? (
            <Button type="primary" onClick={onBeginDiagnosis}>
              Iniciar verificaciones
            </Button>
          ) : (
            <Button type="primary" danger onClick={onEscalate}>
              El problema continúa
            </Button>
          )}
        </Card>
      )}

      {supportCase.status === "EscalationRequired" && (
        <Card className="retail-action-stage">
          <Alert
            showIcon
            type="warning"
            message="Intervención solicitada"
            description="El centro de soporte seleccionará el recurso adecuado y te notificará la ventana de atención."
          />
        </Card>
      )}
      {supportCase.status === "ExternalAssigned" && (
        <Card className="retail-action-stage">
          <Alert
            showIcon
            type="success"
            message="Proveedor programado"
            description={`Responsable actual: ${supportCase.currentOwner}. La solicitud permanece vinculada a tu apertura.`}
          />
        </Card>
      )}
      {supportCase.status === "PendingStoreConfirmation" && (
        <Card className="retail-action-stage" title="Confirma el resultado">
          <Alert
            showIcon
            type="success"
            message="Intervención concluida"
            description={supportCase.resolutionSummary}
          />
          <Divider />
          <Button size="large" type="primary" icon={<CheckCircleOutlined />} onClick={onConfirm}>
            Confirmar operación restablecida
          </Button>
        </Card>
      )}
      {supportCase.status === "PendingSupportValidation" && (
        <Card className="retail-action-stage">
          <Alert
            showIcon
            type="success"
            message="Confirmación enviada"
            description="Tu protocolo quedó enviado y el centro de soporte realizará el cierre final."
          />
        </Card>
      )}
      {supportCase.status === "Closed" && (
        <Card className="retail-action-stage">
          <Alert
            showIcon
            type="success"
            message="Solicitud cerrada"
            description="La trazabilidad conserva protocolo, evidencia, diagnóstico, intervención y confirmación de tienda."
          />
        </Card>
      )}
    </>
  );
}

function GenericAssignment({
  assignment,
  protocolName,
  protocolDescription,
  estimatedMinutes,
  comments,
  onStart,
  onComplete,
}: {
  assignment: StoreAssignment;
  protocolName: string;
  protocolDescription: string;
  estimatedMinutes?: number;
  comments?: string;
  onStart: () => void;
  onComplete: () => void;
}) {
  const inProgress = assignment.status === "InProgress";
  const completed = ["Completed", "Validated", "Submitted"].includes(assignment.status);
  return (
    <>
      <Card className="retail-primary-task-card">
        <Space wrap>
          <Tag color="purple">{assignment.id}</Tag>
          <AssignmentStatusTag status={assignment.status} />
        </Space>
        <Typography.Title level={3}>{protocolName}</Typography.Title>
        <Typography.Paragraph type="secondary">{protocolDescription}</Typography.Paragraph>
        <Descriptions size="small" column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="Objetivo">
            {formatShortDate(assignment.dueAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Duración">{estimatedMinutes ?? 15} min</Descriptions.Item>
          <Descriptions.Item label="Validación">
            {assignment.requiresValidation ? "Requerida" : "Automática"}
          </Descriptions.Item>
        </Descriptions>
        {comments && (
          <Alert
            type="info"
            showIcon
            message="Instrucciones de gerencia"
            description={comments}
            style={{ marginTop: 14 }}
          />
        )}
        <Progress percent={assignment.progress} />
      </Card>
      <Card className="retail-action-stage" title="Ejecución guiada">
        {completed ? (
          <Alert
            type="success"
            showIcon
            message="Asignación completada"
            description="El resultado fue enviado al programa de la tienda."
          />
        ) : (
          <>
            <div className="retail-checklist">
              <CheckLine done={inProgress} label="Confirmar área y condiciones iniciales" />
              <CheckLine done={inProgress} label="Completar las verificaciones del protocolo" />
              <CheckLine done={false} label="Registrar resultado y evidencia" />
            </div>
            {!inProgress ? (
              <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={onStart}>
                Iniciar asignación
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={onComplete}
              >
                Completar y enviar
              </Button>
            )}
          </>
        )}
      </Card>
    </>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="retail-metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}

function CheckLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`retail-check-line ${done ? "is-done" : ""}`}>
      <CheckCircleOutlined />
      <span>{label}</span>
    </div>
  );
}

function operatorPhase(assignmentStatus: string, caseStatus: string) {
  if (["PendingStoreConfirmation", "PendingSupportValidation", "Closed"].includes(caseStatus))
    return 3;
  if (caseStatus !== "Draft") return 2;
  if (assignmentStatus === "InProgress") return 1;
  return 0;
}
