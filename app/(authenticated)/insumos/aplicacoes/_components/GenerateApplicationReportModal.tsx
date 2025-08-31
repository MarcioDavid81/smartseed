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
import { FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { useApplication } from "@/contexts/ApplicationContext";

export default function GenerateApplicationReportModal() {
  const { aplicacoes } = useApplication();
  const [produto, setProduto] = useState<string | null>(null);
  const [farm, setFarm] = useState<string | null>(null);
  const [talhao, setTalhao] = useState<string | null>(null);
  const { user } = useUser();

  const produtosUnicos = Array.from(
    new Set(aplicacoes.map((h) => h.productStock.product.name)),
  );

  const depositosUnicos = Array.from(
    new Set(aplicacoes.map((h) => h.productStock.farm.name)),
  );

  const talhoesUnicos = Array.from(
    new Set(aplicacoes.map((h) => h.talhao.name)),
  );

  const filtered = aplicacoes.filter((h) => {
    const matchProduto = !produto || h.productStock.product.name === produto;
    const matchFarm = !farm || h.productStock.farm.name === farm;
    const matchTalhao = !talhao || h.talhao.name === talhao;
    return matchProduto && matchFarm && matchTalhao;
  });

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Aplicações", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Produto: ${produto || "Todos"}`, 14, 35);
      doc.text(`Depósito: ${farm || "Todas"}`, 14, 40);
      doc.text(`Talhão: ${talhao || "Todos"}`, 14, 45);

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "Data",
            "Produto",
            "Talhão",
            "Área (Ha)",
            "Quantidade",
            "Dosagem",
          ],
        ],
        body: filtered.map((h) => {
          const area = h.talhao.area;
          const quantidade = h.quantity;
          const dosagem = quantidade / area;

          return [
            new Date(h.date).toLocaleDateString("pt-BR"),
            h.productStock.product.name,
            h.talhao.name,
            area.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
            quantidade.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + ` ${h.productStock.product.unit}`,
            dosagem.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + ` ${h.productStock.product.unit}/Ha`,
          ];
        }),
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

      // === SOMATÓRIO POR PRODUTO ===
      const totalsByProduto = filtered.reduce(
        (acc, curr) => {
          const name = curr.productStock.product.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.quantity;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filtered.reduce((acc, curr) => acc + curr.quantity, 0);

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.text("Total Aplicado por Produto", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByProduto).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${totalGeral.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}`,
        14,
        finalY + 6 + Object.keys(totalsByProduto).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Aplicação - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduto(null);
      setFarm(null);
    };
  };

  return (
    <Dialog>
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
              {produtosUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Depósito de Origem</label>
          <Select
            value={farm ?? ""}
            onValueChange={(value) => setFarm(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {depositosUnicos.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Talhão Aplicado</label>
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

        <Button onClick={generatePDF} className="bg-green text-white">
          Baixar PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}
