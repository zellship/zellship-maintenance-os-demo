import { Card, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import { useStore } from "../store";

export function Bitacora() {
  const { executions, protocols } = useStore();
  const items = executions
    .slice()
    .sort((a, b) => (b.startAt > a.startAt ? 1 : -1))
    .map((e) => ({
      color: e.status === "Validated" ? "green" : e.status === "Rejected" ? "red" : "blue",
      children: (
        <div>
          <b>{protocols.find(p => p.id === e.protocolId)?.name}</b> · {e.operator}<br />
          <Typography.Text type="secondary">{dayjs(e.startAt).format("DD MMM HH:mm")} · {e.status}</Typography.Text>
        </div>
      ),
    }));
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Bitácora</Typography.Title>
      <Card><Timeline items={items} /></Card>
    </div>
  );
}