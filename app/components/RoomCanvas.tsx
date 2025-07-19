"use client";
import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    // This handler runs when the connection is successfully established.
    ws.onopen = () => {
      console.log("WebSocket connected. Initializing room.");
      setSocket(ws);
      
      // --- CHANGE APPLIED HERE ---
      // This component is now responsible for all initial setup messages.

      // 1. Announce that we are joining the room.
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );

      // 2. Proactively request the full drawing history for the room.
      ws.send(
        JSON.stringify({
            type: "request_canvas_history",
            roomId: roomId,
        })
      );
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
    };

    ws.onclose = () => {
      console.warn("WebSocket connection closed.");
      setSocket(null); 
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  if (!socket) {
    return <div>Connecting to drawing server...</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
