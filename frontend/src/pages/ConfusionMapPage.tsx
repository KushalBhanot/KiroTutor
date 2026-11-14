import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from '../components/Navbar';
import { mockConfusionMap, mockLecture, mockRecapScript } from '../data/mockData';

export default function ConfusionMapPage() {
  const navigate = useNavigate();
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const [showRecap, setShowRecap] = useState(false);
  const [generatingRecap, setGeneratingRecap] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = (intensity: number) => {
    if (intensity >= 0.7) return '#ef4444'; // red-500
    if (intensity >= 0.4) return '#f59e0b'; // amber-500
    if (intensity >= 0.2) return '#eab308'; // yellow-500
    return '#10b981'; // green-500
  };

  const chartData = mockConfusionMap.heatmap.map((bucket, index) => ({
    name: formatTime(bucket.start_time),
    questions: bucket.question_count,
    intensity: bucket.intensity,
    index,
  }));

  const handleGenerateRecap = () => {
    setGeneratingRecap(true);
    setTimeout(() => {
      setGeneratingRecap(false);
      setShowRecap(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/professor')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">🎯 Confusion Map</h1>
          <p className="text-purple-100 text-lg mb-4">{mockLecture.title}</p>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(mockConfusionMap.duration_seconds)} lecture
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {mockConfusionMap.total_questions} student questions
            </span>
          </div>
        </div>

        {/* Heatmap Visualization */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Question Density Heatmap</h2>
              <p className="text-gray-600">Click on any bar to see the questions students asked</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Peak</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} onClick={(data) => data && setSelectedBucket(data.activeTooltipIndex || 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                interval={0}
                style={{ fontSize: '12px' }}
              />
              <YAxis allowDecimals={false} label={{ value: 'Questions', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                        <p className="font-semibold">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-600">{payload[0].value} questions</p>
                        <p className="text-xs text-gray-500 mt-1">Click to see details</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="questions" cursor="pointer">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.intensity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm">
                <span className="font-semibold text-yellow-900">Key Confusion Hotspots Detected:</span>
                <span className="text-yellow-800 ml-1">
                  High question density around 12:30 (Merge Sort complexity) and 28:45 (Heaps & Priority Queues)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Bucket Details */}
        {selectedBucket !== null && mockConfusionMap.heatmap[selectedBucket] && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Questions at {formatTime(mockConfusionMap.heatmap[selectedBucket].start_time)} - {formatTime(mockConfusionMap.heatmap[selectedBucket].end_time)}
            </h3>
            {mockConfusionMap.heatmap[selectedBucket].question_count > 0 ? (
              <div className="space-y-3">
                {mockConfusionMap.heatmap[selectedBucket].sample_questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-gray-900">{q.question_text}</p>
                      <p className="text-xs text-gray-500 mt-1">at {formatTime(q.timestamp_seconds)}</p>
                    </div>
                  </div>
                ))}
                {mockConfusionMap.heatmap[selectedBucket].question_count > 3 && (
                  <p className="text-sm text-gray-600 text-center">
                    + {mockConfusionMap.heatmap[selectedBucket].question_count - 3} more questions in this time range
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No questions in this time range</p>
            )}
          </div>
        )}

        {/* Generate Recap */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Generated Recap Script</h3>
          <p className="text-gray-600 mb-6">
            Generate a 5-minute recap script that addresses the key confusion points to open your next class.
          </p>
          
          {!showRecap ? (
            <button 
              onClick={handleGenerateRecap}
              disabled={generatingRecap}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
            >
              {generatingRecap ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Recap...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate Recap Script
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Recap Generated!</span>
                </div>
                <span className="text-sm text-green-600">Estimated duration: 5 minutes</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                  {mockRecapScript}
                </pre>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  📄 Download as PDF
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  📋 Copy to Clipboard
                </button>
                <button 
                  onClick={() => setShowRecap(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  ↻ Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
