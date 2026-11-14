# KiroTutor Demo Guide

## Pre-Demo Checklist

### 1. Environment Setup (1 day before)
- [ ] AWS credentials configured (S3, Transcribe, Bedrock access)
- [ ] PostgreSQL database running and schema loaded
- [ ] Backend `.env` file configured with all credentials
- [ ] Dependencies installed (`npm install` in root, backend, frontend)
- [ ] MCP AWS docs server installed (`uv` and `uvx` available)

### 2. Pre-Transcribe Demo Lectures (1 day before)

**Why:** Amazon Transcribe jobs take 5-10 minutes. Pre-transcribing ensures smooth demo.

**Recommended Lectures:**
1. MIT 6.006 - Introduction to Algorithms (Lecture 1: Algorithmic Thinking)
   - Duration: ~45 minutes
   - URL: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/
   
2. MIT 18.01 - Single Variable Calculus (Lecture 1: Derivatives)
   - Duration: ~50 minutes
   - URL: https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/

**Steps:**
```bash
# Start backend
cd backend
npm run dev

# Use API or create admin script to:
# 1. Upload both lectures
# 2. Wait for transcription (check /api/lectures/:id/status)
# 3. Verify study kits generated
```

### 3. Seed Sample Questions (Day of demo)

**Goal:** Create realistic confusion patterns in the heatmap

**Distribution Strategy:**
- Minutes 0-5 (Introduction): 3-5 questions (low confusion)
- Minutes 12-18 (Complex concept #1): 15-20 questions (HIGH confusion - red zone)
- Minutes 22-27 (Transition): 3-5 questions
- Minutes 28-35 (Complex concept #2): 12-15 questions (HIGH confusion - red zone)
- Minutes 40-45 (Summary): 5-8 questions (medium confusion)

**Sample Questions for Algorithms Lecture:**

Timestamp 12:30-18:00 (Merge Sort Complexity):
- "What is the time complexity of merge sort?"
- "Why is merge sort O(n log n) and not O(n²)?"
- "Can someone explain the recursion tree for merge sort?"
- "How do we calculate the depth of the recursion?"
- "Is merge sort always better than insertion sort?"
- "What's the space complexity of merge sort?"
- "Why does merge sort use extra space?"
- "Can merge sort be done in-place?"

Timestamp 28:45-35:00 (Heaps and Priority Queues):
- "What's the difference between a heap and a binary search tree?"
- "How does heapify work?"
- "Why is heap insertion O(log n)?"
- "Can you build a heap in linear time?"
- "How do priority queues use heaps?"
- "What's the min-heap vs max-heap difference?"
- "When would I use a heap in real applications?"

**Create Seed Script:** `backend/scripts/seed-questions.ts`

```typescript
import { pool } from '../src/db/connection';

const questions = [
  { lecture_id: 'UUID', timestamp: 750, text: "What is the time complexity..." },
  // ... more questions
];

async function seed() {
  for (const q of questions) {
    await pool.query(
      'INSERT INTO questions (lecture_id, student_id, question_text, answer_text, timestamp_seconds, allow_analytics) VALUES ($1, $2, $3, $4, $5, true)',
      [q.lecture_id, 'student-uuid', q.text, 'AI generated answer', q.timestamp]
    );
  }
}

seed();
```

### 4. Test Full User Flow (Morning of demo)

**Student Flow:**
1. Register as student
2. Login
3. See pre-uploaded lecture
4. View study kit (summary, takeaways, questions, glossary)
5. Click "Ask Questions"
6. Ask 1-2 questions and get responses with timestamps
7. Click timestamp link to verify it highlights correct moment

**Professor Flow:**
1. Register as professor (or use existing account)
2. Login to professor dashboard
3. Click "View Confusion Map" for Algorithms lecture
4. Verify heatmap shows red zones at 12:30 and 28:45
5. Click red zone to see actual questions
6. Click "Generate Recap"
7. Review 5-minute recap script

## 3-Minute Demo Script

### Opening (0:00-0:30) - Problem Setup
**Say:**
> "Students struggle with dense lecture content, but professors don't know which specific moments confused them. Traditional Q&A happens after class, disconnected from the timeline. We built KiroTutor to solve both problems at once."

**Show:**
- Landing page briefly
- Quick login as student

### Track 1 (0:30-1:00) - Study Kit Generation
**Say:**
> "Students upload a lecture - this is MIT's Introduction to Algorithms. Within minutes after transcription, they get an AI-generated study kit."

**Show:**
- Click on pre-loaded MIT lecture
- Display study kit page:
  - **Summary** (2-3 paragraphs) - scroll briefly
  - **Key Takeaways** (7 bullet points) - highlight
  - **Practice Questions** (8 questions) - show variety
  - **Glossary** (10 terms) - quick glance

### Track 2 (1:00-1:30) - Timestamp-Aware Q&A
**Say:**
> "Now the student can ask questions. Notice what happens when they do."

**Show:**
- Click "Ask Questions" button
- Type: "What is the time complexity of merge sort and why?"
- AI answer appears
- **HIGHLIGHT:** "The answer references timestamp 14:35 - click it"
- Video/audio player jumps to that moment
- **Say:** "Every question is linked to the exact lecture moment."

### Track 3 (1:30-2:15) - Confusion Map (THE DIFFERENTIATOR)
**Say:**
> "Now here's where it gets interesting for professors. They see the Confusion Map."

**Show:**
- Switch to professor account (or have it open in second tab)
- Click "Confusion Map" for the lecture
- **Display heatmap visualization:**
  - Timeline across bottom (0:00 to 45:00)
  - Vertical bars showing question density
  - **Two obvious red zones at 12:30 and 28:45**
  
**Say:**
> "These red zones are the exact minutes where students got lost. The professor can click in to see actual questions."

**Show:**
- Click on 12:30 red zone
- Questions appear: "What is time complexity of merge sort?", "Why O(n log n)?"
- Click on 28:45 red zone
- Questions appear: "What's a heap?", "How does heapify work?"

### Track 3 Continued (2:15-2:45) - AI Recap Generation
**Say:**
> "Based on these confusion patterns, the professor can generate an AI-powered recap for the next class."

**Show:**
- Click "Generate Recap" button
- Loading... (2-3 seconds)
- Display recap script (scroll slowly):

> "Good morning! Before we move forward, I want to revisit two concepts from last lecture. Many of you had questions about merge sort's time complexity. Let me explain the recursion tree differently..."
> 
> [5-minute script with clear explanations]
>
> "Now for heaps - I realize the distinction between heaps and BSTs wasn't clear. Here's a better analogy..."

**Say:**
> "The professor opens next class with this 5-minute recap, targeting exactly where students struggled."

### Closing (2:45-3:00) - Kiro Integration
**Say:**
> "We built this entirely with Kiro using spec-driven development."

**Show:**
- Show `.kiro/` folder structure:
  - `spec.md` - "Full requirements, design, and tasks"
  - `steering/stack.md` - "TypeScript and AWS best practices"
  - `hooks/` - "Agent automation"
  - `settings/mcp.json` - "AWS docs integration"

**Say:**
> "The spec, steering docs, hooks, and MCP integration demonstrate best practices for Kiro-powered development. Most teams will demo student-only tools. We serve both students AND professors, with the confusion map as our differentiator."

## Backup Plans

### If Bedrock API is Slow
- Have screenshots of study kit pre-generated
- Have recap script pre-generated in a text file
- "In production this takes 10-30 seconds, but here's what it generates..."

### If Video/Audio Player Doesn't Load
- Skip the timestamp-clicking demo
- Focus on showing the timestamp number in the answer
- "In the full app, clicking this jumps to 14:35 in the video"

### If Heatmap Doesn't Render
- Have a screenshot of the confusion map
- "Here's the heatmap - you can see the red zones at 12:30 and 28:45"

### If Database is Down
- Have a video recording of the entire flow
- "Let me show you a recording of the full flow..."

## Post-Demo Q&A Prep

**Expected Questions:**

**Q: "How accurate is the transcription?"**
A: "Amazon Transcribe achieves 90-95% accuracy on clear audio. We chose it because it provides word-level timestamps, which are critical for our confusion map."

**Q: "What if students ask off-topic questions?"**
A: "Claude's prompt includes the full transcript as context, so it stays grounded in lecture content. We could add a relevance filter in production."

**Q: "How do you handle privacy?"**
A: "Students can opt out of analytics - their questions won't appear in the professor's confusion map. We also anonymize all data shown to professors."

**Q: "Can this scale to 500-student classes?"**
A: "Yes - the confusion map actually becomes MORE valuable with more data. We use PostgreSQL indexes on timestamp_seconds and lecture_id for fast aggregation."

**Q: "How much does this cost to run?"**
A: 
- Transcribe: $0.024/minute ($1.20 for 50-min lecture)
- Bedrock: ~$3 per study kit + $0.10 per Q&A
- S3: $0.023/GB storage
- For a 500-student class with 10 lectures: ~$200/semester

**Q: "Why is this better than just using ChatGPT?"**
A: "Three reasons: 1) Timestamp linking lets students jump to exact moments, 2) The confusion map gives professors actionable insights, 3) It's purpose-built for education, not general Q&A."

## Technical Implementation Highlights (For Judges)

### AWS Integration
- **S3**: Lecture storage with presigned URLs
- **Transcribe**: Speech-to-text with word-level timestamps (Settings.ShowSpeakerLabels)
- **Bedrock**: Claude 3.5 Sonnet via InvokeModelCommand with proper payload structure

### Kiro Features
- **Spec**: Complete requirements → design → tasks workflow
- **Steering**: Stack-specific best practices (AWS SDK v3 patterns)
- **Hooks**: 
  - PostFileSave → regenerate API docs
  - PreTaskExec → TypeScript type checking
  - SessionStart → coding standards reminder
- **MCP**: AWS docs for up-to-date Bedrock/Transcribe documentation

### Database Design
- PostgreSQL with proper indexing on `timestamp_seconds`
- `allow_analytics` boolean for privacy control
- JSONB columns for flexible transcript and study kit storage

### TypeScript Best Practices
- Strict mode enabled
- Explicit return types on all functions
- Proper error handling with custom error classes
- Parameterized SQL queries for injection prevention

## Day-of Timeline

### 2 Hours Before
- [ ] Start PostgreSQL
- [ ] Start backend server (`npm run dev`)
- [ ] Verify both pre-transcribed lectures appear
- [ ] Check heatmap renders correctly
- [ ] Test recap generation (takes 20-30 seconds)

### 1 Hour Before
- [ ] Open professor dashboard in one browser window
- [ ] Open student dashboard in another window
- [ ] Have `.kiro/` folder open in IDE
- [ ] Have backup screenshots ready
- [ ] Run through demo once more

### 15 Minutes Before
- [ ] Close unnecessary tabs/apps
- [ ] Increase font size in browser and IDE
- [ ] Test microphone and screen sharing
- [ ] Have demo script open in notes

## Success Metrics

**You've nailed the demo if:**
- ✅ Heatmap shows clear red zones
- ✅ Clicking timestamp jumps to lecture moment
- ✅ Recap script is coherent and on-topic
- ✅ Judges say "Oh, that's different from others"
- ✅ You show `.kiro/` folder at the end

**Scoring Alignment:**
- **Potential Impact** (20%): Helps students learn + professors teach better
- **Technical Implementation** (20%): AWS services + Kiro features
- **Design** (20%): Clean UI + clear confusion map
- **Innovation** (20%): Timestamp linking + confusion analytics
- **Presentation** (20%): Clear problem/solution, good demo flow

Good luck! 🎓🚀
