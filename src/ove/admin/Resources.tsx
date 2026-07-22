import { Card, Col, Progress, Row, Space, Statistic, Table, Tabs, Tag, Typography } from "antd";
import { SafetyCertificateOutlined, ToolOutlined, DatabaseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedSkills } from "../seed";

const resourceTag = (status: string) => {
  const color = status === "Available" ? "green" : status === "Reserved" || status === "Assigned" ? "purple" : status === "InUse" ? "blue" : status === "OffShift" ? "default" : "orange";
  const label: Record<string, string> = { Available: "Disponible", Reserved: "Reservado", Assigned: "Asignado", InUse: "En uso", Calibration: "Calibración", Unavailable: "No disponible", OffShift: "Fuera de turno" };
  return <Tag color={color}>{label[status] || status}</Tag>;
};

export function Resources() {
  const { people, tools, inventory, reservations } = useStore();
  const technicians = people.filter(p => p.role === "Technician");
  const activeReservations = reservations.filter(r => r.status === "Reserved" || r.status === "InUse");
  const stockAlerts = inventory.filter(i => i.onHand - i.reserved - i.quarantine <= i.reorderPoint);

  return (
    <div className="industrial-page">
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Recursos operativos</Typography.Title>
        <Typography.Text type="secondary">Elegibilidad, disponibilidad y reservas conectadas a cada orden de mantenimiento.</Typography.Text>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} lg={6}><Card><Statistic title="Técnicos habilitados" value={technicians.length} prefix={<SafetyCertificateOutlined />} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="Equipos disponibles" value={tools.filter(t => t.status === "Available").length} suffix={`/ ${tools.length}`} prefix={<ToolOutlined />} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="Reservas activas" value={activeReservations.length} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="Alertas de inventario" value={stockAlerts.length} valueStyle={{ color: stockAlerts.length ? "#d46b08" : "#389e0d" }} prefix={<DatabaseOutlined />} /></Card></Col>
      </Row>
      <Card>
        <Tabs items={[
          {
            key: "people", label: "Personal y skills", children: <Table rowKey="id" dataSource={technicians} pagination={false} scroll={{ x: 840 }} columns={[
              { title: "Técnico", dataIndex: "name", render: (name, person) => <Space direction="vertical" size={0}><b>{name}</b><Typography.Text type="secondary" style={{ fontSize: 12 }}>{person.plant} · Turno {person.shift === "Morning" ? "mañana" : person.shift}</Typography.Text></Space> },
              { title: "Skills habilitantes", dataIndex: "skillIds", render: ids => <Space wrap>{ids.map((id: string) => <Tag key={id}>{seedSkills.find(s => s.id === id)?.name || id}</Tag>)}</Space> },
              { title: "Certificación vigente", dataIndex: "certificationValidUntil", width: 170, render: value => value ? <Tag color={dayjs(value).isAfter(dayjs()) ? "green" : "red"}>Hasta {dayjs(value).format("DD MMM YYYY")}</Tag> : "—" },
              { title: "Estado", dataIndex: "status", width: 120, render: resourceTag },
            ]} />
          },
          {
            key: "tools", label: "Equipos y herramientas", children: <Table rowKey="id" dataSource={tools} pagination={false} scroll={{ x: 820 }} columns={[
              { title: "Equipo", dataIndex: "name", render: (name, tool) => <Space direction="vertical" size={0}><b>{name}</b><Typography.Text type="secondary" style={{ fontSize: 12 }}>Serie {tool.serial}</Typography.Text></Space> },
              { title: "Ubicación", dataIndex: "location" },
              { title: "Calibración", dataIndex: "calibrationValidUntil", width: 170, render: value => value ? `Vigente · ${dayjs(value).format("DD MMM YYYY")}` : "No aplica" },
              { title: "Estado", dataIndex: "status", width: 120, render: resourceTag },
            ]} />
          },
          {
            key: "inventory", label: "Materiales e inventario", children: <Table rowKey="id" dataSource={inventory} pagination={false} scroll={{ x: 900 }} columns={[
              { title: "Material", dataIndex: "name", render: (name, item) => <Space direction="vertical" size={0}><b>{name}</b><Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.sku} · {item.warehouse}</Typography.Text></Space> },
              { title: "Existencia", dataIndex: "onHand", width: 110, render: (v, item) => `${v} ${item.unit}` },
              { title: "Reservado", dataIndex: "reserved", width: 110, render: (v, item) => `${v} ${item.unit}` },
              { title: "Disponible real", width: 150, render: (_, item) => { const available = item.onHand - item.reserved - item.quarantine; const pct = Math.min(100, Math.round((available / Math.max(item.onHand, 1)) * 100)); return <Space direction="vertical" size={0} style={{ width: 120 }}><b>{available} {item.unit}</b><Progress percent={pct} showInfo={false} size="small" status={available <= item.reorderPoint ? "exception" : "normal"} /></Space>; } },
              { title: "Estado", width: 130, render: (_, item) => item.onHand - item.reserved - item.quarantine <= item.reorderPoint ? <Tag color="orange">Reabastecer</Tag> : <Tag color="green">Disponible</Tag> },
            ]} />
          },
        ]} />
      </Card>
    </div>
  );
}
