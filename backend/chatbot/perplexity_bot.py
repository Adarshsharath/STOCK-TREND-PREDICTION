import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Perplexity AI API Configuration
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '')
PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

SYSTEM_PROMPT = """You are FinBot, an intelligent financial analyst and AI assistant.
You specialize in explaining investment strategies, stock trends, trading insights, and market analysis.
You have access to real-time information and can provide current market data, news, and analysis.
Respond concisely and use plain English. Always provide accurate and helpful information.
If asked about specific stocks, provide current prices, news, and analysis.
Keep responses focused and actionable for traders and investors."""

def chat_with_perplexity(user_message, conversation_history=None):
    """
    Send a message to Perplexity AI and get a response
    
    Args:
        user_message: User's message
        conversation_history: List of previous messages (optional)
    
    Returns:
        dict with bot response and updated conversation history
    """
    try:
        if not PERPLEXITY_API_KEY:
            return {
                'response': 'Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your .env file.',
                'error': True
            }
        
        # Prepare messages
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Make API request
        headers = {
            'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'llama-3.1-sonar-small-128k-online',
            'messages': messages,
            'max_tokens': 1000,
            'temperature': 0.2,
            'top_p': 0.9,
            'stream': False
        }
        
        response = requests.post(PERPLEXITY_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        bot_response = data['choices'][0]['message']['content']
        
        # Update conversation history
        updated_history = messages[1:]  # Exclude system prompt
        updated_history.append({"role": "assistant", "content": bot_response})
        
        return {
            'response': bot_response,
            'conversation_history': updated_history,
            'error': False
        }
    
    except requests.exceptions.HTTPError as e:
        error_msg = f'Perplexity API Error: {str(e)}'
        try:
            error_detail = e.response.json()
            error_msg += f'\nDetails: {error_detail}'
        except:
            error_msg += f'\nResponse: {e.response.text}'
        return {
            'response': error_msg,
            'error': True
        }
    except requests.exceptions.RequestException as e:
        return {
            'response': f'Network error communicating with Perplexity AI: {str(e)}',
            'error': True
        }
    except Exception as e:
        return {
            'response': f'Unexpected error: {str(e)}',
            'error': True
        }

def get_market_news(category='general'):
    """Get general market news from Finnhub"""
    try:
        url = f"{FINNHUB_BASE_URL}/news"
        params = {'category': category, 'token': FINNHUB_API_KEY}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()[:5]  # Return top 5 news
    except Exception as e:
        return []

def get_company_profile(symbol):
    """Get company profile from Finnhub"""
    try:
        url = f"{FINNHUB_BASE_URL}/stock/profile2"
        params = {'symbol': symbol, 'token': FINNHUB_API_KEY}
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return None

def format_stock_response(symbol, quote, profile, news):
    """Format a comprehensive stock response"""
    response = f"📊 **{symbol} Stock Information**\n\n"
    
    if profile:
        response += f"**Company**: {profile.get('name', symbol)}\n"
        response += f"**Industry**: {profile.get('finnhubIndustry', 'N/A')}\n\n"
    
    if quote and quote.get('c'):
        current_price = quote.get('c', 0)
        change = quote.get('d', 0)
        change_percent = quote.get('dp', 0)
        high = quote.get('h', 0)
        low = quote.get('l', 0)
        
        emoji = "🟢" if change >= 0 else "🔴"
        response += f"**Current Price**: ${current_price:.2f}\n"
        response += f"**Change**: {emoji} ${change:.2f} ({change_percent:.2f}%)\n"
        response += f"**Day High**: ${high:.2f}\n"
        response += f"**Day Low**: ${low:.2f}\n\n"
    
    if news:
        response += "**📰 Latest News:**\n"
        for i, article in enumerate(news[:3], 1):
            headline = article.get('headline', 'No headline')
            summary = article.get('summary', '')[:100]
            response += f"{i}. {headline}\n   {summary}...\n\n"
    
    return response

def generate_general_response(message):
    """Generate intelligent response for general financial queries"""
    message_lower = message.lower()
    
    # Market overview queries
    if any(word in message_lower for word in ['market', 'outlook', 'today', 'status', 'update']):
        news = get_market_news('general')
        if news:
            response = "📈 **Current Market Overview**\n\n"
            response += "Here are the latest market updates:\n\n"
            for i, article in enumerate(news[:3], 1):
                headline = article.get('headline', 'No headline')
                response += f"{i}. {headline}\n\n"
            return response
    
    # Trading strategies
    if any(word in message_lower for word in ['strategy', 'strategies', 'trading', 'trade', 'how to invest']):
        return """📚 **Popular Trading Strategies**:

1. **Day Trading**: Buy and sell within the same day to profit from short-term price movements.

2. **Swing Trading**: Hold positions for several days to weeks to capture medium-term trends.

3. **RSI Strategy**: Use Relative Strength Index to identify overbought (>70) or oversold (<30) conditions.

4. **MACD Strategy**: Use Moving Average Convergence Divergence for trend following and momentum.

5. **EMA Crossover**: Trade based on exponential moving average crossovers (e.g., 9-day and 21-day).

💡 **Tip**: Always combine technical indicators with fundamental analysis and risk management!"""
    
    # Technical indicators
    if any(word in message_lower for word in ['indicator', 'rsi', 'macd', 'bollinger', 'ema', 'ma', 'technical']):
        return """📊 **Key Technical Indicators**:

**Trend Indicators**:
- Moving Averages (MA, EMA) - Identify trend direction
- MACD - Momentum and trend following
- ADX (Average Directional Index) - Trend strength

**Momentum Indicators**:
- RSI (Relative Strength Index) - Overbought/oversold conditions
- Stochastic Oscillator - Momentum changes
- CCI (Commodity Channel Index) - Cyclical trends

**Volatility Indicators**:
- Bollinger Bands - Price volatility and support/resistance
- ATR (Average True Range) - Market volatility

**Volume Indicators**:
- OBV (On-Balance Volume) - Volume flow
- VWAP (Volume Weighted Average Price) - Average price

💡 Use multiple indicators for confirmation!"""
    
    # Investment advice
    if any(word in message_lower for word in ['invest', 'portfolio', 'diversif', 'allocat', 'buy', 'sell']):
        return """💼 **Investment Basics**:

**Building a Portfolio**:
1. **Diversification**: Spread investments across different sectors and asset classes
2. **Risk Management**: Never invest more than you can afford to lose
3. **Long-term Focus**: Stay patient and avoid emotional decisions
4. **Research**: Understand what you're investing in

**Asset Allocation Guidelines**:
- Stocks: Growth potential (higher risk)
- Bonds: Stability (lower risk)
- ETFs: Diversification
- Cash: Liquidity and safety

**Investment Strategies**:
- Value Investing: Buy undervalued stocks
- Growth Investing: Focus on companies with high growth potential
- Dividend Investing: Income from regular dividends
- Index Investing: Track market indices

⚠️ **Important**: This is educational content. Always do your own research and consider consulting a financial advisor."""
    
    # Market analysis
    if any(word in message_lower for word in ['analysis', 'analyze', 'fundamental', 'valuation', 'p/e', 'earnings']):
        return """📊 **Stock Analysis Methods**:

**Fundamental Analysis**:
- **P/E Ratio**: Price-to-Earnings (valuation metric)
- **EPS**: Earnings Per Share (profitability)
- **Revenue Growth**: Company's sales performance
- **Debt-to-Equity**: Financial leverage
- **Market Cap**: Company size/value

**Technical Analysis**:
- Chart patterns (Head & Shoulders, Cup & Handle)
- Support and Resistance levels
- Volume analysis
- Trend lines and channels

**Key Metrics to Check**:
✓ Revenue and profit growth
✓ Debt levels
✓ Cash flow
✓ Competitive advantages
✓ Industry trends

💡 Combine both fundamental and technical analysis for better decisions!"""
    
    # Risk management
    if any(word in message_lower for word in ['risk', 'loss', 'stop', 'protect', 'safe']):
        return """⚠️ **Risk Management Essentials**:

**Key Principles**:
1. **Position Sizing**: Don't put all eggs in one basket (max 5-10% per position)
2. **Stop-Loss Orders**: Set automatic exit points to limit losses
3. **Risk-Reward Ratio**: Aim for at least 1:2 (risk $1 to make $2)
4. **Diversification**: Spread risk across different assets

**Common Risk Management Rules**:
- 📉 **2% Rule**: Never risk more than 2% of your portfolio on a single trade
- 🎯 **Stop-Loss**: Set it at 5-10% below entry price
- 💰 **Take Profit**: Lock in gains when targets are reached
- 📊 **Review & Adjust**: Regularly monitor and rebalance portfolio

**Emotional Control**:
- Avoid FOMO (Fear of Missing Out)
- Don't chase losses
- Stick to your trading plan
- Keep emotions in check

🛡️ **Remember**: Protecting your capital is priority #1!"""
    
    # Beginner questions
    if any(word in message_lower for word in ['beginner', 'start', 'learn', 'new', 'help', 'explain']):
        return """🎓 **Getting Started with Stock Trading**:

**Step 1: Education**
- Learn basic financial terms
- Understand market mechanics
- Study successful investors

**Step 2: Setup**
- Open a brokerage account
- Start with a demo/paper trading account
- Learn the trading platform

**Step 3: Strategy**
- Choose your trading style (day/swing/long-term)
- Define your risk tolerance
- Set clear goals

**Step 4: Practice**
- Start small with real money
- Track your trades
- Learn from mistakes

**Recommended Learning Path**:
1️⃣ Stock market basics
2️⃣ Technical analysis fundamentals
3️⃣ Risk management
4️⃣ Trading psychology
5️⃣ Practical experience

📚 **Resources**: Books, online courses, financial news, and practice!

💡 For specific stock info, just ask "What's AAPL price?" or "Tesla news"!"""
    
    # Crypto questions
    if any(word in message_lower for word in ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'blockchain']):
        return """🪙 **Cryptocurrency Information**:

I'm primarily focused on stock market data through Finnhub API, which specializes in traditional equities.

**For Stock Information**, I can help with:
- Real-time stock prices (e.g., AAPL, TSLA, MSFT)
- Company news and updates
- Market trends and analysis

**For Crypto**, I recommend:
- CoinGecko or CoinMarketCap for prices
- Crypto-specific exchanges for trading
- Blockchain explorers for transaction data

💡 **Tip**: If you're interested in crypto exposure through stocks, consider companies like:
- COIN (Coinbase)
- MSTR (MicroStrategy)
- Crypto ETFs

Would you like information on any specific stock instead?"""
    
    # Price/quote questions without symbol
    if any(word in message_lower for word in ['price', 'quote', 'value', 'worth', 'cost']) and not extract_stock_symbol(message):
        return """💰 **Stock Price Inquiry**:

I can get you real-time stock prices! Just tell me which stock you're interested in.

**How to ask**:
- "What's the price of AAPL?"
- "TSLA stock price"
- "How much is Microsoft?"
- "$NVDA quote"

**Popular stocks you can ask about**:
🍎 AAPL - Apple
🚗 TSLA - Tesla
💻 MSFT - Microsoft
🔍 GOOGL - Google
📦 AMZN - Amazon
🎮 NVDA - Nvidia
📘 META - Meta (Facebook)
⚡ AMD - AMD

Just mention any stock symbol and I'll fetch the latest data for you!"""
    
    # Gratitude/greetings
    if any(word in message_lower for word in ['thank', 'thanks', 'appreciate', 'helpful']):
        return """You're welcome! 😊

I'm here to help with your financial questions. Feel free to ask about:
- 📊 Stock prices and quotes
- 📰 Company news
- 📈 Market trends
- 💡 Trading strategies

What would you like to know next?"""
    
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greetings']):
        return """👋 Hello! I'm FinBot, your financial assistant!

I can help you with:
- 📊 Real-time stock quotes (e.g., "What's AAPL price?")
- 📰 Latest company news (e.g., "Tesla news")
- 📈 Market updates (e.g., "Market outlook today")
- 💡 Trading strategies and indicators

What financial information are you looking for today?"""
    
    # Default - Try to be helpful based on context
    return """🤖 **I'm here to help with financial information!**

I can assist you with:

**Stock Information**:
- Real-time prices (e.g., "AAPL price")
- Company news (e.g., "Tesla latest news")
- Market data for any US stock

**Market Insights**:
- Current market trends
- Latest financial news
- Market outlook

**Trading Education**:
- Trading strategies
- Technical indicators
- Investment basics

💡 **Try asking**:
- "What's the price of Apple?"
- "Latest market news"
- "Explain RSI indicator"
- "Best trading strategies"

What would you like to know?"""

def chat_with_finnhub(user_message, conversation_history=None):
    """
    Process user message and provide intelligent financial responses using Finnhub API
    
    Args:
        user_message: User's message
        conversation_history: List of previous messages (optional)
    
    Returns:
        dict with bot response and updated conversation history
    """
    try:
        if not FINNHUB_API_KEY:
            return {
                'response': 'Finnhub API key not configured. Please set FINNHUB_API_KEY in your .env file.',
                'error': True
            }
        
        # Extract stock symbol from message
        symbol = extract_stock_symbol(user_message)
        message_lower = user_message.lower()
        
        # Determine query type and generate response
        if symbol:
            # User is asking about a specific stock
            quote = get_stock_quote(symbol)
            
            if quote and quote.get('c'):
                # Valid stock found
                profile = get_company_profile(symbol)
                
                # Check if user wants news
                if any(word in message_lower for word in ['news', 'update', 'latest', 'headline']):
                    news = get_company_news(symbol)
                    bot_response = format_stock_response(symbol, quote, profile, news)
                else:
                    # Just price info
                    bot_response = format_stock_response(symbol, quote, profile, [])
            else:
                bot_response = f"⚠️ Sorry, I couldn't find stock information for '{symbol}'. Please check the symbol and try again.\n\nTip: Use valid stock symbols like AAPL, MSFT, TSLA, etc."
        
        elif any(word in message_lower for word in ['news', 'market', 'update', 'headline', 'today', 'outlook']):
            # General market news
            news = get_market_news('general')
            if news:
                bot_response = "📈 **Latest Market News**\n\n"
                for i, article in enumerate(news[:5], 1):
                    headline = article.get('headline', 'No headline')
                    summary = article.get('summary', '')
                    if summary:
                        summary_text = summary[:150] + '...' if len(summary) > 150 else summary
                        bot_response += f"**{i}. {headline}**\n{summary_text}\n\n"
                    else:
                        bot_response += f"**{i}. {headline}**\n\n"
            else:
                bot_response = "📰 Unable to fetch market news at the moment. Please try again later."
        
        else:
            # General query - provide helpful response
            bot_response = generate_general_response(user_message)
        
        # Update conversation history
        updated_history = conversation_history if conversation_history else []
        updated_history.append({"role": "user", "content": user_message})
        updated_history.append({"role": "assistant", "content": bot_response})
        
        return {
            'response': bot_response,
            'conversation_history': updated_history,
            'error': False
        }
    
    except requests.exceptions.HTTPError as e:
        error_msg = f'Finnhub API Error: {str(e)}'
        try:
            error_detail = e.response.json()
            error_msg += f'\nDetails: {error_detail}'
        except:
            error_msg += f'\nResponse: {e.response.text}'
        return {
            'response': error_msg,
            'error': True
        }
    except requests.exceptions.RequestException as e:
        return {
            'response': f'Network error communicating with Finnhub: {str(e)}',
            'error': True
        }
    except Exception as e:
        return {
            'response': f'Unexpected error: {str(e)}',
            'error': True
        }
