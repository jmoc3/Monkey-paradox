import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, type FC } from "react"
import { Link } from "react-router-dom";
import { IndexLineChart } from "@/components/recharts/LineChart";
import { BsClockHistory } from "react-icons/bs";
import { BsBarChartFill } from "react-icons/bs";
import { FaPencil } from "react-icons/fa6";
import { apiFetch, fileToBase64 } from "@/helpers/fetching";
import { Spinner } from "@/components/ui/spinner";
import { LoadingDots } from "@/components/ui/loadingDots";
import type { UserBase } from "@/types";

export const ProfilePage: FC = () => {
  const { user, setUser } = useAuthStore()
  const { userStatistics, allStatisticsGroupByUser, getAllStatisticsGroupByUser, getUserStatistics } = useUserStore()
  useEffect(() => {
    const fetching = async () => {
      getUserStatistics(+user!.user_id)
      getAllStatisticsGroupByUser()
      if(user.url_image_loaded || !user.url_image ) { return } 
      const urlImage = user.url_image as string
      const res = await apiFetch(`/users/getProfileImage/${urlImage.slice(8)}`, "GET")
      const fileBlob = await res.blob() 
      setUser({...user, name: user.name as string, url_image: URL.createObjectURL(fileBlob),  url_image_loaded: true})
    }

    fetching()
  }, [getUserStatistics])
  
  const chartData = []
  let tableData = []

  for(const statistic of userStatistics ){
    const day = String(statistic.createdAt).slice(0,10).split('-').reverse().join('/')
    chartData.push({order: chartData.length + 1, cpm: statistic.cpm, wpm: statistic.wpm} as unknown as Record<string, string | number>)
    tableData.push({order: tableData.length + 1, time: statistic.time, day, quote: statistic.quote, points: statistic.points  } as unknown as Record<string, string | number>)
  }

  tableData = tableData.sort((a, b) => {
    const value = a.time as string
    const valueB = b.time as string
    return value.localeCompare(valueB)                        
  })

  const bestRound = userStatistics.sort((a, b) => b.points - a.points )[0] || {}
  const handleFile = async(e: React.ChangeEvent<HTMLInputElement>)=> {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await fileToBase64(file) as string
      apiFetch(`/users/upload_profile_picture/${user.user_id}`,"POST", {
        "file": base64
      })
    }
  }
  
  return (
    <div className="h-[70vh] w-full flex mx-56">
      {
        user.user_id == "0" ? (
          <div className="w-full flex justify-center items-center">
            <div className="grid gap-4">
              <span>Inicia sesión y desbloquea todo lo que tenemos para ti !!</span>
              <Link to="/login" className="text-center bg-blue-200 p-2 cursor-pointer text-blue-800 hover:rounded-xl hover:font-bold transition-all duration-200">Login</Link>
            </div>
          </div>
        ) : (
        <div className="flex w-full gap-8">
          <div className="w-[20%] h-fit flex flex-col gap-3 bg-blue-300/20 rounded-xl p-8">
            <div className="flex gap-4">
                {
                  user.url_image ? 
                  (
                    
                      <div className="w-22 h-22 flex justify-center items-center rounded-xl overflow-hidden">
                        { 
                          user.url_image_loaded ? ( <img src={user.url_image as string} alt="preview" className="w-full h-full object-cover" />): 
                          ( <Spinner /> )
                        }
                      </div>
                  ):
                  (
                    <div>
                      <label className="w-22 h-22 flex flex-col gap-2 rounded bg-[#262626] cursor-pointer justify-center items-center ">
                        <FaPencil className='w-5 h-5 text-white bg-[#262626] rounded object-cover object-center'/>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile}/>
                      </label>
                    </div>
                  )
                }
              <div className="flex flex-col">
                <span>{user.name}</span>
                <div className="flex gap-2">
                  <span>Rank: </span>
                  <span className="font-bold">#1</span>
                </div>
                <span className="text-sm opacity-50">{ user.email }</span>
                <span className="text-sm opacity-50">Alias: beginner</span>
              </div>
            </div>
            <div className="grid text-sm">
              <span>Total points: { allStatisticsGroupByUser.length != 0 ? allStatisticsGroupByUser.find(e => e.user_id == user.user_id)!.points as number : <LoadingDots size="sm"/> }</span>
              <span>Time typing: { allStatisticsGroupByUser.length != 0 ? (allStatisticsGroupByUser.find(e => e.user_id == user.user_id)!.time as string).split(":").map((e, i) => {
                if(i == 0){
                  return e + "m"
                }
                return e + "s"
              }).join(" ") : <LoadingDots size="sm"/> }</span>
              {/* <span>Total errors sent: 0</span>
              <span>Precision: 0</span> */}
            </div>
            <div className="">
              <span className="flex items-end gap-2">
                <h3 className="font-bold">Mejor ronda</h3>
              </span>
              {
                userStatistics.length > 0 ? 
                (
                <div className="text-sm flex flex-col">
                  <span>Time: {bestRound.time ? bestRound.time : <LoadingDots size="sm"/>}</span>
                  <div className="flex gap-2">
                    <span>Points: </span>
                    <span className="font-bold">{bestRound.points ? bestRound.points : <LoadingDots size="sm"/>}</span>
                  </div>
                  <div className="flex gap-2">
                    <span>Quote: </span>
                    <span className="font-bold  ">{bestRound.quote ? bestRound.quote : <LoadingDots size="sm"/>}</span>
                  </div>
                  <span>CPM: {bestRound.cpm ? bestRound.cpm : <LoadingDots size="sm"/>}</span>
                  <span>WPM: {bestRound.wpm ? bestRound.wpm : <LoadingDots size="sm"/>}</span>
                </div>
                )
                : 
                (
                  <span className="text-xs">Aun sin partidas registradas</span>
                )
              }
              
            </div>
          </div>

          <div className="w-[60%]">
            <div className="grid grid-cols-2 gap-16">
              <div className="flex flex-col gap-6">
                <h3 className="text-xl flex gap-10 items-center">Rendimiento Historico <BsBarChartFill className="opacity-50"/></h3>
                {
                  tableData.length > 0 ? (
                    <IndexLineChart 
                      data={chartData} 
                      xKey="order"
                      maxWidth={500}
                      yLabel={{value: "w/c per minute",  position: "center", angle: -90, dx: -20}}
                      xLabel={{value: "# of attempt", dy: 20}}
                    />
                  ) : (
                  <span className="flex gap-2 opacity-50"> Aun sin registros en la base de datos</span>
                  )
                }
                
              </div>
              <div className="flex flex-col gap-4 max-h-78">
                <h3 className="flex gap-10 items-center text-xl ml-6">Mejores Tiempos <BsClockHistory className="opacity-50"/></h3>
                <div className="overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">

                  <table className="min-w-full divide-y ">
                    <thead className="">
                      <tr>
                        <th className="py-3 text-center  text-xs font-medium uppercase tracking-wider">
                          #
                        </th>
                        <th className="text-center text-xs font-medium  uppercase tracking-wider">
                          Tiempo
                        </th>
                        <th className="text-center text-xs font-medium uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="text-center text-xs font-medium uppercase tracking-wider">
                          Puntos
                        </th>
                        <th className="py-3 text-center text-xs font-medium uppercase tracking-wider">
                          Frase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {
                        tableData.length > 0 ?
                          (
                            tableData.map((e, i) => (
                              <tr  key={i} className="text-center transition-colors">
                                <td className="py-4 text-sm">{e.order}</td>
                                <td className="text-sm">{e.time}</td>
                                <td className="text-sm">{e.day}</td>
                                <td className="text-sm">{e.points}</td>
                                <td className="text-sm">{e.quote}</td>
                              </tr>
                            ))
                          ) : (
                            <tr className="w-full"><td colSpan={3} className="p-5 text-center opacity-50">Sin datos registrados</td></tr>
                          )
                      } 
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[20%] grid text-center gap-4">
            <h2 className="font-bold">Global stats <span className="text-xs opacity-50">- Top 10</span></h2>
            <div className="w-full h-[69vh] bg-blue-300/20 rounded-xl">
            {
              allStatisticsGroupByUser.map((e, i) => (
                <div key={i} className="text-start bg-white px-4 py-2 m-2 rounded-xl">
                  <div className="flex justify-between">
                    <span className="font-bold">{(e.user as UserBase).name} <span className="text-xs opacity-50">| Nuke |</span>
                    </span><span className="text-xs">Rank #{e.user_id as string}</span>
                  </div>
                  <div className="grid text-xs">
                    <span>Total points: {e.points as number}</span>
                    <span>Time typing: {e.time as string}</span>
                  </div>
                </div>
              ))
            }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}