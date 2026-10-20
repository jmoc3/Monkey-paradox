import { create } from 'zustand'
import { sentences } from "@/sentences"

type State = {
  currentText: Record<string, string | number | Record<string, string>>,
  BASEPOINTS: number,
  currentWord: string
  showAnimation: number[]
  showPointsAnimation: boolean
  status: "ready" | "playing" | "finished"
  soundCounter: number
  gameData: {
    points: number
  }
  clock: number[]
  intervalId: number
  wordCounter: number
  wordWithPoints: Record<number, number>
  letterCounter: number
  actualHistory: string
  currentStreak: number
  goodLetters: number[]
  badLetters: Set<number>
}

type Actions = {
  setCurrentText: (currentText: Record<string, string | number | Record<string, string>>) => void,
  setStatus: (status: State["status"]) => void
  setCurrentWord: (word: string) => void
  incrementSoundCounter: () => void
  resetSoundCounter: () => void
  startGame: () => void
  stopGame: () => void
  resetGame: () => void
  startClock: () => void
  stopClock: () => void
  resetClock: () => void
  setGameData: (key:string, value: string | number) => void
  setWordCounter: (wordCounter: number) => void
  setLetterCounter: (letterCounter: number) => void
  setActualHistory: (actualHistory: string) => void
  doCalculation: (sentence: string) => {wpm:number, cpm: number}
  setWordWithPoints: (key: number, value: number) => void
  resetWordPoints: () => void
  setCurrentStreak: (currentStreak: number) => void
  resetPoints: () => void
  setGoodLetters: (goodLetters: number[]) => void
  setBadLetters: (badLetters: Set<number>) => void
  switchShowPointsAnimation: () => void
  setShowAnimation: (showAnimation: number[]) => void
}
export const useGameStore = create<State & Actions>() ((set, get) => ({
  currentText: sentences[Math.floor(Math.random() * sentences.length)],
  BASEPOINTS: 2,
  currentWord: "",
  showPointsAnimation: false,
  showAnimation: [],
  soundCounter: 0,
  status: "ready",
  gameData: {
    points: 0
  },
  clock: [0,0],
  intervalId:0,
  letterCounter: 0,
  wordCounter: 0,
  wordWithPoints: {},
  actualHistory: '',
  currentStreak: 0,
  goodLetters: [],
  badLetters: new Set([]),
  setCurrentText: (currentText: Record<string, string | number | Record<string, string>>) => (set({currentText})),
  setStatus: (status) => ( set({ status }) ),
  setCurrentWord: (currentWord: string) => ( set({ currentWord }) ),
  incrementSoundCounter: () => ( set({soundCounter: get().soundCounter + 1}) ),
  resetSoundCounter: () => ( set({soundCounter: 0})),
  startGame: () => set({ status: "playing" }),
  stopGame: () => set({ status: "finished" }),
  resetGame: () => {
    const { 
      setCurrentText,
      setLetterCounter, 
      setWordCounter, 
      stopGame, 
      stopClock, 
      resetClock, 
      resetWordPoints, 
      setActualHistory, 
      resetPoints, 
      setCurrentStreak, 
      setGoodLetters, 
      setBadLetters, 
      setShowAnimation, 
      setCurrentWord 
    } = get()

    setLetterCounter(0)
    setWordCounter(0)
    stopGame()
    stopClock()
    resetClock()
    setActualHistory('')
    resetPoints()
    resetWordPoints()
    setCurrentStreak(0)
    setGoodLetters([])
    setBadLetters(new Set([]))
    setShowAnimation([])
    setCurrentWord("")
    set({ status: "ready", clock: [0,0] })
    setCurrentText(sentences[Math.floor(Math.random() * sentences.length)])
  },
  startClock: () => {
    const interval = setInterval(() => {
      const [minutes, seconds] = get().clock
      if(seconds == 59){
        set({ clock: [minutes + 1, 0] })
      }
      else{
        set({ clock: [minutes, seconds + 1] })
      }   
      if(get().status != 'playing'){
        clearInterval(get().intervalId)
        set({ intervalId: 0 })
      }
    }, 100)

    set({ intervalId: interval })
  },
  stopClock: () => {
    const interval = get().intervalId
    if(interval != 0){
      clearInterval(interval)
      set({ intervalId: 0 })
    }
  },
  resetClock: () => {
    set({ clock: [0,0] })
  },
  setGameData: (key: string, value: string | number) => {
    set({
      gameData: {
        ...get().gameData,
        [key]: value
      }
    })
  },
  setWordCounter: (wordCounter) => ( set({ wordCounter }) ),
  setLetterCounter: (letterCounter) => ( set({ letterCounter }) ),
  setActualHistory: (actualHistory) => ( set({ actualHistory }) ),
  doCalculation: (sentence: string) : {wpm: number, cpm: number} => {
    const { clock } = get()

    const minutesPlayed = clock[0] + clock[1] / 60
    const cpm = +(sentence.length / minutesPlayed).toFixed(2)
    const wpm = +((sentence.length/5) / minutesPlayed).toFixed(2)

    return { wpm, cpm }
  },
  resetPoints: () => {
    set({ gameData: {
      points: 0
    }})
  },
  setWordWithPoints: (key: number, value: number) => (set({wordWithPoints: {
    ...get().wordWithPoints,
    [key]: value
  }})),
  resetWordPoints: () => ( set({wordWithPoints: {}}) ),
  setCurrentStreak: (currentStreak: number) => ( set({ currentStreak }) ),
  setBadLetters: (badLetters: Set<number>) => ( set({ badLetters }) ),
  setGoodLetters: (goodLetters: number[]) => ( set({ goodLetters }) ),
  switchShowPointsAnimation: () => ( set({ showPointsAnimation: !get().showPointsAnimation }) ),
  setShowAnimation: (showAnimation: number[]) => (set({ showAnimation }))
}))