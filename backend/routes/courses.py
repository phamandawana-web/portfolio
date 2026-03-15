from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from models.schemas import (
    Course, Topic, ContentBlock, CreateTopicRequest, 
    UpdateTopicBlocksRequest, ContentVersion, ProgressUpdateRequest
)
from utils.auth import get_current_user
from pymongo import MongoClient
from bson import ObjectId
import os
import uuid
from datetime import datetime
from typing import Optional, List
import re

router = APIRouter(prefix="/api/courses", tags=["Courses"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
courses_collection = db['courses']
topics_collection = db['topics']
progress_collection = db['progress']

# Upload directory - using Emergent server path
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc

# Initialize default courses and topics
def init_courses():
    existing = courses_collection.find_one({"slug": "data-structures"})
    if existing:
        return
    
    courses_data = [
        {
            "title": "Data Structures",
            "slug": "data-structures",
            "description": "Learn fundamental data structures used in computer science",
            "icon": "Database",
            "color": "blue",
            "order": 1,
            "topics": [],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Algorithms",
            "slug": "algorithms",
            "description": "Master algorithmic techniques and problem-solving strategies",
            "icon": "GitBranch",
            "color": "purple",
            "order": 2,
            "topics": [],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Operating Systems",
            "slug": "operating-systems",
            "description": "Understand how operating systems manage computer resources",
            "icon": "Cpu",
            "color": "teal",
            "order": 3,
            "topics": [],
            "created_at": datetime.utcnow()
        }
    ]
    
    topics_data = {
        "data-structures": [
            ("Introduction", "Learn the basics of data structures and their importance in programming."),
            ("Arrays, Structures, and Unions", "Understanding contiguous memory data structures."),
            ("Stacks and Queues", "LIFO and FIFO data structures and their applications."),
            ("Linked Lists", "Dynamic data structures with pointer-based connections."),
            ("Trees", "Hierarchical data structures including binary trees and BSTs."),
            ("Graphs", "Non-linear data structures for representing relationships."),
            ("Sorting", "Various sorting algorithms and their complexities."),
            ("Hashing", "Hash tables with operations in near-constant time."),
            ("Searching", "Linear search, binary search, and search optimization.")
        ],
        "algorithms": [
            ("Introduction to Algorithms", "What are algorithms and why they matter."),
            ("Algorithm Performance Analysis", "Big O notation and complexity analysis."),
            ("Divide and Conquer", "Breaking problems into smaller subproblems."),
            ("Dynamic Programming", "Solving problems by combining solutions to subproblems."),
            ("Greedy Algorithms", "Making locally optimal choices for global solutions."),
            ("Backtracking", "Exploring all possibilities through trial and error."),
            ("Branch and Bound", "Systematic enumeration of candidate solutions."),
            ("Computational Complexity", "Understanding problem difficulty classification."),
            ("Theory of NP", "NP-complete and NP-hard problem classes.")
        ],
        "operating-systems": [
            ("Introduction to Operating Systems", "Overview of OS functions and types."),
            ("System Calls", "Interface between user programs and OS kernel."),
            ("Processes", "Process states, creation, and termination."),
            ("Inter-Process Communication", "Methods for processes to exchange data."),
            ("Threads", "Lightweight processes and multithreading concepts."),
            ("Process Scheduling", "CPU scheduling algorithms and strategies."),
            ("Process Synchronization", "Handling concurrent access to shared resources."),
            ("Deadlocks", "Detection, prevention, and recovery from deadlocks."),
            ("Memory Management", "Virtual memory, paging, and segmentation."),
            ("File Systems", "File organization, directories, and storage management.")
        ]
    }
    
    for course in courses_data:
        result = courses_collection.insert_one(course)
        course_id = str(result.inserted_id)
        
        topic_ids = []
        for order, (title, description) in enumerate(topics_data[course["slug"]], 1):
            topic = {
                "course_id": course_id,
                "title": title,
                "slug": slugify(title),
                "order": order,
                "blocks": [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "text",
                        "content": f"# {title}\n\n{description}\n\n## Overview\n\nThis section covers the key concepts of {title.lower()}. Content will be added by the instructor.\n\n## Learning Objectives\n\n- Understand the fundamentals of {title.lower()}\n- Apply concepts to real-world problems\n- Analyze and compare different approaches",
                        "caption": None,
                        "language": None,
                        "order": 1
                    }
                ],
                "versions": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            topic_result = topics_collection.insert_one(topic)
            topic_ids.append(str(topic_result.inserted_id))
        
        courses_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"topics": topic_ids}}
        )
    
    print("Initialized courses and topics with placeholder content")

init_courses()

# ============ PUBLIC ENDPOINTS ============

@router.get("")
async def get_all_courses():
    """Get all courses (public)"""
    courses = list(courses_collection.find().sort("order", 1))
    return [serialize_doc(c) for c in courses]

@router.get("/{course_slug}")
async def get_course(course_slug: str):
    """Get a single course with its topics (public)"""
    course = courses_collection.find_one({"slug": course_slug})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course = serialize_doc(course)
    
    # Get topics for this course
    topics = list(topics_collection.find({"course_id": course["id"]}).sort("order", 1))
    course["topics_data"] = [serialize_doc(t) for t in topics]
    
    return course

@router.get("/{course_slug}/topics/{topic_slug}")
async def get_topic(course_slug: str, topic_slug: str):
    """Get a single topic with content (public)"""
    course = courses_collection.find_one({"slug": course_slug})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    topic = topics_collection.find_one({
        "course_id": str(course["_id"]),
        "slug": topic_slug
    })
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return serialize_doc(topic)

@router.get("/search/topics")
async def search_topics(q: str = Query(..., min_length=2)):
    """Search across all topics (public)"""
    # Search in topic titles and content blocks
    results = []
    
    topics = topics_collection.find({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"blocks.content": {"$regex": q, "$options": "i"}}
        ]
    })
    
    for topic in topics:
        course = courses_collection.find_one({"_id": ObjectId(topic["course_id"])})
        results.append({
            "topic": serialize_doc(topic),
            "course": serialize_doc(course) if course else None
        })
    
    return results

# ============ PROGRESS TRACKING ============

@router.post("/progress")
async def update_progress(request: ProgressUpdateRequest):
    """Update student progress (public - uses session ID)"""
    existing = progress_collection.find_one({
        "student_id": request.student_id,
        "topic_id": request.topic_id
    })
    
    if existing:
        progress_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "completed": request.completed,
                "last_visited": datetime.utcnow()
            }}
        )
    else:
        progress_collection.insert_one({
            "student_id": request.student_id,
            "course_id": request.course_id,
            "topic_id": request.topic_id,
            "completed": request.completed,
            "last_visited": datetime.utcnow()
        })
    
    return {"message": "Progress updated"}

@router.get("/progress/{student_id}")
async def get_progress(student_id: str):
    """Get all progress for a student"""
    progress = list(progress_collection.find({"student_id": student_id}, {"_id": 0}))
    return progress

@router.get("/progress/{student_id}/{course_id}")
async def get_course_progress(student_id: str, course_id: str):
    """Get progress for a specific course"""
    progress = list(progress_collection.find({
        "student_id": student_id,
        "course_id": course_id
    }, {"_id": 0}))
    return progress

# ============ INSTRUCTOR ENDPOINTS ============

@router.post("/topics")
async def create_topic(request: CreateTopicRequest, current_user: dict = Depends(get_current_user)):
    """Create a new topic (instructor only)"""
    course = courses_collection.find_one({"_id": ObjectId(request.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get max order
    max_order_topic = topics_collection.find_one(
        {"course_id": request.course_id},
        sort=[("order", -1)]
    )
    new_order = (max_order_topic["order"] + 1) if max_order_topic else 1
    
    topic = {
        "course_id": request.course_id,
        "title": request.title,
        "slug": slugify(request.title),
        "order": request.order or new_order,
        "blocks": [{
            "id": str(uuid.uuid4()),
            "type": "text",
            "content": f"# {request.title}\n\nAdd your content here.",
            "caption": None,
            "language": None,
            "order": 1
        }],
        "versions": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = topics_collection.insert_one(topic)
    topic["id"] = str(result.inserted_id)
    topic.pop("_id", None)
    
    return topic

@router.put("/topics/{topic_id}")
async def update_topic_blocks(
    topic_id: str, 
    request: UpdateTopicBlocksRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update topic content blocks (instructor only)"""
    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Save current version to history
    current_blocks = topic.get("blocks", [])
    versions = topic.get("versions", [])
    
    new_version = {
        "version": len(versions) + 1,
        "blocks": current_blocks,
        "updated_by": current_user["username"],
        "updated_at": datetime.utcnow(),
        "change_summary": request.change_summary
    }
    
    # Keep only last 10 versions
    versions.append(new_version)
    if len(versions) > 10:
        versions = versions[-10:]
    
    # Update with new blocks
    blocks_data = [block.dict() for block in request.blocks]
    
    topics_collection.update_one(
        {"_id": ObjectId(topic_id)},
        {"$set": {
            "blocks": blocks_data,
            "versions": versions,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Topic updated successfully", "version": len(versions)}

@router.delete("/topics/{topic_id}")
async def delete_topic(topic_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a topic (instructor only)"""
    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Remove from course
    courses_collection.update_one(
        {"_id": ObjectId(topic["course_id"])},
        {"$pull": {"topics": topic_id}}
    )
    
    # Delete topic
    topics_collection.delete_one({"_id": ObjectId(topic_id)})
    
    return {"message": "Topic deleted successfully"}

@router.put("/topics/{topic_id}/reorder")
async def reorder_topic(
    topic_id: str, 
    new_order: int,
    current_user: dict = Depends(get_current_user)
):
    """Reorder a topic within its course (instructor only)"""
    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    topics_collection.update_one(
        {"_id": ObjectId(topic_id)},
        {"$set": {"order": new_order}}
    )
    
    return {"message": "Topic reordered"}

@router.get("/topics/{topic_id}/versions")
async def get_topic_versions(topic_id: str, current_user: dict = Depends(get_current_user)):
    """Get version history for a topic (instructor only)"""
    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return topic.get("versions", [])

@router.post("/topics/{topic_id}/restore/{version}")
async def restore_topic_version(
    topic_id: str, 
    version: int,
    current_user: dict = Depends(get_current_user)
):
    """Restore a previous version (instructor only)"""
    topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    versions = topic.get("versions", [])
    target_version = None
    for v in versions:
        if v["version"] == version:
            target_version = v
            break
    
    if not target_version:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Save current as new version before restoring
    current_blocks = topic.get("blocks", [])
    new_version = {
        "version": len(versions) + 1,
        "blocks": current_blocks,
        "updated_by": current_user["username"],
        "updated_at": datetime.utcnow(),
        "change_summary": f"Before restoring to version {version}"
    }
    versions.append(new_version)
    
    topics_collection.update_one(
        {"_id": ObjectId(topic_id)},
        {"$set": {
            "blocks": target_version["blocks"],
            "versions": versions,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": f"Restored to version {version}"}

# ============ FILE UPLOAD ============

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file (instructor only)"""
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": f"/api/uploads/{unique_filename}"
    }
