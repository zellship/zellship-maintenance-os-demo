import {
  Alert,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useStore } from "../store";
import { AssignmentStatusTag, PriorityTag, SupportStatusTag } from "./retail-ui";
import { formatShortDate } from "./retail-format";

type Props = {
  onOpenProgram: () => void;
  onOpenSupport: (caseId?: string) => void;
  onNewAssignment?: () => void;
};

export function RetailOperationsDashboard({
  onOpenProgram,
  onOpenSupport,
  onNewAssignment,
}: Props) {
  const { storeAssignments, supportCases, protocols } = useStore();
  const activeCases = supportCases.filter(
    (item) => item.status !== "Closed" && item.status !== "Draft",
  );
  const complete = storeAssignments.filter((item) => item.status === "Completed").length;
  const progress = Math.round((complete / Math.max(storeAssignments.length, 1)) * 100);
  const mainCase = supportCases.find((item) => item.id === "RTL-SUP-2048");

  return (
    <div className="retail-page">
      <div className="retail-page-heading">
        <div>
          <Typography.Text className="retail-eyebrow">OPERACIÓN DISTRIBUIDA</Typography.Text>
          <Typography.Title level={2}>Centro de tiendas</Typography.Title>
          <Typography.Paragraph type="secondary">
            Programa del día, condición operativa y soporte en una sola vista.
          </Typography.Paragraph>
        </div>
        <Space wrap>
          {onNewAssignment && (
            <Button icon={<ShopOutlined />} onClick={onNewAssignment}>
              Nueva asignación
            </Button>
          )}
          <Button type="primary" icon={<CustomerServiceOutlined />} onClick={() => onOpenSupport()}>
            Abrir centro de soporte
          </Button>
        </Space>
      </div>

      {mainCase?.status === "Draft" && (
        <Alert
          showIcon
          type="info"
          message="Recorrido preparado: Boutique Norte"
          description="Ingresa a Mi tienda para ejecutar la apertura, detectar la desviación de climatización y solicitar apoyo."
          action={<Tag color="blue">Caso RTL-SUP-2048</Tag>}
        />
      )}

      <Row gutter={[16, 16]} className="retail-command-grid">
        <Col xs={24} xl={8}>
          <Card
            className="retail-command-card"
            title={
              <Space>
                <ShopOutlined />
                Cobertura de tiendas
              </Space>
            }
          >
            <Statistic value={6} suffix="tiendas" />
            <div className="retail-stat-row">
              <span>Programa recibido</span>
              <b>5 / 6</b>
            </div>
            <Progress percent={83} showInfo={false} strokeColor="#7041da" />
            <div className="retail-card-footer">
              <CheckCircleOutlined /> 4 operando sin desviaciones críticas
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card
            className="retail-command-card"
            title={
              <Space>
                <ClockCircleOutlined />
                Programa del día
              </Space>
            }
          >
            <Statistic value={storeAssignments.length} suffix="asignaciones" />
            <div className="retail-stat-row">
              <span>Cumplimiento actual</span>
              <b>{progress}%</b>
            </div>
            <Progress percent={progress} showInfo={false} strokeColor="#3457e8" />
            <Button type="link" onClick={onOpenProgram} icon={<ArrowRightOutlined />}>
              Gestionar programa
            </Button>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card
            className="retail-command-card"
            title={
              <Space>
                <WarningOutlined />
                Soporte activo
              </Space>
            }
          >
            <Statistic value={activeCases.length} suffix="solicitudes" />
            <div className="retail-stat-row">
              <span>Intervención externa</span>
              <b>{activeCases.filter((item) => item.route === "External").length}</b>
            </div>
            <Progress percent={62} showInfo={false} strokeColor="#f59e0b" />
            <Button type="link" onClick={() => onOpenSupport()} icon={<ArrowRightOutlined />}>
              Revisar solicitudes
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card
            title="Programa operativo de hoy"
            extra={
              <Button type="link" onClick={onOpenProgram}>
                Ver programa completo
              </Button>
            }
          >
            <List
              dataSource={storeAssignments.slice(0, 4)}
              renderItem={(item) => {
                const protocol = protocols.find((candidate) => candidate.id === item.protocolId);
                return (
                  <List.Item actions={[<AssignmentStatusTag key="status" status={item.status} />]}>
                    <List.Item.Meta
                      title={
                        <Space wrap>
                          <b>{item.storeLabel}</b>
                          <Tag>{item.id}</Tag>
                        </Space>
                      }
                      description={`${protocol?.name ?? item.protocolId} · ${item.responsible} · ${formatShortDate(item.dueAt)}`}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card
            title="Solicitudes que requieren atención"
            extra={<Tag color="orange">{activeCases.length} activas</Tag>}
          >
            <List
              dataSource={activeCases.slice(0, 4)}
              renderItem={(item) => (
                <List.Item onClick={() => onOpenSupport(item.id)} className="retail-clickable-row">
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <PriorityTag priority={item.confirmedPriority ?? item.suggestedPriority} />
                        <b>{item.storeLabel}</b>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={3}>
                        <span>{item.title}</span>
                        <SupportStatusTag status={item.status} />
                      </Space>
                    }
                  />
                  <ArrowRightOutlined />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
