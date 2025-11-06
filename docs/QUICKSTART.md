# Quick Start Guide

This guide will get you up and running with the URL Shortener system in under 10 minutes.

## Prerequisites

- **Node.js** 18+ and **pnpm** installed
- **Docker** and **Docker Compose** installed
- **kubectl** (for Kubernetes demo)
- **Minikube** or other K8s cluster (for Kubernetes demo)

## Step 1: Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd url-shortener

# Install dependencies
pnpm install
```

## Step 2: Start Infrastructure Services

```bash
# Start Kafka, Cassandra, HDFS, Prometheus, and Grafana
docker-compose up -d

# Verify services are running
docker-compose ps

# Wait for Cassandra to be ready (takes ~60 seconds)
docker-compose logs -f cassandra
# Look for: "Startup complete"
```

**Service Ports:**

- Kafka: `localhost:9092`
- Cassandra: `localhost:9042`
- HDFS NameNode: `localhost:9870`
- Prometheus: `localhost:9090`
- Grafana: `localhost:3000`

## Step 3: Start Application Services

Open **two separate terminals**:

### Terminal 1: Producer Service

```bash
pnpm run dev:producer
```

Should start on `http://localhost:3001`

### Terminal 2: Consumer Service

```bash
pnpm run dev:consumer
```

Should start on `http://localhost:3002`

**Verify services are running:**

```bash
# Test Producer
curl http://localhost:3001

# Test Consumer
curl http://localhost:3002

# Check metrics endpoint
curl http://localhost:3002/metrics
```

## Step 4: Generate Test Data

Choose one of these options:

### Option A: Quick Test (1,000 URLs)

```bash
# In a new terminal
pnpm run data:generate:producer 1000 100
```

- Takes ~10-20 seconds
- Tests full pipeline (Producer → Kafka → Consumer → Cassandra)

### Option B: Large Dataset (100,000 URLs)

```bash
pnpm run data:generate:cassandra 100000 1000
```

- Takes ~10-30 seconds
- Fast bulk loading directly to Cassandra
- Best for load testing preparation

### Option C: Demo Dataset (500,000 URLs)

```bash
pnpm run data:generate:cassandra 500000 5000
```

- Takes ~1-2 minutes
- Ideal for K8s scaling demonstrations

**Verify data was inserted:**

```bash
curl http://localhost:3002/urls/count
# Should show: {"count": <number>}
```

## Step 5: Access Monitoring Dashboards

### Grafana Dashboard

1. Open browser: `http://localhost:3000`
2. Login credentials:
   - Username: `admin`
   - Password: `admin`
3. Navigate to: **Dashboards** → **URL Shortener Performance Dashboard**

**Dashboard shows:**

- Kafka message processing rate
- Cassandra query rates and latency
- Error rates
- Record counts
- Throughput metrics

### Prometheus (Optional)

1. Open browser: `http://localhost:9090`
2. Try queries:

   ```promql
   # Message processing rate
   rate(kafka_messages_processed_total[1m])

   # Cassandra query latency (p95)
   histogram_quantile(0.95, rate(cassandra_query_duration_seconds_bucket[1m]))

   # Current record count
   cassandra_record_count
   ```

## Step 6: Run Load Tests

### Quick Burst Test

```bash
pnpm run load:test:burst 50 100
```

- 50 concurrent users
- 100 requests per user
- Takes ~30-60 seconds

**Expected output:**

```
📊 LOAD TEST RESULTS
Total Requests:      5000
✅ Successful:       4998
❌ Failed:           2
Success Rate:        99.96%
Requests/Second:     167.89
Avg Response Time:   29.45ms
```

### Sustained Load Test

```bash
pnpm run load:test:continuous 100 60
```

- 100 concurrent users
- 60 seconds duration
- Watch metrics update in Grafana in real-time

## Step 7: Frontend (Optional)

```bash
pnpm run dev:frontend
```

Access at `http://localhost:4200`

## Troubleshooting

### Services won't start

```bash
# Check if ports are in use
netstat -an | grep 3001
netstat -an | grep 3002

# Restart Docker services
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs -f kafka
docker-compose logs -f cassandra
```

### Consumer can't connect to Cassandra

```bash
# Wait for Cassandra to fully start
docker-compose logs cassandra | grep "Startup complete"

# If timeout issues, increase wait time in code or restart consumer
pnpm run dev:consumer
```

### No metrics in Grafana

```bash
# Verify metrics endpoint
curl http://localhost:3002/metrics

# Check Prometheus targets
# Visit: http://localhost:9090/targets
# Consumer should be "UP"

# Restart monitoring stack
docker-compose restart prometheus grafana
```

### Load test fails with connection errors

```bash
# Ensure consumer is running
curl http://localhost:3002/urls/count

# Reduce concurrent users
pnpm run load:test:continuous 20 30

# Check consumer logs for errors
# (in consumer terminal)
```

## Quick Commands Reference

```bash
# Start everything
docker-compose up -d && pnpm run dev:backend

# Generate 10K URLs fast
pnpm run data:generate:cassandra 10000 1000

# Quick load test
pnpm run load:test:burst 50 100

# Check system status
curl http://localhost:3002/urls/count
curl http://localhost:3002/metrics

# View logs
docker-compose logs -f prometheus
pnpm run monitoring:logs

# Stop everything
docker-compose down
# Ctrl+C in producer/consumer terminals
```

## NPM Scripts Available

| Command                            | Description                    |
| ---------------------------------- | ------------------------------ |
| `pnpm run dev:producer`            | Start producer service         |
| `pnpm run dev:consumer`            | Start consumer service         |
| `pnpm run dev:backend`             | Start both producer & consumer |
| `pnpm run dev:frontend`            | Start Angular frontend         |
| `pnpm run data:generate`           | Interactive data generator     |
| `pnpm run data:generate:producer`  | Generate via Producer API      |
| `pnpm run data:generate:cassandra` | Generate directly in Cassandra |
| `pnpm run load:test`               | Interactive load tester        |
| `pnpm run load:test:burst`         | Burst load test                |
| `pnpm run load:test:continuous`    | Continuous load test           |
| `pnpm run monitoring:up`           | Start Prometheus & Grafana     |
| `pnpm run monitoring:down`         | Stop monitoring stack          |
| `pnpm run monitoring:logs`         | View monitoring logs           |

## Next Steps

- **For Load Testing**: See [LOAD_TESTING.md](./LOAD_TESTING.md)
- **For Kubernetes Demo**: See [K8S_DEMO.md](./K8S_DEMO.md)
- **For Architecture Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **For Backend Integration**: See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

## Success Checklist

✅ Docker services running (`docker-compose ps` shows all "Up")  
✅ Producer responding on port 3001  
✅ Consumer responding on port 3002  
✅ Metrics endpoint accessible: `curl http://localhost:3002/metrics`  
✅ Grafana dashboard visible at `http://localhost:3000`  
✅ Data generation successful  
✅ Load test completes without errors

**You're ready to explore the system! 🚀**
