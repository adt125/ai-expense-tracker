import { useContext, useMemo, useState } from "react";
import {
  Avatar,
  Box,
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
import Grid from "@mui/material/Grid";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExpenseContext } from "../context/ExpenseContext";
import { formatCurrency } from "../utility/utility";
import { iconMap } from "../utility/constants";

const rangeConfig = {
  weekly: 7,
  monthly: 31,
  yearly: 365,
};

const chartColors = ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#0F766E"];
const paymentSourceColors = [
  "#38BDF8",
  "#34D399",
  "#FBBF24",
  "#FB7185",
  "#A78BFA",
];

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

function buildTotalsByField(expenses, field, fallback = "Other") {
  const grouped = expenses.reduce((accumulator, expense) => {
    const key = expense[field] || fallback;
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
}

function buildDailySpendData(expenses) {
  const grouped = new Map();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const sortKey = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
    }).format(date);
    const current = grouped.get(sortKey) || { day: label, amount: 0 };
    grouped.set(sortKey, {
      ...current,
      amount: current.amount + Number(expense.amount),
    });
  });

  return Array.from(grouped.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([, values]) => ({
      day: values.day,
      amount: Math.round(values.amount),
    }));
}

export default function ReportCard() {
  const { expenses, summary, report } = useContext(ExpenseContext);
  const [range, setRange] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const scopedExpenses = useMemo(
    () => getRangeExpenses(expenses, range),
    [expenses, range],
  );
  const categoryTotals = useMemo(
    () => buildCategoryTotals(scopedExpenses),
    [scopedExpenses],
  );
  const paymentSourceTotals = useMemo(
    () => buildTotalsByField(scopedExpenses, "payment_source", "Unknown"),
    [scopedExpenses],
  );
  const secondaryTagTotals = useMemo(
    () => buildTotalsByField(scopedExpenses, "secondary_tag", "Other"),
    [scopedExpenses],
  );
  const dailySpendData = useMemo(
    () => buildDailySpendData(scopedExpenses),
    [scopedExpenses],
  );

  const totalInRange = scopedExpenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0,
  );
  const spent = Number(summary?.monthly_total || 0);
  const budget = Number(summary?.budget || 0);
  const remaining = Math.max(budget - spent, 0);
  const forecast = Number(summary?.predicted_total || 0);
  const chartAxisColor = isDark ? "#E2E8F0" : "#334155";
  const chartGridColor = isDark
    ? alpha("#CBD5E1", 0.16)
    : alpha("#64748B", 0.18);
  const dailySpendColor = isDark ? "#38BDF8" : "#6366F1";
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
    color: isDark ? "#E2E8F0" : "#0F172A",
    boxShadow: isDark
      ? "0 16px 36px rgba(2, 6, 23, 0.45)"
      : "0 12px 28px rgba(15, 23, 42, 0.12)",
  };
  const tooltipLabelStyle = {
    color: isDark ? "#F8FAFC" : "#0F172A",
    fontWeight: 700,
  };

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
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
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Payment Sources</Typography>
          <Typography variant="body2" color="text.secondary">
            Spend grouped by card, UPI, cash, and wallet sources.
          </Typography>
          <Box sx={{ height: 280, mt: 2 }}>
            {paymentSourceTotals.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentSourceTotals}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={chartGridColor}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={92}
                    tick={{
                      fill: chartAxisColor,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    axisLine={{ stroke: chartGridColor }}
                    tickLine={{ stroke: chartGridColor }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={{ color: isDark ? "#E2E8F0" : "#0F172A" }}
                    cursor={{
                      fill: isDark
                        ? alpha("#CBD5E1", 0.08)
                        : alpha("#64748B", 0.08),
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {paymentSourceTotals.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          paymentSourceColors[
                            index % paymentSourceColors.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%" }}
              >
                <Typography color="text.secondary">
                  Payment source chart appears after expenses are added.
                </Typography>
              </Stack>
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Daily Spend</Typography>
          <Typography variant="body2" color="text.secondary">
            Day-by-day spend for the selected range.
          </Typography>
          <Box sx={{ height: 280, mt: 2 }}>
            {dailySpendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySpendData}>
                  <defs>
                    <linearGradient
                      id="dailySpendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={dailySpendColor}
                        stopOpacity={isDark ? 0.34 : 0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor={dailySpendColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={chartGridColor}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fill: chartAxisColor,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    tickLine={{ stroke: chartGridColor }}
                    axisLine={{ stroke: chartGridColor }}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={{ color: isDark ? "#E2E8F0" : "#0F172A" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={dailySpendColor}
                    fill="url(#dailySpendFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%" }}
              >
                <Typography color="text.secondary">
                  Daily spend trend appears after expenses are added.
                </Typography>
              </Stack>
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Needs, Wants, Investment</Typography>
          <Typography variant="body2" color="text.secondary">
            Secondary-tag split for the selected range.
          </Typography>
          <Box sx={{ height: 240, mt: 2 }}>
            {secondaryTagTotals.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={secondaryTagTotals}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                  >
                    {secondaryTagTotals.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                        stroke={isDark ? "#0F172A" : "#FFFFFF"}
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%" }}
              >
                <Typography color="text.secondary">
                  Secondary-tag chart appears after expenses are added.
                </Typography>
              </Stack>
            )}
          </Box>
          <Stack spacing={1}>
            {secondaryTagTotals.slice(0, 4).map((item, index) => (
              <Stack
                key={item.name}
                direction="row"
                justifyContent="space-between"
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
                  <Typography>{item.name}</Typography>
                </Stack>
                <Typography color="text.secondary">
                  {formatCurrency(item.value)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6">Spending Insight</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {report?.summary ||
              "Insights become sharper as you log more transactions."}
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
                <Typography variant="h5">
                  {formatCurrency(item.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.hint}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Stack
            spacing={0.75}
            sx={{
              mt: 4,
              pt: 2.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              * Forecasts become available after at least 7 days of expense
              history in the current month.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              * The projection is generated from a machine learning model using
              recent spending patterns, so it should be treated as guidance
              rather than an exact outcome.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              * Sudden one-off purchases, irregular bills, or missing
              transactions can reduce forecast accuracy.
            </Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
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
                        stroke={
                          selectedCategory === entry.name
                            ? "#0F172A"
                            : "#FFFFFF"
                        }
                        strokeWidth={selectedCategory === entry.name ? 2 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ height: "100%" }}
              >
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
                  setSelectedCategory((current) =>
                    current === item.name ? null : item.name,
                  )
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
      </Grid>

      <Grid item xs={12} md={3.5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Top Categories
          </Typography>
          <List disablePadding>
            {categoryTotals.slice(0, 5).map((category, index) => {
              const IconComponent = iconMap[category.name] || PaidRoundedIcon;
              return (
                <ListItem
                  key={category.name}
                  disableGutters
                  sx={{ py: 1.25 }}
                  secondaryAction={
                    <Typography fontWeight={700}>
                      {formatCurrency(category.value)}
                    </Typography>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(
                          chartColors[index % chartColors.length],
                          0.14,
                        ),
                      }}
                    >
                      <IconComponent
                        sx={{ color: chartColors[index % chartColors.length] }}
                      />
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
      </Grid>
    </Grid>
  );
}
