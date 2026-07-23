import { useState } from "react";
import {
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { ApartmentOutlined, DashboardOutlined, FieldTimeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { seedAssets } from "../seed";
import { useStore } from "../store";
import { priorityTag } from "../ui";

export function Assets() {
  const { schedules, protocols, executions } = useStore();
  const [selectedId, setSelectedId] = useState("AC-01");
  const asset = seedAssets.find((a) => a.id === selectedId)!;
  const related = schedules.filter((s) => s.assetId === selectedId);
  const history = related.map((s) => ({
    schedule: s,
    protocol: protocols.find((p) => p.id === s.protocolId),
    execution: executions.find((e) => e.scheduleId === s.id),
  }));

  return (
    <div className="industrial-page">
      <div style={{ marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Activos
        </Typography.Title>
        <Typography.Text type="secondary">
          Perfil operativo con contexto, mantenimiento, evidencia y condición.
        </Typography.Text>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Registro maestro">
            <Table
              rowKey="id"
              dataSource={seedAssets}
              pagination={false}
              rowSelection={{
                type: "radio",
                selectedRowKeys: [selectedId],
                onChange: (keys) => setSelectedId(String(keys[0])),
              }}
              columns={[
                {
                  title: "Activo",
                  render: (_, a) => (
                    <Space direction="vertical" size={0}>
                      <b>
                        {a.id} · {a.name}
                      </b>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {a.area}
                      </Typography.Text>
                    </Space>
                  ),
                },
                { title: "Criticidad", dataIndex: "criticality", width: 110, render: priorityTag },
                {
                  title: "Disponibilidad",
                  dataIndex: "availability",
                  width: 150,
                  render: (v) => <Progress percent={v} size="small" strokeColor="#7B35C1" />,
                },
                {
                  title: "Estado",
                  dataIndex: "status",
                  width: 120,
                  render: (v) => (
                    <Tag color={v === "Risk" ? "red" : v === "Maintenance" ? "orange" : "green"}>
                      {v === "Risk"
                        ? "En riesgo"
                        : v === "Maintenance"
                          ? "Mantenimiento"
                          : "Disponible"}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={`${asset.id} · Ficha del activo`}
            extra={<Tag color={asset.status === "Risk" ? "red" : "purple"}>{asset.status}</Tag>}
          >
            <Row gutter={[8, 16]}>
              <Col span={8}>
                <Card size="small">
                  <Typography.Text type="secondary">
                    <DashboardOutlined /> Salud
                  </Typography.Text>
                  <Typography.Title level={4}>{asset.health}%</Typography.Title>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Typography.Text type="secondary">
                    <FieldTimeOutlined /> Horas
                  </Typography.Text>
                  <Typography.Title level={4}>
                    {asset.runtimeHours.toLocaleString()}
                  </Typography.Title>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Typography.Text type="secondary">
                    <ApartmentOutlined /> OT
                  </Typography.Text>
                  <Typography.Title level={4}>{related.length}</Typography.Title>
                </Card>
              </Col>
            </Row>
            <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Familia">{asset.family}</Descriptions.Item>
              <Descriptions.Item label="Ubicación">
                {asset.plant} · {asset.area}
              </Descriptions.Item>
              <Descriptions.Item label="Último servicio">
                {dayjs(asset.lastService).format("DD MMM YYYY")}
              </Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5}>Historial conectado</Typography.Title>
            <Timeline
              items={history.slice(0, 4).map((item) => ({
                color: item.execution ? "green" : "blue",
                children: (
                  <>
                    <b>{item.protocol?.name}</b>
                    <br />
                    <Typography.Text type="secondary">
                      {item.schedule.workOrder} · {item.execution?.status || item.schedule.status}
                    </Typography.Text>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
