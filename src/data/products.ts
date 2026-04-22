import type { Product } from "@/types/catalog";

export const products: Product[] = [
  {
    productId: "prod-iphone-15-pro",
    categoryId: "cat-phones",
    name: "iPhone 15 Pro Max",
    dailyPrice: 350000,
    oldDailyPrice: 450000,
    depositAmount: 3000000,
    description: `<h2>iPhone 15 Pro Max - Đỉnh cao titanium</h2>
<p>iPhone 15 Pro Max là chiếc flagship <strong>mạnh nhất</strong> từ Apple năm 2023, được trang bị chip <strong>A17 Pro</strong> được sản xuất trên tiến trình 3nm - chip di động đầu tiên trên thế giới với hiệu năng vượt trội.</p>

<h3>🎬 Video giới thiệu</h3>
<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:12px 0;">
  <iframe src="https://www.youtube.com/embed/XqTIQzSd3Zw" title="iPhone 15 Pro Max" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

<h3>📸 Hệ thống camera chuyên nghiệp</h3>
<img src="https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/2023_9_20_638307989548944936_iphone-15-promax-xanh-1.jpg" alt="iPhone 15 Pro Max Camera" style="width:100%;border-radius:12px;margin:8px 0;" />
<ul>
  <li>Camera chính <strong>48MP</strong>, khẩu độ f/1.78, chống rung cơ học</li>
  <li>Camera telephoto <strong>12MP</strong> tetraprism zoom quang học <strong>5x</strong></li>
  <li>Camera góc siêu rộng <strong>12MP</strong>, f/2.2</li>
  <li>Quay video <strong>4K/120fps</strong> ProRes - chất lượng điện ảnh</li>
</ul>

<h3>⚡ Thông số kỹ thuật</h3>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;">
  <tbody>
    <tr style="background:rgba(0,0,0,0.03)"><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Màn hình</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">6.7" LTPO Super Retina XDR OLED, 2796×1290, 460 ppi, 120Hz ProMotion</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Chip</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">Apple A17 Pro (3nm), GPU 6 nhân</td></tr>
    <tr style="background:rgba(0,0,0,0.03)"><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">RAM / Bộ nhớ</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">8GB RAM / 256GB – 1TB</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Pin</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">4422 mAh, sạc USB-C 27W, MagSafe 15W, pin cả ngày dài</td></tr>
    <tr style="background:rgba(0,0,0,0.03)"><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Khung máy</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">Titanium cấp hàng không vũ trụ, mặt kính Ceramic Shield</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Kết nối</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">5G, Wi-Fi 6E, Bluetooth 5.3, Thread, Ultra Wideband</td></tr>
  </tbody>
</table>

<h3>✅ Lý do nên thuê</h3>
<ol>
  <li>Trải nghiệm chip A17 Pro mạnh nhất trước khi quyết định mua</li>
  <li>Camera tetraprism 5x - lý tưởng cho nhiếp ảnh và video chuyên nghiệp</li>
  <li>Khung titanium sang trọng, cầm nhẹ hơn thế hệ trước</li>
</ol>

<blockquote>💡 <em>Lưu ý: Thiết bị được kiểm tra kỹ trước khi giao. Bao gồm cáp USB-C, không kèm củ sạc.</em></blockquote>`,
    productImages: [
      {
        productId: "prod-iphone-15-pro",
        imageUrl:
          "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/2023_9_20_638307989548944936_iphone-15-promax-xanh-1.jpg",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: "prod-iphone-15-pro",
        imageUrl:
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
        sortOrder: 2,
        isPrimary: false,
      },
      {
        productId: "prod-iphone-15-pro",
        imageUrl:
          "https://images.unsplash.com/photo-1574755393849-623942496936?auto=format&fit=crop&w=600&q=80",
        sortOrder: 3,
        isPrimary: false,
      },
    ],
    colors: [
      { name: "Blue Titanium", value: "#8DA6B3" },
      { name: "Black Titanium", value: "#2E3440" },
      { name: "Natural Titanium", value: "#B9B1A5" },
      { name: "White Titanium", value: "#D9D6CF" },
    ],
    minRentalDays: 1,
    inventoryItems: [
      {
        inventoryItemId: "inv-001",
        productId: "prod-iphone-15-pro",
        serialNumber: "SN-IP15PM-001",
        status: "AVAILABLE",
        conditionGrade: "A",
        staffNote: "Máy mới 99%, chưa có vết xước",
      },
      {
        inventoryItemId: "inv-002",
        productId: "prod-iphone-15-pro",
        serialNumber: "SN-IP15PM-002",
        status: "RENTED",
        conditionGrade: "A",
        staffNote: "Đang cho khách DH-2026-001 thuê, trả ngày 28/03",
      },
      {
        inventoryItemId: "inv-003",
        productId: "prod-iphone-15-pro",
        serialNumber: "SN-IP15PM-003",
        status: "AVAILABLE",
        conditionGrade: "B",
        staffNote: "Viền có vết xước nhỏ, màn hình ổn",
      },
    ],
  },
  {
    productId: "prod-samsung-s24-ultra",
    categoryId: "cat-phones",
    name: "Samsung Galaxy S24 Ultra",
    dailyPrice: 320000,
    oldDailyPrice: 400000,
    depositAmount: 2800000,
    description: `<h2>Samsung Galaxy S24 Ultra - AI Phone dành cho người sáng tạo</h2>
<p>Galaxy S24 Ultra là đỉnh cao của dòng flagship Samsung, tích hợp <strong>Galaxy AI</strong> với hàng loạt tính năng AI tiên tiến như Circle to Search, Live Translate và Generative Edit.</p>

<h3>🎬 Video trải nghiệm thực tế</h3>
<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:12px 0;">
  <iframe src="https://www.youtube.com/embed/SFgSS3PaRRo" title="Samsung S24 Ultra" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
</div>

<h3>✏️ S Pen - Bút thông minh tích hợp</h3>
<img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80" alt="Samsung S24 Ultra S Pen" style="width:100%;border-radius:12px;margin:8px 0;" />
<p>S Pen được tích hợp trực tiếp vào thân máy với độ trễ <strong>2.8ms</strong>, hỗ trợ ghi chú tức thì ngay cả khi màn hình tắt.</p>

<h3>📷 Camera 200MP - Zoom không giới hạn</h3>
<ul>
  <li>Camera chính <strong>200MP</strong>, f/1.7, chống rung quang học OIS</li>
  <li>Telephoto <strong>50MP</strong> zoom quang học 5x (tương đương 111mm)</li>
  <li>Telephoto <strong>10MP</strong> zoom quang học 3x</li>
  <li>Camera góc rộng <strong>12MP</strong>, f/2.2</li>
  <li>Zoom tối đa <span style="color:#3b82f6"><strong>100x Space Zoom</strong></span></li>
</ul>

<h3>⚡ Thông số kỹ thuật</h3>
<table style="width:100%;border-collapse:collapse;font-size:0.9em;">
  <tbody>
    <tr style="background:rgba(0,0,0,0.03)"><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Màn hình</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">6.8" Dynamic AMOLED 2X, QHD+ 3088×1440, 120Hz adaptive</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Chip</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">Snapdragon 8 Gen 3 for Galaxy (4nm)</td></tr>
    <tr style="background:rgba(0,0,0,0.03)"><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">RAM / Bộ nhớ</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">12GB RAM / 256GB – 1TB</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Pin</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">5000 mAh, sạc nhanh 45W, sạc không dây 15W</td></tr>
    <tr style="background:rgba(0,0,0,0.03)"><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">Khung máy</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">Titanium Grade 4, kính Corning Gorilla Glass Armor</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;border:1px solid rgba(0,0,0,0.08)">AI Features</td><td style="padding:8px 12px;border:1px solid rgba(0,0,0,0.08)">Circle to Search, Live Translate, Generative Edit, Note Assist</td></tr>
  </tbody>
</table>

<blockquote>💡 <em>Bao gồm: Cáp USB-C, S Pen tích hợp sẵn. Không kèm củ sạc.</em></blockquote>`,
    productImages: [
      {
        productId: "prod-samsung-s24-ultra",
        imageUrl:
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: "prod-samsung-s24-ultra",
        imageUrl:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    colors: [
      { name: "Titanium Black", value: "#2B2B2B" },
      { name: "Titanium Gray", value: "#8C8C8C" },
      { name: "Titanium Violet", value: "#7B5EA7" },
    ],
    minRentalDays: 1,
    inventoryItems: [
      {
        inventoryItemId: "inv-s24-001",
        productId: "prod-samsung-s24-ultra",
        serialNumber: "SN-S24U-001",
        status: "AVAILABLE",
        conditionGrade: "A",
        staffNote: "Máy mới, fullbox",
      },
      {
        inventoryItemId: "inv-s24-002",
        productId: "prod-samsung-s24-ultra",
        serialNumber: "SN-S24U-002",
        status: "MAINTENANCE",
        conditionGrade: "B",
        staffNote: "Đang thay màn hình, dự kiến xong 27/03",
      },
    ],
  },
  {
    productId: "prod-asus-rog-phone-8",
    categoryId: "cat-phones",
    name: "ASUS ROG Phone 8 Pro",
    dailyPrice: 290000,
    oldDailyPrice: 370000,
    depositAmount: 2500000,
    description:
      '6.78" AMOLED 165Hz, Snapdragon 8 Gen 3, pin 5500mAh, tản nhiệt AeroActive.',
    productImages: [
      {
        productId: "prod-asus-rog-phone-8",
        imageUrl:
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: "Phantom Black", value: "#1A1A1A" },
      { name: "Storm White", value: "#F0F0F0" },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-ipad-pro-m4",
    categoryId: "cat-tablets",
    name: 'iPad Pro 13" M4',
    dailyPrice: 400000,
    oldDailyPrice: 520000,
    depositAmount: 4000000,
    description:
      "Chip M4 siêu mỏng 5.1mm, màn OLED Ultra Retina XDR, hỗ trợ Apple Pencil Pro.",
    productImages: [
      {
        productId: "prod-ipad-pro-m4",
        imageUrl:
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: "Silver", value: "#E8E8ED" },
      { name: "Space Black", value: "#1C1C1E" },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-switch-oled",
    categoryId: "cat-consoles",
    name: "Nintendo Switch OLED + Mario Kart",
    dailyPrice: 120000,
    oldDailyPrice: 150000,
    depositAmount: 1500000,
    description: 'Màn 7" OLED, Joy-Con bundle, tặng kèm game Mario Kart.',
    productImages: [
      {
        productId: "prod-switch-oled",
        imageUrl:
          "https://m.media-amazon.com/images/I/6181h344+6L._AC_UF1000,1000_QL80_.jpg",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-ps5",
    categoryId: "cat-consoles",
    name: "PlayStation 5 Slim",
    dailyPrice: 200000,
    oldDailyPrice: 280000,
    depositAmount: 2000000,
    description: "Bản Slim, tay cầm DualSense, hỗ trợ ray tracing 4K.",
    productImages: [
      {
        productId: "prod-ps5",
        imageUrl:
          "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [{ name: "White", value: "#F0F0F0" }],
    minRentalDays: 1,
  },
  {
    productId: "prod-robot-cleaner",
    categoryId: "cat-smart-home",
    name: "Dreame X50 Ultra",
    dailyPrice: 150000,
    oldDailyPrice: 180000,
    depositAmount: 1200000,
    description: "Hút 20kPa, tránh vật cản AI, tự làm rỗng hộc chứa.",
    productImages: [
      {
        productId: "prod-robot-cleaner",
        imageUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-xiaomi-vacuum",
    categoryId: "cat-smart-home",
    name: "Xiaomi Robot Vacuum S20+",
    dailyPrice: 90000,
    oldDailyPrice: 120000,
    depositAmount: 800000,
    description: "Hút 10000Pa, lập bản đồ LDS, mop rung siêu âm, pin 5200mAh.",
    productImages: [
      {
        productId: "prod-xiaomi-vacuum",
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-macbook-pro",
    categoryId: "cat-computers",
    name: 'MacBook Pro 14" M3 Pro',
    dailyPrice: 500000,
    oldDailyPrice: 650000,
    depositAmount: 5000000,
    description: "CPU 12 nhân, RAM 18GB, SSD 1TB, Liquid Retina XDR.",
    productImages: [
      {
        productId: "prod-macbook-pro",
        imageUrl:
          "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: "Space Black", value: "#1C1C1E" },
      { name: "Silver", value: "#E8E8ED" },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-dell-xps-15",
    categoryId: "cat-computers",
    name: "Dell XPS 15 OLED",
    dailyPrice: 430000,
    oldDailyPrice: 560000,
    depositAmount: 4500000,
    description: '15.6" OLED 3.5K, Intel Core Ultra 9, RAM 32GB, SSD 1TB.',
    productImages: [
      {
        productId: "prod-dell-xps-15",
        imageUrl:
          "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: "Platinum", value: "#E5E4E2" },
      { name: "Graphite", value: "#383838" },
    ],
    minRentalDays: 1,
  },
  {
    productId: "prod-sony-headphones",
    categoryId: "cat-audio",
    name: "Sony WH-1000XM5",
    dailyPrice: 80000,
    oldDailyPrice: 100000,
    depositAmount: 600000,
    description: "ANC thích ứng, pin 30h, Bluetooth đa điểm.",
    productImages: [
      {
        productId: "prod-sony-headphones",
        imageUrl:
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [{ name: "Matte Black", value: "#1C1C1C" }],
    minRentalDays: 1,
  },
  {
    productId: "prod-bose-qc45",
    categoryId: "cat-audio",
    name: "Bose QuietComfort 45",
    dailyPrice: 65000,
    oldDailyPrice: 85000,
    depositAmount: 500000,
    description:
      "ANC chế độ kép, pin 24h, âm thanh TriPort, kết nối Multipoint.",
    productImages: [
      {
        productId: "prod-bose-qc45",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
    colors: [
      { name: "Triple Black", value: "#1C1C1C" },
      { name: "White Smoke", value: "#F5F5F0" },
    ],
    minRentalDays: 1,
  },
];
