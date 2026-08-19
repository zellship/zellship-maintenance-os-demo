import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Input,
  List,
  message,
  Row,
  Select,
  Space,
  Steps,
  Timeline,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CustomerServiceOutlined,
  SearchOutlined,
  SendOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { advanceDemoClock } from "../../demo-config/clock";
import {
  assignDiagnosticProtocol,
  assignExternalIntervention,
  closeSupportCase,
  recordSupportResolution,
} from "../retail-domain";
import { useStore } from "../store";
import type { SupportCase } from "../types";
import { PriorityTag, SupportStatusTag } from "./retail-ui";
import { formatShortDate } from "./retail-format";

type Props = { initialCaseId?: string | null; supervisorMode?: boolean };

export function RetailSupportCases({ initialCaseId, supervisorMode = false }: Props) {
  const {
    supportCases,
    setSupportCases,
    supportInterventions,
    setSupportInterventions,
    protocols,
  } = useStore();
  const [selectedId, setSelectedId] = useState(initialCaseId ?? supportCases[0]?.id);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (initialCaseId) setSelectedId(initialCaseId);
  }, [initialCaseId]);

  const filtered = useMemo(
    () =>
      supportCases.filter((item) => {
        const matches = `${item.id} ${item.title} ${item.storeLabel}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus =
          status === "all" ||
          (status === "active"
            ? item.status !== "Closed" && item.status !== "Draft"
            : item.status === status);
        return matches && matchesStatus;
      }),
    [query, status, supportCases],
  );
  const selected = supportCases.find((item) => item.id === selectedId) ?? filtered[0];
  const intervention = supportInterventions.find((item) => item.id === selected?.interventionId);

  const replaceCase = (next: SupportCase) => {
    setSupportCases(supportCases.map((item) => (item.id === next.id ? next : item)));
    setSelectedId(next.id);
  };

  const runAction = () => {
    if (!selected) return;
    const at = advanceDemoClock(2).toISOString();
    if (selected.status === "Reported") {
      replaceCase(assignDiagnosticProtocol(selected, at, "Elena Ríos", "retail-hvac-diagnostic"));
      message.success("Diagnóstico seguro enviado a la tienda");
      return;
    }
    if (selected.status === "EscalationRequired") {
      const transition = assignExternalIntervention(
        selected,
        at,
        "Elena Ríos",
        advanceDemoClock(120).toISOString(),
      );
      replaceCase(transition.supportCase);
      setSupportInterventions([...supportInterventions, transition.intervention!]);
      message.success("Proveedor especializado asignado");
      return;
    }
    if (
      (selected.status === "ExternalAssigned" || selected.status === "InService") &&
      intervention
    ) {
      const transition = recordSupportResolution(selected, intervention, at, intervention.assignee);
      replaceCase(transition.supportCase);
      setSupportInterventions(
        supportInterventions.map((item) =>
          item.id === transition.intervention?.id ? transition.intervention : item,
        ),
      );
      message.success("Resolución registrada; se solicitó confirmación a la tienda");
      return;
    }
    if (selected.status === "PendingSupportValidation") {
      replaceCase(closeSupportCase(selected, at, "Elena Ríos"));
      message.success("Solicitud cerrada con trazabilidad completa");
    }
  };

  const action = selected ? actionFor(selected, Boolean(intervention)) : null;

  return (
    <div className="retail-page">
      <div className="retail-page-heading">
        <div>
          <Typography.Text className="retail-eyebrow">
            {supervisorMode ? "VALIDACIÓN OPERATIVA" : "TIENDAS → CENTRO DE SOPORTE"}
          </Typography.Text>
          <Typography.Title level={2}>
            {supervisorMode ? "Seguimiento y cierre" : "Solicitudes de soporte"}
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            Prioriza el impacto, diagnostica de forma remota y escala sólo cuando sea necesario.
          </Typography.Paragraph>
        </div>
        <Space>
          <PriorityTag priority="P1" />
          <Typography.Text type="secondary">Atención inmediata y segura</Typography.Text>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card className="retail-case-list-card" title="Bandeja de soporte">
            <div className="retail-support-filters">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Buscar solicitud o tienda"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Select
                value={status}
                onChange={setStatus}
                options={[
                  { value: "active", label: "Activas" },
                  { value: "all", label: "Todas" },
                  { value: "Reported", label: "Recibidas" },
                  { value: "EscalationRequired", label: "Por escalar" },
                  { value: "PendingSupportValidation", label: "Por cerrar" },
                  { value: "Closed", label: "Cerradas" },
                ]}
              />
            </div>
            <List
              dataSource={filtered}
              locale={{ emptyText: <Empty description="No hay solicitudes con estos filtros" /> }}
              renderItem={(item) => (
                <List.Item
                  className={`retail-case-list-item ${selected?.id === item.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <PriorityTag priority={item.confirmedPriority ?? item.suggestedPriority} />
                        <b>{item.storeLabel}</b>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <span>{item.title}</span>
                        <SupportStatusTag status={item.status} />
                        <Typography.Text type="secondary">{item.id}</Typography.Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={16}>
          {!selected ? (
            <Card>
              <Empty description="Selecciona una solicitud" />
            </Card>
          ) : (
            <Card
              className="retail-case-detail-card"
              title={
                <Space wrap>
                  <CustomerServiceOutlined />
                  <span>{selected.id}</span>
                  <SupportStatusTag status={selected.status} />
                </Space>
              }
              extra={
                action && (
                  <Button type="primary" icon={action.icon} onClick={runAction}>
                    {action.label}
                  </Button>
                )
              }
            >
              <div className="retail-case-title-row">
                <div>
                  <Typography.Title level={3}>{selected.title}</Typography.Title>
                  <Typography.Text type="secondary">
                    {selected.storeLabel} · {selected.areaLabel}
                  </Typography.Text>
                </div>
                <PriorityTag priority={selected.confirmedPriority ?? selected.suggestedPriority} />
              </div>

              {selected.status === "Reported" && (
                <Alert
                  showIcon
                  type="warning"
                  message="Validar prioridad y asignar primero un diagnóstico remoto seguro."
                />
              )}
              {selected.status === "EscalationRequired" && (
                <Alert
                  showIcon
                  type="error"
                  message="La tienda agotó las verificaciones permitidas. Se requiere intervención especializada."
                />
              )}
              {selected.status === "PendingStoreConfirmation" && (
                <Alert
                  showIcon
                  type="info"
                  message="La intervención concluyó; el cierre permanece bloqueado hasta la confirmación de la tienda."
                />
              )}

              <Steps
                size="small"
                responsive
                current={supportStep(selected.status)}
                items={[
                  { title: "Reportada" },
                  { title: "Diagnóstico" },
                  { title: "Atención" },
                  { title: "Confirmación" },
                  { title: "Cierre" },
                ]}
                style={{ margin: "24px 0" }}
              />

              <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
                <Descriptions.Item label="Síntoma">{selected.symptom}</Descriptions.Item>
                <Descriptions.Item label="Impacto">{selected.operationalImpact}</Descriptions.Item>
                <Descriptions.Item label="Responsable actual">
                  {selected.currentOwner}
                </Descriptions.Item>
                <Descriptions.Item label="Ruta">
                  {selected.route === "Unassigned"
                    ? "Por definir"
                    : selected.route === "Internal"
                      ? "Soporte interno"
                      : "Proveedor externo"}
                </Descriptions.Item>
                <Descriptions.Item label="Protocolo origen">
                  {protocols.find((item) => item.id === selected.sourceProtocolId)?.name ??
                    "Solicitud directa"}
                </Descriptions.Item>
                <Descriptions.Item label="Activo">
                  {selected.assetId ?? "Sin activo específico"}
                </Descriptions.Item>
                <Descriptions.Item label="Acuse objetivo">
                  {formatShortDate(selected.acknowledgementDueAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Resolución objetivo">
                  {formatShortDate(selected.resolutionTargetAt)}
                </Descriptions.Item>
              </Descriptions>

              {intervention && (
                <Card
                  size="small"
                  className="retail-intervention-card"
                  title={
                    <Space>
                      <ToolOutlined />
                      Intervención
                    </Space>
                  }
                >
                  <Descriptions size="small" column={{ xs: 1, md: 2 }}>
                    <Descriptions.Item label="Responsable">
                      {intervention.assignee}
                    </Descriptions.Item>
                    <Descriptions.Item label="Especialidad">
                      {intervention.specialty}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ventana">
                      {formatShortDate(intervention.scheduledAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">{intervention.status}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              <Divider titlePlacement="start">Trazabilidad</Divider>
              <Timeline
                items={selected.updates.map((update) => ({
                  color: "#7041da",
                  children: (
                    <div>
                      <b>{update.label}</b>
                      <div>{update.detail}</div>
                      <Typography.Text type="secondary">
                        {update.actor} · {formatShortDate(update.at)}
                      </Typography.Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

function supportStep(status: SupportCase["status"]) {
  if (status === "Closed") return 5;
  if (status === "PendingSupportValidation" || status === "PendingStoreConfirmation") return 3;
  if (["ExternalAssigned", "InternalAssigned", "InService", "EscalationRequired"].includes(status))
    return 2;
  if (["DiagnosticProtocolAssigned", "Diagnosing"].includes(status)) return 1;
  return 0;
}

function actionFor(supportCase: SupportCase, hasIntervention: boolean) {
  if (supportCase.status === "Reported")
    return { label: "Asignar diagnóstico", icon: <SendOutlined /> };
  if (supportCase.status === "EscalationRequired")
    return { label: "Asignar proveedor", icon: <ToolOutlined /> };
  if (
    (supportCase.status === "ExternalAssigned" || supportCase.status === "InService") &&
    hasIntervention
  )
    return { label: "Registrar resolución", icon: <CheckCircleOutlined /> };
  if (supportCase.status === "PendingSupportValidation")
    return { label: "Validar y cerrar", icon: <CheckCircleOutlined /> };
  return null;
}
