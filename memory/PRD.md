# Learning Management System (LMS) - Product Requirements Document

## Original Problem Statement
Build a modern, full-featured Learning Management System (LMS) integrated into an academic portfolio website. The LMS should support multiple user roles, rich content editing, quizzes, discussion forums, and email notifications.

## Target Users
- **Administrators**: Full system control, user management
- **Instructors**: Create/edit courses, manage content, grade assessments
- **Students**: View courses, take quizzes, participate in forums
- **Viewers**: Anonymous access to course materials (read-only)

---

## Core Features Implemented (Phase 1-4) ✅

### 1. User Authentication & Management ✅
- [x] JWT-based authentication
- [x] User roles: Admin, Instructor, Student
- [x] Student registration with admin approval workflow
- [x] Forgot password with email reset link
- [x] Admin dashboard for user management
- [x] Default accounts: `admin/admin123`, `instructor/instructor123`

### 2. Course Structure ✅
- [x] 3 courses: Data Structures, Algorithms, Operating Systems
- [x] Multiple topics per course with content blocks
- [x] Topic-based navigation
- [x] Content versioning with change history

### 3. Rich Content Editor ✅
- [x] Bold, italic, underline text formatting
- [x] Heading styles (H1, H2, H3)
- [x] Bullet and numbered lists
- [x] Tables with row/column management
- [x] Page linking (internal)
- [x] External web links/bookmarks
- [x] Image embedding
- [x] YouTube video embedding
- [x] Code blocks with syntax highlighting
- [x] Horizontal rules
- [x] Drag-and-drop content block reordering

### 4. Quiz & Assessment System ✅
- [x] Multiple choice questions with auto-grading
- [x] True/False questions with auto-grading
- [x] Short answer questions with auto-grading
- [x] Essay questions (manual grading)
- [x] Quiz timer with time limits
- [x] Maximum attempt limits
- [x] Pass/fail scoring
- [x] Result review with explanations
- [x] Quiz management for instructors
- [x] Question editor with point values

### 5. Discussion Forums ✅
- [x] Course-level forums
- [x] Topic-level forums
- [x] Thread creation and replies
- [x] Post likes
- [x] Thread pinning (instructor)
- [x] Thread locking (instructor)
- [x] Post editing and deletion
- [x] User role badges

### 6. Email Notifications (CONFIGURED - MOCKED) ⚠️
- [x] Account pending notification template
- [x] Account approval notification template
- [x] Account rejection notification template
- [x] Password reset email template
- [x] Quiz available notification template
- [x] Announcement notification template
- [x] Forum reply notification template
- ⚠️ **Note**: SMTP credentials not configured - emails logged but not sent

### 7. In-App Notifications ✅
- [x] Notification list
- [x] Unread count
- [x] Mark as read
- [x] Clear notifications

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### User Management
- `POST /api/users/register` - Register new student
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `GET /api/users/pending` - Get pending users (admin)
- `GET /api/users/all` - Get all users (admin)
- `POST /api/users/approve` - Approve/reject user (admin)
- `PUT /api/users/{id}/role` - Update user role (admin)
- `DELETE /api/users/{id}` - Delete user (admin)

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/{slug}` - Get course details
- `GET /api/courses/{slug}/topics/{topic_slug}` - Get topic content
- `PUT /api/courses/{slug}/topics/{topic_slug}` - Update topic (instructor)

### Quizzes
- `GET /api/quizzes` - List published quizzes
- `GET /api/quizzes/manage` - List all quizzes (instructor)
- `POST /api/quizzes` - Create quiz (instructor)
- `GET /api/quizzes/{id}` - Get quiz with questions
- `POST /api/quizzes/{id}/publish` - Publish quiz (instructor)
- `POST /api/quizzes/{id}/questions` - Add question (instructor)
- `POST /api/quizzes/{id}/submit` - Submit quiz answers
- `GET /api/quizzes/{id}/submissions` - Get submissions
- `GET /api/quizzes/my-submissions` - Get user's submissions

### Forums
- `GET /api/forums` - List forums
- `POST /api/forums` - Create forum (instructor)
- `GET /api/forums/{id}` - Get forum with threads
- `POST /api/forums/posts` - Create post/reply
- `GET /api/forums/posts/{id}` - Get thread with replies
- `POST /api/forums/posts/{id}/like` - Like post
- `POST /api/forums/posts/{id}/pin` - Pin thread (instructor)
- `POST /api/forums/posts/{id}/lock` - Lock thread (instructor)
- `POST /api/forums/announcements` - Create announcement (instructor)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

---

## Code Architecture

```
/app
├── backend/
│   ├── .env                    # Environment variables
│   ├── server.py               # FastAPI main application
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── routes/
│   │   ├── auth.py             # Authentication routes
│   │   ├── courses.py          # Course/topic routes
│   │   ├── users.py            # User management routes
│   │   ├── quizzes.py          # Quiz/assessment routes
│   │   ├── forums.py           # Discussion forum routes
│   │   └── notifications.py    # Notification routes
│   ├── services/
│   │   ├── scholar_service.py  # Google Scholar integration
│   │   └── email_service.py    # Email notification service
│   └── utils/
│       └── auth.py             # JWT utilities
├── frontend/
│   └── src/
│       ├── components/
│       │   └── coursework/
│       │       ├── CourseworkHome.jsx
│       │       ├── CoursePage.jsx
│       │       ├── TopicPage.jsx
│       │       ├── TopicEditor.jsx
│       │       ├── RichTextEditor.jsx
│       │       ├── InstructorLogin.jsx
│       │       ├── RegisterPage.jsx
│       │       ├── ForgotPasswordPage.jsx
│       │       ├── AdminDashboard.jsx
│       │       ├── QuizList.jsx
│       │       ├── QuizTaker.jsx
│       │       ├── QuizManager.jsx
│       │       ├── QuestionEditor.jsx
│       │       ├── ForumList.jsx
│       │       ├── ForumView.jsx
│       │       └── ThreadView.jsx
│       └── context/
│           └── AuthContext.js
```

---

## Database Collections (MongoDB)

- `users` - User accounts and profiles
- `courses` - Course definitions
- `topics` - Topic content and versions
- `quizzes` - Quiz definitions
- `questions` - Quiz questions
- `quiz_submissions` - Student quiz attempts
- `forums` - Forum definitions
- `forum_posts` - Forum posts and replies
- `announcements` - Instructor announcements
- `notifications` - User notifications

---

## Testing Status
- **Backend**: 100% (28/28 tests passed)
- **Frontend**: Core flows working (Registration, Login, Courses, Topics, Admin Dashboard)

---

## Known Issues / Future Tasks (P0-P2)

### P0 - Critical
- None

### P1 - High Priority
- [ ] Configure SMTP credentials for real email sending
- [ ] Implement student progress tracking
- [ ] Add site-wide search functionality
- [ ] Implement Table of Contents auto-generation

### P2 - Medium Priority
- [ ] Mobile responsiveness improvements
- [ ] File upload for content editor
- [ ] Audio embedding support
- [ ] Quiz result export (CSV/PDF)
- [ ] Bulk user import
- [ ] Course enrollment management

### P3 - Low Priority (Backlog)
- [ ] Dark mode theme
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Course completion certificates

---

## Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Instructor | instructor | instructor123 |

---

## Last Updated
March 16, 2026 - LMS Phase 1-4 Implementation Complete
