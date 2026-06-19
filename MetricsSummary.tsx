import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricsSummaryProps {
  totalRevenue: { value: number; lower: number; upper: number };
  totalROAS: { value: number; lower: number; upper: number };
  modelMetrics: { mae: number; rmse: number; r2: number; mape: number };
}

export default function MetricsSummary({ totalRevenue, totalROAS, modelMetrics }: MetricsSummaryProps) {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const metrics = [
    {
      title: 'Predicted Revenue',
      value: formatCurrency(totalRevenue.value),
      range: `${formatCurrency(totalRevenue.lower)} - ${formatCurrency(totalRevenue.upper)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Blended ROAS',
      value: `${totalROAS.value.toFixed(2)}x`,
      range: `${totalROAS.lower.toFixed(2)}x - ${totalROAS.upper.toFixed(2)}x`,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Model Accuracy',
      value: `${((1 - modelMetrics.mape / 100) * 100).toFixed(1)}%`,
      range: `R² Score: ${modelMetrics.r2.toFixed(3)}`,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Forecast Error',
      value: `${modelMetrics.mape.toFixed(1)}%`,
      range: `RMSE: ${formatCurrency(modelMetrics.rmse)}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  95% CI: {metric.range}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
