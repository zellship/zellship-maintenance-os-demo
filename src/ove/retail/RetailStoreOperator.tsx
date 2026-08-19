import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Progress,
  Row,
  Space,
  Steps,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CameraOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  ShopOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { advanceDemoClock } from "../../demo-config/clock";
import {
  confirmStoreResolution,
  reportSupportCase,
  requestEscalation,
  startDiagnostic,
} from "../retail-domain";
import { useStore } from "../store";
import { AssignmentStatusTag, SupportStatusTag } from "./retail-ui";

const CASE_ID = "RTL-SUP-2048";
const ASSIGNMENT_ID = "RTL-ASG-1024";

export function RetailStoreOperator() {
  const { storeAssignments, setStoreAssignments, supportCases, setSupportCases, protocols } =
    useStore();
  const assignment = storeAssignments.find((item) => item.id === ASSIGNMENT_ID);
  const supportCase = supportCases.find((item) => item.id === CASE_ID);
  const protocol = protocols.find((item) => item.id === assignment?.protocolId);

  const replaceCase = (next: NonNullable<typeof supportCase>) =>
    setSupportCases(supportCases.map((item) => (item.id === next.id ? next : item)));

  const startOpening = () => {
    if (!assignment) return;
    setStoreAssignments(
      storeAssignments.map((item) =>
        item.id === assignment.id ? { ...item, status: "InProgress" as const, progress: 42 } : item,
      ),
    );
    message.success("Protocolo iniciado; ubicación y hora registradas");
  };

  const sendSupport = () => {
    if (!supportCase || !assignment) return;
    replaceCase(
      reportSupportCase(supportCase, advanceDemoClock(2).toISOString(), "Valeria Santos"),
    );
    setStoreAssignments(
      storeAssignments.map((item) =>
        item.id === assignment.id ? { ...item, progress: 68 } : item,
      ),
    );
    message.success("Solicitud enviada sin abandonar el protocolo de apertura");
  };

  const beginDiagnosis = () => {
    if (!supportCase) return;
    replaceCase(startDiagnostic(supportCase, advanceDemoClock(2).toISOString(), "Valeria Santos"));
  };

  const escalate = () => {
    if (!supportCase) return;
    replaceCase(
      requestEscalation(supportCase, advanceDemoClock(7).toISOString(), "Valeria Santos"),
    );
    message.warning("Soporte recibió el resultado; no se realizarán maniobras técnicas en tienda");
  };

  const confirm = () => {
    if (!supportCase || !assignment) return;
    replaceCase(
      confirmStoreResolution(supportCase, advanceDemoClock(2).toISOString(), "Valeria Santos"),
    );
    setStoreAssignments(
      storeAssignments.map((item) =>
        item.id === assignment.id ? { ...item, status: "Submitted" as const, progress: 100 } : item,
      ),
    );
    message.success("Operación confirmada; soporte realizará la validación final");
  };

  if (!assignment || !supportCase || !protocol) return null;

  const phase = operatorPhase(assignment.status, supportCase.status);

  return (
    <div className="retail-operator-shell">
      <aside className="retail-store-context">
        <Typography.Text className="retail-eyebrow retail-eyebrow-light">MI TIENDA</Typography.Text>
        <Typography.Title level={2}>Boutique Norte</Typography.Title>
        <Typography.Paragraph>
          Tu operación diaria, evidencias y soporte en un mismo recorrido.
        </Typography.Paragraph>
        <div className="retail-context-chip">
          <ShopOutlined />
          <span>
            <b>Apertura 10:00</b>
            <small>Terminal 02 · Lista</small>
          </span>
        </div>
        <div className="retail-context-chip">
          <EnvironmentOutlined />
          <span>
            <b>Ubicación verificada</b>
            <small>Dentro del radio permitido</small>
          </span>
        </div>
        <div className="retail-context-chip">
          <SafetyCertificateOutlined />
          <span>
            <b>Reglas de seguridad</b>
            <small>Sin intervención técnica en tienda</small>
          </span>
        </div>
        <div className="retail-context-bottom">
          <Tag color="green">En línea</Tag>
          <span>Valeria Santos</span>
        </div>
      </aside>

      <main className="retail-store-workspace">
        <div className="retail-page-heading">
          <div>
            <Typography.Text className="retail-eyebrow">PROGRAMA DEL DÍA</Typography.Text>
            <Typography.Title level={2}>Apertura de tienda</Typography.Title>
            <Typography.Paragraph type="secondary">
              Completa el protocolo y solicita apoyo desde el punto exacto donde detectas una
              desviación.
            </Typography.Paragraph>
          </div>
          <AssignmentStatusTag status={assignment.status} />
        </div>

        <Card className="retail-primary-task-card">
          <Space wrap size={12}>
            <Tag color="purple">{assignment.id}</Tag>
            <Tag>v{assignment.protocolVersion}</Tag>
            <SupportStatusTag status={supportCase.status} />
          </Space>
          <Typography.Title level={3}>{protocol.name}</Typography.Title>
          <Typography.Paragraph type="secondary">{protocol.description}</Typography.Paragraph>
          <Progress
            percent={assignment.progress}
            strokeColor={{ "0%": "#7041da", "100%": "#3457e8" }}
          />
          <Steps
            current={phase}
            responsive
            items={[
              { title: "Recibida" },
              { title: "Revisión" },
              { title: "Soporte" },
              { title: "Confirmación" },
            ]}
          />
        </Card>

        {assignment.status === "Acknowledged" && (
          <Card className="retail-action-stage" title="Todo listo para comenzar">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Metric icon={<EnvironmentOutlined />} label="Ubicación" value="Verificada" />
              </Col>
              <Col xs={24} md={8}>
                <Metric icon={<CameraOutlined />} label="Evidencia" value="1 foto requerida" />
              </Col>
              <Col xs={24} md={8}>
                <Metric icon={<SafetyCertificateOutlined />} label="Duración" value="18 minutos" />
              </Col>
            </Row>
            <Divider />
            <Button
              size="large"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={startOpening}
            >
              Iniciar protocolo
            </Button>
          </Card>
        )}

        {assignment.status === "InProgress" && supportCase.status === "Draft" && (
          <Card className="retail-action-stage" title="Condición de climatización">
            <Alert
              showIcon
              type="warning"
              icon={<WarningOutlined />}
              message="Desviación detectada: 27.8 °C"
              description="El rango de apertura esperado es 22–24 °C y el flujo de aire se percibe bajo."
            />
            <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} style={{ marginTop: 18 }}>
              <Descriptions.Item label="Control">Encendido</Descriptions.Item>
              <Descriptions.Item label="Set point">22 °C</Descriptions.Item>
              <Descriptions.Item label="Flujo">Bajo</Descriptions.Item>
              <Descriptions.Item label="Evidencia">Foto y hora vinculadas</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Space wrap>
              <Button>Continuar sin reportar</Button>
              <Button
                size="large"
                type="primary"
                danger
                icon={<CustomerServiceOutlined />}
                onClick={sendSupport}
              >
                Solicitar apoyo
              </Button>
            </Space>
          </Card>
        )}

        {supportCase.status === "Reported" && (
          <Card className="retail-action-stage">
            <Alert
              showIcon
              type="info"
              message="Solicitud recibida por el centro de soporte"
              description="Puedes continuar las actividades seguras de apertura. Soporte asignará el siguiente paso aquí mismo."
            />
            <Descriptions size="small" column={2} style={{ marginTop: 18 }}>
              <Descriptions.Item label="Caso">{supportCase.id}</Descriptions.Item>
              <Descriptions.Item label="Prioridad sugerida">
                {supportCase.suggestedPriority}
              </Descriptions.Item>
              <Descriptions.Item label="Protocolo origen">{protocol.name}</Descriptions.Item>
              <Descriptions.Item label="Estado de apertura">En progreso</Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {(supportCase.status === "DiagnosticProtocolAssigned" ||
          supportCase.status === "Diagnosing") && (
          <Card className="retail-action-stage" title="Diagnóstico seguro guiado">
            <Alert
              showIcon
              type="info"
              message="Realiza sólo verificaciones visibles"
              description="No abras gabinetes, no retires protecciones y no intervengas conexiones eléctricas."
            />
            <div className="retail-checklist">
              <CheckLine done label="Confirmar que el control está encendido" />
              <CheckLine
                done={supportCase.status === "Diagnosing"}
                label="Confirmar temperatura configurada en 22 °C"
              />
              <CheckLine
                done={supportCase.status === "Diagnosing"}
                label="Registrar flujo de aire bajo"
              />
            </div>
            {supportCase.status === "DiagnosticProtocolAssigned" ? (
              <Button type="primary" onClick={beginDiagnosis}>
                Iniciar verificaciones
              </Button>
            ) : (
              <Button type="primary" danger onClick={escalate}>
                El problema continúa
              </Button>
            )}
          </Card>
        )}

        {supportCase.status === "EscalationRequired" && (
          <Card className="retail-action-stage">
            <Alert
              showIcon
              type="warning"
              message="Intervención solicitada"
              description="El centro de soporte seleccionará el recurso adecuado y te notificará la ventana de atención."
            />
          </Card>
        )}
        {supportCase.status === "ExternalAssigned" && (
          <Card className="retail-action-stage">
            <Alert
              showIcon
              type="success"
              message="Proveedor programado"
              description={`Responsable actual: ${supportCase.currentOwner}. La solicitud permanece vinculada a tu apertura.`}
            />
          </Card>
        )}
        {supportCase.status === "PendingStoreConfirmation" && (
          <Card className="retail-action-stage" title="Confirma el resultado">
            <Alert
              showIcon
              type="success"
              message="Intervención concluida"
              description={supportCase.resolutionSummary}
            />
            <Divider />
            <Button size="large" type="primary" icon={<CheckCircleOutlined />} onClick={confirm}>
              Confirmar operación restablecida
            </Button>
          </Card>
        )}
        {supportCase.status === "PendingSupportValidation" && (
          <Card className="retail-action-stage">
            <Alert
              showIcon
              type="success"
              message="Confirmación enviada"
              description="Tu protocolo quedó enviado y el centro de soporte realizará el cierre final."
            />
          </Card>
        )}
        {supportCase.status === "Closed" && (
          <Card className="retail-action-stage">
            <Alert
              showIcon
              type="success"
              message="Solicitud cerrada"
              description="La trazabilidad conserva protocolo, evidencia, diagnóstico, intervención y confirmación de tienda."
            />
          </Card>
        )}
      </main>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="retail-metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}

function CheckLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`retail-check-line ${done ? "is-done" : ""}`}>
      <CheckCircleOutlined />
      <span>{label}</span>
    </div>
  );
}

function operatorPhase(assignmentStatus: string, caseStatus: string) {
  if (["PendingStoreConfirmation", "PendingSupportValidation", "Closed"].includes(caseStatus))
    return 3;
  if (caseStatus !== "Draft") return 2;
  if (assignmentStatus === "InProgress") return 1;
  return 0;
}
