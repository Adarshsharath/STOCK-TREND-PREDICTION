# 🔧 Fix: Publish Directory Error in Render

## ❌ Error:
```
==> Publish directory dest does not exist!
==> Build failed 😞
```

## ✅ Solution:

### In Render Dashboard:

1. **Go to your Frontend Static Site** settings
2. Find **"Publish Directory"** field
3. **Change from**: `dest`
4. **Change to**: `dist`

### Current Settings (Wrong):
```
Publish Directory: dest  ❌
```

### Correct Settings:
```
Publish Directory: dist  ✅
```

---

## 📝 Complete Settings Should Be:

```
Name: finbot-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist          ← Change this!
Environment Variable:
  VITE_API_URL = https://stock-trend-prediction-3.onrender.com
```

---

## ✅ Steps:

1. Open Render Dashboard
2. Click on your **Frontend Static Site**
3. Go to **"Settings"** tab
4. Scroll to **"Build & Deploy"** section
5. Find **"Publish Directory"**
6. Change from `dest` to `dist`
7. Click **"Save Changes"**
8. Render will auto-redeploy

---

## ⚠️ About the Warning:

You'll also see this warning (it's not breaking, but you can fix it):

```
Warning: Module type of file:///opt/render/project/src/frontend/postcss.config.js is not specified
```

### To Fix the Warning (Optional):

Add to `frontend/package.json`:
```json
{
  "type": "module",
  ...
}
```

But this is just a warning - the real issue is the publish directory!

---

## 🎯 After Fixing:

1. Wait for rebuild (2-3 minutes)
2. Check deployment logs - should show success ✅
3. Visit your frontend URL - should work!

---

That's it! Just change `dest` to `dist` in Render settings! 🚀

