import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth, expenses, report, summary, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")


def _use_binary_format_for_multipart(schema):
    if isinstance(schema, dict):
        if schema.get("contentMediaType") == "application/octet-stream":
            schema.pop("contentMediaType", None)
            schema["format"] = "binary"

        for value in schema.values():
            _use_binary_format_for_multipart(value)
    elif isinstance(schema, list):
        for item in schema:
            _use_binary_format_for_multipart(item)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )

    components = openapi_schema.get("components", {}).get("schemas", {})
    for path_item in openapi_schema.get("paths", {}).values():
        for operation in path_item.values():
            request_body = operation.get("requestBody", {})
            multipart = request_body.get("content", {}).get("multipart/form-data")
            if not multipart:
                continue

            multipart_schema = multipart.get("schema", {})
            _use_binary_format_for_multipart(multipart_schema)

            ref = multipart_schema.get("$ref")
            if ref:
                component_name = ref.rsplit("/", 1)[-1]
                _use_binary_format_for_multipart(components.get(component_name, {}))

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

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
