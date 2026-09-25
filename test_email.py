from email_service import send_email


send_email(
    to_email="shribharathis17@gmail.com",
    subject="Meeting Tracker Test",
    body="""Hello!

This is a test email from the Meeting Tracker backend.

If you received this email, automatic email sending is working.

- Meeting Tracker
"""
)

print("EMAIL SENT SUCCESSFULLY")