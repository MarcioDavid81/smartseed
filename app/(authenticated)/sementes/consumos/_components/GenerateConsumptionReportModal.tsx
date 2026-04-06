"use client";
import { formatNumber } from "@/app/_helpers/currency";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCycle } from "@/contexts/CycleContext";
import { useUser } from "@/contexts/UserContext";
import { useSeedConsumptionsByCycle } from "@/queries/seed/use-seed-consumption.query";
import { Consumption } from "@/types";
import { endOfDay, startOfDay } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateConsumptionReportModal() {
  const { selectedCycle } = useCycle();
  const {
    data: plantios = [],
    refetch,
  } = useSeedConsumptionsByCycle(selectedCycle?.id || "");
  const [cultivar, setCultivar] = useState<string | null>(null);
  const [farm, setFarm] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cultivaresUnicos = Array.from(
    new Set(plantios.map((h) => h.cultivar.name)),
  );

  const farmsUnicos = Array.from(new Set(plantios.map((h) => h.talhao.farm.name)));

  const talhaosUnicos = Array.from(
    new Set(plantios.map((h) => h.talhao?.name || "N/A")),
  );

  const filterSeedConsumptions = (list: Consumption[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((h) => {
      const matchCultivar = !cultivar || h.cultivar.name === cultivar;
      const matchFarm = !farm || h.talhao.farm.name === farm;
      const matchTalhao = !talhao || h.talhao?.name === talhao;
      const date = new Date(h.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);
      return matchCultivar && matchFarm && matchTalhao && matchDate;
    });
  };

  const generatePDF = async () => {
    setLoading(true);

    const latest = selectedCycle?.id ? await refetch() : null;
    const seedConsumptionsToUse = (latest?.data ?? plantios) as Consumption[];
    const filteredToUse = filterSeedConsumptions(seedConsumptionsToUse);

    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/6.png";

    const periodLabel = 
      dateFrom || dateTo
        ? `${dateFrom ? dateFrom.toLocaleDateString("pt-BR") : "—"} até ${dateTo ? dateTo.toLocaleDateString("pt-BR") : "—"}`
        : "Todos";

      const addFooter = () => {
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

        const centerText = "Sistema Smart Seed by MD Web Developer";
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

      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Plantio - " + selectedCycle?.name || "", 150, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(company + " - " + periodLabel, 150, 25, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cultivar: ${cultivar || "Todos"}`, 14, 35);
      doc.text(`Fazenda: ${farm || "Todas"}`, 14, 40);
      doc.text(`Talhão: ${talhao || "Todos"}`, 14, 45);
      doc.text(`Período: ${periodLabel}`, 14, 50);

      autoTable(doc, {
        startY: 55,
        head: [["Data", "Cultivar", "Fazenda", "Talhão", "Área (ha)", "Quantidade (kg)", "Média (kg/ha)"]],
        body: filteredToUse.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.cultivar.name,
          h.talhao.farm.name,
          h.talhao.name || "N/A",
          (h.talhao?.area || 1).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          h.quantityKg.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          (h.quantityKg / (h.talhao?.area || 1)).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
        ]),
        foot:[["Total Geral", "", "", "", "", formatNumber(filteredToUse.reduce((acc, curr) => acc + curr.quantityKg, 0))]],
        showFoot: "lastPage",
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [99, 185, 38],
          textColor: 255,
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [99,185,38],
          textColor: 255,
          fontStyle: "bold",
        },
        pageBreak: "auto",
        didDrawPage: function () {
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

          const centerText = "Sistema Smart Seed by MD Web Developer";
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

      // === SOMATÓRIO POR CULTIVAR ===
      const totalsByCultivar = filteredToUse.reduce(
        (acc, curr) => {
          const name = curr.cultivar.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.quantityKg;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filteredToUse.reduce(
        (acc, curr) => acc + curr.quantityKg,
        0,
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;
      const pageHeight = doc.internal.pageSize.height;

      // Se o finalY + espaço dos totais ultrapassar o limite da página, quebra a página
      const numberOfLines = Object.keys(totalsByCultivar).length + 2; // +2 para o título e total geral
      const estimatedHeight = numberOfLines * 6 + 20;

      if (finalY + estimatedHeight > pageHeight) {
        doc.addPage();
        addFooter(); // Adiciona rodapé na nova página
        finalY = 20; // Recomeça mais acima na nova página
      }

      doc.setFontSize(9);
      doc.text("Total Plantado por Cultivar", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByCultivar).forEach(([name, total], index) => {
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
        finalY + 6 + Object.keys(totalsByCultivar).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Plantio - ${fileNumber}.pdf`;
      doc.save(fileName);
      setCultivar(null);
      setFarm(null);
      setTalhao(null);
      setLoading(false);
      setModalOpen(false);
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
          <label className="text-sm font-medium">Fazenda</label>
          <Select
            value={farm ?? ""}
            onValueChange={(value) => setFarm(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {farmsUnicos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Talhão</label>
          <Select
            value={talhao ?? ""}
            onValueChange={(value) => setTalhao(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {talhaosUnicos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <DatePicker value={dateFrom} onChange={setDateFrom} />
            <DatePicker value={dateTo} onChange={setDateTo} />
          </div>
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
