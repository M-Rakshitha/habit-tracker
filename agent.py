import os
from dotenv import load_dotenv

from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEndpoint

from server import app
from test_tools import get_habit_summary, get_mood_trend, search_habits

load_dotenv()

# ── 1. Wrap your functions as LangChain Tools ────────────────────────────────

def habit_summary_tool(input: str = "") -> str:
    """Tool wrapper — always runs for user_id=1 (swap for real auth later)."""
    with app.app_context():
        result = get_habit_summary(user_id=1)
        total    = result["total_habits"]
        done     = result["completed"]
        rate     = result["completion_rate"]
        habits   = result["habits"]

        lines = [f"- {h['name']} ({'✅' if h['completed'] else '❌'}) on {h['date']}" for h in habits]
        habits_str = "\n".join(lines) if lines else "No habits found."

        return (
            f"This week you have {total} habits tracked.\n"
            f"Completed: {done} ({rate} completion rate).\n\n"
            f"Habit breakdown:\n{habits_str}"
        )


def mood_trend_tool(input: str = "") -> str:
    """Tool wrapper for mood trend."""
    with app.app_context():
        result = get_mood_trend(user_id=1)

        if "message" in result:
            return result["message"]

        return (
            f"Over the past week you wrote {result['total_entries']} journal entries.\n"
            f"Your average mood score is {result['average_mood_score']} "
            f"— overall trend: {result['trend'].upper()}."
        )


def search_habits_tool(query: str) -> str:
    """Tool wrapper for semantic habit search."""
    with app.app_context():
        result = search_habits(query, user_id=1)
        matches = result["matches"]

        if not matches:
            return f"No habits found matching '{query}'."

        names = [m["name"] for m in matches]
        return f"Habits related to '{query}': {', '.join(names)}"


tools = [
    Tool(
        name="get_habit_summary",
        func=habit_summary_tool,
        description=(
            "Use this to get the user's habit summary for the past week. "
            "Shows total habits, completion rate, and individual habit statuses. "
            "Call this when the user asks how they are doing, their progress, or weekly habits."
        ),
    ),
    Tool(
        name="get_mood_trend",
        func=mood_trend_tool,
        description=(
            "Use this to get the user's mood trend from their journal entries over the past week. "
            "Call this when the user asks about their mood, feelings, or emotional state."
        ),
    ),
    Tool(
        name="search_habits",
        func=search_habits_tool,
        description=(
            "Use this to search for specific habits by keyword or topic. "
            "Input should be a short search term like 'exercise' or 'reading'. "
            "Call this when the user asks about a specific habit by name or topic."
        ),
    ),
]

# ── 2. Set up the LLM ────────────────────────────────────────────────────────

llm = HuggingFaceEndpoint(
    repo_id="mistralai/Mistral-7B-Instruct-v0.2",
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
    max_new_tokens=512,
    temperature=0.3,
)

# ── 3. ReAct prompt ──────────────────────────────────────────────────────────

REACT_TEMPLATE = """You are a helpful habit-tracking assistant. 
Answer the user's question using the tools available to you.

You have access to these tools:
{tools}

Use this format EXACTLY:

Question: the input question you must answer
Thought: think about what tool to use
Action: the action to take, must be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (repeat Thought/Action/Action Input/Observation as needed)
Thought: I now know the final answer
Final Answer: the final answer to the original question

Begin!

Question: {input}
Thought:{agent_scratchpad}"""

prompt = PromptTemplate.from_template(REACT_TEMPLATE)

# ── 4. Build the agent ───────────────────────────────────────────────────────

agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,          # prints Thought → Action → Observation chain
    handle_parsing_errors=True,
    max_iterations=5,
)

# ── 5. Run it ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Habit Tracker AI Agent 🤖  (type 'quit' to exit)\n")

    questions = [
        "How am I doing this week?",
        "What's my mood been like lately?",
        "Do I have any habits related to reading?",
    ]

    for q in questions:
        print(f"\n{'='*50}")
        print(f"User: {q}")
        response = agent_executor.invoke({"input": q})
        print(f"\nAgent: {response['output']}")