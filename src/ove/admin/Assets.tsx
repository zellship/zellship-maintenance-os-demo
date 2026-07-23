import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import type { FormInstance } from "antd";
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  FieldTimeOutlined,
  FileSearchOutlined,
  LinkOutlined,
  PlusOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { seedAssets } from "../seed";
import { useStore } from "../store";
import { priorityTag, statusTag } from "../ui";
import type { Asset, Notification, Schedule } from "../types";
import { assetProfiles, type AssetRelationship } from "./assetProfiles";

type Observation = { id: string; assetId: string; text: string; author: string; at: string };

export function Assets() {
  const {
    schedules,
    setSchedules,
    protocols,
    executions,
    incidents,
    notifications,
    setNotifications,
  } = useStore();
  const [selectedId, setSelectedId] = useState("AC-01");
  const [view, setView] = useState<"list" | "profile">("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>();
  const [observationOpen, setObservationOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationForm] = Form.useForm<{ observation: string }>();

  const asset = seedAssets.find((item) => item.id === selectedId) ?? seedAssets[0];
  const profile = assetProfiles[asset.id];
  const relatedSchedules = schedules.filter((schedule) => schedule.assetId === asset.id);
  const relatedScheduleIds = new Set(relatedSchedules.map((schedule) => schedule.id));
  const relatedExecutions = executions.filter((execution) =>
    relatedScheduleIds.has(execution.scheduleId),
  );
  const relatedIncidents = incidents.filter(
    (incident) =>
      (incident.scheduleId && relatedScheduleIds.has(incident.scheduleId)) ||
      protocols
        .find((protocol) => protocol.id === incident.protocolId)
        ?.assetIds?.includes(asset.id),
  );

  const filteredAssets = useMemo(
    () =>
      seedAssets.filter(
        (item) =>
          (!query ||
            `${item.id} ${item.name} ${item.family} ${item.plant}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!statusFilter || item.status === statusFilter),
      ),
    [query, statusFilter],
  );

  const updates = useMemo(() => {
    const executionUpdates = relatedExecutions.map((execution) => {
      const schedule = schedules.find((item) => item.id === execution.scheduleId);
      const protocol = protocols.find((item) => item.id === execution.protocolId);
      return {
        id: execution.id,
        at: execution.endAt ?? execution.startAt,
        color: execution.status === "Validated" ? "green" : "blue",
        title: `${protocol?.name ?? "Mantenimiento"} · ${execution.status}`,
        detail: `${schedule?.workOrder ?? "OT"} · ${execution.operator} · Score ${execution.score ?? "—"}%`,
      };
    });
    const incidentUpdates = relatedIncidents.map((incident) => ({
      id: incident.id,
      at: incident.createdAt,
      color: "red",
      title: `Incidencia · ${incident.type}`,
      detail: incident.description,
    }));
    const observationUpdates = observations
      .filter((observation) => observation.assetId === asset.id)
      .map((observation) => ({
        id: observation.id,
        at: observation.at,
        color: "purple",
        title: `Observación capturada · ${observation.author}`,
        detail: observation.text,
      }));
    return [...observationUpdates, ...incidentUpdates, ...executionUpdates].sort((a, b) =>
      b.at.localeCompare(a.at),
    );
  }, [asset.id, observations, protocols, relatedExecutions, relatedIncidents, schedules]);

  const openProfile = (assetId: string) => {
    setSelectedId(assetId);
    setView("profile");
  };

  const captureObservation = (values: { observation: string }) => {
    const observation: Observation = {
      id: `obs-${Date.now()}`,
      assetId: asset.id,
      text: values.observation,
      author: "Coordinación de mantenimiento",
      at: dayjs().toISOString(),
    };
    const notification: Notification = {
      id: `n-asset-${Date.now()}`,
      type: "OnDemand",
      channel: "Push",
      actor: observation.author,
      recipientRole: "supervisor",
      recipient: profile.owner.split(" · ")[0],
      source: "OnDemand",
      event: "Perfil del activo actualizado",
      message: `${asset.id}: nueva observación registrada en el Entity Profile.`,
      status: "Sent",
      createdAt: observation.at,
    };
    setObservations([observation, ...observations]);
    setNotifications([notification, ...notifications]);
    observationForm.resetFields();
    setObservationOpen(false);
    message.success("Perfil actualizado y supervisor notificado");
  };

  const scheduleMaintenance = () => {
    const protocol = protocols.find((item) => item.assetIds?.includes(asset.id)) ?? protocols[0];
    const start = dayjs().add(90, "minute");
    const schedule: Schedule = {
      id: `s-asset-${Date.now()}`,
      protocolId: protocol.id,
      date: start.format("YYYY-MM-DD"),
      hour: start.format("HH:mm"),
      tolerance: protocol.schedule[0]?.tolerance ?? 20,
      operator: protocol.operators[0] ?? "Ana Torres",
      status: "Pending",
      assetId: asset.id,
      plant: asset.plant,
      workOrder: `OT-ASSET-${schedules.length + 1}`,
      eligibilityValidated: true,
    };
    const notification: Notification = {
      id: `n-asset-plan-${Date.now()}`,
      type: "Assignment",
      channel: "WhatsApp",
      actor: "Entity Profile Engine",
      recipientRole: "operator",
      recipient: schedule.operator,
      source: "Automatic",
      event: "Acción desde perfil",
      message: `${schedule.workOrder}: ${protocol.name} asignado sobre ${asset.id} a las ${schedule.hour}.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setSchedules([schedule, ...schedules]);
    setNotifications([notification, ...notifications]);
    message.success("Orden creada desde el contexto del activo y notificación enviada");
  };

  if (view === "profile") {
    return (
      <AssetProfile
        asset={asset}
        relatedSchedules={relatedSchedules}
        relatedExecutions={relatedExecutions}
        relatedIncidents={relatedIncidents}
        updates={updates}
        onBack={() => setView("list")}
        onCapture={() => setObservationOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        onSchedule={scheduleMaintenance}
      >
        <ObservationModal
          open={observationOpen}
          asset={asset}
          form={observationForm}
          onCancel={() => setObservationOpen(false)}
          onFinish={captureObservation}
        />
        <Modal
          title={`Historial completo · ${asset.id}`}
          open={historyOpen}
          onCancel={() => setHistoryOpen(false)}
          footer={<Button onClick={() => setHistoryOpen(false)}>Cerrar</Button>}
          width={760}
        >
          <Timeline
            items={updates.map((update) => ({
              color: update.color,
              children: (
                <>
                  <b>{update.title}</b>
                  <br />
                  <Typography.Text type="secondary">{update.detail}</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {dayjs(update.at).format("DD MMM YYYY · HH:mm")}
                  </Typography.Text>
                </>
              ),
            }))}
          />
        </Modal>
      </AssetProfile>
    );
  }

  const avgAvailability = Math.round(
    seedAssets.reduce((sum, item) => sum + item.availability, 0) / seedAssets.length,
  );

  return (
    <div className="industrial-page">
      <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Activos
          </Typography.Title>
          <Typography.Text type="secondary">
            Registro maestro y perfiles contextuales impulsados por el Entity Profile Engine.
          </Typography.Text>
        </div>
        <Tag color="purple" icon={<DeploymentUnitOutlined />}>
          {seedAssets.length} perfiles conectados
        </Tag>
      </Space>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Activos registrados" value={seedAssets.length} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Disponibilidad promedio"
              value={avgAvailability}
              suffix="%"
              valueStyle={{ color: "#7B35C1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Críticos / alta"
              value={
                seedAssets.filter((item) => ["Critical", "High"].includes(item.criticality)).length
              }
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Requieren atención"
              value={seedAssets.filter((item) => item.status !== "Available").length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card title="Lista de activos">
            <Space wrap style={{ marginBottom: 12 }}>
              <Input.Search
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar código, activo, familia o planta"
                allowClear
                style={{ width: 310 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                placeholder="Estado"
                style={{ width: 170 }}
                options={[
                  { value: "Available", label: "Disponible" },
                  { value: "Maintenance", label: "Mantenimiento" },
                  { value: "Risk", label: "En riesgo" },
                ]}
              />
            </Space>
            <Table
              rowKey="id"
              dataSource={filteredAssets}
              pagination={false}
              onRow={(row) => ({
                onClick: () => setSelectedId(row.id),
                style: { cursor: "pointer" },
              })}
              rowClassName={(row) => (row.id === selectedId ? "asset-row-selected" : "")}
              columns={[
                {
                  title: "Activo",
                  render: (_, item) => (
                    <Space>
                      <Avatar
                        shape="square"
                        style={{ background: item.status === "Risk" ? "#cf1322" : "#7B35C1" }}
                        icon={<SettingOutlined />}
                      />
                      <span>
                        <b>{item.id}</b>
                        <br />
                        <Typography.Text type="secondary">{item.name}</Typography.Text>
                      </span>
                    </Space>
                  ),
                },
                { title: "Familia", dataIndex: "family", width: 130 },
                { title: "Criticidad", dataIndex: "criticality", width: 110, render: priorityTag },
                {
                  title: "Salud",
                  dataIndex: "health",
                  width: 130,
                  render: (value) => (
                    <Progress
                      percent={value}
                      size="small"
                      strokeColor={value < 70 ? "#cf1322" : "#7B35C1"}
                    />
                  ),
                },
                {
                  title: "Estado",
                  dataIndex: "status",
                  width: 120,
                  render: assetStatusTag,
                },
                {
                  title: "",
                  width: 100,
                  render: (_, item) => (
                    <Button
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openProfile(item.id);
                      }}
                    >
                      Ver perfil
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card
            title="Resumen del activo"
            extra={<Tag color={asset.status === "Risk" ? "red" : "purple"}>{asset.id}</Tag>}
          >
            <Space align="start">
              <Avatar
                shape="square"
                size={58}
                style={{ background: asset.status === "Risk" ? "#cf1322" : "#7B35C1" }}
                icon={<SettingOutlined />}
              />
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {asset.name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {asset.family} · {asset.plant}
                </Typography.Text>
              </div>
            </Space>
            <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Ubicación">{asset.area}</Descriptions.Item>
              <Descriptions.Item label="Clave externa">{profile.externalKey}</Descriptions.Item>
              <Descriptions.Item label="Responsable">{profile.owner}</Descriptions.Item>
              <Descriptions.Item label="Última actualización">
                {dayjs(asset.lastService).format("DD MMM YYYY")}
              </Descriptions.Item>
            </Descriptions>
            <Row gutter={8}>
              <Col span={12}>
                <Card size="small">
                  <Statistic title="Salud" value={asset.health} suffix="%" />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Perfil completo"
                    value={profile.profileCompleteness}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>
            <Alert
              style={{ marginTop: 12 }}
              type={
                asset.status === "Risk"
                  ? "error"
                  : asset.status === "Maintenance"
                    ? "warning"
                    : "success"
              }
              showIcon
              message={profile.insights[0].title}
              description={profile.insights[0].detail}
            />
            <Button
              type="primary"
              block
              style={{ marginTop: 12 }}
              onClick={() => openProfile(asset.id)}
            >
              Abrir Asset Profile
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function AssetProfile({
  asset,
  relatedSchedules,
  relatedExecutions,
  relatedIncidents,
  updates,
  onBack,
  onCapture,
  onHistory,
  onSchedule,
  children,
}: {
  asset: Asset;
  relatedSchedules: Schedule[];
  relatedExecutions: ReturnType<typeof useStore>["executions"];
  relatedIncidents: ReturnType<typeof useStore>["incidents"];
  updates: { id: string; at: string; color: string; title: string; detail: string }[];
  onBack: () => void;
  onCapture: () => void;
  onHistory: () => void;
  onSchedule: () => void;
  children: ReactNode;
}) {
  const { protocols } = useStore();
  const profile = assetProfiles[asset.id];
  const nextSchedule = relatedSchedules
    .filter((schedule) => schedule.status === "Pending")
    .sort((a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`))[0];

  return (
    <div className="asset-profile-page">
      <Space style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Volver a activos
        </Button>
        <Space>
          <Tag color="purple">Entity Profile Engine</Tag>
          <Tag color="green">Perfil {profile.profileCompleteness}%</Tag>
        </Space>
      </Space>

      <div className="asset-context-bar">
        <ContextItem label="Entidad" value={`${asset.id} · ${asset.name}`} strong />
        <ContextItem label="Clave externa" value={profile.externalKey} />
        <ContextItem label="Estado" value={assetStatusLabel(asset.status)} dot={asset.status} />
        <ContextItem label="Ubicación" value={`${asset.plant} · ${asset.area}`} />
        <ContextItem label="Confianza del perfil" value={`${profile.dataConfidence}%`} strong />
      </div>

      <Card className="asset-profile-hero">
        <Space
          style={{ width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}
          wrap
        >
          <Space align="start" size={16}>
            <Badge status={asset.status === "Risk" ? "error" : "success"} offset={[-2, 58]}>
              <Avatar
                shape="square"
                size={72}
                style={{
                  background:
                    asset.status === "Risk"
                      ? "linear-gradient(135deg,#cf1322,#7a0c14)"
                      : "linear-gradient(135deg,#7B35C1,#3f1767)",
                }}
                icon={<SettingOutlined />}
              />
            </Badge>
            <div>
              <Space wrap>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {asset.name}
                </Typography.Title>
                {assetStatusTag(asset.status)}
                {priorityTag(asset.criticality)}
              </Space>
              <Typography.Text type="secondary">
                {profile.manufacturer} · {profile.model} · Serie {profile.serial}
              </Typography.Text>
              <Space wrap style={{ marginTop: 9 }}>
                {profile.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>
          </Space>
          <Space wrap>
            <Button icon={<PlusOutlined />} onClick={onCapture}>
              Capturar observación
            </Button>
            <Button icon={<CalendarOutlined />} onClick={onSchedule}>
              Programar mantenimiento
            </Button>
            <Button type="primary" icon={<FileSearchOutlined />} onClick={onHistory}>
              Historial completo
            </Button>
          </Space>
        </Space>

        <div className="asset-profile-stats">
          <ProfileStat
            value={`${asset.health}%`}
            label="Salud del activo"
            tone={asset.health < 70 ? "red" : "purple"}
          />
          <ProfileStat value={`${asset.availability}%`} label="Disponibilidad" />
          <ProfileStat value={asset.runtimeHours.toLocaleString()} label="Horas de operación" />
          <ProfileStat value={String(relatedSchedules.length)} label="Órdenes conectadas" />
          <ProfileStat
            value={String(relatedIncidents.filter((item) => item.status !== "Closed").length)}
            label="Incidencias activas"
            tone="red"
          />
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title={<SectionTitle icon={<ThunderboltOutlined />} text="Información clave" />}
              extra={<Typography.Text type="secondary">Actualizado en tiempo real</Typography.Text>}
            >
              <Row gutter={[10, 10]}>
                {profile.keyFacts.map((fact, index) => (
                  <Col xs={24} md={12} key={fact}>
                    <div className={`asset-key-fact ${index < 2 ? "hot" : ""}`}>
                      <span>{index < 2 ? "!" : index + 1}</span>
                      <Typography.Text>{fact}</Typography.Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card
              title={
                <SectionTitle icon={<FieldTimeOutlined />} text="Actualizaciones del perfil" />
              }
              extra={
                <Button type="link" onClick={onHistory}>
                  Ver todo
                </Button>
              }
            >
              {updates.length ? (
                <Timeline
                  items={updates.slice(0, 6).map((update) => ({
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
              ) : (
                <Empty description="Sin actualizaciones registradas" />
              )}
            </Card>

            <Card
              title={<SectionTitle icon={<ToolOutlined />} text="Mantenimiento conectado" />}
              extra={<Tag>{relatedSchedules.length} órdenes</Tag>}
            >
              <List
                dataSource={relatedSchedules.slice(0, 5)}
                locale={{ emptyText: "Sin órdenes vinculadas" }}
                renderItem={(schedule) => {
                  const protocol = protocols.find((item) => item.id === schedule.protocolId);
                  const execution = relatedExecutions.find(
                    (item) => item.scheduleId === schedule.id,
                  );
                  return (
                    <List.Item
                      extra={
                        <Space>
                          {execution?.score && <Tag color="green">{execution.score}%</Tag>}
                          {statusTag(execution?.status ?? schedule.status)}
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<ToolOutlined />} />}
                        title={`${schedule.workOrder} · ${protocol?.name ?? "Protocolo"}`}
                        description={`${schedule.operator} · ${dayjs(`${schedule.date} ${schedule.hour}`).format("DD MMM YYYY · HH:mm")}`}
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>

            <Card
              title={<SectionTitle icon={<LinkOutlined />} text="Red de contexto relacionado" />}
              extra={<Tag color="purple">{profile.relationships.length} relaciones</Tag>}
            >
              <AssetRelationshipMap asset={asset} relationships={profile.relationships} />
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card className="asset-ai-card">
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Space>
                  <span className="live-dot" />
                  <b>AI Insights</b>
                </Space>
                <Typography.Text type="secondary">hace 2 min</Typography.Text>
              </Space>
              <Progress
                percent={asset.health}
                strokeColor={asset.health < 70 ? "#cf1322" : "#7B35C1"}
                style={{ marginTop: 14 }}
              />
              <List
                dataSource={profile.insights}
                renderItem={(insight) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            background:
                              insight.tone === "critical"
                                ? "#cf1322"
                                : insight.tone === "warning"
                                  ? "#fa8c16"
                                  : insight.tone === "success"
                                    ? "#52c41a"
                                    : "#1677ff",
                          }}
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

            <Card title={<SectionTitle icon={<DatabaseOutlined />} text="Identidad y metadata" />}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="ID Maintenance OS">{asset.id}</Descriptions.Item>
                <Descriptions.Item label="Clave externa">{profile.externalKey}</Descriptions.Item>
                <Descriptions.Item label="Asset Tag">{profile.assetTag}</Descriptions.Item>
                <Descriptions.Item label="Fabricante">{profile.manufacturer}</Descriptions.Item>
                <Descriptions.Item label="Modelo">{profile.model}</Descriptions.Item>
                <Descriptions.Item label="Serie">{profile.serial}</Descriptions.Item>
                <Descriptions.Item label="Instalación">
                  {dayjs(profile.installedAt).format("DD MMM YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Centro de costo">{profile.costCenter}</Descriptions.Item>
                <Descriptions.Item label="Energía">{profile.energySource}</Descriptions.Item>
                <Descriptions.Item label="Control">{profile.controlSystem}</Descriptions.Item>
              </Descriptions>
              <Alert
                type="info"
                showIcon
                style={{ marginTop: 12 }}
                message="Metadata configurable"
                description="El perfil conserva el mismo layout; atributos, relaciones y contexto cambian por familia de activo."
              />
            </Card>

            <Card title={<SectionTitle icon={<ApartmentOutlined />} text="Contexto operacional" />}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Responsable">{profile.owner}</Descriptions.Item>
                <Descriptions.Item label="Fuentes">
                  <Space wrap>
                    {profile.dataSources.map((source) => (
                      <Tag color="blue" key={source}>
                        {source}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Siguiente acción">
                  {nextSchedule
                    ? `${nextSchedule.workOrder} · ${dayjs(`${nextSchedule.date} ${nextSchedule.hour}`).format("DD MMM HH:mm")}`
                    : "Sin mantenimiento pendiente"}
                </Descriptions.Item>
                <Descriptions.Item label="Incidencias">
                  <Tag color={relatedIncidents.length ? "red" : "green"}>
                    {relatedIncidents.length} relacionadas
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>
      </Row>
      {children}
    </div>
  );
}

function AssetRelationshipMap({
  asset,
  relationships,
}: {
  asset: Asset;
  relationships: AssetRelationship[];
}) {
  return (
    <div className="asset-relationship-map">
      <div className="asset-relationship-center">
        <Avatar size={50} shape="square" icon={<SettingOutlined />} />
        <b>{asset.id}</b>
        <small>{asset.family}</small>
      </div>
      <div className="asset-relationship-grid">
        {relationships.map((relationship) => (
          <div className="asset-relation-node" key={`${relationship.type}-${relationship.name}`}>
            <Tag color={relationshipColor(relationship.type)}>{relationship.type}</Tag>
            <b>{relationship.name}</b>
            <Typography.Text type="secondary">{relationship.relation}</Typography.Text>
            {relationship.status && <small>{relationship.status}</small>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ObservationModal({
  open,
  asset,
  form,
  onCancel,
  onFinish,
}: {
  open: boolean;
  asset: Asset;
  form: FormInstance<{ observation: string }>;
  onCancel: () => void;
  onFinish: (values: { observation: string }) => void;
}) {
  return (
    <Modal
      title={`Capturar observación · ${asset.id}`}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Actualizar perfil"
    >
      <Alert
        type="info"
        showIcon
        message="La observación actualizará el perfil y notificará al responsable."
        style={{ marginBottom: 14 }}
      />
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="observation" label="Observación" rules={[{ required: true }]}>
          <Input.TextArea
            rows={4}
            placeholder="Ej. Se observa incremento leve de ruido en el rodamiento..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function ContextItem({
  label,
  value,
  strong,
  dot,
}: {
  label: string;
  value: string;
  strong?: boolean;
  dot?: Asset["status"];
}) {
  return (
    <div>
      <span>{label}</span>
      <b className={strong ? "strong" : ""}>
        {dot && (
          <i
            style={{
              background:
                dot === "Risk" ? "#cf1322" : dot === "Maintenance" ? "#fa8c16" : "#52c41a",
            }}
          />
        )}
        {value}
      </b>
    </div>
  );
}

function ProfileStat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone?: "purple" | "red";
}) {
  return (
    <div>
      <b className={tone}>{value}</b>
      <span>{label}</span>
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

function assetStatusTag(status: Asset["status"]) {
  return (
    <Tag color={status === "Risk" ? "red" : status === "Maintenance" ? "orange" : "green"}>
      {assetStatusLabel(status)}
    </Tag>
  );
}

function assetStatusLabel(status: Asset["status"]) {
  if (status === "Risk") return "En riesgo";
  if (status === "Maintenance") return "En mantenimiento";
  return "Disponible";
}

function relationshipColor(type: AssetRelationship["type"]) {
  if (type === "Person") return "blue";
  if (type === "Protocol") return "purple";
  if (type === "Tool") return "cyan";
  if (type === "Material") return "gold";
  if (type === "Flow") return "orange";
  if (type === "System") return "green";
  return "default";
}
