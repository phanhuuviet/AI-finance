<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { dashboardStore } from '../../stores/dashboard.js';
  import Chart from 'chart.js/auto';
  import LoadingBlock from '../../lib/components/common/LoadingBlock.svelte';
  import ErrorFallback from '../../lib/components/common/ErrorFallback.svelte';

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
            label: 'Tokens',
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
                return `Tokens: ${Number(value).toLocaleString()}`;
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

<div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold text-gray-800">Token Usage Analytics</h2>
    <select 
      bind:value={days} 
      on:change={fetchAnalytics}
      class="border border-gray-300 rounded-md text-sm px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value={7}>Last 7 Days</option>
      <option value={30}>Last 30 Days</option>
      <option value={90}>Last 90 Days</option>
    </select>
  </div>

  {#if tokenUsageState.showLoading}
    <div class="space-y-6" aria-live="polite">
      <LoadingBlock rows={1} rowHeight="h-8" className="w-40" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <LoadingBlock rows={2} rowHeight="h-6" className="p-4 border border-gray-200 rounded-lg" />
        <LoadingBlock rows={2} rowHeight="h-6" className="p-4 border border-gray-200 rounded-lg" />
        <LoadingBlock rows={2} rowHeight="h-6" className="p-4 border border-gray-200 rounded-lg" />
      </div>
      <div class="border border-gray-200 rounded-lg p-4 h-64 bg-gray-50">
        <LoadingBlock rows={6} rowHeight="h-8" className="h-full" />
      </div>
    </div>
  {:else if tokenUsageState.error}
    <ErrorFallback
      message={`Failed to load analytics: ${tokenUsageState.error}`}
      retryLabel="Retry analytics"
      on:retry={fetchAnalytics}
    />
  {:else if analyticsData}
    <div transition:fade={{ duration: 180 }}>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 class="text-sm font-medium text-blue-800 mb-1">Total Tokens</h3>
          <p class="text-2xl font-bold text-blue-900">{analyticsData.summary.total_tokens_period.toLocaleString()}</p>
        </div>
        <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 class="text-sm font-medium text-indigo-800 mb-1">Period</h3>
          <p class="text-2xl font-bold text-indigo-900">{analyticsData.summary.period_days} Days</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 class="text-sm font-medium text-green-800 mb-1">Est. Cost</h3>
          <p class="text-2xl font-bold text-green-900">${((analyticsData.summary.total_tokens_period / 1000) * 0.002).toFixed(4)}</p>
          <p class="text-xs text-green-600 mt-1">Based on GPT-3.5 average pricing</p>
        </div>
      </div>

      <div class="border border-gray-200 rounded-lg p-4 h-64 bg-gray-50 text-blue-600">
        <canvas bind:this={canvasEl} class="w-full h-full"></canvas>
      </div>
      
      {#if analyticsData.daily_usage && analyticsData.daily_usage.length > 0}
        <div class="mt-6">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Daily Breakdown (Raw Data)</h3>
          <div class="max-h-40 overflow-y-auto border border-gray-200 rounded-md text-sm">
            <table class="w-full text-left">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-2 font-medium text-gray-600">Date</th>
                  <th class="px-4 py-2 font-medium text-gray-600">Model</th>
                  <th class="px-4 py-2 font-medium text-gray-600 text-right">Tokens</th>
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
