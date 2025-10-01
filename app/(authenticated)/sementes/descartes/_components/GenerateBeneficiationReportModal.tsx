"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import { useBeneficiation } from "@/contexts/BeneficiationContext";

export default function GenerateBeneficiationReportModal() {
  const { descartes } = useBeneficiation();
  const [cultivar, setCultivar] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cultivaresUnicos = Array.from(
    new Set(descartes.map((h) => h.cultivar.name)),
  );

  const filtered = descartes.filter((h) => {
    const matchCultivar = !cultivar || h.cultivar.name === cultivar;
    return matchCultivar;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Descartes", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cultivar: ${cultivar || "Todos"}`, 14, 35);

      autoTable(doc, {
        startY: 50,
        head: [["Data", "Cultivar", "Quantidade (kg)"]],
        body: filtered.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.cultivar.name,
          h.quantityKg.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [1, 204, 101],
          textColor: 255,
          fontStyle: "bold",
        },
        pageBreak: "auto",
        didDrawPage: function (data) {
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

      // === SOMATÓRIO POR CULTIVAR ===
      const totalsByCultivar = filtered.reduce(
        (acc, curr) => {
          const name = curr.cultivar.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.quantityKg;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filtered.reduce(
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
        finalY = 20; // Recomeça mais acima na nova página
      }

      doc.setFontSize(9);
      doc.text("Total descartado por Cultivar", 14, finalY);

      Object.entries(totalsByCultivar).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} kg`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.text(
        `Total Geral: ${totalGeral.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })} kg`,
        14,
        finalY + 6 + Object.keys(totalsByCultivar).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Descartes - ${fileNumber}.pdf`;
      doc.save(fileName);
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
      <DialogContent className="space-y-4">
        <h2 className="text-xl font-semibold">Filtrar Relatório</h2>

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
