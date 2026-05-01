"use client";
import { useState, useMemo, useEffect  } from "react";
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
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { formatNumber } from "@/app/_helpers/currency";
import { DatePicker } from "@/components/ui/date-picker";
import { useIndustryHarvests } from "@/queries/industry/use-harvests.query";
import { useCycle } from "@/contexts/CycleContext";
import { endOfDay, startOfDay } from "date-fns";
import { IndustryHarvest } from "@/types";

export default function GenerateHarvestReportModal() {
  const { selectedCycle } = useCycle();
  const {
    data: harvests = [],
    refetch,
  } = useIndustryHarvests(selectedCycle?.id);

  const [fazenda, setFazenda] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const [deposito, setDeposito] = useState<string | null>(null);
  const [transportador, setTransportador] = useState<string | null>(null);
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
  const depositosUnicos = Array.from(
    new Set(harvests.map((h) => h.industryDeposit?.name || "-")),
  );
  const transportadoresUnicos = Array.from(
    new Set(harvests.map((h) => h.industryTransporter?.name || "-")),
  );

  useEffect(() => {
    setTalhao(null);
  }, [fazenda]);

  const filterHarvests = (list: IndustryHarvest[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((h) => {
      const matchFazenda = !fazenda || h.talhao?.farm?.name === fazenda;
      const matchTalhao = !talhao || h.talhao?.name === talhao;
      const matchDeposito = !deposito || h.industryDeposit?.name === deposito;
      const matchTransportador = !transportador || h.industryTransporter?.name === transportador;

      const date = new Date(h.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);

      return (
        matchFazenda &&
        matchTalhao &&
        matchDeposito &&
        matchTransportador &&
        matchDate
      );
    });
  };

  const generatePDF = async () => {
    setLoading(true);

    const latest = selectedCycle?.id ? await refetch() : null;
    const harvestsToUse = (latest?.data ?? harvests) as IndustryHarvest[];
    const filteredToUse = filterHarvests(harvestsToUse);

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
      doc.text("Relatório de Colheita - " + selectedCycle?.name || "", 150, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(company + " - Produto destinado à indústria", 150, 25, { align: "center" });

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
        `Fazenda: ${fazenda || "Todos"}`,
        `Talhão: ${talhao || "Todos"}`,
        `Depósito: ${deposito || "Todos"}`,
        `Transportador: ${transportador || "Todos"}`,
        `Período: ${periodLabel}`,
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
        startY: 45,
        head: [["Data", "Documento", "Talhão", "Depósito", "Peso Bruto (kg)", "Impureza", "Umidade", "Peso Líquido (kg)"]],
        showHead: "firstPage",
        body: filteredToUse.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.document || "N/A",
          h.talhao.name,
          h.industryDeposit.name,
          formatNumber(Number(h.weightSubLiq)),
          formatNumber(Number(h.impurities_percent)),
          formatNumber(Number(h.humidity_percent)),
          formatNumber(Number(h.weightLiq)),
        ]),
        foot: [["Total Geral", "", "", "", formatNumber(filteredToUse.reduce((acc, curr) => acc + Number(curr.weightSubLiq), 0)), "", "", formatNumber(filteredToUse.reduce((acc, curr) => acc + Number(curr.weightLiq), 0))]],
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
      const fileName = `Relatorio de Colheitas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setFazenda(null);
      setDeposito(null);
      setTransportador(null);
      setTalhao(null);
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

        {/* Depósito e Transportador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Depósito</label>
            <Select
              value={deposito ?? ""}
              onValueChange={(value) =>
                setDeposito(value === "todos" ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {depositosUnicos.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Transportador</label>
            <Select
              value={transportador ?? ""}
              onValueChange={(value) =>
                setTransportador(value === "todos" ? null : value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {transportadoresUnicos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          disabled={loading || !selectedCycle?.id}
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Baixar PDF"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
