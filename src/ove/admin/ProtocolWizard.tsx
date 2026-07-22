import { useState } from "react";
import { Card, Steps, Form, Input, Select, Button, Space, Radio, InputNumber, Switch, Checkbox, List, Tag, Typography, Row, Col, Divider, message, TimePicker } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { branches, categories, operators, supervisors, seedAssets } from "../seed";
import type { Protocol, EvidenceConfig, FormField, EvidenceType } from "../types";

const EVIDENCE_TYPES: EvidenceType[] = ["Photo", "Video", "Signature", "GPS", "Timestamp", "QR", "File"];
const FIELD_TYPES: { value: FormField["type"]; label: string }[] = [
  { value: "text", label: "Texto" }, { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" }, { value: "yesno", label: "Sí/No" },
  { value: "select", label: "Select único" }, { value: "multiselect", label: "Select múltiple" },
  { value: "rating", label: "Rating" }, { value: "comment", label: "Comentario" },
  { value: "date", label: "Fecha" }, { value: "separator", label: "Separador" },
];

export function ProtocolWizard({ onDone }: { onDone: () => void }) {
  const { protocols, setProtocols } = useStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Protocol>>({
    name: "", description: "", category: "Preventivo", priority: "Medium",
    branches: ["Planta Monterrey"], recurrence: "Monthly", schedule: [{ hour: "10:00", tolerance: 20 }],
    evidenceConfig: [{ type: "GPS", required: true, radius: 80 }, { type: "Photo", required: true, minCount: 1 }, { type: "Signature", required: true }],
    formConfig: [], supervisors: ["Roberto Salas"], operators: ["Ana Torres"], channels: ["System"],
    assetIds: ["AC-01"], materials: [], safetyInstructions: ["Aplicar bloqueo LOTO"], estimatedMinutes: 45,
    preAlertMinutes: 15, requiresValidation: true, status: "Draft",
  });

  const update = (patch: Partial<Protocol>) => setData((d) => ({ ...d, ...patch }));

  const save = (status: Protocol["status"]) => {
    const p: Protocol = {
      id: `p${Date.now()}`,
      name: data.name || "Sin nombre",
      description: data.description || "",
      category: data.category || "Otro",
      priority: data.priority || "Medium",
      status,
      branches: data.branches || [],
      recurrence: data.recurrence || "Daily",
      schedule: data.schedule || [],
      evidenceConfig: data.evidenceConfig || [],
      formConfig: data.formConfig || [],
      supervisors: data.supervisors || [],
      operators: data.operators || [],
      channels: data.channels || ["System"],
      preAlertMinutes: data.preAlertMinutes ?? 15,
      requiresValidation: data.requiresValidation ?? true,
      assetIds: data.assetIds || [],
      materials: data.materials || [],
      safetyInstructions: data.safetyInstructions || [],
      estimatedMinutes: data.estimatedMinutes || 45,
    };
    setProtocols([p, ...protocols]);
    message.success(status === "Active" ? "Protocolo publicado" : "Borrador guardado");
    onDone();
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Nuevo Protocolo</Typography.Title>
      <Card>
        <Steps current={step} onChange={setStep} items={[
          { title: "Información" }, { title: "Programación" }, { title: "Evidencias" },
          { title: "Formulario" }, { title: "Contexto y asignación" },
        ]} />
        <Divider />
        {step === 0 && <Step1 data={data} update={update} />}
        {step === 1 && <Step2 data={data} update={update} />}
        {step === 2 && <Step3 data={data} update={update} />}
        {step === 3 && <Step4 data={data} update={update} />}
        {step === 4 && <Step5 data={data} update={update} />}

        <Divider />
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Atrás</Button>
          <Space>
            <Button onClick={() => save("Draft")}>Guardar borrador</Button>
            {step < 4
              ? <Button type="primary" onClick={() => setStep(step + 1)}>Siguiente</Button>
              : <Button type="primary" onClick={() => save("Active")}>Publicar</Button>}
          </Space>
        </Space>
      </Card>
    </div>
  );
}

function Step1({ data, update }: any) {
  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}><Form.Item label="Nombre"><Input value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="Mantenimiento preventivo de compresor" /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item label="Categoría"><Select value={data.category} onChange={(v) => update({ category: v })} options={categories.map(c => ({ label: c, value: c }))} /></Form.Item></Col>
        <Col xs={24} md={6}><Form.Item label="Prioridad"><Select value={data.priority} onChange={(v) => update({ priority: v })} options={["Low", "Medium", "High", "Critical"].map(c => ({ label: c, value: c }))} /></Form.Item></Col>
        <Col xs={24}><Form.Item label="Descripción"><Input.TextArea rows={3} value={data.description} onChange={(e) => update({ description: e.target.value })} /></Form.Item></Col>
        <Col xs={24}><Form.Item label="Plantas"><Select mode="multiple" value={data.branches} onChange={(v) => update({ branches: v })} options={branches.map(c => ({ label: c, value: c }))} /></Form.Item></Col>
      </Row>
    </Form>
  );
}

function Step2({ data, update }: any) {
  const addSchedule = () => update({ schedule: [...(data.schedule || []), { hour: "09:00", tolerance: 15 }] });
  const removeSchedule = (i: number) => update({ schedule: data.schedule.filter((_: any, idx: number) => idx !== i) });
  return (
    <Form layout="vertical">
      <Form.Item label="Tipo">
        <Radio.Group value={data.recurrence === "Once" ? "once" : "rec"} onChange={(e) => update({ recurrence: e.target.value === "once" ? "Once" : "Daily" })}>
          <Radio value="once">Única</Radio>
          <Radio value="rec">Recurrente</Radio>
        </Radio.Group>
      </Form.Item>
      {data.recurrence !== "Once" && (
        <Form.Item label="Frecuencia">
          <Radio.Group value={data.recurrence} onChange={(e) => update({ recurrence: e.target.value })}>
            {["Daily", "Weekly", "Monthly", "Custom"].map(r => <Radio key={r} value={r}>{r}</Radio>)}
          </Radio.Group>
        </Form.Item>
      )}
      <Form.Item label="Horarios">
        <Space direction="vertical" style={{ width: "100%" }}>
          {(data.schedule || []).map((s: any, i: number) => (
            <Space key={i}>
              <TimePicker format="HH:mm" value={dayjs(s.hour, "HH:mm")} onChange={(v) => {
                const arr = [...data.schedule]; arr[i] = { ...arr[i], hour: v?.format("HH:mm") || "08:00" }; update({ schedule: arr });
              }} />
              <InputNumber min={0} max={120} addonAfter="min tolerancia" value={s.tolerance} onChange={(v) => {
                const arr = [...data.schedule]; arr[i] = { ...arr[i], tolerance: Number(v) || 0 }; update({ schedule: arr });
              }} />
              <Button icon={<DeleteOutlined />} danger onClick={() => removeSchedule(i)} />
            </Space>
          ))}
          <Button icon={<PlusOutlined />} onClick={addSchedule}>Agregar horario</Button>
        </Space>
      </Form.Item>
      <Form.Item><Space><Switch defaultChecked /> Permitir reprogramación</Space></Form.Item>
    </Form>
  );
}

function Step3({ data, update }: any) {
  const toggle = (t: EvidenceType, required: boolean) => {
    const exists = (data.evidenceConfig || []).find((e: EvidenceConfig) => e.type === t);
    if (exists) update({ evidenceConfig: data.evidenceConfig.filter((e: EvidenceConfig) => e.type !== t) });
    else update({ evidenceConfig: [...(data.evidenceConfig || []), { type: t, required }] });
  };
  const setField = (t: EvidenceType, patch: Partial<EvidenceConfig>) => {
    update({ evidenceConfig: data.evidenceConfig.map((e: EvidenceConfig) => e.type === t ? { ...e, ...patch } : e) });
  };
  return (
    <List
      dataSource={EVIDENCE_TYPES}
      renderItem={(t) => {
        const e = (data.evidenceConfig || []).find((x: EvidenceConfig) => x.type === t);
        return (
          <List.Item>
            <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
              <Space>
                <Checkbox checked={!!e} onChange={(ev) => toggle(t, ev.target.checked)}>{t}</Checkbox>
                {e && <Radio.Group size="small" value={e.required ? "req" : "opt"} onChange={(ev) => setField(t, { required: ev.target.value === "req" })}>
                  <Radio.Button value="req">Obligatoria</Radio.Button>
                  <Radio.Button value="opt">Opcional</Radio.Button>
                </Radio.Group>}
              </Space>
              {e && t === "Photo" && <InputNumber min={1} max={10} addonBefore="Mín. fotos" value={e.minCount ?? 1} onChange={(v) => setField(t, { minCount: Number(v) || 1 })} />}
              {e && t === "GPS" && <InputNumber min={5} max={500} addonAfter="m radio" value={e.radius ?? 50} onChange={(v) => setField(t, { radius: Number(v) || 50 })} />}
              {e && t === "QR" && <Input style={{ width: 200 }} placeholder="Código esperado" value={e.qrCode} onChange={(ev) => setField(t, { qrCode: ev.target.value })} />}
            </Space>
          </List.Item>
        );
      }}
    />
  );
}

function Step4({ data, update }: any) {
  const addField = (type: FormField["type"]) => update({ formConfig: [...(data.formConfig || []), { id: `f${Date.now()}`, type, label: `Campo ${type}`, required: false }] });
  const updateField = (id: string, patch: Partial<FormField>) => update({ formConfig: data.formConfig.map((f: FormField) => f.id === id ? { ...f, ...patch } : f) });
  const removeField = (id: string) => update({ formConfig: data.formConfig.filter((f: FormField) => f.id !== id) });
  return (
    <Row gutter={16}>
      <Col xs={24} md={14}>
        <Card title="Campos">
          <Space wrap style={{ marginBottom: 12 }}>
            {FIELD_TYPES.map(t => <Button key={t.value} size="small" onClick={() => addField(t.value)}>+ {t.label}</Button>)}
          </Space>
          <List
            dataSource={data.formConfig || []}
            locale={{ emptyText: "Agrega campos al formulario" }}
            renderItem={(f: FormField) => (
              <List.Item actions={[<Button danger icon={<DeleteOutlined />} type="text" onClick={() => removeField(f.id)} />]}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space>
                    <Tag color="purple">{f.type}</Tag>
                    <Input size="small" value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} style={{ width: 240 }} />
                    <Checkbox checked={f.required} onChange={(e) => updateField(f.id, { required: e.target.checked })}>Obligatorio</Checkbox>
                  </Space>
                  {(f.type === "select" || f.type === "multiselect") &&
                    <Select mode="tags" placeholder="Opciones" value={f.options || []} onChange={(v) => updateField(f.id, { options: v })} style={{ width: "100%" }} />}
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col xs={24} md={10}>
        <Card title="Vista previa">
          <FormPreview fields={data.formConfig || []} />
        </Card>
      </Col>
    </Row>
  );
}

function FormPreview({ fields }: { fields: FormField[] }) {
  if (!fields.length) return <Typography.Text type="secondary">Sin campos aún</Typography.Text>;
  return (
    <Form layout="vertical">
      {fields.map(f => {
        if (f.type === "separator") return <Divider key={f.id}>{f.label}</Divider>;
        return (
          <Form.Item key={f.id} label={f.label} required={f.required}>
            {f.type === "text" && <Input />}
            {f.type === "textarea" && <Input.TextArea rows={2} />}
            {f.type === "comment" && <Input.TextArea rows={2} />}
            {f.type === "number" && <InputNumber style={{ width: "100%" }} />}
            {f.type === "yesno" && <Radio.Group><Radio value="y">Sí</Radio><Radio value="n">No</Radio></Radio.Group>}
            {f.type === "select" && <Select options={(f.options || []).map(o => ({ label: o, value: o }))} />}
            {f.type === "multiselect" && <Select mode="multiple" options={(f.options || []).map(o => ({ label: o, value: o }))} />}
            {f.type === "rating" && <Select options={[1,2,3,4,5].map(n => ({ label: "⭐".repeat(n), value: n }))} />}
            {f.type === "date" && <Input placeholder="YYYY-MM-DD" />}
          </Form.Item>
        );
      })}
    </Form>
  );
}

function Step5({ data, update }: any) {
  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}><Form.Item label="Activos aplicables"><Select mode="multiple" value={data.assetIds} onChange={(v) => update({ assetIds: v })} options={seedAssets.map(a => ({ label: `${a.id} · ${a.name}`, value: a.id }))} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Duración estimada"><InputNumber min={5} max={480} addonAfter="min" value={data.estimatedMinutes} onChange={(v) => update({ estimatedMinutes: Number(v) || 45 })} style={{ width: "100%" }} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Materiales y herramientas"><Select mode="tags" value={data.materials} onChange={(v) => update({ materials: v })} placeholder="Ej. Filtro AF-20 · 1 pza" /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Condiciones de seguridad"><Select mode="tags" value={data.safetyInstructions} onChange={(v) => update({ safetyInstructions: v })} placeholder="Ej. Aplicar bloqueo LOTO" /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Responsables (operadores)"><Select mode="multiple" value={data.operators} onChange={(v) => update({ operators: v })} options={operators.map(c => ({ label: c, value: c }))} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Supervisores"><Select mode="multiple" value={data.supervisors} onChange={(v) => update({ supervisors: v })} options={supervisors.map(c => ({ label: c, value: c }))} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Canales de alerta"><Checkbox.Group value={data.channels} onChange={(v) => update({ channels: v })} options={["System", "WhatsApp", "SMS"]} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Alerta previa (minutos)"><InputNumber min={0} max={120} value={data.preAlertMinutes} onChange={(v) => update({ preAlertMinutes: Number(v) || 0 })} /></Form.Item></Col>
        <Col xs={24}><Form.Item><Space><Switch checked={data.requiresValidation} onChange={(v) => update({ requiresValidation: v })} /> Requiere validación de supervisor</Space></Form.Item></Col>
      </Row>
      <Divider>Resumen</Divider>
      <Typography.Paragraph>
        <b>{data.name || "—"}</b> · {data.category} · {data.recurrence}<br />
        Horarios: {(data.schedule || []).map((s: any) => s.hour).join(", ") || "—"}<br />
        Evidencias: {(data.evidenceConfig || []).map((e: any) => e.type).join(", ") || "—"}<br />
        Campos formulario: {(data.formConfig || []).length}<br />
        Activos: {(data.assetIds || []).join(", ") || "—"} · Duración estimada: {data.estimatedMinutes || 45} min<br />
        Materiales: {(data.materials || []).join(", ") || "—"}<br />
        Operadores: {(data.operators || []).join(", ") || "—"} · Supervisores: {(data.supervisors || []).join(", ") || "—"}
      </Typography.Paragraph>
    </Form>
  );
}
