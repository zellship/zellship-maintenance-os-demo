import { useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Avatar,
  Card,
  Steps,
  Form,
  Image,
  Input,
  Select,
  Button,
  Space,
  Radio,
  Progress,
  InputNumber,
  Switch,
  Checkbox,
  List,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  message,
  TimePicker,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "../store";
import { branches, categories, operators, supervisors, seedAssets, seedSkills } from "../seed";
import type {
  Protocol,
  EvidenceConfig,
  FormField,
  EvidenceType,
  MaterialRequirement,
} from "../types";
import { maintenanceReferenceUrl } from "../shared/maintenanceAssets";

const EVIDENCE_TYPES: EvidenceType[] = [
  "Photo",
  "Video",
  "Signature",
  "GPS",
  "Timestamp",
  "QR",
  "File",
];
const FIELD_TYPES: { value: FormField["type"]; label: string }[] = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "yesno", label: "Sí/No" },
  { value: "select", label: "Select único" },
  { value: "multiselect", label: "Select múltiple" },
  { value: "rating", label: "Rating" },
  { value: "comment", label: "Comentario" },
  { value: "date", label: "Fecha" },
  { value: "separator", label: "Separador" },
];

type StepProps = {
  data: Partial<Protocol>;
  update: (patch: Partial<Protocol>) => void;
};

type ProtocolSchedule = Protocol["schedule"][number];

export function ProtocolWizard({ onDone }: { onDone: () => void }) {
  const { protocols, setProtocols } = useStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Protocol>>({
    name: "",
    description: "",
    category: "Preventivo",
    priority: "Medium",
    branches: ["Planta Monterrey"],
    recurrence: "Monthly",
    activationMode: "Recurring",
    triggerEvent: "Cada 30 días o 500 horas de operación",
    schedule: [{ hour: "10:00", tolerance: 20 }],
    evidenceConfig: [
      { type: "GPS", required: true, radius: 80 },
      {
        type: "Photo",
        required: true,
        minCount: 1,
        referenceData: "photo://reference-standard",
        aiValidation: true,
        humanRating: true,
      },
      { type: "Signature", required: true },
    ],
    formConfig: [],
    supervisors: ["Roberto Salas"],
    operators: ["Ana Torres"],
    channels: ["System"],
    assetIds: ["AC-01"],
    materials: [],
    safetyInstructions: ["Aplicar bloqueo LOTO"],
    estimatedMinutes: 45,
    allowRescheduling: true,
    requiredSkillIds: ["sk-loto"],
    requiredToolIds: [],
    materialRequirements: [],
    preAlertMinutes: 15,
    requiresValidation: true,
    status: "Draft",
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
      activationMode: data.activationMode ?? "Recurring",
      triggerEvent: data.triggerEvent,
      assetIds: data.assetIds || [],
      materials: data.materials || [],
      safetyInstructions: data.safetyInstructions || [],
      estimatedMinutes: data.estimatedMinutes || 45,
      allowRescheduling: data.allowRescheduling ?? true,
      requiredSkillIds: data.requiredSkillIds || [],
      requiredToolIds: data.requiredToolIds || [],
      materialRequirements: data.materialRequirements || [],
    };
    setProtocols([p, ...protocols]);
    message.success(status === "Active" ? "Protocolo publicado" : "Borrador guardado");
    onDone();
  };

  return (
    <div className="protocol-wizard-page">
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Nuevo Protocolo
      </Typography.Title>
      <Card className="protocol-wizard-card">
        <Steps
          className="protocol-wizard-steps"
          current={step}
          onChange={setStep}
          items={[
            { title: "Información" },
            { title: "Programación" },
            { title: "Evidencias" },
            { title: "Formulario" },
            { title: "Contexto y asignación" },
          ]}
        />
        <Divider />
        {step === 0 && <Step1 data={data} update={update} />}
        {step === 1 && <Step2 data={data} update={update} />}
        {step === 2 && <Step3 data={data} update={update} />}
        {step === 3 && <Step4 data={data} update={update} />}
        {step === 4 && <Step5 data={data} update={update} />}

        <Divider />
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            Atrás
          </Button>
          <Space>
            <Button onClick={() => save("Draft")}>Guardar borrador</Button>
            {step < 4 ? (
              <Button type="primary" onClick={() => setStep(step + 1)}>
                Siguiente
              </Button>
            ) : (
              <Button type="primary" onClick={() => save("Active")}>
                Publicar
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </div>
  );
}

function Step1({ data, update }: StepProps) {
  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Nombre">
            <Input
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Mantenimiento preventivo de compresor"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Categoría">
            <Select
              value={data.category}
              onChange={(v) => update({ category: v })}
              options={categories.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Prioridad">
            <Select
              value={data.priority}
              onChange={(v) => update({ priority: v })}
              options={["Low", "Medium", "High", "Critical"].map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item label="Descripción">
            <Input.TextArea
              rows={3}
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item label="Plantas">
            <Select
              mode="multiple"
              value={data.branches}
              onChange={(v) => update({ branches: v })}
              options={branches.map((c) => ({ label: c, value: c }))}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

function Step2({ data, update }: StepProps) {
  const addSchedule = () =>
    update({ schedule: [...(data.schedule || []), { hour: "09:00", tolerance: 15 }] });
  const removeSchedule = (i: number) =>
    update({ schedule: (data.schedule || []).filter((_, idx: number) => idx !== i) });
  return (
    <Form layout="vertical">
      <Form.Item label="Modo de activación">
        <Radio.Group
          value={data.activationMode}
          onChange={(event) => update({ activationMode: event.target.value })}
        >
          <Radio.Button value="Recurring">Recurrente</Radio.Button>
          <Radio.Button value="Triggered">Por trigger</Radio.Button>
          <Radio.Button value="OnDemand">Asignación directa</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          data.activationMode === "Triggered"
            ? "El sistema creará la orden cuando se cumpla la condición."
            : data.activationMode === "OnDemand"
              ? "El protocolo quedará disponible para asignarse al momento."
              : "El sistema generará órdenes conforme a la recurrencia configurada."
        }
      />
      {data.activationMode === "Recurring" && (
        <Form.Item label="Frecuencia">
          <Radio.Group
            value={data.recurrence}
            onChange={(e) => update({ recurrence: e.target.value })}
          >
            {["Daily", "Weekly", "Monthly", "Custom"].map((r) => (
              <Radio key={r} value={r}>
                {r}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      )}
      {data.activationMode === "Triggered" && (
        <Form.Item label="Evento o condición detonadora">
          <Input
            value={data.triggerEvent}
            onChange={(event) => update({ triggerEvent: event.target.value })}
            placeholder="Ej. Vibración > 4.5 mm/s, ticket crítico o cierre de otro protocolo"
          />
        </Form.Item>
      )}
      {data.activationMode === "OnDemand" && (
        <Form.Item label="Contexto de asignación">
          <Input
            value={data.triggerEvent}
            onChange={(event) => update({ triggerEvent: event.target.value })}
            placeholder="Ej. Solicitud directa del supervisor o hallazgo en recorrido"
          />
        </Form.Item>
      )}
      <Form.Item label="Horarios">
        <Space direction="vertical" style={{ width: "100%" }}>
          {(data.schedule || []).map((s: ProtocolSchedule, i: number) => (
            <Space key={i}>
              <TimePicker
                format="HH:mm"
                value={dayjs(s.hour, "HH:mm")}
                onChange={(v) => {
                  const arr = [...(data.schedule || [])];
                  arr[i] = { ...arr[i], hour: v?.format("HH:mm") || "08:00" };
                  update({ schedule: arr });
                }}
              />
              <InputNumber
                min={0}
                max={120}
                addonAfter="min tolerancia"
                value={s.tolerance}
                onChange={(v) => {
                  const arr = [...(data.schedule || [])];
                  arr[i] = { ...arr[i], tolerance: Number(v) || 0 };
                  update({ schedule: arr });
                }}
              />
              <Button icon={<DeleteOutlined />} danger onClick={() => removeSchedule(i)} />
            </Space>
          ))}
          <Button icon={<PlusOutlined />} onClick={addSchedule}>
            Agregar horario
          </Button>
        </Space>
      </Form.Item>
      <Form.Item>
        <Space>
          <Switch
            checked={data.allowRescheduling}
            onChange={(v) => update({ allowRescheduling: v })}
          />{" "}
          Permitir reprogramación
        </Space>
      </Form.Item>
    </Form>
  );
}

function Step3({ data, update }: StepProps) {
  const toggle = (t: EvidenceType, required: boolean) => {
    const exists = (data.evidenceConfig || []).find((e: EvidenceConfig) => e.type === t);
    if (exists)
      update({
        evidenceConfig: (data.evidenceConfig || []).filter((e: EvidenceConfig) => e.type !== t),
      });
    else update({ evidenceConfig: [...(data.evidenceConfig || []), { type: t, required }] });
  };
  const setField = (t: EvidenceType, patch: Partial<EvidenceConfig>) => {
    update({
      evidenceConfig: (data.evidenceConfig || []).map((e: EvidenceConfig) =>
        e.type === t ? { ...e, ...patch } : e,
      ),
    });
  };
  const photo = (data.evidenceConfig || []).find((e: EvidenceConfig) => e.type === "Photo");
  return (
    <>
      <List
        dataSource={EVIDENCE_TYPES}
        renderItem={(t) => {
          const e = (data.evidenceConfig || []).find((x: EvidenceConfig) => x.type === t);
          return (
            <List.Item>
              <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
                <Space>
                  <Checkbox checked={!!e} onChange={(ev) => toggle(t, ev.target.checked)}>
                    {t}
                  </Checkbox>
                  {e && (
                    <Radio.Group
                      size="small"
                      value={e.required ? "req" : "opt"}
                      onChange={(ev) => setField(t, { required: ev.target.value === "req" })}
                    >
                      <Radio.Button value="req">Obligatoria</Radio.Button>
                      <Radio.Button value="opt">Opcional</Radio.Button>
                    </Radio.Group>
                  )}
                </Space>
                {e && t === "Photo" && (
                  <InputNumber
                    min={1}
                    max={10}
                    addonBefore="Mín. fotos"
                    value={e.minCount ?? 1}
                    onChange={(v) => setField(t, { minCount: Number(v) || 1 })}
                  />
                )}
                {e && t === "GPS" && (
                  <InputNumber
                    min={5}
                    max={500}
                    addonAfter="m radio"
                    value={e.radius ?? 50}
                    onChange={(v) => setField(t, { radius: Number(v) || 50 })}
                  />
                )}
                {e && t === "QR" && (
                  <Input
                    style={{ width: 200 }}
                    placeholder="Código esperado"
                    value={e.qrCode}
                    onChange={(ev) => setField(t, { qrCode: ev.target.value })}
                  />
                )}
              </Space>
            </List.Item>
          );
        }}
      />
      {photo && (
        <Card
          size="small"
          title="Estándar visual y evaluación"
          style={{ marginTop: 16, background: "#faf7ff" }}
        >
          <Row gutter={[16, 12]} align="middle">
            <Col xs={24} md={8}>
              <Image
                src={maintenanceReferenceUrl}
                alt="Imagen patrón configurada"
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} md={16}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <span>Comparar evidencia con imagen patrón</span>
                  <Switch
                    checked={photo.aiValidation ?? true}
                    onChange={(checked) =>
                      setField("Photo", {
                        aiValidation: checked,
                        referenceData: checked ? "photo://reference-standard" : undefined,
                      })
                    }
                  />
                </Space>
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <span>Solicitar calificación del operador</span>
                  <Switch
                    checked={photo.humanRating ?? true}
                    onChange={(checked) => setField("Photo", { humanRating: checked })}
                  />
                </Space>
                <Button
                  onClick={() =>
                    message.success("Imagen patrón AC-01 configurada como testigo visual")
                  }
                >
                  Cambiar imagen patrón
                </Button>
                <Typography.Text type="secondary">
                  La IA simulará coincidencia, hallazgos y score; el criterio humano quedará trazado
                  por separado.
                </Typography.Text>
              </Space>
            </Col>
          </Row>
        </Card>
      )}
    </>
  );
}

function Step4({ data, update }: StepProps) {
  const addField = (type: FormField["type"]) =>
    update({
      formConfig: [
        ...(data.formConfig || []),
        { id: `f${Date.now()}`, type, label: `Campo ${type}`, required: false },
      ],
    });
  const updateField = (id: string, patch: Partial<FormField>) =>
    update({
      formConfig: (data.formConfig || []).map((f: FormField) =>
        f.id === id ? { ...f, ...patch } : f,
      ),
    });
  const removeField = (id: string) =>
    update({ formConfig: (data.formConfig || []).filter((f: FormField) => f.id !== id) });
  return (
    <Row gutter={16}>
      <Col xs={24} md={14}>
        <Card title="Campos">
          <Space wrap style={{ marginBottom: 12 }}>
            {FIELD_TYPES.map((t) => (
              <Button key={t.value} size="small" onClick={() => addField(t.value)}>
                + {t.label}
              </Button>
            ))}
          </Space>
          <List
            dataSource={data.formConfig || []}
            locale={{ emptyText: "Agrega campos al formulario" }}
            renderItem={(f: FormField) => (
              <List.Item
                actions={[
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    type="text"
                    onClick={() => removeField(f.id)}
                  />,
                ]}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space>
                    <Tag color="purple">{f.type}</Tag>
                    <Input
                      size="small"
                      value={f.label}
                      onChange={(e) => updateField(f.id, { label: e.target.value })}
                      style={{ width: 240 }}
                    />
                    <Checkbox
                      checked={f.required}
                      onChange={(e) => updateField(f.id, { required: e.target.checked })}
                    >
                      Obligatorio
                    </Checkbox>
                  </Space>
                  {(f.type === "select" || f.type === "multiselect") && (
                    <Select
                      mode="tags"
                      placeholder="Opciones"
                      value={f.options || []}
                      onChange={(v) => updateField(f.id, { options: v })}
                      style={{ width: "100%" }}
                    />
                  )}
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
    <Form layout="vertical" disabled>
      {fields.map((f) => {
        if (f.type === "separator") return <Divider key={f.id}>{f.label}</Divider>;
        return (
          <Form.Item key={f.id} label={f.label} required={f.required}>
            {f.type === "text" && <Input />}
            {f.type === "textarea" && <Input.TextArea rows={2} />}
            {f.type === "comment" && <Input.TextArea rows={2} />}
            {f.type === "number" && <InputNumber style={{ width: "100%" }} />}
            {f.type === "yesno" && (
              <Radio.Group>
                <Radio value="y">Sí</Radio>
                <Radio value="n">No</Radio>
              </Radio.Group>
            )}
            {f.type === "select" && (
              <Select options={(f.options || []).map((o) => ({ label: o, value: o }))} />
            )}
            {f.type === "multiselect" && (
              <Select
                mode="multiple"
                options={(f.options || []).map((o) => ({ label: o, value: o }))}
              />
            )}
            {f.type === "rating" && (
              <Select options={[1, 2, 3, 4, 5].map((n) => ({ label: "⭐".repeat(n), value: n }))} />
            )}
            {f.type === "date" && <Input placeholder="YYYY-MM-DD" />}
          </Form.Item>
        );
      })}
    </Form>
  );
}

function Step5({ data, update }: StepProps) {
  const { tools, inventory } = useStore();
  const materialIds = (data.materialRequirements || []).map(
    (m: MaterialRequirement) => m.inventoryItemId,
  );
  const setMaterials = (ids: string[]) => {
    const current = data.materialRequirements || [];
    update({
      materialRequirements: ids.map(
        (id) =>
          current.find((m: MaterialRequirement) => m.inventoryItemId === id) || {
            inventoryItemId: id,
            mode: "Exact",
            quantity: 1,
          },
      ),
    });
  };
  const updateMaterial = (id: string, patch: Partial<MaterialRequirement>) =>
    update({
      materialRequirements: (data.materialRequirements || []).map((m: MaterialRequirement) =>
        m.inventoryItemId === id ? { ...m, ...patch } : m,
      ),
    });
  const readinessChecks = [
    Boolean(data.assetIds?.length),
    Boolean(data.requiredSkillIds?.length),
    Boolean(data.requiredToolIds?.length),
    Boolean(data.operators?.length),
    Boolean(data.supervisors?.length),
    Boolean(data.channels?.length),
  ];
  const readiness = Math.round(
    (readinessChecks.filter(Boolean).length / readinessChecks.length) * 100,
  );

  return (
    <Form layout="vertical" className="protocol-context-step">
      <Row gutter={[20, 20]} align="top">
        <Col xs={24} xl={17}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              className="protocol-config-section"
              title={
                <WizardSectionTitle
                  icon={<DeploymentUnitOutlined />}
                  title="Contexto operacional"
                  description="Define sobre qué activos aplica y cuánto tiempo requiere."
                />
              }
              extra={<Tag color="purple">Alcance</Tag>}
            >
              <Row gutter={[16, 4]}>
                <Col xs={24} lg={16}>
                  <Form.Item label="Activos aplicables">
                    <Select
                      mode="multiple"
                      value={data.assetIds}
                      onChange={(value) => update({ assetIds: value })}
                      placeholder="Seleccionar activos"
                      options={seedAssets.map((asset) => ({
                        label: `${asset.id} · ${asset.name}`,
                        value: asset.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8}>
                  <Form.Item label="Duración estimada">
                    <InputNumber
                      min={5}
                      max={480}
                      addonAfter="min"
                      value={data.estimatedMinutes}
                      onChange={(value) => update({ estimatedMinutes: Number(value) || 45 })}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              className="protocol-config-section"
              title={
                <WizardSectionTitle
                  icon={<SafetyCertificateOutlined />}
                  title="Capacidades y equipos"
                  description="Determina elegibilidad técnica y disponibilidad de herramientas."
                />
              }
              extra={
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Validación automática
                </Tag>
              }
            >
              <Row gutter={[16, 4]}>
                <Col xs={24} lg={12}>
                  <Form.Item label="Skills y certificaciones requeridas">
                    <Select
                      mode="multiple"
                      value={data.requiredSkillIds}
                      onChange={(value) => update({ requiredSkillIds: value })}
                      placeholder="Agregar skills habilitantes"
                      options={seedSkills.map((skill) => ({
                        label: skill.name,
                        value: skill.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item label="Equipos y herramientas requeridas">
                    <Select
                      mode="multiple"
                      value={data.requiredToolIds}
                      onChange={(value) => update({ requiredToolIds: value })}
                      placeholder="Agregar equipos requeridos"
                      options={tools.map((tool) => ({
                        label: `${tool.name} · ${tool.serial}`,
                        value: tool.id,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Alert
                type="info"
                showIcon
                message="El sistema bloqueará asignaciones cuando el técnico no tenga los skills o el equipo esté reservado."
              />
            </Card>

            <Card
              className="protocol-config-section"
              title={
                <WizardSectionTitle
                  icon={<DatabaseOutlined />}
                  title="Consumibles y materiales"
                  description="Configura disponibilidad y política de consumo por material."
                />
              }
              extra={<Tag>{materialIds.length} seleccionados</Tag>}
            >
              <Form.Item label="Materiales requeridos">
                <Select
                  mode="multiple"
                  value={materialIds}
                  onChange={setMaterials}
                  placeholder="Buscar por nombre o SKU"
                  options={inventory.map((item) => ({
                    label: `${item.sku} · ${item.name} · ${item.onHand - item.reserved - item.quarantine} ${item.unit} disponibles`,
                    value: item.id,
                  }))}
                />
              </Form.Item>

              {!!materialIds.length && (
                <div className="material-requirements-table">
                  <div className="material-requirements-head">
                    <span>Material</span>
                    <span>Política de consumo</span>
                    <span>Cantidad</span>
                    <span>Disponible</span>
                    <span />
                  </div>
                  {(data.materialRequirements || []).map((requirement: MaterialRequirement) => {
                    const item = inventory.find(
                      (inventoryItem) => inventoryItem.id === requirement.inventoryItemId,
                    );
                    const available = item ? item.onHand - item.reserved - item.quarantine : 0;
                    return (
                      <div className="material-requirement-row" key={requirement.inventoryItemId}>
                        <div className="material-cell-name">
                          <Avatar size={34} icon={<DatabaseOutlined />} />
                          <div>
                            <b>{item?.name}</b>
                            <Typography.Text type="secondary">
                              {item?.sku} · {item?.unit}
                            </Typography.Text>
                          </div>
                        </div>
                        <Select
                          value={requirement.mode}
                          onChange={(mode) => updateMaterial(requirement.inventoryItemId, { mode })}
                          options={["Exact", "Range", "Variable"].map((value) => ({
                            value,
                            label:
                              value === "Exact"
                                ? "Consumo exacto"
                                : value === "Range"
                                  ? "Rango permitido"
                                  : "Captura variable",
                          }))}
                        />
                        <div>
                          {requirement.mode === "Exact" ? (
                            <InputNumber
                              min={0}
                              value={requirement.quantity}
                              addonAfter={item?.unit}
                              style={{ width: "100%" }}
                              onChange={(quantity) =>
                                updateMaterial(requirement.inventoryItemId, {
                                  quantity: Number(quantity) || 0,
                                })
                              }
                            />
                          ) : (
                            <Space.Compact style={{ width: "100%" }}>
                              <InputNumber
                                min={0}
                                placeholder="Mín."
                                value={requirement.min}
                                onChange={(min) =>
                                  updateMaterial(requirement.inventoryItemId, {
                                    min: Number(min) || 0,
                                  })
                                }
                              />
                              <InputNumber
                                min={0}
                                placeholder="Máx."
                                value={requirement.max}
                                onChange={(max) =>
                                  updateMaterial(requirement.inventoryItemId, {
                                    max: Number(max) || 0,
                                  })
                                }
                              />
                            </Space.Compact>
                          )}
                        </div>
                        <Tag color={available > (item?.reorderPoint ?? 0) ? "green" : "orange"}>
                          {available} {item?.unit}
                        </Tag>
                        <Button
                          type="text"
                          danger
                          aria-label={`Retirar ${item?.name}`}
                          icon={<DeleteOutlined />}
                          onClick={() =>
                            setMaterials(
                              materialIds.filter(
                                (materialId) => materialId !== requirement.inventoryItemId,
                              ),
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card
              className="protocol-config-section"
              title={
                <WizardSectionTitle
                  icon={<TeamOutlined />}
                  title="Responsables, seguridad y alertas"
                  description="Define quién ejecuta, quién valida y cómo se notifican excepciones."
                />
              }
            >
              <Row gutter={[16, 4]}>
                <Col xs={24} lg={12}>
                  <Form.Item label="Responsables (operadores)">
                    <Select
                      mode="multiple"
                      value={data.operators}
                      onChange={(value) => update({ operators: value })}
                      options={operators.map((operator) => ({
                        label: operator,
                        value: operator,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item label="Supervisores">
                    <Select
                      mode="multiple"
                      value={data.supervisors}
                      onChange={(value) => update({ supervisors: value })}
                      options={supervisors.map((supervisor) => ({
                        label: supervisor,
                        value: supervisor,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Condiciones de seguridad">
                    <Select
                      mode="tags"
                      value={data.safetyInstructions}
                      onChange={(value) => update({ safetyInstructions: value })}
                      placeholder="Ej. Aplicar bloqueo LOTO"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="protocol-alert-policy">
                <div>
                  <Typography.Text strong>Canales transaccionales</Typography.Text>
                  <Typography.Text type="secondary">
                    Se usarán para asignaciones, recordatorios y escalaciones.
                  </Typography.Text>
                  <Checkbox.Group
                    className="protocol-channel-grid"
                    value={data.channels}
                    onChange={(value) => update({ channels: value })}
                  >
                    {["System", "Push", "WhatsApp", "SMS"].map((channel) => (
                      <Checkbox value={channel} key={channel}>
                        <BellOutlined /> {channel}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </div>
                <div className="protocol-policy-controls">
                  <div>
                    <Typography.Text strong>Alerta previa</Typography.Text>
                    <InputNumber
                      min={0}
                      max={120}
                      addonAfter="min"
                      value={data.preAlertMinutes}
                      onChange={(value) => update({ preAlertMinutes: Number(value) || 0 })}
                    />
                  </div>
                  <div className="protocol-validation-switch">
                    <Switch
                      checked={data.requiresValidation}
                      onChange={(value) => update({ requiresValidation: value })}
                    />
                    <div>
                      <Typography.Text strong>Validación de supervisor</Typography.Text>
                      <Typography.Text type="secondary">
                        Requerida antes de liberar el resultado.
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Space>
        </Col>

        <Col xs={24} xl={7}>
          <div className="protocol-summary-sticky">
            <Card className="protocol-summary-card">
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <div>
                  <Typography.Text type="secondary">PREPARACIÓN</Typography.Text>
                  <Typography.Title level={4} style={{ margin: "2px 0 0" }}>
                    Listo para publicar
                  </Typography.Title>
                </div>
                <Progress type="circle" size={58} percent={readiness} strokeColor="#7B35C1" />
              </Space>

              <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                Revisa el alcance, recursos y política de ejecución antes de publicar.
              </Typography.Paragraph>

              <div className="protocol-summary-metrics">
                <SummaryMetric
                  icon={<DeploymentUnitOutlined />}
                  value={String(data.assetIds?.length ?? 0)}
                  label="Activos"
                />
                <SummaryMetric
                  icon={<ClockCircleOutlined />}
                  value={`${data.estimatedMinutes ?? 45}m`}
                  label="Duración"
                />
                <SummaryMetric
                  icon={<ToolOutlined />}
                  value={String(
                    (data.requiredSkillIds?.length ?? 0) + (data.requiredToolIds?.length ?? 0),
                  )}
                  label="Recursos"
                />
              </div>

              <Divider />
              <SummaryRow label="Protocolo" value={data.name || "Sin nombre"} />
              <SummaryRow
                label="Activación"
                value={`${data.activationMode ?? "Recurring"} · ${data.recurrence ?? "Monthly"}`}
              />
              <SummaryRow label="Trigger" value={data.triggerEvent || "Asignación desde módulo"} />
              <SummaryRow
                label="Evidencias"
                value={
                  (data.evidenceConfig || [])
                    .map((evidence: EvidenceConfig) => evidence.type)
                    .join(", ") || "Sin configurar"
                }
              />
              <SummaryRow
                label="Formulario"
                value={`${data.formConfig?.length ?? 0} campos dinámicos`}
              />
              <SummaryRow
                label="Materiales"
                value={`${data.materialRequirements?.length ?? 0} configurados`}
              />
              <SummaryRow
                label="Responsables"
                value={data.operators?.join(", ") || "Sin asignar"}
              />
              <SummaryRow
                label="Supervisión"
                value={data.supervisors?.join(", ") || "Sin asignar"}
              />

              <Alert
                type={readiness === 100 ? "success" : "warning"}
                showIcon
                style={{ marginTop: 14 }}
                message={
                  readiness === 100
                    ? "Configuración operativamente completa"
                    : "Hay campos recomendados pendientes"
                }
              />
            </Card>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

function WizardSectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Space align="start">
      <span className="protocol-section-icon">{icon}</span>
      <div>
        <Typography.Text strong>{title}</Typography.Text>
        <Typography.Text type="secondary" className="protocol-section-description">
          {description}
        </Typography.Text>
      </div>
    </Space>
  );
}

function SummaryMetric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div>
      <span>{icon}</span>
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="protocol-summary-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
