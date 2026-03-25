import cloudinary.uploader


class CloudinaryUploadError(Exception):
    pass


def upload_product_image(image_file, shop_slug):
    """Upload a product image to Cloudinary under the shop's folder.
    
    Args:
        image_file: Django InMemoryUploadedFile or similar file-like object.
        shop_slug: Used to organise images per shop in Cloudinary.
    
    Returns:
        str: secure_url of the uploaded image.
    
    Raises:
        CloudinaryUploadError: If the upload fails for any reason.
    """
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
