import { useState } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
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
import { hasCapability } from "../../demo-config/active";

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
  const [requestedOrderId, setRequestedOrderId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);

  const navigate = (nextKey: Key, orderId: string | null = null) => {
    setRequestedOrderId(orderId);
    setKey(nextKey);
  };

  const executionItems = [
    ...(hasCapability("planning")
      ? [{ key: "planning", icon: <CalendarOutlined />, label: "Programación" }]
      : []),
    ...(hasCapability("work-orders")
      ? [{ key: "orders", icon: <ToolOutlined />, label: "Órdenes de trabajo" }]
      : []),
    ...(hasCapability("maintenance-results")
      ? [{ key: "results", icon: <SafetyCertificateOutlined />, label: "Resultados" }]
      : []),
  ];
  const entityItems = [
    ...(hasCapability("asset-management")
      ? [{ key: "assets", icon: <DeploymentUnitOutlined />, label: "Activos" }]
      : []),
    ...(hasCapability("resource-management")
      ? [{ key: "resources", icon: <TeamOutlined />, label: "Recursos" }]
      : []),
  ];
  const governanceItems = [
    ...(hasCapability("incident-management")
      ? [{ key: "incidents", icon: <AlertOutlined />, label: "Incidencias" }]
      : []),
    ...(hasCapability("notifications")
      ? [{ key: "notifications", icon: <BellOutlined />, label: "Notificaciones" }]
      : []),
    ...(hasCapability("audit-log")
      ? [{ key: "bitacora", icon: <HistoryOutlined />, label: "Bitácora" }]
      : []),
  ];
  const designItems = [
    ...(hasCapability("protocol-management")
      ? [{ key: "catalog", icon: <FileProtectOutlined />, label: "Protocolos" }]
      : []),
    ...(hasCapability("operational-flows")
      ? [{ key: "flows", icon: <BranchesOutlined />, label: "Flujos operativos" }]
      : []),
  ];
  const menuItems: MenuProps["items"] = [
    ...(hasCapability("admin-control-center")
      ? [{ key: "dashboard", icon: <DashboardOutlined />, label: "Centro de control" }]
      : []),
    ...(executionItems.length
      ? [
          {
            key: "execution",
            icon: <AppstoreOutlined />,
            label: "Operaciones",
            children: executionItems,
          },
        ]
      : []),
    ...(entityItems.length
      ? [
          {
            key: "entities",
            icon: <ApartmentOutlined />,
            label: "Recursos",
            children: entityItems,
          },
        ]
      : []),
    ...(governanceItems.length
      ? [
          {
            key: "governance",
            icon: <SafetyCertificateOutlined />,
            label: "Control",
            children: governanceItems,
          },
        ]
      : []),
    ...(designItems.length
      ? [
          {
            key: "design",
            icon: <BranchesOutlined />,
            label: "Configuraciones",
            children: designItems,
          },
        ]
      : []),
    ...(hasCapability("executive-analytics")
      ? [
          {
            key: "analytics",
            icon: <BarChartOutlined />,
            label: "Análisis",
            children: [{ key: "reportes", icon: <BarChartOutlined />, label: "Reportes" }],
          },
        ]
      : []),
  ];

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
          onClick={(e) => navigate(e.key as Key)}
          style={{ borderRight: 0, paddingTop: 12 }}
          items={menuItems}
        />
      </Layout.Sider>
      <Layout.Content
        style={{ padding: 24, background: "#f5f6fa", minHeight: "calc(100vh - 64px)" }}
      >
        {key === "dashboard" && (
          <OperationsLive
            onNav={(nextKey) => navigate(nextKey as Key)}
            onOpenOrder={(orderId) => navigate("orders", orderId)}
          />
        )}
        {key === "catalog" && <ProtocolCatalog onNew={() => setKey("new")} />}
        {key === "flows" && <OperationalFlows />}
        {key === "new" && <ProtocolWizard onDone={() => setKey("catalog")} />}
        {key === "planning" && <Planning onOpenOrder={(orderId) => navigate("orders", orderId)} />}
        {key === "orders" && <WorkOrders initialSelectedId={requestedOrderId} />}
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
