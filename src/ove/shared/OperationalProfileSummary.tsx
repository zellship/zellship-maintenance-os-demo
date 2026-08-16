import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, List, Progress, Row, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { demoNow } from "../../demo-config/clock";
import type { Asset, Incident, Person, Protocol, Schedule } from "../types";
import { statusTag } from "../ui";

type OrderContext = {
  schedules: Schedule[];
  protocols: Protocol[];
  incidents: Incident[];
  onOpenOrder: (scheduleId: string) => void;
};

export function AssetOperationalSummary({
  asset,
  schedules,
  protocols,
  incidents,
  onOpenOrder,
}: OrderContext & { asset: Asset }) {
  const orderedSchedules = [...schedules].sort((a, b) =>
    `${a.date}T${a.hour}`.localeCompare(`${b.date}T${b.hour}`),
  );
  const currentOrder =
    orderedSchedules.find((schedule) => schedule.status === "InProgress") ??
    orderedSchedules.find(
      (schedule) =>
        schedule.status === "Pending" &&
        dayjs(`${schedule.date} ${schedule.hour}`).isSame(demoNow(), "day"),
    );
  const nextOrder = orderedSchedules.find(
    (schedule) =>
      schedule.status === "Pending" &&
      dayjs(`${schedule.date} ${schedule.hour}`).isAfter(demoNow()),
  );
  const activeIncidents = incidents.filter((incident) => incident.status !== "Closed");
  const completed = schedules.filter((schedule) => schedule.status === "Completed").length;
  const expired = schedules.filter((schedule) => schedule.status === "Expired").length;
  const evaluated = completed + expired;
  const compliance = evaluated ? Math.round((completed / evaluated) * 100) : 100;
  const availabilityStatus =
    asset.availabilityStatus ??
    (currentOrder ? "Assigned" : asset.status === "Available" ? "Available" : "Unavailable");
  const operationalCondition =
    asset.operationalCondition ??
    (asset.status === "Maintenance"
      ? "Maintenance"
      : asset.status === "Risk"
        ? "Review"
        : "Operating");
  const applicablePlans = protocols.filter(
    (protocol) =>
      protocol.status === "Active" &&
      (!protocol.assetIds?.length || protocol.assetIds.includes(asset.id)),
  );

  return (
    <Card
      id="profile-plan"
      className="operational-profile-card"
      title={
        <Space>
          <DashboardOutlined />
          <span>Estado operativo y cumplimiento del plan</span>
        </Space>
      }
      extra={
        <Space wrap>
          <Tag color="purple">{applicablePlans.length} planes activos</Tag>
          <Tag color={activeIncidents.length ? "red" : "green"}>Actualizado</Tag>
        </Space>
      }
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={8}>
          <div className="operational-primary-state" data-tone={availabilityStatus}>
            <Typography.Text>DISPONIBILIDAD ACTUAL</Typography.Text>
            <strong>{availabilityLabel(availabilityStatus)}</strong>
            <Space wrap>
              {conditionTag(operationalCondition)}
              {currentOrder?.workOrder && <Tag>{currentOrder.workOrder}</Tag>}
            </Space>
            <small>
              {asset.estimatedReleaseAt && availabilityStatus !== "Available"
                ? `Liberación estimada: ${dayjs(asset.estimatedReleaseAt).format("DD MMM · HH:mm")}`
                : currentOrder
                  ? `Actividad actual: ${protocolName(currentOrder, protocols)}`
                  : "Sin una intervención activa que limite su uso"}
            </small>
          </div>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<CheckCircleOutlined />}
            label="Plan cumplido"
            value={`${compliance}%`}
            helper={expired ? `${expired} vencida${expired === 1 ? "" : "s"}` : "Sin vencimientos"}
            tone={expired ? "warning" : "success"}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<FieldTimeOutlined />}
            label="Disponibilidad"
            value={`${asset.availability}%`}
            helper={`${Math.max(0, 100 - asset.availability).toFixed(1)}% no disponible · 30 días`}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<DashboardOutlined />}
            label="Salud del equipo"
            value={`${asset.health}%`}
            helper={asset.health >= 80 ? "Condición saludable" : "Requiere atención"}
            tone={asset.health >= 80 ? "success" : asset.health >= 70 ? "warning" : "critical"}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<AlertOutlined />}
            label="Incidencias abiertas"
            value={String(activeIncidents.length)}
            helper={`${incidents.length} en el historial`}
            tone={activeIncidents.length ? "critical" : "success"}
          />
        </Col>
      </Row>

      <div className="operational-agenda">
        <div>
          <Typography.Text type="secondary">SIGUIENTE COMPROMISO DEL PLAN</Typography.Text>
          <Typography.Title level={4}>
            {nextOrder ? protocolName(nextOrder, protocols) : "Sin intervención pendiente"}
          </Typography.Title>
          <Typography.Text type="secondary">
            {nextOrder
              ? `${nextOrder.workOrder} · ${dayjs(`${nextOrder.date} ${nextOrder.hour}`).format("DD MMM YYYY · HH:mm")} · ${nextOrder.operator}`
              : "El activo no tiene una orden futura registrada en esta demostración."}
          </Typography.Text>
        </div>
        {nextOrder && (
          <Button type="primary" onClick={() => onOpenOrder(nextOrder.id)}>
            Ver orden
          </Button>
        )}
      </div>
    </Card>
  );
}

export function PersonCapacitySummary({
  person,
  schedules,
  protocols,
  incidents,
  onOpenOrder,
}: OrderContext & { person: Person }) {
  const today = demoNow().format("YYYY-MM-DD");
  const orderedSchedules = [...schedules].sort((a, b) =>
    `${a.date}T${a.hour}`.localeCompare(`${b.date}T${b.hour}`),
  );
  const todaySchedules = orderedSchedules.filter(
    (schedule) =>
      schedule.date === today &&
      schedule.status !== "Cancelled" &&
      schedule.status !== "Expired" &&
      schedule.status !== "Completed",
  );
  const assignedMinutes = todaySchedules.reduce(
    (sum, schedule) =>
      sum +
      (protocols.find((protocol) => protocol.id === schedule.protocolId)?.estimatedMinutes ?? 45),
    0,
  );
  const capacityMinutes = 8 * 60;
  const utilization = Math.min(100, Math.round((assignedMinutes / capacityMinutes) * 100));
  const remainingMinutes = Math.max(0, capacityMinutes - assignedMinutes);
  const currentOrder = todaySchedules.find((schedule) => schedule.status === "InProgress");
  const nextOrder = todaySchedules.find(
    (schedule) =>
      schedule.status === "Pending" &&
      dayjs(`${schedule.date} ${schedule.hour}`).isAfter(demoNow()),
  );
  const activeIncidents = incidents.filter((incident) => incident.status !== "Closed");

  return (
    <Card
      id="profile-plan"
      className="operational-profile-card"
      title={
        <Space>
          <UserOutlined />
          <span>Disponibilidad, capacidad y plan de trabajo</span>
        </Space>
      }
      extra={
        <Tag color={utilization > 90 ? "orange" : utilization ? "purple" : "green"}>
          {utilization}% ocupado
        </Tag>
      }
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={8}>
          <div className="operational-primary-state" data-tone={person.status}>
            <Typography.Text>DISPONIBILIDAD ACTUAL</Typography.Text>
            <strong>{personStatusLabel(person.status)}</strong>
            <Space wrap>
              {currentOrder ? (
                <Tag color="blue">En ejecución</Tag>
              ) : (
                <Tag>Turno {shiftLabel(person.shift)}</Tag>
              )}
              {currentOrder?.workOrder && <Tag>{currentOrder.workOrder}</Tag>}
            </Space>
            <small>
              {currentOrder
                ? `${protocolName(currentOrder, protocols)} · ${currentOrder.assetId}`
                : nextOrder
                  ? `Siguiente asignación a las ${nextOrder.hour}`
                  : "Sin otra asignación pendiente para el turno"}
            </small>
          </div>
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<ClockCircleOutlined />}
            label="Capacidad del turno"
            value="8 h"
            helper="Capacidad demostrativa"
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<ToolOutlined />}
            label="Carga asignada"
            value={`${(assignedMinutes / 60).toFixed(1)} h`}
            helper={`${todaySchedules.length} asignación${todaySchedules.length === 1 ? "" : "es"}`}
            tone={utilization > 90 ? "warning" : "default"}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<FieldTimeOutlined />}
            label="Capacidad disponible"
            value={`${(remainingMinutes / 60).toFixed(1)} h`}
            helper="Resto del turno"
            tone={remainingMinutes ? "success" : "warning"}
          />
        </Col>
        <Col xs={12} md={8} lg={4}>
          <OperationalMetric
            icon={<AlertOutlined />}
            label="Incidencias abiertas"
            value={String(activeIncidents.length)}
            helper={`${incidents.length} relacionadas`}
            tone={activeIncidents.length ? "critical" : "success"}
          />
        </Col>
      </Row>

      <div className="capacity-plan-strip">
        <div>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <b>Carga del turno</b>
            <Typography.Text type="secondary">
              {(assignedMinutes / 60).toFixed(1)} de 8 horas
            </Typography.Text>
          </Space>
          <Progress
            percent={utilization}
            strokeColor={utilization > 90 ? "#fa8c16" : "#7B35C1"}
            showInfo={false}
          />
        </div>
        <List
          size="small"
          dataSource={todaySchedules.slice(0, 3)}
          locale={{ emptyText: "Sin asignaciones activas para hoy" }}
          renderItem={(schedule) => (
            <List.Item
              extra={
                <Space>
                  {statusTag(schedule.status)}
                  <Button size="small" onClick={() => onOpenOrder(schedule.id)}>
                    Ver orden
                  </Button>
                </Space>
              }
            >
              <List.Item.Meta
                title={`${schedule.hour} · ${schedule.workOrder}`}
                description={`${protocolName(schedule, protocols)} · ${schedule.assetId}`}
              />
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
}

function OperationalMetric({
  icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "success" | "warning" | "critical";
}) {
  return (
    <div className="operational-status-tile" data-tone={tone}>
      <span className="operational-status-icon">{icon}</span>
      <Typography.Text>{label}</Typography.Text>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  );
}

function protocolName(schedule: Schedule, protocols: Protocol[]) {
  return protocols.find((protocol) => protocol.id === schedule.protocolId)?.name ?? "Mantenimiento";
}

function availabilityLabel(status: NonNullable<Asset["availabilityStatus"]>) {
  if (status === "Assigned") return "ASIGNADO";
  if (status === "Unavailable") return "NO DISPONIBLE";
  return "DISPONIBLE";
}

function conditionTag(condition: NonNullable<Asset["operationalCondition"]>) {
  const labels: Record<NonNullable<Asset["operationalCondition"]>, string> = {
    Operating: "Operando",
    Maintenance: "En mantenimiento",
    Review: "En revisión",
    Quarantine: "En cuarentena",
    OutOfService: "Fuera de servicio",
  };
  const colors: Record<NonNullable<Asset["operationalCondition"]>, string> = {
    Operating: "green",
    Maintenance: "purple",
    Review: "orange",
    Quarantine: "red",
    OutOfService: "red",
  };
  return <Tag color={colors[condition]}>{labels[condition]}</Tag>;
}

function personStatusLabel(status: Person["status"]) {
  if (status === "Assigned") return "ASIGNADO";
  if (status === "OffShift") return "FUERA DE TURNO";
  return "DISPONIBLE";
}

function shiftLabel(shift: Person["shift"]) {
  if (shift === "Morning") return "matutino";
  if (shift === "Afternoon") return "vespertino";
  return "nocturno";
}
