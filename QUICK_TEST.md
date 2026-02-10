# Quick Smoke Test (5 minutes)

Use this for rapid verification that core functionality works.

## Setup
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

## Quick Tests

### ✅ 1. Basic Chat (1 min)
- [ ] Open http://localhost:5173
- [ ] Send: "Hello"
- [ ] **Verify:** Response streams in, no errors

### ✅ 2. ORDER Agent (1 min)
- [ ] Send: "Track my order #12345"
- [ ] **Verify:** Shows "Processing with ORDER Agent..."
- [ ] **Verify:** Response mentions orders/tracking

### ✅ 3. BILLING Agent (1 min)
- [ ] Send: "I need a refund"
- [ ] **Verify:** Shows "Processing with BILLING Agent..."
- [ ] **Verify:** Response mentions refunds/billing

### ✅ 4. SUPPORT Agent (1 min)
- [ ] Send: "What are your hours?"
- [ ] **Verify:** Shows "Processing with SUPPORT Agent..." or "Routing..."
- [ ] **Verify:** Response is helpful

### ✅ 5. Streaming Works (1 min)
- [ ] Send: "Explain REST APIs in detail"
- [ ] **Verify:** Text appears progressively (not all at once)
- [ ] **Verify:** Auto-scrolls to bottom

## Pass Criteria
- All 5 tests pass ✅
- No console errors
- No UI crashes

**Result:** ☐ PASS ☐ FAIL

**Issues Found:**
```
1. 
2. 
3. 
```
