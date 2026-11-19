"""
ZeleraDeck — SEO views
Serves dynamic XML sitemaps and llms.txt for search engines and AI crawlers.
"""

from django.http import HttpResponse
from django.utils import timezone
from accounts.models import Shop


def sitemap_stores_view(request):
    """
    GET /sitemap.xml and /sitemap-stores.xml
    Returns a dynamic XML sitemap containing all indexable pages and active shop URLs.
    Updates immediately whenever a shop is added or saved (no manual step, no ping).
    Excludes inactive shops and shops with is_indexable=False.
    """
    base_url = 'https://zeleradeck.com'
    today = timezone.now().strftime('%Y-%m-%d')

    # Core public indexable pages
    static_pages = [
        {'loc': f"{base_url}/", 'lastmod': today},
        {'loc': f"{base_url}/about", 'lastmod': today},
        {'loc': f"{base_url}/contact", 'lastmod': today},
        {'loc': f"{base_url}/why-us", 'lastmod': today},
        {'loc': f"{base_url}/directory", 'lastmod': today},
    ]

    try:
        shops = (
            Shop.objects.filter(is_active=True, is_indexable=True)
            .values_list('slug', 'updated_at')
            .order_by('slug')
        )
    except Exception:
        shops = []

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for p in static_pages:
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{p["loc"]}</loc>')
        xml_lines.append(f'    <lastmod>{p["lastmod"]}</lastmod>')
        xml_lines.append('  </url>')

    for slug, updated_at in shops:
        lastmod = updated_at.strftime('%Y-%m-%d') if updated_at else today
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{base_url}/{slug}</loc>')
        xml_lines.append(f'    <lastmod>{lastmod}</lastmod>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')
    xml_content = '\n'.join(xml_lines)

    return HttpResponse(xml_content, content_type='application/xml; charset=utf-8')
