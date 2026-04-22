"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import HoverButton from "@/components/HoverButton";
import { useUser } from "@/contexts/UserContext";
import { useRains } from "@/queries/industry/use-rain";
import { DatePicker } from "@/components/ui/date-picker";
import { formatNumber } from "@/app/_helpers/currency";

export default function GenerateRainReportModal() {
  const { user } = useUser();
  const { data: rains = [], isLoading } = useRains();

  const [fazenda, setFazenda] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // === FAZENDAS ÚNICAS ===
  const fazendasUnicas = Array.from(
    new Set(
      rains
        .filter((r) => r.farm)
        .map((r) => r.farm.name),
    ),
  );

  // === FILTRO ===
  const filtered = rains.filter((r) => {
    const matchFarm = !fazenda || r.farm.name === fazenda;
    const matchStart =
      !dateFrom || new Date(r.date) >= new Date(dateFrom);
    const matchEnd =
      !dateTo || new Date(r.date) <= new Date(dateTo);

    return matchFarm && matchStart && matchEnd;
  });

  // === PDF ===
  const generatePDF = async () => {
    setLoading(true);

    const doc = new jsPDF({ orientation: "portrait" });
    const logo = new window.Image();
    logo.src = "/6.png";

    const periodLabel =
      dateFrom || dateTo
        ? `${dateFrom ? dateFrom.toLocaleDateString("pt-BR") : "—"} até ${dateTo ? dateTo.toLocaleDateString("pt-BR") : "—"}`
        : "Todos";

    logo.onload = () => {
      // Cabeçalho
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Chuvas", 110, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(12);
      doc.text(company, 110, 25, { align: "center" });

      doc.setFontSize(10);
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // largura útil da página (tirando margens)
      const usableWidth = pageWidth - margin * 2;

      // divide em 3 colunas
      const columnWidth = usableWidth / 2;

      const startY = 35;
      const lineHeight = 5;

      const filters = [
        `Fazenda: ${fazenda || "Todos"}`,
        `Período: ${periodLabel}`,
      ];

      filters.forEach((text, index) => {
        const column = index % 2; // 0,1
        const row = Math.floor(index / 2);

        const x = margin + column * columnWidth;
        const y = startY + row * lineHeight;

        doc.text(text, x, y, {
          maxWidth: columnWidth - 5, // evita estourar a coluna
        });
      });

      // Tabela
      const totalPagesExp = "{total_pages_count_string}";

      // Tabela
      autoTable(doc, {
        startY: 45,
        head: [["Data", "Fazenda", "Chuva (mm)"]],
        body: filtered.map((r) => [
          new Date(r.date).toLocaleDateString("pt-BR"),
          r.farm?.name ?? "N/A",
          `${formatNumber(r.quantity)} mm`,
        ]),
        showHead: "firstPage",
        foot: [["Total Geral", "", formatNumber(filtered.reduce((acc, curr) => acc + Number(curr.quantity), 0)) + " mm"]],
        showFoot: "lastPage",
        styles: { fontSize: 9 },
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
      const fileName = `Relatorio de Chuvas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setFazenda(null);
      setDateFrom(undefined);
      setDateTo(undefined);
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
        <DialogHeader>
          <DialogTitle>Filtrar Relatório</DialogTitle>
          <DialogDescription>
            Selecione os filtros para gerar o relatório de chuvas
          </DialogDescription>
        </DialogHeader>

        {/* FAZENDA */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Fazenda</label>
          <Select
            value={fazenda ?? "todas"}
            onValueChange={(v) => setFazenda(v === "todas" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {fazendasUnicas.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PERÍODO */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data inicial</label>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data final</label>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
            />
          </div>
        </div>

        <Button
          onClick={generatePDF}
          disabled={loading || isLoading}
          className="bg-green text-white"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Baixar PDF"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
