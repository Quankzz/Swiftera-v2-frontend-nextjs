import type { Hub } from '@/types/map.types';

export const MOCK_HUBS: Hub[] = [
  {
    id: 'hub-001',
    name: 'Swiftera Hub Quận 1',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    latitude: 10.7769,
    longitude: 106.7009,
    phoneNumber: '028 1234 5678',
    openHours: '07:00 - 21:00',
    totalProducts: 42,
    availableProducts: 28,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    products: [
      {
        id: 'p-001',
        name: 'MacBook Pro 14" M3',
        category: 'Máy tính xách tay',
        dailyPrice: 350000,
        depositAmount: 5000000,
        description:
          'MacBook Pro M3 chip, 16GB RAM, 512GB SSD. Hiệu năng mạnh mẽ cho công việc sáng tạo.',
        imageUrl:
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-002',
        name: 'Sony A7 IV (Body)',
        category: 'Máy ảnh',
        dailyPrice: 500000,
        depositAmount: 8000000,
        description:
          'Máy ảnh mirrorless full-frame 33MP, quay video 4K. Kèm pin dự phòng và túi đựng.',
        imageUrl:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-003',
        name: 'DJI Mavic 3 Classic',
        category: 'Flycam',
        dailyPrice: 800000,
        depositAmount: 12000000,
        description: 'Flycam chụp ảnh góc rộng 4/3 CMOS, bay liên tục 46 phút.',
        imageUrl:
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300',
        status: 'RENTED',
      },
      {
        id: 'p-004',
        name: 'iPad Pro 12.9" M2',
        category: 'Máy tính bảng',
        dailyPrice: 200000,
        depositAmount: 3000000,
        description:
          'iPad Pro M2, màn hình Liquid Retina XDR, Wi-Fi + Cellular.',
        imageUrl:
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-005',
        name: 'Loa JBL Eon One Compact',
        category: 'Âm thanh',
        dailyPrice: 250000,
        depositAmount: 2000000,
        description:
          'Loa PA all-in-one 4 chanel, công suất 112dB. Phù hợp sự kiện nhỏ.',
        imageUrl:
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    id: 'hub-002',
    name: 'Swiftera Hub Bình Thạnh',
    address: '456 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh, TP.HCM',
    latitude: 10.8032,
    longitude: 106.7133,
    phoneNumber: '028 2345 6789',
    openHours: '08:00 - 20:00',
    totalProducts: 35,
    availableProducts: 20,
    imageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    products: [
      {
        id: 'p-006',
        name: 'Canon EOS R5',
        category: 'Máy ảnh',
        dailyPrice: 600000,
        depositAmount: 10000000,
        description:
          'Máy ảnh mirrorless 45MP, quay video 8K RAW. Kèm lens 24-105mm.',
        imageUrl:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-007',
        name: 'Dell XPS 15',
        category: 'Máy tính xách tay',
        dailyPrice: 280000,
        depositAmount: 4000000,
        description: 'Dell XPS 15 OLED, Intel i9, RTX 4060 8GB, 32GB RAM.',
        imageUrl:
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-008',
        name: 'Máy chiếu Epson EB-L210W',
        category: 'Thiết bị trình chiếu',
        dailyPrice: 400000,
        depositAmount: 5000000,
        description:
          'Máy chiếu laser 4500 lumen, độ phân giải WXGA, kết nối không dây.',
        imageUrl:
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300',
        status: 'RENTED',
      },
      {
        id: 'p-009',
        name: 'GoPro Hero 12 Black',
        category: 'Action Camera',
        dailyPrice: 150000,
        depositAmount: 1500000,
        description:
          'Camera hành động 5.3K, chống nước 10m, kèm phụ kiện gắn mũ bảo hiểm.',
        imageUrl:
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    id: 'hub-003',
    name: 'Swiftera Hub Thủ Đức',
    address: '789 Võ Văn Ngân, Phường Linh Chiểu, Thành phố Thủ Đức, TP.HCM',
    latitude: 10.8543,
    longitude: 106.7716,
    phoneNumber: '028 3456 7890',
    openHours: '07:30 - 21:30',
    totalProducts: 58,
    availableProducts: 41,
    imageUrl:
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400',
    products: [
      {
        id: 'p-010',
        name: 'Oculus Quest 3',
        category: 'Thiết bị VR/AR',
        dailyPrice: 300000,
        depositAmount: 4000000,
        description:
          'Kính VR không dây thế hệ mới, 2064x2208/mắt, 120Hz. Kèm 2 controller.',
        imageUrl:
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-011',
        name: 'Bộ loa Sonos Era 300',
        category: 'Âm thanh Hi-Fi',
        dailyPrice: 350000,
        depositAmount: 4500000,
        description: 'Loa Spatial Audio Dolby Atmos, Wi-Fi 6, Bluetooth 5.0.',
        imageUrl:
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-012',
        name: 'Ronin 4D Cinema Camera',
        category: 'Camera chuyên nghiệp',
        dailyPrice: 2000000,
        depositAmount: 30000000,
        description:
          'DJI Ronin 4D với gimbal tích hợp, quay 6K, cảm biến full-frame.',
        imageUrl:
          'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300',
        status: 'MAINTENANCE',
      },
      {
        id: 'p-013',
        name: 'Surface Pro 9',
        category: 'Máy tính bảng',
        dailyPrice: 220000,
        depositAmount: 3500000,
        description:
          'Microsoft Surface Pro 9, Intel i7, 16GB RAM, Windows 11 Pro.',
        imageUrl:
          'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-014',
        name: 'Sony WH-1000XM5',
        category: 'Tai nghe',
        dailyPrice: 80000,
        depositAmount: 800000,
        description:
          'Tai nghe chống ồn ANC hàng đầu, 30 giờ pin, kết nối multipoint.',
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    id: 'hub-004',
    name: 'Swiftera Hub Quận 7',
    address: '321 Nguyễn Thị Thập, Phường Tân Phong, Quận 7, TP.HCM',
    latitude: 10.7302,
    longitude: 106.7211,
    phoneNumber: '028 4567 8901',
    openHours: '08:00 - 22:00',
    totalProducts: 49,
    availableProducts: 32,
    imageUrl:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
    products: [
      {
        id: 'p-015',
        name: 'Máy khoan Bosch GSB 18V',
        category: 'Dụng cụ điện',
        dailyPrice: 100000,
        depositAmount: 1200000,
        description:
          'Máy khoan pin 18V, momen xoắn 54Nm, kèm 2 pin và sạc nhanh.',
        imageUrl:
          'https://images.unsplash.com/photo-1504148455328-e5e7a5d028e0?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-016',
        name: 'Nikon Z8',
        category: 'Máy ảnh',
        dailyPrice: 700000,
        depositAmount: 12000000,
        description:
          'Nikon Z8 45.7MP, video 8K RAW, Eye AF, body only. Kèm túi đựng.',
        imageUrl:
          'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-017',
        name: 'Nintendo Switch OLED',
        category: 'Máy chơi game',
        dailyPrice: 120000,
        depositAmount: 1500000,
        description:
          'Nintendo Switch OLED, màn hình 7", kèm 2 Joy-Con và dock TV.',
        imageUrl:
          'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=300',
        status: 'RENTED',
      },
    ],
  },
  {
    id: 'hub-005',
    name: 'Swiftera Hub Gò Vấp',
    address: '654 Quang Trung, Phường 10, Gò Vấp, TP.HCM',
    latitude: 10.8384,
    longitude: 106.6648,
    phoneNumber: '028 5678 9012',
    openHours: '07:00 - 20:30',
    totalProducts: 31,
    availableProducts: 18,
    products: [
      {
        id: 'p-018',
        name: 'Máy photocopy Canon iR2625',
        category: 'Thiết bị văn phòng',
        dailyPrice: 200000,
        depositAmount: 3000000,
        description:
          'Máy photocopy A3, in 25 trang/phút, scan màu, kết nối mạng.',
        imageUrl:
          'https://images.unsplash.com/photo-1612965607446-25e1332775ae?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-019',
        name: 'Gimbal DJI RS 3 Pro',
        category: 'Phụ kiện quay phim',
        dailyPrice: 180000,
        depositAmount: 2000000,
        description:
          'Gimbal 3 trục cho máy ảnh mirrorless đến 4.5kg. Thời lượng pin 12h.',
        imageUrl:
          'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-020',
        name: 'Samsung Galaxy S24 Ultra',
        category: 'Điện thoại',
        dailyPrice: 150000,
        depositAmount: 2500000,
        description: 'Galaxy S24 Ultra với S-Pen, camera 200MP, AI tích hợp.',
        imageUrl:
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    id: 'hub-006',
    name: 'Swiftera Hub Tân Bình',
    address: '987 Hoàng Văn Thụ, Phường 8, Tân Bình, TP.HCM',
    latitude: 10.7932,
    longitude: 106.652,
    phoneNumber: '028 6789 0123',
    openHours: '08:00 - 21:00',
    totalProducts: 44,
    availableProducts: 29,
    products: [
      {
        id: 'p-021',
        name: 'Rode VideoMic Pro+',
        category: 'Micro',
        dailyPrice: 120000,
        depositAmount: 1500000,
        description:
          'Micro shotgun cho máy ảnh/điện thoại, lọc gió tốt, pin AA.',
        imageUrl:
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300',
        status: 'AVAILABLE',
      },
      {
        id: 'p-022',
        name: 'Aputure 300d Mark III',
        category: 'Đèn chiếu sáng',
        dailyPrice: 400000,
        depositAmount: 5000000,
        description: 'Đèn LED studio 350W, nhiệt độ màu 5600K, CRI 96+.',
        imageUrl:
          'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=300',
        status: 'RENTED',
      },
      {
        id: 'p-023',
        name: 'Laptop Lenovo ThinkPad X1 Carbon',
        category: 'Máy tính xách tay',
        dailyPrice: 260000,
        depositAmount: 4000000,
        description:
          'ThinkPad X1 Carbon Gen 11, Intel i7 vPro, 16GB, 512GB SSD, siêu nhẹ 1.12kg.',
        imageUrl:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
        status: 'AVAILABLE',
      },
    ],
  },
];
