
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import recipes_collection
from utils import verify_token

router = APIRouter()
bearer = HTTPBearer()

@router.post("/save_recipe")
def save_recipe(data: dict, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    new_entry = {
        "user_email": user["sub"],
        "title": data["title"],
        "ingredients": data["ingredients"],
        "text": data["text"],
        "language": data.get("language", "en"),
        "notes": data.get("notes", "")
    }

    recipes_collection.insert_one(new_entry)
    return {"msg": "Recipe saved!"}


@router.get("/my_recipes")
def get_my_recipes(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    user_recipes = list(recipes_collection.find({"user_email": user["sub"]}, {"_id": 0}))
    return {"recipes": user_recipes}

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
        raise HTTPException(status_code=404, detail="Recipe not found or no changes")

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
