from fastapi import HTTPException
from typing import Dict, Any

class StockAPIError(Exception):
    """Base exception for stock API errors"""
    pass

class StockNotFoundError(StockAPIError):
    """Exception raised when stock is not found"""
    def __init__(self, ticker: str):
        self.ticker = ticker
        self.message = f"Stock not found: {ticker}"
        super().__init__(self.message)

class RateLimitError(StockAPIError):
    """Exception raised when API rate limit is hit"""
    def __init__(self, provider: str):
        self.provider = provider
        self.message = f"Rate limit exceeded for {provider}. Please try again later."
        super().__init__(self.message)

class StockAPIError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=500, detail=detail)

class StockNotFoundError(HTTPException):
    def __init__(self, ticker: str):
        super().__init__(
            status_code=404,
            detail=f"Stock with ticker {ticker} not found"
        )

class CustomHTTPException(HTTPException):
    def __init__(self, status_code: int, data: Dict[str, Any]):
        self.status_code = status_code
        self.data = data
        super().__init__(status_code=status_code, detail=data) 