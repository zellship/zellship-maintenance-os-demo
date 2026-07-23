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
  Drawer,
  Dropdown,
  List,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ApiOutlined,
  BellOutlined,
  BranchesOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeploymentUnitOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { seedAssets, seedOperationalFlows } from "../seed";
import { useStore } from "../store";
import { statusTag } from "../ui";
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

export function OperationsLive({ onNav }: { onNav: (key: string) => void }) {
  const {
    protocols,
    notifications,
    setNotifications,
    schedules,
    setSchedules,
    incidents,
    setIncidents,
  } = useStore();
  const [flowStep, setFlowStep] = useState(2);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
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
    setEventDrawerOpen(true);
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
    setEventDrawerOpen(true);
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
    setEventDrawerOpen(true);
    message.success("Segundo flujo detonado y visible en el newsfeed");
  };

  const inspectEvent = (event: Notification) => {
    setSelectedEventId(event.id);
    setEventDrawerOpen(true);
    setNotifications(
      notifications.map((item) => (item.id === event.id ? { ...item, status: "Read" } : item)),
    );
  };

  const today = dayjs().format("YYYY-MM-DD");
  const todaysSchedules = schedules.filter((schedule) => schedule.date === today);
  const completedToday = todaysSchedules.filter(
    (schedule) => schedule.status === "Completed",
  ).length;
  const pendingToday = todaysSchedules.filter(
    (schedule) => schedule.status === "Pending" || schedule.status === "InProgress",
  ).length;
  const compliance = todaysSchedules.length
    ? Math.round((completedToday / todaysSchedules.length) * 100)
    : 0;
  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Closed" && incident.status !== "Resolved",
  );
  const averageAvailability = Math.round(
    seedAssets.reduce((sum, asset) => sum + asset.availability, 0) / seedAssets.length,
  );
  const orderRows = todaysSchedules.map((schedule) => {
    const protocol = protocols.find((item) => item.id === schedule.protocolId);
    return {
      key: schedule.id,
      workOrder: schedule.workOrder,
      protocol: protocol?.name ?? "Protocolo",
      asset: schedule.assetId,
      hour: schedule.hour,
      operator: schedule.operator,
      status: schedule.status,
    };
  });
  const quickActionItems: MenuProps["items"] = [
    {
      key: "ondemand",
      icon: <PlayCircleOutlined />,
      label: "Asignar protocolo ahora",
    },
    {
      key: "recurring",
      icon: <CalendarOutlined />,
      label: "Generar siguiente recurrencia",
    },
    {
      type: "divider",
    },
    {
      key: "related-flow",
      icon: <BranchesOutlined />,
      label: "Detonar flujo relacionado",
    },
  ];

  const handleQuickAction: MenuProps["onClick"] = ({ key }) => {
    if (key === "ondemand") addScheduleFromMode("OnDemand");
    if (key === "recurring") addScheduleFromMode("Recurring");
    if (key === "related-flow") triggerRelatedFlow();
  };

  return (
    <div className="operations-live-page">
      <div className="operations-live-header">
        <div>
          <Space>
            <span className="live-dot" />
            <Typography.Text strong>CENTRO DE CONTROL · EN VIVO</Typography.Text>
          </Space>
          <Typography.Title level={2} style={{ margin: "3px 0 0" }}>
            Operación, alertas y decisiones
          </Typography.Title>
          <Typography.Text type="secondary">
            Una vista para entender el estado, atender excepciones y seguir cada evento.
          </Typography.Text>
        </div>
        <div className="operations-header-actions">
          <Tag color="purple" icon={<ApiOutlined />}>
            Foundational Engines activos
          </Tag>
          <Badge count={openIncidents.length} size="small" offset={[-3, 3]}>
            <Button
              icon={<BellOutlined />}
              onClick={() => setAlertsDrawerOpen(true)}
              aria-label={`${openIncidents.length} alertas requieren atención`}
            >
              Alertas
            </Button>
          </Badge>
          <Dropdown
            menu={{ items: quickActionItems, onClick: handleQuickAction }}
            trigger={["click"]}
          >
            <Button icon={<ThunderboltOutlined />}>
              Acciones <DownOutlined />
            </Button>
          </Dropdown>
          <Button type="primary" icon={<BranchesOutlined />} onClick={() => onNav("flows")}>
            Diseñar flujos
          </Button>
        </div>
      </div>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Cumplimiento de hoy"
              value={compliance}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#7B35C1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Pendientes hoy"
              value={pendingToday}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Incidencias activas"
              value={openIncidents.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Disponibilidad de activos"
              value={averageAvailability}
              suffix="%"
              prefix={<DeploymentUnitOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="live-feed-card"
        style={{ marginTop: 16 }}
        title={
          <Space>
            <span className="live-dot" />
            Actividad de la operación
          </Space>
        }
        extra={<Tag>{feed.length} eventos</Tag>}
      >
        <div className="operations-feed-toolbar">
          <div>
            <Segmented
              value={feedFilter}
              onChange={(value) => setFeedFilter(value as FeedFilter)}
              options={[
                { label: "Todos", value: "all" },
                { label: "Automáticos", value: "automatic" },
                { label: "On demand", value: "ondemand" },
                { label: "Críticos", value: "critical" },
              ]}
            />
          </div>
          <Space size={6}>
            <Badge status="processing" />
            <Typography.Text type="secondary">Actualización en tiempo real</Typography.Text>
          </Space>
        </div>
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
                  Ver detalle
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

      <Card
        className="live-orders-card"
        style={{ marginTop: 16 }}
        title={
          <div>
            <Typography.Text strong>Órdenes de hoy</Typography.Text>
            <Typography.Text type="secondary" className="live-card-subtitle">
              Seguimiento operativo y responsables asignados
            </Typography.Text>
          </div>
        }
        extra={
          <Space>
            <Tag color={pendingToday ? "orange" : "green"}>{pendingToday} pendientes</Tag>
            <Button size="small" onClick={() => onNav("orders")}>
              Abrir módulo
            </Button>
          </Space>
        }
      >
        <Table
          size="middle"
          pagination={false}
          dataSource={orderRows}
          scroll={{ x: 900 }}
          locale={{ emptyText: "No hay órdenes programadas para hoy" }}
          columns={[
            { title: "Orden", dataIndex: "workOrder", width: 130 },
            { title: "Protocolo", dataIndex: "protocol", minWidth: 240 },
            { title: "Activo", dataIndex: "asset", width: 90 },
            { title: "Hora", dataIndex: "hour", width: 90 },
            { title: "Responsable", dataIndex: "operator", minWidth: 150 },
            { title: "Estado", dataIndex: "status", width: 120, render: statusTag },
            {
              title: "Acción",
              width: 110,
              fixed: "right",
              render: () => (
                <Button size="small" onClick={() => onNav("orders")}>
                  Ver orden
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Card className="live-secondary-card" style={{ marginTop: 16 }}>
        <Tabs
          items={[
            {
              key: "activation",
              label: "Automatizaciones y triggers",
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
              label: "Flujos activos",
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
                      icon={<BranchesOutlined />}
                      onClick={() => onNav("flows")}
                    >
                      Abrir módulo de flujos
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
                      <Space>
                        <Button size="small" onClick={advanceFlow}>
                          Avanzar etapa
                        </Button>
                        <Button size="small" onClick={triggerRelatedFlow}>
                          Detonar flujo
                        </Button>
                      </Space>
                    }
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        className="operations-detail-drawer"
        title="Detalle del evento"
        width={500}
        open={eventDrawerOpen}
        onClose={() => setEventDrawerOpen(false)}
        extra={
          selectedEvent && (
            <Tag color={selectedEvent.status === "Read" ? "green" : "blue"}>
              {selectedEvent.status === "Read" ? "Recibido" : "Entregado"}
            </Tag>
          )
        }
      >
        {selectedEvent ? (
          <div className="event-detail-content">
            <div className="event-detail-hero">
              <Avatar
                size={52}
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
                <Typography.Text type="secondary">TIPO DE EVENTO</Typography.Text>
                <Typography.Title level={4} style={{ margin: "2px 0 0" }}>
                  {selectedEvent.event ?? selectedEvent.type}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {dayjs(selectedEvent.createdAt).format("DD MMM YYYY · HH:mm:ss")}
                </Typography.Text>
              </div>
            </div>
            <div className="event-detail-message">{selectedEvent.message}</div>
            <div className="event-detail-grid">
              <EventDetailField label="Activo" value={eventAsset(selectedEvent)} />
              <EventDetailField label="Canal" value={selectedEvent.channel} />
              <EventDetailField label="Origen" value={selectedEvent.source ?? "Automatic"} />
              <EventDetailField
                label="Destinatario"
                value={selectedEvent.recipient ?? selectedEvent.recipientRole ?? "Operación"}
              />
            </div>
            <Divider />
            <Typography.Text type="secondary">GENERADO POR</Typography.Text>
            <Typography.Paragraph style={{ marginTop: 4 }}>
              {selectedEvent.actor}
            </Typography.Paragraph>
            <Alert
              showIcon
              type="info"
              message="Trazabilidad registrada"
              description="El evento, su entrega y la consulta quedaron relacionados con la operación y el activo."
            />
          </div>
        ) : (
          <Alert type="info" message="Selecciona un evento del feed" />
        )}
      </Drawer>

      <Drawer
        className="operations-alerts-drawer"
        title={
          <Space>
            Alertas que requieren atención
            <Badge count={openIncidents.length} />
          </Space>
        }
        width={540}
        open={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        extra={
          <Button
            type="link"
            onClick={() => {
              setAlertsDrawerOpen(false);
              onNav("incidents");
            }}
          >
            Ver centro de incidencias
          </Button>
        }
      >
        <Typography.Paragraph type="secondary">
          Excepciones abiertas que requieren decisión o seguimiento del supervisor.
        </Typography.Paragraph>
        <List
          className="operations-alert-list"
          dataSource={openIncidents}
          locale={{
            emptyText: (
              <Alert
                showIcon
                type="success"
                message="La operación está al día"
                description="No hay alertas críticas pendientes."
              />
            ),
          }}
          renderItem={(incident) => (
            <List.Item className="operations-alert-item">
              <div className="operations-alert-content">
                <div className="operations-alert-heading">
                  <Avatar
                    style={{ background: "#fff1f0", color: "#cf1322" }}
                    icon={<ExclamationCircleOutlined />}
                  />
                  <div>
                    <Tag color="red">{incident.type}</Tag>
                    <Typography.Text type="secondary">
                      {dayjs(incident.createdAt).format("DD MMM · HH:mm")}
                    </Typography.Text>
                  </div>
                </div>
                <Typography.Paragraph>{incident.description}</Typography.Paragraph>
                <div className="operations-alert-footer">
                  <Tag>{incident.status}</Tag>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      setIncidents(
                        incidents.map((item) =>
                          item.id === incident.id ? { ...item, status: "Resolved" } : item,
                        ),
                      );
                      message.success("Incidencia resuelta y registrada en bitácora");
                    }}
                  >
                    Marcar como resuelta
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
}

function EventDetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="event-detail-field">
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Typography.Text strong>{value}</Typography.Text>
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
