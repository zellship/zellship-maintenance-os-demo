import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  List,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  FieldTimeOutlined,
  IdcardOutlined,
  LinkOutlined,
  MailOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedSkills } from "../seed";
import type { Notification, Person } from "../types";
import { technicianProfiles } from "./resourceProfiles";

const resourceTag = (status: string) => {
  const color =
    status === "Available"
      ? "green"
      : status === "Reserved" || status === "Assigned"
        ? "purple"
        : status === "InUse"
          ? "blue"
          : status === "OffShift"
            ? "default"
            : "orange";
  const label: Record<string, string> = {
    Available: "Disponible",
    Reserved: "Reservado",
    Assigned: "Asignado",
    InUse: "En uso",
    Calibration: "Calibración",
    Unavailable: "No disponible",
    OffShift: "Fuera de turno",
  };
  return <Tag color={color}>{label[status] || status}</Tag>;
};

export function Resources() {
  const {
    people,
    setPeople,
    tools,
    inventory,
    reservations,
    schedules,
    setSchedules,
    protocols,
    executions,
    notifications,
    setNotifications,
  } = useStore();
  const technicians = people.filter((person) => person.role === "Technician");
  const [selectedId, setSelectedId] = useState("per-ana");
  const [view, setView] = useState<"list" | "profile">("list");
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const activeReservations = reservations.filter(
    (reservation) => reservation.status === "Reserved" || reservation.status === "InUse",
  );
  const stockAlerts = inventory.filter(
    (item) => item.onHand - item.reserved - item.quarantine <= item.reorderPoint,
  );
  const person = technicians.find((item) => item.id === selectedId) ?? technicians[0];

  const openProfile = (personId: string) => {
    setSelectedId(personId);
    setView("profile");
  };

  const sendNotification = () => {
    const notification: Notification = {
      id: `n-person-${Date.now()}`,
      type: "OnDemand",
      channel: "Push",
      actor: "Coordinación de mantenimiento",
      recipientRole: "operator",
      recipient: person.name,
      source: "OnDemand",
      event: "Mensaje desde perfil",
      message: `${person.name}: confirma disponibilidad para la siguiente ventana de mantenimiento.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([notification, ...notifications]);
    message.success(`Notificación push enviada a ${person.name}`);
  };

  const assignOrder = () => {
    const candidate = schedules.find(
      (schedule) => schedule.status === "Pending" && schedule.operator !== person.name,
    );
    if (!candidate) {
      message.info("No hay órdenes pendientes disponibles para reasignar");
      return;
    }
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === candidate.id ? { ...schedule, operator: person.name } : schedule,
      ),
    );
    setPeople(
      people.map((item) =>
        item.id === person.id ? { ...item, status: "Assigned" as const } : item,
      ),
    );
    const notification: Notification = {
      id: `n-assign-person-${Date.now()}`,
      type: "Assignment",
      channel: "WhatsApp",
      actor: "Business Commitment Engine",
      recipientRole: "operator",
      recipient: person.name,
      source: "Automatic",
      event: "Orden asignada",
      message: `${candidate.workOrder} fue asignada desde el perfil del colaborador.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([notification, ...notifications]);
    message.success(`${candidate.workOrder} asignada y WhatsApp enviado`);
  };

  const openSkills = () => {
    setSelectedSkills(person.skillIds);
    setSkillsOpen(true);
  };

  const saveSkills = () => {
    setPeople(
      people.map((item) => (item.id === person.id ? { ...item, skillIds: selectedSkills } : item)),
    );
    setSkillsOpen(false);
    message.success("Matriz de skills y elegibilidad actualizadas");
  };

  if (view === "profile") {
    return (
      <TechnicianProfile
        person={person}
        schedules={schedules}
        protocols={protocols}
        executions={executions}
        onBack={() => setView("list")}
        onAssign={assignOrder}
        onNotify={sendNotification}
        onSkills={openSkills}
      >
        <Modal
          title={`Actualizar skills · ${person.name}`}
          open={skillsOpen}
          onCancel={() => setSkillsOpen(false)}
          onOk={saveSkills}
          okText="Actualizar elegibilidad"
        >
          <Alert
            type="info"
            showIcon
            message="Los cambios afectan los protocolos que el colaborador puede ejecutar."
            style={{ marginBottom: 14 }}
          />
          <Select
            mode="multiple"
            value={selectedSkills}
            onChange={setSelectedSkills}
            style={{ width: "100%" }}
            options={seedSkills.map((skill) => ({
              value: skill.id,
              label: `${skill.name} · ${skill.category}`,
            }))}
          />
        </Modal>
      </TechnicianProfile>
    );
  }

  return (
    <div className="industrial-page">
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Recursos operativos
        </Typography.Title>
        <Typography.Text type="secondary">
          Elegibilidad, disponibilidad, perfiles y reservas conectadas a cada orden.
        </Typography.Text>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Técnicos habilitados"
              value={technicians.length}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Equipos disponibles"
              value={tools.filter((tool) => tool.status === "Available").length}
              suffix={`/ ${tools.length}`}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Reservas activas"
              value={activeReservations.length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic
              title="Alertas de inventario"
              value={stockAlerts.length}
              valueStyle={{ color: stockAlerts.length ? "#d46b08" : "#389e0d" }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Card>
        <Tabs
          items={[
            {
              key: "people",
              label: "Personal y skills",
              children: (
                <Table
                  rowKey="id"
                  dataSource={technicians}
                  pagination={false}
                  scroll={{ x: 960 }}
                  rowClassName={(row) => (row.id === selectedId ? "asset-row-selected" : "")}
                  onRow={(row) => ({
                    onClick: () => setSelectedId(row.id),
                    style: { cursor: "pointer" },
                  })}
                  columns={[
                    {
                      title: "Técnico",
                      dataIndex: "name",
                      width: 230,
                      render: (name, technician) => (
                        <Space>
                          <Avatar style={{ background: "#7B35C1" }}>
                            {initials(technician.name)}
                          </Avatar>
                          <div>
                            <b>{name}</b>
                            <Typography.Text type="secondary" className="resource-person-meta">
                              {technician.plant} · Turno{" "}
                              {technician.shift === "Morning" ? "mañana" : technician.shift}
                            </Typography.Text>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      title: "Skills habilitantes",
                      dataIndex: "skillIds",
                      render: (ids) => (
                        <Space wrap>
                          {ids.map((id: string) => (
                            <Tag key={id}>
                              {seedSkills.find((skill) => skill.id === id)?.name || id}
                            </Tag>
                          ))}
                        </Space>
                      ),
                    },
                    {
                      title: "Perfil",
                      width: 110,
                      render: (_, technician) => (
                        <Progress
                          type="circle"
                          size={42}
                          percent={technicianProfiles[technician.id]?.profileCompleteness ?? 80}
                        />
                      ),
                    },
                    {
                      title: "Certificación",
                      dataIndex: "certificationValidUntil",
                      width: 160,
                      render: (value) =>
                        value ? (
                          <Tag color={dayjs(value).isAfter(dayjs()) ? "green" : "red"}>
                            Hasta {dayjs(value).format("DD MMM YYYY")}
                          </Tag>
                        ) : (
                          "—"
                        ),
                    },
                    { title: "Estado", dataIndex: "status", width: 120, render: resourceTag },
                    {
                      title: "",
                      width: 100,
                      render: (_, technician) => (
                        <Button
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProfile(technician.id);
                          }}
                        >
                          Ver perfil
                        </Button>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: "tools",
              label: "Equipos y herramientas",
              children: (
                <Table
                  rowKey="id"
                  dataSource={tools}
                  pagination={false}
                  scroll={{ x: 820 }}
                  columns={[
                    {
                      title: "Equipo",
                      dataIndex: "name",
                      render: (name, tool) => (
                        <Space direction="vertical" size={0}>
                          <b>{name}</b>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Serie {tool.serial}
                          </Typography.Text>
                        </Space>
                      ),
                    },
                    { title: "Ubicación", dataIndex: "location" },
                    {
                      title: "Calibración",
                      dataIndex: "calibrationValidUntil",
                      width: 170,
                      render: (value) =>
                        value ? `Vigente · ${dayjs(value).format("DD MMM YYYY")}` : "No aplica",
                    },
                    { title: "Estado", dataIndex: "status", width: 120, render: resourceTag },
                  ]}
                />
              ),
            },
            {
              key: "inventory",
              label: "Materiales e inventario",
              children: (
                <Table
                  rowKey="id"
                  dataSource={inventory}
                  pagination={false}
                  scroll={{ x: 900 }}
                  columns={[
                    {
                      title: "Material",
                      dataIndex: "name",
                      render: (name, item) => (
                        <Space direction="vertical" size={0}>
                          <b>{name}</b>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {item.sku} · {item.warehouse}
                          </Typography.Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Existencia",
                      dataIndex: "onHand",
                      width: 110,
                      render: (value, item) => `${value} ${item.unit}`,
                    },
                    {
                      title: "Reservado",
                      dataIndex: "reserved",
                      width: 110,
                      render: (value, item) => `${value} ${item.unit}`,
                    },
                    {
                      title: "Disponible real",
                      width: 150,
                      render: (_, item) => {
                        const available = item.onHand - item.reserved - item.quarantine;
                        const percent = Math.min(
                          100,
                          Math.round((available / Math.max(item.onHand, 1)) * 100),
                        );
                        return (
                          <Space direction="vertical" size={0} style={{ width: 120 }}>
                            <b>
                              {available} {item.unit}
                            </b>
                            <Progress
                              percent={percent}
                              showInfo={false}
                              size="small"
                              status={available <= item.reorderPoint ? "exception" : "normal"}
                            />
                          </Space>
                        );
                      },
                    },
                    {
                      title: "Estado",
                      width: 130,
                      render: (_, item) =>
                        item.onHand - item.reserved - item.quarantine <= item.reorderPoint ? (
                          <Tag color="orange">Reabastecer</Tag>
                        ) : (
                          <Tag color="green">Disponible</Tag>
                        ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

function TechnicianProfile({
  person,
  schedules,
  protocols,
  executions,
  onBack,
  onAssign,
  onNotify,
  onSkills,
  children,
}: {
  person: Person;
  schedules: ReturnType<typeof useStore>["schedules"];
  protocols: ReturnType<typeof useStore>["protocols"];
  executions: ReturnType<typeof useStore>["executions"];
  onBack: () => void;
  onAssign: () => void;
  onNotify: () => void;
  onSkills: () => void;
  children: ReactNode;
}) {
  const profile = technicianProfiles[person.id];
  const relatedSchedules = schedules.filter((schedule) => schedule.operator === person.name);
  const scheduleIds = new Set(relatedSchedules.map((schedule) => schedule.id));
  const relatedExecutions = executions.filter((execution) => scheduleIds.has(execution.scheduleId));
  const skillDetails = person.skillIds
    .map((skillId) => seedSkills.find((skill) => skill.id === skillId))
    .filter(Boolean);
  const updates = [
    ...relatedExecutions.map((execution) => ({
      at: execution.endAt ?? execution.startAt,
      title: `Ejecución ${execution.status}`,
      detail: `${protocols.find((protocol) => protocol.id === execution.protocolId)?.name ?? "Protocolo"} · Calificación ${execution.score ?? "—"}%`,
      color: execution.status === "Validated" ? "green" : "purple",
    })),
    ...relatedSchedules.slice(0, 3).map((schedule) => ({
      at: `${schedule.date}T${schedule.hour}:00`,
      title: `${schedule.workOrder} · ${schedule.status}`,
      detail:
        protocols.find((protocol) => protocol.id === schedule.protocolId)?.name ?? "Protocolo",
      color: schedule.status === "Completed" ? "green" : "blue",
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="resource-profile-page">
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Volver a recursos
        </Button>
        <Space>
          <Tag color="purple">Entity Profile Engine</Tag>
          <Tag color="green">Perfil {profile.profileCompleteness}%</Tag>
        </Space>
      </Space>

      <div className="asset-context-bar">
        <ProfileContext label="Entidad" value={`${person.id} · ${person.name}`} />
        <ProfileContext label="Clave externa" value={profile.externalKey} />
        <ProfileContext
          label="Estado"
          value={person.status === "Assigned" ? "Asignado" : "Disponible"}
        />
        <ProfileContext label="Planta" value={person.plant} />
        <ProfileContext label="Confianza" value={`${profile.dataConfidence}%`} />
      </div>

      <Card className="asset-profile-hero resource-profile-hero">
        <div className="asset-hero-header">
          <div className="asset-hero-identity">
            <Avatar size={76} style={{ background: "linear-gradient(135deg,#7B35C1,#B57BFF)" }}>
              {initials(person.name)}
            </Avatar>
            <div className="asset-hero-copy">
              <Space wrap>
                <Typography.Title level={2}>{person.name}</Typography.Title>
                {resourceTag(person.status)}
                <Tag color="blue">Técnico de mantenimiento</Tag>
              </Space>
              <Typography.Text className="asset-hero-model" type="secondary">
                {profile.specialty} · {profile.team}
              </Typography.Text>
              <Space wrap className="asset-hero-tags">
                {profile.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>
          </div>
          <div className="asset-hero-sync">
            <Space>
              <span className="live-dot" />
              <Typography.Text strong>Perfil sincronizado</Typography.Text>
            </Space>
            <Typography.Text type="secondary">
              HCM · Maintenance OS · Skills · Evidencia
            </Typography.Text>
          </div>
        </div>
        <div className="asset-hero-actions">
          <Space wrap>
            <Button icon={<UserAddOutlined />} onClick={onAssign}>
              Asignar orden
            </Button>
            <Button icon={<BellOutlined />} onClick={onNotify}>
              Enviar notificación
            </Button>
            <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={onSkills}>
              Actualizar skills
            </Button>
          </Space>
        </div>
        <div className="resource-profile-stats">
          <Metric
            label="Competencia"
            value={`${profile.competencyScore}%`}
            icon={<SafetyCertificateOutlined />}
          />
          <Metric label="On-time" value={`${profile.onTime}%`} icon={<FieldTimeOutlined />} />
          <Metric
            label="First-time fix"
            value={`${profile.firstTimeFix}%`}
            icon={<ToolOutlined />}
          />
          <Metric
            label="Órdenes cerradas"
            value={String(profile.completedOrders)}
            icon={<CheckCircleOutlined />}
          />
          <Metric
            label="Calificación media"
            value={`${profile.avgScore}%`}
            icon={<RadarChartOutlined />}
          />
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title={<SectionTitle icon={<IdcardOutlined />} text="Información clave" />}
              extra={<Typography.Text type="secondary">Actualizado en tiempo real</Typography.Text>}
            >
              <Row gutter={[12, 12]}>
                {profile.keyFacts.map((fact) => (
                  <Col xs={24} md={12} key={fact.label}>
                    <div className="asset-key-fact" data-tone={fact.tone}>
                      <div className="asset-key-fact-icon">
                        <CheckCircleOutlined />
                      </div>
                      <div className="asset-key-fact-content">
                        <Typography.Text className="asset-key-fact-label">
                          {fact.label}
                        </Typography.Text>
                        <strong>{fact.value}</strong>
                        <Typography.Text type="secondary">{fact.detail}</Typography.Text>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card
              title={
                <SectionTitle
                  icon={<SafetyCertificateOutlined />}
                  text="Matriz de skills y elegibilidad"
                />
              }
              extra={
                <Button type="link" onClick={onSkills}>
                  Gestionar
                </Button>
              }
            >
              <List
                dataSource={skillDetails}
                renderItem={(skill) =>
                  skill && (
                    <List.Item
                      extra={
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Habilitante
                        </Tag>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<SafetyCertificateOutlined />} />}
                        title={skill.name}
                        description={`${skill.category} · Nivel validado · Fuente: LMS / HCM`}
                      />
                    </List.Item>
                  )
                }
              />
              <Alert
                type="success"
                showIcon
                message={`${person.name} es elegible para ${eligibleProtocols(person, protocols)} protocolos activos`}
              />
            </Card>

            <Card
              title={
                <SectionTitle icon={<FieldTimeOutlined />} text="Actualizaciones y desempeño" />
              }
            >
              <Timeline
                items={updates.slice(0, 7).map((update) => ({
                  color: update.color,
                  children: (
                    <div className="asset-update">
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <b>{update.title}</b>
                        <Typography.Text type="secondary">
                          {dayjs(update.at).format("DD MMM · HH:mm")}
                        </Typography.Text>
                      </Space>
                      <Typography.Text type="secondary">{update.detail}</Typography.Text>
                    </div>
                  ),
                }))}
              />
            </Card>

            <Card title={<SectionTitle icon={<LinkOutlined />} text="Contexto relacionado" />}>
              <div className="resource-relationship-grid">
                {[
                  { type: "Supervisor", name: profile.supervisor, detail: "Responsable directo" },
                  { type: "Equipo", name: profile.team, detail: "Unidad organizacional" },
                  {
                    type: "Activo",
                    name: relatedSchedules[0]?.assetId ?? "AC-01",
                    detail: "Asignación actual",
                  },
                  {
                    type: "Protocolo",
                    name:
                      protocols.find((p) => p.operators.includes(person.name))?.name ??
                      "Preventivo",
                    detail: "Elegibilidad vigente",
                  },
                  {
                    type: "Herramienta",
                    name: "Kit LOTO industrial",
                    detail: "Reserva relacionada",
                  },
                  { type: "Sistema", name: "HCM + Maintenance OS", detail: "Fuentes de identidad" },
                ].map((relation) => (
                  <div className="resource-relation-card" key={`${relation.type}-${relation.name}`}>
                    <Tag>{relation.type}</Tag>
                    <b>{relation.name}</b>
                    <Typography.Text type="secondary">{relation.detail}</Typography.Text>
                  </div>
                ))}
              </div>
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card className="asset-ai-card" title="AI Insights del colaborador">
              <Progress percent={profile.reliability} strokeColor="#7B35C1" />
              <List
                dataSource={profile.insights}
                renderItem={(insight) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ background: insightColor(insight.tone) }}
                          icon={<RadarChartOutlined />}
                        />
                      }
                      title={insight.title}
                      description={
                        <>
                          {insight.detail}
                          <br />
                          <Typography.Text type="secondary">
                            Confianza {insight.confidence}% · {insight.source}
                          </Typography.Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <Card title={<SectionTitle icon={<IdcardOutlined />} text="Identidad laboral" />}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Employee ID">{profile.employeeNumber}</Descriptions.Item>
                <Descriptions.Item label="Clave HCM">{profile.externalKey}</Descriptions.Item>
                <Descriptions.Item label="Correo">{profile.email}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">{profile.phone}</Descriptions.Item>
                <Descriptions.Item label="Ingreso">
                  {dayjs(profile.hiredAt).format("DD MMM YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Supervisor">{profile.supervisor}</Descriptions.Item>
                <Descriptions.Item label="Turno">{person.shift}</Descriptions.Item>
                <Descriptions.Item label="Planta">{person.plant}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title={
                <SectionTitle icon={<ApartmentOutlined />} text="Asignación y disponibilidad" />
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Estado">{resourceTag(person.status)}</Descriptions.Item>
                <Descriptions.Item label="Órdenes conectadas">
                  {relatedSchedules.length}
                </Descriptions.Item>
                <Descriptions.Item label="En ejecución">
                  {relatedSchedules.filter((schedule) => schedule.status === "InProgress").length}
                </Descriptions.Item>
                <Descriptions.Item label="Certificación">
                  {person.certificationValidUntil
                    ? dayjs(person.certificationValidUntil).format("DD MMM YYYY")
                    : "Sin vencimiento"}
                </Descriptions.Item>
              </Descriptions>
              <Alert
                type="info"
                showIcon
                message="Disponibilidad transaccional"
                description="Al asignar una orden, el colaborador deja de estar disponible para servicios concurrentes."
              />
            </Card>
          </Space>
        </Col>
      </Row>
      {children}
    </div>
  );
}

function ProfileContext({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="asset-profile-stat">
      <span className="asset-profile-stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        <small>Últimos 90 días</small>
      </div>
    </div>
  );
}

function SectionTitle({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Space>
      {icon}
      <span>{text}</span>
    </Space>
  );
}

function eligibleProtocols(person: Person, protocols: ReturnType<typeof useStore>["protocols"]) {
  return protocols.filter(
    (protocol) =>
      !protocol.requiredSkillIds?.length ||
      protocol.requiredSkillIds.every((skillId) => person.skillIds.includes(skillId)),
  ).length;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function insightColor(tone: "success" | "warning" | "critical" | "info") {
  if (tone === "success") return "#52c41a";
  if (tone === "warning") return "#fa8c16";
  if (tone === "critical") return "#cf1322";
  return "#1677ff";
}
