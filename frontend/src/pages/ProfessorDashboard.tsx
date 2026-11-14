import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { mockLecture } from '../data/mockData';

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Professor Dashboard</h2>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg shadow-md p-8 mb-8 text-white">
          <h3 className="text-2xl font-semibold mb-4">🎯 Confusion Map Analytics</h3>
          <p className="text-purple-100 mb-6 text-lg">
            See where your students are struggling with visual heatmaps of question density across your lecture timeline.
          </p>
          <button 
            onClick={() => navigate(`/confusion-map/${mockLecture.id}`)}
            className="bg-white text-purple-700 px-8 py-3 rounded-lg hover:bg-purple-50 font-semibold transition shadow-lg"
          >
            View Confusion Map →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Your Lectures</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {mockLecture.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(mockLecture.duration_seconds!)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      26 student questions
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{width: '100%'}}></div>
                    </div>
                    <span className="text-xs text-gray-600">Question Density</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    🔴 High confusion at 12:30 and 28:45
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => navigate(`/confusion-map/${mockLecture.id}`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                  >
                    View Confusion Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Total Questions</h4>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">26</div>
            <div className="text-sm text-green-600 mt-1">↑ Active engagement</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Confusion Peaks</h4>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">2</div>
            <div className="text-sm text-orange-600 mt-1">⚠️ Needs review</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Avg Questions/Min</h4>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900">0.58</div>
            <div className="text-sm text-gray-600 mt-1">Per minute</div>
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
                Viewing demo with pre-seeded questions from MIT lecture. The confusion map shows real patterns of where students asked the most questions. Click "View Confusion Map" to see the heatmap visualization.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
