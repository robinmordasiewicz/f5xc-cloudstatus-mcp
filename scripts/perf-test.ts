#!/usr/bin/env tsx
// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Performance test script for browser pooling
 * Measures latency improvements with pooling enabled vs disabled
 */

import { WebScraper } from '../src/data-access/web-scraper.js';
import { config } from '../src/utils/config.js';

interface PerfResult {
  operation: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
}

/**
 * Measure performance of an async operation
 */
async function measurePerformance(
  operation: () => Promise<void>,
  iterations: number
): Promise<PerfResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await operation();
    const elapsed = Date.now() - start;
    times.push(elapsed);
  }

  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  // Calculate p95
  const sorted = times.slice().sort((a, b) => a - b);
  const p95Index = Math.floor(iterations * 0.95);
  const p95Time = sorted[p95Index] || sorted[sorted.length - 1];

  return {
    operation: '',
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    p95Time,
  };
}

/**
 * Test scrapeStatus performance
 */
async function testScrapeStatus(poolingEnabled: boolean, iterations: number = 10): Promise<PerfResult> {
  // Set pooling config
  config.scraper.pooling.enabled = poolingEnabled;

  const scraper = new WebScraper();

  try {
    const result = await measurePerformance(async () => {
      await scraper.scrapeStatus();
    }, iterations);

    result.operation = poolingEnabled ? 'scrapeStatus (pooled)' : 'scrapeStatus (non-pooled)';

    return result;
  } finally {
    await scraper.close();
  }
}

/**
 * Test scrapeAll performance
 */
async function testScrapeAll(poolingEnabled: boolean, iterations: number = 5): Promise<PerfResult> {
  // Set pooling config
  config.scraper.pooling.enabled = poolingEnabled;

  const scraper = new WebScraper();

  try {
    const result = await measurePerformance(async () => {
      await scraper.scrapeAll();
    }, iterations);

    result.operation = poolingEnabled ? 'scrapeAll (pooled)' : 'scrapeAll (non-pooled)';

    return result;
  } finally {
    await scraper.close();
  }
}

/**
 * Test parallel scrapes
 */
async function testParallelScrapes(poolingEnabled: boolean, parallelCount: number = 3): Promise<PerfResult> {
  // Set pooling config
  config.scraper.pooling.enabled = poolingEnabled;

  const scraper = new WebScraper();

  try {
    const start = Date.now();

    await Promise.all(
      Array.from({ length: parallelCount }, () => scraper.scrapeStatus())
    );

    const elapsed = Date.now() - start;

    return {
      operation: poolingEnabled
        ? `Parallel scrapes x${parallelCount} (pooled)`
        : `Parallel scrapes x${parallelCount} (non-pooled)`,
      iterations: 1,
      totalTime: elapsed,
      avgTime: elapsed,
      minTime: elapsed,
      maxTime: elapsed,
      p95Time: elapsed,
    };
  } finally {
    await scraper.close();
  }
}

/**
 * Format performance result
 */
function formatResult(result: PerfResult): string {
  return [
    `Operation: ${result.operation}`,
    `Iterations: ${result.iterations}`,
    `Total time: ${result.totalTime}ms`,
    `Avg time: ${result.avgTime.toFixed(2)}ms`,
    `Min time: ${result.minTime}ms`,
    `Max time: ${result.maxTime}ms`,
    `P95 time: ${result.p95Time}ms`,
  ].join('\n  ');
}

/**
 * Calculate improvement percentage
 */
function calculateImprovement(baseline: number, optimized: number): number {
  return ((baseline - optimized) / baseline) * 100;
}

/**
 * Main performance test
 */
async function main(): Promise<void> {
  console.log('🚀 Browser Pooling Performance Test\n');
  console.log('=' .repeat(60));

  // Test 1: Single scrapeStatus operations
  console.log('\n📊 Test 1: scrapeStatus Performance (10 iterations)');
  console.log('-'.repeat(60));

  const baselineStatus = await testScrapeStatus(false, 10);
  console.log(`\n✖️  Baseline (no pooling):\n  ${formatResult(baselineStatus)}`);

  const pooledStatus = await testScrapeStatus(true, 10);
  console.log(`\n✓  Pooled:\n  ${formatResult(pooledStatus)}`);

  const statusImprovement = calculateImprovement(baselineStatus.avgTime, pooledStatus.avgTime);
  console.log(`\n📈 Improvement: ${statusImprovement.toFixed(1)}%`);

  // Test 2: scrapeAll operations
  console.log('\n\n📊 Test 2: scrapeAll Performance (5 iterations)');
  console.log('-'.repeat(60));

  const baselineAll = await testScrapeAll(false, 5);
  console.log(`\n✖️  Baseline (no pooling):\n  ${formatResult(baselineAll)}`);

  const pooledAll = await testScrapeAll(true, 5);
  console.log(`\n✓  Pooled:\n  ${formatResult(pooledAll)}`);

  const allImprovement = calculateImprovement(baselineAll.avgTime, pooledAll.avgTime);
  console.log(`\n📈 Improvement: ${allImprovement.toFixed(1)}%`);

  // Test 3: Parallel scrapes
  console.log('\n\n📊 Test 3: Parallel Scrapes (3 concurrent)');
  console.log('-'.repeat(60));

  const baselineParallel = await testParallelScrapes(false, 3);
  console.log(`\n✖️  Baseline (no pooling):\n  ${formatResult(baselineParallel)}`);

  const pooledParallel = await testParallelScrapes(true, 3);
  console.log(`\n✓  Pooled:\n  ${formatResult(pooledParallel)}`);

  const parallelImprovement = calculateImprovement(baselineParallel.totalTime, pooledParallel.totalTime);
  console.log(`\n📈 Improvement: ${parallelImprovement.toFixed(1)}%`);

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📋 Performance Summary');
  console.log('='.repeat(60));

  console.log('\nLatency Improvements:');
  console.log(`  • scrapeStatus:    ${statusImprovement > 0 ? '+' : ''}${statusImprovement.toFixed(1)}%`);
  console.log(`  • scrapeAll:       ${allImprovement > 0 ? '+' : ''}${allImprovement.toFixed(1)}%`);
  console.log(`  • Parallel (x3):   ${parallelImprovement > 0 ? '+' : ''}${parallelImprovement.toFixed(1)}%`);

  const avgImprovement = (statusImprovement + allImprovement + parallelImprovement) / 3;
  console.log(`\n  Overall Average:   ${avgImprovement > 0 ? '+' : ''}${avgImprovement.toFixed(1)}%`);

  // Expected range check
  console.log('\nExpected Performance Target: 40-60% improvement');
  if (avgImprovement >= 40 && avgImprovement <= 70) {
    console.log('✅ PASSED: Performance within expected range');
  } else if (avgImprovement > 0) {
    console.log(`⚠️  WARNING: Performance improvement (${avgImprovement.toFixed(1)}%) outside expected range`);
  } else {
    console.log('❌ FAILED: Performance regression detected');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Performance test complete!\n');
}

// Run tests
main().catch((error) => {
  console.error('\n❌ Performance test failed:');
  console.error(error);
  process.exit(1);
});
