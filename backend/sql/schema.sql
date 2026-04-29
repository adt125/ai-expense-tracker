-- PostgreSQL schema for Expense Tracker
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    primary_tag VARCHAR(100) NOT NULL,
    secondary_tag VARCHAR(100) NOT NULL,
    payment_source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    budget_goal NUMERIC(10, 2) NOT NULL DEFAULT 50000.0,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    email_alerts VARCHAR(20) NOT NULL DEFAULT 'enabled',
    chat_daily_count INTEGER NOT NULL DEFAULT 0,
    chat_daily_date DATE
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
