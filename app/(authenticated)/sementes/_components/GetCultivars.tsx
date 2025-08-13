"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Cultivar = {
  id: string;
  name: string;
  product: string;
};

export default function CultivarsList() {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCultivars = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/cultivars/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erro ao buscar cultivares");
        }

        const data = await res.json();
        setCultivars(data);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar cultivares");
      } finally {
        setLoading(false);
      }
    };

    fetchCultivars();
  }, []);

  if (loading)
    return (
      <p className="text-sm text-muted-foreground">Carregando cultivares...</p>
    );

  if (cultivars.length === 0)
    return <p className="text-sm">Nenhuma cultivar cadastrada.</p>;

  return (
    <div className="mt-4 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Produto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cultivars.map((cultivar) => (
            <TableRow key={cultivar.id}>
              <TableCell>{cultivar.product}</TableCell>
              <TableCell>{cultivar.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
