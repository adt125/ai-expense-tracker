import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CommuteRoundedIcon from "@mui/icons-material/CommuteRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import ShoppingBasketRoundedIcon from "@mui/icons-material/ShoppingBasketRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useContext, useMemo, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ExpenseContext } from "../context/ExpenseContext";
import ChatContainer from "./Chat/ChatContainer";
import ExpenseForm from "./ExpenseForm";

const categoryColors = ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#0F766E"];
const lowerCardHeight = { xs: 400, lg: "calc(100vh - 500px)" };

const iconMap = {
  Food: LocalCafeRoundedIcon,
  Shopping: ShoppingBasketRoundedIcon,
  Utilities: BoltRoundedIcon,
  Fuel: CommuteRoundedIcon,
  Rent: HomeRoundedIcon,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getDateLabel(rawDate) {
  const target = new Date(rawDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (target.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (target.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(target);
}

function buildCategoryData(expenses) {
  const total = expenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0,
  );
  const grouped = expenses.reduce((accumulator, expense) => {
    const key = expense.primary_tag || "Other";
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({
      name,
      value,
      percent: total ? Math.round((value / total) * 100) : 0,
    }))
    .sort((first, second) => second.value - first.value)
    .slice(0, 3);
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
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const chatMessagesRef = useRef(null);

  const spent = Number(summary?.monthly_total || 0);
  const budget = Number(summary?.budget || 0);
  const availableBalance = Math.max(budget - spent, 0);
  const goal = Math.max(budget * 0.4, 1);
  const goalProgress = Math.min((availableBalance / goal) * 100, 100);
  const targetProgress = budget ? Math.min((spent / budget) * 100, 100) : 0;

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
    <Grid2 container spacing={2.5}>
      <Grid2 xs={12} md={4}>
        <Paper sx={{ p: 3, minHeight: 282, ...cardSurface }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Balance Hero Card
          </Typography>
          <Typography variant="h5" sx={{ mb: 1.25 }}>
            Available Balance
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "2.6rem", md: "3.25rem" },
              lineHeight: 1,
              letterSpacing: "-0.05em",
              fontWeight: 500,
              mb: 5,
            }}
          >
            {formatCurrency(availableBalance)}
          </Typography>

          <Grid2 container spacing={2}>
            {[
              {
                label: `Goal: ${formatCurrency(goal)}`,
                value: goalProgress,
                caption: `${Math.round(goalProgress)}% of goal`,
              },
              {
                label: `April Target: ${formatCurrency(budget)}`,
                value: targetProgress,
                caption: `${Math.round(targetProgress)}% of target`,
              },
            ].map((item) => (
              <Grid2 xs={12} sm={6} key={item.label}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {item.label}
                </Typography>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    bgcolor: isDark ? alpha("#475569", 0.7) : "#CBD5E1",
                    overflow: "hidden",
                    mb: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: `${item.value}%`,
                      height: "100%",
                      borderRadius: 999,
                      background:
                        "linear-gradient(90deg, #34D399 0%, #2DD4BF 100%)",
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.caption}
                </Typography>
              </Grid2>
            ))}
          </Grid2>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={8}>
        <ExpenseForm
          variant="dashboard"
          selectedExpense={selectedExpense}
          onClearSelection={onClearSelection}
          onSubmitSuccess={onExpenseSaved}
        />
      </Grid2>

      <Grid2 xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            height: lowerCardHeight,
            display: "flex",
            flexDirection: "column",
            ...cardSurface,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Top 3 Spending Categories
          </Typography>
          <Box sx={{ flex: 1, minHeight: 250 }}>
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={categoryColors[index % categoryColors.length]}
                        stroke={isDark ? "#E2E8F0" : "#FFFFFF"}
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
                  Add a few expenses to see category share.
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {categoryData.map((category, index) => (
              <Stack
                key={category.name}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
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
                  {category.percent}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            height: lowerCardHeight,
            display: "flex",
            flexDirection: "column",
            ...cardSurface,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">Recent Activity</Typography>
            <Button
              size="small"
              sx={{ color: "#A78BFA" }}
              onClick={onViewAllTransactions}
            >
              View all
            </Button>
          </Stack>

          <Stack spacing={1.25} sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
            {recentActivity.length ? (
              recentActivity.map((expense, index) => {
                const IconComponent =
                  iconMap[expense.primary_tag] || StorefrontRoundedIcon;

                return (
                  <Paper
                    key={expense.id}
                    sx={{
                      p: { xs: 1.6, lg: 2 },
                      borderRadius: 3,
                      borderColor: "transparent",
                      bgcolor: isDark
                        ? alpha("#94A3B8", 0.1)
                        : alpha("#F1F5F9", 0.82),
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1.5}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            bgcolor: alpha(
                              categoryColors[index % categoryColors.length],
                              0.18,
                            ),
                            color:
                              categoryColors[index % categoryColors.length],
                          }}
                        >
                          <IconComponent fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {expense.description || expense.primary_tag}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getDateLabel(expense.date)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography fontWeight={700}>
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })
            ) : (
              <Typography color="text.secondary">
                Recent transactions will appear here once you log expenses.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 xs={12} md={4}>
        <ChatContainer />
      </Grid2>
    </Grid2>
  );
}
