"use client";

import { formatNumber } from "@/app/_helpers/currency";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
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
}

export default function GenerateIndustryExtractReportModal({
  movements,
}: Props) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "portrait" });
    const logo = new Image();
    logo.src = "/6.png";

    // Adiciona logo e título
    doc.addImage(logo, "PNG", 14, 10, 30, 15);
    doc.setFontSize(16);
    doc.text("Extrato de Movimentações", 110, 20, { align: "center" });
    const company = user.company.name;
    doc.setFontSize(12);
    doc.text(company, 110, 25, { align: "center" });

    // Cultivar
    doc.setFontSize(10);

    // Ordenar e montar dados
    const sorted = [...movements].sort(
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

    const stockNow =
      typeof sorted[0]?.balance === "number" ? Number(sorted[0].balance) : runningBalance;

    // Tabela
    autoTable(doc, {
      startY: 45,
      head: [["Data", "Quantidade (kg)", "Tipo", "Saldo (kg)"]],
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

        doc.setFontSize(8);
        doc.text(`Gerado em ${now} por: ${userName}`, 10, pageHeight - 10);

        const footerText = "Sistema Smart Seed";
        const centerTextWidth = doc.getTextWidth(footerText);
        doc.text(
          footerText,
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

    const fileName = `Extrato - ${Date.now()}.pdf`;
    doc.save(fileName);
    setLoading(false);
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
        <h2 className="text-xl font-semibold">Gerar Extrato em PDF</h2>
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
