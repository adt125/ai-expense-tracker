import { useContext, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import FastfoodRoundedIcon from "@mui/icons-material/FastfoodRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
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

const rangeConfig = {
  weekly: 7,
  monthly: 31,
  yearly: 365,
};

const categoryIcons = {
  Food: FastfoodRoundedIcon,
  Fuel: DirectionsCarRoundedIcon,
  Rent: HomeRoundedIcon,
  Shopping: ShoppingBagRoundedIcon,
};

const chartColors = ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#0F766E"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getRangeExpenses(expenses, range) {
  const days = rangeConfig[range];
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days + 1);
  return expenses.filter((expense) => new Date(expense.date) >= cutoff);
}

function buildCategoryTotals(expenses) {
  const grouped = expenses.reduce((accumulator, expense) => {
    const key = expense.primary_tag || "Other";
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
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
      <Typography variant="body2" color="error.main">
        Expenses: {formatCurrency(payload[0].value)}
      </Typography>
    </Paper>
  );
}

function getProgressColor(percent) {
  if (percent > 90) {
    return "#F43F5E";
  }
  if (percent >= 70) {
    return "#F59E0B";
  }
  return "#10B981";
}

export default function ReportCard() {
  const { expenses, summary, report } = useContext(ExpenseContext);
  const [range, setRange] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const scopedExpenses = useMemo(() => getRangeExpenses(expenses, range), [expenses, range]);
  const categoryTotals = useMemo(() => buildCategoryTotals(scopedExpenses), [scopedExpenses]);
  const cashFlowData = useMemo(() => buildCashFlowData(expenses), [expenses]);
  const filteredExpenses = selectedCategory
    ? scopedExpenses.filter((expense) => expense.primary_tag === selectedCategory)
    : scopedExpenses;

  const totalInRange = scopedExpenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0,
  );
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
      <Grid2 xs={12}>
        <Paper sx={{ p: 2 }}>
          <Tabs
            value={range}
            onChange={(_, nextValue) => {
              setRange(nextValue);
              setSelectedCategory(null);
            }}
          >
            <Tab value="weekly" label="Weekly" />
            <Tab value="monthly" label="Monthly" />
            <Tab value="yearly" label="Yearly" />
          </Tabs>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={5}>
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
          </Box>
          <Stack spacing={1.25}>
            {[
              { label: "Spent", value: spent },
              { label: "Remaining", value: remaining },
              { label: "For goals", value: Math.max(remaining * 0.35, 0) },
              { label: "Planned / Forecasted", value: forecast },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="text.secondary">{item.label}</Typography>
                <Typography fontWeight={700}>{formatCurrency(item.value)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={7}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Box>
              <Typography variant="h6">Monthly Spending Trend</Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly expense trend moved from the dashboard.
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
                    <linearGradient id="analyticsExpenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CashFlowTooltip isDark={isDark} />} />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#F43F5E"
                    fill="url(#analyticsExpenseFill)"
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
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Spending Insight</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {report?.summary || "Insights become sharper as you log more transactions."}
          </Typography>

          <Stack spacing={2} sx={{ mt: 3 }}>
            {[
              {
                label: "Active spend",
                value: totalInRange,
                hint: `${scopedExpenses.length} transactions in view`,
              },
              {
                label: "Projected month*",
                value: summary?.predicted_total || 0,
                hint: "Forecast based on current pace",
              },
              {
                label: "Budget target",
                value: summary?.budget || 0,
                hint: "Current monthly goal",
              },
            ].map((item) => (
              <Box key={item.label}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5">{formatCurrency(item.value)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.hint}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Stack spacing={0.75} sx={{ mt: 4, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary">
              * Forecasts become available after at least 7 days of expense history in the current month.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              * The projection is generated from a machine learning model using recent spending patterns, so it should be treated as guidance rather than an exact outcome.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              * Sudden one-off purchases, irregular bills, or missing transactions can reduce forecast accuracy.
            </Typography>
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Category Mix</Typography>
          <Typography variant="body2" color="text.secondary">
            Select a slice to filter the transaction report below.
          </Typography>
          <Box sx={{ height: 320, mt: 1 }}>
            {categoryTotals.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={3}
                    onClick={(payload) =>
                      setSelectedCategory((current) =>
                        current === payload.name ? null : payload.name,
                      )
                    }
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                        stroke={selectedCategory === entry.name ? "#0F172A" : "#FFFFFF"}
                        strokeWidth={selectedCategory === entry.name ? 2 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                <Typography color="text.secondary">
                  More data is needed to build the donut chart.
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {categoryTotals.slice(0, 5).map((item, index) => (
              <Paper
                key={item.name}
                onClick={() =>
                  setSelectedCategory((current) => (current === item.name ? null : item.name))
                }
                sx={{
                  px: 1.25,
                  py: 1,
                  cursor: "pointer",
                  bgcolor:
                    selectedCategory === item.name
                      ? alpha(chartColors[index % chartColors.length], 0.14)
                      : isDark
                        ? alpha(theme.palette.common.white, 0.06)
                        : "#FFFFFF",
                  borderColor:
                    selectedCategory === item.name
                      ? alpha(chartColors[index % chartColors.length], 0.32)
                      : "divider",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: chartColors[index % chartColors.length],
                    }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {item.name} · {formatCurrency(item.value)}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={3.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Top Categories
          </Typography>
          <List disablePadding>
            {categoryTotals.slice(0, 5).map((category, index) => {
              const IconComponent = categoryIcons[category.name] || PaidRoundedIcon;
              return (
                <ListItem
                  key={category.name}
                  disableGutters
                  sx={{ py: 1.25 }}
                  secondaryAction={
                    <Typography fontWeight={700}>{formatCurrency(category.value)}</Typography>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: alpha(chartColors[index % chartColors.length], 0.14) }}>
                      <IconComponent sx={{ color: chartColors[index % chartColors.length] }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={category.name}
                    secondary={`${Math.round((category.value / Math.max(totalInRange, 1)) * 100)}% of selected spend`}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Budget vs Actual
          </Typography>
          <Stack spacing={2.5}>
            {categoryTotals.slice(0, 4).map((category) => {
              const target = Math.max((summary?.budget || 0) * 0.25, 1);
              const percent = Math.min((category.value / target) * 100, 100);
              return (
                <Box key={category.name}>
                  <Stack direction="row" justifyContent="space-between" mb={0.75}>
                    <Typography>{category.name}</Typography>
                    <Typography color="text.secondary">
                      {formatCurrency(category.value)} / {formatCurrency(target)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: alpha(getProgressColor(percent), 0.12),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: getProgressColor(percent),
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={7}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            {selectedCategory ? `${selectedCategory} transactions` : "Transactions in focus"}
          </Typography>
          <Stack spacing={1.25}>
            {filteredExpenses.slice(0, 8).map((expense) => (
              <Paper
                key={expense.id}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: alpha("#6366F1", 0.03),
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Typography fontWeight={600}>
                      {expense.description || expense.primary_tag}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expense.date} · {expense.payment_source} · {expense.secondary_tag}
                    </Typography>
                  </Box>
                  <Typography fontWeight={700}>{formatCurrency(expense.amount)}</Typography>
                </Stack>
              </Paper>
            ))}
            {!filteredExpenses.length && (
              <Typography color="text.secondary">
                No matching transactions found for this view.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid2>
    </Grid2>
  );
}
