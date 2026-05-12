import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha, useTheme } from "@mui/material/styles";
import { useContext, useMemo } from "react";
import { ExpenseContext } from "../../context/ExpenseContext";
import { buildCategoryData, formatCurrency } from "../../utility/utility";
import ChatContainer from "../chat/ChatContainer";
import ExpenseForm from "./ExpenseForm";
import RecentExpenses from "./RecentExpenses";
import TopSpendingChart from "./TopSpendingChart";

export default function Dashboard({
  selectedExpense,
  onClearSelection,
  onExpenseSaved,
  onViewAllTransactions,
}) {
  const { expenses, summary } = useContext(ExpenseContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const spent = Number(summary?.monthly_total || 0);
  const budget = Number(summary?.budget || 0);
  const remainingBudget = Math.max(budget - spent, 0);
  const today = new Date();
  const monthLabel = today.toLocaleString(undefined, { month: "long" });
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const daysLeft = Math.max(daysInMonth - dayOfMonth, 0);
  const dailyAvailable = remainingBudget / Math.max(daysLeft, 1);
  const backendProjectedSpend = Number(summary?.predicted_total);
  const hasBackendProjectedSpend =
    summary?.forecast_available && Number.isFinite(backendProjectedSpend);
  const budgetProgress = budget ? Math.min((spent / budget) * 100, 100) : 0;

  const categoryData = useMemo(() => buildCategoryData(expenses), [expenses]);
  const recentActivity = useMemo(
    () =>
      expenses
        .slice()
        // @ts-ignore
        .sort((first, second) => new Date(second.date) - new Date(first.date))
        .slice(0, 4),
    [expenses],
  );

  const cardSurface = {
    background: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(17,24,39,0.92) 100%)"
      : "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
    borderColor: isDark ? alpha("#94A3B8", 0.12) : "#E2E8F0",
  };

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            minHeight: 282,
            display: "flex",
            flexDirection: "column",
            ...cardSurface,
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {monthLabel} Spending
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "2.1rem", md: "2.65rem" },
              lineHeight: 1.08,
              letterSpacing: 0,
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            {formatCurrency(spent)}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1.5 }}>
            of {formatCurrency(budget)} used
          </Typography>

          <Box
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: isDark ? alpha("#475569", 0.7) : "#CBD5E1",
              overflow: "hidden",
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: `${budgetProgress}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #22C55E 0%, #14B8A6 100%)",
              }}
            />
          </Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.75 }}
          >
            <Typography variant="body2" color="text.secondary">
              {Math.round(budgetProgress)}% used
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(remainingBudget)} remaining
            </Typography>
          </Stack>

          <Stack
            spacing={1}
            sx={{
              mt: "auto",
              pt: 1.75,
              borderTop: 1,
              borderColor: isDark ? alpha("#94A3B8", 0.14) : "#E2E8F0",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.85rem", md: "2.25rem" },
                lineHeight: 1.08,
                letterSpacing: 0,
                fontWeight: 700,
                display: "flex",
                alignItems: "baseline",
                gap: 1,
                flexWrap: "wrap",
                color: "#34D399",
              }}
            >
              <Box component="span">{formatCurrency(remainingBudget)}</Box>
              <Box
                component="span"
                sx={{
                  fontSize: { xs: "1rem", md: "1.15rem" },
                  fontWeight: 600,
                  color: "text.secondary",
                }}
              >
                left
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.15rem" },
                lineHeight: 1.3,
                fontWeight: 600,
              }}
              color="text.secondary"
            >
              {formatCurrency(dailyAvailable)} per day available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {daysLeft} days left this month
            </Typography>
            {hasBackendProjectedSpend ? (
              <Typography variant="body2" color="text.secondary">
                On track for {formatCurrency(backendProjectedSpend)} by month
                end
              </Typography>
            ) : (
              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 420,
                  fontSize: "0.78rem",
                  lineHeight: 1.2,
                  opacity: 0.82,
                }}
              >
                * Forecast after 7 days of history.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <ExpenseForm
          variant="dashboard"
          selectedExpense={selectedExpense}
          onClearSelection={onClearSelection}
          onSubmitSuccess={onExpenseSaved}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TopSpendingChart
          categoryData={categoryData}
          cardSurface={cardSurface}
          isDark={isDark}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <RecentExpenses
          cardSurface={cardSurface}
          isDark={isDark}
          onViewAllTransactions={onViewAllTransactions}
          recentActivity={recentActivity}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <ChatContainer />
      </Grid>
    </Grid>
  );
}
