import { useContext, useMemo, useState } from "react";
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ExpenseContext } from "./context/ExpenseContext";
import AuthForm from "./components/AuthForm";
import ExpenseForm from "./components/ExpenseForm";
import Dashboard from "./components/Dashboard";
import ReportCard from "./components/ReportCard";
import RecentExpenses from "./components/RecentExpenses";

function App() {
  const { token, currentUser, logout, summary } = useContext(ExpenseContext);
  const [view, setView] = useState("home");
  const [mode, setMode] = useState("light");
  const [selectedExpense, setSelectedExpense] = useState(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#1976d2",
          },
          secondary: {
            main: "#ff9800",
          },
          background: {
            default: mode === "light" ? "#f4f6fb" : "#101820",
            paper: mode === "light" ? "#ffffff" : "#16202c",
          },
        },
        shape: {
          borderRadius: 20,
        },
        typography: {
          fontFamily: "Inter, Roboto, Arial, sans-serif",
        },
      }),
    [mode],
  );

  const displayName = currentUser?.full_name || currentUser?.email || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const renderHomeCards = () => (
    <Box display="grid" gap={3}>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          minHeight: 150,
        }}
      >
        <Typography variant="overline">Combined spend</Typography>
        <Typography variant="h3" sx={{ mt: 1 }}>
          ₹{summary?.monthly_total?.toFixed(2) ?? "0.00"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
          This month’s total expenses across categories.
        </Typography>
      </Paper>
      <Paper elevation={4} sx={{ p: 3, minHeight: 150 }}>
        <Typography variant="overline" color="text.secondary">
          Projected spend
        </Typography>
        <Typography variant="h3" sx={{ mt: 1 }}>
          ₹{summary?.predicted_total?.toFixed(2) ?? "0.00"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {summary?.forecast_available
            ? `Days remaining: ${summary.days_remaining}`
            : "Forecast available after 7 days of activity."}
        </Typography>
      </Paper>
      <Paper elevation={4} sx={{ p: 3, display: "grid", gap: 1 }}>
        <Typography variant="overline" color="text.secondary">
          Fast insights
        </Typography>
        <Typography>
          Use the buttons on the left to switch between your dashboard,
          analysis, and expense entry.
        </Typography>
      </Paper>
    </Box>
  );

  const renderPage = () => {
    switch (view) {
      case "dashboard":
        return <Dashboard />;
      case "analyse":
        return <ReportCard />;
      case "add":
        return (
          <ExpenseForm
            selectedExpense={selectedExpense}
            onClearSelection={() => setSelectedExpense(null)}
          />
        );
      default:
        return (
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom>
              Home summary
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Quick look at your spend performance, projections, and recent
              activity.
            </Typography>
            {renderHomeCards()}
          </Paper>
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={4}
          sx={{
            p: 3,
            mb: 4,
            background:
              mode === "light"
                ? "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)"
                : "linear-gradient(135deg, #0f1729 0%, #1f2937 100%)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Expense Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track spending, forecast budgets, and view recent activity.
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {token && (
                <Tooltip
                  title={
                    mode === "light"
                      ? "Switch to dark mode"
                      : "Switch to light mode"
                  }
                >
                  <IconButton
                    onClick={() =>
                      setMode((prev) => (prev === "light" ? "dark" : "light"))
                    }
                    color="inherit"
                  >
                    {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                  </IconButton>
                </Tooltip>
              )}
              {token && (
                <Button variant="outlined" onClick={logout}>
                  Logout
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {!token ? (
          <AuthForm />
        ) : (
          <Box
            display="flex"
            gap={3}
            flexDirection={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "flex-start" }}
          >
            <Box sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0 }}>
              <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{ bgcolor: "secondary.main", width: 64, height: 64 }}
                  >
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{displayName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentUser?.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {[
                    { label: "Home", key: "home", icon: <HomeIcon /> },
                    {
                      label: "Dashboard",
                      key: "dashboard",
                      icon: <DashboardIcon />,
                    },
                    {
                      label: "Analyse",
                      key: "analyse",
                      icon: <AnalyticsIcon />,
                    },
                    {
                      label: "Add new",
                      key: "add",
                      icon: <AddCircleIcon />,
                    },
                  ].map((item) => (
                    <Button
                      key={item.key}
                      variant={view === item.key ? "contained" : "outlined"}
                      color={view === item.key ? "primary" : "inherit"}
                      fullWidth
                      startIcon={item.icon}
                      sx={{
                        textTransform: "none",
                        justifyContent: "flex-start",
                      }}
                      onClick={() => {
                        setView(item.key);
                        if (item.key === "add") {
                          setSelectedExpense(null);
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>{renderPage()}</Box>

            {view === "home" && (
              <Box sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0 }}>
                <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent expenses
                  </Typography>
                  <RecentExpenses />
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
