"use client";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useInsumoStock } from "@/contexts/InsumoStockContext";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { useFilteredStock, useStockReport } from "./useStockReport";
import { formatNumber } from "@/app/_helpers/currency";
import { PRODUCT_CLASS_LABELS } from "@/app/(authenticated)/_constants/insumos";

export default function GenerateStockReportModal() {
  const { stocks } = useInsumoStock();
  const { user } = useUser();
  const [product, setProduct] = useState<string | null>(null);
  const [deposito, setDeposito] = useState<string | null>(null);
  const [classe, setClasse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { produtos, classes, depositos } = useStockReport(stocks);

  const filteredStock = useFilteredStock(stocks, product, deposito);

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
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // largura útil da página (tirando margens)
      const usableWidth = pageWidth - margin * 2;

      // divide em 3 colunas
      const columnWidth = usableWidth / 3;

      const startY = 35;
      const lineHeight = 5;

      const filters = [
        `Classe: ${PRODUCT_CLASS_LABELS[classe as keyof typeof PRODUCT_CLASS_LABELS] || "Todos"}`,
        `Produto: ${product || "Todos"}`,
        `Depósito: ${deposito || "Todos"}`,
      ];

      filters.forEach((text, index) => {
        const column = index % 3; // 0,1,2
        const row = Math.floor(index / 3);

        const x = margin + column * columnWidth;
        const y = startY + row * lineHeight;

        doc.text(text, x, y, {
          maxWidth: columnWidth - 5, // evita estourar a coluna
        });
      });

      // Tabela
      const totalPagesExp = "{total_pages_count_string}";

      autoTable(doc, {
        startY: 40,
        head: [["Produto", "Classe", "Depósito", "Estoque"]],
        body: filteredStock.map((h) => [
          h.product.name,
          PRODUCT_CLASS_LABELS[h.product.class],
          h.farm.name,
          h.stock
            .toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })
            .concat(` ${h.product.unit}`),
        ]),
        foot: [["Total Geral", "", "", formatNumber(filteredStock.reduce((acc, curr) => acc + Number(curr.stock), 0))]],
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
        didDrawPage: function () {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height;
          const pageWidth = pageSize.width;

          const now = new Date().toLocaleString("pt-BR");
          const userName = user?.name || "Usuário desconhecido";

          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

          doc.setFontSize(8);
          doc.text(`Gerado em ${now} por: ${userName}`, 10, pageHeight - 10);

          const footerText = "Sistema Smart Seed";
          doc.text(footerText, pageWidth / 2, pageHeight - 10, {
            align: "center",
          });

          doc.text(
            `${currentPage}/${totalPagesExp}`,
            pageWidth - 20,
            pageHeight - 10,
          );
        },
      });

      if (typeof (doc as any).putTotalPages === "function") {
        (doc as any).putTotalPages(totalPagesExp);
      }

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Estoque - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduct(null);
      setClasse(null);
      setDeposito(null);
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
        <h2 className="text-xl font-semibold">Filtrar Relatório</h2>

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
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {PRODUCT_CLASS_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {produtos.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
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
              {depositos.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
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
