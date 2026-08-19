import { Layout, Menu } from "antd";
import { CheckSquareOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { useState } from "react";
import { RetailSupportCases } from "./RetailSupportCases";
import { RetailOperationsDashboard } from "./RetailOperationsDashboard";

export function RetailSupervisorApp() {
  const [key, setKey] = useState("support");
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  return (
    <Layout>
      <Layout.Sider
        className="maintenance-sider supervisor-sider"
        width={230}
        breakpoint="lg"
        collapsedWidth={0}
        style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}
      >
        <Menu
          mode="inline"
          selectedKeys={[key]}
          onClick={(event) => setKey(event.key)}
          style={{ borderRight: 0, paddingTop: 12 }}
          items={[
            { key: "support", icon: <CheckSquareOutlined />, label: "Casos por validar" },
            { key: "overview", icon: <CustomerServiceOutlined />, label: "Vista de tiendas" },
          ]}
        />
      </Layout.Sider>
      <Layout.Content className="supervisor-content">
        {key === "support" && <RetailSupportCases supervisorMode initialCaseId={selectedCaseId} />}
        {key === "overview" && (
          <RetailOperationsDashboard
            onOpenProgram={() => setKey("support")}
            onOpenSupport={(caseId) => {
              setSelectedCaseId(caseId);
              setKey("support");
            }}
          />
        )}
      </Layout.Content>
    </Layout>
  );
}
