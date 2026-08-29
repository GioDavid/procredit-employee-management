import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import type { Catalog } from "../interfaces/Catalog";
import { getCargos, getDepartamentos } from "../services/catalogService";
import { createEmployee } from "../services/employeeService";
import { NewEmployeeDialog } from "./NewEmployeeDialog";

vi.mock("../services/catalogService", () => ({
  getDepartamentos: vi.fn(),
  getCargos: vi.fn(),
}));

vi.mock("../services/employeeService", () => ({
  createEmployee: vi.fn(),
}));

const getDepartamentosMock = vi.mocked(getDepartamentos);
const getCargosMock = vi.mocked(getCargos);
const createEmployeeMock = vi.mocked(createEmployee);

const departamentos: Catalog[] = [{ id: 1, nombre: "Sistemas" }];
const cargos: Catalog[] = [{ id: 2, nombre: "Analista" }];

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
    getDepartamentosMock.mockReset();
    getCargosMock.mockReset();
    createEmployeeMock.mockReset();
    getDepartamentosMock.mockResolvedValue(departamentos);
    getCargosMock.mockResolvedValue(cargos);
    createEmployeeMock.mockResolvedValue({
      empleadoId: 1,
      numeroDocumento: "12345678",
      nombres: "Ana",
      apellidos: "García",
      edad: 30,
      remuneracionMensual: 2500000,
      departamentoId: 1,
      departamento: "Sistemas",
      cargoId: 2,
      cargo: "Analista",
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
      expect(getDepartamentosMock).toHaveBeenCalled();
      expect(getCargosMock).toHaveBeenCalled();
    });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(createEmployeeMock).toHaveBeenCalledWith({
        numeroDocumento: "12345678",
        nombres: "Ana",
        apellidos: "García",
        edad: 30,
        remuneracionMensual: 2500000,
        departamentoId: 1,
        cargoId: 2,
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
      expect(getDepartamentosMock).toHaveBeenCalled();
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
