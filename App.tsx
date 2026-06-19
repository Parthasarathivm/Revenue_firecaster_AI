import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import FileUpload from './components/FileUpload';
import BudgetSimulator from './components/BudgetSimulator';
import ForecastCharts from './components/ForecastCharts';
import AIInsights from './components/AIInsights';
import MetricsSummary from './components/MetricsSummary';
import { MarketingData, PredictionResponse, BudgetSimulation } from './types';
import { generatePredictions } from './lib/mockApi';
import { Sparkles, BarChart3, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [data, setData] = useState<MarketingData[]>([]);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [forecastDays, setForecastDays] = useState<30 | 60 | 90>(30);

  const handleDataLoaded = (newData: MarketingData[]) => {
    setData(newData);
    setPredictions(null);
  };

  const handleGenerateForecast = async (budget?: BudgetSimulation) => {
    if (data.length === 0) return;

    setLoading(true);
    try {
      const result = await generatePredictions(data, forecastDays, budget);
      setPredictions(result);
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!predictions) return;

    const csvContent = [
      ['Date', 'Revenue Forecast', 'Lower Bound', 'Upper Bound', 'ROAS', 'ROAS Lower', 'ROAS Upper'],
      ...predictions.forecasts.map(f => [
        f.date,
        f.revenue.toFixed(2),
        f.revenueLower.toFixed(2),
        f.revenueUpper.toFixed(2),
        f.roas.toFixed(2),
        f.roasLower.toFixed(2),
        f.roasUpper.toFixed(2),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_forecast_${forecastDays}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Revenue Forecaster AI
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Probabilistic E-commerce Revenue Prediction
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                AIgnition 3.0
              </span>
              {predictions && (
                <Button onClick={handleDownloadCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* File Upload */}
          {!data.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FileUpload onDataLoaded={handleDataLoaded} />
            </motion.div>
          )}

          {/* Data Loaded - Show Controls */}
          {data.length > 0 && !predictions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Data Loaded Successfully</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {data.length} records from{' '}
                      {new Date(data[0].Date).toLocaleDateString()} to{' '}
                      {new Date(data[data.length - 1].Date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={() => setData([])} variant="outline">
                    Upload Different File
                  </Button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Forecast Period</label>
                  <div className="flex gap-3">
                    {[30, 60, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => setForecastDays(days as 30 | 60 | 90)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          forecastDays === days
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleGenerateForecast()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating AI Forecast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Revenue Forecast
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="mt-6 text-lg font-medium text-slate-700 dark:text-slate-300">
                  Training ML models and generating probabilistic forecasts...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Analyzing {data.length} records with ensemble algorithms
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Predictions */}
          {predictions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Forecast Results</h2>
                <Button onClick={() => setPredictions(null)} variant="outline">
                  New Forecast
                </Button>
              </div>

              {/* Metrics Summary */}
              <MetricsSummary
                totalRevenue={predictions.totalRevenue}
                totalROAS={predictions.totalROAS}
                modelMetrics={predictions.modelMetrics}
              />

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  <TabsTrigger value="simulator">Budget Simulator</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <ForecastCharts
                    forecasts={predictions.forecasts}
                    channelForecasts={predictions.channelForecasts}
                    campaignForecasts={predictions.campaignForecasts}
                  />
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  <AIInsights insights={predictions.aiInsights} />
                </TabsContent>

                <TabsContent value="simulator" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BudgetSimulator onSimulate={handleGenerateForecast} />
                    <Card className="p-6">
                      <h3 className="text-xl font-bold mb-4">How to Use Budget Simulator</h3>
                      <div className="space-y-3 text-slate-700 dark:text-slate-300">
                        <p>1. Adjust the budget sliders for each channel</p>
                        <p>2. Click "Regenerate Forecast" to see updated predictions</p>
                        <p>3. Compare different budget allocations to optimize ROAS</p>
                        <p>4. Download the CSV to share with your team</p>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-xl font-bold mb-4">Channel Forecasts</h3>
                      <div className="space-y-4">
                        {predictions.channelForecasts.map((channel) => (
                          <div key={channel.channel} className="border-b border-slate-200 dark:border-slate-700 pb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{channel.channel}</span>
                              <span className="text-sm text-slate-500">ROAS: {channel.roas.toFixed(2)}x</span>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Revenue: ₹{(channel.revenue / 100000).toFixed(2)}L
                              <br />
                              95% CI: ₹{(channel.revenueLower / 100000).toFixed(2)}L - ₹
                              {(channel.revenueUpper / 100000).toFixed(2)}L
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-xl font-bold mb-4">Model Performance</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Mean Absolute Error</span>
                          <p className="text-2xl font-bold">₹{predictions.modelMetrics.mae.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Root Mean Square Error</span>
                          <p className="text-2xl font-bold">₹{predictions.modelMetrics.rmse.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">R² Score</span>
                          <p className="text-2xl font-bold">{predictions.modelMetrics.r2.toFixed(3)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Mean Absolute Percentage Error</span>
                          <p className="text-2xl font-bold">{predictions.modelMetrics.mape.toFixed(1)}%</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg mt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 Revenue Forecaster AI - AIgnition 3.0 Hackathon Project
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Powered by XGBoost, LightGBM & OpenAI GPT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
