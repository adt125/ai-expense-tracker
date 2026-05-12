import { Box, Paper, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors } from "../../utility/constants";
import { buildTotalsByField, formatCurrency } from "../../utility/utility";

export default function SecondaryTagChart({ scopedExpenses, isDark }) {
  const secondaryTagTotals = useMemo(
    () => buildTotalsByField(scopedExpenses, "secondary_tag", "Other"),
    [scopedExpenses],
  );

  return (
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
          <Stack key={item.name} direction="row" justifyContent="space-between">
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
  );
}
