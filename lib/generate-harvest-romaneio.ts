import { formatNumber } from "@/app/_helpers/currency";
import { IndustryHarvest } from "@/types";
import jsPDF from "jspdf";

export function generateHarvestRomaneio(data: IndustryHarvest) {
  const doc = new jsPDF();

  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const gap = 6;

  /* =========================
     HELPERS
  ========================= */

  function drawCard(height: number) {
    doc.roundedRect(marginX, y, contentWidth, height, 3, 3);
  }

  function title(text: string, offsetY = 6) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(text, marginX + 4, y + offsetY);
  }

  function text(label: string, value: string, x: number, offsetY: number) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${label}: ${value}`, x, y + offsetY);
  }

  /* =========================
     CABEÇALHO
  ========================= */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(data.company?.name ?? "", pageWidth / 2, y, {
    align: "center",
  });

  y += 7;

  doc.setFontSize(11);
  doc.text("ROMANEIO DE COLHEITA", pageWidth / 2, y, {
    align: "center",
  });

  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Documento: ${data.document ?? "-"}`, marginX, y);
  doc.text(
    `Data: ${new Date(data.date).toLocaleDateString("pt-BR")}`,
    pageWidth - marginX,
    y,
    { align: "right" },
  );

  y += 8;

  /* =========================
     DADOS DO PRODUTOR
  ========================= */

  drawCard(26);
  title("DADOS DO PRODUTOR");

  text(
    "Fazenda",
    data.talhao.farm.name,
    marginX + 4,
    14,
  );
  text(
    "Talhão",
    data.talhao.name,
    marginX + 4,
    20,
  );

  text(
    "Produto",
    data.product,
    marginX + contentWidth / 2,
    14,
  );

  y += 26 + gap;

  /* =========================
     DADOS LOGÍSTICOS
  ========================= */

  drawCard(26);
  title("DADOS LOGÍSTICOS");

  text(
    "Depósito",
    data.industryDeposit.name,
    marginX + 4,
    14,
  );
  text(
    "Transportador",
    data.industryTransporter.name,
    marginX + 4,
    20,
  );

  text(
    "Placa",
    data.truckPlate ?? "-",
    marginX + contentWidth / 2,
    14,
  );
  text(
    "Motorista",
    data.truckDriver ?? "-",
    marginX + contentWidth / 2,
    20,
  );

  y += 26 + gap;

  /* =========================
     CLASSIFICAÇÃO / PESOS
  ========================= */

  drawCard(42);
  title("CLASSIFICAÇÃO / PESOS");

  // Coluna esquerda
  text("Peso Bruto (kg)", formatNumber(data.weightBt), marginX + 4, 14);
  text("Tara (kg)", formatNumber(data.weightTr), marginX + 4, 20);
  text(
    "Peso Sub Líquido (kg)",
    formatNumber(data.weightSubLiq),
    marginX + 4,
    26,
  );
  text("Taxas (kg)", formatNumber(data.tax_kg ?? 0), marginX + 4, 32);
  text(
    "Ajustes (kg)",
    formatNumber(data.adjust_kg ?? 0),
    marginX + 4,
    38,
  );

  // Coluna direita
  const rightX = marginX + contentWidth / 2;

    text(
    "Impurezas (%)",
    formatNumber(data.impurities_discount),
    rightX,
    26,
  );
  text(
    "Desc. Impurezas (kg)",
    formatNumber(data.impurities_kg),
    rightX,
    32,
  );
  text(
    "Umidade (%)",
    formatNumber(data.humidity_percent),
    rightX,
    14,
  );
  text(
    "Desc. Umidade (kg)",
    formatNumber(data.humidity_kg),
    rightX,
    20,
  );

  doc.setFont("helvetica", "bold");
  doc.text(
    `PESO LÍQUIDO (kg): ${formatNumber(data.weightLiq)}`,
    rightX,
    y + 38,
  );

  /* =========================
     ASSINATURA
  ========================= */

  y += 42 + 10;

  doc.line(marginX, y, marginX + 80, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura", marginX + 40, y + 5, {
    align: "center",
  });

  /* =========================
     FINALIZA
  ========================= */

  doc.save(`romaneio-colheita-${data.document ?? data.id}.pdf`);
}
