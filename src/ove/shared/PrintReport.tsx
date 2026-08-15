import { ThunderboltOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { demoNow } from "../../demo-config/clock";
import { activeDemo } from "../../demo-config/active";

interface ReportMetadata {
  label: string;
  value: string;
}

export function PrintReportHeader({
  documentTitle,
  subject,
  metadata,
}: {
  documentTitle: string;
  subject: string;
  metadata: ReportMetadata[];
}) {
  return (
    <header className="print-report-header">
      <div className="print-report-brand">
        <div className="print-report-brand-mark">
          <ThunderboltOutlined />
        </div>
        <div>
          <strong>{activeDemo.branding.productName}</strong>
          <span>{activeDemo.branding.tagline} · Documento controlado</span>
        </div>
      </div>
      <div className="print-report-document">
        <span>{documentTitle}</span>
        <strong>{subject}</strong>
      </div>
      <div className="print-report-metadata">
        {metadata.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
        <div>
          <span>Emitido</span>
          <strong>{demoNow().format("DD/MM/YYYY · HH:mm")}</strong>
        </div>
      </div>
    </header>
  );
}

export function PrintReportFooter() {
  return (
    <footer className="print-report-footer">
      <span>
        {activeDemo.branding.productName} · {activeDemo.branding.tagline.split(" · ")[0]}
      </span>
      <span>Uso interno · Información operativa del activo</span>
    </footer>
  );
}
