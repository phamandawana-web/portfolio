from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================

class BlockType(str, Enum):
    TEXT = "text"
    RICHTEXT = "richtext"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    CODE = "code"
    FILE = "file"
    TABLE = "table"
    BOOKMARK = "bookmark"
    TOC = "toc"  # Table of contents

class UserRole(str, Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"

class UserStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"

class ForumType(str, Enum):
    COURSE = "course"
    TOPIC = "topic"

# ==================== CONTENT BLOCKS ====================

class ContentBlock(BaseModel):
    id: str
    type: BlockType
    content: str  # For richtext: HTML content, for others: URL/path/data
    caption: Optional[str] = None
    language: Optional[str] = None  # For code blocks
    order: int
    metadata: Optional[Dict[str, Any]] = None  # For tables, bookmarks, etc.

class ContentVersion(BaseModel):
    version: int
    blocks: List[ContentBlock]
    updated_by: str
    updated_at: datetime
    change_summary: Optional[str] = None

# ==================== PAGES & TOPICS ====================

class Page(BaseModel):
    id: str
    topic_id: str
    title: str
    slug: str
    order: int
    blocks: List[ContentBlock] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Topic(BaseModel):
    id: str
    course_id: str
    title: str
    slug: str
    order: int
    pages: List[str] = []  # Page IDs
    blocks: List[ContentBlock] = []  # For backward compatibility
    versions: List[ContentVersion] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Course(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    icon: str
    color: str
    order: int
    topics: List[str] = []
    instructor_ids: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== USER SYSTEM ====================

class User(BaseModel):
    id: str
    username: str
    email: str
    password_hash: str
    role: UserRole = UserRole.STUDENT
    status: UserStatus = UserStatus.PENDING
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None

class StudentProgress(BaseModel):
    id: str
    student_id: str
    course_id: str
    topic_id: str
    page_id: Optional[str] = None
    completed: bool = False
    last_visited: datetime = Field(default_factory=datetime.utcnow)

# ==================== QUIZ SYSTEM ====================

class QuizOption(BaseModel):
    id: str
    text: str
    is_correct: bool = False

class QuizQuestion(BaseModel):
    id: str
    quiz_id: str
    type: QuestionType
    question: str
    options: List[QuizOption] = []  # For multiple choice / true-false
    correct_answer: Optional[str] = None  # For short answer
    points: int = 1
    order: int
    explanation: Optional[str] = None

class Quiz(BaseModel):
    id: str
    course_id: str
    topic_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    questions: List[str] = []  # Question IDs
    time_limit: Optional[int] = None  # In minutes
    passing_score: int = 60  # Percentage
    max_attempts: int = 3
    shuffle_questions: bool = False
    show_correct_answers: bool = True
    is_published: bool = False
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuizAnswer(BaseModel):
    question_id: str
    answer: str  # Selected option ID or text answer
    is_correct: Optional[bool] = None
    points_earned: int = 0

class QuizSubmission(BaseModel):
    id: str
    quiz_id: str
    student_id: str
    answers: List[QuizAnswer]
    score: float = 0
    total_points: int = 0
    percentage: float = 0
    passed: bool = False
    time_taken: Optional[int] = None  # In seconds
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    graded_at: Optional[datetime] = None
    graded_by: Optional[str] = None  # For essay questions

# ==================== DISCUSSION FORUM ====================

class ForumPost(BaseModel):
    id: str
    forum_id: str
    author_id: str
    title: Optional[str] = None  # For new threads
    content: str
    parent_id: Optional[str] = None  # For replies
    is_pinned: bool = False
    is_locked: bool = False
    likes: List[str] = []  # User IDs who liked
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Forum(BaseModel):
    id: str
    type: ForumType
    course_id: str
    topic_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== NOTIFICATIONS ====================

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str  # account_approved, quiz_available, announcement, etc.
    is_read: bool = False
    link: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== REQUEST/RESPONSE MODELS ====================

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class CreateTopicRequest(BaseModel):
    course_id: str
    title: str
    order: Optional[int] = 0

class CreatePageRequest(BaseModel):
    topic_id: str
    title: str
    order: Optional[int] = 0

class UpdateTopicBlocksRequest(BaseModel):
    blocks: List[ContentBlock]
    change_summary: Optional[str] = None

class UpdatePageBlocksRequest(BaseModel):
    blocks: List[ContentBlock]

class ProgressUpdateRequest(BaseModel):
    student_id: str
    course_id: str
    topic_id: str
    page_id: Optional[str] = None
    completed: bool = False

class CreateQuizRequest(BaseModel):
    course_id: str
    topic_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    time_limit: Optional[int] = None
    passing_score: int = 60
    max_attempts: int = 3

class CreateQuestionRequest(BaseModel):
    quiz_id: str
    type: QuestionType
    question: str
    options: List[Dict[str, Any]] = []
    correct_answer: Optional[str] = None
    points: int = 1
    explanation: Optional[str] = None

class SubmitQuizRequest(BaseModel):
    quiz_id: str
    answers: List[Dict[str, str]]
    time_taken: Optional[int] = None

class CreateForumPostRequest(BaseModel):
    forum_id: str
    title: Optional[str] = None
    content: str
    parent_id: Optional[str] = None

class ApproveUserRequest(BaseModel):
    user_id: str
    approved: bool
