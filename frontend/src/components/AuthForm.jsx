import { useState, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ExpenseContext } from "../context/ExpenseContext";

const defaultValues = { email: "", password: "", full_name: "" };

export default function AuthForm() {
  const { login, register } = useContext(ExpenseContext);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultValues);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "login") {
      await login(form.email, form.password);
    } else {
      await register(form);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">Welcome back</Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, value) => value && setMode(value)}
        >
          <ToggleButton value="login">Login</ToggleButton>
          <ToggleButton value="register">Register</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        {mode === "register" && (
          <TextField
            label="Full Name"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        )}
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
        >
          {mode === "login" ? "Login" : "Create account"}
        </Button>
      </Box>
    </Paper>
  );
}
