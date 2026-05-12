import { useContext, useMemo, useState } from "react";
import { Paper, Tab, Tabs } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import { ExpenseContext } from "../../context/ExpenseContext";
import { getRangeExpenses } from "../../utility/utility";
import CategoryMixChart from "./CategoryMixChart";
import DailySpendingChart from "./DailySpendingChart";
import PaymentSourceChart from "./PaymentSourceChart";
import SecondaryTagChart from "./SecondaryTagChart";
import SpendingInsightCard from "./SpendingInsightCard";
import TopCategoriesList from "./TopCategoriesList";

export default function ReportCard() {
  const { expenses, summary, report } = useContext(ExpenseContext);
  const [range, setRange] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const scopedExpenses = useMemo(
    () => getRangeExpenses(expenses, range),
    [expenses, range],
  );
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Tabs
            value={range}
            onChange={(_, nextValue) => {
              setRange(nextValue);
              setSelectedCategory(null);
            }}
          >
            <Tab value="weekly" label="Weekly" />
            <Tab value="monthly" label="Monthly" />
            <Tab value="yearly" label="Yearly" />
          </Tabs>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <PaymentSourceChart scopedExpenses={scopedExpenses} isDark={isDark} />
      </Grid>

      <Grid item xs={12} md={4}>
        <DailySpendingChart scopedExpenses={scopedExpenses} isDark={isDark} />
      </Grid>

      <Grid item xs={12} md={4}>
        <SecondaryTagChart scopedExpenses={scopedExpenses} isDark={isDark} />
      </Grid>

      <Grid item xs={12} md={3.5}>
        <SpendingInsightCard
          scopedExpenses={scopedExpenses}
          summary={summary}
          report={report}
        />
      </Grid>

      <Grid item xs={12} md={5}>
        <CategoryMixChart
          scopedExpenses={scopedExpenses}
          isDark={isDark}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </Grid>

      <Grid item xs={12} md={3.5}>
        <TopCategoriesList scopedExpenses={scopedExpenses} />
      </Grid>
    </Grid>
  );
}
