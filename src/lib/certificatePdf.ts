// Generates the FAIIR certificate as a real, downloadable PDF — laid out in
// code rather than printed from the browser. This avoids the Safari/Chrome
// print pipeline entirely (no portrait-vs-landscape fight, no "print
// backgrounds" setting stripping the design) and gives the firm an actual
// file they can save, email, and attach to proposals.
//
// jsPDF is imported dynamically inside the handler so it never lands in the
// initial/SSR bundle — it only loads the moment a certified client clicks
// download.

export interface CertificateData {
  firm_name: string;
  certificate_number: string;
  tier: string;
  issued_at: string;
  expires_at: string;
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("seal image failed to load"));
    img.src = src;
  });
}

export async function downloadCertificatePdf(
  cert: CertificateData,
  sealSrc = "/images/faiir-logo.png"
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth(); // ~792
  const H = doc.internal.pageSize.getHeight(); // ~612
  const cx = W / 2;

  // Paper + border (drawn, so it never depends on "print backgrounds")
  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, W, H, "F");
  doc.setDrawColor(193, 120, 50);
  doc.setLineWidth(1.5);
  doc.roundedRect(36, 36, W - 72, H - 72, 8, 8, "S");

  // Seal
  try {
    const img = await loadImage(sealSrc);
    const sealW = 100;
    doc.addImage(img, "PNG", cx - sealW / 2, 64, sealW, sealW);
  } catch {
    // If the seal can't load, continue without it rather than failing the file.
  }

  // Kicker
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(193, 120, 50);
  doc.text("FOUNDATION OF AI INTEGRITY & REGULATION", cx, 192, {
    align: "center",
    charSpace: 2.2,
  });

  // Title
  doc.setFontSize(26);
  doc.setTextColor(31, 24, 16);
  doc.text("Certificate of Completion", cx, 226, { align: "center" });

  // "This certifies that"
  doc.setFontSize(12);
  doc.setTextColor(74, 64, 54);
  doc.text("This certifies that", cx, 256, { align: "center" });

  // Firm name
  doc.setFont("times", "bold");
  doc.setFontSize(23);
  doc.setTextColor(31, 24, 16);
  doc.text(cert.firm_name, cx, 288, { align: "center" });

  // Body
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.setTextColor(74, 64, 54);
  const body = `has completed the ${cert.tier}, an independent review of the firm's artificial-intelligence governance, data handling, and use practices, conducted by Available Law.`;
  const lines = doc.splitTextToSize(body, 560);
  doc.text(lines, cx, 320, { align: "center", lineHeightFactor: 1.5 });

  // Footer — signature (left) and provenance (right)
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 24, 16);
  doc.text("Zachariah Crabill, JD", 72, 548);
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 91, 78);
  doc.text("Attorney & Founder, Available Law · Colorado Bar #56783", 72, 562);

  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(31, 24, 16);
  doc.text(cert.certificate_number, W - 72, 548, { align: "right" });
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 91, 78);
  doc.text(
    `Issued ${longDate(cert.issued_at)} · Valid through ${longDate(cert.expires_at)}`,
    W - 72,
    562,
    { align: "right" }
  );

  doc.save(`FAIIR-Certificate-${cert.certificate_number}.pdf`);
}
