import { Box, Paper, Stack, Typography } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { buildDailySpendData, formatCurrency } from "../../utility/utility";
import { alpha } from "@mui/material";
import { dailySpendColors } from "../../utility/constants";

export default function DailySpendingChart({ scopedExpenses, isDark }) {
  const dailySpendData = useMemo(
    () => buildDailySpendData(scopedExpenses),
    [scopedExpenses],
  );
  const chartAxisColor = isDark ? "#E2E8F0" : "#334155";
  const chartGridColor = isDark
    ? alpha("#CBD5E1", 0.16)
    : alpha("#64748B", 0.18);
  const dailySpendColor = isDark
    ? dailySpendColors.dark
    : dailySpendColors.light;
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
      <Typography variant="h6">Daily Spend</Typography>
      <Typography variant="body2" color="text.secondary">
        Day-by-day spend for the selected range.
      </Typography>
      <Box sx={{ height: 280, mt: 2 }}>
        {dailySpendData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySpendData}>
              <defs>
                <linearGradient id="dailySpendFill" x1="0" y1="0" x2="0" y2="1">
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
  );
}
