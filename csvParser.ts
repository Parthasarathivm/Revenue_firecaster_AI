import { MarketingData, ValidationResult } from '@/types';

export function parseCSV(content: string): MarketingData[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const data: MarketingData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    // Map to standard format
    const mappedRow: MarketingData = {
      Date: row.Date || row.date || '',
      Channel: row.Channel || row.channel || 'Unknown',
      Campaign: row.Campaign || row.campaign || 'Unknown',
      CampaignType: row.CampaignType || row['Campaign Type'] || row.campaignType || 'Unknown',
      Clicks: parseFloat(row.Clicks || row.clicks || '0') || 0,
      Impressions: parseFloat(row.Impressions || row.impressions || '0') || 0,
      Spend: parseFloat(row.Spend || row.spend || row.cost || '0') || 0,
      Conversions: parseFloat(row.Conversions || row.conversions || '0') || 0,
      Revenue: parseFloat(row.Revenue || row.revenue || '0') || 0,
    };

    data.push(mappedRow);
  }

  return data;
}

export function validateData(data: MarketingData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingValues: { [key: string]: number } = {};

  if (data.length === 0) {
    errors.push('No data found in CSV file');
    return {
      isValid: false,
      errors,
      warnings,
      missingValues,
      duplicateCount: 0,
      rowCount: 0,
    };
  }

  // Check for missing values
  const fields: (keyof MarketingData)[] = ['Date', 'Channel', 'Campaign', 'CampaignType', 'Clicks', 'Impressions', 'Spend', 'Conversions', 'Revenue'];
  
  fields.forEach(field => {
    const missing = data.filter(row => !row[field] || row[field] === '' || row[field] === 0).length;
    if (missing > 0) {
      missingValues[field] = missing;
      if (field === 'Date' || field === 'Revenue' || field === 'Spend') {
        warnings.push(`${field} has ${missing} missing or zero values`);
      }
    }
  });

  // Check for duplicate dates
  const dates = data.map(row => `${row.Date}-${row.Channel}-${row.Campaign}`);
  const uniqueDates = new Set(dates);
  const duplicateCount = dates.length - uniqueDates.size;
  
  if (duplicateCount > 0) {
    warnings.push(`Found ${duplicateCount} duplicate records`);
  }

  // Check date format
  const invalidDates = data.filter(row => {
    if (!row.Date) return true;
    const date = new Date(row.Date);
    return isNaN(date.getTime());
  });

  if (invalidDates.length > 0) {
    errors.push(`Found ${invalidDates.length} rows with invalid date format`);
  }

  // Check for negative values
  const negativeSpend = data.filter(row => row.Spend < 0).length;
  const negativeRevenue = data.filter(row => row.Revenue < 0).length;

  if (negativeSpend > 0) {
    errors.push(`Found ${negativeSpend} rows with negative spend`);
  }
  if (negativeRevenue > 0) {
    errors.push(`Found ${negativeRevenue} rows with negative revenue`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingValues,
    duplicateCount,
    rowCount: data.length,
  };
}

export function cleanData(data: MarketingData[]): MarketingData[] {
  // Remove duplicates
  const seen = new Set<string>();
  const cleaned = data.filter(row => {
    const key = `${row.Date}-${row.Channel}-${row.Campaign}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fill missing values with 0
  return cleaned.map(row => ({
    ...row,
    Clicks: row.Clicks || 0,
    Impressions: row.Impressions || 0,
    Spend: row.Spend || 0,
    Conversions: row.Conversions || 0,
    Revenue: row.Revenue || 0,
  }));
}
