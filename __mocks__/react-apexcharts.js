/**
 * Mock for react-apexcharts
 *
 * Prevents heavy chart library rendering in tests which causes:
 * - Child process exceptions (memory exhaustion)
 * - Timeout issues
 * - Slow test execution
 *
 * LIMITATIONS:
 * - Does NOT simulate chart methods (updateOptions, updateSeries, etc.)
 * - Does NOT simulate chart events (onClick, onZoomed, etc.)
 * - Does NOT validate chart options or data structure
 * - Only provides basic DOM structure for testing component integration
 *
 * For testing chart behavior, use integration/E2E tests instead.
 *
 * @see https://apexcharts.com/docs/installation/
 */
'use strict';

const React = require('react');

const MockChart = React.forwardRef(({ _options, series, type, height }, ref) => {
  return React.createElement('div', {
    ref,
    'data-testid': 'apexchart',
    'data-chart-type': type,
    'data-chart-height': height,
    'data-series-count': Array.isArray(series) ? series.length : 0,
    className: 'apexcharts-mock'
  });
});

MockChart.displayName = 'MockApexCharts';

module.exports = MockChart;
