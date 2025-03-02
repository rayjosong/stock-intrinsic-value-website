from abc import ABC, abstractmethod
from typing import Dict
from src.models.stock import StockInfo
from fastapi_cache.decorator import cache
from datetime import timedelta
from loguru import logger
from fastapi_cache import FastAPICache

class FinancialDataProvider(ABC):
    """Abstract base class for financial data providers"""
    
    @abstractmethod
    @cache(expire=timedelta(hours=1), namespace="financial_data")
    async def get_stock_info(self, ticker: str) -> StockInfo:
        """Get basic stock information"""
        logger.info(f"@rayjosong Executing get_stock_info for {ticker}")
        pass

    @abstractmethod
    @cache(expire=timedelta(hours=1), namespace="financial_metrics")
    async def get_financial_metrics(self, ticker: str) -> Dict:
        """Get financial metrics including FCF"""
        logger.info(f"@rayjosong Executing get_financial_metrics for {ticker}")
        pass

    async def _log_cache_usage(self, func_name: str, ticker: str):
        cache_key = f"{func_name}:{ticker}"
        try:
            # Check if cache exists by trying to get the value
            cached_value = await FastAPICache.get_backend().get(cache_key)
            if cached_value is not None:
                logger.debug(f"@rayjosong Cache HIT for {func_name} - {ticker}")
            else:
                logger.info(f"@rayjosong Cache MISS for {func_name} - {ticker}, calling external API")
        except Exception as e:
            logger.warning(f"@rayjosong Error checking cache for {func_name} - {ticker}: {str(e)}")
            logger.info(f"@rayjosong Proceeding with external API call for {func_name} - {ticker}")

    def _generate_cache_key(self, symbol: str, interval: str) -> str:
        # Base class implementation
        return f"{self.provider_name}:{symbol}:{interval}" 