import requests
import sys
import json
import io
import base64
from datetime import datetime

class TurkishDealsAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.auth_cookie = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, use_auth=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            headers = {'Content-Type': 'application/json'}
            
            # Use session for cookie handling
            if method == 'GET':
                response = self.session.get(url, timeout=10)
            elif method == 'POST':
                if files:
                    # For file uploads, don't set Content-Type header
                    response = self.session.post(url, files=files, timeout=10)
                else:
                    response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, timeout=10)

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
        
        if success and response.get('success'):
            print(f"   ✅ Admin login successful")
            # Cookie should be automatically stored in session
            return True
        else:
            print(f"   ❌ Admin login failed")
            return False

    def test_brands_crud(self):
        """Test complete CRUD operations for Brands"""
        print("\n🏪 Testing Brands CRUD Operations...")
        
        # Test GET /api/brands
        success, brands = self.run_test("Get All Brands", "GET", "brands", 200)
        
        if not success:
            return False
        
        # Test POST /api/brands (requires auth)
        test_brand_data = {
            "name": "Test Mağaza",
            "slug": "test-magaza",
            "description": "Test mağaza açıklaması",
            "website_url": "https://test-magaza.com",
            "is_featured": False
        }
        
        success, created_brand = self.run_test(
            "Create New Brand",
            "POST",
            "brands",
            200,
            data=test_brand_data,
            use_auth=True
        )
        
        created_brand_id = None
        if success and created_brand.get('success'):
            created_brand_id = created_brand.get('brand', {}).get('id')
            print(f"   ✅ Brand created with ID: {created_brand_id}")
        
        # Test PUT /api/brands/{id} (update)
        if created_brand_id:
            updated_data = test_brand_data.copy()
            updated_data['name'] = "Updated Test Mağaza"
            
            success, updated_brand = self.run_test(
                f"Update Brand {created_brand_id}",
                "PUT",
                f"brands/{created_brand_id}",
                200,
                data=updated_data,
                use_auth=True
            )
            
            if success:
                print(f"   ✅ Brand updated successfully")
        
        # Test DELETE /api/brands/{id}
        if created_brand_id:
            success, delete_response = self.run_test(
                f"Delete Brand {created_brand_id}",
                "DELETE",
                f"brands/{created_brand_id}",
                200,
                use_auth=True
            )
            
            if success:
                print(f"   ✅ Brand deleted successfully")
        
        return True

    def test_discounts_api(self):
        """Test Discounts API endpoints"""
        print("\n💰 Testing Discounts API...")
        
        # Test GET /api/discounts
        success, discounts = self.run_test("Get All Discounts", "GET", "discounts", 200)
        
        if not success:
            return False
        
        # Get a brand ID for testing (use first available brand)
        success, brands = self.run_test("Get Brands for Testing", "GET", "brands", 200)
        if not success or not brands:
            print("   ❌ No brands available for testing discounts")
            return False
        
        test_brand_id = brands[0]['id']
        
        # Test POST /api/discounts (requires auth)
        test_discount_data = {
            "brand_id": test_brand_id,
            "title": "Test İndirim",
            "description": "Test indirim açıklaması",
            "discount_text": "%50 İndirim",
            "destination_url": "https://example.com/test-discount"
        }
        
        success, created_discount = self.run_test(
            "Create New Discount",
            "POST",
            "discounts",
            200,
            data=test_discount_data,
            use_auth=True
        )
        
        if success and created_discount.get('success'):
            print(f"   ✅ Discount created successfully")
        
        return True

    def test_coupons_api(self):
        """Test Coupons API endpoints"""
        print("\n🎫 Testing Coupons API...")
        
        # Test GET /api/coupons
        success, coupons = self.run_test("Get All Coupons", "GET", "coupons", 200)
        
        if not success:
            return False
        
        # Get a brand ID for testing
        success, brands = self.run_test("Get Brands for Testing", "GET", "brands", 200)
        if not success or not brands:
            print("   ❌ No brands available for testing coupons")
            return False
        
        test_brand_id = brands[0]['id']
        
        # Test POST /api/coupons (requires auth)
        test_coupon_data = {
            "brand_id": test_brand_id,
            "title": "Test Kupon",
            "description": "Test kupon açıklaması",
            "code": "TEST50",
            "discount_text": "%50 İndirim",
            "destination_url": "https://example.com/test-coupon"
        }
        
        success, created_coupon = self.run_test(
            "Create New Coupon",
            "POST",
            "coupons",
            200,
            data=test_coupon_data,
            use_auth=True
        )
        
        if success and created_coupon.get('success'):
            print(f"   ✅ Coupon created successfully")
        
        return True

    def test_giveaways_api(self):
        """Test Giveaways API endpoints"""
        print("\n🎁 Testing Giveaways API...")
        
        # Test GET /api/giveaways
        success, giveaways = self.run_test("Get All Giveaways", "GET", "giveaways", 200)
        
        if not success:
            return False
        
        # Get a brand ID for testing
        success, brands = self.run_test("Get Brands for Testing", "GET", "brands", 200)
        if not success or not brands:
            print("   ❌ No brands available for testing giveaways")
            return False
        
        test_brand_id = brands[0]['id']
        
        # Test POST /api/giveaways (requires auth)
        test_giveaway_data = {
            "brand_id": test_brand_id,
            "title": "Test Çekiliş",
            "description": "Test çekiliş açıklaması",
            "destination_url": "https://example.com/test-giveaway"
        }
        
        success, created_giveaway = self.run_test(
            "Create New Giveaway",
            "POST",
            "giveaways",
            200,
            data=test_giveaway_data,
            use_auth=True
        )
        
        if success and created_giveaway.get('success'):
            print(f"   ✅ Giveaway created successfully")
        
        return True

    def test_categories_api(self):
        """Test Categories API endpoints"""
        print("\n📂 Testing Categories API...")
        
        # Test GET /api/categories
        success, categories = self.run_test("Get All Categories", "GET", "categories", 200)
        
        if not success:
            return False
        
        # Test POST /api/categories (requires auth)
        test_category_data = {
            "name": "Test Kategori",
            "slug": "test-kategori",
            "description": "Test kategori açıklaması",
            "order": 999
        }
        
        success, created_category = self.run_test(
            "Create New Category",
            "POST",
            "categories",
            200,
            data=test_category_data,
            use_auth=True
        )
        
        if success and created_category.get('success'):
            print(f"   ✅ Category created successfully")
        
        return True

    def test_image_upload(self):
        """Test image upload functionality"""
        print("\n📤 Testing Image Upload...")
        
        # Create a simple test image file (1x1 pixel PNG)
        png_data = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
        )
        
        # Test POST /api/upload (requires auth)
        files = {'file': ('test_image.png', io.BytesIO(png_data), 'image/png')}
        
        success, upload_response = self.run_test(
            "Upload Test Image",
            "POST",
            "upload",
            200,
            files=files,
            use_auth=True
        )
        
        if success and upload_response.get('success'):
            upload_url = upload_response.get('url')
            print(f"   ✅ Image uploaded successfully: {upload_url}")
            
            # Test accessing the uploaded file
            if upload_url:
                file_url = f"{self.base_url}{upload_url}"
                try:
                    file_response = self.session.get(file_url, timeout=10)
                    if file_response.status_code == 200:
                        print(f"   ✅ Uploaded file is accessible")
                    else:
                        print(f"   ❌ Uploaded file not accessible: {file_response.status_code}")
                except Exception as e:
                    print(f"   ❌ Error accessing uploaded file: {str(e)}")
        
        return True

    def test_authentication_required(self):
        """Test that protected endpoints require authentication"""
        print("\n🔒 Testing Authentication Requirements...")
        
        # Create a new session without authentication
        temp_session = requests.Session()
        
        # Test POST endpoints without auth (should return 401)
        protected_endpoints = [
            ("brands", {"name": "Test", "slug": "test"}),
            ("coupons", {"brand_id": "test", "title": "Test", "code": "TEST"}),
            ("discounts", {"brand_id": "test", "title": "Test"}),
            ("giveaways", {"brand_id": "test", "title": "Test"}),
            ("categories", {"name": "Test", "slug": "test"})
        ]
        
        for endpoint, test_data in protected_endpoints:
            url = f"{self.base_url}/api/{endpoint}"
            self.tests_run += 1
            
            try:
                response = temp_session.post(url, json=test_data, timeout=10)
                if response.status_code == 401:
                    self.tests_passed += 1
                    print(f"   ✅ {endpoint} correctly requires authentication")
                else:
                    print(f"   ❌ {endpoint} should require authentication (got {response.status_code})")
            except Exception as e:
                print(f"   ❌ Error testing {endpoint}: {str(e)}")
        
        return True

def main():
    print("🚀 Starting Turkish Deals Platform API Tests...")
    print("=" * 60)
    
    # Setup
    tester = TurkishDealsAPITester()
    
    # Test admin authentication first
    if not tester.test_admin_login():
        print("\n❌ Admin authentication failed, some tests will be skipped")
    
    # Test all API endpoints
    tester.test_brands_crud()
    tester.test_discounts_api()
    tester.test_coupons_api()
    tester.test_giveaways_api()
    tester.test_categories_api()
    tester.test_image_upload()
    tester.test_authentication_required()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Final Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    print("\n🎯 Turkish Deals Platform API testing completed!")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())