"use client";
import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSale } from "@/contexts/SaleContext";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateSaleReportModal() {
  const { sales } = useSale();
  const [cultivar, setCultivar] = useState<string | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cultivaresUnicos = Array.from(
    new Set(sales.map((h) => h.cultivar.name)),
  );
  const customersUnicos = Array.from(
    new Set(sales.map((h) => h.customer.name)),
  );

  const filtered = sales.filter((h) => {
    const matchCultivar = !cultivar || h.cultivar.name === cultivar;
    const matchCustomer = !customer || h.customer.name === customer;
    return matchCultivar && matchCustomer;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/6.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Vendas", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cultivar: ${cultivar || "Todos"}`, 14, 35);
      doc.text(`Fornecedor: ${customer || "Todos"}`, 14, 40);

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "Data",
            "Cultivar",
            "Cliente",
            "Nota Fiscal",
            "Quantidade (kg)",
            "Valor (R$)",
          ],
        ],
        body: filtered.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.cultivar?.name ?? "—",
          h.customer?.name ?? "—",
          h.invoiceNumber ?? "—",
          h.quantityKg?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }) ?? "0,00",
          h.saleValue?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }) ?? "R$ 0,00",
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

      doc.setFontSize(9);
      doc.text("Total vendido por Cultivar", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByCultivar).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} kg`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${totalGeral.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })} kg`,
        14,
        finalY + 6 + Object.keys(totalsByCultivar).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Vendas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setCultivar(null);
      setCustomer(null);
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
          <label className="text-sm font-medium">Cliente</label>
          <Select
            value={customer ?? ""}
            onValueChange={(value) =>
              setCustomer(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {customersUnicos.map((t) => (
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
