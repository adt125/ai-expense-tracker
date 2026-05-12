import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { chartColors } from "../../utility/constants";
import { buildCategoryTotals, formatCurrency } from "../../utility/utility";

export default function CategoryMixChart({
  scopedExpenses,
  isDark,
  selectedCategory,
  onSelectCategory,
}) {
  const theme = useTheme();
  const categoryTotals = useMemo(
    () => buildCategoryTotals(scopedExpenses),
    [scopedExpenses],
  );

  const handleCategoryClick = (categoryName) => {
    onSelectCategory((current) =>
      current === categoryName ? null : categoryName,
    );
  };

  return (
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
                onClick={(payload) => handleCategoryClick(payload.name)}
              >
                {categoryTotals.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                    stroke={
                      selectedCategory === entry.name ? "#0F172A" : "#FFFFFF"
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
            onClick={() => handleCategoryClick(item.name)}
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
  );
}
