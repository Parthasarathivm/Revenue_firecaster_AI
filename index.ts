export interface MarketingData {
  Date: string;
  Channel: string;
  Campaign: string;
  CampaignType: string;
  Clicks: number;
  Impressions: number;
  Spend: number;
  Conversions: number;
  Revenue: number;
}

export interface ForecastResult {
  date: string;
  revenue: number;
  revenueLower: number;
  revenueUpper: number;
  roas: number;
  roasLower: number;
  roasUpper: number;
  channel?: string;
  campaign?: string;
}

export interface ChannelForecast {
  channel: string;
  revenue: number;
  revenueLower: number;
  revenueUpper: number;
  roas: number;
  spend: number;
}

export interface CampaignForecast {
  campaign: string;
  channel: string;
  revenue: number;
  revenueLower: number;
  revenueUpper: number;
  roas: number;
  spend: number;
}

export interface BudgetSimulation {
  googleAds: number;
  metaAds: number;
  microsoftAds: number;
}

export interface AIInsights {
  executiveSummary: string;
  topPerformingChannel: string;
  weakCampaigns: string[];
  budgetRecommendations: string;
  seasonalityImpact: string;
  operationalRisks: string[];
  expectedGrowth: string;
  marketingRecommendations: string[];
  forecastExplanation: string;
  anomalyExplanation: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingValues: { [key: string]: number };
  duplicateCount: number;
  rowCount: number;
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

export interface PredictionResponse {
  forecasts: ForecastResult[];
  channelForecasts: ChannelForecast[];
  campaignForecasts: CampaignForecast[];
  aiInsights: AIInsights;
  modelMetrics: ModelMetrics;
  totalRevenue: {
    value: number;
    lower: number;
    upper: number;
  };
  totalROAS: {
    value: number;
    lower: number;
    upper: number;
  };
}
