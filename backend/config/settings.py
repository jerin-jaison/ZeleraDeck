"""
Django settings for ZeleraDeck project.
Strictly follows claude.md — ZeleraDeck Project Constitution.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, unquote

# Load .env file
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ─── Core ─────────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-me-in-dot-env")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1",
    ).split(",")
    if h.strip()
]

# Frontend canonical URL used for building public shop links
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://www.zeleradeck.com")

# ─── Installed Apps ───────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "cloudinary",
    "cloudinary_storage",
    "django_filters",
    # Local apps
    "accounts",
    "catalogue",
]

# ─── Middleware ────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",          # Must be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",     # Right after security
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ─── Database (PostgreSQL via DATABASE_URL) ────────────────────────────────────

_db_url = os.getenv("DATABASE_URL", "")
_parsed = urlparse(_db_url) if _db_url else None

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": _parsed.path.lstrip("/") if _parsed else "zeleradeck_db",
        "USER": _parsed.username if _parsed else "postgres",
        "PASSWORD": unquote(_parsed.password) if _parsed and _parsed.password else "",
        "HOST": _parsed.hostname if _parsed else "localhost",
        "PORT": str(_parsed.port or 5432) if _parsed else "5432",
    }
}

# ─── Auth ─────────────────────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Using Django's built-in User model for Phase 1.
# Phase 2 will introduce a custom Shop model with phone-based auth.

# ─── CORS ─────────────────────────────────────────────────────────────────────

# Production origins come from the env var (Render/Vercel URLs — no localhost).
# Localhost URLs are appended here in code so Render's env parser never touches
# them and strips the http:// scheme (which causes corsheaders.E013).
_cors_env = [
    o.strip()
    for o in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    if o.strip()
]
CORS_ALLOWED_ORIGINS = _cors_env + [
    "http://localhost:5173",
    "http://localhost:5174",
]

# CSRF trusted origins — required for POST/PUT/PATCH requests from the frontend.
# Same pattern: production values from env, no trailing slashes.
_csrf_env = [
    o.strip()
    for o in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]
# Ensure the production domains are always present even if the env var is unset.
_csrf_defaults = [
    "https://zeleradeck.com",
    "https://www.zeleradeck.com",
]
CSRF_TRUSTED_ORIGINS = _csrf_env if _csrf_env else _csrf_defaults

# Allow the X-Admin-Key custom header used by the admin panel
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    "x-admin-key",
]

# ─── Django REST Framework ────────────────────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# ─── Simple JWT ───────────────────────────────────────────────────────────────

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME_MINUTES", "60"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.getenv("REFRESH_TOKEN_LIFETIME_DAYS", "365"))
    ),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "ALGORITHM": "HS256",
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ─── Cloudinary ───────────────────────────────────────────────────────────────
import cloudinary

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    "API_KEY": os.getenv("CLOUDINARY_API_KEY", ""),
    "API_SECRET": os.getenv("CLOUDINARY_API_SECRET", ""),
}

# Initialize the raw Cloudinary SDK — required by cloudinary.uploader.upload()
# (CLOUDINARY_STORAGE above is only used by cloudinary_storage model field backend)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.getenv("CLOUDINARY_API_KEY", ""),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
)

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

# ─── Internationalisation ─────────────────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

# ─── Static / Media ───────────────────────────────────────────────────────────

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICS_DIRS = []
WHITENOISE_USE_FINDERS = True

MEDIA_URL = "/media/"

# ─── Default PK ───────────────────────────────────────────────────────────────

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
