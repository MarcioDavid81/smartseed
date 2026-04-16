import jsPDF from "jspdf";

export const PDF_THEME = {
  primary: [99, 185, 38] as [number, number, number],
  secondary: [240, 240, 240] as [number, number, number],
  text: [40, 40, 40] as [number, number, number],
};

type HeaderProps = {
  doc: jsPDF;
  title: string;
  subtitle?: string;
  company: string;
  logo: HTMLImageElement;
};

export function drawHeader({
  doc,
  title,
  subtitle,
  company,
  logo,
}: HeaderProps) {
  doc.addImage(logo, "PNG", 14, 10, 30, 15);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 150, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(company, 150, 24, { align: "center" });

  if (subtitle) {
    doc.text(subtitle, 150, 29, { align: "center" });
  }
}

export function drawFooter(doc: jsPDF, userName?: string) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height;
    const pageWidth = pageSize.width;

    const now = new Date().toLocaleString("pt-BR");

    doc.setFontSize(8);

    doc.text(
      `Gerado em ${now} por: ${userName ?? "Sistema"}`,
      10,
      pageHeight - 10,
    );

    const center = "Sistema Smart Seed";
    doc.text(center, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    doc.text(`${i}/${pageCount}`, pageWidth - 20, pageHeight - 10);
  }
}