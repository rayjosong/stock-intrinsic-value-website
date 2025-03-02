from typing import Dict, List, Optional
from loguru import logger
from src.models.stock import IntrinsicValue, DCFAssumption, DCFCalculation
from src.models.validators import DCFInputs
from src.models.errors import StockAPIError

class DCFCalculator:
    def __init__(self):
        logger.info("@rayjosong Initialized DCFCalculator")

    def calculate_wacc(self, risk_free_rate: float, market_premium: float, beta: float, 
                      cost_of_debt: float, tax_rate: float, debt_weight: float) -> float:
        logger.debug("@rayjosong Calculating WACC")
        cost_of_equity = risk_free_rate + (beta * market_premium)
        after_tax_cost_of_debt = cost_of_debt * (1 - tax_rate)
        equity_weight = 1 - debt_weight
        
        return (cost_of_equity * equity_weight) + (after_tax_cost_of_debt * debt_weight)

    def project_cash_flows(self, base_fcf: float, growth_rate: float, years: int) -> List[float]:
        logger.debug(f"@rayjosong Projecting cash flows with {growth_rate} growth for {years} years")
        cash_flows = []
        current_fcf = base_fcf
        
        for _ in range(years):
            current_fcf *= (1 + growth_rate)
            cash_flows.append(current_fcf)
            
        return cash_flows

    def calculate_terminal_value(self, final_fcf: float, terminal_growth: float, 
                               discount_rate: float) -> float:
        logger.debug("@rayjosong Calculating terminal value")
        if discount_rate <= terminal_growth:
            raise StockAPIError("Discount rate must be greater than terminal growth rate")
        return final_fcf * (1 + terminal_growth) / (discount_rate - terminal_growth)

    def calculate_upside(self, intrinsic_value: float, current_price: float) -> tuple[float, str]:
        upside = (intrinsic_value - current_price) / current_price
        valuation = "Undervalued" if upside > 0 else "Overvalued"
        return upside, valuation

    async def calculate_intrinsic_value(self, ticker: str, financial_data: Dict) -> IntrinsicValue:
        logger.info(f"@rayjosong Starting intrinsic value calculation for {ticker}")
        try:
            logger.debug(f"@rayjosong Input financial data for {ticker}: {financial_data}")
            
            inputs = DCFInputs(
                growth_rate=0.08,
                discount_rate=0.10,
                terminal_rate=0.02,
                projection_years=5,
                base_fcf=financial_data["fcf"]
            )
            logger.info(f"@rayjosong Using assumptions for {ticker}: growth={inputs.growth_rate}, " + 
                       f"discount={inputs.discount_rate}, terminal={inputs.terminal_rate}")
            
            # Project cash flows
            projected_flows = self.project_cash_flows(
                inputs.base_fcf, 
                inputs.growth_rate, 
                inputs.projection_years
            )
            logger.debug(f"@rayjosong Projected cash flows for {ticker}: {projected_flows}")
            
            # Calculate present values
            calculations = []
            for year, fcf in enumerate(projected_flows, 1):
                present_value = fcf / ((1 + inputs.discount_rate) ** year)
                calculations.append(DCFCalculation(
                    year=year,
                    fcf=fcf,
                    present_value=present_value
                ))
            
            # Calculate terminal value
            terminal_value = self.calculate_terminal_value(
                projected_flows[-1], 
                inputs.terminal_rate, 
                inputs.discount_rate
            )
            logger.info(f"@rayjosong Terminal value for {ticker}: {terminal_value}")
            
            # Calculate total value
            total_present_value = sum(calc.present_value for calc in calculations)
            terminal_present_value = terminal_value / ((1 + inputs.discount_rate) ** inputs.projection_years)
            intrinsic_value = total_present_value + terminal_present_value
            
            # Calculate upside
            upside, valuation = self.calculate_upside(intrinsic_value, financial_data["current_price"])
            logger.info(f"@rayjosong Final valuation for {ticker}: " +
                       f"Intrinsic={intrinsic_value}, Current={financial_data['current_price']}, " +
                       f"Upside={upside}, Status={valuation}")
            
            return IntrinsicValue(
                intrinsic_value=intrinsic_value,
                current_price=financial_data["current_price"],
                upside=upside,
                valuation=valuation,
                methodology="DCF",
                assumptions={
                    "growth_rate": DCFAssumption(
                        value=inputs.growth_rate,
                        explanation="Based on historical growth and industry outlook",
                        data_points=["Historical CAGR", "Industry average"]
                    ),
                    "discount_rate": DCFAssumption(
                        value=inputs.discount_rate,
                        explanation="Based on WACC calculation",
                        data_points=["Risk-free rate", "Market premium", "Beta"]
                    ),
                    "terminal_rate": DCFAssumption(
                        value=inputs.terminal_rate,
                        explanation="Based on long-term GDP growth",
                        data_points=["GDP growth", "Inflation"]
                    )
                },
                calculation={"projected_cash_flows": calculations}
            )
            
        except Exception as e:
            logger.error(f"@rayjosong Error in DCF calculation for {ticker}: {str(e)}")
            raise StockAPIError(f"Failed to calculate intrinsic value: {str(e)}") 