/**
 * Script tạo file PDF mẫu hợp đồng cho thuê.
 * Chạy: node scripts/generate-sample-pdf.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const TEAL = rgb(0, 0.408, 0.459);
const DARK = rgb(0.12, 0.12, 0.14);
const GRAY = rgb(0.42, 0.42, 0.46);
const LIGHT_TEAL = rgb(0.93, 0.98, 0.98);
const WHITE = rgb(1, 1, 1);
const W = 595.28;
const H = 841.89;
const M = 50;
const CW = W - M * 2;

async function main() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle('Hợp đồng mẫu - Swiftera');
  doc.setAuthor('Swiftera');

  let regular, bold;
  try {
    const regBytes = readFileSync(join(ROOT, 'public/fonts/BeVietnamPro-Regular.ttf'));
    const boldBytes = readFileSync(join(ROOT, 'public/fonts/BeVietnamPro-Bold.ttf'));
    regular = await doc.embedFont(regBytes);
    bold = await doc.embedFont(boldBytes);
  } catch {
    regular = await doc.embedFont(StandardFonts.Helvetica);
    bold = await doc.embedFont(StandardFonts.HelveticaBold);
  }

  const page = doc.addPage([W, H]);
  let y = H - M;

  const drawLine = (yy, color = rgb(0.88, 0.88, 0.9)) => {
    page.drawLine({ start: { x: M, y: yy }, end: { x: W - M, y: yy }, thickness: 0.6, color });
  };

  // Header
  page.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: TEAL });
  page.drawText('SWIFTERA', { x: M, y: H - 52, size: 22, font: bold, color: WHITE });
  page.drawText('HỢP ĐỒNG CHO THUÊ THIẾT BỊ (MẪU)', { x: M, y: H - 72, size: 10, font: regular, color: rgb(0.8, 0.96, 0.96) });
  const code = 'SWF-SAMPLE001';
  const cw = bold.widthOfTextAtSize(code, 10);
  page.drawText(code, { x: W - M - cw, y: H - 52, size: 10, font: bold, color: WHITE });

  y = H - 110;

  const section = (text) => {
    page.drawRectangle({ x: M, y: y - 4, width: CW, height: 22, color: LIGHT_TEAL });
    page.drawText(text, { x: M + 8, y, size: 10, font: bold, color: TEAL });
    y -= 28;
  };

  const row = (label, value) => {
    page.drawText(label, { x: M, y, size: 9, font: regular, color: GRAY });
    page.drawText(value, { x: M + 160, y, size: 9, font: bold, color: DARK });
    y -= 18;
  };

  section('THÔNG TIN HỢP ĐỒNG');
  row('Mã hợp đồng:', code);
  row('Ngày tạo:', 'Thứ Năm, 20 tháng 3, 2026 10:30');
  row('Phương thức TT:', 'Chuyển khoản NH');

  y -= 6;
  section('THÔNG TIN KHÁCH HÀNG');
  row('Họ tên:', 'Nguyễn Văn A');
  row('Điện thoại:', '0901 234 567');

  y -= 6;
  section('BÊN CHO THUÊ');
  row('Công ty:', 'SWIFTERA JSC (Demo)');
  row('Địa chỉ:', '123 Nguyễn Huệ, Q.1, TP.HCM');
  row('Hotline:', '1900 6868');

  y -= 6;
  section('DANH SÁCH SẢN PHẨM THUÊ');

  const colX = [M + 8, M + 230, M + 310, M + 380];
  page.drawRectangle({ x: M, y: y - 4, width: CW, height: 20, color: TEAL });
  ['Sản phẩm', 'Thời gian', 'SL', 'Thành tiền'].forEach((h, i) => {
    page.drawText(h, { x: colX[i], y, size: 8, font: bold, color: WHITE });
  });
  y -= 26;

  const sampleLines = [
    { name: 'Cho thuê PlayStation 5 Slim - Combo 2 Tay...', variant: 'PS5 Slim (Ổ đĩa)', dur: '7 ngày', qty: '1', amount: '3.400.000₫' },
    { name: 'Cho thuê Nintendo Switch OLED', variant: '', dur: '3 ngày', qty: '2', amount: '1.200.000₫' },
  ];

  for (const l of sampleLines) {
    page.drawText(l.name, { x: colX[0], y, size: 8, font: regular, color: DARK });
    page.drawText(l.dur, { x: colX[1], y, size: 8, font: regular, color: DARK });
    page.drawText(l.qty, { x: colX[2], y, size: 8, font: regular, color: DARK });
    page.drawText(l.amount, { x: colX[3], y, size: 8, font: bold, color: DARK });
    y -= 16;
    if (l.variant) {
      page.drawText(`  ${l.variant}`, { x: colX[0], y, size: 7, font: regular, color: GRAY });
      y -= 14;
    }
    drawLine(y + 6);
  }

  y -= 10;
  section('TỔNG HỢP THANH TOÁN');

  const tRow = (label, value, isBold = false) => {
    const f = isBold ? bold : regular;
    const c = isBold ? TEAL : DARK;
    page.drawText(label, { x: M + 8, y, size: 9, font: regular, color: GRAY });
    const vw = f.widthOfTextAtSize(value, isBold ? 12 : 9);
    page.drawText(value, { x: W - M - vw, y, size: isBold ? 12 : 9, font: f, color: c });
    y -= isBold ? 22 : 18;
  };

  tRow('Tiền thuê (trước giảm):', '3.200.000₫');
  tRow('Giảm voucher:', '−100.000₫');
  tRow('Tiền cọc:', '4.000.000₫');
  drawLine(y + 8, TEAL);
  y -= 4;
  tRow('TỔNG THANH TOÁN:', '7.100.000₫', true);

  // Terms
  y -= 10;
  const terms = [
    '• Tiền cọc được hoàn trả trong 24h sau khi trả thiết bị đúng hiện trạng.',
    '• Khách hàng chịu trách nhiệm bảo quản thiết bị trong suốt thời gian thuê.',
    '• Hư hỏng ngoài bảo hành sẽ được trừ vào tiền cọc hoặc yêu cầu bồi thường.',
    '• Có thể gia hạn thuê nếu liên hệ trước 12h khi hết hạn.',
    '• Giá chưa bao gồm phí vận chuyển và 8% VAT (nếu có).',
  ];
  page.drawText('ĐIỀU KHOẢN & LƯU Ý', { x: M, y, size: 9, font: bold, color: DARK });
  y -= 16;
  for (const t of terms) {
    page.drawText(t, { x: M + 8, y, size: 7.5, font: regular, color: GRAY });
    y -= 13;
  }

  // Signatures
  y -= 20;
  drawLine(y + 10);
  y -= 8;
  const sigA = M + 20;
  const sigB = W / 2 + 20;
  page.drawText('BÊN CHO THUÊ', { x: sigA, y, size: 9, font: bold, color: DARK });
  page.drawText('BÊN THUÊ', { x: sigB, y, size: 9, font: bold, color: DARK });
  y -= 14;
  page.drawText('SWIFTERA JSC', { x: sigA, y, size: 8, font: regular, color: GRAY });
  page.drawText('Nguyễn Văn A', { x: sigB, y, size: 8, font: regular, color: GRAY });
  y -= 30;
  page.drawText('Swiftera ✓', { x: sigA, y, size: 14, font: bold, color: TEAL });
  page.drawText('(Chữ ký điện tử)', { x: sigB, y, size: 8, font: regular, color: GRAY });

  // Footer bar
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: TEAL });
  page.drawText('Tài liệu được tạo tự động bởi hệ thống Swiftera — swiftera.vn', {
    x: M, y: 10, size: 7, font: regular, color: rgb(0.8, 0.96, 0.96),
  });

  const bytes = await doc.save();
  const outDir = join(ROOT, 'public/contracts');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'mau-hop-dong.pdf'), bytes);
  console.log('✅ Đã tạo public/contracts/mau-hop-dong.pdf');
}

main().catch(console.error);
