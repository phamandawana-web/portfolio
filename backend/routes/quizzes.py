"""
Quiz and Assessment Routes
Handles quiz creation, questions, submissions, and auto-grading
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from models.schemas import (
    CreateQuizRequest, CreateQuestionRequest, SubmitQuizRequest,
    QuestionType
)
from utils.auth import get_current_user
from services.email_service import send_quiz_available_email, is_email_configured
from pymongo import MongoClient
from bson import ObjectId
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
quizzes_collection = db['quizzes']
questions_collection = db['questions']
submissions_collection = db['quiz_submissions']
users_collection = db['users']
courses_collection = db['courses']
topics_collection = db['topics']


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


# ============ QUIZ MANAGEMENT (Instructor) ============

@router.post("")
async def create_quiz(request: CreateQuizRequest, current_user: dict = Depends(get_current_user)):
    """Create a new quiz (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    quiz_doc = {
        "course_id": request.course_id,
        "topic_id": request.topic_id,
        "title": request.title,
        "description": request.description,
        "questions": [],
        "time_limit": request.time_limit,
        "passing_score": request.passing_score,
        "max_attempts": request.max_attempts,
        "shuffle_questions": False,
        "show_correct_answers": True,
        "is_published": False,
        "created_by": current_user["username"],
        "created_at": datetime.now(timezone.utc)
    }
    
    result = quizzes_collection.insert_one(quiz_doc)
    quiz_doc["id"] = str(result.inserted_id)
    quiz_doc.pop("_id", None)
    
    return quiz_doc


@router.get("")
async def get_all_quizzes(course_id: Optional[str] = None, topic_id: Optional[str] = None):
    """Get all published quizzes, optionally filtered by course/topic"""
    query = {"is_published": True}
    if course_id:
        query["course_id"] = course_id
    if topic_id:
        query["topic_id"] = topic_id
    
    quizzes = list(quizzes_collection.find(query).sort("created_at", -1))
    return [serialize_doc(q) for q in quizzes]


@router.get("/manage")
async def get_managed_quizzes(current_user: dict = Depends(get_current_user)):
    """Get all quizzes for management (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    quizzes = list(quizzes_collection.find().sort("created_at", -1))
    return [serialize_doc(q) for q in quizzes]


@router.get("/my-submissions")
async def get_my_submissions(current_user: dict = Depends(get_current_user)):
    """Get all quiz submissions for current user"""
    submissions = list(submissions_collection.find({
        "student_id": current_user["user_id"]
    }).sort("submitted_at", -1))
    
    # Add quiz titles
    for sub in submissions:
        quiz = quizzes_collection.find_one({"_id": ObjectId(sub["quiz_id"])})
        sub["quiz_title"] = quiz["title"] if quiz else "Unknown Quiz"
    
    return [serialize_doc(s) for s in submissions]


@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, include_answers: bool = False):
    """Get a specific quiz with its questions"""
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz = serialize_doc(quiz)
    
    # Get questions
    questions = list(questions_collection.find({"quiz_id": quiz_id}).sort("order", 1))
    quiz_questions = []
    
    for q in questions:
        q_data = serialize_doc(q)
        # Hide correct answers for students unless quiz allows it
        if not include_answers:
            for opt in q_data.get("options", []):
                opt.pop("is_correct", None)
            q_data.pop("correct_answer", None)
        quiz_questions.append(q_data)
    
    quiz["questions_data"] = quiz_questions
    return quiz


@router.put("/{quiz_id}")
async def update_quiz(quiz_id: str, request: CreateQuizRequest, current_user: dict = Depends(get_current_user)):
    """Update a quiz (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": {
            "title": request.title,
            "description": request.description,
            "time_limit": request.time_limit,
            "passing_score": request.passing_score,
            "max_attempts": request.max_attempts
        }}
    )
    
    return {"message": "Quiz updated successfully"}


@router.post("/{quiz_id}/publish")
async def publish_quiz(quiz_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Publish a quiz and notify students (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$set": {"is_published": True}}
    )
    
    # Get course info for notification
    course = courses_collection.find_one({"_id": ObjectId(quiz["course_id"])})
    
    # Notify all approved students via email
    if is_email_configured() and course:
        students = users_collection.find({"role": "student", "status": "approved"})
        for student in students:
            topic_slug = None
            if quiz.get("topic_id"):
                topic = topics_collection.find_one({"_id": ObjectId(quiz["topic_id"])})
                topic_slug = topic.get("slug") if topic else None
            
            background_tasks.add_task(
                send_quiz_available_email,
                student["email"],
                student["username"],
                quiz["title"],
                course["title"],
                course["slug"],
                topic_slug
            )
    
    return {"message": "Quiz published successfully"}


@router.delete("/{quiz_id}")
async def delete_quiz(quiz_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a quiz (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete quiz and its questions
    quizzes_collection.delete_one({"_id": ObjectId(quiz_id)})
    questions_collection.delete_many({"quiz_id": quiz_id})
    
    return {"message": "Quiz deleted successfully"}


# ============ QUESTION MANAGEMENT ============

@router.post("/{quiz_id}/questions")
async def add_question(quiz_id: str, request: CreateQuestionRequest, current_user: dict = Depends(get_current_user)):
    """Add a question to a quiz (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get max order
    max_order = questions_collection.find_one(
        {"quiz_id": quiz_id},
        sort=[("order", -1)]
    )
    new_order = (max_order["order"] + 1) if max_order else 1
    
    # Process options for multiple choice / true-false
    options = []
    if request.type in [QuestionType.MULTIPLE_CHOICE.value, QuestionType.TRUE_FALSE.value, "multiple_choice", "true_false"]:
        for opt in request.options:
            options.append({
                "id": str(uuid.uuid4()),
                "text": opt.get("text", ""),
                "is_correct": opt.get("is_correct", False)
            })
    
    question_doc = {
        "quiz_id": quiz_id,
        "type": request.type,
        "question": request.question,
        "options": options,
        "correct_answer": request.correct_answer,  # For short answer
        "points": request.points,
        "explanation": request.explanation,
        "order": new_order
    }
    
    result = questions_collection.insert_one(question_doc)
    
    # Add question ID to quiz
    quizzes_collection.update_one(
        {"_id": ObjectId(quiz_id)},
        {"$push": {"questions": str(result.inserted_id)}}
    )
    
    question_doc["id"] = str(result.inserted_id)
    question_doc.pop("_id", None)
    
    return question_doc


@router.put("/questions/{question_id}")
async def update_question(question_id: str, request: CreateQuestionRequest, current_user: dict = Depends(get_current_user)):
    """Update a question (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    question = questions_collection.find_one({"_id": ObjectId(question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Process options
    options = []
    if request.type in [QuestionType.MULTIPLE_CHOICE.value, QuestionType.TRUE_FALSE.value, "multiple_choice", "true_false"]:
        for opt in request.options:
            options.append({
                "id": opt.get("id") or str(uuid.uuid4()),
                "text": opt.get("text", ""),
                "is_correct": opt.get("is_correct", False)
            })
    
    questions_collection.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {
            "type": request.type,
            "question": request.question,
            "options": options,
            "correct_answer": request.correct_answer,
            "points": request.points,
            "explanation": request.explanation
        }}
    )
    
    return {"message": "Question updated successfully"}


@router.delete("/questions/{question_id}")
async def delete_question(question_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a question (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    question = questions_collection.find_one({"_id": ObjectId(question_id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Remove from quiz
    quizzes_collection.update_one(
        {"_id": ObjectId(question["quiz_id"])},
        {"$pull": {"questions": question_id}}
    )
    
    questions_collection.delete_one({"_id": ObjectId(question_id)})
    
    return {"message": "Question deleted successfully"}


# ============ QUIZ SUBMISSION & GRADING ============

@router.post("/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, request: SubmitQuizRequest, current_user: dict = Depends(get_current_user)):
    """Submit quiz answers and get auto-graded results"""
    # Check if user is approved student
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user or user.get("status") != "approved":
        raise HTTPException(status_code=403, detail="Only approved users can take quizzes")
    
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if not quiz.get("is_published"):
        raise HTTPException(status_code=400, detail="Quiz is not published")
    
    # Check max attempts
    previous_attempts = submissions_collection.count_documents({
        "quiz_id": quiz_id,
        "student_id": current_user["user_id"]
    })
    
    if previous_attempts >= quiz.get("max_attempts", 3):
        raise HTTPException(status_code=400, detail="Maximum attempts reached")
    
    # Get questions and grade
    questions = list(questions_collection.find({"quiz_id": quiz_id}))
    questions_map = {str(q["_id"]): q for q in questions}
    
    graded_answers = []
    total_points = 0
    earned_points = 0
    
    for answer in request.answers:
        question_id = answer.get("question_id")
        user_answer = answer.get("answer", "")
        
        question = questions_map.get(question_id)
        if not question:
            continue
        
        q_points = question.get("points", 1)
        total_points += q_points
        is_correct = False
        points_earned = 0
        
        # Auto-grade based on question type
        q_type = question.get("type", "")
        
        if q_type in ["multiple_choice", "true_false"]:
            # Find correct option
            correct_option = next((o for o in question.get("options", []) if o.get("is_correct")), None)
            if correct_option and user_answer == correct_option.get("id"):
                is_correct = True
                points_earned = q_points
        
        elif q_type == "short_answer":
            # Case-insensitive comparison
            correct = question.get("correct_answer", "").strip().lower()
            if user_answer.strip().lower() == correct:
                is_correct = True
                points_earned = q_points
        
        elif q_type == "essay":
            # Essays need manual grading - mark as pending
            is_correct = None  # None indicates needs manual grading
            points_earned = 0
        
        earned_points += points_earned
        
        graded_answers.append({
            "question_id": question_id,
            "answer": user_answer,
            "is_correct": is_correct,
            "points_earned": points_earned
        })
    
    # Calculate score
    percentage = (earned_points / total_points * 100) if total_points > 0 else 0
    passed = percentage >= quiz.get("passing_score", 60)
    
    # Save submission
    submission_doc = {
        "quiz_id": quiz_id,
        "student_id": current_user["user_id"],
        "answers": graded_answers,
        "score": earned_points,
        "total_points": total_points,
        "percentage": round(percentage, 2),
        "passed": passed,
        "time_taken": request.time_taken,
        "submitted_at": datetime.now(timezone.utc),
        "graded_at": datetime.now(timezone.utc),
        "graded_by": "auto"
    }
    
    result = submissions_collection.insert_one(submission_doc)
    submission_doc["id"] = str(result.inserted_id)
    submission_doc.pop("_id", None)
    
    # Add question details if show_correct_answers is enabled
    if quiz.get("show_correct_answers", True):
        for ans in graded_answers:
            q = questions_map.get(ans["question_id"])
            if q:
                ans["explanation"] = q.get("explanation")
                if q.get("type") in ["multiple_choice", "true_false"]:
                    correct_opt = next((o for o in q.get("options", []) if o.get("is_correct")), None)
                    ans["correct_option_id"] = correct_opt.get("id") if correct_opt else None
                elif q.get("type") == "short_answer":
                    ans["correct_answer"] = q.get("correct_answer")
    
    return submission_doc


@router.get("/{quiz_id}/submissions")
async def get_quiz_submissions(quiz_id: str, current_user: dict = Depends(get_current_user)):
    """Get all submissions for a quiz (instructor) or own submissions (student)"""
    if current_user.get("role") in ["admin", "instructor"]:
        # Instructors see all submissions
        submissions = list(submissions_collection.find({"quiz_id": quiz_id}).sort("submitted_at", -1))
        
        # Add student details
        for sub in submissions:
            student = users_collection.find_one({"_id": ObjectId(sub["student_id"])})
            if student:
                sub["student_name"] = student.get("username", "Unknown")
                sub["student_email"] = student.get("email", "N/A")
                sub["student_username"] = student.get("username", "Unknown")
            else:
                sub["student_name"] = "Unknown"
                sub["student_email"] = "N/A"
                sub["student_username"] = "Unknown"
        
        return [serialize_doc(s) for s in submissions]
    else:
        # Students see only their submissions
        submissions = list(submissions_collection.find({
            "quiz_id": quiz_id,
            "student_id": current_user["user_id"]
        }).sort("submitted_at", -1))
        
        return [serialize_doc(s) for s in submissions]


@router.put("/submissions/{submission_id}/grade")
async def grade_essay(
    submission_id: str,
    question_id: str,
    points: int,
    feedback: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Manually grade an essay question (instructor only)"""
    if current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    submission = submissions_collection.find_one({"_id": ObjectId(submission_id)})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Update the specific answer
    answers = submission.get("answers", [])
    for ans in answers:
        if ans["question_id"] == question_id:
            ans["points_earned"] = points
            ans["is_correct"] = points > 0
            ans["feedback"] = feedback
            break
    
    # Recalculate total score
    total_earned = sum(a.get("points_earned", 0) for a in answers)
    total_points = submission.get("total_points", 1)
    percentage = (total_earned / total_points * 100) if total_points > 0 else 0
    
    quiz = quizzes_collection.find_one({"_id": ObjectId(submission["quiz_id"])})
    passed = percentage >= quiz.get("passing_score", 60) if quiz else False
    
    submissions_collection.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "answers": answers,
            "score": total_earned,
            "percentage": round(percentage, 2),
            "passed": passed,
            "graded_at": datetime.now(timezone.utc),
            "graded_by": current_user["username"]
        }}
    )
    
    return {"message": "Grade updated successfully"}
