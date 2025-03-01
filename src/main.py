from fastapi import FastAPI, HTTPException, Depends
from loguru import logger
import uvicorn
from src.services.financial_data import FinancialDataService
from src.services.dcf_calculator import DCFCalculator
from src.config import get_settings, Settings
from src.models.stock import StockInfo, IntrinsicValue

app = FastAPI(title="Stock Analysis API")

logger.add("logs/app.log", rotation="500 MB", level="DEBUG")

def get_financial_service(settings: Settings = Depends(get_settings)) -> FinancialDataService:
    return FinancialDataService(settings.alpha_vantage_api_key)

@app.get("/api/stock/{ticker}", response_model=StockInfo)
async def get_stock_info(
    ticker: str,
    financial_service: FinancialDataService = Depends(get_financial_service)
):
    logger.info(f"@rayjosong Fetching stock info for {ticker}")
    try:
        return await financial_service.get_stock_info(ticker)
    except Exception as e:
        logger.error(f"@rayjosong Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stock/{ticker}/intrinsic-value", response_model=IntrinsicValue)
async def get_intrinsic_value(
    ticker: str,
    financial_service: FinancialDataService = Depends(get_financial_service)
):
    logger.info(f"@rayjosong Calculating intrinsic value for {ticker}")
    try:
        calculator = DCFCalculator()
        stock_data = await financial_service.get_stock_info(ticker)
        financial_metrics = await financial_service.get_financial_metrics(ticker)
        
        return await calculator.calculate_intrinsic_value(ticker, {
            "fcf": financial_metrics["fcf"],
            "current_price": stock_data.current_price
        })
    except Exception as e:
        logger.error(f"@rayjosong Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("@rayjosong Starting Stock Analysis API")
    uvicorn.run(app, host="0.0.0.0", port=8000) 