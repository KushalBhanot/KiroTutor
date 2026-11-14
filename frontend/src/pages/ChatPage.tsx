import toast from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { addLiveQuestion, mockLecture, mockQuestions } from '../data/mockData';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'of', 'in', 'on', 'to', 'for', 'and', 'or',
  'what', 'why', 'how', 'when', 'which', 'who', 'does', 'do', 'did', 'can', 'could', 'would',
  'i', 'me', 'my', 'you', 'it', 'this', 'that', 'with', 'about', 'be', 'by', 'at', 'as', 'we',
  'explain', 'please', 'mean', 'professor', 'lecture', 'say', 'said',
]);

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/s$/, ''))
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

function findBestMatch(message: string) {
  const words = new Set(tokenize(message));
  let best: (typeof mockQuestions)[number] | undefined;
  let bestScore = 0;
  for (const q of mockQuestions) {
    const score = tokenize(q.question_text).filter((w) => words.has(w)).length;
    if (score > bestScore) {
      best = q;
      bestScore = score;
    }
  }
  return best;
}

export default function ChatPage() {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI tutor for "${mockLecture.title}". Ask me anything about the lecture and I'll provide answers with timestamp references!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    // Simulate AI response with mock data
    setTimeout(() => {
      // Pick the mock Q&A that shares the most meaningful words with the question
      const relevantQ = findBestMatch(userMessage);

      let response = '';
      let timestamp = 0;

      if (relevantQ) {
        response = relevantQ.answer_text;
        timestamp = relevantQ.timestamp_seconds;
        response += `\n\n📍 This concept is discussed around ${formatTime(timestamp)} in the lecture.`;
      } else {
        response = `Based on the lecture transcript, here's what I found:\n\nThe lecture covers this topic in detail. The key point to understand is the algorithmic approach and time complexity analysis. For a comprehensive understanding, I recommend reviewing the relevant section of the lecture.\n\n📍 Related content appears around 14:35 in the lecture.`;
        timestamp = 875;
      }

      addLiveQuestion(userMessage, response, timestamp);
      toast.success(`Logged at ${formatTime(timestamp)} on the professor's Confusion Map`);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        timestamp 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6">
        <button 
          onClick={() => navigate(`/lecture/${lectureId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Study Kit
        </button>

        <div className="bg-white rounded-lg shadow-md mb-4 p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Q&A Chat: {mockLecture.title}
          </h1>
          <p className="text-sm text-gray-600">
            Ask questions and get answers with timestamp references
          </p>
        </div>

        {/* Quick Questions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-sm font-semibold text-blue-900 mb-2">Quick Questions:</div>
          <div className="flex flex-wrap gap-2">
            {[
              'What is the time complexity of Merge Sort?',
              'Explain the recursion tree',
              'What is a heap?',
              'Why is heap insertion O(log n)?'
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="px-3 py-1 bg-white text-blue-700 text-sm rounded-full hover:bg-blue-100 transition border border-blue-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.timestamp !== undefined && (
                    <button
                      onClick={() => toast(`In the full app, this would jump to ${formatTime(msg.timestamp!)} in the video player`)}
                      className="mt-2 px-3 py-1 bg-white text-primary-700 text-sm rounded hover:bg-gray-50 transition inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Jump to {formatTime(msg.timestamp)}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question about the lecture..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              💡 Tip: Questions are automatically linked to lecture timestamps for the professor's confusion map
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
