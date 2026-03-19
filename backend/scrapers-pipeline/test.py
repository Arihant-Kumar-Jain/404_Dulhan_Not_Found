import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

# Check row count
cur.execute("SELECT COUNT(*) FROM decor_library")
print("Row count:", cur.fetchone()[0])

# Try a manual insert
cur.execute("""
    INSERT INTO decor_library (source_id, source, function_type, style, combination_key, original_url, supabase_url, is_tagged)
    VALUES ('test_001', 'test', 'Pheras', 'Royal', 'Pheras_Royal', 'http://example.com', 'http://example.com', false)
    ON CONFLICT (source_id) DO NOTHING
""")
conn.commit()
print("Manual insert succeeded")

cur.execute("SELECT COUNT(*) FROM decor_library")
print("Row count after insert:", cur.fetchone()[0])

conn.close()