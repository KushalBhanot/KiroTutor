import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { mockLecture } from '../data/mockData';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h2>
        
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-md p-8 mb-8 text-white">
          <h3 className="text-2xl font-semibold mb-4">📚 Welcome to KiroTutor</h3>
          <p className="text-primary-100 mb-6 text-lg">
            Upload lectures to get AI-generated study materials and ask questions with timestamp links.
          </p>
          <button 
            className="bg-white text-primary-700 px-8 py-3 rounded-lg hover:bg-primary-50 font-semibold transition shadow-lg"
            onClick={() => alert('Upload feature: In production, this would open a file picker to upload lecture videos/audio')}
          >
            + Upload New Lecture
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Your Lectures</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div 
              className="p-6 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => navigate(`/lecture/${mockLecture.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {mockLecture.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(mockLecture.duration_seconds!)}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Transcription Complete
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Study Kit Ready
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/lecture/${mockLecture.id}`);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                  >
                    View Study Kit
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${mockLecture.id}`);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    Ask Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Demo Mode Active</h4>
              <p className="text-sm text-blue-800">
                You're viewing a demo with pre-loaded MIT OpenCourseWare lecture. In production, upload your own lectures and KiroTutor will transcribe them with Amazon Transcribe and generate study materials using Claude 3.5 Sonnet.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
