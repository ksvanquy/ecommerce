import bcrypt from 'bcryptjs';
import { getPostgresClient, getPgliteInstance, getIsUsingPglite, checkDatabaseConnection } from './connection.ts';
import { db } from './db/index.ts';
import {
  usersTable,
  productsTable,
  categoriesTable,
  ordersTable,
  orderItemsTable,
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
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-28T07:10:00.000Z'),
    updatedAt: new Date('2026-01-28T07:10:00.000Z'),
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
        image_url TEXT,
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
    `);

    // 2. Seed Categories if not present
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

    // 3. Seed Users if not present
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

    // 4. Seed Products if not present
    for (const prod of SEED_PRODUCTS) {
      const existing = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, prod.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(productsTable).values(prod);
      } else {
        // Update product price & categoryId if needed to keep VNĐ aligned
        await db
          .update(productsTable)
          .set({ price: prod.price, categoryId: prod.categoryId })
          .where(eq(productsTable.id, prod.id));
      }
    }

    // 5. Seed Demo Orders for customer account if not present
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

    console.log('[DB Init] Database, categories hierarchy, and initial trust seeds initialized successfully.');
    return true;
  } catch (error) {
    console.error('[DB Init] Error initializing database tables/seeds:', error);
    return false;
  }
}

