from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from sqlalchemy.orm import Session

import os
import json
import time

from database import engine, Base, get_db
from models import Meeting, ActionItem
from email_service import send_email
from reminder_service import check_and_send_reminders


app = FastAPI()


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# DATABASE
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# GEMINI
# ==========================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ==========================================
# OWNER EMAIL MAPPING
# ==========================================

OWNER_EMAILS = {
    "Ravi": "shribharathis17@gmail.com",
    "Priya": "shribharathis17@gmail.com",
    "Arjun": "shribharathis17@gmail.com"
}


# ==========================================
# REQUEST MODEL
# ==========================================

class TranscriptLine(BaseModel):
    n: int
    speaker: str
    text: str


class TranscriptRequest(BaseModel):
    text: str | None = None
    meeting_id: str | None = None
    date: str | None = None
    lines: list[TranscriptLine] | None = None


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Meeting Tracker Backend is running"
    }


# ==========================================
# EXTRACT MEETING INFORMATION
# ==========================================

@app.post("/extract")
def extract(
    request: TranscriptRequest,
    db: Session = Depends(get_db)
):

    try:

        # --------------------------------------
        # 1. BUILD TRANSCRIPT
        # --------------------------------------

        if request.lines:

            transcript = "\n".join(
                f"{line.speaker}: {line.text}"
                if line.speaker
                else line.text
                for line in request.lines
            )

        elif request.text:

            transcript = request.text

        else:

            raise ValueError(
                "No transcript text received."
            )


        # --------------------------------------
        # 2. GEMINI PROMPT
        # --------------------------------------

        prompt = f"""
You are a meeting accountability assistant.

Read this meeting transcript:

{transcript}

Extract ONLY information actually present in the transcript.

Return ONLY valid JSON in this exact format:

{{
    "action_items": [
        {{
            "task": "task description",
            "owner": "person name or null",
            "deadline": "deadline or null",
            "source": "exact transcript sentence"
        }}
    ],
    "decisions": [],
    "unresolved_questions": []
}}

Rules:

- Do not invent information.
- If there is no owner, use null.
- If there is no deadline, use null.
- Keep the source sentence from the transcript.
- Return JSON only.
"""


        # --------------------------------------
        # 3. CALL GEMINI
        # --------------------------------------

        response = None

        for attempt in range(3):

            try:

                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt
                )

                break

            except Exception as e:

                print(
                    f"Gemini attempt {attempt + 1} failed:",
                    repr(e)
                )

                if attempt == 2:
                    raise e

                time.sleep(3)


        # --------------------------------------
        # 4. PROCESS GEMINI RESPONSE
        # --------------------------------------

        result_text = response.text.strip()

        result_text = result_text.replace(
            "```json",
            ""
        )

        result_text = result_text.replace(
            "```",
            ""
        )

        result_text = result_text.strip()

        result = json.loads(result_text)


        # --------------------------------------
        # 5. SAVE MEETING
        # --------------------------------------

        meeting = Meeting(
            transcript=transcript
        )

        db.add(meeting)

        db.commit()

        db.refresh(meeting)


        # --------------------------------------
        # 6. SAVE ACTION ITEMS
        # --------------------------------------

        for item in result.get("action_items", []):

            owner = item.get("owner")

            owner_email = None

            if owner:
                owner_email = OWNER_EMAILS.get(
                    owner.strip()
                )


            action_item = ActionItem(

                meeting_id=meeting.id,

                task=item.get("task"),

                owner=owner,

                owner_email=owner_email,

                deadline=item.get("deadline"),

                status="New",

                source=item.get("source")

            )

            db.add(action_item)


            # ----------------------------------
            # SEND ASSIGNMENT EMAIL
            # ----------------------------------

            if owner_email:

                subject = (
                    f"Action Item Assigned - "
                    f"{item.get('task')}"
                )

                body = f"""
Hi {owner},

You have been assigned a new action item from a meeting.

Task:
{item.get('task')}

Deadline:
{item.get('deadline') or 'Not specified'}

Source:
{item.get('source')}

Please complete the task before the deadline.

- MeTrack
"""

                try:

                    send_email(
                        to_email=owner_email,
                        subject=subject,
                        body=body
                    )

                    print(
                        f"Email sent to {owner_email}"
                    )

                except Exception as email_error:

                    print(
                        "Email failed:",
                        repr(email_error)
                    )


        db.commit()


        # --------------------------------------
        # 7. RETURN RESULT
        # --------------------------------------

        return {

            "message":
                "Meeting processed successfully",

            "meeting_id":
                meeting.id,

            # IMPORTANT:
            # result is returned directly
            # for the frontend

            "action_items":
                result.get("action_items", []),

            "decisions":
                result.get("decisions", []),

            "unresolved_questions":
                result.get(
                    "unresolved_questions",
                    []
                )
        }


    except Exception as e:

        db.rollback()

        print(
            "ERROR:",
            repr(e)
        )

        return {

            "error":
                str(e)

        }


# ==========================================
# DEADLINE REMINDER
# ==========================================

@app.post("/check-reminders")
def check_reminders(
    db: Session = Depends(get_db)
):

    try:

        reminders = check_and_send_reminders(db)

        return {

            "message":
                "Reminder check completed",

            "reminders_sent":
                reminders

        }

    except Exception as e:

        db.rollback()

        print(
            "REMINDER ERROR:",
            repr(e)
        )

        return {

            "error":
                str(e)

        }