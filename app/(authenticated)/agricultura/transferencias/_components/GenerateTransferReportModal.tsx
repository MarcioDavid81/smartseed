"use client";
import { formatNumber } from "@/app/_helpers/currency";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useIndustryTransfer } from "@/contexts/IndustryTransferContext";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateTransferReportModal() {
  const { transfers } = useIndustryTransfer();
  const [produto, setProduto] = useState<string | null>(null);
  const [origem, setOrigem] = useState<string | null>(null);
  const [destino, setDestino] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Sanitizar listas: remover strings vazias
  const produtosUnicos = Array.from(
    new Set(transfers.map((h) => h.product)),
  ).filter((p) => p && p.trim() !== "");

  const origensUnicas = Array.from(
    new Set(transfers.map((h) => h.fromDeposit.name)),
  ).filter((c) => c && c.trim() !== "");

  const destinosUnicos = Array.from(
    new Set(transfers.map((h) => h.toDeposit.name)),
  ).filter((d) => d && d.trim() !== "");

  const filtered = transfers.filter((h) => {
    const matchProduto = !produto || h.product === produto;
    const matchOrigem = !origem || h.fromDeposit.name === origem;
    const matchDestino = !destino || h.toDeposit.name === destino;
    return matchProduto && matchOrigem && matchDestino;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "portrait" });

    const logo = new window.Image();
    logo.src = "/6.png";

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
      doc.text("Relatório de Transferências", 110, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Produto: ${produto || "Todos"}`, 14, 35);
      doc.text(`Origem: ${origem || "Todos"}`, 14, 40);
      doc.text(`Destino: ${destino || "Todos"}`, 14, 45);



      autoTable(doc, {
        startY: 55,
        head: [["Data", "Documento", "Origem", "Destino", "Peso Líquido (kg)"]],
        body: filtered.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.document || "N/A",
          h.fromDeposit?.name || "N/A",
          h.toDeposit?.name || "N/A",
          formatNumber(Number(h.quantity)),
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

          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
          const totalPages = (doc as any).internal.getNumberOfPages();
          doc.text(
            `${currentPage}/${totalPages}`,
            pageWidth - 20,
            pageHeight - 10,
          );
        },
      });

      // === SOMATÓRIO POR ORIGEM ===
      const totalsByOrigem = filtered.reduce(
        (acc, curr) => {
          const name = curr.fromDeposit?.name || "N/A";
          if (!acc[name]) acc[name] = 0;
          acc[name] += Number(curr.quantity);
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filtered.reduce(
        (acc, curr) => acc + Number(curr.quantity),
        0,
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;
      const pageHeight = doc.internal.pageSize.height;

      // Se o finalY + espaço dos totais ultrapassar o limite da página, quebra a página
      const numberOfLines = Object.keys(totalsByOrigem).length + 2; // +2 para o título e total geral
      const estimatedHeight = numberOfLines * 6 + 20;

      if (finalY + estimatedHeight > pageHeight) {
        doc.addPage();
        addFooter(); // Adiciona rodapé na nova página
        finalY = 20; // Recomeça mais acima na nova página
      }

      doc.setFontSize(9);
      doc.text("Total transferido por Origem:", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByOrigem).forEach(([name, total], index) => {
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
        finalY + 6 + Object.keys(totalsByOrigem).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Transferências - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduto(null);
      setOrigem(null);
      setDestino(null);
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
            Selecione os filtros para gerar o relatório de vendas
          </DialogDescription>
        </DialogHeader>

        {/* PRODUTO */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Produto</label>
          <Select
            value={produto ?? "todos"}
            onValueChange={(value) => setProduto(value === "todos" ? null : value)}
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

        {/* ORIGEM */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Origem</label>
          <Select
            value={origem ?? "todos"}
            onValueChange={(value) => setOrigem(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {origensUnicas.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DESTINO */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Destino</label>
          <Select
            value={destino ?? "todos"}
            onValueChange={(value) => setDestino(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {destinosUnicos.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
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