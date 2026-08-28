export interface Empleado {
  empleadoId: number
  numeroDocumento: string
  nombres: string
  apellidos: string
  edad: number
  remuneracionMensual: number
  departamentoId: number
  departamento: string
  cargoId: number
  cargo: string
}

export interface CrearEmpleadoRequest {
  numeroDocumento: string
  nombres: string
  apellidos: string
  edad: number
  remuneracionMensual: number
  departamentoId: number
  cargoId: number
}

export interface Catalogo {
  id: number
  nombre: string
}

export interface LoginResponse {
  token: string
  expiraEn: string
}
