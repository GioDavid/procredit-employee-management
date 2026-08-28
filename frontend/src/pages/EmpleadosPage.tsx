import { useCallback, useEffect, useRef, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { consultarEmpleados } from '../api/empleados'
import { useAuth } from '../auth/useAuth'
import type { Empleado } from '../types'
import { NuevoEmpleadoDialog } from './NuevoEmpleadoDialog'

const formatoMoneda = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2 })

export function EmpleadosPage() {
  const { token, cerrarSesion } = useAuth()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const cargar = useCallback(
    async (departamento: string) => {
      if (!token) {
        return
      }
      setCargando(true)
      setError(null)
      try {
        setEmpleados(await consultarEmpleados(token, departamento))
      } catch (problema) {
        setError(problema instanceof Error ? problema.message : 'No se pudo cargar el listado')
        setEmpleados([])
      } finally {
        setCargando(false)
      }
    },
    [token],
  )

  // Primera carga inmediata al montar (FR-UI-04); despues, busqueda por coincidencias
  // con debounce, donde el texto vacio restaura el listado completo (FR-UI-05).
  const montado = useRef(false)
  useEffect(() => {
    if (!montado.current) {
      montado.current = true
      void cargar('')
      return
    }
    const temporizador = setTimeout(() => void cargar(busqueda), 350)
    return () => clearTimeout(temporizador)
  }, [busqueda, cargar])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Banco ProCredit · Empleados
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={cerrarSesion}>
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Buscar por departamento"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalAbierto(true)}
            sx={{ whiteSpace: 'nowrap', px: 3 }}
          >
            Nuevo empleado
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Documento</TableCell>
                <TableCell>Nombres</TableCell>
                <TableCell>Apellidos</TableCell>
                <TableCell align="right">Edad</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell align="right">Remuneracion mensual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}

              {!cargando && empleados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No se encontraron empleados</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!cargando &&
                empleados.map((empleado) => (
                  <TableRow key={empleado.empleadoId} hover>
                    <TableCell>{empleado.numeroDocumento}</TableCell>
                    <TableCell>{empleado.nombres}</TableCell>
                    <TableCell>{empleado.apellidos}</TableCell>
                    <TableCell align="right">{empleado.edad}</TableCell>
                    <TableCell>{empleado.departamento}</TableCell>
                    <TableCell>{empleado.cargo}</TableCell>
                    <TableCell align="right">{formatoMoneda.format(empleado.remuneracionMensual)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {modalAbierto && (
        <NuevoEmpleadoDialog
          onCerrar={() => setModalAbierto(false)}
          onCreado={(empleado) => {
            setModalAbierto(false)
            setAviso(`Empleado ${empleado.nombres} ${empleado.apellidos} registrado`)
            void cargar(busqueda)
          }}
        />
      )}

      <Snackbar
        open={aviso !== null}
        autoHideDuration={4000}
        onClose={() => setAviso(null)}
        message={aviso ?? ''}
      />
    </Box>
  )
}
