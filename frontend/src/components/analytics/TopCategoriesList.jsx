import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import { alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { chartColors, iconMap } from "../../utility/constants";
import { buildCategoryTotals, formatCurrency } from "../../utility/utility";

export default function TopCategoriesList({ scopedExpenses }) {
  const categoryTotals = useMemo(
    () => buildCategoryTotals(scopedExpenses),
    [scopedExpenses],
  );
  const totalInRange = scopedExpenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0,
  );

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Top Categories
      </Typography>
      <List disablePadding>
        {categoryTotals.slice(0, 5).map((category, index) => {
          const IconComponent = iconMap[category.name] || PaidRoundedIcon;
          return (
            <ListItem
              key={category.name}
              disableGutters
              sx={{ py: 1.25 }}
              secondaryAction={
                <Typography fontWeight={700}>
                  {formatCurrency(category.value)}
                </Typography>
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: alpha(
                      chartColors[index % chartColors.length],
                      0.14,
                    ),
                  }}
                >
                  <IconComponent
                    sx={{ color: chartColors[index % chartColors.length] }}
                  />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={category.name}
                secondary={`${Math.round((category.value / Math.max(totalInRange, 1)) * 100)}% of selected spend`}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}
