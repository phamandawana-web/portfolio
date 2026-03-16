"""
User Management Routes
Handles student registration, admin approval, and user management
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models.schemas import (
    RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest,
    ApproveUserRequest, UserRole, UserStatus
)
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from services.email_service import (
    send_account_pending_email, send_account_approved_email,
    send_account_rejected_email, send_password_reset_email,
    send_password_changed_email, is_email_configured
)
from pymongo import MongoClient
from bson import ObjectId
import os
import secrets
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/users", tags=["Users"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db['users']
notifications_collection = db['notifications']


def serialize_user(user):
    """Convert MongoDB user document to safe response format"""
    if user is None:
        return None
    return {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "email": user.get("email"),
        "role": user.get("role", "student"),
        "status": user.get("status", "pending"),
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "profile_image": user.get("profile_image"),
        "created_at": user.get("created_at"),
        "approved_at": user.get("approved_at"),
        "approved_by": user.get("approved_by")
    }


@router.post("/register")
async def register_user(request: RegisterRequest, background_tasks: BackgroundTasks):
    """Register a new student account (requires admin approval)"""
    # Check if username exists
    if users_collection.find_one({"username": request.username}):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email exists
    if users_collection.find_one({"email": request.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user with pending status
    user_doc = {
        "username": request.username,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "role": UserRole.STUDENT.value,
        "status": UserStatus.PENDING.value,
        "first_name": request.first_name,
        "last_name": request.last_name,
        "profile_image": None,
        "reset_token": None,
        "reset_token_expires": None,
        "created_at": datetime.now(timezone.utc),
        "approved_at": None,
        "approved_by": None
    }
    
    result = users_collection.insert_one(user_doc)
    
    # Create notification for admins
    admins = users_collection.find({"role": {"$in": ["admin", "instructor"]}})
    for admin in admins:
        notifications_collection.insert_one({
            "user_id": str(admin["_id"]),
            "title": "New User Registration",
            "message": f"{request.username} has registered and is awaiting approval",
            "type": "user_pending",
            "is_read": False,
            "link": "/coursework/admin/users",
            "created_at": datetime.now(timezone.utc)
        })
    
    # Send confirmation email
    if is_email_configured():
        background_tasks.add_task(
            send_account_pending_email,
            request.email,
            request.username
        )
    
    return {
        "message": "Registration successful. Your account is pending approval.",
        "user_id": str(result.inserted_id),
        "status": "pending"
    }


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """Request password reset email"""
    user = users_collection.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If an account exists with this email, you will receive a password reset link."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expires": expires_at
        }}
    )
    
    # Send reset email
    if is_email_configured():
        background_tasks.add_task(
            send_password_reset_email,
            user["email"],
            user["username"],
            reset_token
        )
    
    return {"message": "If an account exists with this email, you will receive a password reset link."}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, background_tasks: BackgroundTasks):
    """Reset password using token"""
    user = users_collection.find_one({"reset_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check expiration
    expires = user.get("reset_token_expires")
    if expires:
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password and clear token
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash": hash_password(request.new_password),
            "reset_token": None,
            "reset_token_expires": None
        }}
    )
    
    # Send confirmation email
    if is_email_configured():
        background_tasks.add_task(
            send_password_changed_email,
            user["email"],
            user["username"]
        )
    
    return {"message": "Password reset successfully. You can now login with your new password."}


@router.get("/pending")
async def get_pending_users(current_user: dict = Depends(get_current_user)):
    """Get all pending users (admin/instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    pending = list(users_collection.find({"status": "pending"}).sort("created_at", -1))
    return [serialize_user(u) for u in pending]


@router.get("/all")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users (admin/instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = list(users_collection.find().sort("created_at", -1))
    return [serialize_user(u) for u in users]


@router.post("/approve")
async def approve_user(request: ApproveUserRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Approve or reject a pending user"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = users_collection.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.approved:
        # Approve user
        users_collection.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {
                "status": UserStatus.APPROVED.value,
                "approved_at": datetime.now(timezone.utc),
                "approved_by": current_user["username"]
            }}
        )
        
        # Send approval email
        if is_email_configured():
            background_tasks.add_task(
                send_account_approved_email,
                user["email"],
                user["username"]
            )
        
        # Create notification for user
        notifications_collection.insert_one({
            "user_id": str(user["_id"]),
            "title": "Account Approved",
            "message": "Your account has been approved. You can now access all LMS features.",
            "type": "account_approved",
            "is_read": False,
            "link": "/coursework",
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"message": f"User {user['username']} has been approved"}
    else:
        # Reject user
        users_collection.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$set": {"status": UserStatus.REJECTED.value}}
        )
        
        # Send rejection email
        if is_email_configured():
            background_tasks.add_task(
                send_account_rejected_email,
                user["email"],
                user["username"]
            )
        
        return {"message": f"User {user['username']} has been rejected"}


@router.put("/{user_id}/role")
async def update_user_role(user_id: str, role: str, current_user: dict = Depends(get_current_user)):
    """Update a user's role (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can change roles")
    
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role updated to {role}"}


@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a user (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    # Don't allow deleting self
    if user_id == current_user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)


@router.put("/profile")
async def update_profile(
    first_name: str = None,
    last_name: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile"""
    updates = {}
    if first_name is not None:
        updates["first_name"] = first_name
    if last_name is not None:
        updates["last_name"] = last_name
    
    if updates:
        users_collection.update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {"$set": updates}
        )
    
    return {"message": "Profile updated"}
