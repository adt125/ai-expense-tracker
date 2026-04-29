import { useContext, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { DataGrid } from "@mui/x-data-grid";
import { alpha, useTheme } from "@mui/material/styles";
import { ExpenseContext } from "../context/ExpenseContext";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getDateBucket(rawDate) {
  const target = new Date(rawDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (target.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (target.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(target);
}

export default function TransactionsView({ onEditExpense }) {
  const { expenses, deleteExpense, addExpense } = useContext(ExpenseContext);
  const [query, setQuery] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const filteredRows = useMemo(() => {
    const lowerCaseQuery = query.trim().toLowerCase();

    return (
      expenses
        .filter((expense) => {
          if (!lowerCaseQuery) {
            return true;
          }

          return [
            expense.description,
            expense.primary_tag,
            expense.secondary_tag,
            expense.payment_source,
            expense.date,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(lowerCaseQuery),
            );
        })
        .map((expense) => ({
          id: expense.id,
          date: expense.date,
          dateBucket: getDateBucket(expense.date),
          description: expense.description || expense.primary_tag,
          category: expense.primary_tag,
          purpose: expense.secondary_tag,
          payment: expense.payment_source,
          amount: Number(expense.amount),
          rawExpense: expense,
        }))
        // @ts-ignore
        .sort((first, second) => new Date(second.date) - new Date(first.date))
    );
  }, [expenses, query]);

  const columns = [
    {
      field: "dateBucket",
      headerName: "Day Group",
      minWidth: 140,
      flex: 0.8,
    },
    {
      field: "description",
      headerName: "Transaction",
      minWidth: 220,
      flex: 1.3,
    },
    {
      field: "category",
      headerName: "Category",
      minWidth: 140,
      flex: 0.9,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: alpha("#10B981", isDark ? 0.22 : 0.14),
              color: isDark ? "#D1FAE5" : "#065F46",
              border: `1px solid ${alpha("#10B981", isDark ? 0.4 : 0.26)}`,
            }}
          />
        </Box>
      ),
    },
    {
      field: "purpose",
      headerName: "Tags",
      minWidth: 170,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Stack direction="row" spacing={0.75}>
            <Chip
              label={params.value}
              size="small"
              variant="outlined"
              sx={{
                borderColor: isDark ? alpha("#94A3B8", 0.38) : "#CBD5E1",
                color: "text.primary",
                bgcolor: isDark ? alpha("#94A3B8", 0.08) : alpha("#64748B", 0.06),
              }}
            />
          </Stack>
        </Box>
      ),
    },
    {
      field: "payment",
      headerName: "Source",
      minWidth: 140,
      flex: 0.8,
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 130,
      flex: 0.8,
      type: "number",
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography fontWeight={700} color="error.main">
            {formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "",
      minWidth: 72,
      sortable: false,
      filterable: false,
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <IconButton
            onClick={(event) => {
              setMenuAnchor(event.currentTarget);
              setActiveRow(params.row.rawExpense);
            }}
          >
            <MoreHorizRoundedIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h6">Smart Ledger</Typography>
          <Typography variant="body2" color="text.secondary">
            Search, scan, sort, and manage your complete expense history.
          </Typography>
        </Box>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search transactions, categories, or sources"
          sx={{ width: { xs: "100%", md: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box sx={{ height: 640 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          getRowHeight={() => 64}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: isDark ? alpha("#0B1220", 0.9) : "#F8FAFC",
              borderBottom: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
              alignItems: "center",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: isDark
                ? alpha("#94A3B8", 0.06)
                : alpha("#6366F1", 0.04),
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `1px solid ${isDark ? "#1E293B" : "#E2E8F0"}`,
            },
          }}
        />
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setActiveRow(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeRow) {
              onEditExpense(activeRow);
            }
            setMenuAnchor(null);
            setActiveRow(null);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (activeRow) {
              await addExpense({
                amount: activeRow.amount,
                date: activeRow.date,
                description: activeRow.description,
                primary_tag: activeRow.primary_tag,
                secondary_tag: activeRow.secondary_tag,
                payment_source: activeRow.payment_source,
              });
            }
            setMenuAnchor(null);
            setActiveRow(null);
          }}
        >
          Duplicate
        </MenuItem>
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            if (activeRow) {
              deleteExpense(activeRow.id);
            }
            setMenuAnchor(null);
            setActiveRow(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Paper>
  );
}
