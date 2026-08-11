"use client";
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
import { endOfDay, startOfDay } from "date-fns";
import { useUser } from "@/contexts/UserContext";
import { useInputPurchaseQuery } from "@/queries/input/use-input-purchase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { Purchase } from "@/types";
import { DatePicker } from "@/components/ui/date-picker";

export default function GeneratePurchaseReportModal() {
  const { data: purchases = [] } = useInputPurchaseQuery();
  const [product, setProduct] = useState<string | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const produtosFiltrados = useMemo(() => {
    let base = purchases;

    if (product) {
      base = base.filter((h) => h.product.name === product);
    }

    return Array.from(new Set(base.map((h) => h.product.name)));
  }, [purchases, product]);

  const customersUnicos = Array.from(
    new Set(purchases.map((h) => h.customer.name)),
  );

  useEffect(() => {
    setCustomer(null);
  }, [product]);

  const filterPurchases = (list: Purchase[]) => {
    const from = dateFrom ? startOfDay(dateFrom) : null;
    const to = dateTo ? endOfDay(dateTo) : null;

    return list.filter((h) => {
      const matchProduto = !product || h.product.name === product;
      const matchCustomer = !customer || h.customer.name === customer;

      const date = new Date(h.date as unknown as string);
      const matchDate = (!from || date >= from) && (!to || date <= to);

      return matchProduto && matchCustomer && matchDate;
    });
  };

  const generatePDF = async () => {
    setLoading(true);

    const filteredToUse = filterPurchases(purchases);

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
      doc.text("Relatório de Compras", 150, 20, { align: "center" });
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
        `Produto: ${product || "Todos"}`,
        `Fornecedor: ${customer || "Todos"}`,
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
        head: [
          [
            "Data",
            "Produto",
            "Fornecedor",
            "Nota Fiscal",
            "Quantidade",
            "Valor (R$)",
          ],
        ],
        showHead: "firstPage",
        body: filteredToUse.map((h) => [
          new Date(h.date).toLocaleDateString("pt-BR"),
          h.product.name,
          h.customer.name,
          h.invoiceNumber,
          h.quantity.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          }),
          h.totalPrice.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
        ]),
        foot: [
          [
            "Total",
            "",
            "",
            "",
            filteredToUse
              .reduce((acc, curr) => acc + curr.quantity, 0)
              .toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              }),
            filteredToUse
              .reduce((acc, curr) => acc + curr.totalPrice, 0)
              .toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
          ],
        ],
        showFoot: "lastPage",
        styles: {
          fontSize: 9,
        },
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
        didDrawPage: function () {
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

      // === SOMATÓRIO POR PRODUTO ===
      const totalsByProduct = filteredToUse.reduce(
        (acc, curr) => {
          const name = curr.product.name;
          if (!acc[name]) acc[name] = 0;
          acc[name] += curr.quantity;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalGeral = filteredToUse.reduce(
        (acc, curr) => acc + curr.quantity,
        0,
      );

      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(9);
      doc.text("Total comprado por Produto", 14, finalY);

      doc.setFontSize(9);
      Object.entries(totalsByProduct).forEach(([name, total], index) => {
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
        finalY + 6 + Object.keys(totalsByProduct).length * 6 + 6,
      );

      const fileNumber = new Date().getTime().toString();
      const fileName = `Relatorio de Compras - ${fileNumber}.pdf`;
      doc.save(fileName);
      setProduct(null);
      setCustomer(null);
      setDateFrom(undefined);
      setDateTo(undefined);
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
            value={product ?? ""}
            onValueChange={(value) =>
              setProduct(value === "todos" ? null : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {produtosFiltrados.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fornecedor</label>
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
