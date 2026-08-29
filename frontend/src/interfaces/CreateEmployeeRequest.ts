export interface CreateEmployeeRequest {
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  edad: number;
  remuneracionMensual: number;
  departamentoId: number;
  cargoId: number;
}
