"use client";

import {
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  FilterFnOption,
  SortingState,
  getSortedRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import CreateHarvestButton from "./CreateHarvestButton";
import GenerateHarvestReportModal from "./GenerateHarvestReportModal";
import { FunnelX } from "lucide-react";
import { getPaginationItems } from "@/app/_helpers/getPaginationItems";
import { parseAsString, useQueryStates } from "nuqs";
import { HarvestFilterModal, HarvestFilters } from "./HarvestFilterModal";
import { IndustryHarvest } from "@/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  searchFields?: string[];
  sumColumnId?: string;
}

export function HarvestDataTable<TData, TValue>({
  columns,
  data,
  pageSize = 50,
  searchFields = [],
  sumColumnId,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filters, setFilters] = useQueryStates({
    farm: parseAsString.withDefault(""),
    talhao: parseAsString.withDefault(""),
    industryDeposit: parseAsString.withDefault(""),
    document: parseAsString.withDefault(""),
    transporter: parseAsString.withDefault(""),
    dateFrom: parseAsString.withDefault(""),
    dateTo: parseAsString.withDefault(""),
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.farm !== "" ||
      filters.talhao !== "" ||
      filters.industryDeposit !== "" ||
      filters.document !== "" ||
      filters.transporter !== "" ||
      filters.dateFrom !== "" ||
      filters.dateTo !== ""
    );
  }, [filters]);

  const parseDateStr = (s: string): Date | null => {
    if (!s) return null;
    const parts = s.split(/[-T]/);
    if (parts.length < 3) return null;
    const [y, m, d] = parts;
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const normalizeLocalDate = (d: Date | string): Date => {
    const date = typeof d === "string" ? new Date(d) : d;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const filteredByDate = useMemo(() => {
    const from = filters.dateFrom ? parseDateStr(filters.dateFrom) : null;
    const to = filters.dateTo ? parseDateStr(filters.dateTo) : null;

    if (!from && !to) return data;

    return data.filter((item) => {
      const harvest = item as unknown as IndustryHarvest;
      const date = normalizeLocalDate(harvest.date);
      const matchFrom = !from || date.getTime() >= from.getTime();
      const matchTo = !to || date.getTime() <= to.getTime();
      return matchFrom && matchTo;
    });
  }, [data, filters.dateFrom, filters.dateTo]);

  const table = useReactTable({
    data: filteredByDate,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: (row, _, search) => {
        const data = row.original;
        return searchFields.some((field) => data[field].includes(search));
      },
    },
    globalFilterFn: "fuzzy" as FilterFnOption<TData>,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  useEffect(() => {
    table.getColumn("farm")?.setFilterValue(filters.farm);
    table.getColumn("talhao")?.setFilterValue(filters.talhao);
    table.getColumn("industryDeposit")?.setFilterValue(filters.industryDeposit);
    table.getColumn("document")?.setFilterValue(filters.document);
    table.getColumn("transporter")?.setFilterValue(filters.transporter);
  }, [filters, table]);

  const filteredRows = table.getFilteredRowModel().rows;
  const totalKg = sumColumnId
    ? filteredRows.reduce((acc, row) => {
        const raw = row.getValue(sumColumnId as any);
        const num = typeof raw === "number" ? raw : Number(raw);
        return acc + (isNaN(num) ? 0 : num);
      }, 0)
    : 0;

  const handleApplyFilters = (newFilters: HarvestFilters) => {
    setFilters({
      farm: newFilters.farm || null,
      talhao: newFilters.talhao || null,
      industryDeposit: newFilters.industryDeposit || null,
      document: newFilters.document || null,
      transporter: newFilters.transporter || null,
      dateFrom: newFilters.dateFrom
        ? new Date(
            newFilters.dateFrom.getTime() -
              newFilters.dateFrom.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 10)
        : null,
      dateTo: newFilters.dateTo
        ? new Date(
            newFilters.dateTo.getTime() -
              newFilters.dateTo.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 10)
        : null,
    });
  };

  const handleClearFilters = () => {
    table.resetColumnFilters();
    setFilters({
      farm: null,
      talhao: null,
      industryDeposit: null,
      document: null,
      transporter: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const harvestFilters: HarvestFilters = {
    farm: filters.farm ?? "",
    talhao: filters.talhao ?? "",
    industryDeposit: filters.industryDeposit ?? "",
    document: filters.document ?? "",
    transporter: filters.transporter ?? "",
    dateFrom: parseDateStr(filters.dateFrom ?? ""),
    dateTo: parseDateStr(filters.dateTo ?? ""),
  };

  return (
    <div className="space-y-4 rounded-md dark:bg-primary">
      <div className="flex flex-col items-start justify-between gap-4 py-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <HarvestFilterModal
            filters={harvestFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm font-light text-muted-foreground hover:text-primary"
            >
              <FunnelX size={14} />
              Limpar filtros
            </Button>
          )}
        </div>
        <CreateHarvestButton />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={columns.length - 2}
                className="text-start text-muted-foreground"
              >
                <h3>Total</h3>
              </TableCell>
              <TableCell
                colSpan={2}
                className="text-start text-muted-foreground"
              >
                {sumColumnId ? (
                  <div>
                    {new Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalKg)}{" "}
                    Kg
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between space-x-2 dark:text-primary">
        <GenerateHarvestReportModal />
        <div className="flex items-center justify-end gap-1">
          {/* Anterior */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-full hover:bg-green/50"
          >
            ‹
          </Button>

          {getPaginationItems(
            table.getState().pagination.pageIndex,
            table.getPageCount(),
          ).map((item, index) =>
            item === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                size="sm"
                variant={
                  item === table.getState().pagination.pageIndex
                    ? "default"
                    : "ghost"
                }
                className="h-8 w-8 rounded-full font-light hover:bg-green/50"
                onClick={() => table.setPageIndex(item)}
              >
                {item + 1}
              </Button>
            ),
          )}

          {/* Próximo */}
          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-full hover:bg-green/50"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}
