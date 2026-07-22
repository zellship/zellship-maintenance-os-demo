import { Card, Col, Row, Statistic, Table, Tag, Typography, Space, Button, List, Avatar, Progress } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, AlertOutlined, DashboardOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { statusTag } from "../ui";
import { seedAssets } from "../seed";

export function AdminDashboard({ onNav }: { onNav: (k: string) => void }) {
  const { schedules, protocols, incidents } = useStore();
  const today = dayjs().format("YYYY-MM-DD");
  const todays = schedules.filter((s) => s.date === today);
  const completed = todays.filter((s) => s.status === "Completed").length;
  const pending = todays.filter((s) => s.status === "Pending" || s.status === "InProgress").length;
  const compliance = todays.length ? Math.round((completed / todays.length) * 100) : 0;
  const openIncidents = incidents.filter((i) => i.status !== "Closed" && i.status !== "Resolved");

  const rows = todays.map((s) => {
    const p = protocols.find((p) => p.id === s.protocolId);
    return { key: s.id, workOrder: s.workOrder, protocol: p?.name ?? "—", asset: s.assetId, hour: s.hour, operator: s.operator, status: s.status };
  });

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Centro de control de mantenimiento</Typography.Title>
      <Typography.Text type="secondary">Del estándar a la evidencia y al desempeño del activo · {dayjs().format("dddd D MMMM YYYY")}</Typography.Text>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="% Cumplimiento" value={compliance} suffix="%" valueStyle={{ color: "#7B35C1" }} prefix={<CheckCircleOutlined />} />
            <Progress percent={compliance} showInfo={false} strokeColor="#7B35C1" style={{ marginTop: 8 }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Pendientes hoy" value={pending} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Incidencias activas" value={openIncidents.length} valueStyle={{ color: "#cf1322" }} prefix={<AlertOutlined />} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Disponibilidad de activos" value={Math.round(seedAssets.reduce((sum, a) => sum + a.availability, 0) / seedAssets.length)} suffix="%" prefix={<DashboardOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Órdenes prioritarias del día" extra={<Button type="link" onClick={() => onNav("orders")}>Ver todas las órdenes</Button>}>
            <Table
              size="middle"
              pagination={false}
              dataSource={rows}
              columns={[
                { title: "Orden", dataIndex: "workOrder", width: 130 },
                { title: "Protocolo", dataIndex: "protocol" },
                { title: "Activo", dataIndex: "asset", width: 90 },
                { title: "Hora", dataIndex: "hour", width: 90 },
                { title: "Responsable", dataIndex: "operator" },
                { title: "Estado", dataIndex: "status", render: (s) => statusTag(s) },
                { title: "Acción", render: () => <Button size="small" onClick={() => onNav("orders")}>Ver</Button>, width: 100 },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<Space><ExclamationCircleOutlined style={{ color: "#cf1322" }} />Alertas activas</Space>}>
            <List
              dataSource={openIncidents}
              locale={{ emptyText: "Sin alertas" }}
              renderItem={(i) => (
                <List.Item actions={[<Button size="small" type="primary">Resolver</Button>]}>
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: "#fff1f0", color: "#cf1322" }} icon={<AlertOutlined />} />}
                    title={<Tag color={i.type === "NotExecuted" ? "red" : i.type === "LateExecution" ? "orange" : "purple"}>{i.type}</Tag>}
                    description={i.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
