from fastapi import APIRouter, Depends

from app.api.deps import require_admin

from app.api.routes.admin.ai_performance import router as ai_performance_router
from app.api.routes.admin.analyses import router as analyses_router
from app.api.routes.admin.dashboard import router as dashboard_router
from app.api.routes.admin.knowledge import router as knowledge_router
from app.api.routes.admin.logs import router as logs_router
from app.api.routes.admin.models import router as models_router
from app.api.routes.admin.system import router as system_router
from app.api.routes.admin.users import router as users_router

router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(require_admin)],
)


router.include_router(dashboard_router)
router.include_router(users_router)
router.include_router(analyses_router)
router.include_router(ai_performance_router)
router.include_router(models_router)
router.include_router(logs_router)
router.include_router(knowledge_router)
router.include_router(system_router)
