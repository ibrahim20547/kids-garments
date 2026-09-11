import sqlite3
import os
import random
from werkzeug.security import generate_password_hash
from database import get_db, init_db

def seed_database():
    init_db()
    conn = get_db()
    cursor = conn.cursor()

    # Clear existing data
    cursor.executescript('''
    DELETE FROM newsletter_subscribers;
    DELETE FROM contact_messages;
    DELETE FROM site_settings;
    DELETE FROM returns_exchanges;
    DELETE FROM coupons;
    DELETE FROM wishlist;
    DELETE FROM reviews;
    DELETE FROM order_tracking_events;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM addresses;
    DELETE FROM product_variants;
    DELETE FROM product_colors;
    DELETE FROM product_sizes;
    DELETE FROM product_images;
    DELETE FROM master_colors;
    DELETE FROM master_sizes;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM users;
    ''')

    # 1. Master Sizes & Master Colors
    master_sizes = [
        ('0-3M', 'Baby', 1),
        ('3-6M', 'Baby', 2),
        ('6-12M', 'Baby', 3),
        ('12-18M', 'Baby', 4),
        ('1-2Y', 'Toddler', 5),
        ('2-3Y', 'Toddler', 6),
        ('3-4Y', 'Kids', 7),
        ('4-5Y', 'Kids', 8),
        ('5-6Y', 'Kids', 9),
        ('7-8Y', 'Kids', 10),
        ('9-10Y', 'Pre-Teen', 11),
        ('11-12Y', 'Teen', 12),
        ('13-14Y', 'Teen', 13)
    ]
    for name, age, sort_order in master_sizes:
        cursor.execute('INSERT INTO master_sizes (name, age_group, sort_order) VALUES (?, ?, ?)', (name, age, sort_order))

    master_colors = [
        ('Navy Blue', '#1E3A8A'),
        ('Dusty Rose', '#E0A899'),
        ('Sage Green', '#84A98C'),
        ('Mustard Yellow', '#E3A857'),
        ('Sky Blue', '#7DD3FC'),
        ('Blush Pink', '#F472B6'),
        ('Coral Red', '#F87171'),
        ('Lavender Purple', '#C084FC'),
        ('Olive Green', '#4D7C0F'),
        ('Cream White', '#FFFBEB'),
        ('Charcoal Gray', '#334155'),
        ('Teal Green', '#0D9488'),
        ('Golden Yellow', '#F59E0B'),
        ('Beige Sand', '#D4C9B8')
    ]
    for name, hex_code in master_colors:
        cursor.execute('INSERT INTO master_colors (name, hex_code) VALUES (?, ?)', (name, hex_code))

    # 2. Demo Users
    customer_pw = generate_password_hash('password123')
    admin_pw = generate_password_hash('AdminPassword123!')

    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (?, ?, ?, ?, ?)
    ''', ('ayesha.khan@example.com', customer_pw, 'Ayesha Khan', '+92 300 8456789', 'customer'))
    user1_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (?, ?, ?, ?, ?)
    ''', ('parent@example.com', customer_pw, 'Sarah Jenkins', '+92 321 4567890', 'customer'))
    user2_id = cursor.lastrowid

    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (?, ?, ?, ?, ?)
    ''', ('admin@kidsgarments.pk', admin_pw, 'Head Administrator', '+92 300 1234567', 'admin'))

    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (?, ?, ?, ?, ?)
    ''', ('admin@kidsgarments.com', admin_pw, 'Store Admin', '+92 300 7654321', 'admin'))

    # Addresses
    cursor.execute('''
        INSERT INTO addresses (user_id, full_name, phone, province, city, area, street, apartment, postal_code, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user1_id, 'Ayesha Khan', '+92 300 8456789', 'Punjab', 'Lahore', 'Gulberg III', 'House 42, Block L, Near Mini Market', 'Flat 2B', '54000', 1))

    # 3. Categories with verified Kids Garments imagery
    categories = [
        ('Boys Clothing', 'boys-clothing', 'Stylish shirts, tees, jeans, jackets, and everyday cotton outfits for active boys.', '/images/boys-stylish-fashion.jpg', 'Boys', 1),
        ('Girls Clothing', 'girls-clothing', 'Graceful dresses, frocks, peplum tops, skirts, and festive outfits for girls.', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80', 'Girls', 2),
        ('Baby & Toddler', 'baby-toddler', 'Ultra-soft 100% organic cotton rompers, baby layette sets, onesies, and toddler dungarees.', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80', 'Baby', 3),
        ('Eastern & Festive Wear', 'eastern-festive', 'Royal kids kurtas, shalwar kameez, mirror-work ghararas, and Eid festive wear.', 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop&q=80', 'Unisex', 4),
        ('Sleepwear & Pajamas', 'sleepwear-pajamas', 'Cozy, skin-friendly 100% organic cotton bedtime nightwear and loungewear sets.', 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80', 'Unisex', 5),
        ('Jackets & Outerwear', 'jackets-outerwear', 'Warm winter fleece hoodies, insulated puffer jackets, and windbreakers for kids.', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80', 'Unisex', 6)
    ]

    cat_map = {}
    for name, slug, desc, img, gender, sort_order in categories:
        cursor.execute('''
            INSERT INTO categories (name, slug, description, image_url, gender, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ''', (name, slug, desc, img, gender, sort_order))
        cat_map[slug] = cursor.lastrowid

    # 4. Coupons
    coupons = [
        ('KIDS10', 'percentage', 10.0, 2000.0, 500.0, 1000, 14, '10% discount on orders above ₨ 2,000 (Max ₨ 500)'),
        ('FIRSTBUY', 'percentage', 15.0, 1500.0, 750.0, 1000, 32, '15% welcome discount on your first order'),
        ('FREESHIP', 'shipping', 0.0, 2500.0, None, 500, 48, 'Free Delivery on orders above ₨ 2,500 across Pakistan'),
        ('EID500', 'fixed', 500.0, 3500.0, None, 500, 6, 'Flat ₨ 500 OFF on orders above ₨ 3,500')
    ]
    for code, dtype, val, min_amt, max_disc, limit, used, desc in coupons:
        cursor.execute('''
            INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, times_used, is_active, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        ''', (code, dtype, val, min_amt, max_disc, limit, used, desc))

    # 5. Site Settings
    site_settings = [
        ('whatsapp_number', '+923001234567', 'Primary Pakistan WhatsApp customer support contact'),
        ('whatsapp_welcome_message', 'Hello Kids Garments! I would like to inquire about children clothing and sizes.', 'Default pre-filled WhatsApp message'),
        ('announcement_text', '🚚 FREE Nationwide Delivery across Pakistan on orders above ₨ 3,000 | Use code KIDS10 for 10% OFF', 'Top announcement bar banner text'),
        ('hero_title', 'Style Made for Little Ones', 'Homepage Hero Section Main Heading'),
        ('hero_subtitle', 'Discover comfortable, stylish and adorable clothing for boys and girls.', 'Homepage Hero Section Subtitle'),
        ('hero_image', '/images/boys-stylish-fashion.jpg', 'Hero banner primary image'),
        ('free_shipping_threshold', '3000', 'Order amount in PKR for Free Nationwide Shipping'),
        ('standard_shipping_fee', '250', 'Standard Delivery charges in PKR (2-3 days)'),
        ('express_shipping_fee', '450', 'Express 24-Hour Courier charges in PKR'),
        ('store_email', 'support@kidsgarments.pk', 'Store public support email'),
        ('store_phone', '+92 (042) 3578-9000', 'Store customer helpline number'),
        ('store_address', 'Plot 45-B, Sector C, Commercial Area, DHA Phase 5, Lahore, Pakistan', 'Store address')
    ]
    for k, v, desc in site_settings:
        cursor.execute('INSERT INTO site_settings (key, value, description) VALUES (?, ?, ?)', (k, v, desc))

    # 6. Catalog Products with verified, realistic Kids Garments photography & PKR Pricing
    raw_products = [
        # --- BOYS COLLECTION ---
        {
            'name': 'Boys Color-Blocked Varsity Bomber Jacket & Chino Set',
            'slug': 'boys-varsity-bomber-jacket-chino-set',
            'sku': 'KG-BOY-001',
            'cat_slug': 'boys-clothing',
            'gender': 'Boys',
            'age_group': '4-7Y',
            'description': 'Smart tri-color varsity bomber jacket paired with a soft combed cotton tee and stretch chino trousers for active boys.',
            'fabric_care': '100% Combed Cotton Tee with Cotton-Twill Chinos. Machine wash warm.',
            'price': 3450.0,
            'sale_price': 2850.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'stock_quantity': 45,
            'low_stock_threshold': 8,
            'rating': 4.9,
            'reviews_count': 18,
            'main_image': '/images/boys-stylish-fashion.jpg',
            'images': [
                '/images/boys-stylish-fashion.jpg',
                'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('3-4Y', 15), ('4-5Y', 18), ('5-6Y', 12)],
            'colors': [('Sage Green', '#84A98C'), ('Navy Blue', '#1E3A8A'), ('Mustard Yellow', '#E3A857')]
        },
        {
            'name': 'Boys Active Stretch Comfort Chino Joggers',
            'slug': 'active-stretch-chino-joggers',
            'sku': 'KG-BOY-002',
            'cat_slug': 'boys-clothing',
            'gender': 'Boys',
            'age_group': '5-8Y',
            'description': 'Durable cotton-twill stretch joggers featuring an elastic waistband, reinforced knee patches, and ribbed cuffs.',
            'fabric_care': '98% Cotton, 2% Elastane. Machine wash inside out.',
            'price': 2450.0,
            'sale_price': None,
            'on_sale': 0,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.8,
            'reviews_count': 14,
            'main_image': 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('5-6Y', 12), ('7-8Y', 20)],
            'colors': [('Charcoal Gray', '#334155'), ('Olive Green', '#4D7C0F'), ('Navy Blue', '#1E3A8A')]
        },
        {
            'name': 'Boys Classic Plaid Flannel Button-Down Shirt',
            'slug': 'classic-plaid-flannel-shirt',
            'sku': 'KG-BOY-003',
            'cat_slug': 'boys-clothing',
            'gender': 'Boys',
            'age_group': '6-12Y',
            'description': 'Timeless button-down shirt crafted from brushed yarn-dyed cotton flannel. Features a chest pocket and curved hem.',
            'fabric_care': '100% Brushed Cotton Flannel. Machine wash warm.',
            'price': 2850.0,
            'sale_price': 2250.0,
            'on_sale': 1,
            'is_new': 0,
            'is_featured': 1,
            'rating': 5.0,
            'reviews_count': 22,
            'main_image': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('7-8Y', 8), ('9-10Y', 10)],
            'colors': [('Navy Blue', '#1E3A8A'), ('Coral Red', '#F87171')]
        },
        {
            'name': 'Boys Safari Explorer Cotton Polo & Cargo Shorts Set',
            'slug': 'safari-explorer-shorts-polo-set',
            'sku': 'KG-BOY-004',
            'cat_slug': 'boys-clothing',
            'gender': 'Boys',
            'age_group': '2-5Y',
            'description': 'Smart 2-piece summer set featuring a breathable cotton pique polo shirt paired with multi-pocket cargo shorts.',
            'fabric_care': '100% Breathable Cotton. Machine wash cold.',
            'price': 3450.0,
            'sale_price': 2950.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 0,
            'rating': 4.7,
            'reviews_count': 9,
            'main_image': 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('2-3Y', 7), ('3-4Y', 8), ('4-5Y', 10)],
            'colors': [('Sage Green', '#84A98C'), ('Mustard Yellow', '#E3A857')]
        },
        {
            'name': 'Boys Smart School Uniform Polo & Trousers',
            'slug': 'kids-smart-school-uniform-set',
            'sku': 'KG-BOY-005',
            'cat_slug': 'boys-clothing',
            'gender': 'Boys',
            'age_group': '5-10Y',
            'description': 'Crisp wrinkle-resistant cotton school uniform polo shirt with reinforced collar and durable navy pleated trousers.',
            'fabric_care': 'Cotton blend. Machine wash and light iron.',
            'price': 2650.0,
            'sale_price': None,
            'on_sale': 0,
            'is_new': 0,
            'is_featured': 0,
            'rating': 4.8,
            'reviews_count': 16,
            'main_image': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('5-6Y', 20), ('7-8Y', 20), ('9-10Y', 15)],
            'colors': [('Navy Blue', '#1E3A8A'), ('Cream White', '#FFFBEB')]
        },
        {
            'name': 'Boys Urban Cool Graphic Cotton Tee & Denim Jeans',
            'slug': 'boys-urban-graphic-tee-jeans',
            'sku': 'KG-BOY-006',
            'cat_slug': 'boys-clothing',
            'gender': 'Boys',
            'age_group': '4-10Y',
            'description': 'Everyday favorite casual outfit with a breathable screen-printed cotton graphic T-shirt and comfortable flex denim jeans.',
            'fabric_care': '100% Organic Cotton Tee, 99% Cotton Denim.',
            'price': 2950.0,
            'sale_price': 2350.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.9,
            'reviews_count': 12,
            'main_image': 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('4-5Y', 12), ('6-7Y', 15), ('8-9Y', 10)],
            'colors': [('Navy Blue', '#1E3A8A'), ('Charcoal Gray', '#334155')]
        },

        # --- GIRLS COLLECTION ---
        {
            'name': 'Girls Floral Garden Embroidered Cotton Tiered Dress',
            'slug': 'floral-garden-cotton-tiered-dress',
            'sku': 'KG-GIRL-001',
            'cat_slug': 'girls-clothing',
            'gender': 'Girls',
            'age_group': '2-6Y',
            'description': 'Graceful tiered dress featuring delicate floral embroidery, flutter cap sleeves, and a sweet back bow closure.',
            'fabric_care': '100% Organic Lawn Cotton. Gentle machine wash.',
            'price': 3250.0,
            'sale_price': 2650.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 5.0,
            'reviews_count': 26,
            'main_image': 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('2-3Y', 10), ('3-4Y', 12), ('4-5Y', 8)],
            'colors': [('Dusty Rose', '#E0A899'), ('Blush Pink', '#F472B6'), ('Cream White', '#FFFBEB')]
        },
        {
            'name': 'Girls Whimsical Butterfly Embroidered Peplum Top',
            'slug': 'whimsical-butterfly-peplum-top',
            'sku': 'KG-GIRL-002',
            'cat_slug': 'girls-clothing',
            'gender': 'Girls',
            'age_group': '4-8Y',
            'description': 'Bright and breezy cotton peplum top with hand-stitched butterfly motifs, ruffled hemline, and coconut buttons.',
            'fabric_care': '100% Breathable Cotton. Hand wash or gentle cycle.',
            'price': 1950.0,
            'sale_price': None,
            'on_sale': 0,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.8,
            'reviews_count': 11,
            'main_image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('4-5Y', 15), ('5-6Y', 15), ('7-8Y', 10)],
            'colors': [('Lavender Purple', '#C084FC'), ('Sky Blue', '#7DD3FC'), ('Dusty Rose', '#E0A899')]
        },
        {
            'name': 'Girls Pastel Rainbow Twirl Skirt & Leggings Set',
            'slug': 'pastel-rainbow-twirl-skirt-set',
            'sku': 'KG-GIRL-003',
            'cat_slug': 'girls-clothing',
            'gender': 'Girls',
            'age_group': '2-5Y',
            'description': 'Voluminous soft tulle outer skirt paired with soft built-in cotton leggings for carefree spinning and playing.',
            'fabric_care': 'Cotton blend with soft nylon tulle. Wash gentle cold.',
            'price': 2750.0,
            'sale_price': 2150.0,
            'on_sale': 1,
            'is_new': 0,
            'is_featured': 0,
            'rating': 4.9,
            'reviews_count': 15,
            'main_image': 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('2-3Y', 8), ('3-4Y', 8), ('4-5Y', 10)],
            'colors': [('Blush Pink', '#F472B6'), ('Lavender Purple', '#C084FC')]
        },
        {
            'name': 'Girls Summer Blossom Cotton Lawn Sundress',
            'slug': 'summer-blossom-cotton-sundress',
            'sku': 'KG-GIRL-004',
            'cat_slug': 'girls-clothing',
            'gender': 'Girls',
            'age_group': '2-5Y',
            'description': 'Lightweight Pakistani lawn cotton sundress with sunny yellow floral prints and adjustable shoulder ties.',
            'fabric_care': '100% Lawn Cotton. Cold machine wash.',
            'price': 2350.0,
            'sale_price': 1850.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.9,
            'reviews_count': 19,
            'main_image': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('2-3Y', 10), ('3-4Y', 15), ('4-5Y', 8)],
            'colors': [('Mustard Yellow', '#E3A857'), ('Dusty Rose', '#E0A899')]
        },
        {
            'name': 'Girls Traditional Embroidered Lawn Kurti',
            'slug': 'girls-traditional-embroidered-kurti',
            'sku': 'KG-GIRL-005',
            'cat_slug': 'girls-clothing',
            'gender': 'Girls',
            'age_group': '4-8Y',
            'description': 'Traditional Pakistani cotton lawn kurti with neckline thread embroidery, hanging side tassels, and bell sleeves.',
            'fabric_care': '100% Lawn Cotton. Gentle wash.',
            'price': 2950.0,
            'sale_price': 2450.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 0,
            'rating': 4.8,
            'reviews_count': 14,
            'main_image': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('4-5Y', 10), ('5-6Y', 10), ('7-8Y', 8)],
            'colors': [('Teal Green', '#0D9488'), ('Blush Pink', '#F472B6')]
        },
        {
            'name': 'Girls Denim Dungaree Overalls & Floral Tee Set',
            'slug': 'girls-denim-dungaree-set',
            'sku': 'KG-GIRL-006',
            'cat_slug': 'girls-clothing',
            'gender': 'Girls',
            'age_group': '3-7Y',
            'description': 'Adorable lightweight soft-washed denim dungarees with adjustable button buckles paired with a pure cotton floral tee.',
            'fabric_care': '100% Cotton. Gentle machine wash.',
            'price': 3650.0,
            'sale_price': 3150.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 5.0,
            'reviews_count': 17,
            'main_image': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('3-4Y', 10), ('5-6Y', 12)],
            'colors': [('Sky Blue', '#7DD3FC'), ('Navy Blue', '#1E3A8A')]
        },

        # --- BABY & TODDLER COLLECTION ---
        {
            'name': 'Baby Pure Organic Cotton Newborn 2-Way Zip Romper',
            'slug': 'pure-organic-cotton-newborn-romper',
            'sku': 'KG-BABY-001',
            'cat_slug': 'baby-toddler',
            'gender': 'Baby',
            'age_group': '0-12M',
            'description': 'Designed for easy diaper changes with a 2-way safety zipper and protective neck tab. Fold-over scratch mittens keep baby snug.',
            'fabric_care': '100% GOTS Certified Organic Cotton. Baby-safe wash.',
            'price': 1650.0,
            'sale_price': 1350.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 5.0,
            'reviews_count': 31,
            'main_image': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('0-3M', 20), ('3-6M', 20), ('6-12M', 10)],
            'colors': [('Cream White', '#FFFBEB'), ('Sage Green', '#84A98C'), ('Dusty Rose', '#E0A899')]
        },
        {
            'name': 'Baby Cozy Knit Cardigan & Bonnet Heirloom Set',
            'slug': 'cozy-knit-cardigan-bonnet-set',
            'sku': 'KG-BABY-002',
            'cat_slug': 'baby-toddler',
            'gender': 'Baby',
            'age_group': '3-18M',
            'description': 'Hand-knit style chunky soft cotton sweater paired with a matching bonnet and wooden button detailing. Ideal baby shower gift.',
            'fabric_care': '100% Breathable Cotton Knit. Lay flat to dry.',
            'price': 2950.0,
            'sale_price': None,
            'on_sale': 0,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.9,
            'reviews_count': 20,
            'main_image': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('3-6M', 10), ('6-12M', 12), ('12-18M', 8)],
            'colors': [('Cream White', '#FFFBEB'), ('Mustard Yellow', '#E3A857'), ('Sky Blue', '#7DD3FC')]
        },
        {
            'name': 'Baby 5-Piece Organic Cotton Welcome Layette Set',
            'slug': 'newborn-5-piece-layette-set',
            'sku': 'KG-BABY-003',
            'cat_slug': 'baby-toddler',
            'gender': 'Baby',
            'age_group': '0-6M',
            'description': 'Complete starter set including wrap kimono top, footed pant, scratch mittens, soft knot beanie, and double-layer bib.',
            'fabric_care': '100% Organic Cotton. Hypoallergenic.',
            'price': 3850.0,
            'sale_price': 3250.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 0,
            'rating': 4.9,
            'reviews_count': 18,
            'main_image': 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('0-3M', 10), ('3-6M', 8)],
            'colors': [('Cream White', '#FFFBEB'), ('Dusty Rose', '#E0A899'), ('Sage Green', '#84A98C')]
        },
        {
            'name': 'Toddler Playtime Cotton Dungaree & Tee Outfit',
            'slug': 'toddler-playtime-dungaree-tee-outfit',
            'sku': 'KG-BABY-004',
            'cat_slug': 'baby-toddler',
            'gender': 'Baby',
            'age_group': '1-3Y',
            'description': 'Super comfortable breathable cotton overalls with easy snap inseam buttons and an ultra-soft striped undershirt.',
            'fabric_care': '100% Cotton. Gentle wash.',
            'price': 2850.0,
            'sale_price': 2350.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.8,
            'reviews_count': 15,
            'main_image': 'https://images.unsplash.com/photo-1560088284-1386d6910a3c?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1560088284-1386d6910a3c?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('1-2Y', 10), ('2-3Y', 12)],
            'colors': [('Sage Green', '#84A98C'), ('Navy Blue', '#1E3A8A')]
        },

        # --- EASTERN & FESTIVE ---
        {
            'name': 'Kids Royal Embroidered Kurta & Shalwar Set',
            'slug': 'kids-royal-embroidered-kurta-shalwar',
            'sku': 'KG-FEST-001',
            'cat_slug': 'eastern-festive',
            'gender': 'Boys',
            'age_group': '3-8Y',
            'description': 'Elevate Eid & family celebrations with luxury soft cotton kurta featuring subtle collar embroidery and matching shalwar.',
            'fabric_care': 'Premium Soft Cotton. Dry clean or gentle hand wash.',
            'price': 3950.0,
            'sale_price': 3450.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 5.0,
            'reviews_count': 24,
            'main_image': 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('3-4Y', 10), ('5-6Y', 15), ('7-8Y', 10)],
            'colors': [('Navy Blue', '#1E3A8A'), ('Cream White', '#FFFBEB'), ('Teal Green', '#0D9488')]
        },
        {
            'name': 'Festive Mirror-Work Chiffon Gharara Set for Girls',
            'slug': 'festive-mirror-work-gharara-set',
            'sku': 'KG-FEST-002',
            'cat_slug': 'eastern-festive',
            'gender': 'Girls',
            'age_group': '4-8Y',
            'description': 'Traditional festive 3-piece gharara set crafted with shimmering foil mirror-work, delicate gold lace borders, and matching dupatta.',
            'fabric_care': 'Chiffon with soft lawn lining. Dry clean recommended.',
            'price': 4850.0,
            'sale_price': 4150.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 5.0,
            'reviews_count': 28,
            'main_image': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('4-5Y', 5), ('5-6Y', 5), ('7-8Y', 5)],
            'colors': [('Dusty Rose', '#E0A899'), ('Mustard Yellow', '#E3A857'), ('Teal Green', '#0D9488')]
        },

        # --- SLEEPWEAR ---
        {
            'name': 'Kids Starlight Constellation Organic Cotton Pajama Set',
            'slug': 'starlight-constellation-cotton-pajama-set',
            'sku': 'KG-SLEEP-001',
            'cat_slug': 'sleepwear-pajamas',
            'gender': 'Unisex',
            'age_group': '2-6Y',
            'description': 'Snug-fitting 2-piece pajama set crafted with buttery soft ribbed organic cotton. Features smooth tagless neck labels for itch-free sleep.',
            'fabric_care': '100% Organic Rib-Knit Cotton. Machine wash cold inside out.',
            'price': 2250.0,
            'sale_price': 1750.0,
            'on_sale': 1,
            'is_new': 0,
            'is_featured': 1,
            'rating': 4.9,
            'reviews_count': 19,
            'main_image': 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('2-3Y', 15), ('3-4Y', 15), ('4-5Y', 15)],
            'colors': [('Navy Blue', '#1E3A8A'), ('Sage Green', '#84A98C'), ('Dusty Rose', '#E0A899')]
        },

        # --- JACKETS & OUTERWEAR ---
        {
            'name': 'Kids Sherpa Lined Mountain Explorer Puffer Jacket',
            'slug': 'sherpa-lined-mountain-puffer-jacket',
            'sku': 'KG-OUT-001',
            'cat_slug': 'jackets-outerwear',
            'gender': 'Unisex',
            'age_group': '4-9Y',
            'description': 'Water-resistant outer shell packed with thermal insulation and cozy fleece lining in the hood. Includes deep fleece hand-warmer pockets.',
            'fabric_care': '100% Recycled Polyester Shell & Lining. Machine wash cold gentle.',
            'price': 4650.0,
            'sale_price': 3850.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 1,
            'rating': 4.9,
            'reviews_count': 21,
            'main_image': 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('4-5Y', 8), ('5-6Y', 9), ('7-8Y', 8)],
            'colors': [('Mustard Yellow', '#E3A857'), ('Navy Blue', '#1E3A8A'), ('Olive Green', '#4D7C0F')]
        },
        {
            'name': 'Kids Cozy Autumn Cardigan Sweater Coat',
            'slug': 'kids-cozy-autumn-cardigan-coat',
            'sku': 'KG-OUT-002',
            'cat_slug': 'jackets-outerwear',
            'gender': 'Girls',
            'age_group': '4-8Y',
            'description': 'Thick cable-knit warm cardigan coat with horn buttons and deep front pockets. Perfect layering piece for chilly evenings.',
            'fabric_care': '100% Soft Cotton Knit. Machine wash gentle.',
            'price': 3750.0,
            'sale_price': 3150.0,
            'on_sale': 1,
            'is_new': 1,
            'is_featured': 0,
            'rating': 4.8,
            'reviews_count': 13,
            'main_image': 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?w=800&auto=format&fit=crop&q=80',
            'images': [
                'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?w=800&auto=format&fit=crop&q=80'
            ],
            'sizes': [('4-5Y', 10), ('5-6Y', 10), ('7-8Y', 10)],
            'colors': [('Dusty Rose', '#E0A899'), ('Cream White', '#FFFBEB')]
        }
    ]

    inserted_products = []
    for prod in raw_products:
        cat_id = cat_map.get(prod['cat_slug'])
        cursor.execute('''
            INSERT INTO products (
                name, slug, sku, category_id, gender, age_group, description, fabric_care,
                price, sale_price, on_sale, is_new, is_featured, status,
                stock_quantity, low_stock_threshold, rating, reviews_count, main_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
        ''', (
            prod['name'], prod['slug'], prod['sku'], cat_id, prod['gender'], prod['age_group'],
            prod['description'], prod['fabric_care'], prod['price'], prod['sale_price'],
            prod['on_sale'], prod['is_new'], prod['is_featured'], prod.get('stock_quantity', 35),
            prod.get('low_stock_threshold', 5), prod.get('rating', 4.9), prod.get('reviews_count', 12), prod['main_image']
        ))
        p_id = cursor.lastrowid
        inserted_products.append({'id': p_id, 'name': prod['name'], 'sku': prod['sku'], 'price': prod['price'], 'sale_price': prod['sale_price'], 'image': prod['main_image'], 'sizes': prod['sizes'], 'colors': prod['colors']})

        # Insert product images
        for idx, img_url in enumerate(prod['images']):
            cursor.execute('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)', (p_id, img_url, idx))

        # Insert sizes
        for s_name, s_stock in prod['sizes']:
            cursor.execute('INSERT INTO product_sizes (product_id, size_name, stock) VALUES (?, ?, ?)', (p_id, s_name, s_stock))

        # Insert colors
        for c_name, c_hex in prod['colors']:
            cursor.execute('INSERT INTO product_colors (product_id, color_name, color_hex) VALUES (?, ?, ?)', (p_id, c_name, c_hex))

        # Insert product variants
        for s_name, _ in prod['sizes']:
            for c_name, _ in prod['colors']:
                v_sku = f"{prod['sku']}-{s_name}-{c_name[:3].upper()}"
                v_stock = random.randint(4, 15)
                cursor.execute('''
                    INSERT INTO product_variants (product_id, size_name, color_name, sku, stock, price_adjustment)
                    VALUES (?, ?, ?, ?, ?, 0)
                ''', (p_id, s_name, c_name, v_sku, v_stock))

    # 7. Customer Reviews
    sample_reviews = [
        ("Fatima Tariq", "fatima.t@example.com", 5, "Outstanding Quality & Pure Soft Cotton!", "Ordered this for my 3-year-old son in Lahore. The stitching is impeccable and fabric is genuinely 100% breathable organic cotton."),
        ("Zainab Malik", "zainab.m@example.com", 5, "Colors are vibrant and wash beautifully!", "Delivery via TCS took just 2 days to Karachi. The size fitting is perfect according to their Pakistani size guide."),
        ("Maryam Hassan", "maryam.h@example.com", 5, "Super fast delivery to Islamabad", "Best kids store online in Pakistan! Packaging was lovely and fabric feels very soft on baby's skin.")
    ]

    for p in inserted_products[:8]:
        for reviewer, email, rating, title, comment in sample_reviews:
            cursor.execute('''
                INSERT INTO reviews (product_id, user_id, reviewer_name, reviewer_email, rating, title, comment, status, is_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', 1)
            ''', (p['id'], user1_id, reviewer, email, rating, title, comment))

    # 8. Sample Pakistani Orders
    sample_orders = [
        {
            'order_number': 'KG-PK-2609-84210',
            'user_id': user1_id,
            'customer_name': 'Ayesha Khan',
            'customer_email': 'ayesha.khan@example.com',
            'customer_phone': '+92 300 8456789',
            'shipping_province': 'Punjab',
            'shipping_city': 'Lahore',
            'shipping_area': 'Gulberg III',
            'shipping_address': 'House 42, Block L, Near Mini Market',
            'payment_method': 'Cash on Delivery',
            'payment_status': 'Pending',
            'order_status': 'Delivered',
            'tracking_carrier': 'TCS Express',
            'tracking_number': 'TCS-984210-LHR',
            'subtotal': 5100.0,
            'discount_amount': 510.0,
            'shipping_fee': 0.0,
            'total_amount': 4590.0,
            'coupon_code': 'KIDS10',
            'items': [
                (inserted_products[0]['id'], inserted_products[0]['name'], inserted_products[0]['sku'], 2850.0, 1, '4-5Y', 'Sage Green', 2850.0, inserted_products[0]['image']),
                (inserted_products[6]['id'], inserted_products[6]['name'], inserted_products[6]['sku'], 2650.0, 1, '3-4Y', 'Dusty Rose', 2650.0, inserted_products[6]['image'])
            ]
        }
    ]

    for ord_data in sample_orders:
        cursor.execute('''
            INSERT INTO orders (
                order_number, user_id, customer_name, customer_email, customer_phone,
                shipping_province, shipping_city, shipping_area, shipping_address, shipping_postal,
                payment_method, payment_status, order_status, tracking_carrier, tracking_number,
                subtotal, discount_amount, shipping_fee, total_amount, coupon_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            ord_data['order_number'], ord_data['user_id'], ord_data['customer_name'],
            ord_data['customer_email'], ord_data['customer_phone'], ord_data['shipping_province'],
            ord_data['shipping_city'], ord_data['shipping_area'], ord_data['shipping_address'],
            ord_data.get('shipping_postal', '54000'),
            ord_data['payment_method'], ord_data['payment_status'], ord_data['order_status'],
            ord_data['tracking_carrier'], ord_data['tracking_number'], ord_data['subtotal'],
            ord_data['discount_amount'], ord_data['shipping_fee'], ord_data['total_amount'],
            ord_data['coupon_code']
        ))
        order_id = cursor.lastrowid

        for p_id, p_name, sku, unit_p, qty, sz, col, sub, img in ord_data['items']:
            cursor.execute('''
                INSERT INTO order_items (order_id, product_id, product_name, product_image, size, color, unit_price, quantity, total_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (order_id, p_id, p_name, img, sz, col, unit_p, qty, sub))

    conn.commit()
    conn.close()
    print("Database seeded with rich, high-resolution kids garment images successfully!")

if __name__ == '__main__':
    seed_database()
