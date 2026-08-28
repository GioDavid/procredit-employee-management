import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaPrivada } from './auth/RutaPrivada'
import { LoginPage } from './pages/LoginPage'
import { EmpleadosPage } from './pages/EmpleadosPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/empleados"
        element={
          <RutaPrivada>
            <EmpleadosPage />
          </RutaPrivada>
        }
      />
      <Route path="*" element={<Navigate to="/empleados" replace />} />
    </Routes>
  )
}
