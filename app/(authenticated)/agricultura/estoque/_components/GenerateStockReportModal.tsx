"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useHarvest } from "@/contexts/HarvestContext";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { useStock } from "@/contexts/StockContext";
import { useIndustryStock } from "@/contexts/IndustryStockContext";
import { useIndustryHarvest } from "@/contexts/IndustryHarvestContext";
import { ProductType } from "@prisma/client";

export default function GenerateStockReportModal() {
  const { stocks } = useIndustryStock();
  const { harvests } = useIndustryHarvest();
  const [product, setProduct] = useState<ProductType>(ProductType.SOJA);
  const [deposit, setDeposit] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const produtosUnicos = Array.from(new Set(stocks.map((s) => s.product)));
  const depositosUnicos = Array.from(new Set(stocks.map((s) => s.industryDeposit.name)));

  const filteredStock = stocks.filter((c) => {
    const matchProduct = !product || c.product === product;
    const matchDeposit = !deposit || c.industryDeposit.name === deposit;
    return matchProduct && matchDeposit;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Estoque", 110, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Produto: ${product || "Todos"}`, 14, 35);



      autoTable(doc, {
        startY: 50,
        head: [["Produto", "Depósito", "Estoque (kg)"]],
        body: filteredStock.map((h) => [
          h.product,
          h.industryDeposit.name,
          h.quantity.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
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

      // === SOMATÓRIO POR DEPÓSITO ===
      const totalsByDeposit = filteredStock.reduce(
        (acc, curr) => {
          const name = curr.industryDeposit.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.quantity;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filteredStock.reduce(
        (acc, curr) => acc + curr.quantity,
        0,
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.text("Estoque por Depósito", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByDeposit).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} kg`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${totalGeral.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })} kg`,
        14,
        finalY + 6 + Object.keys(totalsByDeposit).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Estoque - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduct(ProductType.SOJA);
      setDeposit(null);
      setLoading(false);
      setModalOpen(false);
    };
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <HoverButton className="flex gap-2">
          <FaFilePdf />
          Gerar Relatório
        </HoverButton>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogTitle>Filtrar Relatório</DialogTitle>

        <div className="space-y-2">
          <label className="text-sm font-medium">Produto</label>
          <Select
            value={product ?? ""}
            onValueChange={(value) =>
              setProduct(value === "todos" ? ProductType.SOJA : value as ProductType)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {produtosUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Depósito</label>
          <Select
            value={deposit ?? ""}
            onValueChange={(value) =>
              setDeposit(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {depositosUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generatePDF}
          className="bg-green text-white"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Baixar PDF"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
