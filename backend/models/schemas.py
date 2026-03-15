from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class BlockType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    CODE = "code"
    FILE = "file"

class ContentBlock(BaseModel):
    id: str
    type: BlockType
    content: str  # For text/code: the actual content, for others: URL/path
    caption: Optional[str] = None
    language: Optional[str] = None  # For code blocks
    order: int

class ContentVersion(BaseModel):
    version: int
    blocks: List[ContentBlock]
    updated_by: str
    updated_at: datetime
    change_summary: Optional[str] = None

class Topic(BaseModel):
    id: str
    course_id: str
    title: str
    slug: str
    order: int
    blocks: List[ContentBlock] = []
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
    topics: List[str] = []  # Topic IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

class User(BaseModel):
    id: str
    username: str
    password_hash: str
    role: str = "instructor"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StudentProgress(BaseModel):
    id: str
    student_id: str  # Could be session ID for anonymous users
    course_id: str
    topic_id: str
    completed: bool = False
    last_visited: datetime = Field(default_factory=datetime.utcnow)

# Request/Response models
class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class CreateTopicRequest(BaseModel):
    course_id: str
    title: str
    order: Optional[int] = 0

class UpdateTopicBlocksRequest(BaseModel):
    blocks: List[ContentBlock]
    change_summary: Optional[str] = None

class ProgressUpdateRequest(BaseModel):
    student_id: str
    course_id: str
    topic_id: str
    completed: bool = False
