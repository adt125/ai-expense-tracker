import { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { Box, Paper, Typography, Grid, Chip, Divider } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { expenses, summary } = useContext(ExpenseContext);

  const chartData = expenses
    .slice()
    .reverse()
    .slice(0, 14)
    .map((expense) => ({
      label: expense.date,
      amount: expense.amount,
    }));

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">Monthly Dashboard</Typography>
        <Chip
          color={summary?.warning ? "error" : "success"}
          label={summary?.warning || "Healthy"}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current month spending
            </Typography>
            <Typography variant="h4">
              ₹{summary?.monthly_total?.toFixed(2) ?? "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Budget: ₹{summary?.budget?.toFixed(2) ?? "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Avg daily spend: ₹
              {summary?.average_daily_spend?.toFixed(2) ?? "0.00"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Forecasted spend
            </Typography>
            <Typography variant="h4">
              ₹{summary?.predicted_total?.toFixed(2) ?? "0.00"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Days remaining: {summary?.days_remaining ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, minHeight: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent expenses
            </Typography>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Bar dataKey="amount" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Add some expenses to see the chart.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, minHeight: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Spending velocity
            </Typography>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#388e3c"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Track your first expenses to generate forecasts.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
