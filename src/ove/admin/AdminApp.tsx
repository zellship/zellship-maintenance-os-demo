import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  FileProtectOutlined,
  AlertOutlined,
  HistoryOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ToolOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  BellOutlined,
  BranchesOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
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
import { OperationalFlows } from "./OperationalFlows";

type Key =
  | "dashboard"
  | "catalog"
  | "flows"
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);

  return (
    <Layout>
      <Layout.Sider
        className="maintenance-sider"
        breakpoint="lg"
        collapsed={collapsed}
        collapsedWidth={mobile ? 0 : 72}
        collapsible
        onBreakpoint={(broken) => {
          setMobile(broken);
          if (broken) setCollapsed(true);
        }}
        onCollapse={setCollapsed}
        trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        width={230}
        style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
      >
        <Menu
          mode="inline"
          selectedKeys={[key]}
          onClick={(e) => setKey(e.key as Key)}
          style={{ borderRight: 0, paddingTop: 12 }}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: "Centro de control",
            },
            {
              key: "design",
              icon: <BranchesOutlined />,
              label: "Diseño y orquestación",
              children: [
                { key: "catalog", icon: <FileProtectOutlined />, label: "Protocolos" },
                { key: "flows", icon: <BranchesOutlined />, label: "Flujos operativos" },
              ],
            },
            {
              key: "execution",
              icon: <AppstoreOutlined />,
              label: "Planeación y ejecución",
              children: [
                { key: "planning", icon: <CalendarOutlined />, label: "Programación" },
                { key: "orders", icon: <ToolOutlined />, label: "Órdenes de trabajo" },
                {
                  key: "results",
                  icon: <SafetyCertificateOutlined />,
                  label: "Resultados",
                },
              ],
            },
            {
              key: "entities",
              icon: <ApartmentOutlined />,
              label: "Activos y recursos",
              children: [
                { key: "assets", icon: <DeploymentUnitOutlined />, label: "Activos" },
                { key: "resources", icon: <TeamOutlined />, label: "Recursos" },
              ],
            },
            {
              key: "governance",
              icon: <SafetyCertificateOutlined />,
              label: "Control y cumplimiento",
              children: [
                { key: "incidents", icon: <AlertOutlined />, label: "Incidencias" },
                {
                  key: "notifications",
                  icon: <BellOutlined />,
                  label: "Notificaciones",
                },
                { key: "bitacora", icon: <HistoryOutlined />, label: "Bitácora" },
              ],
            },
            {
              key: "analytics",
              icon: <BarChartOutlined />,
              label: "Analítica",
              children: [{ key: "reportes", icon: <BarChartOutlined />, label: "Reportes" }],
            },
          ]}
        />
      </Layout.Sider>
      <Layout.Content
        style={{ padding: 24, background: "#f5f6fa", minHeight: "calc(100vh - 64px)" }}
      >
        {key === "dashboard" && <OperationsLive onNav={(k) => setKey(k as Key)} />}
        {key === "catalog" && <ProtocolCatalog onNew={() => setKey("new")} />}
        {key === "flows" && <OperationalFlows />}
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
