"use client";
import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";
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
import { useHarvest } from "@/contexts/HarvestContext";
import { useStock } from "@/contexts/StockContext";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateStockReportModal() {
  const { cultivars } = useStock();
  const { harvests } = useHarvest();
  const [cultivar, setCultivar] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const produtosUnicos = Array.from(new Set(cultivars.map((c) => c.product)));

  const cultivaresUnicos = Array.from(
    new Set(harvests.map((h) => h.cultivar.name)),
  );

  const statusUnicos = Array.from(new Set(cultivars.map((c) => c.status)));

  const filteredStock = cultivars.filter((c) => {
    const matchProduct = !product || c.product === product;
    const matchCultivar = !cultivar || c.name === cultivar;
    const matchStatus = !status || c.status === status;
    return matchCultivar && matchProduct && matchStatus;
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // largura útil da página (tirando margens)
      const usableWidth = pageWidth - margin * 2;

      // divide em 3 colunas
      const columnWidth = usableWidth / 3;

      const startY = 35;
      const lineHeight = 5;

      const filters = [
        `Produto: ${PRODUCT_TYPE_LABELS[product as keyof typeof PRODUCT_TYPE_LABELS] || "Todos"}`,
        `Cultivar: ${cultivar || "Todos"}`,
        `Status: ${status || "Todos"}`,
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
        head: [["Nome", "Produto", "Estoque (kg)", "Status"]],
        body: filteredStock.map((h) => [
          h.name,
          PRODUCT_TYPE_LABELS[h.product],
          h.stock.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          h.status,
        ]),
        foot: [["Total Geral", "", formatNumber(filteredStock.reduce((acc, curr) => acc + Number(curr.stock), 0))]],
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
      setCultivar(null);
      setProduct(null);
      setStatus(null);
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
              setProduct(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {produtosUnicos.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRODUCT_TYPE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={status ?? ""}
            onValueChange={(value) =>
              setStatus(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {statusUnicos.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
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
