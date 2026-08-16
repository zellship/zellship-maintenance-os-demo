import { useRef, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Space,
  Steps,
  Tag,
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  Rate,
  Progress,
  Alert,
  message,
  Result,
  Divider,
  Descriptions,
  List,
  Image,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  CameraOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { advanceDemoClock, demoNow } from "../../demo-config/clock";
import { useStore } from "../store";
import type {
  EvidenceConfig,
  FormField,
  Execution,
  EvidenceRecord,
  MaterialAllocation,
  Notification,
  WorkConcept,
} from "../types";
import { seedAssets, seedSkills } from "../seed";
import {
  maintenanceCapturedUrl,
  maintenanceReferenceUrl,
  maintenanceSubjectLabel,
  maintenanceEvidenceGuidance,
  maintenanceAiFindings,
  maintenanceDefaultOperatorComment,
  maintenanceAssetUrl,
} from "../shared/maintenanceAssets";
import { EvidenceGpsStamp } from "../shared/EvidenceGpsStamp";
import { isConsumptionDeviation, isFormValid } from "../domain";

export function ExecutionFlow({
  scheduleId,
  onClose,
}: {
  scheduleId: string;
  onClose: () => void;
}) {
  const {
    schedules,
    protocols,
    executions,
    setExecutions,
    setSchedules,
    people,
    tools,
    setTools,
    inventory,
    setInventory,
    reservations,
    setReservations,
    incidents,
    setIncidents,
    notifications,
    setNotifications,
  } = useStore();
  const schedule = schedules.find((s) => s.id === scheduleId);
  const protocol = protocols.find((p) => p.id === schedule?.protocolId);
  const asset = seedAssets.find((a) => a.id === schedule?.assetId);
  const [phase, setPhase] = useState<
    "intro" | "resources" | "evidence" | "form" | "concepts" | "consumption" | "confirm" | "done"
  >("intro");
  const [evidenceIdx, setEvidenceIdx] = useState(0);
  const [evidences, setEvidences] = useState<EvidenceRecord[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [workConcepts, setWorkConcepts] = useState<WorkConcept[]>(() =>
    (protocol?.workConceptTemplates ?? []).map((concept) => ({ ...concept })),
  );
  const [consumptions, setConsumptions] = useState<MaterialAllocation[]>(() =>
    (schedule?.materialAllocations || []).map((a) => ({
      ...a,
      actualQuantity: a.mode === "Exact" ? a.quantity : (a.min ?? a.reservedQuantity),
    })),
  );
  const startRef = useRef<string>(demoNow().toISOString());
  const resourceCheckInRef = useRef<string | undefined>(undefined);

  if (!schedule || !protocol)
    return (
      <Result
        status="error"
        title="No encontrado"
        extra={<Button onClick={onClose}>Volver</Button>}
      />
    );

  const evidences_cfg = protocol.evidenceConfig;
  const current = evidences_cfg[evidenceIdx];
  const technician = people.find((p) => p.name === schedule.operator);
  const assignedTools = tools.filter((t) => schedule.toolIds?.includes(t.id));
  const missingSkills =
    protocol.requiredSkillIds?.filter((id) => !technician?.skillIds.includes(id)) || [];
  const deviations = consumptions.filter(isConsumptionDeviation);
  const previousExecution = executions
    .filter((execution) => execution.scheduleId === scheduleId)
    .sort((a, b) => (b.revision ?? 1) - (a.revision ?? 1))[0];

  const start = () => {
    startRef.current = demoNow().toISOString();
    resourceCheckInRef.current = undefined;
    setPhase("resources");
  };

  const confirmResources = () => {
    const checkedInAt = advanceDemoClock(2).toISOString();
    resourceCheckInRef.current = checkedInAt;
    setTools(tools.map((t) => (schedule.toolIds?.includes(t.id) ? { ...t, status: "InUse" } : t)));
    setReservations(
      reservations.map((r) =>
        r.scheduleId === scheduleId && r.status === "Reserved" ? { ...r, status: "InUse" } : r,
      ),
    );
    setSchedules(schedules.map((s) => (s.id === scheduleId ? { ...s, status: "InProgress" } : s)));
    setNotifications([
      {
        id: `n-start-${Date.now()}`,
        type: "ExecutionStarted",
        channel: "Push",
        actor: schedule.operator,
        recipientRole: "supervisor",
        recipient: protocol.supervisors[0] ?? "Roberto Salas",
        source: "Automatic",
        event: "Inicio de ejecución",
        message: `${schedule.workOrder}: ${schedule.operator} inició ${protocol.name}.`,
        status: "Sent",
        createdAt: checkedInAt,
      },
      ...notifications,
    ]);
    setPhase(evidences_cfg.length ? "evidence" : "form");
    message.success("Recursos entregados · cronómetro y trazabilidad activos");
  };

  const captureEvidence = (data: string, extra?: Partial<EvidenceRecord>) => {
    const location = evidences.find((evidence) => evidence.type === "GPS")?.gps;
    const capturedAt =
      extra?.timestamp ?? advanceDemoClock(current.type === "Photo" ? 4 : 2).toISOString();
    const ev: EvidenceRecord = {
      id: `ev${Date.now()}`,
      executionId: "pending",
      type: current.type,
      data,
      timestamp: capturedAt,
      status: "Pending",
      label: current.label,
      phase: current.phase,
      gps: current.type === "Photo" ? location : undefined,
      ...extra,
    };
    setEvidences([...evidences, ev]);
    if (current.type === "Photo" && current.aiValidation) {
      setNotifications([
        {
          id: `n-ai-${Date.now()}`,
          type: "EvidenceAnalyzed",
          channel: "Push",
          actor: "Operational Excellence Engine",
          recipientRole: "operator",
          recipient: schedule.operator,
          source: "Automatic",
          event: "Validación visual simulada",
          message: `${schedule.workOrder}: evidencia procesada en la simulación con ${ev.aiScore ?? 86}% de coincidencia.`,
          status: "Sent",
          createdAt: advanceDemoClock(1).toISOString(),
        },
        ...notifications,
      ]);
    }
    if (evidenceIdx + 1 < evidences_cfg.length) setEvidenceIdx(evidenceIdx + 1);
    else setPhase("form");
  };

  const skipEvidence = () => {
    if (current.required) {
      message.warning("Evidencia obligatoria");
      return;
    }
    if (evidenceIdx + 1 < evidences_cfg.length) setEvidenceIdx(evidenceIdx + 1);
    else setPhase("form");
  };

  const submit = () => {
    const id = `e${Date.now()}`;
    const completedAt = advanceDemoClock(3).toISOString();
    const photo = evidences.find((e) => e.type === "Photo");
    const processScore = Math.max(70, 96 - deviations.length * 8);
    const score = photo?.aiScore
      ? Math.round(processScore * 0.5 + photo.aiScore * 0.35 + (photo.humanScore ?? 4) * 20 * 0.15)
      : processScore;
    const exec: Execution = {
      id,
      scheduleId,
      protocolId: protocol.id,
      startAt: startRef.current,
      endAt: completedAt,
      operator: schedule.operator,
      status: protocol.requiresValidation ? "PendingValidation" : "Completed",
      evidences: evidences.map((e) => ({ ...e, executionId: id, status: "Pending" })),
      formAnswers: answers,
      score,
      humanScore: photo?.humanScore,
      toolIds: schedule.toolIds || [],
      materialConsumptions: consumptions,
      resourceCheckInAt: resourceCheckInRef.current,
      workConcepts,
      revision: (previousExecution?.revision ?? 0) + 1,
      previousExecutionId: previousExecution?.id,
    };
    setExecutions([exec, ...executions]);
    setSchedules(schedules.map((s) => (s.id === scheduleId ? { ...s, status: "Completed" } : s)));
    setTools(
      tools.map((t) => (schedule.toolIds?.includes(t.id) ? { ...t, status: "Available" } : t)),
    );
    setReservations(
      reservations.map((r) => (r.scheduleId === scheduleId ? { ...r, status: "Released" } : r)),
    );
    setInventory(
      inventory.map((item) => {
        const consumption = consumptions.find((c) => c.inventoryItemId === item.id);
        if (!consumption) return item;
        return {
          ...item,
          onHand: Math.max(0, item.onHand - (consumption.actualQuantity || 0)),
          reserved: Math.max(0, item.reserved - consumption.reservedQuantity),
        };
      }),
    );
    if (deviations.length)
      setIncidents([
        {
          id: `i${Date.now()}`,
          executionId: id,
          scheduleId,
          protocolId: protocol.id,
          type: "Escalated",
          status: "Review",
          description: `${deviations.length} consumo(s) fuera del rango configurado; requiere revisión del supervisor.`,
          createdAt: completedAt,
          assetId: schedule.assetId,
          priority: protocol.priority,
          owner: protocol.supervisors[0] ?? "Supervisión de mantenimiento",
        },
        ...incidents,
      ]);
    const updates: Notification[] = [
      {
        id: `n-submit-${Date.now()}-sup`,
        type: protocol.requiresValidation ? "ValidationRequired" : "Completed",
        channel: "Push",
        actor: schedule.operator,
        recipientRole: "supervisor",
        recipient: protocol.supervisors[0] ?? "Roberto Salas",
        source: "Automatic",
        event: protocol.requiresValidation ? "Validación requerida" : "Ejecución completada",
        message: `${schedule.workOrder} enviada con calificación automática de ${score}%.`,
        status: "Sent",
        createdAt: completedAt,
      },
      {
        id: `n-submit-${Date.now()}-admin`,
        type: "Completed",
        channel: "System",
        actor: "Business Commitment Engine",
        recipientRole: "admin",
        recipient: "Coordinación de mantenimiento",
        source: "Automatic",
        event: "Compromiso atendido",
        message: `${schedule.workOrder}: evidencia completa, recursos liberados y resultado registrado.`,
        status: "Sent",
        createdAt: completedAt,
      },
    ];
    setNotifications([...updates, ...notifications]);
    setPhase("done");
    message.success("Ejecución enviada");
  };

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onClose}
        style={{ marginBottom: 8 }}
      >
        Volver
      </Button>

      {phase === "intro" && (
        <Card>
          <Tag color="purple">{protocol.category}</Tag>
          <Typography.Title level={3} style={{ marginTop: 8 }}>
            {protocol.name}
          </Typography.Title>
          <Typography.Paragraph type="secondary">{protocol.description}</Typography.Paragraph>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Orden">{schedule.workOrder}</Descriptions.Item>
            <Descriptions.Item label="Activo">{asset?.name}</Descriptions.Item>
            <Descriptions.Item label="Ubicación">
              {asset?.plant} · {asset?.area}
            </Descriptions.Item>
            <Descriptions.Item label="Duración estimada">
              {protocol.estimatedMinutes || 45} min
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <Typography.Text strong>Hora programada:</Typography.Text> {schedule.hour}
          <br />
          <Typography.Text strong>Tolerancia:</Typography.Text> {schedule.tolerance} min
          <br />
          <Typography.Text strong>Supervisor:</Typography.Text> {protocol.supervisors.join(", ")}
          <Divider>Recursos reservados</Divider>
          <Space wrap style={{ marginBottom: 12 }}>
            <Tag
              icon={<SafetyCertificateOutlined />}
              color={missingSkills.length ? "red" : "green"}
            >
              {missingSkills.length ? "Elegibilidad pendiente" : "Técnico habilitado"}
            </Tag>
            <Tag icon={<ToolOutlined />} color="purple">
              {assignedTools.length} herramientas
            </Tag>
            <Tag icon={<DatabaseOutlined />} color="blue">
              {consumptions.length} materiales
            </Tag>
          </Space>
          <Alert
            type="warning"
            showIcon
            message="Antes de comenzar"
            description={
              protocol.safetyInstructions?.join(" · ") ||
              "Confirma condiciones seguras de intervención."
            }
          />
          <Divider>Requerimientos</Divider>
          <Space wrap>
            {evidences_cfg.map((e, i) => (
              <Tag key={i} color={e.required ? "red" : "default"}>
                {e.type}
                {e.required ? " *" : ""}
              </Tag>
            ))}
          </Space>
          <Divider />
          <Button type="primary" size="large" block onClick={start}>
            Comenzar ejecución
          </Button>
        </Card>
      )}

      {phase === "resources" && (
        <Card title="Entrega y verificación de recursos">
          <Alert
            type={missingSkills.length ? "error" : "success"}
            showIcon
            message={
              missingSkills.length
                ? "Técnico no habilitado"
                : `${technician?.name} · elegibilidad validada`
            }
            description={
              missingSkills.length
                ? `Faltan: ${missingSkills.map((id) => seedSkills.find((s) => s.id === id)?.name).join(", ")}`
                : `Skills: ${(protocol.requiredSkillIds || []).map((id) => seedSkills.find((s) => s.id === id)?.name).join(" · ")}`
            }
          />
          <Divider>Herramientas asignadas</Divider>
          <List
            size="small"
            dataSource={assignedTools}
            locale={{ emptyText: "Sin herramientas requeridas" }}
            renderItem={(tool) => (
              <List.Item extra={<Tag color="green">Entregada</Tag>}>
                <List.Item.Meta
                  avatar={<ToolOutlined />}
                  title={tool.name}
                  description={`Serie ${tool.serial} · ${tool.location}`}
                />
              </List.Item>
            )}
          />
          <Divider>Materiales reservados</Divider>
          <List
            size="small"
            dataSource={consumptions}
            locale={{ emptyText: "Sin consumibles requeridos" }}
            renderItem={(allocation) => {
              const item = inventory.find((i) => i.id === allocation.inventoryItemId);
              return (
                <List.Item
                  extra={
                    <Tag color="blue">
                      {allocation.reservedQuantity} {item?.unit}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    avatar={<DatabaseOutlined />}
                    title={item?.name || allocation.inventoryItemId}
                    description={`${item?.sku} · lote disponible en ${item?.warehouse}`}
                  />
                </List.Item>
              );
            }}
          />
          <Divider />
          <Button
            type="primary"
            size="large"
            block
            disabled={missingSkills.length > 0}
            onClick={confirmResources}
          >
            Confirmar entrega e iniciar
          </Button>
        </Card>
      )}

      {phase === "evidence" && current && (
        <Card>
          <Steps
            className="evidence-steps"
            size="small"
            current={evidenceIdx}
            responsive={false}
            items={evidences_cfg.map((e) => ({ title: evidenceStepTitle(e) }))}
          />
          <Divider />
          <EvidenceCapture
            key={`${evidenceIdx}-${current.type}`}
            evidence={current}
            includeGps={evidences_cfg.some((evidence) => evidence.type === "GPS")}
            onCapture={captureEvidence}
          />
          <Divider />
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button onClick={skipEvidence} disabled={current.required}>
              {current.required ? "Obligatoria" : "Omitir"}
            </Button>
            <Typography.Text type="secondary">
              {evidenceIdx + 1} / {evidences_cfg.length}
            </Typography.Text>
          </Space>
        </Card>
      )}

      {phase === "form" && (
        <Card title="Formulario">
          <DynamicForm fields={protocol.formConfig} values={answers} onChange={setAnswers} />
          <Divider />
          <Button
            type="primary"
            block
            size="large"
            onClick={() =>
              setPhase(
                workConcepts.length ? "concepts" : consumptions.length ? "consumption" : "confirm",
              )
            }
            disabled={!isFormValid(protocol.formConfig, answers)}
          >
            Continuar
          </Button>
        </Card>
      )}

      {phase === "concepts" && (
        <Card title="Conceptos ejecutados">
          <Typography.Paragraph type="secondary">
            Confirma los trabajos realizados y sus cantidades. Este escenario no registra precios.
          </Typography.Paragraph>
          <List
            dataSource={workConcepts}
            renderItem={(concept) => (
              <List.Item>
                <Space style={{ width: "100%", justifyContent: "space-between" }} align="center">
                  <div>
                    <Tag>{concept.code}</Tag>
                    <Typography.Text strong>{concept.description}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary">Unidad: {concept.unit}</Typography.Text>
                  </div>
                  <InputNumber
                    min={0}
                    value={concept.quantity}
                    addonAfter={concept.unit}
                    onChange={(quantity) =>
                      setWorkConcepts(
                        workConcepts.map((item) =>
                          item.code === concept.code
                            ? { ...item, quantity: Number(quantity) || 0 }
                            : item,
                        ),
                      )
                    }
                  />
                </Space>
              </List.Item>
            )}
          />
          <Alert
            type="info"
            showIcon
            message="Cantidades operativas · sin precios"
            style={{ marginTop: 12 }}
          />
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              size="large"
              block
              disabled={workConcepts.some((concept) => concept.quantity <= 0)}
              onClick={() => setPhase(consumptions.length ? "consumption" : "confirm")}
            >
              Continuar a materiales
            </Button>
            <Button block onClick={() => setPhase("form")}>
              Volver al formulario
            </Button>
          </Space>
        </Card>
      )}

      {phase === "consumption" && (
        <Card title="Consumo real de materiales">
          <Typography.Paragraph type="secondary">
            Registra lo utilizado. El sistema comparará el consumo real contra la cantidad exacta o
            el rango permitido.
          </Typography.Paragraph>
          <List
            dataSource={consumptions}
            renderItem={(allocation) => {
              const item = inventory.find((i) => i.id === allocation.inventoryItemId);
              const deviation = isConsumptionDeviation(allocation);
              const rule =
                allocation.mode === "Exact"
                  ? `Exacto: ${allocation.quantity}`
                  : `Permitido: ${allocation.min ?? 0}–${allocation.max ?? "sin límite"}`;
              return (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <div>
                        <b>{item?.name}</b>
                        <br />
                        <Typography.Text type="secondary">
                          {rule} {item?.unit}
                        </Typography.Text>
                      </div>
                      <InputNumber
                        min={0}
                        value={allocation.actualQuantity}
                        addonAfter={item?.unit}
                        status={deviation ? "warning" : undefined}
                        onChange={(value) =>
                          setConsumptions(
                            consumptions.map((c) =>
                              c.inventoryItemId === allocation.inventoryItemId
                                ? { ...c, actualQuantity: Number(value) || 0 }
                                : c,
                            ),
                          )
                        }
                      />
                    </Space>
                    {deviation && (
                      <Alert
                        type="warning"
                        showIcon
                        message="Fuera del estándar · se generará una desviación"
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
          <Divider />
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button type="primary" size="large" block onClick={() => setPhase("confirm")}>
              Continuar al cierre
            </Button>
            <Button block onClick={() => setPhase("form")}>
              Volver al formulario
            </Button>
          </Space>
        </Card>
      )}

      {phase === "confirm" && (
        <Card title="Confirmación">
          <Typography.Paragraph>
            <b>Inicio:</b> {dayjs(startRef.current).format("HH:mm:ss")}
            <br />
            <b>Fin:</b> {demoNow().format("HH:mm:ss")}
            <br />
            <b>Duración:</b> {demoNow().diff(dayjs(startRef.current), "minute")} min
            <br />
            <b>Evidencias:</b> {evidences.length} / {evidences_cfg.length}
            <br />
            <b>Campos respondidos:</b> {Object.keys(answers).length}
            <br />
            <b>Herramientas por liberar:</b> {assignedTools.length}
            <br />
            <b>Consumos registrados:</b> {consumptions.length}{" "}
            {deviations.length ? `· ${deviations.length} con desviación` : "· dentro de estándar"}
            <br />
            <b>Conceptos ejecutados:</b> {workConcepts.length} · sin precios
          </Typography.Paragraph>
          {protocol.requiresValidation && (
            <Alert
              type="info"
              message="Requiere validación de supervisor"
              style={{ marginBottom: 12 }}
            />
          )}
          <Space style={{ width: "100%" }} direction="vertical">
            <Button type="primary" block size="large" onClick={submit}>
              Confirmar y enviar
            </Button>
            <Button
              block
              onClick={() =>
                setPhase(
                  consumptions.length ? "consumption" : workConcepts.length ? "concepts" : "form",
                )
              }
            >
              Volver a editar
            </Button>
          </Space>
        </Card>
      )}

      {phase === "done" && (
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: "#7B35C1" }} />}
          title="¡Ejecución enviada!"
          subTitle={
            protocol.requiresValidation ? "Pendiente de validación por supervisor" : "Completada"
          }
          extra={
            <Space direction="vertical" style={{ width: "100%" }}>
              <Alert
                type="success"
                showIcon
                message="Automatizaciones ejecutadas"
                description="Push simulado para supervisión · evento registrado para administración · resultado disponible en el historial."
              />
              <Button type="primary" onClick={onClose}>
                Volver
              </Button>
            </Space>
          }
        />
      )}
    </div>
  );
}

function EvidenceCapture({
  evidence,
  includeGps,
  onCapture,
}: {
  evidence: EvidenceConfig;
  includeGps: boolean;
  onCapture: (data: string, extra?: Partial<EvidenceRecord>) => void;
}) {
  const { type, qrCode } = evidence;
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [humanScore, setHumanScore] = useState(0);
  const [operatorComment, setOperatorComment] = useState("");
  const [sigPoints, setSigPoints] = useState<{ x: number; y: number }[]>([]);
  const [qrInput, setQrInput] = useState("");
  const [gpsOk] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturedPhotoUrl = maintenanceAssetUrl(evidence.captureData) ?? maintenanceCapturedUrl;
  const referencePhotoUrl = maintenanceAssetUrl(evidence.referenceData) ?? maintenanceReferenceUrl;
  const simulatedGps = { lat: 25.6866, lng: -100.3161 };

  const takePhoto = () => {
    setCapturedAt(advanceDemoClock(4).toISOString());
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setPreview(capturedPhotoUrl);
      if (evidence.aiValidation) {
        setAnalyzing(true);
        setTimeout(() => {
          setAnalyzing(false);
          setAiScore(86);
        }, 1200);
      }
    }, 380);
  };

  const retake = () => {
    setPreview(null);
    setCapturedAt(null);
    setAiScore(null);
    setHumanScore(0);
    setOperatorComment("");
  };

  if (type === "Photo") {
    return (
      <div>
        <div className="photo-manifest-heading">
          <div>
            <Typography.Text type="secondary">TOMA SOLICITADA POR EL PROTOCOLO</Typography.Text>
            <Typography.Title level={4}>
              {evidence.label ?? "Evidencia fotográfica"}
            </Typography.Title>
          </div>
          {evidence.phase && <Tag color="blue">{evidencePhaseLabel(evidence.phase)}</Tag>}
        </div>
        <Alert
          type="info"
          showIcon
          message="Compara antes de capturar"
          description={
            evidence.guidance ??
            "La imagen patrón define encuadre, componentes visibles y condición esperada."
          }
          style={{ marginBottom: 12 }}
        />
        <div className="photo-reference">
          <div className="evidence-image-label">
            <span>1</span> Referencia del sistema
          </div>
          <Image
            preview={false}
            src={referencePhotoUrl}
            alt={`Referencia de inspección de ${maintenanceSubjectLabel}`}
          />
          <Typography.Text type="secondary">
            {evidence.guidance ?? maintenanceEvidenceGuidance}
          </Typography.Text>
        </div>

        <Divider>Captura del operador</Divider>
        <div className={`camera-stage ${flash ? "is-flashing" : ""}`} aria-live="polite">
          {preview ? (
            <img src={preview} alt="Evidencia capturada por el operador" />
          ) : (
            <div className="camera-ready">
              <CameraOutlined />
              <b>{maintenanceSubjectLabel} en cuadro</b>
              <span>Alinea la toma con la referencia</span>
            </div>
          )}
          {flash && <div className="camera-flash" />}
          {preview && includeGps && (
            <EvidenceGpsStamp
              gps={simulatedGps}
              timestamp={capturedAt ?? demoNow().toISOString()}
              compact
            />
          )}
          {!preview && (
            <div className="camera-reticle">
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {!preview ? (
          <Button type="primary" icon={<CameraOutlined />} block size="large" onClick={takePhoto}>
            Tomar fotografía
          </Button>
        ) : (
          <>
            {evidence.aiValidation ? (
              <Card size="small" style={{ marginTop: 12, background: "#faf7ff" }}>
                {analyzing ? (
                  <Space>
                    <Spin size="small" />
                    <Typography.Text strong>
                      Validación visual simulada contra el estándar…
                    </Typography.Text>
                  </Space>
                ) : (
                  <>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Space>
                        <RobotOutlined style={{ color: "#7B35C1" }} />
                        <b>Resultado visual simulado</b>
                      </Space>
                      <Typography.Title level={3} style={{ margin: 0, color: "#7B35C1" }}>
                        {aiScore}%
                      </Typography.Title>
                    </Space>
                    <Progress percent={aiScore ?? 0} strokeColor="#7B35C1" />
                    <Space wrap>
                      {maintenanceAiFindings.map((finding, index) => (
                        <Tag key={finding} color={index === 0 ? "green" : "orange"}>
                          {finding}
                        </Tag>
                      ))}
                    </Space>
                  </>
                )}
              </Card>
            ) : (
              <Alert
                type="success"
                showIcon
                message="Evidencia capturada"
                description="La fotografía quedará disponible para la validación humana del supervisor."
                style={{ marginTop: 12 }}
              />
            )}

            {!analyzing && (evidence.aiValidation ? Boolean(aiScore) : evidence.humanRating) && (
              <Card size="small" title="Tu evaluación" style={{ marginTop: 12 }}>
                <Typography.Paragraph type="secondary">
                  {evidence.aiValidation
                    ? "Califica la condición observada; tu criterio se combina con la IA y las reglas del protocolo."
                    : "Califica la condición observada para complementar la revisión del supervisor."}
                </Typography.Paragraph>
                <Rate value={humanScore} onChange={setHumanScore} />
                <Input.TextArea
                  rows={2}
                  value={operatorComment}
                  onChange={(event) => setOperatorComment(event.target.value)}
                  placeholder="Observación del técnico"
                  style={{ marginTop: 10 }}
                />
              </Card>
            )}

            <Space style={{ width: "100%", marginTop: 12 }}>
              <Button onClick={retake}>Retomar</Button>
              <Button
                type="primary"
                disabled={
                  analyzing ||
                  (Boolean(evidence.aiValidation) && !aiScore) ||
                  (Boolean(evidence.humanRating) && humanScore === 0)
                }
                onClick={() =>
                  onCapture(preview, {
                    referenceData: referencePhotoUrl,
                    timestamp: capturedAt ?? undefined,
                    gps: includeGps ? simulatedGps : undefined,
                    label: evidence.label,
                    phase: evidence.phase,
                    aiScore: evidence.aiValidation ? (aiScore ?? undefined) : undefined,
                    humanScore: evidence.humanRating ? humanScore : undefined,
                    aiFindings: evidence.aiValidation ? maintenanceAiFindings : undefined,
                    operatorComment:
                      operatorComment ||
                      (evidence.aiValidation ? maintenanceDefaultOperatorComment : undefined),
                  })
                }
              >
                Confirmar evidencia
              </Button>
            </Space>
          </>
        )}
      </div>
    );
  }

  if (type === "Video" || type === "File") {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            background: preview ? "linear-gradient(135deg, #e8ddf6, #f4effa)" : "#f0f0f0",
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: "column",
            gap: 8,
          }}
        >
          <CameraOutlined style={{ fontSize: 56, color: preview ? "#7B35C1" : "#999" }} />
          {preview && <Typography.Text strong>Evidencia capturada</Typography.Text>}
        </div>
        {!preview ? (
          <Button
            type="primary"
            icon={<CameraOutlined />}
            block
            size="large"
            onClick={() => setPreview(`${type.toLowerCase()}://industrial-equipment`)}
          >
            Capturar {type.toLowerCase()}
          </Button>
        ) : (
          <Space style={{ width: "100%" }}>
            <Button onClick={() => setPreview(null)}>Retomar</Button>
            <Button type="primary" onClick={() => onCapture(preview)}>
              Confirmar
            </Button>
          </Space>
        )}
      </div>
    );
  }

  if (type === "Signature") {
    const handle = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      const c = canvasRef.current!;
      const rect = c.getBoundingClientRect();
      const ctx = c.getContext("2d")!;
      const point = "touches" in e ? e.touches[0] : e;
      const x = point.clientX - rect.left;
      const y = point.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
      setSigPoints([...sigPoints, { x, y }]);
    };
    const startDraw = () => {
      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.beginPath();
      ctx.strokeStyle = "#7B35C1";
      ctx.lineWidth = 2;
    };
    return (
      <div>
        <Typography.Text type="secondary">Firma del operador</Typography.Text>
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          style={{
            background: "#fff",
            border: "2px dashed #d9d9d9",
            borderRadius: 8,
            width: "100%",
            touchAction: "none",
            marginTop: 8,
          }}
          onMouseDown={startDraw}
          onMouseMove={(e) => e.buttons === 1 && handle(e)}
          onTouchStart={startDraw}
          onTouchMove={handle}
        />
        <Space style={{ marginTop: 12, width: "100%" }}>
          <Button
            onClick={() => {
              const c = canvasRef.current!;
              c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
              setSigPoints([]);
            }}
          >
            Limpiar
          </Button>
          <Button
            type="primary"
            disabled={sigPoints.length < 5}
            onClick={() => onCapture("signature://captured")}
          >
            Confirmar firma
          </Button>
        </Space>
      </div>
    );
  }

  if (type === "GPS") {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            height: 200,
            background: "linear-gradient(135deg, #e6f7ff, #bae7ff)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            marginBottom: 12,
            position: "relative",
          }}
        >
          <EnvironmentOutlined style={{ fontSize: 48, color: "#7B35C1" }} />
          <Typography.Text strong>25.6866° N, 100.3161° W</Typography.Text>
          <Tag color={gpsOk ? "green" : "red"}>
            {gpsOk ? "Ubicación simulada coincide" : "Fuera de rango"}
          </Tag>
        </div>
        <Button
          type="primary"
          block
          size="large"
          icon={<EnvironmentOutlined />}
          onClick={() => onCapture("25.6866,-100.3161", { gps: { lat: 25.6866, lng: -100.3161 } })}
        >
          Confirmar ubicación
        </Button>
      </div>
    );
  }

  if (type === "QR") {
    return (
      <div>
        <div
          style={{
            height: 200,
            background: "#000",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <QrcodeOutlined style={{ fontSize: 80, color: "#7B35C1" }} />
        </div>
        <Input
          placeholder={qrCode ? `Escanea: ${qrCode}` : "Código QR"}
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
        />
        <Button
          type="primary"
          block
          size="large"
          style={{ marginTop: 12 }}
          onClick={() => {
            if (qrCode && qrInput !== qrCode) {
              message.error("QR no coincide");
              return;
            }
            onCapture(qrInput || "QR-MOCK");
          }}
        >
          Confirmar
        </Button>
      </div>
    );
  }

  if (type === "Timestamp") {
    return (
      <div style={{ textAlign: "center" }}>
        <Typography.Title level={2}>{demoNow().format("HH:mm:ss")}</Typography.Title>
        <Typography.Text type="secondary">{demoNow().format("DD MMM YYYY")}</Typography.Text>
        <Button
          type="primary"
          block
          size="large"
          style={{ marginTop: 16 }}
          onClick={() => {
            const timestamp = advanceDemoClock(2).toISOString();
            onCapture(timestamp, { timestamp });
          }}
        >
          Registrar timestamp
        </Button>
      </div>
    );
  }

  return null;
}

function evidenceStepTitle(evidence: EvidenceConfig) {
  if (evidence.type === "Photo") {
    if (evidence.phase === "Pre-intervention") return "Antes";
    if (evidence.phase === "Intervention") return "Durante";
    if (evidence.phase === "Post-intervention") return "Final";
  }
  const labels: Record<EvidenceConfig["type"], string> = {
    Photo: "Foto",
    Video: "Video",
    Signature: "Firma",
    GPS: "GPS",
    QR: "QR",
    Timestamp: "Hora",
    File: "Archivo",
  };
  return labels[evidence.type];
}

function evidencePhaseLabel(phase: NonNullable<EvidenceConfig["phase"]>) {
  const labels = {
    "Pre-intervention": "Antes",
    Intervention: "Durante",
    "Post-intervention": "Resultado final",
  };
  return labels[phase];
}

function DynamicForm({
  fields,
  values,
  onChange,
}: {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const set = (id: string, v: unknown) => onChange({ ...values, [id]: v });
  const filled = fields.filter(
    (f) =>
      f.type !== "separator" &&
      (!f.required || (values[f.id] !== undefined && values[f.id] !== "")),
  ).length;
  const total = fields.filter((f) => f.type !== "separator").length;
  return (
    <>
      <Progress
        percent={total ? Math.round((filled / total) * 100) : 100}
        strokeColor="#7B35C1"
        style={{ marginBottom: 12 }}
      />
      <Form layout="vertical">
        {fields.map((f) => {
          if (f.type === "separator") return <Divider key={f.id}>{f.label}</Divider>;
          return (
            <Form.Item key={f.id} label={f.label} required={f.required}>
              {f.type === "text" && (
                <Input value={values[f.id] as string} onChange={(e) => set(f.id, e.target.value)} />
              )}
              {(f.type === "textarea" || f.type === "comment") && (
                <Input.TextArea
                  rows={2}
                  value={values[f.id] as string}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              )}
              {f.type === "number" && (
                <InputNumber
                  style={{ width: "100%" }}
                  value={values[f.id] as number}
                  onChange={(v) => set(f.id, v)}
                />
              )}
              {f.type === "yesno" && (
                <Radio.Group value={values[f.id]} onChange={(e) => set(f.id, e.target.value)}>
                  <Radio value={true}>Sí</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              )}
              {f.type === "select" && (
                <Select
                  value={values[f.id]}
                  onChange={(v) => set(f.id, v)}
                  options={(f.options || []).map((o) => ({ label: o, value: o }))}
                />
              )}
              {f.type === "multiselect" && (
                <Select
                  mode="multiple"
                  value={values[f.id] as string[]}
                  onChange={(v) => set(f.id, v)}
                  options={(f.options || []).map((o) => ({ label: o, value: o }))}
                />
              )}
              {f.type === "rating" && (
                <Rate value={values[f.id] as number} onChange={(v) => set(f.id, v)} />
              )}
              {f.type === "date" && (
                <Input
                  type="date"
                  value={values[f.id] as string}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              )}
            </Form.Item>
          );
        })}
      </Form>
    </>
  );
}
