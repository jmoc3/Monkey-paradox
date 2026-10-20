import type { FC } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";

export const WelcomeSide : FC = () => {
  const { user } = useAuthStore()
  const { status } = useGameStore()

  const mazeLink = () => {
    if(true) return
    toast.info("📋 Link copied", {position: "top-center", duration: 500})
    // Logic to copy room
  }

  return (
    <div className="grid gap-2">
      <span className="text-xl font-bold">Bienvenido <b>{user ? user.name : "?"}</b></span>
      <p>
        Puedes jugar solo e intentar batir tu récord personal, o jugar con amigos... <b>Invítalos!!</b>
      </p>
      <button 
        tabIndex={2} 
        onClick={mazeLink} 
        className={`rounded py-2 ${false ? 'cursor-pointer bg-blue-200 text-blue-800 hover:bg-blue-900 hover:text-blue-100 hover:font-bold duration-100 transition' : 'bg-gray-200 text-gray-800'}`}>Type link</button>
      <span className="m-auto text-xs opacity-50">Desactivado mientras se implementa multiplayer</span>
    </div>
  )
}