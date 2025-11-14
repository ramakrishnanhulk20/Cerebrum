import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  Copy,
  CheckCircle,
  Loader,
  AlertCircle,
  LineChart,
  PieChart,
  Filter,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CEREBRUM_CONTRACT_ADDRESS, CEREBRUM_ABI } from '../config/contracts-v09';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';

interface AnalysisResult {
  id: string;
  type: string;
  metric: string;
  result: string;
  timestamp: number;
  patientCount: number;
  decrypted?: bigint;
}

interface AnalyticsDashboardProps {
  purchasedPatients: string[];
  researcherAddress: string;
}

const METRIC_NAMES = {
  0: 'Blood Sugar',
  1: 'Cholesterol',
  2: 'BMI',
  3: 'BP Systolic',
};

export const AnalyticsDashboard = ({ purchasedPatients, researcherAddress }: AnalyticsDashboardProps) => {
  const [selectedMetric, setSelectedMetric] = useState<number>(0);
  const [selectedMetric2, setSelectedMetric2] = useState<number>(1); // For correlation
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedPatientsGroupB, setSelectedPatientsGroupB] = useState<string[]>([]); // For group comparison
  const [thresholdValue, setThresholdValue] = useState<string>(''); // For threshold comparison
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  // Write contracts
  const { writeContract: runAnalysis, data: analysisHash } = useWriteContract();
  const { writeContract: requestDecryption, data: decryptHash } = useWriteContract();

  const { isLoading: isAnalyzing, isSuccess: analysisSuccess } = useWaitForTransactionReceipt({ hash: analysisHash });
  const { isLoading: isDecrypting, isSuccess: decryptSuccess } = useWaitForTransactionReceipt({ hash: decryptHash });

  // Toggle patient selection
  const togglePatient = (patient: string) => {
    setSelectedPatients(prev => 
      prev.includes(patient) 
        ? prev.filter(p => p !== patient)
        : [...prev, patient]
    );
  };

  // Select all patients
  const selectAll = () => {
    setSelectedPatients(purchasedPatients);
    toast.success(`Selected all ${purchasedPatients.length} patients`);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPatients([]);
  };

  // Run encrypted average calculation
  const calculateAverage = () => {
    if (selectedPatients.length === 0) {
      toast.error('Please select at least one patient');
      return;
    }

    const recordIndices = Array(selectedPatients.length).fill(0); // Latest record for each

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'calculateEncryptedAverage',
        args: [selectedPatients, selectedMetric, recordIndices],
      } as any,
      {
        onSuccess: (hash) => {
          toast.success('Calculating encrypted average...');
          setActiveAnalysis('average');
        },
        onError: (error: any) => {
          console.error('Analysis error:', error);
          toast.error(error?.shortMessage || 'Analysis failed');
        },
      }
    );
  };

  // Run min/max calculation
  const calculateMinMax = () => {
    if (selectedPatients.length === 0) {
      toast.error('Please select at least one patient');
      return;
    }

    const recordIndices = Array(selectedPatients.length).fill(0);

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'calculateEncryptedMinMax',
        args: [selectedPatients, selectedMetric, recordIndices],
      } as any,
      {
        onSuccess: () => {
          toast.success('Calculating encrypted min/max...');
          setActiveAnalysis('minmax');
        },
        onError: (error: any) => {
          toast.error(error?.shortMessage || 'Analysis failed');
        },
      }
    );
  };

  // Run standard deviation
  const calculateStdDev = () => {
    if (selectedPatients.length === 0) {
      toast.error('Please select at least one patient');
      return;
    }

    const recordIndices = Array(selectedPatients.length).fill(0);

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'calculateEncryptedStdDev',
        args: [selectedPatients, selectedMetric, recordIndices],
      } as any,
      {
        onSuccess: () => {
          toast.success('Calculating encrypted standard deviation...');
          setActiveAnalysis('stddev');
        },
        onError: (error: any) => {
          toast.error(error?.shortMessage || 'Analysis failed');
        },
      }
    );
  };

  // Run correlation analysis (2 metrics)
  const calculateCorrelation = () => {
    if (selectedPatients.length < 2) {
      toast.error('Please select at least 2 patients for correlation');
      return;
    }

    const recordIndices = Array(selectedPatients.length).fill(0);

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'calculateEncryptedCorrelation',
        args: [selectedPatients, selectedMetric, selectedMetric2, recordIndices],
      } as any,
      {
        onSuccess: () => {
          toast.success('Calculating encrypted correlation...');
          setActiveAnalysis(`correlation-${METRIC_NAMES[selectedMetric as keyof typeof METRIC_NAMES]}-${METRIC_NAMES[selectedMetric2 as keyof typeof METRIC_NAMES]}`);
        },
        onError: (error: any) => {
          toast.error(error?.shortMessage || 'Correlation analysis failed');
        },
      }
    );
  };

  // Batch threshold comparison
  const batchCompareThreshold = () => {
    if (selectedPatients.length === 0 || !thresholdValue) {
      toast.error('Please select patients and enter a threshold value');
      return;
    }

    const recordIndices = Array(selectedPatients.length).fill(0);

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'batchCompareThreshold',
        args: [selectedPatients, selectedMetric, BigInt(thresholdValue), recordIndices],
      } as any,
      {
        onSuccess: () => {
          toast.success('Comparing patients against threshold...');
          setActiveAnalysis('batch-threshold');
        },
        onError: (error: any) => {
          toast.error(error?.shortMessage || 'Threshold comparison failed');
        },
      }
    );
  };

  // Compare group averages (A vs B)
  const compareGroupAverages = () => {
    if (selectedPatients.length === 0 || selectedPatientsGroupB.length === 0) {
      toast.error('Please select patients for both Group A and Group B');
      return;
    }

    const recordIndicesA = Array(selectedPatients.length).fill(0);
    const recordIndicesB = Array(selectedPatientsGroupB.length).fill(0);

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'compareEncryptedAverages',
        args: [selectedPatients, selectedPatientsGroupB, selectedMetric, recordIndicesA, recordIndicesB],
      } as any,
      {
        onSuccess: () => {
          toast.success('Comparing group averages...');
          setActiveAnalysis('compare-groups');
        },
        onError: (error: any) => {
          toast.error(error?.shortMessage || 'Group comparison failed');
        },
      }
    );
  };

  // Get patient count above threshold
  const getCountAboveThreshold = () => {
    if (selectedPatients.length === 0 || !thresholdValue) {
      toast.error('Please select patients and enter a threshold value');
      return;
    }

    const recordIndices = Array(selectedPatients.length).fill(0);

    runAnalysis(
      {
        address: CEREBRUM_CONTRACT_ADDRESS as `0x${string}`,
        abi: CEREBRUM_ABI,
        functionName: 'getPatientCountAboveThreshold',
        args: [selectedPatients, selectedMetric, BigInt(thresholdValue), recordIndices],
      } as any,
      {
        onSuccess: () => {
          toast.success('Counting patients above threshold...');
          setActiveAnalysis('count-threshold');
        },
        onError: (error: any) => {
          toast.error(error?.shortMessage || 'Count analysis failed');
        },
      }
    );
  };

  // Export results as CSV
  const exportAsCSV = () => {
    if (analysisResults.length === 0) {
      toast.error('No results to export');
      return;
    }

    const csv = [
      ['Type', 'Metric', 'Patients', 'Result', 'Decrypted Value', 'Timestamp'].join(','),
      ...analysisResults.map(r => [
        r.type,
        r.metric,
        r.patientCount,
        r.result,
        r.decrypted !== undefined ? r.decrypted.toString() : 'Encrypted',
        new Date(r.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cerebrum-analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Results exported as CSV!');
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (analysisResults.length === 0) {
      toast.error('No results to copy');
      return;
    }

    const text = analysisResults.map(r => 
      `${r.type} - ${r.metric}: ${r.decrypted !== undefined ? r.decrypted.toString() : 'Encrypted'} (${r.patientCount} patients)`
    ).join('\n');

    navigator.clipboard.writeText(text);
    toast.success('Results copied to clipboard!');
  };

  // Handle successful analysis
  useEffect(() => {
    if (analysisSuccess && activeAnalysis) {
      const newResult: AnalysisResult = {
        id: `${activeAnalysis}-${Date.now()}`,
        type: activeAnalysis,
        metric: METRIC_NAMES[selectedMetric as keyof typeof METRIC_NAMES],
        result: 'Encrypted',
        timestamp: Date.now(),
        patientCount: selectedPatients.length,
      };

      setAnalysisResults(prev => [newResult, ...prev]);
      toast.success(`✅ ${activeAnalysis} calculated! Result is encrypted.`);
      setActiveAnalysis(null);
    }
  }, [analysisSuccess, activeAnalysis]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
            <p className="text-sm text-gray-400">Power BI-style encrypted data analysis</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportAsCSV}
            disabled={analysisResults.length === 0}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={copyToClipboard}
            disabled={analysisResults.length === 0}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
      </div>

      {/* Patient Selection */}
      <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-400" />
            Select Patients for Analysis
          </h3>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
            >
              Select All ({purchasedPatients.length})
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {purchasedPatients.map((patient) => (
            <button
              key={patient}
              onClick={() => togglePatient(patient)}
              className={`p-4 rounded-xl border transition-all text-left ${
                selectedPatients.includes(patient)
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-black/50 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white">
                  {patient.slice(0, 6)}...{patient.slice(-4)}
                </span>
                {selectedPatients.includes(patient) && (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedPatients.length > 0 && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-sm text-emerald-400">
              ✓ {selectedPatients.length} patient{selectedPatients.length !== 1 ? 's' : ''} selected for analysis
            </p>
          </div>
        )}
      </div>

      {/* Metric Selection */}
      <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Health Metric</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(METRIC_NAMES).map(([value, name]) => (
            <button
              key={value}
              onClick={() => setSelectedMetric(Number(value))}
              className={`p-4 rounded-xl border transition-all ${
                selectedMetric === Number(value)
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-black/50 border-white/10 hover:border-white/20'
              }`}
            >
              <Activity className="w-6 h-6 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-white">{name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Analysis Actions */}
      <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Basic FHE Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={calculateAverage}
            disabled={isAnalyzing || selectedPatients.length === 0}
            className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-all disabled:opacity-50"
          >
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Calculate Average</h4>
            <p className="text-sm text-gray-400">Encrypted average of selected metric</p>
          </button>

          <button
            onClick={calculateMinMax}
            disabled={isAnalyzing || selectedPatients.length === 0}
            className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all disabled:opacity-50"
          >
            <LineChart className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Min / Max</h4>
            <p className="text-sm text-gray-400">Find minimum and maximum values</p>
          </button>

          <button
            onClick={calculateStdDev}
            disabled={isAnalyzing || selectedPatients.length === 0}
            className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl hover:border-orange-500/50 transition-all disabled:opacity-50"
          >
            <PieChart className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Std Deviation</h4>
            <p className="text-sm text-gray-400">Calculate data distribution</p>
          </button>
        </div>

        {isAnalyzing && (
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
            <Loader className="w-5 h-5 text-yellow-400 animate-spin" />
            <p className="text-sm text-yellow-400">Processing encrypted analysis...</p>
          </div>
        )}
      </div>

      {/* Toggle Advanced Analytics */}
      <button
        onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl hover:border-purple-500/50 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white">Advanced Analytics</h3>
            <p className="text-sm text-gray-400">Correlation, group comparison, threshold filtering</p>
          </div>
        </div>
        <div className={`transform transition-transform ${showAdvancedAnalytics ? 'rotate-180' : ''}`}>
          <Play className="w-6 h-6 text-purple-400 rotate-90" />
        </div>
      </button>

      {/* Advanced Analytics Section */}
      {showAdvancedAnalytics && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Correlation Analysis */}
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Correlation Analysis</h3>
            <p className="text-sm text-gray-400 mb-4">Analyze relationship between two health metrics</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Metric 1</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
                >
                  {Object.entries(METRIC_NAMES).map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Metric 2</label>
                <select
                  value={selectedMetric2}
                  onChange={(e) => setSelectedMetric2(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
                >
                  {Object.entries(METRIC_NAMES).map(([value, name]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={calculateCorrelation}
              disabled={isAnalyzing || selectedPatients.length < 2}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all disabled:opacity-50"
            >
              Calculate Correlation
            </button>
          </div>

          {/* Threshold Comparison */}
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Threshold Analysis</h3>
            <p className="text-sm text-gray-400 mb-4">Filter patients above/below threshold</p>
            
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Threshold Value</label>
              <input
                type="number"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                placeholder="e.g., 120 for blood sugar"
                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={batchCompareThreshold}
                disabled={isAnalyzing || selectedPatients.length === 0 || !thresholdValue}
                className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-all disabled:opacity-50"
              >
                Batch Compare
              </button>
              <button
                onClick={getCountAboveThreshold}
                disabled={isAnalyzing || selectedPatients.length === 0 || !thresholdValue}
                className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-500/50 transition-all disabled:opacity-50"
              >
                Count Above
              </button>
            </div>
          </div>

          {/* Group Comparison */}
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Group Comparison (A vs B)</h3>
            <p className="text-sm text-gray-400 mb-4">Compare averages between two patient groups</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Group A: {selectedPatients.length} patients</label>
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">Selected in main section</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Group B: {selectedPatientsGroupB.length} patients</label>
                <div className="space-y-2">
                  {purchasedPatients.filter(p => !selectedPatients.includes(p)).map((patient) => (
                    <button
                      key={patient}
                      onClick={() => setSelectedPatientsGroupB(prev => 
                        prev.includes(patient) ? prev.filter(p => p !== patient) : [...prev, patient]
                      )}
                      className={`w-full p-2 rounded-lg border text-xs transition-all ${
                        selectedPatientsGroupB.includes(patient)
                          ? 'bg-pink-500/20 border-pink-500/50'
                          : 'bg-black/50 border-white/10'
                      }`}
                    >
                      {patient.slice(0, 6)}...{patient.slice(-4)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={compareGroupAverages}
              disabled={isAnalyzing || selectedPatients.length === 0 || selectedPatientsGroupB.length === 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl hover:border-pink-500/50 transition-all disabled:opacity-50"
            >
              Compare Group Averages
            </button>
          </div>
        </motion.div>
      )}

      {/* Results History */}
      {analysisResults.length > 0 && (
        <>
          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analysis Results</h3>
            <div className="space-y-3">
              {analysisResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/50 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-semibold capitalize">{result.type} - {result.metric}</h4>
                      <p className="text-sm text-gray-400">
                        {result.patientCount} patients • {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {result.decrypted !== undefined ? (
                        <p className="text-2xl font-bold text-emerald-400">{result.decrypted.toString()}</p>
                      ) : (
                        <p className="text-sm text-yellow-400">🔒 Encrypted</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chart Visualizations */}
          <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              Data Visualizations
            </h3>
            
            {/* Bar Chart - Analysis Results Over Time */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-300 mb-3">Analysis Results Timeline</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysisResults.map(r => ({
                  name: `${r.type.slice(0, 8)}...`,
                  value: r.decrypted !== undefined ? Number(r.decrypted) : 0,
                  metric: r.metric,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #10b981',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Result Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Trend Analysis */}
            <div>
              <h4 className="text-md font-semibold text-gray-300 mb-3">Analysis Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={analysisResults.map((r, idx) => ({
                  index: idx + 1,
                  value: r.decrypted !== undefined ? Number(r.decrypted) : 0,
                  patients: r.patientCount,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="index" stroke="#9ca3af" label={{ value: 'Analysis #', position: 'insideBottom', offset: -5 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #3b82f6',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Result Value" />
                  <Line type="monotone" dataKey="patients" stroke="#f59e0b" strokeWidth={2} name="Patient Count" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Help Text */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-2">How It Works</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Select multiple patients you've purchased data from</li>
              <li>• Choose a health metric (Blood Sugar, Cholesterol, BMI, BP)</li>
              <li>• Run encrypted analytics - results stay encrypted on-chain</li>
              <li>• All calculations happen on encrypted data using FHE</li>
              <li>• Export or copy results for your reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
