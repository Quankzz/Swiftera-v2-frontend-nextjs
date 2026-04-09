export const MOCK_HUBS = [
  {
    hub_id: 'hub-001',
    name: 'Swiftera Hub Quận 1',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    latitude: 10.7769,
    longitude: 106.7009,
    phone_number: '028 1234 5678',
    open_hours: '07:00 - 21:00',
    total_products: 42,
    available_products: 28,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    products: [
      {
        product_item_id: 'p-001',
        product_id: 'prod-001',
        name: 'MacBook Pro 14" M3',
        category: 'Máy tính xách tay',
        current_daily_price: 350000,
        deposit_amount: 5000000,
        description:
          'MacBook Pro M3 chip, 16GB RAM, 512GB SSD. Hiệu năng mạnh mẽ cho công việc sáng tạo.',
        image_url:
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-002',
        product_id: 'prod-002',
        name: 'Sony A7 IV (Body)',
        category: 'Máy ảnh',
        current_daily_price: 500000,
        deposit_amount: 8000000,
        description:
          'Máy ảnh mirrorless full-frame 33MP, quay video 4K. Kèm pin dự phòng và túi đựng.',
        image_url:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-003',
        product_id: 'prod-003',
        name: 'DJI Mavic 3 Classic',
        category: 'Flycam',
        current_daily_price: 800000,
        deposit_amount: 12000000,
        description: 'Flycam chụp ảnh góc rộng 4/3 CMOS, bay liên tục 46 phút.',
        image_url:
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300',
        status: 'RENTED',
      },
      {
        product_item_id: 'p-004',
        product_id: 'prod-004',
        name: 'iPad Pro 12.9" M2',
        category: 'Máy tính bảng',
        current_daily_price: 200000,
        deposit_amount: 3000000,
        description:
          'iPad Pro M2, màn hình Liquid Retina XDR, Wi-Fi + Cellular.',
        image_url:
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-005',
        product_id: 'prod-005',
        name: 'Loa JBL Eon One Compact',
        category: 'Âm thanh',
        current_daily_price: 250000,
        deposit_amount: 2000000,
        description:
          'Loa PA all-in-one 4 chanel, công suất 112dB. Phù hợp sự kiện nhỏ.',
        image_url:
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    hub_id: 'hub-002',
    name: 'Swiftera Hub Bình Thạnh',
    address: '456 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh, TP.HCM',
    latitude: 10.8032,
    longitude: 106.7133,
    phone_number: '028 2345 6789',
    open_hours: '08:00 - 20:00',
    total_products: 35,
    available_products: 20,
    image_url:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    products: [
      {
        product_item_id: 'p-006',
        product_id: 'prod-006',
        name: 'Canon EOS R5',
        category: 'Máy ảnh',
        current_daily_price: 600000,
        deposit_amount: 10000000,
        description:
          'Máy ảnh mirrorless 45MP, quay video 8K RAW. Kèm lens 24-105mm.',
        image_url:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-007',
        product_id: 'prod-007',
        name: 'Dell XPS 15',
        category: 'Máy tính xách tay',
        current_daily_price: 280000,
        deposit_amount: 4000000,
        description: 'Dell XPS 15 OLED, Intel i9, RTX 4060 8GB, 32GB RAM.',
        image_url:
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-008',
        product_id: 'prod-008',
        name: 'Máy chiếu Epson EB-L210W',
        category: 'Thiết bị trình chiếu',
        current_daily_price: 400000,
        deposit_amount: 5000000,
        description:
          'Máy chiếu laser 4500 lumen, độ phân giải WXGA, kết nối không dây.',
        image_url:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300',
        status: 'RENTED',
      },
      {
        product_item_id: 'p-009',
        product_id: 'prod-009',
        name: 'GoPro Hero 12 Black',
        category: 'Action Camera',
        current_daily_price: 150000,
        deposit_amount: 1500000,
        description:
          'Camera hành động 5.3K, chống nước 10m, kèm phụ kiện gắn mũ bảo hiểm.',
        image_url:
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    hub_id: 'hub-003',
    name: 'Swiftera Hub Thủ Đức',
    address: '789 Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, TP.HCM',
    latitude: 10.8543,
    longitude: 106.7716,
    phone_number: '028 3456 7890',
    open_hours: '07:30 - 21:30',
    total_products: 58,
    available_products: 41,
    image_url:
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400',
    products: [
      {
        product_item_id: 'p-010',
        product_id: 'prod-010',
        name: 'Oculus Quest 3',
        category: 'Thiết bị VR/AR',
        current_daily_price: 300000,
        deposit_amount: 4000000,
        description:
          'Kính VR không dây thế hệ mới, 2064x2208/mắt, 120Hz. Kèm 2 controller.',
        image_url:
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-011',
        product_id: 'prod-011',
        name: 'Bộ loa Sonos Era 300',
        category: 'Âm thanh Hi-Fi',
        current_daily_price: 350000,
        deposit_amount: 4500000,
        description: 'Loa Spatial Audio Dolby Atmos, Wi-Fi 6, Bluetooth 5.0.',
        image_url:
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-012',
        product_id: 'prod-012',
        name: 'Ronin 4D Cinema Camera',
        category: 'Camera chuyên nghiệp',
        current_daily_price: 2000000,
        deposit_amount: 30000000,
        description:
          'DJI Ronin 4D với gimbal tích hợp, quay 6K, cảm biến full-frame.',
        image_url:
          'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300',
        status: 'MAINTENANCE',
      },
      {
        product_item_id: 'p-013',
        product_id: 'prod-013',
        name: 'Surface Pro 9',
        category: 'Máy tính bảng',
        current_daily_price: 220000,
        deposit_amount: 3500000,
        description:
          'Microsoft Surface Pro 9, Intel i7, 16GB RAM, Windows 11 Pro.',
        image_url:
          'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-014',
        product_id: 'prod-014',
        name: 'Sony WH-1000XM5',
        category: 'Tai nghe',
        current_daily_price: 80000,
        deposit_amount: 800000,
        description:
          'Tai nghe chống ồn ANC hàng đầu, 30 giờ pin, kết nối multipoint.',
        image_url:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    hub_id: 'hub-004',
    name: 'Swiftera Hub Quận 7',
    address: '321 Nguyễn Thị Thập, Phường Tân Phong, Quận 7, TP.HCM',
    latitude: 10.7302,
    longitude: 106.7211,
    phone_number: '028 4567 8901',
    open_hours: '08:00 - 22:00',
    total_products: 49,
    available_products: 32,
    image_url:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
    products: [
      {
        product_item_id: 'p-015',
        product_id: 'prod-015',
        name: 'Máy khoan Bosch GSB 18V',
        category: 'Dụng cụ điện',
        current_daily_price: 100000,
        deposit_amount: 1200000,
        description:
          'Máy khoan pin 18V, momen xoắn 54Nm, kèm 2 pin và sạc nhanh.',
        image_url:
          'https://images.unsplash.com/photo-1504148455328-e5e7a5d028e0?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-016',
        product_id: 'prod-016',
        name: 'Nikon Z8',
        category: 'Máy ảnh',
        current_daily_price: 700000,
        deposit_amount: 12000000,
        description:
          'Nikon Z8 45.7MP, video 8K RAW, Eye AF, body only. Kèm túi đựng.',
        image_url:
          'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-017',
        product_id: 'prod-017',
        name: 'Nintendo Switch OLED',
        category: 'Máy chơi game',
        current_daily_price: 120000,
        deposit_amount: 1500000,
        description:
          'Nintendo Switch OLED, màn hình 7", kèm 2 Joy-Con và dock TV.',
        image_url:
          'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300',
        status: 'RENTED',
      },
    ],
  },
  {
    hub_id: 'hub-005',
    name: 'Swiftera Hub Gò Vấp',
    address: '654 Quang Trung, Phường 10, Gò Vấp, TP.HCM',
    latitude: 10.8384,
    longitude: 106.6648,
    phone_number: '028 5678 9012',
    open_hours: '07:00 - 20:30',
    total_products: 31,
    available_products: 18,
    products: [
      {
        product_item_id: 'p-018',
        product_id: 'prod-018',
        name: 'Máy photocopy Canon iR2625',
        category: 'Thiết bị văn phòng',
        current_daily_price: 200000,
        deposit_amount: 3000000,
        description:
          'Máy photocopy A3, in 25 trang/phút, scan màu, kết nối mạng.',
        image_url:
          'https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-019',
        product_id: 'prod-019',
        name: 'Gimbal DJI RS 3 Pro',
        category: 'Phụ kiện quay phim',
        current_daily_price: 180000,
        deposit_amount: 2000000,
        description:
          'Gimbal 3 trục cho máy ảnh mirrorless đến 4.5kg. Thời lượng pin 12h.',
        image_url:
          'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-020',
        product_id: 'prod-020',
        name: 'Samsung Galaxy S24 Ultra',
        category: 'Điện thoại',
        current_daily_price: 150000,
        deposit_amount: 2500000,
        description: 'Galaxy S24 Ultra với S-Pen, camera 200MP, AI tích hợp.',
        image_url:
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    hub_id: 'hub-006',
    name: 'Swiftera Hub Tân Bình',
    address: '987 Hoàng Văn Thụ, Phường 8, Tân Bình, TP.HCM',
    latitude: 10.7932,
    longitude: 106.652,
    phone_number: '028 6789 0123',
    open_hours: '08:00 - 21:00',
    total_products: 44,
    available_products: 29,
    products: [
      {
        product_item_id: 'p-021',
        product_id: 'prod-021',
        name: 'Rode VideoMic Pro+',
        category: 'Micro',
        current_daily_price: 120000,
        deposit_amount: 1500000,
        description:
          'Micro shotgun cho máy ảnh/điện thoại, lọc gió tốt, pin AA.',
        image_url:
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300',
        status: 'AVAILABLE',
      },
      {
        product_item_id: 'p-022',
        product_id: 'prod-022',
        name: 'Aputure 300d Mark III',
        category: 'Đèn chiếu sáng',
        current_daily_price: 400000,
        deposit_amount: 5000000,
        description: 'Đèn LED studio 350W, nhiệt độ màu 5600K, CRI 96+.',
        image_url:
          'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=300',
        status: 'RENTED',
      },
      {
        product_item_id: 'p-023',
        product_id: 'prod-023',
        name: 'Laptop Lenovo ThinkPad X1 Carbon',
        category: 'Máy tính xách tay',
        current_daily_price: 260000,
        deposit_amount: 4000000,
        description:
          'ThinkPad X1 Carbon Gen 11, Intel i7 vPro, 16GB, 512GB SSD, siêu nhẹ 1.12kg.',
        image_url:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
];
