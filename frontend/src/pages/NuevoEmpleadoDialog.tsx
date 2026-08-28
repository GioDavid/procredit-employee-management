import { useEffect, useState, type FormEvent } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { crearEmpleado, obtenerCargos, obtenerDepartamentos } from '../api/empleados'
import { useAuth } from '../auth/useAuth'
import type { Catalogo, Empleado } from '../types'

interface Props {
  onCerrar: () => void
  onCreado: (empleado: Empleado) => void
}

interface Formulario {
  numeroDocumento: string
  nombres: string
  apellidos: string
  edad: string
  remuneracionMensual: string
  departamentoId: string
  cargoId: string
}

const FORMULARIO_VACIO: Formulario = {
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  edad: '',
  remuneracionMensual: '',
  departamentoId: '',
  cargoId: '',
}

/** Validacion en cliente espejo de las reglas de la API (SPEC §3.3). */
function validar(formulario: Formulario): Partial<Record<keyof Formulario, string>> {
  const errores: Partial<Record<keyof Formulario, string>> = {}
  const edad = Number(formulario.edad)
  const remuneracion = Number(formulario.remuneracionMensual)

  if (formulario.numeroDocumento.trim().length < 6 || formulario.numeroDocumento.trim().length > 20) {
    errores.numeroDocumento = 'Entre 6 y 20 caracteres'
  }
  if (formulario.nombres.trim().length === 0) {
    errores.nombres = 'Requerido'
  }
  if (formulario.apellidos.trim().length === 0) {
    errores.apellidos = 'Requerido'
  }
  if (!Number.isInteger(edad) || edad < 18 || edad > 100) {
    errores.edad = 'Entre 18 y 100'
  }
  if (!(remuneracion > 0)) {
    errores.remuneracionMensual = 'Debe ser mayor que 0'
  }
  if (formulario.departamentoId === '') {
    errores.departamentoId = 'Requerido'
  }
  if (formulario.cargoId === '') {
    errores.cargoId = 'Requerido'
  }
  return errores
}

/** Se monta solo mientras esta abierto, por lo que el estado del formulario nace limpio. */
export function NuevoEmpleadoDialog({ onCerrar, onCreado }: Props) {
  const { token } = useAuth()
  const [formulario, setFormulario] = useState<Formulario>(FORMULARIO_VACIO)
  const [errores, setErrores] = useState<Partial<Record<keyof Formulario, string>>>({})
  const [departamentos, setDepartamentos] = useState<Catalogo[]>([])
  const [cargos, setCargos] = useState<Catalogo[]>([])
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }
    Promise.all([obtenerDepartamentos(token), obtenerCargos(token)])
      .then(([listaDepartamentos, listaCargos]) => {
        setDepartamentos(listaDepartamentos)
        setCargos(listaCargos)
      })
      .catch((problema: unknown) => {
        setErrorServidor(problema instanceof Error ? problema.message : 'No se pudieron cargar los catalogos')
      })
  }, [token])

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault()
    if (!token) {
      return
    }

    const erroresActuales = validar(formulario)
    setErrores(erroresActuales)
    if (Object.keys(erroresActuales).length > 0) {
      return
    }

    setErrorServidor(null)
    setEnviando(true)
    try {
      const creado = await crearEmpleado(token, {
        numeroDocumento: formulario.numeroDocumento.trim(),
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        edad: Number(formulario.edad),
        remuneracionMensual: Number(formulario.remuneracionMensual),
        departamentoId: Number(formulario.departamentoId),
        cargoId: Number(formulario.cargoId),
      })
      onCreado(creado)
    } catch (problema) {
      setErrorServidor(problema instanceof Error ? problema.message : 'No se pudo registrar el empleado')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
      <form onSubmit={manejarEnvio}>
        <DialogTitle>Registrar empleado</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorServidor && <Alert severity="error">{errorServidor}</Alert>}

            <TextField
              label="Numero de documento"
              value={formulario.numeroDocumento}
              onChange={(evento) => actualizar('numeroDocumento', evento.target.value)}
              error={Boolean(errores.numeroDocumento)}
              helperText={errores.numeroDocumento}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Nombres"
                value={formulario.nombres}
                onChange={(evento) => actualizar('nombres', evento.target.value)}
                error={Boolean(errores.nombres)}
                helperText={errores.nombres}
                fullWidth
              />
              <TextField
                label="Apellidos"
                value={formulario.apellidos}
                onChange={(evento) => actualizar('apellidos', evento.target.value)}
                error={Boolean(errores.apellidos)}
                helperText={errores.apellidos}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Edad"
                type="number"
                value={formulario.edad}
                onChange={(evento) => actualizar('edad', evento.target.value)}
                error={Boolean(errores.edad)}
                helperText={errores.edad}
                fullWidth
              />
              <TextField
                label="Remuneracion mensual"
                type="number"
                value={formulario.remuneracionMensual}
                onChange={(evento) => actualizar('remuneracionMensual', evento.target.value)}
                error={Boolean(errores.remuneracionMensual)}
                helperText={errores.remuneracionMensual}
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Departamento"
              value={formulario.departamentoId}
              onChange={(evento) => actualizar('departamentoId', evento.target.value)}
              error={Boolean(errores.departamentoId)}
              helperText={errores.departamentoId}
              fullWidth
            >
              {departamentos.map((departamento) => (
                <MenuItem key={departamento.id} value={String(departamento.id)}>
                  {departamento.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Cargo"
              value={formulario.cargoId}
              onChange={(evento) => actualizar('cargoId', evento.target.value)}
              error={Boolean(errores.cargoId)}
              helperText={errores.cargoId}
              fullWidth
            >
              {cargos.map((cargo) => (
                <MenuItem key={cargo.id} value={String(cargo.id)}>
                  {cargo.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
