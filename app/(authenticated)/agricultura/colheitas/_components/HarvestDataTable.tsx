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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import CreateHarvestButton from "./CreateHarvestButton";
import GenerateHarvestReportModal from "./GenerateHarvestReportModal";

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
  pageSize = 8,
  searchFields = [],
  sumColumnId,
}: DataTableProps<TData, TValue>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
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
        return searchFields.some(field => data[field].includes(search));
      }
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
    }
  });

  const filteredRows = table.getFilteredRowModel().rows;
  const totalKg = sumColumnId
    ? filteredRows.reduce((acc, row) => {
        const raw = row.getValue(sumColumnId as any);
        const num = typeof raw === "number" ? raw : Number(raw);
        return acc + (isNaN(num) ? 0 : num);
      }, 0)
    : 0;

  return (
    <div className="space-y-4 dark:bg-primary rounded-md">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Procure por talhão"
            value={(table.getColumn("talhao")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("talhao")?.setFilterValue(event.target.value)
            }
            className="max-w-sm bg-gray-50 text-primary"
          />
          <Input
            placeholder="Procure por fazenda"
            value={(table.getColumn("farm")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("farm")?.setFilterValue(event.target.value)
            }
            className="max-w-sm bg-gray-50 text-primary"
          />
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
                          header.getContext()
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
                        cell.getContext()
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
                  Nenhuma colheita encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length - 2} className="text-start text-muted-foreground">
                <h3>Total</h3>
              </TableCell>
              <TableCell colSpan={2} className="text-start text-muted-foreground">                
                {sumColumnId ? (
                  <div>
                    {new Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalKg)} Kg
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between space-x-2 dark:text-primary">
        <GenerateHarvestReportModal  />
        <div className="flex items-center space-x-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}