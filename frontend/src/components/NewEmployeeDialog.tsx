import { useEffect, useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { ApiError } from "../api/client";
import type { Catalog } from "../interfaces/Catalog";
import type { CreateEmployeeRequest } from "../interfaces/CreateEmployeeRequest";
import { getDepartments, getPositions } from "../services/catalogService";
import { createEmployee } from "../services/employeeService";

type NewEmployeeDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type FormErrors = Partial<Record<keyof CreateEmployeeRequest, string>>;

const emptyForm = {
  documentNumber: "",
  firstNames: "",
  lastNames: "",
  age: "",
  monthlySalary: "",
  departmentId: "",
  positionId: "",
};

export function NewEmployeeDialog({
  open,
  onClose,
  onCreated,
}: NewEmployeeDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [departments, setDepartments] = useState<Catalog[]>([]);
  const [positions, setPositions] = useState<Catalog[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    Promise.all([getDepartments(), getPositions()])
      .then(([deps, positionsList]) => {
        if (cancelled) {
          return;
        }
        setDepartments(deps);
        setPositions(positionsList);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof ApiError && err.status === 401)) {
          return;
        }
        setCatalogError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los catálogos.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCatalogs(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  function resetAndClose() {
    setForm(emptyForm);
    setErrors({});
    setSubmitError("");
    onClose();
  }

  function validate(): CreateEmployeeRequest | null {
    const nextErrors: FormErrors = {};
    const documentNumber = form.documentNumber.trim();
    const firstNames = form.firstNames.trim();
    const lastNames = form.lastNames.trim();
    const age = Number(form.age);
    const monthlySalary = Number(form.monthlySalary);
    const departmentId = Number(form.departmentId);
    const positionId = Number(form.positionId);

    if (documentNumber.length < 6 || documentNumber.length > 20) {
      nextErrors.documentNumber = "Debe tener entre 6 y 20 caracteres.";
    }
    if (!firstNames) {
      nextErrors.firstNames = "Los nombres son requeridos.";
    } else if (firstNames.length > 100) {
      nextErrors.firstNames = "Máximo 100 caracteres.";
    }
    if (!lastNames) {
      nextErrors.lastNames = "Los apellidos son requeridos.";
    } else if (lastNames.length > 100) {
      nextErrors.lastNames = "Máximo 100 caracteres.";
    }
    if (!Number.isInteger(age) || age < 18 || age > 100) {
      nextErrors.age = "La edad debe estar entre 18 y 100.";
    }
    if (!(monthlySalary > 0)) {
      nextErrors.monthlySalary = "La remuneración debe ser mayor que 0.";
    }
    if (!Number.isInteger(departmentId) || departmentId < 1) {
      nextErrors.departmentId = "Seleccione un departamento.";
    }
    if (!Number.isInteger(positionId) || positionId < 1) {
      nextErrors.positionId = "Seleccione un cargo.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      documentNumber,
      firstNames,
      lastNames,
      age,
      monthlySalary,
      departmentId,
      positionId,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError("");
    const payload = validate();
    if (!payload) {
      return;
    }

    setSubmitting(true);
    try {
      await createEmployee(payload);
      setForm(emptyForm);
      setErrors({});
      onCreated();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return;
      }
      if (err instanceof ApiError) {
        setSubmitError(err.detail || err.message);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("No se pudo crear el empleado.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : resetAndClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Nuevo empleado</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          {loadingCatalogs ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {catalogError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {catalogError}
            </Alert>
          ) : null}

          <TextField
            label="Número de documento"
            value={form.documentNumber}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, documentNumber: e.target.value }))
            }
            error={Boolean(errors.documentNumber)}
            helperText={errors.documentNumber}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="Nombres"
            value={form.firstNames}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, firstNames: e.target.value }))
            }
            error={Boolean(errors.firstNames)}
            helperText={errors.firstNames}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="Apellidos"
            value={form.lastNames}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, lastNames: e.target.value }))
            }
            error={Boolean(errors.lastNames)}
            helperText={errors.lastNames}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="Edad"
            type="number"
            value={form.age}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, age: e.target.value }))
            }
            error={Boolean(errors.age)}
            helperText={errors.age}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
            slotProps={{ htmlInput: { min: 18, max: 100 } }}
          />
          <TextField
            label="Remuneración mensual"
            type="number"
            value={form.monthlySalary}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                monthlySalary: e.target.value,
              }))
            }
            error={Boolean(errors.monthlySalary)}
            helperText={errors.monthlySalary}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          />

          <FormControl
            fullWidth
            margin="normal"
            error={Boolean(errors.departmentId)}
            disabled={submitting}
          >
            <InputLabel id="department-label">Departamento</InputLabel>
            <Select
              labelId="department-label"
              label="Departamento"
              value={form.departmentId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  departmentId: String(e.target.value),
                }))
              }
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccione…</em>
              </MenuItem>
              {departments.map((dep) => (
                <MenuItem key={dep.id} value={String(dep.id)}>
                  {dep.name}
                </MenuItem>
              ))}
            </Select>
            {errors.departmentId ? (
              <FormHelperText>{errors.departmentId}</FormHelperText>
            ) : null}
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
            error={Boolean(errors.positionId)}
            disabled={submitting}
          >
            <InputLabel id="position-label">Cargo</InputLabel>
            <Select
              labelId="position-label"
              label="Cargo"
              value={form.positionId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  positionId: String(e.target.value),
                }))
              }
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccione…</em>
              </MenuItem>
              {positions.map((position) => (
                <MenuItem key={position.id} value={String(position.id)}>
                  {position.name}
                </MenuItem>
              ))}
            </Select>
            {errors.positionId ? (
              <FormHelperText>{errors.positionId}</FormHelperText>
            ) : null}
          </FormControl>

          {submitError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={resetAndClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || loadingCatalogs || Boolean(catalogError)}
          >
            {submitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
