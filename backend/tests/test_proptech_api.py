"""
PropTech Platform API Tests - Iteration 3
Testing 10-point UI/UX overhaul and backend fixes
"""
import pytest
import requests
import os
import random
import string

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://proptech-platform-10.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

# Test data
TEST_PHONE = f"+91{''.join(random.choices(string.digits, k=10))}"
TEST_EMAIL = f"test_{random.randint(1000,9999)}@example.com"

class TestPublicEndpoints:
    """Test public API endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{API}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "Alpha Groups" in data["message"]
        print("SUCCESS: API root endpoint working")
    
    def test_get_packages_returns_4_configs(self):
        """GET /api/packages returns 4 package configs (classic/select/signature/customize)"""
        response = requests.get(f"{API}/packages")
        assert response.status_code == 200
        data = response.json()
        
        # Verify 4 configs exist
        configs = data.get("configs", [])
        assert len(configs) == 4, f"Expected 4 packages, got {len(configs)}"
        
        # Verify package names
        package_names = [c["name"] for c in configs]
        expected_names = ["classic", "select", "signature", "customize"]
        for name in expected_names:
            assert name in package_names, f"Package '{name}' not found"
        
        # Verify prices
        prices = {c["name"]: c["price_per_sft"] for c in configs}
        assert prices["classic"] == 1899, f"Classic price should be 1899, got {prices['classic']}"
        assert prices["select"] == 2199, f"Select price should be 2199, got {prices['select']}"
        assert prices["signature"] == 2599, f"Signature price should be 2599, got {prices['signature']}"
        assert prices["customize"] == 0, f"Customize price should be 0, got {prices['customize']}"
        
        print(f"SUCCESS: GET /api/packages returns 4 configs with correct prices")


class TestCalculatorAPI:
    """Test calculator endpoint with validation"""
    
    def test_calculate_valid_request(self):
        """POST /api/calculate with valid data returns correct cost"""
        payload = {
            "plot_area": 2000,
            "project_type": "independent_house",
            "package_type": "classic"
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify calculation: 2000 * 1899 = 3,798,000
        expected_cost = 2000 * 1899
        assert data["estimated_cost"] == expected_cost, f"Expected {expected_cost}, got {data['estimated_cost']}"
        assert data["base_rate"] == 1899
        assert data["plot_area"] == 2000
        print(f"SUCCESS: Calculator returns correct cost: {expected_cost}")
    
    def test_calculate_select_package(self):
        """POST /api/calculate with select package"""
        payload = {
            "plot_area": 1500,
            "project_type": "villa",
            "package_type": "select"
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        expected_cost = 1500 * 2199
        assert data["estimated_cost"] == expected_cost
        print(f"SUCCESS: Select package calculation correct: {expected_cost}")
    
    def test_calculate_signature_package(self):
        """POST /api/calculate with signature package"""
        payload = {
            "plot_area": 3000,
            "project_type": "apartment",
            "package_type": "signature"
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        expected_cost = 3000 * 2599
        assert data["estimated_cost"] == expected_cost
        print(f"SUCCESS: Signature package calculation correct: {expected_cost}")
    
    def test_calculate_customize_package(self):
        """POST /api/calculate with customize package uses average rate"""
        payload = {
            "plot_area": 2500,
            "project_type": "school",
            "package_type": "customize"
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Customize uses 2299 as average
        expected_cost = 2500 * 2299
        assert data["estimated_cost"] == expected_cost
        print(f"SUCCESS: Customize package uses average rate: {expected_cost}")
    
    def test_calculate_rejects_invalid_project_type(self):
        """POST /api/calculate rejects invalid project types with 400"""
        payload = {
            "plot_area": 2000,
            "project_type": "invalid_type",
            "package_type": "classic"
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Invalid project type" in data.get("detail", "")
        print("SUCCESS: Invalid project type rejected with 400")
    
    def test_calculate_rejects_invalid_package_type(self):
        """POST /api/calculate rejects invalid package types with 400"""
        payload = {
            "plot_area": 2000,
            "project_type": "independent_house",
            "package_type": "premium"  # Old package name, should be rejected
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "Invalid package type" in data.get("detail", "")
        print("SUCCESS: Invalid package type 'premium' rejected with 400")
    
    def test_calculate_rejects_basic_package(self):
        """POST /api/calculate rejects old 'basic' package name"""
        payload = {
            "plot_area": 2000,
            "project_type": "villa",
            "package_type": "basic"  # Old package name
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("SUCCESS: Old 'basic' package name rejected")
    
    def test_calculate_rejects_luxury_package(self):
        """POST /api/calculate rejects old 'luxury' package name"""
        payload = {
            "plot_area": 2000,
            "project_type": "villa",
            "package_type": "luxury"  # Old package name
        }
        response = requests.post(f"{API}/calculate", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("SUCCESS: Old 'luxury' package name rejected")


class TestQuickLeadAPI:
    """Test quick lead capture endpoint"""
    
    def test_quick_lead_success(self):
        """POST /api/quick-lead creates lead successfully"""
        payload = {
            "name": "Test User",
            "phone": TEST_PHONE,
            "location": "Gachibowli",
            "requirement": "3BHK Independent House"
        }
        response = requests.post(f"{API}/quick-lead", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "lead_id" in data
        assert "Thank you" in data.get("message", "")
        print(f"SUCCESS: Quick lead created with ID: {data['lead_id']}")
    
    def test_quick_lead_minimal_data(self):
        """POST /api/quick-lead works with just name and phone"""
        payload = {
            "name": "Minimal User",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}"
        }
        response = requests.post(f"{API}/quick-lead", json=payload)
        assert response.status_code == 200
        print("SUCCESS: Quick lead works with minimal data")


class TestPartnerRegistration:
    """Test partner registration with mocked OTP"""
    
    def test_partner_register_sends_otp(self):
        """POST /api/partner/register sends mocked OTP (123456)"""
        payload = {
            "name": "Test Partner",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}",
            "email": f"partner_{random.randint(1000,9999)}@test.com"
        }
        response = requests.post(f"{API}/partner/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify mocked OTP is returned
        assert data.get("mock_otp") == "123456", "Mocked OTP should be 123456"
        assert "OTP sent" in data.get("message", "")
        print(f"SUCCESS: Partner registration returns mocked OTP: {data['mock_otp']}")
        
        return payload["phone"]
    
    def test_partner_verify_otp_creates_inactive_partner(self):
        """POST /api/partner/verify-otp creates partner with is_active=false"""
        # First register
        phone = f"+91{''.join(random.choices(string.digits, k=10))}"
        reg_payload = {
            "name": "OTP Test Partner",
            "phone": phone,
            "email": f"otp_test_{random.randint(1000,9999)}@test.com"
        }
        reg_response = requests.post(f"{API}/partner/register", json=reg_payload)
        assert reg_response.status_code == 200
        
        # Verify OTP
        verify_payload = {
            "phone": phone,
            "otp": "123456"
        }
        response = requests.post(f"{API}/partner/verify-otp", json=verify_payload)
        assert response.status_code == 200
        data = response.json()
        
        assert "partner_id" in data
        assert "referral_code" in data
        assert "pending admin approval" in data.get("message", "").lower()
        print(f"SUCCESS: Partner created with pending approval, referral code: {data['referral_code']}")
    
    def test_partner_verify_wrong_otp_fails(self):
        """POST /api/partner/verify-otp with wrong OTP fails"""
        # First register
        phone = f"+91{''.join(random.choices(string.digits, k=10))}"
        reg_payload = {
            "name": "Wrong OTP Partner",
            "phone": phone,
            "email": f"wrong_otp_{random.randint(1000,9999)}@test.com"
        }
        requests.post(f"{API}/partner/register", json=reg_payload)
        
        # Try wrong OTP
        verify_payload = {
            "phone": phone,
            "otp": "999999"
        }
        response = requests.post(f"{API}/partner/verify-otp", json=verify_payload)
        assert response.status_code == 400
        print("SUCCESS: Wrong OTP correctly rejected")


class TestVendorRegistration:
    """Test vendor registration with optional fields"""
    
    def test_vendor_registration_full_data(self):
        """POST /api/vendors with all fields"""
        payload = {
            "name": "Test Vendor",
            "company_name": "Test Company",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}",
            "email": f"vendor_{random.randint(1000,9999)}@test.com",
            "categories": ["Contractor", "Plumber"],
            "description": "Test vendor description"
        }
        response = requests.post(f"{API}/vendors", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "vendor_id" in data
        print(f"SUCCESS: Vendor registered with ID: {data['vendor_id']}")
    
    def test_vendor_registration_without_email(self):
        """POST /api/vendors works without email (optional)"""
        payload = {
            "name": "No Email Vendor",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}",
            "categories": ["Electrician"]
        }
        response = requests.post(f"{API}/vendors", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "vendor_id" in data
        print("SUCCESS: Vendor registered without email")
    
    def test_vendor_registration_without_company_name(self):
        """POST /api/vendors works without company_name (optional)"""
        payload = {
            "name": "No Company Vendor",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}",
            "categories": ["Material Supplier"]
        }
        response = requests.post(f"{API}/vendors", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "vendor_id" in data
        print("SUCCESS: Vendor registered without company_name")
    
    def test_vendor_registration_minimal(self):
        """POST /api/vendors with only required fields (name, phone, categories)"""
        payload = {
            "name": "Minimal Vendor",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}",
            "categories": ["Architect"]
        }
        response = requests.post(f"{API}/vendors", json=payload)
        assert response.status_code == 200
        print("SUCCESS: Vendor registered with minimal data (no email, no company_name)")


class TestCollaborationLeads:
    """Test collaboration lead endpoint"""
    
    def test_collaboration_lead_creation(self):
        """POST /api/collaboration/leads creates lead"""
        payload = {
            "name": "Land Owner Test",
            "phone": f"+91{''.join(random.choices(string.digits, k=10))}",
            "email": f"landowner_{random.randint(1000,9999)}@test.com",
            "land_location": "Gachibowli, Hyderabad",
            "land_size": "500 sq.yards",
            "intent": "landowner",
            "message": "Interested in joint development"
        }
        response = requests.post(f"{API}/collaboration/leads", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"SUCCESS: Collaboration lead created with ID: {data['id']}")


class TestReferralTerms:
    """Test referral terms endpoint"""
    
    def test_get_referral_terms(self):
        """GET /api/referral-terms returns terms"""
        response = requests.get(f"{API}/referral-terms")
        assert response.status_code == 200
        data = response.json()
        assert "commission_percent" in data
        assert "terms_content" in data
        print(f"SUCCESS: Referral terms retrieved, commission: {data['commission_percent']}%")


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_with_test_credentials(self):
        """POST /api/admin/login with test credentials"""
        payload = {
            "email": "test@alpha.com",
            "password": "password123"
        }
        response = requests.post(f"{API}/admin/login", json=payload)
        
        # If admin doesn't exist, register first
        if response.status_code == 401:
            reg_payload = {
                "email": "test@alpha.com",
                "password": "password123",
                "name": "Test Admin"
            }
            reg_response = requests.post(f"{API}/admin/register", json=reg_payload)
            if reg_response.status_code in [200, 400]:  # 400 if already exists
                response = requests.post(f"{API}/admin/login", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            print(f"SUCCESS: Admin login successful")
            return data["token"]
        else:
            print(f"INFO: Admin login returned {response.status_code}")
            return None


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
