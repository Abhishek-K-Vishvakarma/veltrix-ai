from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load variables from backend/.env before importing Settings.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all SQLAlchemy models before Base.metadata.create_all()
import app.models  # noqa: F401

# CLEANED IMPORTS: Ek hi baar saare standard routers ko sahi se import kiya hai
from app.api.routes import (
    analyses,
    analytics,
    auth,
    documents,
    health,
    knowledge,
    projects,
)
from app.api.routes.admin import router as admin_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Development only. Use Alembic migrations in production.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="VELTRIX AI API",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes registration ---
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(admin_router, prefix="/api", tags=["admin"])

# FIXED ROUTER PATH: Module name (.router) use kiya taaki AttributeError na aaye
app.include_router(analyses.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(projects.router, prefix="/api")


# --- Swagger UI fix: show real file pickers for UploadFile fields ---
from fastapi.openapi.utils import get_openapi  # noqa: E402


def _custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title=app.title, version=app.version, routes=app.routes)

    def fix(node):
        if isinstance(node, dict):
            if node.get("contentMediaType") == "application/octet-stream":
                node.pop("contentMediaType")
                node["format"] = "binary"
            for value in node.values():
                fix(value)
        elif isinstance(node, list):
            for value in node:
                fix(value)

    fix(schema)
    app.openapi_schema = schema
    return schema


app.openapi = _custom_openapi
