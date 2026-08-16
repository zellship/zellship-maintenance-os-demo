import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd";
import { EyeOutlined, FilePdfOutlined, InboxOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { advanceDemoClock, demoNow } from "../../demo-config/clock";
import { useStore } from "../store";
import type { DocumentEntityType, EntityDocument } from "../types";

type UploadValues = {
  category: string;
  version: string;
  expiresAt?: Dayjs;
  summary?: string;
};

export function EntityDocuments({
  entityType,
  entityId,
}: {
  entityType: DocumentEntityType;
  entityId: string;
}) {
  const { documents, setDocuments } = useStore();
  const [selected, setSelected] = useState<EntityDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<UploadValues>();
  const entityDocuments = useMemo(
    () =>
      documents
        .filter((document) => document.entityType === entityType && document.entityId === entityId)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    [documents, entityId, entityType],
  );

  const uploadDocument = (values: UploadValues) => {
    const file = fileList[0];
    if (!file) {
      message.warning("Selecciona un archivo para continuar");
      return;
    }
    const uploadedAt = advanceDemoClock(1).toISOString();
    const document: EntityDocument = {
      id: `doc-session-${Date.now()}`,
      entityType,
      entityId,
      name: file.name,
      category: values.category,
      version: values.version,
      mimeType: file.type ?? "application/octet-stream",
      size: file.size ?? 0,
      issuedAt: dayjs(uploadedAt).format("YYYY-MM-DD"),
      expiresAt: values.expiresAt?.format("YYYY-MM-DD"),
      uploadedAt,
      uploadedBy: "Coordinación de mantenimiento",
      source: "SessionUpload",
      summary:
        values.summary?.trim() ||
        "Archivo incorporado durante la sesión demostrativa; no representa almacenamiento real.",
    };
    setDocuments([document, ...documents]);
    setFileList([]);
    form.resetFields();
    setUploadOpen(false);
    message.success("Documento agregado al perfil durante esta sesión");
  };

  return (
    <>
      <Card
        className="entity-documents"
        title={
          <Space>
            <FilePdfOutlined />
            <span>Documentos</span>
          </Space>
        }
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
            Subir archivo
          </Button>
        }
      >
        {entityDocuments.length ? (
          <List
            dataSource={entityDocuments}
            renderItem={(document) => (
              <List.Item
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setSelected(document)}
                  >
                    Consultar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FilePdfOutlined className="entity-document-icon" />}
                  title={
                    <Space wrap>
                      <b>{document.name}</b>
                      <DocumentStatus document={document} />
                    </Space>
                  }
                  description={`${document.category} · v${document.version} · ${formatBytes(document.size)}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Sin documentos relacionados" />
        )}
      </Card>

      <Modal
        title="Consultar documento"
        open={Boolean(selected)}
        onCancel={() => setSelected(null)}
        footer={<Button onClick={() => setSelected(null)}>Cerrar</Button>}
      >
        {selected && (
          <>
            <div className="document-preview-placeholder">
              <FilePdfOutlined />
              <b>{selected.name}</b>
              <span>Vista previa simulada</span>
            </div>
            <Descriptions bordered size="small" column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="Categoría">{selected.category}</Descriptions.Item>
              <Descriptions.Item label="Versión">{selected.version}</Descriptions.Item>
              <Descriptions.Item label="Emisión">
                {dayjs(selected.issuedAt).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Vigencia">
                {selected.expiresAt
                  ? dayjs(selected.expiresAt).format("DD MMM YYYY")
                  : "Sin vencimiento"}
              </Descriptions.Item>
              <Descriptions.Item label="Responsable">{selected.uploadedBy}</Descriptions.Item>
              <Descriptions.Item label="Descripción">{selected.summary}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      <Modal
        title="Subir documento"
        open={uploadOpen}
        onCancel={() => {
          setUploadOpen(false);
          setFileList([]);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Agregar al perfil"
      >
        <Alert
          type="info"
          showIcon
          message="Carga demostrativa"
          description="El archivo se muestra durante esta experiencia. La demo no incluye repositorio documental ni almacenamiento productivo."
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" onFinish={uploadDocument}>
          <Form.Item label="Archivo" required>
            <Upload.Dragger
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList: next }) => setFileList(next.slice(-1))}
            >
              <InboxOutlined style={{ fontSize: 30 }} />
              <Typography.Paragraph style={{ margin: "8px 0 0" }}>
                Selecciona o arrastra un archivo
              </Typography.Paragraph>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="category" label="Categoría" rules={[{ required: true }]}>
            <Select
              options={[
                "Manual",
                "Garantía",
                "Plan de mantenimiento",
                "Certificación",
                "Contrato",
                "Seguridad",
                "Competencias",
              ].map((value) => ({ value, label: value }))}
            />
          </Form.Item>
          <Form.Item name="version" label="Versión" initialValue="1.0" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="expiresAt" label="Fecha de vencimiento">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="summary" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function DocumentStatus({ document }: { document: EntityDocument }) {
  if (!document.expiresAt) return <Tag>Sin vencimiento</Tag>;
  const remainingDays = dayjs(document.expiresAt).diff(demoNow(), "day");
  if (remainingDays < 0) return <Tag color="red">Vencido</Tag>;
  if (remainingDays <= 90) return <Tag color="orange">Próximo a vencer</Tag>;
  return <Tag color="green">Vigente</Tag>;
}

function formatBytes(bytes: number) {
  if (!bytes) return "Tamaño no disponible";
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}
