import { apiRequest } from '../api/client';
import type { Catalog } from '../interfaces/Catalog';

export async function getDepartamentos(): Promise<Catalog[]> {
  return apiRequest<Catalog[]>('/api/departamentos');
}

export async function getCargos(): Promise<Catalog[]> {
  return apiRequest<Catalog[]>('/api/cargos');
}
