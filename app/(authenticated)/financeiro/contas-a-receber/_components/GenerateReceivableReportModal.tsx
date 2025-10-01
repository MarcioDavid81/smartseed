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
import { useReceivable } from "@/contexts/ReceivableContext";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

export default function GenerateReceivableReportModal() {
  const { receivables } = useReceivable();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);

  const customersUnicos = Array.from(
    new Set(receivables.map((r) => r.customer.name)),
  );

  // === FILTRO ===
  const filtered = receivables.filter((r) => {
    const matchCustomer = !customer || r.customer.name === customer;
    const due = new Date(r.dueDate);

    const matchDateRange =
      (!dateRange?.from && !dateRange?.to) ||
      (dateRange?.from &&
        dateRange?.to &&
        due >= dateRange.from &&
        due <= dateRange.to);

    const matchStatus = r.status !== "PAID";

    return matchCustomer && matchDateRange && matchStatus;
  });

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({ orientation: "landscape" });
    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Contas à Receber", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cliente: ${customer || "Todos"}`, 14, 35);

      const rangeText =
        dateRange?.from && dateRange?.to
          ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
          : "Todos";
      doc.text(`Vencimento: ${rangeText}`, 14, 40);

      autoTable(doc, {
        startY: 50,
        head: [["Vencimento", "Cliente", "Conta à Receber", "Valor (R$)"]],
        body: filtered.map((p) => [
          new Date(p.dueDate).toLocaleDateString("pt-BR"),
          p.customer.name,
          p.description,
          p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        ]),
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [1, 204, 101],
          textColor: 255,
          fontStyle: "bold",
        },
        didDrawPage: (data) => {
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

      // === SOMATÓRIO ===
      const totalsByCustomer = filtered.reduce(
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
      setDateRange(undefined);
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

        {/* === Intervalo de Vencimento === */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Vencimento</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
                  : "Selecione o período"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={generatePDF} className="bg-green text-white" disabled={loading}>
          {loading ? <FaSpinner className="animate-spin" /> : "Baixar PDF"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
