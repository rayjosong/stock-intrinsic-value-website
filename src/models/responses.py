from pydantic import BaseModel
from typing import Optional, Dict, Any

class ErrorResponse(BaseModel):
    status_code: int
    data: Dict[str, Any]
    detail: Optional[str] = None 