import axios from 'axios';
import { Client } from 'cassandra-driver';

interface GeneratorConfig {
  producerUrl: string;
  batchSize: number;
  totalRecords: number;
  delayMs: number;
}

const defaultConfig: GeneratorConfig = {
  producerUrl: 'http://localhost:3001',
  batchSize: 100,
  totalRecords: 10000,
  delayMs: 100,
};

/**
 * Generate random URLs for testing
 */
function generateRandomUrl(): string {
  const domains = [
    'example.com',
    'test.com',
    'demo.com',
    'sample.org',
    'website.net',
    'mybusiness.io',
    'startup.co',
    'tech.dev',
  ];
  const paths = [
    'products',
    'services',
    'about',
    'contact',
    'blog',
    'articles',
    'docs',
    'api',
  ];
  const params = [
    'id',
    'ref',
    'source',
    'campaign',
    'utm_source',
    'page',
    'category',
  ];

  const domain = domains[Math.floor(Math.random() * domains.length)];
  const path = paths[Math.floor(Math.random() * paths.length)];
  const param = params[Math.floor(Math.random() * params.length)];
  const value = Math.random().toString(36).substring(7);

  return `https://${domain}/${path}?${param}=${value}`;
}

/**
 * Generate URLs via producer API
 */
async function generateViaProducer(config: GeneratorConfig) {
  console.log(`🚀 Starting data generation via Producer API...`);
  console.log(`📊 Target: ${config.totalRecords} URLs`);
  console.log(`📦 Batch size: ${config.batchSize}`);

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < config.totalRecords; i++) {
    try {
      const url = generateRandomUrl();
      await axios.post(`${config.producerUrl}/api/shorten`, {
        longUrl: url,
      });
      successCount++;

      if ((i + 1) % config.batchSize === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const rate = (successCount / Number.parseFloat(elapsed)).toFixed(2);
        console.log(
          `✅ Progress: ${i + 1}/${config.totalRecords} | Rate: ${rate} URLs/sec`,
        );
        await new Promise((resolve) => setTimeout(resolve, config.delayMs));
      }
    } catch (error) {
      errorCount++;
      if (errorCount % 10 === 0) {
        console.error(`❌ Errors encountered: ${errorCount}`, error);
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const avgRate = (successCount / Number.parseFloat(totalTime)).toFixed(2);

  console.log(`\n📈 Generation Complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⏱️  Total time: ${totalTime}s`);
  console.log(`📊 Average rate: ${avgRate} URLs/sec`);
}

/**
 * Generate URLs directly in Cassandra (faster for bulk data)
 */
async function generateDirectToCassandra(config: GeneratorConfig) {
  console.log(`🚀 Starting direct Cassandra data generation...`);
  console.log(`📊 Target: ${config.totalRecords} URLs`);

  const client = new Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1',
  });

  try {
    await client.connect();
    console.log('✅ Connected to Cassandra');

    // Ensure keyspace and table exist
    await client.execute(
      "CREATE KEYSPACE IF NOT EXISTS examples WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3' }",
    );
    await client.execute(`
      CREATE TABLE IF NOT EXISTS examples.shortened_urls (
        url_id text PRIMARY KEY,
        original_url text,
        created_at timestamp
      )
    `);

    const startTime = Date.now();
    let successCount = 0;

    const insertQuery =
      'INSERT INTO examples.shortened_urls (url_id, original_url, created_at) VALUES (?, ?, ?)';

    for (let i = 0; i < config.totalRecords; i++) {
      const urlId = generateShortCode();
      const originalUrl = generateRandomUrl();
      const createdAt = new Date();

      try {
        await client.execute(insertQuery, [urlId, originalUrl, createdAt], {
          prepare: true,
        });
        successCount++;

        if ((i + 1) % config.batchSize === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
          const rate = (successCount / Number.parseFloat(elapsed)).toFixed(2);
          console.log(
            `✅ Progress: ${i + 1}/${config.totalRecords} | Rate: ${rate} URLs/sec`,
          );
        }
      } catch (error) {
        console.error(`❌ Error inserting record:`, error);
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgRate = (successCount / Number.parseFloat(totalTime)).toFixed(2);

    console.log(`\n📈 Generation Complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏱️  Total time: ${totalTime}s`);
    console.log(`📊 Average rate: ${avgRate} URLs/sec`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.shutdown();
  }
}

function generateShortCode(): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// CLI interface
const args = process.argv.slice(2);
const mode = args[0] || 'producer';
const totalRecords = Number.parseInt(args[1]) || defaultConfig.totalRecords;
const batchSize = Number.parseInt(args[2]) || defaultConfig.batchSize;

const config: GeneratorConfig = {
  ...defaultConfig,
  totalRecords,
  batchSize,
};

async function main() {
  if (mode === 'producer') {
    await generateViaProducer(config);
  } else if (mode === 'cassandra') {
    await generateDirectToCassandra(config);
  } else {
    console.log(`
Usage: tsx tools/data-generator.ts [mode] [totalRecords] [batchSize]

Modes:
  producer   - Generate URLs via Producer API (default)
  cassandra  - Generate URLs directly in Cassandra (faster for bulk)

Examples:
  tsx tools/data-generator.ts producer 10000 100
  tsx tools/data-generator.ts cassandra 100000 1000
  `);
  }
}

await main();
