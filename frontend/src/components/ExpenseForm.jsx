import { useState, useContext, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { ExpenseContext } from "../context/ExpenseContext";

const primaryTags = [
  "Food",
  "Fuel",
  "Rent",
  "Shopping",
  "Utilities",
  "Health",
  "Travel",
];
const secondaryTags = ["Need", "Want", "Investment", "Savings", "Emergencies"];
const paymentSources = ["Credit Card", "UPI", "Cash", "Debit Card", "Wallet"];

const defaultForm = () => ({
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  primary_tag: "Food",
  secondary_tag: "Need",
  payment_source: "UPI",
});

export default function ExpenseForm({ selectedExpense, onClearSelection }) {
  const { addExpense, updateExpense } = useContext(ExpenseContext);
  const [form, setForm] = useState(defaultForm());

  useEffect(() => {
    if (selectedExpense) {
      setForm({
        amount: selectedExpense.amount,
        date: selectedExpense.date,
        description: selectedExpense.description || "",
        primary_tag: selectedExpense.primary_tag,
        secondary_tag: selectedExpense.secondary_tag,
        payment_source: selectedExpense.payment_source,
      });
    } else {
      setForm(defaultForm());
    }
  }, [selectedExpense]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedExpense) {
      await updateExpense(selectedExpense.id, form);
      onClearSelection();
    } else {
      await addExpense(form);
    }
    setForm(defaultForm());
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        {selectedExpense ? "Edit expense" : "Add a new expense"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} gap={2} display="grid">
        <TextField
          label="Amount"
          name="amount"
          type="number"
          inputProps={{ step: "0.01" }}
          value={form.amount}
          onChange={handleChange}
          required
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          select
          label="Primary Tag"
          name="primary_tag"
          value={form.primary_tag}
          onChange={handleChange}
        >
          {primaryTags.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Secondary Tag"
          name="secondary_tag"
          value={form.secondary_tag}
          onChange={handleChange}
        >
          {secondaryTags.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Payment Source"
          name="payment_source"
          value={form.payment_source}
          onChange={handleChange}
        >
          {paymentSources.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button type="submit" variant="contained" size="large">
            {selectedExpense ? "Save changes" : "Save expense"}
          </Button>
          {selectedExpense && (
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                onClearSelection();
                setForm(defaultForm());
              }}
            >
              Cancel edit
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
