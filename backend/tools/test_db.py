"""
tools/test_db.py
Phase 1 - Link Verification
Run this to verify PostgreSQL connection before building models.
Usage: python tools/test_db.py
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv
from urllib.parse import urlparse

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_db_connection():
    print("[*] Testing PostgreSQL connection...")

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("[FAIL] DATABASE_URL not set in .env")
        sys.exit(1)

    try:
        result = urlparse(database_url)
        conn = psycopg2.connect(
            database=result.path[1:],
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port or 5432
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print("[PASS] Connected to PostgreSQL")
        print(f"   Version: {version[0]}")
        cursor.close()
        conn.close()
        return True

    except Exception as e:
        print(f"[FAIL] Database connection failed -- {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_db_connection()
    print("\n[OK] Database check passed. Safe to run migrations.")
