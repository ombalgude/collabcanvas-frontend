import { RoomCanvas } from "@/app/components/RoomCanvas";

// export default function CanvasPage({
//   params,
// }: {
//   params: { roomId: string };
// }) {
//   return <RoomCanvas roomId={params.roomId} />;
// }

export default async function GET({ params }: { params: Promise<{ id: string }> }) {
    const roomId = (await params).id
    return <RoomCanvas roomId={roomId} />;
} 

