import HoverButton from "@/components/HoverButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { useAccountReceivables } from "@/queries/financial/use-account-receivable-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { endOfDay, startOfDay } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { AccountReceivable } from "@/types";

export default function GenerateReceivableReportModal() {
  const { data: receivables = [] } = useAccountReceivables();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);

  const customersUnicos = Array.from(
    new Set(receivables.map((r) => r.customer.name)),
  );

  // === FILTRO ===
  const filterReceivables = (list: AccountReceivable[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((r) => {
      const matchCustomer = !customer || r.customer.name === customer;

      const date = new Date(r.dueDate as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);

      return matchCustomer && matchDate;
    });
  };

  const generatePDF = async () => {
    setLoading(true);

    const filteredToUse = filterReceivables(receivables);

    const doc = new jsPDF({ orientation: "landscape" });
    const logo = new window.Image();
    logo.src = "/6.png";

    const periodLabel =
      dateFrom || dateTo
        ? `${dateFrom ? dateFrom.toLocaleDateString("pt-BR") : "—"} até ${dateTo ? dateTo.toLocaleDateString("pt-BR") : "—"}`
        : "Todos";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Contas à Receber", 150, 20, { align: "center" });
      const company = user.company.name;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(company, 150, 25, {
        align: "center",
      });

      doc.setFontSize(10);
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;

      // largura útil da página (tirando margens)
      const usableWidth = pageWidth - margin * 2;

      // divide em 3 colunas
      const columnWidth = usableWidth / 3;

      const startY = 35;
      const lineHeight = 5;

      const filters = [
        `Cliente: ${customer || "Todos"}`,
        `Período: ${periodLabel}`,
      ];

      filters.forEach((text, index) => {
        const column = index % 3; // 0,1,2
        const row = Math.floor(index / 3);

        const x = margin + column * columnWidth;
        const y = startY + row * lineHeight;

        doc.text(text, x, y, {
          maxWidth: columnWidth - 5, // evita estourar a coluna
        });
      });

      // Tabela
      const totalPagesExp = "{total_pages_count_string}";

      autoTable(doc, {
        startY: 40,
        head: [["Vencimento", "Cliente", "Conta à Receber", "Valor (R$)"]],
        showHead: "firstPage",
        body: filteredToUse.map((p) => [
          new Date(p.dueDate).toLocaleDateString("pt-BR"),
          p.customer.name,
          p.description,
          p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        ]),
        foot: [
          [
            "Total",
            "",
            "",
            filteredToUse
              .reduce((acc, curr) => acc + curr.amount, 0)
              .toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              }),
            filteredToUse
              .reduce((acc, curr) => acc + curr.amount, 0)
              .toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
          ],
        ],
        showFoot: "lastPage",
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [99, 185, 38],
          textColor: 255,
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [99, 185, 38],
          textColor: 255,
          fontStyle: "bold",
        },
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height;
          const pageWidth = pageSize.width;

          const now = new Date().toLocaleString("pt-BR");
          const userName = user?.name || "Usuário desconhecido";

          const currentPage = (doc as any).internal.getCurrentPageInfo()
            .pageNumber;

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

      // === SOMATÓRIO ===
      const totalsByCustomer = filteredToUse.reduce(
        (acc, curr) => {
          const name = curr.customer.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.text("Total à Receber por Cliente", 14, finalY);

      Object.entries(totalsByCustomer).forEach(([name, total], index) => {
        doc.text(
          `${name}: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          14,
          finalY + 6 + index * 6,
        );
      });

      doc.text(
        `Total Geral: R$ ${Object.values(totalsByCustomer)
          .reduce((acc, curr) => acc + curr, 0)
          .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        14,
        finalY + 6 + Object.keys(totalsByCustomer).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      doc.save(`Relatório de Contas à Receber - ${fileNumber}.pdf`);
      setCustomer(null);
      setDateFrom(undefined);
      setDateTo(undefined);
      setLoading(false);
      setOpen(false);
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <HoverButton className="flex gap-2">
          <FaFilePdf />
          Gerar Relatório
        </HoverButton>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <h2 className="text-xl font-semibold">Filtrar Relatório</h2>

        {/* === Cliente === */}
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
              {customersUnicos.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <DatePicker value={dateFrom} onChange={setDateFrom} />
            <DatePicker value={dateTo} onChange={setDateTo} />
          </div>
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
