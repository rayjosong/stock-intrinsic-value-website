from typing import Dict
import yfinance as yf
from loguru import logger
import json
from src.models.stock import StockInfo
from src.models.errors import StockNotFoundError, StockAPIError, RateLimitError
from .financial_data_provider import FinancialDataProvider
from fastapi_cache.decorator import cache
from datetime import timedelta
from fastapi_cache import FastAPICache

class YahooFinanceProvider(FinancialDataProvider):
    def __init__(self):
        self.provider_name = "Yahoo Finance"
        logger.info("@rayjosong Initialized YahooFinanceProvider")

    def _handle_error(self, e: Exception, operation: str, ticker: str) -> None:
        """Centralized error handling with structured logging"""
        error_context = {
            "provider": self.provider_name,
            "operation": operation,
            "ticker": ticker,
            "error_type": type(e).__name__,
            "error_message": str(e)
        }
        
        logger.error("@rayjosong API Error: {provider} {operation} failed for {ticker}: {error_type} - {error_message}", 
                    **error_context)
        
        # Check for rate limit indicators
        error_msg = str(e).lower()
        # Checks if error message contains rate limit indicators (status code 429 or related phrases)
        if any(indicator in error_msg for indicator in ["rate limit", "429", "too many requests"]):
            raise RateLimitError(self.provider_name)
            
        raise StockAPIError(f"Operation failed: {str(e)}")

    @cache(expire=timedelta(hours=1))
    async def get_stock_info(self, ticker: str) -> StockInfo:
        """Get basic stock information using yfinance"""
        logger.info(f"@rayjosong Calling Yahoo Finance API for {ticker} stock info")
        logger.debug("@rayjosong Fetching data for {ticker}", ticker=ticker)
        
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            
            if not info:
                logger.error("@rayjosong No data found for {ticker}", ticker=ticker)
                raise StockNotFoundError(ticker)
            
            # Get current price - try different fields as backup
            current_price = (
                info.get("currentPrice") or 
                info.get("regularMarketPrice") or 
                info.get("previousClose", 0)
            )
            
            stock_info = StockInfo(
                ticker=ticker,
                name=info.get("longName", info.get("shortName", "Unknown")),
                current_price=float(current_price),
                currency=info.get("currency", "USD"),
                sector=info.get("sector", "Unknown"),
                industry=info.get("industry", "Unknown")
            )
            
            logger.info("@rayjosong Successfully retrieved stock info for {ticker}", 
                       ticker=ticker, 
                       data=json.dumps(stock_info.dict()))
            return stock_info
            
        except Exception as e:
            self._handle_error(e, "get_stock_info", ticker)

    @cache(expire=timedelta(hours=1), namespace="yahoo_finance_financial_metrics")
    async def get_financial_metrics(self, ticker: str) -> Dict:
        """Get financial metrics including FCF using yfinance"""
        logger.info(f"@rayjosong Calling Yahoo Finance API for {ticker} financial metrics")
        logger.debug("@rayjosong Fetching financial metrics for {ticker}", ticker=ticker)
        
        try:
            stock = yf.Ticker(ticker)
            
            # Get cash flow data
            cashflow = stock.cashflow
            if cashflow.empty:
                logger.error("@rayjosong No cash flow data found for {ticker}", ticker=ticker)
                raise StockNotFoundError(ticker)
            
            # Get latest year's data (first column)
            latest_data = cashflow.iloc[:, 0]
            
            # Get operating cash flow and capital expenditures
            operating_cash_flow = float(latest_data.get(
                "Operating Cash Flow", 
                latest_data.get("Total Cash From Operating Activities", 0)
            ))
            capex = float(latest_data.get(
                "Capital Expenditure",
                latest_data.get("Capital Expenditures", 0)
            ))
            
            # Calculate FCF
            fcf = operating_cash_flow - abs(capex)  # capex is usually negative
            
            # Get additional metrics for potential future use
            try:
                info = stock.info
                additional_metrics = {
                    "beta": info.get("beta", None),
                    "profit_margin": info.get("profitMargins", None),
                    "forward_pe": info.get("forwardPE", None),
                    "trailing_pe": info.get("trailingPE", None),
                    "dividend_yield": info.get("dividendYield", None)
                }
                logger.debug("@rayjosong Additional metrics for {ticker}: {metrics}", 
                           ticker=ticker, 
                           metrics=json.dumps(additional_metrics))
            except Exception as e:
                logger.warning("@rayjosong Could not fetch additional metrics: {error}", error=str(e))
                additional_metrics = {}
            
            metrics = {
                "fcf": fcf,
                "year": latest_data.name.strftime("%Y-%m-%d"),
                **additional_metrics
            }
            
            logger.info("@rayjosong Calculated metrics for {ticker}: {metrics}", 
                       ticker=ticker, 
                       metrics=json.dumps(metrics))
            return metrics
            
        except Exception as e:
            self._handle_error(e, "get_financial_metrics", ticker)

    def _generate_cache_key(self, symbol: str, interval: str) -> str:
        # Ensure consistent key format
        return f"yahoo_finance:{symbol}:{interval}"

    async def get_historical_data(self, ticker: str, period: str = "1y") -> Dict:
        """Get historical price data"""
        cache_key = self._generate_cache_key(ticker, period)
        try:
            # Check cache first
            cached_data = await FastAPICache.get_backend().get(cache_key)
            if cached_data:
                return cached_data
            
            # If not in cache, fetch from API
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period)
            data = hist.to_dict('index')
            
            # Store in cache
            await FastAPICache.get_backend().set(cache_key, data, expire=timedelta(hours=1))
            return data
        except Exception as e:
            self._handle_error(e, "get_historical_data", ticker) 