import { Card, Avatar, Typography, Descriptions, Divider, Space, Tag } from "antd";
import { SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedSkills } from "../seed";

export function OperatorProfile() {
  const { people } = useStore();
  const person = people.find(p => p.name === "Ana Torres");
  return (
    <Card style={{ textAlign: "center" }}>
      <Avatar size={80} style={{ background: "#7B35C1" }} icon={<UserOutlined />} />
      <Typography.Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>Ana Torres</Typography.Title>
      <Typography.Text type="secondary">Técnica de mantenimiento · Planta Monterrey</Typography.Text>
      <Descriptions column={1} style={{ marginTop: 16, textAlign: "left" }}>
        <Descriptions.Item label="Turno">08:00 – 18:00</Descriptions.Item>
        <Descriptions.Item label="Supervisor">Roberto Salas</Descriptions.Item>
        <Descriptions.Item label="Cumplimiento">94%</Descriptions.Item>
        <Descriptions.Item label="Certificación">Vigente hasta {person?.certificationValidUntil ? dayjs(person.certificationValidUntil).format("DD MMM YYYY") : "—"}</Descriptions.Item>
      </Descriptions>
      <Divider><SafetyCertificateOutlined /> Skills habilitantes</Divider>
      <Space wrap style={{ justifyContent: "center" }}>{person?.skillIds.map(id => <Tag color="green" key={id}>{seedSkills.find(s => s.id === id)?.name}</Tag>)}</Space>
    </Card>
  );
}
