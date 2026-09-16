import bcrypt from 'bcryptjs';
import { getPostgresClient, getPgliteInstance, getIsUsingPglite, checkDatabaseConnection } from './connection.ts';
import { db } from './db/index.ts';
import {
  usersTable,
  brandsTable,
  productsTable,
  productImagesTable,
  productVariantsTable,
  categoriesTable,
  ordersTable,
  orderItemsTable,
  couponsTable,
  couponUsagesTable,
  cartsTable,
  cartItemsTable,
  paymentTransactionsTable,
  reviewsTable,
} from './db/schema/index.ts';
import { eq } from 'drizzle-orm';

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const SEED_USERS = [
  {
    id: 'usr_admin_default_01',
    email: 'admin@ecommerce.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Quản trị viên Hệ thống',
    role: 'admin',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'usr_customer_demo_02',
    email: 'customer@ecommerce.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    fullName: 'Nguyễn Văn Khách Hàng',
    role: 'customer',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const SEED_BRANDS = [
  {
    id: 'brand_sony',
    name: 'Sony',
    slug: 'sony',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    description: 'Tập đoàn công nghệ âm thanh và hình ảnh hàng đầu Nhật Bản',
    website: 'https://www.sony.com',
    country: 'Nhật Bản',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'brand_apple',
    name: 'Apple',
    slug: 'apple',
    logoUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80',
    description: 'Thương hiệu công nghệ cá nhân cao cấp từ Silicon Valley',
    website: 'https://www.apple.com',
    country: 'Mỹ',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'brand_keychron',
    name: 'Keychron',
    slug: 'keychron',
    logoUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80',
    description: 'Nhà sản xuất bàn phím cơ không dây Custom nổi tiếng thế giới',
    website: 'https://www.keychron.com',
    country: 'Hồng Kông',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'brand_logitech',
    name: 'Logitech',
    slug: 'logitech',
    logoUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=300&q=80',
    description: 'Chuyên gia phụ kiện máy tính, bàn phím và chuột công thái học',
    website: 'https://www.logitech.com',
    country: 'Thụy Sĩ',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'brand_dell',
    name: 'Dell',
    slug: 'dell',
    logoUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80',
    description: 'Tập đoàn sản xuất màn hình đồ họa và máy tính doanh nghiệp',
    website: 'https://www.dell.com',
    country: 'Mỹ',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'brand_bose',
    name: 'Bose',
    slug: 'bose',
    logoUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80',
    description: 'Thương hiệu thiết bị âm thanh và tai nghe cao cấp Hoa Kỳ',
    website: 'https://www.bose.com',
    country: 'Mỹ',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'brand_samsung',
    name: 'Samsung',
    slug: 'samsung',
    logoUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=300&q=80',
    description: 'Tập đoàn công nghệ điện tử hàng đầu Hàn Quốc',
    website: 'https://www.samsung.com',
    country: 'Hàn Quốc',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const SEED_CATEGORIES = [
  // Root categories (Level 1)
  {
    id: 'cat_electronics',
    name: 'Điện tử & Máy tính',
    slug: 'electronics',
    description: 'Thiết bị công nghệ, máy tính và linh kiện cao cấp',
    parentId: null,
    icon: 'laptop',
    level: 1,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_audio',
    name: 'Âm thanh & Tai nghe',
    slug: 'audio',
    description: 'Tai nghe chống ồn, loa không dây và thiết bị âm thanh chuyên nghiệp',
    parentId: null,
    icon: 'headphones',
    level: 1,
    sortOrder: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_wearables',
    name: 'Đồng hồ & Thiết bị đeo',
    slug: 'wearables',
    description: 'Smartwatch và vòng tay theo dõi sức khỏe',
    parentId: null,
    icon: 'watch',
    level: 1,
    sortOrder: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_accessories',
    name: 'Phụ kiện & Gaming Gear',
    slug: 'accessories',
    description: 'Bàn phím cơ, chuột công thái học và phụ kiện bàn làm việc',
    parentId: null,
    icon: 'keyboard',
    level: 1,
    sortOrder: 4,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_displays',
    name: 'Màn hình hiển thị',
    slug: 'displays',
    description: 'Màn hình đồ họa 4K, màn hình gaming tần số quét cao',
    parentId: null,
    icon: 'monitor',
    level: 1,
    sortOrder: 5,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_phones',
    name: 'Điện thoại & Tablet',
    slug: 'phones',
    description: 'Smartphone cao cấp và máy tính bảng thế hệ mới',
    parentId: null,
    icon: 'smartphone',
    level: 1,
    sortOrder: 6,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },

  // Subcategories (Level 2)
  {
    id: 'cat_sub_laptops',
    name: 'Laptop & Macbook',
    slug: 'laptops',
    description: 'Laptop mỏng nhẹ, đồ họa và gaming',
    parentId: 'cat_electronics',
    icon: 'laptop',
    level: 2,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_sub_headphones',
    name: 'Tai nghe Over-ear (Trùm đầu)',
    slug: 'over-ear-headphones',
    description: 'Tai nghe chụp tai chống ồn Hi-Res',
    parentId: 'cat_audio',
    icon: 'headphones',
    level: 2,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_sub_earbuds',
    name: 'Tai nghe True Wireless (Earbuds)',
    slug: 'earbuds',
    description: 'Tai nghe nhét tai không dây tiện lợi',
    parentId: 'cat_audio',
    icon: 'radio',
    level: 2,
    sortOrder: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_sub_keyboards',
    name: 'Bàn phím cơ',
    slug: 'keyboards',
    description: 'Bàn phím cơ Custom, Switch và Keycaps',
    parentId: 'cat_accessories',
    icon: 'keyboard',
    level: 2,
    sortOrder: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cat_sub_mice',
    name: 'Chuột & Lót chuột',
    slug: 'mice',
    description: 'Chuột công thái học và chuột gaming',
    parentId: 'cat_accessories',
    icon: 'mouse',
    level: 2,
    sortOrder: 2,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const SEED_PRODUCTS = [
  {
    id: 'prod_01',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Tai nghe chống ồn chủ động hàng đầu ngành với công nghệ Auto NC Optimizer, thời lượng pin lên đến 30 giờ và âm thanh Hi-Res tuyệt hảo.',
    price: 8490000,
    inventory: 45,
    category: 'Audio',
    categoryId: 'cat_sub_headphones',
    brandId: 'brand_sony',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-10T08:00:00.000Z'),
    updatedAt: new Date('2026-01-10T08:00:00.000Z'),
  },
  {
    id: 'prod_02',
    name: 'Apple Watch Ultra 2 Titanium Case',
    description: 'Đồng hồ thông minh siêu bền bỉ dành cho thể thao mạo hiểm với vỏ titan 49mm, định vị GPS tần số kép chuẩn xác và pin 72 giờ.',
    price: 19990000,
    inventory: 28,
    category: 'Wearables',
    categoryId: 'cat_wearables',
    brandId: 'brand_apple',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-12T09:30:00.000Z'),
    updatedAt: new Date('2026-01-12T09:30:00.000Z'),
  },
  {
    id: 'prod_03',
    name: 'MacBook Air 15-inch M3 Midnight',
    description: 'Thiết kế mỏng nhẹ siêu thực 11.5mm, màn hình Liquid Retina sắc nét, chip Apple M3 hiệu năng vượt trội và thời lượng pin 18 giờ.',
    price: 31990000,
    inventory: 15,
    category: 'Electronics',
    categoryId: 'cat_sub_laptops',
    brandId: 'brand_apple',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-15T10:00:00.000Z'),
    updatedAt: new Date('2026-01-15T10:00:00.000Z'),
  },
  {
    id: 'prod_04',
    name: 'Keychron Q1 Pro Custom Mechanical Keyboard',
    description: 'Bàn phím cơ không dây layout 75%, vỏ nhôm CNC nguyên khối, switch Gateron Jupiter, hỗ trợ QMK/VIA và hot-swappable toàn diện.',
    price: 4890000,
    inventory: 60,
    category: 'Accessories',
    categoryId: 'cat_sub_keyboards',
    brandId: 'brand_keychron',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-18T14:15:00.000Z'),
    updatedAt: new Date('2026-01-18T14:15:00.000Z'),
  },
  {
    id: 'prod_05',
    name: 'Logitech MX Master 3S Ergonomic Mouse',
    description: 'Chuột công thái học cao cấp với con lăn điện từ MagSpeed cuộn 1000 dòng/giây, cảm biến 8000 DPI Quiet Clicks và kết nối 3 thiết bị.',
    price: 2490000,
    inventory: 80,
    category: 'Accessories',
    categoryId: 'cat_sub_mice',
    brandId: 'brand_logitech',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-20T11:00:00.000Z'),
    updatedAt: new Date('2026-01-20T11:00:00.000Z'),
  },
  {
    id: 'prod_06',
    name: 'Dell UltraSharp 27 4K PremierColor Monitor',
    description: 'Màn hình đồ họa chuyên nghiệp 27 inch 4K IPS Black, độ bao phủ 98% DCI-P3, cổng kết nối Thunderbolt 4 cấp nguồn 90W tiện lợi.',
    price: 15990000,
    inventory: 20,
    category: 'Displays',
    categoryId: 'cat_displays',
    brandId: 'brand_dell',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-22T16:45:00.000Z'),
    updatedAt: new Date('2026-01-22T16:45:00.000Z'),
  },
  {
    id: 'prod_07',
    name: 'Bose QuietComfort Ultra Earbuds',
    description: 'Tai nghe True Wireless chống ồn đỉnh cao với công nghệ Âm thanh không gian Bose Immersive Audio và chống nước chuẩn IPX4.',
    price: 7490000,
    inventory: 35,
    category: 'Audio',
    categoryId: 'cat_sub_earbuds',
    brandId: 'brand_bose',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-25T13:20:00.000Z'),
    updatedAt: new Date('2026-01-25T13:20:00.000Z'),
  },
  {
    id: 'prod_08',
    name: 'Samsung Galaxy S24 Ultra Titanium Gray',
    description: 'Flagship đỉnh cao với khung titan, bút S Pen tích hợp, camera 200MP zoom quang 100x và tính năng Galaxy AI thông minh thế hệ mới.',
    price: 29990000,
    inventory: 18,
    category: 'Phones',
    categoryId: 'cat_phones',
    brandId: 'brand_samsung',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-28T07:10:00.000Z'),
    updatedAt: new Date('2026-01-28T07:10:00.000Z'),
  },
];

const SEED_PRODUCT_IMAGES = [
  // Images for prod_01 (Sony WH-1000XM5)
  { id: 'img_p01_01', productId: 'prod_01', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', altText: 'Sony WH-1000XM5 Black Thumbnail', isThumbnail: true, sortOrder: 0 },
  { id: 'img_p01_02', productId: 'prod_01', imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80', altText: 'Sony WH-1000XM5 Side View', isThumbnail: false, sortOrder: 1 },
  { id: 'img_p01_03', productId: 'prod_01', imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', altText: 'Sony WH-1000XM5 In Action', isThumbnail: false, sortOrder: 2 },

  // Images for prod_02 (Apple Watch Ultra 2)
  { id: 'img_p02_01', productId: 'prod_02', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', altText: 'Apple Watch Ultra 2 Front', isThumbnail: true, sortOrder: 0 },
  { id: 'img_p02_02', productId: 'prod_02', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80', altText: 'Apple Watch Ultra 2 Strap', isThumbnail: false, sortOrder: 1 },

  // Images for prod_03 (MacBook Air 15 M3)
  { id: 'img_p03_01', productId: 'prod_03', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', altText: 'MacBook Air 15 M3 Open', isThumbnail: true, sortOrder: 0 },
  { id: 'img_p03_02', productId: 'prod_03', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80', altText: 'MacBook Air 15 M3 Keyboard', isThumbnail: false, sortOrder: 1 },

  // Images for prod_04 (Keychron Q1 Pro)
  { id: 'img_p04_01', productId: 'prod_04', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', altText: 'Keychron Q1 Pro Top View', isThumbnail: true, sortOrder: 0 },
  { id: 'img_p04_02', productId: 'prod_04', imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80', altText: 'Keychron Q1 Pro Side Profile', isThumbnail: false, sortOrder: 1 },

  // Images for prod_05 (Logitech MX Master 3S)
  { id: 'img_p05_01', productId: 'prod_05', imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', altText: 'Logitech MX Master 3S Front', isThumbnail: true, sortOrder: 0 },

  // Images for prod_06 (Dell UltraSharp 27 4K)
  { id: 'img_p06_01', productId: 'prod_06', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', altText: 'Dell UltraSharp 27 4K Front', isThumbnail: true, sortOrder: 0 },

  // Images for prod_07 (Bose QuietComfort Ultra)
  { id: 'img_p07_01', productId: 'prod_07', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', altText: 'Bose QuietComfort Ultra Earbuds Case', isThumbnail: true, sortOrder: 0 },

  // Images for prod_08 (Samsung Galaxy S24 Ultra)
  { id: 'img_p08_01', productId: 'prod_08', imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80', altText: 'Samsung Galaxy S24 Ultra Front', isThumbnail: true, sortOrder: 0 },
];

const SEED_PRODUCT_VARIANTS = [
  // Variants for prod_01 (Sony WH-1000XM5)
  {
    id: 'var_p01_black',
    productId: 'prod_01',
    sku: 'WH1000XM5-BLK',
    name: 'Đen Tuyển (Black)',
    colorName: 'Đen',
    colorCode: '#1A1A1A',
    specSummary: 'NC Auto / 30h Pin',
    price: 8490000,
    originalPrice: 8990000,
    inventory: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    isDefault: true,
  },
  {
    id: 'var_p01_silver',
    productId: 'prod_01',
    sku: 'WH1000XM5-SLV',
    name: 'Bạc Ánh Kim (Silver)',
    colorName: 'Bạc',
    colorCode: '#E5E5E7',
    specSummary: 'NC Auto / 30h Pin',
    price: 8490000,
    originalPrice: 8990000,
    inventory: 20,
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    isDefault: false,
  },

  // Variants for prod_03 (MacBook Air 15 M3)
  {
    id: 'var_p03_16_512_midnight',
    productId: 'prod_03',
    sku: 'MBA15-M3-16-512-MID',
    name: 'Midnight / 16GB RAM / 512GB SSD',
    colorName: 'Xanh Đêm (Midnight)',
    colorCode: '#2E3641',
    specSummary: 'M3 8-Core CPU / 10-Core GPU / 16GB / 512GB',
    price: 31990000,
    originalPrice: 34990000,
    inventory: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    isDefault: true,
  },
  {
    id: 'var_p03_24_1tb_starlight',
    productId: 'prod_03',
    sku: 'MBA15-M3-24-1TB-STL',
    name: 'Starlight / 24GB RAM / 1TB SSD',
    colorName: 'Vàng Ánh Kim (Starlight)',
    colorCode: '#F0E4D3',
    specSummary: 'M3 8-Core CPU / 10-Core GPU / 24GB / 1TB',
    price: 41990000,
    originalPrice: 44990000,
    inventory: 5,
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    isDefault: false,
  },

  // Variants for prod_08 (Samsung Galaxy S24 Ultra)
  {
    id: 'var_p08_256_titan_gray',
    productId: 'prod_08',
    sku: 'S24U-256-GRY',
    name: 'Titanium Gray / 256GB',
    colorName: 'Titan Xám',
    colorCode: '#6B6D72',
    specSummary: '12GB RAM / 256GB / Galaxy AI',
    price: 29990000,
    originalPrice: 33990000,
    inventory: 12,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    isDefault: true,
  },
  {
    id: 'var_p08_512_titan_black',
    productId: 'prod_08',
    sku: 'S24U-512-BLK',
    name: 'Titanium Black / 512GB',
    colorName: 'Titan Đen',
    colorCode: '#2B2C2E',
    specSummary: '12GB RAM / 512GB / Galaxy AI',
    price: 33990000,
    originalPrice: 37990000,
    inventory: 6,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    isDefault: false,
  },
];

const SEED_ORDERS = [
  {
    order: {
      id: 'ORD-2026-8801',
      userId: 'usr_customer_demo_02',
      customerName: 'Nguyễn Văn Khách Hàng',
      customerPhone: '0901234567',
      shippingAddress: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      customerNote: 'Giao hàng trong giờ hành chính giúp mình',
      subtotal: 8490000,
      discountAmount: 849000,
      shippingFee: 0,
      couponCode: 'GIAM10',
      totalAmount: 7641000,
      status: 'delivered',
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    items: [
      {
        id: 'item_demo_01',
        orderId: 'ORD-2026-8801',
        productId: 'prod_01',
        productName: 'Sony WH-1000XM5 Wireless Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        price: 8490000,
        quantity: 1,
        subtotal: 8490000,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    order: {
      id: 'ORD-2026-8802',
      userId: 'usr_customer_demo_02',
      customerName: 'Nguyễn Văn Khách Hàng',
      customerPhone: '0901234567',
      shippingAddress: 'Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      customerNote: 'Gọi điện trước khi giao 15 phút',
      subtotal: 7380000,
      discountAmount: 0,
      shippingFee: 0,
      couponCode: null,
      totalAmount: 7380000,
      status: 'processing',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    items: [
      {
        id: 'item_demo_02',
        orderId: 'ORD-2026-8802',
        productId: 'prod_04',
        productName: 'Keychron Q1 Pro Custom Mechanical Keyboard',
        productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        price: 4890000,
        quantity: 1,
        subtotal: 4890000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'item_demo_03',
        orderId: 'ORD-2026-8802',
        productId: 'prod_05',
        productName: 'Logitech MX Master 3S Ergonomic Mouse',
        productImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        price: 2490000,
        quantity: 1,
        subtotal: 2490000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  },
];

const SEED_COUPONS = [
  {
    id: 'cp_techstore10',
    code: 'TECHSTORE10',
    title: 'Giảm 10% đơn hàng công nghệ',
    description: 'Ưu đãi giảm 10% giá trị đơn hàng, tối đa 500.000đ cho đơn từ 500.000đ',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: 500000,
    minOrderValue: 500000,
    usageLimit: 100,
    usedCount: 0,
    userLimit: 2,
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cp_giam50k',
    code: 'GIAM50K',
    title: 'Giảm ngay 50.000đ',
    description: 'Giảm trực tiếp 50.000đ cho đơn hàng từ 300.000đ',
    discountType: 'fixed_amount',
    discountValue: 50000,
    maxDiscountAmount: 50000,
    minOrderValue: 300000,
    usageLimit: 200,
    usedCount: 0,
    userLimit: 1,
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cp_freeship',
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển 30.000đ',
    description: 'Giảm 30.000đ phí giao hàng cho đơn từ 200.000đ',
    discountType: 'fixed_amount',
    discountValue: 30000,
    maxDiscountAmount: 30000,
    minOrderValue: 200000,
    usageLimit: 500,
    usedCount: 0,
    userLimit: 3,
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'cp_viptech20',
    code: 'VIPTECH20',
    title: 'Voucher Khách Hàng VIP 20%',
    description: 'Giảm 20% cho đơn hàng từ 2.000.000đ, tối đa 1.000.000đ',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 1000000,
    minOrderValue: 2000000,
    usageLimit: 50,
    usedCount: 0,
    userLimit: 1,
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T23:59:59.000Z'),
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const SEED_REVIEWS = [
  {
    id: 'rev_demo_01',
    userId: 'usr_customer_demo_02',
    productId: 'prod_01',
    orderId: 'ORD-2026-9901',
    rating: 5,
    title: 'Chống ồn đỉnh cao, âm thanh xuất sắc!',
    comment: 'Tai nghe Sony WH-1000XM5 khử ồn siêu tốt khi đi máy bay và làm việc văn phòng. Đệm tai êm ái, pin trâu dùng cả tuần chưa hết.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
    isVerifiedBuyer: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'rev_demo_02',
    userId: 'usr_customer_demo_02',
    productId: 'prod_04',
    orderId: 'ORD-2026-8802',
    rating: 5,
    title: 'Bàn phím cơ hoàn thiện nhôm CNC quá đầm tay',
    comment: 'Keychron Q1 Pro gõ rất êm, switch được lube sẵn mượt mà. Kết nối Bluetooth nhanh chóng với cả Mac và Windows.',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'],
    isVerifiedBuyer: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

async function runExecDDL(ddlQuery: string): Promise<void> {
  if (getIsUsingPglite()) {
    await getPgliteInstance().exec(ddlQuery);
  } else {
    await getPostgresClient().unsafe(ddlQuery);
  }
}

export async function initializeDatabase(): Promise<boolean> {
  const isAvailable = await checkDatabaseConnection();
  if (!isAvailable.connected) {
    console.warn(`[DB Init] Could not connect to database: ${isAvailable.message}`);
    return false;
  }

  try {
    // 1. Create tables if not exist using DDL
    await runExecDDL(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brands (
        id TEXT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        logo_url TEXT,
        description TEXT,
        website VARCHAR(255),
        country VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        icon VARCHAR(100) DEFAULT 'folder',
        level INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        inventory INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(100) NOT NULL,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
        image_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_thumbnail BOOLEAN NOT NULL DEFAULT false,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        color_name VARCHAR(50),
        color_code VARCHAR(20),
        spec_summary VARCHAR(255),
        price INTEGER NOT NULL,
        original_price INTEGER,
        inventory INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        customer_note TEXT,
        subtotal INTEGER NOT NULL,
        discount_amount INTEGER NOT NULL DEFAULT 0,
        shipping_fee INTEGER NOT NULL DEFAULT 0,
        coupon_code VARCHAR(50),
        total_amount INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        product_id TEXT REFERENCES products(id) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image TEXT,
        price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS carts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        is_selected BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(50) NOT NULL,
        discount_value INTEGER NOT NULL,
        max_discount_amount INTEGER,
        min_order_value INTEGER NOT NULL DEFAULT 0,
        usage_limit INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        user_limit INTEGER NOT NULL DEFAULT 1,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupon_usages (
        id TEXT PRIMARY KEY,
        coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        discount_applied INTEGER NOT NULL,
        used_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payment_transactions (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        transaction_code VARCHAR(100) NOT NULL UNIQUE,
        provider VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'VND',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        gateway_transaction_no VARCHAR(255),
        raw_payload JSONB,
        paid_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
        rating INTEGER NOT NULL,
        title VARCHAR(255),
        comment TEXT NOT NULL,
        images JSONB,
        is_verified_buyer BOOLEAN NOT NULL DEFAULT false,
        status VARCHAR(50) NOT NULL DEFAULT 'approved',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Ensure brand_id column exists if products table already existed
      ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL;
    `);

    // 2. Seed Brands if not present
    for (const brand of SEED_BRANDS) {
      const existing = await db
        .select()
        .from(brandsTable)
        .where(eq(brandsTable.id, brand.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(brandsTable).values(brand);
      }
    }

    // 3. Seed Categories if not present
    for (const cat of SEED_CATEGORIES) {
      const existing = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, cat.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(categoriesTable).values(cat);
      }
    }

    // 4. Seed Users if not present
    for (const user of SEED_USERS) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(usersTable).values(user);
      }
    }

    // 5. Seed Products if not present
    for (const prod of SEED_PRODUCTS) {
      const existing = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, prod.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(productsTable).values(prod);
      } else {
        await db
          .update(productsTable)
          .set({ price: prod.price, categoryId: prod.categoryId, brandId: prod.brandId })
          .where(eq(productsTable.id, prod.id));
      }
    }

    // 6. Seed Product Images if not present
    for (const img of SEED_PRODUCT_IMAGES) {
      const existing = await db
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.id, img.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(productImagesTable).values(img);
      }
    }

    // 7. Seed Product Variants if not present
    for (const variant of SEED_PRODUCT_VARIANTS) {
      const existing = await db
        .select()
        .from(productVariantsTable)
        .where(eq(productVariantsTable.id, variant.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(productVariantsTable).values(variant);
      }
    }

    // 8. Seed Demo Orders for customer account if not present
    for (const { order, items } of SEED_ORDERS) {
      const existing = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.id, order.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(ordersTable).values(order);
        for (const item of items) {
          await db.insert(orderItemsTable).values(item);
        }
      }
    }

    // 9. Seed Coupons if not present
    for (const coupon of SEED_COUPONS) {
      const existing = await db
        .select()
        .from(couponsTable)
        .where(eq(couponsTable.id, coupon.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(couponsTable).values(coupon);
      }
    }

    // 10. Seed Reviews if not present
    for (const review of SEED_REVIEWS) {
      const existing = await db
        .select()
        .from(reviewsTable)
        .where(eq(reviewsTable.id, review.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(reviewsTable).values(review);
      }
    }

    console.log('[DB Init] Database schema (carts, coupons, payments, reviews, brands, product_images, product_variants) & seed data initialized successfully.');
    return true;
  } catch (error) {
    console.error('[DB Init] Error initializing database tables/seeds:', error);
    return false;
  }
}


