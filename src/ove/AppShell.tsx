import { useState } from "react";
import {
  ConfigProvider,
  Layout,
  Segmented,
  Space,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Button,
  Select,
  Popover,
  List,
  message,
} from "antd";
import {
  BellOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { StoreProvider, useStore } from "./store";
import { AdminApp } from "./admin/AdminApp";
import { OperatorApp } from "./operator/OperatorApp";
import { SupervisorApp } from "./supervisor/SupervisorApp";
import type { Role } from "./types";

const PRIMARY = "#7B35C1";

function Inner() {
  const { role, setRole, notifications, setNotifications, reset } = useStore();
  const [plant, setPlant] = useState("Planta Monterrey");
  const roleNotifications = notifications.filter(
    (n) => n.recipientRole === role || n.recipientRole === "all" || !n.recipientRole,
  );
  const unread = roleNotifications.filter((n) => n.status === "Sent").length;
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: PRIMARY,
          borderRadius: 10,
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            height: "auto",
            lineHeight: 1.2,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <Space size={12} align="center">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${PRIMARY}, #B57BFF)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <ThunderboltOutlined style={{ fontSize: 20 }} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <Typography.Text strong style={{ fontSize: 15 }}>
                Zellship Maintenance OS
              </Typography.Text>
              <div style={{ fontSize: 11, color: "#999" }}>
                Foundational Engines · Industrial Operations
              </div>
            </div>
          </Space>

          <Segmented
            value={role}
            onChange={(v) => setRole(v as Role)}
            options={[
              { label: "Administración", value: "admin" },
              { label: "Operación móvil", value: "operator" },
              { label: "Supervisión", value: "supervisor" },
            ]}
          />

          <Space size={12}>
            <Select
              aria-label="Planta activa"
              value={plant}
              onChange={(value) => {
                setPlant(value);
                message.success(`Contexto actualizado: ${value}`);
              }}
              suffixIcon={<EnvironmentOutlined />}
              options={["Planta Monterrey", "Planta Saltillo", "Todas las plantas"].map(
                (value) => ({ value, label: value }),
              )}
              style={{ width: 174 }}
            />
            <Tooltip title="Reiniciar datos demo">
              <Button shape="circle" icon={<ReloadOutlined />} onClick={reset} />
            </Tooltip>
            <Popover
              trigger="click"
              placement="bottomRight"
              title={
                <Space style={{ justifyContent: "space-between", width: 320 }}>
                  <b>
                    Notificaciones ·{" "}
                    {role === "admin"
                      ? "Administración"
                      : role === "operator"
                        ? "Operador"
                        : "Supervisor"}
                  </b>
                  <Button
                    type="link"
                    size="small"
                    onClick={() =>
                      setNotifications(
                        notifications.map((n) =>
                          n.recipientRole === role || n.recipientRole === "all" || !n.recipientRole
                            ? { ...n, status: "Read" }
                            : n,
                        ),
                      )
                    }
                  >
                    Marcar leídas
                  </Button>
                </Space>
              }
              content={
                <List
                  style={{ width: 360, maxHeight: 360, overflow: "auto" }}
                  size="small"
                  dataSource={roleNotifications}
                  locale={{ emptyText: "Sin notificaciones para este rol" }}
                  renderItem={(n) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space wrap>
                            <span>{n.message}</span>
                            {n.status === "Sent" && <Badge status="processing" />}
                          </Space>
                        }
                        description={`${n.channel} · ${n.source ?? "Automatic"} · ${n.actor}`}
                      />
                    </List.Item>
                  )}
                />
              }
            >
              <Badge count={unread} size="small">
                <Button
                  aria-label="Abrir notificaciones"
                  type="text"
                  shape="circle"
                  style={{ padding: 0 }}
                >
                  <Avatar style={{ background: PRIMARY }} icon={<BellOutlined />} />
                </Button>
              </Badge>
            </Popover>
          </Space>
        </Layout.Header>

        {role === "admin" && <AdminApp />}
        {role === "operator" && <OperatorApp />}
        {role === "supervisor" && <SupervisorApp />}
      </Layout>
    </ConfigProvider>
  );
}

export function AppShell() {
  return (
    <StoreProvider>
      <Inner />
    </StoreProvider>
  );
}
