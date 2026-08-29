export interface CreateEmployeeRequest {
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  age: number;
  monthlySalary: number;
  departmentId: number;
  positionId: number;
}
