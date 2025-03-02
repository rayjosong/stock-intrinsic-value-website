from typing import Dict
from loguru import logger
from src.models.stock import StockInfo
from src.models.errors import StockNotFoundError, StockAPIError
from .financial_data_provider import FinancialDataProvider
from fastapi_cache.decorator import cache
from datetime import timedelta
import fastapi_cache

class MockProvider(FinancialDataProvider):
    def __init__(self):
        self.provider_name = "mock"
        # logger.info("@rayjosong Initialized MockProvider")

    async def get_current_price(self, ticker: str) -> float:
        logger.debug(f"@rayjosong Mock fetching current price for {ticker}")
        return 100.0  # Hardcoded price

    @cache(expire=timedelta(hours=1))
    async def get_stock_info(self, ticker: str) -> StockInfo:
        cache_key = self._generate_cache_key(ticker, "get_stock_info")
        logger.info(f"@rayjosong Checking cache for {ticker} stock info")
        
        # Manual cache check
        cached = await fastapi_cache.FastAPICache.get_backend().get(cache_key)
        if cached:
            logger.info(f"@rayjosong Cache hit for {ticker} stock info")
            return cached
            
        logger.info(f"@rayjosong Cache miss, returning mock data for {ticker}")
        
        # Hardcoded response
        return StockInfo(
            ticker=ticker,
            name="Mock Company Inc.",
            current_price=100.0,
            currency="USD",
            sector="Technology",
            industry="Software"
        )

    @cache(expire=timedelta(hours=1))
    async def get_financial_metrics(self, ticker: str) -> Dict:
        logger.info(f"@rayjosong Mock fetching financial metrics for {ticker}")
        
        # Hardcoded response
        return {
            "fcf": 500000000.0,
            "year": "2023"
        } 