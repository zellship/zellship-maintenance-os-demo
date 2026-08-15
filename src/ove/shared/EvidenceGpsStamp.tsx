import { EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export function EvidenceGpsStamp({
  gps,
  timestamp,
  compact = false,
}: {
  gps: { lat: number; lng: number };
  timestamp: string;
  compact?: boolean;
}) {
  return (
    <div className={`evidence-gps-stamp${compact ? " compact" : ""}`}>
      <EnvironmentOutlined />
      <div>
        <b>
          {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
        </b>
        <span>{dayjs(timestamp).format("DD/MM/YYYY · HH:mm:ss")} · GPS simulado</span>
      </div>
    </div>
  );
}
