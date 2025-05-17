from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.hash import bcrypt
from pydantic import BaseModel
from fastapi.responses import JSONResponse

from database import users_collection
from utils import create_token, verify_token

router = APIRouter()
bearer_scheme = HTTPBearer()

# ✅ Response model for authenticated user
class UserResponse(BaseModel):
    email: str

@router.post("/register")
def register(email: str, password: str):
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User exists")
    hashed = bcrypt.hash(password)
    users_collection.insert_one({"email": email, "password": hashed})
    return {"msg": "Registered successfully"}

@router.post("/login")
def login(email: str, password: str):
    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.verify(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": email})
    return {"token": token}

# ✅ Use proper dependency typing for credentials
@router.get("/me", response_model=UserResponse)
def me(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)) -> UserResponse:
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=403, detail="Invalid token")
    return UserResponse(email=payload["sub"])
