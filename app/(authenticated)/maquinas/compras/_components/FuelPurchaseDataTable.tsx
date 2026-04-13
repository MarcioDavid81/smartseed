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
import { FunnelX } from "lucide-react";
import CreateFuelPurchaseButton from "./CreateFuelPurchaseButton";
import GenerateFuelPurchaseReportModal from "./GenerateFuelPurchaseReportModal";
import { getPaginationItems } from "@/app/_helpers/getPaginationItems";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  searchFields?: string[];
  sumColumnIds?: string[]; // Mudado para array
  sumLabels?: string[]; // Labels para cada soma
}

export function FuelPurchaseDataTable<TData, TValue>({
  columns,
  data,
  pageSize = 8,
  searchFields = [],
  sumColumnIds = [],
  sumLabels = [],
}: DataTableProps<TData, TValue>) {
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
  
  // Calcular soma para múltiplas colunas
  const sums = sumColumnIds.map(columnId => {
    const total = filteredRows.reduce((acc, row) => {
      const raw = row.getValue(columnId as any);
      const num = typeof raw === "number" ? raw : Number(raw);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    return total;
  });

  // Determinar quantas colunas ocupar no footer
  const footerColSpan = columns.length - (sumColumnIds.length * 2);

  return (
    <div className="space-y-4 dark:bg-primary rounded-md">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Procure por fornecedor"
            value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("customer")?.setFilterValue(event.target.value)
            }
            className="max-w-sm bg-gray-50 text-primary"
          />
          <Input
            placeholder="Procure por sócio"
            value={(table.getColumn("member")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("member")?.setFilterValue(event.target.value)
            }
            className="max-w-sm bg-gray-50 text-primary"
          />
          <Input
            placeholder="Procure por tanque"
            value={(table.getColumn("tank")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("tank")?.setFilterValue(event.target.value)
            }
            className="max-w-sm bg-gray-50 text-primary"
          />
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetColumnFilters()}
              className="text-muted-foreground hover:text-primary flex items-center gap-1 font-light text-sm"
            >
              <FunnelX size={14} />
              Limpar filtros
            </Button>
          )}
        </div>
        <CreateFuelPurchaseButton />
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
                  Nenhuma compra encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {sumColumnIds.length > 0 && (
              <TableRow>
                <TableCell 
                  colSpan={footerColSpan} 
                  className="text-start text-muted-foreground font-medium"
                >
                  Totais:
                </TableCell>
                {sumColumnIds.map((columnId, index) => {
                  const label = sumLabels[index] || columnId;
                  const value = sums[index];
                  const isCurrency = label.toLowerCase().includes('value') || columnId.toLowerCase().includes('value');
                  
                  return (
                    <TableCell 
                      key={columnId}
                      colSpan={2} 
                      className="text-start text-muted-foreground"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {isCurrency 
                            ? new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(value)
                            : new Intl.NumberFormat("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(value)
                          }
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableFooter>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between space-x-2 dark:text-primary">
        <GenerateFuelPurchaseReportModal  />
        <div className="flex items-center gap-1 justify-end">
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
            table.getPageCount()
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
                className="h-8 w-8 hover:bg-green/50 rounded-full font-light"
                onClick={() => table.setPageIndex(item)}
              >
                {item + 1}
              </Button>
            )
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