import { HTTP_BACKEND } from "@/config";
import axios from "axios";

// Fetch shapes from server with Authorization header
export async function getExistingShapes(roomId: string) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No auth token found in localStorage.");
    return [];
  }

  try {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
      headers: {
        Authorization: token,
      },
    });

    const messages = res.data.messages;

    const shapes = messages.map((x: { message: string }) => {
      const messageData = JSON.parse(x.message);
      return messageData.shape;
    });

    return shapes;
  } catch (err) {
    console.error("Error fetching existing shapes:", err);
    return [];
  }
}
