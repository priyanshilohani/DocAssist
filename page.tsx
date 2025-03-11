"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Ensure CORS cookies are allowed
      });

      const data = await response.json();
      console.log("🔹 Server Response:", data); // Debugging

      if (response.ok) {
        if (data.access_token) {
          console.log("✅ Access Token Received:", data.access_token);

          // ✅ Store tokens in a consistent key
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("refreshToken", data.refresh_token);

          console.log("🔹 Saved Token in Local Storage:", localStorage.getItem("token"));

          // ✅ Alert user when login is successful
          alert("✅ Login successful! Token stored locally.");

          // ✅ Redirect after a short delay
          setTimeout(() => {
            router.push("/loggedin");
          }, 700);
        } else {
          alert("⚠️ Login successful, but no token received!");
        }
      } else {
        alert(data.error || "❌ Login failed.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
