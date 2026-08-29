import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ApiError } from "../api/client";
import { login } from "../services/authService";

type LoginPageProps = {
  onLoginSuccess: () => void;
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    let valid = true;
    if (!username.trim()) {
      setUsernameError("El usuario es requerido.");
      valid = false;
    } else {
      setUsernameError("");
    }
    if (!password) {
      setPasswordError("La clave es requerida.");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      onLoginSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Credenciales inválidas.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper elevation={3} sx={{ width: "100%", p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ProCredit
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Gestión de empleados — inicio de sesión
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Usuario"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={Boolean(usernameError)}
            helperText={usernameError}
            fullWidth
            required
            margin="normal"
            autoComplete="username"
            disabled={loading}
          />
          <TextField
            label="Clave"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(passwordError)}
            helperText={passwordError}
            fullWidth
            required
            margin="normal"
            autoComplete="current-password"
            disabled={loading}
          />

          {error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Ingresar"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
