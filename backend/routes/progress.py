"""
Progress Tracking, Certificates, and Export Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from utils.auth import get_current_user
from pymongo import MongoClient
from bson import ObjectId
import os
import io
import csv
from datetime import datetime, timezone
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT

router = APIRouter(prefix="/api/progress", tags=["Progress & Certificates"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'portfolio')
client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db['users']
courses_collection = db['courses']
topics_collection = db['topics']
progress_collection = db['progress']
quizzes_collection = db['quizzes']
submissions_collection = db['quiz_submissions']
certificates_collection = db['certificates']


def serialize_doc(doc):
    if doc is None:
        return None
    doc['id'] = str(doc.pop('_id'))
    return doc


# ==================== PROGRESS TRACKING ====================

@router.get("/dashboard")
async def get_progress_dashboard(current_user: dict = Depends(get_current_user)):
    """Get comprehensive progress dashboard for the current user"""
    user_id = current_user["user_id"]
    
    # Get all courses
    courses = list(courses_collection.find().sort("order", 1))
    
    # Get user's progress
    user_progress = list(progress_collection.find({"student_id": user_id}))
    progress_map = {p["topic_id"]: p for p in user_progress}
    
    # Get user's quiz submissions
    quiz_submissions = list(submissions_collection.find({"student_id": user_id}))
    
    dashboard = {
        "user": {
            "id": user_id,
            "username": current_user["username"],
            "role": current_user["role"]
        },
        "overall_stats": {
            "courses_enrolled": 0,
            "courses_completed": 0,
            "topics_completed": 0,
            "total_topics": 0,
            "quizzes_taken": len(quiz_submissions),
            "quizzes_passed": sum(1 for s in quiz_submissions if s.get("passed")),
            "average_score": 0
        },
        "courses": []
    }
    
    total_score = 0
    score_count = 0
    
    for course in courses:
        course_id = str(course["_id"])
        topics = list(topics_collection.find({"course_id": course_id}).sort("order", 1))
        
        completed_topics = 0
        total_topics = len(topics)
        topic_details = []
        
        for topic in topics:
            topic_id = str(topic["_id"])
            progress = progress_map.get(topic_id, {})
            is_completed = progress.get("completed", False)
            
            if is_completed:
                completed_topics += 1
            
            topic_details.append({
                "id": topic_id,
                "title": topic["title"],
                "slug": topic["slug"],
                "completed": is_completed,
                "last_visited": progress.get("last_visited")
            })
        
        # Get quizzes for this course
        course_quizzes = list(quizzes_collection.find({"course_id": course_id, "is_published": True}))
        quiz_stats = []
        
        for quiz in course_quizzes:
            quiz_id = str(quiz["_id"])
            user_submissions = [s for s in quiz_submissions if s.get("quiz_id") == quiz_id]
            best_score = max((s.get("percentage", 0) for s in user_submissions), default=None)
            passed = any(s.get("passed") for s in user_submissions)
            
            if user_submissions:
                total_score += best_score or 0
                score_count += 1
            
            quiz_stats.append({
                "id": quiz_id,
                "title": quiz["title"],
                "attempts": len(user_submissions),
                "best_score": best_score,
                "passed": passed,
                "max_attempts": quiz.get("max_attempts", 3)
            })
        
        progress_percent = (completed_topics / total_topics * 100) if total_topics > 0 else 0
        is_course_completed = completed_topics == total_topics and total_topics > 0
        
        # Check if certificate exists
        existing_cert = certificates_collection.find_one({
            "user_id": user_id,
            "course_id": course_id
        })
        
        course_data = {
            "id": course_id,
            "title": course["title"],
            "slug": course["slug"],
            "color": course.get("color", "blue"),
            "icon": course.get("icon", "BookOpen"),
            "progress_percent": round(progress_percent, 1),
            "completed_topics": completed_topics,
            "total_topics": total_topics,
            "is_completed": is_course_completed,
            "certificate_earned": existing_cert is not None,
            "certificate_id": str(existing_cert["_id"]) if existing_cert else None,
            "topics": topic_details,
            "quizzes": quiz_stats
        }
        
        dashboard["courses"].append(course_data)
        dashboard["overall_stats"]["total_topics"] += total_topics
        dashboard["overall_stats"]["topics_completed"] += completed_topics
        
        if total_topics > 0:
            dashboard["overall_stats"]["courses_enrolled"] += 1
            if is_course_completed:
                dashboard["overall_stats"]["courses_completed"] += 1
    
    # Calculate average score
    if score_count > 0:
        dashboard["overall_stats"]["average_score"] = round(total_score / score_count, 1)
    
    return dashboard


@router.post("/mark-topic")
async def mark_topic_progress(
    course_id: str,
    topic_id: str,
    completed: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """Mark a topic as completed or incomplete"""
    user_id = current_user["user_id"]
    
    existing = progress_collection.find_one({
        "student_id": user_id,
        "topic_id": topic_id
    })
    
    if existing:
        progress_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "completed": completed,
                "last_visited": datetime.now(timezone.utc)
            }}
        )
    else:
        progress_collection.insert_one({
            "student_id": user_id,
            "course_id": course_id,
            "topic_id": topic_id,
            "completed": completed,
            "last_visited": datetime.now(timezone.utc)
        })
    
    return {"message": f"Topic marked as {'completed' if completed else 'incomplete'}"}


# ==================== QUIZ EXPORT ====================

@router.get("/export/quiz/{quiz_id}")
async def export_quiz_results(
    quiz_id: str,
    format: str = "csv",
    current_user: dict = Depends(get_current_user)
):
    """Export quiz results to CSV or PDF"""
    # Check permissions
    is_instructor = current_user.get("role") in ["admin", "instructor"]
    
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get submissions
    if is_instructor:
        submissions = list(submissions_collection.find({"quiz_id": quiz_id}).sort("submitted_at", -1))
    else:
        submissions = list(submissions_collection.find({
            "quiz_id": quiz_id,
            "student_id": current_user["user_id"]
        }).sort("submitted_at", -1))
    
    if not submissions:
        raise HTTPException(status_code=404, detail="No submissions found")
    
    # Add student names
    for sub in submissions:
        student = users_collection.find_one({"_id": ObjectId(sub["student_id"])})
        sub["student_name"] = student["username"] if student else "Unknown"
    
    if format == "csv":
        return export_quiz_csv(quiz, submissions)
    else:
        return export_quiz_pdf(quiz, submissions)


def export_quiz_csv(quiz, submissions):
    """Generate CSV export of quiz results"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Student", "Score", "Total Points", "Percentage", 
        "Passed", "Time Taken (min)", "Submitted At"
    ])
    
    # Data rows
    for sub in submissions:
        time_taken = sub.get("time_taken")
        time_min = round(time_taken / 60, 1) if time_taken else "N/A"
        
        writer.writerow([
            sub["student_name"],
            sub.get("score", 0),
            sub.get("total_points", 0),
            f"{sub.get('percentage', 0)}%",
            "Yes" if sub.get("passed") else "No",
            time_min,
            sub.get("submitted_at", "").strftime("%Y-%m-%d %H:%M") if sub.get("submitted_at") else ""
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=quiz_{quiz['title'].replace(' ', '_')}_results.csv"
        }
    )


def export_quiz_pdf(quiz, submissions):
    """Generate PDF export of quiz results"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=18)
    subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], alignment=TA_CENTER, fontSize=12, textColor=colors.grey)
    
    elements = []
    
    # Title
    elements.append(Paragraph(f"Quiz Results: {quiz['title']}", title_style))
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", subtitle_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Summary stats
    total_submissions = len(submissions)
    passed_count = sum(1 for s in submissions if s.get("passed"))
    avg_score = sum(s.get("percentage", 0) for s in submissions) / total_submissions if total_submissions > 0 else 0
    
    summary_data = [
        ["Total Submissions", str(total_submissions)],
        ["Passed", f"{passed_count} ({round(passed_count/total_submissions*100) if total_submissions > 0 else 0}%)"],
        ["Average Score", f"{round(avg_score, 1)}%"],
        ["Passing Score", f"{quiz.get('passing_score', 60)}%"]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Results table
    elements.append(Paragraph("Individual Results", styles['Heading2']))
    elements.append(Spacer(1, 0.1*inch))
    
    table_data = [["Student", "Score", "Percentage", "Passed", "Date"]]
    for sub in submissions:
        table_data.append([
            sub["student_name"],
            f"{sub.get('score', 0)}/{sub.get('total_points', 0)}",
            f"{sub.get('percentage', 0)}%",
            "✓" if sub.get("passed") else "✗",
            sub.get("submitted_at", "").strftime("%Y-%m-%d") if sub.get("submitted_at") else ""
        ])
    
    results_table = Table(table_data, colWidths=[1.8*inch, 1*inch, 1*inch, 0.8*inch, 1.2*inch])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
    ]))
    elements.append(results_table)
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=quiz_{quiz['title'].replace(' ', '_')}_results.pdf"
        }
    )


@router.get("/export/my-results")
async def export_my_results(
    format: str = "csv",
    current_user: dict = Depends(get_current_user)
):
    """Export all quiz results for the current user"""
    submissions = list(submissions_collection.find({
        "student_id": current_user["user_id"]
    }).sort("submitted_at", -1))
    
    if not submissions:
        raise HTTPException(status_code=404, detail="No quiz submissions found")
    
    # Add quiz titles
    for sub in submissions:
        quiz = quizzes_collection.find_one({"_id": ObjectId(sub["quiz_id"])})
        sub["quiz_title"] = quiz["title"] if quiz else "Unknown Quiz"
        course = courses_collection.find_one({"_id": ObjectId(quiz["course_id"])}) if quiz else None
        sub["course_title"] = course["title"] if course else "Unknown Course"
    
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Course", "Quiz", "Score", "Percentage", "Passed", "Date"])
        
        for sub in submissions:
            writer.writerow([
                sub["course_title"],
                sub["quiz_title"],
                f"{sub.get('score', 0)}/{sub.get('total_points', 0)}",
                f"{sub.get('percentage', 0)}%",
                "Yes" if sub.get("passed") else "No",
                sub.get("submitted_at", "").strftime("%Y-%m-%d %H:%M") if sub.get("submitted_at") else ""
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=my_quiz_results.csv"}
        )
    
    raise HTTPException(status_code=400, detail="Invalid format")


# ==================== CERTIFICATES ====================

@router.post("/certificate/{course_id}")
async def generate_certificate(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate a course completion certificate"""
    user_id = current_user["user_id"]
    
    # Get course
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if all topics are completed
    topics = list(topics_collection.find({"course_id": course_id}))
    if not topics:
        raise HTTPException(status_code=400, detail="Course has no topics")
    
    completed_count = progress_collection.count_documents({
        "student_id": user_id,
        "course_id": course_id,
        "completed": True
    })
    
    if completed_count < len(topics):
        raise HTTPException(
            status_code=400, 
            detail=f"Course not completed. {completed_count}/{len(topics)} topics completed."
        )
    
    # Check if certificate already exists
    existing = certificates_collection.find_one({
        "user_id": user_id,
        "course_id": course_id
    })
    
    if existing:
        return {
            "message": "Certificate already generated",
            "certificate_id": str(existing["_id"]),
            "issued_at": existing["issued_at"]
        }
    
    # Get user info
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
    if not user_name:
        user_name = user.get("username", "Student")
    
    # Create certificate record
    cert_doc = {
        "user_id": user_id,
        "course_id": course_id,
        "user_name": user_name,
        "course_title": course["title"],
        "issued_at": datetime.now(timezone.utc),
        "certificate_number": f"LMS-{course_id[:4].upper()}-{user_id[:4].upper()}-{datetime.now().strftime('%Y%m%d')}"
    }
    
    result = certificates_collection.insert_one(cert_doc)
    
    return {
        "message": "Certificate generated successfully",
        "certificate_id": str(result.inserted_id),
        "certificate_number": cert_doc["certificate_number"]
    }


@router.get("/certificate/{certificate_id}/download")
async def download_certificate(certificate_id: str):
    """Download a certificate as PDF"""
    cert = certificates_collection.find_one({"_id": ObjectId(certificate_id)})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=36,
        textColor=colors.HexColor('#1e3a5f'),
        spaceAfter=20
    )
    
    subtitle_style = ParagraphStyle(
        'CertSubtitle',
        parent=styles['Normal'],
        alignment=TA_CENTER,
        fontSize=16,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=30
    )
    
    name_style = ParagraphStyle(
        'CertName',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=28,
        textColor=colors.HexColor('#3b82f6'),
        spaceBefore=20,
        spaceAfter=20
    )
    
    course_style = ParagraphStyle(
        'CertCourse',
        parent=styles['Heading2'],
        alignment=TA_CENTER,
        fontSize=22,
        textColor=colors.HexColor('#1e3a5f'),
        spaceBefore=10,
        spaceAfter=30
    )
    
    footer_style = ParagraphStyle(
        'CertFooter',
        parent=styles['Normal'],
        alignment=TA_CENTER,
        fontSize=10,
        textColor=colors.HexColor('#94a3b8')
    )
    
    elements = []
    
    # Header decoration
    elements.append(Spacer(1, 0.5*inch))
    
    # Title
    elements.append(Paragraph("Certificate of Completion", title_style))
    elements.append(Paragraph("This is to certify that", subtitle_style))
    
    # Student name
    elements.append(Paragraph(cert["user_name"], name_style))
    
    # Course info
    elements.append(Paragraph("has successfully completed the course", subtitle_style))
    elements.append(Paragraph(cert["course_title"], course_style))
    
    # Date
    issue_date = cert["issued_at"].strftime("%B %d, %Y") if cert.get("issued_at") else datetime.now().strftime("%B %d, %Y")
    elements.append(Spacer(1, 0.3*inch))
    elements.append(Paragraph(f"Issued on {issue_date}", subtitle_style))
    
    # Certificate number
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(f"Certificate No: {cert.get('certificate_number', 'N/A')}", footer_style))
    
    # Signature line
    elements.append(Spacer(1, 0.3*inch))
    sig_data = [["_" * 30, "", "_" * 30], ["Instructor Signature", "", "Date"]]
    sig_table = Table(sig_data, colWidths=[2.5*inch, 2*inch, 2.5*inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#64748b')),
    ]))
    elements.append(sig_table)
    
    doc.build(elements)
    buffer.seek(0)
    
    filename = f"certificate_{cert['course_title'].replace(' ', '_')}_{cert['user_name'].replace(' ', '_')}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/certificates")
async def get_my_certificates(current_user: dict = Depends(get_current_user)):
    """Get all certificates for the current user"""
    certificates = list(certificates_collection.find({
        "user_id": current_user["user_id"]
    }).sort("issued_at", -1))
    
    return [serialize_doc(c) for c in certificates]
