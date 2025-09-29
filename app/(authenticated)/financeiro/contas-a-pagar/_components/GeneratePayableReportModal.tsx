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
import { usePayable } from "@/contexts/PayableContext";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";


export default function GeneratePayableReportModal() {
  const { payables } = usePayable();
  const [customer, setCustomer] = useState<string | null>(null);
  const [payable, setPayable] = useState<string | null>(null);
  const { user } = useUser();

  const customersUnicos = Array.from(
    new Set(payables.map((p) => p.customer.name))
  );
  const payablesUnicos = Array.from(new Set(payables.map((p) => p.description)));

  const filtered = payables.filter((p) => {
    const matchCustomer = !customer || p.customer.name === customer;
    const matchPayable = !payable || p.description === payable;
    return matchCustomer && matchPayable;
  });

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const logo = new window.Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 14, 10, 30, 15);
      doc.setFontSize(16);
      doc.text("Relatório de Contas a Pagar", 150, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Cliente: ${customer || "Todos"}`, 14, 35);
      doc.text(`Conta a Pagar: ${payable || "Todos"}`, 14, 40);

      autoTable(doc, {
        startY: 50,
        head: [["Vencimento", "Cliente", "Conta a Pagar", "Valor (R$)"]],
        body: filtered.map((p) => [
          new Date(p.dueDate).toLocaleDateString("pt-BR"),
          p.customer.name,
          p.description,
          p.amount.toLocaleString("pt-BR", {
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
            pageHeight - 10
          );

          const centerText = "Sistema Smart Seed";
          const centerTextWidth = doc.getTextWidth(centerText);
          doc.text(
            centerText,
            pageWidth / 2 - centerTextWidth / 2,
            pageHeight - 10
          );

          const pageNumber = (doc as any).internal.getNumberOfPages();
          doc.text(
            `${pageNumber}/${pageNumber}`,
            pageWidth - 20,
            pageHeight - 10
          );
        },
      });

      // === SOMATÓRIO POR CLIENTE ===
      const totalsByCustomer = filtered.reduce((acc, curr) => {
        const name = curr.customer.name;
        if (!acc[name]) acc[name] = 0;
        acc[name] += curr.amount;
        return acc;
      }, {} as Record<string, number>);

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.text("Total à Pagar por Cliente", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByCustomer).forEach(([name, total], index) => {
        doc.text(
          `${name}: ${total.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })} R$`,
          14,
          finalY + 6 + index * 6
        );
      });

      doc.setFontSize(9);
      doc.text(
        `Total Geral: ${Object.values(totalsByCustomer).reduce(
          (acc, curr) => acc + curr,
          0
        ).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })} R$`,
        14,
        finalY + 6 + Object.keys(totalsByCustomer).length * 6 + 6
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Contas a Pagar - ${fileNumber}.pdf`;
      doc.save(fileName);
      setCustomer(null);
      setPayable(null);
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
              {payables.map((p) => (
                <SelectItem key={p.customer.name} value={p.customer.name}>
                  {p.customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conta a Pagar</label>
          <Select
            value={payable ?? ""}
            onValueChange={(value) =>
              setPayable(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {payables.map((p) => (
                <SelectItem key={p.description} value={p.description}>
                  {p.description}
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
