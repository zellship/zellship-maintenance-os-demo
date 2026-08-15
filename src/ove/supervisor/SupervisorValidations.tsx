import { useEffect, useState } from "react";
import {
  Card,
  Typography,
  List,
  Button,
  Space,
  Tag,
  Descriptions,
  Input,
  message,
  Empty,
  Progress,
  Alert,
  Image,
  Rate,
  Statistic,
  Avatar,
} from "antd";
import {
  AlertOutlined,
  AuditOutlined,
  CameraOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { demoNow } from "../../demo-config/clock";
import { useStore } from "../store";
import { maintenanceCapturedUrl, maintenanceReferenceUrl } from "../shared/maintenanceAssets";
import { PrintReportFooter, PrintReportHeader } from "../shared/PrintReport";
import { SendReportModal, type ReportDeliverySelection } from "../shared/SendReportModal";
import type { Notification } from "../types";
import { activeDemo } from "../../demo-config/active";
import { canRejectExecution } from "../domain";

export function SupervisorValidations({
  initialSelectedId,
}: {
  initialSelectedId?: string | null;
}) {
  const {
    executions,
    setExecutions,
    protocols,
    schedules,
    setSchedules,
    incidents,
    setIncidents,
    notifications,
    setNotifications,
    role,
  } = useStore();
  const pending = executions.filter((e) => e.status === "PendingValidation");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId ?? pending[0]?.id ?? null,
  );
  const [comments, setComments] = useState("");
  const [sendModalOpen, setSendModalOpen] = useState(false);

  const exec = executions.find((e) => e.id === selectedId) || pending[0];
  const proto = exec ? protocols.find((p) => p.id === exec.protocolId) : null;
  const schedule = exec ? schedules.find((item) => item.id === exec.scheduleId) : null;
  const averagePendingScore = pending.length
    ? Math.round(pending.reduce((sum, item) => sum + Number(item.score ?? 94), 0) / pending.length)
    : 0;
  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Closed" && incident.status !== "Resolved",
  );
  const photoEvidence = exec?.evidences.find((evidence) => evidence.type === "Photo");
  const gpsEvidence = exec?.evidences.find((evidence) => evidence.type === "GPS");
  const decisionActor =
    activeDemo.context.loginProfiles.find((profile) => profile.role === role)?.name ??
    (role === "admin" ? "Coordinación" : "Supervisión");
  const canReject = canRejectExecution(role);

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  const printReport = () => {
    if (!exec) return;
    const previousTitle = document.title;
    document.title = `Reporte de inspección ${proto?.name ?? exec.id}`;
    window.print();
    document.title = previousTitle;
  };

  const sendReport = ({ contact, channels }: ReportDeliverySelection) => {
    if (!exec) return;
    const sentAt = Date.now();
    const notices: Notification[] = channels.map((channel, index) => ({
      id: `n-report-${sentAt}-${index}`,
      type: "Completed",
      channel,
      actor: decisionActor,
      recipientRole: contact.role,
      recipient: contact.name,
      source: "OnDemand",
      event: "Envío de reporte simulado",
      message: `${proto?.name ?? "Mantenimiento"}: simulación de entrega del reporte de ${exec.operator} con calificación de ${exec.score ?? 94}%.`,
      status: "Sent",
      createdAt: demoNow().toISOString(),
    }));
    setNotifications([...notices, ...notifications]);
    message.success(
      `Envío simulado a ${contact.name} por ${channels
        .map((channel) => (channel === "Email" ? "correo" : "WhatsApp"))
        .join(" y ")}`,
    );
  };

  const decide = (decision: "Approved" | "Rejected") => {
    if (!exec) return;
    if (decision === "Rejected" && !canReject) {
      message.error("Coordinación puede aprobar o reabrir, pero no rechazar internamente.");
      return;
    }
    if (decision === "Rejected" && !comments.trim()) {
      message.warning("Comentario obligatorio para rechazar");
      return;
    }
    setExecutions(
      executions.map((e) =>
        e.id === exec.id
          ? {
              ...e,
              status: decision === "Approved" ? "Validated" : "Rejected",
              approval: {
                supervisor: decisionActor,
                decision,
                comments,
                at: demoNow().toISOString(),
              },
              score: e.score ?? 94,
            }
          : e,
      ),
    );
    if (decision === "Rejected") {
      setIncidents([
        {
          id: `i${Date.now()}`,
          executionId: exec.id,
          protocolId: exec.protocolId,
          type: "Rejected",
          status: "Open",
          description: comments || "Ejecución rechazada por supervisor.",
          createdAt: demoNow().toISOString(),
        },
        ...incidents,
      ]);
    }
    const notice: Notification = {
      id: `n-decision-${Date.now()}`,
      type: decision === "Approved" ? "Completed" : "Incident",
      channel: "WhatsApp",
      actor: decisionActor,
      recipientRole: "operator",
      recipient: exec.operator,
      source: "Automatic",
      event: decision === "Approved" ? "Ejecución aprobada" : "Ejecución rechazada",
      message: `${proto?.name ?? "Mantenimiento"}: ${decision === "Approved" ? `aprobado con ${exec.score ?? 94}%` : "requiere corrección"}.`,
      status: "Sent",
      createdAt: demoNow().toISOString(),
    };
    setNotifications([notice, ...notifications]);
    setComments("");
    setSelectedId(null);
    message.success(decision === "Approved" ? "Ejecución aprobada" : "Ejecución rechazada");
  };

  const reopen = () => {
    if (!exec || !schedule) return;
    if (!comments.trim()) {
      message.warning("Indica la corrección requerida antes de reabrir.");
      return;
    }
    const reopenedAt = demoNow().toISOString();
    setExecutions(
      executions.map((item) =>
        item.id === exec.id
          ? {
              ...item,
              status: "Reopened",
              reopenedAt,
              reopenedBy: decisionActor,
              reopenReason: comments,
            }
          : item,
      ),
    );
    setSchedules(
      schedules.map((item) => (item.id === schedule.id ? { ...item, status: "Pending" } : item)),
    );
    setNotifications([
      {
        id: `n-reopen-${Date.now()}`,
        type: "Incident",
        channel: "Push",
        actor: decisionActor,
        recipientRole: "operator",
        recipient: exec.operator,
        source: "OnDemand",
        event: "Ejecución reabierta",
        message: `${schedule.workOrder}: requiere corrección y reenvío. R${exec.revision ?? 1} se conserva.`,
        status: "Sent",
        createdAt: reopenedAt,
      },
      ...notifications,
    ]);
    setComments("");
    setSelectedId(null);
    message.success(`${schedule.workOrder} reabierta · revisión anterior conservada`);
  };

  return (
    <div className="supervisor-control">
      <div className="supervisor-control-header">
        <div>
          <Space size={8} className="supervisor-eyebrow">
            <span className="live-dot" />
            {role === "admin" ? "COORDINACIÓN" : "SUPERVISIÓN"} · CONTROL DE CALIDAD
          </Space>
          <Typography.Title level={2}>Revisión y decisiones</Typography.Title>
          <Typography.Text type="secondary">
            Prioriza excepciones, contrasta evidencias y libera el mantenimiento con trazabilidad.
          </Typography.Text>
        </div>
        <Tag icon={<ClockCircleOutlined />} color="purple">
          Objetivo de revisión · 15 min
        </Tag>
      </div>

      <div className="supervisor-summary-grid">
        <Card size="small" className="supervisor-summary-card pending">
          <Avatar icon={<AuditOutlined />} />
          <Statistic title="Pendientes de decisión" value={pending.length} />
          <Typography.Text type="secondary">Cola activa de supervisión</Typography.Text>
        </Card>
        <Card size="small" className="supervisor-summary-card quality">
          <Avatar icon={<SafetyCertificateOutlined />} />
          <Statistic title="Calidad promedio" value={averagePendingScore} suffix="%" />
          <Typography.Text type="secondary">Calificación automática</Typography.Text>
        </Card>
        <Card size="small" className="supervisor-summary-card risk">
          <Avatar icon={<AlertOutlined />} />
          <Statistic title="Incidencias abiertas" value={openIncidents.length} />
          <Typography.Text type="secondary">Requieren seguimiento</Typography.Text>
        </Card>
      </div>

      <div className="supervisor-validation-grid">
        <Card
          className="supervisor-queue-card"
          title="Cola de validación"
          extra={
            <Tag color={pending.length ? "orange" : "green"}>
              {pending.length} {pending.length === 1 ? "pendiente" : "pendientes"}
            </Tag>
          }
        >
          {pending.length === 0 ? (
            <Empty description="Sin revisiones pendientes" />
          ) : (
            <List
              dataSource={pending}
              renderItem={(item) => {
                const protocol = protocols.find((candidate) => candidate.id === item.protocolId);
                const itemSchedule = schedules.find(
                  (candidate) => candidate.id === item.scheduleId,
                );
                return (
                  <List.Item
                    className={`supervisor-queue-item ${item.id === exec?.id ? "selected" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="supervisor-queue-time">
                      <strong>{dayjs(item.startAt).format("HH:mm")}</strong>
                      <span>Hoy</span>
                    </div>
                    <div className="supervisor-queue-copy">
                      <Typography.Text strong>{protocol?.name}</Typography.Text>
                      <Typography.Text type="secondary">
                        {itemSchedule?.workOrder ?? item.id} ·{" "}
                        {itemSchedule?.assetId ?? "Sin activo"}
                      </Typography.Text>
                      <Space size={6} wrap>
                        <Tag icon={<UserOutlined />}>{item.operator}</Tag>
                        <Tag color="orange">Por validar</Tag>
                      </Space>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        {exec && proto ? (
          <Card
            className="supervisor-validation-report supervisor-review-card"
            title={
              <div>
                <Typography.Text strong>Expediente de validación</Typography.Text>
                <Typography.Text type="secondary" className="supervisor-card-subtitle">
                  {schedule?.workOrder ?? exec.id} · {schedule?.assetId ?? "Sin activo"}
                </Typography.Text>
              </div>
            }
            extra={
              <Space className="validation-report-actions" wrap>
                <Button icon={<PrinterOutlined />} onClick={printReport}>
                  Imprimir
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => setSendModalOpen(true)}
                >
                  Enviar reporte
                </Button>
              </Space>
            }
          >
            <PrintReportHeader
              documentTitle="Reporte de inspección"
              subject={proto.name}
              metadata={[
                { label: "Orden", value: schedule?.workOrder ?? exec.id },
                { label: "Activo", value: schedule?.assetId ?? "Sin activo" },
                { label: "Inspector", value: decisionActor },
                { label: "Estado", value: "Pendiente de validación" },
              ]}
            />

            <div className="supervisor-report-hero">
              <div>
                <Space size={8} wrap>
                  <Tag color="orange">Pendiente de validación</Tag>
                  <Tag>{dayjs(exec.startAt).format("DD/MM/YYYY · HH:mm")}</Tag>
                </Space>
                <Typography.Title level={3}>{proto.name}</Typography.Title>
                <Space size={[8, 8]} wrap>
                  <Tag icon={<UserOutlined />}>{exec.operator}</Tag>
                  <Tag icon={<EnvironmentOutlined />}>{schedule?.plant ?? "Planta"}</Tag>
                  <Tag icon={<CameraOutlined />}>{exec.evidences.length} evidencias</Tag>
                </Space>
              </div>
              <div className="supervisor-score">
                <Progress
                  type="circle"
                  size={94}
                  percent={exec.score ?? 94}
                  strokeColor="#7B35C1"
                  trailColor="#eee9f4"
                />
                <Typography.Text type="secondary">Calificación automática</Typography.Text>
              </div>
            </div>

            <Alert
              className="supervisor-score-alert"
              type={Number(exec.score) >= 90 ? "success" : "warning"}
              showIcon
              message="Resultado listo para decisión"
              description="La calificación combina formulario, evidencia, ubicación, ventana de ejecución y reglas del estándar."
            />

            <div className="supervisor-review-grid">
              <section className="supervisor-review-panel evidence">
                <div className="supervisor-panel-heading">
                  <div>
                    <Typography.Text strong>1. Evidencia</Typography.Text>
                    <Typography.Text type="secondary">Contraste contra el estándar</Typography.Text>
                  </div>
                  <Tag color="purple">IA {photoEvidence?.aiScore ?? 86}%</Tag>
                </div>

                <div className="supervisor-evidence-facts">
                  <div>
                    <Avatar icon={<EnvironmentOutlined />} />
                    <span>
                      <small>Ubicación</small>
                      <strong>{gpsEvidence ? "GPS simulado" : "Sin GPS"}</strong>
                    </span>
                  </div>
                  <div>
                    <Avatar icon={<CameraOutlined />} />
                    <span>
                      <small>Captura</small>
                      <strong>{photoEvidence ? "Foto simulada" : "Sin fotografía"}</strong>
                    </span>
                  </div>
                </div>

                {photoEvidence ? (
                  <div className="supervisor-photo-comparison">
                    <figure>
                      <Image preview={false} src={maintenanceReferenceUrl} alt="Patrón visual" />
                      <figcaption>Patrón</figcaption>
                    </figure>
                    <figure>
                      <Image
                        preview={false}
                        src={maintenanceCapturedUrl}
                        alt="Captura del operador"
                      />
                      <figcaption>Captura</figcaption>
                    </figure>
                  </div>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin evidencia visual" />
                )}

                <div className="supervisor-ai-rating">
                  <span>
                    Coincidencia simulada <b>{photoEvidence?.aiScore ?? 86}%</b>
                  </span>
                  <Rate disabled value={photoEvidence?.humanScore ?? 4} />
                </div>
              </section>

              <section className="supervisor-review-panel form">
                <div className="supervisor-panel-heading">
                  <div>
                    <Typography.Text strong>2. Formulario</Typography.Text>
                    <Typography.Text type="secondary">Lecturas y respuestas</Typography.Text>
                  </div>
                  <Tag color="green">Completo</Tag>
                </div>
                <Descriptions column={1} bordered size="small">
                  {proto.formConfig
                    .filter((field) => field.type !== "separator")
                    .map((field) => (
                      <Descriptions.Item key={field.id} label={field.label}>
                        {String(exec.formAnswers[field.id] ?? "—")}
                      </Descriptions.Item>
                    ))}
                </Descriptions>
              </section>

              <section className="supervisor-review-panel decision">
                <div className="supervisor-panel-heading">
                  <div>
                    <Typography.Text strong>3. Decisión</Typography.Text>
                    <Typography.Text type="secondary">Liberación del mantenimiento</Typography.Text>
                  </div>
                  <Tag color="orange">Pendiente</Tag>
                </div>

                <div className="supervisor-decision-checks">
                  <div>
                    <CheckOutlined /> Evidencias completas
                  </div>
                  <div>
                    <CheckOutlined /> Registro GPS simulado presente
                  </div>
                  <div>
                    <CheckOutlined /> Formulario respondido
                  </div>
                </div>

                <Input.TextArea
                  className="validation-comments-input"
                  placeholder="Agrega una observación. Es obligatoria para rechazar."
                  rows={4}
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                />
                {!canReject && (
                  <Alert
                    type="info"
                    showIcon
                    message="Coordinación puede aprobar o reabrir"
                    description="El rechazo interno permanece reservado para Supervisión."
                  />
                )}
                <div className="validation-decision-actions supervisor-decision-actions">
                  {canReject && (
                    <Button icon={<AlertOutlined />} danger onClick={() => decide("Rejected")}>
                      Generar incidencia
                    </Button>
                  )}
                  {canReject && (
                    <Button icon={<CloseOutlined />} onClick={() => decide("Rejected")}>
                      Rechazar
                    </Button>
                  )}
                  <Button onClick={reopen}>Reabrir para corregir</Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => decide("Approved")}
                  >
                    Aprobar y liberar
                  </Button>
                </div>
              </section>
            </div>

            <PrintReportFooter />
            <SendReportModal
              open={sendModalOpen}
              reportName={`Reporte de inspección · ${schedule?.workOrder ?? exec.id}`}
              onCancel={() => setSendModalOpen(false)}
              onSend={sendReport}
            />
          </Card>
        ) : (
          <Card className="supervisor-review-empty">
            <Empty description="Selecciona una ejecución para validar" />
          </Card>
        )}
      </div>
    </div>
  );
}
