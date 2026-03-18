import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BLUE = [37, 99, 235];
const BLUE_LIGHT = [239, 246, 255];
const GRAY_LIGHT = [248, 249, 251];
const TEXT_DARK = [30, 41, 59];
const TEXT_MID = [100, 116, 139];
const WHITE = [255, 255, 255];
const BORDER = [226, 232, 240];

const METHOD_LABELS = {
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  pix: "PIX",
  prazo: "A Prazo",
};

const PERIOD_MAP = { week: "Semanal", month: "Mensal", year: "Anual" };

const fmt = (n) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function addHeader(doc, companyName, periodLabel) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, w, 30, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text("PULSE GESTÃO", 14, 13);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(companyName || "", 14, 21);

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  doc.setFontSize(9);
  doc.text(`${periodLabel} · ${dateStr} às ${timeStr}`, w - 14, 21, { align: "right" });

  return 40;
}

function addFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.line(14, h - 14, w - 14, h - 14);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MID);
    doc.setFont("helvetica", "normal");
    doc.text("Pulse Gestão", 14, h - 8);
    doc.text(`Página ${i} de ${pages}`, w - 14, h - 8, { align: "right" });
  }
}

function addSectionTitle(doc, title, y, subtitle) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  doc.text(title, 14, y);
  doc.setDrawColor(...BORDER);
  doc.line(14, y + 2, w - 14, y + 2);
  let nextY = y + 8;
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MID);
    doc.text(subtitle, 14, nextY);
    nextY += 5;
  }
  return nextY;
}

const TABLE_STYLES = {
  theme: "grid",
  styles: {
    fontSize: 9,
    cellPadding: 3,
    lineColor: BORDER,
    lineWidth: 0.25,
    textColor: TEXT_DARK,
    font: "helvetica",
  },
  headStyles: {
    fillColor: BLUE_LIGHT,
    textColor: TEXT_DARK,
    fontStyle: "bold",
    fontSize: 9,
  },
  footStyles: {
    fillColor: [248, 250, 252],
    textColor: TEXT_DARK,
    fontStyle: "bold",
    fontSize: 9,
  },
  alternateRowStyles: { fillColor: GRAY_LIGHT },
  margin: { left: 14, right: 14 },
};

export const buildSection = {
  products(data) {
    return {
      title: "Desempenho de Produtos",
      head: [["#", "Produto", "Qtd.", "Receita", "Custo", "Margem"]],
      body: (data || []).map((p, i) => [
        i + 1,
        p.product_name,
        `${p.quantity} un.`,
        fmt(p.revenue),
        fmt(p.cost),
        `${p.margin_pct.toFixed(1)}%`,
      ]),
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        2: { halign: "right", cellWidth: 20 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "right", cellWidth: 30 },
        5: { halign: "right", cellWidth: 22 },
      },
    };
  },

  categories(data) {
    return {
      title: "Receita por Categoria",
      head: [["Categoria", "Receita"]],
      body: (data || []).map((c) => [c.category_id || "Sem categoria", fmt(c.revenue)]),
      columnStyles: { 1: { halign: "right", cellWidth: 40 } },
    };
  },

  payments(data) {
    const total = (data || []).reduce((s, d) => s + d.revenue, 0);
    return {
      title: "Métodos de Pagamento",
      head: [["Método", "Transações", "Receita", "%"]],
      body: (data || []).map((d) => [
        METHOD_LABELS[d.method] || d.method,
        d.count,
        fmt(d.revenue),
        `${d.pct.toFixed(1)}%`,
      ]),
      foot: total > 0 ? [["Total", "", fmt(total), "100%"]] : undefined,
      columnStyles: {
        1: { halign: "center", cellWidth: 25 },
        2: { halign: "right", cellWidth: 32 },
        3: { halign: "right", cellWidth: 20 },
      },
    };
  },

  deadStock(data) {
    return {
      title: "Estoque Parado",
      subtitle: "Produtos sem vendas nos últimos 30 dias",
      head: [["Produto", "Estoque", "Estoque Mín."]],
      body: (data || []).map((p) => [p.product_name, `${p.stock} un.`, `${p.min_quantity} un.`]),
      columnStyles: {
        1: { halign: "right", cellWidth: 28 },
        2: { halign: "right", cellWidth: 28 },
      },
    };
  },

  prazo(data) {
    const sales = data?.sales || [];
    const total = data?.total_pending || 0;
    return {
      title: "Vendas a Prazo",
      subtitle: "Recebíveis pendentes",
      head: [["Cliente", "Data", "Valor"]],
      body: sales.map((s) => [
        s.customer_name || "Sem cliente",
        new Date(s.created_at).toLocaleDateString("pt-BR"),
        fmt(s.total_amount),
      ]),
      foot: total > 0 ? [["Total pendente", "", fmt(total)]] : undefined,
      columnStyles: {
        1: { halign: "center", cellWidth: 28 },
        2: { halign: "right", cellWidth: 32 },
      },
    };
  },
};

export function generateReport(companyName, periodKey, sections, fileName) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const label = PERIOD_MAP[periodKey] || periodKey || "";
  let y = addHeader(doc, companyName, `Relatório ${label}`);
  const pageH = doc.internal.pageSize.getHeight();

  sections.forEach((section, idx) => {
    if (!section.body || section.body.length === 0) return;

    if (y > pageH - 50) {
      doc.addPage();
      y = 20;
    }
    if (idx > 0) y += 6;

    y = addSectionTitle(doc, section.title, y, section.subtitle);

    autoTable(doc, {
      ...TABLE_STYLES,
      startY: y,
      head: section.head,
      body: section.body,
      foot: section.foot,
      columnStyles: section.columnStyles || {},
    });

    y = doc.lastAutoTable.finalY + 4;
  });

  addFooter(doc);
  doc.save(fileName);
}

export function reportFileName(prefix, periodKey) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${prefix}-pulse-${periodKey || "geral"}-${y}-${m}.pdf`;
}
