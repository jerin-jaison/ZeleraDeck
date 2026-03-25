"""
tools/test_cloudinary.py
Phase 1 — Link Verification
Run this before building any image upload logic.
Usage: python tools/test_cloudinary.py
"""
import os
import sys
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

def test_cloudinary_connection():
    print("🔗 Testing Cloudinary connection...")

    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        print("❌ FAIL: Missing Cloudinary credentials in .env")
        print("   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET")
        sys.exit(1)

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret
    )

    # Upload a tiny test image (1x1 transparent PNG as base64)
    test_image_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    try:
        result = cloudinary.uploader.upload(
            test_image_b64,
            public_id="zeleradeck_test_connection",
            overwrite=True,
            tags=["test"]
        )
        print(f"✅ PASS: Cloudinary upload successful")
        print(f"   URL: {result['secure_url']}")
        print(f"   Public ID: {result['public_id']}")

        # Clean up test image
        cloudinary.uploader.destroy("zeleradeck_test_connection")
        print("   Test image cleaned up.")
        return True

    except Exception as e:
        print(f"❌ FAIL: Cloudinary upload failed — {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_cloudinary_connection()
    print("\n✅ All Cloudinary checks passed. Safe to proceed.")
