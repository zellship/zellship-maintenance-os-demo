import { useRef, useState } from "react";
import { Card, Typography, Button, Space, Steps, Tag, Form, Input, Select, InputNumber, Radio, Rate, Progress, Alert, message, Result, Divider, Descriptions } from "antd";
import { ArrowLeftOutlined, CameraOutlined, EnvironmentOutlined, EditOutlined, QrcodeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import type { EvidenceType, FormField, Execution, EvidenceRecord } from "../types";
import { seedAssets } from "../seed";

export function ExecutionFlow({ scheduleId, onClose }: { scheduleId: string; onClose: () => void }) {
  const { schedules, protocols, executions, setExecutions, setSchedules } = useStore();
  const schedule = schedules.find(s => s.id === scheduleId);
  const protocol = protocols.find(p => p.id === schedule?.protocolId);
  const asset = seedAssets.find(a => a.id === schedule?.assetId);
  const [phase, setPhase] = useState<"intro" | "evidence" | "form" | "confirm" | "done">("intro");
  const [evidenceIdx, setEvidenceIdx] = useState(0);
  const [evidences, setEvidences] = useState<EvidenceRecord[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const startRef = useRef<string>(dayjs().toISOString());

  if (!schedule || !protocol) return <Result status="error" title="No encontrado" extra={<Button onClick={onClose}>Volver</Button>} />;

  const evidences_cfg = protocol.evidenceConfig;
  const current = evidences_cfg[evidenceIdx];

  const start = () => {
    startRef.current = dayjs().toISOString();
    setPhase("evidence");
    message.success("Orden iniciada · cronómetro y trazabilidad activos");
  };

  const captureEvidence = (data: string, extra?: Partial<EvidenceRecord>) => {
    const ev: EvidenceRecord = {
      id: `ev${Date.now()}`,
      executionId: "pending",
      type: current.type,
      data,
      timestamp: dayjs().toISOString(),
      status: "Pending",
      ...extra,
    };
    setEvidences([...evidences, ev]);
    if (evidenceIdx + 1 < evidences_cfg.length) setEvidenceIdx(evidenceIdx + 1);
    else setPhase("form");
  };

  const skipEvidence = () => {
    if (current.required) { message.warning("Evidencia obligatoria"); return; }
    if (evidenceIdx + 1 < evidences_cfg.length) setEvidenceIdx(evidenceIdx + 1);
    else setPhase("form");
  };

  const submit = () => {
    const id = `e${Date.now()}`;
    const exec: Execution = {
      id, scheduleId, protocolId: protocol.id,
      startAt: startRef.current, endAt: dayjs().toISOString(),
      operator: schedule.operator,
      status: protocol.requiresValidation ? "PendingValidation" : "Completed",
      evidences: evidences.map(e => ({ ...e, executionId: id, status: "Pending" })),
      formAnswers: answers,
      score: 94,
    };
    setExecutions([exec, ...executions]);
    setSchedules(schedules.map(s => s.id === scheduleId ? { ...s, status: "Completed" } : s));
    setPhase("done");
    message.success("Ejecución enviada");
  };

  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={onClose} style={{ marginBottom: 8 }}>Volver</Button>

      {phase === "intro" && (
        <Card>
          <Tag color="purple">{protocol.category}</Tag>
          <Typography.Title level={3} style={{ marginTop: 8 }}>{protocol.name}</Typography.Title>
          <Typography.Paragraph type="secondary">{protocol.description}</Typography.Paragraph>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Orden">{schedule.workOrder}</Descriptions.Item>
            <Descriptions.Item label="Activo">{asset?.name}</Descriptions.Item>
            <Descriptions.Item label="Ubicación">{asset?.plant} · {asset?.area}</Descriptions.Item>
            <Descriptions.Item label="Duración estimada">{protocol.estimatedMinutes || 45} min</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Typography.Text strong>Hora programada:</Typography.Text> {schedule.hour}<br />
          <Typography.Text strong>Tolerancia:</Typography.Text> {schedule.tolerance} min<br />
          <Typography.Text strong>Supervisor:</Typography.Text> {protocol.supervisors.join(", ")}
          <Divider>Materiales y seguridad</Divider>
          <Typography.Paragraph>{protocol.materials?.join(" · ") || "Sin materiales requeridos"}</Typography.Paragraph>
          <Alert type="warning" showIcon message="Antes de comenzar" description={protocol.safetyInstructions?.join(" · ") || "Confirma condiciones seguras de intervención."} />
          <Divider>Requerimientos</Divider>
          <Space wrap>
            {evidences_cfg.map((e, i) => <Tag key={i} color={e.required ? "red" : "default"}>{e.type}{e.required ? " *" : ""}</Tag>)}
          </Space>
          <Divider />
          <Button type="primary" size="large" block onClick={start}>Comenzar ejecución</Button>
        </Card>
      )}

      {phase === "evidence" && current && (
        <Card>
          <Steps size="small" current={evidenceIdx} items={evidences_cfg.map(e => ({ title: e.type }))} />
          <Divider />
          <EvidenceCapture type={current.type} qrCode={current.qrCode} onCapture={captureEvidence} />
          <Divider />
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button onClick={skipEvidence} disabled={current.required}>{current.required ? "Obligatoria" : "Omitir"}</Button>
            <Typography.Text type="secondary">{evidenceIdx + 1} / {evidences_cfg.length}</Typography.Text>
          </Space>
        </Card>
      )}

      {phase === "form" && (
        <Card title="Formulario">
          <DynamicForm fields={protocol.formConfig} values={answers} onChange={setAnswers} />
          <Divider />
          <Button type="primary" block size="large" onClick={() => setPhase("confirm")} disabled={!isFormValid(protocol.formConfig, answers)}>
            Continuar
          </Button>
        </Card>
      )}

      {phase === "confirm" && (
        <Card title="Confirmación">
          <Typography.Paragraph>
            <b>Inicio:</b> {dayjs(startRef.current).format("HH:mm:ss")}<br />
            <b>Fin:</b> {dayjs().format("HH:mm:ss")}<br />
            <b>Duración:</b> {dayjs().diff(dayjs(startRef.current), "minute")} min<br />
            <b>Evidencias:</b> {evidences.length} / {evidences_cfg.length}<br />
            <b>Campos respondidos:</b> {Object.keys(answers).length}
          </Typography.Paragraph>
          {protocol.requiresValidation && <Alert type="info" message="Requiere validación de supervisor" style={{ marginBottom: 12 }} />}
          <Space style={{ width: "100%" }} direction="vertical">
            <Button type="primary" block size="large" onClick={submit}>Confirmar y enviar</Button>
            <Button block onClick={() => setPhase("form")}>Volver a editar</Button>
          </Space>
        </Card>
      )}

      {phase === "done" && (
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: "#7B35C1" }} />}
          title="¡Ejecución enviada!"
          subTitle={protocol.requiresValidation ? "Pendiente de validación por supervisor" : "Completada"}
          extra={<Button type="primary" onClick={onClose}>Volver</Button>}
        />
      )}
    </div>
  );
}

function EvidenceCapture({ type, qrCode, onCapture }: { type: EvidenceType; qrCode?: string; onCapture: (data: string, extra?: Partial<EvidenceRecord>) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [sigPoints, setSigPoints] = useState<{ x: number; y: number }[]>([]);
  const [qrInput, setQrInput] = useState("");
  const [gpsOk] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (type === "Photo" || type === "Video" || type === "File") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ background: preview ? "linear-gradient(135deg, #e8ddf6, #f4effa)" : "#f0f0f0", height: 220, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, marginBottom: 12, flexDirection: "column", gap: 8 }}>
          <CameraOutlined style={{ fontSize: 56, color: preview ? "#7B35C1" : "#999" }} />
          {preview && <Typography.Text strong>Evidencia del activo capturada</Typography.Text>}
        </div>
        {!preview ? (
          <Button type="primary" icon={<CameraOutlined />} block size="large" onClick={() => setPreview("photo://industrial-equipment")}>Capturar {type.toLowerCase()}</Button>
        ) : (
          <Space style={{ width: "100%" }}>
            <Button onClick={() => setPreview(null)}>Retomar</Button>
            <Button type="primary" onClick={() => onCapture(preview)}>Confirmar</Button>
          </Space>
        )}
      </div>
    );
  }

  if (type === "Signature") {
    const handle = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const c = canvasRef.current!;
      const rect = c.getBoundingClientRect();
      const ctx = c.getContext("2d")!;
      const point = "touches" in e ? e.touches[0] : e;
      const x = point.clientX - rect.left;
      const y = point.clientY - rect.top;
      ctx.lineTo(x, y); ctx.stroke();
      setSigPoints([...sigPoints, { x, y }]);
    };
    const startDraw = () => { const ctx = canvasRef.current!.getContext("2d")!; ctx.beginPath(); ctx.strokeStyle = "#7B35C1"; ctx.lineWidth = 2; };
    return (
      <div>
        <Typography.Text type="secondary">Firma del operador</Typography.Text>
        <canvas ref={canvasRef} width={400} height={180} style={{ background: "#fff", border: "2px dashed #d9d9d9", borderRadius: 8, width: "100%", touchAction: "none", marginTop: 8 }}
          onMouseDown={startDraw} onMouseMove={(e) => e.buttons === 1 && handle(e)}
          onTouchStart={startDraw} onTouchMove={handle}
        />
        <Space style={{ marginTop: 12, width: "100%" }}>
          <Button onClick={() => { const c = canvasRef.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); setSigPoints([]); }}>Limpiar</Button>
          <Button type="primary" disabled={sigPoints.length < 5} onClick={() => onCapture("signature://captured")}>Confirmar firma</Button>
        </Space>
      </div>
    );
  }

  if (type === "GPS") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ height: 200, background: "linear-gradient(135deg, #e6f7ff, #bae7ff)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", marginBottom: 12, position: "relative" }}>
          <EnvironmentOutlined style={{ fontSize: 48, color: "#7B35C1" }} />
          <Typography.Text strong>25.6866° N, 100.3161° W</Typography.Text>
          <Tag color={gpsOk ? "green" : "red"}>{gpsOk ? "Dentro de rango" : "Fuera de rango"}</Tag>
        </div>
        <Button type="primary" block size="large" icon={<EnvironmentOutlined />} onClick={() => onCapture("25.6866,-100.3161", { gps: { lat: 25.6866, lng: -100.3161 } })}>Confirmar ubicación</Button>
      </div>
    );
  }

  if (type === "QR") {
    return (
      <div>
        <div style={{ height: 200, background: "#000", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
          <QrcodeOutlined style={{ fontSize: 80, color: "#7B35C1" }} />
        </div>
        <Input placeholder={qrCode ? `Escanea: ${qrCode}` : "Código QR"} value={qrInput} onChange={(e) => setQrInput(e.target.value)} />
        <Button type="primary" block size="large" style={{ marginTop: 12 }} onClick={() => {
          if (qrCode && qrInput !== qrCode) { message.error("QR no coincide"); return; }
          onCapture(qrInput || "QR-MOCK");
        }}>Confirmar</Button>
      </div>
    );
  }

  if (type === "Timestamp") {
    return (
      <div style={{ textAlign: "center" }}>
        <Typography.Title level={2}>{dayjs().format("HH:mm:ss")}</Typography.Title>
        <Typography.Text type="secondary">{dayjs().format("DD MMM YYYY")}</Typography.Text>
        <Button type="primary" block size="large" style={{ marginTop: 16 }} onClick={() => onCapture(dayjs().toISOString())}>Registrar timestamp</Button>
      </div>
    );
  }

  return null;
}

function DynamicForm({ fields, values, onChange }: { fields: FormField[]; values: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const set = (id: string, v: unknown) => onChange({ ...values, [id]: v });
  const filled = fields.filter(f => f.type !== "separator" && (!f.required || values[f.id] !== undefined && values[f.id] !== "")).length;
  const total = fields.filter(f => f.type !== "separator").length;
  return (
    <>
      <Progress percent={total ? Math.round((filled / total) * 100) : 100} strokeColor="#7B35C1" style={{ marginBottom: 12 }} />
      <Form layout="vertical">
        {fields.map(f => {
          if (f.type === "separator") return <Divider key={f.id}>{f.label}</Divider>;
          return (
            <Form.Item key={f.id} label={f.label} required={f.required}>
              {f.type === "text" && <Input value={values[f.id] as string} onChange={(e) => set(f.id, e.target.value)} />}
              {(f.type === "textarea" || f.type === "comment") && <Input.TextArea rows={2} value={values[f.id] as string} onChange={(e) => set(f.id, e.target.value)} />}
              {f.type === "number" && <InputNumber style={{ width: "100%" }} value={values[f.id] as number} onChange={(v) => set(f.id, v)} />}
              {f.type === "yesno" && <Radio.Group value={values[f.id]} onChange={(e) => set(f.id, e.target.value)}><Radio value={true}>Sí</Radio><Radio value={false}>No</Radio></Radio.Group>}
              {f.type === "select" && <Select value={values[f.id]} onChange={(v) => set(f.id, v)} options={(f.options || []).map(o => ({ label: o, value: o }))} />}
              {f.type === "multiselect" && <Select mode="multiple" value={values[f.id] as string[]} onChange={(v) => set(f.id, v)} options={(f.options || []).map(o => ({ label: o, value: o }))} />}
              {f.type === "rating" && <Rate value={values[f.id] as number} onChange={(v) => set(f.id, v)} />}
              {f.type === "date" && <Input type="date" value={values[f.id] as string} onChange={(e) => set(f.id, e.target.value)} />}
            </Form.Item>
          );
        })}
      </Form>
    </>
  );
}

function isFormValid(fields: FormField[], values: Record<string, unknown>) {
  return fields.filter(f => f.required && f.type !== "separator").every(f => {
    const v = values[f.id];
    return v !== undefined && v !== null && v !== "";
  });
}
