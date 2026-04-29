import { createContext, useEffect, useState } from "react";
import api from "../services/api";
import { encryptPassword } from "../services/authCrypto";

export const ExpenseContext = createContext(null);

const initialState = {
  token: null,
  sessionId: null,
  currentUser: null,
  userSettings: null,
  expenses: [],
  summary: null,
  report: null,
};

export function ExpenseProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("expense_token"));
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("expense_agent_session_id"),
  );
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("expense_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [userSettings, setUserSettings] = useState(null);

  const clearAuthState = () => {
    setToken(null);
    setSessionId(null);
    setCurrentUser(null);
    setExpenses([]);
    setSummary(null);
    setReport(null);
    setUserSettings(null);
    localStorage.removeItem("expense_user");
    localStorage.removeItem("expense_agent_session_id");
  };

  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        if (status === 401 && !url.includes("/auth/login")) {
          // Token is missing/expired; send the user back to login by clearing auth state.
          clearAuthState();
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      fetchExpenses();
      fetchUserSettings();
    };
    if (token) {
      localStorage.setItem("expense_token", token);
      if (sessionId) {
        localStorage.setItem("expense_agent_session_id", sessionId);
      }
      if (currentUser) {
        localStorage.setItem("expense_user", JSON.stringify(currentUser));
      }
      loadUserData();
    } else {
      localStorage.removeItem("expense_token");
      localStorage.removeItem("expense_agent_session_id");
      localStorage.removeItem("expense_user");
    }
  }, [token, sessionId, currentUser]);

  useEffect(() => {
    fetchReport();
    fetchSummary();
  }, [userSettings]);

  const login = async (email, password) => {
    const encryptedPassword = await encryptPassword(password);
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", encryptedPassword);
    const response = await api.post("/auth/login", formData);
    setToken(response.data.access_token);
    setSessionId(response.data.session_id);
    const user = {
      email: response.data.email,
      full_name: response.data.full_name,
    };
    setCurrentUser(user);
    localStorage.setItem("expense_user", JSON.stringify(user));
    localStorage.setItem("expense_agent_session_id", response.data.session_id);
  };

  const register = async (payload) => {
    const encryptedPassword = await encryptPassword(payload.password);
    await api.post("/auth/register", {
      ...payload,
      password: encryptedPassword,
    });
    await login(payload.email, payload.password);
  };

  const logout = async () => {
    if (token && sessionId) {
      try {
        await api.post("/expensoAi/reset-session", null, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Session-ID": sessionId,
          },
        });
      } catch (error) {
        console.warn("Unable to terminate agent session", error);
      }
    }
    clearAuthState();
  };

  const fetchExpenses = async () => {
    if (!token) return;
    const response = await api.get("/expenses/get_all_expenses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(response.data);
  };

  const fetchSummary = async () => {
    if (!token || !userSettings) return;
    const response = await api.get("/summary", {
      headers: { Authorization: `Bearer ${token}` },
      params: { budget: userSettings.budget_goal },
    });
    setSummary(response.data);
  };

  const fetchReport = async () => {
    if (!token || !userSettings) return;
    const response = await api.get("/report", {
      headers: { Authorization: `Bearer ${token}` },
      params: { budget: userSettings.budget_goal },
    });
    setReport(response.data);
  };

  const fetchAgentResponse = async (payload) => {
    if (!token || !sessionId) return;
    try {
      const response = await api.post("/expensoAi/chat", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Session-ID": sessionId,
        },
      });

      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;

      if (status === 429) {
        return {
          response:
            detail ||
            "You have exceeded your free tier limit for today (5 questions). Please try again tomorrow.",
        };
      }

      return { response: "Sorry, something went wrong. Please try again." };
    }
  };

  const fetchUserSettings = async () => {
    if (!token) return;
    const response = await api.get("/expenses/get_user_settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUserSettings(response.data);
  };

  const updateUserSettings = async (budget) => {
    if (!token) return;
    const response = await api.post("/expenses/update_user_settings", null, {
      headers: { Authorization: `Bearer ${token}` },
      params: { budget: budget },
    });
    setUserSettings(response.data);
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
        sessionId,
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
        fetchAgentResponse,
        updateUserSettings,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}
