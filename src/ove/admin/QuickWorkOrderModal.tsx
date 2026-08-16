import { useEffect, useMemo } from "react";
import { Alert, Button, Form, Input, Modal, Select, Space, Tag, message } from "antd";
import { CalendarOutlined, ThunderboltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { advanceDemoClock } from "../../demo-config/clock";
import { seedAssets } from "../seed";
import { useStore } from "../store";
import type {
  MaterialAllocation,
  Notification,
  Protocol,
  ResourceReservation,
  Schedule,
} from "../types";

type QuickOrderValues = {
  assetId: string;
  protocolId: string;
  operator: string;
  priority: Protocol["priority"];
  notes: string;
};

export function QuickWorkOrderModal({
  open,
  initialAssetId,
  initialNote,
  onCancel,
  onCreated,
  onOpenPlanning,
}: {
  open: boolean;
  initialAssetId?: string;
  initialNote?: string;
  onCancel: () => void;
  onCreated?: (scheduleId: string) => void;
  onOpenPlanning: () => void;
}) {
  const {
    schedules,
    setSchedules,
    protocols,
    people,
    setPeople,
    reservations,
    setReservations,
    notifications,
    setNotifications,
  } = useStore();
  const [form] = Form.useForm<QuickOrderValues>();
  const selectedAssetId = Form.useWatch("assetId", form);
  const selectedProtocolId = Form.useWatch("protocolId", form);
  const selectedAsset = seedAssets.find((asset) => asset.id === selectedAssetId);
  const availableProtocols = useMemo(
    () =>
      protocols.filter(
        (protocol) =>
          protocol.status === "Active" &&
          (!selectedAssetId ||
            protocol.assetIds?.includes(selectedAssetId) ||
            Boolean(selectedAsset && protocol.branches.includes(selectedAsset.plant))),
      ),
    [protocols, selectedAsset, selectedAssetId],
  );
  const selectedProtocol = protocols.find((protocol) => protocol.id === selectedProtocolId);
  const eligiblePeople = people.filter(
    (person) =>
      person.role === "Technician" &&
      person.status !== "OffShift" &&
      (!selectedProtocol?.requiredSkillIds?.length ||
        selectedProtocol.requiredSkillIds.every((skillId) => person.skillIds.includes(skillId))),
  );

  useEffect(() => {
    if (!open) return;
    const assetId =
      initialAssetId ??
      seedAssets.find((asset) => asset.status === "Risk")?.id ??
      seedAssets[0]?.id;
    const asset = seedAssets.find((item) => item.id === assetId);
    const protocol = protocols.find(
      (item) =>
        item.status === "Active" &&
        (item.assetIds?.includes(assetId) || Boolean(asset && item.branches.includes(asset.plant))),
    );
    const operator = people.find(
      (person) =>
        person.role === "Technician" &&
        person.status !== "OffShift" &&
        (!protocol?.requiredSkillIds?.length ||
          protocol.requiredSkillIds.every((skillId) => person.skillIds.includes(skillId))),
    );
    form.setFieldsValue({
      assetId,
      protocolId: protocol?.id,
      operator: operator?.name,
      priority: initialNote ? "High" : (protocol?.priority ?? "Medium"),
      notes: initialNote ?? "Atención inmediata registrada por Coordinación.",
    });
  }, [form, initialAssetId, initialNote, open, people, protocols]);

  const createOrder = (values: QuickOrderValues) => {
    const protocol = protocols.find((item) => item.id === values.protocolId);
    const asset = seedAssets.find((item) => item.id === values.assetId);
    const person = people.find((item) => item.name === values.operator);
    if (!protocol || !asset || !person) {
      message.error("No fue posible validar activo, protocolo y responsable");
      return;
    }
    const createdAt = advanceDemoClock(1);
    const scheduleId = `s-quick-${Date.now()}`;
    const workOrder = `OT-${createdAt.format("MMDD")}-${String(schedules.length + 19).padStart(3, "0")}`;
    const allocations = materialAllocations(protocol);
    const schedule: Schedule = {
      id: scheduleId,
      protocolId: protocol.id,
      date: createdAt.format("YYYY-MM-DD"),
      hour: createdAt.format("HH:mm"),
      tolerance: protocol.schedule[0]?.tolerance ?? 20,
      operator: person.name,
      status: "Pending",
      assetId: asset.id,
      plant: asset.plant,
      workOrder,
      toolIds: protocol.requiredToolIds ?? [],
      materialAllocations: allocations,
      eligibilityValidated: true,
      notes: values.notes.trim(),
      priority: values.priority,
      createdAt: createdAt.toISOString(),
    };
    const endAt = createdAt.add(protocol.estimatedMinutes ?? 45, "minute").toISOString();
    const newReservations: ResourceReservation[] = [
      {
        id: `res-${scheduleId}-asset`,
        scheduleId,
        resourceType: "Asset",
        resourceId: asset.id,
        startAt: createdAt.toISOString(),
        endAt,
        status: "Reserved",
      },
      {
        id: `res-${scheduleId}-person`,
        scheduleId,
        resourceType: "Person",
        resourceId: person.id,
        startAt: createdAt.toISOString(),
        endAt,
        status: "Reserved",
      },
      ...(protocol.requiredToolIds ?? []).map((resourceId, index) => ({
        id: `res-${scheduleId}-tool-${index}`,
        scheduleId,
        resourceType: "Tool" as const,
        resourceId,
        startAt: createdAt.toISOString(),
        endAt,
        status: "Reserved" as const,
      })),
    ];
    const notification: Notification = {
      id: `n-quick-${Date.now()}`,
      type: "Assignment",
      channel: "WhatsApp",
      actor: "Coordinación de mantenimiento",
      recipientRole: "operator",
      recipient: person.name,
      source: "OnDemand",
      event: "Orden de atención inmediata",
      message: `${workOrder}: ${protocol.name} asignada sobre ${asset.id}.`,
      templateName: "maintenance_order_assignment",
      actionLabel: "Abrir en Zellship",
      status: "Sent",
      createdAt: createdAt.toISOString(),
    };
    setSchedules([schedule, ...schedules]);
    setReservations([...newReservations, ...reservations]);
    setPeople(
      people.map((item) =>
        item.id === person.id ? { ...item, status: "Assigned" as const } : item,
      ),
    );
    setNotifications([notification, ...notifications]);
    form.resetFields();
    onCreated?.(scheduleId);
    message.success(`${workOrder} creada y asignada a ${person.name}`);
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined />
          Nueva orden de trabajo
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        message="Atención inmediata"
        description="Crea y asigna una orden directamente. Para una fecha o ventana futura utiliza Programación."
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="vertical" onFinish={createOrder}>
        <Form.Item name="assetId" label="Equipo o activo" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="label"
            options={seedAssets.map((asset) => ({
              value: asset.id,
              label: `${asset.id} · ${asset.name} · ${asset.area}`,
            }))}
            onChange={() => form.setFieldValue("protocolId", undefined)}
          />
        </Form.Item>
        <Form.Item name="protocolId" label="Actividad o protocolo" rules={[{ required: true }]}>
          <Select
            options={availableProtocols.map((protocol) => ({
              value: protocol.id,
              label: protocol.name,
            }))}
            onChange={() => form.setFieldValue("operator", undefined)}
          />
        </Form.Item>
        <Form.Item name="priority" label="Prioridad" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "Low", label: "Baja" },
              { value: "Medium", label: "Media" },
              { value: "High", label: "Alta" },
              { value: "Critical", label: "Crítica" },
            ]}
          />
        </Form.Item>
        <Form.Item name="operator" label="Responsable" rules={[{ required: true }]}>
          <Select
            placeholder="Selecciona una persona elegible"
            options={eligiblePeople.map((person) => ({
              value: person.name,
              label: `${person.name} · ${person.status === "Available" ? "Disponible" : "Asignado"}`,
            }))}
          />
        </Form.Item>
        <Form.Item name="notes" label="Motivo o instrucciones" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
          <Button icon={<CalendarOutlined />} onClick={onOpenPlanning}>
            Programar para después
          </Button>
          <Space>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit">
              Crear orden
            </Button>
          </Space>
        </Space>
        {!!selectedProtocol && (
          <Space wrap style={{ marginTop: 14 }}>
            <Tag>{selectedProtocol.estimatedMinutes ?? 45} min estimados</Tag>
            <Tag>{selectedProtocol.requiredToolIds?.length ?? 0} herramientas</Tag>
            <Tag>{eligiblePeople.length} responsables elegibles</Tag>
          </Space>
        )}
      </Form>
    </Modal>
  );
}

function materialAllocations(protocol: Protocol): MaterialAllocation[] {
  return (protocol.materialRequirements ?? []).map((requirement) => ({
    ...requirement,
    reservedQuantity:
      requirement.mode === "Exact"
        ? (requirement.quantity ?? 0)
        : (requirement.max ?? requirement.min ?? 0),
  }));
}
