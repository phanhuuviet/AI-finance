<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { dashboardStore } from '../../stores/dashboard.js';
  import Chart from 'chart.js/auto';
  import LoadingBlock from '$lib/components/common/LoadingBlock.svelte';
  import ErrorFallback from '$lib/components/common/ErrorFallback.svelte';
  import { t } from '../../lib/i18n';

  /** @typedef {import('../../lib/models').TokenUsageAnalytics} TokenUsageAnalytics */
  /** @typedef {import('../../lib/models').TokenUsageDailyRow} TokenUsageDailyRow */

  /** @type {TokenUsageAnalytics | null} */
  let analyticsData = null;
  let days = 30;

  /** @type {HTMLCanvasElement | null} */
  let canvasEl = null;
  /** @type {import('chart.js').Chart | null} */
  let chart = null;

  function destroyChart() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  }

  /**
   * @param {string | null | undefined} rgbString
   * @param {number} alpha
   * @returns {string | null}
   */
  function rgbToRgba(rgbString, alpha) {
    const match = rgbString?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return null;
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * @param {TokenUsageDailyRow[]} [dailyUsage]
   */
  function buildDailySeries(dailyUsage = []) {
    const totalsByDate = new Map();
    for (const row of dailyUsage) {
      if (!row?.date) continue;
      const previous = totalsByDate.get(row.date) || 0;
      totalsByDate.set(row.date, previous + (Number(row.total) || 0));
    }
    return {
      labels: Array.from(totalsByDate.keys()),
      values: Array.from(totalsByDate.values())
    };
  }

  async function renderChart() {
    await tick();

    if (!canvasEl || !analyticsData?.daily_usage?.length) {
      destroyChart();
      return;
    }

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const { labels, values } = buildDailySeries(analyticsData.daily_usage);

    const baseColor = getComputedStyle(canvasEl.parentElement || canvasEl).color;
    const borderColor = baseColor || undefined;
    const backgroundColor = rgbToRgba(baseColor, 0.25) || borderColor;

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets[0].data = values;
      chart.update();
      return;
    }

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: $t('analytics.datasetLabel'),
            data: values,
            backgroundColor,
            borderColor,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context?.parsed?.y ?? 0;
                return $t('analytics.tooltipTokens', { value: Number(value).toLocaleString() });
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => Number(value).toLocaleString()
            }
          }
        }
      }
    });
  }

  onMount(() => {
    void fetchAnalytics();
  });

  onDestroy(() => {
    destroyChart();
  });

  $: tokenUsageState = $dashboardStore.tokenUsage;
  $: analyticsData = tokenUsageState.data;
  $: if (analyticsData?.daily_usage) {
    void renderChart();
  }

  async function fetchAnalytics() {
    // Ensure we don't keep a stale chart while the canvas may be unmounted.
    destroyChart();
    await dashboardStore.fetchTokenUsage(days);
  }

</script>

<div class="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 w-full max-w-5xl mx-auto">
  <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
    <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{$t('analytics.title')}</h2>
    <select 
      bind:value={days} 
      on:change={fetchAnalytics}
      class="border border-gray-300 rounded-md text-sm px-3 py-2 min-h-11 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value={7}>{$t('analytics.last7Days')}</option>
      <option value={30}>{$t('analytics.last30Days')}</option>
      <option value={90}>{$t('analytics.last90Days')}</option>
    </select>
  </div>

  {#if tokenUsageState.loading}
    <div class="space-y-6" aria-live="polite">
      <LoadingBlock rows={1} rowHeight="h-8" className="w-40" active={tokenUsageState.showLoading} />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <LoadingBlock rows={2} rowHeight="h-6" className="p-4 border border-gray-200 rounded-lg" active={tokenUsageState.showLoading} />
        <LoadingBlock rows={2} rowHeight="h-6" className="p-4 border border-gray-200 rounded-lg" active={tokenUsageState.showLoading} />
        <LoadingBlock rows={2} rowHeight="h-6" className="p-4 border border-gray-200 rounded-lg" active={tokenUsageState.showLoading} />
      </div>
      <div class="border border-gray-200 rounded-lg p-4 h-64 bg-gray-50">
        <LoadingBlock rows={6} rowHeight="h-8" className="h-full" active={tokenUsageState.showLoading} />
      </div>
    </div>
  {:else if tokenUsageState.error}
    <ErrorFallback
      message={$t('analytics.failedToLoad', { message: tokenUsageState.error })}
      retryLabel={$t('analytics.retry')}
      on:retry={fetchAnalytics}
    />
  {:else if analyticsData}
    <div transition:fade={{ duration: 180 }}>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 class="text-sm font-medium text-blue-800 mb-1">{$t('analytics.totalTokens')}</h3>
          <p class="text-2xl font-bold text-blue-900">{analyticsData.summary.total_tokens_period.toLocaleString()}</p>
        </div>
        <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 class="text-sm font-medium text-indigo-800 mb-1">{$t('analytics.period')}</h3>
          <p class="text-2xl font-bold text-indigo-900">{$t('analytics.days', { count: analyticsData.summary.period_days })}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 class="text-sm font-medium text-green-800 mb-1">{$t('analytics.estimatedCost')}</h3>
          <p class="text-2xl font-bold text-green-900">${((analyticsData.summary.total_tokens_period / 1000) * 0.002).toFixed(4)}</p>
          <p class="text-xs text-green-600 mt-1">{$t('analytics.pricingNote')}</p>
        </div>
      </div>

      <div class="border border-gray-200 rounded-lg p-3 sm:p-4 h-64 bg-gray-50 text-blue-600">
        <canvas bind:this={canvasEl} class="w-full h-full"></canvas>
      </div>
      
      {#if analyticsData.daily_usage && analyticsData.daily_usage.length > 0}
        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-700 mb-3">{$t('analytics.dailyBreakdown')}</h3>
          <div class="max-h-40 overflow-y-auto overflow-x-auto border border-gray-200 rounded-md text-sm">
            <table class="w-full min-w-[520px] text-left">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-2 font-medium text-gray-600">{$t('analytics.date')}</th>
                  <th class="px-4 py-2 font-medium text-gray-600">{$t('analytics.model')}</th>
                  <th class="px-4 py-2 font-medium text-gray-600 text-right">{$t('analytics.tokens')}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                {#each analyticsData.daily_usage as day}
                  <tr>
                    <td class="px-4 py-2 text-gray-800">{day.date}</td>
                    <td class="px-4 py-2 text-gray-600">{day.model}</td>
                    <td class="px-4 py-2 text-gray-800 text-right font-medium">{day.total.toLocaleString()}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
