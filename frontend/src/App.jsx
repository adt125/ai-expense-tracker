import { useContext, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ThemeProvider, alpha, createTheme } from "@mui/material/styles";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import ReportCard from "./components/ReportCard";
import TransactionsView from "./components/TransactionsView";
import BudgetsGoalsView from "./components/BudgetsGoalsView";
import { ExpenseContext } from "./context/ExpenseContext";

const drawerWidth = 248;

const navigationItems = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardRoundedIcon /> },
  { key: "analytics", label: "Analytics", icon: <TimelineRoundedIcon /> },
  {
    key: "transactions",
    label: "Transactions",
    icon: <ReceiptLongRoundedIcon />,
  },
  { key: "budgets", label: "Budgets & Goals", icon: <SavingsRoundedIcon /> },
];

function App() {
  const { token, currentUser, logout } = useContext(ExpenseContext);
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [mode, setMode] = useState(
    () => localStorage.getItem("expense_theme_mode") || "light",
  );
  const isDesktop = useMediaQuery("(min-width:900px)");
  const isDark = mode === "dark";

  useEffect(() => {
    localStorage.setItem("expense_theme_mode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        shape: { borderRadius: 12 },
        palette: {
          mode,
          primary: { main: "#6366F1" },
          secondary: { main: "#10B981" },
          error: { main: "#F43F5E" },
          warning: { main: "#F59E0B" },
          info: { main: "#0F766E" },
          background: {
            default: isDark ? "#020617" : "#F8FAFC",
            paper: isDark ? "#0F172A" : "#FFFFFF",
          },
          text: {
            primary: isDark ? "#E2E8F0" : "#0F172A",
            secondary: isDark ? "#94A3B8" : "#475569",
          },
          divider: isDark ? "#1E293B" : "#E2E8F0",
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
          fontSize: 14,
          h3: {
            fontWeight: 700,
            letterSpacing: "-0.04em",
            fontSize: "1.65rem",
          },
          h4: { fontWeight: 700, letterSpacing: "-0.04em", fontSize: "2rem" },
          h5: { fontWeight: 700, fontSize: "1.2rem" },
          h6: { fontWeight: 700, fontSize: "1rem" },
          body1: { fontSize: "0.95rem" },
          body2: { fontSize: "0.95rem" },
          button: {
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                background: isDark
                  ? "radial-gradient(circle at top, rgba(99,102,241,0.16), transparent 28%), #020617"
                  : "radial-gradient(circle at top, rgba(99,102,241,0.08), transparent 28%), #F8FAFC",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                borderRight: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                backgroundColor: isDark ? "#020617" : "#F8FAFC",
              },
            },
          },
          MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                border: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
                backgroundImage: "none",
                boxShadow: isDark
                  ? "0 18px 40px rgba(2, 6, 23, 0.55)"
                  : "0 10px 30px rgba(15, 23, 42, 0.05)",
              },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: 12,
                paddingInline: 16,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              input: {
                color: isDark ? "#E2E8F0" : "#0F172A",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderColor: isDark ? "#334155" : undefined,
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                marginBottom: 6,
                "&.Mui-selected": {
                  backgroundColor: "#0F766E",
                  color: "#FFFFFF",
                  "& .MuiListItemIcon-root": {
                    color: "#FFFFFF",
                  },
                },
              },
            },
          },
        },
      }),
    [isDark, mode],
  );

  const displayName = currentUser?.full_name || currentUser?.email || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const handleNavigate = (nextView) => {
    setView(nextView);
    setMobileOpen(false);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setView("dashboard");
    setMobileOpen(false);
  };

  const handleExpenseSaved = (mode) => {
    if (mode === "edit") {
      setSelectedExpense(null);
      setView("transactions");
    }
  };

  const renderPage = () => {
    if (view === "analytics") {
      return <ReportCard />;
    }
    if (view === "transactions") {
      return <TransactionsView onEditExpense={handleEditExpense} />;
    }
    if (view === "budgets") {
      return <BudgetsGoalsView />;
    }

    return (
      <Dashboard
        selectedExpense={selectedExpense}
        onClearSelection={() => setSelectedExpense(null)}
        onExpenseSaved={handleExpenseSaved}
        onViewAllTransactions={() => handleNavigate("transactions")}
      />
    );
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        px: 2,
        py: 2.5,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 1, mb: 4 }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "#FFFFFF",
            background: "linear-gradient(180deg, #0F766E 0%, #115E59 100%)",
          }}
        >
          <AccountBalanceWalletRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="h6">Expenso</Typography>
      </Stack>

      <List disablePadding>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={view === item.key}
            onClick={() => handleNavigate(item.key)}
            sx={{ py: 1.2 }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: "0.92rem" }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      <List disablePadding>
        <ListItemButton onClick={logout} sx={{ py: 1.2 }}>
          <ListItemIcon sx={{ minWidth: 38 }}>
            <SettingsRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            secondary="Sign out safely"
            primaryTypographyProps={{ fontSize: "0.92rem" }}
            secondaryTypographyProps={{ fontSize: "0.78rem" }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  const themeToggleButton = (
    <IconButton
      sx={{
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
      onClick={() =>
        setMode((current) => (current === "light" ? "dark" : "light"))
      }
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
    </IconButton>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!token ? (
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            px: 2,
            py: 4,
            position: "relative",
          }}
        >
          <Box sx={{ position: "absolute", top: 24, right: 24 }}>
            {themeToggleButton}
          </Box>
          <Box sx={{ width: "100%", maxWidth: 1100 }}>
            <AuthForm />
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <Drawer
            variant={isDesktop ? "permanent" : "temporary"}
            open={isDesktop ? true : mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            {drawerContent}
          </Drawer>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Toolbar
              disableGutters
              sx={{
                px: { xs: 2, md: 4 },
                py: 3,
                minHeight: "unset",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {!isDesktop && (
                  <IconButton onClick={() => setMobileOpen(true)}>
                    <MenuRoundedIcon />
                  </IconButton>
                )}
                <Box>
                  <Typography variant="h4">
                    {navigationItems.find((item) => item.key === view)?.label ||
                      "Dashboard"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    A focused finance workspace for tracking, reviewing, and
                    planning.
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                {themeToggleButton}
                <IconButton
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Badge color="error" variant="dot">
                    <NotificationsNoneRoundedIcon />
                  </Badge>
                </IconButton>
                <Avatar
                  sx={{
                    bgcolor: alpha("#0F766E", 0.95),
                    color: "#FFFFFF",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
              </Stack>
            </Toolbar>

            <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>{renderPage()}</Box>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
