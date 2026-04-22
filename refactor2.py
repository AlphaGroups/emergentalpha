import re
import os

filepath = 'backend/server.py'
with open(filepath, 'r') as f:
    content = f.read()

# 1. find_one with no args
# partner = await db.partners.find_one(...)
# Needs to handle multi-line arguments. Let's just do manual replacements for the complex ones.
replacements = [
    (
        r'await db\.admins\.update_one\(\s*\{\s*"email": "test@alpha.com"\s*\},\s*\{"\$set": \{"password": hash_password\("password123"\)\}\}\s*\)',
        r'supabase.table("admins").update({"password": hash_password("password123")}).eq("email", "test@alpha.com").execute()'
    ),
    (
        r'await db\.package_configs\.find\(\{"is_visible": True\}, \{"_id": 0\}\)\.sort\("order", 1\)\.to_list\(10\)',
        r'supabase.table("package_configs").select("*").eq("is_visible", True).order("order", desc=False).limit(10).execute().data'
    ),
    (
        r'await db\.package_features\.find\(\{\}, \{"_id": 0\}\)\.sort\("order", 1\)\.to_list\(100\)',
        r'supabase.table("package_features").select("*").order("order", desc=False).limit(100).execute().data'
    ),
    (
        r'await db\.listings\.find\(query, \{"_id": 0\}\)\.sort\("created_at", -1\)\.to_list\(100\)',
        r'supabase.table("listings").select("*").match(query).order("created_at", desc=True).limit(100).execute().data'
    ),
    (
        r'await db\.partners\.update_one\(\{"phone": data\.phone\}, \{"\$set": \{"password": new_hash\}\}\)',
        r'supabase.table("partners").update({"password": new_hash}).eq("phone", data.phone).execute()'
    ),
    (
        r'await db\.leads\.count_documents\(\{"referral_code": referral_code, "status": \{"\$in": \["contacted", "in_progress"\]\}\}\)',
        r'supabase.table("leads").select("*", count="exact", head=True).eq("referral_code", referral_code).in_("status", ["contacted", "in_progress"]).execute().count'
    ),
    (
        r'''pipeline = \[
        \{"\$match": \{"referral_code": referral_code, "status": "converted", "referral_earning": \{"\$exists": True\}\}\},
        \{"\$group": \{"_id": None, "total": \{"\$sum": "\$referral_earning"\}\}\}
    \]
    earnings_result = await db\.leads\.aggregate\(pipeline\)\.to_list\(1\)
    total_earnings = earnings_result\[0\]\["total"\] if earnings_result else 0''',
        r'''res = supabase.table("leads").select("referral_earning").eq("referral_code", referral_code).eq("status", "converted").not_.is_null("referral_earning").execute()
    total_earnings = sum(item["referral_earning"] for item in res.data if item["referral_earning"])'''
    ),
    (
        r'''paid_pipeline = \[
        \{"\$match": \{"partner_id": partner\["id"\], "status": "paid"\}\},
        \{"\$group": \{"_id": None, "total": \{"\$sum": "\$amount"\}\}\}
    \]
    paid_result = await db\.partner_payments\.aggregate\(paid_pipeline\)\.to_list\(1\)
    total_paid = paid_result\[0\]\["total"\] if paid_result else 0''',
        r'''res = supabase.table("partner_payments").select("amount").eq("partner_id", partner["id"]).eq("status", "paid").execute()
    total_paid = sum(item["amount"] for item in res.data if item["amount"])'''
    ),
    (
        r'await db\.marketing_materials\.find\(\{\}, \{"_id": 0\}\)\.to_list\(50\)',
        r'supabase.table("marketing_materials").select("*").limit(50).execute().data'
    ),
    (
        r'await db\.package_configs\.find\(\{\}, \{"_id": 0\}\)\.sort\("order", 1\)\.to_list\(10\)',
        r'supabase.table("package_configs").select("*").order("order", desc=False).limit(10).execute().data'
    ),
    (
        r'await db\.partners\.find\(\{\}, \{"_id": 0, "password": 0\}\)\.to_list\(100\)',
        r'supabase.table("partners").select("id,name,email,phone,referral_code,commission_percent,account_manager,is_active,created_at").limit(100).execute().data'
    ),
    (
        r'await db\.collaboration_leads\.find\(\{\}, \{"_id": 0\}\)\.sort\("created_at", -1\)\.to_list\(500\)',
        r'supabase.table("collaboration_leads").select("*").order("created_at", desc=True).limit(500).execute().data'
    ),
    (
        r'await db\.collaboration_leads\.update_one\(\{"id": lead_id\}, \{"\$set": \{"status": status\}\}\)',
        r'supabase.table("collaboration_leads").update({"status": status}).eq("id", lead_id).execute()'
    ),
    (
        r'await db\.listings\.find\(\{\}, \{"_id": 0\}\)\.sort\("created_at", -1\)\.to_list\(100\)',
        r'supabase.table("listings").select("*").order("created_at", desc=True).limit(100).execute().data'
    ),
    (
        r'await db\.vendors\.find\(\{\}, \{"_id": 0\}\)\.sort\("created_at", -1\)\.to_list\(500\)',
        r'supabase.table("vendors").select("*").order("created_at", desc=True).limit(500).execute().data'
    ),
    (
        r'await db\.vendors\.update_one\(\{"id": vendor_id\}, \{"\$set": \{"status": status\}\}\)',
        r'supabase.table("vendors").update({"status": status}).eq("id", vendor_id).execute()'
    ),
    (
        r'await db\.referral_terms\.update_one\(\s*\{"id": "referral_terms"\}, \{"\$set": update_data\}\s*\)',
        r'supabase.table("referral_terms").update(update_data).eq("id", "referral_terms").execute()'
    ),
    (
        r'await db\.package_features\.update_one\(\s*\{"id": order\["id"\]\}, \{"\$set": \{"order": order\["order"\]\}\}\s*\)',
        r'supabase.table("package_features").update({"order": order["order"]}).eq("id", order["id"]).execute()'
    ),
    (
        r'await db\.partners\.find\(\{\}, \{"_id": 0, "password": 0\}\)\.to_list\(200\)',
        r'supabase.table("partners").select("id,name,email,phone,referral_code,commission_percent,account_manager,is_active,created_at").limit(200).execute().data'
    ),
    (
        r'await db\.leads\.find\(\{"referral_code": referral_code\}, \{"_id": 0\}\)\.to_list\(200\)',
        r'supabase.table("leads").select("*").eq("referral_code", referral_code).limit(200).execute().data'
    ),
    (
        r'await db\.leads\.count_documents\(\{"referral_code": \{"\$exists": True, "\$ne": None\}\}\)',
        r'supabase.table("leads").select("*", count="exact", head=True).not_.is_null("referral_code").execute().count'
    ),
    (
        r'partner = await db\.partners\.find_one\(\s*\{"\$or": \[\{"phone": identifier\}, \{"email": identifier\}\]\},\s*\{"_id": 0, "password": 0\}\s*\)',
        r'partner_res = supabase.table("partners").select("id,name,email,phone,referral_code,commission_percent,account_manager,is_active,created_at").or_(f"phone.eq.{identifier},email.eq.{identifier}").execute()\n    partner = partner_res.data[0] if partner_res.data else None'
    ),
    (
        r'all_leads = await db\.leads\.find\(\s*query,\s*\{"_id": 0\}\s*\)\.sort\("created_at", -1\)\.skip\(skip\)\.limit\(limit\)\.to_list\(limit\)',
        r'all_leads = supabase.table("leads").select("*").match(query).order("created_at", desc=True).range(skip, skip + limit - 1).execute().data'
    ),
    (
        r'leads = await db\.leads\.find\(\s*query,\s*\{"_id": 0\}\s*\)\.sort\("created_at", -1\)\.to_list\(limit\)',
        r'leads = supabase.table("leads").select("*").match(query).order("created_at", desc=True).limit(limit).execute().data'
    )
]

for pat, repl in replacements:
    content = re.sub(pat, repl, content, flags=re.MULTILINE)

# Also replace .data -> .data[0] if ...data else None for my earlier naive find_one replacement
# Let's fix that generic replacement if it's assigned to something.
content = re.sub(r'([a-zA-Z_]+) = supabase\.table\("([^"]+)"\)\.select\("\*"\)\.eq\("([^"]+)", ([^)]+)\)\.execute\(\)\.data\n', 
                 r'res = supabase.table("\2").select("*").eq("\3", \4).execute()\n    \1 = res.data[0] if res.data else None\n', content)

# Remove 'db' entirely if it exists.
content = re.sub(r'import db', '', content)

with open(filepath, 'w') as f:
    f.write(content)

print("Refactoring done phase 2.")
