import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  message,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useStore } from "../store";
import type { StoreAssignment } from "../types";
import { AssignmentStatusTag } from "./retail-ui";
import { formatShortDate } from "./retail-format";

export function StoreProgram() {
  const { storeAssignments, setStoreAssignments, protocols } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const rows = useMemo(
    () =>
      storeAssignments.filter((item) => {
        const protocol = protocols.find((candidate) => candidate.id === item.protocolId);
        const matchesQuery = `${item.storeLabel} ${item.responsible} ${protocol?.name ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesQuery && (status === "all" || item.status === status);
      }),
    [protocols, query, status, storeAssignments],
  );

  const publish = (assignment: StoreAssignment) => {
    setStoreAssignments(
      storeAssignments.map((item) =>
        item.id === assignment.id ? { ...item, status: "Assigned" as const } : item,
      ),
    );
    message.success(`Programa publicado para ${assignment.storeLabel}`);
  };

  const columns: ColumnsType<StoreAssignment> = [
    {
      title: "Tienda",
      dataIndex: "storeLabel",
      sorter: (a, b) => a.storeLabel.localeCompare(b.storeLabel),
      render: (value, item) => (
        <Space direction="vertical" size={0}>
          <b>{value}</b>
          <Typography.Text type="secondary">{item.id}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Protocolo",
      dataIndex: "protocolId",
      sorter: (a, b) => a.protocolId.localeCompare(b.protocolId),
      render: (value) => protocols.find((item) => item.id === value)?.name ?? value,
    },
    {
      title: "Responsable",
      dataIndex: "responsible",
      sorter: (a, b) => a.responsible.localeCompare(b.responsible),
    },
    {
      title: "Vencimiento",
      dataIndex: "dueAt",
      sorter: (a, b) => a.dueAt.localeCompare(b.dueAt),
      render: formatShortDate,
    },
    {
      title: "Avance",
      dataIndex: "progress",
      sorter: (a, b) => a.progress - b.progress,
      render: (value) => <Progress percent={value} size="small" style={{ minWidth: 110 }} />,
    },
    {
      title: "Estado",
      dataIndex: "status",
      filters: ["Draft", "Assigned", "Acknowledged", "InProgress", "Completed"].map((value) => ({
        text: value,
        value,
      })),
      onFilter: (value, record) => record.status === value,
      render: (value) => <AssignmentStatusTag status={value} />,
    },
    {
      title: "Acción",
      key: "action",
      render: (_, item) =>
        item.status === "Draft" ? (
          <Button type="primary" size="small" icon={<SendOutlined />} onClick={() => publish(item)}>
            Publicar
          </Button>
        ) : (
          <Tag>v{item.protocolVersion}</Tag>
        ),
    },
  ];

  return (
    <div className="retail-page">
      <div className="retail-page-heading">
        <div>
          <Typography.Text className="retail-eyebrow">GERENCIA → SUCURSALES</Typography.Text>
          <Typography.Title level={2}>Programa operativo de tiendas</Typography.Title>
          <Typography.Paragraph type="secondary">
            Distribuye protocolos, confirma recepción y da seguimiento al cumplimiento por tienda.
          </Typography.Paragraph>
        </div>
        <Button type="primary" icon={<SendOutlined />}>
          Nueva asignación
        </Button>
      </div>
      <Card>
        <div className="retail-table-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Buscar tienda, responsable o protocolo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            aria-label="Filtrar por estado"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "Todos los estados" },
              ...["Draft", "Assigned", "Acknowledged", "InProgress", "Completed"].map((value) => ({
                value,
                label: value,
              })),
            ]}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
