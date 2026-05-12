import { Paper, Typography, Box, Stack, Button, Avatar } from "@mui/material";
import {
  lowerCardHeight,
  categoryColors,
  iconMap,
} from "../../utility/constants";
import { formatCurrency, getDateLabel } from "../../utility/utility";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { alpha } from "@mui/material/styles";

export default function RecentExpenses({
  recentActivity,
  cardSurface,
  isDark,
  onViewAllTransactions,
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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Recent Activity</Typography>
        <Button
          size="small"
          sx={{ color: "#A78BFA" }}
          onClick={onViewAllTransactions}
        >
          View all
        </Button>
      </Stack>

      <Stack spacing={1.25} sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {recentActivity.length ? (
          recentActivity.map((expense, index) => {
            const IconComponent =
              iconMap[expense.primary_tag] || StorefrontRoundedIcon;

            return (
              <Paper
                key={expense.id}
                sx={{
                  p: { xs: 1.6, lg: 2 },
                  borderRadius: 3,
                  borderColor: "transparent",
                  bgcolor: isDark
                    ? alpha("#94A3B8", 0.1)
                    : alpha("#F1F5F9", 0.82),
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1.5}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: alpha(
                          categoryColors[index % categoryColors.length],
                          0.18,
                        ),
                        color: categoryColors[index % categoryColors.length],
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
                  <Typography fontWeight={700}>
                    {formatCurrency(expense.amount)}
                  </Typography>
                </Stack>
              </Paper>
            );
          })
        ) : (
          <Typography color="text.secondary">
            Recent transactions will appear here once you log expenses.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
