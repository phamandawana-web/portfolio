"""
Course Enrollment Routes
Handles student enrollment in courses
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from utils.auth import get_current_user
from services.email_service import send_email, get_base_template, is_email_configured
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timezone
from typing import Optional

router = APIRouter(prefix="/api/enrollments", tags=["Enrollments"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db['users']
courses_collection = db['courses']
enrollments_collection = db['enrollments']
notifications_collection = db['notifications']

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')


def serialize_doc(doc):
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


# ==================== ENROLLMENT MANAGEMENT ====================

@router.get("/my-courses")
async def get_my_enrolled_courses(current_user: dict = Depends(get_current_user)):
    """Get courses the current user is enrolled in"""
    user_id = current_user["user_id"]
    role = current_user.get("role", "student")
    
    # Admins and instructors see all courses
    if role in ["admin", "instructor"]:
        courses = list(courses_collection.find().sort("order", 1))
        for course in courses:
            course['is_enrolled'] = True
            course['enrollment_status'] = 'approved'
        return [serialize_doc(c) for c in courses]
    
    # Students see only enrolled courses
    enrollments = list(enrollments_collection.find({
        "user_id": user_id,
        "status": "approved"
    }))
    
    enrolled_course_ids = [e["course_id"] for e in enrollments]
    
    if not enrolled_course_ids:
        return []
    
    courses = list(courses_collection.find({
        "_id": {"$in": [ObjectId(cid) for cid in enrolled_course_ids]}
    }).sort("order", 1))
    
    # Add enrollment info
    enrollment_map = {e["course_id"]: e for e in enrollments}
    for course in courses:
        course_id = str(course["_id"])
        enrollment = enrollment_map.get(course_id, {})
        course['is_enrolled'] = True
        course['enrollment_status'] = enrollment.get("status", "approved")
        course['enrolled_at'] = enrollment.get("enrolled_at")
    
    return [serialize_doc(c) for c in courses]


@router.get("/available-courses")
async def get_available_courses(current_user: dict = Depends(get_current_user)):
    """Get all courses with enrollment status for current user"""
    user_id = current_user["user_id"]
    role = current_user.get("role", "student")
    
    # Get all courses
    courses = list(courses_collection.find().sort("order", 1))
    
    # Get user's enrollments
    enrollments = list(enrollments_collection.find({"user_id": user_id}))
    enrollment_map = {e["course_id"]: e for e in enrollments}
    
    result = []
    for course in courses:
        course_id = str(course["_id"])
        enrollment = enrollment_map.get(course_id)
        
        course_data = serialize_doc(course)
        course_data['is_enrolled'] = enrollment is not None and enrollment.get("status") == "approved"
        course_data['enrollment_status'] = enrollment.get("status") if enrollment else None
        course_data['enrollment_id'] = str(enrollment["_id"]) if enrollment else None
        
        # Count enrolled students
        enrolled_count = enrollments_collection.count_documents({
            "course_id": course_id,
            "status": "approved"
        })
        course_data['enrolled_count'] = enrolled_count
        
        result.append(course_data)
    
    return result


@router.post("/enroll/{course_id}")
async def enroll_in_course(
    course_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Request enrollment in a course"""
    user_id = current_user["user_id"]
    
    # Check if course exists
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled or pending
    existing = enrollments_collection.find_one({
        "user_id": user_id,
        "course_id": course_id
    })
    
    if existing:
        if existing["status"] == "approved":
            raise HTTPException(status_code=400, detail="Already enrolled in this course")
        elif existing["status"] == "pending":
            raise HTTPException(status_code=400, detail="Enrollment request already pending")
        elif existing["status"] == "rejected":
            # Allow re-enrollment after rejection
            enrollments_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "status": "pending",
                    "requested_at": datetime.now(timezone.utc),
                    "rejection_reason": None
                }}
            )
            return {"message": "Enrollment request re-submitted", "status": "pending"}
    
    # Check if course requires approval or is open enrollment
    requires_approval = course.get("requires_enrollment_approval", True)
    
    enrollment_doc = {
        "user_id": user_id,
        "course_id": course_id,
        "status": "pending" if requires_approval else "approved",
        "requested_at": datetime.now(timezone.utc),
        "approved_at": None if requires_approval else datetime.now(timezone.utc),
        "approved_by": None if requires_approval else "auto",
        "rejection_reason": None
    }
    
    result = enrollments_collection.insert_one(enrollment_doc)
    
    if requires_approval:
        # Notify instructors about new enrollment request
        instructors = users_collection.find({"role": {"$in": ["admin", "instructor"]}})
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        for instructor in instructors:
            notifications_collection.insert_one({
                "user_id": str(instructor["_id"]),
                "title": "New Enrollment Request",
                "message": f"{user['username']} has requested enrollment in {course['title']}",
                "type": "enrollment_request",
                "link": "/coursework/admin/enrollments",
                "is_read": False,
                "created_at": datetime.now(timezone.utc)
            })
        
        return {
            "message": "Enrollment request submitted. Waiting for approval.",
            "enrollment_id": str(result.inserted_id),
            "status": "pending"
        }
    else:
        # Auto-approved
        return {
            "message": "Successfully enrolled in course",
            "enrollment_id": str(result.inserted_id),
            "status": "approved"
        }


@router.delete("/unenroll/{course_id}")
async def unenroll_from_course(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unenroll from a course"""
    user_id = current_user["user_id"]
    
    result = enrollments_collection.delete_one({
        "user_id": user_id,
        "course_id": course_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    return {"message": "Successfully unenrolled from course"}


# ==================== ADMIN ENROLLMENT MANAGEMENT ====================

@router.get("/pending")
async def get_pending_enrollments(current_user: dict = Depends(get_current_user)):
    """Get all pending enrollment requests (admin/instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    enrollments = list(enrollments_collection.find({"status": "pending"}).sort("requested_at", -1))
    
    # Add user and course info
    result = []
    for enrollment in enrollments:
        user = users_collection.find_one({"_id": ObjectId(enrollment["user_id"])})
        course = courses_collection.find_one({"_id": ObjectId(enrollment["course_id"])})
        
        result.append({
            "id": str(enrollment["_id"]),
            "user_id": enrollment["user_id"],
            "username": user["username"] if user else "Unknown",
            "email": user.get("email") if user else None,
            "course_id": enrollment["course_id"],
            "course_title": course["title"] if course else "Unknown",
            "status": enrollment["status"],
            "requested_at": enrollment["requested_at"]
        })
    
    return result


@router.get("/all")
async def get_all_enrollments(
    course_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all enrollments, optionally filtered by course (admin/instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = {}
    if course_id:
        query["course_id"] = course_id
    
    enrollments = list(enrollments_collection.find(query).sort("requested_at", -1))
    
    result = []
    for enrollment in enrollments:
        user = users_collection.find_one({"_id": ObjectId(enrollment["user_id"])})
        course = courses_collection.find_one({"_id": ObjectId(enrollment["course_id"])})
        
        result.append({
            "id": str(enrollment["_id"]),
            "user_id": enrollment["user_id"],
            "username": user["username"] if user else "Unknown",
            "email": user.get("email") if user else None,
            "course_id": enrollment["course_id"],
            "course_title": course["title"] if course else "Unknown",
            "course_slug": course["slug"] if course else None,
            "status": enrollment["status"],
            "requested_at": enrollment["requested_at"],
            "approved_at": enrollment.get("approved_at"),
            "approved_by": enrollment.get("approved_by")
        })
    
    return result


@router.post("/approve/{enrollment_id}")
async def approve_enrollment(
    enrollment_id: str,
    approved: bool = True,
    rejection_reason: str = None,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    """Approve or reject an enrollment request"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    enrollment = enrollments_collection.find_one({"_id": ObjectId(enrollment_id)})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    user = users_collection.find_one({"_id": ObjectId(enrollment["user_id"])})
    course = courses_collection.find_one({"_id": ObjectId(enrollment["course_id"])})
    
    if approved:
        enrollments_collection.update_one(
            {"_id": ObjectId(enrollment_id)},
            {"$set": {
                "status": "approved",
                "approved_at": datetime.now(timezone.utc),
                "approved_by": current_user["username"]
            }}
        )
        
        # Notify user
        notifications_collection.insert_one({
            "user_id": enrollment["user_id"],
            "title": "Enrollment Approved!",
            "message": f"Your enrollment in {course['title']} has been approved.",
            "type": "enrollment_approved",
            "link": f"/coursework/{course['slug']}",
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Send email notification
        if is_email_configured() and user and user.get("email"):
            content = f"""
                <h1>Enrollment Approved! 🎉</h1>
                <p>Hello <strong>{user['username']}</strong>,</p>
                <p>Great news! Your enrollment in <strong>{course['title']}</strong> has been approved.</p>
                <a href="{FRONTEND_URL}/coursework/{course['slug']}" class="button">Start Learning</a>
            """
            background_tasks.add_task(
                send_email,
                user["email"],
                f"Enrollment Approved: {course['title']}",
                get_base_template(content, "Enrollment Approved")
            )
        
        return {"message": f"Enrollment approved for {user['username']}"}
    else:
        enrollments_collection.update_one(
            {"_id": ObjectId(enrollment_id)},
            {"$set": {
                "status": "rejected",
                "rejection_reason": rejection_reason
            }}
        )
        
        # Notify user
        notifications_collection.insert_one({
            "user_id": enrollment["user_id"],
            "title": "Enrollment Not Approved",
            "message": f"Your enrollment request for {course['title']} was not approved." + (f" Reason: {rejection_reason}" if rejection_reason else ""),
            "type": "enrollment_rejected",
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"message": f"Enrollment rejected for {user['username']}"}


@router.get("/course/{course_id}/students")
async def get_course_students(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all enrolled students for a course (admin/instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    enrollments = list(enrollments_collection.find({
        "course_id": course_id,
        "status": "approved"
    }))
    
    students = []
    for enrollment in enrollments:
        user = users_collection.find_one({"_id": ObjectId(enrollment["user_id"])})
        if user:
            students.append({
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user.get("email"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "enrolled_at": enrollment.get("approved_at") or enrollment.get("requested_at")
            })
    
    return students


@router.post("/bulk-enroll")
async def bulk_enroll_students(
    course_id: str,
    user_ids: list,
    current_user: dict = Depends(get_current_user)
):
    """Bulk enroll multiple students in a course (admin/instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    enrolled = 0
    skipped = 0
    
    for user_id in user_ids:
        existing = enrollments_collection.find_one({
            "user_id": user_id,
            "course_id": course_id,
            "status": "approved"
        })
        
        if existing:
            skipped += 1
            continue
        
        # Remove any pending/rejected enrollment
        enrollments_collection.delete_many({
            "user_id": user_id,
            "course_id": course_id
        })
        
        # Create approved enrollment
        enrollments_collection.insert_one({
            "user_id": user_id,
            "course_id": course_id,
            "status": "approved",
            "requested_at": datetime.now(timezone.utc),
            "approved_at": datetime.now(timezone.utc),
            "approved_by": current_user["username"]
        })
        
        # Notify user
        notifications_collection.insert_one({
            "user_id": user_id,
            "title": "Course Enrollment",
            "message": f"You have been enrolled in {course['title']}.",
            "type": "enrollment_approved",
            "link": f"/coursework/{course['slug']}",
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        })
        
        enrolled += 1
    
    return {
        "message": f"Enrolled {enrolled} students, skipped {skipped} (already enrolled)",
        "enrolled": enrolled,
        "skipped": skipped
    }
