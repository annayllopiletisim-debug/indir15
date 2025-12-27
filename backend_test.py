import requests
import sys
import json
from datetime import datetime

class CouponAPITester:
    def __init__(self, base_url="https://indirimkesfet.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        print("\n🔐 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.admin_user_id = response.get('user', {}).get('id')
            print(f"   ✅ Admin login successful, token obtained")
            return True
        else:
            print(f"   ❌ Admin login failed")
            return False

    def test_public_endpoints(self):
        """Test all public endpoints that don't require authentication"""
        print("\n📊 Testing Public Endpoints...")
        
        # Test categories
        success, categories = self.run_test("Get Categories", "GET", "categories", 200)
        
        # Test brands
        success, brands = self.run_test("Get Brands", "GET", "brands", 200)
        
        # Test hero slides
        success, slides = self.run_test("Get Hero Slides", "GET", "hero-slides", 200)
        
        # Test coupons
        success, coupons = self.run_test("Get Coupons", "GET", "coupons", 200)
        
        # Test discounts
        success, discounts = self.run_test("Get Discounts", "GET", "discounts", 200)
        
        # Test search
        success, search_results = self.run_test("Search", "GET", "search?q=nike", 200)
        
        return categories, brands, slides, coupons, discounts

    def test_brand_specific_endpoints(self, brands):
        """Test brand-specific endpoints"""
        print("\n🏪 Testing Brand-Specific Endpoints...")
        
        if brands and len(brands) > 0:
            # Test get brand by slug (Nike should exist based on demo data)
            nike_brand = None
            for brand in brands:
                if brand.get('slug') == 'nike':
                    nike_brand = brand
                    break
            
            if nike_brand:
                success, brand_data = self.run_test(
                    "Get Nike Brand by Slug", 
                    "GET", 
                    f"brands/nike", 
                    200
                )
                
                if success and brand_data:
                    # Test brand-specific coupons
                    success, brand_coupons = self.run_test(
                        "Get Nike Coupons", 
                        "GET", 
                        f"coupons?brand_id={brand_data['id']}", 
                        200
                    )
                    
                    # Test brand-specific discounts
                    success, brand_discounts = self.run_test(
                        "Get Nike Discounts", 
                        "GET", 
                        f"discounts?brand_id={brand_data['id']}", 
                        200
                    )
                    
                    return brand_data, brand_coupons, brand_discounts
            else:
                print("   ⚠️  Nike brand not found in demo data")
        
        return None, [], []

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        print("\n🔒 Testing Admin-Only Endpoints...")
        
        if not self.token:
            print("   ❌ No admin token available, skipping admin tests")
            return False
        
        # Test analytics dashboard
        success, analytics = self.run_test(
            "Get Analytics Dashboard", 
            "GET", 
            "analytics/dashboard", 
            200
        )
        
        return success

    def test_click_tracking(self):
        """Test click tracking endpoint"""
        print("\n📈 Testing Click Tracking...")
        
        success, response = self.run_test(
            "Track Click Event",
            "POST",
            "analytics/track",
            200,
            data={
                "type": "coupon",
                "item_id": "test-item-id",
                "brand_id": "test-brand-id"
            }
        )
        
        return success

    def test_deal_detail_endpoints(self):
        """Test the new Deal Detail Pages endpoints"""
        print("\n🎯 Testing Deal Detail Pages Endpoints...")
        
        # Test valid coupon detail
        print("\n   Testing Coupon Detail with valid ID...")
        coupon_id = "e0b1f8b6-e141-470b-84da-c8b88b64fbf2"
        success, coupon_detail = self.run_test(
            f"Get Coupon Detail - {coupon_id}",
            "GET",
            f"coupon/{coupon_id}/detail",
            200
        )
        
        if success and coupon_detail:
            # Verify response structure
            required_fields = ['item_type', 'item', 'brand', 'is_expired', 'canonical_url', 'seo_meta', 'structured_data', 'related_deals']
            missing_fields = [field for field in required_fields if field not in coupon_detail]
            
            if not missing_fields:
                print(f"   ✅ Coupon detail response has all required fields")
                
                # Verify SEO meta structure
                seo_meta = coupon_detail.get('seo_meta', {})
                seo_required = ['title', 'description', 'canonical', 'robots', 'og_type']
                seo_missing = [field for field in seo_required if field not in seo_meta]
                
                if not seo_missing:
                    print(f"   ✅ SEO meta has all required fields")
                else:
                    print(f"   ❌ SEO meta missing fields: {seo_missing}")
                
                # Verify structured data
                structured_data = coupon_detail.get('structured_data', {})
                schema_required = ['@context', '@type', 'name', 'description', 'url', 'seller']
                schema_missing = [field for field in schema_required if field not in structured_data]
                
                if not schema_missing:
                    print(f"   ✅ Structured data has all required fields")
                else:
                    print(f"   ❌ Structured data missing fields: {schema_missing}")
                    
                # Verify item_type
                if coupon_detail.get('item_type') == 'coupon':
                    print(f"   ✅ Item type is correctly set to 'coupon'")
                else:
                    print(f"   ❌ Item type is '{coupon_detail.get('item_type')}', expected 'coupon'")
                    
            else:
                print(f"   ❌ Coupon detail response missing fields: {missing_fields}")
        
        # Test valid discount detail
        print("\n   Testing Discount Detail with valid ID...")
        discount_id = "e0f35eef-c694-4c57-94ac-bbbfb624e97e"
        success, discount_detail = self.run_test(
            f"Get Discount Detail - {discount_id}",
            "GET",
            f"discount/{discount_id}/detail",
            200
        )
        
        if success and discount_detail:
            # Verify response structure (same as coupon)
            required_fields = ['item_type', 'item', 'brand', 'is_expired', 'canonical_url', 'seo_meta', 'structured_data', 'related_deals']
            missing_fields = [field for field in required_fields if field not in discount_detail]
            
            if not missing_fields:
                print(f"   ✅ Discount detail response has all required fields")
                
                # Verify item_type
                if discount_detail.get('item_type') == 'discount':
                    print(f"   ✅ Item type is correctly set to 'discount'")
                else:
                    print(f"   ❌ Item type is '{discount_detail.get('item_type')}', expected 'discount'")
                    
            else:
                print(f"   ❌ Discount detail response missing fields: {missing_fields}")
        
        # Test 404 handling with invalid coupon ID
        print("\n   Testing 404 handling with invalid coupon ID...")
        invalid_id = "invalid-uuid-here"
        success, error_response = self.run_test(
            f"Get Coupon Detail - Invalid ID",
            "GET",
            f"coupon/{invalid_id}/detail",
            404
        )
        
        if success:
            print(f"   ✅ Invalid coupon ID correctly returns 404")
            if error_response and 'detail' in error_response:
                detail = error_response['detail']
                if 'bulunamadı' in detail.lower() or 'not found' in detail.lower():
                    print(f"   ✅ Error message is appropriate: '{detail}'")
                else:
                    print(f"   ⚠️  Error message: '{detail}'")
        
        # Test 404 handling with invalid discount ID
        print("\n   Testing 404 handling with invalid discount ID...")
        success, error_response = self.run_test(
            f"Get Discount Detail - Invalid ID",
            "GET",
            f"discount/{invalid_id}/detail",
            404
        )
        
        if success:
            print(f"   ✅ Invalid discount ID correctly returns 404")
            if error_response and 'detail' in error_response:
                detail = error_response['detail']
                if 'bulunamadı' in detail.lower() or 'not found' in detail.lower():
                    print(f"   ✅ Error message is appropriate: '{detail}'")
                else:
                    print(f"   ⚠️  Error message: '{detail}'")
        
        return True

def main():
    print("🚀 Starting SavvySaver API Tests...")
    print("=" * 50)
    
    # Setup
    tester = CouponAPITester()
    
    # Test admin authentication first
    if not tester.test_admin_login():
        print("\n❌ Admin authentication failed, continuing with public tests only")
    
    # Test public endpoints
    categories, brands, slides, coupons, discounts = tester.test_public_endpoints()
    
    # Test brand-specific endpoints
    brand_data, brand_coupons, brand_discounts = tester.test_brand_specific_endpoints(brands)
    
    # Test click tracking
    tester.test_click_tracking()
    
    # Test new Deal Detail Pages endpoints
    tester.test_deal_detail_endpoints()
    
    # Test admin endpoints if authenticated
    if tester.token:
        tester.test_admin_endpoints()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print data summary
    print(f"\n📋 Data Summary:")
    if categories:
        print(f"   Categories: {len(categories)} found")
    if brands:
        print(f"   Brands: {len(brands)} found")
    if slides:
        print(f"   Hero Slides: {len(slides)} found")
    if coupons:
        print(f"   Coupons: {len(coupons)} found")
    if discounts:
        print(f"   Discounts: {len(discounts)} found")
    
    if brand_data:
        print(f"   Nike Brand: Found with {len(brand_coupons)} coupons and {len(brand_discounts)} discounts")
    
    print("\n🎯 Backend API testing completed!")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())