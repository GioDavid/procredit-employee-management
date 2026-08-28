import type { Catalogo, CrearEmpleadoRequest, Empleado, LoginResponse } from '../types'
import { request } from './client'

export function login(usuario: string, clave: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', { method: 'POST', body: { usuario, clave } })
}

export function consultarEmpleados(token: string, departamento: string): Promise<Empleado[]> {
  const filtro = departamento.trim()
  const query = filtro.length > 0 ? `?departamento=${encodeURIComponent(filtro)}` : ''
  return request<Empleado[]>(`/api/empleados${query}`, { token })
}

export function crearEmpleado(token: string, empleado: CrearEmpleadoRequest): Promise<Empleado> {
  return request<Empleado>('/api/empleados', { method: 'POST', body: empleado, token })
}

export function obtenerDepartamentos(token: string): Promise<Catalogo[]> {
  return request<Catalogo[]>('/api/departamentos', { token })
}

export function obtenerCargos(token: string): Promise<Catalogo[]> {
  return request<Catalogo[]>('/api/cargos', { token })
}
