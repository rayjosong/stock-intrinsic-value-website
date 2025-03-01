from fastapi import HTTPException

class StockAPIError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=500, detail=detail)

class StockNotFoundError(HTTPException):
    def __init__(self, ticker: str):
        super().__init__(
            status_code=404,
            detail=f"Stock with ticker {ticker} not found"
        ) 