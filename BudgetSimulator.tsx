import { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BudgetSimulation } from '@/types';
import { motion } from 'framer-motion';

interface BudgetSimulatorProps {
  onSimulate: (budget: BudgetSimulation) => void;
  initialBudget?: BudgetSimulation;
}

export default function BudgetSimulator({ onSimulate, initialBudget }: BudgetSimulatorProps) {
  const [budget, setBudget] = useState<BudgetSimulation>(
    initialBudget || {
      googleAds: 50000,
      metaAds: 30000,
      microsoftAds: 20000,
    }
  );

  const totalBudget = budget.googleAds + budget.metaAds + budget.microsoftAds;

  const handleInputChange = (channel: keyof BudgetSimulation, value: string) => {
    const numValue = parseFloat(value) || 0;
    setBudget(prev => ({ ...prev, [channel]: numValue }));
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Budget Simulator
        </CardTitle>
        <CardDescription>
          Adjust channel budgets to see updated revenue forecasts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium mb-2">
              <span>Google Ads Budget</span>
              <span className="text-blue-600 dark:text-blue-400">
                {((budget.googleAds / totalBudget) * 100).toFixed(0)}%
              </span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">₹</span>
              <input
                type="number"
                value={budget.googleAds}
                onChange={(e) => handleInputChange('googleAds', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(budget.googleAds / totalBudget) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium mb-2">
              <span>Meta Ads Budget</span>
              <span className="text-purple-600 dark:text-purple-400">
                {((budget.metaAds / totalBudget) * 100).toFixed(0)}%
              </span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">₹</span>
              <input
                type="number"
                value={budget.metaAds}
                onChange={(e) => handleInputChange('metaAds', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(budget.metaAds / totalBudget) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium mb-2">
              <span>Microsoft Ads Budget</span>
              <span className="text-green-600 dark:text-green-400">
                {((budget.microsoftAds / totalBudget) * 100).toFixed(0)}%
              </span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">₹</span>
              <input
                type="number"
                value={budget.microsoftAds}
                onChange={(e) => handleInputChange('microsoftAds', e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(budget.microsoftAds / totalBudget) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Total Budget</span>
            <span className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</span>
          </div>
          <Button 
            onClick={() => onSimulate(budget)} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Regenerate Forecast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
