import { apiRequest } from "../api/client";
import type { CreateEmployeeRequest } from "../interfaces/CreateEmployeeRequest";
import type { Employee } from "../interfaces/Employee";

export async function listEmployees(department?: string): Promise<Employee[]> {
  const query =
    department && department.trim().length > 0
      ? `?department=${encodeURIComponent(department.trim())}`
      : "";
  return apiRequest<Employee[]>(`/api/employees${query}`);
}

export async function createEmployee(
  request: CreateEmployeeRequest,
): Promise<Employee> {
  return apiRequest<Employee>("/api/employees", {
    method: "POST",
    body: request,
  });
}
