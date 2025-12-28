"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface Result {
  profile: {
    id: number;
    firstName: string;
    lastName: string;
  };
  aggregatedScores: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  globalAuthenticLeadership: number;
  zScores: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  raterCount: number;
}

interface StatisticalSummary {
  overallMeans: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  standardDeviations: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  sampleSize: number;
}

interface ApiResponse {
  results: Result[];
  statistics: StatisticalSummary;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [statistics, setStatistics] = useState<StatisticalSummary | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch("/api/results");
      const data: ApiResponse = await res.json();
      setResults(data.results);
      setStatistics(data.statistics);

      // By default, select all candidates
      const allNames = data.results.map(
        (r: Result) => `${r.profile.firstName} ${r.profile.lastName}`
      );
      setSelectedCandidates(allNames);
    };
    fetchResults();
  }, []);

  // Function to classify leadership type based on z-scores
  const classifyLeadershipType = (zScores: { q1: number; q2: number; q3: number; q4: number; q5: number }) => {
    const { q1: transparency, q2: moral, q3: balancedProcessing, q4: selfAwareness } = zScores;
    
    // Helper function to categorize z-score
    const categorize = (score: number) => {
      if (score > 0.5) return 'high';
      if (score >= -0.5) return 'average';
      return 'low';
    };
    
    const transparencyLevel = categorize(transparency);
    const moralLevel = categorize(moral);
    const balancedProcessingLevel = categorize(balancedProcessing);
    const selfAwarenessLevel = categorize(selfAwareness);
    
    // Classification logic based on the profiles
    // 1. Low Global Authentic: Self-awareness: Average, Balanced processing: Moderately low, Transparency: Average, Moral perspective: Average
    if (selfAwarenessLevel === 'average' && balancedProcessingLevel === 'low' && transparencyLevel === 'average' && moralLevel === 'average') {
      return 'Low Global Authentic';
    }
    
    // 3. Low Specific Self-Awareness: Self-awareness: Very low, Balanced processing: Moderately high, Transparency: Average, Moral perspective: Average
    if (selfAwarenessLevel === 'low' && balancedProcessingLevel === 'high' && transparencyLevel === 'average' && moralLevel === 'average') {
      return 'Low Specific Self-Awareness';
    }
    
    // 4. High Specific Balanced Processing: Self-awareness: High, Balanced processing: Very high, Transparency: Moderately low, Moral perspective: Average
    if (selfAwarenessLevel === 'high' && balancedProcessingLevel === 'high' && transparencyLevel === 'low' && moralLevel === 'average') {
      return 'High Specific Balanced Processing';
    }
    
    // 2. Normative (default): Self-awareness: Average, Balanced processing: Average, Transparency: Average, Moral perspective: Average
    return 'Normative';
  };

  // Colors for up to 12 candidates
  const colors = [
    "#2563eb", // blue-600
    "#16a34a", // green-600
    "#dc2626", // red-600
    "#9333ea", // purple-600
    "#f59e0b", // amber-500
    "#0891b2", // cyan-600
    "#d946ef", // fuchsia-500
    "#84cc16", // lime-500
    "#f43f5e", // rose-500
    "#0ea5e9", // sky-500
    "#a855f7", // violet-500
    "#eab308", // yellow-500
  ];

  // Build chart data for a given question (Q1–Q5)
  const buildChartData = (qKey: "q1" | "q2" | "q3" | "q4" | "q5") => {
    const data: { candidate: string; score: number; raterCount: number; [key: string]: any }[] = [];

    results.forEach((r) => {
      const candidateName = `${r.profile.firstName} ${r.profile.lastName}`;
      if (selectedCandidates.includes(candidateName)) {
        data.push({
          candidate: candidateName,
          score: r.aggregatedScores[qKey],
          raterCount: r.raterCount,
          [`${candidateName}_score`]: r.aggregatedScores[qKey],
        });
      }
    });

    return data;
  };

  // Regular scores chart component
  const QuestionChart = ({
    qKey,
    title,
  }: {
    qKey: "q1" | "q2" | "q3" | "q4" | "q5";
    title: string;
  }) => {
    const chartData = buildChartData(qKey);

    return (
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 w-full max-w-4xl chart-container">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title} - Average Scores</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="candidate"
              label={{ value: "Candidate", position: "insideBottom", offset: -5 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              domain={[0, 4]}
              label={{ value: "Average Score", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value, name, props) => {
                const raterCount = props.payload?.raterCount || 0;
                return [
                  `${(value as number).toFixed(2)} (from ${raterCount} rater${raterCount !== 1 ? 's' : ''})`,
                  "Average Score",
                ];
              }}
            />
            <Legend />

            {results.map((r, idx) => {
              const candidateName = `${r.profile.firstName} ${r.profile.lastName}`;
              if (!selectedCandidates.includes(candidateName)) return null;

              return (
                <Bar
                  key={candidateName}
                  dataKey={`${candidateName}_score`}
                  fill={colors[idx % colors.length]}
                  barSize={40}
                  name={candidateName}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Global Authentic Leadership chart component
  const GlobalAuthenticLeadershipChart = () => {
    const chartData: { candidate: string; score: number; raterCount: number; [key: string]: any }[] = [];

    results.forEach((r) => {
      const candidateName = `${r.profile.firstName} ${r.profile.lastName}`;
      if (selectedCandidates.includes(candidateName)) {
        chartData.push({
          candidate: candidateName,
          score: r.globalAuthenticLeadership,
          raterCount: r.raterCount,
          [`${candidateName}_score`]: r.globalAuthenticLeadership,
        });
      }
    });

    return (
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 w-full max-w-4xl chart-container">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Global Authentic Leadership - Average Scores</h2>
        <p className="text-sm text-gray-600 mb-4">
          Global Authentic Leadership is calculated as the average of the four dimensions: Transparency, Moral/Ethical, Balanced Processing, and Self Awareness.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="candidate"
              label={{ value: "Candidate", position: "insideBottom", offset: -5 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              domain={[0, 4]}
              label={{ value: "Global Authentic Leadership Score", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value, name, props) => {
                const raterCount = props.payload?.raterCount || 0;
                return [
                  `${(value as number).toFixed(2)} (from ${raterCount} rater${raterCount !== 1 ? 's' : ''})`,
                  "Global Authentic Leadership",
                ];
              }}
            />
            <Legend />

            {results.map((r, idx) => {
              const candidateName = `${r.profile.firstName} ${r.profile.lastName}`;
              if (!selectedCandidates.includes(candidateName)) return null;

              return (
                <Bar
                  key={candidateName}
                  dataKey={`${candidateName}_score`}
                  fill={colors[idx % colors.length]}
                  barSize={40}
                  name={candidateName}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Toggle selection of a candidate
  const toggleCandidate = (name: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Toggle all candidates
  const toggleAll = () => {
    if (selectedCandidates.length === results.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(
        results.map((r) => `${r.profile.firstName} ${r.profile.lastName}`)
      );
    }
  };

  // Download PDF function
  const downloadPDF = () => {
    // Create a new window with the current page content for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    // Get the current page content
    const resultsContent = document.querySelector('[data-results-content]');
    
    if (!resultsContent) {
      alert('Unable to find results content');
      return;
    }

    // Create a modified version for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leadership Analysis Results - ${new Date().toLocaleDateString()}</title>
          <meta charset="utf-8">
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .no-print { display: none !important; }
              .print-only { display: block !important; }
              .bg-gray-50 { background: white !important; }
              .shadow-lg, .shadow-md { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
              .rounded-2xl, .rounded-xl { border-radius: 8px !important; }
              .text-green-700 { color: #15803d !important; }
              .text-gray-800 { color: #1f2937 !important; }
              .text-gray-700 { color: #374151 !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .bg-white { background: white !important; }
              .bg-green-100 { background: #dcfce7 !important; }
              .bg-blue-100 { background: #dbeafe !important; }
              .bg-yellow-100 { background: #fef3c7 !important; }
              .bg-red-100 { background: #fee2e2 !important; }
              .bg-gray-100 { background: #f3f4f6 !important; }
              .bg-gray-50 { background: #f9fafb !important; }
              .border-green-500 { border-color: #10b981 !important; }
              .border-blue-500 { border-color: #3b82f6 !important; }
              .border-yellow-500 { border-color: #f59e0b !important; }
              .border-red-500 { border-color: #ef4444 !important; }
              .border-gray-500 { border-color: #6b7280 !important; }
              .text-green-600 { color: #059669 !important; }
              .text-red-600 { color: #dc2626 !important; }
              .text-green-800 { color: #166534 !important; }
              .text-blue-800 { color: #1e40af !important; }
              .text-yellow-800 { color: #92400e !important; }
              .text-red-800 { color: #991b1b !important; }
              .text-gray-800 { color: #1f2937 !important; }
              .recharts-wrapper { page-break-inside: avoid; }
              .chart-container { page-break-inside: avoid; margin-bottom: 30px; }
              .page-break { page-break-before: always; }
            }
            @page { margin: 1in; }
            body { font-size: 12px; line-height: 1.4; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 18px; margin-bottom: 15px; }
            h3 { font-size: 16px; margin-bottom: 10px; }
            .candidate-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
          </style>
        </head>
        <body>
          <div class="print-only" style="display: none;">
            <h1 style="text-align: center; color: #15803d; margin-bottom: 10px;">Leadership Analysis Results</h1>
            <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          ${resultsContent.outerHTML}
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          All Candidates' Ratings
        </h1>
        <button
          onClick={downloadPDF}
          className="no-print bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
          title="Download results as PDF"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Candidate selection checkboxes */}
      {results.length > 0 && (
        <div className="no-print bg-white shadow-md rounded-xl p-4 mb-6 w-full max-w-4xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Select Candidates
          </h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedCandidates.length === results.length}
                onChange={toggleAll}
              />
              <span className="font-medium">Select All</span>
            </label>
            {results.map((r) => {
              const candidateName = `${r.profile.firstName} ${r.profile.lastName}`;
              return (
                <label
                  key={candidateName}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidateName)}
                    onChange={() => toggleCandidate(candidateName)}
                  />
                  <span>{candidateName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-6 w-full flex flex-col items-center" data-results-content>
          <QuestionChart qKey="q1" title="D1: Transparency" />
          <QuestionChart qKey="q2" title="D2: Moral/Ethical" />
          <QuestionChart qKey="q3" title="D3: Balanced Processing" />
          <QuestionChart qKey="q4" title="D4: Self Awareness" />
          
          {/* Global Authentic Leadership Chart */}
          <GlobalAuthenticLeadershipChart />

          {/* Candidate Leadership Types */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 w-full max-w-4xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Candidate Leadership Classifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 candidate-grid">
              {results
                .filter((r) =>
                  selectedCandidates.includes(
                    `${r.profile.firstName} ${r.profile.lastName}`
                  ) && r.raterCount > 0
                )
                .map((r) => {
                  const candidateName = `${r.profile.firstName} ${r.profile.lastName}`;
                  const leadershipType = classifyLeadershipType(r.zScores);
                  
                  // Get color based on leadership type
                  const getTypeColor = (type: string) => {
                    switch (type) {
                      case 'High Specific Balanced Processing': return 'bg-green-100 border-green-500 text-green-800';
                      case 'Normative': return 'bg-blue-100 border-blue-500 text-blue-800';
                      case 'Low Specific Self-Awareness': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
                      case 'Low Global Authentic': return 'bg-red-100 border-red-500 text-red-800';
                      default: return 'bg-gray-100 border-gray-500 text-gray-800';
                    }
                  };
                  
                  return (
                    <div key={candidateName} className={`p-4 rounded-lg border-l-4 ${getTypeColor(leadershipType)}`}>
                      <div className="font-semibold text-lg">{candidateName}</div>
                      <div className="text-sm font-medium mt-1">{leadershipType}</div>
                      <div className="text-xs mt-2 space-y-1">
                        <div>Transparency: {r.zScores.q1.toFixed(2)}</div>
                        <div>Moral/Ethical: {r.zScores.q2.toFixed(2)}</div>
                        <div>Balanced Processing: {r.zScores.q3.toFixed(2)}</div>
                        <div>Self Awareness: {r.zScores.q4.toFixed(2)}</div>
                        <div className="mt-2 font-medium">Global Score: {r.globalAuthenticLeadership.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Note:</strong> Leadership types are classified based on z-score patterns across the four dimensions. Classifications help identify distinct leadership profiles and development needs.</p>
            </div>
          </div>

          {/* Leadership Profiles Analysis */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 w-full max-w-4xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Leadership Profiles Analysis
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="font-semibold text-red-800">
                  1. Low Global Authentic
                </p>
                <p>Self-awareness: Average</p>
                <p>Balanced processing: Low</p>
                <p>Transparency: Average</p>
                <p>Moral perspective: Average</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="font-semibold text-blue-800">2. Normative</p>
                <p>Self-awareness: Average</p>
                <p>Balanced processing: Average</p>
                <p>Transparency: Average</p>
                <p>Moral perspective: Average</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="font-semibold text-yellow-800">
                  3. Low Specific Self-Awareness
                </p>
                <p>Self-awareness: Low</p>
                <p>Balanced processing: High</p>
                <p>Transparency: Average</p>
                <p>Moral perspective: Average</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="font-semibold text-green-800">
                  4. High Specific Balanced Processing
                </p>
                <p>Self-awareness: High</p>
                <p>Balanced processing: High</p>
                <p>Transparency: Low</p>
                <p>Moral perspective: Average</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Classification Criteria:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>High:</strong> Z-score &gt; +1 SD</li>
                <li><strong>Average:</strong> Z-score between -1 and +1 SD</li>
                <li><strong>Low:</strong> Z-score &lt; -1 SD</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading results...</p>
      )}
    </div>
  );
}