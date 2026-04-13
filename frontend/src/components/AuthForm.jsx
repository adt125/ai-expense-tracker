import { useContext, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { alpha } from "@mui/material/styles";
import { ExpenseContext } from "../context/ExpenseContext";

const defaultValues = { email: "", password: "", full_name: "" };

export default function AuthForm() {
  const { login, register } = useContext(ExpenseContext);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(defaultValues);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mode === "login") {
      await login(form.email, form.password);
      return;
    }

    await register(form);
  };

  return (
    <Grid2 container spacing={3} alignItems="stretch">
      <Grid2 xs={12} md={5}>
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
      </Grid2>

      <Grid2 xs={12} md={7}>
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
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="register">Register</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
              {mode === "register" && (
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  fullWidth
                />
              )}
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" sx={{ py: 1.3, mt: 1 }}>
                {mode === "login" ? "Enter Dashboard" : "Create Account"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Grid2>
    </Grid2>
  );
}
