from fastapi import Request
from fastapi.responses import JSONResponse
from src.models.errors import CustomHTTPException, StockNotFoundError, RateLimitError, StockAPIError

def setup_error_handlers(app):
    @app.exception_handler(CustomHTTPException)
    async def custom_http_exception_handler(request: Request, exc: CustomHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status_code": exc.status_code,
                "data": exc.data
            }
        )

    @app.exception_handler(StockNotFoundError)
    async def stock_not_found_handler(request: Request, exc: StockNotFoundError):
        return JSONResponse(
            status_code=404,
            content={
                "status_code": 404,
                "data": {
                    "ticker": exc.ticker,
                    "developer_message": "The requested stock was not found",
                    "user_message": exc.message,
                    "error_code": "STOCK_NOT_FOUND"
                }
            }
        )

    @app.exception_handler(RateLimitError)
    async def rate_limit_handler(request: Request, exc: RateLimitError):
        return JSONResponse(
            status_code=429,
            content={
                "status_code": 429,
                "data": {
                    "provider": exc.provider,
                    "developer_message": "API rate limit exceeded",
                    "user_message": exc.message,
                    "error_code": "RATE_LIMIT_EXCEEDED"
                }
            }
        )

    @app.exception_handler(StockAPIError)
    async def stock_api_error_handler(request: Request, exc: StockAPIError):
        return JSONResponse(
            status_code=500,
            content={
                "status_code": 500,
                "data": {
                    "error_type": type(exc).__name__,
                    "developer_message": str(exc),
                    "user_message": "An unexpected error occurred",
                    "error_code": "INTERNAL_SERVER_ERROR"
                }
            }
        ) 