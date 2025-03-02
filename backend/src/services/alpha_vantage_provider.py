from typing import Dict
import requests
import json
from loguru import logger
from src.models.stock import StockInfo
from src.models.errors import StockNotFoundError, StockAPIError
from .financial_data_provider import FinancialDataProvider
from fastapi_cache.decorator import cache
from datetime import timedelta
import fastapi_cache

class AlphaVantageProvider(FinancialDataProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        logger.info("@rayjosong Initialized AlphaVantageProvider")

    async def get_current_price(self, ticker: str) -> float:
        """Get the current price for a ticker using Alpha Vantage's GLOBAL_QUOTE endpoint"""
        logger.debug(f"@rayjosong Fetching current price for {ticker}")
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker,
            "apikey": self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "Global Quote" not in data or not data["Global Quote"]:
                logger.error(f"@rayjosong No price data found for ticker {ticker}")
                return 0.0
                
            price = float(data["Global Quote"].get("05. price", 0)) 
            logger.info(f"@rayjosong Current price for {ticker}: {price}")
            return price
            
        except Exception as e:
            logger.error(f"@rayjosong Error fetching current price for {ticker}: {str(e)}")
            return 0.0

    def _generate_cache_key(self, ticker: str, operation: str) -> str:
        return f"fastapi_cache:{self.__class__.__name__}.{operation}:{ticker.upper()}"

    @cache(expire=timedelta(hours=1))
    async def get_stock_info(self, ticker: str) -> StockInfo:
        logger.info(f"@rayjosong Calling Alpha Vantage API for {ticker} stock info")
        params = {
            "function": "OVERVIEW",
            "symbol": ticker,
            "apikey": self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "Name" not in data:
                logger.error(f"@rayjosong No data found for ticker {ticker}")
                raise StockNotFoundError(ticker)
            
            current_price = await self.get_current_price(ticker)
            
            return StockInfo(
                ticker=ticker,
                name=data["Name"],
                current_price=current_price,
                currency="USD",
                sector=data.get("Sector", "Unknown"),
                industry=data.get("Industry", "Unknown")
            )
            
        except Exception as e:
            logger.error(f"@rayjosong Error fetching stock info for {ticker}: {str(e)}")
            raise StockAPIError(f"Failed to fetch stock data: {str(e)}")

    @cache(expire=timedelta(hours=1))
    async def get_financial_metrics(self, ticker: str) -> Dict:
        cache_key = self._generate_cache_key(ticker, "financial_metrics")
        logger.info(f"@rayjosong Calling Alpha Vantage API for {ticker} financial metrics")
        logger.debug(f"@rayjosong Fetching financial metrics for {ticker}")
        params = {
            "function": "CASH_FLOW",
            "symbol": ticker,
            "apikey": self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "annualReports" not in data:
                logger.error(f"@rayjosong No cash flow data found for ticker {ticker}")
                raise StockNotFoundError(ticker)
                
            latest_report = data["annualReports"][0]
            operating_cash_flow = float(latest_report.get("operatingCashflow", 0))
            capex = float(latest_report.get("capitalExpenditures", 0))
            fcf = operating_cash_flow - capex
            
            return {
                "fcf": fcf,
                "year": latest_report.get("fiscalDateEnding", "Unknown")
            }
            
        except Exception as e:
            logger.error(f"@rayjosong Error fetching financial metrics for {ticker}: {str(e)}")
            raise StockAPIError(f"Failed to fetch financial metrics: {str(e)}") 