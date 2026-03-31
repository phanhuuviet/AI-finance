<script>
  import { onMount } from 'svelte';
  import { fetchWithAuth } from '../utils/api.js';
  // Note: For a real app, you'd install and import Chart.js here
  // import Chart from 'chart.js/auto';

  let analyticsData = null;
  let loading = true;
  let error = null;
  let days = 30;

  onMount(() => {
    fetchAnalytics();
  });

  async function fetchAnalytics() {
    loading = true;
    try {
      analyticsData = await fetchWithAuth(`/analytics/tokens?days=${days}`);
      // renderChart() would be called here
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
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

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="text-red-600 p-4 bg-red-50 rounded-md">Failed to load analytics: {error}</div>
  {:else if analyticsData}
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

    <div class="border border-gray-200 rounded-lg p-4 h-64 flex flex-col items-center justify-center bg-gray-50">
      <!-- Chart placeholder -->
      <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
      <p class="text-gray-500 font-medium">Chart.js Implementation</p>
      <p class="text-sm text-gray-400 text-center max-w-xs mt-1">
        In a full implementation, a Chart.js bar chart would display daily usage here using <code>analyticsData.daily_usage</code>.
      </p>
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
  {/if}
</div>
