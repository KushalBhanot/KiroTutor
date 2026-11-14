# KiroTutor - AI-Powered Lecture Comprehension Platform

**Built with Kiro for hackathons and competitions**

KiroTutor is a comprehensive platform that helps students learn from recorded lectures while giving professors actionable insights into where their class struggles. Students upload lecture videos, receive AI-generated study materials, and can ask questions tied to specific timestamps. Professors see a "Confusion Map" heatmap showing which lecture moments generated the most questions, plus AI-drafted recap suggestions.

## 🎯 The Problem

- Students struggle with dense lecture content and don't know what to review
- Professors teach entire classes but don't know which specific moments confused students
- Traditional Q&A happens after class, disconnected from the lecture timeline
- Students miss critical concepts but can't pinpoint exactly where

## 💡 Our Solution

**Track 1: AI Study Kit Generator**
- Upload lecture video/audio
- Get automated transcription with timestamps
- Receive AI-generated summary, key takeaways, practice questions, and glossary

**Track 2: Timestamp-Aware Q&A Chat**
- Ask questions about the lecture
- Get contextual answers from Claude 3.5 Sonnet
- Each question is linked to lecture timestamp
- Build searchable knowledge base

**Track 3: Professor "Confusion Map" Dashboard**
- Visualize question density across lecture timeline
- See heatmap of confusion hotspots
- Drill down to actual student questions
- Generate AI-powered 5-minute recap script for next class

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Backend API (Express + TypeScript)
    ↓
┌─────────────┬──────────────┬─────────────┐
│   AWS S3    │  Transcribe  │  Bedrock    │
│   Storage   │  Speech→Text │  Claude AI  │
└─────────────┴──────────────┴─────────────┘
    ↓
PostgreSQL Database
```

### Tech Stack

**Backend:**
- Node.js 20 + Express + TypeScript
- AWS SDK v3 (S3, Transcribe, Bedrock)
- PostgreSQL with pg driver
- JWT authentication
- Multer for file uploads

**Frontend:**
- React 18 + TypeScript
- TailwindCSS for styling
- Recharts for confusion map visualization
- Axios for API calls

**AWS Services:**
- **S3**: Lecture file storage
- **Transcribe**: Audio/video → text with timestamps
- **Bedrock**: Claude 3.5 Sonnet for study kits, Q&A, and recaps

## 🎓 Kiro Integration (Hackathon Scoring)

This project demonstrates best practices for Kiro-powered development:

### ✅ Spec-Driven Development
- Complete specification in `.kiro/spec.md`
- Requirements → Design → Tasks workflow
- Committed to repository for demo

### ✅ Steering Documentation
- Stack guidelines in `.kiro/steering/stack.md`
- TypeScript + AWS SDK v3 patterns
- Automatically loaded in Kiro sessions

### ✅ Agent Hooks
1. **API Documentation Generator**: Auto-regenerates docs on route file saves
2. **Pre-Task Type Check**: Runs TypeScript checks before spec tasks
3. **Coding Standards Reminder**: Loads best practices on session start

### ✅ MCP Integration
- AWS Documentation MCP server configured
- Provides up-to-date Bedrock and Transcribe documentation
- Config in `.kiro/settings/mcp.json`

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- AWS Account with Bedrock access
- Python 3.9+ (for MCP server)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KushalBhanot/KiroTutor.git
cd KiroTutor
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. **Set up database**
```bash
# Create PostgreSQL database
createdb kirotutor

# Run schema
psql kirotutor < backend/src/db/schema.sql
```

4. **Configure environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your AWS credentials and database info
```

5. **Start development servers**
```bash
# From root directory
npm run dev
```

Backend runs on http://localhost:3000
Frontend runs on http://localhost:5173

## 📊 Demo Preparation

### Pre-Generate Demo Data

We pre-transcribed 2 MIT OpenCourseWare lectures and seeded 30+ sample questions to create realistic confusion patterns:

```bash
# Run demo data seeding script
node backend/scripts/seed-demo-data.js
```

Lectures used:
1. **MIT 6.006 - Introduction to Algorithms** (45 minutes)
2. **MIT 18.01 - Single Variable Calculus** (50 minutes)

Sample questions distributed across:
- Introduction sections (minutes 0-5): Low confusion
- Complex concept sections (minutes 12-18, 28-35): High confusion
- Summary sections (minutes 40+): Medium confusion

### 3-Minute Demo Script

**[0:00-0:30] Problem Setup**
- "Students struggle with lectures, professors don't know where"
- Show MIT lecture upload interface

**[0:30-1:00] Track 1: Study Kit**
- Upload completes → show transcription status
- Display generated study kit: summary, takeaways, questions, glossary

**[1:00-1:30] Track 2: Q&A Chat**
- Student asks "What is the time complexity of merge sort?"
- Answer appears with timestamp reference
- Click timestamp → jump to lecture moment

**[1:30-2:15] Track 3: Confusion Map (The Differentiator)**
- Switch to professor view
- Show heatmap with red zones at 12:30 and 28:45
- "These are the exact minutes students got lost"
- Click hotspot → see actual questions

**[2:15-2:45] AI Recap Generation**
- Click "Generate Recap"
- Show 5-minute script: "Let's revisit merge sort complexity..."
- "Professor opens next class with this"

**[2:45-3:00] Kiro Integration**
- Show `.kiro/` folder structure
- Highlight spec, steering, hooks
- "Built entirely with Kiro spec-driven development"

## 🎯 Competition Alignment

### Matches Winning Patterns

✅ **Helps specific people with specific problems**
- Students: Can't identify what to review
- Professors: Don't know where class struggles

✅ **Demonstrates Kiro usage**
- Spec-driven development
- Steering documentation
- Agent hooks
- MCP integration

✅ **Serves two user types**
- Most teams will demo student-only tools
- We serve students AND professors
- Confusion Map is the differentiator

✅ **AWS Service Integration**
- S3 for storage
- Transcribe for speech-to-text
- Bedrock for AI generation
- Proper SDK v3 patterns

### Scoring Rubric (Kiroween 2026)

| Criteria | How We Address It | Weight |
|----------|------------------|--------|
| **Potential Impact** | Improves learning outcomes + professor effectiveness | 20% |
| **Technical Implementation with Kiro** | Full spec, steering, hooks, MCP | 20% |
| **Design** | Clean UI, clear user flows, confusion map visualization | 20% |
| **Innovation and Idea** | Timestamp-linked Q&A + confusion analytics | 20% |
| **Presentation** | 3-min demo with pre-seeded data, clear problem/solution | 20% |

## 📁 Project Structure

```
KiroTutor/
├── .kiro/
│   ├── spec.md                    # Full project specification
│   ├── steering/
│   │   └── stack.md               # TypeScript + AWS patterns
│   ├── settings/
│   │   └── mcp.json               # AWS docs MCP server
│   └── hooks/
│       ├── api-docs-generator.json
│       ├── pre-task-typecheck.json
│       └── coding-standards-reminder.json
├── backend/
│   ├── src/
│   │   ├── routes/                # Express API routes
│   │   ├── services/              # AWS service wrappers
│   │   ├── middleware/            # Auth, error handling
│   │   ├── models/                # TypeScript types
│   │   └── db/                    # Database connection, schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API client
│   │   └── hooks/                 # Custom React hooks
│   └── package.json
└── README.md
```

## 🔐 Security

- JWT-based authentication
- AWS IAM roles for service access
- Rate limiting on API endpoints
- File type validation on uploads
- SQL injection protection with parameterized queries
- Presigned URLs for S3 access

## 🚀 Future Enhancements

- **Multi-language Support**: Amazon Translate for international students
- **Team Study Sessions**: Collaborative Q&A with classmates
- **Spaced Repetition**: AI-generated flashcards from lecture content
- **LMS Integration**: Canvas, Blackboard, Moodle connectors
- **Mobile Apps**: React Native for iOS and Android
- **Live Lecture Mode**: Real-time transcription and Q&A during class

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token

### Lectures (Student & Professor)
- `POST /api/lectures` - Upload lecture file
- `GET /api/lectures/:id` - Get lecture details
- `GET /api/lectures/:id/status` - Check transcription status
- `GET /api/lectures/:id/studykit` - Get generated study kit

### Chat (Student)
- `POST /api/chat/:lectureId` - Ask a question
- `GET /api/chat/:lectureId/history` - Get chat history

### Professor Dashboard
- `GET /api/professor/confusion-map/:lectureId` - Get heatmap data
- `GET /api/professor/questions/:lectureId` - Get all questions
- `POST /api/professor/recap/:lectureId` - Generate recap script

## 🤝 Contributing

This project was built for hackathon/competition purposes. For educational or research use:

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and AWS best practices in `.kiro/steering/stack.md`
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **MIT OpenCourseWare**: Demo lecture content
- **Anthropic**: Claude 3.5 Sonnet via AWS Bedrock
- **AWS**: S3, Transcribe, and Bedrock services
- **Kiro**: Spec-driven development platform

## 📧 Contact

**Kushal Bhanot**
- GitHub: [@KushalBhanot](https://github.com/KushalBhanot)
- Project: [KiroTutor](https://github.com/KushalBhanot/KiroTutor)

---

**Built with ❤️ using Kiro for hackathons**

*Standing out by serving both students and professors with timestamp-aware learning analytics*
