import { Empty, message, Typography } from "antd";
import dayjs from "dayjs";
import { useStore } from "../store";
import { MaintenanceResult } from "../shared/MaintenanceResult";
import type { Notification } from "../types";

export function MaintenanceResults() {
  const { executions, schedules, protocols, notifications, setNotifications } = useStore();
  const execution =
    executions.find((e) => e.id === "e6") ?? executions.find((e) => e.status === "Validated");
  const schedule = execution ? schedules.find((s) => s.id === execution.scheduleId) : undefined;
  const protocol = execution ? protocols.find((p) => p.id === execution.protocolId) : undefined;

  if (!execution || !protocol) return <Empty description="Aún no hay resultados validados" />;

  const send = () => {
    const updates: Notification[] = [
      {
        id: `n-${Date.now()}-op`,
        type: "Completed",
        channel: "WhatsApp",
        actor: "Coordinación de mantenimiento",
        recipientRole: "operator",
        recipient: execution.operator,
        source: "OnDemand",
        event: "Resultado compartido",
        message: `${schedule?.workOrder ?? "Orden"}: resultado ${execution.score ?? 91}% y activo liberado.`,
        status: "Sent",
        createdAt: dayjs().toISOString(),
      },
      {
        id: `n-${Date.now()}-sup`,
        type: "Completed",
        channel: "Push",
        actor: "Coordinación de mantenimiento",
        recipientRole: "supervisor",
        recipient: execution.approval?.supervisor ?? "Roberto Salas",
        source: "OnDemand",
        event: "Resultado compartido",
        message: `Resultado de ${schedule?.assetId ?? "AC-01"} enviado a interesados y registrado en el historial.`,
        status: "Sent",
        createdAt: dayjs().toISOString(),
      },
    ];
    setNotifications([...updates, ...notifications]);
    message.success("Resultado enviado por WhatsApp y push; recepción emulada en cada rol");
  };

  return (
    <div>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Vista comercial de cierre: evidencia contra estándar, calificación, decisión, trazabilidad e
        impacto operacional.
      </Typography.Paragraph>
      <MaintenanceResult
        execution={execution}
        protocol={protocol}
        schedule={schedule}
        onSend={send}
      />
    </div>
  );
}
