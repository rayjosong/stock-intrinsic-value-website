# Stock Analysis API

A FastAPI-based API for calculating stock intrinsic values using DCF analysis.

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-analysis-api
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file:
```bash
# Create .env file in project root
touch .env

# Add required environment variables
echo "STOCK_DEBUG=true" >> .env
echo "STOCK_YAHOO_FINANCE_API_KEY=your_api_key" >> .env
```

5. Run the application:
```bash
# Development mode with debug output
STOCK_DEBUG=true uvicorn src.main:app --reload --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Development

### Project Structure
```
src/
├── __init__.py           # Makes src a Python package
├── main.py              # FastAPI application entry point
├── models/              # Data models/schemas
├── services/            # Business logic
├── config/             # Configuration management
└── utils/              # Utility functions
```

### Running Tests
```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run tests with coverage
pytest --cov=src
```

## API Documentation

Once running, visit:
- http://localhost:8000/docs for Swagger UI
- http://localhost:8000/redoc for ReDoc documentation

## Example Usage

```bash
# Get basic stock info
curl http://localhost:8000/api/stock/AAPL

# Get intrinsic value calculation
curl http://localhost:8000/api/stock/AAPL/intrinsic-value
``` 