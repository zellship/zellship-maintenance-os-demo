import { useState } from "react";
import { Button, Card, Col, DatePicker, Form, InputNumber, Modal, Row, Select, Space, Statistic, Table, TimePicker, Typography, message } from "antd";
import { CalendarOutlined, PlusOutlined, TeamOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { operators, plants, seedAssets } from "../seed";
import { statusTag } from "../ui";
import type { Schedule } from "../types";

export function Planning() {
  const { schedules, setSchedules, protocols } = useStore();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const active = protocols.filter(p => p.status === "Active");
  const today = dayjs().format("YYYY-MM-DD");
  const thisWeek = schedules.filter(s => dayjs(s.date).isAfter(dayjs().subtract(1, "day")));
  const pending = thisWeek.filter(s => s.status === "Pending" || s.status === "InProgress").length;

  const create = (values: any) => {
    const protocol = protocols.find(p => p.id === values.protocolId);
    const asset = seedAssets.find(a => a.id === values.assetId);
    const schedule: Schedule = {
      id: `s${Date.now()}`,
      protocolId: values.protocolId,
      date: values.date.format("YYYY-MM-DD"),
      hour: values.hour.format("HH:mm"),
      tolerance: values.tolerance,
      operator: values.operator,
      status: "Pending",
      assetId: values.assetId,
      plant: asset?.plant,
      workOrder: `OT-${dayjs().format("MMDD")}-${String(schedules.length + 19).padStart(3, "0")}`,
    };
    setSchedules([schedule, ...schedules]);
    setOpen(false);
    form.resetFields();
    message.success(`${schedule.workOrder} programada para ${protocol?.name}`);
  };

  const rows = schedules
    .slice()
    .sort((a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`))
    .map(s => ({ ...s, protocol: protocols.find(p => p.id === s.protocolId)?.name, asset: seedAssets.find(a => a.id === s.assetId)?.name }));

  return (
    <div className="industrial-page">
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <div><Typography.Title level={3} style={{ margin: 0 }}>Programación</Typography.Title><Typography.Text type="secondary">Convierte protocolos vigentes en órdenes asignadas y trazables.</Typography.Text></div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Programar orden</Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card><Statistic title="Órdenes esta semana" value={thisWeek.length} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Pendientes por atender" value={pending} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Técnicos asignados" value={new Set(thisWeek.map(s => s.operator)).size} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24}>
          <Card title={`Plan operativo · ${dayjs(today).format("DD MMM YYYY")}`}>
            <Table rowKey="id" dataSource={rows} scroll={{ x: 900 }} columns={[
              { title: "Orden", dataIndex: "workOrder", width: 130 },
              { title: "Fecha", dataIndex: "date", width: 115, render: v => dayjs(v).format("DD MMM") },
              { title: "Hora", dataIndex: "hour", width: 80 },
              { title: "Protocolo", dataIndex: "protocol", width: 250 },
              { title: "Activo", dataIndex: "asset", width: 220 },
              { title: "Responsable", dataIndex: "operator", width: 150 },
              { title: "Estado", dataIndex: "status", width: 140, render: statusTag },
            ]} />
          </Card>
        </Col>
      </Row>
      <Modal title="Programar orden de trabajo" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Crear orden" cancelText="Cancelar">
        <Form form={form} layout="vertical" onFinish={create} initialValues={{ date: dayjs().add(1, "day"), hour: dayjs("10:00", "HH:mm"), tolerance: 20, plant: plants[0], operator: operators[0] }}>
          <Form.Item name="protocolId" label="Protocolo" rules={[{ required: true }]}><Select options={active.map(p => ({ value: p.id, label: p.name }))} /></Form.Item>
          <Form.Item name="assetId" label="Activo" rules={[{ required: true }]}><Select options={seedAssets.map(a => ({ value: a.id, label: `${a.id} · ${a.name}` }))} /></Form.Item>
          <Row gutter={12}><Col span={12}><Form.Item name="date" label="Fecha" rules={[{ required: true }]}><DatePicker style={{ width: "100%" }} /></Form.Item></Col><Col span={12}><Form.Item name="hour" label="Hora" rules={[{ required: true }]}><TimePicker format="HH:mm" style={{ width: "100%" }} /></Form.Item></Col></Row>
          <Form.Item name="operator" label="Responsable" rules={[{ required: true }]}><Select options={operators.map(value => ({ value, label: value }))} /></Form.Item>
          <Form.Item name="tolerance" label="Tolerancia"><InputNumber min={0} max={120} addonAfter="min" style={{ width: "100%" }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
