import { apiFetch } from "@/helpers/fetching";
import type { UserBase, UserStatistics } from "@/types";
import { create } from "zustand";

type States = {
  userStatistics: UserStatistics[]
  allStatisticsGroupByUser: Record<string, string | number | UserBase>[]
}

type Actions = {
  addStatisticsFront: (statistic: UserStatistics) => void
  addStatisticsBack: (statistic: UserStatistics) => void
  getUserStatistics: (userId: number) => void
  getAllStatisticsGroupByUser: () => void 
}

export const useUserStore = create<States & Actions>()((set, get) => ({
  allStatisticsGroupByUser: [],
  userStatistics: [],
  addStatisticsFront: (statistic: UserStatistics) => (set({userStatistics: [...get().userStatistics, statistic]})),
  addStatisticsBack: async (statistic: UserStatistics) => {
    const res = await apiFetch("/statistics", "POST", statistic)

    return res
  },
  getAllStatisticsGroupByUser: async () => {
    const res = await apiFetch(`/statistics`,"GET")
    const data = await res.json()
    const statistics = data.statistics
    const groupByUser : Record<string, string | number | UserBase>[] = []
    for(const statistic of statistics){
      const recordId = groupByUser.findIndex(e => e.user_id == statistic.user_id)
      
      if(recordId != -1){
        const timeInNumbers = (groupByUser[recordId].time as string).split(":").map(e => parseInt(e))
        const timeInNumbers2 = statistic.time.split(":").map((e: string) => parseInt(e))

        const minutes =  (timeInNumbers[0] * 60 + timeInNumbers[1]) + (timeInNumbers2[0] * 60 + timeInNumbers2[1])
        const hours = Math.floor(minutes / 60)
        const minutesLeft = minutes % 60
        const time = `${String(hours).padStart(2, "0")}:${String(minutesLeft).padStart(2, "0")}`
       
        groupByUser[recordId] = {
          ...groupByUser[recordId],
          points: groupByUser[recordId].points + statistic.points,
          time: time
        }
        continue
      }

      groupByUser.push(statistic)
    }

    set({allStatisticsGroupByUser: groupByUser })    
  },
  getUserStatistics: async (userId: number) => {
    if (userId == 0) return
    const res = await apiFetch(`/statistics/user/${userId}`,"GET")
    const data = await res.json()
    if(!data.statistics) return
    set({userStatistics: [...data.statistics]})    
  }
}))