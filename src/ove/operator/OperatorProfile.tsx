import { Card, Avatar, Typography, Descriptions, Divider, Space, Tag } from "antd";
import { SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedSkills } from "../seed";
import { activeDemo } from "../../demo-config/active";

export function OperatorProfile() {
  const { people } = useStore();
  const profile = activeDemo.context.loginProfiles.find(
    (candidate) => candidate.name === activeDemo.context.primaryOperator,
  );
  const person = people.find((candidate) => candidate.name === activeDemo.context.primaryOperator);
  return (
    <Card style={{ textAlign: "center" }}>
      <Avatar
        size={80}
        style={{ background: activeDemo.branding.primaryColor }}
        icon={<UserOutlined />}
      />
      <Typography.Title level={4} style={{ marginTop: 12, marginBottom: 0 }}>
        {activeDemo.context.primaryOperator}
      </Typography.Title>
      <Typography.Text type="secondary">
        {profile?.title ?? "Técnica de mantenimiento"} ·{" "}
        {person?.plant ?? activeDemo.context.defaultPlant}
      </Typography.Text>
      <Descriptions column={1} style={{ marginTop: 16, textAlign: "left" }}>
        <Descriptions.Item label="Turno">08:00 – 18:00</Descriptions.Item>
        <Descriptions.Item label="Supervisor">Roberto Salas</Descriptions.Item>
        <Descriptions.Item label="Cumplimiento">94%</Descriptions.Item>
        <Descriptions.Item label="Certificación">
          Vigente hasta{" "}
          {person?.certificationValidUntil
            ? dayjs(person.certificationValidUntil).format("DD MMM YYYY")
            : "—"}
        </Descriptions.Item>
      </Descriptions>
      <Divider>
        <SafetyCertificateOutlined /> Skills habilitantes
      </Divider>
      <Space wrap style={{ justifyContent: "center" }}>
        {person?.skillIds.map((id) => (
          <Tag color="green" key={id}>
            {seedSkills.find((s) => s.id === id)?.name}
          </Tag>
        ))}
      </Space>
    </Card>
  );
}
