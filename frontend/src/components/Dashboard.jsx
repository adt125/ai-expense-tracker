import { useContext, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ExpenseContext } from "../context/ExpenseContext";
import ExpenseForm from "./ExpenseForm";
import RecentExpenses from "./RecentExpenses";

const categoryColors = ["#0F766E", "#14B8A6", "#FB7185", "#FDBA74", "#6366F1"];

const subscriptionItems = [
  { name: "Netflix", due: "15 days left", amount: "₹799", accent: "#111827" },
  { name: "Spotify", due: "5 days left", amount: "₹119", accent: "#10B981" },
  { name: "Cloud Storage", due: "Renews in 11 days", amount: "₹245", accent: "#6366F1" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function buildCashFlowData(expenses) {
  const grouped = new Map();

  expenses.forEach((expense) => {
    const monthLabel = new Intl.DateTimeFormat("en", {
      month: "short",
    }).format(new Date(expense.date));
    const current = grouped.get(monthLabel) || { expenses: 0 };
    grouped.set(monthLabel, {
      expenses: current.expenses + Number(expense.amount),
    });
  });

  return Array.from(grouped.entries())
    .map(([month, values]) => ({
      month,
      expenses: Math.round(values.expenses),
    }))
    .slice(-6);
}

function buildCategoryData(expenses) {
  const grouped = expenses.reduce((accumulator, expense) => {
    const key = expense.primary_tag || "Other";
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 4);
}

function CashFlowTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Paper
      sx={{
        px: 2,
        py: 1.5,
        minWidth: 180,
        bgcolor: isDark ? "rgba(15, 23, 42, 0.96)" : "#FFFFFF",
        borderColor: isDark ? "#334155" : "#E2E8F0",
        boxShadow: isDark
          ? "0 18px 40px rgba(2, 6, 23, 0.45)"
          : "0 12px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
        {label}
      </Typography>
      <Stack spacing={0.5}>
        {payload.map((entry) => (
          <Typography
            key={entry.dataKey}
            variant="body2"
            sx={{ color: entry.color, textTransform: "capitalize" }}
          >
            {entry.dataKey}: {formatCurrency(entry.value)}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}

export default function Dashboard({
  selectedExpense,
  onClearSelection,
  onExpenseSaved,
  onViewAllTransactions,
}) {
  const { expenses, summary } = useContext(ExpenseContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const availableBalance = Math.max(
    Number(summary?.budget || 0) - Number(summary?.monthly_total || 0),
    0,
  );
  const categoryData = useMemo(() => buildCategoryData(expenses), [expenses]);
  const cashFlowData = useMemo(() => buildCashFlowData(expenses), [expenses]);

  const spent = Number(summary?.monthly_total || 0);
  const budget = Number(summary?.budget || 0);
  const remaining = Math.max(budget - spent, 0);
  const forecast = Number(summary?.predicted_total || 0);
  const plannedGap = Math.max(forecast - spent, 0);
  const spentWidth = budget ? Math.min((spent / budget) * 100, 100) : 0;
  const remainingWidth = budget ? Math.min((remaining / budget) * 100, 100 - spentWidth) : 0;
  const forecastWidth = budget
    ? Math.min((plannedGap / budget) * 100, Math.max(100 - spentWidth - remainingWidth, 0))
    : 0;

  return (
    <Grid2 container spacing={2.5}>
      <Grid2 xs={12} md={3.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Available Balance
          </Typography>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {formatCurrency(availableBalance)}
          </Typography>
          <Button
            startIcon={<AddRoundedIcon />}
            sx={{
              bgcolor: alpha("#10B981", 0.12),
              color: "#0F766E",
              "&:hover": { bgcolor: alpha("#10B981", 0.2) },
            }}
          >
            Add Income
          </Button>
          <Stack spacing={1.25} sx={{ mt: 3 }}>
            <Chip
              label={summary?.warning || "Budget is tracking comfortably."}
              color={summary?.warning ? "warning" : "success"}
              variant="outlined"
            />
            <Typography variant="body2" color="text.secondary">
              Daily average spend: {formatCurrency(summary?.average_daily_spend || 0)}
            </Typography>
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={8.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Monthly Budget
          </Typography>
          <Box
            sx={{
              mt: 3,
              mb: 2.5,
              height: 28,
              borderRadius: 999,
              bgcolor: alpha("#10B981", 0.12),
              overflow: "hidden",
              display: "flex",
              position: "relative",
            }}
          >
            <Box sx={{ width: `${spentWidth}%`, bgcolor: "#0F766E" }} />
            <Box sx={{ width: `${remainingWidth}%`, bgcolor: "#FF7A59" }} />
            <Box sx={{ width: `${forecastWidth}%`, bgcolor: "#79D6C2" }} />
            <Box
              sx={{
                position: "absolute",
                top: -6,
                bottom: -6,
                left: `calc(${Math.min((forecast / Math.max(budget, 1)) * 100, 100)}% - 1px)`,
                width: 3,
                borderRadius: 999,
                bgcolor: "#0F766E",
              }}
            />
          </Box>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.25, md: 2 }}
            useFlexGap
            sx={{ mb: 2.25 }}
          >
            {[
              {
                color: "#0F766E",
                label: "Spent",
                description: "Logged expenses",
              },
              {
                color: "#FF7A59",
                label: "Remaining",
                description: "Budget left",
              },
              {
                color: "#79D6C2",
                label: "Forecast",
                description: "Projected use / goal room",
              },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  px: 1.25,
                  py: 1,
                  borderRadius: 2.5,
                  bgcolor: alpha(item.color, 0.08),
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                    {item.description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
          <Grid2 container spacing={2}>
            {[
              { label: "Spent", value: spent },
              { label: "Remaining", value: remaining },
              { label: "For goals", value: Math.max(remaining * 0.35, 0) },
              { label: "Planned / Forecasted", value: forecast },
            ].map((item) => (
              <Grid2 xs={6} md={3} key={item.label}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6">{formatCurrency(item.value)}</Typography>
              </Grid2>
            ))}
          </Grid2>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={3.5}>
        <ExpenseForm
          compact
          selectedExpense={selectedExpense}
          onClearSelection={onClearSelection}
          onSubmitSuccess={onExpenseSaved}
        />
      </Grid2>

      <Grid2 xs={12} md={3}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Top Spending Categories</Typography>
          <Box sx={{ height: 220, mt: 2 }}>
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={categoryColors[index % categoryColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <Typography color="text.secondary">
                  Add a few expenses to see category distribution.
                </Typography>
              </Stack>
            )}
          </Box>
          <Stack spacing={1}>
            {categoryData.map((category, index) => (
              <Stack
                key={category.name}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: categoryColors[index % categoryColors.length],
                    }}
                  />
                  <Typography>{category.name}</Typography>
                </Stack>
                <Typography color="text.secondary">
                  {Math.round((category.value / Math.max(spent, 1)) * 100)}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={5.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Box>
              <Typography variant="h6">Monthly Spending Trend</Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly expense trend
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#F43F5E" }} />
              <Typography variant="body2">Expenses</Typography>
            </Stack>
          </Stack>
          <Box sx={{ height: 250 }}>
            {cashFlowData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CashFlowTooltip isDark={isDark} />} />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#F43F5E"
                    fill="url(#expenseFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <Typography color="text.secondary">
                  Cash flow appears after you start logging activity.
                </Typography>
              </Stack>
            )}
          </Box>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={3.5}>
        <RecentExpenses onViewAll={onViewAllTransactions} />
      </Grid2>

      <Grid2 xs={12} md={6}>
        <Paper
          sx={{
            p: 3,
            minHeight: 216,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: isDark
              ? "radial-gradient(circle at center, rgba(99,102,241,0.14), transparent 58%), rgba(15,23,42,0.92)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.08), transparent 58%), #FFFFFF",
          }}
        >
          <Stack spacing={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "#6366F1",
                bgcolor: isDark ? alpha("#6366F1", 0.22) : alpha("#6366F1", 0.12),
              }}
            >
              <AutoAwesomeRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" color={isDark ? "text.primary" : "inherit"}>
                AI Spending Suggestion
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Your dining and shopping expenses are trending higher this month. Consider
                setting a smaller weekly limit for discretionary spending so you can protect
                more of your remaining budget for essentials and savings goals.
              </Typography>
            </Box>
            <Stack spacing={0.5}>
              <Typography color="text.secondary">
                * Personalized insights will refresh as new expenses are added.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                AI suggestions are best used as guidance and may occasionally miss context,
                misread spending patterns, or make imperfect recommendations.
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={2.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Subscription Tracker
          </Typography>
          <Stack spacing={1.5}>
            {subscriptionItems.map((item, index) => (
              <Paper
                key={item.name}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: alpha(item.accent, 0.05 + index * 0.02),
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                  <Stack direction="row" spacing={1.25}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: item.accent,
                        color: "#FFFFFF",
                        fontWeight: 700,
                      }}
                    >
                      {item.name[0]}
                    </Box>
                    <Box>
                      <Typography fontWeight={600}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.due}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography fontWeight={700}>{item.amount}</Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <CalendarTodayRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Use this section as a recurring bills snapshot.
            </Typography>
          </Stack>
        </Paper>
      </Grid2>
    </Grid2>
  );
}
