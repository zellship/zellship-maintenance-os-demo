import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  List,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { advanceDemoClock, demoNow } from "../../demo-config/clock";
import { activeDemo } from "../../demo-config/active";
import { useStore } from "../store";
import type { ServiceClassification, ServiceRequest, ServiceRequestStatus } from "../types";
import { acceptServiceRequest } from "../domain";

export function ServiceRequests({
  onSchedule,
  embedded = false,
}: {
  onSchedule: (requestId: string) => void;
  embedded?: boolean;
}) {
  const { serviceRequests, setServiceRequests, notifications, setNotifications } = useStore();
  const coordinatorName =
    activeDemo.context.loginProfiles.find((profile) => profile.role === "admin")?.name ??
    "Coordinación";
  const [selectedId, setSelectedId] = useState<string | null>(
    serviceRequests.find((request) => request.status === "Received")?.id ?? null,
  );
  const [reviewOpen, setReviewOpen] = useState(false);
  const selected = serviceRequests.find((request) => request.id === selectedId);
  const received = serviceRequests.filter((request) => request.status === "Received");
  const expired = serviceRequests.filter((request) => request.status === "Expired");
  const nextDeadline = received
    .filter((request) => request.acceptanceDueAt)
    .sort((a, b) => a.acceptanceDueAt!.localeCompare(b.acceptanceDueAt!))[0];

  const accept = (classification: ServiceClassification) => {
    if (!selected) return;
    const acceptedAt = advanceDemoClock(1).toISOString();
    setServiceRequests(
      serviceRequests.map((request) =>
        request.id === selected.id
          ? acceptServiceRequest(request, classification, coordinatorName, acceptedAt)
          : request,
      ),
    );
    setNotifications([
      {
        id: `n-request-accepted-${Date.now()}`,
        type: "OnDemand",
        channel: "System",
        actor: coordinatorName,
        recipientRole: "admin",
        recipient: "Coordinación de servicios",
        source: "OnDemand",
        event: "Servicio aceptado",
        message: `${selected.externalReference} aceptado y liberado para programación.`,
        status: "Sent",
        createdAt: acceptedAt,
      },
      ...notifications,
    ]);
    setReviewOpen(false);
    message.success(`${selected.externalReference} aceptado · listo para programar`);
  };

  const decline = () => {
    if (!selected) return;
    Modal.confirm({
      title: "Declinar servicio",
      content: "La decisión quedará registrada y el servicio no podrá programarse.",
      okText: "Declinar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: () => {
        setServiceRequests(
          serviceRequests.map((request) =>
            request.id === selected.id ? { ...request, status: "Declined" } : request,
          ),
        );
        message.info(`${selected.externalReference} declinado`);
      },
    });
  };

  return (
    <div className={`industrial-page service-requests-page${embedded ? " embedded" : ""}`}>
      <div className="planning-page-heading service-requests-heading">
        <div>
          <Typography.Text className="planning-eyebrow">SERVICIOS · RECEPCIÓN</Typography.Text>
          <Typography.Title level={embedded ? 3 : 2}>Servicios recibidos</Typography.Title>
          <Typography.Text type="secondary">
            Correctivos por aceptar y preventivos programados en una sola cola operativa.
          </Typography.Text>
        </div>
        <Tag color="purple">Datos y tiempos simulados</Tag>
      </div>

      <Row gutter={[16, 16]} className="planning-metrics-row service-request-metrics">
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Correctivos por aceptar"
              value={received.length}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Próximo vencimiento"
              value={nextDeadline ? formatRemaining(nextDeadline) : "—"}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Servicios no obtenidos"
              value={expired.length}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="service-request-workspace">
        <Col xs={24} xl={9}>
          <Card
            className="service-request-queue-card"
            title="Cola operativa"
            extra={<Tag>{serviceRequests.length} registros</Tag>}
          >
            <List
              dataSource={serviceRequests}
              renderItem={(request) => (
                <List.Item
                  className={`service-request-row${request.id === selectedId ? " selected" : ""}`}
                  onClick={() => setSelectedId(request.id)}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Typography.Text strong>{request.externalReference}</Typography.Text>
                        {requestStatusTag(request.status)}
                      </Space>
                    }
                    description={
                      <div className="service-request-row-copy">
                        <span>{request.title}</span>
                        <small>
                          {request.classification.serviceType} ·{" "}
                          {request.classification.installationClass} ·{" "}
                          {request.classification.accessContext}
                        </small>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card className="service-request-detail-card">
            {!selected ? (
              <Alert type="info" showIcon message="Selecciona un servicio para revisar" />
            ) : (
              <ServiceRequestDetail
                request={selected}
                onReview={() => setReviewOpen(true)}
                onDecline={decline}
                onSchedule={() => onSchedule(selected.id)}
              />
            )}
          </Card>
        </Col>
      </Row>

      {selected && (
        <AcceptanceModal
          request={selected}
          open={reviewOpen}
          onCancel={() => setReviewOpen(false)}
          onAccept={accept}
        />
      )}
    </div>
  );
}

function ServiceRequestDetail({
  request,
  onReview,
  onDecline,
  onSchedule,
}: {
  request: ServiceRequest;
  onReview: () => void;
  onDecline: () => void;
  onSchedule: () => void;
}) {
  return (
    <>
      <div className="service-request-detail-header">
        <div>
          <Space wrap>
            {requestStatusTag(request.status)}
            <Tag>{request.classification.serviceType}</Tag>
          </Space>
          <Typography.Title level={3} style={{ margin: "10px 0 4px" }}>
            {request.title}
          </Typography.Title>
          <Typography.Text type="secondary">
            {request.source} · {request.siteLabel}
          </Typography.Text>
        </div>
        {request.status === "Received" && request.acceptanceDueAt && (
          <div className="service-request-countdown">
            <b>{formatRemaining(request)}</b>
            <span>para aceptar</span>
          </div>
        )}
      </div>

      <Typography.Paragraph style={{ marginTop: 18 }}>{request.description}</Typography.Paragraph>
      <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
        <Descriptions.Item label="Orden externa">{request.externalReference}</Descriptions.Item>
        <Descriptions.Item label="Región">{request.region}</Descriptions.Item>
        <Descriptions.Item label="Instalación">
          {request.classification.installationClass}
        </Descriptions.Item>
        <Descriptions.Item label="Contexto">
          {request.classification.accessContext}
        </Descriptions.Item>
        <Descriptions.Item label="Recibido">
          {dayjs(request.receivedAt).format("DD MMM YYYY · HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Regla">
          {request.requiresAcceptance
            ? `${request.acceptancePolicy?.durationHours ?? 24} h para aceptar`
            : "Plan preventivo · sin aceptación"}
        </Descriptions.Item>
      </Descriptions>

      {!!request.accessRequirements.length && (
        <>
          <Divider>Preparación de acceso</Divider>
          <List
            size="small"
            dataSource={request.accessRequirements}
            renderItem={(item) => (
              <List.Item
                extra={
                  <Tag color={item.completed ? "green" : "orange"}>
                    {item.completed ? "Lista" : "Pendiente"}
                  </Tag>
                }
              >
                <List.Item.Meta
                  avatar={
                    item.completed ? (
                      <CheckCircleOutlined style={{ color: "#278a52" }} />
                    ) : (
                      <ClockCircleOutlined style={{ color: "#af6814" }} />
                    )
                  }
                  title={item.label}
                  description={item.detail}
                />
              </List.Item>
            )}
          />
        </>
      )}

      <Divider />
      {request.status === "Received" && (
        <Space style={{ width: "100%", justifyContent: "flex-end" }} wrap>
          <Button danger icon={<CloseOutlined />} onClick={onDecline}>
            Declinar
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={onReview}>
            Revisar y aceptar
          </Button>
        </Space>
      )}
      {request.status === "Accepted" && (
        <Alert
          type="success"
          showIcon
          message="Servicio aceptado y liberado para programación"
          action={
            <Button type="primary" onClick={onSchedule}>
              Programar servicio
            </Button>
          }
        />
      )}
      {request.status === "Expired" && (
        <Alert
          type="error"
          showIcon
          message="Ventana vencida · servicio no obtenido"
          description="El estado se conserva como evidencia operativa. No se puede programar."
        />
      )}
      {request.status === "Planned" && (
        <Alert
          type="info"
          showIcon
          message="Servicio preventivo programado"
          description={`Orden relacionada: ${request.scheduleId}`}
        />
      )}
    </>
  );
}

function AcceptanceModal({
  request,
  open,
  onCancel,
  onAccept,
}: {
  request: ServiceRequest;
  open: boolean;
  onCancel: () => void;
  onAccept: (classification: ServiceClassification) => void;
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      width={720}
      title="Aceptar servicio y confirmar clasificación"
      okText="Aceptar servicio"
      cancelText="Cancelar"
      onOk={() => onAccept(request.classification)}
    >
      <Alert
        type="warning"
        showIcon
        message={`${formatRemaining(request)} restantes de la ventana de aceptación`}
        description="Las 24 horas corresponden únicamente a aceptar el correctivo, no a resolverlo."
      />
      <Divider>Clasificación operativa</Divider>
      <Descriptions bordered size="small" column={{ xs: 1, md: 3 }}>
        <Descriptions.Item label="Tipo de servicio">
          {request.classification.serviceType}
        </Descriptions.Item>
        <Descriptions.Item label="Instalación">
          {request.classification.installationClass}
        </Descriptions.Item>
        <Descriptions.Item label="Contexto de acceso">
          {request.classification.accessContext}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Space>
        <SafetyCertificateOutlined style={{ color: activeDemo.branding.primaryColor }} />
        <Typography.Text type="secondary">
          La clasificación define protocolo, acceso, evidencia y ejecución; las tres dimensiones se
          guardan de forma independiente.
        </Typography.Text>
      </Space>
    </Modal>
  );
}

function requestStatusTag(status: ServiceRequestStatus) {
  const map: Record<ServiceRequestStatus, { color: string; label: string }> = {
    Received: { color: "orange", label: "Por aceptar" },
    Accepted: { color: "green", label: "Aceptado" },
    Declined: { color: "default", label: "Declinado" },
    Expired: { color: "red", label: "No obtenido" },
    Planned: { color: "blue", label: "Programado" },
  };
  return <Tag color={map[status].color}>{map[status].label}</Tag>;
}

function formatRemaining(request: ServiceRequest) {
  if (!request.acceptanceDueAt) return "Sin vencimiento";
  const totalSeconds = Math.max(0, dayjs(request.acceptanceDueAt).diff(demoNow(), "second"));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
