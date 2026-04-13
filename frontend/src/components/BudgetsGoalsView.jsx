import { useContext, useMemo, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  CircularProgress,
  LinearProgress,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { alpha } from "@mui/material/styles";
import { ExpenseContext } from "../context/ExpenseContext";

const householdMembers = [
  { name: "Aditi", color: "#6366F1" },
  { name: "Ravi", color: "#10B981" },
  { name: "Sam", color: "#F59E0B" },
];

const goalCards = [
  { title: "Emergency Fund", target: 300000, saved: 182000, accent: "#0F766E" },
  { title: "New Car", target: 700000, saved: 248000, accent: "#6366F1" },
  { title: "Holiday", target: 120000, saved: 51000, accent: "#F43F5E" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function BudgetsGoalsView() {
  const { expenses, summary } = useContext(ExpenseContext);
  const [budgetTarget, setBudgetTarget] = useState(Number(summary?.budget || 50000));

  const categoryBudgets = useMemo(() => {
    const grouped = expenses.reduce((accumulator, expense) => {
      const key = expense.primary_tag || "Other";
      accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .map(([name, spent]) => ({
        name,
        spent,
        limit: Math.max(budgetTarget * 0.18, spent * 1.15, 5000),
      }))
      .sort((first, second) => second.spent - first.spent)
      .slice(0, 5);
  }, [budgetTarget, expenses]);

  return (
    <Grid2 container spacing={2.5}>
      <Grid2 xs={12} md={5}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Typography variant="h6" gutterBottom>
            Budget Controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag your target to stress-test upcoming monthly plans.
          </Typography>

          <Box sx={{ mt: 4, px: 1 }}>
            <Typography variant="h4">{formatCurrency(budgetTarget)}</Typography>
            <Slider
              min={10000}
              max={150000}
              step={1000}
              value={budgetTarget}
              onChange={(_, value) => setBudgetTarget(value)}
              sx={{ mt: 3 }}
            />
          </Box>

          <Stack spacing={2.5} sx={{ mt: 4 }}>
            {categoryBudgets.map((budget) => {
              const percent = Math.min((budget.spent / budget.limit) * 100, 100);
              return (
                <Box key={budget.name}>
                  <Stack direction="row" justifyContent="space-between" mb={0.75}>
                    <Typography>{budget.name}</Typography>
                    <Typography color="text.secondary">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: alpha("#6366F1", 0.12),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: percent > 90 ? "#F43F5E" : percent > 70 ? "#F59E0B" : "#10B981",
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
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h6">Shared Household View</Typography>
              <Typography variant="body2" color="text.secondary">
                See how each person contributes to a category budget.
              </Typography>
            </Box>
            <AvatarGroup max={4}>
              {householdMembers.map((member) => (
                <Avatar
                  key={member.name}
                  sx={{ bgcolor: member.color, width: 36, height: 36 }}
                >
                  {member.name[0]}
                </Avatar>
              ))}
            </AvatarGroup>
          </Stack>

          <Grid2 container spacing={2}>
            {householdMembers.map((member, index) => (
              <Grid2 xs={12} md={4} key={member.name}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(member.color, 0.08 + index * 0.03),
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {member.name}
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency((summary?.monthly_total || 0) * (0.24 + index * 0.12))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated share this month
                  </Typography>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        </Paper>
      </Grid2>

      <Grid2 xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Savings Goals
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Swipe through active goals and compare progress side by side.
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: { xs: "85%", md: "32%" },
              gap: 2,
              overflowX: "auto",
              pb: 1,
            }}
          >
            {goalCards.map((goal) => {
              const progress = Math.round((goal.saved / goal.target) * 100);
              return (
                <Paper
                  key={goal.title}
                  sx={{
                    p: 3,
                    minHeight: 220,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(goal.accent, 0.12)} 0%, #FFFFFF 100%)`,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{goal.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Target {formatCurrency(goal.target)}
                      </Typography>
                    </Box>
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      <CircularProgress
                        variant="determinate"
                        value={progress}
                        size={72}
                        thickness={5}
                        sx={{ color: goal.accent }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          {progress}%
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                  <Typography variant="h4" sx={{ mt: 4 }}>
                    {formatCurrency(goal.saved)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Saved so far
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      </Grid2>
    </Grid2>
  );
}
