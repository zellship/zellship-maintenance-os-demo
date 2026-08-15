import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Card, Descriptions, Image, Space, Table, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  PrinterOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Execution, Protocol, Schedule } from "../types";
import { activeDemo } from "../../demo-config/active";
import { EvidenceGpsStamp } from "./EvidenceGpsStamp";
import {
  maintenanceAssetUrl,
  maintenanceCapturedUrl,
  maintenanceDefaultOperatorComment,
} from "./maintenanceAssets";
import { PrintReportFooter, PrintReportHeader } from "./PrintReport";
import { SendReportModal, type ReportDeliverySelection } from "./SendReportModal";

export function FieldServiceReport({
  execution,
  protocol,
  schedule,
  onSend,
}: {
  execution: Execution;
  protocol: Protocol;
  schedule: Schedule;
  onSend?: (selection: ReportDeliverySelection) => void;
}) {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const validated = execution.status === "Validated";
  const photos = execution.evidences.filter((evidence) => evidence.type === "Photo");
  const preInterventionPhotos = photos.filter((photo) => photo.phase === "Pre-intervention");
  const interventionPhotos = photos.filter((photo) => photo.phase === "Intervention");
  const postInterventionPhotos = photos.filter((photo) => photo.phase === "Post-intervention");
  const location = execution.evidences.find((evidence) => evidence.type === "GPS")?.gps ?? {
    lat: 25.6866,
    lng: -100.3161,
  };
  const startedAt = dayjs(execution.startAt);
  const completedAt = dayjs(execution.endAt ?? execution.startAt);
  const durationMinutes = Math.max(0, completedAt.diff(startedAt, "minute"));
  const diagnosis = answerText(execution.formAnswers.diagnosis, "Sin observaciones adicionales.");
  const operation = answerText(execution.formAnswers.operation, "Operación correcta");
  const notes = answerText(
    execution.formAnswers.notes,
    photos[photos.length - 1]?.operatorComment ?? maintenanceDefaultOperatorComment,
  );
  const actions = execution.workConcepts?.length
    ? execution.workConcepts.map(
        (concept) => `${concept.description} · ${concept.quantity} ${concept.unit}`,
      )
    : ["Ejecución completada conforme al protocolo asignado."];

  const printReport = () => {
    const previousTitle = document.title;
    document.title = `Nota informativa ${schedule.workOrder ?? "servicio"}`;
    window.print();
    document.title = previousTitle;
  };

  return (
    <div className="maintenance-result field-service-report">
      <PrintReportHeader
        documentTitle="Nota informativa de servicio"
        subject={schedule.workOrder ?? protocol.name}
        metadata={[
          { label: "Servicio", value: schedule.serviceReference ?? "—" },
          { label: "Activo", value: schedule.assetId ?? "—" },
          { label: "Revisión", value: `R${execution.revision ?? 1}` },
          { label: "Estado", value: validated ? "Aprobado" : "Completado" },
        ]}
      />

      <Card className="field-report-toolbar">
        <div>
          <Space wrap>
            <Tag color="green" icon={<CheckCircleOutlined />}>
              {validated ? "Servicio aprobado" : "Servicio completado"}
            </Tag>
            <Tag color="purple">{schedule.workOrder}</Tag>
            <Tag>R{execution.revision ?? 1}</Tag>
          </Space>
          <Typography.Title level={2}>Expediente del servicio</Typography.Title>
          <Typography.Text type="secondary">
            Formato de referencia adaptado: nota informativa, bitácora por fases y generador.
          </Typography.Text>
        </div>
        <Space wrap className="result-print-actions">
          <Button icon={<PrinterOutlined />} onClick={printReport}>
            Imprimir reporte
          </Button>
          {onSend && (
            <Button type="primary" icon={<SendOutlined />} onClick={() => setSendModalOpen(true)}>
              Enviar resultado
            </Button>
          )}
        </Space>
      </Card>

      <article className="field-report-sheet">
        <header className="field-report-titlebar">
          <div>
            <span>GESTIÓN DE INMUEBLES</span>
            <b>Reporte de servicio</b>
          </div>
          <div className="field-report-document-title">
            <strong>Nota Informativa</strong>
            <span>Mantenimiento ATM&apos;s Remotos</span>
          </div>
          <div>
            <strong>{activeDemo.branding.brandName}</strong>
            <span>Expediente operativo simulado</span>
          </div>
        </header>

        <ReportSection title="Datos generales">
          <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
            <Descriptions.Item label="ID principal">{schedule.assetId}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{completedAt.format("DD/MM/YYYY")}</Descriptions.Item>
            <Descriptions.Item label="Nombre">{schedule.siteLabel}</Descriptions.Item>
            <Descriptions.Item label="Proveedor">Proveedor demo</Descriptions.Item>
            <Descriptions.Item label="Tipo">
              {schedule.classification?.installationClass}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo mantto.">
              {schedule.classification?.serviceType}
            </Descriptions.Item>
          </Descriptions>
          <div className="field-report-context-line">
            <span>Contexto: {schedule.classification?.accessContext}</span>
            <span>Técnico: {execution.operator}</span>
            <span>Tiempo efectivo: {durationMinutes} min</span>
          </div>
        </ReportSection>

        <ReportSection title="1.- ANTECEDENTES">
          <p>{schedule.notes ?? "Servicio recibido, clasificado y asignado por coordinación."}</p>
        </ReportSection>

        <ReportSection title="2.- DIAGNÓSTICO">
          <p>{diagnosis}</p>
        </ReportSection>

        <ReportSection title="3.- ACCIONES">
          <ul>
            {actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="4.- CONCLUSIONES">
          <p>
            Estado: {operation}. {notes}
          </p>
        </ReportSection>

        <ReportPhotoSection
          title="5.- BITÁCORA FOTOGRÁFICA PRE INTERVENCIÓN"
          photos={preInterventionPhotos}
          fallbackLocation={location}
          startIndex={1}
        />
        <ReportPhotoSection
          title="6.- BITÁCORA FOTOGRÁFICA DE INTERVENCIÓN"
          photos={interventionPhotos}
          fallbackLocation={location}
          startIndex={preInterventionPhotos.length + 1}
        />
        <ReportPhotoSection
          title="7.- BITÁCORA FOTOGRÁFICA POST INTERVENCIÓN"
          photos={postInterventionPhotos}
          fallbackLocation={location}
          startIndex={preInterventionPhotos.length + interventionPhotos.length + 1}
        />

        <ReportSection title="8.- GENERADOR DE CONCEPTOS Y CANTIDADES">
          <Table
            className="field-report-concepts"
            rowKey="code"
            pagination={false}
            size="small"
            dataSource={execution.workConcepts ?? []}
            columns={[
              { title: "Código", dataIndex: "code", width: 110 },
              { title: "Descripción", dataIndex: "description" },
              { title: "Unidad", dataIndex: "unit", width: 100 },
              { title: "Cantidad", dataIndex: "quantity", width: 100 },
            ]}
          />
          <Typography.Text type="secondary" className="field-report-no-prices">
            Cantidades operativas. Esta demostración no incluye precios.
          </Typography.Text>
        </ReportSection>

        <ReportSection title="9.- VALIDACIÓN Y CONFORMIDAD">
          <div className="field-report-approval-grid">
            <div>
              <span>Elaboró</span>
              <b>{execution.operator}</b>
              <small>Técnico de campo</small>
            </div>
            <div>
              <span>Revisó</span>
              <b>{execution.approval?.supervisor ?? "Supervisión pendiente"}</b>
              <small>
                {execution.approval
                  ? `${dayjs(execution.approval.at).format("DD/MM/YYYY · HH:mm")} · ${execution.approval.comments}`
                  : "Pendiente de validación"}
              </small>
            </div>
            <div>
              <span>Ubicación</span>
              <b>
                <EnvironmentOutlined /> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </b>
              <small>GPS simulado dentro del radio configurado</small>
            </div>
          </div>
        </ReportSection>
      </article>

      <PrintReportFooter />
      {onSend && (
        <SendReportModal
          open={sendModalOpen}
          reportName={`Nota informativa · ${schedule.workOrder ?? "Servicio ATM"}`}
          onCancel={() => setSendModalOpen(false)}
          onSend={onSend}
        />
      )}
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="field-report-section">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function ReportPhotoSection({
  title,
  photos,
  fallbackLocation,
  startIndex,
}: {
  title: string;
  photos: Execution["evidences"];
  fallbackLocation: { lat: number; lng: number };
  startIndex: number;
}) {
  if (!photos.length) return null;

  return (
    <ReportSection title={title}>
      <div className="field-report-photo-grid">
        {photos.map((photo, index) => {
          const gps = photo.gps ?? fallbackLocation;
          return (
            <figure key={photo.id} className="field-report-photo">
              <div className="field-report-photo-frame">
                <Image
                  preview={false}
                  src={maintenanceAssetUrl(photo.data) ?? maintenanceCapturedUrl}
                  alt={photo.label ?? `Evidencia ${startIndex + index}`}
                />
                <EvidenceGpsStamp gps={gps} timestamp={photo.timestamp} compact />
              </div>
              <figcaption>
                <b>
                  {startIndex + index}. {photo.label ?? "Evidencia fotográfica"}
                </b>
                <span>
                  {phaseLabel(photo.phase)} · GPS {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </ReportSection>
  );
}

function answerText(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return fallback;
}

function phaseLabel(phase: Execution["evidences"][number]["phase"]) {
  if (phase === "Pre-intervention") return "Pre intervención";
  if (phase === "Intervention") return "Intervención";
  if (phase === "Post-intervention") return "Resultado final";
  return "Evidencia del servicio";
}
