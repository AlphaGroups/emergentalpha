"""
Supabase/PostgreSQL Schema Migration for Alpha Groups PropTech Platform
Run this once to create all required tables.
"""
import psycopg2
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

POSTGRES_URL = os.environ.get('POSTGRES_URL_NON_POOLING') or os.environ.get('POSTGRES_URL')

SQL = """
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    commission_percent FLOAT DEFAULT 2.0,
    account_manager TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    project_type TEXT NOT NULL,
    plot_area FLOAT,
    location TEXT,
    budget TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new',
    referral_code TEXT,
    partner_id TEXT,
    deal_value FLOAT,
    referral_earning FLOAT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS package_configs (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price_per_sft FLOAT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    "order" INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS package_features (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classic TEXT NOT NULL,
    "select" TEXT NOT NULL,
    signature TEXT NOT NULL,
    customize TEXT NOT NULL,
    "order" INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS collaboration_leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    land_location TEXT NOT NULL,
    land_size TEXT NOT NULL,
    intent TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    property_type TEXT NOT NULL,
    location TEXT NOT NULL,
    price FLOAT NOT NULL,
    area_sqft FLOAT NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    description TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'available',
    owner_type TEXT DEFAULT 'alpha',
    partner_id TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT DEFAULT '',
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    website TEXT,
    categories JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_terms (
    id TEXT PRIMARY KEY DEFAULT 'referral_terms',
    commission_percent FLOAT DEFAULT 2.0,
    validity_days INT DEFAULT 90,
    payment_timeline_days INT DEFAULT 30,
    terms_content TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'pdf',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_payments (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    amount FLOAT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);
"""

def run_migration():
    print(f"Connecting to Supabase PostgreSQL...")
    conn = psycopg2.connect(POSTGRES_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Creating tables...")
    cur.execute(SQL)
    
    # Verify tables were created
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cur.fetchall()]
    print(f"Tables in database: {tables}")
    
    expected = [
        'admins', 'collaboration_leads', 'leads', 'listings',
        'marketing_materials', 'package_configs', 'package_features',
        'partner_payments', 'partners', 'referral_terms', 'vendors'
    ]
    missing = [t for t in expected if t not in tables]
    if missing:
        print(f"WARNING: Missing tables: {missing}")
    else:
        print("All tables created successfully!")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    run_migration()
