import { apiRequest } from "../api/client";
import type { Catalog } from "../interfaces/Catalog";

export async function getDepartments(): Promise<Catalog[]> {
  return apiRequest<Catalog[]>("/api/departments");
}

export async function getPositions(): Promise<Catalog[]> {
  return apiRequest<Catalog[]>("/api/positions");
}
