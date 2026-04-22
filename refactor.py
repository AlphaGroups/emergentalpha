import re
import os

filepath = 'backend/server.py'
with open(filepath, 'r') as f:
    content = f.read()

# Refactoring mapping rules

# 1. await db.collection.insert_one(doc) -> supabase.table("collection").insert(doc).execute()
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.insert_one\(([^)]+)\)',
    r'supabase.table("\1").insert(\2).execute()',
    content
)

# 2. await db.collection.insert_many(docs) -> supabase.table("collection").insert(docs).execute()
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.insert_many\(([^)]+)\)',
    r'supabase.table("\1").insert(\2).execute()',
    content
)

# 3. await db.collection.find_one({"key": value}, {"_id": 0}) -> supabase.table("collection").select("*").eq("key", value).execute()
# We will do a generic replacement for find_one and manual fixups later
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.find_one\(\s*\{\s*"([^"]+)"\s*:\s*([^}]+)\s*\}(?:,\s*\{[^}]+\})?\s*\)',
    r'supabase.table("\1").select("*").eq("\2", \3).execute().data',
    content
)

# 4. update_one({"key": value}, {"$set": update_data}) -> supabase.table("collection").update(update_data).eq("key", value).execute()
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.update_one\(\s*\{\s*"([^"]+)"\s*:\s*([^}]+)\s*\},\s*\{"\$set":\s*([^}]+)\}\s*\)',
    r'supabase.table("\1").update(\4).eq("\2", \3).execute()',
    content
)

# 5. delete_one({"key": value}) -> supabase.table("collection").delete().eq("key", value).execute()
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.delete_one\(\s*\{\s*"([^"]+)"\s*:\s*([^}]+)\s*\}\s*\)',
    r'supabase.table("\1").delete().eq("\2", \3).execute()',
    content
)

# 6. count_documents({}) -> supabase.table("collection").select("*", count="exact", head=True).execute().count
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.count_documents\(\{\}\)',
    r'supabase.table("\1").select("*", count="exact", head=True).execute().count',
    content
)

# 7. count_documents({"key": value})
content = re.sub(
    r'await db\.([a-zA-Z_]+)\.count_documents\(\s*\{\s*"([^"]+)"\s*:\s*([^}]+)\s*\}\)',
    r'supabase.table("\1").select("*", count="exact", head=True).eq("\2", \3).execute().count',
    content
)

# 8. db.collection.find(...) ...
# We will leave complex aggregations and finds for manual replacement

with open(filepath, 'w') as f:
    f.write(content)

print("Refactoring done phase 1.")
