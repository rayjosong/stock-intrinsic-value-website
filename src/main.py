from fastapi import FastAPI
from loguru import logger
import uvicorn
from src.api.routes import router as api_router
from src.api.error_handlers import setup_error_handlers
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis
from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    app = FastAPI(
        title="Moat Analyzer API",
        description="API for financial data analysis",
        version="1.0.0"
    )
    
    # Setup logging
    logger.add("logs/app.log", rotation="500 MB", level="DEBUG")
    
    # Include routers
    app.include_router(api_router, prefix="/api")
    
    # Setup error handlers
    setup_error_handlers(app)
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.on_event("startup")
    async def startup():
        redis = aioredis.from_url("redis://localhost")
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    
    @app.on_event("shutdown")
    async def shutdown():
        # Clean up resources here
        pass
    
    return app

app = create_app()

if __name__ == "__main__":
    logger.info("@rayjosong Starting Stock Analysis API")
    uvicorn.run(app, host="0.0.0.0", port=8000) 