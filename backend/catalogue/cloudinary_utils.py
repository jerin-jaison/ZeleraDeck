# POLICY: Existing user videos are never deleted or modified regardless of size.
import cloudinary.uploader


class CloudinaryUploadError(Exception):
    pass


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
