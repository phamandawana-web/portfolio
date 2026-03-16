"""
Email Service for LMS Notifications
Supports SMTP (Gmail/other providers)
"""
import os
import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Email configuration from environment
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'LMS Platform')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', SMTP_USER)
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')


def is_email_configured() -> bool:
    """Check if email is properly configured"""
    return bool(SMTP_USER and SMTP_PASSWORD)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """Send an email using SMTP"""
    if not is_email_configured():
        logger.warning(f"Email not configured. Would send to {to_email}: {subject}")
        return False
    
    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add text and HTML parts
        if text_content:
            message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))
        
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


# ============ EMAIL TEMPLATES ============

def get_base_template(content: str, title: str) -> str:
    """Base HTML template for all emails"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .card {{ background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
            .header {{ text-align: center; margin-bottom: 24px; }}
            .logo {{ width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }}
            h1 {{ color: #18181b; margin: 16px 0 8px; font-size: 24px; }}
            p {{ color: #52525b; line-height: 1.6; margin: 16px 0; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }}
            .footer {{ text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 32px; }}
            .highlight {{ background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0; }}
            code {{ background: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-family: monospace; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="card">
                <div class="header">
                    <div class="logo">LMS</div>
                </div>
                {content}
            </div>
            <div class="footer">
                <p>© {datetime.now().year} LMS Platform. All rights reserved.</p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """


async def send_account_pending_email(to_email: str, username: str) -> bool:
    """Send email when account is created and pending approval"""
    content = f"""
        <h1>Account Created Successfully</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your account has been created successfully. However, it requires administrator approval before you can access the Learning Management System.</p>
        <div class="highlight">
            <p><strong>Username:</strong> <code>{username}</code></p>
            <p><strong>Status:</strong> Pending Approval</p>
        </div>
        <p>You will receive another email once your account has been approved by an administrator.</p>
        <p>Thank you for your patience!</p>
    """
    return await send_email(
        to_email,
        "Account Created - Pending Approval",
        get_base_template(content, "Account Pending")
    )


async def send_account_approved_email(to_email: str, username: str) -> bool:
    """Send email when account is approved"""
    content = f"""
        <h1>Account Approved! 🎉</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Great news! Your account has been approved by an administrator. You can now access the Learning Management System.</p>
        <a href="{FRONTEND_URL}/coursework/login" class="button">Login to LMS</a>
        <p>Start exploring courses, take quizzes, and participate in discussions!</p>
    """
    return await send_email(
        to_email,
        "Account Approved - Welcome to LMS!",
        get_base_template(content, "Account Approved")
    )


async def send_account_rejected_email(to_email: str, username: str, reason: Optional[str] = None) -> bool:
    """Send email when account is rejected"""
    reason_text = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
    content = f"""
        <h1>Account Application Update</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Unfortunately, your account application has not been approved at this time.</p>
        {reason_text}
        <p>If you believe this is an error or have questions, please contact the administrator.</p>
    """
    return await send_email(
        to_email,
        "Account Application - Not Approved",
        get_base_template(content, "Account Not Approved")
    )


async def send_password_reset_email(to_email: str, username: str, reset_token: str) -> bool:
    """Send password reset email with token"""
    reset_url = f"{FRONTEND_URL}/coursework/reset-password?token={reset_token}"
    content = f"""
        <h1>Password Reset Request</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="{reset_url}" class="button">Reset Password</a>
        <p>This link will expire in 1 hour for security reasons.</p>
        <div class="highlight">
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
    """
    return await send_email(
        to_email,
        "Password Reset Request",
        get_base_template(content, "Password Reset")
    )


async def send_password_changed_email(to_email: str, username: str) -> bool:
    """Send confirmation when password is changed"""
    content = f"""
        <h1>Password Changed Successfully</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p>Your password has been changed successfully.</p>
        <p>If you did not make this change, please contact the administrator immediately.</p>
    """
    return await send_email(
        to_email,
        "Password Changed",
        get_base_template(content, "Password Changed")
    )


async def send_quiz_available_email(
    to_email: str, 
    username: str, 
    quiz_title: str, 
    course_title: str,
    course_slug: str,
    topic_slug: Optional[str] = None
) -> bool:
    """Send email when new quiz is available"""
    quiz_url = f"{FRONTEND_URL}/coursework/{course_slug}"
    if topic_slug:
        quiz_url += f"/{topic_slug}"
    quiz_url += "/quizzes"
    
    content = f"""
        <h1>New Quiz Available! 📝</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p>A new quiz is now available for you:</p>
        <div class="highlight">
            <p><strong>Quiz:</strong> {quiz_title}</p>
            <p><strong>Course:</strong> {course_title}</p>
        </div>
        <a href="{quiz_url}" class="button">Take Quiz</a>
        <p>Good luck!</p>
    """
    return await send_email(
        to_email,
        f"New Quiz Available: {quiz_title}",
        get_base_template(content, "New Quiz")
    )


async def send_announcement_email(
    to_email: str,
    username: str,
    title: str,
    message: str,
    course_title: Optional[str] = None
) -> bool:
    """Send announcement email to students"""
    course_info = f"<p><strong>Course:</strong> {course_title}</p>" if course_title else ""
    content = f"""
        <h1>📢 Announcement</h1>
        <p>Hello <strong>{username}</strong>,</p>
        {course_info}
        <div class="highlight">
            <h2 style="margin-top: 0; color: #18181b;">{title}</h2>
            <p>{message}</p>
        </div>
        <a href="{FRONTEND_URL}/coursework" class="button">Go to LMS</a>
    """
    return await send_email(
        to_email,
        f"Announcement: {title}",
        get_base_template(content, "Announcement")
    )


async def send_forum_reply_notification(
    to_email: str,
    username: str,
    post_title: str,
    replier_name: str,
    forum_url: str
) -> bool:
    """Send notification when someone replies to a forum post"""
    content = f"""
        <h1>New Reply to Your Post</h1>
        <p>Hello <strong>{username}</strong>,</p>
        <p><strong>{replier_name}</strong> has replied to your discussion post:</p>
        <div class="highlight">
            <p><strong>Topic:</strong> {post_title}</p>
        </div>
        <a href="{FRONTEND_URL}{forum_url}" class="button">View Discussion</a>
    """
    return await send_email(
        to_email,
        f"New Reply: {post_title}",
        get_base_template(content, "New Reply")
    )
