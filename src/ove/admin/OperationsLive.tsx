import { useState } from "react";
import type { ReactNode } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ApiOutlined,
  BranchesOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { seedOperationalFlows } from "../seed";
import { useStore } from "../store";
import type { Notification, ProtocolActivation, Schedule } from "../types";

const modeInfo: Record<
  ProtocolActivation,
  { label: string; color: string; icon: ReactNode; description: string }
> = {
  Triggered: {
    label: "Detonado por evento",
    color: "orange",
    icon: <ThunderboltOutlined />,
    description: "Una señal, umbral o actividad genera el compromiso automáticamente.",
  },
  Recurring: {
    label: "Programación recurrente",
    color: "purple",
    icon: <CalendarOutlined />,
    description: "Se crea por calendario, frecuencia o contador de horas del activo.",
  },
  OnDemand: {
    label: "Asignación directa",
    color: "blue",
    icon: <UserAddOutlined />,
    description: "Se lanza desde el módulo para atender una necesidad puntual.",
  },
};

export function OperationsLive() {
  const { protocols, notifications, setNotifications, schedules, setSchedules } = useStore();
  const [flowStep, setFlowStep] = useState(2);
  const modes: ProtocolActivation[] = ["Triggered", "Recurring", "OnDemand"];

  const trigger = (mode: ProtocolActivation) => {
    const protocol = protocols.find((p) => p.activationMode === mode) ?? protocols[0];
    const start = dayjs()
      .add(mode === "Recurring" ? 1 : 0, "day")
      .add(mode === "OnDemand" ? 20 : 10, "minute");
    const schedule: Schedule = {
      id: `s-live-${Date.now()}`,
      protocolId: protocol.id,
      date: start.format("YYYY-MM-DD"),
      hour: start.format("HH:mm"),
      tolerance: protocol.schedule[0]?.tolerance ?? 20,
      operator: protocol.operators[0] ?? "Ana Torres",
      status: "Pending",
      assetId: protocol.assetIds?.[0],
      plant: protocol.branches[0],
      workOrder: `OT-LIVE-${String(schedules.length + 21).padStart(3, "0")}`,
      eligibilityValidated: true,
    };
    const notification: Notification = {
      id: `n-live-${Date.now()}`,
      type: mode === "Triggered" ? "FlowTriggered" : "Assignment",
      channel: mode === "Triggered" ? "Push" : "WhatsApp",
      actor: mode === "Triggered" ? "Operational Excellence Engine" : "Business Commitment Engine",
      recipientRole: "operator",
      recipient: schedule.operator,
      source: "Automatic",
      event: modeInfo[mode].label,
      message: `${schedule.workOrder} creada: ${protocol.name} · ${schedule.hour}.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setSchedules([schedule, ...schedules]);
    setNotifications([notification, ...notifications]);
    message.success(`${modeInfo[mode].label}: orden y notificación generadas`);
  };

  const advanceFlow = () => {
    const next = Math.min(flowStep + 1, seedOperationalFlows[0].steps.length);
    setFlowStep(next);
    const step = seedOperationalFlows[0].steps[next - 1];
    const notification: Notification = {
      id: `n-flow-${Date.now()}`,
      type: "FlowTriggered",
      channel: "Push",
      actor: "Business Commitment Engine",
      recipientRole: next >= 4 ? "supervisor" : "operator",
      recipient: next >= 4 ? "Roberto Salas" : "Ana Torres",
      source: "Automatic",
      event: "Avance de flujo",
      message: `Flujo AC-01 avanzó a: ${step.name}.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([notification, ...notifications]);
    message.success("Dependencias evaluadas y siguiente etapa detonada");
  };

  const triggerRelatedFlow = () => {
    const events: Notification[] = [
      {
        id: `n-related-${Date.now()}-sup`,
        type: "FlowTriggered",
        channel: "Push",
        actor: "Operational Excellence Engine",
        recipientRole: "supervisor",
        recipient: "Mónica Reyes",
        source: "Automatic",
        event: "Flujo a flujo",
        message:
          "AC-01 detectó vibración crítica: flujo “Respuesta a condición” detonado automáticamente.",
        status: "Sent",
        createdAt: dayjs().toISOString(),
      },
      {
        id: `n-related-${Date.now()}-admin`,
        type: "Escalation",
        channel: "System",
        actor: "Business Commitment Engine",
        recipientRole: "admin",
        recipient: "Coordinación de mantenimiento",
        source: "Automatic",
        event: "Escalamiento entre flujos",
        message: "Nuevo compromiso predictivo creado y ligado al flujo de recuperación AC-01.",
        status: "Sent",
        createdAt: dayjs().toISOString(),
      },
    ];
    setNotifications([...events, ...notifications]);
    message.success("Segundo flujo detonado, compromisos creados y responsables notificados");
  };

  const feed = notifications
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <Space>
            <span className="live-dot" />
            <Typography.Text strong>EN VIVO</Typography.Text>
          </Space>
          <Typography.Title level={3} style={{ margin: "2px 0 0" }}>
            Orquestación operacional
          </Typography.Title>
          <Typography.Text type="secondary">
            Protocolos individuales, triggers y flujos coordinados sobre activos reales.
          </Typography.Text>
        </div>
        <Tag color="purple" icon={<ApiOutlined />}>
          Foundational Engines activos
        </Tag>
      </Space>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {modes.map((mode) => {
          const info = modeInfo[mode];
          const protocol = protocols.find((p) => p.activationMode === mode);
          return (
            <Col xs={24} md={8} key={mode}>
              <Card className="activation-card">
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Avatar
                    style={{
                      background:
                        info.color === "orange"
                          ? "#fa8c16"
                          : info.color === "purple"
                            ? "#7B35C1"
                            : "#1677ff",
                    }}
                    icon={info.icon}
                  />
                  <Tag color={info.color}>{info.label}</Tag>
                </Space>
                <Typography.Title level={4} style={{ margin: "14px 0 4px" }}>
                  {protocol?.name}
                </Typography.Title>
                <Typography.Paragraph type="secondary">{info.description}</Typography.Paragraph>
                <Typography.Paragraph>
                  <b>Trigger:</b> {protocol?.triggerEvent}
                </Typography.Paragraph>
                <Button block icon={<PlayCircleOutlined />} onClick={() => trigger(mode)}>
                  Emular activación
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={15}>
          <Card
            title={
              <Space>
                <BranchesOutlined />
                Flujo: recuperación y retorno a servicio · AC-01
              </Space>
            }
            extra={
              <Button
                type="primary"
                onClick={advanceFlow}
                disabled={flowStep >= seedOperationalFlows[0].steps.length}
              >
                Detonar siguiente etapa
              </Button>
            }
          >
            <Typography.Paragraph type="secondary">
              {seedOperationalFlows[0].description}
            </Typography.Paragraph>
            <Progress
              percent={Math.round((flowStep / seedOperationalFlows[0].steps.length) * 100)}
              strokeColor="#7B35C1"
            />
            <div className="flow-board">
              {seedOperationalFlows[0].steps.map((step, index) => {
                const complete = index < flowStep;
                const active = index === flowStep;
                return (
                  <div
                    className={`flow-node ${step.mode === "Parallel" ? "parallel" : ""} ${complete ? "complete" : active ? "active" : ""}`}
                    key={step.id}
                  >
                    <div className="flow-index">
                      {complete ? <CheckCircleOutlined /> : index + 1}
                    </div>
                    <div>
                      <b>{step.name}</b>
                      <div>
                        <Tag color={step.mode === "Parallel" ? "blue" : "default"}>
                          {step.mode === "Parallel" ? "Paralelo" : "Lineal"}
                        </Tag>
                      </div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        Se detona con: {step.trigger}
                      </Typography.Text>
                    </div>
                  </div>
                );
              })}
            </div>
            <Card size="small" style={{ marginTop: 12, background: "#faf7ff" }}>
              <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
                <span>
                  <b>Regla entre flujos:</b> si la inspección detecta vibración crítica, se detona
                  “Respuesta a condición crítica” y se escala al supervisor.
                </span>
                <Button size="small" icon={<ThunderboltOutlined />} onClick={triggerRelatedFlow}>
                  Emular flujo relacionado
                </Button>
              </Space>
            </Card>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            title={
              <Space>
                <span className="live-dot" />
                Newsfeed operacional
              </Space>
            }
            extra={<Tag>{feed.length} eventos</Tag>}
          >
            <List
              dataSource={feed}
              renderItem={(event) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ background: event.source === "Automatic" ? "#7B35C1" : "#1677ff" }}
                        icon={
                          event.source === "Automatic" ? (
                            <ThunderboltOutlined />
                          ) : (
                            <UserAddOutlined />
                          )
                        }
                      />
                    }
                    title={event.message}
                    description={
                      <Space wrap>
                        <Tag>{event.channel}</Tag>
                        <span>{event.event}</span>
                        <span>· {dayjs(event.createdAt).format("HH:mm:ss")}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            <Space style={{ width: "100%", justifyContent: "center" }}>
              <ClockCircleOutlined />
              <Typography.Text type="secondary">
                Se actualiza con cada acción de la demo
              </Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
