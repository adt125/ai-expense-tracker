import { Paper, Typography, Box, Stack } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { alpha } from "@mui/material/styles";
import { buildTotalsByField, formatCurrency } from "../../utility/utility";
import { paymentSourceColors } from "../../utility/constants";
import { useMemo } from "react";

export default function PaymentSourceChart({ scopedExpenses, isDark }) {
  const paymentSourceTotals = useMemo(
    () => buildTotalsByField(scopedExpenses, "payment_source", "Unknown"),
    [scopedExpenses],
  );
  const chartAxisColor = isDark ? "#E2E8F0" : "#334155";
  const chartGridColor = isDark
    ? alpha("#CBD5E1", 0.16)
    : alpha("#64748B", 0.18);
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
                {paymentSourceTotals.map((entry, index) => {
                  const sourceColor =
                    paymentSourceColors[index % paymentSourceColors.length];

                  return <Cell key={entry.name} fill={sourceColor} />;
                })}
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
  );
}
