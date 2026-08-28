import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

export function LoginPage() {
  const { token, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (token) {
    return <Navigate to="/empleados" replace />
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(usuario, clave)
      navigate('/empleados', { replace: true })
    } catch (problema) {
      const mensaje =
        problema instanceof ApiError && problema.status === 401
          ? 'Credenciales invalidas'
          : problema instanceof Error
            ? problema.message
            : 'No se pudo iniciar sesion'
      setError(mensaje)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: 380, maxWidth: '100%' }}>
        <CardContent component="form" onSubmit={manejarEnvio} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h1" color="primary" sx={{ fontWeight: 700 }}>
                Banco ProCredit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestion de empleados
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Usuario"
              value={usuario}
              onChange={(evento) => setUsuario(evento.target.value)}
              autoFocus
              required
              fullWidth
            />
            <TextField
              label="Clave"
              type="password"
              value={clave}
              onChange={(evento) => setClave(evento.target.value)}
              required
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" disabled={enviando} fullWidth>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
