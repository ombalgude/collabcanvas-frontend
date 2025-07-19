import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
    const roomId = (await params).id
    return <RoomCanvas roomId={roomId} />;
} 

