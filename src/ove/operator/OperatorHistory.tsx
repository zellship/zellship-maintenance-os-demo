import { Card, Typography, Table } from "antd";
import dayjs from "dayjs";
import { useStore } from "../store";
import { statusTag } from "../ui";

const OPERATOR = "Ana Torres";

export function OperatorHistory() {
  const { executions, protocols } = useStore();
  const mine = executions.filter(e => e.operator === OPERATOR);
  return (
    <>
      <Typography.Title level={4}>Historial</Typography.Title>
      <Card>
        <Table
          size="small"
          dataSource={mine}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "Protocolo", render: (_, e) => protocols.find(p => p.id === e.protocolId)?.name },
            { title: "Fecha", dataIndex: "startAt", render: (v) => dayjs(v).format("DD MMM HH:mm") },
            { title: "Estado", dataIndex: "status", render: statusTag },
            { title: "Validado por", render: (_, e) => e.approval?.supervisor || "—" },
          ]}
        />
      </Card>
    </>
  );
}
