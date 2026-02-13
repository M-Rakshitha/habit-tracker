import { useState } from "react";

function Journal() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:50100/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await response.json();

      if (response.ok) {
        setMood(data.sentiment);
        setContent("");
      } else {
        alert(data.error || "Something went wrong");
      }

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const getEmoji = (sentiment) => {
    if (sentiment === "positive");
    if (sentiment === "negative");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-3">Journal Entry</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border p-2 rounded mb-3"
          rows="4"
          placeholder="How are you feeling today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </form>

      {mood && (
        <div className="mt-4 text-lg">
          Your day:{" "}
          <span className="font-semibold capitalize">
            {mood} {getEmoji(mood)}
          </span>
        </div>
      )}
    </div>
  );
}

export default Journal;
