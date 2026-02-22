from server import app
from tools import get_habit_summary, get_mood_trend, search_habits

with app.app_context():
    print("=== Habit Summary ===")
    print(get_habit_summary(user_id=1))

    print("\n=== Mood Trend ===")
    print(get_mood_trend(user_id=1))

    print("\n=== Search Habits ===")
    print(search_habits("read", user_id=1))