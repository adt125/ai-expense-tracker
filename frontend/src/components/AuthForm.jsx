import { useContext, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { ExpenseContext } from "../context/ExpenseContext";

const defaultValues = { email: "", password: "", full_name: "" };

export default function AuthForm() {
  const { login, register } = useContext(ExpenseContext);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    if (errorMessage) {
      setErrorMessage("");
    }
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail[0]?.msg || "Something went wrong. Please try again.";
    }

    return mode === "login"
      ? "Login failed. Please check your email and password and try again."
      : "Registration failed. Please review your details and try again.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
        return;
      }

      await register(form);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12} md={5}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(15,118,110,0.96) 0%, rgba(17,94,89,0.98) 100%)",
            color: "#FFFFFF",
          }}
        >
          <Typography variant="overline" sx={{ letterSpacing: "0.12em" }}>
            Expense Intelligence
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, maxWidth: 360 }}>
            Stay ahead of spending without losing clarity.
          </Typography>
          <Typography sx={{ mt: 2.5, color: alpha("#FFFFFF", 0.8) }}>
            Track transactions, watch your budget pace, and turn raw expenses into
            decisions.
          </Typography>

          <Stack spacing={2} sx={{ mt: 5 }}>
            {[
              "Bento-style command center for your daily financial view",
              "Analytics built around category insight and budget pressure",
              "A clean ledger for edits, search, and transaction review",
            ].map((item) => (
              <Paper
                key={item}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  borderColor: alpha("#FFFFFF", 0.16),
                  bgcolor: alpha("#FFFFFF", 0.08),
                  color: "#FFFFFF",
                }}
              >
                <Typography>{item}</Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h4">Welcome</Typography>
              <Typography color="text.secondary">
                Sign in to open your workspace or create a new account.
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, value) => value && setMode(value)}
              disabled={isSubmitting}
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="register">Register</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              <AlertTitle>{mode === "login" ? "Login failed" : "Registration failed"}</AlertTitle>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                fullWidth
              />
              {mode === "register" && (
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  fullWidth
                />
              )}
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null
                }
                sx={{ py: 1.3, mt: 1 }}
              >
                {isSubmitting
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                    ? "Enter Dashboard"
                    : "Create Account"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
