export interface TokenUsageSummary {
  total_tokens_period: number;
  period_days: number;
  [key: string]: unknown;
}

export interface TokenUsageDailyRow {
  date: string;
  model: string;
  total: number;
  [key: string]: unknown;
}

export interface TokenUsageAnalytics {
  summary: TokenUsageSummary;
  daily_usage: TokenUsageDailyRow[];
  [key: string]: unknown;
}
