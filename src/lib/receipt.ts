import { jsPDF } from "jspdf";

export interface ReceiptData {
  receiptNumber: string;
  paidOn: string;          // ISO date or any parseable date
  amount: number;
  method?: string | null;
  notes?: string | null;
  tenantName?: string | null;
  tenantEmail?: string | null;
  tenantPhone?: string | null;
  roomLabel?: string | null;
  propertyAddress?: string | null;
}

const BRAND = "Zorba Rentals";
const BRAND_CONTACT = "zorbagraphic@gmail.com";

export function buildReceiptPdf(d: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(BRAND, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(BRAND_CONTACT, margin, y + 16);
  doc.setTextColor(0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PAYMENT RECEIPT", W - margin, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Receipt #: ${d.receiptNumber}`, W - margin, y + 16, { align: "right" });
  doc.text(`Date: ${new Date(d.paidOn).toLocaleDateString()}`, W - margin, y + 30, { align: "right" });

  y += 60;
  doc.setDrawColor(220);
  doc.line(margin, y, W - margin, y);
  y += 24;

  // Received from
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("RECEIVED FROM", margin, y);
  doc.setFont("helvetica", "normal");
  y += 16;
  if (d.tenantName) { doc.text(d.tenantName, margin, y); y += 14; }
  if (d.tenantEmail) { doc.text(d.tenantEmail, margin, y); y += 14; }
  if (d.tenantPhone) { doc.text(d.tenantPhone, margin, y); y += 14; }

  y += 14;
  if (d.propertyAddress || d.roomLabel) {
    doc.setFont("helvetica", "bold");
    doc.text("PROPERTY", margin, y);
    doc.setFont("helvetica", "normal");
    y += 16;
    if (d.propertyAddress) { doc.text(d.propertyAddress, margin, y); y += 14; }
    if (d.roomLabel) { doc.text(d.roomLabel, margin, y); y += 14; }
  }

  y += 20;

  // Amount box
  const boxX = margin;
  const boxY = y;
  const boxW = W - margin * 2;
  const boxH = 90;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(boxX, boxY, boxW, boxH, 8, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text("AMOUNT PAID", boxX + 20, boxY + 26);

  doc.setFontSize(28);
  doc.setTextColor(0);
  doc.text(`$${d.amount.toFixed(2)} CAD`, boxX + 20, boxY + 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text("METHOD", boxX + boxW - 20, boxY + 26, { align: "right" });
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(d.method || "—", boxX + boxW - 20, boxY + 50, { align: "right" });

  y = boxY + boxH + 28;

  if (d.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("NOTES", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y += 16;
    const lines = doc.splitTextToSize(d.notes, W - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14;
  }

  // Footer
  const footY = doc.internal.pageSize.getHeight() - margin;
  doc.setDrawColor(220);
  doc.line(margin, footY - 30, W - margin, footY - 30);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    "Thank you for your payment. · Merci pour votre paiement.",
    W / 2,
    footY - 14,
    { align: "center" }
  );
  doc.text(
    `${BRAND} · ${BRAND_CONTACT}`,
    W / 2,
    footY,
    { align: "center" }
  );

  return doc;
}

export function downloadReceiptPdf(d: ReceiptData) {
  const doc = buildReceiptPdf(d);
  const safeName = (d.tenantName || "tenant").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const dateStr = new Date(d.paidOn).toISOString().slice(0, 10);
  doc.save(`receipt-${safeName}-${dateStr}.pdf`);
}
