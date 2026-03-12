from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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
    lead = Lead(**lead_data.model_dump())
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    return lead

@api_router.post("/quote-request", response_model=Lead)
async def create_quote_request(quote: QuoteRequest):
    lead = Lead(
        name=quote.name,
        phone=quote.phone,
        email=quote.email,
        project_type=quote.project_type,
        plot_area=quote.plot_area,
        location=quote.location,
        budget=f"₹{quote.estimated_cost:,.0f} ({quote.package_type})",
        message=quote.message,
        source="calculator"
    )
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    return lead

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
    admin = await db.admins.find_one({"email": creds.email}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(creds.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(creds.email)
    return {"token": token, "email": admin["email"], "name": admin["name"]}

@api_router.post("/admin/register")
async def admin_register(admin_data: AdminCreate):
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
    token = create_token(admin_data.email)
    return {"token": token, "email": doc["email"], "name": doc["name"]}

@api_router.get("/admin/me")
async def get_admin_profile(email: str = Depends(verify_token)):
    admin = await db.admins.find_one({"email": email}, {"_id": 0, "password": 0})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

# ===================== ADMIN LEADS MANAGEMENT =====================

@api_router.get("/admin/leads", response_model=List[Lead])
async def get_all_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    email: str = Depends(verify_token)
):
    query = {}
    if status:
        query["status"] = status
    if source:
        query["source"] = source
    
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return leads

@api_router.get("/admin/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, email: str = Depends(verify_token)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@api_router.patch("/admin/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, update: LeadUpdate, email: str = Depends(verify_token)):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.leads.update_one({"id": lead_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return lead

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, email: str = Depends(verify_token)):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# ===================== ADMIN ANALYTICS =====================

@api_router.get("/admin/analytics")
async def get_analytics(email: str = Depends(verify_token)):
    total_leads = await db.leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"})
    contacted_leads = await db.leads.count_documents({"status": "contacted"})
    converted_leads = await db.leads.count_documents({"status": "converted"})
    
    # Source breakdown
    website_leads = await db.leads.count_documents({"source": "website"})
    calculator_leads = await db.leads.count_documents({"source": "calculator"})
    
    # Project type breakdown
    pipeline = [
        {"$group": {"_id": "$project_type", "count": {"$sum": 1}}}
    ]
    project_breakdown = await db.leads.aggregate(pipeline).to_list(100)
    
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
        "project_breakdown": {item["_id"]: item["count"] for item in project_breakdown if item["_id"]}
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
