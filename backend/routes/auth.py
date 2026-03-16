from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models.schemas import LoginRequest, ChangePasswordRequest, User, UserStatus
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db['users']

# Create default admin and instructor on startup
def init_default_users():
    # Create admin
    if not users_collection.find_one({"username": "admin"}):
        users_collection.insert_one({
            "username": "admin",
            "email": "admin@lms.local",
            "password_hash": hash_password("admin123"),
            "role": "admin",
            "status": "approved",
            "created_at": datetime.now(timezone.utc),
            "approved_at": datetime.now(timezone.utc)
        })
        print("Default admin created: username='admin', password='admin123'")
    
    # Create instructor
    if not users_collection.find_one({"username": "instructor"}):
        users_collection.insert_one({
            "username": "instructor",
            "email": "instructor@lms.local",
            "password_hash": hash_password("instructor123"),
            "role": "instructor",
            "status": "approved",
            "created_at": datetime.now(timezone.utc),
            "approved_at": datetime.now(timezone.utc)
        })
        print("Default instructor created: username='instructor', password='instructor123'")

init_default_users()

@router.post("/login")
async def login(request: LoginRequest):
    user = users_collection.find_one({"username": request.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user account is approved (skip for admin/instructor)
    user_status = user.get("status", "approved")
    user_role = user.get("role", "student")
    
    if user_role == "student" and user_status != "approved":
        if user_status == "pending":
            raise HTTPException(status_code=403, detail="Your account is pending approval. Please wait for an administrator to approve your account.")
        elif user_status == "rejected":
            raise HTTPException(status_code=403, detail="Your account has been rejected. Please contact the administrator.")
        elif user_status == "suspended":
            raise HTTPException(status_code=403, detail="Your account has been suspended. Please contact the administrator.")
    
    token = create_access_token({
        "user_id": str(user["_id"]),
        "username": user["username"],
        "role": user["role"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user["role"],
        "status": user_status,
        "user_id": str(user["_id"]),
        "email": user.get("email"),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name")
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
    # Get full user info from database
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "role": current_user["role"],
        "email": user.get("email"),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "status": user.get("status", "approved"),
        "profile_image": user.get("profile_image")
    }
