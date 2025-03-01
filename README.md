# Stock Analysis API

A FastAPI-based API for calculating stock intrinsic values using Discounted Cash Flow (DCF) analysis.

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create .env file:
```bash
# Create .env file in project root
touch .env

# Add required environment variables
echo "ALPHA_VANTAGE_API_KEY=your_api_key_here" >> .env
echo "LOG_LEVEL=DEBUG" >> .env
```

4. Run the application:
```bash
# Development mode with debug output
uvicorn src.main:app --reload --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Project Structure
```
src/
├── __init__.py           # Makes src a Python package
├── main.py              # FastAPI application entry point
├── models/              # Data models/schemas
│   ├── __init__.py
│   ├── stock.py        # Stock-related Pydantic models
│   ├── validators.py   # Input validation models
│   └── errors.py       # Custom error definitions
└── services/           # Business logic
    ├── __init__.py
    ├── financial_data.py  # Financial data retrieval service
    └── dcf_calculator.py  # DCF calculation logic
```

## API Documentation

Once running, visit:
- http://localhost:8000/docs for Swagger UI
- http://localhost:8000/redoc for ReDoc documentation

## Example Usage

### Get Stock Information
```bash
# Basic request
curl http://localhost:8000/api/stock/AAPL

# With pretty print
curl http://localhost:8000/api/stock/AAPL | json_pp

# Sample response:
{
   "ticker": "AAPL",
   "name": "Apple Inc",
   "current_price": 173.45,
   "currency": "USD",
   "sector": "Technology",
   "industry": "Consumer Electronics"
}
```

### Calculate Intrinsic Value
```bash
# Basic request
curl http://localhost:8000/api/stock/AAPL/intrinsic-value

# With pretty print
curl http://localhost:8000/api/stock/AAPL/intrinsic-value | json_pp

# Sample response:
{
   "intrinsic_value": 195.32,
   "current_price": 173.45,
   "upside": 0.126,
   "valuation": "Undervalued",
   "methodology": "DCF",
   "assumptions": {
      "growth_rate": {
         "value": 0.08,
         "explanation": "Based on historical growth and industry outlook",
         "data_points": ["Historical CAGR", "Industry average"]
      },
      "discount_rate": {
         "value": 0.10,
         "explanation": "Based on WACC calculation",
         "data_points": ["Risk-free rate", "Market premium", "Beta"]
      },
      "terminal_rate": {
         "value": 0.02,
         "explanation": "Based on long-term GDP growth",
         "data_points": ["GDP growth", "Inflation"]
      }
   },
   "calculation": {
      "projected_cash_flows": [
         {"year": 1, "fcf": 115560000000, "present_value": 105054545455},
         {"year": 2, "fcf": 124804800000, "present_value": 103144462810},
         {"year": 3, "fcf": 134789184000, "present_value": 101288542693},
         {"year": 4, "fcf": 145572518720, "present_value": 99485612446},
         {"year": 5, "fcf": 157218320218, "present_value": 97735022028}
      ]
   }
}
```

## Features
- Stock data retrieval from Alpha Vantage API
- DCF-based intrinsic value calculation
- Detailed assumption documentation
- Comprehensive error handling
- Structured logging with @rayjosong tags 