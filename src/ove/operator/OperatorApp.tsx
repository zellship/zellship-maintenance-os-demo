import { useState } from "react";
import { Layout, Tabs } from "antd";
import { HomeOutlined, UnorderedListOutlined, HistoryOutlined, UserOutlined } from "@ant-design/icons";
import { OperatorHome } from "./OperatorHome";
import { OperatorPending } from "./OperatorPending";
import { OperatorHistory } from "./OperatorHistory";
import { OperatorProfile } from "./OperatorProfile";
import { ExecutionFlow } from "./ExecutionFlow";

export function OperatorApp() {
  const [tab, setTab] = useState("home");
  const [activeSchedule, setActiveSchedule] = useState<string | null>(null);

  const start = (id: string) => setActiveSchedule(id);
  const back = () => setActiveSchedule(null);

  return (
    <Layout style={{ background: "#f5f6fa", minHeight: "calc(100vh - 64px)" }}>
      <Layout.Content style={{ padding: 12, paddingBottom: 80, maxWidth: 520, margin: "0 auto", width: "100%" }}>
        {activeSchedule ? (
          <ExecutionFlow scheduleId={activeSchedule} onClose={back} />
        ) : (
          <>
            {tab === "home" && <OperatorHome onStart={start} />}
            {tab === "pending" && <OperatorPending onStart={start} />}
            {tab === "history" && <OperatorHistory />}
            {tab === "profile" && <OperatorProfile />}
          </>
        )}
      </Layout.Content>
      {!activeSchedule && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
          borderTop: "1px solid #f0f0f0", padding: "4px 0", zIndex: 100,
        }}>
          <Tabs
            activeKey={tab}
            onChange={setTab}
            centered
            items={[
              { key: "home", label: <span><HomeOutlined /> Inicio</span> },
              { key: "pending", label: <span><UnorderedListOutlined /> Pendientes</span> },
              { key: "history", label: <span><HistoryOutlined /> Historial</span> },
              { key: "profile", label: <span><UserOutlined /> Perfil</span> },
            ]}
          />
        </div>
      )}
    </Layout>
  );
}