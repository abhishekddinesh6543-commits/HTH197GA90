from datetime import datetime, timedelta

from email_service import send_email
from models import ActionItem


def get_next_weekday(day_name):

    today = datetime.now().date()

    weekdays = {
        "monday": 0,
        "tuesday": 1,
        "wednesday": 2,
        "thursday": 3,
        "friday": 4,
        "saturday": 5,
        "sunday": 6
    }

    day_name = day_name.lower().strip()

    if day_name not in weekdays:
        return None

    target_day = weekdays[day_name]

    days_ahead = target_day - today.weekday()

    if days_ahead < 0:
        days_ahead += 7

    return today + timedelta(days=days_ahead)


def check_and_send_reminders(db):

    action_items = db.query(ActionItem).filter(
        ActionItem.reminder_sent == 0
    ).all()

    reminders_sent = []

    today = datetime.now().date()

    for item in action_items:

        if not item.deadline:
            continue

        deadline_date = get_next_weekday(item.deadline)

        if not deadline_date:
            continue

        days_remaining = (deadline_date - today).days

        # Send reminder when deadline is today or tomorrow
        if days_remaining <= 1:

            if item.owner_email:

                subject = f"Deadline Reminder - {item.task}"

                if days_remaining == 0:
                    timing = "today"
                else:
                    timing = "tomorrow"

                body = f"""
Hi {item.owner},

This is a reminder about your pending action item.

Task:
{item.task}

Deadline:
{item.deadline}

This task is due {timing}.

Please complete it before the deadline.

- Meeting Tracker
"""

                send_email(
                    to_email=item.owner_email,
                    subject=subject,
                    body=body
                )

                item.reminder_sent = 1

                reminders_sent.append({
                    "task": item.task,
                    "owner": item.owner,
                    "deadline": item.deadline
                })

    db.commit()

    return reminders_sent