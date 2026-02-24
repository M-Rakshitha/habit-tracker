# agent.py
# Task 9.3: Wire tools to LangChain Agent

import os
from dotenv import load_dotenv

from langgraph.prebuilt import create_react_agent
from langchain_mistralai import ChatMistralAI
from langchain_core.tools import tool

from test_tools import get_habit_summary, get_mood_trend, search_habits
from server import app   # ← Flask app for DB context

load_dotenv()

llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0.3,
    mistral_api_key=os.getenv("MISTRAL_API_KEY"),
)

# ── Tools ─────────────────────────────────────────────────────────────────────
@tool
def get_habit_summary_tool(query: str) -> str:
    """Get the user's habit completion statistics for the current week.
    Call this when the user asks how they are doing, about habits, streaks, or progress."""
    with app.app_context():
        result = get_habit_summary(user_id=1)
        return str(result)

@tool
def get_mood_trend_tool(query: str) -> str:
    """Get the user's mood trend from journal entries for the current week.
    Call this when the user asks about mood, feelings, or emotional wellbeing."""
    with app.app_context():
        result = get_mood_trend(user_id=1)
        return str(result)

@tool
def search_habits_tool(query: str) -> str:
    """Search through the user's habits by name or keyword."""
    with app.app_context():
        result = search_habits(query=query, user_id=1)
        return str(result)

# ── Agent ─────────────────────────────────────────────────────────────────────
agent = create_react_agent(llm, [get_habit_summary_tool, get_mood_trend_tool, search_habits_tool])

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    with app.app_context():
        response = agent.invoke(
            {"messages": [{"role": "user", "content": "How am I doing this week?"}]}
        )
        print("\nFinal Answer:")
        print(response["messages"][-1].content)