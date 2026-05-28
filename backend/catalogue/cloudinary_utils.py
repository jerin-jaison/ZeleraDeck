# POLICY: Existing user videos are never deleted or modified regardless of size.
# POLICY: Cloudinary asset deletion only fires for new uploads that are explicitly replaced
#          or rejected — existing product media in the database is NEVER touched proactively.
import cloudinary.uploader


class CloudinaryUploadError(Exception):
    pass


def delete_cloudinary_asset_by_url(url, resource_type='image'):
    """Delete a single Cloudinary asset by its secure_url.

    Silently no-ops if:
    - url is empty / None
    - url is not a valid Cloudinary URL
    - the Cloudinary API call fails (network or auth error)

    SAFETY GUARANTEE: This function is ONLY called for assets that were
    just uploaded as part of the current request and are being replaced,
    OR for assets belonging to a product row that is being permanently
    deleted from the database right now. It is NEVER called on arbitrary
    URLs from historical records without an explicit delete/replace trigger.
    """
    if not url:
        return

    import re

    # Cloudinary URLs look like:
    # https://res.cloudinary.com/<cloud>/image/upload/v1234567890/zeleradeck/slug/filename.jpg
    # https://res.cloudinary.com/<cloud>/video/upload/v1234567890/zeleradeck/slug/videos/filename.mp4
    match = re.search(
        r'cloudinary\.com/[^/]+/(image|video|raw)/upload/(?:v\d+/)?(.+?)(?:\.[a-zA-Z0-9]+)?$',
        url,
    )
    if not match:
        return  # not a Cloudinary URL — skip silently

    detected_type = match.group(1)   # 'image' or 'video'
    public_id = match.group(2)        # e.g. 'zeleradeck/slug/videos/filename'

    try:
        cloudinary.uploader.destroy(public_id, resource_type=detected_type)
    except Exception:
        pass  # Best-effort — never let a cleanup failure break a user action


def upload_product_image(image_file, shop_slug):
    """Upload a product image to Cloudinary under the shop's folder."""
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder=f"zeleradeck/{shop_slug}",
            transformation=[
                {"width": 800, "quality": "auto", "fetch_format": "auto"}
            ]
        )
        return result['secure_url']
    except Exception as e:
        raise CloudinaryUploadError(f"Image upload failed: {e}")


def upload_product_video(video_file, shop_slug):
    """Upload a product video to Cloudinary (Pro users only).
    Applies server-side 720p / auto:low compression via eager transformation.
    Raises CloudinaryUploadError if the compressed output exceeds 5 MB.

    NOTE: This is a legacy fallback path only. In the current browser-direct
    upload flow, the frontend uploads directly to Cloudinary using the
    'zeleradeck_video' unsigned preset and sends back the resulting URL.
    This function is only called if a raw video file is sent to Django instead.
    """
    try:
        result = cloudinary.uploader.upload(
            video_file,
            resource_type='video',
            folder=f"zeleradeck/{shop_slug}/videos",
            eager=[{
                'height': 720,
                'crop': 'scale',
                'quality': 'auto:low',
                'format': 'mp4',
            }],
            eager_async=False,
        )
    except Exception as e:
        raise CloudinaryUploadError(f"Video upload failed: {e}")

    # Use the eager (compressed) version's URL and size
    if result.get('eager'):
        eager = result['eager'][0]
        url = eager['secure_url']
        compressed_bytes = eager.get('bytes', 0)
    else:
        url = result['secure_url']
        compressed_bytes = result.get('bytes', 0)

    if compressed_bytes > 5 * 1024 * 1024:
        raise CloudinaryUploadError(
            "Uploaded video exceeds 5MB after compression. Please use a shorter clip."
        )

    return url


def upload_shop_logo(image_file, shop_slug):
    """Upload a shop logo to Cloudinary. 400x400 square crop."""
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder="zeleradeck/logos",
            public_id=f"logo_{shop_slug}",
            overwrite=True,
            transformation=[
                {"width": 400, "height": 400,
                 "crop": "fill", "quality": "auto", "fetch_format": "auto"}
            ]
        )
        return result['secure_url']
    except Exception as e:
        raise CloudinaryUploadError(f"Logo upload failed: {e}")
