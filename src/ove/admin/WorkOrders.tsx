import { useState } from "react";
import { Button, Card, Descriptions, Drawer, Empty, Progress, Space, Steps, Table, Tag, Timeline, Typography } from "antd";
import { EyeOutlined, MobileOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedAssets } from "../seed";
import { statusTag } from "../ui";

export function WorkOrders() {
  const { schedules, protocols, executions } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>("s1");
  const selected = schedules.find(s => s.id === selectedId);
  const protocol = protocols.find(p => p.id === selected?.protocolId);
  const execution = executions.find(e => e.scheduleId === selectedId);
  const asset = seedAssets.find(a => a.id === selected?.assetId);
  const step = selected?.status === "Pending" ? 1 : selected?.status === "InProgress" ? 2 : execution?.status === "PendingValidation" ? 3 : execution?.status === "Validated" ? 4 : 3;
  const progress = [0, 20, 55, 85, 100][step] ?? 0;

  const rows = schedules.map(s => ({ ...s, protocol: protocols.find(p => p.id === s.protocolId)?.name, asset: seedAssets.find(a => a.id === s.assetId)?.id }));
  return (
    <div className="industrial-page">
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <div><Typography.Title level={3} style={{ margin: 0 }}>Órdenes de trabajo</Typography.Title><Typography.Text type="secondary">Seguimiento desde la asignación hasta la validación y cierre.</Typography.Text></div>
        <Tag color="purple">{schedules.filter(s => s.status !== "Completed").length} requieren seguimiento</Tag>
      </Space>
      <Card>
        <Table rowKey="id" dataSource={rows} scroll={{ x: 920 }} columns={[
          { title: "Orden", dataIndex: "workOrder", width: 130 },
          { title: "Protocolo", dataIndex: "protocol", width: 260 },
          { title: "Activo", dataIndex: "asset", width: 90 },
          { title: "Fecha", dataIndex: "date", width: 115, render: v => dayjs(v).format("DD MMM") },
          { title: "Responsable", dataIndex: "operator", width: 150 },
          { title: "Estado", dataIndex: "status", width: 140, render: statusTag },
          { title: "", width: 90, render: (_, row) => <Button icon={<EyeOutlined />} onClick={() => setSelectedId(row.id)}>Ver</Button> },
        ]} />
      </Card>
      <Drawer width={640} title={`${selected?.workOrder || "Orden"} · Expediente operativo`} open={!!selectedId} onClose={() => setSelectedId(null)}>
        {!selected || !protocol ? <Empty /> : <>
          <Space style={{ justifyContent: "space-between", width: "100%" }}><div><Typography.Title level={4} style={{ margin: 0 }}>{protocol.name}</Typography.Title><Typography.Text type="secondary">{asset?.name}</Typography.Text></div>{statusTag(execution?.status || selected.status)}</Space>
          <Progress percent={progress} strokeColor="#7B35C1" style={{ marginTop: 18 }} />
          <Steps size="small" current={step} responsive items={[{ title: "Definida" }, { title: "Asignada" }, { title: "Ejecutada" }, { title: "Evaluada" }, { title: "Cerrada" }]} />
          <Descriptions bordered size="small" column={1} style={{ marginTop: 20 }}>
            <Descriptions.Item label="Planta / área">{asset?.plant} · {asset?.area}</Descriptions.Item>
            <Descriptions.Item label="Responsable">{selected.operator}</Descriptions.Item>
            <Descriptions.Item label="Ventana">{dayjs(selected.date).format("DD MMM YYYY")} · {selected.hour} ± {selected.tolerance} min</Descriptions.Item>
            <Descriptions.Item label="Materiales">{protocol.materials?.join(" · ") || "Sin materiales"}</Descriptions.Item>
            <Descriptions.Item label="Seguridad">{protocol.safetyInstructions?.join(" · ")}</Descriptions.Item>
          </Descriptions>
          <Typography.Title level={5} style={{ marginTop: 22 }}>Trazabilidad</Typography.Title>
          <Timeline items={[
            { color: "green", children: `Protocolo ${protocol.status === "Active" ? "vigente" : protocol.status} · versión comercial` },
            { color: "green", children: `Orden asignada a ${selected.operator}` },
            { color: execution ? "green" : "gray", children: execution ? `${execution.evidences.length} evidencias y ${Object.keys(execution.formAnswers).length} respuestas registradas` : "Ejecución pendiente desde la aplicación móvil" },
            { color: execution?.status === "Validated" ? "green" : "gray", children: execution?.status === "Validated" ? `Validada con calificación ${execution.score || 94}%` : "Validación pendiente" },
          ]} />
          {selected.status === "Pending" && <Button type="primary" block size="large" icon={<MobileOutlined />}>Disponible en la operación móvil</Button>}
        </>}
      </Drawer>
    </div>
  );
}
