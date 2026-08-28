import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest, } from '../api/empleados'
import { registrarManejador401 } from '../api/client'

const STORAGE_KEY = 'procredit.token'

interface AuthContextValue {
  token: string | null
  iniciarSesion: (usuario: string, clave: string) => Promise<void>
  cerrarSesion: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [])

  useEffect(() => {
    registrarManejador401(cerrarSesion)
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async (usuario: string, clave: string) => {
    const respuesta = await loginRequest(usuario, clave)
    localStorage.setItem(STORAGE_KEY, respuesta.token)
    setToken(respuesta.token)
  }, [])

  const valor = useMemo(
    () => ({ token, iniciarSesion, cerrarSesion }),
    [token, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
