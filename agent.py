# agent.py
# Task 9.3: Wire tools to LangChain Agent

import os
from dotenv import load_dotenv

from langgraph.prebuilt import create_react_agent
from langchain_mistralai import ChatMistralAI
from langchain_core.tools import tool

load_dotenv()

llm = ChatMistralAI(
    model="mistral-small-latest",
    temperature=0.3,
    mistral_api_key=os.getenv("MISTRAL_API_KEY"),
)

def run_agent(question: str, habit_data: str, mood_data: str):

    @tool
    def get_habit_summary_tool(query: str) -> str:
        """Get the user's habit completion statistics for the current week.
        Call this when the user asks how they are doing, about habits, streaks, or progress."""
        return habit_data

    @tool
    def get_mood_trend_tool(query: str) -> str:
        """Get the user's mood trend from journal entries for the current week.
        Call this when the user asks about mood, feelings, or emotional wellbeing."""
        return mood_data

    agent = create_react_agent(llm, [get_habit_summary_tool, get_mood_trend_tool])

    response = agent.invoke(
        {"messages": [{"role": "user", "content": question}]}
    )

    return {"output": response["messages"][-1].content}


# ── Direct test ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    from server import app as flask_app
    from test_tools import get_habit_summary, get_mood_trend

    with flask_app.app_context():
        habit_data = str(get_habit_summary(user_id=1))
        mood_data  = str(get_mood_trend(user_id=1))

    result = run_agent(
        question="How am I doing this week?",
        habit_data=habit_data,
        mood_data=mood_data
    )
    print("\nFinal Answer:")
    print(result["output"])