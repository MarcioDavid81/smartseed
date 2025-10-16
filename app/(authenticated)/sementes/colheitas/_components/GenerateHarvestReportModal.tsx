"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useHarvest } from "@/contexts/HarvestContext";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { formatNumber } from "@/app/_helpers/currency";

export default function GenerateHarvestReportModal() {
  const { harvests } = useHarvest();
  const [cultivar, setCultivar] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cultivaresUnicos = Array.from(
    new Set(harvests.map((h) => h.cultivar.name)),
  );
  const talhoesUnicos = Array.from(new Set(harvests.map((h) => h.talhao.name)));

  const filtered = harvests.filter((h) => {
    const matchCultivar = !cultivar || h.cultivar.name === cultivar;
    const matchTalhao = !talhao || h.talhao.name === talhao;
    return matchCultivar && matchTalhao;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/logo.png";

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
      doc.text(`Cultivar: ${cultivar || "Todos"}`, 14, 35);
      doc.text(`Talhão: ${talhao || "Todos"}`, 14, 40);

      autoTable(doc, {
        startY: 45,
        head: [["Data", "Cultivar", "Talhão", "Fazenda", "Quantidade (kg)"]],
        body: filtered.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.cultivar.name,
          h.talhao.name,
          h.talhao.farm.name,
          formatNumber(h.quantityKg),
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [1, 204, 101],
          textColor: 255,
          fontStyle: "bold",
        },
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
