import { Card, Typography, Button, Space, message } from "antd";
import { SmartTable } from "../shared/SmartTable";
import dayjs from "dayjs";
import { useStore } from "../store";
import { statusTag } from "../ui";

export function IncidentsList() {
  const { incidents, setIncidents, protocols } = useStore();
  const resolve = (id: string) => {
    setIncidents(incidents.map((i) => (i.id === id ? { ...i, status: "Resolved" as const } : i)));
    message.success("Incidencia resuelta");
  };
  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Incidencias
      </Typography.Title>
      <Card>
        <SmartTable
          searchPlaceholder="Buscar protocolo, tipo o descripción"
          searchFields={[
            "type",
            "description",
            (incident) => protocols.find((protocol) => protocol.id === incident.protocolId)?.name,
          ]}
          filterFields={[
            { key: "status", label: "Estado", accessor: "status" },
            { key: "type", label: "Tipo", accessor: "type" },
            {
              key: "protocol",
              label: "Protocolo",
              accessor: (incident) =>
                protocols.find((protocol) => protocol.id === incident.protocolId)?.name,
            },
          ]}
          dataSource={incidents}
          rowKey="id"
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
              render: (_, i) => protocols.find((p) => p.id === i.protocolId)?.name,
            },
            { title: "Tipo", dataIndex: "type" },
            { title: "Descripción", dataIndex: "description" },
            { title: "Estado", dataIndex: "status", render: statusTag, width: 120 },
            {
              title: "Fecha",
              dataIndex: "createdAt",
              width: 160,
              render: (v) => dayjs(v).format("DD MMM HH:mm"),
            },
            {
              title: "Acción",
              width: 120,
              render: (_, i) =>
                i.status !== "Resolved" && i.status !== "Closed" ? (
                  <Button size="small" type="primary" onClick={() => resolve(i.id)}>
                    Resolver
                  </Button>
                ) : null,
            },
          ]}
        />
      </Card>
    </div>
  );
}
