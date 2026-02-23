"use client";
import { formatNumber } from "@/app/_helpers/currency";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIndustryHarvest } from "@/contexts/IndustryHarvestContext";
import { useIndustryStock } from "@/contexts/IndustryStockContext";
import { useUser } from "@/contexts/UserContext";
import { ProductType } from "@prisma/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

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
    const doc = new jsPDF({ orientation: "portrait" });

    const logo = new window.Image();
    logo.src = "/6.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Estoque", 110, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(12);
      doc.text(company, 110, 25, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Produto: ${product || "Todos"}`, 14, 35);



      autoTable(doc, {
        startY: 50,
        head: [["Produto", "Depósito", "Estoque (kg)"]],
        body: filteredStock.map((h) => [
          h.product,
          h.industryDeposit.name,
          formatNumber(Number(h.quantity)),
        ]),
        foot: [["Total Geral", "", formatNumber(filteredStock.reduce((acc, curr) => acc + Number(curr.quantity), 0))]],
        showFoot: "lastPage",
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [99,185,38],
          textColor: 255,
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [99,185,38],
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
