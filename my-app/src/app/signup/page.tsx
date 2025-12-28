"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      alert("Signup successful! Please sign in.");
      router.push("/signin"); // 🚀 redirect to signin
    } else {
      alert("Signup failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Sign Up</h1>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded"/>
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} className="border p-2 rounded"/>
      <button className="bg-blue-500 text-white p-2 rounded">Sign Up</button>
    </form>
  );
}
