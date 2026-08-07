import { useMemo, useState } from "react";
import { Badge, Button, Input, Popover, Select, Space, Table, Typography } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";

type Accessor<T> = keyof T | ((record: T) => unknown);

export type SmartTableFilter<T> = {
  key: string;
  label: string;
  accessor: Accessor<T>;
  options?: Array<{ label: string; value: string }>;
};

export type SmartTableProps<T extends object> = TableProps<T> & {
  searchFields?: Accessor<T>[];
  searchPlaceholder?: string;
  filterFields?: SmartTableFilter<T>[];
};

function getValue<T>(record: T, accessor: Accessor<T>) {
  return typeof accessor === "function" ? accessor(record) : record[accessor];
}

function getDataIndexValue(record: unknown, dataIndex: unknown) {
  const path = Array.isArray(dataIndex)
    ? dataIndex.filter(
        (key): key is string | number => typeof key === "string" || typeof key === "number",
      )
    : typeof dataIndex === "string" || typeof dataIndex === "number"
      ? [dataIndex]
      : [];
  return path.reduce<unknown>((value, key) => {
    if (value && typeof value === "object") return (value as Record<string | number, unknown>)[key];
    return undefined;
  }, record);
}

function searchableText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(searchableText).join(" ");
  if (typeof value === "object") return Object.values(value).map(searchableText).join(" ");
  return String(value);
}

function comparable(value: unknown) {
  if (typeof value === "number") return value;
  const text = String(value ?? "").trim();
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return Date.parse(text);
  return text;
}

function compareValues(left: unknown, right: unknown) {
  const a = comparable(left);
  const b = comparable(right);
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
}

function optionValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(optionValues);
  if (value === null || value === undefined || value === "") return [];
  return [String(value)];
}

export function SmartTable<T extends object>({
  dataSource,
  columns,
  searchFields,
  searchPlaceholder = "Buscar en la tabla",
  filterFields,
  ...tableProps
}: SmartTableProps<T>) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const source = useMemo(() => Array.from(dataSource ?? []), [dataSource]);

  const enhancedColumns = useMemo(
    () =>
      columns?.map((column) => {
        if (!("dataIndex" in column) || column.sorter || column.dataIndex === undefined)
          return column;
        return {
          ...column,
          sorter: (left: T, right: T) =>
            compareValues(
              getDataIndexValue(left, column.dataIndex!),
              getDataIndexValue(right, column.dataIndex!),
            ),
          sortDirections: ["ascend", "descend"] as Array<"ascend" | "descend">,
        };
      }),
    [columns],
  );

  const automaticFilters = useMemo<SmartTableFilter<T>[]>(() => {
    if (filterFields) return filterFields;
    return (columns ?? []).flatMap((column) => {
      if (
        !("dataIndex" in column) ||
        column.dataIndex === undefined ||
        typeof column.title !== "string"
      ) {
        return [];
      }
      const values = Array.from(
        new Set(source.flatMap((row) => optionValues(getDataIndexValue(row, column.dataIndex!)))),
      );
      if (values.length < 2 || values.length > 12) return [];
      return [
        {
          key: Array.isArray(column.dataIndex)
            ? column.dataIndex.join(".")
            : String(column.dataIndex),
          label: column.title,
          accessor: (row: T) => getDataIndexValue(row, column.dataIndex!),
          options: values
            .sort((a, b) => compareValues(a, b))
            .map((value) => ({ label: value, value })),
        },
      ];
    });
  }, [columns, filterFields, source]);

  const resolvedFilters = useMemo(
    () =>
      automaticFilters.map((filter) => {
        if (filter.options) return filter;
        const values = Array.from(
          new Set(source.flatMap((row) => optionValues(getValue(row, filter.accessor)))),
        );
        return {
          ...filter,
          options: values
            .sort((a, b) => compareValues(a, b))
            .map((value) => ({ label: value, value })),
        };
      }),
    [automaticFilters, source],
  );

  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return source.filter((record) => {
      const searchValue = searchFields?.length
        ? searchFields.map((field) => searchableText(getValue(record, field))).join(" ")
        : searchableText(record);
      if (normalizedQuery && !searchValue.toLocaleLowerCase("es").includes(normalizedQuery)) {
        return false;
      }
      return resolvedFilters.every((filter) => {
        const selected = filters[filter.key];
        if (!selected) return true;
        return optionValues(getValue(record, filter.accessor)).includes(selected);
      });
    });
  }, [filters, query, resolvedFilters, searchFields, source]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const filterContent = (
    <div className="smart-table-filter-panel">
      {resolvedFilters.length ? (
        resolvedFilters.map((filter) => (
          <label key={filter.key} className="smart-table-filter-field">
            <Typography.Text>{filter.label}</Typography.Text>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={`Todos · ${filter.label}`}
              value={filters[filter.key]}
              options={filter.options}
              onChange={(value) => setFilters((current) => ({ ...current, [filter.key]: value }))}
            />
          </label>
        ))
      ) : (
        <Typography.Text type="secondary">
          No hay filtros adicionales para estos datos.
        </Typography.Text>
      )}
      {activeFilterCount > 0 && (
        <Button type="link" onClick={() => setFilters({})} className="smart-table-clear-filters">
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="smart-table">
      <div className="smart-table-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Space wrap>
          <Popover
            trigger="click"
            placement="bottomRight"
            title="Filtrar tabla"
            content={filterContent}
          >
            <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
              <Button icon={<FilterOutlined />}>Filtros</Button>
            </Badge>
          </Popover>
          <Typography.Text type="secondary" className="smart-table-result-count">
            {filteredData.length} {filteredData.length === 1 ? "resultado" : "resultados"}
          </Typography.Text>
        </Space>
      </div>
      <Table<T>
        {...tableProps}
        dataSource={filteredData}
        columns={enhancedColumns}
        showSorterTooltip={{ title: "Ordenar" }}
      />
    </div>
  );
}
