import { createContext, useEffect, useState } from "react";
import api from "../services/api";
import { encryptPassword } from "../services/authCrypto";

export const ExpenseContext = createContext(null);

const initialState = {
  token: null,
  currentUser: null,
  expenses: [],
  summary: null,
  report: null,
};

export function ExpenseProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("expense_token"));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("expense_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("expense_token", token);
      if (currentUser) {
        localStorage.setItem("expense_user", JSON.stringify(currentUser));
      }
      fetchSummary();
      fetchExpenses();
      fetchReport();
    } else {
      localStorage.removeItem("expense_token");
      localStorage.removeItem("expense_user");
    }
  }, [token, currentUser]);

  const login = async (email, password) => {
    const encryptedPassword = await encryptPassword(password);
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", encryptedPassword);
    const response = await api.post("/auth/login", formData);
    setToken(response.data.access_token);
    const user = {
      email: response.data.email,
      full_name: response.data.full_name,
    };
    setCurrentUser(user);
    localStorage.setItem("expense_user", JSON.stringify(user));
  };

  const register = async (payload) => {
    const encryptedPassword = await encryptPassword(payload.password);
    await api.post("/auth/register", {
      ...payload,
      password: encryptedPassword,
    });
    await login(payload.email, payload.password);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setExpenses([]);
    setSummary(null);
    setReport(null);
    localStorage.removeItem("expense_user");
  };

  const fetchExpenses = async () => {
    if (!token) return;
    const response = await api.get("/expenses/get_all_expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(response.data);
  };

  const fetchSummary = async () => {
    if (!token) return;
    const response = await api.get("/summary", {
      headers: { Authorization: `Bearer ${token}` },
      params: { budget: 50000 },
    });
    setSummary(response.data);
  };

  const fetchReport = async () => {
    if (!token) return;
    const response = await api.get("/report", {
      headers: { Authorization: `Bearer ${token}` },
      params: { budget: 50000 },
    });
    setReport(response.data);
  };

  const addExpense = async (expenseData) => {
    if (!token) return;
    await api.post("/expenses/create", expenseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchExpenses();
    await fetchSummary();
    await fetchReport();
  };

  const updateExpense = async (expenseId, expenseData) => {
    if (!token) return;
    await api.put(`/expenses/update_by_id/${expenseId}`, expenseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchExpenses();
    await fetchSummary();
    await fetchReport();
  };

  const deleteExpense = async (expenseId) => {
    if (!token) return;
    await api.delete(`/expenses/delete_by_id/${expenseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchExpenses();
    await fetchSummary();
    await fetchReport();
  };

  return (
    <ExpenseContext.Provider
      value={{
        ...initialState,
        token,
        currentUser,
        expenses,
        summary,
        report,
        login,
        register,
        logout,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}
