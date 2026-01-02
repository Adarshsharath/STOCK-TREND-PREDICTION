# 🚀 FinSight AI Chatbot - Quick Setup Guide

## Step-by-Step Setup (5 minutes)

### Prerequisites
- Python 3.8+
- MongoDB (Atlas or local)
- Internet connection

---

## Step 1: Install Dependencies (2 min)

```bash
cd backend
pip install -r requirements.txt
```

**Expected:** ~6 new packages installed (langchain, chromadb, etc.)

---

## Step 2: Get Groq API Key (1 min)

1. Visit https://console.groq.com/
2. Click "Sign Up" (it's free!)
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key

**Note:** Groq offers generous free tier with fast inference!

---

## Step 3: Configure Environment (1 min)

```bash
# Copy example file
cp .env.example .env

# Edit .env file
nano .env  # or use your favorite editor
```

**Add these values:**
```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=finsight_ai
JWT_SECRET_KEY=your-secret-key-change-in-production
```

**Get MongoDB URI:**
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Local: `mongodb://localhost:27017/`

---

## Step 4: Build Vector Database (1 min)

```bash
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
✓ Created 25 chunks
🔨 Building vector database at: backend/chatbot/vector_db
📊 Loading embedding model: sentence-transformers/all-MiniLM-L6-v2
💾 Creating persistent vector store...
✓ Vector database created with 25 embeddings
✓ Database verification successful!
============================================================
✅ Vector database built successfully!
============================================================
```

**This only needs to be done once!** (or when knowledge base updates)

---

## Step 5: Test the System (Optional but Recommended)

### Test 1: RAG Engine
```bash
python chatbot/load_and_query.py
```

**Expected:** Answers to 4 test questions about the platform

### Test 2: Agent (Interactive)
```bash
python chatbot/groq_agent.py
```

**Try these queries:**
- "What strategies are available?"
- "What's AAPL price?"
- "Should I buy Tesla?" (tests financial safety)

Type `quit` to exit.

---

## Step 6: Start Backend

```bash
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

**Your chatbot is now running! 🎉**

---

## Quick API Test

### 1. Login (get JWT token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the `access_token` from response!

### 2. Chat with Bot
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What strategies does FinSight AI offer?"}'
```

**Expected:** Detailed response about available strategies!

---

## Troubleshooting

### ❌ "GROQ_API_KEY not found"
**Solution:** Add GROQ_API_KEY to `.env` file and restart

### ❌ "Vector database not found"
**Solution:** Run `python chatbot/build_vector_db.py`

### ❌ "No module named 'langchain'"
**Solution:** Run `pip install -r requirements.txt`

### ❌ MongoDB connection error
**Solution:** Verify MONGODB_URI in `.env` file

### ❌ "Could not load sentence-transformers model"
**Solution:** First run downloads the model (~90MB), wait for it to complete

---

## What's Different from Old System?

| Feature | Old (Perplexity) | New (Groq + RAG) |
|---------|------------------|------------------|
| API | Perplexity | Groq |
| Knowledge | External | Internal (RAG) |
| Tools | None | 2 (expandable) |
| History | Manual | Auto (MongoDB) |
| Safety | Manual | Built-in |
| Cost | $ per request | Free tier |

---

## Frontend Changes Needed

**Only 1 line needs to change:**

### Before:
```javascript
body: JSON.stringify({
  message: userMessage,
  conversation_history: history  // ❌ Remove this line
})
```

### After:
```javascript
body: JSON.stringify({
  message: userMessage
  // That's it! History is auto-managed now
})
```

**Optional:** You can still pass `conversation_id` to continue a conversation:
```javascript
body: JSON.stringify({
  message: userMessage,
  conversation_id: existingConversationId  // Optional
})
```

---

## File Structure

```
backend/
├── knowledge_base.txt              # ✅ Platform documentation
├── chatbot/
│   ├── __init__.py                 # ✅ Module exports
│   ├── build_vector_db.py          # ✅ Run once to build DB
│   ├── load_and_query.py           # ✅ RAG engine
│   ├── groq_agent.py               # ✅ Main chatbot
│   ├── mongo_chat_manager.py       # ✅ Chat persistence
│   └── vector_db/                  # ✅ Created by build script
├── requirements.txt                # ✅ Updated
├── .env.example                    # ✅ Updated
├── .env                            # ⚠️ Create this!
├── app.py                          # ✅ Updated endpoints
├── CHATBOT_MIGRATION_GUIDE.md      # 📖 Full guide
├── CHATBOT_README.md               # 📖 Architecture docs
├── TEST_CHATBOT.md                 # 📖 Testing guide
├── REFACTORING_SUMMARY.md          # 📖 Summary
└── SETUP_INSTRUCTIONS.md           # 📖 This file
```

---

## Agent Tools Explained

### Tool 1: PlatformKnowledge (RAG-based)
**When used:**
- "What strategies are available?"
- "How does LSTM work?"
- "Explain MACD strategy"
- "How do I use the platform?"

**How it works:**
1. Vector search in knowledge base
2. Retrieve relevant documentation
3. Generate grounded answer

### Tool 2: StockPrice (yfinance)
**When used:**
- "What's AAPL price?"
- "Get Tesla quote"
- "Current price of Microsoft"

**How it works:**
1. Fetch live data from yfinance
2. Format with current price, change, etc.
3. Return formatted response

### No Tool Needed
**When used:**
- "What is a bull market?"
- "Explain moving averages"
- General trading education

**How it works:**
- LLM uses general knowledge
- Provides educational response

---

## MongoDB Schema (FYI)

```javascript
// Collection: conversations
{
  _id: ObjectId,
  userId: ObjectId,              // From JWT
  sessionId: String,
  created_at: ISODate,
  updated_at: ISODate,
  title: String,                 // Auto-generated
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      timestamp: ISODate
    }
  ]
}
```

**No manual setup needed** - MongoDB creates this automatically!

---

## Financial Safety Features

The chatbot automatically:

✅ **Never gives direct advice** ("you should buy")  
✅ **Adds disclaimers** when needed  
✅ **Explains risks** for investment questions  
✅ **Provides education** instead of recommendations  

**Example:**

User: "Should I buy AAPL?"

Response: 
```
I can't provide financial advice, but I can explain what 
technical indicators suggest...

⚠️ Important Disclaimer: This is educational information 
only, not financial advice. Trading involves risk...
```

---

## Performance Expectations

| Operation | Time |
|-----------|------|
| First query | 3-5s (model loading) |
| Subsequent queries | 1-3s |
| Stock price lookup | 1-2s |
| Vector search | 200-500ms |

**Bottlenecks:**
- First query loads models (one-time)
- Groq API inference (usually fast)
- Network latency

---

## Next Steps

1. ✅ **Setup complete** - Backend is running
2. 🔄 **Update frontend** - Remove `conversation_history`
3. 🧪 **Test thoroughly** - See `TEST_CHATBOT.md`
4. 📊 **Monitor usage** - Check Groq console
5. 🚀 **Deploy to production** - See migration guide

---

## Additional Resources

| Document | Purpose |
|----------|---------|
| `CHATBOT_MIGRATION_GUIDE.md` | Complete migration details |
| `CHATBOT_README.md` | Architecture & API docs |
| `TEST_CHATBOT.md` | Testing procedures |
| `REFACTORING_SUMMARY.md` | What changed |

**External:**
- [Groq Documentation](https://console.groq.com/docs)
- [LangChain Docs](https://python.langchain.com/)
- [Chroma Docs](https://docs.trychroma.com/)

---

## Need Help?

1. Check the troubleshooting section above
2. Review the detailed guides in `/backend`
3. Verify environment variables in `.env`
4. Test each component individually

---

## Summary Checklist

- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Groq API key obtained
- [ ] `.env` file created and configured
- [ ] Vector database built (`python chatbot/build_vector_db.py`)
- [ ] System tested (`python chatbot/groq_agent.py`)
- [ ] Backend running (`python app.py`)
- [ ] API tested (curl commands)
- [ ] Frontend updated (remove `conversation_history`)

**When all checked, you're ready to go! 🚀**

---

**Last Updated:** December 29, 2025  
**Version:** 2.0.0  
**Estimated Setup Time:** 5 minutes
