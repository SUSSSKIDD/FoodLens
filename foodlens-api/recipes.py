
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import recipes_collection
from utils import verify_token

router = APIRouter()
bearer = HTTPBearer()

from datetime import datetime

@router.post("/save_recipe")
def save_recipe(recipe: dict, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    recipe["user_email"] = user["sub"]
    recipe["created_at"] = datetime.utcnow()  # ⏰ Add timestamp
    recipes_collection.insert_one(recipe)
    return {"msg": "Recipe saved successfully"}



@router.get("/my_recipes")
def my_recipes(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    recipes = list(recipes_collection.find({"user_email": user["sub"]}).sort("created_at", -1))
    for r in recipes:
        r["_id"] = str(r["_id"])
    return {"recipes": recipes}


@router.post("/update_recipe")
def update_recipe(data: dict, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    result = recipes_collection.update_one(
        {"user_email": user["sub"], "title": data["title"]},
        {"$set": {
            "text": data.get("text"),
            "notes": data.get("notes")
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found or unchanged")

    return {"msg": "Recipe updated successfully"}


@router.delete("/delete_recipe")
def delete_recipe(title: str, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    result = recipes_collection.delete_one({"user_email": user["sub"], "title": title})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found")

    return {"msg": "Recipe deleted successfully"}
