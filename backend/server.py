from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import base64
import random
import string

ROOT_DIR = Path(__file__).parent

# Load environment-specific .env file
node_env = os.getenv('NODE_ENV', 'development')
env_file = ROOT_DIR / f'.env.{node_env}'

# Load .env.{NODE_ENV} if exists, otherwise fall back to .env
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('SUPABASE_ANON_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'alpha-groups-secret-key-2024')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===================== MODELS =====================

# Lead Models
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

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    project_type: str
    plot_area: Optional[float] = None
    location: Optional[str] = None
    budget: Optional[str] = None
    message: Optional[str] = None
    source: str = "website"
    status: str = "new"
    referral_code: Optional[str] = None
    partner_id: Optional[str] = None
    deal_value: Optional[float] = None
    referral_earning: Optional[float] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    deal_value: Optional[float] = None

# Package Models
class PackageFeature(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    classic: str
    select: str
    signature: str
    customize: str
    order: int = 0

class PackageConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price_per_sft: float
    is_visible: bool = True
    order: int = 0

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

# Referral Partner Models
class PartnerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    commission_percent: float = 2.0

class PartnerLogin(BaseModel):
    phone: str
    password: str

class Partner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = ""
    phone: str
    password: str
    referral_code: str
    commission_percent: float = 2.0
    account_manager: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    commission_percent: Optional[float] = None
    account_manager: Optional[str] = None
    is_active: Optional[bool] = None

# Referral Terms Model
class ReferralTerms(BaseModel):
    id: str = "referral_terms"
    commission_percent: float = 2.0
    validity_days: int = 90
    payment_timeline_days: int = 30
    terms_content: str = ""
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Collaboration Lead Model
class CollaborationLead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: EmailStr
    land_location: str
    land_size: str
    intent: str  # landowner / investor / nri
    message: Optional[str] = None
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CollaborationLeadCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    land_location: str
    land_size: str
    intent: str
    message: Optional[str] = None

# Sales Listing Model
class SalesListing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    property_type: str  # flat / villa / house
    location: str
    price: float
    area_sqft: float
    bedrooms: int
    bathrooms: int
    description: str
    images: List[str] = []
    status: str = "available"  # available / sold / coming_soon
    owner_type: str = "alpha"  # alpha / partner
    partner_id: Optional[str] = None
    amenities: List[str] = []
    is_featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

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

# Vendor Model
class Vendor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str = Field(default_factory=lambda: f"VND{random.randint(10000, 99999)}")
    name: str
    company_name: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    website: Optional[str] = None
    categories: List[str] = []
    description: Optional[str] = None
    document_url: Optional[str] = None
    status: str = "pending"  # pending / approved / rejected
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VendorCreate(BaseModel):
    name: str
    company_name: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    website: Optional[str] = None
    categories: List[str] = []
    description: Optional[str] = None
    document_data: Optional[str] = None  # Base64 encoded

# Marketing Material Model
class MarketingMaterial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    file_url: str
    file_type: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class QuickLeadCreate(BaseModel):
    name: str
    phone: str
    location: Optional[str] = ""
    requirement: Optional[str] = ""

# Partner Registration Models
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

# Admin Models
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

class CalculatorResult(BaseModel):
    plot_area: float
    project_type: str
    package_type: str
    base_rate: float
    estimated_cost: float
    min_estimate: float
    max_estimate: float

# ===================== HELPERS =====================

def generate_referral_code():
    return 'AG' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def create_token(email: str, role: str = "admin") -> str:
    payload = {
        "sub": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
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
    return payload["sub"]  # Returns phone number

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# ===================== SEED DEFAULT DATA =====================

async def seed_default_packages():
    """Seed default package configurations"""
    res = supabase.table("package_configs").select("*").eq("name", "classic").execute()
    existing = res.data[0] if res.data else None
    if not existing:
        default_configs = [
            {"id": str(uuid.uuid4()), "name": "classic", "description": "Essential quality construction", "price_per_sft": 1899, "is_visible": True, "order": 1},
            {"id": str(uuid.uuid4()), "name": "select", "description": "Enhanced specifications", "price_per_sft": 2199, "is_visible": True, "order": 2},
            {"id": str(uuid.uuid4()), "name": "signature", "description": "Premium luxury finishes", "price_per_sft": 2599, "is_visible": True, "order": 3},
            {"id": str(uuid.uuid4()), "name": "customize", "description": "Tailored to your needs", "price_per_sft": 0, "is_visible": True, "order": 4},
        ]
        supabase.table("package_configs").insert(default_configs).execute()
        
        default_features = [
            {"id": str(uuid.uuid4()), "name": "Steel", "classic": "Tata/JSW Fe500", "select": "Tata Tiscon Fe500D", "signature": "Tata Tiscon Super", "customize": "As per choice", "order": 1},
            {"id": str(uuid.uuid4()), "name": "Cement", "classic": "UltraTech OPC 53", "select": "UltraTech Premium", "signature": "ACC Gold", "customize": "As per choice", "order": 2},
            {"id": str(uuid.uuid4()), "name": "Aggregates", "classic": "20mm & River Sand", "select": "20mm & M-Sand", "signature": "Premium Crushed", "customize": "As per choice", "order": 3},
            {"id": str(uuid.uuid4()), "name": "Blocks/Bricks", "classic": "Standard Red Bricks", "select": "AAC Blocks", "signature": "Premium AAC", "customize": "As per choice", "order": 4},
            {"id": str(uuid.uuid4()), "name": "Flooring", "classic": "Vitrified 2x2", "select": "Granite/Marble", "signature": "Italian Marble", "customize": "As per choice", "order": 5},
            {"id": str(uuid.uuid4()), "name": "Bathroom Tiles", "classic": "Standard Ceramic", "select": "Premium Ceramic", "signature": "Designer Tiles", "customize": "As per choice", "order": 6},
            {"id": str(uuid.uuid4()), "name": "Sanitary", "classic": "Hindware Standard", "select": "Hindware Premium", "signature": "Jaquar/Kohler", "customize": "As per choice", "order": 7},
            {"id": str(uuid.uuid4()), "name": "Electrical", "classic": "Finolex Wires", "select": "Havells", "signature": "Schneider", "customize": "As per choice", "order": 8},
            {"id": str(uuid.uuid4()), "name": "Switches", "classic": "Anchor Roma", "select": "Legrand", "signature": "Schneider Modular", "customize": "As per choice", "order": 9},
            {"id": str(uuid.uuid4()), "name": "Plumbing", "classic": "Astral CPVC", "select": "Supreme CPVC", "signature": "Ashirvad/Prince", "customize": "As per choice", "order": 10},
            {"id": str(uuid.uuid4()), "name": "Doors (Main)", "classic": "Teak Frame + Flush", "select": "Teak Frame + Panel", "signature": "Full Teak Wood", "customize": "As per choice", "order": 11},
            {"id": str(uuid.uuid4()), "name": "Windows", "classic": "Aluminium Sliding", "select": "uPVC Standard", "signature": "uPVC Premium", "customize": "As per choice", "order": 12},
            {"id": str(uuid.uuid4()), "name": "Paints (Interior)", "classic": "Asian Tractor", "select": "Asian Royale", "signature": "Asian Ultima", "customize": "As per choice", "order": 13},
            {"id": str(uuid.uuid4()), "name": "Paints (Exterior)", "classic": "Asian Ace", "select": "Asian Apex", "signature": "Asian Ultima Protek", "customize": "As per choice", "order": 14},
            {"id": str(uuid.uuid4()), "name": "Kitchen", "classic": "Granite Top", "select": "SS Sink + Granite", "signature": "Modular Kitchen", "customize": "As per choice", "order": 15},
            {"id": str(uuid.uuid4()), "name": "Warranty", "classic": "1 Year", "select": "2 Years", "signature": "3 Years", "customize": "Negotiable", "order": 16},
        ]
        supabase.table("package_features").insert(default_features).execute()

async def seed_referral_terms():
    """Seed default referral terms"""
    res = supabase.table("referral_terms").select("*").eq("id", "referral_terms").execute()
    existing = res.data[0] if res.data else None
    if not existing:
        default_terms = {
            "id": "referral_terms",
            "commission_percent": 2.0,
            "validity_days": 90,
            "payment_timeline_days": 30,
            "terms_content": """**Alpha Groups Referral Program – Terms & Conditions**

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
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("referral_terms").insert(default_terms).execute()

# ===================== STARTUP EVENT =====================

async def seed_demo_partner():
    """Seed demo partner account"""
    res = supabase.table("partners").select("*").eq("phone", "9876543210").execute()
    existing = res.data[0] if res.data else None
    if not existing:
        demo_partner = Partner(
            name="Demo Partner",
            email="partner@alpha.com",
            phone="9876543210",
            password=hash_password("partner123"),
            referral_code="AGDEMO01",
            is_active=True
        )
        supabase.table("partners").insert(demo_partner.model_dump()).execute()
        logger.info("Demo partner seeded: phone=9876543210, password=partner123")

async def seed_demo_admin():
    """Seed demo admin account"""
    res = supabase.table("admins").select("*").eq("email", "test@alpha.com").execute()
    existing = res.data[0] if res.data else None
    if not existing:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "name": "Alpha Admin",
            "email": "test@alpha.com",
            "password": hash_password("password123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table("admins").insert(admin_doc).execute()
        logger.info("Demo admin seeded: email=test@alpha.com, password=password123")
    else:
        # Ensure password is correct for demo
        if not verify_password("password123", existing.get("password", "")):
            supabase.table("admins").update({"password": hash_password("password123")}).eq("email", "test@alpha.com").execute()
            logger.info("Demo admin password reset to: password123")

@app.on_event("startup")
async def startup_event():
    await seed_default_packages()
    await seed_referral_terms()
    await seed_demo_partner()
    await seed_demo_admin()

# ===================== PUBLIC ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Alpha Groups API", "status": "running"}

# ===================== PACKAGES (PUBLIC) =====================

@api_router.get("/packages")
async def get_packages():
    """Get all visible packages with features for comparison"""
    configs = supabase.table("package_configs").select("*").eq("is_visible", True).order("order", desc=False).limit(10).execute().data
    features = supabase.table("package_features").select("*").order("order", desc=False).limit(100).execute().data
    
    if not configs:
        await seed_default_packages()
        configs = supabase.table("package_configs").select("*").eq("is_visible", True).order("order", desc=False).limit(10).execute().data
        features = supabase.table("package_features").select("*").order("order", desc=False).limit(100).execute().data
    
    return {
        "configs": configs,
        "features": features
    }

VALID_PROJECT_TYPES = ["independent_house", "villa", "apartment", "school", "interior"]
VALID_PACKAGE_TYPES = ["classic", "select", "signature", "customize"]

@api_router.post("/calculate", response_model=CalculatorResult)
async def calculate_cost(calc_input: CalculatorInput):
    """Calculate construction cost based on package"""
    if calc_input.project_type.lower() not in VALID_PROJECT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid project type. Must be one of: {', '.join(VALID_PROJECT_TYPES)}")
    
    package_name = calc_input.package_type.lower()
    if package_name not in VALID_PACKAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid package type. Must be one of: {', '.join(VALID_PACKAGE_TYPES)}")
    
    res = supabase.table("package_configs").select("*").eq("name", package_name).execute()
    config = res.data[0] if res.data else None
    
    if not config:
        raise HTTPException(status_code=400, detail="Invalid package type")
    
    base_rate = config.get("price_per_sft", 1899)
    if base_rate == 0:  # Customize package
        base_rate = 2299  # Use average for estimate
    
    estimated_cost = calc_input.plot_area * base_rate
    
    return CalculatorResult(
        plot_area=calc_input.plot_area,
        project_type=calc_input.project_type,
        package_type=calc_input.package_type,
        base_rate=base_rate,
        estimated_cost=estimated_cost,
        min_estimate=estimated_cost * 0.95,
        max_estimate=estimated_cost * 1.10
    )

# ===================== LEADS (PUBLIC) =====================

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    """Create a new lead"""
    lead = Lead(**lead_data.model_dump())
    
    # Check if referral code exists
    if lead_data.referral_code:
        res = supabase.table("partners").select("*").eq("referral_code", lead_data.referral_code).execute()
        partner = res.data[0] if res.data else None
        if partner:
            lead.partner_id = partner["id"]
    
    doc = lead.model_dump()
    supabase.table("leads").insert(doc).execute()
    return lead

@api_router.post("/quote-request", response_model=Lead)
async def create_quote_request(quote: QuoteRequest):
    """Create lead from calculator quote request"""
    lead = Lead(
        name=quote.name,
        phone=quote.phone,
        email=quote.email,
        project_type=quote.project_type,
        plot_area=quote.plot_area,
        location=quote.location,
        budget=f"₹{quote.estimated_cost:,.0f} ({quote.package_type})",
        message=quote.message,
        source="calculator",
        referral_code=quote.referral_code
    )
    
    if quote.referral_code:
        res = supabase.table("partners").select("*").eq("referral_code", quote.referral_code).execute()
        partner = res.data[0] if res.data else None
        if partner:
            lead.partner_id = partner["id"]
    
    doc = lead.model_dump()
    supabase.table("leads").insert(doc).execute()
    return lead

# ===================== COLLABORATION LEADS (PUBLIC) =====================

@api_router.post("/collaboration/leads")
async def create_collaboration_lead(lead_data: CollaborationLeadCreate):
    """Create collaboration/landowner lead"""
    lead = CollaborationLead(**lead_data.model_dump())
    doc = lead.model_dump()
    supabase.table("collaboration_leads").insert(doc).execute()
    return lead

# ===================== SALES LISTINGS (PUBLIC) =====================

@api_router.get("/listings")
async def get_listings(status: Optional[str] = None, property_type: Optional[str] = None):
    """Get all public listings"""
    query = {}
    if status:
        query["status"] = status
    if property_type:
        query["property_type"] = property_type
    
    listings = supabase.table("listings").select("*").match(query).order("created_at", desc=True).limit(100).execute().data
    return listings

@api_router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Get single listing details"""
    res = supabase.table("listings").select("*").eq("id", listing_id).execute()
    listing = res.data[0] if res.data else None
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

# ===================== VENDORS (PUBLIC) =====================

@api_router.post("/vendors")
async def register_vendor(vendor_data: VendorCreate):
    """Register new vendor"""
    vendor = Vendor(**vendor_data.model_dump(exclude={"document_data"}))
    
    # Handle document upload (base64)
    if vendor_data.document_data:
        vendor.document_url = f"data:application/pdf;base64,{vendor_data.document_data[:100]}..."  # Store reference
    
    doc = vendor.model_dump()
    supabase.table("vendors").insert(doc).execute()
    return {"vendor_id": vendor.vendor_id, "message": "Registration successful"}

# ===================== REFERRAL TERMS (PUBLIC) =====================

@api_router.get("/referral-terms")
async def get_referral_terms():
    """Get public referral terms"""
    res = supabase.table("referral_terms").select("*").eq("id", "referral_terms").execute()
    terms = res.data[0] if res.data else None
    if not terms:
        await seed_referral_terms()
        res = supabase.table("referral_terms").select("*").eq("id", "referral_terms").execute()
        terms = res.data[0] if res.data else None
    return terms

# ===================== PARTNER AUTH =====================

# In-memory OTP store (mocked)
otp_store = {}

@api_router.post("/partner/register")
async def partner_register(data: PartnerRegister):
    """Register new partner - sends mocked OTP"""
    res = supabase.table("partners").select("*").eq("phone", data.phone).execute()
    existing = res.data[0] if res.data else None
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    if data.email:
        res = supabase.table("partners").select("*").eq("email", data.email).execute()
        email_exists = res.data[0] if res.data else None
        if email_exists:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate mock OTP (always 123456 for testing)
    otp = "123456"
    otp_store[data.phone] = {"otp": otp, "data": data.model_dump(), "expires": datetime.now(timezone.utc) + timedelta(minutes=10)}
    
    logger.info(f"[MOCK OTP] Sent OTP {otp} to {data.phone}")
    return {"message": "OTP sent to your phone number", "mock_otp": otp}

@api_router.post("/partner/verify-otp")
async def partner_verify_otp(verify: PartnerOTPVerify):
    """Verify OTP and create partner account"""
    stored = otp_store.get(verify.phone)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Please register again.")
    
    if stored["otp"] != verify.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.now(timezone.utc) > stored["expires"]:
        del otp_store[verify.phone]
        raise HTTPException(status_code=400, detail="OTP expired. Please register again.")
    
    reg_data = stored["data"]
    
    # Create partner with the password they chose during registration
    partner = Partner(
        name=reg_data["name"],
        email=reg_data.get("email", ""),
        phone=reg_data["phone"],
        password=hash_password(reg_data["password"]),
        referral_code=generate_referral_code(),
        is_active=True
    )
    
    supabase.table("partners").insert(partner.model_dump()).execute()
    del otp_store[verify.phone]
    
    token = create_token(reg_data["phone"], role="partner")
    return {
        "message": "Registration successful! Welcome to Alpha Groups Partner Program.",
        "token": token,
        "partner": {
            "id": partner.id,
            "name": partner.name,
            "email": partner.email,
            "phone": partner.phone,
            "referral_code": partner.referral_code
        }
    }

# Quick lead capture endpoint (for homepage CTA)
@api_router.post("/quick-lead")
async def create_quick_lead(data: QuickLeadCreate):
    """Quick lead capture from homepage CTA"""
    if not data.name or not data.phone:
        raise HTTPException(status_code=400, detail="Name and phone are required")
    
    lead = Lead(
        name=data.name,
        phone=data.phone,
        email="",
        project_type=data.requirement or "general_inquiry",
        location=data.location,
        source="homepage_cta"
    )
    doc = lead.model_dump()
    supabase.table("leads").insert(doc).execute()
    return {"message": "Thank you! We'll call you back shortly.", "lead_id": lead.id}

@api_router.post("/partner/login")
async def partner_login(creds: PartnerLogin):
    """Partner login with phone + password"""
    res = supabase.table("partners").select("*").eq("phone", creds.phone).execute()
    partner = res.data[0] if res.data else None
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
            "id": partner["id"],
            "name": partner["name"],
            "email": partner.get("email", ""),
            "phone": partner["phone"],
            "referral_code": partner["referral_code"]
        }
    }

@api_router.post("/partner/login-otp")
async def partner_login_otp_request(data: PartnerOTPLogin):
    """Request OTP for login"""
    res = supabase.table("partners").select("*").eq("phone", data.phone).execute()
    partner = res.data[0] if res.data else None
    if not partner:
        raise HTTPException(status_code=404, detail="No account found with this phone number")
    if not partner.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account not yet activated")
    
    otp = "123456"
    otp_store[f"login_{data.phone}"] = {"otp": otp, "expires": datetime.now(timezone.utc) + timedelta(minutes=10)}
    logger.info(f"[MOCK OTP] Login OTP {otp} sent to {data.phone}")
    return {"message": "OTP sent to your phone number", "mock_otp": otp}

@api_router.post("/partner/login-otp-verify")
async def partner_login_otp_verify(data: PartnerOTPLoginVerify):
    """Verify OTP and login"""
    stored = otp_store.get(f"login_{data.phone}")
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Please request again.")
    if stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.now(timezone.utc) > stored["expires"]:
        del otp_store[f"login_{data.phone}"]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    res = supabase.table("partners").select("*").eq("phone", data.phone).execute()
    partner = res.data[0] if res.data else None
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    del otp_store[f"login_{data.phone}"]
    token = create_token(data.phone, role="partner")
    return {
        "token": token,
        "partner": {
            "id": partner["id"],
            "name": partner["name"],
            "email": partner.get("email", ""),
            "phone": partner["phone"],
            "referral_code": partner["referral_code"]
        }
    }

@api_router.post("/partner/reset-password")
async def partner_reset_request(data: PartnerResetRequest):
    """Request password reset OTP"""
    res = supabase.table("partners").select("*").eq("phone", data.phone).execute()
    partner = res.data[0] if res.data else None
    if not partner:
        raise HTTPException(status_code=404, detail="No account found with this phone number")
    
    otp = "123456"
    otp_store[f"reset_{data.phone}"] = {"otp": otp, "expires": datetime.now(timezone.utc) + timedelta(minutes=10)}
    logger.info(f"[MOCK OTP] Reset OTP {otp} sent to {data.phone}")
    return {"message": "OTP sent to your phone number", "mock_otp": otp}

@api_router.post("/partner/reset-password-confirm")
async def partner_reset_confirm(data: PartnerResetConfirm):
    """Confirm password reset with OTP"""
    stored = otp_store.get(f"reset_{data.phone}")
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP found. Please request again.")
    if stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if datetime.now(timezone.utc) > stored["expires"]:
        del otp_store[f"reset_{data.phone}"]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    new_hash = hash_password(data.new_password)
    result = supabase.table("partners").update({"password": new_hash}).eq("phone", data.phone).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    del otp_store[f"reset_{data.phone}"]
    return {"message": "Password reset successful. You can now login with your new password."}

# ===================== PARTNER DASHBOARD =====================

@api_router.get("/partner/dashboard")
async def get_partner_dashboard(identifier: str = Depends(verify_partner_token)):
    """Get partner dashboard data"""
    partner_res = supabase.table("partners").select("id,name,email,phone,referral_code,commission_percent,account_manager,is_active,created_at").or_(f"phone.eq.{identifier},email.eq.{identifier}").execute()
    partner = partner_res.data[0] if partner_res.data else None
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    referral_code = partner["referral_code"]
    
    # Get lead stats
    total_leads = supabase.table("leads").select("*", count="exact", head=True).eq("referral_code", referral_code).execute().count
    new_leads = supabase.table("leads").select("*", count="exact", head=True).eq("referral_code", referral_code).eq("status", "new").execute().count
    in_progress = supabase.table("leads").select("*", count="exact", head=True).eq("referral_code", referral_code).in_("status", ["contacted", "in_progress"]).execute().count
    converted = supabase.table("leads").select("*", count="exact", head=True).eq("referral_code", referral_code).eq("status", "converted").execute().count
    
    # Calculate earnings
    res = supabase.table("leads").select("referral_earning").eq("referral_code", referral_code).eq("status", "converted").not_.is_null("referral_earning").execute()
    total_earnings = sum(item["referral_earning"] for item in res.data if item["referral_earning"])
    
    # Paid earnings
    res_paid = supabase.table("partner_payments").select("amount").eq("partner_id", partner["id"]).eq("status", "paid").execute()
    paid_earnings = sum(item["amount"] for item in res_paid.data if item["amount"])
    
    return {
        "partner": partner,
        "stats": {
            "total_leads": total_leads,
            "new_leads": new_leads,
            "in_progress": in_progress,
            "converted": converted,
            "total_earnings": total_earnings,
            "paid_earnings": paid_earnings,
            "pending_earnings": total_earnings - paid_earnings
        }
    }

@api_router.get("/partner/leads")
async def get_partner_leads(identifier: str = Depends(verify_partner_token)):
    """Get partner's referred leads"""
    partner_res = supabase.table("partners").select("*").or_(f"phone.eq.{identifier},email.eq.{identifier}").execute()
    partner = partner_res.data[0] if partner_res.data else None
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    leads = supabase.table("leads").select("*").eq("referral_code", partner["referral_code"]).order("created_at", desc=True).limit(100).execute().data
    
    return leads

@api_router.get("/partner/materials")
async def get_partner_materials(identifier: str = Depends(verify_partner_token)):
    """Get marketing materials for partner"""
    materials = supabase.table("marketing_materials").select("*").limit(50).execute().data
    return materials

# ===================== ADMIN AUTH =====================

@api_router.post("/admin/login")
async def admin_login(creds: AdminLogin):
    """Admin login"""
    res = supabase.table("admins").select("*").eq("email", creds.email).execute()
    admin = res.data[0] if res.data else None
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(creds.email, role="admin")
    return {"token": token, "email": admin["email"], "name": admin["name"]}

@api_router.post("/admin/register")
async def admin_register(admin_data: AdminCreate):
    """Register admin (first-time setup only)"""
    res = supabase.table("admins").select("*").eq("email", admin_data.email).execute()
    existing = res.data[0] if res.data else None
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")

    admin_dict = {
        "id": str(uuid.uuid4()),
        "email": admin_data.email,
        "password": hash_password(admin_data.password),
        "name": admin_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    supabase.table("admins").insert(admin_dict).execute()
    token = create_token(admin_data.email, role="admin")
    return {"token": token, "email": admin_dict["email"], "name": admin_dict["name"]}

@api_router.get("/admin/me")
async def get_admin_profile(email: str = Depends(verify_admin_token)):
    """Get admin profile"""
    res = supabase.table("admins").select("*").eq("email", email).execute()
    admin = res.data[0] if res.data else None
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Remove password from response
    admin.pop("password", None)
    return admin

# ===================== ADMIN - LEADS =====================

@api_router.get("/admin/leads", response_model=List[Lead])
async def get_all_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    email: str = Depends(verify_admin_token)
):
    """Get all leads"""
    query = supabase.table("leads").select("*")
    if status:
        query = query.eq("status", status)
    if source:
        query = query.eq("source", source)
    
    result = query.order("created_at", desc=True).execute()
    return [Lead(**lead) for lead in result.data]

@api_router.get("/admin/leads/{lead_id}")
async def get_lead(lead_id: str, email: str = Depends(verify_admin_token)):
    """Get single lead"""
    res = supabase.table("leads").select("*").eq("id", lead_id).execute()
    lead = res.data[0] if res.data else None
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Lead(**lead)

@api_router.patch("/admin/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate, email: str = Depends(verify_admin_token)):
    """Update lead status and deal value"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    # Calculate referral earning if deal_value is set and lead has partner
    if "deal_value" in update_data:
        res = supabase.table("leads").select("*").eq("id", lead_id).execute()
        lead = res.data[0] if res.data else None
        if lead and lead.get("partner_id"):
            res = supabase.table("partners").select("*").eq("id", lead["partner_id"]).execute()
            partner = res.data[0] if res.data else None
            if partner:
                commission = partner.get("commission_percent", 2.0)
                update_data["referral_earning"] = update_data["deal_value"] * (commission / 100)
    
    result = supabase.table("leads").update(update_data).eq("id", lead_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found")

    return Lead(**result.data[0])

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, email: str = Depends(verify_admin_token)):
    """Delete lead"""
    result = supabase.table("leads").delete().eq("id", lead_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}

# ===================== ADMIN - PACKAGES =====================

@api_router.get("/admin/packages")
async def admin_get_packages(email: str = Depends(verify_admin_token)):
    """Get all packages for admin"""
    configs = supabase.table("package_configs").select("*").order("order", desc=False).limit(10).execute().data
    features = supabase.table("package_features").select("*").order("order", desc=False).limit(100).execute().data
    return {"configs": configs, "features": features}

@api_router.patch("/admin/packages/{package_name}")
async def update_package_config(package_name: str, update: PackageConfigUpdate, email: str = Depends(verify_admin_token)):
    """Update package configuration"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = supabase.table("package_configs").update(update_data).eq("name", package_name).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"message": "Package updated"}

@api_router.post("/admin/packages/features")
async def add_package_feature(feature: PackageFeatureCreate, email: str = Depends(verify_admin_token)):
    """Add new package feature"""
    feature_doc = PackageFeature(**feature.model_dump())
    supabase.table("package_features").insert(feature_doc.model_dump()).execute()
    return feature_doc

@api_router.patch("/admin/packages/features/{feature_id}")
async def update_package_feature(feature_id: str, feature: PackageFeatureCreate, email: str = Depends(verify_admin_token)):
    """Update package feature"""
    update_data = feature.model_dump()
    result = supabase.table("package_features").update(update_data).eq("id", feature_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature updated"}

@api_router.delete("/admin/packages/features/{feature_id}")
async def delete_package_feature(feature_id: str, email: str = Depends(verify_admin_token)):
    """Delete package feature"""
    result = supabase.table("package_features").delete().eq("id", feature_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature deleted"}

# ===================== ADMIN - PARTNERS =====================

@api_router.get("/admin/partners")
async def get_all_partners(email: str = Depends(verify_admin_token)):
    """Get all partners"""
    partners = supabase.table("partners").select("id,name,email,phone,referral_code,commission_percent,account_manager,is_active,created_at").limit(100).execute().data
    return partners

@api_router.post("/admin/partners")
async def create_partner(partner_data: PartnerCreate, email: str = Depends(verify_admin_token)):
    """Create new partner account"""
    res = supabase.table("partners").select("*").eq("email", partner_data.email).execute()
    existing = res.data[0] if res.data else None
    if existing:
        raise HTTPException(status_code=400, detail="Partner email already exists")
    
    partner = Partner(
        name=partner_data.name,
        email=partner_data.email,
        phone=partner_data.phone,
        password=hash_password(partner_data.password),
        referral_code=generate_referral_code(),
        commission_percent=partner_data.commission_percent
    )
    
    supabase.table("partners").insert(partner.model_dump()).execute()
    return {
        "id": partner.id,
        "name": partner.name,
        "email": partner.email,
        "referral_code": partner.referral_code
    }

@api_router.patch("/admin/partners/{partner_id}")
async def update_partner(partner_id: str, update: PartnerUpdate, email: str = Depends(verify_admin_token)):
    """Update partner"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = supabase.table("partners").update(update_data).eq("id", partner_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"message": "Partner updated"}

@api_router.delete("/admin/partners/{partner_id}")
async def delete_partner(partner_id: str, email: str = Depends(verify_admin_token)):
    """Delete partner"""
    result = supabase.table("partners").delete().eq("id", partner_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"message": "Partner deleted"}

# ===================== ADMIN - COLLABORATION LEADS =====================

@api_router.get("/admin/collaboration/leads")
async def get_collaboration_leads(email: str = Depends(verify_admin_token)):
    """Get all collaboration leads"""
    leads = supabase.table("collaboration_leads").select("*").order("created_at", desc=True).limit(500).execute().data
    return leads

@api_router.patch("/admin/collaboration/leads/{lead_id}")
async def update_collaboration_lead(lead_id: str, status: str, email: str = Depends(verify_admin_token)):
    """Update collaboration lead status"""
    result = supabase.table("collaboration_leads").update({"status": status}).eq("id", lead_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated"}

# ===================== ADMIN - LISTINGS =====================

@api_router.get("/admin/listings")
async def admin_get_listings(email: str = Depends(verify_admin_token)):
    """Get all listings for admin"""
    listings = supabase.table("listings").select("*").order("created_at", desc=True).limit(100).execute().data
    return listings

@api_router.post("/admin/listings")
async def create_listing(listing_data: SalesListingCreate, email: str = Depends(verify_admin_token)):
    """Create new listing"""
    listing = SalesListing(**listing_data.model_dump())
    supabase.table("listings").insert(listing.model_dump()).execute()
    return listing

@api_router.patch("/admin/listings/{listing_id}")
async def update_listing(listing_id: str, update: SalesListingUpdate, email: str = Depends(verify_admin_token)):
    """Update listing"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = supabase.table("listings").update(update_data).eq("id", listing_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing updated"}

@api_router.delete("/admin/listings/{listing_id}")
async def delete_listing(listing_id: str, email: str = Depends(verify_admin_token)):
    """Delete listing"""
    result = supabase.table("listings").delete().eq("id", listing_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted"}

# ===================== ADMIN - VENDORS =====================

@api_router.get("/admin/vendors")
async def get_all_vendors(email: str = Depends(verify_admin_token)):
    """Get all vendors"""
    vendors = supabase.table("vendors").select("*").order("created_at", desc=True).limit(500).execute().data
    return vendors

@api_router.patch("/admin/vendors/{vendor_id}")
async def update_vendor_status(vendor_id: str, status: str, email: str = Depends(verify_admin_token)):
    """Update vendor status"""
    result = supabase.table("vendors").update({"status": status}).eq("id", vendor_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor updated"}

# ===================== ADMIN - REFERRAL TERMS =====================

@api_router.patch("/admin/referral-terms")
async def update_referral_terms(terms: ReferralTerms, email: str = Depends(verify_admin_token)):
    """Update referral terms"""
    terms.updated_at = datetime.now(timezone.utc).isoformat()
    supabase.table("referral_terms").upsert(terms.model_dump()).execute()
    return {"message": "Terms updated"}

# ===================== ADMIN - MARKETING MATERIALS =====================

@api_router.get("/admin/materials")
async def get_materials(email: str = Depends(verify_admin_token)):
    """Get all marketing materials"""
    materials = supabase.table("marketing_materials").select("*").limit(50).execute().data
    return materials

@api_router.post("/admin/materials")
async def add_material(data: dict, email: str = Depends(verify_admin_token)):
    """Add marketing material"""
    material = MarketingMaterial(
        title=data.get("title", ""),
        description=data.get("description", ""),
        file_url=data.get("file_url", ""),
        file_type=data.get("file_type", "pdf")
    )
    supabase.table("marketing_materials").insert(material.model_dump()).execute()
    return {"id": material.id, "message": "Material added successfully"}

@api_router.delete("/admin/materials/{material_id}")
async def delete_material(material_id: str, email: str = Depends(verify_admin_token)):
    """Delete marketing material"""
    result = supabase.table("marketing_materials").delete().eq("id", material_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted"}

# ===================== ADMIN - FEATURE REORDER =====================

@api_router.post("/admin/packages/features/reorder")
async def reorder_features(data: dict, email: str = Depends(verify_admin_token)):
    """Reorder package features"""
    feature_orders = data.get("feature_orders", [])  # [{id: "xxx", order: 1}, ...]
    for item in feature_orders:
        supabase.table("package_features").update({"order": item["order"]}).eq("id", item["id"]).execute()
    return {"message": "Features reordered successfully"}

# ===================== ADMIN - PARTNER ANALYTICS =====================

@api_router.get("/admin/partners/{partner_id}/analytics")
async def get_partner_analytics(partner_id: str, email: str = Depends(verify_admin_token)):
    """Get analytics for a specific partner"""
    res = supabase.table("partners").select("*").eq("id", partner_id).execute()
    partner = res.data[0] if res.data else None
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    referral_code = partner.get("referral_code", "")
    
    # Get leads referred by this partner
    all_leads = supabase.table("leads").select("*").eq("referral_code", referral_code).limit(200).execute().data
    
    total_leads = len(all_leads)
    new_leads = sum(1 for l in all_leads if l.get("status") == "new")
    contacted_leads = sum(1 for l in all_leads if l.get("status") == "contacted")
    converted_leads = sum(1 for l in all_leads if l.get("status") == "converted")
    lost_leads = sum(1 for l in all_leads if l.get("status") == "lost")
    
    return {
        "partner": {
            "id": partner["id"],
            "name": partner["name"],
            "phone": partner.get("phone", ""),
            "email": partner.get("email", ""),
            "referral_code": referral_code,
            "is_active": partner.get("is_active", False),
            "commission_percent": partner.get("commission_percent", 2),
            "created_at": partner.get("created_at", "")
        },
        "leads": {
            "total": total_leads,
            "new": new_leads,
            "contacted": contacted_leads,
            "converted": converted_leads,
            "lost": lost_leads,
            "conversion_rate": round((converted_leads / total_leads * 100), 1) if total_leads > 0 else 0
        },
        "recent_leads": all_leads[:10]  # Last 10 leads
    }

@api_router.get("/admin/partners-analytics")
async def get_all_partners_analytics(email: str = Depends(verify_admin_token)):
    """Get analytics summary for all partners"""
    partners = supabase.table("partners").select("id,name,email,phone,referral_code,commission_percent,account_manager,is_active,created_at").limit(200).execute().data
    
    result = []
    for partner in partners:
        referral_code = partner.get("referral_code", "")
        leads = supabase.table("leads").select("*").eq("referral_code", referral_code).limit(200).execute().data
        
        total = len(leads)
        converted = sum(1 for l in leads if l.get("status") == "converted")
        
        result.append({
            "id": partner["id"],
            "name": partner["name"],
            "phone": partner.get("phone", ""),
            "email": partner.get("email", ""),
            "referral_code": referral_code,
            "is_active": partner.get("is_active", False),
            "commission_percent": partner.get("commission_percent", 2),
            "total_leads": total,
            "new_leads": sum(1 for l in leads if l.get("status") == "new"),
            "contacted_leads": sum(1 for l in leads if l.get("status") == "contacted"),
            "converted_leads": converted,
            "lost_leads": sum(1 for l in leads if l.get("status") == "lost"),
            "conversion_rate": round((converted / total * 100), 1) if total > 0 else 0
        })
    
    return result

# ===================== ADMIN - ANALYTICS =====================

@api_router.get("/admin/analytics")
async def get_analytics(email: str = Depends(verify_admin_token)):
    """Get dashboard analytics"""
    total_leads = supabase.table("leads").select("*", count="exact", head=True).execute().count
    new_leads = supabase.table("leads").select("*", count="exact", head=True).eq("status", "new").execute().count
    contacted_leads = supabase.table("leads").select("*", count="exact", head=True).eq("status", "contacted").execute().count
    converted_leads = supabase.table("leads").select("*", count="exact", head=True).eq("status", "converted").execute().count
    
    # Source breakdown
    website_leads = supabase.table("leads").select("*", count="exact", head=True).eq("source", "website").execute().count
    calculator_leads = supabase.table("leads").select("*", count="exact", head=True).eq("source", "calculator").execute().count
    referral_leads = supabase.table("leads").select("*", count="exact", head=True).not_.is_null("referral_code").execute().count
    
    # Collaboration leads
    collab_leads = supabase.table("collaboration_leads").select("*", count="exact", head=True).execute().count
    
    # Vendors
    total_vendors = supabase.table("vendors").select("*", count="exact", head=True).execute().count
    pending_vendors = supabase.table("vendors").select("*", count="exact", head=True).eq("status", "pending").execute().count
    
    # Partners
    total_partners = supabase.table("partners").select("*", count="exact", head=True).execute().count
    active_partners = supabase.table("partners").select("*", count="exact", head=True).eq("is_active", True).execute().count
    
    # Listings
    total_listings = supabase.table("listings").select("*", count="exact", head=True).execute().count
    available_listings = supabase.table("listings").select("*", count="exact", head=True).eq("status", "available").execute().count
    
    return {
        "leads": {
            "total": total_leads,
            "new": new_leads,
            "contacted": contacted_leads,
            "converted": converted_leads,
            "conversion_rate": (converted_leads / total_leads * 100) if total_leads > 0 else 0
        },
        "sources": {
            "website": website_leads,
            "calculator": calculator_leads,
            "referral": referral_leads
        },
        "collaboration": {
            "total": collab_leads
        },
        "vendors": {
            "total": total_vendors,
            "pending": pending_vendors
        },
        "partners": {
            "total": total_partners,
            "active": active_partners
        },
        "listings": {
            "total": total_listings,
            "available": available_listings
        }
    }

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

