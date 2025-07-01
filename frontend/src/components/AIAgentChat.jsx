import React, { useState } from "react";
import axios from "axios";

const AIAgentChat = () => {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/ai/search", {
        prompt: input,
      });

      const parsed = res.data;
      const token = localStorage.getItem("access_token");

      if (parsed.intent === "search") {
        const jobRes = await axios.get("http://localhost:5000/api/jobs", {
          params: {
            keyword: parsed.keyword,
            city: parsed.city,
          },
        });

        const jobs = jobRes.data;

        if (jobs.length === 0) {
          setMessages((prev) => [...prev, { from: "ai", text: "No jobs found 😢" }]);
        } else {
          const jobTexts = jobs.slice(0, 3).map((job, i) => {
            return `${i + 1}. ${job.title} – ${job.city} – ${job.company}\n📝 ${job.description.slice(0, 80)}...\n[Apply ${job._id}]`;
          });

          setMessages((prev) => [
            ...prev,
            { from: "ai", text: `Here are some jobs I found:\n\n${jobTexts.join("\n\n")}` },
          ]);
        }

      } else if (parsed.intent === "apply") {
        if (!token) {
          setMessages((prev) => [
            ...prev,
            { from: "ai", text: "⚠️ You must be logged in to apply. Please log in first." },
          ]);
          return;
        }

        await axios.post(
          `http://localhost:5000/api/apply/${parsed.job_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "✅ Application successful!" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "ai", text: "🤔 Sorry, I couldn't understand your request." },
        ]);
      }
    } catch (err) {
      console.error("AI Agent error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ An error occurred. Please try again later." },
      ]);
    }
  };

  return (
    <div
      style={{
        width: 300,
        height: 400,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ padding: "1rem", flex: 1, overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === "ai" ? "left" : "right",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor: msg.from === "ai" ? "#f3f4f6" : "#4f46e5",
                color: msg.from === "ai" ? "#000" : "#fff",
                padding: "0.5rem 1rem",
                borderRadius: 20,
                maxWidth: "80%",
                whiteSpace: "pre-line",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #eee" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "none",
            outline: "none",
            borderRadius: 0,
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "0.75rem",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIAgentChat;
