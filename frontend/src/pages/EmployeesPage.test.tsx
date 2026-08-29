import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Catalog } from "../interfaces/Catalog";
import type { Empleado } from "../interfaces/Empleado";
import { getDepartamentos } from "../services/catalogService";
import { listEmployees } from "../services/employeeService";
import { EmployeesPage } from "./EmployeesPage";

vi.mock("../services/authService", () => ({
  logout: vi.fn(),
}));

vi.mock("../services/catalogService", () => ({
  getDepartamentos: vi.fn(),
  getCargos: vi.fn(),
}));

vi.mock("../services/employeeService", () => ({
  listEmployees: vi.fn(),
  createEmployee: vi.fn(),
}));

const listEmployeesMock = vi.mocked(listEmployees);
const getDepartamentosMock = vi.mocked(getDepartamentos);

const departamentos: Catalog[] = [
  { id: 1, nombre: "Sistemas" },
  { id: 2, nombre: "Legal" },
];

const empleado: Empleado = {
  empleadoId: 1,
  numeroDocumento: "12345678",
  nombres: "Ana",
  apellidos: "García",
  edad: 30,
  remuneracionMensual: 2500000,
  departamentoId: 1,
  departamento: "Sistemas",
  cargoId: 1,
  cargo: "Analista",
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("EmployeesPage", () => {
  const onLogout = vi.fn();

  beforeEach(() => {
    onLogout.mockReset();
    listEmployeesMock.mockReset();
    getDepartamentosMock.mockReset();
    getDepartamentosMock.mockResolvedValue(departamentos);
  });

  it("loads and renders employees on mount", async () => {
    listEmployeesMock.mockResolvedValue([empleado]);
    render(<EmployeesPage onLogout={onLogout} />);

    expect(listEmployeesMock).toHaveBeenCalledWith(undefined);

    const table = await screen.findByRole("table");
    const row = within(table).getByRole("row", { name: /ana/i });

    expect(within(row).getByText("12345678")).toBeInTheDocument();
    expect(within(row).getByText("Ana")).toBeInTheDocument();
    expect(within(row).getByText("García")).toBeInTheDocument();
    expect(within(row).getByText("30")).toBeInTheDocument();
    expect(within(row).getByText("Sistemas")).toBeInTheDocument();
    expect(within(row).getByText("Analista")).toBeInTheDocument();
    expect(
      within(row).getByText(
        new Intl.NumberFormat("es-CO", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(2500000),
      ),
    ).toBeInTheDocument();
  });

  it("shows a progress indicator and hides the table while loading", async () => {
    const { promise, resolve } = deferred<Empleado[]>();
    listEmployeesMock.mockReturnValue(promise);
    render(<EmployeesPage onLogout={onLogout} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    resolve([empleado]);
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("shows an error alert and hides the table when the list fails", async () => {
    listEmployeesMock.mockRejectedValue(new Error("Fallo de red"));
    render(<EmployeesPage onLogout={onLogout} />);

    expect(await screen.findByText("Fallo de red")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.queryByText("No se encontraron empleados."),
    ).not.toBeInTheDocument();
  });

  it("shows the empty state when there are no employees", async () => {
    listEmployeesMock.mockResolvedValue([]);
    render(<EmployeesPage onLogout={onLogout} />);

    expect(
      await screen.findByText("No se encontraron empleados."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("filters the list by departamento name and restores all with Todos", async () => {
    const user = userEvent.setup();
    listEmployeesMock.mockResolvedValue([empleado]);
    render(<EmployeesPage onLogout={onLogout} />);

    await screen.findByRole("table");
    expect(listEmployeesMock).toHaveBeenCalledWith(undefined);

    await user.click(screen.getByLabelText("Departamento"));
    await user.click(await screen.findByRole("option", { name: "Sistemas" }));

    await waitFor(() => {
      expect(listEmployeesMock).toHaveBeenCalledWith("Sistemas");
    });

    await user.click(screen.getByLabelText("Departamento"));
    await user.click(await screen.findByRole("option", { name: "Todos" }));

    await waitFor(() => {
      expect(listEmployeesMock).toHaveBeenLastCalledWith(undefined);
    });
  });
});
