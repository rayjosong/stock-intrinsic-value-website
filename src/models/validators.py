from pydantic import BaseModel, Field, model_validator
from typing import Optional

class DCFInputs(BaseModel):
    growth_rate: float = Field(ge=0, le=0.5)
    discount_rate: float = Field(ge=0.05, le=0.25)
    terminal_rate: float = Field(ge=0.01, le=0.05)
    projection_years: int = Field(ge=3, le=10)
    base_fcf: float = Field(gt=0)

    @model_validator(mode='after')
    def validate_rates(self):
        if self.terminal_rate >= self.growth_rate:
            raise ValueError('Terminal growth rate must be less than growth rate')
        return self 