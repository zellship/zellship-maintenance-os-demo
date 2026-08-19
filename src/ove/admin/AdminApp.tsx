import { useState } from "react";
import { Button, Layout, Menu, Tooltip } from "antd";
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
  PlusOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
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
import { ServiceRequests } from "./ServiceRequests";
import { useStore } from "../store";
import { SupervisorValidations } from "../supervisor/SupervisorValidations";
import { QuickWorkOrderModal } from "./QuickWorkOrderModal";
import { advanceDemoClock } from "../../demo-config/clock";
import { RetailOperationsDashboard } from "../retail/RetailOperationsDashboard";
import { RetailSupportCases } from "../retail/RetailSupportCases";
import { StoreProgram } from "../retail/StoreProgram";
import { NewStoreAssignmentModal } from "../retail/NewStoreAssignmentModal";

type Key =
  | "dashboard"
  | "catalog"
  | "flows"
  | "new"
  | "planning"
  | "orders"
  | "results"
  | "requests"
  | "store-program"
  | "support"
  | "validations"
  | "assets"
  | "resources"
  | "notifications"
  | "incidents"
  | "bitacora"
  | "reportes";

export function AdminApp() {
  const { serviceRequests, incidents, setIncidents } = useStore();
  const [key, setKey] = useState<Key>("dashboard");
  const [requestedOrderId, setRequestedOrderId] = useState<string | null>(null);
  const [requestedServiceRequestId, setRequestedServiceRequestId] = useState<string | null>(null);
  const [requestedProtocolId, setRequestedProtocolId] = useState<string | null>(null);
  const [requestedExecutionId, setRequestedExecutionId] = useState<string | null>(null);
  const [requestedSupportCaseId, setRequestedSupportCaseId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [quickOrderContext, setQuickOrderContext] = useState<{
    assetId?: string;
    note?: string;
    incidentId?: string;
  }>({});

  const navigate = (nextKey: Key, orderId: string | null = null) => {
    setRequestedOrderId(orderId);
    setKey(nextKey);
  };

  const executionItems = [
    ...(hasCapability("store-operations")
      ? [{ key: "store-program", icon: <ShopOutlined />, label: "Programa de tiendas" }]
      : []),
    ...(hasCapability("support-case-management")
      ? [{ key: "support", icon: <CustomerServiceOutlined />, label: "Solicitudes de soporte" }]
      : []),
    ...(hasCapability("planning")
      ? [{ key: "planning", icon: <CalendarOutlined />, label: "Programación" }]
      : []),
    ...(hasCapability("work-orders")
      ? [{ key: "orders", icon: <ToolOutlined />, label: "Órdenes de trabajo" }]
      : []),
    ...(hasCapability("maintenance-results")
      ? [{ key: "results", icon: <SafetyCertificateOutlined />, label: "Resultados" }]
      : []),
    ...(hasCapability("supervisor-validation") && serviceRequests.length
      ? [{ key: "validations", icon: <SafetyCertificateOutlined />, label: "Validaciones" }]
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
  const dashboardItems: MenuProps["items"] = hasCapability("admin-control-center")
    ? [
        {
          key: "dashboard",
          icon: <DashboardOutlined />,
          label: hasCapability("store-operations")
            ? "Centro de tiendas"
            : serviceRequests.length
              ? "Centro operativo"
              : "Centro de control",
        },
      ]
    : [];
  const menuItems: MenuProps["items"] = [
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
          items={dashboardItems}
        />
        {hasCapability("store-operations") && (
          <div className={`sidebar-quick-order ${collapsed ? "is-collapsed" : ""}`}>
            <Tooltip title={collapsed ? "Nueva asignación" : undefined} placement="right">
              <Button
                type="primary"
                size="large"
                shape={collapsed ? "circle" : "default"}
                block={!collapsed}
                icon={<PlusOutlined />}
                aria-label="Crear nueva asignación para tienda"
                onClick={() => setAssignmentOpen(true)}
              >
                {!collapsed && "Nueva asignación"}
              </Button>
            </Tooltip>
          </div>
        )}
        {!hasCapability("store-operations") && (
          <div className={`sidebar-quick-order ${collapsed ? "is-collapsed" : ""}`}>
            <Tooltip title={collapsed ? "Nueva orden" : undefined} placement="right">
              <Button
                type="primary"
                size="large"
                shape={collapsed ? "circle" : "default"}
                block={!collapsed}
                icon={<PlusOutlined />}
                aria-label="Crear nueva orden de trabajo"
                onClick={() => {
                  setQuickOrderContext({});
                  setQuickOrderOpen(true);
                }}
              >
                {!collapsed && "Nueva orden"}
              </Button>
            </Tooltip>
          </div>
        )}
        <Menu
          mode="inline"
          selectedKeys={[key]}
          onClick={(e) => navigate(e.key as Key)}
          style={{ borderRight: 0 }}
          items={menuItems}
        />
      </Layout.Sider>
      <Layout.Content
        style={{ padding: 24, background: "#f5f6fa", minHeight: "calc(100vh - 64px)" }}
      >
        {mobile && hasCapability("store-operations") && (
          <div className="quick-order-action-bar">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setAssignmentOpen(true)}
            >
              Nueva asignación
            </Button>
          </div>
        )}
        {mobile && !hasCapability("store-operations") && (
          <div className="quick-order-action-bar">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setQuickOrderContext({});
                setQuickOrderOpen(true);
              }}
            >
              Nueva orden
            </Button>
          </div>
        )}
        {key === "dashboard" && hasCapability("store-operations") && (
          <RetailOperationsDashboard
            onOpenProgram={() => navigate("store-program")}
            onNewAssignment={() => setAssignmentOpen(true)}
            onOpenSupport={(caseId) => {
              setRequestedSupportCaseId(caseId ?? null);
              navigate("support");
            }}
          />
        )}
        {key === "dashboard" && !hasCapability("store-operations") && (
          <OperationsLive
            onNav={(nextKey) => navigate(nextKey as Key)}
            onOpenOrder={(orderId) => navigate("orders", orderId)}
            onScheduleRequest={(requestId) => {
              setRequestedProtocolId(null);
              setRequestedServiceRequestId(requestId);
              navigate("planning");
            }}
            onScheduleProtocol={(protocolId) => {
              setRequestedServiceRequestId(null);
              setRequestedProtocolId(protocolId);
              navigate("planning");
            }}
            onOpenValidation={(executionId) => {
              setRequestedExecutionId(executionId);
              navigate("validations");
            }}
          />
        )}
        {key === "store-program" && <StoreProgram onNew={() => setAssignmentOpen(true)} />}
        {key === "support" && <RetailSupportCases initialCaseId={requestedSupportCaseId} />}
        {key === "catalog" && <ProtocolCatalog onNew={() => setKey("new")} />}
        {key === "flows" && <OperationalFlows />}
        {key === "new" && <ProtocolWizard onDone={() => setKey("catalog")} />}
        {key === "requests" && (
          <ServiceRequests
            onSchedule={(requestId) => {
              setRequestedProtocolId(null);
              setRequestedServiceRequestId(requestId);
              navigate("planning");
            }}
          />
        )}
        {key === "planning" && (
          <Planning
            initialProtocolId={requestedProtocolId}
            initialServiceRequestId={requestedServiceRequestId}
            onProtocolRequestConsumed={() => setRequestedProtocolId(null)}
            onServiceRequestConsumed={() => setRequestedServiceRequestId(null)}
          />
        )}
        {key === "orders" && <WorkOrders initialSelectedId={requestedOrderId} />}
        {key === "results" && <MaintenanceResults />}
        {key === "validations" && (
          <SupervisorValidations initialSelectedId={requestedExecutionId} />
        )}
        {key === "assets" && <Assets />}
        {key === "resources" && <Resources />}
        {key === "notifications" && <NotificationCenter role="admin" showAll />}
        {key === "incidents" && (
          <IncidentsList
            onCreateOrder={(incident) => {
              setQuickOrderContext({
                assetId: incident.assetId,
                note: incident.description,
                incidentId: incident.id,
              });
              setQuickOrderOpen(true);
            }}
          />
        )}
        {key === "bitacora" && <Bitacora />}
        {key === "reportes" && <Reportes />}
        {!hasCapability("store-operations") && (
          <QuickWorkOrderModal
            open={quickOrderOpen}
            initialAssetId={quickOrderContext.assetId}
            initialNote={quickOrderContext.note}
            onCancel={() => setQuickOrderOpen(false)}
            onOpenPlanning={() => {
              setQuickOrderOpen(false);
              navigate("planning");
            }}
            onCreated={(scheduleId) => {
              if (quickOrderContext.incidentId) {
                const at = advanceDemoClock(1).toISOString();
                setIncidents(
                  incidents.map((incident) =>
                    incident.id === quickOrderContext.incidentId
                      ? {
                          ...incident,
                          scheduleId,
                          status: "Review" as const,
                          updates: [
                            ...(incident.updates ?? []),
                            {
                              id: `iu-order-${Date.now()}`,
                              at,
                              actor: "Coordinación de mantenimiento",
                              type: "WorkOrderLinked" as const,
                              text: "Orden de trabajo creada y vinculada desde la incidencia.",
                            },
                          ],
                        }
                      : incident,
                  ),
                );
              }
              setQuickOrderOpen(false);
              setQuickOrderContext({});
            }}
          />
        )}
        {hasCapability("store-operations") && (
          <NewStoreAssignmentModal
            open={assignmentOpen}
            onCancel={() => setAssignmentOpen(false)}
            onCreated={() => {
              setAssignmentOpen(false);
              navigate("store-program");
            }}
          />
        )}
      </Layout.Content>
    </Layout>
  );
}
