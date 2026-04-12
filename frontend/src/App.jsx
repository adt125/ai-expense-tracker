import { useContext } from "react";
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { ExpenseContext } from "./context/ExpenseContext";
import AuthForm from "./components/AuthForm";
import ExpenseForm from "./components/ExpenseForm";
import Dashboard from "./components/Dashboard";
import ReportCard from "./components/ReportCard";

function App() {
  const { token, currentUser, logout } = useContext(ExpenseContext);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
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
              {token && (
                <Typography variant="body2" color="text.secondary">
                  Signed in as {currentUser?.email}
                </Typography>
              )}
            </Box>
            {token && (
              <Button
                variant="outlined"
                onClick={logout}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                Logout
              </Button>
            )}
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Track expenses, monitor budget velocity, and receive spending health
            insights.
          </Typography>
        </Paper>

        {!token ? (
          <AuthForm />
        ) : (
          <Box>
            <Dashboard />
            <Box sx={{ mt: 4 }}>
              <ExpenseForm />
            </Box>
            <Box sx={{ mt: 4 }}>
              <ReportCard />
            </Box>
          </Box>
        )}
      </Container>
    </>
  );
}

export default App;
