# Quick Reference Cheat Sheet

## 🚀 Quick Start Commands

```bash
# 1. Setup
pnpm install
docker-compose up -d

# 2. Start services (separate terminals)
pnpm run dev:producer     # Terminal 1
pnpm run dev:consumer     # Terminal 2

# 3. Generate data
pnpm run data:generate:cassandra 100000 1000

# 4. Load test
pnpm run load:test:continuous 100 60

# 5. View monitoring
open http://localhost:3000  # Grafana (admin/admin)
```

## 📍 Service Ports

| Service       | Port | URL                   |
| ------------- | ---- | --------------------- |
| Frontend      | 4200 | http://localhost:4200 |
| Producer      | 3001 | http://localhost:3001 |
| Consumer      | 3002 | http://localhost:3002 |
| Kafka Manager | 3000 | http://localhost:3000 |
| Grafana       | 3000 | http://localhost:3000 |
| Prometheus    | 9090 | http://localhost:9090 |
| Kafka         | 9092 | localhost:9092        |
| Cassandra     | 9042 | localhost:9042        |
| HDFS NameNode | 9870 | http://localhost:9870 |

## 🎯 Common Tasks

### Data Generation

```bash
# Quick: 10K URLs in ~10 seconds
pnpm run data:generate:cassandra 10000 1000

# Medium: 100K URLs in ~30 seconds
pnpm run data:generate:cassandra 100000 2000

# Large: 500K URLs in ~2 minutes
pnpm run data:generate:cassandra 500000 5000

# Via Producer (realistic but slower)
pnpm run data:generate:producer 5000 100
```

### Load Testing

```bash
# Light: 50 users, 2 minutes
pnpm run load:test:continuous 50 120

# Medium: 100 users, 3 minutes
pnpm run load:test:continuous 100 180

# Heavy: 200 users, 5 minutes
pnpm run load:test:continuous 200 300

# Extreme: 500 users, 2 minutes
pnpm run load:test:continuous 500 120

# Burst test: 100 users × 200 requests
pnpm run load:test:burst 100 200
```

### Verification

```bash
# Check record count
curl http://localhost:3002/urls/count

# Check metrics
curl http://localhost:3002/metrics

# Test producer
curl -X POST http://localhost:3001/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com/test"}'

# Check Cassandra
docker exec -it cassandra cqlsh -e "SELECT COUNT(*) FROM examples.shortened_urls;"
```

## ☸️ Kubernetes Quick Commands

### Deploy

```bash
# Build image
docker build -t url-shortener-consumer:v1.0.0 -f apps/consumer/Dockerfile .

# For Minikube
minikube image load url-shortener-consumer:v1.0.0

# Deploy all
kubectl apply -f k8s/

# Watch deployment
kubectl get pods -w
```

### Monitor Scaling

```bash
# Watch HPA
kubectl get hpa consumer-hpa -w

# Watch pods
kubectl get pods -l app=consumer -w

# View resource usage
kubectl top pods -l app=consumer

# Describe HPA
kubectl describe hpa consumer-hpa

# View events
kubectl get events --sort-by='.lastTimestamp' | grep consumer
```

### Access Services

```bash
# Port forward
kubectl port-forward svc/grafana 3000:3000 &
kubectl port-forward svc/prometheus 9090:9090 &
kubectl port-forward svc/consumer 3002:3002 &

# Get NodePort URLs (Minikube)
minikube service grafana --url
minikube service prometheus --url

# Get all services
kubectl get svc
```

### Logs & Debug

```bash
# View pod logs
kubectl logs -l app=consumer --tail=100

# Follow logs
kubectl logs -l app=consumer -f

# Logs from specific pod
kubectl logs <pod-name>

# Describe pod
kubectl describe pod <pod-name>

# Exec into pod
kubectl exec -it <pod-name> -- /bin/sh
```

### Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Or delete by label
kubectl delete all -l app=consumer
kubectl delete all -l app=prometheus
kubectl delete all -l app=grafana
```

## 🐳 Docker Commands

### Service Management

```bash
# Start all
docker-compose up -d

# Start specific service
docker-compose up -d cassandra kafka

# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart service
docker-compose restart cassandra

# View logs
docker-compose logs -f cassandra
docker-compose logs --tail=100 kafka
```

### Status & Debug

```bash
# Check status
docker-compose ps

# View all logs
docker-compose logs

# Check specific service
docker-compose exec cassandra nodetool status

# Check Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# CQL shell
docker exec -it cassandra cqlsh
```

## 📊 Prometheus Queries

```promql
# Message processing rate
rate(kafka_messages_processed_total{status="success"}[1m])

# Cassandra query rate
rate(cassandra_queries_total[1m])

# P95 latency
histogram_quantile(0.95, rate(cassandra_query_duration_seconds_bucket[1m]))

# Error rate
rate(kafka_messages_processed_total{status="error"}[5m])

# Current record count
cassandra_record_count
```

## 🔧 Troubleshooting

### Cassandra not ready

```bash
# Wait for startup
docker-compose logs cassandra | grep "Startup complete"

# Check status
docker-compose exec cassandra nodetool status

# Restart
docker-compose restart cassandra
```

### Kafka connection issues

```bash
# Check Kafka is running
docker-compose logs kafka

# List topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Check consumer groups
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe --group example-consumer-group
```

### Metrics not showing

```bash
# Verify metrics endpoint
curl http://localhost:3002/metrics | head -20

# Check Prometheus targets
open http://localhost:9090/targets

# Restart Prometheus
docker-compose restart prometheus

# Check Grafana data source
open http://localhost:3000/datasources
```

### Load test failing

```bash
# Check consumer is responding
curl http://localhost:3002/urls/count

# Reduce load
pnpm run load:test:continuous 20 30

# Check consumer logs
# (in consumer terminal window)
```

## 📈 Expected Performance

| Scenario | Users | Pods | Req/Sec | P95 Latency |
| -------- | ----- | ---- | ------- | ----------- |
| Baseline | 50    | 3    | 500-1K  | 30-50ms     |
| Medium   | 100   | 4-5  | 1-2K    | 40-60ms     |
| High     | 200   | 7-8  | 2-3K    | 60-80ms     |
| Maximum  | 500   | 10   | 3-5K    | 100-150ms   |

## 📚 Documentation Links

- [QUICKSTART.md](./QUICKSTART.md) - Getting started (10 min)
- [K8S_DEMO.md](./K8S_DEMO.md) - Kubernetes demo script (20 min)
- [LOAD_TESTING.md](./LOAD_TESTING.md) - Load testing guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture diagrams
- [MONITORING_SUMMARY.md](./MONITORING_SUMMARY.md) - Monitoring overview

## 🎬 Demo Flow

1. **Setup** (5 min)
   - Start infrastructure: `docker-compose up -d`
   - Start services: producer + consumer
   - Generate 500K records

2. **Baseline** (2 min)
   - Show 3 pods in Grafana
   - Light load test (50 users)

3. **Scale Up** (4 min)
   - Medium load (100 users)
   - Heavy load (300 users)
   - Watch scale to 10 pods

4. **Scale Down** (3 min)
   - Stop load
   - Watch return to 3 pods

5. **Metrics** (2 min)
   - Show Grafana dashboards
   - Explain Prometheus queries
   - Show HPA configuration

## 💡 Pro Tips

- **Pre-generate data** before demos (500K records recommended)
- **Keep Grafana visible** during load tests
- **Use two terminals** for watching pods + HPA simultaneously
- **Start with light load** then gradually increase
- **Wait for stabilization** between load changes (60s)
- **Have backup commands** ready in case of issues

---

**Print this page for quick reference during demos! 📄**
