import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  AlertOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { SupervisorAlerts } from "./SupervisorAlerts";
import { SupervisorValidations } from "./SupervisorValidations";
import { SupervisorKPIs } from "./SupervisorKPIs";
import { NotificationCenter } from "../shared/NotificationCenter";

type SupervisorSection = "alerts" | "validations" | "notifications" | "kpis";

export function SupervisorApp() {
  const [key, setKey] = useState<SupervisorSection>("validations");
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);

  return (
    <Layout>
      <Layout.Sider
        className="maintenance-sider supervisor-sider"
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
          onClick={(e) => setKey(e.key as SupervisorSection)}
          style={{ borderRight: 0, paddingTop: 12 }}
          items={[
            { key: "alerts", icon: <AlertOutlined />, label: "Alertas" },
            { key: "validations", icon: <CheckSquareOutlined />, label: "Validaciones" },
            { key: "notifications", icon: <BellOutlined />, label: "Notificaciones" },
            { key: "kpis", icon: <BarChartOutlined />, label: "KPIs" },
          ]}
        />
      </Layout.Sider>
      <Layout.Content className="supervisor-content">
        {key === "alerts" && <SupervisorAlerts />}
        {key === "validations" && <SupervisorValidations />}
        {key === "notifications" && <NotificationCenter role="supervisor" />}
        {key === "kpis" && <SupervisorKPIs />}
      </Layout.Content>
    </Layout>
  );
}
