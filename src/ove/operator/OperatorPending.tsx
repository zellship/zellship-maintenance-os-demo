import { Card, Typography, Button, Space, Tag, Empty } from "antd";
import dayjs from "dayjs";
import { demoNow } from "../../demo-config/clock";
import { useStore } from "../store";
import { seedAssets } from "../seed";
import { activeDemo } from "../../demo-config/active";

const OPERATOR = activeDemo.context.primaryOperator;

export function OperatorPending({ onStart }: { onStart: (id: string) => void }) {
  const { schedules, protocols } = useStore();
  const mine = schedules
    .filter((s) => s.operator === OPERATOR && s.status !== "Completed")
    .slice()
    .sort((a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`));

  const semaphore = (date: string, hour: string, tol: number) => {
    const target = dayjs(`${date} ${hour}`);
    const diff = target.diff(demoNow(), "minute");
    if (diff < -tol) return { color: "red", label: "Fuera de tiempo" };
    if (diff < 15) return { color: "orange", label: "Urgente" };
    return { color: "green", label: "A tiempo" };
  };

  return (
    <>
      <div className="operator-pending-heading">
        <div>
          <Typography.Title level={4}>Mis asignaciones</Typography.Title>
          <Typography.Text type="secondary">Listas para iniciar desde campo</Typography.Text>
        </div>
        <Tag color="purple">{mine.length} asignadas</Tag>
      </div>
      {mine.length === 0 && <Empty description="Sin pendientes" />}
      {mine.map((s) => {
        const p = protocols.find((x) => x.id === s.protocolId);
        const sem = semaphore(s.date, s.hour, s.tolerance);
        return (
          <Card key={s.id} className="operator-pending-card">
            <div className="operator-pending-row">
              <div className="operator-pending-copy">
                <Space wrap size={[4, 4]}>
                  <Tag color={sem.color}>● {sem.label}</Tag>
                  <Tag>{s.workOrder}</Tag>
                </Space>
                <Typography.Title level={5} style={{ margin: "8px 0 2px" }}>
                  {p?.name}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {s.siteLabel ?? seedAssets.find((a) => a.id === s.assetId)?.name}
                </Typography.Text>
                <Typography.Text type="secondary" className="operator-pending-time">
                  {dayjs(s.date).format("DD MMM")} · {s.hour} · tolerancia {s.tolerance} min
                </Typography.Text>
              </div>
              <Button type="primary" onClick={() => onStart(s.id)}>
                Iniciar
              </Button>
            </div>
          </Card>
        );
      })}
    </>
  );
}
