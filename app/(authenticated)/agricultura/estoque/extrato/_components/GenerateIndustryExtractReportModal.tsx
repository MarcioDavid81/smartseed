"use client";

import { formatNumber } from "@/app/_helpers/currency";
import HoverButton from "@/components/HoverButton";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { endOfDay, startOfDay } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export interface Movement {
  id: string;
  date: string | Date;
  quantity: number;
  type: string | null;
  balance?: number | null;
}

interface Props {
  movements: Movement[];
  depositName?: string;
  productLabel?: string;
}

export default function GenerateIndustryExtractReportModal({
  movements,
  depositName,
  productLabel,
}: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [movementType, setMovementType] = useState<"all" | "ENTRY" | "EXIT">(
    "all",
  );

  const filterMovements = (list: Movement[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((m) => {
      const date = new Date(m.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);
      const t = m.type?.toUpperCase() ?? "";
      const matchType = movementType === "all" || t === movementType;
      return matchDate && matchType;
    });
  };

  const generatePDF = () => {
    setLoading(true);

    const filtered = filterMovements(movements);

    const doc = new jsPDF({ orientation: "portrait" });
    const logo = new Image();
    logo.src = "/6.png";

    const periodLabel =
      dateFrom || dateTo
        ? `${dateFrom ? dateFrom.toLocaleDateString("pt-BR") : "—"} até ${dateTo ? dateTo.toLocaleDateString("pt-BR") : "—"}`
        : "Todos";

    const movementTypeLabel =
      movementType === "ENTRY"
        ? "Entrada"
        : movementType === "EXIT"
          ? "Saída"
          : "Todos";

    const depositLabel = depositName?.trim() ? depositName : "—";
    const productLabelText = productLabel?.trim() ? productLabel : "—";

    // Adiciona logo e título
    doc.addImage(logo, "PNG", 14, 10, 30, 15);
    doc.setFontSize(16);
    doc.text("Extrato de Movimentações", 110, 20, { align: "center" });
    const company = user.company.name;
    doc.setFontSize(12);
    doc.text(company, 110, 25, { align: "center" });

    // Filtros
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
        `Depósito: ${depositLabel || "Todos"}`,
        `Produto: ${productLabelText || "Todos"}`,
        `Período: ${periodLabel || "Todos"}`,
        `Tipo: ${movementTypeLabel || "Todos"}`,
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

    // Ordenar e montar dados
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const totals = sorted.reduce(
      (acc, m) => {
        const t = m.type?.toUpperCase() ?? "DESCONHECIDO";
        if (t === "ENTRY") acc.entries += m.quantity;
        if (t === "EXIT") acc.exits += m.quantity;
        return acc;
      },
      { entries: 0, exits: 0 },
    );

    let runningBalance = 0;
    const body = sorted.map((m) => {
      const t = m.type?.toUpperCase() ?? "DESCONHECIDO";
      const isEntry = t === "ENTRY";
      const typeLabel = t === "ENTRY" ? "Entrada" : t === "EXIT" ? "Saída" : t;

      const balance =
        typeof m.balance === "number"
          ? m.balance
          : runningBalance + (isEntry ? m.quantity : -m.quantity);

      runningBalance = balance;

      return [
        new Date(m.date).toLocaleDateString("pt-BR"),
        formatNumber(m.quantity),
        typeLabel,
        formatNumber(balance),
      ];
    });

    // Tabela
    const totalPagesExp = "{total_pages_count_string}";

    autoTable(doc, {
      startY: 45,
      head: [["Data", "Quantidade (kg)", "Tipo", "Saldo (kg)"]],
      showHead: "firstPage",
      body,
      foot: [["Total Entradas", formatNumber(totals.entries), "Total Saídas", formatNumber(totals.exits)]],
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
    const fileName = `Extrato - ${fileNumber}.pdf`;
    doc.save(fileName);
    setLoading(false);
    setDateFrom(undefined);
    setDateTo(undefined);
    setMovementType("all");
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <Select value={movementType} onValueChange={(v) => setMovementType(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ENTRY">Entrada</SelectItem>
              <SelectItem value="EXIT">Saída</SelectItem>
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
