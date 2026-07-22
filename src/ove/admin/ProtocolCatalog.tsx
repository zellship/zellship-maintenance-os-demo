import { useMemo, useState } from "react";
import { Card, Table, Button, Space, Input, Select, Dropdown, Typography, message, Modal, Timeline, Tag } from "antd";
import { PlusOutlined, ImportOutlined, MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { branches, categories } from "../seed";
import { statusTag, priorityTag } from "../ui";
import type { Protocol } from "../types";

export function ProtocolCatalog({ onNew }: { onNew: () => void }) {
  const { protocols, setProtocols, executions } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | undefined>();
  const [branch, setBranch] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [history, setHistory] = useState<Protocol | null>(null);

  const filtered = useMemo(() => protocols.filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (!cat || p.category === cat) &&
    (!branch || p.branches.includes(branch)) &&
    (!status || p.status === status)
  ), [protocols, q, cat, branch, status]);

  const toggle = (p: Protocol, newStatus: Protocol["status"]) => {
    setProtocols(protocols.map((x) => x.id === p.id ? { ...x, status: newStatus } : x));
    message.success(`Protocolo ${newStatus === "Active" ? "activado" : "desactivado"}`);
  };

  const duplicate = (p: Protocol) => {
    const copy: Protocol = { ...p, id: `p${Date.now()}`, name: `${p.name} (copia)`, status: "Draft" };
    setProtocols([copy, ...protocols]);
    message.success("Protocolo duplicado");
  };

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>Protocolos</Typography.Title>
          <Typography.Text type="secondary">Estándares versionados para mantenimiento e inspección industrial</Typography.Text>
        </div>
        <Space>
          <Button icon={<ImportOutlined />} onClick={() => message.info("Próximamente: importación masiva desde Excel/CMMS")}>Importar plantilla</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>Nuevo protocolo</Button>
        </Space>
      </Space>

      <Card>
        <Space wrap style={{ marginBottom: 12 }}>
          <Input.Search placeholder="Buscar nombre" allowClear value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
          <Select placeholder="Categoría" allowClear value={cat} onChange={setCat} options={categories.map((c) => ({ label: c, value: c }))} style={{ width: 160 }} />
          <Select placeholder="Planta" allowClear value={branch} onChange={setBranch} options={branches.map((c) => ({ label: c, value: c }))} style={{ width: 180 }} />
          <Select placeholder="Estado" allowClear value={status} onChange={setStatus}
            options={["Draft", "Active", "Inactive", "Archived"].map((c) => ({ label: c, value: c }))} style={{ width: 140 }} />
        </Space>

        <Table
          dataSource={filtered}
          rowKey="id"
          columns={[
            { title: "Nombre", dataIndex: "name", render: (v, p) => <Space direction="vertical" size={0}><b>{v}</b><Typography.Text type="secondary" style={{ fontSize: 12 }}>{p.description}</Typography.Text></Space> },
            { title: "Categoría", dataIndex: "category", width: 130 },
            { title: "Prioridad", dataIndex: "priority", width: 110, render: priorityTag },
            { title: "Recurrencia", dataIndex: "recurrence", width: 120 },
            { title: "Activos", dataIndex: "assetIds", width: 110, render: v => v?.join(", ") || "—" },
            { title: "Última ejecución", dataIndex: "lastExecution", width: 160, render: (v) => v ? dayjs(v).format("DD MMM HH:mm") : "—" },
            { title: "Estado", dataIndex: "status", width: 110, render: statusTag },
            {
              title: "Acciones", width: 80,
              render: (_, p) => (
                <Dropdown menu={{
                  items: [
                    { key: "edit", label: "Editar", onClick: () => message.info("Próximamente: editor con control de versiones") },
                    { key: "dup", label: "Duplicar", onClick: () => duplicate(p) },
                    p.status === "Active"
                      ? { key: "off", label: "Desactivar", onClick: () => toggle(p, "Inactive") }
                      : { key: "on", label: "Activar", onClick: () => toggle(p, "Active") },
                    { key: "hist", label: "Historial", onClick: () => setHistory(p) },
                  ],
                }}>
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              ),
            },
          ]}
        />
      </Card>
      <Modal title={`Historial · ${history?.name || "Protocolo"}`} open={!!history} onCancel={() => setHistory(null)} footer={<Button onClick={() => setHistory(null)}>Cerrar</Button>}>
        {history && <Timeline items={[
          { color: "green", children: <><b>Versión vigente</b> <Tag color="green">{history.status}</Tag><br />{history.requiredSkillIds?.length || 0} skills · {history.requiredToolIds?.length || 0} herramientas · {history.materialRequirements?.length || 0} materiales</> },
          ...executions.filter(e => e.protocolId === history.id).slice(0, 4).map(e => ({ color: e.status === "Validated" ? "green" : "purple", children: `${dayjs(e.endAt || e.startAt).format("DD MMM YYYY HH:mm")} · ${e.operator} · ${e.status} · Calificación ${e.score || "—"}%` })),
          { color: "gray", children: "Plantilla creada y publicada en Maintenance OS" },
        ]} />}
      </Modal>
    </div>
  );
}
