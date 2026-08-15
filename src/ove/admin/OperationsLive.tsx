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
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import { SmartTable } from "../shared/SmartTable";
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
  InboxOutlined,
  PlayCircleOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { demoNow } from "../../demo-config/clock";
import { seedAssets, seedOperationalFlows } from "../seed";
import { useStore } from "../store";
import { statusTag } from "../ui";
import type { Notification, ProtocolActivation, Schedule } from "../types";
import { activeDemo, hasCapability } from "../../demo-config/active";
import { ServiceRequests } from "./ServiceRequests";
import { resolveValidationExecutionId } from "../domain";

type FeedFilter = "all" | "automatic" | "ondemand" | "critical";

const primarySupervisor =
  activeDemo.context.loginProfiles.find((profile) => profile.role === "supervisor")?.name ??
  "Supervisión";

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

export function OperationsLive({
  onNav,
  onOpenOrder,
  onScheduleRequest,
  onScheduleProtocol,
  onOpenValidation,
}: {
  onNav: (key: string) => void;
  onOpenOrder: (orderId: string) => void;
  onScheduleRequest: (requestId: string) => void;
  onScheduleProtocol: (protocolId: string) => void;
  onOpenValidation: (executionId: string | null) => void;
}) {
  const {
    protocols,
    notifications,
    setNotifications,
    schedules,
    setSchedules,
    incidents,
    setIncidents,
    executions,
    serviceRequests,
  } = useStore();
  const [flowStep, setFlowStep] = useState(2);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const modes: ProtocolActivation[] = ["Triggered", "Recurring", "OnDemand"];
  const showServiceIntake = hasCapability("service-request-intake") && serviceRequests.length > 0;

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
  const attentionEvents = notifications
    .filter((event) => ["ValidationRequired", "Incident", "Escalation"].includes(event.type))
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2);

  const addScheduleFromMode = (mode: ProtocolActivation) => {
    const protocol = protocols.find((item) => item.activationMode === mode) ?? protocols[0];
    const start = demoNow()
      .add(mode === "Recurring" ? 1 : 0, "day")
      .add(mode === "OnDemand" ? 20 : 10, "minute");
    const schedule: Schedule = {
      id: `s-live-${Date.now()}`,
      protocolId: protocol.id,
      date: start.format("YYYY-MM-DD"),
      hour: start.format("HH:mm"),
      tolerance: protocol.schedule[0]?.tolerance ?? 20,
      operator: protocol.operators[0] ?? activeDemo.context.primaryOperator,
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
      createdAt: demoNow().toISOString(),
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
      recipient: next >= 4 ? primarySupervisor : activeDemo.context.primaryOperator,
      source: "Automatic",
      event: "Avance de flujo",
      message: `Flujo AC-01 avanzó a: ${step.name}.`,
      status: "Sent",
      createdAt: demoNow().toISOString(),
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
        createdAt: demoNow().toISOString(),
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
        createdAt: demoNow().toISOString(),
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

  const openValidation = (event: Notification) => {
    setEventDrawerOpen(false);
    onOpenValidation(resolveValidationExecutionId(event, schedules, executions));
  };

  const today = demoNow().format("YYYY-MM-DD");
  const programDate = schedules.some((schedule) => schedule.date === today)
    ? today
    : (schedules.map((schedule) => schedule.date).sort((a, b) => b.localeCompare(a))[0] ?? today);
  const dailySchedules = schedules.filter((schedule) => schedule.date === programDate);
  const completedInProgram = dailySchedules.filter(
    (schedule) => schedule.status === "Completed",
  ).length;
  const pendingInProgram = dailySchedules.filter(
    (schedule) => schedule.status === "Pending" || schedule.status === "InProgress",
  ).length;
  const compliance = dailySchedules.length
    ? Math.round((completedInProgram / dailySchedules.length) * 100)
    : 0;
  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Closed" && incident.status !== "Resolved",
  );
  const receivedRequests = serviceRequests.filter(
    (request) => request.status === "Received",
  ).length;
  const averageAvailability = Math.round(
    seedAssets.reduce((sum, asset) => sum + asset.availability, 0) / seedAssets.length,
  );
  const orderRows = dailySchedules.map((schedule) => {
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
      label: "Programar protocolo ahora",
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
    if (key === "ondemand") {
      const protocol =
        protocols.find((item) => item.activationMode === "OnDemand" && item.status === "Active") ??
        protocols.find((item) => item.status === "Active");
      if (!protocol) {
        message.warning("No hay protocolos activos disponibles para programar");
        return;
      }
      onScheduleProtocol(protocol.id);
    }
    if (key === "recurring") addScheduleFromMode("Recurring");
    if (key === "related-flow") triggerRelatedFlow();
  };

  return (
    <div className="operations-live-page">
      <div className="operations-live-header">
        <div>
          <Space>
            <span className="live-dot" />
            <Typography.Text strong>
              {showServiceIntake ? "CENTRO OPERATIVO · EN VIVO" : "CENTRO DE CONTROL · EN VIVO"}
            </Typography.Text>
          </Space>
          <Typography.Title level={2} style={{ margin: "3px 0 0" }}>
            {showServiceIntake
              ? "Recepción, operación y decisiones"
              : "Operación, alertas y decisiones"}
          </Typography.Title>
          <Typography.Text type="secondary">
            Una vista para entender el estado, atender excepciones y seguir cada evento.
          </Typography.Text>
        </div>
        <div className="operations-header-actions">
          <Tag color="purple" icon={<ApiOutlined />}>
            {activeDemo.branding.tagline.split("·")[0].trim()} activos
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

      {showServiceIntake && (
        <>
          <section className="operations-intake-section" aria-label="Servicios recibidos">
            <ServiceRequests embedded onSchedule={onScheduleRequest} />
          </section>

          <div className="operations-section-heading">
            <div>
              <Typography.Text className="planning-eyebrow">SEGUIMIENTO · EN VIVO</Typography.Text>
              <Typography.Title level={3}>Estado y atención operativa</Typography.Title>
            </div>
            <Typography.Text type="secondary">
              Indicadores, excepciones y eventos del programa en curso.
            </Typography.Text>
          </div>
        </>
      )}

      <div className="operations-command-grid">
        <Card
          className="operations-health-card"
          title="Estado operativo"
          extra={<Typography.Text type="secondary">Últimos 7 días</Typography.Text>}
        >
          <div className="operations-health-layout">
            <div className="operations-compliance-score">
              <Progress
                type="circle"
                percent={compliance}
                size={164}
                strokeColor="#7B35C1"
                trailColor="#eee9f4"
                strokeWidth={8}
                format={(percent) => (
                  <span className="operations-compliance-value">
                    <small>Cumplimiento</small>
                    {percent}%
                  </span>
                )}
              />
              <svg
                className="operations-health-trend"
                viewBox="0 0 220 42"
                role="img"
                aria-label="Tendencia de cumplimiento de los últimos siete días"
              >
                <polyline
                  points="2,30 35,20 69,32 103,18 137,21 171,15 218,18"
                  fill="none"
                  stroke="#7B35C1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="218" cy="18" r="4" fill="#7B35C1" />
              </svg>
              <Typography.Text type="secondary" className="operations-trend-caption">
                Tendencia 7 días · <b>+4 pp</b>
              </Typography.Text>
            </div>

            <div className="operations-health-metrics">
              {showServiceIntake ? (
                <div className="operations-health-metric intake">
                  <Avatar icon={<InboxOutlined />} />
                  <Statistic title="Por aceptar" value={receivedRequests} />
                </div>
              ) : (
                <div className="operations-health-metric availability">
                  <Avatar icon={<DeploymentUnitOutlined />} />
                  <Statistic title="Disponibilidad" value={averageAvailability} suffix="%" />
                </div>
              )}
              <div className="operations-health-metric pending">
                <Avatar icon={<ClockCircleOutlined />} />
                <Statistic title="Pendientes" value={pendingInProgram} />
              </div>
              <div className="operations-health-metric incidents">
                <Avatar icon={<ExclamationCircleOutlined />} />
                <Statistic title="Incidencias" value={openIncidents.length} />
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="operations-attention-card"
          title={
            <Space>
              <BellOutlined />
              Atención ahora
              <Badge count={attentionEvents.length} />
            </Space>
          }
          extra={
            <Button type="link" size="small" onClick={() => onNav("incidents")}>
              Ver todas
            </Button>
          }
        >
          <div className="operations-attention-list">
            {attentionEvents.map((event) => {
              const critical = ["Incident", "Escalation"].includes(event.type);
              return (
                <div
                  className={`operations-attention-item ${critical ? "critical" : "validation"}`}
                  key={event.id}
                  onClick={() => inspectEvent(event)}
                >
                  <div className="operations-attention-item-header">
                    <Space size={8}>
                      <Avatar icon={critical ? <ExclamationCircleOutlined /> : <ApiOutlined />} />
                      <Typography.Text strong>
                        {dayjs(event.createdAt).format("HH:mm")}
                      </Typography.Text>
                      <Typography.Text type="secondary">{eventAge(event)}</Typography.Text>
                    </Space>
                    <Tag color={critical ? "red" : "blue"}>
                      {critical ? "Incidencia crítica" : "Validación pendiente"}
                    </Tag>
                  </div>
                  <Typography.Title level={5}>{event.message}</Typography.Title>
                  <div className="operations-attention-meta">
                    <div>
                      <Typography.Text type="secondary">Impacto</Typography.Text>
                      <span className="operations-impact-dots" aria-label="Impacto alto">
                        <i />
                        <i />
                        <i />
                        <i className="inactive" />
                      </span>
                      <Typography.Text>Alto</Typography.Text>
                    </div>
                    <div>
                      <Typography.Text type="secondary">Responsable</Typography.Text>
                      <Typography.Text>{event.actor}</Typography.Text>
                    </div>
                  </div>
                  <Button
                    type={critical ? "default" : "primary"}
                    danger={critical}
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      if (critical) setAlertsDrawerOpen(true);
                      else openValidation(event);
                    }}
                  >
                    {critical ? "Atender incidencia" : "Revisar validación"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          className="live-feed-card operations-live-stream-card"
          title={
            <Space>
              <span className="live-dot" />
              Operación en vivo
            </Space>
          }
          extra={<Typography.Text type="secondary">{feed.length} eventos</Typography.Text>}
        >
          <div className="operations-feed-toolbar operations-stream-toolbar">
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
          <List
            className="operations-newsfeed operations-newsfeed-compact"
            dataSource={feed.slice(0, 6)}
            locale={{ emptyText: "No hay eventos para este filtro" }}
            renderItem={(event) => (
              <List.Item
                className={`operations-feed-item ${event.id === selectedEvent?.id ? "selected" : ""}`}
                onClick={() => inspectEvent(event)}
                actions={[
                  <Button
                    key="view"
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    aria-label="Ver detalle"
                    title="Ver detalle"
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className="feed-time-rail">
                      <span>{dayjs(event.createdAt).format("HH:mm")}</span>
                      <i className={eventTone(event)} />
                    </div>
                  }
                  title={<b>{event.message}</b>}
                  description={
                    <Space wrap size={6}>
                      <Tag color={channelColor(event.channel)} icon={channelIcon(event.channel)}>
                        {event.channel}
                      </Tag>
                      <span>{event.actor}</span>
                      <Tag color="geekblue">{eventAsset(event)}</Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          <Button type="link" block onClick={() => onNav("notifications")}>
            Ver actividad completa
          </Button>
        </Card>
      </div>

      <Card
        className="live-orders-card"
        style={{ marginTop: 16 }}
        title={
          <div>
            <Typography.Text strong>Programa de mantenimiento del día</Typography.Text>
            <Typography.Text type="secondary" className="live-card-subtitle">
              Jornada operativa · {dayjs(programDate).format("DD/MM/YYYY")} · avance y responsables
            </Typography.Text>
          </div>
        }
        extra={
          <Space>
            <Tag color={pendingInProgram ? "orange" : "green"}>
              {pendingInProgram} {pendingInProgram === 1 ? "pendiente" : "pendientes"}
            </Tag>
            <Button size="small" onClick={() => onNav("orders")}>
              Ver programa completo
            </Button>
          </Space>
        }
      >
        <SmartTable
          searchPlaceholder="Buscar orden, protocolo, activo o responsable"
          searchFields={["workOrder", "protocol", "asset", "operator"]}
          filterFields={[
            { key: "status", label: "Estado", accessor: "status" },
            { key: "operator", label: "Responsable", accessor: "operator" },
            { key: "asset", label: "Activo", accessor: "asset" },
          ]}
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
              render: (_, row) => (
                <Button size="small" onClick={() => onOpenOrder(row.key)}>
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
            {selectedEvent.type === "ValidationRequired" && (
              <Button
                type="primary"
                block
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 16 }}
                onClick={() => openValidation(selectedEvent)}
              >
                Abrir validación requerida
              </Button>
            )}
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

function eventAge(event: Notification) {
  const minutes = Math.max(1, demoNow().diff(dayjs(event.createdAt), "minute"));
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.floor(hours / 24)} d`;
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
