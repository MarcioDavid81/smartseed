import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatNumber } from "@/app/_helpers/currency";
import { PurchaseOrderItemDetail } from "@/types/purchaseOrderItemDetail";
import { SaleContractItemDetail } from "@/types/saleContractItemDetail";
import { ProductType } from "@prisma/client";
import { drawFooter } from "./pdf-theme";

export function generatePurchaseDeliveriesReport(
  item: PurchaseOrderItemDetail,
) {
  const doc = new jsPDF();

  const deliveries = item.deliveries ?? [];

  const title = item.product?.name ?? item.cultivar?.name ?? "Relatório";

  const totalDelivered = deliveries.reduce(
    (acc, cur) => acc + Number(cur.quantity),
    0,
  );

  const totalValue = deliveries.reduce((acc, cur) => acc + cur.totalPrice, 0);

  const contractedQuantity = Number(item.quantity ?? 0);
  const unitPrice = Number(item.unityPrice ?? 0);
  const balance = contractedQuantity - totalDelivered;

  // 🧾 HEADER
  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");
  doc.text("Resumo", 14, 40);

  doc.setFont("helvetica", "normal");

  doc.text(`Qtd. contratada: ${formatNumber(contractedQuantity)}`, 14, 46);
  doc.text(`Valor unitário: ${formatCurrency(unitPrice)}`, 14, 52);

  doc.text(`Qtd. entregue: ${formatNumber(totalDelivered)}`, 100, 46);
  doc.text(`Saldo: ${formatNumber(balance)}`, 100, 52);

  // 📊 TABELA
  autoTable(doc, {
    startY: 60,
    head: [["Data", "Documento", "Quantidade", "Valor total"]],
    body: deliveries.map((d) => [
      new Date(d.date).toLocaleDateString("pt-BR"),
      d.invoice || "—",
      Number(d.quantity).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
      formatCurrency(d.totalPrice),
    ]),
    foot: [
      [
        "Total",
        "",
        totalDelivered.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        }),
        formatCurrency(totalValue),
      ],
    ],

    styles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },

    headStyles: {
      fillColor: [99, 185, 38], // 🔥 verde sistema
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245], // zebra
    },

    footStyles: {
      fillColor: [99, 185, 38],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  doc.save(`relatorio-remessas-${title}.pdf`);
}

export function generateSaleDeliveriesReport(item: SaleContractItemDetail) {
  const doc = new jsPDF();

  const deliveries = item.deliveries ?? [];

  const title =
    (item.product as ProductType) ?? item.cultivar?.name ?? "Relatório";

  const totalDelivered = deliveries.reduce(
    (acc, cur) => acc + Number(cur.quantity),
    0,
  );

  const totalValue = deliveries.reduce((acc, cur) => acc + cur.totalPrice, 0);

  const contractedQuantity = Number(item.quantity ?? 0);
  const unitPrice = Number(item.unityPrice ?? 0);
  const balance = contractedQuantity - totalDelivered;

  // 🧾 HEADER
  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");
  doc.text("Resumo", 14, 40);

  doc.setFont("helvetica", "normal");

  doc.text(`Qtd. contratada: ${formatNumber(contractedQuantity)}`, 14, 46);
  doc.text(`Valor unitário: ${formatCurrency(unitPrice)}`, 14, 52);

  doc.text(`Qtd. entregue: ${formatNumber(totalDelivered)}`, 100, 46);
  doc.text(`Saldo: ${formatNumber(balance)}`, 100, 52);

  // 📊 TABELA
  autoTable(doc, {
    startY: 60,
    head: [["Data", "Documento", "Quantidade", "Valor total"]],
    body: deliveries.map((d) => [
      new Date(d.date).toLocaleDateString("pt-BR"),
      d.invoice || "—",
      Number(d.quantity).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      }),
      formatCurrency(d.totalPrice),
    ]),
    foot: [
      [
        "Total",
        "",
        totalDelivered.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        }),
        formatCurrency(totalValue),
      ],
    ],

    styles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },

    headStyles: {
      fillColor: [99, 185, 38], // 🔥 verde sistema
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245], // zebra
    },

    footStyles: {
      fillColor: [99, 185, 38],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  drawFooter(doc);

  doc.save(`relatorio-remessas-${title}.pdf`);
}
