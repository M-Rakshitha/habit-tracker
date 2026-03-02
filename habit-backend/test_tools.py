from datetime import date, timedelta
from server import db, Habits, JournalEntry
from vector_service import search_habits as vector_search


def get_habit_summary(user_id: int) -> dict:
    today = date.today()
    week_ago = today - timedelta(days=7)

    habits = Habits.query.filter(
        Habits.user_id == user_id,
        Habits.habit_date >= week_ago
    ).all()

    total = len(habits)
    completed = sum(1 for h in habits if h.completed)
    rate = round((completed / total) * 100, 1) if total > 0 else 0

    return {
        "total_habits": total,
        "completed": completed,
        "incomplete": total - completed,
        "completion_rate": f"{rate}%",
        "habits": [
            {"name": h.name, "completed": h.completed, "date": str(h.habit_date)}
            for h in habits
        ]
    }


def get_mood_trend(user_id: int) -> dict:
    today = date.today()
    week_ago = today - timedelta(days=7)

    entries = JournalEntry.query.filter(
        JournalEntry.user_id == user_id,
        JournalEntry.date >= week_ago
    ).order_by(JournalEntry.date.asc()).all()

    if not entries:
        return {"message": "No journal entries found for this week.", "entries": []}

    avg_score = sum(e.mood_score for e in entries if e.mood_score is not None) / len(entries)
    trend = "positive" if avg_score >= 0.6 else "neutral" if avg_score >= 0.4 else "negative"

    return {
        "average_mood_score": round(avg_score, 3),
        "trend": trend,
        "total_entries": len(entries),
        "entries": [{"date": str(e.date), "mood_score": e.mood_score} for e in entries]
    }


def search_habits(query: str, user_id: int) -> dict:
    results = vector_search(query, user_id)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    return {
        "query": query,
        "matches": [{"name": doc, "metadata": meta} for doc, meta in zip(documents, metadatas)]
    }


# ── Run this file directly to test ───────────────────────────────────────────
if __name__ == "__main__":
    from server import app

    with app.app_context():
        print("=== Habit Summary ===")
        print(get_habit_summary(user_id=1))

        print("\n=== Mood Trend ===")
        print(get_mood_trend(user_id=1))

        print("\n=== Search Habits ===")
        print(search_habits("read", user_id=1))