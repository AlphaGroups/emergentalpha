import requests
import sys
import json
from datetime import datetime

class AlphaGroupsAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.partner_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_email = f"test_admin_{datetime.now().strftime('%H%M%S')}@test.com"
        self.admin_password = "TestPass123!"
        self.partner_email = f"test_partner_{datetime.now().strftime('%H%M%S')}@test.com"
        self.partner_password = "PartnerPass123!"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token_type='admin'):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Use appropriate token based on type
        if token_type == 'admin' and self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
        elif token_type == 'partner' and self.partner_token:
            test_headers['Authorization'] = f'Bearer {self.partner_token}'
        
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
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_packages_endpoint(self):
        """Test packages endpoint - should return 4 package configs with features"""
        success, response = self.run_test("Get Packages", "GET", "packages", 200, token_type=None)
        if success:
            # Verify new package structure with configs and features
            if 'configs' not in response or 'features' not in response:
                print(f"❌ Missing configs or features in response")
                return False
            
            configs = response['configs']
            features = response['features']
            
            # Check for 4 package types
            expected_packages = ['classic', 'select', 'signature', 'customize']
            found_packages = [config['name'] for config in configs]
            
            for pkg in expected_packages:
                if pkg not in found_packages:
                    print(f"❌ Missing package: {pkg}")
                    return False
            
            print(f"✅ Found {len(configs)} package configs and {len(features)} features")
            return True
        return success

    def test_calculate_endpoint(self):
        """Test cost calculation endpoint"""
        test_data = {
            "plot_area": 2400,
            "project_type": "independent_house",
            "package_type": "select"
        }
        success, response = self.run_test("Calculate Cost", "POST", "calculate", 200, test_data, token_type=None)
        if success:
            required_fields = ['plot_area', 'project_type', 'package_type', 'base_rate', 'estimated_cost']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing field in calculation response: {field}")
                    return False
            print(f"✅ Calculation result: ₹{response['estimated_cost']:,.0f}")
        return success

    def test_invalid_calculate(self):
        """Test calculation with invalid data"""
        test_data = {
            "plot_area": 2400,
            "project_type": "invalid_type",
            "package_type": "select"
        }
        return self.run_test("Calculate Invalid Type", "POST", "calculate", 400, test_data, token_type=None)

    def test_create_lead(self):
        """Test lead creation"""
        test_data = {
            "name": "Test User",
            "phone": "9876543210",
            "email": "test@example.com",
            "project_type": "Independent House",
            "location": "Gachibowli",
            "message": "Test lead creation"
        }
        success, response = self.run_test("Create Lead", "POST", "leads", 200, test_data, token_type=None)
        if success and 'id' in response:
            print(f"✅ Lead created with ID: {response['id']}")
            return response['id']
        return None

    def test_quote_request(self):
        """Test quote request submission"""
        test_data = {
            "name": "Test Quote User",
            "phone": "9876543211",
            "email": "quote@example.com",
            "project_type": "villa",
            "plot_area": 3000,
            "package_type": "luxury",
            "location": "Jubilee Hills",
            "estimated_cost": 8850000,
            "message": "Test quote request"
        }
        success, response = self.run_test("Create Quote Request", "POST", "quote-request", 200, test_data, token_type=None)
        if success and 'id' in response:
            print(f"✅ Quote request created with ID: {response['id']}")
            return response['id']
        return None

    def test_admin_register(self):
        """Test admin registration"""
        test_data = {
            "name": "Test Admin",
            "email": self.admin_email,
            "password": self.admin_password
        }
        success, response = self.run_test("Admin Register", "POST", "admin/register", 200, test_data, token_type=None)
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"✅ Admin registered and token obtained")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        test_data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        success, response = self.run_test("Admin Login", "POST", "admin/login", 200, test_data, token_type=None)
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"✅ Admin login successful")
            return True
        return False

    def test_admin_profile(self):
        """Test admin profile endpoint"""
        if not self.admin_token:
            print("❌ No admin token available for admin profile test")
            return False
        return self.run_test("Admin Profile", "GET", "admin/me", 200, token_type='admin')[0]

    def test_admin_analytics(self):
        """Test admin analytics endpoint"""
        if not self.admin_token:
            print("❌ No admin token available for analytics test")
            return False
        success, response = self.run_test("Admin Analytics", "GET", "admin/analytics", 200, token_type='admin')
        if success:
            # Check for new analytics structure
            required_sections = ['leads', 'sources', 'collaboration', 'vendors', 'partners', 'listings']
            for section in required_sections:
                if section not in response:
                    print(f"❌ Missing analytics section: {section}")
                    return False
            print(f"✅ Analytics: {response['leads']['total']} total leads, {response['partners']['total']} partners")
        return success

    def test_admin_leads(self):
        """Test admin leads endpoint"""
        if not self.admin_token:
            print("❌ No admin token available for leads test")
            return False
        success, response = self.run_test("Admin Get Leads", "GET", "admin/leads", 200, token_type='admin')
        if success:
            print(f"✅ Retrieved {len(response)} leads")
            return response
        return []

    def test_lead_update(self, lead_id):
        """Test lead status update"""
        if not self.admin_token or not lead_id:
            print("❌ No admin token or lead ID available for update test")
            return False
        
        test_data = {"status": "contacted", "notes": "Test update"}
        return self.run_test(f"Update Lead {lead_id}", "PATCH", f"admin/leads/{lead_id}", 200, test_data, token_type='admin')[0]

    def test_unauthorized_access(self):
        """Test unauthorized access to admin endpoints"""
        old_token = self.admin_token
        self.admin_token = None
        success = self.run_test("Unauthorized Analytics", "GET", "admin/analytics", 401, token_type='admin')[0]
        self.admin_token = old_token
        return not success  # Should fail with 401

    # NEW API TESTS FOR UPDATED FEATURES
    
    def test_collaboration_leads(self):
        """Test collaboration lead creation"""
        test_data = {
            "name": "Test Landowner",
            "phone": "9876543212",
            "email": "landowner@test.com",
            "land_location": "Gachibowli, Hyderabad",
            "land_size": "500 sq.yards",
            "intent": "landowner",
            "message": "Interested in joint development"
        }
        success, response = self.run_test("Create Collaboration Lead", "POST", "collaboration/leads", 200, test_data, token_type=None)
        if success and 'id' in response:
            print(f"✅ Collaboration lead created with ID: {response['id']}")
            return response['id']
        return None

    def test_vendor_registration(self):
        """Test vendor registration"""
        test_data = {
            "name": "Test Contractor",
            "company_name": "Test Construction Co",
            "phone": "9876543213",
            "email": "contractor@test.com",
            "website": "https://testconstruction.com",
            "categories": ["Contractor", "Material Supplier"],
            "description": "Experienced construction contractor with 10+ years"
        }
        success, response = self.run_test("Register Vendor", "POST", "vendors", 200, test_data, token_type=None)
        if success and 'vendor_id' in response:
            print(f"✅ Vendor registered with ID: {response['vendor_id']}")
            return response['vendor_id']
        return None

    def test_referral_terms(self):
        """Test referral terms endpoint"""
        success, response = self.run_test("Get Referral Terms", "GET", "referral-terms", 200, token_type=None)
        if success:
            required_fields = ['commission_percent', 'validity_days', 'payment_timeline_days', 'terms_content']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing referral terms field: {field}")
                    return False
            print(f"✅ Referral terms: {response['commission_percent']}% commission")
        return success

    def test_listings_endpoint(self):
        """Test sales listings endpoint"""
        success, response = self.run_test("Get Listings", "GET", "listings", 200, token_type=None)
        if success:
            print(f"✅ Retrieved {len(response)} listings")
            return response
        return []

    def test_admin_packages(self):
        """Test admin packages management"""
        if not self.admin_token:
            print("❌ No admin token available for packages test")
            return False
        success, response = self.run_test("Admin Get Packages", "GET", "admin/packages", 200, token_type='admin')
        if success:
            if 'configs' not in response or 'features' not in response:
                print(f"❌ Missing configs or features in admin packages response")
                return False
            print(f"✅ Admin packages: {len(response['configs'])} configs, {len(response['features'])} features")
        return success

    def test_admin_partners(self):
        """Test admin partners management"""
        if not self.admin_token:
            print("❌ No admin token available for partners test")
            return False
        success, response = self.run_test("Admin Get Partners", "GET", "admin/partners", 200, token_type='admin')
        if success:
            print(f"✅ Retrieved {len(response)} partners")
            return response
        return []

    def test_create_partner(self):
        """Test partner creation by admin"""
        if not self.admin_token:
            print("❌ No admin token available for partner creation")
            return False
        
        test_data = {
            "name": "Test Partner",
            "email": self.partner_email,
            "phone": "9876543214",
            "password": self.partner_password,
            "commission_percent": 2.5
        }
        success, response = self.run_test("Create Partner", "POST", "admin/partners", 200, test_data, token_type='admin')
        if success and 'referral_code' in response:
            print(f"✅ Partner created with referral code: {response['referral_code']}")
            return response
        return None

    def test_partner_login(self):
        """Test partner login"""
        test_data = {
            "email": self.partner_email,
            "password": self.partner_password
        }
        success, response = self.run_test("Partner Login", "POST", "partner/login", 200, test_data, token_type=None)
        if success and 'token' in response:
            self.partner_token = response['token']
            print(f"✅ Partner login successful")
            return True
        return False

    def test_partner_dashboard(self):
        """Test partner dashboard"""
        if not self.partner_token:
            print("❌ No partner token available for dashboard test")
            return False
        success, response = self.run_test("Partner Dashboard", "GET", "partner/dashboard", 200, token_type='partner')
        if success:
            required_sections = ['partner', 'stats']
            for section in required_sections:
                if section not in response:
                    print(f"❌ Missing dashboard section: {section}")
                    return False
            print(f"✅ Partner dashboard: {response['stats']['total_leads']} leads")
        return success

def main():
    print("🚀 Starting Alpha Groups API Tests - Enhanced Version")
    print("=" * 60)
    
    tester = AlphaGroupsAPITester()
    
    # Test public endpoints
    print("\n📋 Testing Public Endpoints")
    tester.test_root_endpoint()
    tester.test_packages_endpoint()
    tester.test_calculate_endpoint()
    tester.test_invalid_calculate()
    
    # Test new public endpoints
    print("\n🏢 Testing New Public Endpoints")
    tester.test_referral_terms()
    tester.test_listings_endpoint()
    
    # Test lead creation
    print("\n👥 Testing Lead Management")
    lead_id = tester.test_create_lead()
    quote_id = tester.test_quote_request()
    collab_id = tester.test_collaboration_leads()
    vendor_id = tester.test_vendor_registration()
    
    # Test admin authentication
    print("\n🔐 Testing Admin Authentication")
    if tester.test_admin_register():
        tester.test_admin_login()
        tester.test_admin_profile()
        
        # Test admin endpoints
        print("\n📊 Testing Admin Endpoints")
        tester.test_admin_analytics()
        leads = tester.test_admin_leads()
        tester.test_admin_packages()
        partners = tester.test_admin_partners()
        
        # Test partner creation and login
        print("\n🤝 Testing Partner Management")
        partner_data = tester.test_create_partner()
        if partner_data:
            if tester.test_partner_login():
                tester.test_partner_dashboard()
        
        # Test lead update if we have leads
        if leads and len(leads) > 0:
            tester.test_lead_update(leads[0]['id'])
        elif lead_id:
            tester.test_lead_update(lead_id)
    
    # Test security
    print("\n🔒 Testing Security")
    tester.test_unauthorized_access()
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())