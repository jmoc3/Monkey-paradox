import { useGameStore } from "@/store/useGameStore";
import { useEffect, useState, type FC } from "react";
import { useProgresiveSound } from '@/hooks/useProgresiveSound'
import { useErrorSound } from "@/hooks/useErrorSound";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import { FaArrowsRotate } from "react-icons/fa6";
const BASE = 2
const randomColors = ['text-[#F4A300]', 'text-[#E63946]', 'text-[#3A0CA3]', 'text-[#4CC9F0]']

export const TypeSide: FC = () => {
  const [sent, setSent] = useState<boolean>(false)
  const [spaces, setSpaces] = useState<number>(0)
  const [pointColor, setPointColor] = useState<string>('')
  const { user } = useAuthStore()
  const { badLetters, currentText, showAnimation, letterCounter, currentStreak, actualHistory } = useGameStore()
  const currentTextString = currentText.en as string
  const { addStatisticsFront, addStatisticsBack } = useUserStore()

  const parts = currentTextString.split(".").map(text => text.trim())
  const [wordPoint, setWordPoint] = useState<number>() 
  const { play } = useProgresiveSound()
  const playError = useErrorSound()
  
  useEffect(()=>{
    const handleKeyDown = (e: KeyboardEvent) =>{  
        if(useGameStore.getState().status == 'finished'){
          return
        }
        const {
          currentWord,
          status, 
          gameData,
          clock,
          wordCounter,
          wordWithPoints,
          goodLetters,
          setCurrentWord,
          setGameData,
          setActualHistory, 
          setWordWithPoints,
          setWordCounter,
          setLetterCounter, 
          setStatus, 
          startClock, 
          stopClock,
          doCalculation,
          setCurrentStreak,
          setBadLetters,
          setGoodLetters,
          switchShowPointsAnimation,
          setShowAnimation
        } = useGameStore.getState()

      const newKey = e.code == "Space" ? ' ' : e.key

      if(e.key == "Backspace" && letterCounter > 0){
        const behindLetterIndex = letterCounter - 1
        if (actualHistory[behindLetterIndex] == ' ' && wordCounter > 0 && spaces == wordCounter){ setWordCounter(wordCounter - 1) }
        
        if([...badLetters].includes(behindLetterIndex)){ setBadLetters(new Set([...badLetters].filter(e => e != behindLetterIndex))) }

        const newHistory = actualHistory.slice(0, actualHistory.length - 1)
        setActualHistory(newHistory)
        setLetterCounter(behindLetterIndex) 
        setCurrentWord(currentWord.slice(0, currentWord.length - 1))
        return
      }
      
      if(e.key == 'Enter' && currentTextString.length == actualHistory.length){
        
        setWordWithPoints(wordCounter, 1)
        const goodLetters = currentWord.split("").filter((e, i) => e == currentTextString.split(" ")[wordCounter][i]).length
        const points = Math.round(goodLetters * BASE * (currentStreak || 1))
        
        setWordPoint(points)
        setGameData("points", gameData.points + points)
        setShowAnimation([...showAnimation, letterCounter])
        setPointColor(randomColors[Math.floor(Math.random() * randomColors.length)])
        switchShowPointsAnimation()
        play()

        setCurrentStreak(currentStreak + 1)
      
        setStatus('finished')
        stopClock()

        const { wpm, cpm } = doCalculation(actualHistory)
        const time = `${(clock[0])}`.padStart(2, '0') + ':' + `${(clock[1])}`.padStart(2, '0')
        const totalPoints = useGameStore.getState().gameData.points
        const statistic = {
          user_id: `${user!.user_id}` as string,
          quote: currentText.id as number,
          cpm,
          wpm,
          time,
          points: totalPoints,
          updatedAt: new Date(),
          createdAt: new Date()
        }
        addStatisticsFront(statistic)
        addStatisticsBack(statistic)
        setSent(true)
        return
      }
      
      if(e.key.length > 1 && e.code != 'Space') return
      setCurrentWord(currentWord + e.key)      
      const targetWord = currentTextString.split(" ")[wordCounter]

      if(e.key == ' ' && currentTextString[letterCounter] == ' '){
        if(!Object.keys(wordWithPoints).includes(`${wordCounter}`)){ 
          setSpaces(spaces + 1)
        }
        setWordCounter(wordCounter + 1)
        setCurrentWord("")
      }

      if(currentWord.length == targetWord.length && e.key == ' ' && !Object.keys(wordWithPoints).includes(`${wordCounter}`)) {
        setWordWithPoints(wordCounter, 1)
        const goodLetters = currentWord.split("").filter((e, i) => e == targetWord[i]).length
        const points = Math.round(goodLetters * BASE * (currentStreak || 1))
        
        setWordPoint(points)
        setGameData("points", gameData.points + points)
        setShowAnimation([...showAnimation, letterCounter])
        setPointColor(randomColors[Math.floor(Math.random() * randomColors.length)])
        switchShowPointsAnimation()
        play()

        setCurrentStreak(currentStreak + 1)
      }

      if(status != 'playing'){
        setStatus('playing')
        startClock()
      }
      const newHistory = actualHistory + newKey
      setActualHistory(newHistory)
      setLetterCounter(letterCounter + 1)
      if(e.key != currentTextString[letterCounter]){
        setCurrentStreak(0)
        setBadLetters(new Set([...badLetters, newHistory.length - 1]))
        playError()
        return
      }
    
      setGoodLetters([...goodLetters, letterCounter])
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  },[
    actualHistory,
    spaces,
    currentText,
    user,
    sent,
    parts,
    badLetters,
    currentStreak,
    currentTextString,
    letterCounter,
    showAnimation,
    addStatisticsBack,
    addStatisticsFront,
    setWordPoint,
    setSent,
    play,
    playError
  ]
  )
  
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <span className="flex self-start mb-5 text-fuchsia-900 opacity-50"> Quote #{currentText.id as number}</span> 
      <span className="text-3xl">
        {
          currentTextString.split("").map((letter, index2) =>(
            <span key={index2} className={`relative ${index2}`}>
              <span 
                className={`${index2 < letterCounter  ? `relative opacity-100 underline ${[...badLetters].includes(index2) ? 'text-red-500 animate-wrongWord' : ''}` : 'opacity-25'}`} 
                >
                {letter}
              
              </span>
              {currentTextString[index2] == " " || currentTextString.length == actualHistory.length? 
                <span 
                  className={`absolute left-0 bottom-7 opacity-0 ${showAnimation.includes(index2)  ? `animate-pointsUp ${pointColor}` : ''}`} 
                  >+{wordPoint}</span> : <></>}
              {currentTextString[index2] == " " ? 
                <span 
                  className={`absolute -left-16 bottom-7 opacity-0 ${showAnimation.includes(index2)  ? `animate-pointsUp ${pointColor}` : ''}`} 
                  >x{currentStreak}</span> : <></>}
            </span>
          ))
        }
      </span>
      <div className="absolute grid items-center self-start bottom-60 gap-2 opacity-50">
        <h2 className="text-sm font-bold text-blue-950">Mandamientos</h2>
        <div className="grid text-xs">
          <span className=" text-blue-900">Cada palabra te da puntos; los puntos dependerán de la precisión que tengas.</span>
          <span className=" text-blue-900">El puntaje aumenta en cantidad al multiplicarse con tu <b>racha</b>.</span>
          <span className=" text-blue-900">La racha aumenta por palabras correctas consecutivas escritas.</span>
          <span className=" text-blue-900">Para información de tu rendimiento, ir a la sección de perfil.</span>
          <span className="flex gap-2 items-center text-blue-900 "> Reinicias en el botón de <FaArrowsRotate className="text-xs text-blue-800" /> <span className="text-xs">(ubicado al lado del tiempo)</span></span> 
        </div>
      </div>
    </div>
  )
}