"use client";

import { Input } from "@ui/Input";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (isSignin) {
        const res = await axios.post(`${HTTP_BACKEND}/signin`, {
          email,
          password,
        });

        localStorage.setItem("token", res.data.token);
        alert("Signed in successfully!");
        router.push("/canvas");
      } else {
         await axios.post(`${HTTP_BACKEND}/signup`, {
          name,
          email,
          password,
        });

        alert("Signed up successfully!");
        router.push("/signin");
      }
    } catch (err) {
      alert("Auth failed. Please check credentials.");
      console.error(err);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-black text-white">
      <div className="p-4 rounded-lg bg-gray-900 space-y-4 w-80">
        <div className="text-3xl font-bold text-center">
          {isSignin ? "Sign in" : "Sign up"}
        </div>
        {!isSignin && (
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <Input
          type="text"
          placeholder="Email"
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
          onClick={handleSubmit}
          className="bg-white text-black px-4 py-2 rounded w-full hover:bg-gray-300"
        >
          {isSignin ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}
