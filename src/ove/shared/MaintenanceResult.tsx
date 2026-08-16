import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  Progress,
  Rate,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  AimOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Execution, Protocol, Schedule } from "../types";
import {
  maintenanceAiFindings,
  maintenanceCapturedUrl,
  maintenanceDefaultOperatorComment,
  maintenanceEvidenceGuidance,
  maintenanceReferenceUrl,
} from "./maintenanceAssets";
import { PrintReportFooter, PrintReportHeader } from "./PrintReport";
import { SendReportModal, type ReportDeliverySelection } from "./SendReportModal";
import { activeDemo, hasCapability } from "../../demo-config/active";
import { FieldServiceReport } from "./FieldServiceReport";

export function MaintenanceResult({
  execution,
  protocol,
  schedule,
  onSend,
}: {
  execution: Execution;
  protocol: Protocol;
  schedule?: Schedule;
  onSend?: (selection: ReportDeliverySelection) => void;
}) {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const photo = execution.evidences.find((e) => e.type === "Photo");
  const aiScore = photo?.aiScore ?? 86;
  const humanScore = photo?.humanScore ?? execution.humanScore ?? 4;
  const findings = photo?.aiFindings ?? maintenanceAiFindings;
  const validated = execution.status === "Validated";
  const resultStatusLabel = validated ? "Mantenimiento validado" : "Mantenimiento completado";
  const operatorFirstName = execution.operator.split(" ")[0];
  const startedAt = dayjs(execution.startAt);
  const completedAt = dayjs(execution.endAt ?? execution.startAt);
  const eventTime = (moment: dayjs.Dayjs) => moment.format("HH:mm");
  const chronologicalEvidence = execution.evidences
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const firstEvidenceAt = dayjs(chronologicalEvidence[0]?.timestamp ?? execution.startAt);
  const lastEvidenceAt = dayjs(
    chronologicalEvidence[chronologicalEvidence.length - 1]?.timestamp ?? execution.endAt,
  );
  const showImprovement = hasCapability("improvement-insights");
  const durationMinutes = Math.max(0, completedAt.diff(startedAt, "minute"));
  const isFieldService = Boolean(schedule?.classification);

  const printReport = () => {
    const previousTitle = document.title;
    document.title = `Reporte ${schedule?.workOrder ?? "OT-2407-013"}`;
    window.print();
    document.title = previousTitle;
  };

  if (isFieldService && schedule) {
    return (
      <FieldServiceReport
        execution={execution}
        protocol={protocol}
        schedule={schedule}
        onSend={onSend}
      />
    );
  }

  return (
    <div className="maintenance-result">
      <PrintReportHeader
        documentTitle="Reporte de mantenimiento"
        subject={protocol.name}
        metadata={[
          { label: "Orden", value: schedule?.workOrder ?? "OT-2407-013" },
          ...(schedule?.serviceReference
            ? [{ label: "Servicio", value: schedule.serviceReference }]
            : []),
          ...(schedule?.siteLabel ? [{ label: "Sitio", value: schedule.siteLabel }] : []),
          { label: "Activo", value: schedule?.assetId ?? "AC-01" },
          { label: "Estado", value: validated ? "Validado" : "Completado" },
        ]}
      />
      <Card className="result-hero">
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Space wrap>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                {resultStatusLabel}
              </Tag>
              <Tag color="purple">{schedule?.workOrder ?? "OT-2407-013"}</Tag>
              <Tag>{schedule?.assetId ?? "AC-01"}</Tag>
              {execution.revision && <Tag>R{execution.revision}</Tag>}
            </Space>
            <Typography.Title level={2} style={{ margin: "10px 0 4px" }}>
              Resultado del mantenimiento
            </Typography.Title>
            <Typography.Text type="secondary">
              {protocol.name} · evidencia, decisión y efecto operacional en una sola vista
            </Typography.Text>
          </div>
          <Space className="result-print-actions" wrap>
            <Button icon={<PrinterOutlined />} onClick={printReport}>
              Imprimir reporte
            </Button>
            {onSend && (
              <Button type="primary" icon={<SendOutlined />} onClick={() => setSendModalOpen(true)}>
                Enviar resultado
              </Button>
            )}
          </Space>
        </Space>

        <Row gutter={[12, 12]} style={{ marginTop: 20 }}>
          <Col xs={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Calificación final"
                value={execution.score ?? 91}
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          {showImprovement ? (
            <>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Salud del activo"
                    value={94}
                    prefix={<SafetyCertificateOutlined />}
                    suffix="%"
                    valueStyle={{ color: "#7B35C1" }}
                  />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Impacto estimado OEE"
                    value={1.8}
                    prefix={<ThunderboltOutlined />}
                    suffix=" pts"
                  />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Paro evitado"
                    value={4.2}
                    prefix={<ClockCircleOutlined />}
                    suffix=" h"
                  />
                </Card>
              </Col>
            </>
          ) : (
            <>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic
                    title="Tiempo efectivo"
                    value={durationMinutes}
                    prefix={<ClockCircleOutlined />}
                    suffix=" min"
                  />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic title="Evidencias" value={execution.evidences.length} />
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card size="small">
                  <Statistic title="Conceptos" value={execution.workConcepts?.length ?? 0} />
                </Card>
              </Col>
            </>
          )}
        </Row>
      </Card>

      {(schedule?.classification || execution.workConcepts?.length) && (
        <Card title="Resumen operativo" style={{ marginTop: 16 }}>
          {schedule?.classification && (
            <Descriptions bordered size="small" column={{ xs: 1, md: 3 }}>
              <Descriptions.Item label="Servicio">
                {schedule.classification.serviceType}
              </Descriptions.Item>
              <Descriptions.Item label="Instalación">
                {schedule.classification.installationClass}
              </Descriptions.Item>
              <Descriptions.Item label="Contexto">
                {schedule.classification.accessContext}
              </Descriptions.Item>
            </Descriptions>
          )}
          {!!execution.workConcepts?.length && (
            <>
              <Divider>Conceptos ejecutados · sin precios</Divider>
              <Descriptions bordered size="small" column={1}>
                {execution.workConcepts.map((concept) => (
                  <Descriptions.Item key={concept.code} label={concept.code}>
                    {concept.description} · {concept.quantity} {concept.unit}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </>
          )}
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card
            title="Comparación visual contra el estándar"
            extra={<Tag color="purple">Validación visual simulada · {aiScore}%</Tag>}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} md={12}>
                <div className="evidence-image-label">
                  <span>1</span> Imagen patrón del protocolo
                </div>
                <Image
                  src={maintenanceReferenceUrl}
                  alt={`Imagen patrón del activo ${schedule?.assetId ?? "en mantenimiento"}`}
                  className="evidence-result-image"
                />
                <Typography.Paragraph type="secondary" style={{ margin: "8px 0 0" }}>
                  {maintenanceEvidenceGuidance}
                </Typography.Paragraph>
              </Col>
              <Col xs={24} md={12}>
                <div className="evidence-image-label captured">
                  <span>2</span> Evidencia capturada por {operatorFirstName}
                </div>
                <Image
                  src={maintenanceCapturedUrl}
                  alt={`Evidencia capturada del activo ${schedule?.assetId ?? "en mantenimiento"}`}
                  className="evidence-result-image"
                />
                <Typography.Paragraph type="secondary" style={{ margin: "8px 0 0" }}>
                  Captura móvil · {dayjs(execution.endAt).format("DD MMM YYYY · HH:mm")}
                </Typography.Paragraph>
              </Col>
            </Row>

            <Divider />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={15}>
                <Alert
                  type={aiScore >= 90 ? "success" : "warning"}
                  showIcon
                  message={`Resultado visual simulado · Coincidencia ${aiScore}%`}
                  description={
                    <Space wrap style={{ marginTop: 8 }}>
                      {findings.map((finding, index) => (
                        <Tag color={index === 0 ? "green" : "orange"} key={finding}>
                          {finding}
                        </Tag>
                      ))}
                    </Space>
                  }
                />
              </Col>
              <Col xs={24} md={9}>
                <Card size="small" title="Evaluación del operador">
                  <Rate disabled value={humanScore} />
                  <div>
                    <Typography.Text strong>{humanScore}/5</Typography.Text>{" "}
                    <Typography.Text type="secondary">· condición operable</Typography.Text>
                  </div>
                  <Typography.Paragraph type="secondary" style={{ margin: "6px 0 0" }}>
                    {photo?.operatorComment ?? maintenanceDefaultOperatorComment}
                  </Typography.Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Trazabilidad de la ejecución">
            <Timeline
              items={[
                {
                  color: "green",
                  children: (
                    <>
                      <b>{eventTime(startedAt)} · Ubicación simulada registrada</b>
                      <br />
                      <Typography.Text type="secondary">
                        GPS simulado dentro del radio configurado · 34 m
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>
                        {eventTime(dayjs(execution.resourceCheckInAt ?? startedAt))} · Recursos
                        confirmados
                      </b>
                      <br />
                      <Typography.Text type="secondary">
                        Skills, herramientas e inventario confirmados
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>{eventTime(firstEvidenceAt)} · Evidencia capturada</b>
                      <br />
                      <Typography.Text type="secondary">
                        Toma móvil · ángulo oblicuo · imagen original
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "purple",
                  children: (
                    <>
                      <b>{eventTime(firstEvidenceAt.add(1, "minute"))} · Análisis automático</b>
                      <br />
                      <Typography.Text type="secondary">
                        Validación visual simulada · {aiScore}%
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>{eventTime(lastEvidenceAt)} · Formulario y firma</b>
                      <br />
                      <Typography.Text type="secondary">5 inputs · firma vinculada</Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>
                        {eventTime(completedAt)} ·{" "}
                        {validated ? "Supervisor aprobó" : "Ejecución completada"}
                      </b>
                      <br />
                      <Typography.Text type="secondary">
                        Resultado {execution.score ?? 91}% · activo liberado
                      </Typography.Text>
                    </>
                  ),
                },
              ]}
            />
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Operador">{execution.operator}</Descriptions.Item>
              <Descriptions.Item label="Supervisor">
                {execution.approval?.supervisor ??
                  activeDemo.context.loginProfiles.find((profile) => profile.role === "supervisor")
                    ?.name ??
                  "Supervisión"}
              </Descriptions.Item>
              <Descriptions.Item label="Integridad">
                <Tag color="green" icon={<AimOutlined />}>
                  Evidencia completa
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Engines">
                {showImprovement
                  ? "Entity · Commitment · Operational Excellence"
                  : "Entity · Commitment"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Decisión y siguiente mejor acción" style={{ marginTop: 16 }}>
        <Row gutter={[20, 12]} align="middle">
          <Col xs={24} md={7}>
            <Typography.Text type="secondary">Score compuesto</Typography.Text>
            <Progress type="dashboard" percent={execution.score ?? 91} strokeColor="#7B35C1" />
          </Col>
          <Col xs={24} md={17}>
            <Alert
              type="success"
              showIcon
              message={
                isFieldService
                  ? "Servicio aprobado y expediente listo para entrega"
                  : "Activo apto para retorno a servicio"
              }
              description={
                isFieldService
                  ? "La ejecución cumple el protocolo configurado y consolida evidencias, conceptos, cantidades y tiempo efectivo sin incluir precios."
                  : "La ejecución cumple el estándar. La observación de tensión no bloquea la liberación; el sistema generó una inspección de seguimiento para la próxima ventana."
              }
            />
            <Space wrap style={{ marginTop: 12 }}>
              <Tag color="green">Activo {schedule?.assetId ?? "actualizado"} actualizado</Tag>
              <Tag color="blue">
                {isFieldService ? "Expediente consolidado" : "Historial técnico registrado"}
              </Tag>
              {showImprovement && <Tag color="purple">OEE recalculado</Tag>}
              <Tag color="orange">
                {isFieldService ? "Listo para entrega" : "Seguimiento generado"}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>
      <PrintReportFooter />
      {onSend && (
        <SendReportModal
          open={sendModalOpen}
          reportName={`Reporte de mantenimiento · ${schedule?.workOrder ?? "OT-2407-013"}`}
          onCancel={() => setSendModalOpen(false)}
          onSend={onSend}
        />
      )}
    </div>
  );
}
