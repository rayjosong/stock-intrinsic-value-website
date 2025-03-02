from fastapi import Depends
# from src.services.alpha_vantage_provider import AlphaVantageProvider
from src.services.mock_provider import MockProvider
from src.config import get_settings, Settings
from src.services.financial_data_provider import FinancialDataProvider

def get_financial_provider() -> FinancialDataProvider:
    # return AlphaVantageProvider(settings.alpha_vantage_api_key)
    return MockProvider()