"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Cultivar } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, SquarePenIcon } from "lucide-react";
import { useStock } from "@/contexts/StockContext";
import { getToken } from "@/lib/auth-client";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { ProductDataTable } from "@/components/ui/product-data-table";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EditCultivarStatusDialog } from "./EditCultivarStatusDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ListStockTable() {
  const [products, setProducts] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);
  const { cultivars, isLoading } = useStock();

  async function fetchProducts() {
    try {
      const token = getToken();
      const res = await fetch("/api/cultivars/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: Cultivar) => product.stock > 0
      );
      setProducts(filteredData);
    } catch (error) {
      console.error("Erro ao buscar cultivares:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Cultivar>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "product",
      header: "Produto",
      cell: ({ row: { original: cultivar } }) =>
        getProductLabel(cultivar.product),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-center">Estoque (kg)</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="text-center">
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
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex items-center justify-center">
            <span
              className={`text-center text-white px-2 py-1 rounded-full text-xs ${status === "BENEFICIADO" ? "bg-green" : "bg-red-500"}`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const cultivar = row.original;
        return (
          <div className="text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/estoque/${cultivar.id}`}>
                    <Button variant={"ghost"}>
                      <Search className="text-green" size={30} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Extrato da Cultivar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Dialog>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <SquarePenIcon size={20} className="text-green" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar Status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <EditCultivarStatusDialog
                cultivarId={cultivar.id}
                currentStatus={cultivar.status}
              />
            </Dialog>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="mb-4">
        <h2 className="font-medium">Estoque das Cultivares</h2>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Estoque...</p>
        </div>
      ) : (
        <ProductDataTable columns={columns} data={cultivars} />
      )}
    </Card>
  );
}
