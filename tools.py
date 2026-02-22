from server import Habits, JournalEntry, db
from sqlalchemy import func

def get_habit_summary(user_id):
    total = Habits.query.filter_by(user_id=user_id).count()

    completed = Habits.query.filter_by(
        user_id=user_id,
        completed=True
    ).count()

    if total == 0:
        return "No habits found for this user."

    completion_rate = (completed / total) * 100

    return (
        f"You have {total} total habits.\n"
        f"{completed} completed.\n"
        f"Completion rate: {completion_rate:.1f}%"
    )

def get_mood_trend(user_id):
    # Replace later with real DB query
    return "Your mood has been improving over the last 7 days."

def search_habits(query, user_id):
    habits = Habits.query.filter(
        Habits.user_id == user_id,
        Habits.name.ilike(f"%{query}%")
    ).all()

    if not habits:
        return "No matching habits found."

    return "\n".join([h.name for h in habits])