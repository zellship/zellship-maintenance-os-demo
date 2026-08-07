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
import { maintenanceCapturedUrl, maintenanceReferenceUrl } from "./maintenanceAssets";
import { PrintReportFooter, PrintReportHeader } from "./PrintReport";
import { SendReportModal, type ReportDeliverySelection } from "./SendReportModal";

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
  const findings = photo?.aiFindings ?? [
    "Guardas y componentes visibles",
    "Desgaste leve en borde de banda",
    "Alineación requiere seguimiento",
  ];
  const validated = execution.status === "Validated";
  const resultStatusLabel = validated ? "Mantenimiento validado" : "Mantenimiento completado";
  const operatorFirstName = execution.operator.split(" ")[0];
  const startedAt = dayjs(execution.startAt);
  const completedAt = dayjs(execution.endAt ?? execution.startAt);
  const eventTime = (moment: dayjs.Dayjs) => moment.format("HH:mm");

  const printReport = () => {
    const previousTitle = document.title;
    document.title = `Reporte ${schedule?.workOrder ?? "OT-2407-013"}`;
    window.print();
    document.title = previousTitle;
  };

  return (
    <div className="maintenance-result">
      <PrintReportHeader
        documentTitle="Reporte de mantenimiento"
        subject={protocol.name}
        metadata={[
          { label: "Orden", value: schedule?.workOrder ?? "OT-2407-013" },
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
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={16}>
          <Card
            title="Comparación visual contra el estándar"
            extra={<Tag color="purple">AI Vision · {aiScore}% match</Tag>}
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
                  Condición esperada: bandas alineadas, tensión uniforme y zona limpia.
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
                  message={`Observación IA · Coincidencia ${aiScore}%`}
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
                    {photo?.operatorComment ?? "Programar ajuste en próxima ventana."}
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
                      <b>{eventTime(startedAt)} · Ubicación verificada</b>
                      <br />
                      <Typography.Text type="secondary">
                        GPS dentro de radio permitido · 34 m
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>{eventTime(startedAt.add(3, "minute"))} · Recursos confirmados</b>
                      <br />
                      <Typography.Text type="secondary">
                        Skills, LOTO, torquímetro e inventario
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>{eventTime(completedAt.subtract(20, "minute"))} · Evidencia capturada</b>
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
                      <b>{eventTime(completedAt.subtract(19, "minute"))} · Análisis automático</b>
                      <br />
                      <Typography.Text type="secondary">
                        AI Vision 86% · 2 observaciones
                      </Typography.Text>
                    </>
                  ),
                },
                {
                  color: "green",
                  children: (
                    <>
                      <b>{eventTime(completedAt.subtract(2, "minute"))} · Formulario y firma</b>
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
                {execution.approval?.supervisor ?? "Roberto Salas"}
              </Descriptions.Item>
              <Descriptions.Item label="Integridad">
                <Tag color="green" icon={<AimOutlined />}>
                  Evidencia completa
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Engines">
                Entity · Commitment · Operational Excellence
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
              message="Activo apto para retorno a servicio"
              description="La ejecución cumple el estándar. La observación de tensión no bloquea la liberación; el sistema generó una inspección de seguimiento para la próxima ventana."
            />
            <Space wrap style={{ marginTop: 12 }}>
              <Tag color="green">Activo {schedule?.assetId ?? "actualizado"} actualizado</Tag>
              <Tag color="blue">Historial técnico registrado</Tag>
              <Tag color="purple">OEE recalculado</Tag>
              <Tag color="orange">Seguimiento generado</Tag>
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
