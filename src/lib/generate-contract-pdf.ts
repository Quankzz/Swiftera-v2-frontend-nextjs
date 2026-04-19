import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export interface ContractPdfInput {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  paymentMethod: string;
  lines: {
    name: string;
    variantLabel?: string;
    durationLabel: string;
    quantity: number;
    rentalAfterVoucher: number;
    depositTotal: number;
  }[];
  totals: {
    rentalSubtotal: number;
    totalVoucherDiscount: number;
    totalDeposit: number;
    grandTotal: number;
  };
}

const TEAL = rgb(0, 0.408, 0.459);
const DARK = rgb(0.12, 0.12, 0.14);
const GRAY = rgb(0.42, 0.42, 0.46);
const LIGHT_TEAL_BG = rgb(0.93, 0.98, 0.98);
const WHITE = rgb(1, 1, 1);
const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

async function loadFonts(doc: PDFDocument) {
  doc.registerFontkit(fontkit);
  try {
    const [regularBytes, boldBytes] = await Promise.all([
      fetch('/fonts/BeVietnamPro-Regular.ttf').then((r) => r.arrayBuffer()),
      fetch('/fonts/BeVietnamPro-Bold.ttf').then((r) => r.arrayBuffer()),
    ]);
    const regular = await doc.embedFont(regularBytes);
    const bold = await doc.embedFont(boldBytes);
    return { regular, bold };
  } catch {
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    return { regular, bold };
  }
}

function drawLine(
  page: ReturnType<PDFDocument['addPage']>,
  y: number,
  color = rgb(0.88, 0.88, 0.9),
) {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.6,
    color,
  });
}

export async function generateContractPdf(input: ContractPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Hợp đồng ${input.orderCode}`);
  doc.setAuthor('Swiftera');
  doc.setSubject('Hợp đồng cho thuê thiết bị');
  const { regular, bold } = await loadFonts(doc);

  const page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  // Header band
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 80,
    width: PAGE_W,
    height: 80,
    color: TEAL,
  });
  page.drawText('SWIFTERA', {
    x: MARGIN,
    y: PAGE_H - 52,
    size: 22,
    font: bold,
    color: WHITE,
  });
  page.drawText('HỢP ĐỒNG CHO THUÊ THIẾT BỊ', {
    x: MARGIN,
    y: PAGE_H - 72,
    size: 10,
    font: regular,
    color: rgb(0.8, 0.96, 0.96),
  });
  const codeW = bold.widthOfTextAtSize(input.orderCode, 10);
  page.drawText(input.orderCode, {
    x: PAGE_W - MARGIN - codeW,
    y: PAGE_H - 52,
    size: 10,
    font: bold,
    color: WHITE,
  });

  y = PAGE_H - 110;

  // Section: Contract info
  const sectionTitle = (text: string) => {
    page.drawRectangle({
      x: MARGIN,
      y: y - 4,
      width: CONTENT_W,
      height: 22,
      color: LIGHT_TEAL_BG,
    });
    page.drawText(text, { x: MARGIN + 8, y: y, size: 10, font: bold, color: TEAL });
    y -= 28;
  };

  const row = (label: string, value: string, indent = 0) => {
    page.drawText(label, { x: MARGIN + indent, y, size: 9, font: regular, color: GRAY });
    page.drawText(value, { x: MARGIN + 160 + indent, y, size: 9, font: bold, color: DARK });
    y -= 18;
  };

  sectionTitle('THÔNG TIN HỢP ĐỒNG');
  row('Mã hợp đồng:', input.orderCode);
  row('Ngày tạo:', input.createdAt);
  row('Phương thức TT:', input.paymentMethod === 'e_wallet' ? 'Ví điện tử' : 'Chuyển khoản NH');

  y -= 6;
  sectionTitle('THÔNG TIN KHÁCH HÀNG');
  row('Họ tên:', input.customerName);
  row('Điện thoại:', input.customerPhone);

  y -= 6;
  sectionTitle('BÊN CHO THUÊ');
  row('Công ty:', 'SWIFTERA JSC (Demo)');
  row('Địa chỉ:', '123 Nguyễn Huệ, Q.1, TP.HCM');
  row('Hotline:', '1900 6868');

  y -= 6;
  sectionTitle('DANH SÁCH SẢN PHẨM THUÊ');

  // Table header
  const colX = [MARGIN + 8, MARGIN + 230, MARGIN + 310, MARGIN + 380];
  page.drawRectangle({ x: MARGIN, y: y - 4, width: CONTENT_W, height: 20, color: TEAL });
  ['Sản phẩm', 'Thời gian', 'SL', 'Thành tiền'].forEach((h, i) => {
    page.drawText(h, { x: colX[i], y, size: 8, font: bold, color: WHITE });
  });
  y -= 26;

  for (const line of input.lines) {
    const nameStr =
      line.name.length > 35 ? line.name.slice(0, 35) + '...' : line.name;
    page.drawText(nameStr, { x: colX[0], y, size: 8, font: regular, color: DARK });
    page.drawText(line.durationLabel, { x: colX[1], y, size: 8, font: regular, color: DARK });
    page.drawText(String(line.quantity), { x: colX[2], y, size: 8, font: regular, color: DARK });
    const amount = (line.rentalAfterVoucher + line.depositTotal).toLocaleString('vi-VN') + '₫';
    page.drawText(amount, { x: colX[3], y, size: 8, font: bold, color: DARK });
    y -= 16;

    if (line.variantLabel) {
      page.drawText(`  ${line.variantLabel}`, { x: colX[0], y, size: 7, font: regular, color: GRAY });
      y -= 14;
    }
    drawLine(page, y + 6);
  }

  y -= 10;
  sectionTitle('TỔNG HỢP THANH TOÁN');

  const totalRow = (label: string, value: string, isBold = false) => {
    const f = isBold ? bold : regular;
    const c = isBold ? TEAL : DARK;
    page.drawText(label, { x: MARGIN + 8, y, size: 9, font: regular, color: GRAY });
    const vw = f.widthOfTextAtSize(value, isBold ? 12 : 9);
    page.drawText(value, { x: PAGE_W - MARGIN - vw, y, size: isBold ? 12 : 9, font: f, color: c });
    y -= isBold ? 22 : 18;
  };

  totalRow('Tiền thuê (trước giảm):', input.totals.rentalSubtotal.toLocaleString('vi-VN') + '₫');
  if (input.totals.totalVoucherDiscount > 0) {
    totalRow('Giảm voucher:', '−' + input.totals.totalVoucherDiscount.toLocaleString('vi-VN') + '₫');
  }
  totalRow('Tiền cọc:', input.totals.totalDeposit.toLocaleString('vi-VN') + '₫');
  drawLine(page, y + 8, TEAL);
  y -= 4;
  totalRow('TỔNG THANH TOÁN:', input.totals.grandTotal.toLocaleString('vi-VN') + '₫', true);

  // Footer terms
  y -= 10;
  const terms = [
    '• Tiền cọc được hoàn trả trong 24h sau khi trả thiết bị đúng hiện trạng.',
    '• Khách hàng chịu trách nhiệm bảo quản thiết bị trong suốt thời gian thuê.',
    '• Hư hỏng ngoài bảo hành sẽ được trừ vào tiền cọc hoặc yêu cầu bồi thường.',
    '• Có thể gia hạn thuê nếu liên hệ trước 12h khi hết hạn.',
    '• Giá chưa bao gồm phí vận chuyển và 8% VAT (nếu có).',
  ];
  page.drawText('ĐIỀU KHOẢN & LƯU Ý', { x: MARGIN, y, size: 9, font: bold, color: DARK });
  y -= 16;
  for (const t of terms) {
    page.drawText(t, { x: MARGIN + 8, y, size: 7.5, font: regular, color: GRAY });
    y -= 13;
  }

  // Signature area
  y -= 20;
  drawLine(page, y + 10);
  y -= 8;
  const sigColA = MARGIN + 20;
  const sigColB = PAGE_W / 2 + 20;
  page.drawText('BÊN CHO THUÊ', { x: sigColA, y, size: 9, font: bold, color: DARK });
  page.drawText('BÊN THUÊ', { x: sigColB, y, size: 9, font: bold, color: DARK });
  y -= 14;
  page.drawText('SWIFTERA JSC', { x: sigColA, y, size: 8, font: regular, color: GRAY });
  page.drawText(input.customerName, { x: sigColB, y, size: 8, font: regular, color: GRAY });
  y -= 30;
  page.drawText('Swiftera ✓', { x: sigColA, y, size: 14, font: bold, color: TEAL });
  page.drawText('(Chữ ký điện tử)', { x: sigColB, y, size: 8, font: regular, color: GRAY });

  // Bottom bar
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 30, color: TEAL });
  page.drawText('Tài liệu được tạo tự động bởi hệ thống Swiftera - swiftera.vn', {
    x: MARGIN,
    y: 10,
    size: 7,
    font: regular,
    color: rgb(0.8, 0.96, 0.96),
  });

  return doc.save();
}
