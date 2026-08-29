import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ApiError } from "../api/client";
import { NewEmployeeDialog } from "../components/NewEmployeeDialog";
import type { Catalog } from "../interfaces/Catalog";
import type { Employee } from "../interfaces/Employee";
import { logout } from "../services/authService";
import { getDepartments } from "../services/catalogService";
import { listEmployees } from "../services/employeeService";

type EmployeesPageProps = {
  onLogout: () => void;
};

const ALL_DEPARTMENTS = "";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function EmployeesPage({ onLogout }: EmployeesPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Catalog[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState(ALL_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    async (department?: string) => {
      const generation = ++loadGeneration.current;

      setLoading(true);
      setError("");

      try {
        const data = await listEmployees(department);

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
            : "No se pudieron cargar los empleados.",
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

    getDepartments()
      .then((deps) => {
        if (cancelled) {
          return;
        }

        setDepartments(deps);
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
            : "No se pudieron cargar los departamentos.",
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
        const data = await listEmployees(departmentFilter || undefined);

        if (cancelled || generation !== loadGeneration.current) {
          return;
        }

        setEmployees(data);
        setError("");
      } catch (err) {
        if (cancelled || generation !== loadGeneration.current) {
          return;
        }

        if (handleAuthFailure(err)) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los empleados.",
        );

        setEmployees([]);
      } finally {
        if (!cancelled && generation === loadGeneration.current) {
          setLoading(false);
        }
      }
    }

    void fetchEmployees();

    return () => {
      cancelled = true;
    };
  }, [departmentFilter, handleAuthFailure]);

  function handleDepartmentChange(value: string) {
    setLoading(true);
    setError("");
    setDepartmentFilter(value);
  }

  function handleLogout() {
    logout();
    onLogout();
  }

  function handleCreated() {
    setDialogOpen(false);
    setSuccessMessage("Empleado creado correctamente.");

    void loadEmployees(departmentFilter || undefined);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ProCredit — Empleados
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <FormControl sx={{ minWidth: 260 }} size="small">
            <InputLabel id="department-filter-label">Departamento</InputLabel>

            <Select
              labelId="department-filter-label"
              label="Departamento"
              value={departmentFilter}
              onChange={(event) => handleDepartmentChange(event.target.value)}
            >
              <MenuItem value={ALL_DEPARTMENTS}>Todos</MenuItem>

              {departments.map((dep) => (
                <MenuItem key={dep.id} value={dep.name}>
                  {dep.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Nuevo empleado
          </Button>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}

        {!loading && !error && employees.length === 0 ? (
          <Alert severity="info">No se encontraron empleados.</Alert>
        ) : null}

        {!loading && employees.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell>Nombres</TableCell>
                  <TableCell>Apellidos</TableCell>
                  <TableCell align="right">Edad</TableCell>
                  <TableCell>Departamento</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell align="right">Remuneración mensual</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.employeeId} hover>
                    <TableCell>{employee.documentNumber}</TableCell>
                    <TableCell>{employee.firstNames}</TableCell>
                    <TableCell>{employee.lastNames}</TableCell>
                    <TableCell align="right">{employee.age}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(employee.monthlySalary)}
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
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
