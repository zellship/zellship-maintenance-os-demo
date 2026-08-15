import { useState } from "react";
import {
  Alert,
  Card,
  Button,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  List,
  Modal,
  Row,
  Space,
  Timeline,
  Tag,
  Typography,
  message,
} from "antd";
import { SmartTable } from "../shared/SmartTable";
import { EyeOutlined, PlusOutlined, ImportOutlined, MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { statusTag, priorityTag } from "../ui";
import type { Protocol } from "../types";

export function ProtocolCatalog({ onNew }: { onNew: () => void }) {
  const { protocols, setProtocols, executions } = useStore();
  const [history, setHistory] = useState<Protocol | null>(null);
  const [details, setDetails] = useState<Protocol | null>(null);

  const toggle = (p: Protocol, newStatus: Protocol["status"]) => {
    setProtocols(protocols.map((x) => (x.id === p.id ? { ...x, status: newStatus } : x)));
    message.success(`Protocolo ${newStatus === "Active" ? "activado" : "desactivado"}`);
  };

  const duplicate = (p: Protocol) => {
    const copy: Protocol = {
      ...p,
      id: `p${Date.now()}`,
      name: `${p.name} (copia)`,
      status: "Draft",
    };
    setProtocols([copy, ...protocols]);
    message.success("Protocolo duplicado");
  };

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Protocolos
          </Typography.Title>
          <Typography.Text type="secondary">
            Estándares versionados para mantenimiento e inspección industrial
          </Typography.Text>
        </div>
        <Space>
          <Button
            icon={<ImportOutlined />}
            onClick={() => message.info("Próximamente: importación masiva desde Excel/CMMS")}
          >
            Importar plantilla
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
            Nuevo protocolo
          </Button>
        </Space>
      </Space>

      <Card>
        <SmartTable
          searchPlaceholder="Buscar protocolo, categoría, descripción o activo"
          searchFields={["name", "description", "category", "assetIds"]}
          filterFields={[
            { key: "category", label: "Categoría", accessor: "category" },
            { key: "branch", label: "Planta", accessor: "branches" },
            { key: "status", label: "Estado", accessor: "status" },
            { key: "priority", label: "Prioridad", accessor: "priority" },
            { key: "activation", label: "Activación", accessor: "activationMode" },
          ]}
          dataSource={protocols}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1160 }}
          columns={[
            {
              title: "Nombre",
              dataIndex: "name",
              width: 360,
              render: (v, p) => (
                <div className="protocol-catalog-name">
                  <b>{v}</b>
                  <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                    {p.description}
                  </Typography.Paragraph>
                </div>
              ),
            },
            { title: "Categoría", dataIndex: "category", width: 130 },
            { title: "Prioridad", dataIndex: "priority", width: 110, render: priorityTag },
            {
              title: "Activación",
              dataIndex: "activationMode",
              width: 150,
              render: (value) => (
                <Tag
                  color={
                    value === "Triggered" ? "orange" : value === "OnDemand" ? "blue" : "purple"
                  }
                >
                  {value === "Triggered"
                    ? "Por trigger"
                    : value === "OnDemand"
                      ? "Directa"
                      : "Recurrente"}
                </Tag>
              ),
            },
            { title: "Recurrencia", dataIndex: "recurrence", width: 120 },
            {
              title: "Activos",
              dataIndex: "assetIds",
              width: 110,
              render: (v) => v?.join(", ") || "—",
            },
            {
              title: "Última ejecución",
              dataIndex: "lastExecution",
              width: 160,
              render: (v) => (v ? dayjs(v).format("DD MMM HH:mm") : "—"),
            },
            { title: "Estado", dataIndex: "status", width: 110, render: statusTag },
            {
              title: "Acciones",
              width: 150,
              fixed: "right",
              render: (_, p) => (
                <Space size={4}>
                  <Button type="link" icon={<EyeOutlined />} onClick={() => setDetails(p)}>
                    Ver
                  </Button>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "edit",
                          label: "Editar",
                          onClick: () =>
                            message.info("Próximamente: editor con control de versiones"),
                        },
                        { key: "dup", label: "Duplicar", onClick: () => duplicate(p) },
                        p.status === "Active"
                          ? {
                              key: "off",
                              label: "Desactivar",
                              onClick: () => toggle(p, "Inactive"),
                            }
                          : {
                              key: "on",
                              label: "Activar",
                              onClick: () => toggle(p, "Active"),
                            },
                        { key: "hist", label: "Historial", onClick: () => setHistory(p) },
                      ],
                    }}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <ProtocolDetailsModal protocol={details} onClose={() => setDetails(null)} />
      <Modal
        title={`Historial · ${history?.name || "Protocolo"}`}
        open={!!history}
        onCancel={() => setHistory(null)}
        footer={<Button onClick={() => setHistory(null)}>Cerrar</Button>}
      >
        {history && (
          <Timeline
            items={[
              {
                color: "green",
                children: (
                  <>
                    <b>Versión vigente</b> <Tag color="green">{history.status}</Tag>
                    <br />
                    {history.requiredSkillIds?.length || 0} skills ·{" "}
                    {history.requiredToolIds?.length || 0} herramientas ·{" "}
                    {history.materialRequirements?.length || 0} materiales
                  </>
                ),
              },
              ...executions
                .filter((e) => e.protocolId === history.id)
                .slice(0, 4)
                .map((e) => ({
                  color: e.status === "Validated" ? "green" : "purple",
                  children: `${dayjs(e.endAt || e.startAt).format("DD MMM YYYY HH:mm")} · ${e.operator} · ${e.status} · Calificación ${e.score || "—"}%`,
                })),
              { color: "gray", children: "Plantilla creada y publicada en Maintenance OS" },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}

function ProtocolDetailsModal({
  protocol,
  onClose,
}: {
  protocol: Protocol | null;
  onClose: () => void;
}) {
  return (
    <Modal
      className="protocol-details-modal"
      title="Configuración del protocolo"
      open={Boolean(protocol)}
      width={980}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Cerrar</Button>}
    >
      {protocol && (
        <>
          <div className="protocol-details-hero">
            <div>
              <Space wrap>
                <Tag color="purple">{protocol.category}</Tag>
                {priorityTag(protocol.priority)}
                {statusTag(protocol.status)}
              </Space>
              <Typography.Title level={3}>{protocol.name}</Typography.Title>
              <Typography.Paragraph type="secondary">{protocol.description}</Typography.Paragraph>
            </div>
            <div className="protocol-details-duration">
              <b>{protocol.estimatedMinutes ?? 45}</b>
              <span>min estimados</span>
            </div>
          </div>

          <Descriptions bordered size="small" column={{ xs: 1, md: 3 }}>
            <Descriptions.Item label="Activación">
              {activationLabel(protocol.activationMode)}
            </Descriptions.Item>
            <Descriptions.Item label="Evento detonador">
              {protocol.triggerEvent ?? "Programación manual"}
            </Descriptions.Item>
            <Descriptions.Item label="Recurrencia">{protocol.recurrence}</Descriptions.Item>
            <Descriptions.Item label="Región">{protocol.branches.join(", ")}</Descriptions.Item>
            <Descriptions.Item label="Activos">
              {protocol.assetIds?.join(", ") || "Según clasificación"}
            </Descriptions.Item>
            <Descriptions.Item label="Tolerancia">
              {protocol.schedule[0]?.tolerance ?? 0} min
            </Descriptions.Item>
          </Descriptions>

          <Divider>Solicitud de evidencias</Divider>
          <List
            className="protocol-evidence-manifest"
            bordered
            dataSource={protocol.evidenceConfig}
            renderItem={(evidence, index) => (
              <List.Item
                extra={
                  <Space wrap>
                    {evidence.phase && <Tag>{phaseLabel(evidence.phase)}</Tag>}
                    {evidence.radius && <Tag color="blue">Radio {evidence.radius} m</Tag>}
                    <Tag color={evidence.required ? "red" : "default"}>
                      {evidence.required ? "Obligatoria" : "Opcional"}
                    </Tag>
                  </Space>
                }
              >
                <List.Item.Meta
                  avatar={<span className="protocol-evidence-index">{index + 1}</span>}
                  title={evidence.label ?? evidence.type}
                  description={evidence.guidance ?? evidenceTypeDescription(evidence.type)}
                />
              </List.Item>
            )}
          />

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card size="small" title={`Formulario · ${protocol.formConfig.length} campos`}>
                <List
                  size="small"
                  dataSource={protocol.formConfig}
                  renderItem={(field) => (
                    <List.Item extra={field.required ? <Tag color="red">Obligatorio</Tag> : null}>
                      <List.Item.Meta title={field.label} description={field.type} />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Acceso y seguridad">
                <List
                  size="small"
                  dataSource={protocol.safetyInstructions ?? []}
                  renderItem={(instruction) => <List.Item>{instruction}</List.Item>}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Recursos requeridos">
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Técnicos">
                    {protocol.operators.join(", ")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Supervisión">
                    {protocol.supervisors.join(", ")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Herramientas">
                    {protocol.requiredToolIds?.length ?? 0} configuradas
                  </Descriptions.Item>
                  <Descriptions.Item label="Materiales">
                    {protocol.materialRequirements?.length ?? 0} configurados
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Cierre y notificaciones">
                <Alert
                  showIcon
                  type={protocol.requiresValidation ? "warning" : "success"}
                  message={
                    protocol.requiresValidation
                      ? "Requiere aprobación antes del cierre"
                      : "Cierre automático al completar"
                  }
                />
                <Space wrap style={{ marginTop: 12 }}>
                  {protocol.channels.map((channel) => (
                    <Tag color="blue" key={channel}>
                      {channel}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Modal>
  );
}

function activationLabel(mode: Protocol["activationMode"]) {
  if (mode === "Triggered") return "Por trigger";
  if (mode === "OnDemand") return "Directa";
  return "Recurrente";
}

function phaseLabel(phase: NonNullable<Protocol["evidenceConfig"][number]["phase"]>) {
  if (phase === "Pre-intervention") return "Antes";
  if (phase === "Intervention") return "Durante";
  return "Resultado final";
}

function evidenceTypeDescription(type: Protocol["evidenceConfig"][number]["type"]) {
  const descriptions = {
    Photo: "Fotografía asociada a la orden y al activo.",
    Video: "Video asociado a la ejecución.",
    Signature: "Firma vinculada al cierre.",
    GPS: "Ubicación validada contra el radio configurado.",
    QR: "Identificador validado desde el sitio.",
    Timestamp: "Fecha y hora registradas durante la ejecución.",
    File: "Documento adjunto a la evidencia.",
  };
  return descriptions[type];
}
