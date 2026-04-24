import psycopg2
import sys

def main():
    print("=========================================================")
    print("Database Schema Fixer")
    print("=========================================================")
    print("Please enter your Supabase PostgreSQL Connection String.")
    print("(You can find this in your Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI)")
    print("It should look something like: postgresql://postgres.pwakaqmylbhkanakbzsg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres")
    print()
    
    conn_string = input("Connection String: ").strip()
    
    if not conn_string:
        print("Error: Connection string cannot be empty.")
        sys.exit(1)
        
    try:
        print("\nConnecting to database...")
        conn = psycopg2.connect(conn_string)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Executing ALTER TABLE to add missing columns...")
        sql = """
        ALTER TABLE public.vendors 
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS vendor_id TEXT,
        ADD COLUMN IF NOT EXISTS document_url TEXT;

        ALTER TABLE public.leads
        ADD COLUMN IF NOT EXISTS referral_code TEXT,
        ADD COLUMN IF NOT EXISTS partner_id TEXT,
        ADD COLUMN IF NOT EXISTS deal_value DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS referral_earning DOUBLE PRECISION;
        
        NOTIFY pgrst, 'reload schema';
        """
        cur.execute(sql)
        print("✅ Successfully updated the vendors and leads table schemas!")
        print("✅ Successfully triggered API schema cache reload!")
        print("\nYou can now submit your vendor form from the live website!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"\n❌ Error executing SQL: {e}")

if __name__ == "__main__":
    main()
