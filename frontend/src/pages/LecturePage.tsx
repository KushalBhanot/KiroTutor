import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { mockLecture, mockStudyKit } from '../data/mockData';

export default function LecturePage() {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mockLecture.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Duration: {formatTime(mockLecture.duration_seconds!)}</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Transcribed & Analyzed
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/chat/${mockLecture.id}`)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              💬 Ask Questions
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📝</span>
            Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {mockStudyKit.summary}
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">✨</span>
            Key Takeaways
          </h2>
          <ul className="space-y-3">
            {mockStudyKit.takeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Practice Questions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">❓</span>
            Practice Questions
          </h2>
          <div className="space-y-6">
            {mockStudyKit.questions.map((q, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                <div className="font-semibold text-gray-900 mb-2">
                  {index + 1}. {q.question}
                </div>
                {q.options && (
                  <div className="ml-4 space-y-1 mb-2 text-gray-600">
                    {q.options.map((opt, i) => (
                      <div key={i}>{opt}</div>
                    ))}
                  </div>
                )}
                <details className="ml-4">
                  <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                    Show Answer
                  </summary>
                  <div className="mt-2 text-gray-700 bg-gray-50 p-3 rounded">
                    <strong>Answer:</strong> {q.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Glossary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Glossary
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(mockStudyKit.glossary).map(([term, definition]) => (
              <div key={term} className="border-b border-gray-200 pb-4 last:border-0">
                <dt className="font-bold text-gray-900 mb-1">{term}</dt>
                <dd className="text-gray-700">{definition}</dd>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Ready to dive deeper?</h4>
              <p className="text-sm text-gray-700 mb-3">
                Ask questions about this lecture and get AI-powered answers with timestamp references.
              </p>
              <button 
                onClick={() => navigate(`/chat/${mockLecture.id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                Start Asking Questions →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
