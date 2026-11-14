# KiroTutor Stack Guidelines

This document defines the coding standards, patterns, and AWS best practices for the KiroTutor project.

## TypeScript Standards

### General Rules
- Use strict mode (`"strict": true` in tsconfig.json)
- Prefer `const` over `let`, avoid `var`
- Use explicit return types on functions
- Enable ESLint with TypeScript rules
- Use Prettier for consistent formatting

### Naming Conventions
- PascalCase for types, interfaces, classes: `LectureService`, `UserData`
- camelCase for variables, functions: `uploadLecture`, `userId`
- UPPER_SNAKE_CASE for constants: `MAX_FILE_SIZE`, `API_BASE_URL`
- Prefix interfaces with descriptive nouns (no 'I' prefix): `User`, `LectureMetadata`

### Code Organization
```typescript
// File structure for services
export class LectureService {
  constructor(
    private s3Client: S3Client,
    private transcribeClient: TranscribeClient
  ) {}

  async uploadLecture(file: Express.Multer.File): Promise<LectureUploadResult> {
    // Implementation
  }
}
```

### Error Handling
```typescript
// Custom error classes
export class TranscriptionError extends Error {
  constructor(message: string, public jobName: string) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

// Use try-catch with typed errors
try {
  await transcribeService.startJob(lectureId);
} catch (error) {
  if (error instanceof TranscriptionError) {
    // Handle transcription-specific error
  }
  throw error;
}
```

## AWS SDK v3 Patterns

### Client Initialization
```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { TranscribeClient } from '@aws-sdk/client-transcribe';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// Create clients once, reuse across requests
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
```

### S3 Operations
```typescript
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Upload file
const uploadCommand = new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: `lectures/${lectureId}/${file.originalname}`,
  Body: file.buffer,
  ContentType: file.mimetype,
});
await s3Client.send(uploadCommand);

// Generate presigned URL
const getCommand = new GetObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME,
  Key: `lectures/${lectureId}/file.mp4`,
});
const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
```

### Amazon Transcribe
```typescript
import { 
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand 
} from '@aws-sdk/client-transcribe';

// Start transcription with timestamps
const startCommand = new StartTranscriptionJobCommand({
  TranscriptionJobName: `lecture-${lectureId}-${Date.now()}`,
  LanguageCode: 'en-US',
  MediaFormat: 'mp4',
  Media: {
    MediaFileUri: s3Uri,
  },
  OutputBucketName: process.env.S3_BUCKET_NAME,
  OutputKey: `transcripts/${lectureId}/`,
  Settings: {
    ShowSpeakerLabels: true,
    MaxSpeakerLabels: 2,
  },
});

const { TranscriptionJob } = await transcribeClient.send(startCommand);
```

### Amazon Bedrock (Claude 3.5 Sonnet)
```typescript
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const invokeCommand = new InvokeModelCommand({
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  contentType: 'application/json',
  accept: 'application/json',
  body: JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  }),
});

const response = await bedrockClient.send(invokeCommand);
const responseBody = JSON.parse(new TextDecoder().decode(response.body));
const assistantMessage = responseBody.content[0].text;
```

## Database Patterns

### Connection Management
```typescript
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Query Pattern
```typescript
// Use parameterized queries
async function getLecture(lectureId: string): Promise<Lecture | null> {
  const result = await pool.query(
    'SELECT * FROM lectures WHERE id = $1',
    [lectureId]
  );
  return result.rows[0] || null;
}
```

## API Design

### RESTful Endpoints
```
POST   /api/lectures              - Upload lecture
GET    /api/lectures/:id          - Get lecture details
GET    /api/lectures/:id/studykit - Get generated study kit
POST   /api/lectures/:id/chat     - Ask question about lecture
GET    /api/lectures/:id/questions - Get all questions for lecture
GET    /api/professor/confusion-map/:lectureId - Get heatmap data
POST   /api/professor/recap/:lectureId - Generate recap
```

### Response Format
```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Express handler pattern
app.post('/api/lectures', async (req, res) => {
  try {
    const result = await lectureService.upload(req.file);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: error.message,
      },
    });
  }
});
```

## Environment Variables

Required variables in `.env`:
```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=kirotutor-lectures

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kirotutor
DB_USER=postgres
DB_PASSWORD=your_password

# Application
PORT=3000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Testing

### Unit Tests
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('LectureService', () => {
  it('should upload lecture to S3', async () => {
    const mockS3Client = {
      send: vi.fn().mockResolvedValue({}),
    };
    
    const service = new LectureService(mockS3Client as any);
    await expect(service.uploadLecture(mockFile)).resolves.toBeDefined();
  });
});
```

## Performance

- Cache Bedrock responses for identical prompts (1 hour TTL)
- Use connection pooling for database
- Stream large S3 files instead of loading into memory
- Implement pagination for question lists (100 per page)
- Use indexes on `lecture_id` and `timestamp_seconds` columns

## Security

- Validate file uploads (max 500MB, allowed types: mp4, mp3, wav)
- Sanitize user inputs before database queries
- Use presigned URLs with expiration for S3 access
- Implement rate limiting (10 requests/minute per user)
- Store JWT secrets in AWS Secrets Manager (production)
- Never commit `.env` files

## Monitoring

- Log all AWS API calls with request IDs
- Track transcription job failures
- Monitor Bedrock token usage
- Set up CloudWatch alarms for Lambda errors
- Log slow database queries (>1 second)
