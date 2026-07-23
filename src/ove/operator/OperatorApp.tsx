import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Layout,
  List,
  Progress,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloudSyncOutlined,
  CompressOutlined,
  EnvironmentOutlined,
  ExpandOutlined,
  HistoryOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  SignalFilled,
  ToolOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { OperatorHome } from "./OperatorHome";
import { OperatorPending } from "./OperatorPending";
import { OperatorHistory } from "./OperatorHistory";
import { OperatorProfile } from "./OperatorProfile";
import { ExecutionFlow } from "./ExecutionFlow";
import { NotificationCenter } from "../shared/NotificationCenter";
import { useStore } from "../store";
import { seedAssets } from "../seed";

const OPERATOR = "Ana Torres";

export function OperatorApp() {
  const { schedules, protocols, notifications } = useStore();
  const [tab, setTab] = useState("home");
  const [activeSchedule, setActiveSchedule] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const start = (id: string) => setActiveSchedule(id);
  const back = () => setActiveSchedule(null);
  const currentSchedule =
    schedules.find((schedule) => schedule.id === activeSchedule) ??
    schedules.find(
      (schedule) =>
        schedule.operator === OPERATOR &&
        (schedule.status === "Pending" || schedule.status === "InProgress"),
    );
  const currentProtocol = protocols.find((protocol) => protocol.id === currentSchedule?.protocolId);
  const currentAsset = seedAssets.find((asset) => asset.id === currentSchedule?.assetId);
  const operatorNotifications = useMemo(
    () =>
      notifications
        .filter(
          (notification) =>
            notification.recipientRole === "operator" || notification.recipientRole === "all",
        )
        .slice(0, 4),
    [notifications],
  );

  return (
    <div className={`operator-demo-stage ${expanded ? "expanded" : ""}`}>
      <aside className="operator-context-panel operator-context-left">
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div>
            <Typography.Text className="operator-context-kicker">
              EXPERIENCIA DE CAMPO
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: "3px 0" }}>
              Operación móvil
            </Typography.Title>
            <Typography.Text type="secondary">
              El técnico recibe, ejecuta y documenta el mantenimiento desde el punto de trabajo.
            </Typography.Text>
          </div>

          <Card size="small" className="operator-context-card">
            <Space align="start">
              <Badge status="success" offset={[-2, 42]}>
                <Avatar size={50}>AT</Avatar>
              </Badge>
              <div>
                <b>Ana Torres</b>
                <Typography.Text type="secondary" className="operator-context-block">
                  Técnico de mantenimiento
                </Typography.Text>
                <Tag color="green" icon={<SafetyCertificateOutlined />}>
                  Skills validados
                </Tag>
              </div>
            </Space>
          </Card>

          <Card size="small" title="Contexto de la orden" className="operator-context-card">
            <Space direction="vertical" size={9} style={{ width: "100%" }}>
              <ContextLine
                label="Orden"
                value={currentSchedule?.workOrder ?? "OT-2407-013"}
                icon={<ToolOutlined />}
              />
              <ContextLine
                label="Activo"
                value={currentAsset ? `${currentAsset.id} · ${currentAsset.name}` : "AC-01"}
                icon={<CloudSyncOutlined />}
              />
              <ContextLine
                label="Ubicación"
                value={currentSchedule?.plant ?? "Planta Monterrey"}
                icon={<EnvironmentOutlined />}
              />
            </Space>
          </Card>

          <Card size="small" title="Preparación automática" className="operator-context-card">
            <List
              size="small"
              dataSource={[
                "GPS dentro de geocerca",
                "Herramientas reservadas",
                "Materiales disponibles",
                "Permisos y skills vigentes",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    <span>{item}</span>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </aside>

      <section className="operator-phone-column">
        <div className="operator-phone-toolbar">
          <Space>
            <span className="live-dot" />
            <Typography.Text strong>Vista del operador</Typography.Text>
          </Space>
          <Button
            size="small"
            icon={expanded ? <CompressOutlined /> : <ExpandOutlined />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Vista teléfono" : "Ampliar app"}
          </Button>
        </div>

        <div className="operator-phone-frame">
          <div className="operator-phone-hardware" aria-hidden="true">
            <span className="operator-phone-speaker" />
            <span className="operator-phone-camera" />
          </div>
          <div className="operator-phone-screen">
            <div className="operator-status-bar">
              <b>9:41</b>
              <Space size={6}>
                <SignalFilled />
                <WifiOutlined />
                <span className="operator-battery">
                  <i />
                </span>
              </Space>
            </div>
            <Layout className="operator-app-shell">
              <Layout.Content className="operator-app-content">
                {activeSchedule ? (
                  <ExecutionFlow scheduleId={activeSchedule} onClose={back} />
                ) : (
                  <>
                    {tab === "home" && <OperatorHome onStart={start} />}
                    {tab === "pending" && <OperatorPending onStart={start} />}
                    {tab === "history" && <OperatorHistory />}
                    {tab === "notifications" && <NotificationCenter role="operator" />}
                    {tab === "profile" && <OperatorProfile />}
                  </>
                )}
              </Layout.Content>
              {!activeSchedule && (
                <nav className="operator-tabbar" aria-label="Navegación de operación móvil">
                  <Tabs
                    activeKey={tab}
                    onChange={setTab}
                    centered
                    items={[
                      {
                        key: "home",
                        label: (
                          <span>
                            <HomeOutlined />
                            <small>Inicio</small>
                          </span>
                        ),
                      },
                      {
                        key: "pending",
                        label: (
                          <span>
                            <UnorderedListOutlined />
                            <small>Pendientes</small>
                          </span>
                        ),
                      },
                      {
                        key: "history",
                        label: (
                          <span>
                            <HistoryOutlined />
                            <small>Historial</small>
                          </span>
                        ),
                      },
                      {
                        key: "notifications",
                        label: (
                          <span>
                            <BellOutlined />
                            <small>Avisos</small>
                          </span>
                        ),
                      },
                      {
                        key: "profile",
                        label: (
                          <span>
                            <UserOutlined />
                            <small>Perfil</small>
                          </span>
                        ),
                      },
                    ]}
                  />
                </nav>
              )}
            </Layout>
            <div className="operator-home-indicator" aria-hidden="true" />
          </div>
        </div>
      </section>

      <aside className="operator-context-panel operator-context-right">
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div>
            <Typography.Text className="operator-context-kicker">
              SINCRONIZACIÓN EN VIVO
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: "3px 0" }}>
              Foundational Engines
            </Typography.Title>
            <Typography.Text type="secondary">
              Cada acción del celular actualiza compromisos, evidencia y contexto.
            </Typography.Text>
          </div>

          <Card size="small" className="operator-context-card">
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                <span className="live-dot" />
                <b>Conectado</b>
              </Space>
              <Tag color="green">Tiempo real</Tag>
            </Space>
            <Progress percent={100} showInfo={false} strokeColor="#52c41a" />
            <Typography.Text type="secondary">
              Maintenance OS · GPS · cámara · firma
            </Typography.Text>
          </Card>

          <Card size="small" title="Actividad transaccional" className="operator-context-card">
            <List
              size="small"
              dataSource={operatorNotifications}
              locale={{ emptyText: "Sin eventos para el operador" }}
              renderItem={(notification) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="small"
                        style={{
                          background: notification.channel === "WhatsApp" ? "#52c41a" : "#7B35C1",
                        }}
                        icon={<BellOutlined />}
                      />
                    }
                    title={notification.event ?? notification.type}
                    description={
                      <span>
                        {notification.message}
                        <br />
                        <small>
                          {notification.channel} ·{" "}
                          {notification.status === "Read" ? "Recibido" : "Enviado"}
                        </small>
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card size="small" title="Impacto en el sistema" className="operator-context-card">
            <Space wrap>
              <Tag color="blue">Entity Profile</Tag>
              <Tag color="green">Commitment</Tag>
              <Tag color="purple">Operational Excellence</Tag>
            </Space>
            <Typography.Paragraph type="secondary" style={{ margin: "10px 0 0" }}>
              {currentProtocol?.name ?? "El protocolo activo"} alimenta el perfil del activo, el
              newsfeed y el resultado de mantenimiento.
            </Typography.Paragraph>
          </Card>
        </Space>
      </aside>
    </div>
  );
}

function ContextLine({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="operator-context-line">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}
