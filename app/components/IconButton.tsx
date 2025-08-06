    
import { ReactNode } from "react";

export function IconButton({
  icon,
  onClick,
  activated
}: {
  icon: ReactNode;
  onClick: () => void;
  activated : boolean
}) {
  return <div className={`cursor-pointer rounded-full p-2 bg-black hover:bg-gray-700 ${activated ? "text-red-400" : "text-white"}`} onClick={onClick}>{icon}</div>
}

