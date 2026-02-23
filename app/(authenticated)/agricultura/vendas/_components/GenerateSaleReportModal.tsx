"use client";
import { formatNumber } from "@/app/_helpers/currency";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
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
import { useIndustrySale } from "@/contexts/IndustrySaleContext";
import { useUser } from "@/contexts/UserContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

export default function GenerateSaleReportModal() {
  const { sales } = useIndustrySale();
  const [produto, setProduto] = useState<string | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const [transportador, setTransportador] = useState<string | null>(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Sanitizar listas: remover strings vazias
  const produtosUnicos = Array.from(
    new Set(sales.map((h) => h.product)),
  ).filter((p) => p && p.trim() !== "");

  const customersUnicos = Array.from(
    new Set(sales.map((h) => h.customer.name)),
  ).filter((c) => c && c.trim() !== "");

  const transportadoresAll = sales.map((h) => h.industryTransporter?.name ?? "");
  const transportadoresUnicos = Array.from(
    new Set(transportadoresAll.filter((n) => n && n.trim() !== "")),
  );

  const filtered = sales.filter((h) => {
    const matchProduto = !produto || h.product === produto;
    const matchTransportador =
      !transportador
        ? true
        : transportador === "none"
          ? !h.industryTransporter?.name || h.industryTransporter?.name.trim() === ""
          : h.industryTransporter?.name === transportador;
    const matchCustomer = !customer || h.customer.name === customer;
    return matchProduto && matchTransportador && matchCustomer;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "landscape" });

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
      doc.text("Relatório de Vendas", 150, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(12);
      doc.text(company, 150, 25, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Produto: ${produto || "Todos"}`, 14, 35);
      doc.text(`Cliente: ${customer || "Todos"}`, 14, 40);
      doc.text(`Transportador: ${transportador || "Todos"}`, 14, 45);



      autoTable(doc, {
        startY: 55,
        head: [["Data", "Produto", "Documento", "Cliente", "Peso Bruto (kg)", "Desconto (kg)", "Peso Líquido (kg)"]],
        body: filtered.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          getProductLabel(h.product),
          h.document || "N/A",
          h.customer?.name || "N/A",
          formatNumber(Number(h.weightSubLiq)),
          formatNumber(Number(h.discountsKg)),
          formatNumber(Number(h.weightLiq)),
        ]),
        foot: [["Total Geral", "", "", "", formatNumber(filtered.reduce((acc, curr) => acc + Number(curr.weightSubLiq), 0)), formatNumber(filtered.reduce((acc, curr) => acc + Number(curr.discountsKg), 0)), formatNumber(filtered.reduce((acc, curr) => acc + Number(curr.weightLiq), 0))]],
        showFoot: "lastPage",
        styles: {
          fontSize: 9,
        },
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

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Vendas - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduto(null);
      setTransportador(null);
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
                <SelectItem key={p} value={String(p)}>
                  {getProductLabel(String(p))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CLIENTE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cliente</label>
          <Select
            value={customer ?? "todos"}
            onValueChange={(value) => setCustomer(value === "todos" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {customersUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TRANSPORTADOR */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Transportador</label>
          <Select
            value={transportador ?? "todos"}
            onValueChange={(value) => setTransportador(value === "todos" ? null : value)}
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