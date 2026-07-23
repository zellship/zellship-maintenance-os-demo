import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  TimePicker,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useStore } from "../store";
import { seedAssets, seedSkills } from "../seed";
import { statusTag } from "../ui";
import type { MaterialAllocation, Protocol, ResourceReservation, Schedule } from "../types";

type FormValues = {
  protocolId: string;
  assetId: string;
  date: Dayjs;
  hour: Dayjs;
  tolerance: number;
  operator: string;
  toolIds: string[];
};

export function Planning() {
  const {
    schedules,
    setSchedules,
    protocols,
    people,
    tools,
    setTools,
    inventory,
    setInventory,
    reservations,
    setReservations,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const protocolId = Form.useWatch("protocolId", form);
  const operatorName = Form.useWatch("operator", form);
  const assetId = Form.useWatch("assetId", form);
  const selectedDate = Form.useWatch("date", form);
  const selectedHour = Form.useWatch("hour", form);
  const toolIds = Form.useWatch("toolIds", form) || [];
  const selectedProtocol = protocols.find((p) => p.id === protocolId);
  const active = protocols.filter((p) => p.status === "Active");
  const today = dayjs().format("YYYY-MM-DD");
  const thisWeek = schedules.filter((s) => dayjs(s.date).isAfter(dayjs().subtract(1, "day")));
  const pending = thisWeek.filter(
    (s) => s.status === "Pending" || s.status === "InProgress",
  ).length;

  const interval = getInterval(selectedDate, selectedHour, selectedProtocol);
  const selectedPerson = people.find((p) => p.name === operatorName);
  const missingSkills =
    selectedProtocol?.requiredSkillIds?.filter((id) => !selectedPerson?.skillIds.includes(id)) ||
    [];
  const conflictIds = interval
    ? reservations
        .filter(
          (r) =>
            (r.status === "Reserved" || r.status === "InUse") &&
            overlaps(interval.start, interval.end, r.startAt, r.endAt),
        )
        .map((r) => `${r.resourceType}:${r.resourceId}`)
    : [];
  const assetConflict = !!assetId && conflictIds.includes(`Asset:${assetId}`);
  const personConflict = !!selectedPerson && conflictIds.includes(`Person:${selectedPerson.id}`);
  const toolConflicts = toolIds.filter((id) => conflictIds.includes(`Tool:${id}`));
  const stockIssues = getAllocations(selectedProtocol).filter((a) => {
    const item = inventory.find((i) => i.id === a.inventoryItemId);
    return !item || item.onHand - item.reserved - item.quarantine < a.reservedQuantity;
  });
  const configured =
    !!selectedProtocol && !!assetId && !!selectedPerson && !!selectedDate && !!selectedHour;
  const ready =
    configured &&
    missingSkills.length === 0 &&
    !assetConflict &&
    !personConflict &&
    toolConflicts.length === 0 &&
    stockIssues.length === 0;

  const selectProtocol = (id: string) => {
    const p = protocols.find((item) => item.id === id);
    form.setFieldsValue({
      protocolId: id,
      assetId: p?.assetIds?.[0],
      operator: p?.operators?.[0],
      toolIds: p?.requiredToolIds || [],
      tolerance: p?.schedule?.[0]?.tolerance || 20,
    });
  };

  const create = (values: FormValues) => {
    const protocol = protocols.find((p) => p.id === values.protocolId)!;
    const asset = seedAssets.find((a) => a.id === values.assetId);
    const person = people.find((p) => p.name === values.operator)!;
    if (!ready) {
      message.error(
        "La orden tiene bloqueos de elegibilidad o disponibilidad. Revisa la validación de recursos.",
      );
      return;
    }
    const scheduleId = `s${Date.now()}`;
    const allocations = getAllocations(protocol);
    const schedule: Schedule = {
      id: scheduleId,
      protocolId: values.protocolId,
      date: values.date.format("YYYY-MM-DD"),
      hour: values.hour.format("HH:mm"),
      tolerance: values.tolerance,
      operator: values.operator,
      status: "Pending",
      assetId: values.assetId,
      plant: asset?.plant,
      workOrder: `OT-${dayjs().format("MMDD")}-${String(schedules.length + 19).padStart(3, "0")}`,
      toolIds: values.toolIds,
      materialAllocations: allocations,
      eligibilityValidated: true,
    };
    const startAt = dayjs(`${schedule.date} ${schedule.hour}`).toISOString();
    const endAt = dayjs(startAt)
      .add(protocol.estimatedMinutes || 45, "minute")
      .toISOString();
    const newReservations: ResourceReservation[] = [
      {
        id: `res-${scheduleId}-asset`,
        scheduleId,
        resourceType: "Asset",
        resourceId: values.assetId,
        startAt,
        endAt,
        status: "Reserved",
      },
      {
        id: `res-${scheduleId}-person`,
        scheduleId,
        resourceType: "Person",
        resourceId: person.id,
        startAt,
        endAt,
        status: "Reserved",
      },
      ...values.toolIds.map((id, index) => ({
        id: `res-${scheduleId}-tool-${index}`,
        scheduleId,
        resourceType: "Tool" as const,
        resourceId: id,
        startAt,
        endAt,
        status: "Reserved" as const,
      })),
      ...allocations.map((a, index) => ({
        id: `res-${scheduleId}-mat-${index}`,
        scheduleId,
        resourceType: "Material" as const,
        resourceId: a.inventoryItemId,
        quantity: a.reservedQuantity,
        startAt,
        endAt,
        status: "Reserved" as const,
      })),
    ];
    setSchedules([schedule, ...schedules]);
    setReservations([...newReservations, ...reservations]);
    setTools(tools.map((t) => (values.toolIds.includes(t.id) ? { ...t, status: "Reserved" } : t)));
    setInventory(
      inventory.map((item) => {
        const allocation = allocations.find((a) => a.inventoryItemId === item.id);
        return allocation
          ? { ...item, reserved: item.reserved + allocation.reservedQuantity }
          : item;
      }),
    );
    setOpen(false);
    form.resetFields();
    message.success(`${schedule.workOrder} creada · recursos e inventario reservados`);
  };

  const rows = schedules
    .slice()
    .sort((a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`))
    .map((s) => ({
      ...s,
      protocol: protocols.find((p) => p.id === s.protocolId)?.name,
      asset: seedAssets.find((a) => a.id === s.assetId)?.name,
    }));

  return (
    <div className="industrial-page">
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Programación inteligente
          </Typography.Title>
          <Typography.Text type="secondary">
            Valida skills, disponibilidad, herramientas e inventario antes de comprometer una orden.
          </Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Programar orden
        </Button>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Órdenes esta semana"
              value={thisWeek.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Pendientes por atender"
              value={pending}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Recursos reservados"
              value={reservations.filter((r) => r.status === "Reserved").length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title={`Plan operativo · ${dayjs(today).format("DD MMM YYYY")}`}>
            <Table
              rowKey="id"
              dataSource={rows}
              scroll={{ x: 1000 }}
              columns={[
                { title: "Orden", dataIndex: "workOrder", width: 130 },
                {
                  title: "Fecha",
                  dataIndex: "date",
                  width: 115,
                  render: (v) => dayjs(v).format("DD MMM"),
                },
                { title: "Hora", dataIndex: "hour", width: 80 },
                { title: "Protocolo", dataIndex: "protocol", width: 250 },
                { title: "Activo", dataIndex: "asset", width: 220 },
                { title: "Responsable", dataIndex: "operator", width: 150 },
                {
                  title: "Recursos",
                  width: 120,
                  render: (_, row) =>
                    row.eligibilityValidated ? (
                      <Tag color="green">Validados</Tag>
                    ) : (
                      <Tag>Histórico</Tag>
                    ),
                },
                { title: "Estado", dataIndex: "status", width: 140, render: statusTag },
              ]}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        width={760}
        title="Programar orden con recursos"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Validar y reservar"
        cancelText="Cancelar"
        okButtonProps={{ disabled: !ready }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={create}
          initialValues={{
            date: dayjs().add(1, "day"),
            hour: dayjs("10:00", "HH:mm"),
            tolerance: 20,
            toolIds: [],
          }}
        >
          <Form.Item name="protocolId" label="1. Protocolo" rules={[{ required: true }]}>
            <Select
              onChange={selectProtocol}
              options={active.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="assetId" label="2. Activo" rules={[{ required: true }]}>
                <Select
                  options={seedAssets
                    .filter(
                      (a) =>
                        !selectedProtocol?.assetIds?.length ||
                        selectedProtocol.assetIds.includes(a.id),
                    )
                    .map((a) => ({ value: a.id, label: `${a.id} · ${a.name}` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operator" label="3. Técnico habilitado" rules={[{ required: true }]}>
                <Select
                  options={people
                    .filter((p) => p.role === "Technician")
                    .map((person) => {
                      const missing =
                        selectedProtocol?.requiredSkillIds?.filter(
                          (id) => !person.skillIds.includes(id),
                        ) || [];
                      return {
                        value: person.name,
                        label: `${person.name}${missing.length ? ` · faltan ${missing.length} skills` : " · habilitado"}`,
                        disabled: missing.length > 0,
                      };
                    })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={10}>
              <Form.Item name="date" label="Fecha" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hour" label="Hora" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tolerance" label="Tolerancia">
                <InputNumber min={0} max={120} addonAfter="min" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="toolIds" label="4. Equipos y herramientas">
            <Select
              mode="multiple"
              options={tools.map((tool) => ({
                value: tool.id,
                label: `${tool.name} · ${tool.serial}`,
              }))}
            />
          </Form.Item>
        </Form>
        {selectedProtocol && (
          <>
            <Divider>Validación automática</Divider>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Readiness
                  ok={!missingSkills.length && !!selectedPerson}
                  icon={<SafetyCertificateOutlined />}
                  title="Skills y certificaciones"
                  detail={
                    !selectedPerson
                      ? "Selecciona un técnico"
                      : missingSkills.length
                        ? `Faltan: ${missingSkills.map((id) => seedSkills.find((s) => s.id === id)?.name).join(", ")}`
                        : `${selectedPerson.name} está habilitado`
                  }
                />
              </Col>
              <Col span={12}>
                <Readiness
                  ok={!assetConflict && !personConflict && !!interval}
                  icon={<CalendarOutlined />}
                  title="Ventana sin traslapes"
                  detail={
                    !interval
                      ? "Define fecha y hora"
                      : assetConflict || personConflict
                        ? "Activo o técnico ya reservado"
                        : "Activo y técnico disponibles"
                  }
                />
              </Col>
              <Col span={12}>
                <Readiness
                  ok={
                    !toolConflicts.length &&
                    toolIds.length >= (selectedProtocol.requiredToolIds?.length || 0)
                  }
                  icon={<ToolOutlined />}
                  title="Herramientas"
                  detail={
                    toolConflicts.length
                      ? "Hay herramientas ocupadas"
                      : `${toolIds.length} equipos listos para reservar`
                  }
                />
              </Col>
              <Col span={12}>
                <Readiness
                  ok={!stockIssues.length}
                  icon={<CheckCircleOutlined />}
                  title="Inventario"
                  detail={
                    stockIssues.length
                      ? "Stock insuficiente para la reserva"
                      : `${getAllocations(selectedProtocol).length} materiales con disponibilidad`
                  }
                />
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
}

function Readiness({
  ok,
  icon,
  title,
  detail,
}: {
  ok: boolean;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Alert
      type={ok ? "success" : "warning"}
      showIcon
      icon={icon}
      message={title}
      description={detail}
    />
  );
}

function getAllocations(protocol?: Protocol): MaterialAllocation[] {
  return (protocol?.materialRequirements || []).map((r) => ({
    ...r,
    reservedQuantity: r.mode === "Exact" ? r.quantity || 0 : (r.max ?? r.min ?? 0),
  }));
}

function getInterval(date?: Dayjs, hour?: Dayjs, protocol?: Protocol) {
  if (!date || !hour || !protocol) return null;
  const start = dayjs(`${date.format("YYYY-MM-DD")} ${hour.format("HH:mm")}`);
  return {
    start: start.toISOString(),
    end: start.add(protocol.estimatedMinutes || 45, "minute").toISOString(),
  };
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return dayjs(startA).isBefore(dayjs(endB)) && dayjs(endA).isAfter(dayjs(startB));
}
