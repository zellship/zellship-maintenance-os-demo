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
  Tabs,
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
import { hasCapability } from "../../demo-config/active";
import { demoNow } from "../../demo-config/clock";
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

type FlowFilter = "All" | OperationalFlow["status"];

const flowStatusLabel: Record<OperationalFlow["status"], string> = {
  Ready: "Plantilla",
  Running: "En ejecución",
  Completed: "Completado",
};

const stepStatusLabel: Record<OperationalFlowStep["status"], string> = {
  Waiting: "En espera",
  Ready: "Lista para iniciar",
  Running: "En curso",
  Completed: "Completada",
};

export function OperationalFlows() {
  const showImprovement = hasCapability("improvement-insights");
  const flowRules = [
    "Validar skills y disponibilidad antes de asignar.",
    "Reservar herramientas y materiales por protocolo.",
    "Esperar todas las ramas paralelas antes de liberar.",
    showImprovement
      ? "Actualizar OEE y Asset Profile al completar."
      : "Consolidar evidencias y cierre operativo al completar.",
  ];
  const { protocols, notifications, setNotifications } = useStore();
  const [flows, setFlows] = useState<OperationalFlow[]>(seedOperationalFlows);
  const [selectedId, setSelectedId] = useState(seedOperationalFlows[0].id);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [flowFilter, setFlowFilter] = useState<FlowFilter>("All");
  const [protocolToAdd, setProtocolToAdd] = useState<string>();
  const [form] = Form.useForm<CreateFlowValues>();

  const filteredFlows = useMemo(
    () =>
      flows.filter(
        (flow) =>
          (flowFilter === "All" || flow.status === flowFilter) &&
          (!query ||
            flow.name.toLowerCase().includes(query.toLowerCase()) ||
            flow.assetId.toLowerCase().includes(query.toLowerCase())),
      ),
    [flowFilter, flows, query],
  );
  const selected = flows.find((flow) => flow.id === selectedId) ?? flows[0];
  const protocolSteps = selected.steps.filter((step) => step.protocolId);
  const completedSteps = selected.steps.filter((step) => step.status === "Completed").length;
  const progress = Math.round((completedSteps / selected.steps.length) * 100);
  const currentStepIndex = selected.steps.findIndex((step) => step.status !== "Completed");
  const currentStep = currentStepIndex >= 0 ? selected.steps[currentStepIndex] : undefined;
  const selectedAsset = seedAssets.find((asset) => asset.id === selected.assetId);
  const uniqueProtocolCount = new Set(
    flows
      .flatMap((flow) => flow.steps.map((step) => step.protocolId))
      .filter((protocolId): protocolId is string => Boolean(protocolId)),
  ).size;

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
      createdAt: demoNow().toISOString(),
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
          name: showImprovement
            ? "Liberación y actualización OEE"
            : "Cierre y consolidación de evidencias",
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
            <Typography.Text strong>CONFIGURACIÓN Y ORQUESTACIÓN</Typography.Text>
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

      <div className="flow-summary-strip" aria-label="Resumen de flujos">
        <div className="flow-summary-item primary">
          <span className="flow-summary-icon">
            <PlayCircleOutlined />
          </span>
          <div>
            <Typography.Text type="secondary">En ejecución</Typography.Text>
            <strong>{flows.filter((flow) => flow.status === "Running").length}</strong>
          </div>
        </div>
        <div className="flow-summary-item">
          <span className="flow-summary-icon">
            <BranchesOutlined />
          </span>
          <div>
            <Typography.Text type="secondary">Flujos configurados</Typography.Text>
            <strong>{flows.length}</strong>
          </div>
        </div>
        <div className="flow-summary-item">
          <span className="flow-summary-icon">
            <ToolOutlined />
          </span>
          <div>
            <Typography.Text type="secondary">Protocolos vinculados</Typography.Text>
            <strong>{uniqueProtocolCount}</strong>
          </div>
        </div>
        <div className="flow-summary-item">
          <span className="flow-summary-icon">
            <DeploymentUnitOutlined />
          </span>
          <div>
            <Typography.Text type="secondary">Activos relacionados</Typography.Text>
            <strong>{new Set(flows.map((flow) => flow.assetId)).size}</strong>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]} className="flow-workspace-row">
        <Col xs={24} xl={7}>
          <Card
            className="flow-library-card"
            title={
              <div className="flow-library-title">
                <span>Biblioteca</span>
                <Tag>{filteredFlows.length}</Tag>
              </div>
            }
          >
            <Input.Search
              placeholder="Buscar flujo o activo"
              allowClear
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              className="flow-library-filter"
              value={flowFilter}
              onChange={(value) => setFlowFilter(value as FlowFilter)}
              aria-label="Filtrar biblioteca por estado"
              options={[
                { label: "Todos los estados", value: "All" },
                { label: "En ejecución", value: "Running" },
                { label: "Plantillas", value: "Ready" },
              ]}
            />
            <List
              className="flow-library"
              dataSource={filteredFlows}
              locale={{ emptyText: "No hay flujos con estos criterios" }}
              renderItem={(flow) => {
                const itemCompleted = flow.steps.filter(
                  (step) => step.status === "Completed",
                ).length;
                const itemProgress = Math.round((itemCompleted / flow.steps.length) * 100);
                return (
                  <List.Item
                    className={flow.id === selected.id ? "selected" : ""}
                    onClick={() => setSelectedId(flow.id)}
                    aria-current={flow.id === selected.id ? "true" : undefined}
                  >
                    <div className="flow-library-item-content">
                      <div className="flow-library-item-heading">
                        <Avatar
                          size={34}
                          icon={
                            flow.status === "Running" ? (
                              <PlayCircleOutlined />
                            ) : (
                              <BranchesOutlined />
                            )
                          }
                          style={{
                            background: flow.status === "Running" ? "#7B35C1" : "#8c8c8c",
                          }}
                        />
                        <div>
                          <Typography.Text strong>{flow.name}</Typography.Text>
                          <Typography.Text type="secondary">
                            {flow.assetId} · {flow.steps.filter((step) => step.protocolId).length}{" "}
                            {flow.steps.filter((step) => step.protocolId).length === 1
                              ? "protocolo"
                              : "protocolos"}
                          </Typography.Text>
                        </div>
                      </div>
                      <div className="flow-library-item-progress">
                        <Progress
                          percent={itemProgress}
                          size="small"
                          showInfo={false}
                          strokeColor={flow.status === "Completed" ? "#52c41a" : "#7B35C1"}
                        />
                        <Tag color={flow.status === "Running" ? "purple" : "default"}>
                          {flowStatusLabel[flow.status]}
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={17}>
          <Card className="flow-studio-card">
            <div className="flow-detail-header">
              <div>
                <Space wrap size={6}>
                  <Tag color="purple">{selected.assetId}</Tag>
                  <Tag color={selected.status === "Completed" ? "green" : "default"}>
                    {flowStatusLabel[selected.status]}
                  </Tag>
                  <Tag icon={<ThunderboltOutlined />}>
                    Inicio: {selected.steps[0]?.trigger ?? "manual"}
                  </Tag>
                </Space>
                <Typography.Title level={3}>{selected.name}</Typography.Title>
                <Typography.Text type="secondary">{selected.description}</Typography.Text>
              </div>
              <Button icon={<CopyOutlined />} onClick={duplicateFlow}>
                Duplicar
              </Button>
            </div>

            <div className="flow-progress-block">
              <div className="flow-progress-label">
                <Typography.Text strong>Avance general</Typography.Text>
                <Typography.Text type="secondary">
                  {completedSteps} de {selected.steps.length} etapas completadas
                </Typography.Text>
              </div>
              <Progress percent={progress} strokeColor="#7B35C1" />
            </div>

            <div className={`flow-current-step ${currentStep ? "" : "completed"}`}>
              <div className="flow-current-step-main">
                <Avatar
                  size={42}
                  icon={currentStep ? <PlayCircleOutlined /> : <CheckCircleOutlined />}
                  style={{ background: currentStep ? "#7B35C1" : "#52c41a" }}
                />
                <div>
                  <Typography.Text type="secondary">
                    {currentStep ? `ETAPA ACTUAL · ${currentStepIndex + 1}` : "FLUJO COMPLETADO"}
                  </Typography.Text>
                  <Typography.Title level={4}>
                    {currentStep?.name ??
                      (showImprovement
                        ? "Activo liberado y OEE actualizado"
                        : "Servicio cerrado y evidencias consolidadas")}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {currentStep
                      ? `${stepStatusLabel[currentStep.status]} · Se activa con: ${currentStep.trigger ?? "etapa anterior completada"}`
                      : "Todas las dependencias fueron satisfechas."}
                  </Typography.Text>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={currentStep ? <CheckCircleOutlined /> : undefined}
                disabled={!currentStep}
                onClick={simulateNext}
              >
                {currentStep ? "Completar etapa actual" : "Flujo completado"}
              </Button>
            </div>

            <div className="flow-section-heading">
              <div>
                <Typography.Title level={5}>Secuencia operacional</Typography.Title>
                <Typography.Text type="secondary">
                  Las etapas paralelas pueden avanzar al mismo tiempo.
                </Typography.Text>
              </div>
              <Tag>{selected.steps.length} etapas</Tag>
            </div>

            <div className="flow-board flow-builder-board">
              {selected.steps.map((step, index) => {
                const protocol = protocols.find((item) => item.id === step.protocolId);
                return (
                  <div
                    className={`flow-node ${step.mode === "Parallel" ? "parallel" : ""} ${step.status === "Completed" ? "complete" : step.status === "Running" || step.status === "Ready" ? "active" : ""}`}
                    key={step.id}
                    aria-current={index === currentStepIndex ? "step" : undefined}
                  >
                    <div className="flow-index">
                      {step.status === "Completed" ? <CheckCircleOutlined /> : index + 1}
                    </div>
                    <div className="flow-node-content">
                      <Typography.Text strong>{step.name}</Typography.Text>
                      <div className="flow-node-tags">
                        <Tag color={step.protocolId ? "purple" : "default"}>
                          {step.protocolId ? "Protocolo" : "Control"}
                        </Tag>
                        <Tag color={step.mode === "Parallel" ? "blue" : "default"}>
                          {step.mode === "Parallel" ? "Paralelo" : "Lineal"}
                        </Tag>
                      </div>
                      <Typography.Text type="secondary" className="flow-node-trigger">
                        {protocol?.category ?? step.trigger}
                      </Typography.Text>
                      <span className="flow-node-status">{stepStatusLabel[step.status]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Tabs
              className="flow-detail-tabs"
              items={[
                {
                  key: "overview",
                  label: "Resumen operativo",
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={14}>
                        <Card
                          size="small"
                          title="Protocolos vinculados"
                          extra={<Tag>{protocolSteps.length}</Tag>}
                        >
                          <List
                            size="small"
                            dataSource={protocolSteps}
                            locale={{ emptyText: "Sin protocolos vinculados" }}
                            renderItem={(step) => (
                              <List.Item
                                extra={
                                  <Tag color={step.status === "Completed" ? "green" : "purple"}>
                                    {stepStatusLabel[step.status]}
                                  </Tag>
                                }
                              >
                                <List.Item.Meta
                                  avatar={<Avatar icon={<ToolOutlined />} />}
                                  title={step.name}
                                  description={`Se activa con: ${step.trigger}`}
                                />
                              </List.Item>
                            )}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} lg={10}>
                        <Card size="small" title="Contexto del flujo">
                          <div className="flow-context-grid">
                            <span>Activo</span>
                            <strong>{selectedAsset?.name ?? selected.assetId}</strong>
                            <span>Modo</span>
                            <strong>
                              {selected.steps.some((step) => step.mode === "Parallel")
                                ? "Mixto · lineal y paralelo"
                                : "Lineal"}
                            </strong>
                            <span>Reglas activas</span>
                            <strong>{flowRules.length}</strong>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: "configuration",
                  label: "Configurar flujo",
                  children: (
                    <Row gutter={[16, 16]}>
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
                                  description={`Se activa con: ${step.trigger}`}
                                />
                              </List.Item>
                            )}
                          />
                          <Space.Compact className="flow-add-protocol">
                            <Select
                              value={protocolToAdd}
                              onChange={setProtocolToAdd}
                              placeholder="Agregar protocolo al flujo"
                              options={protocols
                                .filter(
                                  (protocol) =>
                                    !protocolSteps.some((step) => step.protocolId === protocol.id),
                                )
                                .map((protocol) => ({
                                  value: protocol.id,
                                  label: protocol.name,
                                }))}
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
                            dataSource={flowRules}
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
                            onClick={() =>
                              message.success("Configuración y versión del flujo guardadas")
                            }
                          >
                            Guardar configuración
                          </Button>
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />
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
