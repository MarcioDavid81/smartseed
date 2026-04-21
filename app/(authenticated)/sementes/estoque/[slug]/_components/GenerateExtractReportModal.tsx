"use client";

import { getMovimentacaoDirection } from "@/app/_helpers/getMovimentacaoDirection";
import { tipoMovimentacaoInfo } from "@/app/_helpers/movimentacao";
import HoverButton from "@/components/HoverButton";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { endOfDay, startOfDay } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

interface Movement {
  id: string;
  date: string;
  quantity: number;
  type: string | null;
}

interface Props {
  cultivarName: string;
  movements: Movement[];
}

export default function GenerateExtractReportModal({
  cultivarName,
  movements,
}: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const filterMovements = (list: Movement[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((m) => {
      const date = new Date(m.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);
      return matchDate;
    });
  };

  const generatePDF = () => {
    setLoading(true);
    const filtered = filterMovements(movements);
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/6.png";

    const periodLabel =
      dateFrom || dateTo
        ? `${dateFrom ? dateFrom.toLocaleDateString("pt-BR") : "—"} até ${dateTo ? dateTo.toLocaleDateString("pt-BR") : "—"}`
        : "Todos";

    // Adiciona logo e título
    doc.addImage(logo, "PNG", 14, 10, 30, 15);
    doc.setFontSize(16);
    doc.text("Extrato de Movimentações", 110, 20, { align: "center" });
    const company = user.company.name;
    doc.setFontSize(12);
    doc.text(company, 110, 25, { align: "center" });

    // Cultivar
    doc.setFontSize(10);
    doc.text(`Cultivar: ${cultivarName}`, 14, 35);
    doc.text(`Período: ${periodLabel}`, 14, 40);

    // Ordenar e montar dados
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let saldo = 0;

    const body = sorted.map((m) => {
      const tipoKey = m.type?.toUpperCase() ?? "DESCONHECIDO";
      const info = tipoMovimentacaoInfo[tipoKey] ?? {
        label: tipoKey,
        entrada: false,
      };

      if (tipoKey === "AJUSTE") {
        // ajuste já vem com sinal correto
        saldo += m.quantity;
      } else {
        const direction = getMovimentacaoDirection(tipoKey, m.quantity);
        saldo += direction === "entrada" ? m.quantity : -m.quantity;
      }

  return [
    new Date(m.date).toLocaleDateString("pt-BR"),
    m.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    info.label,
    saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
  ];
});


    // Tabela
    const totalPagesExp = "{total_pages_count_string}";

    autoTable(doc, {
      startY: 45,
      head: [["Data", "Quantidade (kg)", "Tipo", "Saldo (kg)"]],
      showHead: "firstPage",
      body,
      foot: [["Total", "", "", saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })]],
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
      didDrawPage: () => {
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
    const fileName = `Extrato ${cultivarName} - ${fileNumber}.pdf`;
    doc.save(fileName);
    setLoading(false);
    setDateFrom(undefined);
    setDateTo(undefined);
    setModalOpen(false);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <HoverButton className="flex gap-2">
          <FaFilePdf />
          Extrato em PDF
        </HoverButton>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <AlertDialogHeader>
          <DialogTitle>Filtrar Relatório</DialogTitle>
            <DialogDescription>
              Selecione os filtros para gerar o relatório de extrato
            </DialogDescription>
        </AlertDialogHeader>
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
