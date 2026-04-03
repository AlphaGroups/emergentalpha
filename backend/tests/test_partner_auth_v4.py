"""
Partner Auth System Tests - Iteration 4
Testing new partner auth flows:
1. Registration with password (Name*, Phone*, Email optional, Password*)
2. Login with phone+password
3. Login with phone+OTP
4. Forgot password with OTP reset
"""
import pytest
import requests
import os
import random
import string

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://proptech-platform-10.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

# Generate unique test data
def random_phone():
    return f"98765{random.randint(10000, 99999)}"

def random_email():
    return f"test_{random.randint(10000, 99999)}@example.com"


class TestPartnerRegistrationWithPassword:
    """Test partner registration now requires password"""
    
    def test_register_with_password_sends_otp(self):
        """POST /api/partner/register with name, phone, password sends OTP"""
        phone = random_phone()
        payload = {
            "name": "Test Partner",
            "phone": phone,
            "email": "",  # Optional
            "password": "testpass123"
        }
        response = requests.post(f"{API}/partner/register", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify mocked OTP is returned
        assert data.get("mock_otp") == "123456", "Mocked OTP should be 123456"
        assert "OTP sent" in data.get("message", "")
        print(f"SUCCESS: Partner registration with password sends OTP: {data['mock_otp']}")
        return phone
    
    def test_register_with_optional_email(self):
        """POST /api/partner/register works with optional email"""
        phone = random_phone()
        payload = {
            "name": "No Email Partner",
            "phone": phone,
            "password": "testpass123"
            # email not provided
        }
        response = requests.post(f"{API}/partner/register", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("SUCCESS: Registration works without email")
    
    def test_register_duplicate_phone_fails(self):
        """POST /api/partner/register with existing phone fails"""
        # Use the pre-created test partner phone
        payload = {
            "name": "Duplicate Partner",
            "phone": "9876500001",  # Already exists from curl test
            "password": "testpass123"
        }
        response = requests.post(f"{API}/partner/register", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "already registered" in response.json().get("detail", "").lower()
        print("SUCCESS: Duplicate phone registration rejected")


class TestPartnerOTPVerification:
    """Test OTP verification creates account and auto-login"""
    
    def test_verify_otp_creates_account_and_returns_token(self):
        """POST /api/partner/verify-otp creates account and returns token (auto-login)"""
        # First register
        phone = random_phone()
        reg_payload = {
            "name": "Auto Login Partner",
            "phone": phone,
            "email": random_email(),
            "password": "autopass123"
        }
        reg_response = requests.post(f"{API}/partner/register", json=reg_payload)
        assert reg_response.status_code == 200
        
        # Verify OTP
        verify_payload = {
            "phone": phone,
            "otp": "123456"
        }
        response = requests.post(f"{API}/partner/verify-otp", json=verify_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Should return token for auto-login
        assert "token" in data, "Should return token for auto-login"
        assert "partner" in data, "Should return partner info"
        assert data["partner"]["phone"] == phone
        assert "referral_code" in data["partner"]
        print(f"SUCCESS: OTP verification returns token (auto-login), referral code: {data['partner']['referral_code']}")
        return data["token"], phone
    
    def test_verify_wrong_otp_fails(self):
        """POST /api/partner/verify-otp with wrong OTP fails"""
        phone = random_phone()
        reg_payload = {
            "name": "Wrong OTP Partner",
            "phone": phone,
            "password": "wrongotp123"
        }
        requests.post(f"{API}/partner/register", json=reg_payload)
        
        verify_payload = {
            "phone": phone,
            "otp": "999999"  # Wrong OTP
        }
        response = requests.post(f"{API}/partner/verify-otp", json=verify_payload)
        assert response.status_code == 400
        assert "Invalid OTP" in response.json().get("detail", "")
        print("SUCCESS: Wrong OTP correctly rejected")


class TestPartnerLoginWithPassword:
    """Test partner login with phone+password"""
    
    def test_login_with_phone_password(self):
        """POST /api/partner/login with phone+password returns token"""
        # Use pre-created test partner
        payload = {
            "phone": "9876500001",
            "password": "newpass123"
        }
        response = requests.post(f"{API}/partner/login", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "token" in data, "Should return token"
        assert "partner" in data, "Should return partner info"
        assert data["partner"]["phone"] == "9876500001"
        print(f"SUCCESS: Login with phone+password works, partner: {data['partner']['name']}")
        return data["token"]
    
    def test_login_wrong_password_fails(self):
        """POST /api/partner/login with wrong password fails"""
        payload = {
            "phone": "9876500001",
            "password": "wrongpassword"
        }
        response = requests.post(f"{API}/partner/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Wrong password correctly rejected")
    
    def test_login_nonexistent_phone_fails(self):
        """POST /api/partner/login with non-existent phone fails"""
        payload = {
            "phone": "0000000000",
            "password": "anypassword"
        }
        response = requests.post(f"{API}/partner/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Non-existent phone login rejected")


class TestPartnerLoginWithOTP:
    """Test partner login with phone+OTP"""
    
    def test_request_login_otp(self):
        """POST /api/partner/login-otp sends OTP for existing partner"""
        payload = {"phone": "9876500001"}
        response = requests.post(f"{API}/partner/login-otp", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("mock_otp") == "123456"
        assert "OTP sent" in data.get("message", "")
        print("SUCCESS: Login OTP sent")
    
    def test_request_login_otp_nonexistent_phone_fails(self):
        """POST /api/partner/login-otp with non-existent phone fails"""
        payload = {"phone": "0000000000"}
        response = requests.post(f"{API}/partner/login-otp", json=payload)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Login OTP for non-existent phone rejected")
    
    def test_verify_login_otp(self):
        """POST /api/partner/login-otp-verify returns token"""
        # First request OTP
        phone = "9876500001"
        requests.post(f"{API}/partner/login-otp", json={"phone": phone})
        
        # Verify OTP
        payload = {
            "phone": phone,
            "otp": "123456"
        }
        response = requests.post(f"{API}/partner/login-otp-verify", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "partner" in data
        print(f"SUCCESS: OTP login verification returns token")
    
    def test_verify_login_wrong_otp_fails(self):
        """POST /api/partner/login-otp-verify with wrong OTP fails"""
        phone = "9876500001"
        requests.post(f"{API}/partner/login-otp", json={"phone": phone})
        
        payload = {
            "phone": phone,
            "otp": "999999"
        }
        response = requests.post(f"{API}/partner/login-otp-verify", json=payload)
        assert response.status_code == 400
        print("SUCCESS: Wrong login OTP rejected")


class TestPartnerPasswordReset:
    """Test forgot password flow with OTP"""
    
    def test_request_reset_otp(self):
        """POST /api/partner/reset-password sends reset OTP"""
        payload = {"phone": "9876500001"}
        response = requests.post(f"{API}/partner/reset-password", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data.get("mock_otp") == "123456"
        assert "OTP sent" in data.get("message", "")
        print("SUCCESS: Reset OTP sent")
    
    def test_request_reset_nonexistent_phone_fails(self):
        """POST /api/partner/reset-password with non-existent phone fails"""
        payload = {"phone": "0000000000"}
        response = requests.post(f"{API}/partner/reset-password", json=payload)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("SUCCESS: Reset OTP for non-existent phone rejected")
    
    def test_confirm_reset_password(self):
        """POST /api/partner/reset-password-confirm resets password"""
        phone = "9876500001"
        
        # Request reset OTP
        requests.post(f"{API}/partner/reset-password", json={"phone": phone})
        
        # Confirm reset with new password
        payload = {
            "phone": phone,
            "otp": "123456",
            "new_password": "newpass123"  # Reset back to original
        }
        response = requests.post(f"{API}/partner/reset-password-confirm", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "Password reset successful" in data.get("message", "")
        print("SUCCESS: Password reset confirmed")
        
        # Verify can login with new password
        login_response = requests.post(f"{API}/partner/login", json={
            "phone": phone,
            "password": "newpass123"
        })
        assert login_response.status_code == 200, "Should be able to login with new password"
        print("SUCCESS: Can login with reset password")
    
    def test_confirm_reset_wrong_otp_fails(self):
        """POST /api/partner/reset-password-confirm with wrong OTP fails"""
        phone = "9876500001"
        requests.post(f"{API}/partner/reset-password", json={"phone": phone})
        
        payload = {
            "phone": phone,
            "otp": "999999",
            "new_password": "newpass456"
        }
        response = requests.post(f"{API}/partner/reset-password-confirm", json=payload)
        assert response.status_code == 400
        print("SUCCESS: Wrong reset OTP rejected")


class TestPartnerDashboardAccess:
    """Test partner dashboard requires valid token"""
    
    def test_dashboard_with_valid_token(self):
        """GET /api/partner/dashboard with valid token returns data"""
        # Login first
        login_response = requests.post(f"{API}/partner/login", json={
            "phone": "9876500001",
            "password": "newpass123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Access dashboard
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API}/partner/dashboard", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "partner" in data
        assert "stats" in data
        print(f"SUCCESS: Dashboard access with valid token, stats: {data['stats']}")
    
    def test_dashboard_without_token_fails(self):
        """GET /api/partner/dashboard without token fails"""
        response = requests.get(f"{API}/partner/dashboard")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("SUCCESS: Dashboard access without token rejected")


class TestFullPartnerFlow:
    """Test complete partner registration -> login -> logout -> login flow"""
    
    def test_full_registration_flow(self):
        """Full flow: Register -> OTP verify -> auto-login -> access dashboard"""
        phone = random_phone()
        
        # 1. Register
        reg_payload = {
            "name": "Full Flow Partner",
            "phone": phone,
            "email": random_email(),
            "password": "fullflow123"
        }
        reg_response = requests.post(f"{API}/partner/register", json=reg_payload)
        assert reg_response.status_code == 200
        print(f"Step 1: Registered with phone {phone}")
        
        # 2. Verify OTP (auto-login)
        verify_response = requests.post(f"{API}/partner/verify-otp", json={
            "phone": phone,
            "otp": "123456"
        })
        assert verify_response.status_code == 200
        token = verify_response.json()["token"]
        print("Step 2: OTP verified, got token (auto-login)")
        
        # 3. Access dashboard
        headers = {"Authorization": f"Bearer {token}"}
        dashboard_response = requests.get(f"{API}/partner/dashboard", headers=headers)
        assert dashboard_response.status_code == 200
        print("Step 3: Dashboard accessed successfully")
        
        # 4. Login again with password (simulating logout and re-login)
        login_response = requests.post(f"{API}/partner/login", json={
            "phone": phone,
            "password": "fullflow123"
        })
        assert login_response.status_code == 200
        print("Step 4: Re-login with password successful")
        
        print("SUCCESS: Full registration flow completed!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
