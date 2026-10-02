# from fastapi import APIRouter

# router = APIRouter()


# @router.get("/health")
# def health():
#     return {"status": "ok", "service": "veltrix-api"}

from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check():
    return {
        "status": "healthy",
        "service": "VELTRIX API",
        "environment": "development",
    }
