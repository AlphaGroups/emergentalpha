from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import string
import database as db

ROOT_DIR = Path(__file__).parent
node_env = os.getenv('NODE_ENV', 'development')
env_file = ROOT_DIR / f'.env.{node_env}'
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===================== MODELS =====================

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    project_type: str
    plot_area: Optional[float] = None
    location: Optional[str] = None
    budget: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"
    referral_code: Optional[str] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    deal_value: Optional[float] = None

class PackageFeatureCreate(BaseModel):
    name: str
    classic: str
    select: str
    signature: str
    customize: str
    order: Optional[int] = 0

class PackageConfigUpdate(BaseModel):
    description: Optional[str] = None
    price_per_sft: Optional[float] = None
    is_visible: Optional[bool] = None

class PartnerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    commission_percent: float = 2.0

class PartnerLogin(BaseModel):
    phone: str
    password: str

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    commission_percent: Optional[float] = None
    account_manager: Optional[str] = None
    is_active: Optional[bool] = None

class ReferralTerms(BaseModel):
    id: str = "referral_terms"
    commission_percent: float = 2.0
    validity_days: int = 90
    payment_timeline_days: int = 30
    terms_content: str = ""
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CollaborationLeadCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    land_location: str
    land_size: str
    intent: str
    message: Optional[str] = None

class SalesListingCreate(BaseModel):
    title: str
    property_type: str
    location: str
    price: float
    area_sqft: float
    bedrooms: int
    bathrooms: int
    description: str
    images: List[str] = []
    status: str = "available"
    owner_type: str = "alpha"
    partner_id: Optional[str] = None
    amenities: List[str] = []
    is_featured: bool = False

class SalesListingUpdate(BaseModel):
    title: Optional[str] = None
    property_type: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    area_sqft: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
    owner_type: Optional[str] = None
    partner_id: Optional[str] = None
    amenities: Optional[List[str]] = None
    is_featured: Optional[bool] = None

class VendorCreate(BaseModel):
    name: str
    company_name: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    website: Optional[str] = None
    categories: List[str] = []
    description: Optional[str] = None
    document_data: Optional[str] = None

class QuickLeadCreate(BaseModel):
    name: str
    phone: str
    location: Optional[str] = ""
    requirement: Optional[str] = ""

class PartnerRegister(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    password: str

class PartnerOTPVerify(BaseModel):
    phone: str
    otp: str

class PartnerOTPLogin(BaseModel):
    phone: str

class PartnerOTPLoginVerify(BaseModel):
    phone: str
    otp: str

class PartnerResetRequest(BaseModel):
    phone: str

class PartnerResetConfirm(BaseModel):
    phone: str
    otp: str
    new_password: str

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminCreate(BaseModel):
    email: str
    password: str
    name: str

class QuoteRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    project_type: str
    plot_area: float
    package_type: str
    location: str
    estimated_cost: float
    message: Optional[str] = None
    referral_code: Optional[str] = None

class CalculatorInput(BaseModel):
    plot_area: float
    project_type: str
    package_type: str

# ===================== HELPERS =====================

def _uuid():
    return str(uuid.uuid4())

def _now():
    return datetime.now(timezone.utc).isoformat()

def generate_referral_code():
    return 'AG' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def create_token(sub: str, role: str = "admin") -> str:
    payload = {
        "sub": sub,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload["sub"]

def verify_partner_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    if payload.get("role") != "partner":
        raise HTTPException(status_code=403, detail="Partner access required")
    return payload["sub"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# ===================== SEED DATA =====================

def seed_default_packages():
    existing = db.query_one('SELECT id FROM package_configs WHERE name = %s', ('classic',))
    if existing:
        return
    configs = [
        {"id": _uuid(), "name": "classic", "description": "Essential quality construction", "price_per_sft": 1899, "is_visible": True, "order": 1},
        {"id": _uuid(), "name": "select", "description": "Enhanced specifications", "price_per_sft": 2199, "is_visible": True, "order": 2},
        {"id": _uuid(), "name": "signature", "description": "Premium luxury finishes", "price_per_sft": 2599, "is_visible": True, "order": 3},
        {"id": _uuid(), "name": "customize", "description": "Tailored to your needs", "price_per_sft": 0, "is_visible": True, "order": 4},
    ]
    db.insert_many("package_configs", configs)

    features = [
        {"id": _uuid(), "name": "Steel", "classic": "Tata/JSW Fe500", "select": "Tata Tiscon Fe500D", "signature": "Tata Tiscon Super", "customize": "As per choice", "order": 1},
        {"id": _uuid(), "name": "Cement", "classic": "UltraTech OPC 53", "select": "UltraTech Premium", "signature": "ACC Gold", "customize": "As per choice", "order": 2},
        {"id": _uuid(), "name": "Aggregates", "classic": "20mm & River Sand", "select": "20mm & M-Sand", "signature": "Premium Crushed", "customize": "As per choice", "order": 3},
        {"id": _uuid(), "name": "Blocks/Bricks", "classic": "Standard Red Bricks", "select": "AAC Blocks", "signature": "Premium AAC", "customize": "As per choice", "order": 4},
        {"id": _uuid(), "name": "Flooring", "classic": "Vitrified 2x2", "select": "Granite/Marble", "signature": "Italian Marble", "customize": "As per choice", "order": 5},
        {"id": _uuid(), "name": "Bathroom Tiles", "classic": "Standard Ceramic", "select": "Premium Ceramic", "signature": "Designer Tiles", "customize": "As per choice", "order": 6},
        {"id": _uuid(), "name": "Sanitary", "classic": "Hindware Standard", "select": "Hindware Premium", "signature": "Jaquar/Kohler", "customize": "As per choice", "order": 7},
        {"id": _uuid(), "name": "Electrical", "classic": "Finolex Wires", "select": "Havells", "signature": "Schneider", "customize": "As per choice", "order": 8},
        {"id": _uuid(), "name": "Switches", "classic": "Anchor Roma", "select": "Legrand", "signature": "Schneider Modular", "customize": "As per choice", "order": 9},
        {"id": _uuid(), "name": "Plumbing", "classic": "Astral CPVC", "select": "Supreme CPVC", "signature": "Ashirvad/Prince", "customize": "As per choice", "order": 10},
        {"id": _uuid(), "name": "Doors (Main)", "classic": "Teak Frame + Flush", "select": "Teak Frame + Panel", "signature": "Full Teak Wood", "customize": "As per choice", "order": 11},
        {"id": _uuid(), "name": "Windows", "classic": "Aluminium Sliding", "select": "uPVC Standard", "signature": "uPVC Premium", "customize": "As per choice", "order": 12},
        {"id": _uuid(), "name": "Paints (Interior)", "classic": "Asian Tractor", "select": "Asian Royale", "signature": "Asian Ultima", "customize": "As per choice", "order": 13},
        {"id": _uuid(), "name": "Paints (Exterior)", "classic": "Asian Ace", "select": "Asian Apex", "signature": "Asian Ultima Protek", "customize": "As per choice", "order": 14},
        {"id": _uuid(), "name": "Kitchen", "classic": "Granite Top", "select": "SS Sink + Granite", "signature": "Modular Kitchen", "customize": "As per choice", "order": 15},
        {"id": _uuid(), "name": "Warranty", "classic": "1 Year", "select": "2 Years", "signature": "3 Years", "customize": "Negotiable", "order": 16},
    ]
    db.insert_many("package_features", features)
    logger.info("Default packages seeded")

def seed_referral_terms():
    existing = db.query_one('SELECT id FROM referral_terms WHERE id = %s', ('referral_terms',))
    if existing:
        return
    terms = {
        "id": "referral_terms",
        "commission_percent": 2.0,
        "validity_days": 90,
        "payment_timeline_days": 30,
        "terms_content": """**Alpha Groups Referral Program - Terms & Conditions**

1. Referral partners will earn a commission based on a percentage of the final project value, as determined by Alpha Groups.

2. Referral commission is applicable only when:
   - The referred client signs an agreement with Alpha Groups
   - Payment is received from the client

3. No commission will be paid for:
   - Duplicate leads
   - Self-referrals
   - Invalid or unverifiable leads

4. Referral validity is limited to 90 days from the date of submission.

5. Payment of referral earnings will be processed within 30 days from receipt of client payment.

6. Alpha Groups reserves the right to:
   - Approve or reject any referral
   - Modify commission percentages
   - Update program terms at any time

7. In case of disputes, the decision of Alpha Groups will be final and binding.

8. Referral partners are expected to maintain ethical practices and represent the brand responsibly.

9. This program is intended purely for business promotion and does not constitute employment or partnership.""",
        "updated_at": _now()
    }
    db.insert("referral_terms", terms)
    logger.info("Referral terms seeded")

def seed_demo_partner():
    existing = db.query_one('SELECT id FROM partners WHERE phone = %s', ('9876543210',))
    if existing:
        return
    db.insert("partners", {
        "id": _uuid(),
        "name": "Demo Partner",
        "email": "partner@alpha.com",
        "phone": "9876543210",
        "password": hash_password("partner123"),
        "referral_code": "AGDEMO01",
        "commission_percent": 2.0,
        "is_active": True,
        "created_at": _now()
    })
    logger.info("Demo partner seeded")

def seed_demo_admin():
    existing = db.query_one('SELECT * FROM admins WHERE email = %s', ('test@alpha.com',))
    if not existing:
        db.insert("admins", {
            "id": _uuid(),
            "name": "Alpha Admin",
            "email": "test@alpha.com",
            "password": hash_password("password123"),
            "role": "admin",
            "created_at": _now()
        })
        logger.info("Demo admin seeded")
    else:
        if not verify_password("password123", existing.get("password", "")):
            db.execute('UPDATE admins SET password = %s WHERE email = %s', (hash_password("password123"), "test@alpha.com"))
            logger.info("Demo admin password reset")

@app.on_event("startup")
def startup_event():
    try:
        seed_default_packages()
        seed_referral_terms()
        seed_demo_partner()
        seed_demo_admin()
        logger.info("Startup seeding complete")
    except Exception as e:
        logger.error(f"Startup seed failed: {e}")

# ===================== PUBLIC ROUTES =====================

@api_router.get("/")
def root():
    return {"message": "Alpha Groups API", "status": "running"}

@api_router.get("/packages")
def get_packages():
    configs = db.query('SELECT * FROM package_configs WHERE is_visible = true ORDER BY "order" ASC')
    features = db.query('SELECT * FROM package_features ORDER BY "order" ASC')
    if not configs:
        seed_default_packages()
        configs = db.query('SELECT * FROM package_configs WHERE is_visible = true ORDER BY "order" ASC')
        features = db.query('SELECT * FROM package_features ORDER BY "order" ASC')
    return {"configs": configs, "features": features}

VALID_PROJECT_TYPES = ["independent_house", "villa", "apartment", "school", "interior"]
VALID_PACKAGE_TYPES = ["classic", "select", "signature", "customize"]

@api_router.post("/calculate")
def calculate_cost(calc_input: CalculatorInput):
    if calc_input.project_type.lower() not in VALID_PROJECT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid project type")
    pkg = calc_input.package_type.lower()
    if pkg not in VALID_PACKAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid package type")
    config = db.query_one('SELECT price_per_sft FROM package_configs WHERE name = %s', (pkg,))
    if not config:
        raise HTTPException(status_code=400, detail="Invalid package type")
    base_rate = config["price_per_sft"] or 2299
    if base_rate == 0:
        base_rate = 2299
    cost = calc_input.plot_area * base_rate
    return {
        "plot_area": calc_input.plot_area,
        "project_type": calc_input.project_type,
        "package_type": calc_input.package_type,
        "base_rate": base_rate,
        "estimated_cost": cost,
        "min_estimate": cost * 0.95,
        "max_estimate": cost * 1.10
    }

# ===================== LEADS (PUBLIC) =====================

@api_router.post("/leads")
def create_lead(lead_data: LeadCreate):
    lead_id = _uuid()
    partner_id = None
    if lead_data.referral_code:
        p = db.query_one('SELECT id FROM partners WHERE referral_code = %s', (lead_data.referral_code,))
        if p:
            partner_id = p["id"]
    doc = {
        "id": lead_id, "name": lead_data.name, "phone": lead_data.phone,
        "email": lead_data.email or "", "project_type": lead_data.project_type,
        "plot_area": lead_data.plot_area, "location": lead_data.location,
        "budget": lead_data.budget, "message": lead_data.message,
        "source": lead_data.source, "status": "new",
        "referral_code": lead_data.referral_code, "partner_id": partner_id,
        "created_at": _now()
    }
    db.insert("leads", doc)
    return doc

@api_router.post("/quote-request")
def create_quote_request(quote: QuoteRequest):
    lead_id = _uuid()
    partner_id = None
    if quote.referral_code:
        p = db.query_one('SELECT id FROM partners WHERE referral_code = %s', (quote.referral_code,))
        if p:
            partner_id = p["id"]
    doc = {
        "id": lead_id, "name": quote.name, "phone": quote.phone,
        "email": quote.email, "project_type": quote.project_type,
        "plot_area": quote.plot_area, "location": quote.location,
        "budget": f"₹{quote.estimated_cost:,.0f} ({quote.package_type})",
        "message": quote.message, "source": "calculator",
        "status": "new", "referral_code": quote.referral_code,
        "partner_id": partner_id, "created_at": _now()
    }
    db.insert("leads", doc)
    return doc

@api_router.post("/collaboration/leads")
def create_collaboration_lead(lead_data: CollaborationLeadCreate):
    doc = {
        "id": _uuid(), "name": lead_data.name, "phone": lead_data.phone,
        "email": lead_data.email, "land_location": lead_data.land_location,
        "land_size": lead_data.land_size, "intent": lead_data.intent,
        "message": lead_data.message, "status": "new", "created_at": _now()
    }
    db.insert("collaboration_leads", doc)
    return doc

@api_router.get("/listings")
def get_listings(status: Optional[str] = None, property_type: Optional[str] = None):
    sql = 'SELECT * FROM listings WHERE 1=1'
    params = []
    if status:
        sql += ' AND status = %s'
        params.append(status)
    if property_type:
        sql += ' AND property_type = %s'
        params.append(property_type)
    sql += ' ORDER BY created_at DESC'
    return db.query(sql, params or None)

@api_router.get("/listings/{listing_id}")
def get_listing(listing_id: str):
    row = db.query_one('SELECT * FROM listings WHERE id = %s', (listing_id,))
    if not row:
        raise HTTPException(status_code=404, detail="Listing not found")
    return row

@api_router.post("/vendors")
def register_vendor(vendor_data: VendorCreate):
    vendor_id = f"VND{random.randint(10000, 99999)}"
    doc_url = None
    if vendor_data.document_data:
        doc_url = f"data:application/pdf;base64,{vendor_data.document_data[:100]}..."
    doc = {
        "id": _uuid(), "vendor_id": vendor_id, "name": vendor_data.name,
        "company_name": vendor_data.company_name or "", "phone": vendor_data.phone,
        "email": vendor_data.email or "", "website": vendor_data.website,
        "categories": vendor_data.categories, "description": vendor_data.description,
        "document_url": doc_url, "status": "pending", "created_at": _now()
    }
    db.insert("vendors", doc)
    return {"vendor_id": vendor_id, "message": "Registration successful"}

@api_router.get("/referral-terms")
def get_referral_terms():
    terms = db.query_one('SELECT * FROM referral_terms WHERE id = %s', ('referral_terms',))
    if not terms:
        seed_referral_terms()
        terms = db.query_one('SELECT * FROM referral_terms WHERE id = %s', ('referral_terms',))
    return terms or {}

# ===================== PARTNER AUTH =====================

otp_store = {}

@api_router.post("/partner/register")
def partner_register(data: PartnerRegister):
    if db.query_one('SELECT id FROM partners WHERE phone = %s', (data.phone,)):
        raise HTTPException(status_code=400, detail="Phone number already registered")
    if data.email and db.query_one('SELECT id FROM partners WHERE email = %s', (data.email,)):
        raise HTTPException(status_code=400, detail="Email already registered")
    otp = "123456"
    otp_store[data.phone] = {"otp": otp, "data": data.model_dump(), "expires": datetime.now(timezone.utc) + timedelta(minutes=10)}
    return {"message": "OTP sent to your phone number", "mock_otp": otp}

@api_router.post("/partner/verify-otp")
def partner_verify_otp(verify: PartnerOTPVerify):
    stored = otp_store.get(verify.phone)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Please register again.")
    if stored["otp"] != verify.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.now(timezone.utc) > stored["expires"]:
        del otp_store[verify.phone]
        raise HTTPException(status_code=400, detail="OTP expired. Please register again.")
    reg = stored["data"]
    pid = _uuid()
    ref_code = generate_referral_code()
    db.insert("partners", {
        "id": pid, "name": reg["name"], "email": reg.get("email", ""),
        "phone": reg["phone"], "password": hash_password(reg["password"]),
        "referral_code": ref_code, "commission_percent": 2.0,
        "is_active": True, "created_at": _now()
    })
    del otp_store[verify.phone]
    token = create_token(reg["phone"], role="partner")
    return {
        "message": "Registration successful! Welcome to Alpha Groups Partner Program.",
        "token": token,
        "partner": {"id": pid, "name": reg["name"], "email": reg.get("email", ""), "phone": reg["phone"], "referral_code": ref_code}
    }

@api_router.post("/quick-lead")
def create_quick_lead(data: QuickLeadCreate):
    if not data.name or not data.phone:
        raise HTTPException(status_code=400, detail="Name and phone are required")
    lead_id = _uuid()
    db.insert("leads", {
        "id": lead_id, "name": data.name, "phone": data.phone, "email": "",
        "project_type": data.requirement or "general_inquiry",
        "location": data.location, "source": "homepage_cta", "status": "new",
        "created_at": _now()
    })
    return {"message": "Thank you! We'll call you back shortly.", "lead_id": lead_id}

@api_router.post("/partner/login")
def partner_login(creds: PartnerLogin):
    partner = db.query_one('SELECT * FROM partners WHERE phone = %s', (creds.phone,))
    if not partner:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, partner["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not partner.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account not yet activated. Please contact admin.")
    token = create_token(creds.phone, role="partner")
    return {
        "token": token,
        "partner": {
            "id": partner["id"], "name": partner["name"],
            "email": partner.get("email", ""), "phone": partner["phone"],
            "referral_code": partner["referral_code"]
        }
    }

@api_router.post("/partner/login-otp")
def partner_login_otp_request(data: PartnerOTPLogin):
    partner = db.query_one('SELECT id, is_active FROM partners WHERE phone = %s', (data.phone,))
    if not partner:
        raise HTTPException(status_code=404, detail="No account found with this phone number")
    if not partner.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account not yet activated")
    otp = "123456"
    otp_store[f"login_{data.phone}"] = {"otp": otp, "expires": datetime.now(timezone.utc) + timedelta(minutes=10)}
    return {"message": "OTP sent to your phone number", "mock_otp": otp}

@api_router.post("/partner/login-otp-verify")
def partner_login_otp_verify(data: PartnerOTPLoginVerify):
    stored = otp_store.get(f"login_{data.phone}")
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Please request again.")
    if stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.now(timezone.utc) > stored["expires"]:
        del otp_store[f"login_{data.phone}"]
        raise HTTPException(status_code=400, detail="OTP expired")
    partner = db.query_one('SELECT * FROM partners WHERE phone = %s', (data.phone,))
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    del otp_store[f"login_{data.phone}"]
    token = create_token(data.phone, role="partner")
    return {
        "token": token,
        "partner": {
            "id": partner["id"], "name": partner["name"],
            "email": partner.get("email", ""), "phone": partner["phone"],
            "referral_code": partner["referral_code"]
        }
    }

@api_router.post("/partner/reset-password")
def partner_reset_request(data: PartnerResetRequest):
    if not db.query_one('SELECT id FROM partners WHERE phone = %s', (data.phone,)):
        raise HTTPException(status_code=404, detail="No account found with this phone number")
    otp = "123456"
    otp_store[f"reset_{data.phone}"] = {"otp": otp, "expires": datetime.now(timezone.utc) + timedelta(minutes=10)}
    return {"message": "OTP sent to your phone number", "mock_otp": otp}

@api_router.post("/partner/reset-password-confirm")
def partner_reset_confirm(data: PartnerResetConfirm):
    stored = otp_store.get(f"reset_{data.phone}")
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Please request again.")
    if stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.now(timezone.utc) > stored["expires"]:
        del otp_store[f"reset_{data.phone}"]
        raise HTTPException(status_code=400, detail="OTP expired")
    rows = db.execute('UPDATE partners SET password = %s WHERE phone = %s', (hash_password(data.new_password), data.phone))
    if rows == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    del otp_store[f"reset_{data.phone}"]
    return {"message": "Password reset successful. You can now login with your new password."}

# ===================== PARTNER DASHBOARD =====================

@api_router.get("/partner/dashboard")
def get_partner_dashboard(identifier: str = Depends(verify_partner_token)):
    partner = db.query_one('SELECT * FROM partners WHERE phone = %s OR email = %s', (identifier, identifier))
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    partner.pop("password", None)
    rc = partner["referral_code"]

    total_leads = db.count('SELECT COUNT(*) FROM leads WHERE referral_code = %s', (rc,))
    new_leads = db.count('SELECT COUNT(*) FROM leads WHERE referral_code = %s AND status = %s', (rc, "new"))
    in_progress = db.count("SELECT COUNT(*) FROM leads WHERE referral_code = %s AND status IN ('contacted','in_progress')", (rc,))
    converted = db.count('SELECT COUNT(*) FROM leads WHERE referral_code = %s AND status = %s', (rc, "converted"))

    earnings_rows = db.query('SELECT referral_earning FROM leads WHERE referral_code = %s AND status = %s AND referral_earning IS NOT NULL', (rc, "converted"))
    total_earnings = sum(float(r["referral_earning"]) for r in earnings_rows)

    paid_rows = db.query('SELECT amount FROM partner_payments WHERE partner_id = %s AND status = %s', (partner["id"], "paid"))
    paid_earnings = sum(float(r["amount"]) for r in paid_rows)

    return {
        "partner": partner,
        "stats": {
            "total_leads": total_leads, "new_leads": new_leads,
            "in_progress": in_progress, "converted": converted,
            "total_earnings": total_earnings, "paid_earnings": paid_earnings,
            "pending_earnings": total_earnings - paid_earnings
        }
    }

@api_router.get("/partner/leads")
def get_partner_leads(identifier: str = Depends(verify_partner_token)):
    partner = db.query_one('SELECT referral_code FROM partners WHERE phone = %s OR email = %s', (identifier, identifier))
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return db.query('SELECT * FROM leads WHERE referral_code = %s ORDER BY created_at DESC', (partner["referral_code"],))

@api_router.get("/partner/materials")
def get_partner_materials(identifier: str = Depends(verify_partner_token)):
    return db.query('SELECT * FROM marketing_materials')

# ===================== ADMIN AUTH =====================

@api_router.post("/admin/login")
def admin_login(creds: AdminLogin):
    admin = db.query_one('SELECT * FROM admins WHERE email = %s', (creds.email,))
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(creds.email, role="admin")
    return {"token": token, "email": admin["email"], "name": admin["name"]}

@api_router.post("/admin/register")
def admin_register(admin_data: AdminCreate):
    if db.query_one('SELECT id FROM admins WHERE email = %s', (admin_data.email,)):
        raise HTTPException(status_code=400, detail="Admin already exists")
    admin_dict = {
        "id": _uuid(), "email": admin_data.email,
        "password": hash_password(admin_data.password),
        "name": admin_data.name, "created_at": _now()
    }
    db.insert("admins", admin_dict)
    token = create_token(admin_data.email, role="admin")
    return {"token": token, "email": admin_dict["email"], "name": admin_dict["name"]}

@api_router.get("/admin/me")
def get_admin_profile(email: str = Depends(verify_admin_token)):
    admin = db.query_one('SELECT id, name, email, role, created_at FROM admins WHERE email = %s', (email,))
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

# ===================== ADMIN - LEADS =====================

@api_router.get("/admin/leads")
def get_all_leads(status: Optional[str] = None, source: Optional[str] = None, email: str = Depends(verify_admin_token)):
    sql = 'SELECT * FROM leads WHERE 1=1'
    params = []
    if status:
        sql += ' AND status = %s'
        params.append(status)
    if source:
        sql += ' AND source = %s'
        params.append(source)
    sql += ' ORDER BY created_at DESC'
    return db.query(sql, params or None)

@api_router.get("/admin/leads/{lead_id}")
def get_lead(lead_id: str, email: str = Depends(verify_admin_token)):
    lead = db.query_one('SELECT * FROM leads WHERE id = %s', (lead_id,))
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@api_router.patch("/admin/leads/{lead_id}")
def update_lead(lead_id: str, update_body: LeadUpdate, email: str = Depends(verify_admin_token)):
    update_data = {k: v for k, v in update_body.model_dump().items() if v is not None}
    if "deal_value" in update_data:
        lead = db.query_one('SELECT partner_id FROM leads WHERE id = %s', (lead_id,))
        if lead and lead.get("partner_id"):
            p = db.query_one('SELECT commission_percent FROM partners WHERE id = %s', (lead["partner_id"],))
            if p:
                update_data["referral_earning"] = update_data["deal_value"] * (p.get("commission_percent", 2.0) / 100)
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    rows = db.update("leads", update_data, "id", lead_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Lead not found")
    return rows[0]

@api_router.delete("/admin/leads/{lead_id}")
def delete_lead(lead_id: str, email: str = Depends(verify_admin_token)):
    rows = db.delete("leads", "id", lead_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}

# ===================== ADMIN - PACKAGES =====================

@api_router.get("/admin/packages")
def admin_get_packages(email: str = Depends(verify_admin_token)):
    configs = db.query('SELECT * FROM package_configs ORDER BY "order" ASC')
    features = db.query('SELECT * FROM package_features ORDER BY "order" ASC')
    return {"configs": configs, "features": features}

@api_router.patch("/admin/packages/{package_name}")
def update_package_config(package_name: str, update_body: PackageConfigUpdate, email: str = Depends(verify_admin_token)):
    update_data = {k: v for k, v in update_body.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data")
    rows = db.update("package_configs", update_data, "name", package_name)
    if not rows:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"message": "Package updated"}

@api_router.post("/admin/packages/features")
def add_package_feature(feature: PackageFeatureCreate, email: str = Depends(verify_admin_token)):
    doc = {"id": _uuid(), **feature.model_dump()}
    db.insert("package_features", doc)
    return doc

@api_router.patch("/admin/packages/features/{feature_id}")
def update_package_feature(feature_id: str, feature: PackageFeatureCreate, email: str = Depends(verify_admin_token)):
    rows = db.update("package_features", feature.model_dump(), "id", feature_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature updated"}

@api_router.delete("/admin/packages/features/{feature_id}")
def delete_package_feature(feature_id: str, email: str = Depends(verify_admin_token)):
    rows = db.delete("package_features", "id", feature_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature deleted"}

# ===================== ADMIN - PARTNERS =====================

@api_router.get("/admin/partners")
def get_all_partners(email: str = Depends(verify_admin_token)):
    return db.query('SELECT id, name, email, phone, referral_code, commission_percent, account_manager, is_active, created_at FROM partners ORDER BY created_at DESC')

@api_router.post("/admin/partners")
def create_partner(partner_data: PartnerCreate, email: str = Depends(verify_admin_token)):
    if db.query_one('SELECT id FROM partners WHERE email = %s', (partner_data.email,)):
        raise HTTPException(status_code=400, detail="Partner email already exists")
    pid = _uuid()
    ref_code = generate_referral_code()
    db.insert("partners", {
        "id": pid, "name": partner_data.name, "email": partner_data.email,
        "phone": partner_data.phone, "password": hash_password(partner_data.password),
        "referral_code": ref_code, "commission_percent": partner_data.commission_percent,
        "is_active": True, "created_at": _now()
    })
    return {"id": pid, "name": partner_data.name, "email": partner_data.email, "referral_code": ref_code}

@api_router.patch("/admin/partners/{partner_id}")
def update_partner(partner_id: str, update_body: PartnerUpdate, email: str = Depends(verify_admin_token)):
    data = {k: v for k, v in update_body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No update data")
    rows = db.update("partners", data, "id", partner_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"message": "Partner updated"}

@api_router.delete("/admin/partners/{partner_id}")
def delete_partner(partner_id: str, email: str = Depends(verify_admin_token)):
    rows = db.delete("partners", "id", partner_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"message": "Partner deleted"}

# ===================== ADMIN - COLLABORATION LEADS =====================

@api_router.get("/admin/collaboration/leads")
def get_collaboration_leads(email: str = Depends(verify_admin_token)):
    return db.query('SELECT * FROM collaboration_leads ORDER BY created_at DESC')

@api_router.patch("/admin/collaboration/leads/{lead_id}")
def update_collaboration_lead(lead_id: str, status: str, email: str = Depends(verify_admin_token)):
    rows = db.update("collaboration_leads", {"status": status}, "id", lead_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated"}

# ===================== ADMIN - LISTINGS =====================

@api_router.get("/admin/listings")
def admin_get_listings(email: str = Depends(verify_admin_token)):
    return db.query('SELECT * FROM listings ORDER BY created_at DESC')

@api_router.post("/admin/listings")
def create_listing(listing_data: SalesListingCreate, email: str = Depends(verify_admin_token)):
    doc = {"id": _uuid(), **listing_data.model_dump(), "created_at": _now()}
    db.insert("listings", doc)
    return doc

@api_router.patch("/admin/listings/{listing_id}")
def update_listing(listing_id: str, update_body: SalesListingUpdate, email: str = Depends(verify_admin_token)):
    data = {k: v for k, v in update_body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No update data")
    rows = db.update("listings", data, "id", listing_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing updated"}

@api_router.delete("/admin/listings/{listing_id}")
def delete_listing(listing_id: str, email: str = Depends(verify_admin_token)):
    rows = db.delete("listings", "id", listing_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted"}

# ===================== ADMIN - VENDORS =====================

@api_router.get("/admin/vendors")
def get_all_vendors(email: str = Depends(verify_admin_token)):
    return db.query('SELECT * FROM vendors ORDER BY created_at DESC')

@api_router.patch("/admin/vendors/{vendor_id}")
def update_vendor_status(vendor_id: str, status: str, email: str = Depends(verify_admin_token)):
    rows = db.update("vendors", {"status": status}, "id", vendor_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor updated"}

# ===================== ADMIN - REFERRAL TERMS =====================

@api_router.patch("/admin/referral-terms")
def update_referral_terms(terms: ReferralTerms, email: str = Depends(verify_admin_token)):
    terms.updated_at = _now()
    data = terms.model_dump()
    existing = db.query_one('SELECT id FROM referral_terms WHERE id = %s', ('referral_terms',))
    if existing:
        db.update("referral_terms", data, "id", "referral_terms")
    else:
        db.insert("referral_terms", data)
    return {"message": "Terms updated"}

# ===================== ADMIN - MARKETING MATERIALS =====================

@api_router.get("/admin/materials")
def get_materials(email: str = Depends(verify_admin_token)):
    return db.query('SELECT * FROM marketing_materials')

@api_router.post("/admin/materials")
def add_material(data: dict, email: str = Depends(verify_admin_token)):
    mid = _uuid()
    doc = {
        "id": mid, "title": data.get("title", ""),
        "description": data.get("description", ""),
        "file_url": data.get("file_url", ""),
        "file_type": data.get("file_type", "pdf"),
        "created_at": _now()
    }
    db.insert("marketing_materials", doc)
    return {"id": mid, "message": "Material added successfully"}

@api_router.delete("/admin/materials/{material_id}")
def delete_material(material_id: str, email: str = Depends(verify_admin_token)):
    rows = db.delete("marketing_materials", "id", material_id)
    if not rows:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted"}

# ===================== ADMIN - FEATURE REORDER =====================

@api_router.post("/admin/packages/features/reorder")
def reorder_features(data: dict, email: str = Depends(verify_admin_token)):
    for item in data.get("feature_orders", []):
        db.execute('UPDATE package_features SET "order" = %s WHERE id = %s', (item["order"], item["id"]))
    return {"message": "Features reordered successfully"}

# ===================== ADMIN - PARTNER ANALYTICS =====================

@api_router.get("/admin/partners/{partner_id}/analytics")
def get_partner_analytics(partner_id: str, email: str = Depends(verify_admin_token)):
    partner = db.query_one('SELECT id, name, phone, email, referral_code, is_active, commission_percent, created_at FROM partners WHERE id = %s', (partner_id,))
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    rc = partner.get("referral_code", "")
    all_leads = db.query('SELECT * FROM leads WHERE referral_code = %s', (rc,))
    total = len(all_leads)
    new = sum(1 for l in all_leads if l.get("status") == "new")
    contacted = sum(1 for l in all_leads if l.get("status") == "contacted")
    conv = sum(1 for l in all_leads if l.get("status") == "converted")
    lost = sum(1 for l in all_leads if l.get("status") == "lost")
    return {
        "partner": partner,
        "leads": {"total": total, "new": new, "contacted": contacted, "converted": conv, "lost": lost,
                  "conversion_rate": round((conv / total * 100), 1) if total > 0 else 0},
        "recent_leads": all_leads[:10]
    }

@api_router.get("/admin/partners-analytics")
def get_all_partners_analytics(email: str = Depends(verify_admin_token)):
    partners = db.query('SELECT id, name, phone, email, referral_code, is_active, commission_percent FROM partners')
    result = []
    for p in partners:
        rc = p.get("referral_code", "")
        leads = db.query('SELECT status FROM leads WHERE referral_code = %s', (rc,))
        total = len(leads)
        conv = sum(1 for l in leads if l.get("status") == "converted")
        result.append({
            "id": p["id"], "name": p["name"], "phone": p.get("phone", ""),
            "email": p.get("email", ""), "referral_code": rc,
            "is_active": p.get("is_active", False),
            "commission_percent": p.get("commission_percent", 2),
            "total_leads": total,
            "new_leads": sum(1 for l in leads if l.get("status") == "new"),
            "contacted_leads": sum(1 for l in leads if l.get("status") == "contacted"),
            "converted_leads": conv,
            "lost_leads": sum(1 for l in leads if l.get("status") == "lost"),
            "conversion_rate": round((conv / total * 100), 1) if total > 0 else 0
        })
    return result

# ===================== ADMIN - ANALYTICS =====================

@api_router.get("/admin/analytics")
def get_analytics(email: str = Depends(verify_admin_token)):
    total_leads = db.count('SELECT COUNT(*) FROM leads')
    new_leads = db.count('SELECT COUNT(*) FROM leads WHERE status = %s', ('new',))
    contacted = db.count('SELECT COUNT(*) FROM leads WHERE status = %s', ('contacted',))
    converted = db.count('SELECT COUNT(*) FROM leads WHERE status = %s', ('converted',))
    website = db.count('SELECT COUNT(*) FROM leads WHERE source = %s', ('website',))
    calculator = db.count('SELECT COUNT(*) FROM leads WHERE source = %s', ('calculator',))
    referral = db.count("SELECT COUNT(*) FROM leads WHERE referral_code IS NOT NULL AND referral_code != ''")
    collab = db.count('SELECT COUNT(*) FROM collaboration_leads')
    total_vendors = db.count('SELECT COUNT(*) FROM vendors')
    pending_vendors = db.count('SELECT COUNT(*) FROM vendors WHERE status = %s', ('pending',))
    total_partners = db.count('SELECT COUNT(*) FROM partners')
    active_partners = db.count('SELECT COUNT(*) FROM partners WHERE is_active = true')
    total_listings = db.count('SELECT COUNT(*) FROM listings')
    avail_listings = db.count('SELECT COUNT(*) FROM listings WHERE status = %s', ('available',))
    return {
        "leads": {"total": total_leads, "new": new_leads, "contacted": contacted, "converted": converted,
                  "conversion_rate": round((converted / total_leads * 100), 1) if total_leads > 0 else 0},
        "sources": {"website": website, "calculator": calculator, "referral": referral},
        "collaboration": {"total": collab},
        "vendors": {"total": total_vendors, "pending": pending_vendors},
        "partners": {"total": total_partners, "active": active_partners},
        "listings": {"total": total_listings, "available": avail_listings}
    }

# ===================== INCLUDE ROUTER & MIDDLEWARE =====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
