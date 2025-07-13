"use client";

import { Button } from "../../../collabcanvas-frontend/ui/src/Button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";

interface Room {
  id: number;
  name: string;
  slug: string;
}

export default function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const [roomSlug, setRoomSlug] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const fetchMyRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${HTTP_BACKEND}/rooms`, {
        headers: { Authorization: token ?? "" },
      });
      setRooms(res.data.rooms || []);
    } catch (err) {
      toast.error("Failed to fetch rooms");
      console.error(err);
    }
  };

  const handleCreateRoom = async () => {
    const trimmedName = roomName.trim().toLowerCase();
    if (!trimmedName) {
      toast.error("Please enter a room name");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${HTTP_BACKEND}/create-room`,
        { name: trimmedName },
        { headers: { Authorization: token ?? "" } }
      );

      toast.success("Room created successfully!");
      router.push(`/canvas/${res.data.roomId}`);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        // @ts-expect-error: err.response may exist
        toast.error(err?.response?.data?.message || "Room creation failed");
        console.error(err);
      } else {
        toast.error("Room creation failed");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const trimmedSlug = roomSlug.trim().toLowerCase();
    if (!trimmedSlug) {
      toast.error("Enter Room Slug to Join");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${HTTP_BACKEND}/room/${trimmedSlug}`);
      const roomId = res.data.room?.id;

      if (!roomId) {
        toast.error("Room not found");
        return;
      }

      router.push(`/canvas/${roomId}`);
    } catch (err) {
      toast.error("Failed to join room");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinRoomById = (roomId: number) => {
    router.push(`/canvas/${roomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-purple-400">Dashboard</h1>

        {/* Create Room */}
        <div className="bg-white/5 backdrop-blur p-6 rounded-xl space-y-4 border border-white/10">
          <h2 className="text-2xl font-semibold text-purple-300">Create a New Room</h2>
          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2 rounded bg-black/50 text-white placeholder-white border border-white/20"
          />
          <Button
            onClick={handleCreateRoom}
            disabled={loading}
            className="border border-white/20"
          >
            Create Room
          </Button>
        </div>

        {/* Join Room by Slug */}
        <div className="bg-white/5 backdrop-blur p-6 rounded-xl space-y-4 border border-white/10">
          <h2 className="text-2xl font-semibold text-purple-300">Join a Room via Slug</h2>
          <input
            type="text"
            placeholder="Enter Room Slug"
            value={roomSlug}
            onChange={(e) => setRoomSlug(e.target.value)}
            className="w-full px-4 py-2 rounded bg-black/50 text-white placeholder-white border border-white/20"
          />
          <Button
            onClick={handleJoinRoom}
            disabled={loading}
            className="border border-white/20"
          >
            Join Room
          </Button>
        </div>

        {/* List of Rooms */}
        <div className="bg-white/5 backdrop-blur p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4">Your Rooms</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-300">No rooms created yet.</p>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 bg-black/30 rounded border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div>
                      <span className="font-semibold">Name:</span> {room.name}
                    </div>
                    <div>
                      <span className="font-semibold">Slug:</span> {room.slug}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => joinRoomById(room.id)}
                      className="border border-white/20"
                    >
                      Join
                    </Button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/canvas/${room.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard!");
                      }}
                      className="px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-black transition"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
