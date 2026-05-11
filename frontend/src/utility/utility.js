import { rangeConfig } from "./constants";

export function getDateLabel(rawDate) {
  const target = new Date(rawDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const normalizedTarget = target.toDateString();
  if (normalizedTarget === today.toDateString()) {
    return "Today";
  }
  if (normalizedTarget === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(target);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function getRangeExpenses(expenses, range) {
  const days = rangeConfig[range];
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days + 1);
  return expenses.filter((expense) => new Date(expense.date) >= cutoff);
}

export function buildCategoryTotals(expenses) {
  const grouped = expenses.reduce((accumulator, expense) => {
    const key = expense.primary_tag || "Other";
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
}

export function buildTotalsByField(expenses, field, fallback = "Other") {
  const grouped = expenses.reduce((accumulator, expense) => {
    const key = expense[field] || fallback;
    accumulator[key] = (accumulator[key] || 0) + Number(expense.amount);
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
}

export function buildDailySpendData(expenses) {
  const grouped = new Map();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const sortKey = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
    }).format(date);
    const current = grouped.get(sortKey) || { day: label, amount: 0 };
    grouped.set(sortKey, {
      ...current,
      amount: current.amount + Number(expense.amount),
    });
  });

  return Array.from(grouped.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([, values]) => ({
      day: values.day,
      amount: Math.round(values.amount),
    }));
}
