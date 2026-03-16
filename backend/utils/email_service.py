import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Gmail SMTP settings
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')  # App password for Gmail
FROM_EMAIL = os.environ.get('FROM_EMAIL', SMTP_USER)
SITE_URL = os.environ.get('SITE_URL', 'http://localhost:3000')

def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """Send an email using Gmail SMTP"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("Email not configured. Skipping email send.")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        
        # Add text and HTML parts
        if text_content:
            msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Connect and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())
        
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

def send_welcome_email(to_email: str, username: str) -> bool:
    """Send welcome email to new user"""
    subject = "Welcome to the LMS - Account Pending Approval"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to the LMS!</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
            <p>Hello <strong>{username}</strong>,</p>
            <p>Thank you for registering! Your account is currently pending approval by an administrator.</p>
            <p>You will receive another email once your account has been approved and you can start accessing the courses.</p>
            <p style="margin-top: 30px;">Best regards,<br>The LMS Team</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)

def send_account_approved_email(to_email: str, username: str) -> bool:
    """Send email when account is approved"""
    subject = "Your LMS Account Has Been Approved!"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Account Approved!</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
            <p>Hello <strong>{username}</strong>,</p>
            <p>Great news! Your account has been approved. You can now log in and access all available courses.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{SITE_URL}/coursework/login" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Login Now</a>
            </p>
            <p>Best regards,<br>The LMS Team</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)

def send_account_rejected_email(to_email: str, username: str) -> bool:
    """Send email when account is rejected"""
    subject = "LMS Account Application Update"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #64748b; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Account Update</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
            <p>Hello <strong>{username}</strong>,</p>
            <p>We regret to inform you that your account application was not approved at this time.</p>
            <p>If you believe this was a mistake, please contact the administrator.</p>
            <p>Best regards,<br>The LMS Team</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)

def send_password_reset_email(to_email: str, username: str, reset_token: str) -> bool:
    """Send password reset email"""
    reset_link = f"{SITE_URL}/coursework/reset-password?token={reset_token}"
    subject = "Password Reset Request"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
            <p>Hello <strong>{username}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The LMS Team</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)

def send_quiz_available_email(to_email: str, username: str, quiz_title: str, course_title: str) -> bool:
    """Send email when new quiz is available"""
    subject = f"New Quiz Available: {quiz_title}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Quiz Available!</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
            <p>Hello <strong>{username}</strong>,</p>
            <p>A new quiz is now available in <strong>{course_title}</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
                <h3 style="margin: 0; color: #1e293b;">{quiz_title}</h3>
            </div>
            <p style="text-align: center;">
                <a href="{SITE_URL}/coursework" style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Take Quiz</a>
            </p>
            <p>Best regards,<br>The LMS Team</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)

def send_announcement_email(to_email: str, username: str, title: str, message: str) -> bool:
    """Send announcement email"""
    subject = f"Announcement: {title}"
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">📢 Announcement</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc;">
            <p>Hello <strong>{username}</strong>,</p>
            <h2 style="color: #1e293b;">{title}</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                {message}
            </div>
            <p>Best regards,<br>The LMS Team</p>
        </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html)
