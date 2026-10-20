import { useState, type FC } from "react";
import snIcon from '@/assets/sniconh_negro_sinfondo.png'
import { FaSistrix } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { apiFetch, debounce } from "@/helpers/fetching";
import { Spinner } from "../ui/spinner";

export const Header: FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const location = useLocation()
  const [userQuerys, setUserQuerys] = useState<Record<string,string>[]>([])
  const [input, setInput] = useState("")
  const [optionQueryOpen, setOptionQueryOpen] = useState(false)
  const [loadingUsersQuery, setLoadingUsersQuery] = useState(false)
  const handleInput = async (e: string) => {
    const res = await apiFetch(`/users/search_query/${e}`,"GET")
    const userData = await res.json()
    if(userData.query != undefined){
      setOptionQueryOpen(true)
    }
    setUserQuerys(userData.query || []) 
    setLoadingUsersQuery(false)
  }
  const debouncerQuery = debounce(handleInput, 500)

  return (
    <div className={`absolute top-0 w-full flex justify-between py-6  ${ location.pathname != "/profile" ? "px-24" : "px-56" }`}>
      <div className="flex gap-8">
        <img className='w-10 h-10 rounded object-cover object-center cursor-pointer' src={snIcon} alt="" onClick={()=> { navigate("/") }} />
        <ul className="flex items-center gap-4">
          <Link className="hover:font-bold cursor-pointer" to="/">Inicio</Link>
          <Link className="hover:font-bold cursor-pointer" to='/profile'>Perfil</Link>
          {
            user.user_id == "0" && (
              <Link className="hover:font-bold cursor-pointer" to='/login'>Iniciar sesión</Link>
            )
          }
        </ul>
      </div>
      <div className="flex items-center relative w-[21%]">
        <FaSistrix size={15} className="opacity-75 absolute left-2 rounded-full z-0"/>
        <input 
          className="w-full border rounded text-sm px-1 pl-7 py-1 bg-transparent z-10" 
          placeholder="Busca algun perfil" 
          type="text" 
          onChange={e => {
            setInput(e.target.value)
            if(e.target.value == ""){ setUserQuerys([]) }
            setLoadingUsersQuery(true)
            debouncerQuery(e.target.value)
          }}
          onBlur={()=>setOptionQueryOpen(false)}
          />
        {
          input != ""? 
          (
            <div className="absolute bottom-0 translate-y-full w-full h-fit  bg-white rounded z-50">
              {
                loadingUsersQuery ? (
                  <div className="w-full h-full py-2 flex justify-center"><Spinner  /></div>
                ) : (
                  <>
                  {
                    optionQueryOpen ? 
                    (<>
                    {
                      userQuerys.map((e, i) => (
                        <div key={i} className="bg-accent m-1 px-4 py-2 grid cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="">{e.name}</span>
                            <span className="text-xs">Rank #1</span>
                          </div>
                          <span className="text-xs">{e.email}</span>
                        </div>
                      ))
                    }
                    </>):
                    (
                      <div className="w-full h-full py-2 flex justify-center">Sin resultados</div>
                    )
                  }
                  </>
                )
              }
            </div>
          ): <div></div>
        }
      </div>
    </div>
  )
}