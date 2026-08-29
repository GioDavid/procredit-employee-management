import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/client";
import type { LoginResponse } from "../interfaces/LoginResponse";
import { login } from "../services/authService";
import { LoginPage } from "./LoginPage";

vi.mock("../services/authService", () => ({
  login: vi.fn(),
}));

const loginMock = vi.mocked(login);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("LoginPage", () => {
  const onLoginSuccess = vi.fn();

  beforeEach(() => {
    onLoginSuccess.mockReset();
    loginMock.mockReset();
  });

  it("shows validation errors and does not call login when fields are empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByText("El usuario es requerido.")).toBeInTheDocument();
    expect(screen.getByText("La clave es requerida.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it("calls login with trimmed username and notifies success", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({
      token: "jwt-token",
      expiresAt: "2026-08-29T12:00:00Z",
    });
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByLabelText(/usuario/i), "  admin  ");
    await user.type(screen.getByLabelText(/clave/i), "secret");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        username: "admin",
        password: "secret",
      });
    });
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows invalid credentials message on 401 and does not succeed", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new ApiError(401, "Unauthorized"));
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByLabelText(/usuario/i), "admin");
    await user.type(screen.getByLabelText(/clave/i), "wrong");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      await screen.findByText("Credenciales inválidas."),
    ).toBeInTheDocument();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  it("disables the form and shows progress while login is pending", async () => {
    const user = userEvent.setup();
    const { promise, resolve } = deferred<LoginResponse>();
    loginMock.mockReturnValue(promise);
    render(<LoginPage onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByLabelText(/usuario/i), "admin");
    await user.type(screen.getByLabelText(/clave/i), "secret");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByLabelText(/usuario/i)).toBeDisabled();
    expect(screen.getByLabelText(/clave/i)).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(onLoginSuccess).not.toHaveBeenCalled();

    resolve({ token: "jwt-token", expiresAt: "2026-08-29T12:00:00Z" });
    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
