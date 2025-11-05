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
import { useIndustryHarvest } from "@/contexts/IndustryHarvestContext";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { formatNumber } from "@/app/_helpers/currency";

export default function GenerateHarvestReportModal() {
  const { harvests } = useIndustryHarvest();
  const [produto, setProduto] = useState<string | null>(null);
  const [deposito, setDeposito] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const [transportador, setTransportador] = useState<string | null>(null);
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
    new Set(harvests.map((h) => h.industryTransporter.name)),
  );
  const talhoesUnicos = Array.from(new Set(harvests.map((h) => h.talhao.name)));

  const filtered = harvests.filter((h) => {
    const matchProduto = !produto || h.product === produto;
    const matchDeposito = !deposito || h.industryDeposit.name === deposito;
    const matchTransportador = !transportador || h.industryTransporter.name === transportador;
    const matchTalhao = !talhao || h.talhao.name === talhao;
    return matchProduto && matchDeposito && matchTransportador && matchTalhao;
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
      doc.text(`Produto: ${produto || "Todos"}`, 14, 35);
      doc.text(`Talhão: ${talhao || "Todos"}`, 14, 40);
      doc.text(`Depósito: ${deposito || "Todos"}`, 14, 45);
      doc.text(`Transportador: ${transportador || "Todos"}`, 14, 50);



      autoTable(doc, {
        startY: 55,
        head: [["Data", "Talhão", "Depósito", "Peso Bruto (kg)", "Impureza", "Umidade", "Peso Líquido (kg)"]],
        body: filtered.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.talhao.name,
          h.industryDeposit.name,
          formatNumber(Number(h.weightSubLiq)),
          formatNumber(Number(h.impurities_percent)),
          formatNumber(Number(h.humidity_percent)),
          formatNumber(Number(h.weightLiq)),
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

      // === SOMATÓRIO POR TALHÃO ===
      const totalsByTalhao = filtered.reduce(
        (acc, curr) => {
          const name = curr.talhao.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += Number(curr.weightLiq);
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filtered.reduce(
        (acc, curr) => acc + Number(curr.weightLiq),
        0,
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;
      const pageHeight = doc.internal.pageSize.height;

      // Se o finalY + espaço dos totais ultrapassar o limite da página, quebra a página
      const numberOfLines = Object.keys(totalsByTalhao).length + 2; // +2 para o título e total geral
      const estimatedHeight = numberOfLines * 6 + 20;

      if (finalY + estimatedHeight > pageHeight) {
        doc.addPage();
        addFooter(); // Adiciona rodapé na nova página
        finalY = 20; // Recomeça mais acima na nova página
      }

      doc.setFontSize(9);
      doc.text("Total colhido por Talhão", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByTalhao).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${formatNumber(total)} kg`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${formatNumber(totalGeral)} kg`,
        14,
        finalY + 6 + Object.keys(totalsByTalhao).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Colheitas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduto(null);
      setDeposito(null);
      setTransportador(null);
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
        <h2 className="text-xl font-semibold">Filtrar Relatório</h2>

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
                <SelectItem key={p} value={p}>
                  {p}
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
