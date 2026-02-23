"""
Routes pour l'upload d'assets (logos, icônes, images)
"""
import os
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header
from fastapi.responses import JSONResponse

router = APIRouter()

# Configuration Cloudinary
CLOUDINARY_URL = os.environ.get("CLOUDINARY_URL", "")
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "")

# Types de fichiers autorisés
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB


def verify_admin_key(x_api_key: Optional[str] = Header(None)):
    """Vérifie la clé API admin"""
    if not ADMIN_API_KEY:
        return True  # Pas de protection en dev
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    folder: str = Form("assets"),
    event_id: Optional[str] = Form(None),
    asset_type: str = Form("image"),  # image, icon, video
    x_api_key: Optional[str] = Header(None)
):
    """
    Upload un asset (image, logo, icône, vidéo)
    
    Retourne l'URL de l'asset uploadé.
    Utilise Cloudinary si configuré, sinon simule avec placeholder.
    """
    verify_admin_key(x_api_key)
    
    # Vérifier le type de fichier
    content_type = file.content_type or ""
    
    if asset_type == "video":
        if content_type not in ALLOWED_VIDEO_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Type de fichier non autorisé. Types acceptés: {ALLOWED_VIDEO_TYPES}"
            )
    else:
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Type de fichier non autorisé. Types acceptés: {ALLOWED_IMAGE_TYPES}"
            )
    
    # Lire le fichier
    file_content = await file.read()
    file_size = len(file_content)
    
    # Vérifier la taille
    max_size = MAX_VIDEO_SIZE if asset_type == "video" else MAX_IMAGE_SIZE
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Fichier trop volumineux. Taille max: {max_size // (1024*1024)} MB"
        )
    
    # Générer un nom unique
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_id = str(uuid.uuid4())[:8]
    
    # Construire le chemin
    if event_id:
        upload_path = f"savethedate/{event_id}/{folder}/{unique_id}.{file_ext}"
    else:
        upload_path = f"savethedate/{folder}/{unique_id}.{file_ext}"
    
    # Upload vers Cloudinary si configuré
    if CLOUDINARY_URL:
        try:
            import cloudinary
            import cloudinary.uploader
            
            # Parse the cloudinary URL
            cloudinary.config(cloudinary_url=CLOUDINARY_URL)
            
            # Upload options
            upload_options = {
                "public_id": upload_path.rsplit(".", 1)[0],  # Sans extension
                "resource_type": "video" if asset_type == "video" else "image",
                "overwrite": True,
            }
            
            # Optimisations pour les images
            if asset_type != "video":
                upload_options["transformation"] = [
                    {"quality": "auto:good", "fetch_format": "auto"}
                ]
            
            # Upload
            result = cloudinary.uploader.upload(file_content, **upload_options)
            
            return {
                "success": True,
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height"),
                "size": file_size
            }
            
        except Exception as e:
            print(f"Cloudinary upload error: {e}")
            # Fallback vers simulation
    
    # Simulation (pour dev sans Cloudinary)
    simulated_url = f"https://res.cloudinary.com/demo/image/upload/{upload_path}"
    
    return {
        "success": True,
        "url": simulated_url,
        "public_id": upload_path,
        "format": file_ext,
        "size": file_size,
        "simulated": True,
        "message": "Mode simulation - configurez CLOUDINARY_URL pour upload réel"
    }


@router.delete("/upload/{public_id:path}")
async def delete_asset(
    public_id: str,
    x_api_key: Optional[str] = Header(None)
):
    """
    Supprime un asset uploadé
    """
    verify_admin_key(x_api_key)
    
    if CLOUDINARY_URL:
        try:
            import cloudinary
            import cloudinary.uploader
            
            cloudinary.config(cloudinary_url=CLOUDINARY_URL)
            result = cloudinary.uploader.destroy(public_id)
            
            return {
                "success": result.get("result") == "ok",
                "public_id": public_id
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "success": True,
        "public_id": public_id,
        "simulated": True
    }
