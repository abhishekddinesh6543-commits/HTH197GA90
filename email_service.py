import os
import smtplib
from email.message import EmailMessage


def send_email(to_email, subject, body):

    sender_email = os.getenv("EMAIL_ADDRESS")
    app_password = os.getenv("EMAIL_APP_PASSWORD")

    if not sender_email or not app_password:
        raise Exception("Email credentials are not configured.")

    message = EmailMessage()

    message["From"] = sender_email
    message["To"] = to_email
    message["Subject"] = subject

    message.set_content(body)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:

        server.starttls()

        server.login(
            sender_email,
            app_password
        )

        server.send_message(message)

    return True