import axios from 'axios';

interface LoadTestConfig {
  consumerUrl: string;
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTimeMs: number;
  testDurationMs?: number;
}

const defaultConfig: LoadTestConfig = {
  consumerUrl: 'http://localhost:3002',
  concurrentUsers: 50,
  requestsPerUser: 100,
  rampUpTimeMs: 5000,
};

interface TestResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDurationMs: number;
  averageResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  requestsPerSecond: number;
  responseTimes: number[];
}

/**
 * Perform a single request and measure response time
 */
async function performRequest(url: string): Promise<number> {
  const start = Date.now();
  try {
    await axios.get(url);
    return Date.now() - start;
  } catch (error) {
    // Re-throw to be handled by caller
    throw new Error(
      `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Simulate a single user making multiple requests
 */
async function simulateUser(
  userId: number,
  config: LoadTestConfig,
  results: TestResults,
) {
  const endpoints = [
    '/urls', // Get all URLs
    '/urls/count', // Get count
  ];

  for (let i = 0; i < config.requestsPerUser; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const url = `${config.consumerUrl}${endpoint}`;

    try {
      const responseTime = await performRequest(url);
      results.successfulRequests++;
      results.responseTimes.push(responseTime);

      if (responseTime < results.minResponseTimeMs) {
        results.minResponseTimeMs = responseTime;
      }
      if (responseTime > results.maxResponseTimeMs) {
        results.maxResponseTimeMs = responseTime;
      }
    } catch (error) {
      results.failedRequests++;
      // Log error details periodically
      if (results.failedRequests % 10 === 0) {
        console.error(`❌ Failed requests: ${results.failedRequests}`, error);
      }
    }

    results.totalRequests++;

    // Small random delay between requests (100-300ms)
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200),
    );
  }
}

/**
 * Run load test with gradual ramp-up
 */
async function runLoadTest(config: LoadTestConfig): Promise<TestResults> {
  console.log(`🚀 Starting Load Test...`);
  console.log(`👥 Concurrent Users: ${config.concurrentUsers}`);
  console.log(`📊 Requests per User: ${config.requestsPerUser}`);
  console.log(`⏱️  Ramp-up Time: ${config.rampUpTimeMs}ms`);
  console.log(
    `🎯 Total Expected Requests: ${config.concurrentUsers * config.requestsPerUser}`,
  );

  const results: TestResults = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDurationMs: 0,
    averageResponseTimeMs: 0,
    minResponseTimeMs: Number.POSITIVE_INFINITY,
    maxResponseTimeMs: 0,
    requestsPerSecond: 0,
    responseTimes: [],
  };

  const startTime = Date.now();
  const userPromises: Promise<void>[] = [];

  // Gradually ramp up users
  const delayBetweenUsers = config.rampUpTimeMs / config.concurrentUsers;

  for (let i = 0; i < config.concurrentUsers; i++) {
    userPromises.push(simulateUser(i, config, results));

    // Progress indicator
    if ((i + 1) % 10 === 0 || i === config.concurrentUsers - 1) {
      console.log(`👤 Spawned ${i + 1}/${config.concurrentUsers} users...`);
    }

    // Wait before spawning next user
    if (i < config.concurrentUsers - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenUsers));
    }
  }

  console.log(`⏳ All users spawned. Running test...`);

  // Progress monitoring
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const progress = (
      (results.totalRequests /
        (config.concurrentUsers * config.requestsPerUser)) *
      100
    ).toFixed(1);
    const currentRate = (
      results.totalRequests / Number.parseFloat(elapsed)
    ).toFixed(2);
    console.log(
      `📈 Progress: ${progress}% | Requests: ${results.totalRequests} | Rate: ${currentRate} req/s`,
    );
  }, 2000);

  // Wait for all users to complete
  await Promise.all(userPromises);

  clearInterval(progressInterval);

  const endTime = Date.now();
  results.totalDurationMs = endTime - startTime;

  // Calculate statistics
  if (results.responseTimes.length > 0) {
    results.averageResponseTimeMs =
      results.responseTimes.reduce((a, b) => a + b, 0) /
      results.responseTimes.length;
  }

  results.requestsPerSecond =
    results.totalRequests / (results.totalDurationMs / 1000);

  return results;
}

/**
 * Calculate percentiles
 */
function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
}

/**
 * Display test results
 */
function displayResults(results: TestResults) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 LOAD TEST RESULTS`);
  console.log(`${'='.repeat(60)}`);

  console.log(`\n📈 Request Statistics:`);
  console.log(`   Total Requests:      ${results.totalRequests}`);
  console.log(`   ✅ Successful:       ${results.successfulRequests}`);
  console.log(`   ❌ Failed:           ${results.failedRequests}`);
  console.log(
    `   Success Rate:        ${((results.successfulRequests / results.totalRequests) * 100).toFixed(2)}%`,
  );

  console.log(`\n⏱️  Performance Metrics:`);
  console.log(
    `   Total Duration:      ${(results.totalDurationMs / 1000).toFixed(2)}s`,
  );
  console.log(
    `   Requests/Second:     ${results.requestsPerSecond.toFixed(2)}`,
  );
  console.log(
    `   Avg Response Time:   ${results.averageResponseTimeMs.toFixed(2)}ms`,
  );
  console.log(
    `   Min Response Time:   ${results.minResponseTimeMs.toFixed(2)}ms`,
  );
  console.log(
    `   Max Response Time:   ${results.maxResponseTimeMs.toFixed(2)}ms`,
  );

  if (results.responseTimes.length > 0) {
    console.log(`\n📉 Response Time Percentiles:`);
    console.log(
      `   50th (Median):       ${calculatePercentile(results.responseTimes, 50).toFixed(2)}ms`,
    );
    console.log(
      `   75th:                ${calculatePercentile(results.responseTimes, 75).toFixed(2)}ms`,
    );
    console.log(
      `   90th:                ${calculatePercentile(results.responseTimes, 90).toFixed(2)}ms`,
    );
    console.log(
      `   95th:                ${calculatePercentile(results.responseTimes, 95).toFixed(2)}ms`,
    );
    console.log(
      `   99th:                ${calculatePercentile(results.responseTimes, 99).toFixed(2)}ms`,
    );
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

/**
 * Continuous load test (for sustained testing)
 */
async function runContinuousLoad(config: LoadTestConfig, durationMs: number) {
  console.log(`🔄 Starting Continuous Load Test...`);
  console.log(`⏱️  Duration: ${durationMs / 1000}s`);

  const startTime = Date.now();
  const results: TestResults = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDurationMs: 0,
    averageResponseTimeMs: 0,
    minResponseTimeMs: Number.POSITIVE_INFINITY,
    maxResponseTimeMs: 0,
    requestsPerSecond: 0,
    responseTimes: [],
  };

  const endpoints = ['/urls', '/urls/count'];

  const workers = new Array(config.concurrentUsers).fill(null).map(async () => {
    while (Date.now() - startTime < durationMs) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const url = `${config.consumerUrl}${endpoint}`;

      try {
        const responseTime = await performRequest(url);
        results.successfulRequests++;
        results.responseTimes.push(responseTime);

        if (responseTime < results.minResponseTimeMs) {
          results.minResponseTimeMs = responseTime;
        }
        if (responseTime > results.maxResponseTimeMs) {
          results.maxResponseTimeMs = responseTime;
        }
      } catch (error) {
        results.failedRequests++;
        // Suppress individual error logging in continuous mode to avoid spam
      }

      results.totalRequests++;
    }
  });

  // Progress monitoring
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const remaining = ((durationMs - (Date.now() - startTime)) / 1000).toFixed(
      2,
    );
    const currentRate = (
      results.totalRequests / Number.parseFloat(elapsed)
    ).toFixed(2);
    console.log(
      `📈 Time: ${elapsed}s | Remaining: ${remaining}s | Requests: ${results.totalRequests} | Rate: ${currentRate} req/s`,
    );
  }, 2000);

  await Promise.all(workers);
  clearInterval(progressInterval);

  results.totalDurationMs = Date.now() - startTime;

  if (results.responseTimes.length > 0) {
    results.averageResponseTimeMs =
      results.responseTimes.reduce((a, b) => a + b, 0) /
      results.responseTimes.length;
  }

  results.requestsPerSecond =
    results.totalRequests / (results.totalDurationMs / 1000);

  return results;
}

// CLI interface
const args = process.argv.slice(2);
const mode = args[0] || 'burst';
const concurrentUsers =
  Number.parseInt(args[1]) || defaultConfig.concurrentUsers;
const requestsPerUserOrDuration =
  Number.parseInt(args[2]) || defaultConfig.requestsPerUser;

const config: LoadTestConfig = {
  ...defaultConfig,
  concurrentUsers,
  requestsPerUser: requestsPerUserOrDuration,
};

async function main() {
  if (mode === 'burst') {
    console.log(`\n🎯 Running Burst Load Test...\n`);
    const results = await runLoadTest(config);
    displayResults(results);
  } else if (mode === 'continuous') {
    console.log(`\n🔄 Running Continuous Load Test...\n`);
    const durationMs = requestsPerUserOrDuration * 1000;
    const results = await runContinuousLoad(config, durationMs);
    displayResults(results);
  } else {
    console.log(`
Usage: tsx tools/load-tester.ts [mode] [concurrentUsers] [requestsPerUser|durationSeconds]

Modes:
  burst       - Burst test: each user makes N requests then stops (default)
  continuous  - Continuous test: N users for X seconds

Examples:
  tsx tools/load-tester.ts burst 50 100
    -> 50 users, each making 100 requests

  tsx tools/load-tester.ts continuous 100 60
    -> 100 concurrent users for 60 seconds

  tsx tools/load-tester.ts continuous 200 300
    -> 200 concurrent users for 5 minutes
    `);
  }
}

await main();
