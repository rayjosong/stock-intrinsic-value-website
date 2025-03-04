from typing import Dict, Optional
import requests
from loguru import logger
from src.models.stock import StockInfo
from src.models.errors import StockNotFoundError, StockAPIError
import json 

class FinancialDataService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"
        logger.info("@rayjosong Initialized FinancialDataService")

    async def get_current_price(self, ticker: str) -> float:
        """Get the current price for a ticker using Alpha Vantage's GLOBAL_QUOTE endpoint"""
        logger.debug(f"@rayjosong Fetching current price for {ticker}")
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker,
            "apikey": self.api_key
        }
        
        try:
            logger.info(f"@rayjosong Making API request to Alpha Vantage for {ticker} current price")
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            logger.debug(f"@rayjosong Raw price API response for {ticker}: {json.dumps(data, indent=4)}")
            
            if "Global Quote" not in data or not data["Global Quote"]:
                logger.error(f"@rayjosong No price data found for ticker {ticker}")
                return 0.0
                
            price = float(data["Global Quote"].get("05. price", 0))
            logger.info(f"@rayjosong Current price for {ticker}: {price}")
            return price
            
        except Exception as e:
            logger.error(f"@rayjosong Error fetching current price for {ticker}: {str(e)}")
            return 0.0

    async def get_stock_info(self, ticker: str) -> StockInfo:
        logger.debug(f"@rayjosong Fetching data for {ticker}")
        params = {
            "function": "OVERVIEW",
            "symbol": ticker,
            "apikey": self.api_key
        }
        
        try:
            logger.info(f"@rayjosong Making API request to Alpha Vantage for {ticker} overview")
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            logger.debug(f"@rayjosong Raw API response for {ticker}: {json.dumps(data, indent=4)}")
            
            if "Name" not in data:
                logger.error(f"@rayjosong No data found for ticker {ticker}")
                raise StockNotFoundError(ticker)
            
            # Get current price from separate API call
            current_price = await self.get_current_price(ticker)
            
            stock_info = StockInfo(
                ticker=ticker,
                name=data["Name"],
                current_price=current_price,
                currency="USD",
                sector=data.get("Sector", "Unknown"),
                industry=data.get("Industry", "Unknown")
            )
            logger.info(f"@rayjosong Successfully retrieved stock info for {ticker}: {stock_info}")
            return stock_info
            
        except requests.exceptions.RequestException as e:
            logger.error(f"@rayjosong API request failed for {ticker}: {str(e)}")
            raise StockAPIError(f"Failed to fetch stock data: {str(e)}")
        except Exception as e:
            logger.error(f"@rayjosong Unexpected error for {ticker}: {str(e)}")
            raise StockAPIError(f"An unexpected error occurred: {str(e)}")

    async def get_financial_metrics(self, ticker: str) -> Dict:
        logger.debug(f"@rayjosong Fetching financial metrics for {ticker}")
        params = {
            "function": "CASH_FLOW",
            "symbol": ticker,
            "apikey": self.api_key
        }
        
        try:
            logger.info(f"@rayjosong Making API request to Alpha Vantage for {ticker} cash flow data")
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            logger.debug(f"@rayjosong Raw cash flow API response for {ticker}: {data}")
            
            if "annualReports" not in data:
                logger.error(f"@rayjosong No cash flow data found for ticker {ticker}")
                raise StockNotFoundError(ticker)
                
            latest_report = data["annualReports"][0]
            operating_cash_flow = float(latest_report.get("operatingCashflow", 0))
            capex = float(latest_report.get("capitalExpenditures", 0))
            fcf = operating_cash_flow - capex
            
            metrics = {
                "fcf": fcf,
                "year": latest_report.get("fiscalDateEnding", "Unknown")
            }
            
            logger.info(f"@rayjosong Calculated financial metrics for {ticker}: FCF={fcf}, Year={metrics['year']}")
            logger.debug(f"@rayjosong Operating Cash Flow: {operating_cash_flow}, CapEx: {capex}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"@rayjosong Error fetching financial metrics for {ticker}: {str(e)}")
            raise StockAPIError(f"Failed to fetch financial metrics: {str(e)}") 