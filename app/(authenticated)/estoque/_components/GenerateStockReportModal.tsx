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
import { useHarvest } from "@/contexts/HarvestContext";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { useStock } from "@/contexts/StockContext";

export default function GenerateStockReportModal() {
  const { cultivars } = useStock();
  const { harvests } = useHarvest();
  const [cultivar, setCultivar] = useState<string | null>(null);
  const { user } = useUser();

  const cultivaresUnicos = Array.from(
    new Set(harvests.map((h) => h.cultivar.name))
  );

  const filteredStock = cultivars.filter((c) => {
    const matchCultivar = !cultivar || c.name === cultivar;
    return matchCultivar;
  });

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Estoque", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cultivar: ${cultivar || "Todos"}`, 14, 35);

      autoTable(doc, {
        startY: 50,
        head: [["Nome", "Produto", "Estoque (kg)", "Status"]],
        body: filteredStock.map((h) => [
          h.name,
          h.product,
          h.stock.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          h.status,
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
            pageHeight - 10
          );

          const centerText = "Sistema Smart Seed";
          const centerTextWidth = doc.getTextWidth(centerText);
          doc.text(
            centerText,
            pageWidth / 2 - centerTextWidth / 2,
            pageHeight - 10
          );

          const pageNumber = (doc as any).internal.getNumberOfPages();
          doc.text(
            `${pageNumber}/${pageNumber}`,
            pageWidth - 20,
            pageHeight - 10
          );
        },
      });

      // === SOMATÓRIO POR CULTIVAR ===
      const totalsByCultivar = filteredStock.reduce((acc, curr) => {
        const name = curr.name;
        if (!acc[name]) acc[name] = 0;
        acc[name] += curr.stock;
        return acc;
      }, {} as Record<string, number>);

      const totalGeral = filteredStock.reduce(
        (acc, curr) => acc + curr.stock,
        0
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.text("Estoque por Cultivar", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByCultivar).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} kg`,
          14,
          finalY + 6 + index * 6
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${totalGeral.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })} kg`,
        14,
        finalY + 6 + Object.keys(totalsByCultivar).length * 6 + 6
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Estoque - ${fileNumber}.pdf`;
      doc.save(fileName);
      setCultivar(null);
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
          <label className="text-sm font-medium">Cultivar</label>
          <Select
            value={cultivar ?? ""}
            onValueChange={(value) =>
              setCultivar(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {cultivaresUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
