import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth, expenses, report, summary, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

origins = ["http://localhost:9000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth)
app.include_router(expenses)
app.include_router(summary)
app.include_router(report)
app.include_router(chat)
