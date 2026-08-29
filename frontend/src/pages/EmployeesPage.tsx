import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ApiError } from '../api/client';
import { NewEmployeeDialog } from '../components/NewEmployeeDialog';
import type { Catalog } from '../interfaces/Catalog';
import type { Empleado } from '../interfaces/Empleado';
import { logout } from '../services/authService';
import { getDepartamentos } from '../services/catalogService';
import { listEmployees } from '../services/employeeService';

type EmployeesPageProps = {
  onLogout: () => void;
};

const ALL_DEPARTMENTS = '';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function EmployeesPage({ onLogout }: EmployeesPageProps) {
  const [employees, setEmployees] = useState<Empleado[]>([]);
  const [departamentos, setDepartamentos] = useState<Catalog[]>([]);
  const [departamentoFilter, setDepartamentoFilter] =
    useState(ALL_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadGeneration = useRef(0);

  const handleAuthFailure = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        onLogout();
        return true;
      }

      return false;
    },
    [onLogout],
  );

  const loadEmployees = useCallback(
    async (departamento?: string) => {
      const generation = ++loadGeneration.current;

      setLoading(true);
      setError('');

      try {
        const data = await listEmployees(departamento);

        if (generation !== loadGeneration.current) {
          return;
        }

        setEmployees(data);
      } catch (err) {
        if (generation !== loadGeneration.current) {
          return;
        }

        if (handleAuthFailure(err)) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los empleados.',
        );

        setEmployees([]);
      } finally {
        if (generation === loadGeneration.current) {
          setLoading(false);
        }
      }
    },
    [handleAuthFailure],
  );

  useEffect(() => {
    return () => {
      loadGeneration.current += 1;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getDepartamentos()
      .then((deps) => {
        if (cancelled) {
          return;
        }

        setDepartamentos(deps);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        if (handleAuthFailure(err)) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los departamentos.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [handleAuthFailure]);

  useEffect(() => {
    const generation = ++loadGeneration.current;
    let cancelled = false;

    async function fetchEmployees() {
      try {
        const data = await listEmployees(
          departamentoFilter || undefined,
        );

        if (
          cancelled ||
          generation !== loadGeneration.current
        ) {
          return;
        }

        setEmployees(data);
        setError('');
      } catch (err) {
        if (
          cancelled ||
          generation !== loadGeneration.current
        ) {
          return;
        }

        if (handleAuthFailure(err)) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los empleados.',
        );

        setEmployees([]);
      } finally {
        if (
          !cancelled &&
          generation === loadGeneration.current
        ) {
          setLoading(false);
        }
      }
    }

    void fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, [departamentoFilter, handleAuthFailure]);

  function handleDepartmentChange(value: string) {
    setLoading(true);
    setError('');
    setDepartamentoFilter(value);
  }

  function handleLogout() {
    logout();
    onLogout();
  }

  function handleCreated() {
    setDialogOpen(false);
    setSuccessMessage('Empleado creado correctamente.');

    void loadEmployees(
      departamentoFilter || undefined,
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            ProCredit — Empleados
          </Typography>

          <Button
            color="inherit"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{ py: 3 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <FormControl
            sx={{ minWidth: 260 }}
            size="small"
          >
            <InputLabel id="filtro-departamento-label">
              Departamento
            </InputLabel>

            <Select
              labelId="filtro-departamento-label"
              label="Departamento"
              value={departamentoFilter}
              onChange={(event) =>
                handleDepartmentChange(event.target.value)
              }
            >
              <MenuItem value={ALL_DEPARTMENTS}>
                Todos
              </MenuItem>

              {departamentos.map((dep) => (
                <MenuItem
                  key={dep.id}
                  value={dep.nombre}
                >
                  {dep.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
          >
            Nuevo empleado
          </Button>
        </Box>

        {error ? (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}

        {!loading &&
        !error &&
        employees.length === 0 ? (
          <Alert severity="info">
            No se encontraron empleados.
          </Alert>
        ) : null}

        {!loading && employees.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Apellidos</TableCell>
                  <TableCell align="right">
                    Edad
                  </TableCell>
                  <TableCell>
                    Departamento
                  </TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell align="right">
                    Remuneración mensual
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.map((empleado) => (
                  <TableRow
                    key={empleado.empleadoId}
                    hover
                  >
                    <TableCell>
                      {empleado.numeroDocumento}
                    </TableCell>
                    <TableCell>
                      {empleado.nombres}
                    </TableCell>
                    <TableCell>
                      {empleado.apellidos}
                    </TableCell>
                    <TableCell align="right">
                      {empleado.edad}
                    </TableCell>
                    <TableCell>
                      {empleado.departamento}
                    </TableCell>
                    <TableCell>
                      {empleado.cargo}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(
                        empleado.remuneracionMensual,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Container>

      <NewEmployeeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}