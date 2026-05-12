import { Box, Paper, Stack, Typography } from "@mui/material";
import { formatCurrency } from "../../utility/utility";

export default function SpendingInsightCard({ scopedExpenses, summary, report }) {
  const totalInRange = scopedExpenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0,
  );

  return (
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
            <Typography variant="h5">{formatCurrency(item.value)}</Typography>
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
          * Forecasts become available after at least 7 days of expense history
          in the current month.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          * The projection is generated from a machine learning model using
          recent spending patterns, so it should be treated as guidance rather
          than an exact outcome.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          * Sudden one-off purchases, irregular bills, or missing transactions
          can reduce forecast accuracy.
        </Typography>
      </Stack>
    </Paper>
  );
}
