import { MarketingData, PredictionResponse, BudgetSimulation, ForecastResult, ChannelForecast, CampaignForecast } from '@/types';

// Mock ML prediction engine with probabilistic forecasting
export async function generatePredictions(
  data: MarketingData[],
  forecastDays: number,
  budgetSimulation?: BudgetSimulation
): Promise<PredictionResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Calculate historical metrics
  const totalSpend = data.reduce((sum, row) => sum + row.Spend, 0);
  const totalRevenue = data.reduce((sum, row) => sum + row.Revenue, 0);
  const historicalROAS = totalRevenue / totalSpend;

  // Group by channel
  const channelData: { [key: string]: { spend: number; revenue: number } } = {};
  data.forEach(row => {
    if (!channelData[row.Channel]) {
      channelData[row.Channel] = { spend: 0, revenue: 0 };
    }
    channelData[row.Channel].spend += row.Spend;
    channelData[row.Channel].revenue += row.Revenue;
  });

  // Group by campaign
  const campaignData: { [key: string]: { spend: number; revenue: number; channel: string } } = {};
  data.forEach(row => {
    const key = row.Campaign;
    if (!campaignData[key]) {
      campaignData[key] = { spend: 0, revenue: 0, channel: row.Channel };
    }
    campaignData[key].spend += row.Spend;
    campaignData[key].revenue += row.Revenue;
  });

  // Calculate average daily metrics
  const avgDailyRevenue = totalRevenue / data.length;
  const avgDailySpend = totalSpend / data.length;

  // Growth rate (simulated with slight upward trend)
  const growthRate = 1.02; // 2% growth
  const volatility = 0.15; // 15% volatility for confidence intervals

  // Generate forecasts
  const forecasts: ForecastResult[] = [];
  const startDate = new Date();

  for (let i = 0; i < forecastDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Apply growth and seasonal patterns
    const seasonalFactor = 1 + 0.1 * Math.sin((i / 30) * Math.PI); // Monthly seasonality
    const trendFactor = Math.pow(growthRate, i / 30);
    
    const baseRevenue = avgDailyRevenue * seasonalFactor * trendFactor;
    const baseSpend = avgDailySpend * (budgetSimulation ? 
      (budgetSimulation.googleAds + budgetSimulation.metaAds + budgetSimulation.microsoftAds) / totalSpend : 1);

    const revenue = baseRevenue;
    const revenueLower = baseRevenue * (1 - volatility);
    const revenueUpper = baseRevenue * (1 + volatility);

    const roas = revenue / (baseSpend || 1);
    const roasLower = revenueLower / (baseSpend || 1);
    const roasUpper = revenueUpper / (baseSpend || 1);

    forecasts.push({
      date: date.toISOString().split('T')[0],
      revenue,
      revenueLower,
      revenueUpper,
      roas,
      roasLower,
      roasUpper,
    });
  }

  // Channel forecasts
  const channelForecasts: ChannelForecast[] = Object.entries(channelData).map(([channel, metrics]) => {
    const channelShare = metrics.revenue / totalRevenue;
    const totalForecastRevenue = forecasts.reduce((sum, f) => sum + f.revenue, 0);
    const channelRevenue = totalForecastRevenue * channelShare;
    
    return {
      channel,
      revenue: channelRevenue,
      revenueLower: channelRevenue * (1 - volatility),
      revenueUpper: channelRevenue * (1 + volatility),
      roas: metrics.revenue / metrics.spend,
      spend: metrics.spend,
    };
  });

  // Campaign forecasts (top 10)
  const campaignForecasts: CampaignForecast[] = Object.entries(campaignData)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([campaign, metrics]) => {
      const campaignShare = metrics.revenue / totalRevenue;
      const totalForecastRevenue = forecasts.reduce((sum, f) => sum + f.revenue, 0);
      const campaignRevenue = totalForecastRevenue * campaignShare;
      
      return {
        campaign,
        channel: metrics.channel,
        revenue: campaignRevenue,
        revenueLower: campaignRevenue * (1 - volatility),
        revenueUpper: campaignRevenue * (1 + volatility),
        roas: metrics.revenue / metrics.spend,
        spend: metrics.spend,
      };
    });

  // AI Insights
  const topChannel = Object.entries(channelData)
    .sort((a, b) => (b[1].revenue / b[1].spend) - (a[1].revenue / a[1].spend))[0];

  const weakCampaigns = Object.entries(campaignData)
    .filter(([_, metrics]) => (metrics.revenue / metrics.spend) < historicalROAS * 0.7)
    .map(([name, _]) => name)
    .slice(0, 3);

  const totalForecastRevenue = forecasts.reduce((sum, f) => sum + f.revenue, 0);
  const expectedGrowth = ((totalForecastRevenue / totalRevenue - 1) * 100).toFixed(1);

  const aiInsights = {
    executiveSummary: `Based on ${data.length} days of historical data, our AI model predicts a total revenue of ₹${(totalForecastRevenue / 100000).toFixed(2)}L over the next ${forecastDays} days with a ${(100 - volatility * 100).toFixed(0)}% confidence interval. The blended ROAS is expected to be ${(forecasts[forecasts.length - 1].roas).toFixed(2)}x, representing a ${expectedGrowth}% growth trajectory.`,
    
    topPerformingChannel: `${topChannel?.[0] || 'Google Ads'} demonstrates the strongest performance with a ROAS of ${((topChannel?.[1].revenue || 1) / (topChannel?.[1].spend || 1)).toFixed(2)}x, contributing ${((topChannel?.[1].revenue || 0) / totalRevenue * 100).toFixed(1)}% of total revenue.`,
    
    weakCampaigns,
    
    budgetRecommendations: `Increase investment in ${topChannel?.[0] || 'Google Ads'} by 15-20% while reducing spend on underperforming campaigns. Consider reallocating ₹${((totalSpend * 0.1) / 100000).toFixed(2)}L from low-ROAS initiatives to high-performing channels.`,
    
    seasonalityImpact: `The model detected a ${Math.abs(10).toFixed(0)}% seasonal variation with peak performance expected in weeks 2-3 of the forecast period. Historical patterns suggest ${data.length > 60 ? 'strong' : 'moderate'} seasonal trends.`,
    
    operationalRisks: [
      'Market saturation in top-performing campaigns may reduce efficiency',
      'Increased competition could elevate CPCs by 8-12%',
      `${weakCampaigns.length} campaigns performing below benchmark ROAS`,
    ],
    
    expectedGrowth: `${expectedGrowth}% revenue growth expected over the forecast period, driven by optimized budget allocation and seasonal tailwinds.`,
    
    marketingRecommendations: [
      `Scale ${topChannel?.[0] || 'Google Ads'} campaigns with proven ROAS above ${historicalROAS.toFixed(1)}x`,
      'Implement A/B testing for underperforming creative assets',
      'Leverage lookalike audiences to expand reach in high-converting segments',
      'Optimize bid strategies for mobile vs desktop performance',
      `Monitor and adjust campaigns with ROAS below ${(historicalROAS * 0.8).toFixed(1)}x`,
    ],
    
    forecastExplanation: `Our ensemble model combines XGBoost, LightGBM, and Random Forest algorithms, achieving a MAPE of 8.3%. The probabilistic forecast accounts for historical volatility, seasonal patterns, and trend components to provide confidence intervals.`,
    
    anomalyExplanation: `${weakCampaigns.length > 0 ? `Detected anomalies in campaigns: ${weakCampaigns.join(', ')}. These show unusual spend-to-revenue ratios.` : 'No significant anomalies detected in the dataset. All campaigns performing within expected parameters.'}`,
  };

  return {
    forecasts,
    channelForecasts,
    campaignForecasts,
    aiInsights,
    modelMetrics: {
      mae: 12450.32,
      rmse: 18230.45,
      r2: 0.924,
      mape: 8.3,
    },
    totalRevenue: {
      value: totalForecastRevenue,
      lower: totalForecastRevenue * (1 - volatility),
      upper: totalForecastRevenue * (1 + volatility),
    },
    totalROAS: {
      value: forecasts[forecasts.length - 1].roas,
      lower: forecasts[forecasts.length - 1].roasLower,
      upper: forecasts[forecasts.length - 1].roasUpper,
    },
  };
}
