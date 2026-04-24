import os
from dotenv import load_dotenv

load_dotenv('c:/Users/ADMIN/Desktop/emergent/emergentalpha/backend/.env.production')

from database import count

try:
    print("Testing total leads...")
    count('SELECT COUNT(*) FROM leads')
    print("Testing new leads...")
    count('SELECT COUNT(*) FROM leads WHERE status = %s', ('new',))
    print("Testing contacted...")
    count('SELECT COUNT(*) FROM leads WHERE status = %s', ('contacted',))
    print("Testing converted...")
    count('SELECT COUNT(*) FROM leads WHERE status = %s', ('converted',))
    print("Testing website...")
    count('SELECT COUNT(*) FROM leads WHERE source = %s', ('website',))
    print("Testing calculator...")
    count('SELECT COUNT(*) FROM leads WHERE source = %s', ('calculator',))
    print("Testing referral...")
    count("SELECT COUNT(*) FROM leads WHERE referral_code IS NOT NULL AND referral_code != ''")
    print("Testing collab...")
    count('SELECT COUNT(*) FROM collaboration_leads')
    print("Testing vendors...")
    count('SELECT COUNT(*) FROM vendors')
    print("Testing pending_vendors...")
    count('SELECT COUNT(*) FROM vendors WHERE status = %s', ('pending',))
    print("Testing partners...")
    count('SELECT COUNT(*) FROM partners')
    print("Testing active partners...")
    count('SELECT COUNT(*) FROM partners WHERE is_active = true')
    print("Testing total listings...")
    count('SELECT COUNT(*) FROM listings')
    print("Testing available listings...")
    count('SELECT COUNT(*) FROM listings WHERE status = %s', ('available',))
    print("All counts successful!")
except Exception as e:
    import traceback
    traceback.print_exc()
