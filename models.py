from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from database import Base


class Meeting(Base):

    __tablename__ = "meetings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transcript = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer)
    task = Column(Text)
    owner = Column(String)
    owner_email = Column(String)
    deadline = Column(String)
    status = Column(String, default="Pending")
    source = Column(Text)
    reminder_sent = Column(Integer, default=0)
