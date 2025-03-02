from typing import Dict, Any, Optional
import json
from loguru import logger
import httpx
from fastapi import HTTPException
from dataclasses import dataclass

@dataclass
class AnalysisResult:
    metrics: Dict[str, Any]
    status: str

class MoatAnalyzer:
    OLLAMA_URL = "http://localhost:11434/api/generate"
    PROMPT_TEMPLATE = """
    Analyze {company}'s economic moat based on:
    1. Brand Power
    2. Network Effects
    3. Cost Advantages
    4. Efficient Scale
    5. Intangible Assets

    Return ONLY this JSON structure with your analysis:
    {{
        "company": "{company}",
        "moat_strength": "Weak/Moderate/Strong",
        "moat_score": 1-10,
        "confidence_score": 1-10,
        "explanations": {{
            "brand_power": "Your analysis",
            "network_effects": "Your analysis",
            "cost_advantages": "Your analysis",
            "efficient_scale": "Your analysis",
            "intangible_assets": "Your analysis"
        }}
    }}
    """

    def __init__(self, data_provider):
        self.data_provider = data_provider

    def analyze(self) -> AnalysisResult:
        """Perform financial analysis"""
        try:
            data = self.data_provider.get_data()
            return AnalysisResult(metrics={}, status="success")
        except Exception as e:
            return AnalysisResult(metrics={}, status=f"error: {str(e)}")

    async def analyze_moat(self, company_name: str) -> Dict[str, Any]:
        logger.debug(f"@rayjosong Analyzing moat for {company_name}")
        
        try:
            prompt = self.PROMPT_TEMPLATE.format(company=company_name)
            logger.debug(f"@rayjosong Generated prompt: {prompt}")
            
            async with httpx.AsyncClient() as client:
                # Verify Ollama is running
                health_check = await client.get("http://localhost:11434", timeout=5.0)
                if health_check.status_code != 200:
                    logger.error("@rayjosong Ollama server is not running")
                    return self._fallback_response(company_name)
                
                # Prepare LLM request with explicit non-streaming
                request_data = {
                    "model": "phi3.5:latest",
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {
                        "num_ctx": 4096,  # Increase context window
                        "temperature": 0.7  # Adjust creativity
                    }
                }
                logger.debug(f"@rayjosong Sending LLM request: {request_data}")
                
                # Make the request with longer timeout
                response = await client.post(
                    self.OLLAMA_URL,
                    json=request_data,
                    timeout=60.0  # Increased timeout
                )
                
                logger.debug(f"@rayjosong LLM response status: {response.status_code}")
                
                if response.status_code != 200:
                    logger.error(f"@rayjosong LLM request failed: {response.text}")
                    return self._fallback_response(company_name)
                
                result = response.json()
                logger.debug(f"@rayjosong LLM raw response: {result}")
                
                # Handle incomplete response
                if not result.get("done", True):
                    logger.error("@rayjosong LLM response incomplete. Possible causes:")
                    logger.error("- Model not fully loaded")
                    logger.error("- Insufficient system resources")
                    logger.error("- Context window exceeded")
                    return self._fallback_response(company_name)
                
                # Parse the JSON response
                try:
                    analysis = json.loads(result["response"])
                    logger.debug(f"@rayjosong Parsed analysis: {analysis}")
                    return analysis
                except (json.JSONDecodeError, KeyError) as e:
                    logger.error(f"@rayjosong Error parsing LLM response: {str(e)}")
                    return self._fallback_response(company_name)
                
        except httpx.TimeoutException:
            logger.error("@rayjosong LLM request timed out")
            return self._fallback_response(company_name)
        except Exception as e:
            logger.error(f"@rayjosong Error in moat analysis: {str(e)}")
            return self._fallback_response(company_name)

    def _fallback_response(self, company_name: str) -> Dict[str, Any]:
        logger.warning(f"@rayjosong Using fallback response for {company_name}")
        return {
            "company": company_name,
            "moat_strength": "Moderate",
            "moat_score": 6,
            "confidence_score": 5,
            "explanations": {
                "brand_power": "Analysis unavailable",
                "network_effects": "Analysis unavailable", 
                "cost_advantages": "Analysis unavailable",
                "efficient_scale": "Analysis unavailable",
                "intangible_assets": "Analysis unavailable"
            },
            "data_sources": {
                "company_name": "Fallback",
                "financial_data": "Fallback",
                "moat_analysis": "Fallback"
            }
        } 