#!/usr/bin/env python3
"""
Groq-based Chatbot with LangChain Agents and RAG
Main chatbot implementation with tools for platform knowledge and stock prices
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import yfinance as yf
from dotenv import load_dotenv

from langchain_core.tools import Tool, StructuredTool
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.prebuilt import create_react_agent

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

# Import RAG engine
from chatbot.load_and_query import RAGQueryEngine

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.1-8b-instant"  # Faster model with higher rate limits
TEMPERATURE = 0.3  # Lower for faster, more focused responses
MAX_TOKENS = 512  # Reduced for faster responses

# Financial safety disclaimer
FINANCIAL_DISCLAIMER = """
⚠️ **Important Disclaimer**: This is educational information only, not financial advice. 
Trading and investing involve risk. Always do your own research and consider consulting 
with a qualified financial advisor before making investment decisions.
"""

class FinSightAgent:
    """FinSight AI Agent with RAG and tool capabilities"""
    
    def __init__(self):
        """Initialize the agent with tools and RAG"""
        self.llm = None
        self.rag_engine = None
        self.tools = []
        self.agent_executor = None
        self._initialize()
    
    def _initialize(self):
        """Initialize LLM, RAG engine, and tools"""
        try:
            # Initialize Groq LLM
            if not GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            
            print("Initializing Groq LLM...")
            self.llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=GROQ_MODEL,
                temperature=TEMPERATURE,
                max_tokens=MAX_TOKENS,
                streaming=False,  # Disable streaming for faster responses
                timeout=30,  # 30 second timeout
                max_retries=2
            )
            print("✓ Groq LLM initialized")
            
            # Initialize RAG engine (lazy loading to avoid TensorFlow startup delay)
            print("Initializing RAG engine...")
            import time
            start = time.time()
            self.rag_engine = RAGQueryEngine()
            print(f"✓ RAG engine initialized in {time.time()-start:.2f}s")
            
            # Create tools
            self.tools = self._create_tools()
            
            # Create agent
            self._create_agent()
            
        except Exception as e:
            print(f"Error initializing FinSight Agent: {e}")
            raise
    
    def _create_tools(self) -> List[Tool]:
        """Create agent tools"""
        
        # Define input schemas
        class KnowledgeInput(BaseModel):
            query: str = Field(description="The question to search in the knowledge base")
        
        class StockPriceInput(BaseModel):
            symbol: str = Field(description="Stock ticker symbol (e.g., AAPL, TSLA, MSFT)")
        
        # Tool 1: Platform Knowledge (RAG)
        def query_platform_knowledge(query: str) -> str:
            """Query FinSight AI platform knowledge base for information about trading strategies, ML models, platform features, and learning content."""
            try:
                if self.rag_engine is None or self.rag_engine.qa_chain is None:
                    return "Knowledge base is temporarily unavailable. I can still help with general questions and stock prices."
                
                result = self.rag_engine.query(query)
                if result["success"]:
                    return result["answer"]
                else:
                    return "Unable to retrieve information from knowledge base."
            except Exception as e:
                return f"Error querying knowledge base: {str(e)}"
        
        # Tool 2: Stock Price Lookup
        def get_stock_price(symbol: str) -> str:
            """Get current stock price and key information for a given stock symbol."""
            try:
                symbol = symbol.upper().strip()
                ticker = yf.Ticker(symbol)
                
                # Get current data
                info = ticker.info
                hist = ticker.history(period="2d")
                
                if hist.empty:
                    return f"Unable to fetch data for {symbol}. Please verify the symbol is correct."
                
                current_price = hist['Close'].iloc[-1]
                prev_price = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
                change = current_price - prev_price
                pct_change = (change / prev_price * 100) if prev_price != 0 else 0
                
                # Get additional info
                company_name = info.get('longName', symbol)
                market_cap = info.get('marketCap', 'N/A')
                day_high = hist['High'].iloc[-1]
                day_low = hist['Low'].iloc[-1]
                volume = hist['Volume'].iloc[-1]
                
                # Format response
                emoji = "🟢" if change >= 0 else "🔴"
                response = f"""
📊 **{company_name} ({symbol})**

**Current Price**: ${current_price:.2f}
**Change**: {emoji} ${change:.2f} ({pct_change:.2f}%)
**Day High**: ${day_high:.2f}
**Day Low**: ${day_low:.2f}
**Volume**: {volume:,.0f}
"""
                if market_cap != 'N/A':
                    response += f"**Market Cap**: ${market_cap:,.0f}\n"
                
                return response.strip()
                
            except Exception as e:
                return f"Error fetching stock data for {symbol}: {str(e)}"
        
        # Create tool list with StructuredTool
        tools = [
            StructuredTool.from_function(
                func=query_platform_knowledge,
                name="PlatformKnowledge",
                description="Query FinSight AI platform knowledge base for trading strategies, ML models, platform features, and learning content. Use for questions about how the platform works, what strategies are available, or how to use features.",
                args_schema=KnowledgeInput
            ),
            StructuredTool.from_function(
                func=get_stock_price,
                name="StockPrice",
                description="Get current stock price and key information. Use when user asks for stock prices, quotes, or current market data.",
                args_schema=StockPriceInput
            )
        ]
        
        return tools
    
    def _create_agent(self):
        """Create the ReAct agent"""
        
        # System prompt for the agent
        from langchain_core.messages import SystemMessage
        system_message = SystemMessage(content=f"""You are FinSight AI, an intelligent financial analyst and AI assistant specialized in the FinSight AI trading platform.

Your role is to:
1. Help users understand the FinSight AI platform features, trading strategies, and ML models
2. Provide educational information about trading and investing
3. Fetch live stock data when requested
4. Guide users on how to use the platform effectively

PLATFORM FEATURES:
- 10 Trading Strategies: EMA Crossover, RSI, MACD, Bollinger Scalping, SuperTrend, Ichimoku Cloud, ADX DMI, VWAP, Breakout, ML LSTM
- 16 Machine Learning Models: LSTM, Prophet, XGBoost, ARIMA, Random Forest, Logistic Regression, SVM (classifiers and regressors)
- Real-time Market Data & News Sentiment Analysis
- Live Trading Simulation with virtual portfolio
- User Authentication with personalized favorites and chat history
- AI Chatbot for 24/7 financial insights

IMPORTANT RULES:
- ALWAYS use the PlatformKnowledge tool for questions about strategies, models, features, or how the platform works
- When asked "what strategies" or "list strategies", use PlatformKnowledge tool to get the complete list
- Use the StockPrice tool ONLY when users explicitly ask for current prices or live stock data
- For general trading topics, provide helpful educational responses
- NEVER give financial advice like "you should buy" or "this will make profit"
- Always explain risks and add disclaimers when discussing investment decisions
- Be conversational, helpful, concise, and educational
- Keep responses brief and to the point (2-3 paragraphs max)
- If asked for advice, explain what the strategies would signal but emphasize it's for educational purposes

{FINANCIAL_DISCLAIMER}
""")
        
        # Create agent using langgraph's create_react_agent
        # This returns a graph that can be invoked directly
        self.agent_executor = create_react_agent(
            model=self.llm,
            tools=self.tools,
            prompt=system_message
        )
    
    def chat(self, user_message: str, conversation_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """
        Process user message and generate response
        
        Args:
            user_message: User's message
            conversation_history: Previous conversation messages
            
        Returns:
            Dictionary with response and metadata
        """
        try:
            # Check for financial advice requests
            advice_keywords = [
                'should i buy', 'should i sell', 'should i invest',
                'will it go up', 'will it go down', 'guaranteed profit',
                'sure thing', 'what should i trade', 'tell me what to buy'
            ]
            
            message_lower = user_message.lower()
            is_advice_request = any(keyword in message_lower for keyword in advice_keywords)
            
            # Prepare messages for the agent
            messages = []
            if conversation_history:
                for msg in conversation_history[-5:]:  # Keep last 5 messages for context
                    if msg.get("role") == "user":
                        messages.append(HumanMessage(content=msg.get("content", "")))
                    elif msg.get("role") == "assistant":
                        messages.append(AIMessage(content=msg.get("content", "")))
            
            # Add current user message
            messages.append(HumanMessage(content=user_message))
            
            # Execute agent with messages
            result = self.agent_executor.invoke({"messages": messages})
            
            # Extract response from the last message
            response = ""
            if "messages" in result and len(result["messages"]) > 0:
                last_message = result["messages"][-1]
                if hasattr(last_message, 'content'):
                    response = last_message.content
                else:
                    response = str(last_message)
            else:
                response = "I'm sorry, I couldn't generate a response."
            
            # Add disclaimer for investment-related queries
            if is_advice_request or any(word in message_lower for word in ['buy', 'sell', 'invest', 'trade', 'profit']):
                if FINANCIAL_DISCLAIMER not in response:
                    response += f"\n\n{FINANCIAL_DISCLAIMER}"
            
            return {
                "response": response,
                "success": True,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            error_msg = f"I encountered an error processing your request: {str(e)}"
            return {
                "response": error_msg,
                "success": False,
                "timestamp": datetime.utcnow().isoformat()
            }

# Singleton instance
_agent_instance = None

def get_agent() -> FinSightAgent:
    """Get or create agent instance"""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = FinSightAgent()
    return _agent_instance

def chat_with_agent(user_message: str, conversation_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
    """
    Convenience function to chat with the agent
    
    Args:
        user_message: User's message
        conversation_history: Previous conversation messages
        
    Returns:
        Dictionary with response and metadata
    """
    agent = get_agent()
    return agent.chat(user_message, conversation_history)

def main():
    """Test the agent"""
    print("="*60)
    print("🤖 FinSight AI Agent - Interactive Test")
    print("="*60)
    print("Type 'quit' to exit\n")
    
    agent = FinSightAgent()
    
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
        
        if not user_input:
            continue
        
        result = agent.chat(user_input)
        print(f"\nFinSight AI: {result['response']}\n")

if __name__ == "__main__":
    main()
