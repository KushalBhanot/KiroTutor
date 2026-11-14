import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { bedrockClient, BEDROCK_MODEL_ID } from './aws-clients';
import { BedrockRequest, BedrockResponse } from '../models/types';

export class BedrockService {
  /**
   * Invoke Claude 3.5 Sonnet via Bedrock
   */
  async invoke(request: BedrockRequest): Promise<BedrockResponse> {
    const {
      prompt,
      max_tokens = 4096,
      temperature = 0.7,
    } = request;

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    try {
      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content: responseBody.content[0].text,
        model_id: BEDROCK_MODEL_ID,
        usage: {
          input_tokens: responseBody.usage.input_tokens,
          output_tokens: responseBody.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Bedrock invocation error:', error);
      throw new Error(`Failed to invoke Bedrock: ${error}`);
    }
  }

  /**
   * Generate study kit from transcript
   */
  async generateStudyKit(transcript: string, lectureTitle: string): Promise<{
    summary: string;
    takeaways: string[];
    questions: Array<{ question: string; answer: string; type: string; options?: string[] }>;
    glossary: Record<string, string>;
  }> {
    const prompt = `You are an educational AI assistant. Analyze this lecture transcript and create a comprehensive study kit.

Lecture Title: ${lectureTitle}

Transcript:
${transcript}

Generate a study kit with the following components:

1. SUMMARY: A concise 2-3 paragraph summary of the lecture's main content and learning objectives.

2. KEY TAKEAWAYS: 5-7 bullet points highlighting the most important concepts students should remember.

3. PRACTICE QUESTIONS: 8-10 questions to test understanding:
   - Mix of multiple choice, short answer, and true/false questions
   - Include the correct answer for each question
   - For multiple choice, provide 4 options

4. GLOSSARY: Define 5-10 key terms or concepts mentioned in the lecture.

Format your response as valid JSON with this structure:
{
  "summary": "...",
  "takeaways": ["...", "..."],
  "questions": [
    {
      "question": "...",
      "answer": "...",
      "type": "multiple_choice",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."]
    }
  ],
  "glossary": {
    "term": "definition",
    ...
  }
}`;

    const response = await this.invoke({
      prompt,
      max_tokens: 4096,
      temperature: 0.7,
    });

    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing study kit JSON:', error);
      throw new Error('Failed to parse study kit response');
    }
  }

  /**
   * Answer a student question about the lecture with timestamp context
   */
  async answerQuestion(
    question: string,
    transcript: string,
    contextTimestamp?: number
  ): Promise<{ answer: string; related_timestamps: number[] }> {
    const contextNote = contextTimestamp !== undefined
      ? `The student is asking about content around ${this.formatTimestamp(contextTimestamp)}.`
      : '';

    const prompt = `You are a helpful AI tutor. A student is asking a question about this lecture.

${contextNote}

Lecture Transcript:
${transcript}

Student Question: ${question}

Provide a clear, educational answer that:
1. Directly addresses the student's question
2. References specific parts of the lecture
3. Uses examples from the transcript when possible
4. Suggests related concepts they should review

If you reference specific parts of the lecture, note any approximate timestamps mentioned in the transcript.

Format your response as JSON:
{
  "answer": "Your detailed answer here...",
  "related_timestamps": [120, 340, 567]
}

The related_timestamps should be the approximate seconds into the lecture where relevant content is discussed.`;

    const response = await this.invoke({
      prompt,
      max_tokens: 2048,
      temperature: 0.7,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing answer JSON:', error);
      // Fallback to plain text answer
      return {
        answer: response.content,
        related_timestamps: contextTimestamp !== undefined ? [contextTimestamp] : [],
      };
    }
  }

  /**
   * Generate a recap script for professors based on confusion patterns
   */
  async generateRecap(
    lectureTitle: string,
    transcript: string,
    confusionPoints: Array<{ timestamp: number; question_count: number; sample_questions: string[] }>
  ): Promise<{
    recap_script: string;
    key_confusion_points: Array<{ timestamp: number; topic: string; question_count: number }>;
    estimated_duration_minutes: number;
  }> {
    const confusionSummary = confusionPoints
      .map(
        (point) =>
          `At ${this.formatTimestamp(point.timestamp)} (${point.question_count} questions):\n${point.sample_questions
            .map((q) => `  - "${q}"`)
            .join('\n')}`
      )
      .join('\n\n');

    const prompt = `You are an educational consultant helping a professor prepare for their next class.

Lecture Title: ${lectureTitle}

Based on student questions, these were the most confusing parts of the previous lecture:

${confusionSummary}

Lecture Transcript (for context):
${transcript.substring(0, 3000)}...

Create a 5-minute recap script the professor can use to open the next class. The recap should:
1. Briefly acknowledge where students struggled
2. Re-explain the confusing concepts more clearly
3. Provide additional examples or analogies
4. Be conversational and encouraging

Also identify the key confusion points with clear topics.

Format your response as JSON:
{
  "recap_script": "Your 5-minute script here, with natural paragraphs...",
  "key_confusion_points": [
    {
      "timestamp": 120,
      "topic": "Clear topic name",
      "question_count": 5
    }
  ],
  "estimated_duration_minutes": 5
}`;

    const response = await this.invoke({
      prompt,
      max_tokens: 3000,
      temperature: 0.8,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing recap JSON:', error);
      throw new Error('Failed to parse recap response');
    }
  }

  /**
   * Format seconds as MM:SS or HH:MM:SS
   */
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

export const bedrockService = new BedrockService();
