import { useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  List,
  Button,
  Space,
  Tag,
  Descriptions,
  Input,
  message,
  Empty,
  Divider,
  Progress,
  Alert,
  Image,
  Rate,
} from "antd";
import { CheckOutlined, CloseOutlined, AlertOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { maintenanceCapturedUrl, maintenanceReferenceUrl } from "../shared/maintenanceAssets";
import type { Notification } from "../types";

export function SupervisorValidations() {
  const {
    executions,
    setExecutions,
    protocols,
    incidents,
    setIncidents,
    notifications,
    setNotifications,
  } = useStore();
  const pending = executions.filter((e) => e.status === "PendingValidation");
  const [selectedId, setSelectedId] = useState<string | null>(pending[0]?.id ?? null);
  const [comments, setComments] = useState("");

  const exec = executions.find((e) => e.id === selectedId) || pending[0];
  const proto = exec ? protocols.find((p) => p.id === exec.protocolId) : null;

  const decide = (decision: "Approved" | "Rejected") => {
    if (!exec) return;
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
                supervisor: "Roberto Salas",
                decision,
                comments,
                at: dayjs().toISOString(),
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
          createdAt: dayjs().toISOString(),
        },
        ...incidents,
      ]);
    }
    const notice: Notification = {
      id: `n-decision-${Date.now()}`,
      type: decision === "Approved" ? "Completed" : "Incident",
      channel: "WhatsApp",
      actor: "Roberto Salas",
      recipientRole: "operator",
      recipient: exec.operator,
      source: "Automatic",
      event: decision === "Approved" ? "Ejecución aprobada" : "Ejecución rechazada",
      message: `${proto?.name ?? "Mantenimiento"}: ${decision === "Approved" ? `aprobado con ${exec.score ?? 94}%` : "requiere corrección"}.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([notice, ...notifications]);
    setComments("");
    setSelectedId(null);
    message.success(decision === "Approved" ? "Ejecución aprobada" : "Ejecución rechazada");
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Validaciones
      </Typography.Title>
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card title={`Pendientes (${pending.length})`}>
            {pending.length === 0 ? (
              <Empty />
            ) : (
              <List
                dataSource={pending}
                renderItem={(e) => {
                  const p = protocols.find((x) => x.id === e.protocolId);
                  return (
                    <List.Item
                      style={{
                        cursor: "pointer",
                        background: e.id === selectedId ? "#f5f0ff" : undefined,
                        padding: 12,
                        borderRadius: 8,
                      }}
                      onClick={() => setSelectedId(e.id)}
                    >
                      <List.Item.Meta
                        title={p?.name}
                        description={
                          <>
                            {e.operator} · {dayjs(e.startAt).format("HH:mm")}
                          </>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        {exec && proto ? (
          <Col xs={24} md={16}>
            <Card title={proto.name} extra={<Tag color="orange">Pendiente validación</Tag>}>
              <Alert
                type={Number(exec.score) >= 90 ? "success" : "warning"}
                showIcon
                message={`Calificación automática: ${exec.score ?? 94}%`}
                description="Calculada con cumplimiento del formulario, evidencia, ubicación, ventana de ejecución y reglas del estándar."
                style={{ marginBottom: 16 }}
              />
              <Progress percent={exec.score ?? 94} strokeColor="#7B35C1" />
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Typography.Title level={5}>Evidencias</Typography.Title>
                  <Space wrap>
                    {exec.evidences.map((ev) => (
                      <Card key={ev.id} size="small" style={{ width: 140 }}>
                        <Tag color="purple">{ev.type}</Tag>
                        {ev.type === "Photo" && (
                          <Image
                            preview={false}
                            src={maintenanceCapturedUrl}
                            alt="Evidencia del activo"
                            style={{
                              height: 80,
                              objectFit: "cover",
                              borderRadius: 6,
                              marginTop: 6,
                            }}
                          />
                        )}
                        {ev.type === "GPS" && (
                          <div
                            style={{
                              height: 80,
                              background: "linear-gradient(135deg, #e6f7ff, #bae7ff)",
                              borderRadius: 6,
                              marginTop: 6,
                              padding: 4,
                              fontSize: 11,
                            }}
                          >
                            📍 {ev.data}
                          </div>
                        )}
                        {ev.type === "Signature" && (
                          <div
                            style={{
                              height: 80,
                              background: "#fafafa",
                              borderRadius: 6,
                              marginTop: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✍️
                          </div>
                        )}
                        {ev.type === "QR" && (
                          <div
                            style={{
                              height: 80,
                              background: "#fafafa",
                              borderRadius: 6,
                              marginTop: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            📱
                          </div>
                        )}
                      </Card>
                    ))}
                    {exec.evidences.length === 0 && (
                      <Typography.Text type="secondary">Sin evidencias</Typography.Text>
                    )}
                  </Space>
                  {exec.evidences.some((e) => e.type === "Photo") && (
                    <Card size="small" style={{ marginTop: 12, background: "#faf7ff" }}>
                      <Row gutter={8}>
                        <Col span={12}>
                          <Image
                            preview={false}
                            src={maintenanceReferenceUrl}
                            alt="Patrón visual"
                          />
                          <Typography.Text type="secondary">Patrón</Typography.Text>
                        </Col>
                        <Col span={12}>
                          <Image
                            preview={false}
                            src={maintenanceCapturedUrl}
                            alt="Captura del operador"
                          />
                          <Typography.Text type="secondary">Captura</Typography.Text>
                        </Col>
                      </Row>
                      <Divider style={{ margin: "10px 0" }} />
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <span>
                          IA:{" "}
                          <b>{exec.evidences.find((e) => e.type === "Photo")?.aiScore ?? 86}%</b>
                        </span>
                        <span>
                          Operador:{" "}
                          <Rate
                            disabled
                            value={exec.evidences.find((e) => e.type === "Photo")?.humanScore ?? 4}
                            style={{ fontSize: 13 }}
                          />
                        </span>
                      </Space>
                    </Card>
                  )}
                </Col>
                <Col xs={24} md={12}>
                  <Typography.Title level={5}>Formulario</Typography.Title>
                  <Descriptions column={1} bordered size="small">
                    {proto.formConfig
                      .filter((f) => f.type !== "separator")
                      .map((f) => (
                        <Descriptions.Item key={f.id} label={f.label}>
                          {String(exec.formAnswers[f.id] ?? "—")}
                        </Descriptions.Item>
                      ))}
                  </Descriptions>
                </Col>
              </Row>

              <Divider />
              <Input.TextArea
                placeholder="Comentarios (obligatorio si rechazas)"
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <Space style={{ marginTop: 12, width: "100%", justifyContent: "flex-end" }}>
                <Button icon={<AlertOutlined />} danger onClick={() => decide("Rejected")}>
                  Generar incidencia
                </Button>
                <Button icon={<CloseOutlined />} onClick={() => decide("Rejected")}>
                  Rechazar
                </Button>
                <Button type="primary" icon={<CheckOutlined />} onClick={() => decide("Approved")}>
                  Aprobar
                </Button>
              </Space>
            </Card>
          </Col>
        ) : (
          <Col xs={24} md={16}>
            <Card>
              <Empty description="Selecciona una ejecución para validar" />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
