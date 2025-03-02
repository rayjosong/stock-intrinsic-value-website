def get_stock_data(ticker: str):
    return {
        "ticker": ticker,
        "name": "Company Name",
        "currentPrice": 100.0,
        "currency": "USD",
        "sector": "Technology",
        "industry": "Software",
        "dailyChange": 0.5,  # Consistent value
        "volume": 1000000    # Consistent value
    } 