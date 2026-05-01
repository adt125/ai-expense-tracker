import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth, expenses, report, summary, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:9000,http://localhost:5173")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX")

cors_kwargs = dict(
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if cors_origin_regex:
    app.add_middleware(CORSMiddleware, allow_origin_regex=cors_origin_regex, **cors_kwargs)
else:
    app.add_middleware(CORSMiddleware, allow_origins=cors_origins, **cors_kwargs)

app.include_router(auth)
app.include_router(expenses)
app.include_router(summary)
app.include_router(report)
app.include_router(chat)

# Serve built frontend (optional). For deployment, build the Vite app into `frontend/dist`.
frontend_dist = (Path(__file__).resolve().parents[2] / "frontend" / "dist").resolve()
if frontend_dist.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(frontend_dist / "assets")),
        name="frontend-assets",
    )

    @app.get("/", include_in_schema=False)
    def serve_frontend_index():
        return FileResponse(str(frontend_dist / "index.html"))
