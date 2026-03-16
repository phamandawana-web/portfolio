"""
LMS Backend API Tests
Tests for auth, users, quizzes, forums, and notifications endpoints
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
INSTRUCTOR_CREDS = {"username": "instructor", "password": "instructor123"}
ADMIN_CREDS = {"username": "admin", "password": "admin123"}


class TestHealthAndBasics:
    """Basic health and API availability tests"""
    
    def test_health_check(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_api_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_instructor_success(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["username"] == "instructor"
        assert data["role"] == "instructor"
    
    def test_login_admin_success(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["username"] == "admin"
        assert data["role"] == "admin"
    
    def test_login_invalid_credentials(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "wronguser",
            "password": "wrongpass"
        })
        assert response.status_code == 401
    
    def test_get_me_without_token(self):
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
    
    def test_get_me_with_token(self):
        # Login first
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        token = login_res.json()["access_token"]
        
        # Get me
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "instructor"


class TestUserRegistration:
    """User registration and approval tests"""
    
    def test_register_new_user(self):
        unique_id = str(uuid.uuid4())[:8]
        response = requests.post(f"{BASE_URL}/api/users/register", json={
            "username": f"TEST_user_{unique_id}",
            "email": f"test_{unique_id}@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending"
        assert "user_id" in data
    
    def test_register_duplicate_username(self):
        # First registration
        unique_id = str(uuid.uuid4())[:8]
        requests.post(f"{BASE_URL}/api/users/register", json={
            "username": f"TEST_dup_{unique_id}",
            "email": f"dup1_{unique_id}@example.com",
            "password": "testpass123"
        })
        
        # Duplicate username
        response = requests.post(f"{BASE_URL}/api/users/register", json={
            "username": f"TEST_dup_{unique_id}",
            "email": f"dup2_{unique_id}@example.com",
            "password": "testpass123"
        })
        assert response.status_code == 400
        assert "Username already taken" in response.json().get("detail", "")


class TestUserManagement:
    """User management tests (admin/instructor only)"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDS)
        return response.json()["access_token"]
    
    @pytest.fixture
    def instructor_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        return response.json()["access_token"]
    
    def test_get_all_users_as_admin(self, admin_token):
        response = requests.get(
            f"{BASE_URL}/api/users/all",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have at least admin and instructor
        assert len(data) >= 2
    
    def test_get_pending_users(self, admin_token):
        response = requests.get(
            f"{BASE_URL}/api/users/pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_users_without_auth(self):
        response = requests.get(f"{BASE_URL}/api/users/all")
        assert response.status_code in [401, 403]
    
    def test_approve_user_flow(self, admin_token):
        # Create a test user
        unique_id = str(uuid.uuid4())[:8]
        reg_res = requests.post(f"{BASE_URL}/api/users/register", json={
            "username": f"TEST_approve_{unique_id}",
            "email": f"approve_{unique_id}@example.com",
            "password": "testpass123"
        })
        user_id = reg_res.json()["user_id"]
        
        # Approve the user
        response = requests.post(
            f"{BASE_URL}/api/users/approve",
            json={"user_id": user_id, "approved": True},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert "approved" in response.json()["message"].lower()


class TestCourses:
    """Course listing and retrieval tests"""
    
    def test_get_all_courses(self):
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have 3 courses: Data Structures, Algorithms, Operating Systems
        assert len(data) >= 3
    
    def test_get_course_by_slug(self):
        response = requests.get(f"{BASE_URL}/api/courses/data-structures")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == "data-structures"
        assert "title" in data
    
    def test_get_course_topics(self):
        # Get course with topics included
        response = requests.get(f"{BASE_URL}/api/courses/data-structures")
        assert response.status_code == 200
        data = response.json()
        # Topics are included in the course response as topics_data
        assert "topics_data" in data
        assert isinstance(data["topics_data"], list)
        assert len(data["topics_data"]) > 0


class TestQuizzes:
    """Quiz CRUD and submission tests"""
    
    @pytest.fixture
    def instructor_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        return response.json()["access_token"]
    
    def test_get_published_quizzes(self):
        response = requests.get(f"{BASE_URL}/api/quizzes")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_managed_quizzes_as_instructor(self, instructor_token):
        response = requests.get(
            f"{BASE_URL}/api/quizzes/manage",
            headers={"Authorization": f"Bearer {instructor_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_quiz_as_instructor(self, instructor_token):
        # Get a course first
        course_res = requests.get(f"{BASE_URL}/api/courses/data-structures")
        course_id = course_res.json()["id"]
        
        unique_id = str(uuid.uuid4())[:8]
        response = requests.post(
            f"{BASE_URL}/api/quizzes",
            json={
                "course_id": course_id,
                "topic_id": None,
                "title": f"TEST_Quiz_{unique_id}",
                "description": "Test quiz description",
                "time_limit": 30,
                "passing_score": 60,
                "max_attempts": 3
            },
            headers={"Authorization": f"Bearer {instructor_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == f"TEST_Quiz_{unique_id}"
        assert "id" in data
    
    def test_create_quiz_without_auth(self):
        response = requests.post(
            f"{BASE_URL}/api/quizzes",
            json={
                "course_id": "test",
                "title": "Unauthorized Quiz",
                "description": "Should fail"
            }
        )
        assert response.status_code in [401, 403]


class TestForums:
    """Forum and post tests"""
    
    @pytest.fixture
    def instructor_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        return response.json()["access_token"]
    
    def test_get_forums(self):
        response = requests.get(f"{BASE_URL}/api/forums")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_forum_as_instructor(self, instructor_token):
        # Get a course first
        course_res = requests.get(f"{BASE_URL}/api/courses/data-structures")
        course_id = course_res.json()["id"]
        
        unique_id = str(uuid.uuid4())[:8]
        response = requests.post(
            f"{BASE_URL}/api/forums?course_id={course_id}&title=TEST_Forum_{unique_id}&description=Test forum",
            headers={"Authorization": f"Bearer {instructor_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert f"TEST_Forum_{unique_id}" in data["title"]
    
    def test_create_post_without_auth(self):
        response = requests.post(
            f"{BASE_URL}/api/forums/posts",
            json={
                "forum_id": "test",
                "title": "Test Post",
                "content": "Test content"
            }
        )
        assert response.status_code in [401, 403]


class TestNotifications:
    """Notification tests"""
    
    @pytest.fixture
    def instructor_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        return response.json()["access_token"]
    
    def test_get_notifications_with_auth(self, instructor_token):
        response = requests.get(
            f"{BASE_URL}/api/notifications",
            headers={"Authorization": f"Bearer {instructor_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_notifications_without_auth(self):
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code in [401, 403]
    
    def test_get_unread_count(self, instructor_token):
        response = requests.get(
            f"{BASE_URL}/api/notifications/count",
            headers={"Authorization": f"Bearer {instructor_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "unread_count" in data


class TestAnnouncements:
    """Announcement tests"""
    
    @pytest.fixture
    def instructor_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json=INSTRUCTOR_CREDS)
        return response.json()["access_token"]
    
    def test_get_announcements(self):
        response = requests.get(f"{BASE_URL}/api/forums/announcements")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_announcement_as_instructor(self, instructor_token):
        unique_id = str(uuid.uuid4())[:8]
        # Announcement endpoint uses query params for title and message
        response = requests.post(
            f"{BASE_URL}/api/forums/announcements?title=TEST_Announcement_{unique_id}&message=Test announcement message",
            headers={"Authorization": f"Bearer {instructor_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
