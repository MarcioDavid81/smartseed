import { formatNumber } from "@/app/_helpers/currency";
import { IndustryHarvest } from "@/types";
import jsPDF from "jspdf";

export function generateHarvestRomaneio(data: IndustryHarvest) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;

  const sep = (y: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, marginX + contentWidth, y);
  };

  const field = (label: string, value: string, x: number, y: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${label}: ${value}`, x, y);
  };

  const sectionTitle = (text: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(text, marginX, y);
  };

  const renderVia = (startY: number) => {
    let y = startY;
    const rightX = marginX + contentWidth / 2;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ROMANEIO DE COLHEITA", pageWidth / 2, y, { align: "center" });

    y += 7;

    doc.setFontSize(10);
    doc.text(data.company?.name ?? "", pageWidth / 2, y, { align: "center" });

    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Documento: ${data.document ?? "-"}`, marginX, y);
    doc.text(
      `Data: ${new Date(data.date).toLocaleDateString("pt-BR")}`,
      pageWidth - marginX,
      y,
      { align: "right" },
    );

    y += 4;
    sep(y);
    y += 6;

    sectionTitle("DADOS DO PRODUTOR", y);
    y += 5;
    field("Fazenda", data.talhao.farm.name, marginX, y);
    field("Produto", String(data.product), rightX, y);
    y += 5;
    field("Talhão", data.talhao.name, marginX, y);

    y += 4;
    sep(y);
    y += 6;

    sectionTitle("DADOS LOGÍSTICOS", y);
    y += 5;
    field("Depósito", data.industryDeposit.name, marginX, y);
    field("Placa", data.truckPlate ?? "-", rightX, y);
    y += 5;
    field("Transportador", data.industryTransporter?.name ?? "-", marginX, y);
    field("Motorista", data.truckDriver ?? "-", rightX, y);

    y += 4;
    sep(y);
    y += 6;

    sectionTitle("CLASSIFICAÇÃO / PESOS", y);
    y += 5;

    field("Peso Bruto (kg)", formatNumber(data.weightBt), marginX, y);
    field("Impurezas (%)", formatNumber(data.impurities_discount), rightX, y);

    y += 5;

    field("Tara (kg)", formatNumber(data.weightTr), marginX, y);
    field("Desc. Impurezas (kg)", formatNumber(data.impurities_kg), rightX, y);
    y += 5;

    field("Peso Sub Líquido (kg)", formatNumber(data.weightSubLiq), marginX, y);
    field("Umidade (%)", formatNumber(data.humidity_percent), rightX, y);
    y += 5;

    field("Taxas (kg)", formatNumber(data.tax_kg ?? 0), marginX, y);
    field("Desc. Umidade (kg)", formatNumber(data.humidity_kg), rightX, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`PESO LÍQUIDO (kg): ${formatNumber(data.weightLiq)}`, rightX, y);

    y += 20;

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, marginX + 80, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Assinatura", marginX + 40, y + 4, { align: "center" });

    return y + 10;
  };

  const startTop = 14;
  const dividerY = pageHeight / 2;
  renderVia(startTop);
  doc.setDrawColor(140);
  doc.setLineWidth(0.2);
  doc.line(marginX, dividerY, marginX + contentWidth, dividerY);
  doc.setDrawColor(0);
  renderVia(dividerY + 6);






  /* =========================
     RODAPÉ
  ========================= */

  const now = new Date();
  const formattedDate = now.toLocaleString("pt-BR");

  const getTotalPages = () => {
    const internal = (doc as any).internal;
    if (internal?.getNumberOfPages) return internal.getNumberOfPages() as number;
    if ((doc as any).getNumberOfPages) return (doc as any).getNumberOfPages() as number;
    return 1;
  };

  const totalPages = getTotalPages();

  for (let page = 1; page <= totalPages; page++) {
    (doc as any).setPage?.(page);

    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.text(
      `Romaneio gerado em ${formattedDate}`,
      marginX,
      footerY,
    );

    const centerText = "Sistema Smart Seed";
    const centerTextWidth = doc.getTextWidth(centerText);
    doc.text(centerText, pageWidth / 2 - centerTextWidth / 2, footerY);

    doc.text(`${page}/${totalPages}`, pageWidth - marginX, footerY, {
      align: "right",
    });
  }

  /* =========================
     FINALIZA
  ========================= */

  doc.save(`romaneio-colheita-${data.document ?? data.id}.pdf`);
}
