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

  const [farmId, setFarmId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // === FAZENDAS ÚNICAS ===
  const farmsUnicas = Array.from(
    new Map(
      rains
        .filter((r) => r.farm)
        .map((r) => [r.farm.id, r.farm]),
    ).values(),
  );

  // === FILTRO ===
  const filtered = rains.filter((r) => {
    const matchFarm = !farmId || r.farmId === farmId;
    const matchStart =
      !startDate || new Date(r.date) >= new Date(startDate);
    const matchEnd =
      !endDate || new Date(r.date) <= new Date(endDate);

    return matchFarm && matchStart && matchEnd;
  });

  // === PDF ===
  const generatePDF = async () => {
    setLoading(true);

    const doc = new jsPDF({ orientation: "portrait" });
    const logo = new window.Image();
    logo.src = "/6.png";

    logo.onload = () => {
      const addFooter = () => {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;

        const now = new Date().toLocaleString("pt-BR");
        const userName = user?.name || "Usuário desconhecido";

        doc.setFontSize(8);
        doc.text(
          `Relatório gerado em ${now} por: ${userName}`,
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

        const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
        const totalPages = (doc as any).internal.getNumberOfPages();
        doc.text(
          `${currentPage}/${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
        );
      };

      // Cabeçalho
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Chuvas", 110, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(12);
      doc.text(company, 110, 25, { align: "center" });

      doc.setFontSize(10);
      doc.text(
        `Fazenda: ${
          farmId
            ? farmsUnicas.find((f) => f.id === farmId)?.name
            : "Todas"
        }`,
        14,
        35,
      );
      doc.text(
        `Período: ${
          startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "Início"
        } até ${
          endDate ? new Date(endDate).toLocaleDateString("pt-BR") : "Fim"
        }`,
        14,
        40,
      );

      // Tabela
      autoTable(doc, {
        startY: 55,
        head: [["Data", "Fazenda", "Chuva (mm)"]],
        body: filtered.map((r) => [
          new Date(r.date).toLocaleDateString("pt-BR"),
          r.farm?.name ?? "N/A",
          `${formatNumber(r.quantity)} mm`,
        ]),
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
        didDrawPage: addFooter,
      });

      doc.save(`Relatorio de Chuvas - ${Date.now()}.pdf`);
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
            value={farmId ?? "todas"}
            onValueChange={(v) => setFarmId(v === "todas" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {farmsUnicas.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
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
              value={startDate}
              onChange={setStartDate}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data final</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
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
