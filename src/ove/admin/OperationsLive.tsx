import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ApiOutlined,
  BellOutlined,
  BranchesOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { seedOperationalFlows } from "../seed";
import { useStore } from "../store";
import type { Notification, ProtocolActivation, Schedule } from "../types";

type FeedFilter = "all" | "automatic" | "ondemand" | "critical";

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
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const modes: ProtocolActivation[] = ["Triggered", "Recurring", "OnDemand"];

  const feed = useMemo(
    () =>
      notifications
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((event) => {
          if (feedFilter === "automatic") return event.source === "Automatic";
          if (feedFilter === "ondemand") return event.source === "OnDemand";
          if (feedFilter === "critical")
            return ["Incident", "Escalation", "FlowTriggered"].includes(event.type);
          return true;
        }),
    [feedFilter, notifications],
  );
  const selectedEvent = notifications.find((event) => event.id === selectedEventId) ?? feed[0];

  const addScheduleFromMode = (mode: ProtocolActivation) => {
    const protocol = protocols.find((item) => item.activationMode === mode) ?? protocols[0];
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
      message: `${schedule.workOrder} creada: ${protocol.name} · ${schedule.assetId} · ${schedule.hour}.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setSchedules([schedule, ...schedules]);
    setNotifications([notification, ...notifications]);
    setSelectedEventId(notification.id);
    message.success(`${modeInfo[mode].label}: orden y evento generados en vivo`);
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
    setSelectedEventId(notification.id);
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
    setSelectedEventId(events[0].id);
    message.success("Segundo flujo detonado y visible en el newsfeed");
  };

  const inspectEvent = (event: Notification) => {
    setSelectedEventId(event.id);
    setNotifications(
      notifications.map((item) => (item.id === event.id ? { ...item, status: "Read" } : item)),
    );
  };

  const automaticCount = notifications.filter((event) => event.source === "Automatic").length;
  const criticalCount = notifications.filter((event) =>
    ["Incident", "Escalation", "FlowTriggered"].includes(event.type),
  ).length;
  const activeAssets = new Set(schedules.map((schedule) => schedule.assetId).filter(Boolean)).size;

  return (
    <div className="operations-live-page">
      <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <Space>
            <span className="live-dot" />
            <Typography.Text strong>OPERACIÓN EN VIVO</Typography.Text>
          </Space>
          <Typography.Title level={2} style={{ margin: "3px 0 0" }}>
            Newsfeed operacional
          </Typography.Title>
          <Typography.Text type="secondary">
            Cada asignación, evidencia, alerta, decisión y trigger aparece en una sola narrativa.
          </Typography.Text>
        </div>
        <Space wrap>
          <Tag color="purple" icon={<ApiOutlined />}>
            Foundational Engines activos
          </Tag>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => addScheduleFromMode("Triggered")}
          >
            Generar actividad
          </Button>
        </Space>
      </Space>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Eventos visibles"
              value={notifications.length}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Automáticos"
              value={automaticCount}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: "#7B35C1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Críticos / escalados"
              value={criticalCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Activos en contexto"
              value={activeAssets}
              prefix={<DeploymentUnitOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }} align="stretch">
        <Col xs={24} xl={16}>
          <Card
            className="live-feed-card"
            title={
              <Space>
                <span className="live-dot" />
                Actividad de la operación
              </Space>
            }
            extra={<Tag>{feed.length} eventos</Tag>}
          >
            <Segmented
              value={feedFilter}
              onChange={(value) => setFeedFilter(value as FeedFilter)}
              options={[
                { label: "Todos", value: "all" },
                { label: "Automáticos", value: "automatic" },
                { label: "On demand", value: "ondemand" },
                { label: "Críticos", value: "critical" },
              ]}
              style={{ marginBottom: 12 }}
            />
            <List
              className="operations-newsfeed"
              dataSource={feed}
              locale={{ emptyText: "No hay eventos para este filtro" }}
              renderItem={(event) => (
                <List.Item
                  className={`operations-feed-item ${event.id === selectedEvent?.id ? "selected" : ""}`}
                  onClick={() => inspectEvent(event)}
                  actions={[
                    <Button key="view" type="text" size="small" icon={<EyeOutlined />}>
                      Ver
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="feed-time-rail">
                        <span>{dayjs(event.createdAt).format("HH:mm")}</span>
                        <i className={eventTone(event)} />
                      </div>
                    }
                    title={
                      <Space wrap>
                        <b>{event.message}</b>
                        {event.status === "Sent" && <Badge status="processing" />}
                      </Space>
                    }
                    description={
                      <Space wrap>
                        <Tag color={channelColor(event.channel)} icon={channelIcon(event.channel)}>
                          {event.channel}
                        </Tag>
                        <Tag>{event.source ?? "Automatic"}</Tag>
                        <span>{event.actor}</span>
                        <span>· {event.event ?? event.type}</span>
                        <Tag color="geekblue">{eventAsset(event)}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: "100%", height: "100%" }}>
            <Card
              title="Evento seleccionado"
              extra={
                selectedEvent && (
                  <Tag color={selectedEvent.status === "Read" ? "green" : "blue"}>
                    {selectedEvent.status === "Read" ? "Recibido" : "Entregado"}
                  </Tag>
                )
              }
            >
              {selectedEvent ? (
                <>
                  <Space>
                    <Avatar
                      size={46}
                      style={{ background: eventToneColor(eventTone(selectedEvent)) }}
                      icon={
                        selectedEvent.source === "Automatic" ? (
                          <ThunderboltOutlined />
                        ) : (
                          <UserAddOutlined />
                        )
                      }
                    />
                    <div>
                      <b>{selectedEvent.event ?? selectedEvent.type}</b>
                      <br />
                      <Typography.Text type="secondary">
                        {dayjs(selectedEvent.createdAt).format("DD MMM YYYY · HH:mm:ss")}
                      </Typography.Text>
                    </div>
                  </Space>
                  <Typography.Paragraph style={{ margin: "14px 0" }}>
                    {selectedEvent.message}
                  </Typography.Paragraph>
                  <Divider />
                  <Space wrap>
                    <Tag>{selectedEvent.channel}</Tag>
                    <Tag>{selectedEvent.source}</Tag>
                    <Tag color="purple">{eventAsset(selectedEvent)}</Tag>
                  </Space>
                  <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                    Generado por {selectedEvent.actor} para{" "}
                    {selectedEvent.recipient ?? selectedEvent.recipientRole}.
                  </Typography.Paragraph>
                </>
              ) : (
                <Alert type="info" message="Selecciona un evento del feed" />
              )}
            </Card>

            <Card title="Ahora en la operación">
              <List
                size="small"
                dataSource={[
                  {
                    icon: <ExclamationCircleOutlined />,
                    color: "red",
                    title: "MTR-07",
                    detail: "Vibración crítica · supervisor notificado",
                  },
                  {
                    icon: <ToolOutlinedFallback />,
                    color: "purple",
                    title: "AC-01",
                    detail: "Flujo de recuperación · 40%",
                  },
                  {
                    icon: <CheckCircleOutlined />,
                    color: "green",
                    title: "HP-02",
                    detail: "Inspección validada · 96%",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ background: item.color }} icon={item.icon} />}
                      title={item.title}
                      description={item.detail}
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Acciones rápidas">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  block
                  icon={<PlayCircleOutlined />}
                  onClick={() => addScheduleFromMode("OnDemand")}
                >
                  Asignar protocolo ahora
                </Button>
                <Button
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => addScheduleFromMode("Recurring")}
                >
                  Generar siguiente recurrencia
                </Button>
                <Button block icon={<BranchesOutlined />} onClick={triggerRelatedFlow}>
                  Detonar flujo relacionado
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <Card className="live-secondary-card" style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: "activation",
              label: "Protocolos y triggers",
              children: (
                <Row gutter={[12, 12]}>
                  {modes.map((mode) => {
                    const info = modeInfo[mode];
                    const protocol = protocols.find((item) => item.activationMode === mode);
                    return (
                      <Col xs={24} md={8} key={mode}>
                        <Card className="activation-card" size="small">
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
                          <Typography.Title level={5} style={{ margin: "12px 0 4px" }}>
                            {protocol?.name}
                          </Typography.Title>
                          <Typography.Paragraph type="secondary">
                            {info.description}
                          </Typography.Paragraph>
                          <Typography.Paragraph>
                            <b>Trigger:</b> {protocol?.triggerEvent}
                          </Typography.Paragraph>
                          <Button block onClick={() => addScheduleFromMode(mode)}>
                            Emular activación
                          </Button>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ),
            },
            {
              key: "flows",
              label: "Flujos operativos",
              children: (
                <>
                  <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
                    <div>
                      <Typography.Title level={4} style={{ margin: 0 }}>
                        Recuperación y retorno a servicio · AC-01
                      </Typography.Title>
                      <Typography.Text type="secondary">
                        {seedOperationalFlows[0].description}
                      </Typography.Text>
                    </div>
                    <Button
                      type="primary"
                      onClick={advanceFlow}
                      disabled={flowStep >= seedOperationalFlows[0].steps.length}
                    >
                      Detonar siguiente etapa
                    </Button>
                  </Space>
                  <Progress
                    percent={Math.round((flowStep / seedOperationalFlows[0].steps.length) * 100)}
                    strokeColor="#7B35C1"
                    style={{ marginTop: 12 }}
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
                  <Alert
                    type="info"
                    showIcon
                    style={{ marginTop: 12 }}
                    message="Regla entre flujos"
                    description="Una condición crítica puede detonar otro flujo, crear compromisos y notificar responsables automáticamente."
                    action={
                      <Button size="small" onClick={triggerRelatedFlow}>
                        Emular
                      </Button>
                    }
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

function eventAsset(event: Notification) {
  const match = event.message.match(/\b(?:AC|HP|MTR|CV)-\d{2}\b/);
  if (match) return match[0];
  if (event.type === "Incident" || event.type === "ValidationRequired") return "MTR-07";
  return "Operación";
}

function eventTone(event: Notification) {
  if (["Incident", "Escalation"].includes(event.type)) return "critical";
  if (event.type === "FlowTriggered") return "trigger";
  if (event.type === "Completed") return "success";
  return "info";
}

function eventToneColor(tone: string) {
  if (tone === "critical") return "#cf1322";
  if (tone === "trigger") return "#fa8c16";
  if (tone === "success") return "#52c41a";
  return "#7B35C1";
}

function channelColor(channel: Notification["channel"]) {
  if (channel === "WhatsApp") return "green";
  if (channel === "Push") return "purple";
  if (channel === "SMS") return "blue";
  return "default";
}

function channelIcon(channel: Notification["channel"]) {
  if (channel === "WhatsApp") return <WhatsAppOutlined />;
  if (channel === "Push") return <BellOutlined />;
  return <ApiOutlined />;
}

function ToolOutlinedFallback() {
  return <ClockCircleOutlined />;
}
