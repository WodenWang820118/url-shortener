# URL Shortener - Load Testing & Monitoring Summary

## 🎯 What Was Created

A complete load testing and monitoring infrastructure for demonstrating Kubernetes scaling capabilities with the URL Shortener application.

## 📦 Components Added

### 1. Data Generation Tools (`tools/data-generator.ts`)

**Purpose:** Generate large volumes of test data for realistic load scenarios

**Features:**

- **Producer Mode:** Generate URLs through the Producer API (realistic pipeline testing)
- **Cassandra Mode:** Bulk insert directly into Cassandra (fast data population)
- Configurable batch sizes and volumes
- Real-time progress monitoring
- Performance metrics (rate, duration, success/failure counts)

**Usage:**

```bash
# Generate 10K URLs via Producer
pnpm run data:generate:producer 10000 100

# Generate 1M URLs directly in Cassandra (fast)
pnpm run data:generate:cassandra 1000000 10000
```

### 2. Load Testing Tools (`tools/load-tester.ts`)

**Purpose:** Simulate high-volume read scenarios to trigger K8s autoscaling

**Features:**

- **Burst Mode:** Fixed number of requests per user
- **Continuous Mode:** Sustained load for specified duration
- Concurrent user simulation with gradual ramp-up
- Comprehensive metrics (latency percentiles, throughput, error rates)
- Real-time progress monitoring

**Usage:**

```bash
# Burst test: 200 users × 500 requests
pnpm run load:test:burst 200 500

# Continuous: 200 users for 5 minutes
pnpm run load:test:continuous 200 300
```

### 3. Prometheus Metrics (`apps/consumer/src/metrics/`)

**Components:**

- `metrics.service.ts` - Metrics collection service
- `metrics.module.ts` - NestJS module
- `metrics.controller.ts` - Metrics endpoint controller

**Metrics Exposed:**

**Counters:**

- `kafka_messages_processed_total` - Total Kafka messages processed
- `cassandra_queries_total` - Total Cassandra queries by operation
- `cassandra_query_errors_total` - Cassandra error count
- `hdfs_operations_total` - HDFS operation count

**Histograms:**

- `kafka_message_processing_duration_seconds` - Message processing latency
- `cassandra_query_duration_seconds` - Query execution time
- `hdfs_operation_duration_seconds` - HDFS operation time

**Gauges:**

- `cassandra_record_count` - Current record count in Cassandra

**Endpoint:** `http://localhost:3002/metrics`

### 4. Monitoring Stack

#### Docker Compose Integration (`docker-compose.yml`)

Added services:

- **Prometheus** (port 9090) - Metrics collection and storage
- **Grafana** (port 3000) - Visualization and dashboards

#### Configuration Files

**`monitoring/prometheus.yml`**

- Scrapes consumer metrics endpoint
- 15-second scrape interval
- Configured for both local and Docker networking

**`monitoring/grafana/datasources/datasource.yml`**

- Auto-configures Prometheus as data source

**`monitoring/grafana/dashboards/url-shortener-dashboard.json`**

- Pre-built comprehensive dashboard with:
  - Message processing rate
  - Query rates and latency (p50, p95)
  - Error rates
  - Record counts
  - Throughput comparisons

### 5. Kubernetes Manifests (`k8s/`)

#### Consumer Deployment (`consumer-deployment.yaml`)

- **Deployment:** 3-10 replicas with resource limits
- **Service:** ClusterIP for internal access
- **HPA (Horizontal Pod Autoscaler):**
  - Min: 3 replicas
  - Max: 10 replicas
  - Target CPU: 70%
  - Target Memory: 80%
  - Smart scale-up/down policies

#### Prometheus Deployment (`prometheus-deployment.yaml`)

- ConfigMap for dynamic configuration
- ServiceAccount with RBAC for pod discovery
- NodePort service (port 30090)
- Kubernetes pod auto-discovery

#### Grafana Deployment (`grafana-deployment.yaml`)

- Grafana server with persistent storage
- NodePort service (port 30300)
- Pre-configured admin credentials

### 6. Documentation

**`LOAD_TESTING.md`** - Comprehensive guide covering:

- Data generation strategies
- Load testing scenarios
- Monitoring setup (local & K8s)
- K8s deployment procedures
- Demo scenarios for showcasing scaling
- Troubleshooting tips
- Performance benchmarks

**`k8s/README.md`** - Kubernetes-specific documentation:

- Deployment commands
- Service access methods
- Scaling verification
- Troubleshooting K8s issues

**`tools/quick-start.sh`** - Interactive setup script:

- Service health checks
- Menu-driven data generation
- Load test launcher
- Full demo setup automation

## 🚀 Quick Start Guide

### Step 1: Start Infrastructure

```bash
# Start all infrastructure services
docker-compose up -d

# Start application services
pnpm run dev:producer  # Terminal 1
pnpm run dev:consumer  # Terminal 2
```

### Step 2: Generate Test Data

```bash
# Quick: 10K records via Producer
pnpm run data:generate:producer 10000 100

# Fast: 500K records direct to Cassandra
pnpm run data:generate:cassandra 500000 10000
```

### Step 3: Start Monitoring

```bash
# Start Prometheus & Grafana
pnpm run monitoring:up

# Access dashboards:
# - Grafana: http://localhost:3000 (admin/admin)
# - Prometheus: http://localhost:9090
# - Metrics: http://localhost:3002/metrics
```

### Step 4: Run Load Tests

```bash
# Burst test
pnpm run load:test:burst 100 200

# Continuous test (2 minutes)
pnpm run load:test:continuous 100 120
```

### Step 5: Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Watch scaling in action
kubectl get hpa consumer-hpa -w
kubectl get pods -w

# Run load test and observe autoscaling
pnpm run load:test:continuous 200 300
```

## 📊 Demonstration Scenarios

### Scenario 1: Baseline Performance

```bash
# 1. Generate 500K records
pnpm run data:generate:cassandra 500000 10000

# 2. Light load - observe stable 3 pods
pnpm run load:test:continuous 50 120

# 3. Monitor in Grafana:
#    - Steady request rate
#    - Low latency (<50ms p95)
#    - No errors
```

### Scenario 2: Scaling Under Load

```bash
# 1. Start with 3 pods
kubectl get pods

# 2. Increase load gradually
pnpm run load:test:continuous 100 120  # Medium load
# Wait 1 minute, observe scaling to 4-5 pods

pnpm run load:test:continuous 200 120  # High load
# Observe scaling to 7-8 pods

# 3. Monitor metrics:
#    - CPU utilization increases
#    - HPA triggers scale-up
#    - Latency remains stable
#    - Throughput increases proportionally
```

### Scenario 3: Spike Handling

```bash
# 1. Baseline: 3 pods
kubectl get hpa

# 2. Sudden spike
pnpm run load:test:continuous 500 120

# 3. Observe:
#    - Rapid scale-up (30-60 seconds)
#    - Temporary latency increase
#    - Quick stabilization at max replicas
#    - Error rate remains minimal
```

## 📈 Expected Metrics

### Data Generation Performance

| Mode      | Rate        | Use Case                   |
| --------- | ----------- | -------------------------- |
| Producer  | 100-200/sec | Realistic pipeline testing |
| Cassandra | 10,000+/sec | Bulk data population       |

### Load Testing Performance

| Users | Replicas | Request Rate | P95 Latency |
| ----- | -------- | ------------ | ----------- |
| 50    | 3        | 500-1K/sec   | 30-50ms     |
| 100   | 4-5      | 1-2K/sec     | 40-60ms     |
| 200   | 7-8      | 2-3K/sec     | 60-80ms     |
| 500   | 10       | 3-5K/sec     | 100-150ms   |

### Kubernetes Scaling

- **Scale-up time:** 30-60 seconds
- **Scale-down time:** 60-90 seconds
- **CPU threshold:** 70%
- **Memory threshold:** 80%

## 🔍 Monitoring Dashboards

### Grafana Panels

1. **Kafka Message Processing Rate**
   - Real-time message throughput
   - Success/error breakdown

2. **Cassandra Query Rate**
   - Queries per second by operation
   - Insert vs. read distribution

3. **Latency Metrics**
   - P50 and P95 latencies
   - Separate for Kafka and Cassandra

4. **Error Tracking**
   - Error rates over time
   - Error types and sources

5. **Resource Utilization**
   - Record counts
   - System health indicators

## 🛠️ NPM Scripts Added

```json
{
  "data:generate": "Quick access to data generator",
  "data:generate:producer": "Generate via Producer API",
  "data:generate:cassandra": "Generate directly in Cassandra",
  "load:test": "Quick access to load tester",
  "load:test:burst": "Run burst load test",
  "load:test:continuous": "Run continuous load test",
  "monitoring:up": "Start Prometheus & Grafana",
  "monitoring:down": "Stop monitoring stack",
  "monitoring:logs": "View monitoring logs"
}
```

## 🎓 Key Talking Points for Demo

1. **"Watch the throughput scale linearly with pod count"**
   - Show Grafana throughput graph
   - Point out the step increases as pods are added

2. **"Latency remains consistent despite increased load"**
   - Highlight p95 latency staying under 100ms
   - Explain how K8s distributes load evenly

3. **"HPA intelligently manages resources"**
   - Show kubectl HPA status
   - Explain CPU/memory thresholds
   - Discuss cost optimization during low traffic

4. **"Zero downtime during scaling"**
   - Point out no error spikes during scale events
   - Explain rolling updates and health checks

5. **"Production-ready observability"**
   - Show Prometheus metrics detail
   - Explain how metrics inform scaling decisions
   - Discuss alerting capabilities (future work)

## 🐛 Troubleshooting

### Services Not Running

```bash
# Check Docker services
docker-compose ps

# Check application logs
pnpm run dev:consumer  # Check for errors

# Verify Cassandra is ready
docker-compose logs cassandra | grep "Startup complete"
```

### Metrics Not Appearing

```bash
# Test metrics endpoint
curl http://localhost:3002/metrics

# Check Prometheus targets
# Visit http://localhost:9090/targets
```

### K8s Pods Not Scaling

```bash
# Verify metrics-server
kubectl top nodes

# Check HPA status
kubectl describe hpa consumer-hpa

# View HPA events
kubectl get events --sort-by='.lastTimestamp'
```

## 🔮 Future Enhancements

1. **Distributed Tracing** (Jaeger/Zipkin)
2. **Alerting** (Prometheus AlertManager)
3. **Custom Metrics** (Application-specific SLIs)
4. **Chaos Engineering** (Simulate failures)
5. **Multi-cluster Testing** (Geo-distributed)
6. **Cost Analysis** (Resource optimization)

## 📞 Support

For questions or issues:

1. Check `LOAD_TESTING.md` for detailed guides
2. Review `k8s/README.md` for K8s-specific help
3. Inspect logs: `pnpm run monitoring:logs`
4. Verify setup: Run `tools/quick-start.sh`

---

**Ready to demonstrate Kubernetes scaling with confidence! 🚀**
