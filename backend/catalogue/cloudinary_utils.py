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
