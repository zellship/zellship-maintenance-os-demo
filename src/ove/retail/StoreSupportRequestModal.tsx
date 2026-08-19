import { useEffect, useMemo } from "react";
import { Alert, Form, Input, Modal, Radio, Select, Space, Switch, Typography, message } from "antd";
import { CameraOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { advanceDemoClock } from "../../demo-config/clock";
import { activeDemo } from "../../demo-config/active";
import { useStore } from "../store";
import { createDirectSupportCase, supportPriorityForImpact } from "../retail-domain";

type Values = {
  category: string;
  assetId?: string;
  sourceAssignmentId?: string;
  symptom: string;
  impact: "critical" | "partial" | "minor";
  photoIncluded: boolean;
};

type Props = {
  open: boolean;
  onCancel: () => void;
  defaultAssignmentId?: string;
  onCreated?: (caseId: string) => void;
};

export function StoreSupportRequestModal({
  open,
  onCancel,
  defaultAssignmentId,
  onCreated,
}: Props) {
  const { storeAssignments, supportCases, setSupportCases, notifications, setNotifications } =
    useStore();
  const [form] = Form.useForm<Values>();
  const assets = activeDemo.data.assets.filter(
    (asset) => asset.plant === activeDemo.context.defaultPlant,
  );
  const assignments = useMemo(
    () =>
      storeAssignments.filter(
        (item) =>
          item.storeLabel === activeDemo.context.defaultPlant &&
          !["Completed", "Validated"].includes(item.status),
      ),
    [storeAssignments],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      category: "Climatización",
      assetId: assets[0]?.id,
      sourceAssignmentId: defaultAssignmentId,
      impact: "partial",
      photoIncluded: true,
      symptom: "",
    });
  }, [assets, defaultAssignmentId, form, open]);

  const submit = async () => {
    const values = await form.validateFields();
    const at = advanceDemoClock(1);
    const priority = supportPriorityForImpact(values.impact);
    const assignment = storeAssignments.find((item) => item.id === values.sourceAssignmentId);
    const supportCase = createDirectSupportCase({
      existing: supportCases,
      storeLabel: activeDemo.context.defaultPlant,
      actor: activeDemo.context.primaryOperator,
      category: values.category,
      symptom: values.symptom,
      impact: values.impact,
      reportedAt: at.toISOString(),
      acknowledgementDueAt: at
        .add(priority === "P1" ? 5 : priority === "P2" ? 15 : 60, "minute")
        .toISOString(),
      resolutionTargetAt: at
        .add(priority === "P1" ? 2 : priority === "P2" ? 4 : 12, "hour")
        .toISOString(),
      assetId: values.assetId,
      sourceAssignment: assignment,
      photoIncluded: values.photoIncluded,
    });
    const id = supportCase.id;
    const caseNumber = Number(id.split("-").at(-1)) || 2049;

    setSupportCases([supportCase, ...supportCases]);
    setNotifications([
      {
        id: `not-support-${caseNumber}`,
        type: "OnDemand",
        channel: "System",
        actor: activeDemo.context.primaryOperator,
        recipientRole: "admin",
        source: "OnDemand",
        event: "Solicitud directa de tienda",
        message: `${activeDemo.context.defaultPlant} solicita apoyo: ${values.category}.`,
        actionLabel: "Abrir solicitud",
        status: "Sent",
        createdAt: at.toISOString(),
      },
      ...notifications,
    ]);
    message.success(`Solicitud ${id} enviada al centro de soporte`);
    form.resetFields();
    onCreated?.(id);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={submit}
      okText="Enviar solicitud"
      cancelText="Cancelar"
      title={
        <Space>
          <CustomerServiceOutlined />
          Solicitar asistencia
        </Space>
      }
      width={640}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        message="Describe lo que ocurre, no la solución técnica"
        description="El centro de soporte definirá si corresponde diagnóstico remoto, atención interna o proveedor externo."
        style={{ marginBottom: 18 }}
      />
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="category"
          label="¿Con qué necesitas ayuda?"
          rules={[{ required: true, message: "Selecciona una categoría" }]}
        >
          <Select
            options={[
              "Climatización",
              "Punto de venta",
              "Conectividad",
              "Iluminación e instalaciones",
              "Acceso y seguridad",
              "Operación de tienda",
              "Otro",
            ].map((value) => ({ value, label: value }))}
          />
        </Form.Item>
        <Form.Item name="assetId" label="Activo relacionado">
          <Select
            allowClear
            placeholder="Sin activo específico"
            options={assets.map((asset) => ({
              value: asset.id,
              label: `${asset.id} · ${asset.name}`,
            }))}
          />
        </Form.Item>
        <Form.Item name="sourceAssignmentId" label="Relacionar con una asignación">
          <Select
            allowClear
            placeholder="Solicitud independiente"
            options={assignments.map((item) => ({
              value: item.id,
              label: `${item.id} · ${item.storeLabel}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="symptom"
          label="¿Qué está ocurriendo?"
          rules={[
            { required: true, message: "Describe el problema" },
            { min: 12, message: "Agrega un poco más de contexto" },
          ]}
        >
          <Input.TextArea
            rows={4}
            showCount
            maxLength={320}
            placeholder="Ej. La sala se siente caliente aunque el control está encendido..."
          />
        </Form.Item>
        <Form.Item name="impact" label="Impacto actual">
          <Radio.Group>
            <Space direction="vertical">
              <Radio value="critical">La tienda no puede continuar una operación crítica</Radio>
              <Radio value="partial">Podemos operar, pero con afectación</Radio>
              <Radio value="minor">Podemos operar y dar seguimiento después</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="photoIncluded" label="Evidencia" valuePropName="checked">
          <Switch
            checkedChildren={
              <Space size={4}>
                <CameraOutlined />
                Foto incluida
              </Space>
            }
            unCheckedChildren="Sin foto"
          />
        </Form.Item>
        <Typography.Text type="secondary">
          La foto, ubicación y mensajería son simuladas en esta demostración.
        </Typography.Text>
      </Form>
    </Modal>
  );
}
