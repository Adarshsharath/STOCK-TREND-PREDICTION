# FinSight AI Chatbot System

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env and add:
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### 3. Build Vector Database
```bash
python chatbot/build_vector_db.py
```

### 4. Start Backend
```bash
python app.py
```

---

## 📚 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Flask API (/api/chatbot)                   │
│         - JWT Authentication                             │
│         - Conversation Management                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           FinSightAgent (LangChain ReAct)               │
│                                                          │
│   ┌──────────────────┐      ┌──────────────────┐      │
│   │ PlatformKnowledge│      │   StockPrice     │      │
│   │     Tool         │      │      Tool        │      │
│   │   (RAG-based)    │      │   (yfinance)     │      │
│   └────────┬─────────┘      └────────┬─────────┘      │
│            │                          │                 │
│            ▼                          ▼                 │
│   ┌──────────────────┐      ┌──────────────────┐      │
│   │  RAG Engine      │      │  yfinance API    │      │
│   │  (Chroma DB)     │      │                  │      │
│   └──────────────────┘      └──────────────────┘      │
│                                                          │
│              Powered by Groq LLM                        │
│           (mixtral-8x7b-32768)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         MongoDB Chat Manager                            │
│    - Conversation Persistence                           │
│    - Per-User Isolation                                 │
│    - Message History                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Components

### 1. **Knowledge Base** (`knowledge_base.txt`)
- Extracted from FinSight-AI documentation
- Contains:
  - Trading strategies (EMA, MACD, RSI, Bollinger, etc.)
  - ML models (LSTM, Prophet, XGBoost, ARIMA, etc.)
  - Platform features
  - API endpoints
  - Usage instructions

### 2. **Vector Database Builder** (`chatbot/build_vector_db.py`)
- **Purpose**: Create searchable embeddings from knowledge base
- **Technology**: Chroma DB + sentence-transformers
- **Embedding Model**: `all-MiniLM-L6-v2`
- **Run Once**: Before first use or when knowledge base updates

**Usage:**
```bash
python chatbot/build_vector_db.py
```

### 3. **RAG Query Engine** (`chatbot/load_and_query.py`)
- **Purpose**: Retrieve relevant context and answer questions
- **How it works**:
  1. User question → Vector search
  2. Retrieve top K relevant chunks
  3. Pass to LLM with context
  4. Generate grounded answer

**Usage:**
```python
from chatbot import query_knowledge_base

result = query_knowledge_base("What is MACD strategy?")
print(result['answer'])
```

### 4. **Groq Agent** (`chatbot/groq_agent.py`)
- **Purpose**: Main chatbot with intelligent tool selection
- **Framework**: LangChain ReAct Agent
- **LLM**: Groq (mixtral-8x7b-32768)

**Tools:**

#### Tool 1: PlatformKnowledge
- **When used**: Questions about strategies, models, features
- **Example queries**:
  - "What strategies are available?"
  - "How does LSTM model work?"
  - "How do I use the live simulator?"

#### Tool 2: StockPrice
- **When used**: Questions about current stock prices
- **Example queries**:
  - "What's AAPL price?"
  - "Get me Tesla stock quote"
  - "Current price of Microsoft"

**Usage:**
```python
from chatbot import chat_with_agent

result = chat_with_agent("What strategies does FinSight offer?")
print(result['response'])
```

### 5. **MongoDB Chat Manager** (`chatbot/mongo_chat_manager.py`)
- **Purpose**: Persist conversations with user isolation
- **Features**:
  - Per-user conversations
  - Ownership verification
  - Message history
  - Auto-generated titles

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: String,
  created_at: ISODate,
  updated_at: ISODate,
  title: String,
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      timestamp: ISODate
    }
  ]
}
```

**Usage:**
```python
from chatbot import get_chat_manager

manager = get_chat_manager()
conversation_id = manager.create_conversation(user_id)
manager.save_message(conversation_id, user_id, 'user', 'Hello')
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Groq API key from console.groq.com |
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `MONGODB_DB` | ✅ Yes | Database name (default: finsight_ai) |
| `JWT_SECRET_KEY` | ✅ Yes | Secret for JWT tokens |
| `NEWSAPI_KEY` | ❌ No | For news sentiment (optional) |

### Get Groq API Key

1. Go to https://console.groq.com/
2. Sign up (free)
3. Navigate to API Keys
4. Create new key
5. Copy to `.env` file

### MongoDB Setup

1. Create MongoDB Atlas account (or use local)
2. Create cluster
3. Get connection string
4. Add to `.env` file

---

## 🛠️ API Endpoints

### POST `/api/chatbot`
Chat with FinSight AI

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "message": "What is MACD strategy?",
  "conversation_id": "optional_conversation_id"
}
```

**Response:**
```json
{
  "response": "MACD (Moving Average Convergence Divergence) is...",
  "conversation_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "timestamp": "2025-12-29T23:00:00.000Z",
  "error": false
}
```

### GET `/api/conversations`
List all conversations for user

**Response:**
```json
{
  "conversations": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "What is MACD strategy?",
      "created_at": "2025-12-29T22:00:00.000Z",
      "updated_at": "2025-12-29T23:00:00.000Z",
      "message_count": 10
    }
  ]
}
```

### GET `/api/conversations/:id`
Get specific conversation

### DELETE `/api/conversations/:id`
Delete conversation

### PUT `/api/conversations/:id/title`
Update conversation title

### POST `/api/conversations/new`
Create new conversation

---

## 🧪 Testing

### Test RAG Engine
```bash
python chatbot/load_and_query.py
```

**Expected output:**
```
🔍 Testing RAG Query Engine
❓ Question: What trading strategies are available in FinSight AI?
✅ Answer: FinSight AI offers 10 trading strategies including...
```

### Test Agent
```bash
python chatbot/groq_agent.py
```

**Interactive test:**
```
🤖 FinSight AI Agent - Interactive Test
Type 'quit' to exit

You: What strategies are available?
FinSight AI: FinSight AI offers 10 technical trading strategies...

You: What's AAPL price?
FinSight AI: 📊 Apple Inc. (AAPL)
Current Price: $185.23...
```

### Test API
```bash
# 1. Get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 2. Chat
curl -X POST http://localhost:5000/api/chatbot \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is RSI strategy?"}'
```

---

## 💡 Usage Examples

### Example 1: Platform Question (Uses RAG)
```
User: How does the MACD strategy work?

Agent: [Uses PlatformKnowledge tool]
Response: MACD (Moving Average Convergence Divergence) is a 
momentum indicator that shows the relationship between two 
moving averages. In FinSight AI, the MACD strategy...
[Grounded in documentation]
```

### Example 2: Stock Price (Uses yfinance)
```
User: What's the current price of Tesla?

Agent: [Uses StockPrice tool]
Response: 📊 Tesla, Inc. (TSLA)
Current Price: $248.50
Change: 🟢 $5.20 (2.14%)
Day High: $251.30
Day Low: $245.80
```

### Example 3: Investment Advice (Safety)
```
User: Should I buy Tesla stock now?

Agent: [Generates response with disclaimer]
Response: I can't provide financial advice on whether you 
should buy Tesla. However, I can explain what the technical 
indicators suggest...

⚠️ Important Disclaimer: This is educational information 
only, not financial advice. Trading involves risk...
```

### Example 4: General Trading (General knowledge)
```
User: What is a bull market?

Agent: [Uses general LLM knowledge]
Response: A bull market is a financial market condition 
characterized by rising prices and investor optimism...
```

---

## ⚡ Performance

| Operation | First Time | Subsequent |
|-----------|-----------|------------|
| Load embeddings | 2-3s | - |
| Vector search | 500ms | 200ms |
| Groq inference | 1-2s | 1-2s |
| Total response | 3-5s | 2-3s |

**Optimization tips:**
- Use connection pooling for MongoDB
- Cache frequent queries
- Monitor Groq rate limits
- Add Redis for caching (optional)

---

## 🔒 Security Features

### 1. **JWT Authentication**
All chatbot endpoints require valid JWT token

### 2. **User Isolation**
Each user can only access their own conversations

### 3. **Ownership Verification**
All MongoDB queries verify user ownership

### 4. **Financial Safety**
- No direct investment advice
- Automatic disclaimers
- Risk warnings built-in

---

## 🐛 Troubleshooting

### Error: "Vector database not found"
```
Solution: python chatbot/build_vector_db.py
```

### Error: "GROQ_API_KEY not found"
```
Solution: Add GROQ_API_KEY to .env file
```

### Error: "Agent parsing error"
```
Solution: Check agent verbose logs, update tool descriptions
```

### Slow responses
```
Solutions:
1. Check Groq API status
2. Verify network latency
3. Monitor MongoDB performance
4. Consider caching layer
```

### Agent not using tools
```
Solutions:
1. Check tool descriptions are clear
2. Verify RAG database exists
3. Test tools individually
4. Check agent verbose output
```

---

## 📈 Monitoring

### Key Metrics

1. **Response Time**
   - Vector search latency
   - Groq API latency
   - MongoDB query time

2. **Tool Usage**
   - PlatformKnowledge vs StockPrice
   - Tool selection accuracy
   - No-tool responses

3. **User Engagement**
   - Messages per conversation
   - Conversation length
   - Repeat users

4. **Quality**
   - RAG relevance scores
   - User feedback (if implemented)
   - Error rates

---

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET_KEY
- [ ] Use production MongoDB cluster
- [ ] Set GROQ_API_KEY (paid tier for higher limits)
- [ ] Build vector database on server
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Enable error logging
- [ ] Set up backups for MongoDB
- [ ] Test all endpoints

### Environment Setup
```bash
# Production .env
FLASK_ENV=production
FLASK_DEBUG=False
GROQ_API_KEY=prod_key_here
MONGODB_URI=prod_mongodb_uri
JWT_SECRET_KEY=strong_random_secret
```

---

## 🔄 Maintenance

### Updating Knowledge Base

1. Edit `knowledge_base.txt`
2. Rebuild vector database:
   ```bash
   python chatbot/build_vector_db.py
   ```
3. Restart backend (no code changes needed!)

### Adding New Tools

1. Edit `chatbot/groq_agent.py`
2. Add tool function in `_create_tools()`
3. Add tool description
4. Restart backend

**Example:**
```python
def get_market_news(query: str) -> str:
    """Get latest market news"""
    # Implementation
    return news

tools.append(Tool(
    name="MarketNews",
    func=get_market_news,
    description="Get latest market news and headlines"
))
```

---

## 📚 References

- [Groq Documentation](https://console.groq.com/docs)
- [LangChain Docs](https://python.langchain.com/docs/)
- [Chroma DB Docs](https://docs.trychroma.com/)
- [MongoDB Docs](https://www.mongodb.com/docs/)

---

## 🤝 Support

For issues:
1. Check CHATBOT_MIGRATION_GUIDE.md
2. Review error logs
3. Test components individually
4. Verify environment variables

---

**Version:** 2.0.0  
**Last Updated:** December 29, 2025  
**Technology Stack:** Groq + LangChain + RAG + MongoDB
