import { Button, Space } from "antd";

const commonSections = [
  ["profile-overview", "Resumen"],
  ["profile-activity", "Actividad"],
  ["profile-incidents", "Incidencias"],
  ["profile-documents", "Documentos"],
] as const;

export function ProfileSectionNav({ variant }: { variant: "asset" | "person" }) {
  const sections = [
    commonSections[0],
    ["profile-plan", variant === "asset" ? "Estado y plan" : "Capacidad y carga"] as const,
    ...commonSections.slice(1),
  ];
  return (
    <Space className="profile-section-nav" wrap>
      {sections.map(([id, label]) => (
        <Button
          key={id}
          type="text"
          size="small"
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
        >
          {label}
        </Button>
      ))}
    </Space>
  );
}
