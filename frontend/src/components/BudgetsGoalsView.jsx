import { useContext, useMemo, useState } from "react";
import {
  Box,
  LinearProgress,
  Paper,
  Slider,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { ExpenseContext } from "../context/ExpenseContext";

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
  const { expenses, summary, updateUserSettings } = useContext(ExpenseContext);
  const [budgetTarget, setBudgetTarget] = useState(
    Number(summary?.budget || 50000),
  );

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
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={5}>
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
              // @ts-ignore
              onChange={(_, value) => setBudgetTarget(value)}
              sx={{ mt: 3 }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => {
                  updateUserSettings(budgetTarget);
                }}
                disabled={budgetTarget === Number(summary?.budget || 50000)}
                sx={{ flex: 1 }}
              >
                Save
              </Button>
            </Stack>
          </Box>

          <Stack spacing={2.5} sx={{ mt: 4 }}>
            {categoryBudgets.map((budget) => {
              const percent = Math.min(
                (budget.spent / budget.limit) * 100,
                100,
              );
              return (
                <Box key={budget.name}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    mb={0.75}
                  >
                    <Typography>{budget.name}</Typography>
                    <Typography color="text.secondary">
                      {formatCurrency(budget.spent)} /{" "}
                      {formatCurrency(budget.limit)}
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
                        bgcolor:
                          percent > 90
                            ? "#F43F5E"
                            : percent > 70
                              ? "#F59E0B"
                              : "#10B981",
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, height: "100%" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                Savings Goals
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track active goals and compare progress at a glance.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{ whiteSpace: "nowrap" }}
            >
              Add goal
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            {goalCards.map((goal) => {
              const progress = Math.round((goal.saved / goal.target) * 100);
              return (
                <Paper
                  key={goal.title}
                  sx={{
                    p: 2,
                    borderColor: alpha(goal.accent, 0.2),
                    bgcolor: alpha(goal.accent, 0.06),
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={2}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="h6">{goal.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Target {formatCurrency(goal.target)}
                      </Typography>
                      <Box sx={{ mt: 1.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: alpha(goal.accent, 0.14),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 999,
                              bgcolor: goal.accent,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        minWidth: { sm: 170 },
                        textAlign: { xs: "left", sm: "right" },
                      }}
                    >
                      <Typography variant="h5">
                        {formatCurrency(goal.saved)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progress}% saved
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
