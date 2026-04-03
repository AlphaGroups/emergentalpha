"""
Iteration 6 Backend Tests
Tests for:
1. Partner Add Lead page - POST /api/leads with referral_code links to partner
2. Vendor registration with grouped categories and file upload
3. Vendor registration with document_data (base64)
"""

import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://proptech-platform-10.preview.emergentagent.com')

# Test credentials
DEMO_PARTNER_PHONE = "9876543210"
DEMO_PARTNER_PASSWORD = "partner123"
DEMO_PARTNER_REFERRAL_CODE = "AGDEMO01"
ADMIN_EMAIL = "test@alpha.com"
ADMIN_PASSWORD = "password123"


class TestPartnerLeadSubmission:
    """Test partner lead submission with referral code"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner auth token"""
        response = requests.post(f"{BASE_URL}/api/partner/login", json={
            "phone": DEMO_PARTNER_PHONE,
            "password": DEMO_PARTNER_PASSWORD
        })
        assert response.status_code == 200, f"Partner login failed: {response.text}"
        return response.json()["token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["token"]
    
    def test_create_lead_with_referral_code_links_to_partner(self, partner_token, admin_token):
        """Test that POST /api/leads with referral_code correctly sets partner_id"""
        # Create lead with referral code
        lead_data = {
            "name": "TEST_Lead_Referral_Check",
            "phone": "9999888877",
            "email": "testlead@example.com",
            "project_type": "independent_house",
            "plot_area": 2400,
            "location": "Gachibowli, Hyderabad",
            "budget": "50L - 1Cr",
            "message": "Test lead from partner portal",
            "referral_code": DEMO_PARTNER_REFERRAL_CODE,
            "source": "partner_portal"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leads",
            json=lead_data,
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        
        assert response.status_code == 200, f"Lead creation failed: {response.text}"
        lead = response.json()
        
        # Verify lead has partner_id set
        assert lead.get("partner_id") is not None, "partner_id should be set when referral_code is valid"
        assert lead.get("referral_code") == DEMO_PARTNER_REFERRAL_CODE
        assert lead.get("source") == "partner_portal"
        assert lead.get("name") == "TEST_Lead_Referral_Check"
        
        print(f"SUCCESS: Lead created with partner_id: {lead.get('partner_id')}")
        
        # Verify lead appears in partner's leads
        partner_leads_response = requests.get(
            f"{BASE_URL}/api/partner/leads",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert partner_leads_response.status_code == 200
        partner_leads = partner_leads_response.json()
        
        # Check if our test lead is in the list
        test_lead_found = any(l.get("name") == "TEST_Lead_Referral_Check" for l in partner_leads)
        assert test_lead_found, "Lead should appear in partner's leads list"
        print("SUCCESS: Lead appears in partner's referrals")
    
    def test_create_lead_without_referral_code(self):
        """Test that lead without referral_code has no partner_id"""
        lead_data = {
            "name": "TEST_Lead_No_Referral",
            "phone": "9999888866",
            "email": "",
            "project_type": "villa",
            "source": "website"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200
        lead = response.json()
        
        # partner_id should be None when no referral code
        assert lead.get("partner_id") is None, "partner_id should be None without referral_code"
        print("SUCCESS: Lead without referral_code has no partner_id")
    
    def test_create_lead_with_invalid_referral_code(self):
        """Test that invalid referral_code doesn't set partner_id"""
        lead_data = {
            "name": "TEST_Lead_Invalid_Referral",
            "phone": "9999888855",
            "email": "",
            "project_type": "apartment",
            "referral_code": "INVALID123",
            "source": "partner_landing"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200
        lead = response.json()
        
        # partner_id should be None for invalid referral code
        assert lead.get("partner_id") is None, "partner_id should be None for invalid referral_code"
        assert lead.get("referral_code") == "INVALID123", "referral_code should still be stored"
        print("SUCCESS: Invalid referral_code doesn't set partner_id")
    
    def test_lead_from_partner_landing_with_referral_code(self):
        """Test public lead form on partner landing page"""
        lead_data = {
            "name": "TEST_Public_Lead",
            "phone": "9999888844",
            "email": "",
            "project_type": "general_inquiry",
            "location": "Kondapur",
            "referral_code": DEMO_PARTNER_REFERRAL_CODE,
            "source": "partner_landing"
        }
        
        response = requests.post(f"{BASE_URL}/api/leads", json=lead_data)
        assert response.status_code == 200
        lead = response.json()
        
        assert lead.get("partner_id") is not None, "partner_id should be set for valid referral_code"
        assert lead.get("source") == "partner_landing"
        print("SUCCESS: Public lead form with referral_code works correctly")


class TestVendorRegistration:
    """Test vendor registration with grouped categories and file upload"""
    
    def test_vendor_registration_minimal_fields(self):
        """Test vendor registration with only required fields (name, phone, 1 category)"""
        vendor_data = {
            "name": "TEST_Vendor_Minimal",
            "phone": "9876500001",
            "categories": ["Architect"]
        }
        
        response = requests.post(f"{BASE_URL}/api/vendors", json=vendor_data)
        assert response.status_code == 200, f"Vendor registration failed: {response.text}"
        result = response.json()
        
        assert "vendor_id" in result, "Response should contain vendor_id"
        assert result.get("message") == "Registration successful"
        print(f"SUCCESS: Vendor registered with minimal fields, ID: {result['vendor_id']}")
    
    def test_vendor_registration_with_all_fields(self):
        """Test vendor registration with all optional fields"""
        vendor_data = {
            "name": "TEST_Vendor_Full",
            "company_name": "Test Construction Co",
            "phone": "9876500002",
            "email": "vendor@test.com",
            "website": "https://testvendor.com",
            "categories": ["Architect", "Structural Engineer", "Civil Works"],
            "description": "Full service construction vendor"
        }
        
        response = requests.post(f"{BASE_URL}/api/vendors", json=vendor_data)
        assert response.status_code == 200
        result = response.json()
        
        assert "vendor_id" in result
        print(f"SUCCESS: Vendor registered with all fields, ID: {result['vendor_id']}")
    
    def test_vendor_registration_with_grouped_categories(self):
        """Test vendor registration with categories from different groups"""
        vendor_data = {
            "name": "TEST_Vendor_MultiGroup",
            "phone": "9876500003",
            "categories": [
                "Architect",  # Design & Engineering
                "Civil Works",  # Execution
                "Cement & TMT",  # Material Suppliers
                "QAQC Labs",  # Specialized Services
                "Machinery Rental (JCB, Excavators)"  # Equipment & Rentals
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/vendors", json=vendor_data)
        assert response.status_code == 200
        result = response.json()
        
        assert "vendor_id" in result
        print(f"SUCCESS: Vendor registered with multi-group categories, ID: {result['vendor_id']}")
    
    def test_vendor_registration_with_other_category(self):
        """Test vendor registration with 'Other' category and custom text"""
        vendor_data = {
            "name": "TEST_Vendor_Other",
            "phone": "9876500004",
            "categories": ["Other: Custom Service Type"]
        }
        
        response = requests.post(f"{BASE_URL}/api/vendors", json=vendor_data)
        assert response.status_code == 200
        result = response.json()
        
        assert "vendor_id" in result
        print(f"SUCCESS: Vendor registered with 'Other' category, ID: {result['vendor_id']}")
    
    def test_vendor_registration_with_document_data(self):
        """Test vendor registration with base64 encoded document"""
        # Create a simple base64 encoded test data (simulating a small file)
        test_content = b"This is a test brochure content"
        base64_data = base64.b64encode(test_content).decode('utf-8')
        
        vendor_data = {
            "name": "TEST_Vendor_WithDoc",
            "phone": "9876500005",
            "categories": ["Interior Designer"],
            "document_data": f"data:application/pdf;base64,{base64_data}"
        }
        
        response = requests.post(f"{BASE_URL}/api/vendors", json=vendor_data)
        assert response.status_code == 200
        result = response.json()
        
        assert "vendor_id" in result
        print(f"SUCCESS: Vendor registered with document_data, ID: {result['vendor_id']}")
    
    def test_vendor_registration_without_optional_fields(self):
        """Test that company_name, email, and attachment are all optional"""
        vendor_data = {
            "name": "TEST_Vendor_NoOptional",
            "phone": "9876500006",
            "categories": ["Electrician"]
            # No company_name, email, website, description, or document_data
        }
        
        response = requests.post(f"{BASE_URL}/api/vendors", json=vendor_data)
        assert response.status_code == 200
        result = response.json()
        
        assert "vendor_id" in result
        print("SUCCESS: Vendor registration works without optional fields")


class TestPartnerDashboard:
    """Test partner dashboard shows leads correctly"""
    
    @pytest.fixture
    def partner_token(self):
        """Get partner auth token"""
        response = requests.post(f"{BASE_URL}/api/partner/login", json={
            "phone": DEMO_PARTNER_PHONE,
            "password": DEMO_PARTNER_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_partner_dashboard_stats(self, partner_token):
        """Test partner dashboard returns correct stats"""
        response = requests.get(
            f"{BASE_URL}/api/partner/dashboard",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "partner" in data
        assert "stats" in data
        assert data["partner"]["referral_code"] == DEMO_PARTNER_REFERRAL_CODE
        
        stats = data["stats"]
        assert "total_leads" in stats
        assert "new_leads" in stats
        assert "converted" in stats
        
        print(f"SUCCESS: Partner dashboard stats - Total leads: {stats['total_leads']}")
    
    def test_partner_leads_list(self, partner_token):
        """Test partner can see their referred leads"""
        response = requests.get(
            f"{BASE_URL}/api/partner/leads",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        
        assert response.status_code == 200
        leads = response.json()
        
        assert isinstance(leads, list)
        
        # All leads should have the partner's referral code
        for lead in leads:
            assert lead.get("referral_code") == DEMO_PARTNER_REFERRAL_CODE
        
        print(f"SUCCESS: Partner leads list returned {len(leads)} leads")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "running"
        print("SUCCESS: API is running")
    
    def test_packages_endpoint(self):
        """Test packages endpoint"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200
        data = response.json()
        assert "configs" in data
        assert "features" in data
        print("SUCCESS: Packages endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
