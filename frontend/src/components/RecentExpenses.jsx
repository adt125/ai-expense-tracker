import { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function RecentExpenses({ onEdit }) {
  const { expenses, deleteExpense } = useContext(ExpenseContext);
  const recent = expenses.slice(0, 8);

  const handleDelete = (expenseId) => {
    if (window.confirm("Delete this expense?")) {
      deleteExpense(expenseId);
    }
  };

  return (
    <Box>
      {recent.length ? (
        <List>
          {recent.map((expense) => (
            <Box key={expense.id} sx={{ mb: 1 }}>
              <ListItem
                disableGutters
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => onEdit(expense)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={`${expense.description || expense.primary_tag} — ₹${Number(expense.amount).toFixed(2)}`}
                  secondary={`${expense.date} • ${expense.primary_tag} / ${expense.secondary_tag}`}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Add expenses to see your recent activity here.
        </Typography>
      )}
    </Box>
  );
}
