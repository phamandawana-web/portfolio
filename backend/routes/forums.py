"""
Discussion Forum Routes
Handles course and topic level discussions
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models.schemas import CreateForumPostRequest, ForumType
from utils.auth import get_current_user
from services.email_service import send_forum_reply_notification, is_email_configured
from pymongo import MongoClient
from bson import ObjectId
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/api/forums", tags=["Forums"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
forums_collection = db['forums']
posts_collection = db['forum_posts']
users_collection = db['users']
courses_collection = db['courses']
topics_collection = db['topics']


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


def get_user_info(user_id: str) -> dict:
    """Get user display info"""
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        return {
            "id": str(user["_id"]),
            "username": user.get("username", "Unknown"),
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "role": user.get("role", "student")
        }
    return {"id": user_id, "username": "Unknown", "role": "student"}


# ============ FORUM MANAGEMENT ============

@router.post("")
async def create_forum(
    course_id: str,
    title: str,
    description: str = None,
    topic_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Create a new forum (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    forum_type = ForumType.TOPIC.value if topic_id else ForumType.COURSE.value
    
    forum_doc = {
        "type": forum_type,
        "course_id": course_id,
        "topic_id": topic_id,
        "title": title,
        "description": description,
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = forums_collection.insert_one(forum_doc)
    forum_doc["id"] = str(result.inserted_id)
    forum_doc.pop("_id", None)
    
    return forum_doc


@router.get("")
async def get_forums(course_id: Optional[str] = None, topic_id: Optional[str] = None):
    """Get all forums, optionally filtered"""
    query = {"is_active": True}
    if course_id:
        query["course_id"] = course_id
    if topic_id:
        query["topic_id"] = topic_id
    
    forums = list(forums_collection.find(query).sort("created_at", -1))
    
    # Add post counts
    for forum in forums:
        forum["post_count"] = posts_collection.count_documents({
            "forum_id": str(forum["_id"]),
            "parent_id": None  # Count only top-level posts
        })
    
    return [serialize_doc(f) for f in forums]


# ============ ANNOUNCEMENTS (must be before /{forum_id} to avoid route conflict) ============

@router.post("/announcements")
async def create_announcement(
    title: str,
    message: str,
    course_id: str = None,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    """Create an announcement and notify students (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from services.email_service import send_announcement_email
    
    announcement_doc = {
        "type": "announcement",
        "course_id": course_id,
        "title": title,
        "message": message,
        "author_id": current_user["user_id"],
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db['announcements'].insert_one(announcement_doc)
    
    # Get course title if specified
    course_title = None
    if course_id:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        course_title = course["title"] if course else None
    
    # Send emails to all approved students
    if is_email_configured() and background_tasks:
        students = users_collection.find({"role": "student", "status": "approved"})
        for student in students:
            background_tasks.add_task(
                send_announcement_email,
                student["email"],
                student["username"],
                title,
                message,
                course_title
            )
    
    return {
        "message": "Announcement created and notifications sent",
        "id": str(result.inserted_id)
    }


@router.get("/announcements")
async def get_announcements(course_id: str = None, limit: int = 20):
    """Get recent announcements"""
    query = {"type": "announcement"}
    if course_id:
        query["$or"] = [{"course_id": course_id}, {"course_id": None}]
    
    announcements = list(db['announcements'].find(query).sort("created_at", -1).limit(limit))
    
    for ann in announcements:
        author_id = ann.get("author_id")
        if author_id:
            try:
                author = users_collection.find_one({"_id": ObjectId(author_id)})
                ann["author_name"] = author["username"] if author else "Unknown"
            except Exception:
                ann["author_name"] = "Unknown"
        else:
            ann["author_name"] = "Unknown"
    
    return [serialize_doc(a) for a in announcements]


@router.get("/{forum_id}")
async def get_forum(forum_id: str):
    """Get a specific forum with its threads"""
    forum = forums_collection.find_one({"_id": ObjectId(forum_id)})
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    
    forum = serialize_doc(forum)
    
    # Get top-level posts (threads)
    threads = list(posts_collection.find({
        "forum_id": forum_id,
        "parent_id": None
    }).sort("is_pinned", -1).sort("created_at", -1))
    
    # Add author info and reply counts
    forum["threads"] = []
    for thread in threads:
        thread_data = serialize_doc(thread)
        thread_data["author"] = get_user_info(thread_data["author_id"])
        thread_data["reply_count"] = posts_collection.count_documents({
            "parent_id": thread_data["id"]
        })
        forum["threads"].append(thread_data)
    
    return forum


@router.delete("/{forum_id}")
async def delete_forum(forum_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a forum (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    forums_collection.delete_one({"_id": ObjectId(forum_id)})
    posts_collection.delete_many({"forum_id": forum_id})
    
    return {"message": "Forum deleted successfully"}


# ============ POSTS & THREADS ============

@router.post("/posts")
async def create_post(
    request: CreateForumPostRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post or reply"""
    # Check if user is approved
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user or user.get("status") != "approved":
        raise HTTPException(status_code=403, detail="Only approved users can post")
    
    forum = forums_collection.find_one({"_id": ObjectId(request.forum_id)})
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    
    if forum.get("is_locked"):
        raise HTTPException(status_code=403, detail="This forum is locked")
    
    # Check if replying to a post
    if request.parent_id:
        parent_post = posts_collection.find_one({"_id": ObjectId(request.parent_id)})
        if not parent_post:
            raise HTTPException(status_code=404, detail="Parent post not found")
        if parent_post.get("is_locked"):
            raise HTTPException(status_code=403, detail="This thread is locked")
    
    post_doc = {
        "forum_id": request.forum_id,
        "author_id": current_user["user_id"],
        "title": request.title,  # Only for new threads
        "content": request.content,
        "parent_id": request.parent_id,
        "is_pinned": False,
        "is_locked": False,
        "likes": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = posts_collection.insert_one(post_doc)
    post_doc["id"] = str(result.inserted_id)
    post_doc.pop("_id", None)
    post_doc["author"] = get_user_info(current_user["user_id"])
    
    # Send notification to parent post author if this is a reply
    if request.parent_id and is_email_configured():
        parent_post = posts_collection.find_one({"_id": ObjectId(request.parent_id)})
        if parent_post and parent_post["author_id"] != current_user["user_id"]:
            author = users_collection.find_one({"_id": ObjectId(parent_post["author_id"])})
            if author and author.get("email"):
                course = courses_collection.find_one({"_id": ObjectId(forum["course_id"])})
                forum_url = f"/coursework/{course['slug']}/forum/{request.forum_id}" if course else ""
                
                background_tasks.add_task(
                    send_forum_reply_notification,
                    author["email"],
                    author["username"],
                    parent_post.get("title") or "Discussion",
                    current_user["username"],
                    forum_url
                )
    
    return post_doc


@router.get("/posts/{post_id}")
async def get_post_with_replies(post_id: str):
    """Get a post with all its replies (thread view)"""
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post = serialize_doc(post)
    post["author"] = get_user_info(post["author_id"])
    
    # Get all replies
    replies = list(posts_collection.find({"parent_id": post_id}).sort("created_at", 1))
    post["replies"] = []
    
    for reply in replies:
        reply_data = serialize_doc(reply)
        reply_data["author"] = get_user_info(reply_data["author_id"])
        post["replies"].append(reply_data)
    
    return post


@router.put("/posts/{post_id}")
async def update_post(post_id: str, content: str, current_user: dict = Depends(get_current_user)):
    """Update a post (author or instructor only)"""
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check permission
    if post["author_id"] != current_user["user_id"] and current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    
    posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {
            "content": content,
            "updated_at": datetime.now(timezone.utc),
            "edited": True
        }}
    )
    
    return {"message": "Post updated successfully"}


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a post (author or instructor only)"""
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check permission
    if post["author_id"] != current_user["user_id"] and current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete post and all replies
    posts_collection.delete_one({"_id": ObjectId(post_id)})
    posts_collection.delete_many({"parent_id": post_id})
    
    return {"message": "Post deleted successfully"}


@router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Like or unlike a post"""
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    user_id = current_user["user_id"]
    
    if user_id in likes:
        # Unlike
        likes.remove(user_id)
        action = "unliked"
    else:
        # Like
        likes.append(user_id)
        action = "liked"
    
    posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"likes": likes}}
    )
    
    return {"message": f"Post {action}", "like_count": len(likes)}


@router.post("/posts/{post_id}/pin")
async def pin_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Pin or unpin a post (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_state = not post.get("is_pinned", False)
    posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"is_pinned": new_state}}
    )
    
    return {"message": f"Post {'pinned' if new_state else 'unpinned'}"}


@router.post("/posts/{post_id}/lock")
async def lock_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Lock or unlock a thread (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_state = not post.get("is_locked", False)
    posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"is_locked": new_state}}
    )
    
    return {"message": f"Thread {'locked' if new_state else 'unlocked'}"}


# ============ ANNOUNCEMENTS ============

@router.post("/announcements")
async def create_announcement(
    title: str,
    message: str,
    course_id: str = None,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    """Create an announcement and notify students (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    from services.email_service import send_announcement_email
    
    announcement_doc = {
        "type": "announcement",
        "course_id": course_id,
        "title": title,
        "message": message,
        "author_id": current_user["user_id"],
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db['announcements'].insert_one(announcement_doc)
    
    # Get course title if specified
    course_title = None
    if course_id:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        course_title = course["title"] if course else None
    
    # Send emails to all approved students
    if is_email_configured() and background_tasks:
        students = users_collection.find({"role": "student", "status": "approved"})
        for student in students:
            background_tasks.add_task(
                send_announcement_email,
                student["email"],
                student["username"],
                title,
                message,
                course_title
            )
    
    return {
        "message": "Announcement created and notifications sent",
        "id": str(result.inserted_id)
    }


@router.get("/announcements")
async def get_announcements(course_id: str = None, limit: int = 20):
    """Get recent announcements"""
    query = {"type": "announcement"}
    if course_id:
        query["$or"] = [{"course_id": course_id}, {"course_id": None}]
    
    announcements = list(db['announcements'].find(query).sort("created_at", -1).limit(limit))
    
    for ann in announcements:
        author_id = ann.get("author_id")
        if author_id:
            try:
                author = users_collection.find_one({"_id": ObjectId(author_id)})
                ann["author_name"] = author["username"] if author else "Unknown"
            except Exception:
                ann["author_name"] = "Unknown"
        else:
            ann["author_name"] = "Unknown"
    
    return [serialize_doc(a) for a in announcements]
