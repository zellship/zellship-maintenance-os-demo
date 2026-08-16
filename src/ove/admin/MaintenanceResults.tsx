import { useState } from "react";
import { Button, Card, Empty, Space, Statistic, Tag, Typography, message } from "antd";
import { SmartTable } from "../shared/SmartTable";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { advanceDemoClock, demoNow } from "../../demo-config/clock";
import { useStore } from "../store";
import { MaintenanceResult } from "../shared/MaintenanceResult";
import type { ReportDeliverySelection } from "../shared/SendReportModal";
import type { Notification } from "../types";

export function MaintenanceResults() {
  const { executions, schedules, protocols, notifications, setNotifications } = useStore();
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  const completedResults = executions
    .filter((execution) => ["Completed", "Validated"].includes(execution.status))
    .map((execution) => {
      const schedule = schedules.find((item) => item.id === execution.scheduleId);
      const protocol = protocols.find((item) => item.id === execution.protocolId);
      return { execution, schedule, protocol };
    })
    .filter(({ schedule, protocol }) => schedule?.status === "Completed" && protocol)
    .sort((a, b) =>
      (b.execution.endAt ?? b.execution.startAt).localeCompare(
        a.execution.endAt ?? a.execution.startAt,
      ),
    );

  const selected = completedResults.find(({ execution }) => execution.id === selectedExecutionId);

  const averageScore = completedResults.length
    ? Math.round(
        completedResults.reduce((sum, { execution }) => sum + Number(execution.score ?? 0), 0) /
          completedResults.length,
      )
    : 0;
  const validatedCount = completedResults.filter(
    ({ execution }) => execution.status === "Validated",
  ).length;

  const send = ({ contact, channels }: ReportDeliverySelection) => {
    if (!selected) return;
    const { execution, schedule } = selected;
    const sentAt = Date.now();
    const updates: Notification[] = channels.map(
      (channel, index) =>
        ({
          id: `n-${sentAt}-${index}`,
          type: "Completed",
          channel,
          actor: "Coordinación de mantenimiento",
          recipientRole: contact.role,
          recipient: contact.name,
          source: "OnDemand",
          event: "Resultado compartido",
          message: `${schedule?.workOrder ?? "Orden"}: resultado ${execution.score ?? 91}% y activo liberado.`,
          status: "Sent",
          createdAt: advanceDemoClock(1).toISOString(),
        }) satisfies Notification,
    );
    setNotifications([...updates, ...notifications]);
    message.success(
      `Envío simulado a ${contact.name} por ${channels
        .map((channel) => (channel === "Email" ? "correo" : "WhatsApp"))
        .join(" y ")}`,
    );
  };

  if (selected?.protocol) {
    return (
      <div className="maintenance-results-detail">
        <Button
          className="maintenance-results-back"
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => setSelectedExecutionId(null)}
        >
          Volver a órdenes completadas
        </Button>
        <Typography.Paragraph type="secondary" className="maintenance-results-detail-intro">
          Expediente del cierre: datos generales, diagnóstico, acciones, bitácora fotográfica,
          conceptos y aprobación.
        </Typography.Paragraph>
        <MaintenanceResult
          execution={selected.execution}
          protocol={selected.protocol}
          schedule={selected.schedule}
          onSend={send}
        />
      </div>
    );
  }

  return (
    <div className="maintenance-results-list">
      <div className="maintenance-results-header">
        <div>
          <Space size={8} className="maintenance-results-eyebrow">
            <span className="live-dot" />
            RESULTADOS · CIERRE OPERATIVO
          </Space>
          <Typography.Title level={2}>Resultados de mantenimiento</Typography.Title>
          <Typography.Text type="secondary">
            Consulta las órdenes completadas y abre su expediente técnico, evidencia y decisión.
          </Typography.Text>
        </div>
      </div>

      <div className="maintenance-results-summary">
        <Card size="small">
          <FileDoneOutlined />
          <Statistic title="Órdenes completadas" value={completedResults.length} />
          <Typography.Text type="secondary">Con resultado disponible</Typography.Text>
        </Card>
        <Card size="small">
          <SafetyCertificateOutlined />
          <Statistic title="Calificación promedio" value={averageScore} suffix="%" />
          <Typography.Text type="secondary">Calidad de ejecución</Typography.Text>
        </Card>
        <Card size="small">
          <CheckCircleOutlined />
          <Statistic title="Cierres validados" value={validatedCount} />
          <Typography.Text type="secondary">Liberados por supervisión</Typography.Text>
        </Card>
      </div>

      <Card className="maintenance-results-table-card" title="Órdenes de trabajo completadas">
        <SmartTable
          searchPlaceholder="Buscar orden, mantenimiento, activo o responsable"
          searchFields={[
            (row) => row.schedule?.workOrder,
            (row) => row.protocol?.name,
            (row) => row.schedule?.assetId,
            (row) => row.execution.operator,
          ]}
          filterFields={[
            { key: "status", label: "Estado", accessor: (row) => row.execution.status },
            { key: "protocol", label: "Mantenimiento", accessor: (row) => row.protocol?.name },
            { key: "operator", label: "Responsable", accessor: (row) => row.execution.operator },
          ]}
          rowKey={({ execution }) => execution.id}
          size="middle"
          pagination={false}
          scroll={{ x: 970 }}
          dataSource={completedResults}
          locale={{ emptyText: <Empty description="No hay órdenes completadas" /> }}
          columns={[
            {
              title: "Orden",
              width: 120,
              sorter: (a, b) =>
                (a.schedule?.workOrder ?? "").localeCompare(b.schedule?.workOrder ?? "", "es", {
                  numeric: true,
                }),
              render: (_, row) => (
                <Typography.Text strong>{row.schedule?.workOrder}</Typography.Text>
              ),
            },
            {
              title: "Mantenimiento",
              width: 185,
              sorter: (a, b) =>
                (a.protocol?.name ?? "").localeCompare(b.protocol?.name ?? "", "es"),
              render: (_, row) => row.protocol?.name,
            },
            {
              title: "Activo",
              width: 80,
              sorter: (a, b) =>
                (a.schedule?.assetId ?? "").localeCompare(b.schedule?.assetId ?? "", "es", {
                  numeric: true,
                }),
              render: (_, row) => row.schedule?.assetId,
            },
            {
              title: "Finalización",
              width: 145,
              sorter: (a, b) => (a.execution.endAt ?? "").localeCompare(b.execution.endAt ?? ""),
              render: (_, row) => dayjs(row.execution.endAt).format("DD/MM/YYYY · HH:mm"),
            },
            {
              title: "Responsable",
              width: 125,
              sorter: (a, b) => a.execution.operator.localeCompare(b.execution.operator, "es"),
              render: (_, row) => row.execution.operator,
            },
            {
              title: "Resultado",
              width: 100,
              sorter: (a, b) => Number(a.execution.score ?? 0) - Number(b.execution.score ?? 0),
              render: (_, row) => (
                <Typography.Text strong className="maintenance-results-score">
                  {row.execution.score ?? "—"}%
                </Typography.Text>
              ),
            },
            {
              title: "Estado",
              width: 105,
              sorter: (a, b) => a.execution.status.localeCompare(b.execution.status, "es"),
              render: (_, row) => (
                <Tag color={row.execution.status === "Validated" ? "green" : "blue"}>
                  {row.execution.status === "Validated" ? "Validada" : "Completada"}
                </Tag>
              ),
            },
            {
              title: "Acción",
              width: 110,
              fixed: "right",
              render: (_, row) => (
                <Button
                  type="primary"
                  ghost
                  onClick={() => setSelectedExecutionId(row.execution.id)}
                >
                  Ver detalle
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
