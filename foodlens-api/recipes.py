from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime

from database import recipes_collection
from utils import verify_token

router = APIRouter()
bearer = HTTPBearer()

# ✅ Save a recipe
@router.post("/save_recipe")
def save_recipe(recipe: dict, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    recipe["user_email"] = user["sub"]
    recipe["created_at"] = datetime.utcnow()
    recipes_collection.insert_one(recipe)

    return {"msg": "Recipe saved successfully"}

# ✅ Fetch all saved recipes for logged-in user
@router.get("/my_recipes")
def my_recipes(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    recipes = list(recipes_collection.find({"user_email": user["sub"]}).sort("created_at", -1))
    for recipe in recipes:
        recipe["_id"] = str(recipe["_id"])
    return {"recipes": recipes}

@router.post("/update_recipe")
async def update_recipe(request: Request, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or missing JSON body")

    if "title" not in data:
        raise HTTPException(status_code=422, detail="Missing 'title' in request body.")

    update_fields = {}
    if "note" in data:
        update_fields["note"] = data["note"]
    if "recipe" in data:
        update_fields["recipe"] = data["recipe"]

    if not update_fields:
        raise HTTPException(status_code=422, detail="No fields to update provided.")

    result = recipes_collection.update_one(
        {"user_email": user["sub"], "title": data["title"]},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    return {"msg": "Recipe updated successfully"}


# ✅ Delete recipe by title
@router.delete("/delete_recipe")
def delete_recipe(title: str, credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    result = recipes_collection.delete_one({"user_email": user["sub"], "title": title})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    return {"msg": "Recipe deleted successfully"}
