from fastapi import APIRouter, Depends
from src.services.financial_data_provider import FinancialDataProvider
from src.models.stock import StockInfo, IntrinsicValue
from src.services.dcf_calculator import DCFCalculator
from src.config import get_settings
from src.api.dependencies import get_financial_provider
from loguru import logger
from fastapi_cache.decorator import cache
from datetime import timedelta
from fastapi_cache import FastAPICache
from src.services.alpha_vantage_provider import AlphaVantageProvider
from src.services.yahoo_finance_provider import YahooFinanceProvider
from src.services.moat_analyzer import MoatAnalyzer
import httpx
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1")

class AnalysisResponse(BaseModel):
    result: dict
    status: str

@router.get("/analyze", response_model=AnalysisResponse)
async def analyze_data():
    """Endpoint to analyze financial data"""
    return {"result": {}, "status": "success"}

@router.get("/stock/{ticker}", response_model=StockInfo)
@cache(expire=timedelta(hours=1))
async def get_stock_info(
    ticker: str,
    financial_provider: FinancialDataProvider = Depends(get_financial_provider)
):
    logger.debug(f"@rayjosong Processing stock info request for {ticker}")
    return await financial_provider.get_stock_info(ticker)

@router.get("/stock/{ticker}/intrinsic-value", response_model=IntrinsicValue)
@cache(expire=timedelta(minutes=30), namespace="api_intrinsic_value")
async def get_intrinsic_value(
    ticker: str,
    financial_provider: FinancialDataProvider = Depends(get_financial_provider)
):
    logger.debug(f"@rayjosong Processing intrinsic value request for {ticker}")
    calculator = DCFCalculator()
    stock_data = await financial_provider.get_stock_info(ticker)
    financial_metrics = await financial_provider.get_financial_metrics(ticker)
    
    return await calculator.calculate_intrinsic_value(ticker, {
        "fcf": financial_metrics["fcf"],
        "current_price": stock_data.current_price
    })

@router.get("/cache/check/{ticker}")
async def check_cache(ticker: str):
    cache_key = f"financial_data:{ticker}"
    value = await FastAPICache.get_backend().get(cache_key)
    return {"cache_key": cache_key, "exists": value is not None}

@router.get("/financials/{ticker}")
@cache(expire=timedelta(hours=1))
async def get_financial_metrics(ticker: str):
    provider = YahooFinanceProvider()
    return await provider.get_financial_metrics(ticker)

@router.get("/moat-analysis/{ticker}")
@cache(expire=timedelta(hours=24))
async def get_moat_analysis(
    ticker: str,
    financial_provider: FinancialDataProvider = Depends(get_financial_provider)
):
    logger.debug(f"@rayjosong Processing moat analysis for {ticker}")
    analyzer = MoatAnalyzer()
    # stock_data = await financial_provider.get_stock_info(ticker)
    return await analyzer.analyze_moat(ticker)

@router.get("/ollama-health")
async def check_ollama_health():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434")
            return {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "version": response.json().get("version", "unknown")
            }
    except Exception as e:
        return {"status": "error", "message": str(e)} 