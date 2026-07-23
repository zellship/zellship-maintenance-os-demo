import { Card, Typography, Button, Row, Col, Statistic, List, Tag, Space } from "antd";
import { FireOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedAssets } from "../seed";

const OPERATOR = "Ana Torres";

export function OperatorHome({ onStart }: { onStart: (id: string) => void }) {
  const { schedules, protocols } = useStore();
  const today = dayjs().format("YYYY-MM-DD");
  const mine = schedules.filter((s) => s.operator === OPERATOR && s.date === today);
  const next = mine.find((s) => s.status === "Pending" || s.status === "InProgress") || mine[0];
  const nextProto = next ? protocols.find((p) => p.id === next.protocolId) : null;

  const urgent = mine.filter((s) => s.status === "Pending").length;
  const completed = mine.filter((s) => s.status === "Completed").length;

  return (
    <>
      {next && nextProto && (
        <Card
          style={{
            background: "linear-gradient(135deg, #7B35C1, #B57BFF)",
            color: "#fff",
            marginBottom: 12,
            border: "none",
          }}
          styles={{ body: { color: "#fff" } }}
        >
          <Tag color="white" style={{ color: "#7B35C1", fontWeight: 600 }}>
            PRÓXIMA ACTIVIDAD
          </Tag>
          <Typography.Title level={3} style={{ color: "#fff", marginTop: 8, marginBottom: 4 }}>
            {nextProto.name}
          </Typography.Title>
          <Typography.Text style={{ color: "#fff", opacity: 0.9 }}>
            <ClockCircleOutlined /> {next.hour} ·{" "}
            {seedAssets.find((a) => a.id === next.assetId)?.name} · Tolerancia {next.tolerance} min
          </Typography.Text>
          <div style={{ marginTop: 16 }}>
            <Button
              size="large"
              onClick={() => onStart(next.id)}
              style={{ background: "#fff", color: "#7B35C1", fontWeight: 600, border: "none" }}
            >
              Atender orden →
            </Button>
          </div>
        </Card>
      )}

      <Row gutter={8}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Urgentes"
              value={urgent}
              prefix={<FireOutlined style={{ color: "#cf1322" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Pendientes" value={mine.length - completed} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completados"
              value={completed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Actividad reciente" style={{ marginTop: 12 }}>
        <List
          size="small"
          dataSource={mine.slice(0, 5)}
          renderItem={(s) => (
            <List.Item>
              <Space direction="vertical" size={0} style={{ width: "100%" }}>
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                  <b>{protocols.find((p) => p.id === s.protocolId)?.name}</b>
                  <Tag>{s.hour}</Tag>
                </Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {s.status}
                </Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </>
  );
}
