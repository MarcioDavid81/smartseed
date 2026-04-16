import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatNumber } from "@/app/_helpers/currency";
import { PurchaseOrderItemDetail } from "@/types/purchaseOrderItemDetail";
import { SaleContractItemDetail } from "@/types/saleContractItemDetail";
import { ProductType } from "@prisma/client";
import { drawFooter, drawHeader } from "./pdf-theme";
import { PRODUCT_TYPE_LABELS } from "../(authenticated)/_constants/products";

type PurchaseDeliveriesReportMeta = {
  orderNumber?: string;
  orderDate?: Date | string;
  customerName?: string;
  memberName?: string;
  company?: string;
  logo?: HTMLImageElement;
  subtitle?: string;
  userName?: string;
  drawHeaderFn?: typeof drawHeader;
};

function formatContractDate(value?: Date | string) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function generatePurchaseDeliveriesReport(
  item: PurchaseOrderItemDetail,
  meta?: PurchaseDeliveriesReportMeta,
) {
  const doc = new jsPDF({
    orientation: "landscape",
  });

  const deliveries = item.deliveries ?? [];

  const productLabel = item.product?.name ?? item.cultivar?.name ?? "—";

  const headerTitle = "Relatório de Remessas";

  if (meta?.company && meta?.logo) {
    const header = meta.drawHeaderFn ?? drawHeader;
    header({
      doc,
      title: headerTitle,
      company: meta.company,
      logo: meta.logo,
    });
  }

  const totalDelivered = deliveries.reduce(
    (acc, cur) => acc + Number(cur.quantity),
    0,
  );

    const totalDeliveredValue = deliveries.reduce(
    (acc, cur) => acc + cur.totalPrice,
    0,
  );

  const contractedQuantity = Number(item.quantity ?? 0);
  const unitPrice = Number(item.unityPrice ?? 0);
  const contractedTotalValue = contractedQuantity * unitPrice;
  const balance = contractedQuantity - totalDelivered;

  const contentStartY = meta?.company && meta?.logo ? 40 : 20;
  const leftX = 14;
  const rightX = 150;
  const lineH = 6;

  let y = contentStartY;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Dados Principais", leftX, y);

  y += lineH;
  doc.setFont("helvetica", "normal");

  doc.text(`Data do pedido: ${formatContractDate(meta?.orderDate)}`, leftX, y);
  doc.text(`Pedido: ${meta?.orderNumber ?? "—"}`, rightX, y);

  y += lineH + 4;

  doc.setFont("helvetica", "bold");
  doc.text("Participantes", leftX, y);

  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${meta?.customerName ?? "—"}`, leftX, y);
  doc.text(`Sócio: ${meta?.memberName ?? "—"}`, rightX, y);

  y += lineH + 4;

  doc.setFont("helvetica", "bold");
  doc.text("Resumo", leftX, y);

  y += lineH;
  doc.setFont("helvetica", "normal");

  doc.text(`Produto: ${productLabel}`, leftX, y);
  doc.text(`Qtd. contratada: ${formatNumber(contractedQuantity)}`, rightX, y);

  y += lineH;
  doc.text(`Valor unitário: ${formatCurrency(unitPrice)}`, leftX, y);
  doc.text(`Valor total: ${formatCurrency(contractedTotalValue)}`, rightX, y);

  y += lineH;
  doc.text(`Total entregue: ${formatNumber(totalDelivered)}`, leftX, y);
  doc.text(`Saldo: ${formatNumber(balance)}`, rightX, y);

  y += lineH + 8;

  autoTable(doc, {
    startY: y,
    head: [["Data", "Documento", "Quantidade", "Valor total"]],
    showHead: "firstPage",
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
        formatCurrency(contractedTotalValue),
      ],
    ],
    showFoot: "lastPage",

    styles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },

    headStyles: {
      fillColor: [99, 185, 38],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    footStyles: {
      fillColor: [99, 185, 38],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  drawFooter(doc, meta?.userName);

  const fileNameParts = [
    meta?.orderNumber ? `Pedido de Compra - ${meta.orderNumber}` : undefined,
  ].filter(Boolean);

  doc.save(`${fileNameParts.join("-")}.pdf`);
}

type SaleDeliveriesReportMeta = {
  contractNumber?: string;
  contractDate?: Date | string;
  customerName?: string;
  memberName?: string;
  company?: string;
  logo?: HTMLImageElement;
  subtitle?: string;
  userName?: string;
  drawHeaderFn?: typeof drawHeader;
};

export function generateSaleDeliveriesReport(
  item: SaleContractItemDetail,
  meta?: SaleDeliveriesReportMeta,
) {
  const doc = new jsPDF({ orientation: "landscape" });

  const deliveries = item.deliveries ?? [];

  const productLabel =
    (PRODUCT_TYPE_LABELS[item.product as ProductType]) ?? item.cultivar?.name ?? "—";

  const headerTitle = "Relatório de Remessas";

  if (meta?.company && meta?.logo) {
    const header = meta.drawHeaderFn ?? drawHeader;
    header({
      doc,
      title: headerTitle,
      company: meta.company,
      logo: meta.logo,
    });
  }

  const totalDelivered = deliveries.reduce(
    (acc, cur) => acc + Number(cur.quantity),
    0,
  );

  const totalDeliveredValue = deliveries.reduce(
    (acc, cur) => acc + cur.totalPrice,
    0,
  );

  const contractedQuantity = Number(item.quantity ?? 0);
  const unitPrice = Number(item.unityPrice ?? 0);
  const contractedTotalValue = contractedQuantity * unitPrice;
  const balance = contractedQuantity - totalDelivered;

  const contentStartY = meta?.company && meta?.logo ? 40 : 20;
  const leftX = 14;
  const rightX = 150;
  const lineH = 6;

  let y = contentStartY;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Dados Principais", leftX, y);

  y += lineH;
  doc.setFont("helvetica", "normal");

  doc.text(`Data do contrato: ${formatContractDate(meta?.contractDate)}`, leftX, y);
  doc.text(`Contrato: ${meta?.contractNumber ?? "—"}`, rightX, y);

  y += lineH + 4;

  doc.setFont("helvetica", "bold");
  doc.text("Participantes", leftX, y);

  y += lineH;
  doc.setFont("helvetica", "normal");
  doc.text(`Cliente: ${meta?.customerName ?? "—"}`, leftX, y);
  doc.text(`Sócio: ${meta?.memberName ?? "—"}`, rightX, y);

  y += lineH + 4;

  doc.setFont("helvetica", "bold");
  doc.text("Resumo", leftX, y);

  y += lineH;
  doc.setFont("helvetica", "normal");

  doc.text(`Produto: ${productLabel}`, leftX, y);
  doc.text(`Qtd. contratada: ${formatNumber(contractedQuantity)}`, rightX, y);

  y += lineH;
  doc.text(`Valor unitário: ${formatCurrency(unitPrice)}`, leftX, y);
  doc.text(`Valor total: ${formatCurrency(contractedTotalValue)}`, rightX, y);

  y += lineH;
  doc.text(`Total entregue: ${formatNumber(totalDelivered)}`, leftX, y);
  doc.text(`Saldo: ${formatNumber(balance)}`, rightX, y);

  y += lineH + 8;

  autoTable(doc, {
    startY: y,
    head: [["Data", "Documento", "Quantidade", "Valor total"]],
    showHead: "firstPage",
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
        formatCurrency(totalDeliveredValue),
      ],
    ],
    showFoot: "lastPage",

    styles: {
      fontSize: 9,
      textColor: [40, 40, 40],
    },

    headStyles: {
      fillColor: [99, 185, 38],
      textColor: 255,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    footStyles: {
      fillColor: [99, 185, 38],
      textColor: 255,
      fontStyle: "bold",
    },
  });

  drawFooter(doc, meta?.userName);

  const fileNameParts = [
    meta?.contractNumber ? `Contrato de Venda - ${meta.contractNumber}` : undefined,
  ].filter(Boolean);

  doc.save(`${fileNameParts.join("-")}.pdf`);
}
