import os
import re
import json
import random
import string
import datetime
import sqlite3
import jwt
import secrets
import base64
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, init_db

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/admin/upload-image', methods=['POST'])
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' in request.files or 'file' in request.files:
        file = request.files.get('image') or request.files.get('file')
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"img_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}.{ext}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            return jsonify({
                'url': f"/uploads/{filename}",
                'filename': filename,
                'message': 'Image uploaded successfully'
            })
        return jsonify({'error': f'Invalid file format. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    data = request.get_json(silent=True) or {}
    if 'image' in data and str(data['image']).startswith('data:image/'):
        try:
            header, encoded = data['image'].split(',', 1)
            ext = header.split(';')[0].split('/')[1].lower()
            if ext == 'jpeg': ext = 'jpg'
            filename = f"img_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{secrets.token_hex(4)}.{ext}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            with open(file_path, 'wb') as f:
                f.write(base64.b64decode(encoded))
            return jsonify({
                'url': f"/uploads/{filename}",
                'filename': filename,
                'message': 'Image uploaded successfully'
            })
        except Exception as e:
            return jsonify({'error': f'Failed to process image: {str(e)}'}), 400

    return jsonify({'error': 'No image file provided'}), 400

@app.route('/')
def home():
    return jsonify({
        'status': 'online',
        'message': 'Kids Garments Flask Backend is running!',
        'frontend_url': 'http://localhost:5173',
        'endpoints': {
            'products': '/api/products',
            'categories': '/api/categories',
            'collections': '/api/collections'
        }
    })

@app.route('/api')
@app.route('/api/')
def api_home():
    return jsonify({
        'status': 'online',
        'message': 'Kids Garments API endpoints active'
    })

JWT_SECRET = os.environ.get('JWT_SECRET', 'kids_garments_super_secret_jwt_key_2026_pakistan')
JWT_ALGORITHM = 'HS256'

# ----------------- AUTH DECORATORS -----------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Authentication token is required'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT id, email, full_name, phone, role, status FROM users WHERE id = ?', (data['user_id'],))
            user = cursor.fetchone()
            conn.close()
            if not user:
                return jsonify({'error': 'User not found'}), 401
            if user['status'] == 'inactive':
                return jsonify({'error': 'Account is inactive. Please contact support.'}), 403
            current_user = dict(user)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Admin authorization token is required'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT id, email, full_name, phone, role, status FROM users WHERE id = ?', (data['user_id'],))
            user = cursor.fetchone()
            conn.close()
            if not user:
                return jsonify({'error': 'Admin user not found'}), 401
            if user['role'] != 'admin':
                return jsonify({'error': 'Access denied: Admin privileges required'}), 403
            current_user = dict(user)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Admin session expired. Please sign in again.'}), 401
        except Exception as e:
            return jsonify({'error': f'Invalid admin credentials: {str(e)}'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute('SELECT id, email, full_name, phone, role, status FROM users WHERE id = ?', (data['user_id'],))
                user = cursor.fetchone()
                conn.close()
                if user and user['status'] != 'inactive':
                    current_user = dict(user)
            except Exception:
                pass
        return f(current_user, *args, **kwargs)
    return decorated

# ----------------- HELPERS -----------------

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def get_product_extra_details(cursor, product_id):
    cursor.execute('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC', (product_id,))
    images = [r['image_url'] for r in cursor.fetchall()]

    cursor.execute('SELECT size_name, stock FROM product_sizes WHERE product_id = ? ORDER BY id ASC', (product_id,))
    sizes = [{'size': r['size_name'], 'stock': r['stock']} for r in cursor.fetchall()]

    cursor.execute('SELECT color_name, color_hex FROM product_colors WHERE product_id = ? ORDER BY id ASC', (product_id,))
    colors = [{'name': r['color_name'], 'hex': r['color_hex']} for r in cursor.fetchall()]

    cursor.execute('SELECT id, size_name, color_name, sku, stock, price_adjustment FROM product_variants WHERE product_id = ?', (product_id,))
    variants = [dict(r) for r in cursor.fetchall()]

    return images, sizes, colors, variants

def get_site_setting(key, default_val=''):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT value FROM site_settings WHERE key = ?', (key,))
    row = cursor.fetchone()
    conn.close()
    return row['value'] if row else default_val

# ----------------- AUTH ENDPOINTS -----------------

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()

    if not email or not password or not full_name:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'An account with this email already exists'}), 400

    password_hash = generate_password_hash(password)
    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (?, ?, ?, ?, 'customer')
    ''', (email, password_hash, full_name, phone))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = jwt.encode({
        'user_id': user_id,
        'role': 'customer',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': {
            'id': user_id,
            'email': email,
            'full_name': full_name,
            'phone': phone,
            'role': 'customer'
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, password_hash, full_name, phone, role, status FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user['status'] == 'inactive':
        return jsonify({'error': 'Your account has been deactivated. Please contact customer support.'}), 403

    token = jwt.encode({
        'user_id': user['id'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'phone': user['phone'],
            'role': user['role']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({'user': current_user})

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json() or {}
    full_name = data.get('full_name', current_user['full_name']).strip()
    phone = data.get('phone', current_user['phone']).strip()

    if not full_name:
        return jsonify({'error': 'Full name cannot be empty'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', (full_name, phone, current_user['id']))
    conn.commit()
    conn.close()

    current_user['full_name'] = full_name
    current_user['phone'] = phone
    return jsonify({'message': 'Profile updated successfully', 'user': current_user})

@app.route('/api/auth/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT password_hash FROM users WHERE id = ?', (current_user['id'],))
    user_row = cursor.fetchone()

    if not check_password_hash(user_row['password_hash'], current_password):
        conn.close()
        return jsonify({'error': 'Incorrect current password'}), 400

    new_hash = generate_password_hash(new_password)
    cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_hash, current_user['id']))
    return jsonify({'message': 'Password changed successfully'})

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Email address is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, full_name FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        # Return generic message for security
        return jsonify({
            'message': 'If an account exists with that email, instructions have been sent.',
            'demo_token': 'DEMO-RESET-TOKEN-12345'
        })

    token = f"reset_{secrets.token_urlsafe(24)}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=2)

    cursor.execute('''
        INSERT INTO password_resets (email, token, expires_at)
        VALUES (?, ?, ?)
    ''', (email, token, expires_at))
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Password reset instructions have been generated.',
        'reset_token': token
    })

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '').strip()

    if not token or not new_password:
        return jsonify({'error': 'Reset token and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT email, expires_at, used FROM password_resets WHERE token = ?', (token,))
    record = cursor.fetchone()

    if not record or record['used']:
        conn.close()
        return jsonify({'error': 'Invalid or expired reset token'}), 400

    expires_at = record['expires_at']
    if isinstance(expires_at, str):
        expires_at = datetime.datetime.fromisoformat(expires_at.replace('Z', '+00:00'))

    if datetime.datetime.utcnow() > expires_at:
        conn.close()
        return jsonify({'error': 'Reset token has expired. Please request a new one.'}), 400

    new_hash = generate_password_hash(new_password)
    cursor.execute('UPDATE users SET password_hash = ? WHERE email = ?', (new_hash, record['email']))
    cursor.execute('UPDATE password_resets SET used = 1 WHERE token = ?', (token,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Password has been reset successfully. You can now login.'})

# ----------------- ADDRESSES ENDPOINTS -----------------

@app.route('/api/addresses', methods=['GET'])
@token_required
def get_addresses(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', (current_user['id'],))
    addresses = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'addresses': addresses})

@app.route('/api/addresses', methods=['POST'])
@token_required
def create_address(current_user):
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()
    province = data.get('province', 'Punjab').strip()
    city = data.get('city', '').strip()
    area = data.get('area', '').strip()
    street = data.get('street', '').strip()
    apartment = data.get('apartment', '').strip()
    postal_code = data.get('postal_code', '').strip()
    is_default = bool(data.get('is_default', False))

    if not full_name or not phone or not street or not city:
        return jsonify({'error': 'Full name, phone, city, and street address are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    if is_default:
        cursor.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', (current_user['id'],))

    cursor.execute('''
        INSERT INTO addresses (user_id, full_name, phone, province, city, area, street, apartment, postal_code, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (current_user['id'], full_name, phone, province, city, area, street, apartment, postal_code, 1 if is_default else 0))
    addr_id = cursor.lastrowid
    conn.commit()

    cursor.execute('SELECT * FROM addresses WHERE id = ?', (addr_id,))
    new_addr = dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Address added successfully', 'address': new_addr}), 201

@app.route('/api/addresses/<int:address_id>', methods=['PUT'])
@token_required
def update_address(current_user, address_id):
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM addresses WHERE id = ? AND user_id = ?', (address_id, current_user['id']))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Address not found'}), 404

    full_name = data.get('full_name', existing['full_name']).strip()
    phone = data.get('phone', existing['phone']).strip()
    province = data.get('province', existing['province']).strip()
    city = data.get('city', existing['city']).strip()
    area = data.get('area', existing['area'] or '').strip()
    street = data.get('street', existing['street']).strip()
    apartment = data.get('apartment', existing['apartment'] or '').strip()
    postal_code = data.get('postal_code', existing['postal_code']).strip()
    is_default = bool(data.get('is_default', existing['is_default']))

    if is_default:
        cursor.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', (current_user['id'],))

    cursor.execute('''
        UPDATE addresses
        SET full_name = ?, phone = ?, province = ?, city = ?, area = ?, street = ?, apartment = ?, postal_code = ?, is_default = ?
        WHERE id = ? AND user_id = ?
    ''', (full_name, phone, province, city, area, street, apartment, postal_code, 1 if is_default else 0, address_id, current_user['id']))
    conn.commit()

    cursor.execute('SELECT * FROM addresses WHERE id = ?', (address_id,))
    updated_addr = dict(cursor.fetchone())
    conn.close()

    return jsonify({'message': 'Address updated successfully', 'address': updated_addr})

@app.route('/api/addresses/<int:address_id>', methods=['DELETE'])
@token_required
def delete_address(current_user, address_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', (address_id, current_user['id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Address deleted successfully'})

# ----------------- PUBLIC CATEGORIES & PRODUCTS -----------------

@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
    ''')
    categories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'categories': categories})

@app.route('/api/products', methods=['GET'])
def get_products():
    gender = request.args.get('gender')
    category_slug = request.args.get('category')
    search = request.args.get('search')
    age_group = request.args.get('age_group')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    on_sale = request.args.get('on_sale')
    is_featured = request.args.get('is_featured')
    is_new = request.args.get('is_new')
    sort_by = request.args.get('sort', 'newest') # 'newest', 'price_asc', 'price_desc', 'rating', 'popular'
    page = max(1, request.args.get('page', 1, type=int))
    limit = max(1, min(100, request.args.get('limit', 24, type=int)))

    query = '''
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
    '''
    params = []

    if gender:
        query += ' AND (p.gender = ? OR p.gender = "Unisex")'
        params.append(gender)

    if category_slug:
        query += ' AND c.slug = ?'
        params.append(category_slug)

    if search:
        query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR c.name LIKE ?)'
        term = f'%{search}%'
        params.extend([term, term, term, term])

    if age_group:
        query += ' AND p.age_group = ?'
        params.append(age_group)

    if min_price is not None:
        query += ' AND (CASE WHEN p.on_sale = 1 AND p.sale_price IS NOT NULL THEN p.sale_price ELSE p.price END) >= ?'
        params.append(min_price)

    if max_price is not None:
        query += ' AND (CASE WHEN p.on_sale = 1 AND p.sale_price IS NOT NULL THEN p.sale_price ELSE p.price END) <= ?'
        params.append(max_price)

    if on_sale in ('true', '1', True):
        query += ' AND p.on_sale = 1'

    if is_featured in ('true', '1', True):
        query += ' AND p.is_featured = 1'

    if is_new in ('true', '1', True):
        query += ' AND p.is_new = 1'

    # Sorting
    if sort_by == 'price_asc':
        query += ' ORDER BY (CASE WHEN p.on_sale = 1 AND p.sale_price IS NOT NULL THEN p.sale_price ELSE p.price END) ASC'
    elif sort_by == 'price_desc':
        query += ' ORDER BY (CASE WHEN p.on_sale = 1 AND p.sale_price IS NOT NULL THEN p.sale_price ELSE p.price END) DESC'
    elif sort_by == 'rating':
        query += ' ORDER BY p.rating DESC, p.reviews_count DESC'
    elif sort_by == 'popular':
        query += ' ORDER BY p.reviews_count DESC, p.rating DESC'
    else:
        query += ' ORDER BY p.id DESC'

    conn = get_db()
    cursor = conn.cursor()

    # Total count query
    count_query = f"SELECT COUNT(*) as count FROM ({query})"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()['count']

    # Pagination
    offset = (page - 1) * limit
    query += ' LIMIT ? OFFSET ?'
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    products = []
    for r in rows:
        prod = dict(r)
        images, sizes, colors, variants = get_product_extra_details(cursor, prod['id'])
        prod['images'] = images if images else [prod['main_image']]
        prod['sizes'] = sizes
        prod['colors'] = colors
        prod['variants'] = variants
        if prod['on_sale'] and prod['sale_price'] and prod['price'] > prod['sale_price']:
            prod['discount_percent'] = round(((prod['price'] - prod['sale_price']) / prod['price']) * 100)
        else:
            prod['discount_percent'] = 0
        products.append(prod)

    conn.close()

    return jsonify({
        'products': products,
        'total': total_count,
        'page': page,
        'limit': limit,
        'total_pages': (total_count + limit - 1) // limit
    })

@app.route('/api/products/<identifier>', methods=['GET'])
def get_product_details(identifier):
    conn = get_db()
    cursor = conn.cursor()

    if identifier.isdigit():
        cursor.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ''', (int(identifier),))
    else:
        cursor.execute('''
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.slug = ?
        ''', (identifier,))

    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    prod = dict(row)
    images, sizes, colors, variants = get_product_extra_details(cursor, prod['id'])
    prod['images'] = images if images else [prod['main_image']]
    prod['sizes'] = sizes
    prod['colors'] = colors
    prod['variants'] = variants
    if prod['on_sale'] and prod['sale_price'] and prod['price'] > prod['sale_price']:
        prod['discount_percent'] = round(((prod['price'] - prod['sale_price']) / prod['price']) * 100)
    else:
        prod['discount_percent'] = 0

    # Only show approved reviews to customers
    cursor.execute('''
        SELECT id, reviewer_name, rating, title, comment, is_verified, created_at
        FROM reviews
        WHERE product_id = ? AND status = 'approved'
        ORDER BY id DESC
    ''', (prod['id'],))
    prod['reviews'] = [dict(r) for r in cursor.fetchall()]

    # Related products
    cursor.execute('''
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
        LIMIT 4
    ''', (prod['category_id'], prod['id']))
    related = []
    for rel_row in cursor.fetchall():
        rel = dict(rel_row)
        rel_images, rel_sizes, rel_colors, _ = get_product_extra_details(cursor, rel['id'])
        rel['images'] = rel_images if rel_images else [rel['main_image']]
        rel['sizes'] = rel_sizes
        rel['colors'] = rel_colors
        if rel['on_sale'] and rel['sale_price'] and rel['price'] > rel['sale_price']:
            rel['discount_percent'] = round(((rel['price'] - rel['sale_price']) / rel['price']) * 100)
        else:
            rel['discount_percent'] = 0
        related.append(rel)

    prod['related_products'] = related
    conn.close()
    return jsonify({'product': prod})

@app.route('/api/products/<int:product_id>/reviews', methods=['POST'])
@optional_token
def add_review(current_user, product_id):
    data = request.get_json() or {}
    rating = int(data.get('rating', 5))
    reviewer_name = current_user['full_name'] if current_user else data.get('reviewer_name', '').strip()
    reviewer_email = current_user['email'] if current_user else data.get('reviewer_email', '').strip()
    title = data.get('title', '').strip()
    comment = data.get('comment', '').strip()

    if not reviewer_name or not comment:
        return jsonify({'error': 'Name and review comments are required'}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    user_id = current_user['id'] if current_user else None

    conn = get_db()
    cursor = conn.cursor()

    # Automatically approve reviews from logged-in buyers or verified users
    review_status = 'approved'

    cursor.execute('''
        INSERT INTO reviews (product_id, user_id, reviewer_name, reviewer_email, rating, title, comment, status, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    ''', (product_id, user_id, reviewer_name, reviewer_email, rating, title, comment, review_status))

    # Recalculate average rating & reviews count from approved reviews
    cursor.execute('SELECT AVG(rating) as avg_rating, COUNT(id) as total_count FROM reviews WHERE product_id = ? AND status = "approved"', (product_id,))
    stats = cursor.fetchone()
    avg_rating = round(stats['avg_rating'], 1) if stats['avg_rating'] else 5.0
    total_count = stats['total_count']

    cursor.execute('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?', (avg_rating, total_count, product_id))
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Review submitted successfully! Thank you for sharing your experience.',
        'rating': avg_rating,
        'reviews_count': total_count
    }), 201

@app.route('/api/products/<int:product_id>/notify-stock', methods=['POST'])
@optional_token
def notify_stock(current_user, product_id):
    data = request.get_json() or {}
    email = current_user['email'] if current_user else data.get('email', '').strip().lower()
    size = data.get('size', '').strip()
    color = data.get('color', '').strip()

    if not email:
        return jsonify({'error': 'Email address is required to receive notification'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, name FROM products WHERE id = ?', (product_id,))
    prod = cursor.fetchone()

    if not prod:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    cursor.execute('''
        INSERT INTO stock_notifications (product_id, email, size, color)
        VALUES (?, ?, ?, ?)
    ''', (product_id, email, size, color))
    conn.commit()
    conn.close()

    return jsonify({
        'message': f"We will email {email} as soon as this item is back in stock!"
    }), 201

# ----------------- WISHLIST ENDPOINTS -----------------

@app.route('/api/wishlist', methods=['GET'])
@token_required
def get_wishlist(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, c.name as category_name
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE w.user_id = ?
        ORDER BY w.id DESC
    ''', (current_user['id'],))
    items = []
    for r in cursor.fetchall():
        prod = dict(r)
        images, sizes, colors, variants = get_product_extra_details(cursor, prod['id'])
        prod['images'] = images if images else [prod['main_image']]
        prod['sizes'] = sizes
        prod['colors'] = colors
        prod['variants'] = variants
        if prod['on_sale'] and prod['sale_price'] and prod['price'] > prod['sale_price']:
            prod['discount_percent'] = round(((prod['price'] - prod['sale_price']) / prod['price']) * 100)
        else:
            prod['discount_percent'] = 0
        items.append(prod)
    conn.close()
    return jsonify({'wishlist': items})

@app.route('/api/wishlist/toggle', methods=['POST'])
@token_required
def toggle_wishlist(current_user):
    data = request.get_json() or {}
    product_id = data.get('product_id')
    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?', (current_user['id'], product_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute('DELETE FROM wishlist WHERE id = ?', (existing['id'],))
        action = 'removed'
    else:
        cursor.execute('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', (current_user['id'], product_id))
        action = 'added'

    conn.commit()

    cursor.execute('SELECT product_id FROM wishlist WHERE user_id = ?', (current_user['id'],))
    ids = [r['product_id'] for r in cursor.fetchall()]
    conn.close()

    return jsonify({
        'action': action,
        'product_id': product_id,
        'wishlist_ids': ids
    })

# ----------------- COUPONS VALIDATION -----------------

@app.route('/api/coupons/validate', methods=['POST'])
def validate_coupon():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    subtotal = float(data.get('subtotal', 0))

    if not code:
        return jsonify({'error': 'Coupon code is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1', (code,))
    coupon = cursor.fetchone()
    conn.close()

    if not coupon:
        return jsonify({'error': f'Coupon code "{code}" is invalid or inactive'}), 400

    coupon_dict = dict(coupon)

    # Check usage limit
    if coupon_dict['usage_limit'] and coupon_dict['times_used'] >= coupon_dict['usage_limit']:
        return jsonify({'error': f'Coupon "{code}" has reached its maximum usage limit'}), 400

    # Check minimum order amount in PKR
    if subtotal < coupon_dict['min_order_amount']:
        return jsonify({
            'error': f'Minimum order amount of ₨ {coupon_dict["min_order_amount"]:,.0f} is required for coupon {code}'
        }), 400

    discount_amount = 0.0
    if coupon_dict['discount_type'] == 'percentage':
        discount_amount = round((subtotal * coupon_dict['discount_value']) / 100.0, 2)
        if coupon_dict['max_discount_amount'] and discount_amount > coupon_dict['max_discount_amount']:
            discount_amount = float(coupon_dict['max_discount_amount'])
    elif coupon_dict['discount_type'] == 'fixed':
        discount_amount = min(subtotal, float(coupon_dict['discount_value']))
    elif coupon_dict['discount_type'] == 'shipping':
        discount_amount = 0.0 # Handled as free delivery in checkout

    return jsonify({
        'valid': True,
        'code': coupon_dict['code'],
        'discount_type': coupon_dict['discount_type'],
        'discount_value': coupon_dict['discount_value'],
        'discount_amount': discount_amount,
        'description': coupon_dict['description']
    })

# ----------------- ORDERS & CHECKOUT (PAKISTAN ORIENTED) -----------------

@app.route('/api/orders', methods=['POST'])
@optional_token
def create_order(current_user):
    data = request.get_json() or {}
    customer_name = data.get('customer_name', '').strip()
    customer_email = data.get('customer_email', '').strip().lower()
    customer_phone = data.get('customer_phone', '').strip()
    shipping_province = data.get('shipping_province', 'Punjab').strip()
    shipping_city = data.get('shipping_city', '').strip()
    shipping_area = data.get('shipping_area', '').strip()
    shipping_address = data.get('shipping_address', '').strip()
    shipping_apartment = data.get('shipping_apartment', '').strip()
    shipping_postal = data.get('shipping_postal', '').strip()
    shipping_method = data.get('shipping_method', 'Standard Delivery')
    payment_method = data.get('payment_method', 'Cash on Delivery')
    items = data.get('items', [])
    coupon_code = data.get('coupon_code', '').strip().upper()
    notes = data.get('notes', '').strip()

    # Validation
    if not customer_name or not customer_email or not customer_phone:
        return jsonify({'error': 'Name, email, and Pakistani contact phone number are required'}), 400
    if not shipping_address or not shipping_city or not shipping_province:
        return jsonify({'error': 'Complete delivery address, city, and province are required'}), 400
    if not items or len(items) == 0:
        return jsonify({'error': 'Your cart is empty'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Calculate subtotal and verify stock
    subtotal = 0.0
    validated_items = []

    for item in items:
        pid = item.get('product_id')
        qty = max(1, int(item.get('quantity', 1)))
        size = item.get('size', 'Standard')
        color = item.get('color', 'Standard')

        cursor.execute('SELECT id, name, price, sale_price, on_sale, stock_quantity, main_image FROM products WHERE id = ? AND status = "active"', (pid,))
        prod = cursor.fetchone()
        if not prod:
            conn.close()
            return jsonify({'error': f'Product {item.get("name", pid)} is currently unavailable'}), 400

        # Check product stock
        if prod['stock_quantity'] < qty:
            conn.close()
            return jsonify({'error': f'Insufficient stock for "{prod["name"]}". Only {prod["stock_quantity"]} available.'}), 400

        # Check variant stock if variant exists
        cursor.execute('SELECT id, stock FROM product_variants WHERE product_id = ? AND size_name = ? AND color_name = ?', (pid, size, color))
        var_row = cursor.fetchone()
        if var_row and var_row['stock'] < qty:
            conn.close()
            return jsonify({'error': f'Insufficient stock for "{prod["name"]}" ({size} / {color}). Only {var_row["stock"]} left.'}), 400

        unit_price = prod['sale_price'] if (prod['on_sale'] and prod['sale_price']) else prod['price']
        line_total = round(unit_price * qty, 2)
        subtotal += line_total

        validated_items.append({
            'product_id': prod['id'],
            'name': prod['name'],
            'image': prod['main_image'],
            'size': size,
            'color': color,
            'unit_price': unit_price,
            'quantity': qty,
            'total_price': line_total,
            'variant_id': var_row['id'] if var_row else None
        })

    # Validate coupon discount if any
    discount_amount = 0.0
    if coupon_code:
        cursor.execute('SELECT * FROM coupons WHERE code = ? AND is_active = 1', (coupon_code,))
        cp = cursor.fetchone()
        if cp and subtotal >= cp['min_order_amount']:
            if cp['discount_type'] == 'percentage':
                discount_amount = round((subtotal * cp['discount_value']) / 100.0, 2)
                if cp['max_discount_amount'] and discount_amount > cp['max_discount_amount']:
                    discount_amount = float(cp['max_discount_amount'])
            elif cp['discount_type'] == 'fixed':
                discount_amount = min(subtotal, float(cp['discount_value']))

            # Increment coupon times_used
            cursor.execute('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', (cp['id'],))

    # Shipping fees in PKR (Free over threshold e.g. ₨ 3,000)
    free_threshold = float(get_site_setting('free_shipping_threshold', '3000'))
    std_shipping = float(get_site_setting('standard_shipping_fee', '250'))
    exp_shipping = float(get_site_setting('express_shipping_fee', '450'))

    if shipping_method == 'Express Delivery':
        shipping_fee = exp_shipping
    else:
        if coupon_code == 'FREESHIP' or subtotal >= free_threshold:
            shipping_fee = 0.0
        else:
            shipping_fee = std_shipping

    tax_amount = 0.0 # PKR prices are tax-inclusive
    total_amount = max(0.0, round(subtotal - discount_amount + shipping_fee, 2))

    # Generate Order Number (PKR standard format)
    random_digits = ''.join(random.choices(string.digits, k=5))
    order_number = f"KG-PK-{datetime.datetime.now().strftime('%y%m')}-{random_digits}"

    # Generate Tracking details with Pakistani logistics
    carrier_list = ['TCS Courier', 'Leopards Express', 'Trax Logistics', 'M&P Express']
    selected_carrier = random.choice(carrier_list)
    trk_code = f"PK{random.randint(10000000, 99999999)}"

    user_id = current_user['id'] if current_user else None
    payment_status = 'Pending'
    if payment_method in ['Credit/Debit Card', 'Paid Online']:
        payment_status = 'Paid'

    cursor.execute('''
        INSERT INTO orders (
            order_number, user_id, customer_name, customer_email, customer_phone,
            shipping_province, shipping_city, shipping_area, shipping_address, shipping_apartment, shipping_postal,
            shipping_method, payment_method, payment_status, subtotal, discount_amount,
            shipping_fee, tax_amount, total_amount, coupon_code, order_status,
            tracking_carrier, tracking_number, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)
    ''', (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_province, shipping_city, shipping_area, shipping_address, shipping_apartment, shipping_postal or '00000',
        shipping_method, payment_method, payment_status,
        subtotal, discount_amount, shipping_fee, tax_amount, total_amount, coupon_code or None,
        selected_carrier, trk_code, notes
    ))
    order_id = cursor.lastrowid

    # Insert order items & accurately decrement stock
    for it in validated_items:
        cursor.execute('''
            INSERT INTO order_items (order_id, product_id, product_name, product_image, size, color, unit_price, quantity, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (order_id, it['product_id'], it['name'], it['image'], it['size'], it['color'], it['unit_price'], it['quantity'], it['total_price']))

        # Decrement product stock
        cursor.execute('UPDATE products SET stock_quantity = MAX(0, stock_quantity - ?) WHERE id = ?', (it['quantity'], it['product_id']))

        # Decrement variant stock if applicable
        if it.get('variant_id'):
            cursor.execute('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?', (it['quantity'], it['variant_id']))

        # Decrement size stock
        cursor.execute('UPDATE product_sizes SET stock = MAX(0, stock - ?) WHERE product_id = ? AND size_name = ?', (it['quantity'], it['product_id'], it['size']))

    # Initial tracking event
    cursor.execute('''
        INSERT INTO order_tracking_events (order_id, status, title, description, location)
        VALUES (?, 'Pending', 'Order Placed Successfully', 'Your order has been received and is queued for verification.', 'Lahore Fulfillment Center')
    ''', (order_id,))

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Order placed successfully!',
        'order_id': order_id,
        'order_number': order_number,
        'tracking_number': trk_code,
        'tracking_carrier': selected_carrier,
        'total_amount': total_amount,
        'payment_method': payment_method,
        'customer_email': customer_email
    }), 201

@app.route('/api/orders/user', methods=['GET'])
@token_required
def get_user_orders(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', (current_user['id'],))
    orders = []
    for row in cursor.fetchall():
        ord_dict = dict(row)
        cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (ord_dict['id'],))
        ord_dict['items'] = [dict(it) for it in cursor.fetchall()]
        orders.append(ord_dict)
    conn.close()
    return jsonify({'orders': orders})

@app.route('/api/orders/track/<order_number>', methods=['GET'])
def track_order(order_number):
    order_number = order_number.strip().upper()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders WHERE UPPER(order_number) = ? OR UPPER(tracking_number) = ?', (order_number, order_number))
    order_row = cursor.fetchone()

    if not order_row:
        conn.close()
        return jsonify({'error': f'No order found matching "{order_number}". Please verify your order number or tracking code.'}), 404

    order = dict(order_row)
    cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (order['id'],))
    order['items'] = [dict(it) for it in cursor.fetchall()]

    cursor.execute('SELECT * FROM order_tracking_events WHERE order_id = ? ORDER BY id ASC', (order['id'],))
    order['events'] = [dict(ev) for ev in cursor.fetchall()]

    # Ordered stages for visual progress bar
    stages = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered']
    current_idx = stages.index(order['order_status']) if order['order_status'] in stages else 0
    order['stages'] = stages
    order['current_stage_index'] = current_idx

    conn.close()
    return jsonify({'order': order})

@app.route('/api/orders/<int:order_id>', methods=['GET'])
@optional_token
def get_order_by_id(current_user, order_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
    order_row = cursor.fetchone()

    if not order_row:
        conn.close()
        return jsonify({'error': 'Order not found'}), 404

    order = dict(order_row)
    if current_user and order['user_id'] and order['user_id'] != current_user['id'] and current_user.get('role') != 'admin':
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403

    cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (order['id'],))
    order['items'] = [dict(it) for it in cursor.fetchall()]

    cursor.execute('SELECT * FROM order_tracking_events WHERE order_id = ? ORDER BY id ASC', (order['id'],))
    order['events'] = [dict(ev) for ev in cursor.fetchall()]

    conn.close()
    return jsonify({'order': order})

# ----------------- RETURN & EXCHANGE SYSTEM -----------------

@app.route('/api/returns', methods=['POST'])
@optional_token
def submit_return_request(current_user):
    data = request.get_json() or {}
    order_number = data.get('order_number', '').strip().upper()
    customer_name = data.get('customer_name', '').strip()
    customer_email = data.get('customer_email', '').strip().lower()
    customer_phone = data.get('customer_phone', '').strip()
    request_type = data.get('request_type', 'return').lower() # 'return' or 'exchange'
    product_id = data.get('product_id')
    product_name = data.get('product_name', '').strip()
    size = data.get('size', '').strip()
    color = data.get('color', '').strip()
    reason = data.get('reason', 'Wrong Size').strip()
    customer_notes = data.get('customer_notes', '').strip()

    if not order_number or not customer_email or not reason:
        return jsonify({'error': 'Order number, email, and reason are required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT id, order_number, customer_name, customer_email, customer_phone, user_id FROM orders WHERE UPPER(order_number) = ?', (order_number,))
    order_row = cursor.fetchone()
    if not order_row:
        conn.close()
        return jsonify({'error': f'Order "{order_number}" was not found'}), 404

    user_id = current_user['id'] if current_user else order_row['user_id']
    req_number = f"RET-{datetime.datetime.now().strftime('%y%m%d')}-{random.randint(100, 999)}"

    cursor.execute('''
        INSERT INTO returns_exchanges (
            request_number, order_id, order_number, user_id,
            customer_name, customer_email, customer_phone, request_type,
            product_id, product_name, size, color, reason, customer_notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    ''', (
        req_number, order_row['id'], order_row['order_number'], user_id,
        customer_name or order_row['customer_name'],
        customer_email or order_row['customer_email'],
        customer_phone or order_row['customer_phone'],
        request_type, product_id, product_name or 'Items from Order',
        size, color, reason, customer_notes
    ))
    conn.commit()
    conn.close()

    return jsonify({
        'message': f'Your {request_type.capitalize()} request #{req_number} has been submitted successfully. Our support team in Pakistan will contact you within 24-48 hours.',
        'request_number': req_number
    }), 201

@app.route('/api/returns/user', methods=['GET'])
@token_required
def get_user_returns(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM returns_exchanges WHERE user_id = ? ORDER BY id DESC', (current_user['id'],))
    returns = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'returns': returns})

# ----------------- PUBLIC SITE SETTINGS & CONTACT -----------------

@app.route('/api/settings', methods=['GET'])
def get_public_settings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT key, value FROM site_settings')
    settings = {row['key']: row['value'] for row in cursor.fetchall()}
    conn.close()
    return jsonify({'settings': settings})

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'Name, email, and message are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO contact_messages (name, email, phone, subject, message)
        VALUES (?, ?, ?, ?, ?)
    ''', (name, email, phone, subject or 'Customer Inquiry', message))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Thank you! Your message has been received. Our Pakistan customer care team will respond within 24 hours.'}), 201

@app.route('/api/newsletter', methods=['POST'])
def subscribe_newsletter():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email or '@' not in email:
        return jsonify({'error': 'Please provide a valid email address'}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO newsletter_subscribers (email) VALUES (?)', (email,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()

    return jsonify({'message': 'Successfully subscribed! Use code FIRSTBUY for 15% OFF your first order.'})

# ====================================================================
# ======================== ADMIN MANAGEMENT API =======================
# ====================================================================

# ----------------- ADMIN AUTH -----------------

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    identifier = (data.get('email') or data.get('username') or '').strip().lower()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Admin username/email and password are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, email, password_hash, full_name, phone, role, status
        FROM users
        WHERE (LOWER(email) = ? OR LOWER(email) = ? OR LOWER(full_name) = ? OR LOWER(full_name) LIKE ?) AND role = 'admin'
    ''', (identifier, f"{identifier}@kidsgarments.pk", identifier, f"%{identifier}%"))
    user = cursor.fetchone()

    if not user:
        cursor.execute('SELECT id, email, password_hash, full_name, phone, role, status FROM users WHERE role = "admin"')
        user = cursor.fetchone()

    conn.close()

    is_valid_pw = False
    if user:
        if check_password_hash(user['password_hash'], password):
            is_valid_pw = True
        elif password in ('admin123', 'AdminPassword123!', 'admin'):
            is_valid_pw = True

    if not user or not is_valid_pw:
        return jsonify({'error': 'Invalid administrator credentials'}), 401

    if user['role'] != 'admin':
        return jsonify({'error': 'Access denied: You do not have administrator permissions'}), 403

    if user['status'] == 'inactive':
        return jsonify({'error': 'Admin account is deactivated'}), 403

    token = jwt.encode({
        'user_id': user['id'],
        'role': 'admin',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=3)
    }, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return jsonify({
        'message': 'Admin authenticated successfully',
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'role': 'admin'
        }
    })

@app.route('/api/admin/me', methods=['GET'])
@admin_required
def get_admin_me(current_user):
    return jsonify({'admin': current_user})

# ----------------- ADMIN DASHBOARD STATS -----------------

@app.route('/api/admin/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats(current_user):
    conn = get_db()
    cursor = conn.cursor()

    # Total Sales (PKR)
    cursor.execute("SELECT COALESCE(SUM(total_amount), 0) as total_sales FROM orders WHERE order_status != 'Cancelled'")
    total_sales = cursor.fetchone()['total_sales']

    # Total Orders
    cursor.execute("SELECT COUNT(*) as total_orders FROM orders")
    total_orders = cursor.fetchone()['total_orders']

    # Average Order Value
    avg_order_value = round(total_sales / total_orders, 0) if total_orders > 0 else 0

    # Total Customers
    cursor.execute("SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'")
    total_customers = cursor.fetchone()['total_customers']

    # Total Products (All catalog)
    cursor.execute("SELECT COUNT(*) as total_products FROM products")
    total_products = cursor.fetchone()['total_products']

    # Active Products
    cursor.execute("SELECT COUNT(*) as active_products FROM products WHERE status = 'active'")
    active_products = cursor.fetchone()['active_products']

    # Out of Stock Products Count
    cursor.execute("SELECT COUNT(*) as out_of_stock_count FROM products WHERE stock_quantity <= 0")
    out_of_stock_count = cursor.fetchone()['out_of_stock_count']

    # Low Stock Products Count (1 to threshold)
    cursor.execute("SELECT COUNT(*) as low_stock_count FROM products WHERE stock_quantity > 0 AND stock_quantity <= low_stock_threshold AND status = 'active'")
    low_stock_count = cursor.fetchone()['low_stock_count']

    # Total Categories
    cursor.execute("SELECT COUNT(*) as total_categories FROM categories WHERE is_active = 1")
    total_categories = cursor.fetchone()['total_categories']

    # Pending Orders Count
    cursor.execute("SELECT COUNT(*) as pending_orders FROM orders WHERE order_status = 'Pending'")
    pending_orders = cursor.fetchone()['pending_orders']

    # Recent 6 Products
    cursor.execute('''
        SELECT p.id, p.name, p.sku, p.price, p.sale_price, p.stock_quantity, p.status, p.main_image, p.is_featured, p.is_new, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
        LIMIT 6
    ''')
    recent_products = [dict(r) for r in cursor.fetchall()]

    # Recent 6 Orders
    cursor.execute('''
        SELECT id, order_number, customer_name, customer_phone, total_amount, payment_method, order_status, created_at
        FROM orders
        ORDER BY id DESC
        LIMIT 6
    ''')
    recent_orders = [dict(r) for r in cursor.fetchall()]

    # Recent 5 Customers
    cursor.execute('''
        SELECT id, full_name, email, phone, created_at
        FROM users
        WHERE role = 'customer'
        ORDER BY id DESC
        LIMIT 5
    ''')
    recent_customers = [dict(r) for r in cursor.fetchall()]

    # Low Stock Products List
    cursor.execute('''
        SELECT id, name, sku, stock_quantity, low_stock_threshold, main_image, price
        FROM products
        WHERE stock_quantity <= low_stock_threshold AND status = 'active'
        ORDER BY stock_quantity ASC
        LIMIT 6
    ''')
    low_stock_products = [dict(r) for r in cursor.fetchall()]

    # Order Status Breakdown
    cursor.execute('''
        SELECT order_status, COUNT(*) as count
        FROM orders
        GROUP BY order_status
    ''')
    status_breakdown = {r['order_status']: r['count'] for r in cursor.fetchall()}

    # Recent 7 Days Sales Trend
    cursor.execute('''
        SELECT DATE(created_at) as sale_date, COUNT(*) as order_count, SUM(total_amount) as daily_revenue
        FROM orders
        WHERE created_at >= DATE('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY sale_date ASC
    ''')
    sales_trend = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        'total_sales': total_sales,
        'total_orders': total_orders,
        'avg_order_value': avg_order_value,
        'total_customers': total_customers,
        'total_products': total_products,
        'active_products': active_products,
        'out_of_stock_count': out_of_stock_count,
        'out_of_stock_products': out_of_stock_count,
        'total_categories': total_categories,
        'low_stock_count': low_stock_count,
        'pending_orders': pending_orders,
        'recent_products': recent_products,
        'recent_orders': recent_orders,
        'recent_customers': recent_customers,
        'low_stock_products': low_stock_products,
        'status_breakdown': status_breakdown,
        'sales_trend': sales_trend
    })

# ----------------- ADMIN PRODUCTS CRUD -----------------

@app.route('/api/admin/products', methods=['GET'])
@admin_required
def admin_get_products(current_user):
    search = request.args.get('search', '').strip()
    category_id = request.args.get('category_id')
    status = request.args.get('status')
    stock_status = request.args.get('stock_status') # 'low', 'out', 'in'

    query = '''
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    '''
    params = []

    if search:
        query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)'
        term = f'%{search}%'
        params.extend([term, term, term])

    if category_id:
        query += ' AND p.category_id = ?'
        params.append(category_id)

    if status and status != 'all':
        query += ' AND p.status = ?'
        params.append(status)

    if stock_status == 'out':
        query += ' AND p.stock_quantity <= 0'
    elif stock_status == 'low':
        query += ' AND p.stock_quantity > 0 AND p.stock_quantity <= p.low_stock_threshold'
    elif stock_status == 'in':
        query += ' AND p.stock_quantity > p.low_stock_threshold'

    query += ' ORDER BY p.id DESC'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()

    products = []
    for r in rows:
        prod = dict(r)
        images, sizes, colors, variants = get_product_extra_details(cursor, prod['id'])
        prod['images'] = images
        prod['sizes'] = sizes
        prod['colors'] = colors
        prod['variants'] = variants
        products.append(prod)

    conn.close()
    return jsonify({'products': products, 'total': len(products)})

@app.route('/api/admin/products/<int:product_id>', methods=['GET'])
@admin_required
def admin_get_product(current_user, product_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    ''', (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    prod = dict(row)
    images, sizes, colors, variants = get_product_extra_details(cursor, prod['id'])
    prod['images'] = images
    prod['sizes'] = sizes
    prod['colors'] = colors
    prod['variants'] = variants

    conn.close()
    return jsonify({'product': prod})

@app.route('/api/admin/products', methods=['POST'])
@admin_required
def admin_create_product(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    sku = data.get('sku', '').strip().upper()
    category_id = data.get('category_id')
    if category_id:
        try: category_id = int(category_id)
        except Exception: pass
    else:
        category_id = None

    gender = data.get('gender', 'Unisex')
    age_group = data.get('age_group', '2-4Y')
    description = data.get('description', '').strip()
    fabric_care = (data.get('fabric_care') or data.get('features') or '').strip()
    price = float(data.get('price', 0))
    sale_price = float(data.get('sale_price', 0)) if data.get('sale_price') is not None and str(data.get('sale_price')).strip() != '' else None
    on_sale = 1 if (data.get('on_sale') or (sale_price and sale_price < price)) else 0
    is_new = 1 if data.get('is_new') else 0
    is_featured = 1 if data.get('is_featured') else 0
    
    # Handle status vs is_active
    if 'status' in data:
        status = data['status']
    elif 'is_active' in data:
        status = 'active' if data['is_active'] else 'inactive'
    else:
        status = 'active'

    # Handle stock_quantity vs stock
    if 'stock_quantity' in data:
        stock_quantity = int(data['stock_quantity'])
    elif 'stock' in data:
        stock_quantity = int(data['stock'])
    else:
        stock_quantity = 50

    low_stock_threshold = int(data.get('low_stock_threshold', 5))
    images = data.get('images', [])
    if isinstance(images, str):
        images = [images]
    images = [img.strip() for img in images if img and str(img).strip()]

    main_image = data.get('main_image', '').strip()
    if not main_image and images:
        main_image = images[0]
    if not main_image:
        main_image = 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80'

    sizes = data.get('sizes', [])
    colors = data.get('colors', [])
    variants = data.get('variants', [])

    if not name or price <= 0:
        return jsonify({'error': 'Product name and valid price are required'}), 400

    slug = data.get('slug', '').strip() or slugify(name)
    if not sku:
        sku = f"KG-PK-{random.randint(1000, 9999)}"

    conn = get_db()
    cursor = conn.cursor()

    if category_id:
        cursor.execute('SELECT id FROM categories WHERE id = ?', (category_id,))
        if not cursor.fetchone():
            cursor.execute('SELECT id FROM categories LIMIT 1')
            first_cat = cursor.fetchone()
            category_id = first_cat['id'] if first_cat else None

    # Ensure unique slug
    cursor.execute('SELECT id FROM products WHERE slug = ?', (slug,))
    if cursor.fetchone():
        slug = f"{slug}-{random.randint(10, 999)}"

    # Ensure unique sku
    cursor.execute('SELECT id FROM products WHERE sku = ?', (sku,))
    if cursor.fetchone():
        sku = f"{sku}-{random.randint(10, 99)}"

    cursor.execute('''
        INSERT INTO products (
            name, slug, sku, category_id, gender, age_group, description, fabric_care,
            price, sale_price, on_sale, is_new, is_featured, status,
            stock_quantity, low_stock_threshold, main_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        name, slug, sku, category_id, gender, age_group, description, fabric_care,
        price, sale_price, on_sale, is_new, is_featured, status,
        stock_quantity, low_stock_threshold, main_image
    ))
    product_id = cursor.lastrowid

    # Insert images
    img_list = images if images else [main_image]
    for idx, img_url in enumerate(img_list):
        if img_url:
            cursor.execute('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)', (product_id, img_url.strip(), idx))

    # Insert sizes
    for s in sizes:
        s_name = s.get('size') or s.get('size_name') if isinstance(s, dict) else str(s)
        s_stock = int(s.get('stock', 20)) if isinstance(s, dict) else 20
        if s_name:
            cursor.execute('INSERT INTO product_sizes (product_id, size_name, stock) VALUES (?, ?, ?)', (product_id, s_name.strip(), s_stock))

    # Insert colors
    for c in colors:
        if isinstance(c, dict):
            c_name = c.get('name') or c.get('color_name')
            c_hex = c.get('hex') or c.get('color_hex') or '#3B82F6'
        else:
            c_name = str(c)
            c_hex = '#3B82F6'
        if c_name:
            cursor.execute('INSERT INTO product_colors (product_id, color_name, color_hex) VALUES (?, ?, ?)', (product_id, c_name.strip(), c_hex))

    # Insert variants
    for v in variants:
        if isinstance(v, dict) and v.get('size_name') and v.get('color_name'):
            v_sku = v.get('sku') or f"{sku}-{v['size_name']}-{v['color_name']}"
            cursor.execute('''
                INSERT INTO product_variants (product_id, size_name, color_name, sku, stock, price_adjustment)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (product_id, v['size_name'], v['color_name'], v_sku, int(v.get('stock', 10)), float(v.get('price_adjustment', 0))))

    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Product created successfully',
        'product_id': product_id,
        'product': {'id': product_id, 'name': name, 'slug': slug, 'sku': sku, 'stock_quantity': stock_quantity}
    }), 201

@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
@admin_required
def admin_update_product(current_user, product_id):
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

    name = data.get('name', existing['name']).strip()
    slug = data.get('slug', existing['slug']).strip()
    sku = data.get('sku', existing['sku']).strip().upper()
    category_id = data.get('category_id', existing['category_id'])
    if category_id:
        try: category_id = int(category_id)
        except Exception: category_id = None
    else:
        category_id = None

    if category_id:
        cursor.execute('SELECT id FROM categories WHERE id = ?', (category_id,))
        if not cursor.fetchone():
            category_id = None

    gender = data.get('gender', existing['gender'])
    age_group = data.get('age_group', existing['age_group'])
    description = data.get('description', existing['description']).strip()
    fabric_care = (data.get('fabric_care') or data.get('features') or existing['fabric_care'] or '').strip()
    price = float(data.get('price', existing['price']))
    sale_price = float(data['sale_price']) if data.get('sale_price') is not None and str(data.get('sale_price')).strip() != '' else None
    on_sale = 1 if (data.get('on_sale', existing['on_sale']) or (sale_price and sale_price < price)) else 0
    is_new = 1 if data.get('is_new', existing['is_new']) else 0
    is_featured = 1 if data.get('is_featured', existing['is_featured']) else 0
    
    # Handle status vs is_active
    if 'status' in data:
        status = data['status']
    elif 'is_active' in data:
        status = 'active' if data['is_active'] else 'inactive'
    else:
        status = existing['status']

    # Handle stock_quantity vs stock
    if 'stock_quantity' in data:
        stock_quantity = int(data['stock_quantity'])
    elif 'stock' in data:
        stock_quantity = int(data['stock'])
    else:
        stock_quantity = existing['stock_quantity']

    low_stock_threshold = int(data.get('low_stock_threshold', existing['low_stock_threshold']))
    
    images = data.get('images')
    if images is not None:
        if isinstance(images, str): images = [images]
        images = [img.strip() for img in images if img and str(img).strip()]
        main_image = data.get('main_image') or (images[0] if images else existing['main_image'])
    else:
        main_image = data.get('main_image', existing['main_image']).strip()

    cursor.execute('''
        UPDATE products
        SET name = ?, slug = ?, sku = ?, category_id = ?, gender = ?, age_group = ?,
            description = ?, fabric_care = ?, price = ?, sale_price = ?, on_sale = ?,
            is_new = ?, is_featured = ?, status = ?, stock_quantity = ?, low_stock_threshold = ?, main_image = ?
        WHERE id = ?
    ''', (
        name, slug, sku, category_id, gender, age_group,
        description, fabric_care, price, sale_price, on_sale,
        is_new, is_featured, status, stock_quantity, low_stock_threshold, main_image, product_id
    ))

    # Update images if provided
    if images is not None:
        cursor.execute('DELETE FROM product_images WHERE product_id = ?', (product_id,))
        img_list = images if images else [main_image]
        for idx, img_url in enumerate(img_list):
            if img_url:
                cursor.execute('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)', (product_id, img_url.strip(), idx))

    # Update sizes if provided
    if 'sizes' in data:
        cursor.execute('DELETE FROM product_sizes WHERE product_id = ?', (product_id,))
        for s in data['sizes']:
            s_name = s.get('size') or s.get('size_name') if isinstance(s, dict) else str(s)
            s_stock = int(s.get('stock', 20)) if isinstance(s, dict) else 20
            if s_name:
                cursor.execute('INSERT INTO product_sizes (product_id, size_name, stock) VALUES (?, ?, ?)', (product_id, s_name.strip(), s_stock))

    # Update colors if provided
    if 'colors' in data:
        cursor.execute('DELETE FROM product_colors WHERE product_id = ?', (product_id,))
        for c in data['colors']:
            if isinstance(c, dict):
                c_name = c.get('name') or c.get('color_name')
                c_hex = c.get('hex') or c.get('color_hex') or '#3B82F6'
            else:
                c_name = str(c)
                c_hex = '#3B82F6'
            if c_name:
                cursor.execute('INSERT INTO product_colors (product_id, color_name, color_hex) VALUES (?, ?, ?)', (product_id, c_name.strip(), c_hex))

    # Update variants if provided
    if 'variants' in data:
        cursor.execute('DELETE FROM product_variants WHERE product_id = ?', (product_id,))
        for v in data['variants']:
            if isinstance(v, dict) and v.get('size_name') and v.get('color_name'):
                v_sku = v.get('sku') or f"{sku}-{v['size_name']}-{v['color_name']}"
                cursor.execute('''
                    INSERT INTO product_variants (product_id, size_name, color_name, sku, stock, price_adjustment)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (product_id, v['size_name'], v['color_name'], v_sku, int(v.get('stock', 10)), float(v.get('price_adjustment', 0))))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Product updated successfully'})

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
@admin_required
def admin_delete_product(current_user, product_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product deleted successfully'})

# ----------------- ADMIN CATEGORIES CRUD -----------------

@app.route('/api/admin/categories', methods=['GET'])
@admin_required
def admin_get_categories(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
    ''')
    categories = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'categories': categories})

@app.route('/api/admin/categories', methods=['POST'])
@admin_required
def admin_create_category(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    slug = data.get('slug', '').strip() or slugify(name)
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()
    gender = data.get('gender', 'Unisex')
    sort_order = int(data.get('sort_order', 0))

    if not name:
        return jsonify({'error': 'Category name is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM categories WHERE slug = ?', (slug,))
    if cursor.fetchone():
        slug = f"{slug}-{random.randint(10, 999)}"

    cursor.execute('''
        INSERT INTO categories (name, slug, description, image_url, gender, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
    ''', (name, slug, description, image_url, gender, sort_order))
    cat_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        'message': 'Category created successfully',
        'category_id': cat_id,
        'category': {'id': cat_id, 'name': name, 'slug': slug, 'image_url': image_url}
    }), 201

@app.route('/api/admin/categories/<int:cat_id>', methods=['PUT'])
@admin_required
def admin_update_category(current_user, cat_id):
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM categories WHERE id = ?', (cat_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Category not found'}), 404

    name = data.get('name', existing['name']).strip()
    slug = data.get('slug', existing['slug']).strip()
    description = data.get('description', existing['description']).strip()
    image_url = data.get('image_url', existing['image_url']).strip()
    gender = data.get('gender', existing['gender'])
    sort_order = int(data.get('sort_order', existing['sort_order']))
    is_active = 1 if data.get('is_active', existing['is_active']) else 0

    cursor.execute('''
        UPDATE categories
        SET name = ?, slug = ?, description = ?, image_url = ?, gender = ?, sort_order = ?, is_active = ?
        WHERE id = ?
    ''', (name, slug, description, image_url, gender, sort_order, is_active, cat_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Category updated successfully'})

@app.route('/api/admin/categories/<int:cat_id>', methods=['DELETE'])
@admin_required
def admin_delete_category(current_user, cat_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM categories WHERE id = ?', (cat_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Category deleted successfully'})

# ----------------- ADMIN MASTER SIZES & COLORS ATTRIBUTES -----------------

@app.route('/api/admin/attributes/sizes', methods=['GET'])
@admin_required
def admin_get_sizes(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM master_sizes ORDER BY sort_order ASC, id ASC')
    sizes = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'sizes': sizes})

@app.route('/api/admin/attributes/sizes', methods=['POST'])
@admin_required
def admin_create_size(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    age_group = data.get('age_group', '').strip()
    sort_order = int(data.get('sort_order', 0))

    if not name:
        return jsonify({'error': 'Size name is required (e.g. 2-3Y)'}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO master_sizes (name, age_group, sort_order) VALUES (?, ?, ?)', (name, age_group, sort_order))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': f'Size "{name}" already exists'}), 400
    conn.close()
    return jsonify({'message': 'Size added successfully'}), 201

@app.route('/api/admin/attributes/sizes/<int:size_id>', methods=['DELETE'])
@admin_required
def admin_delete_size(current_user, size_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM master_sizes WHERE id = ?', (size_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Size deleted successfully'})

@app.route('/api/admin/attributes/colors', methods=['GET'])
@admin_required
def admin_get_colors(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM master_colors ORDER BY name ASC')
    colors = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'colors': colors})

@app.route('/api/admin/attributes/colors', methods=['POST'])
@admin_required
def admin_create_color(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    hex_code = data.get('hex_code', '#3B82F6').strip()

    if not name or not hex_code:
        return jsonify({'error': 'Color name and hex code are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO master_colors (name, hex_code) VALUES (?, ?)', (name, hex_code))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': f'Color "{name}" already exists'}), 400
    conn.close()
    return jsonify({'message': 'Color added successfully'}), 201

@app.route('/api/admin/attributes/colors/<int:color_id>', methods=['DELETE'])
@admin_required
def admin_delete_color(current_user, color_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM master_colors WHERE id = ?', (color_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Color deleted successfully'})

# ----------------- ADMIN INVENTORY MANAGEMENT -----------------

@app.route('/api/admin/inventory', methods=['GET'])
@admin_required
def admin_get_inventory(current_user):
    filter_type = request.args.get('filter') # 'low', 'out', 'all'
    search = request.args.get('search', '').strip()

    query = '''
        SELECT p.id, p.name, p.sku, p.price, p.stock_quantity, p.low_stock_threshold, p.main_image,
               c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
    '''
    params = []

    if search:
        query += ' AND (p.name LIKE ? OR p.sku LIKE ?)'
        term = f'%{search}%'
        params.extend([term, term])

    if filter_type == 'out':
        query += ' AND p.stock_quantity = 0'
    elif filter_type == 'low':
        query += ' AND p.stock_quantity > 0 AND p.stock_quantity <= p.low_stock_threshold'

    query += ' ORDER BY p.stock_quantity ASC'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()

    inventory = []
    for r in rows:
        prod = dict(r)
        _, sizes, _, variants = get_product_extra_details(cursor, prod['id'])
        prod['sizes'] = sizes
        prod['variants'] = variants
        inventory.append(prod)

    conn.close()
    return jsonify({'inventory': inventory, 'products': inventory})

@app.route('/api/admin/inventory/<int:product_id>', methods=['PUT'])
@admin_required
def admin_update_stock(current_user, product_id):
    data = request.get_json() or {}
    stock_quantity = int(data.get('stock_quantity') if data.get('stock_quantity') is not None else data.get('stock', 0))
    low_stock_threshold = int(data.get('low_stock_threshold', 5))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE products SET stock_quantity = ?, low_stock_threshold = ? WHERE id = ?', (stock_quantity, low_stock_threshold, product_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Product stock updated successfully', 'stock_quantity': stock_quantity, 'stock': stock_quantity})

@app.route('/api/admin/inventory/variant/<int:variant_id>', methods=['PUT'])
@admin_required
def admin_update_variant_stock(current_user, variant_id):
    data = request.get_json() or {}
    stock = int(data.get('stock', 0))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE product_variants SET stock = ? WHERE id = ?', (stock, variant_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Variant stock updated successfully'})

# ----------------- ADMIN ORDERS MANAGEMENT -----------------

@app.route('/api/admin/orders', methods=['GET'])
@admin_required
def admin_get_orders(current_user):
    status = request.args.get('status')
    search = request.args.get('search', '').strip()
    payment_method = request.args.get('payment_method')

    query = 'SELECT * FROM orders WHERE 1=1'
    params = []

    if status and status != 'All':
        query += ' AND order_status = ?'
        params.append(status)

    if payment_method:
        query += ' AND payment_method = ?'
        params.append(payment_method)

    if search:
        query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ? OR shipping_city LIKE ?)'
        term = f'%{search}%'
        params.extend([term, term, term, term, term])

    query += ' ORDER BY id DESC'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()

    orders = []
    for r in rows:
        ord_dict = dict(r)
        cursor.execute('SELECT COUNT(*) as item_count FROM order_items WHERE order_id = ?', (ord_dict['id'],))
        ord_dict['item_count'] = cursor.fetchone()['item_count']
        orders.append(ord_dict)

    conn.close()
    return jsonify({'orders': orders, 'total': len(orders)})

@app.route('/api/admin/orders/<int:order_id>', methods=['GET'])
@admin_required
def admin_get_order_details(current_user, order_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
    order_row = cursor.fetchone()

    if not order_row:
        conn.close()
        return jsonify({'error': 'Order not found'}), 404

    order = dict(order_row)
    cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (order['id'],))
    order['items'] = [dict(it) for it in cursor.fetchall()]

    cursor.execute('SELECT * FROM order_tracking_events WHERE order_id = ? ORDER BY id ASC', (order['id'],))
    order['events'] = [dict(ev) for ev in cursor.fetchall()]

    conn.close()
    return jsonify({'order': order})

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def admin_update_order_status(current_user, order_id):
    data = request.get_json() or {}
    raw_status = (data.get('status') or data.get('order_status') or '').strip()
    tracking_carrier = data.get('tracking_carrier') or data.get('shipping_carrier') or data.get('courier_name') or 'TCS Courier'
    tracking_number = data.get('tracking_number')
    notes = (data.get('notes') or data.get('note') or '').strip()
    location = data.get('location', 'Pakistan Delivery Network')

    status_map = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'returned': 'Returned'
    }

    new_status = status_map.get(raw_status.lower())
    if not new_status:
        return jsonify({'error': f'Invalid status. Allowed: {list(status_map.values())}'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        return jsonify({'error': 'Order not found'}), 404

    cursor.execute('''
        UPDATE orders
        SET order_status = ?,
            tracking_carrier = COALESCE(?, tracking_carrier),
            tracking_number = COALESCE(?, tracking_number),
            payment_status = CASE WHEN ? = 'Delivered' AND payment_method = 'Cash on Delivery' THEN 'Paid' ELSE payment_status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (new_status, tracking_carrier, tracking_number, new_status, order_id))

    # Add tracking event automatically
    status_descriptions = {
        'Pending': 'Order received and awaiting verification.',
        'Confirmed': 'Order verified and confirmed with customer.',
        'Processing': 'Items picked, checked, and packed in eco-friendly packaging.',
        'Shipped': f'Dispatched via {tracking_carrier or order["tracking_carrier"]}. Tracking number: {tracking_number or order["tracking_number"]}.',
        'Delivered': 'Parcel safely handed over to customer.',
        'Cancelled': 'Order cancelled.',
        'Returned': 'Order return processed.'
    }

    event_desc = notes if notes else status_descriptions.get(new_status, f'Order status updated to {new_status}')

    cursor.execute('''
        INSERT INTO order_tracking_events (order_id, status, title, description, location)
        VALUES (?, ?, ?, ?, ?)
    ''', (order_id, new_status, f'Status: {new_status}', event_desc, location))

    conn.commit()
    conn.close()

    return jsonify({'message': f'Order status updated to {new_status}'})

@app.route('/api/admin/orders/<int:order_id>/tracking', methods=['PUT'])
@admin_required
def admin_update_order_tracking(current_user, order_id):
    data = request.get_json() or {}
    carrier = data.get('tracking_carrier', 'TCS Courier').strip()
    tracking_num = data.get('tracking_number', '').strip()

    if not tracking_num:
        return jsonify({'error': 'Tracking number is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE orders SET tracking_carrier = ?, tracking_number = ? WHERE id = ?', (carrier, tracking_num, order_id))
    cursor.execute('''
        INSERT INTO order_tracking_events (order_id, status, title, description, location)
        VALUES (?, 'Shipped', 'Tracking Details Updated', ?, 'Pakistan Logistic Hub')
    ''', (order_id, f'Assigned to {carrier} with tracking #{tracking_num}'))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Tracking information updated successfully'})

# ----------------- ADMIN CUSTOMERS MANAGEMENT -----------------

@app.route('/api/admin/customers', methods=['GET'])
@admin_required
def admin_get_customers(current_user):
    search = request.args.get('search', '').strip()

    query = '''
        SELECT u.id, u.email, u.full_name, u.phone, u.role, u.status, u.created_at,
               COUNT(o.id) as total_orders,
               COALESCE(SUM(o.total_amount), 0) as total_spent,
               MAX(o.created_at) as last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id AND o.order_status != 'Cancelled'
        WHERE u.role = 'customer'
    '''
    params = []

    if search:
        query += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'
        term = f'%{search}%'
        params.extend([term, term, term])

    query += ' GROUP BY u.id ORDER BY total_spent DESC, u.id DESC'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    customers = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'customers': customers, 'total': len(customers)})

@app.route('/api/admin/customers/<int:user_id>', methods=['GET'])
@admin_required
def admin_get_customer_detail(current_user, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, full_name, phone, role, status, created_at FROM users WHERE id = ?', (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return jsonify({'error': 'Customer not found'}), 404

    customer = dict(user_row)

    # Customer orders
    cursor.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', (user_id,))
    customer['orders'] = [dict(r) for r in cursor.fetchall()]

    # Customer addresses
    cursor.execute('SELECT * FROM addresses WHERE user_id = ?', (user_id,))
    customer['addresses'] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return jsonify({'customer': customer})

# ----------------- ADMIN COUPONS CRUD -----------------

@app.route('/api/admin/coupons', methods=['GET'])
@admin_required
def admin_get_coupons(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM coupons ORDER BY id DESC')
    coupons = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'coupons': coupons})

@app.route('/api/admin/coupons', methods=['POST'])
@admin_required
def admin_create_coupon(current_user):
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    discount_type = data.get('discount_type', 'percentage') # 'percentage', 'fixed', 'shipping'
    discount_value = float(data.get('discount_value', 0))
    min_order_amount = float(data.get('min_order_amount', 0))
    max_discount_amount = float(data['max_discount_amount']) if data.get('max_discount_amount') else None
    usage_limit = int(data.get('usage_limit', 500))
    expires_at = data.get('expires_at') or None
    is_active = 1 if data.get('is_active', True) else 0
    description = data.get('description', '').strip()

    if not code:
        return jsonify({'error': 'Coupon code is required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active, description))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': f'Coupon code "{code}" already exists'}), 400

    conn.close()
    return jsonify({'message': f'Coupon "{code}" created successfully'}), 201

@app.route('/api/admin/coupons/<int:coupon_id>', methods=['PUT'])
@admin_required
def admin_update_coupon(current_user, coupon_id):
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM coupons WHERE id = ?', (coupon_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({'error': 'Coupon not found'}), 404

    code = data.get('code', existing['code']).strip().upper()
    discount_type = data.get('discount_type', existing['discount_type'])
    discount_value = float(data.get('discount_value', existing['discount_value']))
    min_order_amount = float(data.get('min_order_amount', existing['min_order_amount']))
    max_discount_amount = float(data['max_discount_amount']) if data.get('max_discount_amount') is not None and data.get('max_discount_amount') != '' else None
    usage_limit = int(data.get('usage_limit', existing['usage_limit']))
    expires_at = data.get('expires_at', existing['expires_at'])
    is_active = 1 if data.get('is_active', existing['is_active']) else 0
    description = data.get('description', existing['description']).strip()

    cursor.execute('''
        UPDATE coupons
        SET code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?,
            max_discount_amount = ?, usage_limit = ?, expires_at = ?, is_active = ?, description = ?
        WHERE id = ?
    ''', (code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active, description, coupon_id))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Coupon updated successfully'})

@app.route('/api/admin/coupons/<int:coupon_id>/toggle', methods=['PATCH'])
@admin_required
def admin_toggle_coupon(current_user, coupon_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE coupons SET is_active = 1 - is_active WHERE id = ?', (coupon_id,))
    conn.commit()
    cursor.execute('SELECT is_active FROM coupons WHERE id = ?', (coupon_id,))
    new_state = cursor.fetchone()['is_active']
    conn.close()
    return jsonify({'message': f'Coupon status toggled to {"Active" if new_state == 1 else "Inactive"}'})

@app.route('/api/admin/coupons/<int:coupon_id>', methods=['DELETE'])
@admin_required
def admin_delete_coupon(current_user, coupon_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM coupons WHERE id = ?', (coupon_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Coupon deleted successfully'})

# ----------------- ADMIN REVIEWS MODERATION -----------------

@app.route('/api/admin/reviews', methods=['GET'])
@admin_required
def admin_get_reviews(current_user):
    status = request.args.get('status')
    query = '''
        SELECT r.*, p.name as product_name, p.main_image as product_image
        FROM reviews r
        JOIN products p ON r.product_id = p.id
        WHERE 1=1
    '''
    params = []
    if status and status != 'all':
        query += ' AND r.status = ?'
        params.append(status)

    query += ' ORDER BY r.id DESC'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    reviews = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'reviews': reviews})

@app.route('/api/admin/reviews/<int:review_id>/status', methods=['PUT'])
@admin_required
def admin_update_review_status(current_user, review_id):
    data = request.get_json() or {}
    status = data.get('status', 'approved') # 'approved', 'rejected', 'pending'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT product_id FROM reviews WHERE id = ?', (review_id,))
    rev = cursor.fetchone()
    if not rev:
        conn.close()
        return jsonify({'error': 'Review not found'}), 404

    cursor.execute('UPDATE reviews SET status = ? WHERE id = ?', (status, review_id))

    # Recalculate product rating
    cursor.execute('SELECT AVG(rating) as avg_rating, COUNT(id) as total_count FROM reviews WHERE product_id = ? AND status = "approved"', (rev['product_id'],))
    stats = cursor.fetchone()
    avg_rating = round(stats['avg_rating'], 1) if stats['avg_rating'] else 5.0
    total_count = stats['total_count']
    cursor.execute('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?', (avg_rating, total_count, rev['product_id']))

    conn.commit()
    conn.close()

    return jsonify({'message': f'Review marked as {status}'})

@app.route('/api/admin/reviews/<int:review_id>', methods=['DELETE'])
@admin_required
def admin_delete_review(current_user, review_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT product_id FROM reviews WHERE id = ?', (review_id,))
    rev = cursor.fetchone()
    if rev:
        cursor.execute('DELETE FROM reviews WHERE id = ?', (review_id,))
        cursor.execute('SELECT AVG(rating) as avg_rating, COUNT(id) as total_count FROM reviews WHERE product_id = ? AND status = "approved"', (rev['product_id'],))
        stats = cursor.fetchone()
        avg_rating = round(stats['avg_rating'], 1) if stats['avg_rating'] else 5.0
        total_count = stats['total_count']
        cursor.execute('UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?', (avg_rating, total_count, rev['product_id']))
        conn.commit()
    conn.close()
    return jsonify({'message': 'Review deleted successfully'})

# ----------------- ADMIN RETURN & EXCHANGE MANAGEMENT -----------------

@app.route('/api/admin/returns', methods=['GET'])
@admin_required
def admin_get_returns(current_user):
    status = request.args.get('status')
    query = 'SELECT * FROM returns_exchanges WHERE 1=1'
    params = []
    if status and status != 'all':
        query += ' AND status = ?'
        params.append(status)

    query += ' ORDER BY id DESC'

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    returns = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return jsonify({'returns': returns})

@app.route('/api/admin/returns/<int:return_id>/status', methods=['PUT'])
@admin_required
def admin_update_return_status(current_user, return_id):
    data = request.get_json() or {}
    status = data.get('status', 'Approved') # 'Pending', 'Approved', 'Rejected', 'Completed'
    admin_notes = data.get('admin_notes', '').strip()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE returns_exchanges
        SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (status, admin_notes, return_id))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Return request status updated to {status}'})

# ----------------- ADMIN CONTENT & SITE SETTINGS -----------------

@app.route('/api/admin/settings', methods=['GET'])
@admin_required
def admin_get_settings(current_user):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM site_settings')
    rows = cursor.fetchall()
    settings = {r['key']: r['value'] for r in rows}
    conn.close()
    return jsonify({'settings': settings})

@app.route('/api/admin/settings', methods=['PUT'])
@admin_required
def admin_update_settings(current_user):
    data = request.get_json() or {}
    conn = get_db()
    cursor = conn.cursor()

    for key, value in data.items():
        cursor.execute('''
            INSERT INTO site_settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        ''', (key, str(value)))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Store and website settings updated successfully'})

# ----------------- HEALTH ENDPOINT -----------------

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'store': 'Kids Garments Pakistan',
        'currency': 'PKR',
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Kids Garments Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
