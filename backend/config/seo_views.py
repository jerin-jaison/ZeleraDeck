"""
ZeleraDeck — SEO views
Serves sitemap-stores.xml and llms.txt for SEO and AI crawler visibility.
"""

from django.http import HttpResponse, FileResponse
from django.views.decorators.cache import cache_page


@cache_page(60 * 60 * 6)  # Cache for 6 hours
def sitemap_stores_view(request):
    """
    GET /sitemap-stores.xml
    Returns a dynamic XML sitemap containing all active shop catalogue URLs.
    """
    try:
        from accounts.models import ShopProfile
        slugs = ShopProfile.objects.filter(is_active=True).values_list('slug', flat=True)
    except Exception:
        slugs = []

    base_url = 'https://zeleradeck.com'
    urls = [base_url]  # Homepage

    for slug in slugs:
        urls.append(f"{base_url}/store/{slug}")

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    for url in urls:
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{url}</loc>')
        xml_lines.append('    <changefreq>weekly</changefreq>')
        xml_lines.append('    <priority>0.8</priority>')
        xml_lines.append('  </url>')

    xml_lines.append('</urlset>')
    xml_content = '\n'.join(xml_lines)

    return HttpResponse(xml_content, content_type='application/xml; charset=utf-8')
