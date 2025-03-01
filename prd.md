# Stock Analysis Tool PRD - Phase 1

## Overview
A backend API for calculating the intrinsic value of stocks using the Discounted Cash Flow (DCF) model. The system will automatically determine reasonable assumptions based on the stock's financial data and market conditions, then clearly communicate both the intrinsic value and the detailed reasoning behind the assumptions used.

## Core Functionality for Phase 1
- Stock data retrieval by ticker symbol
- Automatic generation of reasonable DCF assumptions with detailed explanations
- Intrinsic value calculation using a comprehensive DCF model
- Complete transparency about calculation methodology and assumptions

## Technical Requirements
- Backend: Python FastAPI
- Data Source: Financial API (Yahoo Finance, Alpha Vantage, etc.)

## DCF Model Requirements
- The intrinsic value calculation must be based on a proper Discounted Cash Flow model
- The model should:
  - Project future free cash flows based on historical data and growth assumptions
  - Calculate the present value of projected cash flows
  - Calculate a terminal value using perpetual growth or exit multiple methods
  - Account for the company's debt and cash position
  - Determine per-share intrinsic value

## Assumption Requirements
- All DCF assumptions must be clearly documented and explained
- Key assumptions to be detailed:
  - Historical free cash flow data used as the base
  - Projected growth rate for the forecast period (with justification)
  - Discount rate/WACC (with components breakdown)
  - Terminal growth rate (with justification)
  - Projection period length (with reasoning)
  - Any adjustments made to reported financial data

## Essential API Endpoints

### 1. Basic Stock Information
`GET /api/stock/{ticker}`
- Retrieves basic information about a stock

### 2. DCF-Based Intrinsic Value
`GET /api/stock/{ticker}/intrinsic-value`
- Calculates and returns the intrinsic value using a comprehensive DCF model
- Includes detailed documentation of all assumptions and calculation steps

## API Contract

### GET /api/stock/{ticker}

**Response:**
```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "currentPrice": 173.45,
  "currency": "USD",
  "sector": "Technology",
  "industry": "Consumer Electronics"
}
```
### GET /api/stock/{ticker}/intrinsic-value

**Response:**
```json
{
  "intrinsicValue": 195.32,
  "currentPrice": 173.45,
  "upside": 0.126,
  "valuation": "Undervalued",
  "methodology": "Discounted Cash Flow",
  "baseFinancials": {
    "lastReportedFreeCashFlow": 107000000000,
    "freeCashFlowGrowth5Y": 0.085,
    "freeCashFlowMargin": 0.255,
    "totalDebt": 120000000000,
    "cashAndEquivalents": 55000000000,
    "sharesOutstanding": 15700000000
  },
  "assumptions": {
    "growthRate": 0.08,
    "discountRate": 0.1,
    "terminalRate": 0.02,
    "projectionYears": 5
  },
  "assumptionDetails": {
    "growthRate": {
      "value": 0.08,
      "explanation": "Based on historical 5-year CAGR of 7.9%, industry outlook, and analyst consensus of 8-10% growth",
      "dataPoints": ["5Y CAGR: 7.9%", "Industry average: 6.5%", "Analyst consensus: 8.5%"]
    },
    "discountRate": {
      "value": 0.1,
      "explanation": "Calculated using WACC methodology with current capital structure",
      "components": {
        "riskFreeRate": 0.035,
        "marketRiskPremium": 0.055,
        "beta": 1.2,
        "costOfDebt": 0.04,
        "taxRate": 0.21,
        "debtWeight": 0.15,
        "equityWeight": 0.85
      }
    },
    "terminalRate": {
      "value": 0.02,
      "explanation": "Based on long-term GDP growth and inflation expectations",
      "dataPoints": ["Expected inflation: 2-3%", "Long-term GDP growth: 1.8-2.5%"]
    },
    "projectionYears": {
      "value": 5,
      "explanation": "Standard projection period for established companies with predictable cash flows"
    }
  },
  "calculation": {
    "projectedCashFlows": [
      {"year": 2025, "fcf": 115560000000, "presentValue": 105054545455},
      {"year": 2026, "fcf": 124804800000, "presentValue": 103144462810},
      {"year": 2027, "fcf": 134789184000, "presentValue": 101288542693},
      {"year": 2028, "fcf": 145572518720, "presentValue": 99485612446},
      {"year": 2029, "fcf": 157218320218, "presentValue": 97735022028}
    ],
    "sumOfPresentValues": 506708185432,
    "terminalValue": {
      "value": 1965229002716,
      "presentValue": 1220150931500
    },
    "enterpriseValue": 1726859116932,
    "equityValue": 1661859116932,
    "intrinsicValuePerShare": 105.85
  }
}
```

## Implementation Plan
1. Set up basic FastAPI project structure
2. Implement financial data retrieval service
3. Create DCF model calculation engine with detailed components:
   - Free cash flow projection logic
   - Discount rate calculation
   - Terminal value calculation
   - Equity value and per-share value derivation

4. Develop assumption generation and explanation system
5. Build API endpoints with comprehensive response structure
6. Implement error handling and validation

Note: also include lots of Print statements with @rayjosong to help debug the code.

## Engineering Standards
- Make sure to follow the SOLID principle and DRY principle.
- Make sure to follow the Python best practices.
- Make sure to follow the FastAPI best practices.
- I want to have structured logging with @rayjosong to help debug the code.
- Be verbose with the logs so I can see what's going on.
- I want it to be python and statically typed.
- Even when you run the app using uvicorn, you should still print out the logs to the console so I can see the logs.
- Make sure to have a good README.md file, letting user know how to run the app. (refer to README_sample.md)
- Always update requirements.txt file so I can install the dependencies by running `pip install -r requirements.txt`