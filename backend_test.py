import requests
import sys
import json
from datetime import datetime

class CouponAPITester:
    def __init__(self, base_url="https://dealfinder-284.preview.emergentagent.com"):
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

    def test_blog_feature(self):
        """Test the newly implemented Blog feature"""
        print("\n📝 Testing Blog Feature...")
        
        # Test 1: GET /api/blog/categories - Should return 9 categories
        print("\n   1. Testing GET /api/blog/categories...")
        success, categories = self.run_test("Get Blog Categories", "GET", "blog/categories", 200)
        
        if success and categories:
            if len(categories) >= 9:
                print(f"   ✅ Blog categories found: {len(categories)} categories")
                # Check for expected categories
                category_names = [cat.get('name', '') for cat in categories]
                expected_categories = ['Stil & Moda', 'Ev & Yaşam']
                found_expected = [name for name in expected_categories if any(name in cat_name for cat_name in category_names)]
                if found_expected:
                    print(f"   ✅ Expected categories found: {found_expected}")
                else:
                    print(f"   ⚠️  Expected categories not found. Available: {category_names[:5]}...")
            else:
                print(f"   ❌ Expected at least 9 categories, found {len(categories)}")
        
        # Test 2: GET /api/blog/posts - Should return posts list with pagination
        print("\n   2. Testing GET /api/blog/posts...")
        success, posts_response = self.run_test("Get Blog Posts", "GET", "blog/posts", 200)
        
        if success and posts_response:
            if 'posts' in posts_response and 'total' in posts_response:
                posts = posts_response['posts']
                total = posts_response['total']
                print(f"   ✅ Blog posts response structure correct: {len(posts)} posts, {total} total")
                
                # Check pagination parameters
                if 'page' in posts_response and 'limit' in posts_response:
                    print(f"   ✅ Pagination parameters present: page {posts_response['page']}, limit {posts_response['limit']}")
                else:
                    print(f"   ⚠️  Pagination parameters missing")
            else:
                print(f"   ❌ Blog posts response structure incorrect. Keys: {list(posts_response.keys())}")
        
        # Test 3: GET /api/blog/posts/popular - Should return popular posts
        print("\n   3. Testing GET /api/blog/posts/popular...")
        success, popular_posts = self.run_test("Get Popular Blog Posts", "GET", "blog/posts/popular", 200)
        
        if success and popular_posts:
            print(f"   ✅ Popular blog posts returned: {len(popular_posts)} posts")
            if popular_posts and 'view_count' in popular_posts[0]:
                print(f"   ✅ Popular posts have view_count field")
            else:
                print(f"   ⚠️  Popular posts missing view_count field")
        
        # Test 4: GET /api/blog/tags - Should return tags list
        print("\n   4. Testing GET /api/blog/tags...")
        success, tags_response = self.run_test("Get Blog Tags", "GET", "blog/tags", 200)
        
        if success and tags_response:
            if 'tags' in tags_response:
                tags = tags_response['tags']
                print(f"   ✅ Blog tags returned: {len(tags)} unique tags")
            else:
                print(f"   ❌ Blog tags response structure incorrect. Keys: {list(tags_response.keys())}")
        
        # Test 5: GET /api/blog/cta-data - Should return category deal counts
        print("\n   5. Testing GET /api/blog/cta-data...")
        success, cta_data = self.run_test("Get Blog CTA Data", "GET", "blog/cta-data", 200)
        
        if success and cta_data:
            if isinstance(cta_data, list) and len(cta_data) > 0:
                first_item = cta_data[0]
                expected_fields = ['category_id', 'category_name', 'deal_count']
                has_fields = all(field in first_item for field in expected_fields)
                if has_fields:
                    print(f"   ✅ Blog CTA data structure correct: {len(cta_data)} categories with deal counts")
                else:
                    print(f"   ❌ Blog CTA data missing fields. Available: {list(first_item.keys())}")
            else:
                print(f"   ❌ Blog CTA data should be a list with items")
        
        # Test 6: Blog Post CRUD (Authenticated) - Login first
        if not self.token:
            print("\n   ⚠️  No admin token available, skipping authenticated blog tests")
            return True
        
        print("\n   6. Testing Blog Post CRUD (Authenticated)...")
        
        # Get first category ID for testing
        first_category_id = None
        if success and categories and len(categories) > 0:
            first_category_id = categories[0].get('id')
        
        if not first_category_id:
            print("   ❌ No category ID available for testing blog post creation")
            return False
        
        # Test POST /api/blog/posts - Create a test blog post
        print("\n   6a. Testing POST /api/blog/posts - Create test blog post...")
        test_post_data = {
            "title": "Test Blog Yazısı",
            "slug": "test-blog-yazisi",
            "excerpt": "Bu bir test yazısıdır",
            "content": "<h2>Test Başlık</h2><p>Test içerik</p>",
            "category_id": first_category_id,
            "tags": ["test", "deneme"],
            "is_published": True,
            "read_time": 5
        }
        
        success, created_post = self.run_test(
            "Create Test Blog Post",
            "POST",
            "blog/posts",
            200,
            data=test_post_data
        )
        
        created_post_id = None
        if success and created_post:
            created_post_id = created_post.get('id')
            if created_post.get('title') == test_post_data['title']:
                print(f"   ✅ Blog post created successfully: {created_post.get('title')}")
                print(f"   ✅ Post ID: {created_post_id}")
            else:
                print(f"   ❌ Blog post creation failed or title mismatch")
        
        # Test GET /api/blog/posts/{slug} - Verify the created post
        if created_post_id:
            print("\n   6b. Testing GET /api/blog/posts/{slug} - Get created post...")
            success, retrieved_post = self.run_test(
                f"Get Blog Post by Slug: {test_post_data['slug']}",
                "GET",
                f"blog/posts/{test_post_data['slug']}",
                200
            )
            
            if success and retrieved_post:
                if retrieved_post.get('id') == created_post_id:
                    print(f"   ✅ Blog post retrieved successfully by slug")
                    print(f"   ✅ Content matches: {len(retrieved_post.get('content', ''))} chars")
                else:
                    print(f"   ❌ Retrieved post ID mismatch")
        
        # Test PUT /api/blog/posts/{id} - Update the post title
        if created_post_id:
            print("\n   6c. Testing PUT /api/blog/posts/{id} - Update post...")
            updated_data = test_post_data.copy()
            updated_data['title'] = "Updated Test Blog Yazısı"
            
            success, updated_post = self.run_test(
                f"Update Blog Post {created_post_id}",
                "PUT",
                f"blog/posts/{created_post_id}",
                200,
                data=updated_data
            )
            
            if success and updated_post:
                if updated_post.get('title') == updated_data['title']:
                    print(f"   ✅ Blog post updated successfully: {updated_post.get('title')}")
                else:
                    print(f"   ❌ Blog post update failed or title not updated")
        
        # Test DELETE /api/blog/posts/{id} - Delete the test post
        if created_post_id:
            print("\n   6d. Testing DELETE /api/blog/posts/{id} - Delete test post...")
            success, delete_response = self.run_test(
                f"Delete Blog Post {created_post_id}",
                "DELETE",
                f"blog/posts/{created_post_id}",
                200
            )
            
            if success:
                print(f"   ✅ Blog post deleted successfully")
                
                # Verify deletion by trying to get the post
                success, not_found = self.run_test(
                    f"Verify Blog Post Deletion",
                    "GET",
                    f"blog/posts/{test_post_data['slug']}",
                    404
                )
                
                if success:
                    print(f"   ✅ Blog post deletion verified (404 on get)")
                else:
                    print(f"   ⚠️  Blog post may still exist after deletion")
        
        print("\n   ✅ Blog feature testing completed!")
        return True

    def test_image_url_field_addition(self):
        """Test image_url field addition to Coupon, Discount, and Giveaway models"""
        print("\n🖼️  Testing Image URL Field Addition...")
        
        if not self.token:
            print("   ❌ No admin token available, skipping image_url tests")
            return False
        
        # Get a brand ID for testing (we'll use the first available brand)
        success, brands = self.run_test("Get Brands for Testing", "GET", "brands", 200)
        if not success or not brands:
            print("   ❌ No brands available for testing")
            return False
        
        test_brand_id = brands[0]['id']
        test_image_url = "https://example.com/test-image.jpg"
        
        # Test 1: GET /api/coupons - Verify image_url field exists
        print("\n   1. Testing GET /api/coupons - Verify image_url field exists...")
        success, coupons = self.run_test("Get Coupons - Check image_url field", "GET", "coupons", 200)
        
        if success and coupons:
            # Check if any coupon has image_url field (even if null)
            has_image_url_field = any('image_url' in coupon for coupon in coupons)
            if has_image_url_field:
                print(f"   ✅ Coupons response includes image_url field")
            else:
                print(f"   ❌ Coupons response missing image_url field")
        
        # Test 2: POST /api/coupons - Create coupon with image_url
        print("\n   2. Testing POST /api/coupons - Create coupon with image_url...")
        coupon_data = {
            "brand_id": test_brand_id,
            "title": "Test Coupon with Image",
            "description": "Test coupon for image_url field testing",
            "code": "TESTIMG20",
            "discount_text": "%20 İndirim",
            "destination_url": "https://example.com/test",
            "image_url": test_image_url,
            "is_active": True
        }
        
        success, created_coupon = self.run_test(
            "Create Coupon with image_url",
            "POST",
            "coupons",
            200,
            data=coupon_data
        )
        
        created_coupon_id = None
        if success and created_coupon:
            created_coupon_id = created_coupon.get('id')
            if created_coupon.get('image_url') == test_image_url:
                print(f"   ✅ Coupon created successfully with image_url: {created_coupon.get('image_url')}")
            else:
                print(f"   ❌ Coupon image_url not set correctly. Expected: {test_image_url}, Got: {created_coupon.get('image_url')}")
        
        # Test 3: PUT /api/coupons/{id} - Update coupon with image_url
        if created_coupon_id:
            print("\n   3. Testing PUT /api/coupons/{id} - Update coupon with image_url...")
            updated_image_url = "https://example.com/updated-image.jpg"
            update_data = coupon_data.copy()
            update_data['image_url'] = updated_image_url
            update_data['title'] = "Updated Test Coupon with Image"
            
            success, updated_coupon = self.run_test(
                f"Update Coupon {created_coupon_id} with new image_url",
                "PUT",
                f"coupons/{created_coupon_id}",
                200,
                data=update_data
            )
            
            if success and updated_coupon:
                if updated_coupon.get('image_url') == updated_image_url:
                    print(f"   ✅ Coupon updated successfully with new image_url: {updated_coupon.get('image_url')}")
                else:
                    print(f"   ❌ Coupon image_url not updated correctly. Expected: {updated_image_url}, Got: {updated_coupon.get('image_url')}")
        
        # Test 4: GET /api/discounts - Verify image_url field exists
        print("\n   4. Testing GET /api/discounts - Verify image_url field exists...")
        success, discounts = self.run_test("Get Discounts - Check image_url field", "GET", "discounts", 200)
        
        if success and discounts:
            # Check if any discount has image_url field (even if null)
            has_image_url_field = any('image_url' in discount for discount in discounts)
            if has_image_url_field:
                print(f"   ✅ Discounts response includes image_url field")
            else:
                print(f"   ❌ Discounts response missing image_url field")
        
        # Test 5: POST /api/discounts - Create discount with image_url
        print("\n   5. Testing POST /api/discounts - Create discount with image_url...")
        discount_data = {
            "brand_id": test_brand_id,
            "title": "Test Discount with Image",
            "description": "Test discount for image_url field testing",
            "discount_text": "%30 İndirim",
            "destination_url": "https://example.com/test-discount",
            "image_url": test_image_url
        }
        
        success, created_discount = self.run_test(
            "Create Discount with image_url",
            "POST",
            "discounts",
            200,
            data=discount_data
        )
        
        if success and created_discount:
            if created_discount.get('image_url') == test_image_url:
                print(f"   ✅ Discount created successfully with image_url: {created_discount.get('image_url')}")
            else:
                print(f"   ❌ Discount image_url not set correctly. Expected: {test_image_url}, Got: {created_discount.get('image_url')}")
        
        # Test 6: GET /api/giveaways - Verify image_url field exists
        print("\n   6. Testing GET /api/giveaways - Verify image_url field exists...")
        success, giveaways = self.run_test("Get Giveaways - Check image_url field", "GET", "giveaways", 200)
        
        if success and giveaways:
            # Check if any giveaway has image_url field (even if null)
            has_image_url_field = any('image_url' in giveaway for giveaway in giveaways)
            if has_image_url_field:
                print(f"   ✅ Giveaways response includes image_url field")
            else:
                print(f"   ❌ Giveaways response missing image_url field")
        
        # Test 7: POST /api/giveaways - Create giveaway with image_url
        print("\n   7. Testing POST /api/giveaways - Create giveaway with image_url...")
        giveaway_data = {
            "brand_id": test_brand_id,
            "title": "Test Giveaway with Image",
            "description": "Test giveaway for image_url field testing",
            "prize_text": "iPhone 15 Pro",
            "destination_url": "https://example.com/test-giveaway",
            "image_url": test_image_url,
            "is_active": True
        }
        
        success, created_giveaway = self.run_test(
            "Create Giveaway with image_url",
            "POST",
            "giveaways",
            200,
            data=giveaway_data
        )
        
        if success and created_giveaway:
            if created_giveaway.get('image_url') == test_image_url:
                print(f"   ✅ Giveaway created successfully with image_url: {created_giveaway.get('image_url')}")
            else:
                print(f"   ❌ Giveaway image_url not set correctly. Expected: {test_image_url}, Got: {created_giveaway.get('image_url')}")
        
        # Clean up test data
        if created_coupon_id:
            print("\n   🧹 Cleaning up test coupon...")
            self.run_test(
                f"Delete Test Coupon {created_coupon_id}",
                "DELETE",
                f"coupons/{created_coupon_id}",
                200
            )
        
        if success and created_discount and created_discount.get('id'):
            print("   🧹 Cleaning up test discount...")
            self.run_test(
                f"Delete Test Discount {created_discount['id']}",
                "DELETE",
                f"discounts/{created_discount['id']}",
                200
            )
        
        if success and created_giveaway and created_giveaway.get('id'):
            print("   🧹 Cleaning up test giveaway...")
            self.run_test(
                f"Delete Test Giveaway {created_giveaway['id']}",
                "DELETE",
                f"giveaways/{created_giveaway['id']}",
                200
            )
        
        print("\n   ✅ Image URL field testing completed!")
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
    
    # Test image_url field addition (NEW TEST)
    tester.test_image_url_field_addition()
    
    # Test Blog feature (NEW TEST)
    tester.test_blog_feature()
    
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