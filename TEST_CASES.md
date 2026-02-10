# AI Support System - Test Cases

## Prerequisites
1. Start backend: `cd apps/backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Ensure database is running and migrated
4. Set `OPENAI_API_KEY` in backend `.env`

---

## Test Suite 1: Basic Conversation Flow

### TC-1.1: Create New Conversation
**Steps:**
1. Open frontend (http://localhost:5173)
2. Click "New Conversation" or similar button

**Expected:**
- New conversation is created
- Empty chat interface is displayed
- Conversation ID is generated

**Status:** ☐ Pass ☐ Fail

---

### TC-1.2: Send Simple Message
**Steps:**
1. Type "Hello" in the message input
2. Click Send or press Enter

**Expected:**
- Message appears in chat as user message (blue bubble, right-aligned)
- Loading indicator shows "Routing..." or "Processing with [AGENT] Agent..."
- AI response streams in progressively (white bubble, left-aligned)
- Response is relevant and coherent

**Status:** ☐ Pass ☐ Fail

---

### TC-1.3: Message History Persistence
**Steps:**
1. Send 3-4 messages in a conversation
2. Refresh the page
3. Navigate back to the same conversation

**Expected:**
- All previous messages are displayed
- Message order is preserved
- No duplicate messages

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 2: Agent Routing & Intent Classification

### TC-2.1: ORDER Intent Detection
**Test Messages:**
- "What's the status of my order?"
- "I want to track order #12345"
- "Can you cancel my recent order?"

**Expected:**
- Loading indicator shows "Processing with ORDER Agent..."
- Agent responds appropriately about orders
- May attempt to call `getOrder` or `trackOrder` tools

**Status:** ☐ Pass ☐ Fail

**Notes:**
```
Response quality:
Intent shown: 
Tool calls made:
```

---

### TC-2.2: BILLING Intent Detection
**Test Messages:**
- "I need my invoice for order #12345"
- "Can I get a refund?"
- "Show me my payment history"

**Expected:**
- Loading indicator shows "Processing with BILLING Agent..."
- Agent responds about billing/invoices/refunds
- May attempt to call `getInvoice` or `processRefund` tools

**Status:** ☐ Pass ☐ Fail

**Notes:**
```
Response quality:
Intent shown:
Tool calls made:
```

---

### TC-2.3: SUPPORT Intent Detection (Default)
**Test Messages:**
- "How do I reset my password?"
- "What are your business hours?"
- "Tell me about your return policy"

**Expected:**
- Loading indicator shows "Processing with SUPPORT Agent..." or "Routing..."
- Agent provides general support responses
- May call `searchKnowledgeBase` tool

**Status:** ☐ Pass ☐ Fail

**Notes:**
```
Response quality:
Intent shown:
Tool calls made:
```

---

## Test Suite 3: Streaming & Real-time Features

### TC-3.1: Text Streaming
**Steps:**
1. Send a message that requires a long response
2. Example: "Explain the difference between REST and GraphQL APIs in detail"

**Expected:**
- Text appears word-by-word or chunk-by-chunk
- No full response delay (should start appearing within 1-2 seconds)
- Smooth streaming without stuttering
- Auto-scroll to bottom as new text arrives

**Status:** ☐ Pass ☐ Fail

---

### TC-3.2: Intent Data Streaming
**Steps:**
1. Send any message
2. Watch the loading indicator in the header

**Expected:**
- Initially shows "Routing..."
- Updates to "Processing with [INTENT] Agent..." once classified
- Intent value comes from StreamData

**Status:** ☐ Pass ☐ Fail

---

### TC-3.3: Multiple Concurrent Messages
**Steps:**
1. Send a message
2. Immediately send another message before first completes

**Expected:**
- Both messages are queued/handled appropriately
- No race conditions or crashes
- Responses appear in correct order

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 4: Tool Execution

### TC-4.1: Order Tool Calls
**Steps:**
1. Ensure database has sample order data
2. Send: "What's the status of order abc123?"

**Expected:**
- Agent calls `getOrder` or `trackOrder` tool
- Tool execution completes
- Response includes order information from database
- If order doesn't exist: "Order not found" message

**Status:** ☐ Pass ☐ Fail

**Tool Call Details:**
```
Tool called:
Arguments:
Result:
```

---

### TC-4.2: Invoice Tool Calls
**Steps:**
1. Ensure database has sample invoice data
2. Send: "Show me the invoice for order xyz789"

**Expected:**
- Agent calls `getInvoice` tool
- Returns invoice data from database
- Formats response appropriately

**Status:** ☐ Pass ☐ Fail

**Tool Call Details:**
```
Tool called:
Arguments:
Result:
```

---

### TC-4.3: Refund Tool Calls
**Steps:**
1. Send: "I want a refund for order abc123 because it arrived damaged"

**Expected:**
- Agent calls `processRefund` tool
- Logs refund request to console
- Returns confirmation message

**Status:** ☐ Pass ☐ Fail

**Tool Call Details:**
```
Tool called:
Arguments:
Result:
Console output:
```

---

## Test Suite 5: Error Handling

### TC-5.1: Empty Message Submission
**Steps:**
1. Try to send an empty message
2. Try to send only whitespace

**Expected:**
- Send button is disabled OR
- Message is rejected with validation

**Status:** ☐ Pass ☐ Fail

---

### TC-5.2: Network Error Handling
**Steps:**
1. Stop the backend server
2. Try to send a message

**Expected:**
- Error message is displayed
- UI doesn't crash
- Can retry after backend restarts

**Status:** ☐ Pass ☐ Fail

---

### TC-5.3: Invalid Conversation ID
**Steps:**
1. Manually navigate to `/conversation/invalid-id-12345`

**Expected:**
- Graceful error handling
- Redirect to home or show "Conversation not found"

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 6: UI/UX Features

### TC-6.1: Message Rendering
**Steps:**
1. Send messages with different content types
2. Test: plain text, long text, special characters, emojis

**Expected:**
- All content renders correctly
- No layout breaks
- Text wraps appropriately
- Emojis display correctly

**Status:** ☐ Pass ☐ Fail

---

### TC-6.2: Auto-scroll Behavior
**Steps:**
1. Have a long conversation (10+ messages)
2. Scroll up to read old messages
3. Send a new message

**Expected:**
- Auto-scrolls to bottom when new message arrives
- Smooth scroll animation
- User can scroll up during streaming

**Status:** ☐ Pass ☐ Fail

---

### TC-6.3: Loading States
**Steps:**
1. Send a message
2. Observe all loading indicators

**Expected:**
- Input is disabled during processing
- Send button shows loading state
- Header shows intent/routing status
- Loading states clear when complete

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 7: Conversation Management

### TC-7.1: List All Conversations
**Steps:**
1. Create 3-4 different conversations
2. Navigate to conversations list

**Expected:**
- All conversations are listed
- Most recent appears first
- Shows preview of last message
- Shows timestamp

**Status:** ☐ Pass ☐ Fail

---

### TC-7.2: Switch Between Conversations
**Steps:**
1. Have 2+ conversations
2. Switch between them

**Expected:**
- Correct messages load for each conversation
- No message mixing between conversations
- Smooth transition

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 8: Backend API Endpoints

### TC-8.1: GET /api/chat/conversations
**Test:**
```bash
curl http://localhost:3000/api/chat/conversations
```

**Expected:**
- Returns array of conversations
- Each has: id, userId, createdAt, updatedAt
- Status 200

**Status:** ☐ Pass ☐ Fail

---

### TC-8.2: GET /api/chat/conversations/:id
**Test:**
```bash
curl http://localhost:3000/api/chat/conversations/{conversation-id}
```

**Expected:**
- Returns array of messages
- Each has: id, role, content, createdAt
- Ordered by createdAt ASC
- Status 200

**Status:** ☐ Pass ☐ Fail

---

### TC-8.3: POST /api/chat/conversations
**Test:**
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json"
```

**Expected:**
- Creates new conversation
- Returns conversation object with id
- Status 200

**Status:** ☐ Pass ☐ Fail

---

### TC-8.4: POST /api/chat/messages
**Test:**
```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "xxx", "message": "Hello"}'
```

**Expected:**
- Streams response (Transfer-Encoding: chunked)
- Includes text stream
- Includes intent data
- Status 200

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 9: Database Integration

### TC-9.1: Message Persistence
**Steps:**
1. Send a message
2. Check database directly

**Expected:**
- User message saved with role='user'
- Assistant message saved with role='assistant'
- Both linked to correct conversationId
- Timestamps are accurate

**Status:** ☐ Pass ☐ Fail

---

### TC-9.2: Conversation Creation
**Steps:**
1. Create new conversation via API
2. Check database

**Expected:**
- New row in Conversation table
- userId is set correctly
- createdAt and updatedAt are set

**Status:** ☐ Pass ☐ Fail

---

## Test Suite 10: Performance & Scalability

### TC-10.1: Response Time
**Steps:**
1. Send 5 different messages
2. Measure time to first token

**Expected:**
- First token appears within 2-3 seconds
- Consistent performance across messages

**Status:** ☐ Pass ☐ Fail

**Measurements:**
```
Message 1: ___ seconds
Message 2: ___ seconds
Message 3: ___ seconds
Message 4: ___ seconds
Message 5: ___ seconds
Average: ___ seconds
```

---

### TC-10.2: Long Conversation Handling
**Steps:**
1. Create conversation with 50+ messages
2. Load the conversation
3. Send a new message

**Expected:**
- Page loads without lag
- Scrolling is smooth
- New message processes normally

**Status:** ☐ Pass ☐ Fail

---

## Critical Issues Log

| Issue # | Severity | Description | Status |
|---------|----------|-------------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Severity Levels:**
- 🔴 Critical: Blocks core functionality
- 🟡 High: Major feature broken
- 🟢 Medium: Minor issue
- ⚪ Low: Cosmetic/enhancement

---

## Overall Test Summary

**Total Test Cases:** 31
**Passed:** ___
**Failed:** ___
**Blocked:** ___
**Pass Rate:** ___%

**Tested By:** _______________
**Date:** _______________
**Environment:** Development
**Backend Version:** ai@3.2.0
**Frontend Version:** ai@3.2.0

---

## Notes & Observations

```
Add any additional observations, bugs found, or suggestions here:




```
