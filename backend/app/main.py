from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load variables from backend/.env before importing Settings.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all SQLAlchemy models before Base.metadata.create_all()
# and before any route performs a database query.
import app.models  # noqa: F401

from app.api.routes import auth, health
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
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(admin_router, prefix="/api", tags=["admin"])


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import settings
# from app.api.routes import health

# app = FastAPI(title="VELTRIX AI API", version="0.1.0")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.FRONTEND_URL],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# app.include_router(health.router, prefix="/api")


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import settings
# from app.api.routes.health import router as health_router

# app = FastAPI(
#     title=settings.app_name,
#     description="VELTRIX AI Intelligence Platform API",
#     version="0.1.0",
# )


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# app.include_router(health_router)


# @app.get("/")
# def root():
#     return {
#         "name": "VELTRIX",
#         "message": "VELTRIX API is running",
#         "version": "0.1.0",
#     }
