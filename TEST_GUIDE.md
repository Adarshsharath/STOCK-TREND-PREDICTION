# 🧪 FinBot AI - Testing Guide

## ✅ **FIXES APPLIED**

### **Strategies Page - Fixed Issues:**
1. ✅ Added 60-second timeout to prevent infinite loading
2. ✅ Added clear loading indicator with progress message
3. ✅ Better error handling with helpful messages
4. ✅ Data validation before displaying results
5. ✅ Console logging for debugging

### **Predictions Page - Fixed Issues:**
1. ✅ Added 120-second timeout for ML models
2. ✅ Added loading indicator with training message
3. ✅ Better error handling
4. ✅ Data validation

---

## 🧪 **How to Test**

### **Step 1: Restart Frontend**

Since we updated the code, restart the frontend:

```bash
# In frontend terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

Wait for: `➜  Local:   http://localhost:3000/`

### **Step 2: Open Browser**

```
http://localhost:3000
```

### **Step 3: Test Strategies (Should Work Now!)**

1. **Click "Strategies" in navbar**
2. **Fill the form:**
   - Strategy: `EMA Crossover`
   - Symbol: `AAPL`
   - Period: `1 Year`
3. **Click "Analyze"**
4. **You should see:**
   - Blue loading box with message: "Analyzing AAPL with EMA Crossover..."
   - After 5-15 seconds: Chart appears with buy/sell signals
   - Signal summary on the right

**If it gets stuck:**
- Check browser console (F12) for errors
- Check backend terminal for errors
- Try a different symbol like `MSFT`
- Try shorter period like `3 Months`

### **Step 4: Test Predictions**

1. **Click "Predictions" in navbar**
2. **Fill the form:**
   - Model: `ARIMA` (fastest!)
   - Symbol: `TSLA`
   - Period: `1 Year`
3. **Click "Predict"**
4. **You should see:**
   - Blue loading box: "Training ARIMA model for TSLA..."
   - After 10-20 seconds: Prediction chart appears
   - Metrics cards below (MAE, RMSE, Accuracy)

---

## 🔍 **Debugging Steps**

### **If Strategies Page Still Gets Stuck:**

1. **Open Browser Console (F12)**
   - Look for red errors
   - Check Network tab for failed requests

2. **Check Backend Terminal**
   - Should show: `GET /api/strategy?name=ema_crossover&symbol=AAPL&period=1y`
   - Should show: `200` status code

3. **Test Backend Directly**
   Open in browser:
   ```
   http://localhost:5000/api/strategy?name=ema_crossover&symbol=AAPL&period=1y
   ```
   Should return JSON data

4. **Check for Errors in Console**
   - Look for "Strategy fetch error:" messages
   - These will tell you exactly what's wrong

---

## ✅ **Expected Behavior**

### **Strategies Page:**

**Loading State:**
```
┌─────────────────────────────────────┐
│  🔄 Analyzing AAPL with EMA         │
│     Crossover...                    │
│                                     │
│  This may take 10-30 seconds        │
└─────────────────────────────────────┘
```

**Success State:**
```
┌─────────────────────────────────────┐
│  📊 Chart with price line           │
│  🟢 Green triangles (Buy signals)   │
│  🔴 Red triangles (Sell signals)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Signal Summary                     │
│  Buy Signals: 12                    │
│  Sell Signals: 11                   │
└─────────────────────────────────────┘
```

**Error State:**
```
┌─────────────────────────────────────┐
│  ❌ Error: No data found for symbol │
│                                     │
│  Try a different symbol or shorter  │
│  period...                          │
└─────────────────────────────────────┘
```

---

## 🎯 **Quick Tests**

### **Test 1: Fast Strategy (Should work in 5-10 seconds)**
- Strategy: `RSI Strategy`
- Symbol: `AAPL`
- Period: `3 Months`
- Click Analyze
- ✅ Should show chart quickly

### **Test 2: Fast Prediction (Should work in 10-15 seconds)**
- Model: `ARIMA`
- Symbol: `MSFT`
- Period: `1 Year`
- Click Predict
- ✅ Should show prediction chart

### **Test 3: Different Symbols**
Try these symbols to verify data fetching works:
- `GOOGL` - Google
- `TSLA` - Tesla
- `NVDA` - NVIDIA
- `META` - Meta

### **Test 4: Error Handling**
- Symbol: `INVALID123`
- Click Analyze
- ✅ Should show error message (not get stuck)

---

## 🐛 **Common Issues & Solutions**

### **Issue: Page loads but button doesn't work**

**Solution:**
1. Check browser console (F12)
2. Look for JavaScript errors
3. Make sure backend is running
4. Try refreshing page (Ctrl+R)

### **Issue: Loading forever (stuck)**

**Solution:**
1. Wait 60 seconds (timeout will trigger)
2. Error message should appear
3. Check backend terminal for errors
4. Try shorter period or different symbol

### **Issue: "Failed to fetch" error**

**Solution:**
1. Backend is not running - start it:
   ```bash
   cd backend
   python app.py
   ```
2. Check if backend is on port 5000:
   ```
   http://localhost:5000/api/health
   ```

### **Issue: Chart doesn't display**

**Solution:**
1. Data loaded but chart component has issue
2. Check browser console for Plotly errors
3. Try refreshing page
4. Check if data structure is correct

---

## 📊 **Performance Expectations**

| Action | Expected Time |
|--------|--------------|
| Strategy Analysis (1 year) | 5-15 seconds |
| Strategy Analysis (5 years) | 15-30 seconds |
| ARIMA Prediction | 10-20 seconds |
| Prophet Prediction | 20-40 seconds |
| LSTM Prediction | 30-90 seconds |

---

## ✅ **Success Checklist**

- [ ] Strategies page loads without errors
- [ ] Can select different strategies
- [ ] Can enter stock symbol
- [ ] Loading indicator appears when clicking Analyze
- [ ] Chart displays after loading
- [ ] Buy/sell signals show on chart
- [ ] Signal summary shows correct counts
- [ ] Can switch to Predictions page
- [ ] Predictions work similarly
- [ ] Error messages are helpful
- [ ] No infinite loading

---

## 🎉 **If Everything Works:**

You should be able to:

1. ✅ Navigate to Strategies page
2. ✅ See the form
3. ✅ Click Analyze
4. ✅ See loading indicator
5. ✅ See chart after 5-30 seconds
6. ✅ See buy/sell signals
7. ✅ Switch between different strategies
8. ✅ Try different symbols
9. ✅ Same for Predictions page

---

## 📞 **Still Having Issues?**

1. **Restart both servers:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start backend first
   - Wait 5 seconds
   - Start frontend
   - Refresh browser

2. **Check logs:**
   - Backend terminal for Python errors
   - Frontend terminal for build errors
   - Browser console for JavaScript errors

3. **Test backend directly:**
   ```
   http://localhost:5000/api/health
   http://localhost:5000/api/strategy?name=ema_crossover&symbol=AAPL&period=1y
   ```

---

**The fixes should prevent the "getting stuck" issue. The page will now:**
- Show clear loading indicators
- Timeout after 60 seconds (strategies) or 120 seconds (predictions)
- Display helpful error messages
- Log errors to console for debugging

**Happy Testing! 🚀**
