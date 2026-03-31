function formatDateISO(date) {
  // YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function seededRandom(seed) {
  // Deterministic pseudo-random generator (LCG)
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => (state = (state * 48271) % 2147483647) / 2147483647;
}

/**
 * Returns mock data matching the API shape expected by TokenUsageChart.
 *
 * Shape:
 * {
 *   summary: { total_tokens_period: number, period_days: number },
 *   daily_usage: Array<{ date: string, model: string, total: number }>
 * }
 *
 * @param {number} [days]
 * @returns {import('../models/tokenAnalytics').TokenUsageAnalytics}
 */
export function getMockTokenUsageAnalytics(days = 30) {
  const safeDays = Math.max(1, Math.min(365, Number(days) || 30));

  const models = ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-3.5-turbo'];
  const rand = seededRandom(1000 + safeDays);

  const today = new Date();
  const daily_usage = [];
  let total_tokens_period = 0;

  for (let i = safeDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const model = models[Math.floor(rand() * models.length)];

    // Keep totals in a UI-friendly range with small day-to-day variation.
    const base = 6000 + Math.floor(rand() * 14000); // 6k–20k
    const spikes = rand() < 0.08 ? Math.floor(20000 + rand() * 60000) : 0;
    const total = base + spikes;

    total_tokens_period += total;
    daily_usage.push({
      date: formatDateISO(date),
      model,
      total
    });
  }

  return {
    summary: {
      total_tokens_period,
      period_days: safeDays
    },
    daily_usage
  };
}
