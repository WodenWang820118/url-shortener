# Load Testing and Monitoring Guide

This guide explains how to generate large-scale test data and monitor the URL Shortener system's performance, particularly for demonstrating Kubernetes scaling capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Data Generation](#data-generation)
3. [Load Testing](#load-testing)
4. [Monitoring Setup](#monitoring-setup)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Demonstrating K8s Scaling](#demonstrating-k8s-scaling)

## Prerequisites

Ensure you have the following running:

```bash
# Start infrastructure services
docker-compose up -d

# Start the services (in separate terminals)
pnpm run dev:producer
pnpm run dev:consumer
```

## Data Generation

### Option 1: Generate via Producer API (Realistic)

This simulates real-world URL shortening requests through the producer service:

```bash
# Generate 10,000 URLs (default)
npx tsx tools/data-generator.ts producer

# Custom volume: 100,000 URLs in batches of 1000
npx tsx tools/data-generator.ts producer 100000 1000

# Lower volume for testing: 1,000 URLs
npx tsx tools/data-generator.ts producer 1000 100
```

**Pros:**

- Tests the entire pipeline (Producer → Kafka → Consumer → Cassandra)
- Realistic load simulation
- Tests Kafka throughput

**Cons:**

- Slower (depends on Kafka processing)
- Limited by producer/consumer capacity

### Option 2: Generate Directly in Cassandra (Fast Bulk Loading)

For quickly populating large datasets:

```bash
# Generate 100,000 URLs directly in Cassandra
npx tsx tools/data-generator.ts cassandra 100000 1000

# Generate 1 million URLs (takes ~5-10 minutes)
npx tsx tools/data-generator.ts cassandra 1000000 10000
```

**Pros:**

- Very fast (10,000+ inserts/sec)
- Great for populating large read-heavy datasets
- Bypasses Kafka overhead

**Cons:**

- Doesn't test the full pipeline
- Only tests Cassandra write performance

**Recommended for K8s Demo:** Use Cassandra mode to quickly create 500K-1M records, then use producer mode during the demo.

## Load Testing

### Burst Load Test

Simulates users making a fixed number of requests then stopping:

```bash
# Default: 50 users, 100 requests each = 5,000 total requests
npx tsx tools/load-tester.ts burst

# High load: 200 users, 500 requests each = 100,000 total requests
npx tsx tools/load-tester.ts burst 200 500

# Quick test: 10 users, 50 requests each
npx tsx tools/load-tester.ts burst 10 50
```

**Output includes:**

- Total requests, success rate, error rate
- Average, min, max response times
- Percentile distributions (p50, p75, p90, p95, p99)
- Requests per second

### Continuous Load Test

Simulates sustained load for a specified duration:

```bash
# 100 concurrent users for 60 seconds
npx tsx tools/load-tester.ts continuous 100 60

# 200 concurrent users for 5 minutes (300 seconds)
npx tsx tools/load-tester.ts continuous 200 300

# Extreme load: 500 concurrent users for 2 minutes
npx tsx tools/load-tester.ts continuous 500 120
```

**Use Cases:**

- Testing sustained performance
- Triggering K8s autoscaling
- Identifying memory leaks or resource exhaustion
- Stress testing the system

## Monitoring Setup

### Local Development (Docker Compose)

1. **Start monitoring stack:**

```bash
docker-compose up -d prometheus grafana
```

2. **Access dashboards:**

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

3. **Verify metrics:**

```bash
# Check if consumer is exposing metrics
curl http://localhost:3002/metrics

# You should see output like:
# kafka_messages_processed_total{status="success"} 1234
# cassandra_queries_total{operation="insert",status="success"} 1234
```

### Grafana Dashboard Setup

1. Access Grafana at http://localhost:3000
2. Login with `admin` / `admin`
3. The "URL Shortener Performance Dashboard" should auto-provision
4. If not, manually import: `monitoring/grafana/dashboards/url-shortener-dashboard.json`

**Dashboard Panels:**

- Kafka message processing rate
- Cassandra query rate
- Processing latency (p50, p95)
- Error rates
- Total record count
- Throughput comparison

## Kubernetes Deployment

### Build and Deploy

1. **Build Docker image:**

```bash
# Build consumer image
docker build -t url-shortener-consumer:v1.0.0 -f apps/consumer/Dockerfile .
```

2. **Deploy to Kubernetes:**

```bash
# Apply all K8s manifests
kubectl apply -f k8s/

# Or apply individually:
kubectl apply -f k8s/consumer-deployment.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/grafana-deployment.yaml
```

3. **Verify deployment:**

```bash
# Check pods
kubectl get pods

# Check HPA status
kubectl get hpa

# Check services
kubectl get svc
```

4. **Access services:**

```bash
# Get node port for Grafana
kubectl get svc grafana

# Forward ports if needed
kubectl port-forward svc/grafana 3000:3000
kubectl port-forward svc/prometheus 9090:9090
```

## Demonstrating K8s Scaling

### Scenario 1: Gradual Load Increase

**Objective:** Show HPA scaling up gradually

```bash
# 1. Start with baseline (3 replicas)
kubectl get pods -w

# 2. Generate moderate load (50 users, 2 minutes)
npx tsx tools/load-tester.ts continuous 50 120

# 3. Increase to high load (150 users, 3 minutes)
npx tsx tools/load-tester.ts continuous 150 180

# 4. Observe scaling
kubectl get hpa -w
kubectl get pods -w

# 5. Monitor in Grafana
# Watch CPU/Memory usage, request rates, and pod count
```

### Scenario 2: Spike Load

**Objective:** Show rapid scaling under sudden traffic

```bash
# 1. Monitor initial state
kubectl get hpa

# 2. Generate sudden spike (500 users, 2 minutes)
npx tsx tools/load-tester.ts continuous 500 120

# 3. Watch HPA respond
kubectl describe hpa consumer-hpa

# Expected behavior:
# - Pods scale from 3 → 6-10 within 30-60 seconds
# - Latency increases initially, then stabilizes
# - Error rate should remain low
```

### Scenario 3: Read-Heavy Workload

**Objective:** Demonstrate scaling for database-intensive operations

```bash
# 1. Pre-populate 500K records
npx tsx tools/data-generator.ts cassandra 500000 10000

# 2. Run read-heavy load test
# Modify load-tester.ts to use more read endpoints or:
npx tsx tools/load-tester.ts continuous 200 300

# 3. Monitor Cassandra query metrics in Grafana
# - Watch "Cassandra Query Rate" panel
# - Check "Cassandra Query Latency"
# - Verify read throughput
```

### Key Metrics to Watch

**In Prometheus/Grafana:**

1. **Request Rate**: Should increase linearly with load
2. **P95 Latency**: Should remain stable (<100ms for reads)
3. **Error Rate**: Should stay near 0%
4. **Pod Count**: Should scale up/down based on load
5. **Cassandra Query Rate**: Should match request patterns

**In kubectl:**

```bash
# Watch HPA status
kubectl get hpa consumer-hpa -w

# Watch pod status
kubectl get pods -l app=consumer -w

# Check resource usage
kubectl top pods -l app=consumer

# View HPA events
kubectl describe hpa consumer-hpa
```

### Expected Scaling Behavior

| Load Level | Concurrent Users | Expected Pods | Avg Response Time |
| ---------- | ---------------- | ------------- | ----------------- |
| Low        | 1-50             | 3             | 10-30ms           |
| Medium     | 51-150           | 4-6           | 30-60ms           |
| High       | 151-300          | 7-9           | 60-100ms          |
| Very High  | 300+             | 10 (max)      | 100-200ms         |

### Troubleshooting

**Pods not scaling:**

```bash
# Check HPA conditions
kubectl describe hpa consumer-hpa

# Check metrics server
kubectl top nodes
kubectl top pods

# Ensure metrics-server is installed:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

**High error rates:**

```bash
# Check pod logs
kubectl logs -l app=consumer --tail=100

# Check Cassandra connectivity
kubectl exec -it <consumer-pod> -- curl cassandra:9042

# Scale manually if needed
kubectl scale deployment consumer --replicas=5
```

**Metrics not appearing:**

```bash
# Verify Prometheus is scraping
kubectl port-forward svc/prometheus 9090:9090
# Visit http://localhost:9090/targets

# Check consumer metrics endpoint
kubectl port-forward svc/consumer 3002:3002
curl http://localhost:3002/metrics
```

## Performance Benchmarks

Based on testing with this setup:

**Data Generation:**

- Producer API: ~100-200 URLs/sec
- Direct Cassandra: ~10,000-15,000 URLs/sec

**Load Testing:**

- 50 concurrent users: ~500-1000 req/sec
- 200 concurrent users: ~2000-3000 req/sec
- P95 latency (3 pods): ~50-80ms
- P95 latency (10 pods): ~30-50ms

**Kubernetes Scaling:**

- Scale-up time: 30-60 seconds
- Scale-down time: 60-90 seconds (due to stabilization)
- CPU threshold: 70%
- Memory threshold: 80%

## Tips for Demo

1. **Preparation:**
   - Pre-populate 500K-1M records using Cassandra mode
   - Ensure all services are healthy before demo
   - Have Grafana dashboard open and visible

2. **Execution:**
   - Start with baseline load showing stable 3 pods
   - Gradually increase load while narrating
   - Point out metrics: latency, throughput, pod count
   - Show HPA decisions in real-time

3. **Talking Points:**
   - "Notice how latency stays stable as we scale"
   - "HPA detected high CPU and added more pods"
   - "Read throughput increased from X to Y per second"
   - "Even under 500 concurrent users, error rate is <1%"

4. **Recovery:**
   - Stop load test, watch pods scale down
   - "Kubernetes efficiently removes unnecessary pods"
   - Show cost savings during low-traffic periods
