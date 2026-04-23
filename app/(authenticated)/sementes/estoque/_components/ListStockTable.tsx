"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Cultivar } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { ProductDataTable } from "@/components/ui/product-data-table";
import { CultivarExtractButton } from "./CultivarExtractButton";
import { CultivarStatusButton } from "./CultivarStatusButton";
import { CultivarStatusBadge } from "./CultivarStatusBadge";
import { AgroLoader } from "@/components/agro-loader";
import SeedTransformationButton from "./SeedTransformationButton";
import { useSeedCultivarStockQuery } from "@/queries/seed/use-seed-cultivar-query";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export function ListStockTable() {
  const [showZero, setShowZero] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("showZeroSeedStock");
    if (saved) setShowZero(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("showZeroSeedStock", String(showZero));
  }, [showZero]);

  const {
    data: cultivars = [],
    isLoading,
    isFetching,
    refetch
   } = useSeedCultivarStockQuery({
    showZero,
   });

  const columns: ColumnDef<Cultivar>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "product",
      header: "Produto",
      cell: ({ row: { original } }) =>
        getProductLabel(original.product),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-start">Estoque (kg)</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="text-start">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(stock)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <CultivarStatusBadge status={row.original.status} />
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const cultivar = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <CultivarExtractButton cultivar={cultivar} />
            <CultivarStatusButton
              cultivarId={cultivar.id}
              currentStatus={cultivar.status}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="font-light">Estoque das Cultivares</h2>
          <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Exibir zerados</span>
            <Switch
              checked={showZero}
              onCheckedChange={setShowZero}
            />
          </div>
          <SeedTransformationButton />
        </div>
      </div>

      {isLoading ? (
        <AgroLoader />
      ) : (
        <ProductDataTable
          columns={columns}
          data={cultivars}
          sumColumnId="stock"
        />
      )}
    </Card>
  );
}