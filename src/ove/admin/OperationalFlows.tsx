import { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DeploymentUnitOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { seedAssets, seedOperationalFlows } from "../seed";
import { useStore } from "../store";
import type { Notification, OperationalFlow, OperationalFlowStep, Protocol } from "../types";

type CreateFlowValues = {
  name: string;
  description: string;
  assetId: string;
  trigger: string;
  protocolIds: string[];
  executionMode: "Linear" | "Parallel";
};

export function OperationalFlows() {
  const { protocols, notifications, setNotifications } = useStore();
  const [flows, setFlows] = useState<OperationalFlow[]>(seedOperationalFlows);
  const [selectedId, setSelectedId] = useState(seedOperationalFlows[0].id);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [protocolToAdd, setProtocolToAdd] = useState<string>();
  const [form] = Form.useForm<CreateFlowValues>();

  const filteredFlows = useMemo(
    () =>
      flows.filter(
        (flow) =>
          !query ||
          flow.name.toLowerCase().includes(query.toLowerCase()) ||
          flow.assetId.toLowerCase().includes(query.toLowerCase()),
      ),
    [flows, query],
  );
  const selected = flows.find((flow) => flow.id === selectedId) ?? flows[0];
  const protocolSteps = selected.steps.filter((step) => step.protocolId);
  const completedSteps = selected.steps.filter((step) => step.status === "Completed").length;
  const progress = Math.round((completedSteps / selected.steps.length) * 100);

  const updateSelectedSteps = (
    updater: (steps: OperationalFlowStep[]) => OperationalFlowStep[],
  ) => {
    setFlows(
      flows.map((flow) =>
        flow.id === selected.id ? { ...flow, steps: updater(flow.steps) } : flow,
      ),
    );
  };

  const simulateNext = () => {
    const nextIndex = selected.steps.findIndex((step) => step.status !== "Completed");
    if (nextIndex === -1) {
      message.success("El flujo ya concluyó y el activo fue liberado");
      return;
    }
    const nextStep = selected.steps[nextIndex];
    setFlows(
      flows.map((flow) => {
        if (flow.id !== selected.id) return flow;
        const steps = flow.steps.map((step, index) => ({
          ...step,
          status:
            index <= nextIndex
              ? ("Completed" as const)
              : index === nextIndex + 1
                ? ("Ready" as const)
                : step.status,
        }));
        return {
          ...flow,
          status: nextIndex === steps.length - 1 ? "Completed" : "Running",
          steps,
        };
      }),
    );
    const event: Notification = {
      id: `n-flow-studio-${Date.now()}`,
      type: nextIndex === selected.steps.length - 1 ? "Completed" : "FlowTriggered",
      channel: "Push",
      actor: "Business Commitment Engine",
      recipientRole: "supervisor",
      recipient: "Roberto Salas",
      source: "Automatic",
      event: "Orquestación de flujo",
      message: `${selected.name}: “${nextStep.name}” completado; dependencias reevaluadas.`,
      status: "Sent",
      createdAt: dayjs().toISOString(),
    };
    setNotifications([event, ...notifications]);
    message.success(`Etapa completada: ${nextStep.name}`);
  };

  const moveProtocol = (stepId: string, direction: -1 | 1) => {
    updateSelectedSteps((steps) => {
      const index = steps.findIndex((step) => step.id === stepId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= steps.length) return steps;
      const copy = [...steps];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const toggleMode = (stepId: string) => {
    updateSelectedSteps((steps) =>
      steps.map((step) =>
        step.id === stepId
          ? { ...step, mode: step.mode === "Linear" ? "Parallel" : "Linear" }
          : step,
      ),
    );
    message.success("Tipo de dependencia actualizado");
  };

  const removeProtocol = (stepId: string) => {
    updateSelectedSteps((steps) => steps.filter((step) => step.id !== stepId));
    message.success("Protocolo retirado del flujo");
  };

  const addProtocol = () => {
    if (!protocolToAdd) return;
    const protocol = protocols.find((item) => item.id === protocolToAdd);
    if (!protocol) return;
    updateSelectedSteps((steps) => [
      ...steps,
      {
        id: `flow-step-${Date.now()}`,
        name: protocol.name,
        protocolId: protocol.id,
        mode: "Linear",
        status: "Waiting",
        trigger: "Etapa anterior completada",
      },
    ]);
    setProtocolToAdd(undefined);
    message.success(`${protocol.name} agregado al flujo`);
  };

  const duplicateFlow = () => {
    const copy: OperationalFlow = {
      ...selected,
      id: `flow-${Date.now()}`,
      name: `${selected.name} · copia`,
      status: "Ready",
      steps: selected.steps.map((step, index) => ({
        ...step,
        id: `flow-copy-${Date.now()}-${index}`,
        status: index === 0 ? "Ready" : "Waiting",
      })),
    };
    setFlows([copy, ...flows]);
    setSelectedId(copy.id);
    message.success("Flujo duplicado como nueva plantilla");
  };

  const createFlow = (values: CreateFlowValues) => {
    const protocolFlowSteps: OperationalFlowStep[] = values.protocolIds.map((protocolId, index) => {
      const protocol = protocols.find((item) => item.id === protocolId);
      return {
        id: `flow-new-${Date.now()}-${index}`,
        name: protocol?.name ?? "Protocolo",
        protocolId,
        mode: values.executionMode,
        status: index === 0 ? "Ready" : "Waiting",
        trigger: index === 0 ? values.trigger : "Dependencia anterior completada",
      };
    });
    const flow: OperationalFlow = {
      id: `flow-${Date.now()}`,
      name: values.name,
      description: values.description,
      assetId: values.assetId,
      status: "Ready",
      steps: [
        {
          id: `flow-start-${Date.now()}`,
          name: "Inicio y validación de contexto",
          mode: "Linear",
          status: "Ready",
          trigger: values.trigger,
        },
        ...protocolFlowSteps,
        {
          id: `flow-end-${Date.now()}`,
          name: "Liberación y actualización OEE",
          mode: "Linear",
          status: "Waiting",
          trigger: "Todos los protocolos completados",
        },
      ],
    };
    setFlows([flow, ...flows]);
    setSelectedId(flow.id);
    setCreateOpen(false);
    form.resetFields();
    message.success("Flujo creado con protocolos y dependencias configuradas");
  };

  return (
    <div className="industrial-page operational-flows-page">
      <Space className="page-heading-row" wrap>
        <div>
          <Space>
            <Avatar icon={<BranchesOutlined />} style={{ background: "#7B35C1" }} />
            <Typography.Text strong>DISEÑO Y ORQUESTACIÓN</Typography.Text>
          </Space>
          <Typography.Title level={2} style={{ margin: "4px 0 0" }}>
            Flujos operativos
          </Typography.Title>
          <Typography.Text type="secondary">
            Agrupa protocolos, dependencias, triggers y responsables en una sola operación.
          </Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Nuevo flujo
        </Button>
      </Space>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Flujos configurados"
              value={flows.length}
              prefix={<BranchesOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="En ejecución"
              value={flows.filter((flow) => flow.status === "Running").length}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: "#7B35C1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Protocolos agrupados"
              value={
                new Set(flows.flatMap((flow) => flow.steps.map((step) => step.protocolId))).size - 1
              }
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Activos en contexto"
              value={new Set(flows.map((flow) => flow.assetId)).size}
              prefix={<DeploymentUnitOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={7}>
          <Card title="Biblioteca de flujos">
            <Input.Search
              placeholder="Buscar flujo o activo"
              allowClear
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{ marginBottom: 12 }}
            />
            <List
              className="flow-library"
              dataSource={filteredFlows}
              renderItem={(flow) => (
                <List.Item
                  className={flow.id === selected.id ? "selected" : ""}
                  onClick={() => setSelectedId(flow.id)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={
                          flow.status === "Running" ? <PlayCircleOutlined /> : <BranchesOutlined />
                        }
                        style={{ background: flow.status === "Running" ? "#7B35C1" : "#8c8c8c" }}
                      />
                    }
                    title={flow.name}
                    description={
                      <Space wrap>
                        <Tag>{flow.assetId}</Tag>
                        <span>
                          {flow.steps.filter((step) => step.protocolId).length} protocolos
                        </span>
                        <Tag color={flow.status === "Running" ? "purple" : "default"}>
                          {flow.status === "Running" ? "En ejecución" : "Plantilla"}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={17}>
          <Card
            className="flow-studio-card"
            title={
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {selected.name}
                </Typography.Title>
                <Typography.Text type="secondary">{selected.description}</Typography.Text>
              </div>
            }
            extra={
              <Space>
                <Button icon={<CopyOutlined />} onClick={duplicateFlow}>
                  Duplicar
                </Button>
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={simulateNext}>
                  Emular siguiente etapa
                </Button>
              </Space>
            }
          >
            <Space wrap>
              <Tag color="purple">{selected.assetId}</Tag>
              <Tag>{selected.status}</Tag>
              <Tag icon={<ThunderboltOutlined />}>
                {selected.steps[0]?.trigger ?? "Inicio manual"}
              </Tag>
            </Space>
            <Progress percent={progress} strokeColor="#7B35C1" style={{ marginTop: 12 }} />
            <div className="flow-board flow-builder-board">
              {selected.steps.map((step, index) => {
                const protocol = protocols.find((item) => item.id === step.protocolId);
                return (
                  <div
                    className={`flow-node ${step.mode === "Parallel" ? "parallel" : ""} ${step.status === "Completed" ? "complete" : step.status === "Running" || step.status === "Ready" ? "active" : ""}`}
                    key={step.id}
                  >
                    <div className="flow-index">
                      {step.status === "Completed" ? <CheckCircleOutlined /> : index + 1}
                    </div>
                    <div>
                      <b>{step.name}</b>
                      <div>
                        <Tag color={step.protocolId ? "purple" : "default"}>
                          {step.protocolId ? "Protocolo" : "Control"}
                        </Tag>
                        <Tag color={step.mode === "Parallel" ? "blue" : "default"}>
                          {step.mode === "Parallel" ? "Paralelo" : "Lineal"}
                        </Tag>
                      </div>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {protocol?.category ?? step.trigger}
                      </Typography.Text>
                    </div>
                  </div>
                );
              })}
            </div>

            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              <Col xs={24} lg={15}>
                <Card
                  size="small"
                  title="Protocolos y dependencias"
                  extra={<Tag>{protocolSteps.length} vinculados</Tag>}
                >
                  <List
                    dataSource={protocolSteps}
                    locale={{ emptyText: "Agrega al menos un protocolo" }}
                    renderItem={(step) => (
                      <List.Item
                        actions={[
                          <Button
                            key="up"
                            type="text"
                            aria-label="Subir protocolo"
                            icon={<ArrowUpOutlined />}
                            onClick={() => moveProtocol(step.id, -1)}
                          />,
                          <Button
                            key="down"
                            type="text"
                            aria-label="Bajar protocolo"
                            icon={<ArrowDownOutlined />}
                            onClick={() => moveProtocol(step.id, 1)}
                          />,
                          <Button
                            key="mode"
                            size="small"
                            icon={
                              step.mode === "Parallel" ? (
                                <BranchesOutlined />
                              ) : (
                                <PauseCircleOutlined />
                              )
                            }
                            onClick={() => toggleMode(step.id)}
                          >
                            {step.mode === "Parallel" ? "Paralelo" : "Lineal"}
                          </Button>,
                          <Button
                            key="remove"
                            type="text"
                            danger
                            aria-label="Retirar protocolo"
                            icon={<DeleteOutlined />}
                            onClick={() => removeProtocol(step.id)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ToolOutlined />} />}
                          title={step.name}
                          description={`Se detona con: ${step.trigger}`}
                        />
                      </List.Item>
                    )}
                  />
                  <Space.Compact style={{ width: "100%", marginTop: 10 }}>
                    <Select
                      value={protocolToAdd}
                      onChange={setProtocolToAdd}
                      placeholder="Agregar protocolo al flujo"
                      style={{ flex: 1 }}
                      options={protocols
                        .filter(
                          (protocol) =>
                            !protocolSteps.some((step) => step.protocolId === protocol.id),
                        )
                        .map((protocol) => ({ value: protocol.id, label: protocol.name }))}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={addProtocol}>
                      Agregar
                    </Button>
                  </Space.Compact>
                </Card>
              </Col>
              <Col xs={24} lg={9}>
                <Card size="small" title="Reglas del flujo">
                  <List
                    size="small"
                    dataSource={[
                      "Validar skills y disponibilidad antes de asignar.",
                      "Reservar herramientas y materiales por protocolo.",
                      "Esperar todas las ramas paralelas antes de liberar.",
                      "Actualizar OEE y Asset Profile al completar.",
                    ]}
                    renderItem={(rule) => (
                      <List.Item>
                        <Space align="start">
                          <CheckCircleOutlined style={{ color: "#52c41a", marginTop: 4 }} />
                          <span>{rule}</span>
                        </Space>
                      </List.Item>
                    )}
                  />
                  <Button
                    block
                    icon={<SaveOutlined />}
                    onClick={() => message.success("Configuración y versión del flujo guardadas")}
                  >
                    Guardar configuración
                  </Button>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Crear flujo operativo"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="Crear flujo"
        width={680}
      >
        <Alert
          type="info"
          showIcon
          message="Un flujo agrupa varios protocolos y define cómo se detonan entre sí."
          style={{ marginBottom: 14 }}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={createFlow}
          initialValues={{ executionMode: "Linear", trigger: "Orden aprobada" }}
        >
          <Form.Item name="name" label="Nombre del flujo" rules={[{ required: true }]}>
            <Input placeholder="Ej. Recuperación de compresor crítico" />
          </Form.Item>
          <Form.Item name="description" label="Objetivo" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="Describe el resultado operacional esperado" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="assetId" label="Activo principal" rules={[{ required: true }]}>
                <Select
                  options={seedAssets.map((asset) => ({
                    value: asset.id,
                    label: `${asset.id} · ${asset.name}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trigger" label="Trigger inicial" rules={[{ required: true }]}>
                <Select
                  options={[
                    "Orden aprobada",
                    "Alerta IoT / SCADA",
                    "Calendario recurrente",
                    "Asignación directa",
                    "Resultado de otro flujo",
                  ].map((value) => ({ value, label: value }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="protocolIds"
            label="Protocolos que pertenecen al flujo"
            rules={[{ required: true }]}
          >
            <Select
              mode="multiple"
              optionFilterProp="label"
              options={protocols.map((protocol: Protocol) => ({
                value: protocol.id,
                label: protocol.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="executionMode" label="Relación inicial entre protocolos">
            <Select
              options={[
                { value: "Linear", label: "Lineal · uno después de otro" },
                { value: "Parallel", label: "Paralelo · se ejecutan al mismo tiempo" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
