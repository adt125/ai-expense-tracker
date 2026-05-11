import { useContext } from "react";
import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";

import { alpha, useTheme } from "@mui/material/styles";
import { ExpenseContext } from "../context/ExpenseContext";
import { getDateLabel, formatCurrency } from "../utility/utility";
import { iconMap } from "../utility/constants";

export default function RecentExpenses({ onViewAll }) {
  const { expenses } = useContext(ExpenseContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const recent = expenses.slice(0, 3);

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Recent Transactions</Typography>
        <Button size="small" onClick={onViewAll}>
          View all
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        {recent.length ? (
          recent.map((expense) => {
            const IconComponent =
              iconMap[expense.primary_tag] || iconMap["default"];

            return (
              <Paper
                key={expense.id}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: isDark
                    ? alpha(theme.palette.common.white, 0.06)
                    : alpha("#F8FAFC", 0.9),
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha("#6366F1", 0.12),
                        color: "#6366F1",
                        width: 42,
                        height: 42,
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
                  <Typography
                    fontWeight={700}
                    color={isDark ? "text.primary" : "inherit"}
                  >
                    {formatCurrency(expense.amount)}
                  </Typography>
                </Stack>
              </Paper>
            );
          })
        ) : (
          <Typography color="text.secondary">
            Your most recent activity will show up here after the first expense.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
