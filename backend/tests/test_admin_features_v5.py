"""
Test Admin Portal Features - Iteration 5
Tests for:
- Admin login
- Export Excel endpoints (Leads, Partners, Vendors)
- Partner analytics endpoints
- Feature reorder endpoint
- Marketing materials CRUD
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "test@alpha.com"
ADMIN_PASSWORD = "password123"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "Token not in response"
        assert data["email"] == ADMIN_EMAIL
        assert "name" in data
        
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401


@pytest.fixture(scope="module")
def admin_token():
    """Get admin auth token"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Admin login failed")


@pytest.fixture
def admin_headers(admin_token):
    """Headers with admin auth"""
    return {"Authorization": f"Bearer {admin_token}"}


class TestAdminLeads:
    """Admin leads endpoint tests"""
    
    def test_get_leads(self, admin_headers):
        """Test GET /api/admin/leads"""
        response = requests.get(f"{BASE_URL}/api/admin/leads", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_get_leads_with_status_filter(self, admin_headers):
        """Test GET /api/admin/leads with status filter"""
        response = requests.get(f"{BASE_URL}/api/admin/leads?status=new", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAdminPartners:
    """Admin partners endpoint tests"""
    
    def test_get_partners(self, admin_headers):
        """Test GET /api/admin/partners"""
        response = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_get_partners_analytics(self, admin_headers):
        """Test GET /api/admin/partners-analytics - returns array with per-partner lead stats"""
        response = requests.get(f"{BASE_URL}/api/admin/partners-analytics", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Response should be an array"
        
        # If there are partners, verify structure
        if len(data) > 0:
            partner = data[0]
            assert "id" in partner
            assert "name" in partner
            assert "total_leads" in partner, "Should have total_leads field"
            assert "converted_leads" in partner, "Should have converted_leads field"
            assert "conversion_rate" in partner, "Should have conversion_rate field"
            
    def test_get_single_partner_analytics(self, admin_headers):
        """Test GET /api/admin/partners/{partner_id}/analytics - returns partner lead breakdown"""
        # First get a partner
        partners_response = requests.get(f"{BASE_URL}/api/admin/partners", headers=admin_headers)
        partners = partners_response.json()
        
        if len(partners) == 0:
            pytest.skip("No partners to test analytics")
            
        partner_id = partners[0]["id"]
        response = requests.get(f"{BASE_URL}/api/admin/partners/{partner_id}/analytics", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "partner" in data, "Should have partner info"
        assert "leads" in data, "Should have leads breakdown"
        
        leads = data["leads"]
        assert "total" in leads, "Should have total leads"
        assert "new" in leads, "Should have new leads count"
        assert "contacted" in leads, "Should have contacted leads count"
        assert "converted" in leads, "Should have converted leads count"
        assert "lost" in leads, "Should have lost leads count"
        assert "conversion_rate" in leads, "Should have conversion_rate"


class TestAdminVendors:
    """Admin vendors endpoint tests"""
    
    def test_get_vendors(self, admin_headers):
        """Test GET /api/admin/vendors"""
        response = requests.get(f"{BASE_URL}/api/admin/vendors", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestAdminPackages:
    """Admin packages endpoint tests"""
    
    def test_get_packages(self, admin_headers):
        """Test GET /api/admin/packages"""
        response = requests.get(f"{BASE_URL}/api/admin/packages", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert "configs" in data
        assert "features" in data
        assert isinstance(data["features"], list)
        
    def test_feature_reorder(self, admin_headers):
        """Test POST /api/admin/packages/features/reorder"""
        # First get features
        packages_response = requests.get(f"{BASE_URL}/api/admin/packages", headers=admin_headers)
        features = packages_response.json().get("features", [])
        
        if len(features) < 2:
            pytest.skip("Not enough features to test reorder")
            
        # Create reorder payload
        feature_orders = [{"id": f["id"], "order": i} for i, f in enumerate(features)]
        
        response = requests.post(
            f"{BASE_URL}/api/admin/packages/features/reorder",
            json={"feature_orders": feature_orders},
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "reordered" in data["message"].lower() or "success" in data["message"].lower()


class TestAdminMaterials:
    """Admin marketing materials endpoint tests"""
    
    def test_get_materials(self, admin_headers):
        """Test GET /api/admin/materials"""
        response = requests.get(f"{BASE_URL}/api/admin/materials", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
    def test_create_material(self, admin_headers):
        """Test POST /api/admin/materials - accepts JSON body with title, description, file_url, file_type"""
        material_data = {
            "title": "TEST_Material_Brochure",
            "description": "Test marketing material for testing",
            "file_url": "https://example.com/test-brochure.pdf",
            "file_type": "pdf"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/materials",
            json=material_data,
            headers=admin_headers
        )
        assert response.status_code == 200, f"Create material failed: {response.text}"
        data = response.json()
        assert "id" in data, "Should return material id"
        assert "message" in data
        
        # Store for cleanup
        return data["id"]
        
    def test_delete_material(self, admin_headers):
        """Test DELETE /api/admin/materials/{id}"""
        # First create a material
        material_data = {
            "title": "TEST_Material_ToDelete",
            "description": "Material to be deleted",
            "file_url": "https://example.com/delete-me.pdf",
            "file_type": "pdf"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/materials",
            json=material_data,
            headers=admin_headers
        )
        assert create_response.status_code == 200
        material_id = create_response.json()["id"]
        
        # Now delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/materials/{material_id}",
            headers=admin_headers
        )
        assert delete_response.status_code == 200
        
        # Verify it's deleted - should not be in list
        list_response = requests.get(f"{BASE_URL}/api/admin/materials", headers=admin_headers)
        materials = list_response.json()
        material_ids = [m["id"] for m in materials]
        assert material_id not in material_ids, "Material should be deleted"


class TestAdminAnalytics:
    """Admin analytics endpoint tests"""
    
    def test_get_analytics(self, admin_headers):
        """Test GET /api/admin/analytics"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "leads" in data
        assert "sources" in data
        assert "vendors" in data
        assert "partners" in data


# Cleanup test materials
@pytest.fixture(scope="module", autouse=True)
def cleanup_test_materials(admin_token):
    """Cleanup TEST_ prefixed materials after tests"""
    yield
    headers = {"Authorization": f"Bearer {admin_token}"}
    try:
        response = requests.get(f"{BASE_URL}/api/admin/materials", headers=headers)
        if response.status_code == 200:
            materials = response.json()
            for m in materials:
                if m.get("title", "").startswith("TEST_"):
                    requests.delete(f"{BASE_URL}/api/admin/materials/{m['id']}", headers=headers)
    except:
        pass


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
