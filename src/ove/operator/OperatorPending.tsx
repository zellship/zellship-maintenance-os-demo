import { Card, Typography, Button, Space, Tag, Empty } from "antd";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedAssets } from "../seed";

const OPERATOR = "Ana Torres";

export function OperatorPending({ onStart }: { onStart: (id: string) => void }) {
  const { schedules, protocols } = useStore();
  const today = dayjs().format("YYYY-MM-DD");
  const mine = schedules.filter(
    (s) => s.operator === OPERATOR && s.date === today && s.status !== "Completed",
  );

  const semaphore = (hour: string, tol: number) => {
    const target = dayjs(`${today} ${hour}`);
    const diff = target.diff(dayjs(), "minute");
    if (diff < -tol) return { color: "red", label: "Fuera de tiempo" };
    if (diff < 15) return { color: "orange", label: "Urgente" };
    return { color: "green", label: "A tiempo" };
  };

  return (
    <>
      <Typography.Title level={4}>Mis pendientes</Typography.Title>
      {mine.length === 0 && <Empty description="Sin pendientes" />}
      {mine.map((s) => {
        const p = protocols.find((x) => x.id === s.protocolId);
        const sem = semaphore(s.hour, s.tolerance);
        return (
          <Card key={s.id} style={{ marginBottom: 10 }}>
            <Space style={{ justifyContent: "space-between", width: "100%" }}>
              <div>
                <Tag color={sem.color}>● {sem.label}</Tag>
                <Typography.Title level={5} style={{ margin: "8px 0 2px" }}>
                  {p?.name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {seedAssets.find((a) => a.id === s.assetId)?.name} · {s.hour}
                </Typography.Text>
              </div>
              <Button type="primary" onClick={() => onStart(s.id)}>
                Iniciar
              </Button>
            </Space>
          </Card>
        );
      })}
    </>
  );
}
