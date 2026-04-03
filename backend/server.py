from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    email: EmailStr
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
    email: str
    password: str

class Partner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
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
    company_name: str
    phone: str
    email: EmailStr
    website: Optional[str] = None
    categories: List[str] = []
    description: Optional[str] = None
    document_url: Optional[str] = None
    status: str = "pending"  # pending / approved / rejected
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VendorCreate(BaseModel):
    name: str
    company_name: str
    phone: str
    email: EmailStr
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
    return payload["sub"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# ===================== SEED DEFAULT DATA =====================

async def seed_default_packages():
    """Seed default package configurations"""
    existing = await db.package_configs.find_one({"name": "classic"})
    if not existing:
        default_configs = [
            {"id": str(uuid.uuid4()), "name": "classic", "description": "Essential quality construction", "price_per_sft": 1899, "is_visible": True, "order": 1},
            {"id": str(uuid.uuid4()), "name": "select", "description": "Enhanced specifications", "price_per_sft": 2199, "is_visible": True, "order": 2},
            {"id": str(uuid.uuid4()), "name": "signature", "description": "Premium luxury finishes", "price_per_sft": 2599, "is_visible": True, "order": 3},
            {"id": str(uuid.uuid4()), "name": "customize", "description": "Tailored to your needs", "price_per_sft": 0, "is_visible": True, "order": 4},
        ]
        await db.package_configs.insert_many(default_configs)
        
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
        await db.package_features.insert_many(default_features)

async def seed_referral_terms():
    """Seed default referral terms"""
    existing = await db.referral_terms.find_one({"id": "referral_terms"})
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
        await db.referral_terms.insert_one(default_terms)

# ===================== STARTUP EVENT =====================

@app.on_event("startup")
async def startup_event():
    await seed_default_packages()
    await seed_referral_terms()

# ===================== PUBLIC ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Alpha Groups API", "status": "running"}

# ===================== PACKAGES (PUBLIC) =====================

@api_router.get("/packages")
async def get_packages():
    """Get all visible packages with features for comparison"""
    configs = await db.package_configs.find({"is_visible": True}, {"_id": 0}).sort("order", 1).to_list(10)
    features = await db.package_features.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    if not configs:
        await seed_default_packages()
        configs = await db.package_configs.find({"is_visible": True}, {"_id": 0}).sort("order", 1).to_list(10)
        features = await db.package_features.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    
    return {
        "configs": configs,
        "features": features
    }

@api_router.post("/calculate", response_model=CalculatorResult)
async def calculate_cost(calc_input: CalculatorInput):
    """Calculate construction cost based on package"""
    package_name = calc_input.package_type.lower()
    config = await db.package_configs.find_one({"name": package_name}, {"_id": 0})
    
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
        partner = await db.partners.find_one({"referral_code": lead_data.referral_code}, {"_id": 0})
        if partner:
            lead.partner_id = partner["id"]
    
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
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
        partner = await db.partners.find_one({"referral_code": quote.referral_code}, {"_id": 0})
        if partner:
            lead.partner_id = partner["id"]
    
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    return lead

# ===================== COLLABORATION LEADS (PUBLIC) =====================

@api_router.post("/collaboration/leads")
async def create_collaboration_lead(lead_data: CollaborationLeadCreate):
    """Create collaboration/landowner lead"""
    lead = CollaborationLead(**lead_data.model_dump())
    doc = lead.model_dump()
    await db.collaboration_leads.insert_one(doc)
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
    
    listings = await db.listings.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return listings

@api_router.get("/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Get single listing details"""
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
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
    await db.vendors.insert_one(doc)
    return {"vendor_id": vendor.vendor_id, "message": "Registration successful"}

# ===================== REFERRAL TERMS (PUBLIC) =====================

@api_router.get("/referral-terms")
async def get_referral_terms():
    """Get public referral terms"""
    terms = await db.referral_terms.find_one({"id": "referral_terms"}, {"_id": 0})
    if not terms:
        await seed_referral_terms()
        terms = await db.referral_terms.find_one({"id": "referral_terms"}, {"_id": 0})
    return terms

# ===================== PARTNER AUTH =====================

@api_router.post("/partner/login")
async def partner_login(creds: PartnerLogin):
    """Partner login"""
    partner = await db.partners.find_one({"email": creds.email}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, partner["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not partner.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account deactivated")
    
    token = create_token(creds.email, role="partner")
    return {
        "token": token,
        "partner": {
            "id": partner["id"],
            "name": partner["name"],
            "email": partner["email"],
            "referral_code": partner["referral_code"]
        }
    }

# ===================== PARTNER DASHBOARD =====================

@api_router.get("/partner/dashboard")
async def get_partner_dashboard(email: str = Depends(verify_partner_token)):
    """Get partner dashboard data"""
    partner = await db.partners.find_one({"email": email}, {"_id": 0, "password": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    referral_code = partner["referral_code"]
    
    # Get lead stats
    total_leads = await db.leads.count_documents({"referral_code": referral_code})
    new_leads = await db.leads.count_documents({"referral_code": referral_code, "status": "new"})
    in_progress = await db.leads.count_documents({"referral_code": referral_code, "status": {"$in": ["contacted", "in_progress"]}})
    converted = await db.leads.count_documents({"referral_code": referral_code, "status": "converted"})
    
    # Calculate earnings
    pipeline = [
        {"$match": {"referral_code": referral_code, "status": "converted", "referral_earning": {"$exists": True}}},
        {"$group": {"_id": None, "total": {"$sum": "$referral_earning"}}}
    ]
    earnings_result = await db.leads.aggregate(pipeline).to_list(1)
    total_earnings = earnings_result[0]["total"] if earnings_result else 0
    
    # Paid earnings
    paid_pipeline = [
        {"$match": {"partner_id": partner["id"], "status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    paid_result = await db.partner_payments.aggregate(paid_pipeline).to_list(1)
    paid_earnings = paid_result[0]["total"] if paid_result else 0
    
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
async def get_partner_leads(email: str = Depends(verify_partner_token)):
    """Get partner's referred leads"""
    partner = await db.partners.find_one({"email": email}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    leads = await db.leads.find(
        {"referral_code": partner["referral_code"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return leads

@api_router.get("/partner/materials")
async def get_partner_materials(email: str = Depends(verify_partner_token)):
    """Get marketing materials for partner"""
    materials = await db.marketing_materials.find({}, {"_id": 0}).to_list(50)
    return materials

# ===================== ADMIN AUTH =====================

@api_router.post("/admin/login")
async def admin_login(creds: AdminLogin):
    """Admin login"""
    admin = await db.admins.find_one({"email": creds.email}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(creds.email, role="admin")
    return {"token": token, "email": admin["email"], "name": admin["name"]}

@api_router.post("/admin/register")
async def admin_register(admin_data: AdminCreate):
    """Register admin (first-time setup only)"""
    existing = await db.admins.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    doc = {
        "id": str(uuid.uuid4()),
        "email": admin_data.email,
        "password": hash_password(admin_data.password),
        "name": admin_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(doc)
    token = create_token(admin_data.email, role="admin")
    return {"token": token, "email": doc["email"], "name": doc["name"]}

@api_router.get("/admin/me")
async def get_admin_profile(email: str = Depends(verify_admin_token)):
    """Get admin profile"""
    admin = await db.admins.find_one({"email": email}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

# ===================== ADMIN - LEADS =====================

@api_router.get("/admin/leads", response_model=List[Lead])
async def get_all_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    email: str = Depends(verify_admin_token)
):
    """Get all leads"""
    query = {}
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return leads

@api_router.get("/admin/leads/{lead_id}")
async def get_lead(lead_id: str, email: str = Depends(verify_admin_token)):
    """Get single lead"""
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@api_router.patch("/admin/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate, email: str = Depends(verify_admin_token)):
    """Update lead status and deal value"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    # Calculate referral earning if deal_value is set and lead has partner
    if "deal_value" in update_data:
        lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
        if lead and lead.get("partner_id"):
            partner = await db.partners.find_one({"id": lead["partner_id"]}, {"_id": 0})
            if partner:
                commission = partner.get("commission_percent", 2.0)
                update_data["referral_earning"] = update_data["deal_value"] * (commission / 100)
    
    result = await db.leads.update_one({"id": lead_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return lead

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, email: str = Depends(verify_admin_token)):
    """Delete lead"""
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}

# ===================== ADMIN - PACKAGES =====================

@api_router.get("/admin/packages")
async def admin_get_packages(email: str = Depends(verify_admin_token)):
    """Get all packages for admin"""
    configs = await db.package_configs.find({}, {"_id": 0}).sort("order", 1).to_list(10)
    features = await db.package_features.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return {"configs": configs, "features": features}

@api_router.patch("/admin/packages/{package_name}")
async def update_package_config(package_name: str, update: PackageConfigUpdate, email: str = Depends(verify_admin_token)):
    """Update package configuration"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = await db.package_configs.update_one({"name": package_name}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"message": "Package updated"}

@api_router.post("/admin/packages/features")
async def add_package_feature(feature: PackageFeatureCreate, email: str = Depends(verify_admin_token)):
    """Add new package feature"""
    feature_doc = PackageFeature(**feature.model_dump())
    await db.package_features.insert_one(feature_doc.model_dump())
    return feature_doc

@api_router.patch("/admin/packages/features/{feature_id}")
async def update_package_feature(feature_id: str, feature: PackageFeatureCreate, email: str = Depends(verify_admin_token)):
    """Update package feature"""
    update_data = feature.model_dump()
    result = await db.package_features.update_one({"id": feature_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature updated"}

@api_router.delete("/admin/packages/features/{feature_id}")
async def delete_package_feature(feature_id: str, email: str = Depends(verify_admin_token)):
    """Delete package feature"""
    result = await db.package_features.delete_one({"id": feature_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature deleted"}

# ===================== ADMIN - PARTNERS =====================

@api_router.get("/admin/partners")
async def get_all_partners(email: str = Depends(verify_admin_token)):
    """Get all partners"""
    partners = await db.partners.find({}, {"_id": 0, "password": 0}).to_list(100)
    return partners

@api_router.post("/admin/partners")
async def create_partner(partner_data: PartnerCreate, email: str = Depends(verify_admin_token)):
    """Create new partner account"""
    existing = await db.partners.find_one({"email": partner_data.email})
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
    
    await db.partners.insert_one(partner.model_dump())
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
    result = await db.partners.update_one({"id": partner_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"message": "Partner updated"}

@api_router.delete("/admin/partners/{partner_id}")
async def delete_partner(partner_id: str, email: str = Depends(verify_admin_token)):
    """Delete partner"""
    result = await db.partners.delete_one({"id": partner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"message": "Partner deleted"}

# ===================== ADMIN - COLLABORATION LEADS =====================

@api_router.get("/admin/collaboration/leads")
async def get_collaboration_leads(email: str = Depends(verify_admin_token)):
    """Get all collaboration leads"""
    leads = await db.collaboration_leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return leads

@api_router.patch("/admin/collaboration/leads/{lead_id}")
async def update_collaboration_lead(lead_id: str, status: str, email: str = Depends(verify_admin_token)):
    """Update collaboration lead status"""
    result = await db.collaboration_leads.update_one({"id": lead_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead updated"}

# ===================== ADMIN - LISTINGS =====================

@api_router.get("/admin/listings")
async def admin_get_listings(email: str = Depends(verify_admin_token)):
    """Get all listings for admin"""
    listings = await db.listings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return listings

@api_router.post("/admin/listings")
async def create_listing(listing_data: SalesListingCreate, email: str = Depends(verify_admin_token)):
    """Create new listing"""
    listing = SalesListing(**listing_data.model_dump())
    await db.listings.insert_one(listing.model_dump())
    return listing

@api_router.patch("/admin/listings/{listing_id}")
async def update_listing(listing_id: str, update: SalesListingUpdate, email: str = Depends(verify_admin_token)):
    """Update listing"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = await db.listings.update_one({"id": listing_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing updated"}

@api_router.delete("/admin/listings/{listing_id}")
async def delete_listing(listing_id: str, email: str = Depends(verify_admin_token)):
    """Delete listing"""
    result = await db.listings.delete_one({"id": listing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted"}

# ===================== ADMIN - VENDORS =====================

@api_router.get("/admin/vendors")
async def get_all_vendors(email: str = Depends(verify_admin_token)):
    """Get all vendors"""
    vendors = await db.vendors.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return vendors

@api_router.patch("/admin/vendors/{vendor_id}")
async def update_vendor_status(vendor_id: str, status: str, email: str = Depends(verify_admin_token)):
    """Update vendor status"""
    result = await db.vendors.update_one({"id": vendor_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor updated"}

# ===================== ADMIN - REFERRAL TERMS =====================

@api_router.patch("/admin/referral-terms")
async def update_referral_terms(terms: ReferralTerms, email: str = Depends(verify_admin_token)):
    """Update referral terms"""
    terms.updated_at = datetime.now(timezone.utc).isoformat()
    await db.referral_terms.update_one(
        {"id": "referral_terms"},
        {"$set": terms.model_dump()},
        upsert=True
    )
    return {"message": "Terms updated"}

# ===================== ADMIN - MARKETING MATERIALS =====================

@api_router.get("/admin/materials")
async def get_materials(email: str = Depends(verify_admin_token)):
    """Get all marketing materials"""
    materials = await db.marketing_materials.find({}, {"_id": 0}).to_list(50)
    return materials

@api_router.post("/admin/materials")
async def add_material(title: str, description: str, file_url: str, file_type: str, email: str = Depends(verify_admin_token)):
    """Add marketing material"""
    material = MarketingMaterial(
        title=title,
        description=description,
        file_url=file_url,
        file_type=file_type
    )
    await db.marketing_materials.insert_one(material.model_dump())
    return material

@api_router.delete("/admin/materials/{material_id}")
async def delete_material(material_id: str, email: str = Depends(verify_admin_token)):
    """Delete marketing material"""
    result = await db.marketing_materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted"}

# ===================== ADMIN - ANALYTICS =====================

@api_router.get("/admin/analytics")
async def get_analytics(email: str = Depends(verify_admin_token)):
    """Get dashboard analytics"""
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    contacted_leads = await db.leads.count_documents({"status": "contacted"})
    converted_leads = await db.leads.count_documents({"status": "converted"})
    
    # Source breakdown
    website_leads = await db.leads.count_documents({"source": "website"})
    calculator_leads = await db.leads.count_documents({"source": "calculator"})
    referral_leads = await db.leads.count_documents({"referral_code": {"$exists": True, "$ne": None}})
    
    # Collaboration leads
    collab_leads = await db.collaboration_leads.count_documents({})
    
    # Vendors
    total_vendors = await db.vendors.count_documents({})
    pending_vendors = await db.vendors.count_documents({"status": "pending"})
    
    # Partners
    total_partners = await db.partners.count_documents({})
    active_partners = await db.partners.count_documents({"is_active": True})
    
    # Listings
    total_listings = await db.listings.count_documents({})
    available_listings = await db.listings.count_documents({"status": "available"})
    
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
