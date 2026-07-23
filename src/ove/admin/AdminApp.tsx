import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileProtectOutlined,
  PlusCircleOutlined,
  AlertOutlined,
  HistoryOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ToolOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  BellOutlined,
  BranchesOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { AdminDashboard } from "./AdminDashboard";
import { ProtocolCatalog } from "./ProtocolCatalog";
import { ProtocolWizard } from "./ProtocolWizard";
import { IncidentsList } from "./IncidentsList";
import { Bitacora } from "./Bitacora";
import { Reportes } from "./Reportes";
import { Planning } from "./Planning";
import { WorkOrders } from "./WorkOrders";
import { Assets } from "./Assets";
import { Resources } from "./Resources";
import { MaintenanceResults } from "./MaintenanceResults";
import { NotificationCenter } from "../shared/NotificationCenter";
import { OperationsLive } from "./OperationsLive";

type Key =
  | "dashboard"
  | "live"
  | "catalog"
  | "new"
  | "planning"
  | "orders"
  | "results"
  | "assets"
  | "resources"
  | "notifications"
  | "incidents"
  | "bitacora"
  | "reportes";

export function AdminApp() {
  const [key, setKey] = useState<Key>("dashboard");

  return (
    <Layout>
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth={0}
        width={230}
        style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
      >
        <Menu
          mode="inline"
          selectedKeys={[key]}
          onClick={(e) => setKey(e.key as Key)}
          style={{ borderRight: 0, paddingTop: 12 }}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "live", icon: <BranchesOutlined />, label: "Centro en vivo" },
            { key: "catalog", icon: <FileProtectOutlined />, label: "Protocolos" },
            { key: "new", icon: <PlusCircleOutlined />, label: "Nuevo Protocolo" },
            { key: "planning", icon: <CalendarOutlined />, label: "Programación" },
            { key: "orders", icon: <ToolOutlined />, label: "Órdenes de trabajo" },
            { key: "results", icon: <SafetyCertificateOutlined />, label: "Resultados" },
            { key: "assets", icon: <DeploymentUnitOutlined />, label: "Activos" },
            { key: "resources", icon: <TeamOutlined />, label: "Recursos" },
            { key: "notifications", icon: <BellOutlined />, label: "Notificaciones" },
            { key: "incidents", icon: <AlertOutlined />, label: "Incidencias" },
            { key: "bitacora", icon: <HistoryOutlined />, label: "Bitácora" },
            { key: "reportes", icon: <BarChartOutlined />, label: "Reportes" },
          ]}
        />
      </Layout.Sider>
      <Layout.Content
        style={{ padding: 24, background: "#f5f6fa", minHeight: "calc(100vh - 64px)" }}
      >
        {key === "dashboard" && <AdminDashboard onNav={(k) => setKey(k as Key)} />}
        {key === "live" && <OperationsLive />}
        {key === "catalog" && <ProtocolCatalog onNew={() => setKey("new")} />}
        {key === "new" && <ProtocolWizard onDone={() => setKey("catalog")} />}
        {key === "planning" && <Planning />}
        {key === "orders" && <WorkOrders />}
        {key === "results" && <MaintenanceResults />}
        {key === "assets" && <Assets />}
        {key === "resources" && <Resources />}
        {key === "notifications" && <NotificationCenter role="admin" showAll />}
        {key === "incidents" && <IncidentsList />}
        {key === "bitacora" && <Bitacora />}
        {key === "reportes" && <Reportes />}
      </Layout.Content>
    </Layout>
  );
}
