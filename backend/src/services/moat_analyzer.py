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

    IMPORTANT: You MUST return ONLY valid JSON in this exact structure:
    {{
        "company": "{company}",
        "moat_strength": "Weak/Moderate/Strong",
        "moat_score": 1-10,
        "confidence_score": 1-10,
        "moat_analysis": {{
            "brand_power": {{
                "explanation": "Your analysis",
                "score": 1-10
            }},
            "network_effects": {{
                "explanation": "Your analysis",
                "score": 1-10
            }},
            "cost_advantages": {{
                "explanation": "Your analysis",
                "score": 1-10
            }},
            "efficient_scale": {{
                "explanation": "Your analysis",
                "score": 1-10
            }},
            "intangible_assets": {{
                "explanation": "Your analysis",
                "score": 1-10
            }}
        }},
        "data_sources": {{
            "company_name": "Source of company name",
            "financial_data": "Source of financial data",
            "moat_analysis": "Source of moat analysis"
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
                
                # Prepare LLM request
                request_data = {
                    "model": "phi3.5:latest",
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                    "options": {
                        "num_ctx": 4096,
                        "temperature": 0.7,
                        "response_format": {"type": "json_object"}
                    }
                }
                
                response = await client.post(
                    self.OLLAMA_URL,
                    json=request_data,
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    logger.error(f"@rayjosong LLM request failed: {response.text}")
                    return self._fallback_response(company_name)
                
                result = response.json()
                logger.debug(f"@rayjosong LLM raw response:\n{json.dumps(result, indent=2)}")
                
                # Extract and parse the response field
                try:
                    analysis = json.loads(result["response"])
                    logger.debug(f"@rayjosong Parsed analysis:\n{json.dumps(analysis, indent=2)}")
                    
                    # Validate JSON structure
                    required_keys = {
                        "company": str,
                        "moat_strength": str,
                        "moat_score": int,
                        "confidence_score": int,
                        "moat_analysis": dict,
                        "data_sources": dict
                    }
                    
                    for key, expected_type in required_keys.items():
                        if key not in analysis or not isinstance(analysis[key], expected_type):
                            logger.error(f"@rayjosong Invalid response format: Missing or invalid {key}")
                            return self._fallback_response(company_name)
                    
                    return analysis
                    
                except (json.JSONDecodeError, KeyError) as e:
                    logger.error(f"@rayjosong Error parsing response: {str(e)}")
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
            "moat_analysis": {
                "brand_power": {
                    "explanation": "Analysis unavailable",
                    "score": 5
                },
                "network_effects": {
                    "explanation": "Analysis unavailable",
                    "score": 5
                },
                "cost_advantages": {
                    "explanation": "Analysis unavailable",
                    "score": 5
                },
                "efficient_scale": {
                    "explanation": "Analysis unavailable",
                    "score": 5
                },
                "intangible_assets": {
                    "explanation": "Analysis unavailable",
                    "score": 5
                }
            },
            "data_sources": {
                "company_name": "Fallback",
                "financial_data": "Fallback",
                "moat_analysis": "Fallback"
            }
        } 