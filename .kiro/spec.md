# KiroTutor: AI-Powered Lecture Comprehension Platform

## Overview
KiroTutor is a unified platform that helps students learn from recorded lectures while giving professors visibility into where their class struggles. Students upload lecture videos/audio, receive AI-generated study materials, and can ask questions tied to specific timestamps. Professors see a "Confusion Map" heatmap showing which lecture moments generated the most questions, plus AI-drafted recap suggestions.

## Requirements

### Track 1: Study Kit Generation
- **Input**: Lecture video or audio file uploaded by student
- **Processing**:
  - Upload to S3
  - Transcribe using Amazon Transcribe with timestamp data
  - Generate study materials using Amazon Bedrock (Claude 3.5 Sonnet):
    - Summary (key concepts, main topics)
    - Key takeaways (bullet points)
    - Practice questions (5-10 questions)
    - Glossary of terms
- **Output**: Downloadable study kit PDF + interactive web view

### Track 2: Interactive Q&A Chat
- **Input**: Student questions about the lecture
- **Processing**:
  - RAG-based chat using lecture transcript with timestamps
  - Bedrock generates contextual answers
  - Each Q&A is linked to relevant lecture timestamp(s)
  - Store questions with timestamps for analytics
- **Output**: Conversational answers with timestamp references

### Track 3: Professor Dashboard (Confusion Map)
- **Input**: Aggregated student questions from all study sessions
- **Visualization**:
  - Timeline heatmap showing question density per lecture minute
  - Color-coded intensity (more questions = more confusion)
  - Click timestamps to see actual questions
- **AI Assistance**:
  - Bedrock analyzes confusion patterns
  - Generates 5-minute recap script for next class
  - Suggests which topics need re-explanation
- **Output**: Interactive dashboard + downloadable recap notes

### Cross-Cutting Requirements
- User authentication (students vs professors)
- Lecture management (upload, list, share)
- Privacy: students can opt-in/out of question analytics
- Mobile-responsive UI
- AWS-hosted (S3, Lambda/ECS, RDS/DynamoDB)

## Design

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Student View │  │   Chat UI    │  │ Prof Dashboard│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────┴────────────────────────────────┐
│                    Backend (Express + TypeScript)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Upload Service│  │  Chat Service │  │Analytics Svc  │     │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
     ┌────┴────┐        ┌────┴────┐       ┌────┴────┐
     │   S3    │        │ Bedrock │       │   RDS   │
     └────┬────┘        └─────────┘       └─────────┘
          │
     ┌────┴────────┐
     │  Transcribe │
     └─────────────┘
```

### Data Models

**Lecture**
- id, title, course_name, professor_id
- s3_url (original file)
- transcript_s3_url, transcript (JSON with timestamps)
- created_at, duration_seconds

**StudyKit**
- id, lecture_id
- summary, takeaways (JSON array)
- questions (JSON array)
- glossary (JSON object)
- generated_at

**Question**
- id, lecture_id, student_id
- question_text, answer_text
- timestamp_seconds (which part of lecture)
- created_at

**User**
- id, email, name, role (student/professor)
- created_at

### Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS, Recharts (for heatmap)
- **Backend**: Node.js 20, Express, TypeScript, AWS SDK v3
- **Database**: PostgreSQL on RDS (or DynamoDB if preferred)
- **AWS Services**: S3, Transcribe, Bedrock (Claude 3.5 Sonnet), Lambda/ECS
- **MCP**: AWS documentation MCP server for Bedrock/Transcribe reference

### Key Flows

**Student Flow**:
1. Upload lecture → S3 → Transcribe job started
2. Poll for transcribe completion
3. Bedrock generates study kit
4. Student views kit, clicks "Ask Questions"
5. Chat interface loads with lecture context
6. Questions answered with timestamp links

**Professor Flow**:
1. View course dashboard
2. Select lecture to see confusion map
3. Heatmap shows question density per 30-second window
4. Click hot zones to see questions
5. Click "Generate Recap" for AI-drafted 5-min script

## Tasks

### Setup & Infrastructure
- [ ] Initialize TypeScript monorepo (backend + frontend)
- [ ] Set up AWS credentials and IAM roles
- [ ] Configure S3 buckets (lectures, transcripts)
- [ ] Set up RDS PostgreSQL database
- [ ] Create database schema and migrations
- [ ] Configure Bedrock access (Claude 3.5 Sonnet)
- [ ] Set up environment variables management

### Backend API
- [ ] Implement user authentication (JWT-based)
- [ ] Create lecture upload endpoint (multipart → S3)
- [ ] Implement Transcribe job initiation and webhook
- [ ] Build study kit generation service (Bedrock integration)
- [ ] Create chat endpoint with RAG (timestamp-aware)
- [ ] Store questions with timestamps
- [ ] Build analytics aggregation for confusion map
- [ ] Implement professor dashboard API
- [ ] Create recap generation endpoint

### Frontend - Student View
- [ ] Build lecture upload UI with progress indicator
- [ ] Create study kit display page
- [ ] Implement chat interface with timestamp links
- [ ] Add video/audio player with seek-to-timestamp
- [ ] Create student dashboard (my lectures)

### Frontend - Professor View
- [ ] Build course and lecture management UI
- [ ] Create confusion map heatmap visualization
- [ ] Implement question drill-down interface
- [ ] Add recap generation UI
- [ ] Build professor dashboard overview

### Kiro-Specific Features (for scoring)
- [ ] Write `.kiro/steering/stack.md` (TypeScript + AWS SDK v3 patterns)
- [ ] Add MCP server config for AWS documentation
- [ ] Create hook: auto-regenerate API docs on file save
- [ ] Create hook: run type checks before commits
- [ ] Document all Kiro usage in README

### Demo Preparation
- [ ] Pre-transcribe 2 MIT OpenCourseWare lectures
- [ ] Seed database with 30+ sample questions across timestamps
- [ ] Create demo script highlighting confusion map
- [ ] Record 3-minute demo video
- [ ] Prepare slides showing spec-driven development

### Testing & Documentation
- [ ] Write unit tests for core services
- [ ] Test end-to-end student flow
- [ ] Test end-to-end professor flow
- [ ] Document API endpoints
- [ ] Write deployment instructions
- [ ] Create README with architecture diagram

## Success Metrics
- Students can go from upload → study kit in < 5 minutes (after transcription)
- Chat answers reference specific lecture timestamps
- Confusion map clearly shows question density patterns
- Professor recap generation takes < 30 seconds
- All AWS services integrated correctly
- Kiro spec, steering, and hooks visible in demo

## Demo Script (3 minutes)
1. **[0:00-0:30]** Problem: Students struggle with dense lectures, professors don't know where
2. **[0:30-1:00]** Show student uploading lecture → instant study kit
3. **[1:00-1:30]** Student asks questions → answers with timestamps
4. **[1:30-2:15]** Professor views confusion map → red zones at 12:30 and 28:45
5. **[2:15-2:45]** Professor clicks "Generate Recap" → instant 5-min script
6. **[2:45-3:00]** Show `.kiro` folder with spec, steering, hooks → "Built with Kiro"

## Future Enhancements
- Multi-language support (Amazon Translate)
- Team study sessions (collaborative Q&A)
- Spaced repetition flashcards
- Integration with LMS (Canvas, Blackboard)
- Mobile apps (React Native)
