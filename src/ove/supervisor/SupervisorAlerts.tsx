import { Card, List, Typography, Tag, Button, Avatar, message, Empty } from "antd";
import { AlertOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";

export function SupervisorAlerts() {
  const { incidents, setIncidents, protocols } = useStore();
  const open = incidents.filter((i) => i.status !== "Resolved" && i.status !== "Closed");
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Alertas en tiempo real
      </Typography.Title>
      <Card>
        {open.length === 0 ? (
          <Empty description="Sin alertas" />
        ) : (
          <List
            dataSource={open}
            renderItem={(i) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => {
                      setIncidents(
                        incidents.map((x) =>
                          x.id === i.id ? { ...x, status: "Review" as const } : x,
                        ),
                      );
                      message.success("Atendiendo alerta");
                    }}
                  >
                    Atender
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ background: "#fff1f0", color: "#cf1322" }}
                      icon={<AlertOutlined />}
                    />
                  }
                  title={
                    <>
                      <Tag color="red">{i.type}</Tag>{" "}
                      {protocols.find((p) => p.id === i.protocolId)?.name}
                    </>
                  }
                  description={
                    <>
                      {i.description}
                      <br />
                      <Typography.Text type="secondary">
                        {dayjs(i.createdAt).format("DD MMM HH:mm")}
                      </Typography.Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
