# KiroTutor - Quick Start Guide

## Option 1: Run the Demo (Fastest - 2 minutes)

The frontend works with mock data and doesn't require backend/database setup.

```bash
# Install frontend dependencies
cd frontend
npm install

# Start frontend only
npm run dev
```

Then open http://localhost:5173

**Demo Credentials:**
- Student: Any email/password (e.g., `student@demo.com` / `password`)
- Professor: Any email/password (e.g., `prof@demo.com` / `password`)

The demo uses mock data showing a complete MIT lecture with study kit, Q&A, and confusion map.

## Option 2: Full Setup (30 minutes)

For a complete working system with AWS integration:

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- AWS Account with:
  - S3 bucket created
  - Bedrock access enabled (Claude 3.5 Sonnet)
  - Transcribe access
  - IAM credentials

### Setup Steps

1. **Install All Dependencies**
```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Database Setup**
```bash
# Create database
createdb kirotutor

# Load schema
psql kirotutor < backend/src/db/schema.sql
```

3. **Configure Environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your AWS credentials and database info
```

4. **Start Everything**
```bash
# From root directory
npm run dev
```

Backend: http://localhost:3000
Frontend: http://localhost:5173

## Demo Features

### Student Flow
1. **Login** as student
2. **View Lecture** - See pre-loaded MIT algorithms lecture
3. **Study Kit** - Summary, takeaways, practice questions, glossary
4. **Ask Questions** - Interactive chat with timestamp links
5. **Timestamp Jumping** - Click timestamps to see where concepts are explained

### Professor Flow
1. **Login** as professor
2. **Dashboard** - Overview of lectures and question stats
3. **Confusion Map** - Visual heatmap showing question density
4. **Hot Zones** - Click red zones (12:30, 28:45) to see actual questions
5. **Generate Recap** - AI-powered 5-minute script for next class

## Kiro Integration Showcase

Located in `.kiro/` directory:

1. **spec.md** - Complete requirements → design → tasks
2. **steering/stack.md** - TypeScript + AWS SDK v3 best practices
3. **hooks/** - Agent automation (API docs, type checking)
4. **settings/mcp.json** - AWS documentation MCP server

## Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Mock data not showing
- Refresh the page
- Clear browser local storage
- Try incognito mode

## Next Steps

For presentation:
- Open PRESENTATION.md for 5-minute demo script
- Focus on Confusion Map (the differentiator)
- Highlight Kiro integration (spec, steering, hooks)
- Show code quality (TypeScript, AWS SDK v3 patterns)

Good luck! 🚀
