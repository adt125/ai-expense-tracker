import { Paper, Typography, Box, Stack } from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { lowerCardHeight, categoryColors } from "../../utility/constants";
import { formatCurrency } from "../../utility/utility";
export default function TopSpendingChart({
  categoryData,
  cardSurface,
  isDark,
}) {
  return (
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
            <Typography color="text.secondary">{category.percent}%</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
