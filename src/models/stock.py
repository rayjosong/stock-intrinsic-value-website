from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional

class StockInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    ticker: str
    name: str
    current_price: float
    currency: str
    sector: str
    industry: str

class DCFAssumption(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    value: float
    explanation: str
    data_points: List[str]

class DCFCalculation(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    year: int
    fcf: float
    present_value: float

class IntrinsicValue(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    intrinsic_value: float
    current_price: float
    upside: float
    valuation: str
    methodology: str
    assumptions: Dict[str, DCFAssumption]
    calculation: Dict[str, List[DCFCalculation]] 