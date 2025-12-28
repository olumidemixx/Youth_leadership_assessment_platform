"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const [role, setRole] = useState<"admin" | "feedback" | "user" | "">("");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === "abc123") {
      router.push("/admin");
    } else {
      setMessage("Wrong");
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === "123abc") {
      router.push("/feedback");
    } else {
      setMessage("Wrong");
    }
  };

  const handleUserClick = async () => {
    const res = await fetch("/api/auth/user", { method: "POST" });
    const result = await res.json();
    if (result.success) {
      router.push("/profiles");
    } else {
      setMessage("Error accessing User page");
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold">Choose Role</h1>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setRole("admin");
            setInput("");
            setMessage("");
          }}
          className="bg-purple-500 text-white p-2 rounded"
        >
          Admin
        </button>

        <button
          onClick={() => {
            setRole("feedback");
            setInput("");
            setMessage("");
          }}
          className="bg-green-500 text-white p-2 rounded"
        >
          Feedback Receiver
        </button>

        <button
          onClick={handleUserClick}
          className="bg-blue-500 text-white p-2 rounded"
        >
          User
        </button>
      </div>

      {role === "admin" && (
        <form onSubmit={handleAdminSubmit} className="flex flex-col gap-2">
          <textarea
            placeholder="Enter admin code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-purple-500 text-white p-2 rounded"
          >
            Submit
          </button>
        </form>
      )}

      {role === "feedback" && (
        <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-2">
          <textarea
            placeholder="Enter feedback receiver code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded"
          >
            Submit
          </button>
        </form>
      )}

      {message && <p className="text-sm font-semibold mt-2">{message}</p>}
    </div>
  );
}
