"""
Backend API Tests for İndirim Keşfet (Discount Discovery Platform)
Tests cover: Brands, Categories, Discounts, Coupons, Auth, Uploads
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Health check and basic endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        print(f"Health check passed: {response.status_code}")
    
    def test_favicon_loads(self):
        """Test favicon is accessible"""
        response = requests.get(f"{BASE_URL}/favicon.ico")
        assert response.status_code == 200
        assert len(response.content) > 0
        print(f"Favicon loaded: {len(response.content)} bytes")


class TestBrandsAPI:
    """Brand/Store API tests"""
    
    def test_get_all_brands(self):
        """Test GET /api/brands returns list of brands"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Found {len(data)} brands")
        
        # Verify brand structure
        brand = data[0]
        assert 'id' in brand
        assert 'name' in brand
        assert 'slug' in brand
        print(f"First brand: {brand['name']}")
    
    def test_brands_have_logo_urls(self):
        """Test that brands have logo_url field"""
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        
        data = response.json()
        brands_with_logos = [b for b in data if b.get('logo_url')]
        print(f"Brands with logos: {len(brands_with_logos)}/{len(data)}")
        assert len(brands_with_logos) > 0


class TestCategoriesAPI:
    """Category API tests"""
    
    def test_get_all_categories(self):
        """Test GET /api/categories returns list of categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} categories")
        
        if len(data) > 0:
            category = data[0]
            assert 'id' in category
            assert 'name' in category
            print(f"First category: {category['name']}")


class TestDiscountsAPI:
    """Discount API tests"""
    
    def test_get_all_discounts(self):
        """Test GET /api/discounts returns list of discounts"""
        response = requests.get(f"{BASE_URL}/api/discounts")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} discounts")
        
        if len(data) > 0:
            discount = data[0]
            assert 'id' in discount
            assert 'title' in discount
            print(f"First discount: {discount['title']}")


class TestCouponsAPI:
    """Coupon API tests"""
    
    def test_get_all_coupons(self):
        """Test GET /api/coupons returns list of coupons"""
        response = requests.get(f"{BASE_URL}/api/coupons")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} coupons")


class TestUploadsAPI:
    """Upload/Image serving API tests"""
    
    def test_upload_endpoint_get(self):
        """Test that upload endpoint serves images"""
        # First get a brand with logo
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        
        data = response.json()
        brand_with_logo = next((b for b in data if b.get('logo_url')), None)
        
        if brand_with_logo:
            logo_url = brand_with_logo['logo_url']
            # Convert /uploads/xxx to /api/uploads/xxx if needed
            if logo_url.startswith('/uploads/'):
                logo_url = f"/api{logo_url}"
            
            full_url = f"{BASE_URL}{logo_url}"
            img_response = requests.get(full_url)
            assert img_response.status_code == 200
            assert 'image' in img_response.headers.get('content-type', '')
            print(f"Image loaded successfully: {full_url}")
    
    def test_upload_endpoint_head(self):
        """Test HEAD method on upload endpoint (for Next.js Image optimization)"""
        # First get a brand with logo
        response = requests.get(f"{BASE_URL}/api/brands")
        assert response.status_code == 200
        
        data = response.json()
        brand_with_logo = next((b for b in data if b.get('logo_url')), None)
        
        if brand_with_logo:
            logo_url = brand_with_logo['logo_url']
            if logo_url.startswith('/uploads/'):
                logo_url = f"/api{logo_url}"
            
            full_url = f"{BASE_URL}{logo_url}"
            head_response = requests.head(full_url)
            # HEAD should return 200, not 405
            assert head_response.status_code == 200, f"HEAD request failed with {head_response.status_code}"
            print(f"HEAD request successful: {full_url}")


class TestAuthAPI:
    """Authentication API tests"""
    
    def test_login_with_valid_credentials(self):
        """Test login with valid admin credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "Muzafferadmin*"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data.get('success') == True or 'token' in data or 'authenticated' in data
        print(f"Login successful: {data}")
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials returns error"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": "admin", "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [401, 400]
        print(f"Invalid login correctly rejected: {response.status_code}")
    
    def test_auth_check_without_token(self):
        """Test auth check without token"""
        response = requests.get(f"{BASE_URL}/api/auth/check")
        # Should return 401 or indicate not authenticated
        data = response.json()
        assert response.status_code in [200, 401]
        print(f"Auth check response: {data}")


class TestSearchAPI:
    """Search API tests"""
    
    def test_search_endpoint(self):
        """Test search endpoint"""
        response = requests.get(f"{BASE_URL}/api/search?q=indirim")
        assert response.status_code == 200
        
        data = response.json()
        print(f"Search results: {data}")


class TestBlogAPI:
    """Blog API tests"""
    
    def test_get_blog_posts(self):
        """Test GET /api/blog returns blog posts"""
        response = requests.get(f"{BASE_URL}/api/blog")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} blog posts")


class TestGiveawaysAPI:
    """Giveaways API tests"""
    
    def test_get_giveaways(self):
        """Test GET /api/giveaways returns giveaways"""
        response = requests.get(f"{BASE_URL}/api/giveaways")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} giveaways")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
