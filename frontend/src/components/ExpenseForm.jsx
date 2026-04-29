import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import { ExpenseContext } from "../context/ExpenseContext";

const primaryTags = [
  "Food",
  "Groceries",
  "Fuel",
  "Rent",
  "Shopping",
  "Utilities",
  "Health",
  "Travel",
];
const secondaryTags = ["Need", "Want", "Investment"];
const paymentSources = ["UPI", "Credit Card", "Debit Card", "Cash", "Wallet"];
const customPrimaryTagsStorageKey = "expense_custom_primary_tags";
const addNewCategoryValue = "__add_new_category__";

const defaultForm = () => ({
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  primary_tag: "Food",
  secondary_tag: "Need",
  payment_source: "UPI",
});

export default function ExpenseForm({
  compact = false,
  variant = "default",
  selectedExpense,
  onClearSelection,
  onSubmitSuccess,
}) {
  const { addExpense, updateExpense } = useContext(ExpenseContext);
  const [form, setForm] = useState(defaultForm());
  const [dateInput, setDateInput] = useState(null);
  const [customPrimaryTags, setCustomPrimaryTags] = useState(() => {
    const saved = localStorage.getItem(customPrimaryTagsStorageKey);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  });
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState("");

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
      return;
    }

    setForm(defaultForm());
  }, [selectedExpense]);

  const handleChange = (event) => {
    if (
      event.target.name === "primary_tag" &&
      event.target.value === addNewCategoryValue
    ) {
      setNewCategoryValue("");
      setNewCategoryDialogOpen(true);
      return;
    }
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSaveNewCategory = () => {
    const trimmed = newCategoryValue.trim();
    if (!trimmed) return;

    const normalized = trimmed.toLowerCase();
    const existing = [...primaryTags, ...customPrimaryTags].some(
      (tag) => tag.trim().toLowerCase() === normalized,
    );

    const nextCustomTags = existing
      ? customPrimaryTags
      : [...customPrimaryTags, trimmed];

    setCustomPrimaryTags(nextCustomTags);
    localStorage.setItem(
      customPrimaryTagsStorageKey,
      JSON.stringify(nextCustomTags),
    );

    setForm((current) => ({ ...current, primary_tag: trimmed }));
    setNewCategoryDialogOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedExpense) {
      await updateExpense(selectedExpense.id, form);
      onClearSelection?.();
      onSubmitSuccess?.("edit");
    } else {
      await addExpense(form);
      onSubmitSuccess?.("create");
    }

    setForm(defaultForm());
  };

  const isDashboardVariant = variant === "dashboard";
  const allPrimaryTags = [...primaryTags, ...customPrimaryTags];

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {selectedExpense ? "Edit Expense" : "Quick Add Expense"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: isDashboardVariant
              ? {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(2, minmax(0, 1fr))",
                }
              : "1fr",
          }}
        >
          <TextField
            label="Amount"
            name="amount"
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            value={form.amount}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            select
            label="Category"
            name="primary_tag"
            value={form.primary_tag}
            onChange={handleChange}
            fullWidth
          >
            {allPrimaryTags.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem value={addNewCategoryValue}>+ Add new category</MenuItem>
          </TextField>

          <TextField
            label={isDashboardVariant ? "Date Picker" : "Date"}
            name="date"
            type="date"
            inputRef={setDateInput}
            value={form.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => dateInput?.showPicker?.()}
                  >
                    <CalendarMonthRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
            required
          />

          <TextField
            select
            label={isDashboardVariant ? "Tag (Secondary)" : "Secondary Tag"}
            name="secondary_tag"
            value={form.secondary_tag}
            onChange={handleChange}
            fullWidth
          >
            {secondaryTags.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label={isDashboardVariant ? "Source" : "Payment Source"}
            name="payment_source"
            value={form.payment_source}
            onChange={handleChange}
            fullWidth
          >
            {paymentSources.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={isDashboardVariant ? "Notes" : "Description"}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What was this expense for?"
            multiline={compact || isDashboardVariant}
            minRows={compact || isDashboardVariant ? 2 : 1}
            fullWidth
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{
            mt: 1,
            py: 1.2,
            background: "linear-gradient(135deg, #FF7A59 0%, #FB4D72 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #F97316 0%, #F43F5E 100%)",
            },
          }}
        >
          {selectedExpense ? "Save Changes" : "Log Expense"}
        </Button>

        {selectedExpense && (
          <Button variant="text" onClick={() => onClearSelection?.()}>
            Cancel editing
          </Button>
        )}
      </Box>

      <Dialog
        open={newCategoryDialogOpen}
        onClose={() => setNewCategoryDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add a category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category name"
            fullWidth
            value={newCategoryValue}
            onChange={(event) => setNewCategoryValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSaveNewCategory();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCategoryDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveNewCategory}
            disabled={!newCategoryValue.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
