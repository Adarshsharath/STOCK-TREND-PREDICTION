# FinSight AI Chatbot Migration Guide

## Overview

The chatbot has been completely refactored from Perplexity API to a **Groq-based system with RAG (Retrieval Augmented Generation)** using LangChain agents.

## What Changed

### ❌ Removed
- Perplexity API integration
- `perplexity_bot.py` and `perplexity_bot_new.py`
- Old `chat_history.py`
- All Perplexity dependencies

### ✅ Added
- **Groq LLM** (mixtral-8x7b-32768) for chat generation
- **RAG System** with Chroma vector database
- **LangChain Agents** with ReAct framework
- **Agent Tools** for platform knowledge and stock prices
- **MongoDB Chat Manager** with improved schema
- **Knowledge Base** extracted from documentation

---

## New Architecture

### Components

1. **Knowledge Base** (`backend/knowledge_base.txt`)
   - Extracted from FinSight-AI documentation
   - Contains all platform information, strategies, models, features

2. **Vector Database Builder** (`backend/chatbot/build_vector_db.py`)
   - Chunks knowledge base into semantic segments
   - Creates embeddings using `sentence-transformers/all-MiniLM-L6-v2`
   - Stores in persistent Chroma vector database

3. **RAG Query Engine** (`backend/chatbot/load_and_query.py`)
   - Loads vector database
   - Provides RAG-based question answering
   - Retrieves relevant context for queries

4. **Groq Agent** (`backend/chatbot/groq_agent.py`)
   - Main chatbot with LangChain ReAct agent
   - Two tools:
     - **PlatformKnowledge**: RAG-based platform queries
     - **StockPrice**: Live stock price lookup via yfinance
   - Financial safety disclaimers built-in

5. **MongoDB Chat Manager** (`backend/chatbot/mongo_chat_manager.py`)
   - Improved conversation persistence
   - Per-user isolation with ownership verification
   - Better schema with sessionId and timestamps

---

## MongoDB Schema

### Collection: `conversations`

```javascript
{
  _id: ObjectId,
  userId: ObjectId,              // User who owns the conversation
  sessionId: String,             // Unique session identifier
  created_at: ISODate,
  updated_at: ISODate,
  title: String,                 // Auto-generated from first message
  messages: [
    {
      role: String,              // "user" or "assistant"
      content: String,           // Message content
      timestamp: ISODate
    }
  ]
}
```

### Indexes (Recommended)
```javascript
db.conversations.createIndex({ userId: 1, updated_at: -1 })
db.conversations.createIndex({ userId: 1, sessionId: 1 })
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**New dependencies installed:**
- `langchain==0.1.0`
- `langchain-community==0.0.13`
- `langchain-groq==0.0.1`
- `chromadb==0.4.22`
- `sentence-transformers==2.3.1`
- `tiktoken==0.5.2`

### 2. Set Environment Variables

Update your `.env` file:

```env
# Groq API Key (REQUIRED)
GROQ_API_KEY=your_groq_api_key_here

# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=appname
MONGODB_DB=finsight_ai

# JWT Secret
JWT_SECRET_KEY=your-secret-key-change-in-production

# Optional
NEWSAPI_KEY=your_newsapi_key_here
```

**Get Groq API Key:**
1. Visit https://console.groq.com/
2. Sign up for free account
3. Generate API key
4. Add to `.env` file

### 3. Build Vector Database

**IMPORTANT:** Run this before starting the backend!

```bash
cd backend
python chatbot/build_vector_db.py
```

**Expected output:**
```
============================================================
🚀 FinSight AI - Vector Database Builder
============================================================
📖 Loading knowledge base from: backend/knowledge_base.txt
✓ Loaded 20136 characters
✂️  Splitting text into chunks (size=1000, overlap=200)
✓ Created X chunks
🔨 Building vector database at: backend/chatbot/vector_db
📊 Loading embedding model: sentence-transformers/all-MiniLM-L6-v2
💾 Creating persistent vector store...
✓ Vector database created with X embeddings
✅ Vector database built successfully!
```

### 4. Start Backend

```bash
cd backend
python app.py
```

Or with gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Testing

### Test 1: RAG Query Engine

```bash
cd backend
python chatbot/load_and_query.py
```

**Expected:** Answers to test questions about platform

### Test 2: Agent Tools

```bash
cd backend
python chatbot/groq_agent.py
```

**Test queries:**
- "What trading strategies are available?"
- "How does MACD strategy work?"
- "What's the current price of AAPL?"
- "Should I buy Tesla stock?"

### Test 3: API Endpoint

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# 2. Chat with bot
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message":"What strategies does FinSight AI offer?"}'
```

---

## Agent Tool Logic

### When PlatformKnowledge Tool is Used:
- Questions about strategies (MACD, RSI, EMA, etc.)
- Questions about ML models (LSTM, Prophet, XGBoost, etc.)
- Questions about platform features
- "How do I use X?"
- "What is X strategy?"

### When StockPrice Tool is Used:
- "What's the price of AAPL?"
- "Get me TSLA quote"
- "Current price of Microsoft"
- "How much is Amazon stock?"

### When Neither Tool is Used:
- General trading education
- Market concepts
- Technical analysis basics
- LLM generates from general knowledge

---

## Financial Safety Features

### Automatic Disclaimers
The agent automatically adds disclaimers when:
- User asks "should I buy/sell"
- User asks about profit predictions
- Investment/trading keywords detected

### Sample Disclaimer:
```
⚠️ **Important Disclaimer**: This is educational information only, 
not financial advice. Trading and investing involve risk. Always do 
your own research and consider consulting with a qualified financial 
advisor before making investment decisions.
```

### No Advice Given
Agent is programmed to:
- Explain what strategies would signal
- Discuss theoretical scenarios
- Provide educational content
- **Never** say "you should buy/sell"

---

## API Changes

### `/api/chatbot` (POST)

**Old Request:**
```json
{
  "message": "Hello",
  "conversation_history": [...]  // Manual history management
}
```

**New Request:**
```json
{
  "message": "Hello",
  "conversation_id": "optional_id"  // Auto-managed by MongoDB
}
```

**Response:**
```json
{
  "response": "Hello! I'm FinSight AI...",
  "conversation_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "timestamp": "2025-12-29T23:00:00.000Z",
  "error": false
}
```

### Conversation Endpoints (Unchanged)
- `GET /api/conversations` - List all
- `GET /api/conversations/:id` - Get one
- `DELETE /api/conversations/:id` - Delete
- `PUT /api/conversations/:id/title` - Update title
- `POST /api/conversations/new` - Create new

---

## Performance Considerations

### Vector Database
- **First query:** ~2-3 seconds (model loading)
- **Subsequent queries:** ~500ms
- **Storage:** ~50-100MB for typical knowledge base

### Groq API
- **Speed:** Very fast (mixtral-8x7b-32768)
- **Rate limits:** Check Groq console
- **Free tier:** Generous limits

### MongoDB
- Add indexes for better performance
- Use connection pooling (already configured)

---

## Troubleshooting

### Error: "Vector database not found"
**Solution:** Run `python chatbot/build_vector_db.py` first

### Error: "GROQ_API_KEY not found"
**Solution:** Add to `.env` file and restart backend

### Error: "No module named 'langchain'"
**Solution:** Run `pip install -r requirements.txt`

### Agent not using tools correctly
**Solution:** Check agent verbose output, verify tool descriptions

### Slow responses
**Solution:** 
- Check Groq API status
- Verify network connection
- Consider caching for repeated queries

---

## Maintenance

### Updating Knowledge Base

1. Update `backend/knowledge_base.txt`
2. Rebuild vector database:
   ```bash
   python chatbot/build_vector_db.py
   ```
3. Restart backend

### Monitoring

Monitor these in production:
- Groq API usage/limits
- MongoDB query performance
- Vector database query latency
- Agent tool usage patterns

---

## Migration Checklist

- [x] Remove Perplexity code
- [x] Install new dependencies
- [x] Create Groq API account
- [x] Set GROQ_API_KEY in .env
- [x] Build vector database
- [x] Update Flask endpoints
- [x] Test RAG queries
- [x] Test agent tools
- [x] Test API endpoints
- [x] Update frontend (if needed)
- [x] Deploy to production

---

## Frontend Changes (Minimal)

The API contract is **mostly backward compatible**. 

**Only change needed:**
Remove `conversation_history` from request body (now auto-managed).

**Before:**
```javascript
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: userMessage,
    conversation_id: conversationId,
    conversation_history: history  // ❌ Remove this
  })
});
```

**After:**
```javascript
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: userMessage,
    conversation_id: conversationId  // ✅ That's it!
  })
});
```

---

## Benefits of New System

✅ **No Hallucinations**: RAG grounds responses in actual documentation  
✅ **Faster**: Groq inference is very fast  
✅ **Smarter**: Agent chooses right tool for each query  
✅ **Safer**: Built-in financial disclaimers  
✅ **Cheaper**: Groq free tier is generous  
✅ **Better Context**: MongoDB manages full conversation history  
✅ **Extensible**: Easy to add new tools to agent  

---

## Support

For issues or questions:
1. Check this guide
2. Review agent verbose logs
3. Verify environment variables
4. Test each component independently

---

**Last Updated:** December 29, 2025  
**Version:** 2.0.0 (Groq + RAG)
