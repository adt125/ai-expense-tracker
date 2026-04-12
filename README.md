# Expense Tracker Application

A full-stack Expense Tracker with React frontend, FastAPI backend, PostgreSQL schema, and basic AI/ML spending insights.

## Project structure

- `backend/`: FastAPI app, database models, auth, forecast and AI service.
- `frontend/`: React app built with Vite, Material UI, and Recharts.
- `backend/sql/schema.sql`: PostgreSQL schema for `users` and `expenses`.

## Backend setup

1. Create a Python environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configure env vars in `backend/.env` or your shell from `.env.example`.
3. Create the PostgreSQL database and run the schema script:
   ```bash
   psql $DATABASE_URL -f sql/schema.sql
   ```
4. Start FastAPI:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Frontend setup

1. Install node dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run the React app:
   ```bash
   npm run dev
   ```
3. The UI should be available at `http://localhost:5173`.

## Database schema

`backend/sql/schema.sql` contains the relational tables:

- `users(id, email, hashed_password, full_name, created_at)`
- `expenses(id, user_id, amount, date, description, primary_tag, secondary_tag, payment_source, created_at)`

## API documentation

### Authentication

- `POST /auth/register`
  - Body: `{ "email", "password", "full_name" }`
  - Response: created user
- `POST /auth/login`
  - Form body: `username`, `password`
  - Response: `{ "access_token", "token_type" }`

### Expense management

- `POST /expenses`
  - Authenticated
  - Body: `{ amount, date, description, primary_tag, secondary_tag, payment_source }`
- `GET /expenses`
  - Authenticated
  - Query params: optional `start_date`, `end_date`

### Dashboard and insights

- `GET /summary`
  - Authenticated
  - Optional query: `budget`, `month`, `year`
  - Response includes monthly total, forecasted spend, and warning state.
- `GET /report`
  - Authenticated
  - Optional query: `budget`
  - Response includes an AI-based spending summary and advice.

## Notes

- The AI report uses OpenAI when `OPENAI_API_KEY` is configured. Otherwise it generates local spending feedback.
- Budget forecasting uses a simple regression-style service mocked as a lightweight ML component.
