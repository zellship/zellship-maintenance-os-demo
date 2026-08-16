import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
  TimePicker,
  Typography,
  message,
} from "antd";
import { SmartTable } from "../shared/SmartTable";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { demoNow } from "../../demo-config/clock";
import { useStore } from "../store";
import { seedAssets, seedSkills } from "../seed";
import type { MaterialAllocation, Protocol, ResourceReservation, Schedule } from "../types";
import {
  PlanningCalendar,
  PlanningCalendarEmpty,
  type PlanningCalendarItem,
} from "./PlanningCalendar";
import {
  getPlanningPeriodLabel,
  getPlanningRange,
  getStatusPlanningLabel,
  type PlanningView,
} from "./planningCalendarUtils";
import { WorkOrderDetailModal } from "./WorkOrders";

type FormValues = {
  protocolId: string;
  assetId: string;
  date: Dayjs;
  hour: Dayjs;
  tolerance: number;
  operator: string;
  toolIds: string[];
};

export function Planning({
  initialProtocolId = null,
  initialServiceRequestId = null,
  onProtocolRequestConsumed,
  onServiceRequestConsumed,
}: {
  initialProtocolId?: string | null;
  initialServiceRequestId?: string | null;
  onProtocolRequestConsumed?: () => void;
  onServiceRequestConsumed?: () => void;
}) {
  const {
    schedules,
    setSchedules,
    protocols,
    people,
    tools,
    setTools,
    inventory,
    setInventory,
    reservations,
    setReservations,
    serviceRequests,
    setServiceRequests,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PlanningView>("week");
  const [anchorDate, setAnchorDate] = useState(demoNow());
  const [plantFilter, setPlantFilter] = useState<string>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeServiceRequestId, setActiveServiceRequestId] = useState<string | null>(null);
  const [form] = Form.useForm<FormValues>();
  const protocolId = Form.useWatch("protocolId", form);
  const operatorName = Form.useWatch("operator", form);
  const assetId = Form.useWatch("assetId", form);
  const selectedDate = Form.useWatch("date", form);
  const selectedHour = Form.useWatch("hour", form);
  const toolIds = Form.useWatch("toolIds", form) || [];
  const selectedProtocol = protocols.find((p) => p.id === protocolId);
  const active = protocols.filter((p) => p.status === "Active");
  const activeServiceRequest = serviceRequests.find(
    (request) => request.id === activeServiceRequestId,
  );

  const interval = getInterval(selectedDate, selectedHour, selectedProtocol);
  const selectedPerson = people.find((p) => p.name === operatorName);
  const missingSkills =
    selectedProtocol?.requiredSkillIds?.filter((id) => !selectedPerson?.skillIds.includes(id)) ||
    [];
  const conflictIds = interval
    ? reservations
        .filter(
          (r) =>
            (r.status === "Reserved" || r.status === "InUse") &&
            overlaps(interval.start, interval.end, r.startAt, r.endAt),
        )
        .map((r) => `${r.resourceType}:${r.resourceId}`)
    : [];
  const assetConflict = !!assetId && conflictIds.includes(`Asset:${assetId}`);
  const personConflict = !!selectedPerson && conflictIds.includes(`Person:${selectedPerson.id}`);
  const toolConflicts = toolIds.filter((id) => conflictIds.includes(`Tool:${id}`));
  const stockIssues = getAllocations(selectedProtocol).filter((a) => {
    const item = inventory.find((i) => i.id === a.inventoryItemId);
    return !item || item.onHand - item.reserved - item.quarantine < a.reservedQuantity;
  });
  const accessRequirements = activeServiceRequest?.accessRequirements ?? [];
  const completedAccessRequirements = accessRequirements.filter(
    (requirement) =>
      !requirement.required ||
      requirement.completed ||
      (requirement.id === "identification" && Boolean(selectedPerson)),
  );
  const accessReady =
    !activeServiceRequest || completedAccessRequirements.length === accessRequirements.length;
  const configured =
    !!selectedProtocol && !!assetId && !!selectedPerson && !!selectedDate && !!selectedHour;
  const ready =
    configured &&
    missingSkills.length === 0 &&
    !assetConflict &&
    !personConflict &&
    toolConflicts.length === 0 &&
    stockIssues.length === 0 &&
    accessReady;

  const selectProtocol = (id: string) => {
    const p = protocols.find((item) => item.id === id);
    form.setFieldsValue({
      protocolId: id,
      assetId: p?.assetIds?.[0],
      operator: p?.operators?.[0],
      toolIds: p?.requiredToolIds || [],
      tolerance: p?.schedule?.[0]?.tolerance || 20,
    });
  };

  const openCreate = (
    date = anchorDate,
    hour = "10:00",
    suggestedProtocolId?: string,
    serviceRequestId?: string,
  ) => {
    setOpen(true);
    setActiveServiceRequestId(serviceRequestId ?? null);
    const request = serviceRequests.find((item) => item.id === serviceRequestId);
    form.setFieldsValue({
      date,
      hour: dayjs(hour, "HH:mm"),
      tolerance: 20,
      toolIds: [],
      assetId: request?.assetId,
    });
    if (suggestedProtocolId) {
      selectProtocol(suggestedProtocolId);
      if (request) form.setFieldValue("assetId", request.assetId);
    }
  };

  useEffect(() => {
    if (!initialServiceRequestId) return;
    const request = serviceRequests.find((item) => item.id === initialServiceRequestId);
    if (!request || request.status !== "Accepted") return;
    openCreate(anchorDate, "10:00", request.protocolId, request.id);
    onServiceRequestConsumed?.();
    // Open only when administration explicitly hands a request to planning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialServiceRequestId]);

  useEffect(() => {
    if (!initialProtocolId || initialServiceRequestId) return;
    const protocol = protocols.find(
      (item) => item.id === initialProtocolId && item.status === "Active",
    );
    if (!protocol) return;
    openCreate(anchorDate, "10:00", protocol.id);
    onProtocolRequestConsumed?.();
    // Open only when the control center explicitly hands a protocol to planning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProtocolId, initialServiceRequestId]);

  const create = (values: FormValues) => {
    const protocol = protocols.find((p) => p.id === values.protocolId)!;
    const asset = seedAssets.find((a) => a.id === values.assetId);
    const person = people.find((p) => p.name === values.operator)!;
    if (!ready) {
      message.error(
        "La orden tiene bloqueos de elegibilidad o disponibilidad. Revisa la validación de recursos.",
      );
      return;
    }
    const scheduleId = `s${Date.now()}`;
    const allocations = getAllocations(protocol);
    const schedule: Schedule = {
      id: scheduleId,
      protocolId: values.protocolId,
      date: values.date.format("YYYY-MM-DD"),
      hour: values.hour.format("HH:mm"),
      tolerance: values.tolerance,
      operator: values.operator,
      status: "Pending",
      assetId: values.assetId,
      plant: asset?.plant,
      workOrder: `OT-${demoNow().format("MMDD")}-${String(schedules.length + 19).padStart(3, "0")}`,
      toolIds: values.toolIds,
      materialAllocations: allocations,
      eligibilityValidated: true,
      serviceRequestId: activeServiceRequest?.id,
      serviceReference: activeServiceRequest?.externalReference,
      siteLabel: activeServiceRequest?.siteLabel,
      classification: activeServiceRequest?.classification,
      accessRequirements: activeServiceRequest?.accessRequirements.map((requirement) =>
        requirement.id === "identification"
          ? { ...requirement, completed: true, detail: `${values.operator} · perfil validado` }
          : requirement,
      ),
    };
    const startAt = dayjs(`${schedule.date} ${schedule.hour}`).toISOString();
    const endAt = dayjs(startAt)
      .add(protocol.estimatedMinutes || 45, "minute")
      .toISOString();
    const newReservations: ResourceReservation[] = [
      {
        id: `res-${scheduleId}-asset`,
        scheduleId,
        resourceType: "Asset",
        resourceId: values.assetId,
        startAt,
        endAt,
        status: "Reserved",
      },
      {
        id: `res-${scheduleId}-person`,
        scheduleId,
        resourceType: "Person",
        resourceId: person.id,
        startAt,
        endAt,
        status: "Reserved",
      },
      ...values.toolIds.map((id, index) => ({
        id: `res-${scheduleId}-tool-${index}`,
        scheduleId,
        resourceType: "Tool" as const,
        resourceId: id,
        startAt,
        endAt,
        status: "Reserved" as const,
      })),
      ...allocations.map((a, index) => ({
        id: `res-${scheduleId}-mat-${index}`,
        scheduleId,
        resourceType: "Material" as const,
        resourceId: a.inventoryItemId,
        quantity: a.reservedQuantity,
        startAt,
        endAt,
        status: "Reserved" as const,
      })),
    ];
    setSchedules([schedule, ...schedules]);
    setReservations([...newReservations, ...reservations]);
    setTools(tools.map((t) => (values.toolIds.includes(t.id) ? { ...t, status: "Reserved" } : t)));
    setInventory(
      inventory.map((item) => {
        const allocation = allocations.find((a) => a.inventoryItemId === item.id);
        return allocation
          ? { ...item, reserved: item.reserved + allocation.reservedQuantity }
          : item;
      }),
    );
    if (activeServiceRequest) {
      setServiceRequests(
        serviceRequests.map((request) =>
          request.id === activeServiceRequest.id
            ? { ...request, status: "Planned", scheduleId }
            : request,
        ),
      );
    }
    setOpen(false);
    setActiveServiceRequestId(null);
    form.resetFields();
    message.success(`${schedule.workOrder} creada · recursos e inventario reservados`);
  };

  const rows: PlanningCalendarItem[] = schedules
    .slice()
    .sort((a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`))
    .map((s) => ({
      ...s,
      protocol: protocols.find((p) => p.id === s.protocolId)?.name,
      asset: seedAssets.find((a) => a.id === s.assetId)?.name,
      duration: protocols.find((p) => p.id === s.protocolId)?.estimatedMinutes || 45,
      hasConflict: hasReservationConflict(s.id, reservations),
    }));

  const range = getPlanningRange(view, anchorDate);
  const filteredRows = rows.filter((row) => {
    const matchesPlant = plantFilter === "all" || row.plant === plantFilter;
    const matchesOperator = operatorFilter === "all" || row.operator === operatorFilter;
    const matchesRange =
      !range ||
      (dayjs(row.date).isAfter(range.start.subtract(1, "millisecond")) &&
        dayjs(row.date).isBefore(range.end.add(1, "millisecond")));
    return matchesPlant && matchesOperator && matchesRange;
  });
  const backlog = active
    .filter(
      (protocol) =>
        !serviceRequests.some(
          (request) =>
            request.protocolId === protocol.id &&
            request.requiresAcceptance &&
            request.status === "Received",
        ) &&
        !schedules.some(
          (schedule) =>
            schedule.protocolId === protocol.id &&
            dayjs(schedule.date).isAfter(demoNow().subtract(1, "day")) &&
            (schedule.status === "Pending" || schedule.status === "InProgress"),
        ),
    )
    .slice(0, 4)
    .map((protocol) => {
      const suggestedAsset = seedAssets.find((asset) => protocol.assetIds?.includes(asset.id));
      return {
        protocol,
        assetId: suggestedAsset?.id,
        asset: suggestedAsset?.name,
        operator: protocol.operators?.[0],
      };
    });
  const visibleConflicts = filteredRows.filter((row) => row.hasConflict).length;
  const activeTechnicians = Math.max(
    people.filter((person) => person.role === "Technician").length,
    1,
  );
  const capacityDays = view === "day" ? 1 : view === "month" ? anchorDate.daysInMonth() : 7;
  const plannedMinutes = filteredRows
    .filter((row) => row.status === "Pending" || row.status === "InProgress")
    .reduce((total, row) => total + row.duration, 0);
  const availableCapacity = Math.max(
    0,
    100 -
      (plannedMinutes
        ? Math.max(1, Math.round((plannedMinutes / (activeTechnicians * capacityDays * 480)) * 100))
        : 0),
  );
  const periodLabel = getPlanningPeriodLabel(view, anchorDate);
  const plants = Array.from(new Set(rows.map((row) => row.plant).filter(Boolean))) as string[];

  const movePeriod = (direction: -1 | 1) => {
    const unit = view === "month" ? "month" : view === "day" ? "day" : "week";
    setAnchorDate((current) => current.add(direction, unit));
  };

  return (
    <div className="industrial-page planning-page">
      <div className="planning-page-heading">
        <div>
          <Typography.Text className="planning-eyebrow">
            OPERACIONES · PLANIFICACIÓN
          </Typography.Text>
          <Typography.Title level={2}>Programación de mantenimiento</Typography.Title>
          <Typography.Text type="secondary">
            Coordina ventanas, técnicos y recursos antes de comprometer la ejecución.
          </Typography.Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openCreate()}>
          Programar mantenimiento
        </Button>
      </div>

      <Card className="planning-toolbar-card">
        <div className="planning-toolbar-row">
          <Space.Compact>
            <Button
              icon={<LeftOutlined />}
              aria-label="Periodo anterior"
              onClick={() => movePeriod(-1)}
            />
            <Button onClick={() => setAnchorDate(demoNow())}>Hoy</Button>
            <Button
              icon={<RightOutlined />}
              aria-label="Periodo siguiente"
              onClick={() => movePeriod(1)}
            />
          </Space.Compact>
          <DatePicker
            value={anchorDate}
            onChange={(date) => date && setAnchorDate(date)}
            allowClear={false}
          />
          <Typography.Text strong className="planning-period-label">
            {periodLabel}
          </Typography.Text>
          <Segmented<PlanningView>
            value={view}
            onChange={setView}
            options={[
              { label: "Día", value: "day" },
              { label: "Semana", value: "week" },
              { label: "Mes", value: "month" },
              { label: "Lista", value: "list" },
            ]}
          />
        </div>
        <div className="planning-filter-row">
          <Select
            value={plantFilter}
            onChange={setPlantFilter}
            options={[
              { value: "all", label: "Todas las plantas" },
              ...plants.map((plant) => ({ value: plant, label: plant })),
            ]}
          />
          <Select
            value={operatorFilter}
            onChange={setOperatorFilter}
            options={[
              { value: "all", label: "Todos los responsables" },
              ...people
                .filter((person) => person.role === "Technician")
                .map((person) => ({ value: person.name, label: person.name })),
            ]}
          />
          <Space size={16} className="planning-status-legend" wrap>
            <span>
              <i className="confirmed" /> Confirmada
            </span>
            <span>
              <i className="in-progress" /> En ejecución
            </span>
            <span>
              <i className="completed" /> Completada
            </span>
            <span>
              <i className="expired" /> Vencida
            </span>
          </Space>
        </div>
      </Card>

      <Row gutter={[12, 12]} className="planning-metrics-row">
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Por programar"
              value={backlog.length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="En el periodo"
              value={filteredRows.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className={visibleConflicts ? "planning-metric-warning" : ""}>
            <Statistic title="Conflictos" value={visibleConflicts} prefix={<WarningOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Capacidad disponible"
              value={availableCapacity}
              suffix="%"
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {view !== "list" && (
        <Row gutter={[16, 16]} className="planning-calendar-layout">
          <Col xs={24} xl={5}>
            <Card
              className="planning-backlog-card"
              title="Por programar"
              extra={<Tag>{backlog.length}</Tag>}
            >
              <Typography.Paragraph type="secondary">
                Trabajos disponibles para asignar a una ventana.
              </Typography.Paragraph>
              <div className="planning-backlog-list">
                {backlog.map(({ protocol, assetId: suggestedAssetId, asset, operator }) => (
                  <button
                    key={protocol.id}
                    type="button"
                    className="planning-backlog-item"
                    onClick={() => openCreate(anchorDate, "10:00", protocol.id)}
                  >
                    <Space size={6} wrap>
                      <Tag color="purple">{suggestedAssetId}</Tag>
                      <Tag>{protocol.activationMode}</Tag>
                    </Space>
                    <strong>{protocol.name}</strong>
                    <span>{asset}</span>
                    <em>{operator || "Responsable por asignar"}</em>
                    <small>
                      <PlusOutlined /> Agendar en el calendario
                    </small>
                  </button>
                ))}
              </div>
              <Button type="dashed" block icon={<PlusOutlined />} onClick={() => openCreate()}>
                Nueva programación
              </Button>
            </Card>
          </Col>
          <Col xs={24} xl={19}>
            <Card className="planning-calendar-card" title={`Calendario · ${periodLabel}`}>
              {filteredRows.length ? (
                <PlanningCalendar
                  view={view}
                  anchorDate={anchorDate}
                  items={filteredRows}
                  onSelectDate={(date) => {
                    setAnchorDate(date);
                    if (view === "month") setView("day");
                  }}
                  onCreateAt={(date, hour) => openCreate(date, hour)}
                  onOpenOrder={setSelectedOrderId}
                />
              ) : (
                <PlanningCalendarEmpty />
              )}
            </Card>
          </Col>
        </Row>
      )}

      <Card
        className="planning-operational-list"
        title={`Programa operativo · ${periodLabel}`}
        extra={<Typography.Text type="secondary">{filteredRows.length} registros</Typography.Text>}
      >
        <SmartTable
          searchPlaceholder="Buscar orden, protocolo, activo o responsable"
          searchFields={["workOrder", "protocol", "asset", "operator"]}
          filterFields={[
            { key: "status", label: "Estado", accessor: "status" },
            { key: "operator", label: "Responsable", accessor: "operator" },
            { key: "plant", label: "Planta", accessor: "plant" },
            {
              key: "resources",
              label: "Preparación",
              accessor: (row) => (row.hasConflict ? "Con conflicto" : "Lista"),
            },
          ]}
          rowKey="id"
          dataSource={filteredRows}
          scroll={{ x: 1180 }}
          columns={[
            {
              title: "Orden",
              dataIndex: "workOrder",
              width: 130,
              sorter: (a, b) => (a.workOrder || "").localeCompare(b.workOrder || ""),
            },
            {
              title: "Fecha",
              dataIndex: "date",
              width: 115,
              sorter: (a, b) => `${a.date}${a.hour}`.localeCompare(`${b.date}${b.hour}`),
              render: (value) => dayjs(value).format("DD MMM"),
            },
            { title: "Hora", dataIndex: "hour", width: 80 },
            {
              title: "Duración",
              dataIndex: "duration",
              width: 100,
              render: (value) => `${value} min`,
            },
            { title: "Protocolo", dataIndex: "protocol", width: 230 },
            { title: "Activo", dataIndex: "asset", width: 190 },
            { title: "Responsable", dataIndex: "operator", width: 150 },
            {
              title: "Preparación",
              width: 125,
              sorter: (a, b) => Number(a.hasConflict) - Number(b.hasConflict),
              render: (_, row) =>
                row.hasConflict ? (
                  <Tag color="error">Con conflicto</Tag>
                ) : (
                  <Tag color="green">Lista</Tag>
                ),
            },
            {
              title: "Programación",
              dataIndex: "status",
              width: 130,
              render: (value) => <Tag>{getStatusPlanningLabel(value)}</Tag>,
            },
            {
              title: "",
              fixed: "right",
              width: 78,
              render: (_, row) => (
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => setSelectedOrderId(row.id)}
                  aria-label={`Abrir ${row.workOrder}`}
                />
              ),
            },
          ]}
        />
      </Card>
      <WorkOrderDetailModal scheduleId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      <Modal
        width={760}
        title="Programar orden con recursos"
        open={open}
        onCancel={() => {
          setOpen(false);
          setActiveServiceRequestId(null);
        }}
        onOk={() => form.submit()}
        okText="Validar y reservar"
        cancelText="Cancelar"
        okButtonProps={{ disabled: !ready }}
      >
        {activeServiceRequest && (
          <Alert
            type="info"
            showIcon
            message={`${activeServiceRequest.externalReference} · ${activeServiceRequest.siteLabel}`}
            description={`${activeServiceRequest.classification.serviceType} · ${activeServiceRequest.classification.installationClass} · ${activeServiceRequest.classification.accessContext}`}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={create}
          initialValues={{
            date: demoNow().add(1, "day"),
            hour: dayjs("10:00", "HH:mm"),
            tolerance: 20,
            toolIds: [],
          }}
        >
          <Form.Item name="protocolId" label="1. Protocolo" rules={[{ required: true }]}>
            <Select
              onChange={selectProtocol}
              options={active.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="assetId" label="2. Activo" rules={[{ required: true }]}>
                <Select
                  options={seedAssets
                    .filter(
                      (a) =>
                        !selectedProtocol?.assetIds?.length ||
                        selectedProtocol.assetIds.includes(a.id),
                    )
                    .map((a) => ({ value: a.id, label: `${a.id} · ${a.name}` }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="operator" label="3. Técnico habilitado" rules={[{ required: true }]}>
                <Select
                  options={people
                    .filter((p) => p.role === "Technician")
                    .map((person) => {
                      const missing =
                        selectedProtocol?.requiredSkillIds?.filter(
                          (id) => !person.skillIds.includes(id),
                        ) || [];
                      return {
                        value: person.name,
                        label: `${person.name}${missing.length ? ` · faltan ${missing.length} skills` : " · habilitado"}`,
                        disabled: missing.length > 0,
                      };
                    })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={10}>
              <Form.Item name="date" label="Fecha" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hour" label="Hora" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="tolerance" label="Tolerancia">
                <InputNumber min={0} max={120} addonAfter="min" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="toolIds" label="4. Equipos y herramientas">
            <Select
              mode="multiple"
              options={tools.map((tool) => ({
                value: tool.id,
                label: `${tool.name} · ${tool.serial}`,
              }))}
            />
          </Form.Item>
        </Form>
        {selectedProtocol && (
          <>
            <Divider>Validación automática</Divider>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Readiness
                  ok={!missingSkills.length && !!selectedPerson}
                  icon={<SafetyCertificateOutlined />}
                  title="Skills y certificaciones"
                  detail={
                    !selectedPerson
                      ? "Selecciona un técnico"
                      : missingSkills.length
                        ? `Faltan: ${missingSkills.map((id) => seedSkills.find((s) => s.id === id)?.name).join(", ")}`
                        : `${selectedPerson.name} está habilitado`
                  }
                />
              </Col>
              <Col span={12}>
                <Readiness
                  ok={!assetConflict && !personConflict && !!interval}
                  icon={<CalendarOutlined />}
                  title="Ventana sin traslapes"
                  detail={
                    !interval
                      ? "Define fecha y hora"
                      : assetConflict || personConflict
                        ? "Activo o técnico ya reservado"
                        : "Activo y técnico disponibles"
                  }
                />
              </Col>
              <Col span={12}>
                <Readiness
                  ok={
                    !toolConflicts.length &&
                    toolIds.length >= (selectedProtocol.requiredToolIds?.length || 0)
                  }
                  icon={<ToolOutlined />}
                  title="Herramientas"
                  detail={
                    toolConflicts.length
                      ? "Hay herramientas ocupadas"
                      : `${toolIds.length} equipos listos para reservar`
                  }
                />
              </Col>
              <Col span={12}>
                <Readiness
                  ok={!stockIssues.length}
                  icon={<CheckCircleOutlined />}
                  title="Inventario"
                  detail={
                    stockIssues.length
                      ? "Stock insuficiente para la reserva"
                      : `${getAllocations(selectedProtocol).length} materiales con disponibilidad`
                  }
                />
              </Col>
              {activeServiceRequest && (
                <Col span={24}>
                  <Readiness
                    ok={accessReady}
                    icon={<SafetyCertificateOutlined />}
                    title="Preparación de acceso"
                    detail={`${completedAccessRequirements.length} de ${accessRequirements.length} condiciones listas · la identificación se vincula al técnico seleccionado`}
                  />
                </Col>
              )}
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
}

function Readiness({
  ok,
  icon,
  title,
  detail,
}: {
  ok: boolean;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Alert
      type={ok ? "success" : "warning"}
      showIcon
      icon={icon}
      message={title}
      description={detail}
    />
  );
}

function getAllocations(protocol?: Protocol): MaterialAllocation[] {
  return (protocol?.materialRequirements || []).map((r) => ({
    ...r,
    reservedQuantity: r.mode === "Exact" ? r.quantity || 0 : (r.max ?? r.min ?? 0),
  }));
}

function getInterval(date?: Dayjs, hour?: Dayjs, protocol?: Protocol) {
  if (!date || !hour || !protocol) return null;
  const start = dayjs(`${date.format("YYYY-MM-DD")} ${hour.format("HH:mm")}`);
  return {
    start: start.toISOString(),
    end: start.add(protocol.estimatedMinutes || 45, "minute").toISOString(),
  };
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return dayjs(startA).isBefore(dayjs(endB)) && dayjs(endA).isAfter(dayjs(startB));
}

function hasReservationConflict(scheduleId: string, reservations: ResourceReservation[]) {
  const ownReservations = reservations.filter(
    (reservation) =>
      reservation.scheduleId === scheduleId &&
      (reservation.status === "Reserved" || reservation.status === "InUse"),
  );
  return ownReservations.some((own) =>
    reservations.some(
      (candidate) =>
        candidate.scheduleId !== scheduleId &&
        candidate.resourceType === own.resourceType &&
        candidate.resourceId === own.resourceId &&
        (candidate.status === "Reserved" || candidate.status === "InUse") &&
        overlaps(own.startAt, own.endAt, candidate.startAt, candidate.endAt),
    ),
  );
}
