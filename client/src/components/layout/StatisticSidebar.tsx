import { useProgresiveSound } from "@/hooks/useProgresiveSound";
import { useGameStore } from "@/store/useGameStore";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef, type FC } from "react";
import { FaArrowsRotate } from "react-icons/fa6";

export const StatisticSidebar : FC = () => {
  const { clock, resetGame } = useGameStore()
  const { userStatistics } = useUserStore()
  const { resetSoundCounter } = useProgresiveSound()

  const buttonRef = useRef<HTMLButtonElement >(null)

  const onReset = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    resetGame()
    resetSoundCounter()
    event.currentTarget.blur()
  }
  useEffect(()=> {
    const tabHandler = (event: KeyboardEvent) => {
      if(event.key =='Tab'){
        event.preventDefault()
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', tabHandler)
    return () => document.removeEventListener('keydown', tabHandler)
  })
  return (
    <div className="flex flex-col w-[40%] gap-6">
      <div className="flex flex-col relative items-center justify-center gap-2 w-fit h-26 bg-white rounded px-6">
        <h2 className="flex items-center gap-4 font-bold">
          Tiempo
          <button 
            ref={buttonRef} 
            tabIndex={1} 
            onClick={onReset} 
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                if(e.code == 'Space') e.preventDefault()
              }} 
            className='rounded p-1 cursor-pointer bg-blue-200 text-blue-800 hover:bg-blue-900 hover:text-blue-100 hover:font-bold duration-100 transition'>
              <FaArrowsRotate className="text-xs" />
          </button>
        </h2>
        <div className="w-full flex items-center justify-center select-none">
          <span className="text-2xl opacity-75"> {`${String(clock[0]).padStart(2, '0')}:${String(clock[1]).padStart(2, '0')}`} </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full bg-white rounded p-6">
        <h2 className="font-bold">Ultimas Estadisticas</h2>
        <div className="caption-bottom text-xs opacity-50 grid">
          <span> wpm = { 'word per minute / palabra por minuto' } </span>
          <span> cpm = { 'character per minute / caracter por minuto' } </span>
        </div>
        <div className="w-full h-full">
          <table className="table-auto rounded w-full mt-1">  
            <thead className="text-sm mb-1">
              <tr className='border'>
                <th className="w-1/4 py-1">#</th>
                <th className="w-1/4">Tiempo</th>
                <th className="w-1/4">WPM</th>
                <th className="w-1/4">CPM</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {
                userStatistics.length > 0 ? 
                  (
                    userStatistics.slice(-5).map((e, i) => (
                      <tr key={i} className={`${i == userStatistics.slice(-5).length - 1 ? "border border-b-blue-800 bg-blue-200 text-blue-800" : ""} text-center`}>
                        <td className={`w-1/4 py-1 ${i == 0 ? 'pt-3' : ''} font-bold`}>{userStatistics.length  < 6 ? i+1 : (userStatistics.length - 4) + (i)}</td>
                        <td className={`w-1/4 py-1 ${i == 0 ? 'pt-3' : ''}`}>{e.time}</td>
                        <td className={`w-1/4 py-1 ${i == 0 ? 'pt-3' : ''}`}>{e.wpm}</td>
                        <td className={`w-1/4 py-1 ${i == 0 ? 'pt-3' : ''}`}>{e.cpm}</td>
                      </tr>
                    ))
                  )
                  : 
                  <></>
              }

            </tbody>
          </table>
          
        </div>
      </div>
    </div>
  )
}