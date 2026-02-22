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
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { formatNumber } from "@/app/_helpers/currency";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
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

  const [produto, setProduto] = useState<string | null>(null);
  const [deposito, setDeposito] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const [transportador, setTransportador] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const produtosUnicos = Array.from(
    new Set(harvests.map((h) => h.product)),
  );
  const depositosUnicos = Array.from(
    new Set(harvests.map((h) => h.industryDeposit.name)),
  );
  const transportadoresUnicos = Array.from(
    new Set(harvests.map((h) => h.industryTransporter?.name || "-")),
  );
  const talhoesUnicos = Array.from(new Set(harvests.map((h) => h.talhao.name)));

  const filterHarvests = (list: IndustryHarvest[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((h) => {
      const matchProduto = !produto || h.product === produto;
      const matchDeposito = !deposito || h.industryDeposit.name === deposito;
      const matchTransportador =
        !transportador || h.industryTransporter?.name === transportador;
      const matchTalhao = !talhao || h.talhao.name === talhao;

      const date = new Date(h.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);

      return (
        matchProduto &&
        matchDeposito &&
        matchTransportador &&
        matchTalhao &&
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
      doc.text("Relatório de Colheitas", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(
        `Produto: ${produto ? getProductLabel(produto) : "Todos"}`,
        14,
        35,
      );
      doc.text(`Talhão: ${talhao || "Todos"}`, 14, 40);
      doc.text(`Depósito: ${deposito || "Todos"}`, 14, 45);
      doc.text(`Transportador: ${transportador || "Todos"}`, 14, 50);
      doc.text(`Período: ${periodLabel}`, 14, 55);

      autoTable(doc, {
        startY: 60,
        head: [["Data", "Documento", "Talhão", "Depósito", "Peso Bruto (kg)", "Impureza", "Umidade", "Peso Líquido (kg)"]],
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
      const fileName = `Relatorio de Colheitas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduto(null);
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
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Filtrar Relatório</DialogTitle>
            <DialogDescription>
              Selecione os filtros para gerar o relatório de colheitas
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Produto</label>
          <Select
            value={produto ?? ""}
            onValueChange={(value) =>
              setProduto(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {produtosUnicos.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {getProductLabel(String(p))}
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
