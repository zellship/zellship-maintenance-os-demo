import { useEffect, useState } from "react";
import { Button, Dropdown, Typography } from "antd";
import {
  ArrowLeftOutlined,
  AppstoreOutlined,
  CloseOutlined,
  DeleteOutlined,
  LockOutlined,
  SettingOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import type { Role } from "./types";

export type LoginProfile = {
  id: string;
  name: string;
  initials: string;
  title: string;
  context: string;
  role: Role;
  color: string;
  colorEnd: string;
};

const PROFILES: LoginProfile[] = [
  {
    id: "USR-018",
    name: "Ana Torres",
    initials: "AT",
    title: "Técnica de mantenimiento",
    context: "Operación móvil · Planta Monterrey",
    role: "operator",
    color: "#3457F1",
    colorEnd: "#4268F5",
  },
  {
    id: "USR-024",
    name: "Laura Díaz",
    initials: "LD",
    title: "Técnica especialista",
    context: "Diagnóstico y ejecución · Línea 3",
    role: "operator",
    color: "#7046D7",
    colorEnd: "#8458E6",
  },
  {
    id: "USR-006",
    name: "Roberto Salas",
    initials: "RS",
    title: "Supervisor de mantenimiento",
    context: "Validación y liberación de activos",
    role: "supervisor",
    color: "#328653",
    colorEnd: "#419D66",
  },
  {
    id: "USR-001",
    name: "Mónica Reyes",
    initials: "MR",
    title: "Coordinadora de mantenimiento",
    context: "Planeación, recursos y control",
    role: "admin",
    color: "#B85F20",
    colorEnd: "#D17631",
  },
];

const TERMINALS = [
  "Planta Monterrey · Terminal 02",
  "Planta Saltillo · Terminal 01",
  "Planta Querétaro · Terminal 03",
];

const DEMO_PIN = "1234";
const LOGO_SRC = `${import.meta.env.BASE_URL}zellship-logo-white.svg`;

export function LoginScreen({ onLogin }: { onLogin: (profile: LoginProfile) => void }) {
  const [selected, setSelected] = useState<LoginProfile | null>(null);
  const [terminal, setTerminal] = useState(TERMINALS[0]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const resetUser = () => {
    setSelected(null);
    setPin("");
    setError("");
  };

  const enterDigit = (digit: string) => {
    setError("");
    setPin((current) => (current.length < 4 ? `${current}${digit}` : current));
  };

  const submit = () => {
    if (!selected || pin.length !== 4) return;
    if (pin !== DEMO_PIN) {
      setError("PIN incorrecto. Usa el PIN de demostración 1234.");
      setPin("");
      return;
    }
    onLogin(selected);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (/^\d$/.test(event.key)) enterDigit(event.key);
      if (event.key === "Backspace") setPin((current) => current.slice(0, -1));
      if (event.key === "Escape") resetUser();
      if (event.key === "Enter") submit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (selected) {
    return (
      <main className="login-page login-pin-page">
        <WelcomePanel terminal={terminal} onTerminalChange={setTerminal} />

        <section className="login-pin-card" aria-labelledby="login-user-name">
          <button className="login-back-button" type="button" onClick={resetUser}>
            <ArrowLeftOutlined /> Cambiar usuario
          </button>

          <div
            className="login-profile-avatar login-pin-avatar"
            style={{
              background: `linear-gradient(145deg, ${selected.color}, ${selected.colorEnd})`,
            }}
          >
            {selected.initials}
          </div>
          <Typography.Text className="login-user-id">{selected.id}</Typography.Text>
          <Typography.Title id="login-user-name" level={2}>
            {selected.name}
          </Typography.Title>
          <Typography.Paragraph className="login-pin-description">
            {selected.title} · {terminal}
          </Typography.Paragraph>

          <div
            className="login-pin-dots"
            aria-label={`${pin.length} de 4 dígitos ingresados`}
            role="status"
          >
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className={index < pin.length ? "filled" : ""} />
            ))}
          </div>

          <div className="login-keypad" aria-label="Teclado numérico">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button key={digit} type="button" onClick={() => enterDigit(digit)}>
                {digit}
              </button>
            ))}
            <button
              type="button"
              aria-label="Limpiar PIN"
              onClick={() => {
                setPin("");
                setError("");
              }}
            >
              <CloseOutlined />
            </button>
            <button type="button" onClick={() => enterDigit("0")}>
              0
            </button>
            <button
              type="button"
              aria-label="Borrar último dígito"
              onClick={() => setPin((current) => current.slice(0, -1))}
            >
              <DeleteOutlined />
            </button>
          </div>

          <Typography.Paragraph className="login-pin-hint">
            PIN de demostración: 1234
          </Typography.Paragraph>
          {error && (
            <Typography.Text className="login-pin-error" role="alert">
              {error}
            </Typography.Text>
          )}
          <Button
            type="primary"
            size="large"
            block
            disabled={pin.length !== 4}
            onClick={submit}
            className="login-submit-button"
          >
            Ingresar
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page login-selector-page">
      <WelcomePanel terminal={terminal} onTerminalChange={setTerminal} />

      <section className="login-profile-selector" aria-labelledby="login-heading">
        <div className="login-selector-mobile-header">
          <div className="login-brand-panel">
            <img src={LOGO_SRC} alt="Zellship" />
          </div>

          <Dropdown
            trigger={["click"]}
            menu={{
              selectable: true,
              selectedKeys: [terminal],
              items: TERMINALS.map((item) => ({ key: item, label: item })),
              onClick: ({ key }) => setTerminal(key),
            }}
          >
            <button className="login-terminal-button" type="button">
              <SettingOutlined />
              <strong>{terminal}</strong>
              <span>Cambiar</span>
            </button>
          </Dropdown>
        </div>

        <header className="login-heading">
          <Typography.Text>INICIO DE SESIÓN</Typography.Text>
          <Typography.Title id="login-heading" level={2}>
            Selecciona tu usuario
          </Typography.Title>
          <Typography.Paragraph>Continúa con tu perfil asignado.</Typography.Paragraph>
        </header>

        <div className="login-profile-list">
          {PROFILES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className="login-profile-option"
              onClick={() => setSelected(profile)}
            >
              <span
                className="login-profile-avatar"
                style={{
                  background: `linear-gradient(145deg, ${profile.color}, ${profile.colorEnd})`,
                }}
              >
                {profile.initials}
              </span>
              <span className="login-profile-copy">
                <strong>{profile.name}</strong>
                <span>{profile.title}</span>
                <em>{profile.context}</em>
              </span>
            </button>
          ))}
        </div>

        <footer className="login-security-note">
          <LockOutlined /> Terminal protegida · Las acciones se registran por usuario
        </footer>
      </section>
    </main>
  );
}

function WelcomePanel({
  terminal,
  onTerminalChange,
}: {
  terminal: string;
  onTerminalChange: (terminal: string) => void;
}) {
  const [plantName, terminalName] = terminal.split(" · ");

  return (
    <aside className="login-welcome-panel" aria-label="Bienvenida a Zellship Maintenance OS">
      <img src={LOGO_SRC} alt="Zellship" />

      <div className="login-welcome-copy">
        <Typography.Text>PANEL OPERATIVO</Typography.Text>
        <Typography.Title level={1}>Bienvenido</Typography.Title>
        <Typography.Paragraph>
          Selecciona tu usuario e ingresa tu PIN para iniciar la sesión de esta terminal.
        </Typography.Paragraph>
      </div>

      <div className="login-terminal-summary">
        <div className="login-terminal-chips">
          <span>
            <ShopOutlined /> {plantName} <i />
          </span>
          <span>
            <AppstoreOutlined /> {terminalName} <i />
          </span>
        </div>
        <Dropdown
          trigger={["click"]}
          menu={{
            selectable: true,
            selectedKeys: [terminal],
            items: TERMINALS.map((item) => ({ key: item, label: item })),
            onClick: ({ key }) => onTerminalChange(key),
          }}
        >
          <button type="button">
            <SettingOutlined /> Cambiar planta / terminal
          </button>
        </Dropdown>
      </div>
    </aside>
  );
}
