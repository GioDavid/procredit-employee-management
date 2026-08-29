import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import type { Catalog } from "../interfaces/Catalog";
import { getDepartments, getPositions } from "../services/catalogService";
import { createEmployee } from "../services/employeeService";
import { NewEmployeeDialog } from "./NewEmployeeDialog";

vi.mock("../services/catalogService", () => ({
  getDepartments: vi.fn(),
  getPositions: vi.fn(),
}));

vi.mock("../services/employeeService", () => ({
  createEmployee: vi.fn(),
}));

const getDepartmentsMock = vi.mocked(getDepartments);
const getPositionsMock = vi.mocked(getPositions);
const createEmployeeMock = vi.mocked(createEmployee);

const departments: Catalog[] = [{ id: 1, name: "Sistemas" }];
const positions: Catalog[] = [{ id: 2, name: "Analista" }];

async function fillValidForm(user: UserEvent) {
  await user.type(
    screen.getByLabelText(/número de documento/i),
    "  12345678  ",
  );
  await user.type(screen.getByLabelText(/^nombres/i), "  Ana  ");
  await user.type(screen.getByLabelText(/^apellidos/i), "  García  ");
  await user.type(screen.getByLabelText(/^edad/i), "30");
  await user.type(screen.getByLabelText(/remuneración mensual/i), "2500000");

  await user.click(screen.getByRole("combobox", { name: /departamento/i }));
  await user.click(await screen.findByRole("option", { name: "Sistemas" }));

  await user.click(screen.getByRole("combobox", { name: /cargo/i }));
  await user.click(await screen.findByRole("option", { name: "Analista" }));
}

describe("NewEmployeeDialog", () => {
  const onClose = vi.fn();
  const onCreated = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onCreated.mockReset();
    getDepartmentsMock.mockReset();
    getPositionsMock.mockReset();
    createEmployeeMock.mockReset();
    getDepartmentsMock.mockResolvedValue(departments);
    getPositionsMock.mockResolvedValue(positions);
    createEmployeeMock.mockResolvedValue({
      employeeId: 1,
      documentNumber: "12345678",
      firstNames: "Ana",
      lastNames: "García",
      age: 30,
      monthlySalary: 2500000,
      departmentId: 1,
      department: "Sistemas",
      positionId: 2,
      position: "Analista",
    });
  });

  it("shows field errors and does not create when the form is empty", async () => {
    const user = userEvent.setup();
    render(<NewEmployeeDialog open onClose={onClose} onCreated={onCreated} />);

    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      screen.getByText("Debe tener entre 6 y 20 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByText("Los nombres son requeridos.")).toBeInTheDocument();
    expect(
      screen.getByText("Los apellidos son requeridos."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La edad debe estar entre 18 y 100."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La remuneración debe ser mayor que 0."),
    ).toBeInTheDocument();
    expect(screen.getByText("Seleccione un departamento.")).toBeInTheDocument();
    expect(screen.getByText("Seleccione un cargo.")).toBeInTheDocument();
    expect(createEmployeeMock).not.toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("creates an employee with a trimmed numeric payload", async () => {
    const user = userEvent.setup();
    render(<NewEmployeeDialog open onClose={onClose} onCreated={onCreated} />);

    await waitFor(() => {
      expect(getDepartmentsMock).toHaveBeenCalled();
      expect(getPositionsMock).toHaveBeenCalled();
    });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(createEmployeeMock).toHaveBeenCalledWith({
        documentNumber: "12345678",
        firstNames: "Ana",
        lastNames: "García",
        age: 30,
        monthlySalary: 2500000,
        departmentId: 1,
        positionId: 2,
      });
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it("shows the server conflict detail and does not call onCreated", async () => {
    const user = userEvent.setup();
    createEmployeeMock.mockRejectedValue(
      new ApiError(
        409,
        "Conflict",
        "Ya existe un empleado con ese número de documento.",
      ),
    );
    render(<NewEmployeeDialog open onClose={onClose} onCreated={onCreated} />);

    await waitFor(() => {
      expect(getDepartmentsMock).toHaveBeenCalled();
    });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(
      await screen.findByText(
        "Ya existe un empleado con ese número de documento.",
      ),
    ).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });
});
