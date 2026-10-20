const BASE_URL = import.meta.env.VITE_BACKEND_URL

export const apiFetch = async (url: string, type: string, body?: Record<string, string | number | Date | File>) => {
  const res = await fetch(`${BASE_URL}/api/v1${url}`, {
    method: type,
    credentials: "include",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(body)
  })
  return res 
}

export const fileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
  let timeId : ReturnType<typeof setTimeout>

  return function(...args: Parameters<T>){
    clearTimeout(timeId)
    timeId = setTimeout(() => func(...args), delay) 
  }
}