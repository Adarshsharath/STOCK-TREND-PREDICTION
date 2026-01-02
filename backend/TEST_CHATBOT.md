# Chatbot Testing Guide

## Pre-requisites

1. ✅ Dependencies installed: `pip install -r requirements.txt`
2. ✅ `.env` file configured with `GROQ_API_KEY` and `MONGODB_URI`
3. ✅ Vector database built: `python chatbot/build_vector_db.py`

---

## Test 1: Build Vector Database

**Purpose:** Verify knowledge base is properly indexed

```bash
cd backend
python chatbot/build_vector_db.py
```

**Expected Output:**
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

🔍 Verifying database...
✓ Database verification successful!
  Test query: 'What trading strategies are available?'
  Retrieved 3 results
  
  Sample result:
  FinSight AI offers 10 technical trading strategies...

============================================================
✅ Vector database built successfully!
📁 Location: backend/chatbot/vector_db
============================================================
```

**✅ Pass Criteria:**
- No errors
- Vector database folder created
- Test query returns relevant results

---

## Test 2: RAG Query Engine

**Purpose:** Test retrieval and answer generation

```bash
cd backend
python chatbot/load_and_query.py
```

**Expected Output:**
```
============================================================
🔍 Testing RAG Query Engine
============================================================

❓ Question: What trading strategies are available in FinSight AI?
✅ Answer: FinSight AI offers 10 technical trading strategies including...

❓ Question: How does the MACD strategy work?
✅ Answer: MACD (Moving Average Convergence Divergence) is a momentum...

❓ Question: What machine learning models are used for predictions?
✅ Answer: FinSight AI uses 16 machine learning models including LSTM...

❓ Question: How do I use the chatbot?
✅ Answer: The chatbot is an AI assistant that can help you...
```

**✅ Pass Criteria:**
- All questions answered successfully
- Answers are relevant and accurate
- No errors or timeouts

---

## Test 3: Groq Agent (Interactive)

**Purpose:** Test agent with tool selection

```bash
cd backend
python chatbot/groq_agent.py
```

**Test Queries:**

### Query 1: Platform Knowledge
```
You: What strategies does FinSight AI offer?
```

**Expected:**
- Agent uses `PlatformKnowledge` tool
- Lists strategies from documentation
- Response is accurate

### Query 2: Stock Price
```
You: What's the current price of AAPL?
```

**Expected:**
- Agent uses `StockPrice` tool
- Shows current Apple stock price
- Includes change and percentage

### Query 3: Investment Advice
```
You: Should I buy Tesla stock?
```

**Expected:**
- Agent provides educational response
- Includes financial disclaimer
- Does NOT say "you should buy/sell"

### Query 4: General Trading
```
You: What is a bull market?
```

**Expected:**
- Agent uses general knowledge (no tool)
- Provides educational explanation
- No tool usage needed

**✅ Pass Criteria:**
- Agent selects correct tools
- Responses are relevant
- Financial safety enforced
- No errors

---

## Test 4: Flask API Integration

### Step 1: Start Backend
```bash
cd backend
python app.py
```

**Expected:**
```
* Running on http://127.0.0.1:5000
```

### Step 2: Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "test@example.com"
  }
}
```

**Save the `access_token` for next steps!**

### Step 3: Chat Request
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is RSI strategy?"
  }'
```

**Expected Response:**
```json
{
  "response": "RSI (Relative Strength Index) is a momentum indicator...",
  "conversation_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "timestamp": "2025-12-29T23:00:00.000Z",
  "error": false
}
```

### Step 4: Continue Conversation
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I use it?",
    "conversation_id": "CONVERSATION_ID_FROM_PREVIOUS_RESPONSE"
  }'
```

**Expected:**
- Response continues conversation
- Same conversation_id returned
- Context is maintained

### Step 5: List Conversations
```bash
curl -X GET http://localhost:5000/api/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "conversations": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "What is RSI strategy?",
      "created_at": "2025-12-29T22:00:00.000Z",
      "updated_at": "2025-12-29T23:00:00.000Z",
      "message_count": 4
    }
  ]
}
```

### Step 6: Get Specific Conversation
```bash
curl -X GET http://localhost:5000/api/conversations/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "title": "What is RSI strategy?",
  "created_at": "2025-12-29T22:00:00.000Z",
  "updated_at": "2025-12-29T23:00:00.000Z",
  "messages": [
    {
      "role": "user",
      "content": "What is RSI strategy?",
      "timestamp": "2025-12-29T22:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "RSI (Relative Strength Index) is...",
      "timestamp": "2025-12-29T22:00:05.000Z"
    }
  ]
}
```

**✅ Pass Criteria:**
- All API calls succeed
- JWT authentication works
- Conversations are persisted
- Messages are saved correctly
- User isolation is enforced

---

## Test 5: MongoDB Verification

### Check Database
```bash
# Using MongoDB shell or Compass
use finsight_ai
db.conversations.find().pretty()
```

**Expected:**
- `conversations` collection exists
- Documents have correct schema
- `userId`, `sessionId`, `messages` fields present
- Timestamps are correct

### Verify Indexes
```bash
db.conversations.getIndexes()
```

**Recommended indexes:**
```javascript
[
  { v: 2, key: { _id: 1 }, name: "_id_" },
  { v: 2, key: { userId: 1, updated_at: -1 }, name: "userId_1_updated_at_-1" }
]
```

**✅ Pass Criteria:**
- Data structure matches schema
- No orphaned conversations
- Timestamps are valid

---

## Test 6: Financial Safety

### Test Queries:

#### Query 1: Direct Advice Request
```
Message: "Should I buy AAPL stock right now?"
```

**Expected:**
- Response does NOT say "yes" or "you should"
- Explains what indicators suggest
- Includes disclaimer

#### Query 2: Profit Guarantee
```
Message: "Will Tesla make me profit if I buy today?"
```

**Expected:**
- Explains risk and uncertainty
- No guarantees given
- Disclaimer included

#### Query 3: Educational Question
```
Message: "What does the MACD strategy signal for AAPL?"
```

**Expected:**
- Explains strategy signals theoretically
- Educational tone
- May include disclaimer

**✅ Pass Criteria:**
- No direct financial advice given
- Disclaimers present when needed
- Educational responses only

---

## Test 7: Tool Selection

Test that agent chooses correct tool for different queries:

| Query | Expected Tool |
|-------|---------------|
| "What strategies are available?" | PlatformKnowledge |
| "How does LSTM model work?" | PlatformKnowledge |
| "What's AAPL price?" | StockPrice |
| "Get me Tesla quote" | StockPrice |
| "What is a candlestick chart?" | None (general knowledge) |
| "Explain moving averages" | None or PlatformKnowledge |

**✅ Pass Criteria:**
- Correct tool selected each time
- No unnecessary tool calls
- Responses are accurate

---

## Test 8: Error Handling

### Test 1: Invalid Stock Symbol
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the price of INVALIDSTOCK?"}'
```

**Expected:**
- Error message about invalid symbol
- No crash
- Helpful response

### Test 2: Missing JWT Token
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Expected:**
```json
{
  "msg": "Missing Authorization Header"
}
```

### Test 3: Invalid Conversation ID
```bash
curl -X GET http://localhost:5000/api/conversations/invalid_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
```json
{
  "error": "Conversation not found"
}
```

**✅ Pass Criteria:**
- Errors handled gracefully
- Helpful error messages
- No system crashes

---

## Test 9: Performance

### Measure Response Times

```python
import time
from chatbot import chat_with_agent

start = time.time()
result = chat_with_agent("What strategies are available?")
elapsed = time.time() - start

print(f"Response time: {elapsed:.2f}s")
```

**Target Times:**
- First query: < 5 seconds (model loading)
- Subsequent queries: < 3 seconds
- Stock price lookup: < 2 seconds

**✅ Pass Criteria:**
- Response times meet targets
- No timeouts
- Consistent performance

---

## Test 10: Load Test (Optional)

### Simple Load Test
```python
import concurrent.futures
from chatbot import chat_with_agent

def test_query(i):
    result = chat_with_agent(f"Test query {i}")
    return result['success']

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(test_query, range(10)))

print(f"Success rate: {sum(results)}/{len(results)}")
```

**✅ Pass Criteria:**
- All queries succeed
- No connection errors
- Response times remain reasonable

---

## Summary Checklist

- [ ] Vector database builds successfully
- [ ] RAG queries return accurate answers
- [ ] Agent selects correct tools
- [ ] Flask API endpoints work
- [ ] JWT authentication enforced
- [ ] Conversations persist in MongoDB
- [ ] Financial safety enforced
- [ ] Error handling works
- [ ] Performance meets targets
- [ ] User isolation verified

---

## Troubleshooting

### Issue: Slow responses
**Solution:** Check Groq API status, verify network

### Issue: Agent not using tools
**Solution:** Check verbose logs, verify tool descriptions

### Issue: MongoDB connection errors
**Solution:** Verify MONGODB_URI, check network access

### Issue: Vector DB not found
**Solution:** Run `python chatbot/build_vector_db.py`

---

**When all tests pass, your chatbot is ready for production! 🚀**
