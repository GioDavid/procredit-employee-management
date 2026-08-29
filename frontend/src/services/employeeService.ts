import { apiRequest } from "../api/client";
import type { CreateEmployeeRequest } from "../interfaces/CreateEmployeeRequest";
import type { Empleado } from "../interfaces/Empleado";

export async function listEmployees(
  departamento?: string,
): Promise<Empleado[]> {
  const query =
    departamento && departamento.trim().length > 0
      ? `?departamento=${encodeURIComponent(departamento.trim())}`
      : "";
  return apiRequest<Empleado[]>(`/api/empleados${query}`);
}

export async function createEmployee(
  request: CreateEmployeeRequest,
): Promise<Empleado> {
  return apiRequest<Empleado>("/api/empleados", {
    method: "POST",
    body: request,
  });
}
