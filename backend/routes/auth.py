from fastapi import APIRouter, HTTPException, Depends
from models.schemas import LoginRequest, ChangePasswordRequest, User
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db['users']

# Create default instructor on startup
def init_default_instructor():
    existing = users_collection.find_one({"username": "instructor"})
    if not existing:
        users_collection.insert_one({
            "username": "instructor",
            "password_hash": hash_password("instructor123"),
            "role": "instructor",
            "created_at": datetime.utcnow()
        })
        print("Default instructor created: username='instructor', password='instructor123'")

init_default_instructor()

@router.post("/login")
async def login(request: LoginRequest):
    user = users_collection.find_one({"username": request.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({
        "user_id": str(user["_id"]),
        "username": user["username"],
        "role": user["role"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user["role"]
    }

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(request.current_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    
    return {"message": "Password changed successfully"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "role": current_user["role"]
    }
