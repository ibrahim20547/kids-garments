import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kids_garments.db')

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'customer', -- 'customer' or 'admin'
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        gender TEXT, -- 'Boys', 'Girls', 'Baby', 'Unisex'
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS master_sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        age_group TEXT,
        sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS master_colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        hex_code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        category_id INTEGER,
        gender TEXT NOT NULL, -- 'Boys', 'Girls', 'Baby', 'Unisex'
        age_group TEXT NOT NULL, -- '0-6M', '6-12M', '1-2Y', '2-4Y', '5-7Y', '8-12Y', '13-16Y'
        description TEXT NOT NULL,
        fabric_care TEXT,
        price REAL NOT NULL, -- in PKR
        sale_price REAL, -- in PKR
        on_sale BOOLEAN DEFAULT 0,
        is_new BOOLEAN DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
        stock_quantity INTEGER DEFAULT 50,
        low_stock_threshold INTEGER DEFAULT 5,
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        main_image TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size_name TEXT NOT NULL,
        stock INTEGER DEFAULT 20,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        color_name TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        size_name TEXT NOT NULL,
        color_name TEXT NOT NULL,
        sku TEXT,
        stock INTEGER DEFAULT 10,
        price_adjustment REAL DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(product_id, size_name, color_name)
    );

    CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        province TEXT NOT NULL,
        city TEXT NOT NULL,
        area TEXT,
        street TEXT NOT NULL,
        apartment TEXT,
        postal_code TEXT NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        shipping_province TEXT DEFAULT 'Punjab',
        shipping_city TEXT NOT NULL,
        shipping_area TEXT,
        shipping_address TEXT NOT NULL,
        shipping_apartment TEXT,
        shipping_postal TEXT NOT NULL,
        shipping_method TEXT DEFAULT 'Standard Delivery',
        payment_method TEXT NOT NULL, -- 'Cash on Delivery', 'EasyPaisa', 'JazzCash', 'Bank Transfer', 'Credit/Debit Card'
        payment_status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Refunded'
        subtotal REAL NOT NULL, -- in PKR
        discount_amount REAL DEFAULT 0,
        shipping_fee REAL DEFAULT 0,
        tax_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL, -- in PKR
        coupon_code TEXT,
        order_status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'
        tracking_carrier TEXT DEFAULT 'TCS Courier', -- 'TCS Courier', 'Leopards Express', 'Trax Logistics', 'M&P Express'
        tracking_number TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        product_image TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        unit_price REAL NOT NULL, -- in PKR
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL, -- in PKR
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_tracking_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER,
        reviewer_name TEXT NOT NULL,
        reviewer_email TEXT,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        title TEXT,
        comment TEXT NOT NULL,
        status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
        is_verified BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL, -- 'percentage', 'fixed', 'shipping'
        discount_value REAL NOT NULL, -- percentage or PKR
        min_order_amount REAL DEFAULT 0, -- in PKR
        max_discount_amount REAL, -- in PKR (optional cap for percentage)
        usage_limit INTEGER DEFAULT 1000,
        times_used INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS returns_exchanges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_number TEXT UNIQUE NOT NULL,
        order_id INTEGER NOT NULL,
        order_number TEXT NOT NULL,
        user_id INTEGER,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        request_type TEXT NOT NULL, -- 'return' or 'exchange'
        product_id INTEGER,
        product_name TEXT NOT NULL,
        size TEXT,
        color TEXT,
        reason TEXT NOT NULL, -- 'Wrong Size', 'Defective/Damaged', 'Not as Described', 'Changed Mind', 'Other'
        customer_notes TEXT,
        admin_notes TEXT,
        status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Completed'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread', -- 'unread', 'read', 'replied'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        email TEXT NOT NULL,
        size TEXT,
        color TEXT,
        status TEXT DEFAULT 'pending', -- 'pending', 'notified'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully at:", DB_PATH)
