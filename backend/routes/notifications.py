"""
Notification Routes
Handles in-app notifications for users
"""
from fastapi import APIRouter, HTTPException, Depends
from utils.auth import get_current_user
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
notifications_collection = db['notifications']


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


@router.get("")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get notifications for current user"""
    query = {"user_id": current_user["user_id"]}
    if unread_only:
        query["is_read"] = False
    
    notifications = list(
        notifications_collection.find(query)
        .sort("created_at", -1)
        .limit(limit)
    )
    
    return [serialize_doc(n) for n in notifications]


@router.get("/count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    count = notifications_collection.count_documents({
        "user_id": current_user["user_id"],
        "is_read": False
    })
    return {"unread_count": count}


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    result = notifications_collection.update_one(
        {
            "_id": ObjectId(notification_id),
            "user_id": current_user["user_id"]
        },
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    notifications_collection.update_many(
        {"user_id": current_user["user_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a notification"""
    result = notifications_collection.delete_one({
        "_id": ObjectId(notification_id),
        "user_id": current_user["user_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted"}


@router.delete("")
async def clear_all_notifications(current_user: dict = Depends(get_current_user)):
    """Clear all notifications for current user"""
    notifications_collection.delete_many({"user_id": current_user["user_id"]})
    return {"message": "All notifications cleared"}


# Helper function to create notifications (used by other routes)
def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    link: str = None
):
    """Create a new notification for a user"""
    notifications_collection.insert_one({
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "is_read": False,
        "link": link,
        "created_at": datetime.now(timezone.utc)
    })
