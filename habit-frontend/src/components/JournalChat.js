import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function Calendar({ entries, selectedDate, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const entryDates = new Set(entries.map((e) => e.date));

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-gray-400 hover:text-gray-700 transition text-xl px-1"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="text-gray-400 hover:text-gray-700 transition text-xl px-1"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const hasEntry = entryDates.has(dateStr);
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear();
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`
                relative mx-auto w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center
                ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : isToday
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {day}
              {hasEntry && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function JournalPanel() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const token = localStorage.getItem("token");

  const fetchEntries = () => {
    fetch("http://localhost:50100/journal", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => (Array.isArray(data) ? setEntries(data) : null))
      .catch(() => {});
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:50100/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setMood({ label: data.sentiment, score: data.confidence });
        setContent("");
        fetchEntries();
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const moodConfig = {
    positive: {
      emoji: "😊",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
    },
    negative: {
      emoji: "😔",
      color: "text-red-500",
      bg: "bg-red-50 border-red-200",
    },
    neutral: {
      emoji: "😐",
      color: "text-yellow-600",
      bg: "bg-yellow-50 border-yellow-200",
    },
  };

  const filteredEntries = selectedDate
    ? entries.filter((e) => e.date === selectedDate)
    : [];

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pr-1">
      {/* Write Entry */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📝</span> Today's Entry
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            rows={4}
            placeholder="How are you feeling today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="self-end bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl shadow transition"
          >
            {loading ? "Analyzing..." : "Submit"}
          </button>
        </form>

        {mood && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              moodConfig[mood.label]?.bg || "bg-gray-50 border-gray-200"
            }`}
          >
            <span className="text-xl">
              {moodConfig[mood.label]?.emoji || "🤔"}
            </span>
            <span className={moodConfig[mood.label]?.color || "text-gray-600"}>
              Mood detected:{" "}
              <span className="capitalize font-semibold">{mood.label}</span>
              <span className="text-gray-400 font-normal ml-2">
                ({(mood.score * 100).toFixed(0)}% confidence)
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Calendar */}
      <Calendar
        entries={entries}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Entries for selected date */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">
              Entries for {selectedDate}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              ✕ Clear
            </button>
          </div>
          {filteredEntries.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No entries for this date.
            </p>
          ) : (
            filteredEntries.map((e) => (
              <div
                key={e.id}
                className="mb-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
              >
                <p className="text-sm text-gray-700">{e.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400 capitalize">
                    {moodConfig[e.sentiment_label]?.emoji} {e.sentiment_label}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Ask me about your habits or mood this week 👋",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:50100/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }
    setLoading(false);
  };

  const suggestions = [
    "How am I doing this week?",
    "What's my mood trend?",
    "Which habits did I miss?",
  ];

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 200px)" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
          <span>🤖</span> Habit Assistant
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Ask anything about your habits & mood
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">
                🤖
              </div>
            )}
            <div
              className={`
              max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm
              ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm"
              }
            `}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-1 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 space-y-0.5">{children}</ul>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs flex-shrink-0">
              🤖
            </div>
            <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions — only shown at the start */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2 flex-shrink-0">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs border border-blue-200 text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-full transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="px-4 py-3 border-t border-gray-100 flex gap-3 flex-shrink-0"
      >
        <input
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your habits..."
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm transition shadow"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function JournalChatPage({ setIsLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 transition"
          >
            ← Habits
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-blue-500">
            Journal & Assistant
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }}
          className="text-sm text-red-500 hover:text-red-700 transition"
        >
          Logout
        </button>
      </nav>

      {/* Page title */}
      <div className="px-10 pt-8 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Journal & Assistant
        </h1>
        <p className="text-gray-500 text-sm mt-1 italic">
          Reflect on your day. Ask your AI coach anything.
        </p>
      </div>

      {/* Two column layout */}
      <div className="px-10 pb-10 grid grid-cols-2 gap-8">
        <JournalPanel />
        <ChatPanel />
      </div>
    </div>
  );
}
