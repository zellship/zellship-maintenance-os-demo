import { useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Image,
  Progress,
  Row,
  Space,
  Steps,
  Tag,
  Timeline,
  Typography,
} from "antd";
import { SmartTable } from "../shared/SmartTable";
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { seedAssets, seedOperationalFlows } from "../seed";
import { statusTag } from "../ui";
import type { Execution, OperationalFlow, Protocol, Schedule } from "../types";
import { maintenanceCapturedUrl } from "../shared/maintenanceAssets";

export function WorkOrders({ initialSelectedId = null }: { initialSelectedId?: string | null }) {
  const { schedules, protocols, executions, tools, inventory, setRole } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [fullDetailId, setFullDetailId] = useState<string | null>(null);
  const selected = schedules.find((s) => s.id === selectedId);
  const protocol = protocols.find((p) => p.id === selected?.protocolId);
  const execution = executions.find((e) => e.scheduleId === selectedId);
  const asset = seedAssets.find((a) => a.id === selected?.assetId);
  const relatedFlow = selected ? findOrderFlow(selected) : undefined;
  const fullDetailSchedule = schedules.find((schedule) => schedule.id === fullDetailId);
  const fullDetailProtocol = protocols.find((item) => item.id === fullDetailSchedule?.protocolId);
  const fullDetailExecution = executions.find((item) => item.scheduleId === fullDetailSchedule?.id);
  const fullDetailAsset = seedAssets.find((item) => item.id === fullDetailSchedule?.assetId);
  const fullDetailFlow = fullDetailSchedule ? findOrderFlow(fullDetailSchedule) : undefined;
  const step = getOrderStep(selected, execution);
  const progress = [0, 20, 55, 85, 100][step] ?? 0;

  const rows = schedules.map((s) => ({
    ...s,
    protocol: protocols.find((p) => p.id === s.protocolId)?.name,
    asset: seedAssets.find((a) => a.id === s.assetId)?.id,
  }));

  if (fullDetailSchedule && fullDetailProtocol) {
    return (
      <WorkOrderDetailPage
        schedule={fullDetailSchedule}
        protocol={fullDetailProtocol}
        execution={fullDetailExecution}
        asset={fullDetailAsset}
        flow={fullDetailFlow}
        tools={tools}
        inventory={inventory}
        onBack={() => setFullDetailId(null)}
        onOpenMobile={() => setRole("operator")}
      />
    );
  }

  return (
    <div className="industrial-page">
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Órdenes de trabajo
          </Typography.Title>
          <Typography.Text type="secondary">
            Seguimiento desde la asignación hasta la validación y cierre.
          </Typography.Text>
        </div>
        <Tag color="purple">
          {schedules.filter((s) => s.status !== "Completed").length} requieren seguimiento
        </Tag>
      </Space>
      <Card>
        <SmartTable
          searchPlaceholder="Buscar orden, protocolo, activo o responsable"
          searchFields={["workOrder", "protocol", "asset", "operator"]}
          filterFields={[
            { key: "status", label: "Estado", accessor: "status" },
            { key: "operator", label: "Responsable", accessor: "operator" },
            { key: "asset", label: "Activo", accessor: "asset" },
            { key: "protocol", label: "Protocolo", accessor: "protocol" },
          ]}
          rowKey="id"
          dataSource={rows}
          scroll={{ x: 920 }}
          columns={[
            { title: "Orden", dataIndex: "workOrder", width: 130 },
            { title: "Protocolo", dataIndex: "protocol", width: 260 },
            { title: "Activo", dataIndex: "asset", width: 90 },
            {
              title: "Fecha",
              dataIndex: "date",
              width: 115,
              render: (v) => dayjs(v).format("DD MMM"),
            },
            { title: "Responsable", dataIndex: "operator", width: 150 },
            { title: "Estado", dataIndex: "status", width: 140, render: statusTag },
            {
              title: "",
              width: 90,
              render: (_, row) => (
                <Button icon={<EyeOutlined />} onClick={() => setSelectedId(row.id)}>
                  Ver
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Drawer
        width={720}
        title={`${selected?.workOrder || "Orden"} · Expediente operativo`}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      >
        {!selected || !protocol ? (
          <Empty />
        ) : (
          <>
            <Space style={{ justifyContent: "space-between", width: "100%" }}>
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {protocol.name}
                </Typography.Title>
                <Typography.Text type="secondary">{asset?.name}</Typography.Text>
              </div>
              {statusTag(execution?.status || selected.status)}
            </Space>
            <Progress percent={progress} strokeColor="#7B35C1" style={{ marginTop: 18 }} />
            <Steps
              size="small"
              current={step}
              responsive
              items={[
                { title: "Definida" },
                { title: "Asignada" },
                { title: "Ejecutada" },
                { title: "Evaluada" },
                { title: "Cerrada" },
              ]}
            />
            <Button
              className="work-order-open-detail"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
                setFullDetailId(selected.id);
                setSelectedId(null);
              }}
            >
              Abrir detalle completo de la orden
            </Button>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 20 }}>
              <Descriptions.Item label="Planta / área">
                {asset?.plant} · {asset?.area}
              </Descriptions.Item>
              <Descriptions.Item label="Responsable">{selected.operator}</Descriptions.Item>
              {selected.serviceReference && (
                <Descriptions.Item label="Servicio origen">
                  {selected.serviceReference}
                  {selected.siteLabel ? ` · ${selected.siteLabel}` : ""}
                </Descriptions.Item>
              )}
              {selected.classification && (
                <Descriptions.Item label="Clasificación">
                  {selected.classification.serviceType} ·{" "}
                  {selected.classification.installationClass} ·{" "}
                  {selected.classification.accessContext}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ventana">
                {dayjs(selected.date).format("DD MMM YYYY")} · {selected.hour} ±{" "}
                {selected.tolerance} min
              </Descriptions.Item>
              <Descriptions.Item label="Materiales">
                {protocol.materials?.join(" · ") || "Sin materiales"}
              </Descriptions.Item>
              <Descriptions.Item label="Herramientas reservadas">
                {(selected.toolIds || [])
                  .map((id) => tools.find((t) => t.id === id)?.name)
                  .filter(Boolean)
                  .join(" · ") || "Sin herramientas"}
              </Descriptions.Item>
              <Descriptions.Item label="Inventario reservado">
                {(selected.materialAllocations || [])
                  .map((a) => {
                    const item = inventory.find((i) => i.id === a.inventoryItemId);
                    return `${item?.name}: ${a.reservedQuantity} ${item?.unit}`;
                  })
                  .join(" · ") || "Sin consumibles"}
              </Descriptions.Item>
              <Descriptions.Item label="Seguridad">
                {protocol.safetyInstructions?.join(" · ")}
              </Descriptions.Item>
              {selected.notes && (
                <Descriptions.Item label="Instrucciones adicionales">
                  {selected.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
            <Divider />
            <Typography.Title level={5}>Captura de la ejecución</Typography.Title>
            <OrderCaptureDetails execution={execution} protocol={protocol} compact />

            <Divider />
            <Typography.Title level={5}>Flujo operativo</Typography.Title>
            <OrderFlowSummary flow={relatedFlow} protocolId={selected.protocolId} compact />

            <Typography.Title level={5} style={{ marginTop: 22 }}>
              Trazabilidad
            </Typography.Title>
            <Timeline
              items={[
                {
                  color: "green",
                  children: `Protocolo ${protocol.status === "Active" ? "vigente" : protocol.status} · versión comercial`,
                },
                { color: "green", children: `Orden asignada a ${selected.operator}` },
                {
                  color: execution ? "green" : "gray",
                  children: execution
                    ? `${execution.evidences.length} evidencias y ${Object.keys(execution.formAnswers).length} respuestas registradas`
                    : "Ejecución pendiente desde la aplicación móvil",
                },
                {
                  color: execution?.status === "Validated" ? "green" : "gray",
                  children:
                    execution?.status === "Validated"
                      ? `Validada con calificación ${execution.score || 94}%`
                      : "Validación pendiente",
                },
              ]}
            />
            {selected.status === "Pending" && (
              <Button
                type="primary"
                block
                size="large"
                icon={<MobileOutlined />}
                onClick={() => setRole("operator")}
              >
                Abrir en operación móvil
              </Button>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}

function WorkOrderDetailPage({
  schedule,
  protocol,
  execution,
  asset,
  flow,
  tools,
  inventory,
  onBack,
  onOpenMobile,
}: {
  schedule: Schedule;
  protocol: Protocol;
  execution?: Execution;
  asset?: (typeof seedAssets)[number];
  flow?: OperationalFlow;
  tools: ReturnType<typeof useStore>["tools"];
  inventory: ReturnType<typeof useStore>["inventory"];
  onBack: () => void;
  onOpenMobile: () => void;
}) {
  const step = getOrderStep(schedule, execution);
  const progress = [0, 20, 55, 85, 100][step] ?? 0;
  const toolNames = (schedule.toolIds ?? [])
    .map((id) => tools.find((tool) => tool.id === id)?.name)
    .filter(Boolean);
  const protocolToolNames = (protocol.requiredToolIds ?? [])
    .map((id) => tools.find((tool) => tool.id === id)?.name)
    .filter(Boolean);
  const materials = (schedule.materialAllocations ?? [])
    .map((allocation) => {
      const item = inventory.find((candidate) => candidate.id === allocation.inventoryItemId);
      return `${item?.name ?? allocation.inventoryItemId}: ${allocation.reservedQuantity} ${item?.unit ?? ""}`;
    })
    .filter(Boolean);

  return (
    <div className="work-order-detail-page">
      <Button
        type="link"
        className="work-order-detail-back"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
      >
        Volver a órdenes de trabajo
      </Button>

      <Card className="work-order-detail-hero">
        <div className="work-order-detail-heading">
          <div>
            <Space wrap>
              <Tag color="purple">{schedule.workOrder}</Tag>
              <Tag>{schedule.assetId ?? "Sin activo"}</Tag>
              {statusTag(execution?.status ?? schedule.status)}
              {flow && (
                <Tag color="blue" icon={<BranchesOutlined />}>
                  Vinculada a flujo
                </Tag>
              )}
              {schedule.classification && (
                <>
                  <Tag>{schedule.classification.serviceType}</Tag>
                  <Tag>{schedule.classification.installationClass}</Tag>
                  <Tag>{schedule.classification.accessContext}</Tag>
                </>
              )}
            </Space>
            <Typography.Title level={2}>Detalle operativo de la orden</Typography.Title>
            <Typography.Text type="secondary">
              {protocol.name} · avance, captura, recursos y trazabilidad en una sola vista
            </Typography.Text>
          </div>
          {schedule.status === "Pending" && (
            <Button type="primary" icon={<MobileOutlined />} onClick={onOpenMobile}>
              Abrir en operación móvil
            </Button>
          )}
        </div>

        <div className="work-order-detail-progress">
          <Progress percent={progress} strokeColor="#7B35C1" />
          <Steps
            size="small"
            current={step}
            responsive
            items={[
              { title: "Definida" },
              { title: "Asignada" },
              { title: "Ejecutada" },
              { title: "Evaluada" },
              { title: "Cerrada" },
            ]}
          />
        </div>

        <div className="work-order-detail-metrics">
          <OrderMetric
            icon={<ClockCircleOutlined />}
            label="Ventana programada"
            value={`${dayjs(schedule.date).format("DD/MM")} · ${schedule.hour}`}
            helper={`Tolerancia ± ${schedule.tolerance} min`}
          />
          <OrderMetric
            icon={<UserOutlined />}
            label="Responsable"
            value={schedule.operator}
            helper={asset?.plant ?? schedule.plant ?? "Planta"}
          />
          <OrderMetric
            icon={<CameraOutlined />}
            label="Evidencias"
            value={String(execution?.evidences.length ?? 0)}
            helper={execution ? "Capturadas en campo" : "Ejecución pendiente"}
          />
          <OrderMetric
            icon={<SafetyCertificateOutlined />}
            label="Calificación"
            value={execution?.score ? `${execution.score}%` : "—"}
            helper={execution?.status === "Validated" ? "Resultado validado" : "En progreso"}
          />
        </div>
      </Card>

      <Row gutter={[16, 16]} className="work-order-detail-layout">
        <Col xs={24} xl={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title="Captura y formulario de la ejecución"
              extra={
                <Tag color={execution ? "green" : "default"}>
                  {execution ? `${execution.evidences.length} evidencias` : "Sin iniciar"}
                </Tag>
              }
            >
              <OrderCaptureDetails execution={execution} protocol={protocol} />
            </Card>

            <Card title="Planificación y recursos">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Activo y ubicación">
                  {asset?.name ?? schedule.assetId} · {asset?.plant ?? schedule.plant} ·{" "}
                  {asset?.area}
                </Descriptions.Item>
                <Descriptions.Item label="Responsable">{schedule.operator}</Descriptions.Item>
                {schedule.classification && (
                  <Descriptions.Item label="Clasificación operativa">
                    {schedule.classification.serviceType} ·{" "}
                    {schedule.classification.installationClass} ·{" "}
                    {schedule.classification.accessContext}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Ventana">
                  {dayjs(schedule.date).format("DD MMM YYYY")} · {schedule.hour} ±{" "}
                  {schedule.tolerance} min
                </Descriptions.Item>
                <Descriptions.Item label="Herramientas">
                  {toolNames.join(" · ") || protocolToolNames.join(" · ") || "Sin herramientas"}
                </Descriptions.Item>
                <Descriptions.Item label="Materiales">
                  {materials.join(" · ") || protocol.materials?.join(" · ") || "Sin consumibles"}
                </Descriptions.Item>
                <Descriptions.Item label="Seguridad">
                  {protocol.safetyInstructions?.join(" · ") || "Sin instrucciones adicionales"}
                </Descriptions.Item>
                {schedule.notes && (
                  <Descriptions.Item label="Comentarios de programación">
                    {schedule.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
              {!!schedule.accessRequirements?.length && (
                <>
                  <Divider>Preparación de acceso</Divider>
                  <Space wrap>
                    {schedule.accessRequirements.map((requirement) => (
                      <Tag key={requirement.id} color={requirement.completed ? "green" : "orange"}>
                        {requirement.label} · {requirement.completed ? "Lista" : "Pendiente"}
                      </Tag>
                    ))}
                  </Space>
                </>
              )}
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card title="Flujo operativo">
              <OrderFlowSummary flow={flow} protocolId={schedule.protocolId} />
            </Card>
            <Card title="Trazabilidad de la orden">
              <Timeline
                items={[
                  {
                    color: "green",
                    children: `Protocolo ${protocol.status === "Active" ? "vigente" : protocol.status}`,
                  },
                  { color: "green", children: `Orden asignada a ${schedule.operator}` },
                  {
                    color: execution ? "green" : "gray",
                    children: execution
                      ? `${execution.evidences.length} evidencias y ${Object.keys(execution.formAnswers).length} respuestas registradas`
                      : "Ejecución pendiente desde la aplicación móvil",
                  },
                  {
                    color: execution?.status === "Validated" ? "green" : "gray",
                    children:
                      execution?.status === "Validated"
                        ? `Validada con calificación ${execution.score ?? 94}%`
                        : "Validación o cierre pendiente",
                  },
                ]}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

function OrderCaptureDetails({
  execution,
  protocol,
  compact = false,
}: {
  execution?: Execution;
  protocol: Protocol;
  compact?: boolean;
}) {
  if (!execution) {
    return (
      <Alert
        type="info"
        showIcon
        message="La ejecución aún no inicia"
        description="GPS, fotografías y respuestas aparecerán aquí conforme el responsable capture la operación."
      />
    );
  }

  const photos = execution.evidences.filter((evidence) => evidence.type === "Photo");
  const gps = execution.evidences.find((evidence) => evidence.type === "GPS");
  const additionalEvidence = execution.evidences.filter(
    (evidence) => !["Photo", "GPS"].includes(evidence.type),
  );
  const answers = protocol.formConfig.filter((field) => field.type !== "separator");

  return (
    <div className={`work-order-capture ${compact ? "compact" : ""}`}>
      <div className="work-order-capture-summary">
        <div>
          <Avatar icon={<EnvironmentOutlined />} />
          <span>
            <small>GPS</small>
            <strong>{gps ? "Ubicación simulada" : "Sin captura"}</strong>
          </span>
        </div>
        <div>
          <Avatar icon={<CameraOutlined />} />
          <span>
            <small>Fotografías</small>
            <strong>{photos.length}</strong>
          </span>
        </div>
        <div>
          <Avatar icon={<FileTextOutlined />} />
          <span>
            <small>Formulario</small>
            <strong>{Object.keys(execution.formAnswers).length} respuestas</strong>
          </span>
        </div>
      </div>

      {gps && (
        <div className="work-order-gps-detail">
          <EnvironmentOutlined />
          <div>
            <Typography.Text strong>Coordenadas capturadas</Typography.Text>
            <Typography.Text type="secondary">{gps.data}</Typography.Text>
            <small>{dayjs(gps.timestamp).format("DD/MM/YYYY · HH:mm")}</small>
          </div>
          <Tag color={gps.status === "Valid" ? "green" : "red"}>
            {gps.status === "Valid" ? "Válida" : "Inválida"}
          </Tag>
        </div>
      )}

      {photos.length > 0 && (
        <div className="work-order-photo-grid">
          {photos.map((photo, index) => (
            <figure key={photo.id}>
              <Image
                preview
                src={maintenanceCapturedUrl}
                alt={`Fotografía ${index + 1} de la ejecución`}
              />
              <figcaption>
                <span>Foto {index + 1}</span>
                <Tag color={photo.status === "Valid" ? "green" : "red"}>
                  {photo.status === "Valid" ? "Válida" : "Inválida"}
                </Tag>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {additionalEvidence.length > 0 && (
        <Space wrap className="work-order-additional-evidence">
          {additionalEvidence.map((evidence) => (
            <Tag key={evidence.id} color="purple" icon={<CheckCircleOutlined />}>
              {evidenceLabel(evidence.type)} ·{" "}
              {evidence.status === "Valid" ? "Válida" : evidence.status}
            </Tag>
          ))}
        </Space>
      )}

      <div className="work-order-form-capture">
        <Typography.Text strong>Formulario capturado</Typography.Text>
        <Descriptions bordered column={1} size="small">
          {answers.map((field) => (
            <Descriptions.Item key={field.id} label={field.label}>
              {String(execution.formAnswers[field.id] ?? "—")}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>
      {!!execution.workConcepts?.length && (
        <div className="work-order-form-capture">
          <Typography.Text strong>Conceptos ejecutados · sin precios</Typography.Text>
          <Descriptions bordered column={1} size="small">
            {execution.workConcepts.map((concept) => (
              <Descriptions.Item key={concept.code} label={concept.code}>
                {concept.description} · {concept.quantity} {concept.unit}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
    </div>
  );
}

function OrderFlowSummary({
  flow,
  protocolId,
  compact = false,
}: {
  flow?: OperationalFlow;
  protocolId: string;
  compact?: boolean;
}) {
  if (!flow) {
    return (
      <Alert
        type="info"
        showIcon
        message="Orden independiente"
        description="Esta orden no forma parte de un flujo operativo configurado."
      />
    );
  }

  const completed = flow.steps.filter((step) => step.status === "Completed").length;
  const progress = Math.round((completed / flow.steps.length) * 100);
  const currentIndex = Math.max(
    0,
    flow.steps.findIndex((step) => ["Ready", "Running"].includes(step.status)),
  );

  return (
    <div className={`work-order-flow-summary ${compact ? "compact" : ""}`}>
      <div className="work-order-flow-heading">
        <Avatar icon={<BranchesOutlined />} />
        <div>
          <Typography.Text strong>{flow.name}</Typography.Text>
          <Typography.Text type="secondary">{flow.description}</Typography.Text>
        </div>
        <Tag color={flow.status === "Running" ? "purple" : "blue"}>
          {flow.status === "Running"
            ? "En ejecución"
            : flow.status === "Ready"
              ? "Listo"
              : "Completado"}
        </Tag>
      </div>
      <Progress percent={progress} size="small" strokeColor="#7B35C1" />
      <Steps
        direction="vertical"
        size="small"
        current={currentIndex}
        items={flow.steps.map((step) => ({
          title: step.name,
          description:
            step.protocolId === protocolId ? "Etapa asociada a esta orden" : step.trigger,
          status:
            step.status === "Completed"
              ? "finish"
              : ["Ready", "Running"].includes(step.status)
                ? "process"
                : "wait",
        }))}
      />
    </div>
  );
}

function OrderMetric({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="work-order-detail-metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <Typography.Text type="secondary">{helper}</Typography.Text>
      </div>
    </div>
  );
}

function findOrderFlow(schedule: Schedule) {
  return seedOperationalFlows.find(
    (flow) =>
      flow.assetId === schedule.assetId &&
      flow.steps.some((step) => step.protocolId === schedule.protocolId),
  );
}

function getOrderStep(schedule?: Schedule, execution?: Execution) {
  if (schedule?.status === "Pending") return 1;
  if (schedule?.status === "InProgress") return 2;
  if (execution?.status === "PendingValidation") return 3;
  if (execution?.status === "Validated") return 4;
  return execution ? 3 : 0;
}

function evidenceLabel(type: Execution["evidences"][number]["type"]) {
  if (type === "Signature") return "Firma";
  if (type === "QR") return "Código QR";
  if (type === "Timestamp") return "Marca de tiempo";
  if (type === "File") return "Archivo";
  if (type === "Video") return "Video";
  return type;
}
