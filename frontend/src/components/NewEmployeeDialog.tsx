import { useEffect, useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { ApiError } from '../api/client';
import type { Catalog } from '../interfaces/Catalog';
import type { CreateEmployeeRequest } from '../interfaces/CreateEmployeeRequest';
import { getCargos, getDepartamentos } from '../services/catalogService';
import { createEmployee } from '../services/employeeService';

type NewEmployeeDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type FormErrors = Partial<Record<keyof CreateEmployeeRequest, string>>;

const emptyForm = {
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  edad: '',
  remuneracionMensual: '',
  departamentoId: '',
  cargoId: '',
};

export function NewEmployeeDialog({ open, onClose, onCreated }: NewEmployeeDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [departamentos, setDepartamentos] = useState<Catalog[]>([]);
  const [cargos, setCargos] = useState<Catalog[]>([]);
  const [catalogError, setCatalogError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    Promise.all([getDepartamentos(), getCargos()])
      .then(([deps, cargosList]) => {
        if (cancelled) {
          return;
        }
        setDepartamentos(deps);
        setCargos(cargosList);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof ApiError && err.status === 401)) {
          return;
        }
        setCatalogError(err instanceof Error ? err.message : 'No se pudieron cargar los catálogos.');
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
    setSubmitError('');
    onClose();
  }

  function validate(): CreateEmployeeRequest | null {
    const nextErrors: FormErrors = {};
    const numeroDocumento = form.numeroDocumento.trim();
    const nombres = form.nombres.trim();
    const apellidos = form.apellidos.trim();
    const edad = Number(form.edad);
    const remuneracionMensual = Number(form.remuneracionMensual);
    const departamentoId = Number(form.departamentoId);
    const cargoId = Number(form.cargoId);

    if (numeroDocumento.length < 6 || numeroDocumento.length > 20) {
      nextErrors.numeroDocumento = 'Debe tener entre 6 y 20 caracteres.';
    }
    if (!nombres) {
      nextErrors.nombres = 'Los nombres son requeridos.';
    } else if (nombres.length > 100) {
      nextErrors.nombres = 'Máximo 100 caracteres.';
    }
    if (!apellidos) {
      nextErrors.apellidos = 'Los apellidos son requeridos.';
    } else if (apellidos.length > 100) {
      nextErrors.apellidos = 'Máximo 100 caracteres.';
    }
    if (!Number.isInteger(edad) || edad < 18 || edad > 100) {
      nextErrors.edad = 'La edad debe estar entre 18 y 100.';
    }
    if (!(remuneracionMensual > 0)) {
      nextErrors.remuneracionMensual = 'La remuneración debe ser mayor que 0.';
    }
    if (!Number.isInteger(departamentoId) || departamentoId < 1) {
      nextErrors.departamentoId = 'Seleccione un departamento.';
    }
    if (!Number.isInteger(cargoId) || cargoId < 1) {
      nextErrors.cargoId = 'Seleccione un cargo.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      numeroDocumento,
      nombres,
      apellidos,
      edad,
      remuneracionMensual,
      departamentoId,
      cargoId,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError('');
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
        setSubmitError('No se pudo crear el empleado.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={submitting ? undefined : resetAndClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo empleado</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          {loadingCatalogs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
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
            value={form.numeroDocumento}
            onChange={(e) => setForm((prev) => ({ ...prev, numeroDocumento: e.target.value }))}
            error={Boolean(errors.numeroDocumento)}
            helperText={errors.numeroDocumento}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="Nombres"
            value={form.nombres}
            onChange={(e) => setForm((prev) => ({ ...prev, nombres: e.target.value }))}
            error={Boolean(errors.nombres)}
            helperText={errors.nombres}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="Apellidos"
            value={form.apellidos}
            onChange={(e) => setForm((prev) => ({ ...prev, apellidos: e.target.value }))}
            error={Boolean(errors.apellidos)}
            helperText={errors.apellidos}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="Edad"
            type="number"
            value={form.edad}
            onChange={(e) => setForm((prev) => ({ ...prev, edad: e.target.value }))}
            error={Boolean(errors.edad)}
            helperText={errors.edad}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
            slotProps={{ htmlInput: { min: 18, max: 100 } }}
          />
          <TextField
            label="Remuneración mensual"
            type="number"
            value={form.remuneracionMensual}
            onChange={(e) => setForm((prev) => ({ ...prev, remuneracionMensual: e.target.value }))}
            error={Boolean(errors.remuneracionMensual)}
            helperText={errors.remuneracionMensual}
            fullWidth
            required
            margin="normal"
            disabled={submitting}
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          />

          <FormControl fullWidth margin="normal" error={Boolean(errors.departamentoId)} disabled={submitting}>
            <InputLabel id="departamento-label">Departamento</InputLabel>
            <Select
              labelId="departamento-label"
              label="Departamento"
              value={form.departamentoId}
              onChange={(e) => setForm((prev) => ({ ...prev, departamentoId: String(e.target.value) }))}
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccione…</em>
              </MenuItem>
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={String(dep.id)}>
                  {dep.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.departamentoId ? <FormHelperText>{errors.departamentoId}</FormHelperText> : null}
          </FormControl>

          <FormControl fullWidth margin="normal" error={Boolean(errors.cargoId)} disabled={submitting}>
            <InputLabel id="cargo-label">Cargo</InputLabel>
            <Select
              labelId="cargo-label"
              label="Cargo"
              value={form.cargoId}
              onChange={(e) => setForm((prev) => ({ ...prev, cargoId: String(e.target.value) }))}
              displayEmpty
            >
              <MenuItem value="">
                <em>Seleccione…</em>
              </MenuItem>
              {cargos.map((cargo) => (
                <MenuItem key={cargo.id} value={String(cargo.id)}>
                  {cargo.nombre}
                </MenuItem>
              ))}
            </Select>
            {errors.cargoId ? <FormHelperText>{errors.cargoId}</FormHelperText> : null}
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
          <Button type="submit" variant="contained" disabled={submitting || loadingCatalogs || Boolean(catalogError)}>
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
