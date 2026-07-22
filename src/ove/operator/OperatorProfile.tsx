import { Card, Avatar, Typography, Descriptions } from "antd";
import { UserOutlined } from "@ant-design/icons";

export function OperatorProfile() {
  return (
    <Card style={{ textAlign: "center" }}>
      <Avatar size={80} style={{ background: "#7B35C1" }} icon={<UserOutlined />} />
      <Typography.Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>Ana Torres</Typography.Title>
      <Typography.Text type="secondary">Técnica de mantenimiento · Planta Monterrey</Typography.Text>
      <Descriptions column={1} style={{ marginTop: 16, textAlign: "left" }}>
        <Descriptions.Item label="Turno">08:00 – 18:00</Descriptions.Item>
        <Descriptions.Item label="Supervisor">Roberto Salas</Descriptions.Item>
        <Descriptions.Item label="Cumplimiento">94%</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
