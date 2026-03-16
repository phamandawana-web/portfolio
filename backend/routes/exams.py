"""
Course Final Exam Routes
Handles final course exams that must be passed to earn a certificate
"""
from fastapi import APIRouter, HTTPException, Depends
from utils.auth import get_current_user
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/exams", tags=["Final Exams"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
exams_collection = db['final_exams']
exam_submissions_collection = db['exam_submissions']
courses_collection = db['courses']
topics_collection = db['topics']
quizzes_collection = db['quizzes']
quiz_submissions_collection = db['quiz_submissions']
progress_collection = db['course_progress']
users_collection = db['users']


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


class CreateExamRequest(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    time_limit: Optional[int] = 60  # minutes
    passing_score: Optional[int] = 70
    questions: List[dict]


class SubmitExamRequest(BaseModel):
    answers: List[int]  # List of selected answer indices
    time_taken: Optional[int] = None  # seconds


# ============ EXAM MANAGEMENT (Instructor) ============

@router.post("")
async def create_final_exam(request: CreateExamRequest, current_user: dict = Depends(get_current_user)):
    """Create a final exam for a course (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if course exists
    course = courses_collection.find_one({"_id": ObjectId(request.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if exam already exists for this course
    existing = exams_collection.find_one({"course_id": request.course_id})
    if existing:
        raise HTTPException(status_code=400, detail="Final exam already exists for this course. Update it instead.")
    
    exam_doc = {
        "course_id": request.course_id,
        "title": request.title,
        "description": request.description,
        "time_limit": request.time_limit,
        "passing_score": request.passing_score,
        "questions": request.questions,
        "is_published": False,
        "created_at": datetime.now(timezone.utc),
        "created_by": current_user["user_id"]
    }
    
    result = exams_collection.insert_one(exam_doc)
    exam_doc["id"] = str(result.inserted_id)
    del exam_doc["_id"] if "_id" in exam_doc else None
    
    return {"message": "Final exam created", "exam": exam_doc}


@router.put("/{exam_id}")
async def update_final_exam(exam_id: str, request: CreateExamRequest, current_user: dict = Depends(get_current_user)):
    """Update a final exam (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    exam = exams_collection.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exams_collection.update_one(
        {"_id": ObjectId(exam_id)},
        {"$set": {
            "title": request.title,
            "description": request.description,
            "time_limit": request.time_limit,
            "passing_score": request.passing_score,
            "questions": request.questions,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Exam updated successfully"}


@router.post("/{exam_id}/publish")
async def publish_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Publish or unpublish a final exam"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    exam = exams_collection.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    new_status = not exam.get("is_published", False)
    exams_collection.update_one(
        {"_id": ObjectId(exam_id)},
        {"$set": {"is_published": new_status}}
    )
    
    return {"message": f"Exam {'published' if new_status else 'unpublished'}", "is_published": new_status}


@router.delete("/{exam_id}")
async def delete_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a final exam"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = exams_collection.delete_one({"_id": ObjectId(exam_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Also delete submissions
    exam_submissions_collection.delete_many({"exam_id": exam_id})
    
    return {"message": "Exam deleted"}


# ============ EXAM ACCESS (Students) ============

@router.get("/course/{course_id}")
async def get_course_exam(course_id: str, current_user: dict = Depends(get_current_user)):
    """Get final exam for a course"""
    exam = exams_collection.find_one({"course_id": course_id})
    
    if not exam:
        return {"exam": None, "message": "No final exam for this course"}
    
    # For students, only show published exams
    if current_user.get("role") == "student" and not exam.get("is_published", False):
        return {"exam": None, "message": "Final exam not yet available"}
    
    # Check eligibility (all topics completed and quizzes passed)
    eligibility = await check_exam_eligibility(course_id, current_user["user_id"])
    
    # Get user's best submission
    best_submission = exam_submissions_collection.find_one(
        {"exam_id": str(exam["_id"]), "student_id": current_user["user_id"]},
        sort=[("percentage", -1)]
    )
    
    exam_data = serialize_doc(exam)
    
    # Don't send correct answers to students
    if current_user.get("role") == "student":
        for q in exam_data.get("questions", []):
            q.pop("correct_answer", None)
            q.pop("explanation", None)
    
    return {
        "exam": exam_data,
        "eligibility": eligibility,
        "best_submission": serialize_doc(best_submission) if best_submission else None
    }


async def check_exam_eligibility(course_id: str, user_id: str):
    """Check if user is eligible to take the final exam"""
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        return {"eligible": False, "reason": "Course not found"}
    
    topics = list(topics_collection.find({"course_id": course_id}))
    total_topics = len(topics)
    
    # Check topic completion
    completed_topics = progress_collection.count_documents({
        "student_id": user_id,
        "course_id": course_id,
        "completed": True
    })
    
    topics_complete = completed_topics >= total_topics and total_topics > 0
    
    # Check quiz completion
    quizzes = list(quizzes_collection.find({"course_id": course_id, "is_published": True}))
    quizzes_passed = 0
    total_quizzes = len(quizzes)
    
    for quiz in quizzes:
        passing = quiz_submissions_collection.find_one({
            "quiz_id": str(quiz["_id"]),
            "student_id": user_id,
            "passed": True
        })
        if passing:
            quizzes_passed += 1
    
    all_quizzes_passed = quizzes_passed >= total_quizzes if total_quizzes > 0 else True
    
    eligible = topics_complete and all_quizzes_passed
    
    reasons = []
    if not topics_complete:
        reasons.append(f"Complete all topics ({completed_topics}/{total_topics})")
    if not all_quizzes_passed:
        reasons.append(f"Pass all quizzes ({quizzes_passed}/{total_quizzes})")
    
    return {
        "eligible": eligible,
        "topics_completed": completed_topics,
        "total_topics": total_topics,
        "quizzes_passed": quizzes_passed,
        "total_quizzes": total_quizzes,
        "reasons": reasons if not eligible else []
    }


@router.get("/{exam_id}")
async def get_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Get exam by ID"""
    exam = exams_collection.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam_data = serialize_doc(exam)
    
    # Don't send correct answers to students
    if current_user.get("role") == "student":
        for q in exam_data.get("questions", []):
            q.pop("correct_answer", None)
            q.pop("explanation", None)
    
    return exam_data


@router.post("/{exam_id}/submit")
async def submit_exam(exam_id: str, request: SubmitExamRequest, current_user: dict = Depends(get_current_user)):
    """Submit final exam answers"""
    exam = exams_collection.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Check eligibility
    eligibility = await check_exam_eligibility(exam["course_id"], current_user["user_id"])
    if not eligibility["eligible"]:
        raise HTTPException(status_code=403, detail=f"Not eligible: {', '.join(eligibility['reasons'])}")
    
    # Grade the exam
    questions = exam.get("questions", [])
    correct = 0
    total = len(questions)
    
    graded_answers = []
    for i, answer in enumerate(request.answers):
        if i < len(questions):
            is_correct = answer == questions[i].get("correct_answer")
            if is_correct:
                correct += 1
            graded_answers.append({
                "question_index": i,
                "selected": answer,
                "correct_answer": questions[i].get("correct_answer"),
                "is_correct": is_correct
            })
    
    percentage = round((correct / total) * 100) if total > 0 else 0
    passed = percentage >= exam.get("passing_score", 70)
    
    submission = {
        "exam_id": exam_id,
        "course_id": exam["course_id"],
        "student_id": current_user["user_id"],
        "answers": graded_answers,
        "score": correct,
        "total": total,
        "percentage": percentage,
        "passed": passed,
        "time_taken": request.time_taken,
        "submitted_at": datetime.now(timezone.utc)
    }
    
    result = exam_submissions_collection.insert_one(submission)
    submission["id"] = str(result.inserted_id)
    del submission["_id"] if "_id" in submission else None
    
    return {
        "message": "Exam submitted",
        "score": correct,
        "total": total,
        "percentage": percentage,
        "passed": passed,
        "passing_score": exam.get("passing_score", 70),
        "submission_id": submission["id"]
    }


@router.get("/{exam_id}/my-submissions")
async def get_my_exam_submissions(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Get current user's submissions for an exam"""
    submissions = list(exam_submissions_collection.find({
        "exam_id": exam_id,
        "student_id": current_user["user_id"]
    }).sort("submitted_at", -1))
    
    return [serialize_doc(s) for s in submissions]


@router.get("/{exam_id}/submissions")
async def get_exam_submissions(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Get all submissions for an exam (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    submissions = list(exam_submissions_collection.find({"exam_id": exam_id}).sort("submitted_at", -1))
    
    # Add student info
    for sub in submissions:
        student = users_collection.find_one({"_id": ObjectId(sub["student_id"])})
        if student:
            sub["student_name"] = student.get("username", "Unknown")
            sub["student_email"] = student.get("email", "N/A")
    
    return [serialize_doc(s) for s in submissions]


# ============ CERTIFICATE ELIGIBILITY ============

@router.get("/certificate-eligibility/{course_id}")
async def check_certificate_eligibility(course_id: str, current_user: dict = Depends(get_current_user)):
    """Check if user is eligible for a course certificate"""
    user_id = current_user["user_id"]
    
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # 1. Check all topics completed
    topics = list(topics_collection.find({"course_id": course_id}))
    total_topics = len(topics)
    completed_topics = progress_collection.count_documents({
        "student_id": user_id,
        "course_id": course_id,
        "completed": True
    })
    topics_complete = completed_topics >= total_topics and total_topics > 0
    
    # 2. Check all quizzes passed
    quizzes = list(quizzes_collection.find({"course_id": course_id, "is_published": True}))
    total_quizzes = len(quizzes)
    quizzes_passed = 0
    for quiz in quizzes:
        if quiz_submissions_collection.find_one({
            "quiz_id": str(quiz["_id"]),
            "student_id": user_id,
            "passed": True
        }):
            quizzes_passed += 1
    all_quizzes_passed = quizzes_passed >= total_quizzes if total_quizzes > 0 else True
    
    # 3. Check final exam passed
    exam = exams_collection.find_one({"course_id": course_id, "is_published": True})
    exam_passed = False
    exam_required = exam is not None
    
    if exam:
        passing_submission = exam_submissions_collection.find_one({
            "exam_id": str(exam["_id"]),
            "student_id": user_id,
            "passed": True
        })
        exam_passed = passing_submission is not None
    
    # Overall eligibility
    eligible = topics_complete and all_quizzes_passed and (exam_passed or not exam_required)
    
    requirements = []
    if not topics_complete:
        requirements.append({
            "name": "Complete all topics",
            "completed": False,
            "progress": f"{completed_topics}/{total_topics}"
        })
    else:
        requirements.append({
            "name": "Complete all topics",
            "completed": True,
            "progress": f"{completed_topics}/{total_topics}"
        })
    
    if total_quizzes > 0:
        requirements.append({
            "name": "Pass all quizzes",
            "completed": all_quizzes_passed,
            "progress": f"{quizzes_passed}/{total_quizzes}"
        })
    
    if exam_required:
        requirements.append({
            "name": "Pass final exam",
            "completed": exam_passed,
            "progress": "Passed" if exam_passed else "Not passed"
        })
    
    return {
        "eligible": eligible,
        "course_title": course["title"],
        "requirements": requirements,
        "topics_completed": completed_topics,
        "total_topics": total_topics,
        "quizzes_passed": quizzes_passed,
        "total_quizzes": total_quizzes,
        "exam_required": exam_required,
        "exam_passed": exam_passed
    }
