"use client";

import { tipoIndustryMovimentacaoInfo } from "@/app/_helpers/industryMovimentacao";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
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
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/6.png";

    // Adiciona logo e título
    doc.addImage(logo, "PNG", 14, 10, 30, 15);
    doc.setFontSize(16);
    doc.text("Extrato de Movimentações", 105, 20, { align: "center" });

    // Cultivar
    doc.setFontSize(10);

    // Ordenar e montar dados
    const sorted = [...movements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    let saldo = 0;
    const body = sorted.map((m) => {
      const tipoKey = m.type?.toUpperCase() ?? "DESCONHECIDO";
      const info = tipoIndustryMovimentacaoInfo[tipoKey] ?? {
        label: tipoKey,
        entrada: false,
      };

      saldo += info.entrada ? m.quantity : -m.quantity;

      return [
        new Date(m.date).toLocaleDateString("pt-BR"),
        m.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        info.label,
        saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      ];
    });

    // Tabela
    autoTable(doc, {
      startY: 45,
      head: [["Data", "Quantidade (kg)", "Tipo", "Saldo (kg)"]],
      body,
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [1, 204, 101],
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

    // === SALDO DA CULTIVAR ===
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text(`Estoque atual: ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg`, 14, finalY);

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
