"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { useInsumoStock } from "@/contexts/InsumoStockContext";

export default function GenerateStockReportModal() {
  const { insumos } = useInsumoStock();
  const [product, setProduct] = useState<string | null>(null);
  const [classe, setClasse] = useState<string | null>(null);
  const [deposito, setDeposito] = useState<string | null>(null);
  const { user } = useUser();

  const insumosUnicos = Array.from(new Set(insumos.map((h) => h.product.name)));
  const classesUnicas = Array.from(
    new Set(insumos.map((h) => h.product.class)),
  );
  const depositosUnicos = Array.from(new Set(insumos.map((h) => h.farm.name)));

  const filtered = insumos.filter((h) => {
    const matchInsumo = !product || h.product.name === product;
    const matchClasse = !product || h.product.class === classe;
    const matchDeposito = !product || h.farm.name === deposito;
    return matchInsumo && matchClasse && matchDeposito;
  });

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "portrait" });

    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Compras", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Produto: ${product || "Todos"}`, 14, 35);
      doc.text(`Classe: ${classe || "Todos"}`, 14, 40);
      doc.text(`Depósito: ${deposito || "Todos"}`, 14, 45);

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "Produto",
            "Classe",
            "Depósito",
            "Estoque",
          ],
        ],
        body: filtered.map((h) => [
          h.product.name,
          h.product.class,
          h.farm.name,
          h.stock.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }).concat(` ${h.product.unit}`),
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [1, 204, 101],
          textColor: 255,
          fontStyle: "bold",
        },
        didDrawPage: function (data) {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height;
          const pageWidth = pageSize.width;

          const now = new Date();
          const formattedDate = now.toLocaleString("pt-BR");
          const userName = user?.name || "Usuário desconhecido";

          doc.setFontSize(8);
          doc.text(
            `Relatório gerado em ${formattedDate} por: ${userName}`,
            10,
            pageHeight - 10,
          );

          const centerText = "Sistema Smart Seed";
          const centerTextWidth = doc.getTextWidth(centerText);
          doc.text(
            centerText,
            pageWidth / 2 - centerTextWidth / 2,
            pageHeight - 10,
          );

          const pageNumber = (doc as any).internal.getNumberOfPages();
          doc.text(
            `${pageNumber}/${pageNumber}`,
            pageWidth - 20,
            pageHeight - 10,
          );
        },
      });

      // === SOMATÓRIO POR PRODUTO ===
      const totalsByProduct = filtered.reduce(
        (acc, curr) => {
          const name = curr.product.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.stock;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filtered.reduce((acc, curr) => acc + curr.stock, 0);

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.text("Total em Estoque por Produto", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByProduct).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${totalGeral.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
        14,
        finalY + 6 + Object.keys(totalsByProduct).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Estoque - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduct(null);
      setClasse(null);
      setDeposito(null);
    };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <HoverButton className="flex gap-2">
          <FaFilePdf />
          Gerar Relatório
        </HoverButton>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <h2 className="text-xl font-semibold">Filtrar Relatório</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Produto</label>
          <Select
            value={product ?? ""}
            onValueChange={(value) =>
              setProduct(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {insumosUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Classe</label>
          <Select
            value={classe ?? ""}
            onValueChange={(value) =>
              setClasse(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {classesUnicas.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Depósito</label>
          <Select
            value={deposito ?? ""}
            onValueChange={(value) =>
              setClasse(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {depositosUnicos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generatePDF} className="bg-green text-white">
          Baixar PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
