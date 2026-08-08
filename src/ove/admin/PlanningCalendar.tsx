import type { CSSProperties, KeyboardEvent } from "react";
import { ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { Badge, Empty, Tag, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { Schedule } from "../types";
import { PLANNING_MONTH_NAMES, type PlanningView } from "./planningCalendarUtils";

export type PlanningCalendarItem = Schedule & {
  protocol?: string;
  asset?: string;
  duration: number;
  hasConflict: boolean;
};

type PlanningCalendarProps = {
  view: Exclude<PlanningView, "list">;
  anchorDate: Dayjs;
  items: PlanningCalendarItem[];
  onSelectDate: (date: Dayjs) => void;
  onCreateAt: (date: Dayjs, hour?: string) => void;
  onOpenOrder: (scheduleId: string) => void;
};

const WEEKDAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
export function PlanningCalendar({
  view,
  anchorDate,
  items,
  onSelectDate,
  onCreateAt,
  onOpenOrder,
}: PlanningCalendarProps) {
  if (view === "month") {
    return (
      <MonthCalendar
        anchorDate={anchorDate}
        items={items}
        onSelectDate={onSelectDate}
        onCreateAt={onCreateAt}
        onOpenOrder={onOpenOrder}
      />
    );
  }

  const days = view === "day" ? [anchorDate.startOf("day")] : getWeekDays(anchorDate);
  const hours = Array.from({ length: 13 }, (_, index) => index + 6);
  const gridStyle = { "--planning-day-count": days.length } as CSSProperties;

  return (
    <div className={`planning-time-grid planning-time-grid-${view}`} style={gridStyle}>
      <div className="planning-grid-corner">Hora</div>
      {days.map((date) => (
        <button
          key={date.format("YYYY-MM-DD")}
          type="button"
          className={`planning-day-heading ${date.isSame(dayjs(), "day") ? "is-today" : ""}`}
          onClick={() => onSelectDate(date)}
        >
          <span>{WEEKDAY_NAMES[date.day()]}</span>
          <strong>{date.format("DD")}</strong>
          <em>{PLANNING_MONTH_NAMES[date.month()].slice(0, 3)}</em>
        </button>
      ))}

      {hours.flatMap((hour) => [
        <div className="planning-hour-label" key={`hour-${hour}`}>
          {String(hour).padStart(2, "0")}:00
        </div>,
        ...days.map((date) => {
          const dateKey = date.format("YYYY-MM-DD");
          const cellItems = items.filter(
            (item) => item.date === dateKey && Number(item.hour.slice(0, 2)) === hour,
          );
          return (
            <div
              key={`${dateKey}-${hour}`}
              className={`planning-time-cell ${date.isSame(dayjs(), "day") ? "is-today" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Programar el ${date.format("DD/MM/YYYY")} a las ${hour}:00`}
              onClick={() => onCreateAt(date, `${String(hour).padStart(2, "0")}:00`)}
              onKeyDown={(event) => handleCellKey(event, () => onCreateAt(date, `${hour}:00`))}
            >
              {cellItems.map((item) => (
                <CalendarOrder
                  key={item.id}
                  item={item}
                  compact={view === "week"}
                  onOpen={() => onOpenOrder(item.id)}
                />
              ))}
            </div>
          );
        }),
      ])}
    </div>
  );
}

function MonthCalendar({
  anchorDate,
  items,
  onSelectDate,
  onCreateAt,
  onOpenOrder,
}: Omit<PlanningCalendarProps, "view">) {
  const monthStart = anchorDate.startOf("month");
  const gridStart = monthStart.subtract(monthStart.day(), "day");
  const days = Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));

  return (
    <div className="planning-month-grid">
      {WEEKDAY_NAMES.map((name) => (
        <div key={name} className="planning-month-weekday">
          {name}
        </div>
      ))}
      {days.map((date) => {
        const dateKey = date.format("YYYY-MM-DD");
        const dayItems = items.filter((item) => item.date === dateKey);
        const isCurrentMonth = date.month() === anchorDate.month();
        return (
          <div
            key={dateKey}
            className={`planning-month-day ${isCurrentMonth ? "" : "is-outside"} ${date.isSame(dayjs(), "day") ? "is-today" : ""}`}
            role="button"
            tabIndex={0}
            onDoubleClick={() => onCreateAt(date)}
            onKeyDown={(event) => handleCellKey(event, () => onCreateAt(date))}
          >
            <button
              type="button"
              className="planning-month-number"
              onClick={() => onSelectDate(date)}
            >
              {date.format("D")}
            </button>
            {dayItems.length > 0 && (
              <Badge
                count={dayItems.length}
                overflowCount={9}
                color={dayItems.some((item) => item.hasConflict) ? "#d4380d" : "#7b35c1"}
              />
            )}
            <div className="planning-month-events">
              {dayItems.slice(0, 2).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`planning-month-event status-${item.status.toLowerCase()}`}
                  onClick={() => onOpenOrder(item.id)}
                  title={`${item.workOrder} · ${item.protocol}`}
                >
                  <span>{item.hour}</span> {item.workOrder}
                </button>
              ))}
              {dayItems.length > 2 && (
                <span className="planning-month-more">+{dayItems.length - 2} más</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarOrder({
  item,
  compact,
  onOpen,
}: {
  item: PlanningCalendarItem;
  compact: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={`planning-calendar-order status-${item.status.toLowerCase()} ${item.hasConflict ? "has-conflict" : ""}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <span className="planning-calendar-order-time">
        <ClockCircleOutlined /> {item.hour} · {item.duration} min
      </span>
      <strong>{item.workOrder}</strong>
      <span>{compact ? item.assetId : item.protocol}</span>
      {!compact && <em>{item.asset}</em>}
      {item.hasConflict && (
        <Tag color="error" icon={<WarningOutlined />}>
          Conflicto
        </Tag>
      )}
    </button>
  );
}

export function PlanningCalendarEmpty() {
  return (
    <div className="planning-calendar-empty">
      <Empty description="No hay mantenimientos para los filtros seleccionados" />
      <Typography.Text type="secondary">
        Selecciona una fecha u hora disponible para programar un mantenimiento.
      </Typography.Text>
    </div>
  );
}

function getWeekDays(anchorDate: Dayjs) {
  const start = startOfOperationalWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => start.add(index, "day"));
}

function startOfOperationalWeek(date: Dayjs) {
  return date.subtract((date.day() + 6) % 7, "day").startOf("day");
}

function handleCellKey(event: KeyboardEvent, action: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}
