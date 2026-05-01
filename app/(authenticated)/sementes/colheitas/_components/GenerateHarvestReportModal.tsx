"use client";
import { formatNumber } from "@/app/_helpers/currency";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useEffect, useMemo, useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateHarvestReportModal() {
    const { selectedCycle } = useCycle();
    const {
      data: harvests = [],
      refetch,
    } = useSeedHarvestsByCycle(selectedCycle?.id || "");
  const [fazenda, setFazenda] = useState<string | null>(null);    
  const [talhao, setTalhao] = useState<string | null>(null);
  const [cultivar, setCultivar] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fazendasUnicas = Array.from(
    new Set(harvests.map((h) => h.talhao?.farm?.name || "-")),
  );
  const talhoesFiltrados = useMemo(() => {
    let base = harvests;

    if (fazenda) {
      base = base.filter((h) => h.talhao?.farm?.name === fazenda);
    }

    return Array.from(
      new Set(base.map((h) => h.talhao?.name || "-")),
    );
  }, [harvests, fazenda]);

  const cultivaresUnicos = Array.from(
    new Set(harvests.map((h) => h.cultivar?.name || "N/A")),
  );

  useEffect(() => {
    setTalhao(null);
  }, [fazenda]);

  const filterSeedHarvests = (list: Harvest[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;
    
    return list.filter((h) => {
      const matchFazenda = !fazenda || h.talhao?.farm?.name === fazenda;
      const matchTalhao = !talhao || h.talhao?.name === talhao;
      const matchCultivar = !cultivar || h.cultivar?.name === cultivar;

      const date = new Date(h.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);

      return( 
        matchFazenda &&
        matchTalhao &&
        matchCultivar &&
        matchDate
      );
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
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Colheita - " + selectedCycle?.name || "",  150, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(company + " - Produto destinado à semente", 150, 25, { align: "center" });

      doc.setFontSize(10);
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // largura útil da página (tirando margens)
      const usableWidth = pageWidth - margin * 2;

      // divide em 2 colunas
      const columnWidth = usableWidth / 2;

      const startY = 35;
      const lineHeight = 5;

      const filters = [
        `Fazenda: ${fazenda || "Todos"}`,
        `Talhão: ${talhao || "Todos"}`,
        `Cultivar: ${cultivar || "Todos"}`,
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

      autoTable(doc, {
        startY: 45,
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
      setFazenda(null);
      setTalhao(null);
      setCultivar(null);
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
      <DialogContent className="max-w-2xl w-[calc(100%-1rem)] sm:w-full max-h-[95vh] overflow-hidden rounded-2xl">
        <DialogHeader>
          <DialogTitle>Filtrar Relatório</DialogTitle>
            <DialogDescription>
              Selecione os filtros para gerar o relatório de colheitas
            </DialogDescription>
        </DialogHeader>

        {/* Fazenda e Talhão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        
          <div className="space-y-2">
            <label className="text-sm font-medium">Fazenda</label>
            <Select
              value={fazenda ?? ""}
              onValueChange={(value) =>
                setFazenda(value === "todos" ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {fazendasUnicas.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
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
                {talhoesFiltrados.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cultivar */}
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

        {/* Período */}
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
