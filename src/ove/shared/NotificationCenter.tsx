import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  SendOutlined,
  ThunderboltOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import type { Notification, NotificationChannel, Role } from "../types";

const roleNames: Record<Role, string> = {
  admin: "Administración",
  operator: "Operador",
  supervisor: "Supervisor",
};

const actorByRole: Record<Role, string> = {
  admin: "Coordinación de mantenimiento",
  operator: "Ana Torres",
  supervisor: "Roberto Salas",
};

export function NotificationCenter({ role, showAll = false }: { role: Role; showAll?: boolean }) {
  const { notifications, setNotifications } = useStore();
  const [channel, setChannel] = useState<NotificationChannel | "all">("all");
  const [form] = Form.useForm();
  const composeRole = Form.useWatch("recipientRole", form) as Role | undefined;

  const visible = useMemo(
    () =>
      notifications
        .filter(
          (n) =>
            showAll || n.recipientRole === role || n.recipientRole === "all" || !n.recipientRole,
        )
        .filter((n) => channel === "all" || n.channel === channel)
        .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)),
    [notifications, role, showAll, channel],
  );

  const send = (values: {
    recipientRole: Role;
    recipient: string;
    channel: NotificationChannel;
    message: string;
  }) => {
    const notification: Notification = {
      id: `n-${Date.now()}`,
      type: "OnDemand",
      channel: values.channel,
      actor: actorByRole[role],
      recipientRole: values.recipientRole,
      recipient: values.recipient,
      source: "OnDemand",
      event: "Mensaje manual",
      message: values.message,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([notification, ...notifications]);
    form.resetFields(["message"]);
    message.success(`${values.channel}: notificación enviada a ${values.recipient}`);
  };

  const automatic = () => {
    const event: Notification = {
      id: `n-auto-${Date.now()}`,
      type: "Assignment",
      channel: "WhatsApp",
      actor: "Business Commitment Engine",
      recipientRole: "operator",
      recipient: "Ana Torres",
      source: "Automatic",
      event: "Asignación confirmada",
      message: "Nueva orden OT-2407-021 asignada: inspección de seguimiento AC-01 a las 14:30.",
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([event, ...notifications]);
    message.success("Trigger ejecutado: WhatsApp transaccional enviado al operador");
  };

  const markVisibleRead = () => {
    const ids = new Set(visible.map((n) => n.id));
    setNotifications(notifications.map((n) => (ids.has(n.id) ? { ...n, status: "Read" } : n)));
    message.success("Notificaciones recibidas y marcadas como leídas");
  };

  const unread = visible.filter((n) => n.status === "Sent").length;
  const automaticCount = visible.filter((n) => n.source === "Automatic").length;
  const whatsappCount = visible.filter((n) => n.channel === "WhatsApp").length;

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Centro de notificaciones
          </Typography.Title>
          <Typography.Text type="secondary">
            Mensajería transaccional, alertas automáticas y comunicación on demand por rol.
          </Typography.Text>
        </div>
        <Button icon={<ThunderboltOutlined />} onClick={automatic}>
          Simular trigger automático
        </Button>
      </Space>

      <Row gutter={[12, 12]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Sin leer"
              value={unread}
              prefix={<BellOutlined />}
              valueStyle={{ color: "#7B35C1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Automáticas"
              value={automaticCount}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="WhatsApp"
              value={whatsappCount}
              prefix={<WhatsAppOutlined />}
              valueStyle={{ color: "#128C7E" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Entrega emulada"
              value={100}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={showAll ? 15 : 24}>
          <Card
            title={`Bandeja de ${showAll ? "todos los roles" : roleNames[role]}`}
            extra={
              <Button type="link" onClick={markVisibleRead}>
                Marcar recibidas
              </Button>
            }
          >
            <Segmented
              block
              value={channel}
              onChange={(value) => setChannel(value as NotificationChannel | "all")}
              options={[
                { label: "Todas", value: "all" },
                { label: "Push", value: "Push" },
                { label: "WhatsApp", value: "WhatsApp" },
                { label: "Sistema", value: "System" },
              ]}
              style={{ marginBottom: 12 }}
            />
            <List
              dataSource={visible}
              locale={{ emptyText: "No hay notificaciones para este rol" }}
              renderItem={(notification) => (
                <List.Item
                  className={notification.status === "Sent" ? "notification-unread" : undefined}
                  actions={[
                    <Tag key="delivery" color={notification.status === "Read" ? "green" : "blue"}>
                      {notification.status === "Read" ? "Recibida" : "Entregada"}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ background: channelColor(notification.channel) }}
                        icon={channelIcon(notification.channel)}
                      />
                    }
                    title={
                      <Space wrap>
                        <span>{notification.message}</span>
                        <Tag>{notification.source ?? "Automatic"}</Tag>
                      </Space>
                    }
                    description={`${notification.channel} · Para ${notification.recipient ?? roleNames[notification.recipientRole as Role] ?? "Todos"} · ${notification.event ?? notification.type} · ${dayjs(notification.createdAt).format("HH:mm:ss")}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {showAll && (
          <Col xs={24} lg={9}>
            <Card
              title={
                <Space>
                  <SendOutlined />
                  Enviar on demand
                </Space>
              }
            >
              <Alert
                type="info"
                showIcon
                message="Simulación comercial"
                description="El mensaje aparecerá inmediatamente en la bandeja del rol seleccionado."
                style={{ marginBottom: 14 }}
              />
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  recipientRole: "operator",
                  recipient: "Ana Torres",
                  channel: "WhatsApp",
                }}
                onFinish={send}
              >
                <Form.Item name="recipientRole" label="Rol receptor" rules={[{ required: true }]}>
                  <Select
                    onChange={(value: Role) =>
                      form.setFieldValue(
                        "recipient",
                        value === "operator"
                          ? "Ana Torres"
                          : value === "supervisor"
                            ? "Roberto Salas"
                            : "Coordinación de mantenimiento",
                      )
                    }
                    options={[
                      { value: "operator", label: "Operador" },
                      { value: "supervisor", label: "Supervisor" },
                      { value: "admin", label: "Administrador" },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="recipient" label="Destinatario" rules={[{ required: true }]}>
                  <Select
                    options={(composeRole === "supervisor"
                      ? ["Roberto Salas", "Mónica Reyes"]
                      : composeRole === "admin"
                        ? ["Coordinación de mantenimiento"]
                        : ["Ana Torres", "Jorge Ruiz", "Laura Díaz", "Diego Luna"]
                    ).map((value) => ({ value, label: value }))}
                  />
                </Form.Item>
                <Form.Item name="channel" label="Canal" rules={[{ required: true }]}>
                  <Select
                    options={["WhatsApp", "Push", "System", "SMS"].map((value) => ({
                      value,
                      label: value,
                    }))}
                  />
                </Form.Item>
                <Form.Item name="message" label="Mensaje" rules={[{ required: true }]}>
                  <Input.TextArea
                    rows={4}
                    placeholder="Ej. Confirma recepción de la nueva orden..."
                  />
                </Form.Item>
                <Button htmlType="submit" type="primary" block icon={<SendOutlined />}>
                  Enviar notificación
                </Button>
              </Form>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

function channelColor(channel: NotificationChannel) {
  if (channel === "WhatsApp") return "#128C7E";
  if (channel === "Push") return "#7B35C1";
  if (channel === "SMS") return "#1677ff";
  return "#5b6475";
}

function channelIcon(channel: NotificationChannel) {
  if (channel === "WhatsApp") return <WhatsAppOutlined />;
  if (channel === "Push") return <BellOutlined />;
  return <MessageOutlined />;
}
