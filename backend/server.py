from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent

# Load environment-specific .env file
node_env = os.getenv('NODE_ENV', 'development')
env_file = ROOT_DIR / f'.env.{node_env}'

# Load .env.{NODE_ENV} if exists, otherwise fall back to .env
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv(ROOT_DIR / '.env')

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
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

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

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminCreate(BaseModel):
    email: str
    password: str
    name: str

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# ===================== HELPERS =====================

def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# Package rates per sq ft
PACKAGE_RATES = {
    "basic": {
        "independent_house": 1850,
        "villa": 2200,
        "apartment": 1650,
        "school": 1750,
        "interior": 1200
    },
    "premium": {
        "independent_house": 2350,
        "villa": 2800,
        "apartment": 2100,
        "school": 2200,
        "interior": 1600
    },
    "luxury": {
        "independent_house": 2950,
        "villa": 3500,
        "apartment": 2650,
        "school": 2800,
        "interior": 2200
    }
}

# ===================== PUBLIC ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Alpha Groups API", "status": "running"}

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    lead_id = str(uuid.uuid4())
    lead_dict = lead_data.model_dump()
    lead_dict['id'] = lead_id
    lead_dict['status'] = 'new'
    lead_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    
    result = supabase.table("leads").insert(lead_dict).execute()
    return Lead(**result.data[0])

@api_router.post("/quote-request", response_model=Lead)
async def create_quote_request(quote: QuoteRequest):
    lead_id = str(uuid.uuid4())
    lead_dict = {
        "id": lead_id,
        "name": quote.name,
        "phone": quote.phone,
        "email": quote.email,
        "project_type": quote.project_type,
        "plot_area": quote.plot_area,
        "location": quote.location,
        "budget": f"₹{quote.estimated_cost:,.0f} ({quote.package_type})",
        "message": quote.message,
        "source": "calculator",
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = supabase.table("leads").insert(lead_dict).execute()
    return Lead(**result.data[0])

@api_router.post("/calculate", response_model=CalculatorResult)
async def calculate_cost(calc_input: CalculatorInput):
    package = calc_input.package_type.lower()
    project = calc_input.project_type.lower().replace(" ", "_")

    if package not in PACKAGE_RATES:
        raise HTTPException(status_code=400, detail="Invalid package type")
    if project not in PACKAGE_RATES[package]:
        raise HTTPException(status_code=400, detail="Invalid project type")

    base_rate = PACKAGE_RATES[package][project]
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

@api_router.get("/packages")
async def get_packages():
    return {
        "basic": {
            "name": "Basic",
            "description": "Quality construction with standard specifications",
            "features": [
                "Tata/JSW TMT Steel",
                "UltraTech/ACC Cement",
                "Standard Electrical (Finolex)",
                "CPVC Plumbing (Astral)",
                "Basic Flooring (Vitrified Tiles)",
                "Asian Paints Interior",
                "Standard Windows (Aluminium)"
            ],
            "rates": PACKAGE_RATES["basic"]
        },
        "premium": {
            "name": "Premium",
            "description": "Enhanced quality with premium materials",
            "features": [
                "Tata Tiscon TMT Steel",
                "UltraTech Premium Cement",
                "Premium Electrical (Havells)",
                "CPVC Plumbing (Supreme)",
                "Italian Marble/Granite Flooring",
                "Asian Paints Royale",
                "uPVC Windows (Fenesta)",
                "Modular Kitchen (Basic)"
            ],
            "rates": PACKAGE_RATES["premium"]
        },
        "luxury": {
            "name": "Luxury",
            "description": "Top-tier construction with luxury finishes",
            "features": [
                "Tata Tiscon Super TMT",
                "ACC Gold Cement",
                "Premium Electrical (Schneider)",
                "Premium Plumbing (Jaquar)",
                "Imported Marble/Granite",
                "Asian Paints Ultima",
                "uPVC Windows (Fenesta Pro)",
                "Premium Modular Kitchen",
                "Home Automation Ready",
                "Vastu Compliance"
            ],
            "rates": PACKAGE_RATES["luxury"]
        }
    }

# ===================== ADMIN AUTH =====================

@api_router.post("/admin/login")
async def admin_login(creds: AdminLogin):
    result = supabase.table("admins").select("*").eq("email", creds.email).execute()
    admin = result.data[0] if result.data else None
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(creds.email)
    return {"token": token, "email": admin["email"], "name": admin["name"]}

@api_router.post("/admin/register")
async def admin_register(admin_data: AdminCreate):
    existing = supabase.table("admins").select("*").eq("email", admin_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Admin already exists")

    admin_dict = {
        "id": str(uuid.uuid4()),
        "email": admin_data.email,
        "password": hash_password(admin_data.password),
        "name": admin_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = supabase.table("admins").insert(admin_dict).execute()
    admin = result.data[0]
    token = create_token(admin["email"])
    return {"token": token, "email": admin["email"], "name": admin["name"]}

@api_router.get("/admin/me")
async def get_admin_profile(email: str = Depends(verify_token)):
    result = supabase.table("admins").select("*").eq("email", email).execute()
    admin = result.data[0] if result.data else None
    
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Remove password from response
    admin.pop("password", None)
    return admin

# ===================== ADMIN LEADS MANAGEMENT =====================

@api_router.get("/admin/leads", response_model=List[Lead])
async def get_all_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    email: str = Depends(verify_token)
):
    query = supabase.table("leads").select("*")
    
    if status:
        query = query.eq("status", status)
    if source:
        query = query.eq("source", source)
    
    result = query.order("created_at", desc=True).execute()
    return [Lead(**lead) for lead in result.data]

@api_router.get("/admin/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, email: str = Depends(verify_token)):
    result = supabase.table("leads").select("*").eq("id", lead_id).execute()
    lead = result.data[0] if result.data else None
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return Lead(**lead)

@api_router.patch("/admin/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, update: LeadUpdate, email: str = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    result = supabase.table("leads").update(update_data).eq("id", lead_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found")

    return Lead(**result.data[0])

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, email: str = Depends(verify_token)):
    result = supabase.table("leads").delete().eq("id", lead_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# ===================== ADMIN ANALYTICS =====================

@api_router.get("/admin/analytics")
async def get_analytics(email: str = Depends(verify_token)):
    # Total leads
    total_result = supabase.table("leads").select("*", count="exact").execute()
    total_leads = total_result.count
    
    # Status counts
    new_result = supabase.table("leads").select("*", count="exact").eq("status", "new").execute()
    new_leads = new_result.count
    
    contacted_result = supabase.table("leads").select("*", count="exact").eq("status", "contacted").execute()
    contacted_leads = contacted_result.count
    
    converted_result = supabase.table("leads").select("*", count="exact").eq("status", "converted").execute()
    converted_leads = converted_result.count

    # Source breakdown
    website_result = supabase.table("leads").select("*", count="exact").eq("source", "website").execute()
    website_leads = website_result.count
    
    calculator_result = supabase.table("leads").select("*", count="exact").eq("source", "calculator").execute()
    calculator_leads = calculator_result.count

    # Project type breakdown
    all_leads_result = supabase.table("leads").select("project_type").execute()
    project_breakdown = {}
    for lead in all_leads_result.data:
        pt = lead.get("project_type", "unknown")
        project_breakdown[pt] = project_breakdown.get(pt, 0) + 1

    return {
        "total_leads": total_leads,
        "new_leads": new_leads,
        "contacted_leads": contacted_leads,
        "converted_leads": converted_leads,
        "conversion_rate": (converted_leads / total_leads * 100) if total_leads > 0 else 0,
        "source_breakdown": {
            "website": website_leads,
            "calculator": calculator_leads
        },
        "project_breakdown": project_breakdown
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
