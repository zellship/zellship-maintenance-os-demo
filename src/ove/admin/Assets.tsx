import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  DatePicker,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  TimePicker,
  Timeline,
  Typography,
  message,
} from "antd";
import { SmartTable } from "../shared/SmartTable";
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
import dayjs, { type Dayjs } from "dayjs";
import { advanceDemoClock, demoNow } from "../../demo-config/clock";
import { seedAssets } from "../seed";
import { useStore } from "../store";
import { priorityTag, statusTag } from "../ui";
import type { Asset, Notification, Protocol, Schedule } from "../types";
import { activeDemo } from "../../demo-config/active";
import {
  assetProfiles,
  type AssetProfileDefinition,
  type AssetRelationship,
} from "./assetProfiles";
import { EntityDocuments } from "../shared/EntityDocuments";
import { ProfileSectionNav } from "../shared/ProfileSectionNav";
import { WorkOrderDetailModal } from "./WorkOrders";
import { AssetOperationalSummary } from "../shared/OperationalProfileSummary";

type Observation = { id: string; assetId: string; text: string; author: string; at: string };
type MaintenanceScheduleValues = {
  protocolId: string;
  date: Dayjs;
  time: Dayjs;
  operator: string;
  tolerance: number;
  comments?: string;
};

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
  const [selectedId, setSelectedId] = useState(seedAssets[0]?.id ?? "");
  const [view, setView] = useState<"list" | "profile">("list");
  const [observationOpen, setObservationOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [detailScheduleId, setDetailScheduleId] = useState<string | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationForm] = Form.useForm<{ observation: string }>();
  const [maintenanceForm] = Form.useForm<MaintenanceScheduleValues>();

  const asset = seedAssets.find((item) => item.id === selectedId) ?? seedAssets[0];
  const profile = assetProfiles[asset.id];
  const relatedSchedules = schedules.filter((schedule) => schedule.assetId === asset.id);
  const relatedScheduleIds = new Set(relatedSchedules.map((schedule) => schedule.id));
  const relatedExecutions = executions.filter((execution) =>
    relatedScheduleIds.has(execution.scheduleId),
  );
  const relatedIncidents = incidents.filter(
    (incident) =>
      incident.assetId === asset.id ||
      (incident.scheduleId && relatedScheduleIds.has(incident.scheduleId)) ||
      protocols
        .find((protocol) => protocol.id === incident.protocolId)
        ?.assetIds?.includes(asset.id),
  );
  const directProtocols = protocols.filter((protocol) => protocol.assetIds?.includes(asset.id));
  const relatedProtocols = protocols
    .filter(
      (protocol) =>
        protocol.status === "Active" &&
        !directProtocols.some((direct) => direct.id === protocol.id) &&
        protocol.branches.includes(asset.plant),
    )
    .slice(0, 2);
  const applicableProtocols = [...directProtocols, ...relatedProtocols];
  const selectedMaintenanceProtocolId = Form.useWatch("protocolId", maintenanceForm);
  const selectedMaintenanceProtocol = protocols.find(
    (protocol) => protocol.id === selectedMaintenanceProtocolId,
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
      at: advanceDemoClock(1).toISOString(),
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

  const openMaintenanceScheduler = () => {
    const protocol = applicableProtocols[0] ?? protocols[0];
    let suggestedStart = demoNow()
      .hour(asset.status === "Risk" ? 14 : 9)
      .minute(0)
      .second(0);
    if (suggestedStart.isBefore(demoNow())) suggestedStart = suggestedStart.add(1, "day");
    maintenanceForm.setFieldsValue({
      protocolId: protocol.id,
      date: suggestedStart,
      time: suggestedStart,
      operator: protocol.operators[0] ?? activeDemo.context.primaryOperator,
      tolerance: protocol.schedule[0]?.tolerance ?? 20,
      comments: asset.status === "Risk" ? profile.insights[0]?.detail : undefined,
    });
    setMaintenanceOpen(true);
  };

  const scheduleMaintenance = (values: MaintenanceScheduleValues) => {
    const protocol = protocols.find((item) => item.id === values.protocolId) ?? protocols[0];
    const start = values.date.hour(values.time.hour()).minute(values.time.minute()).second(0);
    const schedule: Schedule = {
      id: `s-asset-${Date.now()}`,
      protocolId: protocol.id,
      date: start.format("YYYY-MM-DD"),
      hour: start.format("HH:mm"),
      tolerance: values.tolerance,
      operator: values.operator,
      status: "Pending",
      assetId: asset.id,
      plant: asset.plant,
      workOrder: `OT-ASSET-${String(schedules.length + 1).padStart(3, "0")}`,
      eligibilityValidated: true,
      notes: values.comments?.trim(),
    };
    const notification: Notification = {
      id: `n-asset-plan-${Date.now()}`,
      type: "Assignment",
      channel: "WhatsApp",
      actor: "Entity Profile Engine",
      recipientRole: "operator",
      recipient: schedule.operator,
      source: "OnDemand",
      event: "Mantenimiento programado desde Asset Profile",
      message: `${schedule.workOrder}: ${protocol.name} asignado sobre ${asset.id} para el ${start.format("DD/MM/YYYY")} a las ${schedule.hour}.`,
      status: "Sent",
      createdAt: advanceDemoClock(1).toISOString(),
    };
    setSchedules([schedule, ...schedules]);
    setNotifications([notification, ...notifications]);
    maintenanceForm.resetFields();
    setMaintenanceOpen(false);
    message.success(`${schedule.workOrder} creada y asignada a ${schedule.operator}`);
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
        onSchedule={openMaintenanceScheduler}
        onOpenOrder={setDetailScheduleId}
      >
        <ObservationModal
          open={observationOpen}
          asset={asset}
          form={observationForm}
          onCancel={() => setObservationOpen(false)}
          onFinish={captureObservation}
        />
        <MaintenanceScheduleModal
          open={maintenanceOpen}
          asset={asset}
          profile={profile}
          form={maintenanceForm}
          protocols={applicableProtocols}
          directProtocolIds={new Set(directProtocols.map((protocol) => protocol.id))}
          selectedProtocol={selectedMaintenanceProtocol}
          onProtocolChange={(protocolId) => {
            const protocol = protocols.find((item) => item.id === protocolId);
            if (!protocol) return;
            maintenanceForm.setFieldsValue({
              operator: protocol.operators[0] ?? activeDemo.context.primaryOperator,
              tolerance: protocol.schedule[0]?.tolerance ?? 20,
            });
          }}
          onCancel={() => {
            maintenanceForm.resetFields();
            setMaintenanceOpen(false);
          }}
          onFinish={scheduleMaintenance}
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
        <WorkOrderDetailModal
          scheduleId={detailScheduleId}
          onClose={() => setDetailScheduleId(null)}
        />
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
          <Card title="Lista de activos" className="asset-list-card">
            <SmartTable
              searchPlaceholder="Buscar código, activo, familia o planta"
              searchFields={["id", "name", "family", "plant"]}
              filterFields={[
                { key: "status", label: "Estado", accessor: "status" },
                { key: "criticality", label: "Criticidad", accessor: "criticality" },
                { key: "plant", label: "Planta", accessor: "plant" },
              ]}
              className="asset-list-table"
              rowKey="id"
              dataSource={seedAssets}
              pagination={false}
              tableLayout="fixed"
              scroll={{ x: 950 }}
              onRow={(row) => ({
                onClick: () => setSelectedId(row.id),
                style: { cursor: "pointer" },
              })}
              rowClassName={(row) => (row.id === selectedId ? "asset-row-selected" : "")}
              columns={[
                {
                  title: "Activo",
                  width: 280,
                  sorter: (a, b) =>
                    `${a.id} ${a.name}`.localeCompare(`${b.id} ${b.name}`, "es", { numeric: true }),
                  render: (_, item) => (
                    <div className="asset-table-identity">
                      <Avatar
                        shape="square"
                        size={42}
                        style={{ background: item.status === "Risk" ? "#cf1322" : "#7B35C1" }}
                        icon={<SettingOutlined />}
                      />
                      <div>
                        <b>{item.id}</b>
                        <Typography.Text type="secondary" title={item.name}>
                          {item.name}
                        </Typography.Text>
                      </div>
                    </div>
                  ),
                },
                { title: "Familia", dataIndex: "family", width: 150, ellipsis: true },
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
                  width: 155,
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
  onOpenOrder,
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
  onOpenOrder: (scheduleId: string) => void;
  children: ReactNode;
}) {
  const { protocols } = useStore();
  const profile = assetProfiles[asset.id];
  const nextSchedule = relatedSchedules
    .filter((schedule) => schedule.status === "Pending")
    .sort((a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`))[0];
  const maintenancePlans = protocols.filter(
    (protocol) =>
      protocol.status === "Active" &&
      (!protocol.assetIds?.length || protocol.assetIds.includes(asset.id)),
  );

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

      <ProfileSectionNav variant="asset" />

      <Card id="profile-overview" className="asset-profile-hero">
        <div className="asset-hero-header">
          <div className="asset-hero-identity">
            <Avatar
              shape="square"
              size={68}
              style={{
                background:
                  asset.status === "Risk"
                    ? "linear-gradient(135deg,#cf1322,#7a0c14)"
                    : "linear-gradient(135deg,#7B35C1,#3f1767)",
              }}
              icon={<SettingOutlined />}
            />
            <div className="asset-hero-copy">
              <Space wrap size={[8, 6]}>
                <Typography.Title level={2}>{asset.name}</Typography.Title>
                {assetStatusTag(asset.status)}
                {priorityTag(asset.criticality)}
              </Space>
              <Typography.Text className="asset-hero-model" type="secondary">
                {profile.manufacturer} · {profile.model} · Serie {profile.serial}
              </Typography.Text>
              <Space wrap size={[6, 6]} className="asset-hero-tags">
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
              {profile.dataSources.length} fuentes · confianza {profile.dataConfidence}%
            </Typography.Text>
          </div>
        </div>

        <div className="asset-hero-actions">
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
        </div>
      </Card>

      <AssetOperationalSummary
        asset={asset}
        schedules={relatedSchedules}
        protocols={protocols}
        incidents={relatedIncidents}
        onOpenOrder={onOpenOrder}
      />

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title={<SectionTitle icon={<ThunderboltOutlined />} text="Información clave" />}
              extra={<Typography.Text type="secondary">Actualizado en tiempo real</Typography.Text>}
            >
              <Row gutter={[12, 12]}>
                {profile.keyFacts.map((fact) => (
                  <Col xs={24} md={12} xxl={6} key={fact.label}>
                    <div className="asset-key-fact" data-tone={fact.tone}>
                      <div className="asset-key-fact-icon">{keyFactIcon(fact.tone)}</div>
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
              id="profile-activity"
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
              id="profile-maintenance-history"
              title={
                <SectionTitle icon={<ToolOutlined />} text="Plan e historial de mantenimiento" />
              }
              extra={
                <Space>
                  <Tag>{maintenancePlans.length} planes</Tag>
                  <Tag>{relatedSchedules.length} órdenes</Tag>
                </Space>
              }
            >
              <Descriptions size="small" column={{ xs: 1, md: 3 }} style={{ marginBottom: 12 }}>
                <Descriptions.Item label="Próxima intervención">
                  {nextSchedule
                    ? `${nextSchedule.workOrder} · ${dayjs(`${nextSchedule.date} ${nextSchedule.hour}`).format("DD MMM HH:mm")}`
                    : "Sin orden pendiente"}
                </Descriptions.Item>
                <Descriptions.Item label="Plan vigente">
                  {maintenancePlans[0]?.name ?? "Sin plan asignado"}
                </Descriptions.Item>
                <Descriptions.Item label="Último servicio">
                  {dayjs(asset.lastService).format("DD MMM YYYY")}
                </Descriptions.Item>
              </Descriptions>
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
                          <Button size="small" onClick={() => onOpenOrder(schedule.id)}>
                            Ver detalle
                          </Button>
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

            <Card
              id="profile-incidents"
              title={<SectionTitle icon={<BellOutlined />} text="Incidencias del equipo" />}
              extra={
                <Tag color={relatedIncidents.length ? "red" : "green"}>
                  {relatedIncidents.length}
                </Tag>
              }
            >
              <List
                size="small"
                locale={{ emptyText: "Sin incidencias relacionadas" }}
                dataSource={relatedIncidents.slice(0, 5)}
                renderItem={(incident) => (
                  <List.Item extra={statusTag(incident.status)}>
                    <List.Item.Meta
                      title={incident.description}
                      description={`${incident.type} · ${dayjs(incident.createdAt).format("DD MMM YYYY · HH:mm")}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
      <div id="profile-documents" style={{ marginTop: 16 }}>
        <EntityDocuments entityType="Asset" entityId={asset.id} />
      </div>
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

function MaintenanceScheduleModal({
  open,
  asset,
  profile,
  form,
  protocols,
  directProtocolIds,
  selectedProtocol,
  onProtocolChange,
  onCancel,
  onFinish,
}: {
  open: boolean;
  asset: Asset;
  profile: AssetProfileDefinition;
  form: FormInstance<MaintenanceScheduleValues>;
  protocols: Protocol[];
  directProtocolIds: Set<string>;
  selectedProtocol?: Protocol;
  onProtocolChange: (protocolId: string) => void;
  onCancel: () => void;
  onFinish: (values: MaintenanceScheduleValues) => void;
}) {
  return (
    <Modal
      className="asset-schedule-modal"
      title="Programar mantenimiento"
      open={open}
      width={820}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Crear orden de trabajo"
      cancelText="Cancelar"
    >
      <div className="asset-schedule-context">
        <Avatar
          shape="square"
          icon={<SettingOutlined />}
          style={{ background: asset.status === "Risk" ? "#cf1322" : "#7B35C1" }}
        />
        <div>
          <Typography.Text strong>
            {asset.id} · {asset.name}
          </Typography.Text>
          <Typography.Text type="secondary">
            {asset.plant} · {asset.area} · Salud {asset.health}%
          </Typography.Text>
        </div>
        {assetStatusTag(asset.status)}
      </div>

      <Alert
        className="asset-schedule-recommendation"
        type={asset.status === "Risk" ? "warning" : "info"}
        showIcon
        message={
          profile.insights.find((insight) => insight.title.includes("Ventana"))?.title ??
          "Programación contextual"
        }
        description={
          profile.insights.find((insight) => insight.title.includes("Ventana"))?.detail ??
          "Selecciona el protocolo y la ventana de ejecución más conveniente para el activo."
        }
      />

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="protocolId"
          label="Protocolos aplicables o relacionados"
          rules={[{ required: true, message: "Selecciona un protocolo" }]}
        >
          {protocols.length ? (
            <Radio.Group
              className="asset-schedule-protocols"
              onChange={(event) => onProtocolChange(event.target.value as string)}
            >
              {protocols.map((protocol) => (
                <Radio value={protocol.id} key={protocol.id}>
                  <div className="asset-schedule-protocol-copy">
                    <Space size={6} wrap>
                      <Typography.Text strong>{protocol.name}</Typography.Text>
                      <Tag color={directProtocolIds.has(protocol.id) ? "purple" : "blue"}>
                        {directProtocolIds.has(protocol.id) ? "Aplicable al activo" : "Relacionado"}
                      </Tag>
                      {priorityTag(protocol.priority)}
                    </Space>
                    <Typography.Text type="secondary">{protocol.description}</Typography.Text>
                    <Space size={12} wrap>
                      <small>{protocol.estimatedMinutes ?? 45} min estimados</small>
                      <small>{protocol.evidenceConfig.length} evidencias configuradas</small>
                      <small>{protocol.operators.length} responsables elegibles</small>
                    </Space>
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          ) : (
            <Empty description="No hay protocolos disponibles para este activo" />
          )}
        </Form.Item>

        {selectedProtocol && (
          <div className="asset-schedule-protocol-summary">
            <span>
              <small>Activación</small>
              <strong>{activationLabel(selectedProtocol.activationMode)}</strong>
            </span>
            <span>
              <small>Duración</small>
              <strong>{selectedProtocol.estimatedMinutes ?? 45} min</strong>
            </span>
            <span>
              <small>Herramientas</small>
              <strong>{selectedProtocol.requiredToolIds?.length ?? 0}</strong>
            </span>
            <span>
              <small>Materiales</small>
              <strong>{selectedProtocol.materialRequirements?.length ?? 0}</strong>
            </span>
          </div>
        )}

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="date"
              label="Fecha de ejecución"
              rules={[{ required: true, message: "Selecciona la fecha" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(date) => date.isBefore(demoNow().startOf("day"))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="time"
              label="Hora de inicio"
              rules={[{ required: true, message: "Selecciona la hora" }]}
            >
              <TimePicker style={{ width: "100%" }} format="HH:mm" minuteStep={5} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="operator"
              label="Responsable"
              rules={[{ required: true, message: "Selecciona al responsable" }]}
            >
              <Select
                placeholder="Responsable elegible"
                options={(selectedProtocol?.operators ?? []).map((operator) => ({
                  label: operator,
                  value: operator,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="tolerance" label="Ventana de tolerancia" rules={[{ required: true }]}>
              <Select
                options={[10, 15, 20, 30, 45, 60].map((minutes) => ({
                  label: `± ${minutes} minutos`,
                  value: minutes,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="comments" label="Detalles, instrucciones o comentarios">
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Ej. Validar vibración antes de desmontar, coordinar ventana con producción..."
          />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          message="Se creará una orden pendiente vinculada a este Asset Profile."
          description="El responsable recibirá una notificación por WhatsApp y la orden aparecerá en Programación, Órdenes de trabajo y Mantenimiento conectado."
        />
      </Form>
    </Modal>
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

function keyFactIcon(tone: "success" | "warning" | "critical" | "info") {
  if (tone === "success") return <SafetyCertificateOutlined />;
  if (tone === "warning") return <ExclamationCircleOutlined />;
  if (tone === "critical") return <BellOutlined />;
  return <DeploymentUnitOutlined />;
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

function activationLabel(mode: Protocol["activationMode"]) {
  if (mode === "Recurring") return "Programación recurrente";
  if (mode === "Triggered") return "Por condición o evento";
  return "Bajo demanda";
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
