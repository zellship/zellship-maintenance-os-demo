import { useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Input,
  Modal,
  Space,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from "antd";
import { FileAddOutlined, LinkOutlined, MessageOutlined, ToolOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { advanceDemoClock } from "../../demo-config/clock";
import { SmartTable } from "../shared/SmartTable";
import { seedAssets } from "../seed";
import { useStore } from "../store";
import type { Incident, IncidentUpdate } from "../types";
import { priorityTag, statusTag } from "../ui";

export function IncidentsList({ onCreateOrder }: { onCreateOrder: (incident: Incident) => void }) {
  const { incidents, setIncidents, protocols, schedules } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const selected = incidents.find((incident) => incident.id === selectedId) ?? null;
  const selectedSchedule = schedules.find((schedule) => schedule.id === selected?.scheduleId);
  const selectedProtocol = protocols.find((protocol) => protocol.id === selected?.protocolId);
  const selectedAsset = seedAssets.find(
    (asset) => asset.id === (selected?.assetId ?? selectedSchedule?.assetId),
  );

  const updateIncident = (id: string, updater: (incident: Incident) => Incident) => {
    setIncidents(incidents.map((incident) => (incident.id === id ? updater(incident) : incident)));
  };

  const addUpdate = (incident: Incident, update: IncidentUpdate) => ({
    ...incident,
    updates: [...(incident.updates ?? []), update],
  });

  const appendNote = () => {
    if (!selected || !note.trim()) {
      message.warning("Escribe un comentario para registrar el seguimiento");
      return;
    }
    const at = advanceDemoClock(1).toISOString();
    updateIncident(selected.id, (incident) =>
      addUpdate(incident, {
        id: `iu-comment-${Date.now()}`,
        at,
        actor: "Coordinación de mantenimiento",
        type: "Comment",
        text: note.trim(),
      }),
    );
    setNote("");
    message.success("Comentario agregado a la bitácora");
  };

  const changeStatus = (status: Incident["status"]) => {
    if (!selected) return;
    if (status === "Resolved" && !note.trim()) {
      message.warning("Describe la solución aplicada antes de marcar la incidencia como resuelta");
      return;
    }
    const at = advanceDemoClock(1).toISOString();
    updateIncident(selected.id, (incident) => {
      const label =
        status === "Review" ? "En seguimiento" : status === "Resolved" ? "Resuelta" : "Cerrada";
      return addUpdate(
        {
          ...incident,
          status,
          resolutionSummary: status === "Resolved" ? note.trim() : incident.resolutionSummary,
          resolvedAt: status === "Resolved" ? at : incident.resolvedAt,
          closedAt: status === "Closed" ? at : incident.closedAt,
        },
        {
          id: `iu-status-${Date.now()}`,
          at,
          actor: "Coordinación de mantenimiento",
          type: "StatusChanged",
          text:
            status === "Resolved"
              ? `Incidencia marcada como ${label.toLowerCase()}: ${note.trim()}`
              : `Estado actualizado a ${label}.`,
        },
      );
    });
    setNote("");
    message.success(status === "Closed" ? "Incidencia cerrada" : "Seguimiento actualizado");
  };

  const attachFile = (file: File) => {
    if (!selected) return false;
    const at = advanceDemoClock(1).toISOString();
    updateIncident(selected.id, (incident) =>
      addUpdate(
        {
          ...incident,
          attachments: [
            ...(incident.attachments ?? []),
            {
              id: `ia-${Date.now()}`,
              name: file.name,
              mimeType: file.type || "application/octet-stream",
              size: file.size,
              uploadedAt: at,
              uploadedBy: "Coordinación de mantenimiento",
            },
          ],
        },
        {
          id: `iu-file-${Date.now()}`,
          at,
          actor: "Coordinación de mantenimiento",
          type: "Attachment",
          text: `Archivo agregado: ${file.name}`,
        },
      ),
    );
    message.success("Archivo agregado como evidencia demostrativa");
    return false;
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Incidencias
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Seguimiento documentado desde el reporte inicial hasta la verificación de cierre.
      </Typography.Paragraph>
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
              render: (_, incident) =>
                protocols.find((protocol) => protocol.id === incident.protocolId)?.name,
            },
            { title: "Tipo", dataIndex: "type" },
            { title: "Descripción", dataIndex: "description" },
            {
              title: "Prioridad",
              width: 110,
              render: (_, incident) =>
                priorityTag(
                  incident.priority ??
                    protocols.find((protocol) => protocol.id === incident.protocolId)?.priority ??
                    "Medium",
                ),
            },
            { title: "Estado", dataIndex: "status", render: statusTag, width: 120 },
            {
              title: "Fecha",
              dataIndex: "createdAt",
              width: 160,
              render: (value) => dayjs(value).format("DD MMM HH:mm"),
            },
            {
              title: "Acción",
              width: 150,
              render: (_, incident) => (
                <Button size="small" type="primary" onClick={() => setSelectedId(incident.id)}>
                  Dar seguimiento
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={selected ? `Seguimiento · ${selected.id}` : "Seguimiento de incidencia"}
        open={Boolean(selected)}
        onCancel={() => {
          setSelectedId(null);
          setNote("");
        }}
        width={860}
        footer={null}
      >
        {selected && (
          <>
            <Space wrap style={{ marginBottom: 14 }}>
              {statusTag(selected.status)}
              {priorityTag(selected.priority ?? selectedProtocol?.priority ?? "Medium")}
              <Tag>{selected.type}</Tag>
            </Space>
            <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
              <Descriptions.Item label="Equipo">
                {selectedAsset ? `${selectedAsset.id} · ${selectedAsset.name}` : "Sin equipo"}
              </Descriptions.Item>
              <Descriptions.Item label="Orden relacionada">
                {selectedSchedule?.workOrder ?? "Sin orden vinculada"}
              </Descriptions.Item>
              <Descriptions.Item label="Protocolo">{selectedProtocol?.name}</Descriptions.Item>
              <Descriptions.Item label="Responsable">
                {selected.owner ?? "Coordinación de mantenimiento"}
              </Descriptions.Item>
              <Descriptions.Item label="Descripción" span={2}>
                {selected.description}
              </Descriptions.Item>
              {selected.resolutionSummary && (
                <Descriptions.Item label="Resolución" span={2}>
                  {selected.resolutionSummary}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Acciones</Divider>
            <Space wrap>
              {selected.status === "Open" && (
                <Button type="primary" onClick={() => changeStatus("Review")}>
                  Iniciar seguimiento
                </Button>
              )}
              {selected.status !== "Closed" && !selected.scheduleId && (
                <Button icon={<ToolOutlined />} onClick={() => onCreateOrder(selected)}>
                  Crear orden relacionada
                </Button>
              )}
              <Upload showUploadList={false} beforeUpload={attachFile}>
                <Button icon={<FileAddOutlined />}>Agregar archivo</Button>
              </Upload>
              {selected.scheduleId && (
                <Tag color="blue" icon={<LinkOutlined />}>
                  Orden vinculada
                </Tag>
              )}
            </Space>

            {selected.status !== "Closed" && (
              <>
                <Input.TextArea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    selected.status === "Resolved"
                      ? "Agrega una nota adicional"
                      : "Describe diagnóstico, acción o solución aplicada"
                  }
                  style={{ marginTop: 16 }}
                />
                <Space style={{ marginTop: 10 }} wrap>
                  <Button icon={<MessageOutlined />} onClick={appendNote}>
                    Agregar comentario
                  </Button>
                  {selected.status === "Review" && (
                    <Button type="primary" onClick={() => changeStatus("Resolved")}>
                      Marcar como resuelta
                    </Button>
                  )}
                  {selected.status === "Resolved" && (
                    <Button type="primary" onClick={() => changeStatus("Closed")}>
                      Verificar y cerrar
                    </Button>
                  )}
                </Space>
              </>
            )}

            <Divider>Bitácora</Divider>
            <Timeline
              items={[
                {
                  color: "red",
                  children: (
                    <>
                      <b>Incidencia registrada</b>
                      <br />
                      <Typography.Text type="secondary">
                        {dayjs(selected.createdAt).format("DD MMM YYYY · HH:mm")} ·{" "}
                        {selected.description}
                      </Typography.Text>
                    </>
                  ),
                },
                ...(selected.updates ?? []).map((update) => ({
                  color: update.type === "StatusChanged" ? "blue" : "gray",
                  children: (
                    <>
                      <b>{update.actor}</b>
                      <br />
                      <Typography.Text type="secondary">
                        {dayjs(update.at).format("DD MMM YYYY · HH:mm")} · {update.text}
                      </Typography.Text>
                    </>
                  ),
                })),
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
