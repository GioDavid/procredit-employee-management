const baseUrl: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5080'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Se dispara ante un 401 en una llamada autenticada; la sesion lo usa para cerrar sesion. */
type NoAutorizadoHandler = () => void

let alRecibir401: NoAutorizadoHandler = () => {}

export function registrarManejador401(handler: NoAutorizadoHandler): void {
  alRecibir401 = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

interface ProblemDetails {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}

function mensajeDeProblema(problema: ProblemDetails, status: number): string {
  if (problema.errors) {
    const detalles = Object.values(problema.errors).flat()
    if (detalles.length > 0) {
      return detalles.join(' ')
    }
  }
  return problema.detail ?? problema.title ?? `Error ${status}`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  let respuesta: Response
  try {
    respuesta = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('No se pudo contactar con la API. Verifica que este en ejecucion.', 0)
  }

  if (respuesta.status === 401 && token) {
    alRecibir401()
    throw new ApiError('La sesion expiro. Vuelve a iniciar sesion.', 401)
  }

  if (respuesta.status === 204) {
    return undefined as T
  }

  const texto = await respuesta.text()
  const datos: unknown = texto.length > 0 ? JSON.parse(texto) : null

  if (!respuesta.ok) {
    throw new ApiError(mensajeDeProblema((datos ?? {}) as ProblemDetails, respuesta.status), respuesta.status)
  }

  return datos as T
}
