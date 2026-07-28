import os
import sys
from pathlib import Path
import django

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from accounts.models import Shop
from django.contrib.auth.hashers import make_password

cursor = connection.cursor()
cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts_shop';")
cols = [row[0] for row in cursor.fetchall()]

required = {'id', 'name', 'slug', 'phone', 'password', 'is_active', 'is_pro', 'product_counter', 'created_at', 'updated_at'}
for col in cols:
    if col not in required:
        try:
            cursor.execute(f"ALTER TABLE accounts_shop ALTER COLUMN \"{col}\" DROP NOT NULL;")
        except Exception as e:
            print(f"Skipped {col}: {e}")

print("Database schema adjusted.")

# Create or update Normal Shop
normal_shop, created = Shop.objects.get_or_create(
    phone='9000000000',
    defaults={
        'name': 'Demo Normal Shop',
        'slug': 'normalshop',
        'is_pro': False,
        'is_active': True,
        'password': make_password('password123')
    }
)
if not created and normal_shop.is_pro:
    normal_shop.is_pro = False
    normal_shop.save(update_fields=['is_pro'])

print(f"Normal Shop: {normal_shop.name} | Slug: {normal_shop.slug} | Phone: {normal_shop.phone} | Password: password123 | is_pro: {normal_shop.is_pro}")

# Get or create Pro Shop
pro_shop = Shop.objects.filter(is_pro=True).first()
if pro_shop:
    print(f"Pro Shop: {pro_shop.name} | Slug: {pro_shop.slug} | Phone: {pro_shop.phone} | is_pro: {pro_shop.is_pro}")
