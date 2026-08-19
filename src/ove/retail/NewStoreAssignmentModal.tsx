import { useEffect } from "react";
import type { Dayjs } from "dayjs";
import {
  Alert,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  TimePicker,
  Typography,
  message,
} from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { advanceDemoClock, demoNow } from "../../demo-config/clock";
import { activeDemo } from "../../demo-config/active";
import { useStore } from "../store";
import { createStoreAssignments } from "../retail-domain";

type Values = {
  protocolId: string;
  stores: string[];
  responsible: string;
  date: Dayjs;
  time: Dayjs;
  comments?: string;
  requiresValidation: boolean;
};

type Props = {
  open: boolean;
  onCancel: () => void;
  onCreated?: () => void;
};

export function NewStoreAssignmentModal({ open, onCancel, onCreated }: Props) {
  const { protocols, storeAssignments, setStoreAssignments, notifications, setNotifications } =
    useStore();
  const [form] = Form.useForm<Values>();
  const retailProtocols = protocols.filter((protocol) => protocol.status === "Active");

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      protocolId: "retail-cleaning",
      stores: [activeDemo.context.defaultPlant],
      responsible: activeDemo.context.primaryOperator,
      date: demoNow().add(1, "day"),
      time: demoNow().add(1, "hour").startOf("hour"),
      requiresValidation: false,
      comments: "",
    });
  }, [form, open]);

  const submit = async () => {
    const values = await form.validateFields();
    const protocol = protocols.find((item) => item.id === values.protocolId);
    if (!protocol) return;
    const dueAt = values.date
      .hour(values.time.hour())
      .minute(values.time.minute())
      .second(0)
      .toISOString();
    const created = createStoreAssignments({
      existing: storeAssignments,
      protocolId: values.protocolId,
      stores: values.stores,
      responsible: values.responsible,
      dueAt,
      requiresValidation: values.requiresValidation,
      comments: values.comments,
    });
    const baseNumber = Number(created[0]?.id.split("-").at(-1)) || 1028;
    const at = advanceDemoClock(1).toISOString();

    setStoreAssignments([...storeAssignments, ...created]);
    setNotifications([
      {
        id: `not-assignment-${baseNumber}`,
        type: "Assignment",
        channel: "Push",
        actor: "Gerencia de sucursales",
        recipientRole: "operator",
        recipient: values.responsible,
        source: "OnDemand",
        event: "Nueva asignación",
        message: `${protocol.name} asignado a ${values.stores.join(", ")}.`,
        actionLabel: "Atender asignación",
        status: "Sent",
        createdAt: at,
      },
      ...notifications,
    ]);
    message.success(
      created.length === 1
        ? `Asignación enviada a ${created[0].storeLabel}`
        : `${created.length} asignaciones publicadas`,
    );
    form.resetFields();
    onCreated?.();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={submit}
      okText="Publicar asignación"
      cancelText="Cancelar"
      title={
        <Space>
          <ShopOutlined />
          Nueva asignación para tienda
        </Space>
      }
      width={680}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        message="Cada tienda recibirá una asignación independiente"
        description="El avance, evidencia y validación se conservarán por sucursal aunque publiques el mismo protocolo para varias tiendas."
        style={{ marginBottom: 18 }}
      />
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="protocolId"
          label="Protocolo"
          rules={[{ required: true, message: "Selecciona el protocolo" }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={retailProtocols.map((protocol) => ({
              value: protocol.id,
              label: protocol.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="stores"
          label="Tiendas"
          rules={[{ required: true, message: "Selecciona al menos una tienda" }]}
        >
          <Select
            mode="multiple"
            maxTagCount="responsive"
            options={activeDemo.context.plantOptions.map((value) => ({ value, label: value }))}
          />
        </Form.Item>
        <Form.Item
          name="responsible"
          label="Responsable"
          rules={[{ required: true, message: "Selecciona una persona responsable" }]}
        >
          <Select
            options={activeDemo.data.taxonomy.operators.map((value) => ({ value, label: value }))}
          />
        </Form.Item>
        <Space size={12} align="start" style={{ width: "100%" }}>
          <Form.Item
            name="date"
            label="Fecha"
            rules={[{ required: true, message: "Selecciona una fecha" }]}
            style={{ flex: 1 }}
          >
            <DatePicker format="DD MMM YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="time"
            label="Hora objetivo"
            rules={[{ required: true, message: "Selecciona una hora" }]}
            style={{ flex: 1 }}
          >
            <TimePicker format="HH:mm" minuteStep={15} style={{ width: "100%" }} />
          </Form.Item>
        </Space>
        <Form.Item name="comments" label="Instrucciones o comentarios">
          <Input.TextArea
            rows={3}
            maxLength={280}
            showCount
            placeholder="Contexto adicional para la tienda"
          />
        </Form.Item>
        <Form.Item name="requiresValidation" label="Validación posterior" valuePropName="checked">
          <Switch checkedChildren="Requerida" unCheckedChildren="No requerida" />
        </Form.Item>
        <Typography.Text type="secondary">
          Esta demostración registra la publicación y la notificación únicamente en el navegador.
        </Typography.Text>
      </Form>
    </Modal>
  );
}
