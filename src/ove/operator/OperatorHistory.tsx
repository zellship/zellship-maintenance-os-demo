import { useState } from "react";
import { Button, Card, Modal, Progress, Typography } from "antd";
import { SmartTable } from "../shared/SmartTable";
import dayjs from "dayjs";
import { useStore } from "../store";
import { statusTag } from "../ui";
import { MaintenanceResult } from "../shared/MaintenanceResult";
import type { Execution } from "../types";
import { activeDemo } from "../../demo-config/active";

const OPERATOR = activeDemo.context.primaryOperator;

export function OperatorHistory() {
  const { executions, protocols, schedules } = useStore();
  const [selected, setSelected] = useState<Execution | null>(null);
  const mine = executions.filter((e) => e.operator === OPERATOR);
  return (
    <>
      <Typography.Title level={4}>Historial</Typography.Title>
      <Card>
        <SmartTable
          searchPlaceholder="Buscar protocolo o estado"
          searchFields={[
            "status",
            (execution) => protocols.find((protocol) => protocol.id === execution.protocolId)?.name,
          ]}
          filterFields={[
            { key: "status", label: "Estado", accessor: "status" },
            {
              key: "protocol",
              label: "Protocolo",
              accessor: (execution) =>
                protocols.find((protocol) => protocol.id === execution.protocolId)?.name,
            },
          ]}
          size="small"
          dataSource={mine}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          columns={[
            {
              title: "Protocolo",
              sorter: (a, b) =>
                (
                  protocols.find((protocol) => protocol.id === a.protocolId)?.name ?? ""
                ).localeCompare(
                  protocols.find((protocol) => protocol.id === b.protocolId)?.name ?? "",
                  "es",
                ),
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
            {
              title: "Validado por",
              sorter: (a, b) =>
                (a.approval?.supervisor ?? "").localeCompare(b.approval?.supervisor ?? "", "es"),
              render: (_, e) => e.approval?.supervisor || "—",
            },
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
