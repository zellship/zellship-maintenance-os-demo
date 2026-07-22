import { useState } from "react";
import { Card, Col, Row, Statistic, Typography, Select, Space, Progress, Table, Tag } from "antd";
import { useStore } from "../store";
import { branches, operators } from "../seed";
import dayjs from "dayjs";

export function SupervisorKPIs() {
  const { executions, incidents, protocols, schedules, people } = useStore();
  const [plant, setPlant] = useState<string>();
  const [shift, setShift] = useState<string>();
  const [period, setPeriod] = useState<string>();
  const [operator, setOperator] = useState<string>();
  const filteredExecutions = executions.filter(e => {
    const schedule = schedules.find(s => s.id === e.scheduleId);
    const person = people.find(p => p.name === e.operator);
    const periodOk = !period || period === "Mes" || (period === "Hoy" ? dayjs(e.startAt).isSame(dayjs(), "day") : dayjs(e.startAt).isAfter(dayjs().subtract(7, "day")));
    const shiftValue = person?.shift === "Morning" ? "Mañana" : person?.shift === "Afternoon" ? "Tarde" : "Noche";
    return (!plant || schedule?.plant === plant) && (!shift || shiftValue === shift) && (!operator || e.operator === operator) && periodOk;
  });

  const byOperator = operators.map(op => {
    const ex = filteredExecutions.filter(e => e.operator === op);
    const ok = ex.filter(e => e.status === "Validated").length;
    return { key: op, operator: op, total: ex.length, validated: ok, compliance: ex.length ? Math.round((ok / ex.length) * 100) : 0 };
  });

  const topIncidents = protocols.map(p => ({
    key: p.id, name: p.name, count: incidents.filter(i => i.protocolId === p.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const avgDuration = (() => {
    const done = filteredExecutions.filter(e => e.endAt);
    if (!done.length) return 0;
    const mins = done.reduce((acc, e) => acc + ((new Date(e.endAt!).getTime() - new Date(e.startAt).getTime()) / 60000), 0);
    return Math.round(mins / done.length);
  })();

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>KPIs</Typography.Title>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select placeholder="Planta" value={plant} onChange={setPlant} options={branches.map(b => ({ label: b, value: b }))} style={{ width: 180 }} allowClear />
        <Select placeholder="Turno" value={shift} onChange={setShift} options={["Mañana", "Tarde", "Noche"].map(s => ({ label: s, value: s }))} style={{ width: 140 }} allowClear />
        <Select placeholder="Periodo" value={period} onChange={setPeriod} options={["Hoy", "Semana", "Mes"].map(s => ({ label: s, value: s }))} style={{ width: 140 }} allowClear />
        <Select placeholder="Operador" value={operator} onChange={setOperator} options={operators.map(o => ({ label: o, value: o }))} style={{ width: 180 }} allowClear />
        <Tag color="purple">{filteredExecutions.length} ejecuciones</Tag>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}><Card><Statistic title="Tiempo promedio de intervención" value={avgDuration} suffix="min" valueStyle={{ color: "#7B35C1" }} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="OEE de activos críticos" value={84.6} suffix="%" valueStyle={{ color: "#7B35C1" }} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Incidencias activas" value={incidents.filter(i => i.status === "Open" || i.status === "Review").length} valueStyle={{ color: "#cf1322" }} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Calidad de ejecución" value={92} suffix="%" valueStyle={{ color: "#52c41a" }} /></Card></Col>

        <Col xs={24} md={14}>
          <Card title="Cumplimiento por técnico">
            <Table
              size="small" pagination={false} dataSource={byOperator}
              columns={[
                { title: "Técnico", dataIndex: "operator" },
                { title: "Ejecuciones", dataIndex: "total", width: 110 },
                { title: "Validadas", dataIndex: "validated", width: 100 },
                { title: "Cumplimiento", dataIndex: "compliance", width: 220, render: (v) => <Progress percent={v} strokeColor="#7B35C1" /> },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="Protocolos con desviaciones">
            <Table size="small" pagination={false} dataSource={topIncidents}
              columns={[{ title: "Protocolo", dataIndex: "name" }, { title: "Incidencias", dataIndex: "count", width: 110 }]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
