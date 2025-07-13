"use client";

import { useState } from "react";
import { Input } from "../../../collabcanvas-frontend/ui/src/Input";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${HTTP_BACKEND}/signin`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      toast.success("Signed in successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Signin failed. Please check credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-400">
          Welcome Back
        </h2>
        <p className="text-center text-gray-300">
          Sign in to continue to CollabCanvas
        </p>

        <Input
          type="text"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignin}
          disabled={loading}
          className={`mt-4 w-full ${
            loading ? "bg-purple-600/60 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-600"
          } text-white font-semibold py-2 px-4 rounded-md transition duration-300`}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
