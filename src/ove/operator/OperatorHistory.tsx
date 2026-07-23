import { useState } from "react";
import { Button, Card, Modal, Progress, Typography, Table } from "antd";
import dayjs from "dayjs";
import { useStore } from "../store";
import { statusTag } from "../ui";
import { MaintenanceResult } from "../shared/MaintenanceResult";
import type { Execution } from "../types";

const OPERATOR = "Ana Torres";

export function OperatorHistory() {
  const { executions, protocols, schedules } = useStore();
  const [selected, setSelected] = useState<Execution | null>(null);
  const mine = executions.filter((e) => e.operator === OPERATOR);
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
            {
              title: "Protocolo",
              render: (_, e) => protocols.find((p) => p.id === e.protocolId)?.name,
            },
            {
              title: "Fecha",
              dataIndex: "startAt",
              render: (v) => dayjs(v).format("DD MMM HH:mm"),
            },
            { title: "Estado", dataIndex: "status", render: statusTag },
            {
              title: "Score",
              dataIndex: "score",
              render: (value) => (
                <Progress percent={value ?? 0} size="small" style={{ minWidth: 82 }} />
              ),
            },
            { title: "Validado por", render: (_, e) => e.approval?.supervisor || "—" },
            {
              title: "",
              render: (_, e) => (
                <Button size="small" onClick={() => setSelected(e)}>
                  Resultado
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={1180}
        title="Resultado del mantenimiento"
      >
        {selected && (
          <MaintenanceResult
            execution={selected}
            protocol={protocols.find((protocol) => protocol.id === selected.protocolId)!}
            schedule={schedules.find((schedule) => schedule.id === selected.scheduleId)}
          />
        )}
      </Modal>
    </>
  );
}
