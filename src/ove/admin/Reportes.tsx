import { Card, Col, Row, Statistic, Typography, Progress, Table } from "antd";
import { useStore } from "../store";

export function Reportes() {
  const { executions, protocols } = useStore();
  const validated = executions.filter((e) => e.status === "Validated").length;
  const rate = executions.length ? Math.round((validated / executions.length) * 100) : 0;
  const score = executions.length
    ? Math.round(executions.reduce((sum, e) => sum + (e.score || 0), 0) / executions.length)
    : 0;

  const byProtocol = protocols.map((p) => {
    const ex = executions.filter((e) => e.protocolId === p.id);
    const ok = ex.filter((e) => e.status === "Validated").length;
    return {
      key: p.id,
      name: p.name,
      total: ex.length,
      ok,
      rate: ex.length ? Math.round((ok / ex.length) * 100) : 0,
    };
  });

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Desempeño y OEE
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Indicadores derivados de órdenes, evidencias, tiempos y contexto de activos.
      </Typography.Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="OEE activos críticos"
              value={84.6}
              suffix="%"
              valueStyle={{ color: "#7B35C1" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="MTBF" value={418} suffix="h" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="MTTR" value={2.4} suffix="h" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Calidad de ejecución"
              value={score}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Órdenes validadas contra ejecuciones">
            <Progress percent={rate} strokeColor="#7B35C1" />
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Cumplimiento por protocolo">
            <Table
              dataSource={byProtocol}
              pagination={false}
              columns={[
                { title: "Protocolo", dataIndex: "name" },
                { title: "Ejecuciones", dataIndex: "total", width: 130 },
                { title: "Validadas", dataIndex: "ok", width: 110 },
                {
                  title: "Cumplimiento",
                  dataIndex: "rate",
                  width: 220,
                  render: (v) => <Progress percent={v} strokeColor="#7B35C1" />,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
