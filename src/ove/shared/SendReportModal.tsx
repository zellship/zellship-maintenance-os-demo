import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Checkbox, Modal, Select, Space, Tag, Typography } from "antd";
import {
  FilePdfOutlined,
  MailOutlined,
  SendOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import type { Role } from "../types";
import { activeDemo } from "../../demo-config/active";

export type ReportDeliveryChannel = "Email" | "WhatsApp";

export interface ReportContact {
  id: string;
  name: string;
  role: Role;
  roleLabel: string;
  email?: string;
  whatsapp?: string;
}

export interface ReportDeliverySelection {
  contact: ReportContact;
  channels: ReportDeliveryChannel[];
}

const reportContacts: ReportContact[] = activeDemo.context.reportContacts;

function availableChannels(contact: ReportContact): ReportDeliveryChannel[] {
  return [contact.email ? "Email" : null, contact.whatsapp ? "WhatsApp" : null].filter(
    (channel): channel is ReportDeliveryChannel => Boolean(channel),
  );
}

export function SendReportModal({
  open,
  reportName,
  onCancel,
  onSend,
}: {
  open: boolean;
  reportName: string;
  onCancel: () => void;
  onSend: (selection: ReportDeliverySelection) => void;
}) {
  const [contactId, setContactId] = useState(reportContacts[0].id);
  const [channels, setChannels] = useState<ReportDeliveryChannel[]>(["Email", "WhatsApp"]);
  const contact = useMemo(
    () => reportContacts.find((item) => item.id === contactId) ?? reportContacts[0],
    [contactId],
  );
  const available = availableChannels(contact);

  useEffect(() => {
    if (!open) return;
    setContactId(reportContacts[0].id);
    setChannels(availableChannels(reportContacts[0]));
  }, [open]);

  const selectContact = (nextContactId: string) => {
    const nextContact = reportContacts.find((item) => item.id === nextContactId);
    if (!nextContact) return;
    const nextAvailable = availableChannels(nextContact);
    const stillAvailable = channels.filter((channel) => nextAvailable.includes(channel));
    setContactId(nextContactId);
    setChannels(stillAvailable.length > 0 ? stillAvailable : nextAvailable.slice(0, 1));
  };

  const submit = () => {
    if (channels.length === 0) return;
    onSend({ contact, channels });
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <Space>
          <SendOutlined />
          Enviar reporte
        </Space>
      }
      width={560}
      footer={
        <Space>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={channels.length === 0}
            onClick={submit}
          >
            {channels.length > 1 ? `Enviar por ${channels.length} canales` : "Enviar reporte"}
          </Button>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary">
        Selecciona el contacto y uno o ambos canales disponibles para compartir el documento.
      </Typography.Paragraph>

      <Typography.Text strong>Contacto</Typography.Text>
      <Select
        aria-label="Contacto destinatario"
        value={contactId}
        onChange={selectContact}
        style={{ width: "100%", marginTop: 8 }}
        options={reportContacts.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
      />

      <div className="report-contact-summary">
        <Space align="start">
          <UserOutlined className="report-contact-icon" />
          <div>
            <Space wrap size={6}>
              <Typography.Text strong>{contact.name}</Typography.Text>
              <Tag>{contact.roleLabel}</Tag>
            </Space>
            <div>
              <Typography.Text type="secondary">
                {contact.email ?? "Sin correo registrado"} · {contact.whatsapp ?? "Sin WhatsApp"}
              </Typography.Text>
            </div>
          </div>
        </Space>
      </div>

      <Typography.Text strong>Enviar vía</Typography.Text>
      <Checkbox.Group
        className="report-channel-options"
        value={channels}
        onChange={(values) => setChannels(values as ReportDeliveryChannel[])}
      >
        <label className={`report-channel-option${contact.email ? "" : " is-disabled"}`}>
          <Checkbox value="Email" disabled={!contact.email} />
          <MailOutlined />
          <span>
            <strong>Correo electrónico</strong>
            <small>{contact.email ?? "Este contacto no tiene correo"}</small>
          </span>
        </label>
        <label className={`report-channel-option${contact.whatsapp ? "" : " is-disabled"}`}>
          <Checkbox value="WhatsApp" disabled={!contact.whatsapp} />
          <WhatsAppOutlined />
          <span>
            <strong>WhatsApp</strong>
            <small>
              {contact.whatsapp
                ? `${contact.whatsapp} · template simulado`
                : "Este contacto no tiene número de WhatsApp"}
            </small>
          </span>
        </label>
      </Checkbox.Group>

      <Alert
        type="info"
        showIcon
        icon={<FilePdfOutlined />}
        title={reportName}
        description="Correo representa un PDF adjunto. WhatsApp representa un template de utilidad con botón al reporte en Zellship. No se realiza ningún envío real."
      />
    </Modal>
  );
}
