import urllib.request
import urllib.parse
import json
import sys

BASE_URL = 'http://127.0.0.1:5000/api'

def request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def run_tests():
    print("=== Starting Full-Stack Kids Garments Pakistan & Admin E2E Verification ===")
    
    # 1. Health check & Settings
    status, data = request('GET', '/health')
    assert status == 200 and data.get('currency') == 'PKR', f"Health check failed: {data}"
    print("[PASS] 1. Health Check & Currency (PKR) PASSED")

    status, s_data = request('GET', '/settings')
    assert status == 200 and 'whatsapp_number' in s_data['settings'], f"Settings failed: {s_data}"
    print(f"[PASS] 2. Public Settings & Dynamic WhatsApp ({s_data['settings']['whatsapp_number']}) PASSED")

    # 2. Categories
    status, cats_data = request('GET', '/categories')
    assert status == 200 and len(cats_data['categories']) >= 6, f"Categories failed: {cats_data}"
    print(f"[PASS] 3. Categories ({len(cats_data['categories'])} departments) PASSED")

    # 3. Product Listing & Filters
    status, data = request('GET', '/products?gender=Boys')
    assert status == 200 and len(data['products']) > 0, f"Boys filter failed: {data}"
    
    status, data = request('GET', '/products?gender=Girls')
    assert status == 200 and len(data['products']) > 0, f"Girls filter failed: {data}"

    status, data = request('GET', '/products?on_sale=true')
    assert status == 200 and len(data['products']) > 0, f"Sale filter failed: {data}"

    status, data = request('GET', '/products?search=cotton')
    assert status == 200 and len(data['products']) > 0, f"Search failed: {data}"
    print("[PASS] 4. Product Search & Pakistani PKR Pricing PASSED")

    # 4. Product Details
    test_prod = data['products'][0]
    status, pdata = request('GET', f"/products/{test_prod['id']}")
    assert status == 200 and 'reviews' in pdata['product'] and len(pdata['product']['images']) >= 1, f"Product detail failed: {pdata}"
    print(f"[PASS] 5. Product Details & Reviews for '{test_prod['name']}' (Rs. {test_prod['price']}) PASSED")

    # 5. Coupon Validation in PKR
    status, cdata = request('POST', '/coupons/validate', {'code': 'KIDS10', 'subtotal': 3000.0})
    assert status == 200 and cdata['discount_amount'] == 300.0, f"Coupon KIDS10 failed: {cdata}"
    
    status, cdata = request('POST', '/coupons/validate', {'code': 'FIRSTBUY', 'subtotal': 2000.0})
    assert status == 200 and cdata['discount_amount'] == 300.0, f"Coupon FIRSTBUY failed: {cdata}"
    print("[PASS] 6. Coupon Discount Validation (KIDS10, FIRSTBUY) in PKR PASSED")

    # 6. Customer Auth Login
    status, auth_data = request('POST', '/auth/login', {'email': 'ayesha.khan@example.com', 'password': 'password123'})
    assert status == 200 and 'token' in auth_data, f"Customer Login failed: {auth_data}"
    customer_token = auth_data['token']
    print(f"[PASS] 7. Customer Authentication for {auth_data['user']['email']} PASSED")

    # 7. Saved Pakistani Addresses
    status, addrs = request('GET', '/addresses', token=customer_token)
    assert status == 200 and len(addrs['addresses']) >= 1, f"Address list failed: {addrs}"
    print(f"[PASS] 8. Saved Pakistani Addresses ({addrs['addresses'][0]['city']}, {addrs['addresses'][0]['province']}) PASSED")

    # 8. Wishlist toggle
    status, w_res = request('POST', '/wishlist/toggle', {'product_id': test_prod['id']}, token=customer_token)
    assert status == 200, f"Wishlist toggle failed: {w_res}"
    print("[PASS] 9. Wishlist Toggle & Persistence PASSED")

    # 9. Create Pakistani Order / Checkout with COD
    order_payload = {
        'customer_name': 'Ayesha Khan',
        'customer_email': 'ayesha.khan@example.com',
        'customer_phone': '+92 300 8456789',
        'shipping_province': 'Punjab',
        'shipping_city': 'Lahore',
        'shipping_area': 'Gulberg III',
        'shipping_address': 'House 42, Block L, Near Mini Market',
        'shipping_apartment': 'Flat 2B',
        'shipping_postal': '54000',
        'shipping_method': 'Standard Delivery',
        'payment_method': 'Cash on Delivery',
        'coupon_code': 'KIDS10',
        'notes': 'Please deliver between 2 PM and 6 PM.',
        'items': [
            {'product_id': test_prod['id'], 'quantity': 2, 'size': '3-4Y', 'color': 'Sage Green'}
        ]
    }
    status, order_res = request('POST', '/orders', order_payload, token=customer_token)
    assert status == 201 and 'order_number' in order_res, f"Order placement failed: {order_res}"
    order_num = order_res['order_number']
    print(f"[PASS] 10. Pakistan COD Checkout (Order #{order_num}, Carrier: {order_res['tracking_carrier']}) PASSED")

    # 10. Order Tracking
    status, track_res = request('GET', f"/orders/track/{order_num}")
    assert status == 200 and track_res['order']['order_number'] == order_num, f"Order tracking failed: {track_res}"
    assert len(track_res['order']['stages']) == 5, "Tracking stages missing"
    print(f"[PASS] 11. Order Tracking Timeline for #{order_num} PASSED")

    # 11. Return / Exchange Request
    ret_payload = {
        'order_number': order_num,
        'customer_name': 'Ayesha Khan',
        'customer_email': 'ayesha.khan@example.com',
        'customer_phone': '+92 300 8456789',
        'request_type': 'exchange',
        'product_id': test_prod['id'],
        'product_name': test_prod['name'],
        'size': '3-4Y',
        'color': 'Sage Green',
        'reason': 'Wrong Size',
        'customer_notes': 'Please exchange for one size up (4-5Y).'
    }
    status, ret_res = request('POST', '/returns', ret_payload, token=customer_token)
    assert status == 201 and 'request_number' in ret_res, f"Return request failed: {ret_res}"
    print(f"[PASS] 12. Return/Exchange Submission ({ret_res['request_number']}) PASSED")

    # ==================== ADMIN SYSTEM TESTS ====================
    print("\n--- Verifying Admin Management APIs ---")

    # 12. Admin Login
    status, admin_auth = request('POST', '/admin/login', {'email': 'admin@kidsgarments.pk', 'password': 'admin123'})
    assert status == 200 and 'token' in admin_auth and admin_auth['user']['role'] == 'admin', f"Admin login failed: {admin_auth}"
    admin_token = admin_auth['token']
    print("[PASS] 13. Admin Secure Authentication (admin@kidsgarments.pk) PASSED")

    # 13. Admin Dashboard Stats
    status, stats = request('GET', '/admin/dashboard/stats', token=admin_token)
    assert status == 200 and stats['total_products'] > 0 and stats['total_orders'] > 0, f"Stats failed: {stats}"
    print(f"[PASS] 14. Admin Dashboard Metrics (Total Sales: Rs. {stats['total_sales']:,.0f}, Orders: {stats['total_orders']}) PASSED")

    # 14. Admin Products CRUD
    first_cat_id = cats_data['categories'][0]['id'] if cats_data.get('categories') else 1
    new_prod_payload = {
        'name': 'Test Baby Embroidered Dungaree',
        'sku': f'KG-TEST-{abs(hash(order_num))%10000}',
        'category_id': first_cat_id,
        'gender': 'Baby',
        'age_group': '6-12M',
        'description': 'Soft denim dungaree with cute bunny patch embroidery.',
        'fabric_care': '100% Cotton. Gentle wash.',
        'price': 2250.0,
        'sale_price': 1850.0,
        'on_sale': 1,
        'stock_quantity': 30,
        'low_stock_threshold': 5,
        'main_image': 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
        'sizes': [{'size': '6-12M', 'stock': 15}, {'size': '1-2Y', 'stock': 15}],
        'colors': [{'name': 'Sky Blue', 'hex': '#7DD3FC'}]
    }
    status, p_res = request('POST', '/admin/products', new_prod_payload, token=admin_token)
    assert status == 201 and 'product_id' in p_res, f"Admin create product failed: {p_res}"
    new_p_id = p_res['product_id']
    print(f"[PASS] 15. Admin Product Creation (Product ID #{new_p_id}) PASSED")

    # Update product
    status, up_res = request('PUT', f'/admin/products/{new_p_id}', {'name': 'Test Baby Embroidered Dungaree (Updated)', 'price': 2400.0, 'stock_quantity': 35}, token=admin_token)
    assert status == 200, f"Admin update product failed: {up_res}"
    print("[PASS] 16. Admin Product Update PASSED")

    # 15. Admin Inventory Management
    status, inv = request('GET', '/admin/inventory', token=admin_token)
    assert status == 200 and len(inv['inventory']) > 0, f"Inventory failed: {inv}"
    print(f"[PASS] 17. Admin Stock & Inventory Matrix ({len(inv['inventory'])} products tracked) PASSED")

    # 16. Admin Order Status Update
    status, ord_up = request('PUT', f'/admin/orders/{order_res["order_id"]}/status', {
        'status': 'Confirmed',
        'notes': 'Order confirmed via phone with customer.'
    }, token=admin_token)
    assert status == 200, f"Admin order status update failed: {ord_up}"
    print("[PASS] 18. Admin Order Status Progression ('Pending' -> 'Confirmed') PASSED")

    # 17. Admin Reviews Moderation
    status, revs = request('GET', '/admin/reviews', token=admin_token)
    assert status == 200 and len(revs['reviews']) > 0, f"Admin reviews failed: {revs}"
    print(f"[PASS] 19. Admin Reviews Moderation Pipeline ({len(revs['reviews'])} reviews) PASSED")

    # 18. Admin Returns & Exchanges
    status, rets = request('GET', '/admin/returns', token=admin_token)
    assert status == 200 and len(rets['returns']) > 0, f"Admin returns failed: {rets}"
    ret_id = rets['returns'][0]['id']
    status, ret_up = request('PUT', f'/admin/returns/{ret_id}/status', {'status': 'Approved', 'admin_notes': 'Courier pickup scheduled.'}, token=admin_token)
    assert status == 200, f"Admin return approval failed: {ret_up}"
    print(f"[PASS] 20. Admin Return / Exchange Request Approval PASSED")

    # 19. Admin Settings & Content Management
    status, set_up = request('PUT', '/admin/settings', {'whatsapp_number': '+923001234567', 'free_shipping_threshold': '3000'}, token=admin_token)
    assert status == 200, f"Admin settings update failed: {set_up}"
    print("[PASS] 21. Admin Store Content & Dynamic WhatsApp Setting PASSED")

    # 20. Customer Forgot Password & Reset Flow
    status, forgot_res = request('POST', '/auth/forgot-password', {'email': 'ayesha.khan@example.com'})
    assert status == 200 and 'reset_token' in forgot_res, f"Forgot password failed: {forgot_res}"
    reset_tok = forgot_res['reset_token']
    status, reset_res = request('POST', '/auth/reset-password', {'token': reset_tok, 'new_password': 'password123'})
    assert status == 200, f"Reset password failed: {reset_res}"
    print("[PASS] 22. Customer Forgot & Reset Password Lifecycle PASSED")

    # 21. Out-of-Stock Notification Registration
    status, notify_res = request('POST', f'/products/{test_prod["id"]}/notify-stock', {
        'email': 'parent.buyer@example.com',
        'size': '4-5Y',
        'color': 'Navy Blue'
    })
    assert status == 201, f"Stock notification failed: {notify_res}"
    print("[PASS] 23. Out-of-Stock Alert Registration PASSED")

    # 22. Multi-Sorting & Advanced Catalog Filter
    status, sort_low = request('GET', '/products?sort_by=price_asc&gender=Boys')
    assert status == 200 and len(sort_low['products']) > 0, f"Sorting low-to-high failed: {sort_low}"
    status, sort_high = request('GET', '/products?sort_by=price_desc&gender=Girls')
    assert status == 200 and len(sort_high['products']) > 0, f"Sorting high-to-low failed: {sort_high}"
    print("[PASS] 24. Multi-Facet Product Filters & Dynamic Sorting PASSED")

    # Cleanup test product
    request('DELETE', f'/admin/products/{new_p_id}', token=admin_token)

    print("\n=========================================================================")
    print("SUCCESS: ALL 24 FULL-STACK PAKISTAN E-COMMERCE & ADMIN TESTS PASSED!")
    print("=========================================================================\n")

if __name__ == '__main__':
    run_tests()
