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
import { useSeedHarvestsByCycle } from "@/queries/seed/use-seed-harvest-query";
import { Harvest } from "@/types";
import { endOfDay, startOfDay } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateHarvestReportModal() {
    const { selectedCycle } = useCycle();
    const {
      data: harvests = [],
      refetch,
    } = useSeedHarvestsByCycle(selectedCycle?.id || "");
  const [cultivar, setCultivar] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cultivaresUnicos = Array.from(
    new Set(harvests.map((h) => h.cultivar?.name || "N/A")),
  );
  const talhoesUnicos = Array.from(new Set(harvests.map((h) => h.talhao?.name || "N/A")));

  const filterSeedHarvests = (list: Harvest[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;
    
    return list.filter((h) => {
      const matchCultivar = !cultivar || h.cultivar?.name === cultivar;
      const matchTalhao = !talhao || h.talhao?.name === talhao;
      const date = new Date(h.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);
      return matchDate && matchCultivar && matchTalhao;
    });
  };


  const generatePDF = async () => {
    setLoading(true);

    const latest = selectedCycle?.id ? await refetch() : null;
    const seedHarvestsToUse = (latest?.data ?? harvests) as Harvest[];
    const filteredToUse = filterSeedHarvests(seedHarvestsToUse);

    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/6.png";

    const periodLabel = 
      dateFrom || dateTo
        ? `${dateFrom ? dateFrom.toLocaleDateString("pt-BR") : "—"} até ${dateTo ? dateTo.toLocaleDateString("pt-BR") : "—"}`
        : "Todos";

    logo.onload = () => {
      // Função para adicionar rodapé consistente
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

      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Colheita - " + selectedCycle?.name || "",  150, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(company + " - Produto destinado à semente", 150, 25, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cultivar: ${cultivar || "Todos"}`, 14, 35);
      doc.text(`Talhão: ${talhao || "Todos"}`, 14, 40);
      doc.text(`Período: ${periodLabel}`, 14, 45);

      autoTable(doc, {
        startY: 50,
        head: [["Data", "Cultivar", "Talhão", "Fazenda", "Quantidade (kg)"]],
        body: filteredToUse.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.cultivar.name,
          h.talhao.name,
          h.talhao.farm.name,
          formatNumber(h.quantityKg),
        ]),
        foot:[["Total Geral", "", "", "", formatNumber(filteredToUse.reduce((acc, curr) => acc + curr.quantityKg, 0))]],
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

          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
          const totalPages = (doc as any).internal.getNumberOfPages();

          doc.text(
            `${currentPage}/${totalPages}`,
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
      const footerHeight = 20; // Espaço reservado para o rodapé
      const availableHeight = pageHeight - footerHeight;
      
      // Calcular espaço necessário para os totais
      const totalLines = Object.keys(totalsByCultivar).length + 2; // +2 para título e total geral
      const neededHeight = totalLines * 6 + 10; // 6px por linha + margem
      
      // Verificar se há espaço suficiente na página atual
        if (finalY + neededHeight > availableHeight) {
          doc.addPage();
          addFooter(); // Adicionar rodapé na nova página
          finalY = 20; // Começar no topo da nova página
        }

      doc.setFontSize(9);
      doc.text("Total colhido por Cultivar", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByCultivar).forEach(([name, total], index) => {
        const currentY = finalY + 6 + index * 6;
        
        // Verificar se ainda há espaço na página para esta linha
          if (currentY > availableHeight) {
            doc.addPage();
            addFooter(); // Adicionar rodapé na nova página
            finalY = 20;
            doc.setFontSize(9);
            doc.text("Total colhido por Cultivar (continuação)", 14, finalY);
          }
        
        doc.text(
          `${name}: ${formatNumber(total)} kg`,
          14,
          finalY + 6 + index * 6,
        );
      });

      const totalGeralY = finalY + 6 + Object.keys(totalsByCultivar).length * 6 + 6;
      
      // Verificar se há espaço para o total geral
        if (totalGeralY > availableHeight) {
          doc.addPage();
          addFooter(); // Adicionar rodapé na nova página
          doc.setFontSize(9);
          doc.text(
            `Total Geral: ${formatNumber(totalGeral)} kg`,
            14,
            30,
          );
        } else {
        doc.setFontSize(9);
        doc.text(
          `Total Geral: ${formatNumber(totalGeral)} kg`,
          14,
          totalGeralY,
        );
      }

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Colheitas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setCultivar(null);
      setTalhao(null);
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
          <label className="text-sm font-medium">Talhão</label>
          <Select
            value={talhao ?? ""}
            onValueChange={(value) =>
              setTalhao(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {talhoesUnicos.map((t) => (
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
