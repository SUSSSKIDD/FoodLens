from fastapi import APIRouter, HTTPException, Security, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.hash import bcrypt
from pydantic import BaseModel
from database import users_collection, recipes_collection
from utils import create_token, verify_token

router = APIRouter()
bearer_scheme = HTTPBearer()

# ✅ Pydantic models
class UserCredentials(BaseModel):
    email: str
    password: str
    name: str | None = None

class UserResponse(BaseModel):
    email: str
    name: str = ""

class UpdateRecipeInput(BaseModel):
    title: str
    note: str | None = None
    recipe: str | None = None

# ✅ Register
@router.post("/register")
def register(credentials: UserCredentials):
    email = credentials.email
    password = credentials.password
    name = credentials.name

    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = bcrypt.hash(password)
    users_collection.insert_one({
        "email": email,
        "password": hashed,
        "name": name
    })
    return {"msg": "Registered successfully"}

# ✅ Login
@router.post("/login")
def login(credentials: UserCredentials):
    email = credentials.email
    password = credentials.password

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.verify(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": email})
    return {"token": token}

# ✅ Google Auth endpoint
@router.post("/google-auth")
def google_auth(email: str, name: str):
    user = users_collection.find_one({"email": email})
    if not user:
        users_collection.insert_one({
            "email": email,
            "name": name,
            "google": True
        })
    token = create_token({"sub": email})
    return {"token": token}

# ✅ Get current user info
@router.get("/me", response_model=UserResponse)
def me(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)) -> UserResponse:
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=403, detail="Invalid token")

    user = users_collection.find_one({"email": payload["sub"]})
    return UserResponse(email=user["email"], name=user.get("name", ""))

# ✅ Update recipe (moved to recipes.py ideally, but included here for your convenience)
@router.post("/update_recipe")
def update_recipe(
    body: UpdateRecipeInput = Body(...),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    user = verify_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")

    update_fields = {}
    if body.note:
        update_fields["note"] = body.note
    if body.recipe:
        update_fields["recipe"] = body.recipe

    if not update_fields:
        raise HTTPException(status_code=422, detail="No fields to update provided.")

    result = recipes_collection.update_one(
        {"user_email": user["sub"], "title": body.title},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    return {"msg": "Recipe updated successfully"}
